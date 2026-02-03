import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { writeAuditLog } from "../_shared/audit-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // smsc.kz sends POST with form data
    const formData = await req.formData();
    
    // Extract parameters
    const phone = formData.get('phone')?.toString();
    const status = formData.get('status')?.toString();
    const time = formData.get('time')?.toString();
    const ts = formData.get('ts')?.toString();
    const id = formData.get('id')?.toString();
    const mes = formData.get('mes')?.toString(); // For incoming SMS
    const to = formData.get('to')?.toString(); // For incoming SMS

    console.log('SMSC Webhook received:', { phone, status, time, ts, id, mes, to });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine if this is a status update or incoming SMS
    if (status) {
      // Delivery status callback
      // Status codes from smsc.kz:
      // 1 - Delivered
      // 2 - Failed
      // 3 - Sent
      // etc.
      
      const statusText = getStatusText(status);
      
      await writeAuditLog({
        sourceService: 'smsc-webhook',
        category: 'EXTERNAL_API',
        eventType: 'SMS_STATUS_UPDATE',
        description: `SMS статус обновлен: ${statusText} для ${phone}`,
        userAccountName: phone,
        level: status === '1' ? 'INFO' : status === '2' ? 'WARNING' : 'INFO',
        metadata: { 
          phone, 
          status, 
          statusText,
          messageId: id,
          deliveryTime: time,
          timestamp: ts
        },
        success: status === '1' || status === '3',
        httpMethod: 'POST',
        httpPath: '/smsc-webhook'
      });

      console.log(`SMS to ${phone}: ${statusText}`);
    } else if (mes && to) {
      // Incoming SMS
      await writeAuditLog({
        sourceService: 'smsc-webhook',
        category: 'EXTERNAL_API',
        eventType: 'SMS_RECEIVED',
        description: `Получено входящее SMS от ${phone}`,
        userAccountName: phone,
        level: 'INFO',
        metadata: { 
          from: phone, 
          to,
          message: mes,
          messageId: id
        },
        success: true,
        httpMethod: 'POST',
        httpPath: '/smsc-webhook'
      });

      console.log(`Incoming SMS from ${phone} to ${to}: ${mes}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in smsc-webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    '-3': 'Сообщение просрочено',
    '-2': 'Ошибка доставки',
    '-1': 'Не доставлено',
    '0': 'В очереди',
    '1': 'Доставлено',
    '2': 'Прочитано',
    '3': 'Отправлено',
    '4': 'Нажата кнопка',
    '20': 'Недостаточно средств',
    '22': 'Неверный номер',
    '23': 'Запрещено',
    '24': 'Запрещено оператором',
    '25': 'Ошибка подключения'
  };
  
  return statusMap[status] || `Неизвестный статус (${status})`;
}
