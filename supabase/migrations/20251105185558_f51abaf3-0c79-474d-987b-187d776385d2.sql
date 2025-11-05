-- Fix search_path for the function by recreating it with proper security settings
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
DROP FUNCTION IF EXISTS public.update_chat_conversation_updated_at();

CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = '';

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_conversation_updated_at();