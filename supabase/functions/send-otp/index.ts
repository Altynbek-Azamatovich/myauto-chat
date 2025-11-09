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

    // Rate limiting check - phone number (1 SMS per minute)
    const phoneRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', phone)
      .eq('request_type', 'send_otp')
      .gt('last_attempt_at', new Date(Date.now() - 60 * 1000).toISOString())
      .maybeSingle();

    if (phoneRateLimit.data) {
      console.log('Rate limit exceeded for phone:', phone);
      return new Response(
        JSON.stringify({ error: 'Слишком много попыток. Подождите минуту.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    // Rate limiting check - IP address (3 requests per 5 minutes)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const ipRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', clientIp)
      .eq('request_type', 'send_otp_ip')
      .gt('first_attempt_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .maybeSingle();

    if (ipRateLimit.data && ipRateLimit.data.attempt_count >= 3) {
      console.log('Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ error: 'Слишком много попыток. Подождите 5 минут.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

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
    const smscPassword = Deno.env.get('SMSC_PASSWORD'); // API key

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
      let errorMessage = `SMSC error: ${smsResult.error}`;
      
      // Provide specific guidance based on error code
      if (smsResult.error_code === 8) {
        errorMessage = 'Не удалось отправить SMS. Пожалуйста, проверьте баланс на SMSC.kz или обратитесь в поддержку.';
      }
      
      console.error('SMSC error details:', smsResult);
      throw new Error(errorMessage);
    }

    // Update rate limit records after successful SMS send
    await supabase.from('rate_limits').upsert({
      identifier: phone,
      request_type: 'send_otp',
      attempt_count: 1,
      first_attempt_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString()
    }, { onConflict: 'identifier,request_type' });

    if (ipRateLimit.data) {
      await supabase.from('rate_limits')
        .update({
          attempt_count: ipRateLimit.data.attempt_count + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', ipRateLimit.data.id);
    } else {
      await supabase.from('rate_limits').insert({
        identifier: clientIp,
        request_type: 'send_otp_ip',
        attempt_count: 1,
        first_attempt_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString()
      });
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