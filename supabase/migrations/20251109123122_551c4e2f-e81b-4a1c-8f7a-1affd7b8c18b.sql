-- Add color column to user_vehicles table
ALTER TABLE public.user_vehicles 
ADD COLUMN IF NOT EXISTS color TEXT;