-- Update handle_new_user trigger to skip profile creation for partner accounts
-- This prevents unique constraint violations when creating partner accounts

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_phone TEXT;
BEGIN
  -- Skip profile creation for partner accounts (emails ending with @partner.myauto.kz)
  IF NEW.email LIKE '%@partner.myauto.kz' THEN
    RETURN NEW;
  END IF;

  -- Get phone number, use NULL if empty
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');
  IF user_phone = '' THEN
    user_phone := NULL;
  END IF;

  INSERT INTO public.profiles (id, phone_number, full_name, preferred_language, onboarding_completed)
  VALUES (
    NEW.id,
    user_phone,
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