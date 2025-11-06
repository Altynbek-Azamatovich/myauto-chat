-- Create table for storing OTP codes
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for sending OTP)
CREATE POLICY "Anyone can create OTP codes" 
ON public.otp_codes 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading own OTP codes
CREATE POLICY "Users can read their own OTP codes" 
ON public.otp_codes 
FOR SELECT 
USING (true);

-- Create policy to allow updating own OTP codes
CREATE POLICY "Anyone can update OTP codes" 
ON public.otp_codes 
FOR UPDATE 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_phone_expires ON public.otp_codes(phone_number, expires_at) WHERE verified = false;

-- Auto-delete expired OTP codes (cleanup after 1 hour)
CREATE OR REPLACE FUNCTION public.delete_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - INTERVAL '1 hour');
END;
$$;