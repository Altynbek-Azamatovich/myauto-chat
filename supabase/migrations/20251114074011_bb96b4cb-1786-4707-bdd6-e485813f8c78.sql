-- Create help_requests table for roadside assistance
CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'helped', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_responses table for tracking who responded to help
CREATE TABLE public.help_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  help_request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(help_request_id, responder_id)
);

-- Enable Row Level Security
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_requests
CREATE POLICY "Anyone can view active help requests"
  ON public.help_requests
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own help requests"
  ON public.help_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help requests"
  ON public.help_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own help requests"
  ON public.help_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for help_responses
CREATE POLICY "Anyone can view help responses"
  ON public.help_responses
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own responses"
  ON public.help_responses
  FOR INSERT
  WITH CHECK (auth.uid() = responder_id);

-- Enable realtime for help_requests
ALTER TABLE public.help_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;

-- Enable realtime for help_responses
ALTER TABLE public.help_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_responses;

-- Function to create notification when someone responds to help request
CREATE OR REPLACE FUNCTION notify_help_request_owner()
RETURNS TRIGGER AS $$
DECLARE
  request_owner_id UUID;
  responder_name TEXT;
BEGIN
  -- Get the owner of the help request
  SELECT user_id INTO request_owner_id
  FROM help_requests
  WHERE id = NEW.help_request_id;
  
  -- Get responder name
  SELECT COALESCE(first_name || ' ' || last_name, phone_number) INTO responder_name
  FROM profiles
  WHERE id = NEW.responder_id;
  
  -- Create notification for request owner
  INSERT INTO notifications (user_id, type, category, title, message)
  VALUES (
    request_owner_id,
    'info',
    'help',
    'Помощь в пути',
    responder_name || ' откликнулся на ваш запрос о помощи и едет к вам!'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send notification when someone responds
CREATE TRIGGER on_help_response_created
  AFTER INSERT ON help_responses
  FOR EACH ROW
  EXECUTE FUNCTION notify_help_request_owner();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_help_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_help_requests_updated_at
  BEFORE UPDATE ON help_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_help_requests_updated_at();