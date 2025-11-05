-- Add additional profile fields for vehicle and personal information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS patronymic text,
ADD COLUMN IF NOT EXISTS car_brand text,
ADD COLUMN IF NOT EXISTS car_model text,
ADD COLUMN IF NOT EXISTS license_plate text,
ADD COLUMN IF NOT EXISTS car_color text,
ADD COLUMN IF NOT EXISTS car_year integer,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'ru';

-- Update the handle_new_user function to set default language
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
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ru'),
    false
  );
  RETURN NEW;
END;
$function$;