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
    console.log('Sending WhatsApp OTP to phone:', phone, 'language:', language);

    if (!phone || phone.length < 10) {
      await logAuthEvent('OTP_WHATSAPP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: 'Invalid phone number',
        metadata: { language }
      });
      throw new Error('Invalid phone number');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limiting check - phone number (1 message per minute)
    const phoneRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', phone)
      .eq('request_type', 'send_otp_whatsapp')
      .gt('last_attempt_at', new Date(Date.now() - 60 * 1000).toISOString())
      .maybeSingle();

    if (phoneRateLimit.data) {
      console.log('Rate limit exceeded for WhatsApp:', phone);
      
      await writeAuditLog({
        sourceService: 'send-otp-whatsapp',
        category: 'SECURITY',
        eventType: 'RATE_LIMIT_EXCEEDED',
        description: `Превышен лимит WhatsApp OTP для номера: ${phone}`,
        userAccountName: phone,
        clientIp,
        level: 'WARNING',
        requestId,
        metadata: { reason: 'phone_rate_limit' },
        success: false,
        errorMessage: 'Rate limit exceeded',
        httpMethod: 'POST',
        httpPath: '/send-otp-whatsapp',
        httpStatusCode: 429,
        userAgent,
        operationStartTime
      });
      
      return new Response(
        JSON.stringify({ error: 'Слишком много попыток. Подождите минуту.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    // Generate 4-digit OTP code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated OTP code for WhatsApp:', code);

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
      
      await writeAuditLog({
        sourceService: 'send-otp-whatsapp',
        category: 'SYSTEM',
        eventType: 'DATABASE_ERROR',
        description: `Ошибка сохранения WhatsApp OTP кода для: ${phone}`,
        userAccountName: phone,
        clientIp,
        level: 'ERROR',
        requestId,
        success: false,
        errorMessage: dbError.message,
        httpMethod: 'POST',
        httpPath: '/send-otp-whatsapp',
        httpStatusCode: 500,
        userAgent,
        operationStartTime
      });
      
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get smsc.kz credentials
    const smscLogin = Deno.env.get('SMSC_LOGIN');
    const smscPassword = Deno.env.get('SMSC_PASSWORD');
    const smscWhatsappBot = Deno.env.get('SMSC_WHATSAPP_BOT');

    if (!smscLogin || !smscPassword || !smscWhatsappBot) {
      console.log('SMSC WhatsApp API not configured, returning mock response for testing');
      
      // For now, just log that we would send WhatsApp
      await logAuthEvent('OTP_WHATSAPP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: true,
        metadata: { language, mock: true, code } // Include code for testing
      });

      // Update rate limit records
      await supabase.from('rate_limits').upsert({
        identifier: phone,
        request_type: 'send_otp_whatsapp',
        attempt_count: 1,
        first_attempt_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString()
      }, { onConflict: 'identifier,request_type' });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'WhatsApp OTP sent successfully (mock)',
          channel: 'whatsapp'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Format phone number for smsc.kz (remove + sign)
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    // Create message based on language
    const message = language === 'ru' 
      ? `Ваш код подтверждения myAuto: ${code}` 
      : `Сіздің myAuto растау кодыңыз: ${code}`;

    // Build smsc.kz WhatsApp API URL
    // Format: https://smsc.kz/sys/send.php?login=alex&psw=123&phones=79999999999&mes=Hello&bot=wa:79888888888
    const smscUrl = new URL('https://smsc.kz/sys/send.php');
    smscUrl.searchParams.set('login', smscLogin);
    smscUrl.searchParams.set('psw', smscPassword);
    smscUrl.searchParams.set('phones', formattedPhone);
    smscUrl.searchParams.set('mes', message);
    smscUrl.searchParams.set('bot', smscWhatsappBot);
    smscUrl.searchParams.set('fmt', '3'); // JSON response format
    smscUrl.searchParams.set('charset', 'utf-8');

    console.log('Sending WhatsApp via smsc.kz to:', formattedPhone);

    const smscResponse = await fetch(smscUrl.toString());
    const smscResult = await smscResponse.json();
    
    console.log('SMSC WhatsApp response:', JSON.stringify(smscResult));

    await logExternalApiCall({
      apiName: 'smsc_whatsapp',
      endpoint: 'send.php',
      userAccountName: phone,
      clientIp,
      requestId,
      success: !smscResult.error,
      responseCode: smscResponse.status,
      errorMessage: smscResult.error ? `Error ${smscResult.error_code}: ${smscResult.error}` : undefined,
      metadata: { 
        messageId: smscResult.id,
        cnt: smscResult.cnt,
        cost: smscResult.cost
      }
    });

    // Check for errors in smsc response
    // smsc.kz returns error field if something went wrong
    if (smscResult.error) {
      console.error('SMSC WhatsApp error:', smscResult);
      
      await logAuthEvent('OTP_WHATSAPP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: 'WhatsApp sending failed via smsc.kz',
        metadata: { language, smsc_error: smscResult }
      });
      
      return new Response(
        JSON.stringify({ 
          error: language === 'ru' 
            ? 'Не удалось отправить код через WhatsApp' 
            : 'WhatsApp арқылы код жіберу мүмкін болмады',
          shouldFallbackToSms: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit records
    await supabase.from('rate_limits').upsert({
      identifier: phone,
      request_type: 'send_otp_whatsapp',
      attempt_count: 1,
      first_attempt_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString()
    }, { onConflict: 'identifier,request_type' });

    await logAuthEvent('OTP_WHATSAPP_SENT', {
      userAccountName: phone,
      clientIp,
      userAgent,
      requestId,
      success: true,
      metadata: { 
        language, 
        messageId: smscResult.id,
        cost: smscResult.cost
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp OTP sent successfully',
        channel: 'whatsapp',
        messageId: smscResult.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in send-otp-whatsapp function:', error);
    
    await writeAuditLog({
      sourceService: 'send-otp-whatsapp',
      category: 'SYSTEM',
      eventType: 'UNHANDLED_ERROR',
      description: `Необработанная ошибка в send-otp-whatsapp`,
      clientIp,
      level: 'ERROR',
      requestId,
      success: false,
      errorMessage: error.message,
      httpMethod: 'POST',
      httpPath: '/send-otp-whatsapp',
      httpStatusCode: 500,
      userAgent,
      operationStartTime
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Unable to send verification code via WhatsApp.',
        shouldFallbackToSms: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
