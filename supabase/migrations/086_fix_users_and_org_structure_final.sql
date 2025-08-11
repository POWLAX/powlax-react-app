-- POWLAX Fix User Accounts and Set Up Organization Structure (FINAL)
-- Created: 2025-01-16
-- Purpose: Fix user classifications, set up family relationships, and map BuddyBoss groups to club/team structure
-- Uses renamed tables: clubs (was club_organizations) and teams (was team_teams)

BEGIN;

-- ==========================================
-- STEP 1: FIX USER ACCOUNT CLASSIFICATIONS
-- ==========================================

-- Update the real accounts with correct details
UPDATE users
SET 
  -- Fix names for real accounts
  first_name = CASE
    WHEN display_name = 'Player 1' THEN 'Johnny'
    WHEN display_name = 'powlax_patrick' THEN 'Patrick'
    WHEN display_name = 'powlax_coach' THEN 'Mike'
    WHEN display_name LIKE '%Player%' THEN 'Test'
    ELSE COALESCE(first_name, 'Test')
  END,
  last_name = CASE
    WHEN display_name = 'Player 1' THEN 'Johnson'
    WHEN display_name = 'powlax_patrick' THEN 'Chapla'
    WHEN display_name = 'powlax_coach' THEN 'Johnson'
    WHEN display_name LIKE '%Player%' THEN 'Player'
    ELSE COALESCE(last_name, 'User')
  END,
  -- Set account types properly
  account_type = CASE
    WHEN display_name = 'powlax_patrick' THEN 'family_admin'
    WHEN display_name = 'powlax_coach' THEN 'parent'
    WHEN display_name = 'Player 1' THEN 'child'
    ELSE 'individual'
  END,
  -- Set roles properly
  role = CASE
    WHEN display_name = 'powlax_patrick' THEN 'director'  -- Club Director
    WHEN display_name = 'powlax_coach' THEN 'coach'       -- Team Coach
    ELSE 'player'  -- All others are players
  END,
  -- Update roles array
  roles = CASE
    WHEN display_name = 'powlax_patrick' THEN ARRAY['director', 'admin', 'coach']::text[]
    WHEN display_name = 'powlax_coach' THEN ARRAY['coach', 'parent']::text[]
    WHEN display_name = 'Player 1' THEN ARRAY['player']::text[]
    ELSE ARRAY['player']::text[]
  END,
  -- Set age groups based on team assignment
  age_group = CASE
    WHEN display_name = 'Player 1' THEN 'youth_11_13'  -- 8th grade
    WHEN display_name IN ('powlax_patrick', 'powlax_coach') THEN 'adult'
    WHEN display_name IN ('asia-mills', 'cali-runolfsdottir') THEN 'youth_14_18'  -- Varsity
    WHEN display_name IN ('demario-kertzmann', 'jaida-grimes') THEN 'youth_14_18'  -- JV
    WHEN display_name IN ('jordy-lynch', 'kailyn-russel', 'liza-hackett', 'oda-veum') THEN 'youth_11_13'  -- 8th Grade
    ELSE COALESCE(age_group, 'unknown')
  END,
  -- Player positions
  player_position = CASE
    WHEN display_name = 'Player 1' THEN 'Attack'
    WHEN display_name IN ('asia-mills', 'demario-kertzmann', 'jordy-lynch') THEN 'Attack'
    WHEN display_name IN ('cali-runolfsdottir', 'jaida-grimes', 'kailyn-russel') THEN 'Midfield'
    WHEN display_name IN ('liza-hackett', 'oda-veum') THEN 'Defense'
    WHEN display_name IN ('powlax_patrick', 'powlax_coach') THEN NULL
    ELSE COALESCE(player_position, NULL)
  END,
  -- Graduation years based on teams
  graduation_year = CASE
    WHEN display_name IN ('asia-mills', 'cali-runolfsdottir') THEN 2025  -- Varsity
    WHEN display_name IN ('demario-kertzmann', 'jaida-grimes') THEN 2026  -- JV
    WHEN display_name IN ('Player 1', 'jordy-lynch', 'kailyn-russel', 'liza-hackett', 'oda-veum') THEN 2028  -- 8th Grade
    ELSE graduation_year
  END;

-- ==========================================
-- STEP 2: CREATE/UPDATE CLUB ORGANIZATION
-- ==========================================

-- First check if a club exists, if not create one
INSERT INTO clubs (id, name, created_at, updated_at)
VALUES (
  'a22ad3ca-9f1c-4c4f-9163-021c6af927ac',  -- Use the existing club_id from teams
  'Your Club OS',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET name = 'Your Club OS',
    updated_at = NOW();

-- Update all users to belong to the club
UPDATE users 
SET club_id = 'a22ad3ca-9f1c-4c4f-9163-021c6af927ac';

-- ==========================================
-- STEP 3: UPDATE EXISTING TEAMS
-- ==========================================

-- Get the existing team IDs
DO $$
DECLARE
  v_varsity_team_id UUID;
  v_jv_team_id UUID;
  v_eighth_team_id UUID;
  v_coach_id UUID;
BEGIN
  -- Get coach ID
  SELECT id INTO v_coach_id FROM users WHERE display_name = 'powlax_coach';
  
  -- Get existing team IDs from teams table
  SELECT id INTO v_varsity_team_id FROM teams WHERE name = 'Your Varsity Team HQ';
  SELECT id INTO v_jv_team_id FROM teams WHERE name = 'Your JV Team HQ';
  SELECT id INTO v_eighth_team_id FROM teams WHERE name = 'Your 8th Grade Team HQ';
  
  -- Store for later use
  PERFORM set_config('app.varsity_team_id', COALESCE(v_varsity_team_id::text, ''), false);
  PERFORM set_config('app.jv_team_id', COALESCE(v_jv_team_id::text, ''), false);
  PERFORM set_config('app.eighth_team_id', COALESCE(v_eighth_team_id::text, ''), false);
  PERFORM set_config('app.coach_id', COALESCE(v_coach_id::text, ''), false);
END $$;

-- ==========================================
-- STEP 4: CLEAR AND REASSIGN TEAM MEMBERS
-- ==========================================

-- Clear existing team_members for our teams to avoid conflicts
DELETE FROM team_members 
WHERE team_id IN (
  SELECT id FROM teams 
  WHERE name IN ('Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ')
);

-- Assign players to correct teams
INSERT INTO team_members (team_id, user_id, role, status, created_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'player' as role,
  'active' as status,
  NOW() as created_at
FROM users u
CROSS JOIN teams t
WHERE 
  -- Varsity players
  (u.display_name IN ('asia-mills', 'cali-runolfsdottir') AND t.name = 'Your Varsity Team HQ')
  OR
  -- JV players
  (u.display_name IN ('demario-kertzmann', 'jaida-grimes') AND t.name = 'Your JV Team HQ')
  OR
  -- 8th Grade players
  (u.display_name IN ('Player 1', 'jordy-lynch', 'kailyn-russel', 'liza-hackett', 'oda-veum') AND t.name = 'Your 8th Grade Team HQ')
ON CONFLICT DO NOTHING;

-- Add coach to all three teams
INSERT INTO team_members (team_id, user_id, role, status, created_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'head_coach' as role,
  'active' as status,
  NOW() as created_at
FROM users u
CROSS JOIN teams t
WHERE u.display_name = 'powlax_coach'
  AND t.name IN ('Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ')
ON CONFLICT DO NOTHING;

-- Add Patrick as director/admin to all teams
INSERT INTO team_members (team_id, user_id, role, status, created_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'parent' as role,  -- Using parent role for director access
  'active' as status,
  NOW() as created_at
FROM users u
CROSS JOIN teams t
WHERE u.display_name = 'powlax_patrick'
  AND t.name IN ('Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ')
ON CONFLICT DO NOTHING;

-- ==========================================
-- STEP 5: CREATE FAMILY RELATIONSHIPS
-- ==========================================

-- Create family for Coach Johnson and Player 1
DO $$
DECLARE
  v_coach_id UUID;
  v_player1_id UUID;
  v_family_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO v_coach_id FROM users WHERE display_name = 'powlax_coach';
  SELECT id INTO v_player1_id FROM users WHERE display_name = 'Player 1';
  
  IF v_coach_id IS NOT NULL AND v_player1_id IS NOT NULL THEN
    -- Check if family already exists
    SELECT id INTO v_family_id 
    FROM family_accounts 
    WHERE primary_parent_id = v_coach_id;
    
    IF v_family_id IS NULL THEN
      -- Create family account
      INSERT INTO family_accounts (primary_parent_id, family_name, billing_parent_id)
      VALUES (v_coach_id, 'Johnson Family', v_coach_id)
      RETURNING id INTO v_family_id;
    END IF;
    
    -- Add Coach as primary parent (if not exists)
    INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
    VALUES (v_family_id, v_coach_id, 'primary_parent', '{"full_access": true}'::jsonb)
    ON CONFLICT (family_id, user_id) DO NOTHING;
    
    -- Add Player 1 as child (if not exists)
    INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
    VALUES (v_family_id, v_player1_id, 'child', '{"limited_access": true}'::jsonb)
    ON CONFLICT (family_id, user_id) DO NOTHING;
    
    -- Create parent-child relationship (if not exists)
    INSERT INTO parent_child_relationships (
      parent_id, 
      child_id, 
      relationship_type, 
      is_primary_guardian,
      permissions,
      notes
    )
    VALUES (
      v_coach_id, 
      v_player1_id, 
      'parent', 
      true,
      '{"view_progress": true, "manage_schedule": true, "billing": true}'::jsonb,
      'Coach''s son - plays on 8th Grade team'
    )
    ON CONFLICT (parent_id, child_id) DO UPDATE
    SET notes = 'Coach''s son - plays on 8th Grade team',
        is_primary_guardian = true;
  END IF;
END $$;

-- ==========================================
-- STEP 6: VERIFICATION QUERIES
-- ==========================================

-- Show club structure
SELECT 
  '📋 CLUB STRUCTURE' as section,
  c.name as "Club Name",
  COUNT(DISTINCT u.id) as "Total Members",
  COUNT(DISTINCT t.id) as "Teams"
FROM clubs c
LEFT JOIN users u ON u.club_id = c.id
LEFT JOIN teams t ON t.club_id = c.id
WHERE c.name = 'Your Club OS'
GROUP BY c.id, c.name;

-- Show teams with member counts
SELECT 
  '🏆 TEAMS STRUCTURE' as section,
  t.name as "Team",
  COUNT(DISTINCT tm.user_id) FILTER (WHERE tm.role = 'player') as "Players",
  COUNT(DISTINCT tm.user_id) FILTER (WHERE tm.role = 'head_coach') as "Coaches",
  COUNT(DISTINCT tm.user_id) FILTER (WHERE tm.role = 'parent') as "Parents/Admin"
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.name IN ('Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ')
GROUP BY t.id, t.name
ORDER BY 
  CASE 
    WHEN t.name = 'Your Varsity Team HQ' THEN 1
    WHEN t.name = 'Your JV Team HQ' THEN 2
    WHEN t.name = 'Your 8th Grade Team HQ' THEN 3
    ELSE 4
  END;

-- Show team rosters with real names
SELECT 
  '👥 TEAM ROSTERS' as section,
  t.name as "Team",
  u.display_name as "Display Name",
  u.first_name || ' ' || u.last_name as "Real Name",
  u.player_position as "Position",
  tm.role as "Role",
  u.graduation_year as "Grad Year"
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
WHERE t.name IN ('Your Varsity Team HQ', 'Your JV Team HQ', 'Your 8th Grade Team HQ')
ORDER BY t.name, tm.role, u.display_name;

-- Show family relationships
SELECT 
  '👨‍👧 FAMILY RELATIONSHIPS' as section,
  fa.family_name as "Family",
  u_parent.display_name as "Parent (Coach)",
  u_parent.first_name || ' ' || u_parent.last_name as "Parent Real Name",
  u_child.display_name as "Child",
  u_child.first_name || ' ' || u_child.last_name as "Child Real Name",
  pcr.notes as "Notes"
FROM family_accounts fa
JOIN family_members fm_parent ON fa.id = fm_parent.family_id AND fm_parent.role_in_family = 'primary_parent'
JOIN family_members fm_child ON fa.id = fm_child.family_id AND fm_child.role_in_family = 'child'
JOIN users u_parent ON fm_parent.user_id = u_parent.id
JOIN users u_child ON fm_child.user_id = u_child.id
LEFT JOIN parent_child_relationships pcr ON pcr.parent_id = u_parent.id AND pcr.child_id = u_child.id;

-- Show user summary
SELECT 
  '📊 USER SUMMARY' as section,
  COUNT(*) as "Total Users",
  COUNT(*) FILTER (WHERE role = 'director') as "Directors",
  COUNT(*) FILTER (WHERE role = 'coach') as "Coaches",
  COUNT(*) FILTER (WHERE role = 'player') as "Players",
  COUNT(*) FILTER (WHERE account_type = 'parent') as "Parents",
  COUNT(*) FILTER (WHERE account_type = 'child') as "Children",
  COUNT(*) FILTER (WHERE display_name IN ('powlax_patrick', 'powlax_coach', 'Player 1')) as "Real Accounts",
  COUNT(*) FILTER (WHERE display_name NOT IN ('powlax_patrick', 'powlax_coach', 'Player 1')) as "Test Accounts"
FROM users;

COMMIT;

-- ==========================================
-- MAPPING SUMMARY
-- ==========================================

/*
BUDDYBOSS GROUP TO POWLAX STRUCTURE MAPPING:

Database Tables:
----------------
- clubs (main club organization table)
- teams (team definitions)
- team_members (junction table for team membership)
- users (all users with roles and details)
- family_accounts (family groupings)
- family_members (family membership)
- parent_child_relationships (parent-child links)

Club Level (clubs table):
-------------------------
Your Club OS → ID: a22ad3ca-9f1c-4c4f-9163-021c6af927ac
- Director: powlax_patrick (Patrick Chapla)
- Contains all teams and members

Teams (teams table):
--------------------
Your Varsity Team HQ
- Players: asia-mills, cali-runolfsdottir (Class of 2025)
- Head Coach: powlax_coach (Mike Johnson)
- Admin: powlax_patrick

Your JV Team HQ
- Players: demario-kertzmann, jaida-grimes (Class of 2026)
- Head Coach: powlax_coach (Mike Johnson)
- Admin: powlax_patrick

Your 8th Grade Team HQ
- Players: Player 1 (Johnny Johnson - Coach's son), jordy-lynch, kailyn-russel, liza-hackett, oda-veum (Class of 2028)
- Head Coach: powlax_coach (Mike Johnson)
- Admin: powlax_patrick

Role Mapping:
-------------
BuddyBoss/LearnDash → POWLAX roles
- Group Organizer → director (powlax_patrick)
- Group Moderator → coach (powlax_coach)
- Group Member → player (all players)

Family Structure:
-----------------
Johnson Family:
- Parent: powlax_coach (Mike Johnson) - Team Coach
- Child: Player 1 (Johnny Johnson) - Plays on 8th Grade team
- Relationship: Father coaches son on team

Real vs Test Accounts:
----------------------
Real (3): powlax_patrick, powlax_coach, Player 1
Test (8): All other players for testing purposes
*/