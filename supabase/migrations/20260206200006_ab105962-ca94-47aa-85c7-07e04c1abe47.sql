
-- 1. FIX PROFILES: Remove public access, only authenticated users see own profile
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;

-- Allow authenticated users to view their own profile (keep existing policy)
-- "Users can view their own profile" already exists

-- Allow authenticated users to view basic info of other users (for help requests, chat, etc.)
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- 2. FIX HELP_REQUESTS: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active help requests" ON public.help_requests;

CREATE POLICY "Authenticated users can view active help requests"
ON public.help_requests FOR SELECT TO authenticated
USING (status = 'active'::text OR auth.uid() = user_id OR auth.uid() = responder_id);

-- 3. FIX HELP_RESPONSES: Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view help responses" ON public.help_responses;

CREATE POLICY "Authenticated users can view help responses"
ON public.help_responses FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.help_requests
    WHERE help_requests.id = help_responses.help_request_id
    AND (help_requests.user_id = auth.uid() OR help_requests.responder_id = auth.uid()
         OR help_requests.status = 'active')
  )
);

-- 4. FIX SERVICE_PARTNERS: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view verified partners" ON public.service_partners;

CREATE POLICY "Authenticated users can view verified partners"
ON public.service_partners FOR SELECT TO authenticated
USING ((is_verified = true) OR (owner_id = auth.uid()));

-- 5. FIX OTP_CODES: Remove permissive policies, keep only service_role
DROP POLICY IF EXISTS "Anyone can create OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can read their own OTP codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Anyone can update OTP codes" ON public.otp_codes;

-- 6. REMOVE PLAINTEXT PASSWORDS
ALTER TABLE public.partner_applications DROP COLUMN IF EXISTS partner_password;

-- 7. FIX SECURITY DEFINER VIEW
DROP VIEW IF EXISTS public.audit_logs_formatted;

CREATE VIEW public.audit_logs_formatted
WITH (security_invoker = on)
AS
SELECT
  id,
  success,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD') as date,
  to_char(created_at AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as time,
  source_service as source,
  user_account_name as user_account,
  client_ip::text as client_ip,
  to_char(operation_start_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as start_time,
  to_char(operation_end_time AT TIME ZONE 'Asia/Almaty', 'HH24:MI:SS') as end_time,
  level::text as level,
  category::text as category,
  event_type,
  description,
  request_id,
  error_message
FROM public.audit_logs;
