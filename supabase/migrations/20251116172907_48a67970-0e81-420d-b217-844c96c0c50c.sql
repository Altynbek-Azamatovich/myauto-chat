-- Improve OTP data retention and cleanup
-- Delete verified OTP codes immediately after use
CREATE OR REPLACE FUNCTION public.cleanup_verified_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete verified OTP codes older than 5 minutes
  DELETE FROM public.otp_codes 
  WHERE verified = true 
    AND created_at < (now() - INTERVAL '5 minutes');
  
  -- Delete expired unverified OTP codes
  DELETE FROM public.otp_codes 
  WHERE verified = false 
    AND expires_at < now();
END;
$$;

-- Update rate limit cleanup to be more aggressive
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete rate limit entries older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE last_attempt_at < (now() - INTERVAL '24 hours')
    AND (blocked_until IS NULL OR blocked_until < now());
END;
$$;

-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.delete_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_help_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_help_request_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_owner_id UUID;
  responder_name TEXT;
BEGIN
  -- Get the owner of the help request
  SELECT user_id INTO request_owner_id
  FROM public.help_requests
  WHERE id = NEW.help_request_id;
  
  -- Get responder name
  SELECT COALESCE(first_name || ' ' || last_name, phone_number) INTO responder_name
  FROM public.profiles
  WHERE id = NEW.responder_id;
  
  -- Create notification for request owner
  INSERT INTO public.notifications (user_id, type, category, title, message)
  VALUES (
    request_owner_id,
    'info',
    'help',
    'Помощь в пути',
    responder_name || ' откликнулся на ваш запрос о помощи и едет к вам!'
  );
  
  RETURN NEW;
END;
$$;