-- Fix the handle_new_user trigger to handle conflicts with existing phone numbers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  )
  ON CONFLICT (phone_number) 
  DO UPDATE SET
    id = EXCLUDED.id,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;