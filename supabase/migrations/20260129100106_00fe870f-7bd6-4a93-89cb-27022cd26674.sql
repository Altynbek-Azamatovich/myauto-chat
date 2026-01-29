-- Make user_id nullable in user_vehicles so vehicles can be "orphaned"
ALTER TABLE public.user_vehicles 
  ALTER COLUMN user_id DROP NOT NULL;

-- Change foreign key to SET NULL on delete instead of restrict
ALTER TABLE public.user_vehicles 
  DROP CONSTRAINT IF EXISTS user_vehicles_user_id_fkey;

ALTER TABLE public.user_vehicles
  ADD CONSTRAINT user_vehicles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- Update RLS policy to allow viewing orphaned vehicles (for VIN lookup)
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.user_vehicles;

CREATE POLICY "Users can view their own vehicles or orphaned" 
  ON public.user_vehicles 
  FOR SELECT 
  USING ((auth.uid() = user_id) OR (user_id IS NULL));