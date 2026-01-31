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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Check if user exists by looking in profiles table first (more reliable than listUsers)
    let userId: string | null = null;
    let isNewUser = false;

    // First, check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', phone)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log('Found existing user via profile:', userId);
    } else {
      // Also try alternative phone formats
      const phoneWithoutPlus = phone.startsWith('+') ? phone.substring(1) : phone;
      const phoneWithPlus = phone.startsWith('+') ? phone : '+' + phone;
      
      const { data: altProfile } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone_number.eq.${phoneWithoutPlus},phone_number.eq.${phoneWithPlus}`)
        .maybeSingle();

      if (altProfile) {
        userId = altProfile.id;
        console.log('Found existing user via alt phone format:', userId);
      }
    }

    // If not found in profiles, try auth.users via admin API
    if (!userId) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      // Try multiple phone formats
      const phoneVariants = [
        phone,
        phone.startsWith('+') ? phone.substring(1) : '+' + phone
      ];
      
      const existingUser = existingUsers?.users?.find(u => 
        u.phone && phoneVariants.includes(u.phone)
      );
      
      if (existingUser) {
        userId = existingUser.id;
        console.log('Found existing user via auth.users:', userId);
      }
    }

    // If still not found, create new user
    if (!userId) {
      console.log('No existing user found, creating new user...');
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirm: true,
        user_metadata: {
          preferred_language: 'ru'
        }
      });

      if (createError) {
        // If phone_exists error, the user exists but we couldn't find them
        // This shouldn't happen now with the improved search, but handle it gracefully
        if (createError.message?.includes('already registered') || createError.code === 'phone_exists') {
          console.error('User exists but could not be found. This should not happen.');
          console.error('Attempted phone formats:', phone);
          
          return new Response(
            JSON.stringify({ 
              error: 'Внутренняя ошибка. Запросите SMS код повторно.',
              shouldResendCode: true 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.error('Failed to create user:', createError);
          return new Response(
            JSON.stringify({ 
              error: 'Внутренняя ошибка. Запросите SMS код повторно.',
              shouldResendCode: true 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        userId = newUser.user?.id || null;
        isNewUser = true;
        console.log('New user created:', userId);

        // Assign default 'user' role to new user
        if (userId) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: 'user'
            });

          if (roleError) {
            console.error('Failed to assign role:', roleError);
          }
        }
      }
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone,
    });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError);
      return new Response(
        JSON.stringify({ 
          error: 'Внутренняя ошибка. Запросите SMS код повторно.',
          shouldResendCode: true 
        }),
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
        session: sessionData,
        isNewUser: isNewUser
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
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
