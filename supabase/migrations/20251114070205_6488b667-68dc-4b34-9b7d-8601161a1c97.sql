-- Update handle_new_user to correctly extract phone from auth.users
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