-- Add partner_password column to store encrypted passwords for partners
ALTER TABLE partner_applications 
ADD COLUMN partner_password TEXT,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Create function to create partner account
CREATE OR REPLACE FUNCTION create_partner_account(
  application_id UUID,
  admin_id UUID,
  temp_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record RECORD;
  new_user_id UUID;
  new_partner_id UUID;
  result JSON;
BEGIN
  -- Check if admin has admin role
  IF NOT has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can create partner accounts';
  END IF;

  -- Get application details
  SELECT * INTO app_record
  FROM partner_applications
  WHERE id = application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Create auth user (this will be done via edge function)
  -- Update application status
  UPDATE partner_applications
  SET 
    status = 'approved',
    approved_by = admin_id,
    approved_at = NOW(),
    partner_password = temp_password,
    notes = COALESCE(notes || E'\n', '') || 'Одобрено админом. Пароль установлен.'
  WHERE id = application_id;

  result := json_build_object(
    'success', true,
    'phone_number', app_record.phone_number,
    'temp_password', temp_password
  );

  RETURN result;
END;
$$;