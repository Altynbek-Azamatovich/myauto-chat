-- Create table for help chat messages between requester and responder
CREATE TABLE public.help_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  help_request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for requests they're involved in
CREATE POLICY "Users can view help chat messages"
ON public.help_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.help_requests hr
    WHERE hr.id = help_chat_messages.help_request_id
    AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())
  )
);

-- Policy: Users can send messages to requests they're involved in
CREATE POLICY "Users can send help chat messages"
ON public.help_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.help_requests hr
    WHERE hr.id = help_chat_messages.help_request_id
    AND (hr.user_id = auth.uid() OR hr.responder_id = auth.uid())
  )
);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_chat_messages;