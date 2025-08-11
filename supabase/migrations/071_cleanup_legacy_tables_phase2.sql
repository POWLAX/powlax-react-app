-- POWLAX Database Cleanup - Phase 2: Remove Legacy Organization/Team Structure
-- Created: 2025-01-16
-- Purpose: Remove old organization/team tables that were replaced by club_organizations/team_teams

BEGIN;

-- ==========================================
-- PHASE 2: REMOVE OLD ORGANIZATION/TEAM STRUCTURE
-- ==========================================
-- These tables were replaced by the club_organizations/team_teams structure

-- Check if legacy tables exist and remove them
DO $$
BEGIN
    -- Remove user_organization_roles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_organization_roles') THEN
        DROP TABLE user_organization_roles CASCADE;
        RAISE NOTICE 'Dropped user_organization_roles table';
    END IF;
    
    -- Remove user_team_roles if it exists (replaced by team_members)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_team_roles') THEN
        DROP TABLE user_team_roles CASCADE;
        RAISE NOTICE 'Dropped user_team_roles table';
    END IF;
    
    -- Remove legacy organizations table if it exists (replaced by club_organizations)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        -- Drop the table directly (views will cascade automatically)
        DROP TABLE organizations CASCADE;
        RAISE NOTICE 'Dropped legacy organizations table';
    END IF;
    
    -- Remove legacy teams table if it exists (replaced by team_teams)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
        -- Drop the table directly (views will cascade automatically)
        DROP TABLE teams CASCADE;
        RAISE NOTICE 'Dropped legacy teams table';
    END IF;
END$$;

-- ==========================================
-- VERIFY CURRENT STRUCTURE IS INTACT
-- ==========================================
-- Ensure the current working tables are still properly structured

-- Verify club_organizations exists and is properly structured
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'club_organizations') THEN
        RAISE EXCEPTION 'CRITICAL: club_organizations table missing! Cannot proceed with cleanup.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_teams') THEN
        RAISE EXCEPTION 'CRITICAL: team_teams table missing! Cannot proceed with cleanup.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
        RAISE EXCEPTION 'CRITICAL: team_members table missing! Cannot proceed with cleanup.';
    END IF;
    
    RAISE NOTICE 'Verified: Current organization/team structure is intact';
END$$;

-- Log cleanup actions (only if gamipress_sync_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamipress_sync_log') THEN
    INSERT INTO gamipress_sync_log (entity_type, wordpress_id, action_type, sync_data, synced_at)
    VALUES ('database_cleanup', 0, 'created', 
      '{"phase": "2", "action": "removed_legacy_org_team_tables", "verified_current_structure": true}',
      NOW());
    RAISE NOTICE 'Logged cleanup action to gamipress_sync_log';
  ELSE
    RAISE NOTICE 'gamipress_sync_log table does not exist - skipping log entry';
  END IF;
END$$;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Run these to verify the current structure is working:

-- Check current organization/team structure
-- SELECT 'club_organizations' as table_name, count(*) as record_count FROM club_organizations
-- UNION ALL
-- SELECT 'team_teams' as table_name, count(*) as record_count FROM team_teams  
-- UNION ALL
-- SELECT 'team_members' as table_name, count(*) as record_count FROM team_members;

-- Verify foreign key relationships are intact
-- SELECT 
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name IN ('team_teams', 'team_members', 'club_organizations')
-- ORDER BY tc.table_name, tc.constraint_name;
