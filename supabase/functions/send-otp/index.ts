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
    console.log('Sending OTP to phone:', phone, 'language:', language);

    if (!phone || phone.length < 10) {
      await logAuthEvent('OTP_SENT', {
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
      
      await writeAuditLog({
        sourceService: 'send-otp',
        category: 'SECURITY',
        eventType: 'RATE_LIMIT_EXCEEDED',
        description: `Превышен лимит запросов OTP для номера: ${phone}`,
        userAccountName: phone,
        clientIp,
        level: 'WARNING',
        requestId,
        metadata: { reason: 'phone_rate_limit' },
        success: false,
        errorMessage: 'Rate limit exceeded',
        httpMethod: 'POST',
        httpPath: '/send-otp',
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

    // Rate limiting check - IP address (3 requests per 5 minutes)
    const ipRateLimit = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', clientIp)
      .eq('request_type', 'send_otp_ip')
      .gt('first_attempt_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .maybeSingle();

    if (ipRateLimit.data && ipRateLimit.data.attempt_count >= 3) {
      console.log('Rate limit exceeded for IP:', clientIp);
      
      await writeAuditLog({
        sourceService: 'send-otp',
        category: 'SECURITY',
        eventType: 'RATE_LIMIT_EXCEEDED',
        description: `Превышен лимит запросов OTP для IP: ${clientIp}`,
        userAccountName: phone,
        clientIp,
        level: 'WARNING',
        requestId,
        metadata: { reason: 'ip_rate_limit', attempt_count: ipRateLimit.data.attempt_count },
        success: false,
        errorMessage: 'IP rate limit exceeded',
        httpMethod: 'POST',
        httpPath: '/send-otp',
        httpStatusCode: 429,
        userAgent,
        operationStartTime
      });
      
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
      
      await writeAuditLog({
        sourceService: 'send-otp',
        category: 'SYSTEM',
        eventType: 'DATABASE_ERROR',
        description: `Ошибка сохранения OTP кода для: ${phone}`,
        userAccountName: phone,
        clientIp,
        level: 'ERROR',
        requestId,
        success: false,
        errorMessage: dbError.message,
        httpMethod: 'POST',
        httpPath: '/send-otp',
        httpStatusCode: 500,
        userAgent,
        operationStartTime
      });
      
      return new Response(
        JSON.stringify({ error: 'Unable to process request. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get WhatsApp credentials
    const whatsappAccessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!whatsappAccessToken || !whatsappPhoneNumberId) {
      console.error('WhatsApp credentials not configured');
      throw new Error('WhatsApp credentials not configured');
    }

    // Format phone number for WhatsApp (remove + sign, keep only digits)
    let formattedPhone = phone.replace(/\D/g, '');
    
    // Kazakhstan number transformation: 7XXXXXXXXXX → 78XXXXXXXXXX
    if (formattedPhone.length === 11 && formattedPhone.startsWith('7')) {
      formattedPhone = '7' + '8' + formattedPhone.slice(1);
    }
    
    // Meta WhatsApp Cloud API endpoint
    const whatsappUrl = `https://graph.facebook.com/v22.0/${whatsappPhoneNumberId}/messages`;
    
    console.log('Sending WhatsApp message via Meta API to:', formattedPhone);
    
    const whatsappResponse = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'verification',
          language: { code: 'ru' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: code }
              ]
            }
          ]
        }
      }),
    });
    
    const whatsappResult = await whatsappResponse.json();
    console.log('WhatsApp API response:', JSON.stringify(whatsappResult));

    // Log external API call
    await logExternalApiCall({
      apiName: 'whatsapp_meta',
      endpoint: 'messages',
      userAccountName: phone,
      clientIp,
      requestId,
      success: !whatsappResult.error,
      responseCode: whatsappResponse.status,
      errorMessage: whatsappResult.error ? JSON.stringify(whatsappResult.error) : undefined,
      metadata: { 
        messageId: whatsappResult.messages?.[0]?.id,
        formattedPhone 
      }
    });

    // Check for WhatsApp API error
    if (whatsappResult.error) {
      console.error('WhatsApp API error:', whatsappResult.error);
      
      const errorMessage = language === 'ru' 
        ? 'Не удалось отправить код через WhatsApp. Попробуйте позже.' 
        : language === 'kk'
        ? 'WhatsApp арқылы код жіберу мүмкін болмады. Кейінірек қайталаңыз.'
        : 'Failed to send code via WhatsApp. Please try again later.';
      
      await logAuthEvent('OTP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: errorMessage,
        metadata: { language, whatsapp_error: whatsappResult.error }
      });
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update rate limit records after successful send
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

    // Log successful OTP send
    await logAuthEvent('OTP_SENT', {
      userAccountName: phone,
      clientIp,
      userAgent,
      requestId,
      success: true,
      metadata: { 
        language, 
        messageId: whatsappResult.messages?.[0]?.id,
        channel: 'whatsapp'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully via WhatsApp',
        messageId: whatsappResult.messages?.[0]?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in send-otp function:', error);
    
    await writeAuditLog({
      sourceService: 'send-otp',
      category: 'SYSTEM',
      eventType: 'UNHANDLED_ERROR',
      description: `Необработанная ошибка в send-otp`,
      clientIp,
      level: 'ERROR',
      requestId,
      success: false,
      errorMessage: error.message,
      httpMethod: 'POST',
      httpPath: '/send-otp',
      httpStatusCode: 500,
      userAgent,
      operationStartTime
    });
    
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
