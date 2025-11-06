-- Remove all public access policies from otp_codes table
-- OTP verification should only happen server-side via edge functions

DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can read their own OTP codes" ON public.otp_codes;

-- The otp_codes table will now only be accessible via edge functions using service role key
-- This prevents attackers from reading OTP codes and phone numbers