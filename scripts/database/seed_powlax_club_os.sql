-- Seed: POWLAX Club OS + Team HQ + Role Assignments (BuddyBoss mapping)
-- Safe to run multiple times (idempotent via slug-based upserts)
-- Update placeholders below before running in Supabase SQL editor or psql

DO $$
DECLARE
  v_club_name TEXT := 'POWLAX Lacrosse Club';
  v_club_slug TEXT := 'powlax-lacrosse-club';
  v_club_wp_group_id INTEGER := 12345; -- TODO: set real BuddyBoss/WordPress group id

  v_team_name TEXT := 'POWLAX 14U Boys';
  v_team_slug TEXT := 'powlax-14u-boys';
  v_team_wp_group_id INTEGER := 22334; -- TODO: set real WP group id if different
  v_team_buddyboss_group_id INTEGER := 9988; -- TODO: set real BuddyBoss group id
  v_team_age_group TEXT := '14U';
  v_team_gender TEXT := 'boys';
  v_team_level TEXT := 'youth';

  v_admin_email TEXT := 'admin@powlax.local'; -- must exist in public.users

  club_id UUID;
  team_id UUID;
  admin_user_id UUID;
BEGIN
  -- Ensure admin user exists in public.users (created via CREATE_TEST_ADMIN.sql)
  SELECT id INTO admin_user_id FROM public.users WHERE email = v_admin_email LIMIT 1;
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in public.users; create it first (see CREATE_TEST_ADMIN.sql)', v_admin_email;
  END IF;

  -- Upsert Club OS organization
  INSERT INTO organizations (wp_group_id, name, slug, type)
  VALUES (v_club_wp_group_id, v_club_name, v_club_slug, 'club_os')
  ON CONFLICT (slug) DO UPDATE SET
    wp_group_id = EXCLUDED.wp_group_id,
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    updated_at = NOW();

  SELECT id INTO club_id FROM organizations WHERE slug = v_club_slug LIMIT 1;

  -- Upsert Team HQ under the club
  INSERT INTO teams (
    organization_id, wp_group_id, wp_buddyboss_group_id, name, slug, team_type, subscription_tier, age_group, gender, level
  ) VALUES (
    club_id, v_team_wp_group_id, v_team_buddyboss_group_id, v_team_name, v_team_slug, 'team_hq', 'structure', v_team_age_group, v_team_gender, v_team_level
  )
  ON CONFLICT (slug) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    wp_group_id = EXCLUDED.wp_group_id,
    wp_buddyboss_group_id = EXCLUDED.wp_buddyboss_group_id,
    name = EXCLUDED.name,
    team_type = EXCLUDED.team_type,
    subscription_tier = EXCLUDED.subscription_tier,
    age_group = EXCLUDED.age_group,
    gender = EXCLUDED.gender,
    level = EXCLUDED.level,
    updated_at = NOW();

  SELECT id INTO team_id FROM teams WHERE slug = v_team_slug LIMIT 1;

  -- Ensure org role: owner/admin for admin user
  INSERT INTO user_organization_roles (user_id, organization_id, role)
  VALUES (admin_user_id, club_id, 'owner')
  ON CONFLICT (user_id, organization_id) DO UPDATE SET
    role = EXCLUDED.role,
    wp_last_synced = NOW();

  -- Ensure team role: head_coach for admin user
  INSERT INTO user_team_roles (user_id, team_id, role)
  VALUES (admin_user_id, team_id, 'head_coach')
  ON CONFLICT (user_id, team_id, role) DO NOTHING;

  RAISE NOTICE 'Seeded org % (%), team % (%), assigned owner + head_coach to %', v_club_name, club_id, v_team_name, team_id, v_admin_email;
END$$;

-- Verify
SELECT id, name, slug, type, wp_group_id FROM organizations WHERE slug = 'powlax-lacrosse-club';
SELECT id, name, slug, wp_group_id, wp_buddyboss_group_id FROM teams WHERE slug = 'powlax-14u-boys';
SELECT * FROM user_organization_roles uor JOIN organizations o ON o.id = uor.organization_id WHERE o.slug = 'powlax-lacrosse-club';
SELECT * FROM user_team_roles utr JOIN teams t ON t.id = utr.team_id WHERE t.slug = 'powlax-14u-boys';


