-- Fix RLS policy for help_requests update to allow status changes
DROP POLICY IF EXISTS "Users can update their own help requests" ON help_requests;

CREATE POLICY "Users can update their own help requests"
ON help_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);