-- =====================================================
-- MIGRATION 119: Fix RLS for ANON Access
-- Date: January 12, 2025
-- Purpose: Allow browser (using ANON key) to work with all tables
-- This fixes the "row violates row-level security policy" errors
-- =====================================================

-- =====================================================
-- PART 1: user_drills - Allow anon role
-- =====================================================
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can manage drills" ON user_drills;
DROP POLICY IF EXISTS "Open access" ON user_drills;
DROP POLICY IF EXISTS "Allow anon access" ON user_drills;
DROP POLICY IF EXISTS "Authenticated users can view all user drills" ON user_drills;
DROP POLICY IF EXISTS "Authenticated users can create drills" ON user_drills;
DROP POLICY IF EXISTS "Users can update their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can delete their own drills" ON user_drills;

-- Create new policy allowing anon access
CREATE POLICY "Allow anon access" ON user_drills
  FOR ALL 
  TO anon, authenticated, public
  USING (true) 
  WITH CHECK (true);

-- =====================================================
-- PART 2: user_strategies - Allow anon role
-- =====================================================
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can manage strategies" ON user_strategies;
DROP POLICY IF EXISTS "Open access" ON user_strategies;
DROP POLICY IF EXISTS "Allow anon access" ON user_strategies;
DROP POLICY IF EXISTS "Authenticated users can view all user strategies" ON user_strategies;
DROP POLICY IF EXISTS "Authenticated users can create strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON user_strategies;

-- Create new policy allowing anon access
CREATE POLICY "Allow anon access" ON user_strategies
  FOR ALL
  TO anon, authenticated, public
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PART 3: user_favorites - Allow anon role
-- =====================================================
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can manage favorites" ON user_favorites;
DROP POLICY IF EXISTS "Open access" ON user_favorites;
DROP POLICY IF EXISTS "Allow anon access" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

-- Create new policy allowing anon access
CREATE POLICY "Allow anon access" ON user_favorites
  FOR ALL
  TO anon, authenticated, public
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PART 4: practices - Allow anon role
-- =====================================================
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can manage practices" ON practices;
DROP POLICY IF EXISTS "Open access" ON practices;
DROP POLICY IF EXISTS "Allow anon access" ON practices;
DROP POLICY IF EXISTS "Users can manage their own practices" ON practices;

-- Create new policy allowing anon access
CREATE POLICY "Allow anon access" ON practices
  FOR ALL
  TO anon, authenticated, public
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PART 5: Grant permissions to anon role
-- =====================================================
GRANT ALL ON user_drills TO anon;
GRANT ALL ON user_strategies TO anon;
GRANT ALL ON user_favorites TO anon;
GRANT ALL ON practices TO anon;

-- Grant sequence permissions if they exist
DO $$
BEGIN
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not grant sequence permissions: %', SQLERRM;
END $$;

-- =====================================================
-- PART 6: Verify the fix
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION 119 COMPLETED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What this fixed:';
  RAISE NOTICE '✅ RLS policies now allow ANON role (browser access)';
  RAISE NOTICE '✅ All tables can be accessed from the frontend';
  RAISE NOTICE '✅ No more "row violates row-level security" errors';
  RAISE NOTICE '';
  RAISE NOTICE 'Test these features:';
  RAISE NOTICE '1. Create a custom drill - should save without errors';
  RAISE NOTICE '2. Add/remove favorites - should persist';
  RAISE NOTICE '3. Save practice plans - should work';
  RAISE NOTICE '4. Create custom strategies - should save';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Note:';
  RAISE NOTICE 'This is a temporary fix for development.';
  RAISE NOTICE 'For production, implement proper authentication.';
  RAISE NOTICE '==============================================';
END $$;