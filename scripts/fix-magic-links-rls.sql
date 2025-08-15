-- Fix Magic Links RLS Policies
-- The issue is likely that the service role policy isn't working correctly

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'magic_links';

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "magic_links_service_only" ON magic_links;

-- Create a more permissive policy for service role
CREATE POLICY "Service role full access to magic_links" ON magic_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also allow authenticated users to read their own magic links (for debugging)
CREATE POLICY "Users can read their own magic links" ON magic_links
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Test insertion directly
INSERT INTO magic_links (token, email, expires_at) 
VALUES ('test-token-123', 'test@example.com', NOW() + INTERVAL '1 hour')
ON CONFLICT (token) DO NOTHING;

-- Check if the record was created
SELECT * FROM magic_links WHERE email = 'test@example.com';
