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
    const { phone } = await req.json();
    console.log('Sending OTP to phone:', phone);

    if (!phone || phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP code:', code);

    // Save OTP to database (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phone,
        code: code,
        expires_at: expiresAt,
        verified: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save OTP code');
    }

    // Send SMS via SMSC.kz
    const smscLogin = Deno.env.get('SMSC_LOGIN');
    const smscPassword = Deno.env.get('SMSC_PASSWORD');

    if (!smscLogin || !smscPassword) {
      throw new Error('SMSC credentials not configured');
    }

    const message = `Ваш код подтверждения myAuto: ${code}`;
    const smscUrl = `https://smsc.kz/sys/send.php?login=${encodeURIComponent(smscLogin)}&psw=${encodeURIComponent(smscPassword)}&phones=${encodeURIComponent(phone)}&mes=${encodeURIComponent(message)}&charset=utf-8&fmt=3`;

    console.log('Sending SMS to SMSC.kz...');
    const smsResponse = await fetch(smscUrl);
    const smsResult = await smsResponse.json();
    console.log('SMSC response:', smsResult);

    if (smsResult.error) {
      throw new Error(`SMSC error: ${smsResult.error} - ${smsResult.error_code}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        smsId: smsResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send OTP',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});