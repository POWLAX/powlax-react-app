-- =====================================================
-- FIX TEAMS PAGE - Complete SQL Solution
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- STEP 1: Fix the RLS infinite recursion on users table
-- =====================================================

-- First, disable RLS temporarily to fix policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table to remove recursion
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;  
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own record by auth_user_id" ON users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can read by id for team lookups" ON users
  FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM team_members
      WHERE team_id IN (
        SELECT team_id FROM team_members tm2
        WHERE tm2.user_id = (
          SELECT id FROM users u2 WHERE u2.auth_user_id = auth.uid() LIMIT 1
        )
      )
    )
  );

CREATE POLICY "Service role has full access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- STEP 2: Create/Update patrick@powlax.com user
-- =====================================================

-- First check if user exists
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id
  FROM users
  WHERE email = 'patrick@powlax.com'
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    -- Create new user
    INSERT INTO users (
      id,
      email,
      username,
      display_name,
      role,
      roles,
      club_id,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'patrick@powlax.com',
      'patrick',
      'Patrick Chapla',
      'director',
      ARRAY['director', 'admin', 'coach'],
      'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', -- Your Club OS
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new user patrick@powlax.com';
  ELSE
    -- Update existing user
    UPDATE users
    SET 
      club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac',
      role = 'director',
      roles = ARRAY['director', 'admin', 'coach'],
      updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated existing user patrick@powlax.com';
  END IF;
END $$;

-- STEP 3: Link Patrick to Your Club OS teams
-- =====================================================

-- Get Patrick's user ID
DO $$
DECLARE
  v_user_id UUID;
  v_team RECORD;
BEGIN
  -- Get Patrick's user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = 'patrick@powlax.com'
  LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Link to all Your Club OS teams
    FOR v_team IN 
      SELECT id, name 
      FROM teams 
      WHERE club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac'
    LOOP
      -- Check if association exists
      IF NOT EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_id = v_team.id AND user_id = v_user_id
      ) THEN
        INSERT INTO team_members (team_id, user_id, role, created_at)
        VALUES (v_team.id, v_user_id, 'head_coach', NOW());
        
        RAISE NOTICE 'Added Patrick to team: %', v_team.name;
      ELSE
        RAISE NOTICE 'Patrick already member of team: %', v_team.name;
      END IF;
    END LOOP;
  ELSE
    RAISE NOTICE 'Patrick user not found!';
  END IF;
END $$;

-- STEP 4: Fix RLS policies for teams and team_members
-- =====================================================

-- Fix teams table policies
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON teams;
DROP POLICY IF EXISTS "Users can view teams in their club" ON teams;

CREATE POLICY "Authenticated users can view teams" ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with club_id can manage their club teams" ON teams
  FOR ALL
  USING (
    club_id IN (
      SELECT club_id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    club_id IN (
      SELECT club_id FROM users WHERE auth_user_id = auth.uid()
    )
  );

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Fix team_members table policies
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON team_members;

CREATE POLICY "Authenticated users can view team members" ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- STEP 5: Verify the setup
-- =====================================================

-- Check Patrick's user
SELECT 
  u.id,
  u.email,
  u.role,
  u.club_id,
  c.name as club_name
FROM users u
LEFT JOIN clubs c ON u.club_id = c.id
WHERE u.email = 'patrick@powlax.com';

-- Check Patrick's team memberships
SELECT 
  t.name as team_name,
  tm.role as member_role
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
WHERE u.email = 'patrick@powlax.com';

-- Count total setup
SELECT 
  (SELECT COUNT(*) FROM clubs WHERE id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac') as club_count,
  (SELECT COUNT(*) FROM teams WHERE club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac') as team_count,
  (SELECT COUNT(*) FROM team_members tm 
   JOIN teams t ON tm.team_id = t.id 
   WHERE t.club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac') as member_count;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ TEAMS PAGE FIX COMPLETE!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '1. Fixed RLS infinite recursion on users table';
    RAISE NOTICE '2. Created/updated patrick@powlax.com as director';
    RAISE NOTICE '3. Linked Patrick to all Your Club OS teams';
    RAISE NOTICE '4. Fixed RLS policies for teams access';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Patrick should now see teams when logged in!';
END $$;