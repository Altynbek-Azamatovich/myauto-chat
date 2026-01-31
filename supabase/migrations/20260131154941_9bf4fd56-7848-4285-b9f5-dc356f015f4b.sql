-- Add age and gender columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text;

-- Add check constraint for gender values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_gender_check CHECK (gender IS NULL OR gender IN ('male', 'female'));