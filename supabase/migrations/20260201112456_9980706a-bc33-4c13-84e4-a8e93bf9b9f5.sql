-- Fix RLS for responders to claim requests
-- Drop the broken policy
DROP POLICY IF EXISTS "Responders can claim active request" ON public.help_requests;

-- Create a proper policy that allows anyone to claim an unclaimed active request
CREATE POLICY "Anyone can claim unclaimed active request"
ON public.help_requests
FOR UPDATE
USING (
  status = 'active'
  AND responder_id IS NULL
  AND user_id != auth.uid()  -- Can't respond to own request
)
WITH CHECK (
  responder_id = auth.uid()  -- Must set themselves as responder
);