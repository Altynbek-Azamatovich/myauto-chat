-- Realtime: ensure chat messages are broadcast
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Realtime: ensure help_requests updates are broadcast (used for live marker updates)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Notify requester when someone responds
DROP TRIGGER IF EXISTS trg_notify_help_request_owner ON public.help_responses;
CREATE TRIGGER trg_notify_help_request_owner
AFTER INSERT ON public.help_responses
FOR EACH ROW
EXECUTE FUNCTION public.notify_help_request_owner();