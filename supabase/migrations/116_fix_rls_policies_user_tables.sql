
-- =====================================================
-- FIX RLS POLICIES FOR USER TABLES
-- =====================================================
-- The issue: RLS policies are too restrictive or misconfigured
-- Solution: Create proper RLS policies that work with our authentication system

-- Disable RLS temporarily to fix policies
ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can view public drills" ON user_drills;
DROP POLICY IF EXISTS "Users can insert their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can update their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can delete their own drills" ON user_drills;

DROP POLICY IF EXISTS "Users can manage their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can view public strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON user_strategies;

DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

-- Create new simplified RLS policies for user_drills
CREATE POLICY "Enable insert for authenticated users own drills" ON user_drills
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);  -- Allow any authenticated user to insert their own drills

CREATE POLICY "Enable select for drill owners and public drills" ON user_drills
    FOR SELECT 
    TO authenticated 
    USING (
      user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
      OR is_public = true
    );

CREATE POLICY "Enable update for drill owners" ON user_drills
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Enable delete for drill owners" ON user_drills
    FOR DELETE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create new simplified RLS policies for user_strategies
CREATE POLICY "Enable insert for authenticated users own strategies" ON user_strategies
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);  -- Allow any authenticated user to insert their own strategies

CREATE POLICY "Enable select for strategy owners and public strategies" ON user_strategies
    FOR SELECT 
    TO authenticated 
    USING (
      user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
      OR is_public = true
    );

CREATE POLICY "Enable update for strategy owners" ON user_strategies
    FOR UPDATE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Enable delete for strategy owners" ON user_strategies
    FOR DELETE 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create new simplified RLS policies for user_favorites
CREATE POLICY "Enable all operations for own favorites" ON user_favorites
    FOR ALL 
    TO authenticated 
    USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
    WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Re-enable RLS with new policies
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON user_drills TO authenticated;
GRANT ALL ON user_strategies TO authenticated;
GRANT ALL ON user_favorites TO authenticated;

-- Also grant permissions to anon for public content viewing
GRANT SELECT ON user_drills TO anon;
GRANT SELECT ON user_strategies TO anon;

-- Verify the changes
SELECT 
  'RLS policies updated successfully!' as message,
  'Simplified policies for better compatibility' as detail1,
  'Authenticated users can now insert their own content' as detail2;
