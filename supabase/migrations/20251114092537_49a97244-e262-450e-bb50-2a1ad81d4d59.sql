-- Create partner applications table for manual verification
CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  business_description TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an application
CREATE POLICY "Anyone can submit partner application"
ON public.partner_applications
FOR INSERT
TO anon
WITH CHECK (true);

-- Only admins can view and manage applications
CREATE POLICY "Admins can view all applications"
ON public.partner_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.partner_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_partner_applications_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index on status for filtering
CREATE INDEX idx_partner_applications_status ON public.partner_applications(status);

-- Add index on phone_number for lookups
CREATE INDEX idx_partner_applications_phone ON public.partner_applications(phone_number);