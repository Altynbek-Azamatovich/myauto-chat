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
      // Логируем неудачную попытку
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
      
      // Логируем превышение лимита
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
      
      // Логируем превышение лимита по IP
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

    // Логируем запрос к внешнему API
    await logExternalApiCall({
      apiName: 'mobizon',
      endpoint: 'sendsmsmessage',
      userAccountName: phone,
      clientIp,
      requestId,
      success: smsResult.code === 0,
      responseCode: smsResult.code,
      errorMessage: smsResult.code !== 0 ? JSON.stringify(smsResult.data) : undefined,
      metadata: { messageId: smsResult.data?.messageId }
    });

    // Mobizon returns code: 0 for success
    if (smsResult.code !== 0) {
      console.error('Mobizon error:', smsResult);
      
      // Check if it's a carrier/direction not supported error
      const isCarrierNotSupported = smsResult.data?.recipient?.includes('отсутствует возможность отправки') ||
                                     smsResult.data?.recipient?.includes('данного направления');
      
      const errorMessage = isCarrierNotSupported
        ? (language === 'ru' 
            ? 'К сожалению, ваш оператор не поддерживается. Попробуйте другой номер телефона.' 
            : 'Өкінішке орай, сіздің оператор қолдау көрсетілмейді. Басқа телефон нөмірін қолданып көріңіз.')
        : (language === 'ru' 
            ? 'Не удалось отправить код. Попробуйте позже.' 
            : 'Кодты жіберу мүмкін болмады. Кейінірек қайталап көріңіз.');
      
      // Логируем неудачную отправку
      await logAuthEvent('OTP_SENT', {
        userAccountName: phone,
        clientIp,
        userAgent,
        requestId,
        success: false,
        errorMessage: errorMessage,
        metadata: { language, isCarrierNotSupported, mobizon_error: smsResult }
      });
      
      return new Response(
        JSON.stringify({ error: errorMessage, isCarrierNotSupported }),
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

    // Логируем успешную отправку OTP
    await logAuthEvent('OTP_SENT', {
      userAccountName: phone,
      clientIp,
      userAgent,
      requestId,
      success: true,
      metadata: { language, messageId: smsResult.data?.messageId }
    });

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
    
    // Логируем общую ошибку
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
