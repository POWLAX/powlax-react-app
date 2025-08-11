-- POWLAX Fix User Accounts and Set Up Organization Structure
-- Created: 2025-01-16
-- Purpose: Fix user classifications, set up family relationships, and map BuddyBoss groups to club/team structure

BEGIN;

-- ==========================================
-- STEP 1: FIX USER ACCOUNT CLASSIFICATIONS
-- ==========================================

-- First, update the real accounts with correct emails and details
UPDATE users
SET 
  -- Fix names for real accounts
  first_name = CASE
    WHEN display_name = 'Player 1' THEN 'Johnny'
    WHEN display_name = 'powlax_patrick' THEN 'Patrick'
    WHEN display_name = 'powlax_coach' THEN 'Mike'
    ELSE first_name
  END,
  last_name = CASE
    WHEN display_name = 'Player 1' THEN 'Johnson'
    WHEN display_name = 'powlax_patrick' THEN 'Chapla'
    WHEN display_name = 'powlax_coach' THEN 'Johnson'
    ELSE last_name
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
    WHEN display_name = 'Player 1' THEN 'player'          -- Player
    ELSE 'player'  -- All others are test players
  END,
  -- Update roles array
  roles = CASE
    WHEN display_name = 'powlax_patrick' THEN ARRAY['director', 'admin', 'coach']::text[]
    WHEN display_name = 'powlax_coach' THEN ARRAY['coach', 'parent']::text[]
    WHEN display_name = 'Player 1' THEN ARRAY['player']::text[]
    ELSE ARRAY['player']::text[]
  END,
  -- Set age groups
  age_group = CASE
    WHEN display_name = 'Player 1' THEN 'youth_11_13'  -- 8th grade
    WHEN display_name IN ('powlax_patrick', 'powlax_coach') THEN 'adult'
    WHEN display_name IN ('asia-mills', 'cali-runolfsdottir') THEN 'youth_14_18'  -- Varsity
    WHEN display_name IN ('demario-kertzmann', 'jaida-grimes') THEN 'youth_14_18'  -- JV
    WHEN display_name IN ('jordy-lynch', 'kailyn-russel', 'liza-hackett', 'oda-veum') THEN 'youth_11_13'  -- 8th Grade
    ELSE 'unknown'
  END,
  -- Player positions
  player_position = CASE
    WHEN display_name = 'Player 1' THEN 'Attack'
    WHEN display_name IN ('asia-mills', 'demario-kertzmann', 'jordy-lynch') THEN 'Attack'
    WHEN display_name IN ('cali-runolfsdottir', 'jaida-grimes', 'kailyn-russel') THEN 'Midfield'
    WHEN display_name IN ('liza-hackett', 'oda-veum') THEN 'Defense'
    ELSE NULL
  END,
  -- Graduation years based on teams
  graduation_year = CASE
    WHEN display_name IN ('asia-mills', 'cali-runolfsdottir') THEN 2025  -- Varsity
    WHEN display_name IN ('demario-kertzmann', 'jaida-grimes') THEN 2026  -- JV
    WHEN display_name IN ('Player 1', 'jordy-lynch', 'kailyn-russel', 'liza-hackett', 'oda-veum') THEN 2028  -- 8th Grade
    ELSE NULL
  END;

-- ==========================================
-- STEP 2: CREATE ORGANIZATION STRUCTURE
-- ==========================================

-- First, ensure the organizations table exists (if not already)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('club', 'school', 'league', 'program')),
  buddyboss_group_id TEXT,
  director_id UUID REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the main club organization
INSERT INTO organizations (name, type, buddyboss_group_id, director_id, settings)
SELECT 
  'Your Club OS',
  'club',
  'your-club-os',
  id,
  jsonb_build_object(
    'description', 'Main lacrosse club organization',
    'established', '2024',
    'location', 'Your City, State',
    'levels', ARRAY['Varsity', 'JV', '8th Grade']
  )
FROM users WHERE display_name = 'powlax_patrick'
ON CONFLICT DO NOTHING;

-- ==========================================
-- STEP 3: CREATE/UPDATE TEAMS TABLE
-- ==========================================

-- Ensure teams table has all necessary columns
ALTER TABLE teams ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS buddyboss_group_id TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS head_coach_id UUID REFERENCES users(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Get the organization ID
DO $$
DECLARE
  v_org_id UUID;
  v_coach_id UUID;
  v_varsity_team_id UUID;
  v_jv_team_id UUID;
  v_eighth_team_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO v_org_id FROM organizations WHERE name = 'Your Club OS';
  SELECT id INTO v_coach_id FROM users WHERE display_name = 'powlax_coach';
  
  -- Create Varsity Team
  INSERT INTO teams (name, organization_id, level, buddyboss_group_id, head_coach_id, season, settings)
  VALUES (
    'Your Varsity Team HQ',
    v_org_id,
    'Varsity',
    'your-varsity-team-hq',
    v_coach_id,
    '2025',
    jsonb_build_object(
      'grade_levels', ARRAY['11', '12'],
      'practice_days', ARRAY['Monday', 'Wednesday', 'Friday'],
      'home_field', 'Main Stadium'
    )
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_varsity_team_id;
  
  -- Create JV Team
  INSERT INTO teams (name, organization_id, level, buddyboss_group_id, head_coach_id, season, settings)
  VALUES (
    'Your JV Team HQ',
    v_org_id,
    'JV',
    'your-jv-team-hq',
    v_coach_id,
    '2025',
    jsonb_build_object(
      'grade_levels', ARRAY['9', '10'],
      'practice_days', ARRAY['Tuesday', 'Thursday'],
      'home_field', 'Practice Field A'
    )
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_jv_team_id;
  
  -- Create 8th Grade Team
  INSERT INTO teams (name, organization_id, level, buddyboss_group_id, head_coach_id, season, settings)
  VALUES (
    'Your 8th Grade Team HQ',
    v_org_id,
    '8th Grade',
    'your-8th-grade-team-hq',
    v_coach_id,
    '2025',
    jsonb_build_object(
      'grade_levels', ARRAY['8'],
      'practice_days', ARRAY['Monday', 'Wednesday'],
      'home_field', 'Practice Field B'
    )
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_eighth_team_id;
  
  -- Store team IDs for member assignment
  PERFORM set_config('app.varsity_team_id', v_varsity_team_id::text, false);
  PERFORM set_config('app.jv_team_id', v_jv_team_id::text, false);
  PERFORM set_config('app.eighth_team_id', v_eighth_team_id::text, false);
END $$;

-- ==========================================
-- STEP 4: ASSIGN PLAYERS TO TEAMS
-- ==========================================

-- Create team_members entries for players
INSERT INTO team_members (team_id, user_id, role, jersey_number, created_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'player' as role,
  ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY u.display_name)::text as jersey_number,
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
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Add coach to all teams
INSERT INTO team_members (team_id, user_id, role, created_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'coach' as role,
  NOW() as created_at
FROM users u
CROSS JOIN teams t
WHERE u.display_name = 'powlax_coach'
ON CONFLICT (team_id, user_id) DO UPDATE SET role = 'coach';

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
    -- Create family account
    INSERT INTO family_accounts (primary_parent_id, family_name, billing_parent_id)
    VALUES (v_coach_id, 'Johnson Family', v_coach_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_family_id;
    
    IF v_family_id IS NOT NULL THEN
      -- Add Coach as primary parent
      INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
      VALUES (v_family_id, v_coach_id, 'primary_parent', '{"full_access": true}'::jsonb)
      ON CONFLICT DO NOTHING;
      
      -- Add Player 1 as child
      INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
      VALUES (v_family_id, v_player1_id, 'child', '{"limited_access": true}'::jsonb)
      ON CONFLICT DO NOTHING;
      
      -- Create parent-child relationship
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
      ON CONFLICT (parent_id, child_id) DO NOTHING;
    END IF;
  END IF;
END $$;

-- ==========================================
-- STEP 6: UPDATE CLUB_ID FOR ORGANIZATION
-- ==========================================

-- Update all users to belong to the club
UPDATE users u
SET club_id = o.id
FROM organizations o
WHERE o.name = 'Your Club OS';

-- ==========================================
-- STEP 7: VERIFICATION QUERIES
-- ==========================================

-- Show organization structure
SELECT 
  '📋 ORGANIZATION STRUCTURE' as section,
  o.name as "Club Name",
  u.display_name as "Director",
  o.type as "Type"
FROM organizations o
LEFT JOIN users u ON o.director_id = u.id;

-- Show teams structure
SELECT 
  '🏆 TEAMS STRUCTURE' as section,
  t.name as "Team",
  t.level as "Level",
  u.display_name as "Head Coach",
  COUNT(DISTINCT tm.user_id) FILTER (WHERE tm.role = 'player') as "Players"
FROM teams t
LEFT JOIN users u ON t.head_coach_id = u.id
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name, t.level, u.display_name
ORDER BY 
  CASE t.level
    WHEN 'Varsity' THEN 1
    WHEN 'JV' THEN 2
    WHEN '8th Grade' THEN 3
    ELSE 4
  END;

-- Show team rosters
SELECT 
  '👥 TEAM ROSTERS' as section,
  t.name as "Team",
  u.display_name as "Player",
  u.first_name || ' ' || u.last_name as "Real Name",
  u.player_position as "Position",
  tm.jersey_number as "Jersey #",
  u.graduation_year as "Grad Year"
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
WHERE tm.role = 'player'
ORDER BY t.name, CAST(tm.jersey_number AS INTEGER);

-- Show family relationships
SELECT 
  '👨‍👧 FAMILY RELATIONSHIPS' as section,
  fa.family_name as "Family",
  u_parent.display_name as "Parent",
  u_child.display_name as "Child",
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
  COUNT(*) FILTER (WHERE account_type = 'child') as "Children"
FROM users;

COMMIT;

-- ==========================================
-- MAPPING SUMMARY
-- ==========================================

/*
BUDDYBOSS GROUP TO POWLAX STRUCTURE MAPPING:

Organization Level:
-------------------
Your Club OS (BuddyBoss Group) → organizations table
- Type: 'club'
- Director: powlax_patrick
- Contains all teams

Team Level:
-----------
Your Varsity Team HQ (BuddyBoss Group) → teams table
- Level: 'Varsity'
- Players: asia-mills, cali-runolfsdottir
- Coach: powlax_coach

Your JV Team HQ (BuddyBoss Group) → teams table
- Level: 'JV'
- Players: demario-kertzmann, jaida-grimes
- Coach: powlax_coach

Your 8th Grade Team HQ (BuddyBoss Group) → teams table
- Level: '8th Grade'
- Players: Player 1 (Johnny Johnson), jordy-lynch, kailyn-russel, liza-hackett, oda-veum
- Coach: powlax_coach (Mike Johnson - also Player 1's father)

Role Mapping:
-------------
BuddyBoss/LearnDash → POWLAX Roles
- Group Organizer → director (powlax_patrick)
- Group Moderator → coach (powlax_coach)
- Group Member → player (all players)

Family Structure:
-----------------
Johnson Family:
- Parent: powlax_coach (Mike Johnson)
- Child: Player 1 (Johnny Johnson)
- Relationship: Father coaches son on 8th Grade team
*/