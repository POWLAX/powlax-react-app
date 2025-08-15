-- FIX: Magic Links RLS Policy Issue
-- The service role is being blocked by RLS policies

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'magic_links';

-- Drop all existing policies on magic_links
DROP POLICY IF EXISTS "magic_links_service_only" ON magic_links;
DROP POLICY IF EXISTS "Service role full access to magic_links" ON magic_links;

-- Create proper service role policy
CREATE POLICY "service_role_magic_links_full_access" ON magic_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Test direct insertion to verify policy works
INSERT INTO magic_links (
  token, 
  email, 
  expires_at,
  created_at
) VALUES (
  'test-policy-fix-' || extract(epoch from now())::text,
  'test-policy@example.com',
  NOW() + INTERVAL '1 hour',
  NOW()
);

-- Verify the record was created
SELECT token, email, expires_at, created_at 
FROM magic_links 
WHERE email = 'test-policy@example.com'
ORDER BY created_at DESC 
LIMIT 1;
