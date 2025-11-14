-- Add partner_pin column to service_partners table
ALTER TABLE public.service_partners 
ADD COLUMN partner_pin TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.service_partners.partner_pin IS 'Encrypted PIN code for partner account access (4-6 digits)';
