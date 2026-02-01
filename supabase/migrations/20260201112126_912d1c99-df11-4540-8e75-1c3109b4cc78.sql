-- Add per-request phone sharing flag
ALTER TABLE public.help_requests
ADD COLUMN IF NOT EXISTS share_phone boolean NOT NULL DEFAULT false;

-- Ensure realtime is enabled for help requests + chat messages
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fix RLS so a responder can "claim" an active request exactly once
DROP POLICY IF EXISTS "Responders can update help status" ON public.help_requests;

CREATE POLICY "Responders can claim active request"
ON public.help_requests
FOR UPDATE
USING (
  status = 'active'::text
  AND responder_id IS NULL
)
WITH CHECK (
  responder_id = auth.uid()
);

-- Notifications: create trigger when someone responds
DROP TRIGGER IF EXISTS trg_notify_help_request_owner ON public.help_responses;
CREATE TRIGGER trg_notify_help_request_owner
AFTER INSERT ON public.help_responses
FOR EACH ROW
EXECUTE FUNCTION public.notify_help_request_owner();