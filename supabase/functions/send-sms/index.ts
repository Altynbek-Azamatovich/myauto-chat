import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { writeAuditLog, extractRequestInfo, logAuthEvent, logExternalApiCall } from "../_shared/audit-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id, x-forwarded-for',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const operationStartTime = new Date().toISOString();
  const { clientIp, userAgent, requestId } = extractRequestInfo(req);

  try {
    const { phone, language = 'ru' } = await req.json();
    console.log('Sending SMS OTP to phone:', phone, 'language:', language);

    if (!phone || phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting - 1 SMS per minute
    const phoneRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', phone)
      .eq('request_type', 'send_sms')
      .gt('last_attempt_at', new Date(Date.now() - 60 * 1000).toISOString())
      .maybeSingle();

    if (phoneRateLimit.data) {
      return new Response(
        JSON.stringify({ error: 'Слишком много попыток. Подождите минуту.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 4-digit OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated SMS OTP code:', code);

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

    // Send SMS via smsc.kz
    const smscLogin = Deno.env.get('SMSC_LOGIN');
    const smscPassword = Deno.env.get('SMSC_PASSWORD');

    if (!smscLogin || !smscPassword) {
      console.error('SMSC credentials not configured');
      throw new Error('SMS provider not configured');
    }

    const formattedPhone = phone.replace(/\D/g, '');
    const smsMessage = `Ваш код подтверждения - ${code}. Из соображений безопасности не сообщайте никому этот код.`;

    const smscUrl = `https://smsc.kz/sys/send.php?login=${encodeURIComponent(smscLogin)}&psw=${encodeURIComponent(smscPassword)}&phones=${formattedPhone}&mes=${encodeURIComponent(smsMessage)}&fmt=3&charset=utf-8`;

    console.log('Sending SMS via smsc.kz to:', formattedPhone);

    const smsResponse = await fetch(smscUrl);
    const smsResult = await smsResponse.json();
    console.log('SMSC response:', JSON.stringify(smsResult));

    await logExternalApiCall({
      apiName: 'smsc_kz',
      endpoint: 'send',
      userAccountName: phone,
      clientIp,
      requestId,
      success: !smsResult.error,
      responseCode: smsResponse.status,
      errorMessage: smsResult.error_code ? `Error code: ${smsResult.error_code}` : undefined,
      metadata: { smsId: smsResult.id, formattedPhone }
    });

    if (smsResult.error) {
      console.error('SMSC error:', smsResult);

      await logAuthEvent('OTP_SMS_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: `SMSC error: ${smsResult.error}`,
        metadata: { language, error_code: smsResult.error_code }
      });

      return new Response(
        JSON.stringify({ 
          error: language === 'ru' 
            ? 'Не удалось отправить SMS. Попробуйте позже.' 
            : language === 'kk'
            ? 'SMS жіберу мүмкін болмады. Кейінірек қайталаңыз.'
            : 'Failed to send SMS. Please try again later.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit
    await supabase.from('rate_limits').upsert({
      identifier: phone,
      request_type: 'send_sms',
      attempt_count: 1,
      first_attempt_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString()
    }, { onConflict: 'identifier,request_type' });

    await logAuthEvent('OTP_SMS_SENT', {
      userAccountName: phone,
      clientIp,
      userAgent,
      requestId,
      success: true,
      metadata: { language, smsId: smsResult.id, channel: 'sms' }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        channel: 'sms'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-sms function:', error);

    await writeAuditLog({
      sourceService: 'send-sms',
      category: 'SYSTEM',
      eventType: 'UNHANDLED_ERROR',
      description: `Необработанная ошибка в send-sms`,
      clientIp,
      level: 'ERROR',
      requestId,
      success: false,
      errorMessage: error.message,
      httpMethod: 'POST',
      httpPath: '/send-sms',
      httpStatusCode: 500,
      userAgent,
      operationStartTime
    });

    return new Response(
      JSON.stringify({ error: 'Unable to send SMS. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
