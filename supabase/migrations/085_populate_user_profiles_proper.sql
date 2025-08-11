-- POWLAX User Profile Population with Proper Name Handling
-- Created: 2025-01-16
-- Purpose: Set up user profiles with display names for public and real names for internal use

BEGIN;

-- ==========================================
-- STEP 1: VIEW CURRENT USER DATA
-- ==========================================

SELECT 
  id,
  email,
  display_name,
  role,
  wordpress_id,
  auth_user_id,
  CASE 
    WHEN email IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com') THEN 'REAL'
    WHEN email = 'wpps-support@example.com' THEN 'REMOVE'
    ELSE 'TEST'
  END as account_status
FROM users
ORDER BY created_at;

-- ==========================================
-- STEP 2: POPULATE USER PROFILES
-- ==========================================

-- Set default values for test accounts
UPDATE users
SET 
  -- Keep display_name as-is for public leaderboards/gaming
  -- Set first_name and last_name for internal/coach viewing
  first_name = CASE
    WHEN email = 'player1@example.com' THEN 'Player'
    WHEN email = 'powlax.patrick@gmail.com' THEN 'Patrick'
    WHEN email = 'powlax.coach@gmail.com' THEN 'Coach'
    WHEN display_name LIKE '%Test%' THEN 'Test'
    WHEN display_name LIKE '%Player%' THEN 'Test'
    WHEN display_name LIKE '%Coach%' THEN 'Test'
    ELSE 'Test'
  END,
  last_name = CASE
    WHEN email = 'player1@example.com' THEN 'One'
    WHEN email = 'powlax.patrick@gmail.com' THEN 'Chapla'
    WHEN email = 'powlax.coach@gmail.com' THEN 'Smith'
    WHEN display_name LIKE '%Test%' THEN 'User'
    WHEN display_name LIKE '%Player%' THEN 'Player'
    WHEN display_name LIKE '%Coach%' THEN 'Coach'
    ELSE 'Account'
  END,
  -- Account types
  account_type = CASE
    WHEN email = 'powlax.patrick@gmail.com' THEN 'family_admin'
    WHEN email = 'powlax.coach@gmail.com' THEN 'individual'
    WHEN email = 'player1@example.com' THEN 'child'
    ELSE 'individual'
  END,
  -- Age groups (set youth for test players, adult for coaches)
  age_group = CASE
    WHEN display_name LIKE '%Player%' THEN 'youth_11_13'
    WHEN display_name LIKE '%Coach%' THEN 'adult'
    WHEN email = 'player1@example.com' THEN 'youth_11_13'
    WHEN email IN ('powlax.patrick@gmail.com', 'powlax.coach@gmail.com') THEN 'adult'
    ELSE 'unknown'
  END,
  -- Player positions for test accounts
  player_position = CASE
    WHEN display_name LIKE '%Player%' OR email = 'player1@example.com' THEN 'Attack'
    WHEN display_name LIKE '%Coach%' THEN NULL
    ELSE NULL
  END,
  -- Graduation years for youth players
  graduation_year = CASE
    WHEN display_name LIKE '%Player%' OR email = 'player1@example.com' THEN 2028
    ELSE NULL
  END,
  -- Privacy settings - real accounts more private, test accounts open
  privacy_settings = CASE
    WHEN email IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com') 
      THEN '{"profile_visible": false, "stats_visible": false, "use_display_name": true}'::jsonb
    ELSE '{"profile_visible": true, "stats_visible": true, "use_display_name": true}'::jsonb
  END,
  -- Notification preferences - only real accounts get notifications
  notification_preferences = CASE
    WHEN email IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com')
      THEN '{"email": true, "push": true, "sms": false}'::jsonb
    ELSE '{"email": false, "push": false, "sms": false}'::jsonb
  END
WHERE email != 'wpps-support@example.com';  -- Don't update the account we're removing

-- ==========================================
-- STEP 3: REMOVE WPPS-SUPPORT ADMIN ACCESS
-- ==========================================

-- Update role to remove admin access
UPDATE users
SET 
  role = 'disabled',
  roles = '["disabled"]'::jsonb,
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{disabled_reason}',
    '"WordPress support account - no longer needed"'
  )
WHERE email = 'wpps-support@example.com';

-- ==========================================
-- STEP 4: CREATE SAMPLE FAMILY RELATIONSHIP
-- ==========================================

-- Create a family account for Patrick as the parent of Player 1
DO $$
DECLARE
  v_patrick_id UUID;
  v_player1_id UUID;
  v_family_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO v_patrick_id FROM users WHERE email = 'powlax.patrick@gmail.com';
  SELECT id INTO v_player1_id FROM users WHERE email = 'player1@example.com';
  
  IF v_patrick_id IS NOT NULL AND v_player1_id IS NOT NULL THEN
    -- Create family account
    INSERT INTO family_accounts (primary_parent_id, family_name, billing_parent_id)
    VALUES (v_patrick_id, 'Chapla Family', v_patrick_id)
    RETURNING id INTO v_family_id;
    
    -- Add Patrick as primary parent
    INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
    VALUES (v_family_id, v_patrick_id, 'primary_parent', '{"full_access": true}'::jsonb);
    
    -- Add Player 1 as child
    INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
    VALUES (v_family_id, v_player1_id, 'child', '{"limited_access": true}'::jsonb);
    
    -- Create parent-child relationship
    INSERT INTO parent_child_relationships (
      parent_id, 
      child_id, 
      relationship_type, 
      is_primary_guardian,
      permissions
    )
    VALUES (
      v_patrick_id, 
      v_player1_id, 
      'parent', 
      true,
      '{"view_progress": true, "manage_schedule": true, "billing": true}'::jsonb
    );
    
    RAISE NOTICE 'Created family account for Patrick and Player 1';
  END IF;
END $$;

-- ==========================================
-- STEP 5: DISPLAY NAME VS REAL NAME SETUP
-- ==========================================

-- Add a column to track name display preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS name_display_settings JSONB DEFAULT '{
  "public_display": "display_name",
  "coach_view": "real_name",
  "team_roster": "real_name",
  "leaderboard": "display_name",
  "gamification": "display_name"
}'::jsonb;

-- Update display settings for all users
UPDATE users
SET name_display_settings = jsonb_build_object(
  'public_display', 'display_name',      -- Always use display_name publicly
  'coach_view', 'real_name',              -- Coaches see real names
  'team_roster', 'real_name',             -- Team rosters show real names
  'leaderboard', 'display_name',          -- Leaderboards use display names
  'gamification', 'display_name',         -- Gaming/badges use display names
  'allow_display_name_change', true,      -- Users can change display names
  'display_name_history', json_build_array(
    json_build_object(
      'name', display_name,
      'changed_at', NOW()
    )
  )
);

-- ==========================================
-- STEP 6: VERIFICATION QUERIES
-- ==========================================

-- Show updated user profiles
SELECT 
  email,
  display_name as "Public Name (Gaming/Leaderboards)",
  first_name || ' ' || last_name as "Real Name (Coaches See)",
  account_type,
  age_group,
  player_position,
  role,
  CASE 
    WHEN email IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com') THEN '✅ REAL'
    WHEN email = 'wpps-support@example.com' THEN '🚫 DISABLED'
    ELSE '🧪 TEST'
  END as status
FROM users
ORDER BY 
  CASE 
    WHEN email IN ('powlax.patrick@gmail.com', 'powlax.coach@gmail.com') THEN 1
    WHEN email = 'player1@example.com' THEN 2
    WHEN email = 'wpps-support@example.com' THEN 99
    ELSE 3
  END;

-- Show family relationships
SELECT 
  'Family Setup:' as info,
  fa.family_name,
  u_parent.display_name as parent,
  u_child.display_name as child
FROM family_accounts fa
LEFT JOIN family_members fm_parent ON fa.id = fm_parent.family_id AND fm_parent.role_in_family = 'primary_parent'
LEFT JOIN family_members fm_child ON fa.id = fm_child.family_id AND fm_child.role_in_family = 'child'
LEFT JOIN users u_parent ON fm_parent.user_id = u_parent.id
LEFT JOIN users u_child ON fm_child.user_id = u_child.id;

-- Summary statistics
SELECT 
  'Profile Setup Complete!' as status,
  COUNT(*) FILTER (WHERE account_type = 'family_admin') as family_admins,
  COUNT(*) FILTER (WHERE account_type = 'child') as children,
  COUNT(*) FILTER (WHERE account_type = 'individual') as individuals,
  COUNT(*) FILTER (WHERE role = 'disabled') as disabled_accounts,
  COUNT(*) FILTER (WHERE email IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com')) as real_accounts,
  COUNT(*) FILTER (WHERE email NOT IN ('player1@example.com', 'powlax.patrick@gmail.com', 'powlax.coach@gmail.com', 'wpps-support@example.com')) as test_accounts
FROM users;

COMMIT;

-- ==========================================
-- USAGE NOTES FOR DEVELOPERS
-- ==========================================

/*
DISPLAY NAME VS REAL NAME USAGE:

Frontend Implementation:
------------------------
// For public leaderboards and gamification:
const displayName = user.display_name;  // "GamerTag123"

// For coach viewing player roster:
const playerName = `${user.first_name} ${user.last_name}`;  // "John Smith"

// Check context for which name to show:
const getDisplayName = (user, context) => {
  switch(context) {
    case 'leaderboard':
    case 'gamification':
    case 'public':
      return user.display_name;
    case 'coach_view':
    case 'team_roster':
    case 'practice_plan':
      return `${user.first_name} ${user.last_name}`;
    default:
      return user.display_name;
  }
};

Database Views:
---------------
Consider creating views for different contexts:

CREATE VIEW public_player_stats AS
SELECT 
  user_id,
  display_name,  -- Public name only
  points,
  badges
FROM users 
JOIN points_ledger ON users.id = points_ledger.user_id;

CREATE VIEW coach_player_roster AS
SELECT 
  user_id,
  first_name,
  last_name,
  display_name,
  age_group,
  player_position
FROM users
WHERE account_type IN ('child', 'individual');

REAL vs TEST Accounts:
----------------------
Real Accounts (3):
- powlax.patrick@gmail.com (Patrick Chapla - Admin/Parent)
- powlax.coach@gmail.com (Coach Smith)
- player1@example.com (Player One - Child of Patrick)

Test Accounts (8):
- All other accounts are for testing
- Have notifications disabled
- Can be deleted when going to production

Disabled Account (1):
- wpps-support@example.com (WordPress support - no longer needed)
*/