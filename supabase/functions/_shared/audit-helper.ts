/**
 * Вспомогательные функции для аудит-логирования
 * Используется во всех edge functions для единообразного логирования
 * согласно требованиям ШЭП/ВШЭП
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export type AuditLevel = 'DEBUG' | 'INFO' | 'NOTIFICATION' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT';
export type AuditCategory = 'AUTH' | 'USER_ACTION' | 'DATA_ACCESS' | 'DATA_MODIFY' | 'SYSTEM' | 'EXTERNAL_API' | 'CONFIG_CHANGE' | 'SECURITY';

export interface AuditLogParams {
  sourceService: string;
  category: AuditCategory;
  eventType: string;
  description: string;
  userId?: string;
  userAccountName?: string;
  clientIp?: string;
  level?: AuditLevel;
  requestId?: string;
  metadata?: Record<string, unknown>;
  targetTable?: string;
  targetRecordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
  httpMethod?: string;
  httpPath?: string;
  httpStatusCode?: number;
  userAgent?: string;
  operationStartTime?: string;
  operationEndTime?: string;
}

/**
 * Записывает аудит-лог в базу данных
 */
export async function writeAuditLog(params: AuditLogParams): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.rpc('write_audit_log', {
      p_source_service: params.sourceService,
      p_category: params.category,
      p_event_type: params.eventType,
      p_description: params.description,
      p_user_id: params.userId || null,
      p_user_account_name: params.userAccountName || null,
      p_client_ip: params.clientIp || null,
      p_level: params.level || 'INFO',
      p_request_id: params.requestId || null,
      p_metadata: params.metadata || {},
      p_target_table: params.targetTable || null,
      p_target_record_id: params.targetRecordId || null,
      p_old_values: params.oldValues || null,
      p_new_values: params.newValues || null,
      p_success: params.success !== undefined ? params.success : true,
      p_error_message: params.errorMessage || null,
      p_http_method: params.httpMethod || null,
      p_http_path: params.httpPath || null,
      p_http_status_code: params.httpStatusCode || null,
      p_user_agent: params.userAgent || null,
      p_operation_start_time: params.operationStartTime || new Date().toISOString(),
      p_operation_end_time: params.operationEndTime || new Date().toISOString()
    });

    if (error) {
      console.error('Failed to write audit log:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Audit log error:', err);
    return null;
  }
}

/**
 * Извлекает информацию о клиенте из запроса
 */
export function extractRequestInfo(req: Request): {
  clientIp: string;
  userAgent: string;
  requestId: string;
} {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  return { clientIp, userAgent, requestId };
}

/**
 * Логирует события авторизации
 */
export async function logAuthEvent(
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'OTP_SENT' | 'OTP_VERIFIED' | 'OTP_FAILED' | 'SESSION_EXPIRED',
  params: {
    userId?: string;
    userAccountName?: string;
    clientIp?: string;
    userAgent?: string;
    requestId?: string;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const level: AuditLevel = params.success === false ? 'WARNING' : 'INFO';
  
  const descriptions: Record<string, string> = {
    'LOGIN_SUCCESS': `Успешный вход в систему: ${params.userAccountName || 'unknown'}`,
    'LOGIN_FAILED': `Неудачная попытка входа: ${params.userAccountName || 'unknown'}`,
    'LOGOUT': `Выход из системы: ${params.userAccountName || 'unknown'}`,
    'OTP_SENT': `OTP код отправлен на: ${params.userAccountName || 'unknown'}`,
    'OTP_VERIFIED': `OTP код подтверждён: ${params.userAccountName || 'unknown'}`,
    'OTP_FAILED': `Неверный OTP код: ${params.userAccountName || 'unknown'}`,
    'SESSION_EXPIRED': `Сессия истекла: ${params.userAccountName || 'unknown'}`
  };

  await writeAuditLog({
    sourceService: 'auth_service',
    category: 'AUTH',
    eventType,
    description: descriptions[eventType] || eventType,
    userId: params.userId,
    userAccountName: params.userAccountName,
    clientIp: params.clientIp,
    level,
    requestId: params.requestId,
    metadata: params.metadata,
    success: params.success !== undefined ? params.success : true,
    errorMessage: params.errorMessage
  });
}

/**
 * Логирует запросы к внешним API
 */
export async function logExternalApiCall(params: {
  apiName: string;
  endpoint: string;
  userId?: string;
  userAccountName?: string;
  clientIp?: string;
  requestId?: string;
  success: boolean;
  responseCode?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await writeAuditLog({
    sourceService: `external_api_${params.apiName}`,
    category: 'EXTERNAL_API',
    eventType: 'API_CALL',
    description: `Запрос к ${params.apiName}: ${params.endpoint}`,
    userId: params.userId,
    userAccountName: params.userAccountName,
    clientIp: params.clientIp,
    level: params.success ? 'INFO' : 'ERROR',
    requestId: params.requestId,
    metadata: { ...params.metadata, endpoint: params.endpoint, response_code: params.responseCode },
    success: params.success,
    errorMessage: params.errorMessage,
    httpStatusCode: params.responseCode
  });
}

/**
 * Логирует действия пользователя
 */
export async function logUserAction(params: {
  action: string;
  description: string;
  userId?: string;
  userAccountName?: string;
  clientIp?: string;
  requestId?: string;
  targetTable?: string;
  targetRecordId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await writeAuditLog({
    sourceService: 'user_action',
    category: 'USER_ACTION',
    eventType: params.action,
    description: params.description,
    userId: params.userId,
    userAccountName: params.userAccountName,
    clientIp: params.clientIp,
    level: 'INFO',
    requestId: params.requestId,
    targetTable: params.targetTable,
    targetRecordId: params.targetRecordId,
    metadata: params.metadata,
    success: true
  });
}
