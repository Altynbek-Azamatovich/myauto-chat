-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.service_partners(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_partner_id ON public.reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reviews_updated_at();

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('vehicles', 'vehicles', true),
  ('diagnostics', 'diagnostics', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for vehicles
CREATE POLICY "Vehicle images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vehicles');

CREATE POLICY "Users can upload their vehicle photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their vehicle photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'vehicles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their vehicle photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'vehicles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for diagnostics (private)
CREATE POLICY "Users can view their own diagnostic images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'diagnostics' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload diagnostic images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'diagnostics' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their diagnostic images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'diagnostics' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );