-- Исправленная функция для статистики аудита
CREATE OR REPLACE FUNCTION public.get_audit_statistics(
  p_start_date timestamptz DEFAULT (now() - interval '24 hours'),
  p_end_date timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_total bigint;
  v_failed bigint;
  v_unique_users bigint;
  v_by_level jsonb;
  v_by_category jsonb;
  v_by_source jsonb;
BEGIN
  -- Проверяем что пользователь - админ
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  
  -- Общее количество
  SELECT COUNT(*), COUNT(*) FILTER (WHERE success = false), COUNT(DISTINCT user_id)
  INTO v_total, v_failed, v_unique_users
  FROM public.audit_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  -- По уровням
  SELECT COALESCE(jsonb_object_agg(level::text, cnt), '{}'::jsonb)
  INTO v_by_level
  FROM (
    SELECT level, COUNT(*) as cnt 
    FROM public.audit_logs 
    WHERE created_at BETWEEN p_start_date AND p_end_date 
    GROUP BY level
  ) sub;
  
  -- По категориям
  SELECT COALESCE(jsonb_object_agg(category::text, cnt), '{}'::jsonb)
  INTO v_by_category
  FROM (
    SELECT category, COUNT(*) as cnt 
    FROM public.audit_logs 
    WHERE created_at BETWEEN p_start_date AND p_end_date 
    GROUP BY category
  ) sub;
  
  -- По источникам
  SELECT COALESCE(jsonb_object_agg(source_service, cnt), '{}'::jsonb)
  INTO v_by_source
  FROM (
    SELECT source_service, COUNT(*) as cnt 
    FROM public.audit_logs 
    WHERE created_at BETWEEN p_start_date AND p_end_date 
    GROUP BY source_service
  ) sub;
  
  v_result := jsonb_build_object(
    'total_events', v_total,
    'failed_events', v_failed,
    'unique_users', v_unique_users,
    'events_by_level', v_by_level,
    'events_by_category', v_by_category,
    'events_by_source', v_by_source,
    'period_start', p_start_date,
    'period_end', p_end_date
  );
  
  RETURN v_result;
END;
$$;