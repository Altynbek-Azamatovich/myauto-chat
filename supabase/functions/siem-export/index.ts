import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-siem-api-key',
};

/**
 * SIEM Export Endpoint - RFC 5424 Syslog Format
 * 
 * Этот endpoint предоставляет логи в формате syslog для интеграции с SIEM системами
 * согласно требованиям ШЭП/ВШЭП Казахстана
 * 
 * Endpoints:
 * GET /siem-export?format=syslog&start_date=...&end_date=...
 * GET /siem-export?format=json&start_date=...&end_date=...
 * GET /siem-export/statistics - статистика за период
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Проверяем аутентификацию - либо через Bearer token, либо через SIEM API key
    const authHeader = req.headers.get('Authorization');
    const siemApiKey = req.headers.get('x-siem-api-key');
    
    // Для SIEM систем можно настроить API key в secrets
    const configuredSiemKey = Deno.env.get('SIEM_API_KEY');
    
    let isAuthorized = false;
    let userId: string | null = null;

    if (siemApiKey && configuredSiemKey && siemApiKey === configuredSiemKey) {
      // SIEM система авторизована через API key
      isAuthorized = true;
    } else if (authHeader?.startsWith('Bearer ')) {
      // Проверяем JWT токен пользователя
      const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: claims, error } = await supabaseClient.auth.getClaims(token);
      
      if (!error && claims?.claims?.sub) {
        userId = claims.claims.sub;
        
        // Проверяем что пользователь - админ
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin'
        });
        
        isAuthorized = isAdmin === true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin role or valid SIEM API key required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Обрабатываем /siem-export/statistics
    if (pathParts.includes('statistics')) {
      const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const endDate = url.searchParams.get('end_date') || new Date().toISOString();
      
      const { data, error } = await supabase.rpc('get_audit_statistics', {
        p_start_date: startDate,
        p_end_date: endDate
      });
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify(data),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Основной экспорт логов
    const format = url.searchParams.get('format') || 'syslog';
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get('end_date') || new Date().toISOString();
    const limit = parseInt(url.searchParams.get('limit') || '10000');
    const level = url.searchParams.get('level') || null;
    const category = url.searchParams.get('category') || null;

    if (format === 'syslog') {
      // Возвращаем в формате syslog (RFC 5424)
      const { data, error } = await supabase.rpc('get_syslog_export', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit
      });
      
      if (error) {
        throw error;
      }
      
      // Объединяем все syslog сообщения в один текст, по одному на строку
      const syslogOutput = (data || [])
        .map((row: { syslog_message: string }) => row.syslog_message)
        .filter(Boolean)
        .join('\n');
      
      return new Response(
        syslogOutput,
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Syslog-Count': String((data || []).length)
          } 
        }
      );
    } else if (format === 'json') {
      // Возвращаем в JSON формате для удобства
      const { data, error } = await supabase.rpc('get_audit_logs_formatted', {
        p_limit: limit,
        p_offset: 0,
        p_start_date: startDate,
        p_end_date: endDate,
        p_level: level,
        p_category: category
      });
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({
          logs: data,
          count: (data || []).length,
          period: { start: startDate, end: endDate },
          exported_at: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (format === 'csv') {
      // CSV формат для Excel/таблиц
      const { data, error } = await supabase.rpc('get_audit_logs_formatted', {
        p_limit: limit,
        p_offset: 0,
        p_start_date: startDate,
        p_end_date: endDate,
        p_level: level,
        p_category: category
      });
      
      if (error) {
        throw error;
      }
      
      // Формируем CSV
      const headers = ['date', 'time', 'source', 'user_account', 'client_ip', 'start_time', 'end_time', 'level', 'category', 'event_type', 'description', 'success'];
      const csvRows = [headers.join(';')];
      
      for (const row of (data || [])) {
        const values = headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && (val.includes(';') || val.includes('"') || val.includes('\n'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val);
        });
        csvRows.push(values.join(';'));
      }
      
      return new Response(
        csvRows.join('\n'),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid format. Use: syslog, json, or csv' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SIEM export error:', error);
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
