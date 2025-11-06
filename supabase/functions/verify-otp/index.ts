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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      throw new Error('Failed to verify OTP');
    }

    if (!otpData) {
      console.log('Invalid or expired OTP code');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired OTP code' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpData.id);

    if (updateError) {
      console.error('Failed to update OTP:', updateError);
    }

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.phone === phone);

    if (!userExists) {
      // Create new user with phone
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: phone,
        phone_confirm: true,
        user_metadata: {
          preferred_language: 'ru'
        }
      });

      if (createError) {
        console.error('Failed to create user:', createError);
        throw new Error('Failed to create user account');
      }

      console.log('New user created:', newUser.user?.id);
    }

    // Generate session token
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      phone: phone,
    });

    if (sessionError || !sessionData) {
      console.error('Failed to generate session:', sessionError);
      throw new Error('Failed to create session');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        session: sessionData,
        isNewUser: !userExists
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
        error: error.message || 'Failed to verify OTP',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});