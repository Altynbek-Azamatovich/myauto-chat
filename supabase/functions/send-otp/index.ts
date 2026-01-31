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

    // Generate 4-digit OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
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
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Mobizon API
    const mobizonApiKey = Deno.env.get('MOBIZON_API_KEY');

    if (!mobizonApiKey) {
      throw new Error('Mobizon API key not configured');
    }

    const message = `Ваш код подтверждения myAuto: ${code}`;
    
    // Format phone number - remove + if present for Mobizon
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    // Mobizon API endpoint
    const mobizonUrl = new URL('https://api.mobizon.kz/service/message/sendsmsmessage');
    mobizonUrl.searchParams.append('apiKey', mobizonApiKey);
    mobizonUrl.searchParams.append('recipient', formattedPhone);
    mobizonUrl.searchParams.append('text', message);
    mobizonUrl.searchParams.append('output', 'json');

    console.log('Sending SMS via Mobizon to:', formattedPhone);
    
    const smsResponse = await fetch(mobizonUrl.toString(), {
      method: 'POST',
    });
    
    const smsResult = await smsResponse.json();
    console.log('Mobizon response:', JSON.stringify(smsResult));

    // Mobizon returns code: 0 for success
    if (smsResult.code !== 0) {
      console.error('Mobizon error:', smsResult);
      return new Response(
        JSON.stringify({ error: 'Unable to send verification code. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        messageId: smsResult.data?.messageId
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
        error: 'Unable to send verification code. Please try again later.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
