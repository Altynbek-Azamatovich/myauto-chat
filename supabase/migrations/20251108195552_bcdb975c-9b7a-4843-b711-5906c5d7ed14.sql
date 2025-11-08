-- Add RLS policies for otp_codes table (used for SMS verification)
-- Only allow service role to access OTP codes (via edge functions)
CREATE POLICY "Service role can manage OTP codes"
ON public.otp_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix search_path for delete_expired_otp_codes function
CREATE OR REPLACE FUNCTION public.delete_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < (now() - INTERVAL '1 hour');
END;
$function$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;