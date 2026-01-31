import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();
    console.log('Verifying OTP for phone:', phone);

    if (!phone || !code) {
      throw new Error('Phone and code are required');
    }

    // Validate code is 4 digits
    if (!/^\d{4}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code must be 4 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error('Missing required backend secrets', {
        hasUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
        hasAnonKey: !!anonKey,
      });
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const supabaseAnon = createClient(supabaseUrl, anonKey);

    // Rate limiting check - phone number (5 attempts max, then 15 min block)
    const phoneRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', phone)
      .eq('request_type', 'verify_otp')
      .maybeSingle();

    if (phoneRateLimit.data) {
      // Check if blocked
      if (phoneRateLimit.data.blocked_until && new Date(phoneRateLimit.data.blocked_until) > new Date()) {
        const minutesLeft = Math.ceil((new Date(phoneRateLimit.data.blocked_until).getTime() - Date.now()) / 60000);
        console.log('Phone blocked until:', phoneRateLimit.data.blocked_until);
        return new Response(
          JSON.stringify({ error: `Слишком много неудачных попыток. Подождите ${minutesLeft} минут.` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        );
      }

      // Check attempt count
      if (phoneRateLimit.data.attempt_count >= 5) {
        const blockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await supabase.from('rate_limits')
          .update({ blocked_until: blockedUntil })
          .eq('id', phoneRateLimit.data.id);
        
        console.log('Too many failed attempts, blocking phone:', phone);
        return new Response(
          JSON.stringify({ error: 'Слишком много неудачных попыток. Подождите 15 минут.' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429 
          }
        );
      }
    }

    // Find valid OTP code
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('Database error:', otpError);
      return new Response(
        JSON.stringify({ error: 'Unable to verify code. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpData) {
      console.log('Invalid or expired OTP code');
      
      // Track failed attempt
      if (phoneRateLimit.data) {
        await supabase.from('rate_limits')
          .update({
            attempt_count: phoneRateLimit.data.attempt_count + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', phoneRateLimit.data.id);
      } else {
        await supabase.from('rate_limits').insert({
          identifier: phone,
          request_type: 'verify_otp',
          attempt_count: 1,
          first_attempt_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString()
        });
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Неверный код' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // NOTE: We will mark OTP as verified ONLY after successful login completion
    // This prevents the issue where code gets marked as used but login fails

    // We cannot create a session from phone via admin.generateLink (it requires email).
    // So we attach a stable "service email" to the user derived from phone, then
    // generate a magiclink token and exchange it via verifyOtp to obtain session tokens.

    const phoneDigits = String(phone).replace(/[^\d]/g, '');
    const serviceEmail = `phone_${phoneDigits}@myauto.local`;

    // Check if user exists (via profiles — reliable)
    let userId: string | null = null;
    let isNewUser = false;

    const phoneWithPlus = phone.startsWith('+') ? phone : `+${phone}`;
    const phoneWithoutPlus = phone.startsWith('+') ? phone.substring(1) : phone;
    const phoneVariants = Array.from(new Set([phone, phoneWithPlus, phoneWithoutPlus]));

    const { data: existingProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .in('phone_number', phoneVariants)
      .maybeSingle();

    if (profileErr) {
      console.error('Failed to lookup profile:', profileErr);
      return new Response(
        JSON.stringify({ error: 'Внутренняя ошибка. Запросите SMS код повторно.', shouldResendCode: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingProfile?.id) {
      userId = existingProfile.id;
      console.log('Found existing user via profile:', userId);

      // Ensure the user has an email so we can generate magiclink
      const { error: updateUserErr } = await supabase.auth.admin.updateUserById(userId, {
        email: serviceEmail,
        email_confirm: true,
      });

      if (updateUserErr) {
        console.error('Failed to attach service email to user:', updateUserErr);
        return new Response(
          JSON.stringify({ error: 'Внутренняя ошибка. Запросите SMS код повторно.', shouldResendCode: true }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('No existing profile found, creating new auth user...');

      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: serviceEmail,
        email_confirm: true,
        user_metadata: {
          preferred_language: 'ru',
          phone: phone,
        },
      });

      if (createErr || !newUser?.user?.id) {
        console.error('Failed to create user:', createErr);
        return new Response(
          JSON.stringify({ error: 'Внутренняя ошибка. Запросите SMS код повторно.', shouldResendCode: true }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Assign default 'user' role to new user
      const { error: roleErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'user' });

      if (roleErr) {
        console.error('Failed to assign role:', roleErr);
      }
    }

    // Generate magiclink token for the service email
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: serviceEmail,
    });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      console.error('Failed to generate link:', linkErr, linkData);
      return new Response(
        JSON.stringify({ error: 'Внутренняя ошибка. Запросите SMS код повторно.', shouldResendCode: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange token for a real session
    const { data: verified, error: verifyErr } = await supabaseAnon.auth.verifyOtp({
      type: 'magiclink',
      token_hash: tokenHash,
    });

    if (verifyErr || !verified?.session) {
      console.error('Failed to verify magiclink token:', verifyErr);
      return new Response(
        JSON.stringify({ error: 'Внутренняя ошибка. Запросите SMS код повторно.', shouldResendCode: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SUCCESS! Now mark OTP as verified and clear rate limits
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Failed to update OTP:', updateError);
    }

    // Clear rate limit after successful verification
    await supabase.from('rate_limits')
      .delete()
      .eq('identifier', phone)
      .eq('request_type', 'verify_otp');

    return new Response(
      JSON.stringify({
        success: true,
        session: verified.session,
        isNewUser,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Unable to verify code. Please try again later.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
