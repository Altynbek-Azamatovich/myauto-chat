-- Make diagnostics bucket public for viewing images
UPDATE storage.buckets SET public = true WHERE id = 'diagnostics';

-- Add storage policies for diagnostics bucket
CREATE POLICY "Anyone can view diagnostic images"
ON storage.objects FOR SELECT
USING (bucket_id = 'diagnostics');

CREATE POLICY "Authenticated users can upload diagnostic images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own diagnostic images"
ON storage.objects FOR DELETE
USING (bucket_id = 'diagnostics' AND auth.uid()::text = (storage.foldername(name))[1]);