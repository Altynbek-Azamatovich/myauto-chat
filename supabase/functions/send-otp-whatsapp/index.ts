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

    // Get Meta WhatsApp Cloud API credentials
    const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!whatsappAccessToken || !whatsappPhoneNumberId) {
      console.log('Meta WhatsApp API not configured, returning mock response for testing');
      
      await logAuthEvent('OTP_WHATSAPP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: true,
        metadata: { language, mock: true, code }
      });

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

    // Format phone number for WhatsApp (remove + sign, keep only digits)
    let formattedPhone = phone.replace(/\D/g, '');
    
    // TEMPORARY: Meta development mode requires specific format for test number
    // Convert 77772373000 to 787772373000 (Meta's expected format)
    if (formattedPhone === '77772373000') {
      formattedPhone = '787772373000';
      console.log('Applying Meta test number format conversion: 77772373000 -> 787772373000');
    }
    
    // Meta WhatsApp Cloud API endpoint
    const whatsappUrl = `https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`;
    
    // Build request body - using text message for OTP
    // Note: For production, you'll need an approved authentication template
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: language === 'ru' 
          ? `Ваш код подтверждения myAuto: ${code}` 
          : `Сіздің myAuto растау кодыңыз: ${code}`
      }
    };

    console.log('Sending WhatsApp via Meta Cloud API to:', formattedPhone);

    const whatsappResponse = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const whatsappResult = await whatsappResponse.json();
    
    console.log('Meta WhatsApp response:', JSON.stringify(whatsappResult));

    await logExternalApiCall({
      apiName: 'meta_whatsapp',
      endpoint: 'messages',
      userAccountName: phone,
      clientIp,
      requestId,
      success: whatsappResponse.ok,
      responseCode: whatsappResponse.status,
      errorMessage: whatsappResult.error ? whatsappResult.error.message : undefined,
      metadata: { 
        messageId: whatsappResult.messages?.[0]?.id,
        contacts: whatsappResult.contacts
      }
    });

    // Check for errors in Meta response
    if (!whatsappResponse.ok || whatsappResult.error) {
      console.error('Meta WhatsApp error:', whatsappResult);
      
      await logAuthEvent('OTP_WHATSAPP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: 'WhatsApp sending failed via Meta Cloud API',
        metadata: { language, meta_error: whatsappResult.error }
      });
      
      return new Response(
        JSON.stringify({ 
          error: language === 'ru' 
            ? 'Не удалось отправить код через WhatsApp' 
            : 'WhatsApp арқылы код жіберу мүмкін болмады',
          shouldFallbackToSms: true,
          details: whatsappResult.error?.message
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
        messageId: whatsappResult.messages?.[0]?.id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp OTP sent successfully',
        channel: 'whatsapp',
        messageId: whatsappResult.messages?.[0]?.id
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
