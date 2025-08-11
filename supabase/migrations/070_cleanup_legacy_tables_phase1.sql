-- POWLAX Database Cleanup - Phase 1: Safe Legacy Table Removal
-- Created: 2025-01-16
-- Purpose: Remove staging tables and safe legacy tables with no dependencies

BEGIN;

-- ==========================================
-- PHASE 1: REMOVE STAGING TABLES (SAFEST)
-- ==========================================
-- These were only used for initial CSV imports and are no longer needed

DROP TABLE IF EXISTS staging_wp_drills CASCADE;
DROP TABLE IF EXISTS staging_wp_strategies CASCADE; 
DROP TABLE IF EXISTS staging_wp_skills CASCADE;
DROP TABLE IF EXISTS staging_wp_academy_drills CASCADE;
DROP TABLE IF EXISTS staging_wp_wall_ball CASCADE;
DROP TABLE IF EXISTS staging_drill_strategy_map CASCADE;

-- ==========================================
-- PHASE 1: REMOVE UNUSED LEGACY TABLES
-- ==========================================
-- These tables have been replaced by better implementations

-- Remove legacy drill/strategy tables (replaced by powlax_* tables)
DROP TABLE IF EXISTS drills CASCADE;
DROP TABLE IF EXISTS strategies_powlax CASCADE;

-- Remove unused completion/progress tables (replaced by skills_academy_user_progress)
DROP TABLE IF EXISTS powlax_workout_completions CASCADE;
DROP TABLE IF EXISTS powlax_drill_completions CASCADE;
DROP TABLE IF EXISTS powlax_user_favorite_workouts CASCADE;
DROP TABLE IF EXISTS workout_completions CASCADE;

-- Remove unused Skills Academy tables (replaced by skills_academy_* tables)
DROP TABLE IF EXISTS powlax_skills_academy_workouts CASCADE;
DROP TABLE IF EXISTS powlax_skills_academy_drills CASCADE;
DROP TABLE IF EXISTS powlax_skills_academy_questions CASCADE;
DROP TABLE IF EXISTS powlax_skills_academy_answers CASCADE;
DROP TABLE IF EXISTS skills_academy_workout_drills CASCADE; -- Empty table

-- Remove unused Wall Ball tables (replaced by powlax_wall_ball_collections)
DROP TABLE IF EXISTS powlax_wall_ball_drills CASCADE;
DROP TABLE IF EXISTS powlax_wall_ball_workouts CASCADE;
DROP TABLE IF EXISTS powlax_wall_ball_workout_drills CASCADE;
DROP TABLE IF EXISTS powlax_wall_ball_drill_library CASCADE;
DROP TABLE IF EXISTS wall_ball_workout_series CASCADE;
DROP TABLE IF EXISTS wall_ball_workout_variants CASCADE;

-- Remove unused gamification tables (not implemented in current system)
DROP TABLE IF EXISTS user_points_ledger CASCADE;
DROP TABLE IF EXISTS user_ranks CASCADE;
DROP TABLE IF EXISTS powlax_badges_catalog CASCADE;
DROP TABLE IF EXISTS powlax_ranks_catalog CASCADE;
DROP TABLE IF EXISTS powlax_gamipress_mappings CASCADE;
DROP TABLE IF EXISTS badges_powlax CASCADE;
DROP TABLE IF EXISTS powlax_player_ranks CASCADE;
DROP TABLE IF EXISTS user_points_balance_powlax CASCADE;

-- Remove unused system tables
DROP TABLE IF EXISTS webhook_processing_log CASCADE;
DROP TABLE IF EXISTS club_members CASCADE;
DROP TABLE IF EXISTS migration_log CASCADE;

-- Log cleanup actions (only if gamipress_sync_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamipress_sync_log') THEN
    INSERT INTO gamipress_sync_log (entity_type, wordpress_id, action_type, sync_data, synced_at)
    VALUES ('database_cleanup', 0, 'created', 
      '{"phase": "1", "action": "removed_legacy_tables", "tables_removed": 23}',
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
-- Run these to verify cleanup was successful:

-- Check remaining tables (should be ~25 tables)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
-- ORDER BY table_name;

-- Verify no broken foreign key references
-- SELECT * FROM information_schema.table_constraints 
-- WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
