
-- Fix 1: Restrict audit_logs INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix 2: Make diagnostics bucket private and fix storage policies
UPDATE storage.buckets SET public = false WHERE id = 'diagnostics';

DROP POLICY IF EXISTS "Anyone can view diagnostic images" ON storage.objects;

-- Ensure owner-scoped SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' 
    AND policyname = 'Users can view their own diagnostic images'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own diagnostic images"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = ''diagnostics'' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      )';
  END IF;
END $$;
