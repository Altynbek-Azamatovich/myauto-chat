-- Add helper/responder info to help_requests
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS responder_id UUID;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS responder_eta_minutes INTEGER;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS address TEXT;

-- Add profile verification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_selfie_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS engine_volume TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fuel_type TEXT;

-- Allow all authenticated users to view profiles for map display
CREATE POLICY "Anyone can view basic profile info"
  ON profiles
  FOR SELECT
  USING (true);

-- Update help_requests to allow responder updates
CREATE POLICY "Responders can update help status"
  ON help_requests
  FOR UPDATE
  USING (auth.uid() = responder_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = responder_id OR auth.uid() = user_id);