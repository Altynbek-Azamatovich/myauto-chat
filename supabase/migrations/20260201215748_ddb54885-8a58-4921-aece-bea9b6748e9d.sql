-- ============================================
-- СИСТЕМА АУДИТА ПО ТРЕБОВАНИЯМ ШЭП/ВШЭП
-- СТ РК ИСО/МЭК 27002-2015
-- ============================================

-- Enum для уровней событий (по требованиям)
CREATE TYPE public.audit_level AS ENUM (
  'DEBUG',        -- для отладки приложений
  'INFO',         -- Информационные сообщения
  'NOTIFICATION', -- Различные важные уведомления
  'WARNING',      -- Всевозможные предупреждения
  'ERROR',        -- Сообщения об ошибках
  'CRITICAL',     -- Критические события
  'ALERT'         -- Необходимо срочное вмешательство
);

-- Enum для категорий событий
CREATE TYPE public.audit_category AS ENUM (
  'AUTH',           -- Авторизация (вход/выход)
  'USER_ACTION',    -- Действия пользователя
  'DATA_ACCESS',    -- Доступ к данным
  'DATA_MODIFY',    -- Изменение данных
  'SYSTEM',         -- Системные события
  'EXTERNAL_API',   -- Запросы к внешним ИС
  'CONFIG_CHANGE',  -- Изменение конфигурации
  'SECURITY'        -- События безопасности
);

-- Основная таблица аудита
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Дата и время (формат: ДД:ММ:ГГГГ ЧЧ:ММ:СС)
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Наименование источника события (сервис/служба)
  source_service text NOT NULL,
  
  -- Имя учетной записи/ID пользователя
  user_id uuid,
  user_account_name text,
  
  -- IP-адрес клиента/пользователя
  client_ip inet,
  
  -- Время начала и окончания операции
  operation_start_time timestamptz NOT NULL DEFAULT now(),
  operation_end_time timestamptz,
  
  -- Уровень события
  level audit_level NOT NULL DEFAULT 'INFO',
  
  -- Категория события
  category audit_category NOT NULL,
  
  -- Тип события
  event_type text NOT NULL,
  
  -- Описание события
  description text NOT NULL,
  
  -- Уникальный идентификатор транзакции/запроса
  request_id text,
  
  -- Дополнительные данные (JSON)
  metadata jsonb DEFAULT '{}',
  
  -- Для отслеживания изменений данных
  target_table text,
  target_record_id text,
  old_values jsonb,
  new_values jsonb,
  
  -- Результат операции
  success boolean NOT NULL DEFAULT true,
  error_message text,
  
  -- HTTP метод и путь для API запросов
  http_method text,
  http_path text,
  http_status_code integer,
  
  -- User-Agent для дополнительной информации
  user_agent text
);

-- Индексы для быстрого поиска
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_level ON public.audit_logs(level);
CREATE INDEX idx_audit_logs_category ON public.audit_logs(category);
CREATE INDEX idx_audit_logs_source_service ON public.audit_logs(source_service);
CREATE INDEX idx_audit_logs_request_id ON public.audit_logs(request_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);

-- Включаем RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS: только админы могут читать логи
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: только через service role можно записывать (edge functions)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Запрет на UPDATE и DELETE для обеспечения целостности
-- (логи не должны изменяться или удаляться пользователями)

-- ============================================
-- Функция для записи аудит-лога
-- ============================================
CREATE OR REPLACE FUNCTION public.write_audit_log(
  p_source_service text,
  p_category audit_category,
  p_event_type text,
  p_description text,
  p_user_id uuid DEFAULT NULL,
  p_user_account_name text DEFAULT NULL,
  p_client_ip inet DEFAULT NULL,
  p_level audit_level DEFAULT 'INFO',
  p_request_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_target_table text DEFAULT NULL,
  p_target_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL,
  p_http_method text DEFAULT NULL,
  p_http_path text DEFAULT NULL,
  p_http_status_code integer DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_operation_start_time timestamptz DEFAULT now(),
  p_operation_end_time timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    source_service,
    category,
    event_type,
    description,
    user_id,
    user_account_name,
    client_ip,
    level,
    request_id,
    metadata,
    target_table,
    target_record_id,
    old_values,
    new_values,
    success,
    error_message,
    http_method,
    http_path,
    http_status_code,
    user_agent,
    operation_start_time,
    operation_end_time
  ) VALUES (
    p_source_service,
    p_category,
    p_event_type,
    p_description,
    p_user_id,
    p_user_account_name,
    p_client_ip,
    p_level,
    p_request_id,
    p_metadata,
    p_target_table,
    p_target_record_id,
    p_old_values,
    p_new_values,
    p_success,
    p_error_message,
    p_http_method,
    p_http_path,
    p_http_status_code,
    p_user_agent,
    p_operation_start_time,
    COALESCE(p_operation_end_time, now())
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================
-- Функция для форматирования в syslog (RFC 5424)
-- ============================================
CREATE OR REPLACE FUNCTION public.format_syslog_message(
  p_log_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log RECORD;
  v_priority integer;
  v_severity integer;
  v_facility integer := 16; -- local0
  v_timestamp text;
  v_hostname text := 'myauto-app';
  v_app_name text;
  v_procid text;
  v_msgid text;
  v_structured_data text;
  v_message text;
BEGIN
  SELECT * INTO v_log FROM public.audit_logs WHERE id = p_log_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Маппинг уровней на syslog severity
  CASE v_log.level
    WHEN 'ALERT' THEN v_severity := 1;
    WHEN 'CRITICAL' THEN v_severity := 2;
    WHEN 'ERROR' THEN v_severity := 3;
    WHEN 'WARNING' THEN v_severity := 4;
    WHEN 'NOTIFICATION' THEN v_severity := 5;
    WHEN 'INFO' THEN v_severity := 6;
    WHEN 'DEBUG' THEN v_severity := 7;
    ELSE v_severity := 6;
  END CASE;
  
  -- Вычисляем priority
  v_priority := (v_facility * 8) + v_severity;
  
  -- Форматируем timestamp по RFC 5424
  v_timestamp := to_char(v_log.created_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD"T"HH24:MI:SS.MS+06:00');
  
  -- Составляем structured data
  v_structured_data := format(
    '[myauto@12345 userId="%s" userAccount="%s" clientIp="%s" category="%s" eventType="%s" requestId="%s" success="%s"]',
    COALESCE(v_log.user_id::text, '-'),
    COALESCE(v_log.user_account_name, '-'),
    COALESCE(v_log.client_ip::text, '-'),
    v_log.category,
    v_log.event_type,
    COALESCE(v_log.request_id, '-'),
    v_log.success::text
  );
  
  -- Формируем сообщение
  v_message := format(
    '<%s>1 %s %s %s %s %s %s %s',
    v_priority,
    v_timestamp,
    v_hostname,
    COALESCE(v_log.source_service, '-'),
    COALESCE(v_log.request_id, '-'),
    v_log.event_type,
    v_structured_data,
    v_log.description
  );
  
  RETURN v_message;
END;
$$;

-- ============================================
-- View для экспорта логов в формате ШЭП
-- ============================================
CREATE OR REPLACE VIEW public.audit_logs_formatted AS
SELECT
  id,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'DD:MM:YYYY') as "date",
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "time",
  source_service as "source",
  COALESCE(user_account_name, user_id::text, 'anonymous') as "user_account",
  COALESCE(client_ip::text, '-') as "client_ip",
  to_char(operation_start_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "start_time",
  to_char(COALESCE(operation_end_time, created_at) AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as "end_time",
  level::text as "level",
  category::text as "category",
  event_type,
  description,
  request_id,
  success,
  error_message
FROM public.audit_logs
ORDER BY created_at DESC;

-- ============================================
-- Таблица для хранения настроек SIEM
-- ============================================
CREATE TABLE public.siem_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  endpoint_url text NOT NULL,
  protocol text NOT NULL DEFAULT 'https', -- https, syslog
  port integer DEFAULT 514,
  api_key text,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.siem_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage SIEM config"
ON public.siem_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Триггеры для автоматического аудита
-- ============================================

-- Триггер для таблицы profiles
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log(
      'profiles_trigger',
      'DATA_MODIFY',
      'PROFILE_CREATED',
      format('Создан профиль пользователя: %s', NEW.phone_number),
      NEW.id,
      NEW.phone_number,
      NULL,
      'INFO',
      NULL,
      jsonb_build_object('first_name', NEW.first_name, 'city', NEW.city),
      'profiles',
      NEW.id::text,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.write_audit_log(
      'profiles_trigger',
      'DATA_MODIFY',
      'PROFILE_UPDATED',
      format('Обновлен профиль пользователя: %s', NEW.phone_number),
      NEW.id,
      NEW.phone_number,
      NULL,
      'INFO',
      NULL,
      NULL,
      'profiles',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_profiles_changes();

-- Триггер для таблицы user_vehicles
CREATE OR REPLACE FUNCTION public.audit_vehicles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_phone text;
BEGIN
  SELECT phone_number INTO v_user_phone FROM public.profiles WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log(
      'vehicles_trigger',
      'DATA_MODIFY',
      'VEHICLE_ADDED',
      format('Добавлено транспортное средство: %s', NEW.license_plate),
      NEW.user_id,
      v_user_phone,
      NULL,
      'INFO',
      NULL,
      jsonb_build_object('model', NEW.model, 'year', NEW.year, 'license_plate', NEW.license_plate),
      'user_vehicles',
      NEW.id::text,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.write_audit_log(
      'vehicles_trigger',
      'DATA_MODIFY',
      'VEHICLE_UPDATED',
      format('Обновлено транспортное средство: %s', NEW.license_plate),
      NEW.user_id,
      v_user_phone,
      NULL,
      'INFO',
      NULL,
      NULL,
      'user_vehicles',
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.write_audit_log(
      'vehicles_trigger',
      'DATA_MODIFY',
      'VEHICLE_DELETED',
      format('Удалено транспортное средство: %s', OLD.license_plate),
      OLD.user_id,
      v_user_phone,
      NULL,
      'WARNING',
      NULL,
      NULL,
      'user_vehicles',
      OLD.id::text,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_vehicles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.audit_vehicles_changes();

-- Триггер для user_roles (критически важно для безопасности)
CREATE OR REPLACE FUNCTION public.audit_roles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_phone text;
BEGIN
  SELECT phone_number INTO v_user_phone FROM public.profiles WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.write_audit_log(
      'roles_trigger',
      'SECURITY',
      'ROLE_ASSIGNED',
      format('Назначена роль %s пользователю', NEW.role),
      NEW.user_id,
      v_user_phone,
      NULL,
      'WARNING',
      NULL,
      jsonb_build_object('role', NEW.role),
      'user_roles',
      NEW.id::text,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.write_audit_log(
      'roles_trigger',
      'SECURITY',
      'ROLE_REVOKED',
      format('Отозвана роль %s у пользователя', OLD.role),
      OLD.user_id,
      v_user_phone,
      NULL,
      'ALERT',
      NULL,
      jsonb_build_object('role', OLD.role),
      'user_roles',
      OLD.id::text,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_roles_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_roles_changes();