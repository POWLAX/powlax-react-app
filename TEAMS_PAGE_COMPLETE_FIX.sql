-- =====================================================
-- TEAMS PAGE COMPLETE FIX - RUN IN SUPABASE DASHBOARD
-- =====================================================
-- This script fixes RLS policies and ensures data exists
-- Run this entire script in the Supabase SQL Editor
-- =====================================================

-- STEP 1: Fix RLS infinite recursion on users table
-- =====================================================
BEGIN;

-- Temporarily disable RLS to make changes
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to eliminate any recursion
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Create new, simple, non-recursive policies
CREATE POLICY "Users can view their own record" ON users
    FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own record" ON users
    FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Service role bypass" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

COMMIT;

-- STEP 2: Ensure Your Club OS exists
-- =====================================================
INSERT INTO clubs (id, name, created_at, updated_at)
VALUES (
    'a22ad3ca-9f1c-4c4f-9163-021c6af927ac',
    'Your Club OS',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    updated_at = NOW();

-- STEP 3: Ensure teams exist for Your Club OS
-- =====================================================
-- Insert the teams shown in your screenshots
INSERT INTO teams (id, name, club_id, created_at, updated_at)
VALUES 
    ('d6b72e87-8fab-4f4c-9921-260501605ee2', 'Your Varsity Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('43642a09-17b6-4813-b9ea-d69a2cd7ad6a', 'Your JV Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('044c362a-1501-4e38-aaff-d2ce83381a85', 'Your 8th Grade Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('8da59c66-3725-4f8b-8c02-87f02e2ebf85', 'Your 7th Grade Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('13d5e9f9-bcd0-4b7f-a3f5-3bc5c9a8c26d', 'Your 6th Grade Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('18ce5c7b-4ae5-42ef-aada-7b8c88cf9797', 'Your 5th Grade Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW()),
    ('49e22c3f-7db5-4d0e-9b34-d5e88c9c8e87', 'Your 4th Grade Team HQ', 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    club_id = EXCLUDED.club_id,
    updated_at = NOW();

-- STEP 4: Create patrick@powlax.com user
-- =====================================================
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'patrick@powlax.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        -- Create new user with a proper UUID
        v_user_id := gen_random_uuid();
        
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
            v_user_id,
            'patrick@powlax.com',
            'patrick',
            'Patrick Chapla',
            'director',
            ARRAY['director', 'admin', 'coach'],
            'a22ad3ca-9f1c-4c4f-9163-021c6af927ac',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created patrick@powlax.com user with ID: %', v_user_id;
    ELSE
        -- Update existing user
        UPDATE users
        SET 
            club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac',
            role = 'director',
            roles = ARRAY['director', 'admin', 'coach'],
            display_name = COALESCE(display_name, 'Patrick Chapla'),
            username = COALESCE(username, 'patrick'),
            updated_at = NOW()
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Updated patrick@powlax.com user';
    END IF;
    
    -- Now add Patrick to all Your Club OS teams
    FOR team_record IN 
        SELECT id, name 
        FROM teams 
        WHERE club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac'
    LOOP
        INSERT INTO team_members (team_id, user_id, role, created_at)
        VALUES (team_record.id, v_user_id, 'head_coach', NOW())
        ON CONFLICT (team_id, user_id) DO UPDATE
        SET role = 'head_coach',
            updated_at = NOW();
        
        RAISE NOTICE 'Added Patrick to team: %', team_record.name;
    END LOOP;
END $$;

-- STEP 5: Fix RLS for related tables
-- =====================================================

-- Fix clubs table RLS
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON clubs;
DROP POLICY IF EXISTS "Authenticated read access" ON clubs;

CREATE POLICY "Anyone can read clubs" ON clubs
    FOR SELECT
    USING (true);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Fix teams table RLS
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON teams;
DROP POLICY IF EXISTS "Authenticated read access" ON teams;

CREATE POLICY "Anyone can read teams" ON teams
    FOR SELECT
    USING (true);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Fix team_members table RLS
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON team_members;
DROP POLICY IF EXISTS "Authenticated read access" ON team_members;

CREATE POLICY "Anyone can read team members" ON team_members
    FOR SELECT
    USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- STEP 6: Verify the setup
-- =====================================================
DO $$
DECLARE
    club_count INTEGER;
    team_count INTEGER;
    member_count INTEGER;
    patrick_id UUID;
BEGIN
    -- Count clubs
    SELECT COUNT(*) INTO club_count
    FROM clubs
    WHERE id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac';
    
    -- Count teams
    SELECT COUNT(*) INTO team_count
    FROM teams
    WHERE club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac';
    
    -- Get Patrick's ID
    SELECT id INTO patrick_id
    FROM users
    WHERE email = 'patrick@powlax.com'
    LIMIT 1;
    
    -- Count Patrick's team memberships
    SELECT COUNT(*) INTO member_count
    FROM team_members
    WHERE user_id = patrick_id;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ TEAMS PAGE FIX COMPLETE!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Your Club OS exists: %', club_count;
    RAISE NOTICE 'Teams in Your Club OS: %', team_count;
    RAISE NOTICE 'Patrick team memberships: %', member_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'The teams page should now work correctly!';
    RAISE NOTICE '==============================================';
END $$;

-- Final verification queries (will show in output)
SELECT 'CLUBS:' as table_name, COUNT(*) as count FROM clubs WHERE id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac'
UNION ALL
SELECT 'TEAMS:', COUNT(*) FROM teams WHERE club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac'
UNION ALL
SELECT 'PATRICK USER:', COUNT(*) FROM users WHERE email = 'patrick@powlax.com'
UNION ALL
SELECT 'PATRICK MEMBERSHIPS:', COUNT(*) FROM team_members WHERE user_id IN (SELECT id FROM users WHERE email = 'patrick@powlax.com');

-- Show Patrick's teams
SELECT 
    'Patrick is ' || tm.role || ' of ' || t.name as status
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
WHERE u.email = 'patrick@powlax.com'
ORDER BY t.name;