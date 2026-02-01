import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id, x-forwarded-for',
};

// Типы для аудит-логов согласно требованиям ШЭП/ВШЭП
type AuditLevel = 'DEBUG' | 'INFO' | 'NOTIFICATION' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT';
type AuditCategory = 'AUTH' | 'USER_ACTION' | 'DATA_ACCESS' | 'DATA_MODIFY' | 'SYSTEM' | 'EXTERNAL_API' | 'CONFIG_CHANGE' | 'SECURITY';

interface AuditLogEntry {
  source_service: string;
  category: AuditCategory;
  event_type: string;
  description: string;
  user_id?: string;
  user_account_name?: string;
  client_ip?: string;
  level?: AuditLevel;
  request_id?: string;
  metadata?: Record<string, unknown>;
  target_table?: string;
  target_record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  success?: boolean;
  error_message?: string;
  http_method?: string;
  http_path?: string;
  http_status_code?: number;
  user_agent?: string;
  operation_start_time?: string;
  operation_end_time?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const operationStartTime = new Date().toISOString();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Извлекаем информацию из заголовков
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

    const body: AuditLogEntry | AuditLogEntry[] = await req.json();
    
    // Поддерживаем как одиночную запись, так и batch
    const entries = Array.isArray(body) ? body : [body];

    const results = [];

    for (const entry of entries) {
      // Вызываем функцию write_audit_log
      const { data, error } = await supabase.rpc('write_audit_log', {
        p_source_service: entry.source_service,
        p_category: entry.category,
        p_event_type: entry.event_type,
        p_description: entry.description,
        p_user_id: entry.user_id || null,
        p_user_account_name: entry.user_account_name || null,
        p_client_ip: entry.client_ip || clientIp,
        p_level: entry.level || 'INFO',
        p_request_id: entry.request_id || requestId,
        p_metadata: entry.metadata || {},
        p_target_table: entry.target_table || null,
        p_target_record_id: entry.target_record_id || null,
        p_old_values: entry.old_values || null,
        p_new_values: entry.new_values || null,
        p_success: entry.success !== undefined ? entry.success : true,
        p_error_message: entry.error_message || null,
        p_http_method: entry.http_method || req.method,
        p_http_path: entry.http_path || '/audit-logger',
        p_http_status_code: entry.http_status_code || null,
        p_user_agent: entry.user_agent || userAgent,
        p_operation_start_time: entry.operation_start_time || operationStartTime,
        p_operation_end_time: entry.operation_end_time || new Date().toISOString()
      });

      if (error) {
        console.error('Error writing audit log:', error);
        results.push({ success: false, error: error.message });
      } else {
        results.push({ success: true, log_id: data });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        request_id: requestId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Audit logger error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
