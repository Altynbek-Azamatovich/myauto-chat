-- Add 'partner' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';

-- Ensure service_partners table has is_verified field (should already exist)
-- Adding comment for clarity
COMMENT ON COLUMN public.service_partners.is_verified IS 'Partner verification status - must be approved before full access';

-- Add index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);