-- Add partner_login field to service_partners
ALTER TABLE service_partners ADD COLUMN IF NOT EXISTS partner_login text UNIQUE;

-- Make phone_number nullable since partners will use login instead
ALTER TABLE service_partners ALTER COLUMN phone_number DROP NOT NULL;

-- Add partner_login to partner_applications
ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS partner_login text;

-- Add index for faster login lookups
CREATE INDEX IF NOT EXISTS idx_service_partners_login ON service_partners(partner_login);

-- Update RLS policies for admin access to partner_applications
DROP POLICY IF EXISTS "Admins can delete applications" ON partner_applications;
CREATE POLICY "Admins can delete applications"
ON partner_applications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create admin panel page access policy
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
ON admin_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));