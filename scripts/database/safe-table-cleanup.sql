-- POWLAX Safe Table Cleanup Script
-- Run this in Supabase SQL Editor AFTER running check-table-dependencies.sql
-- IMPORTANT: Run each section separately and verify results before proceeding

-- ============================================================================
-- PHASE 1: CRITICAL NAMING FIX (Run this first)
-- ============================================================================

-- Check if tables exist before renaming
DO $$ 
BEGIN
    -- Only rename if source exists and target doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drills_powlax' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'powlax_drills' AND table_schema = 'public') THEN
        ALTER TABLE drills_powlax RENAME TO powlax_drills;
        RAISE NOTICE 'Renamed drills_powlax to powlax_drills';
    ELSE
        RAISE NOTICE 'Skipping drills_powlax rename - source missing or target exists';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategies_powlax' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'powlax_strategies' AND table_schema = 'public') THEN
        ALTER TABLE strategies_powlax RENAME TO powlax_strategies;
        RAISE NOTICE 'Renamed strategies_powlax to powlax_strategies';
    ELSE
        RAISE NOTICE 'Skipping strategies_powlax rename - source missing or target exists';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wall_ball_powlax' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'powlax_wall_ball' AND table_schema = 'public') THEN
        ALTER TABLE wall_ball_powlax RENAME TO powlax_wall_ball;
        RAISE NOTICE 'Renamed wall_ball_powlax to powlax_wall_ball';
    ELSE
        RAISE NOTICE 'Skipping wall_ball_powlax rename - source missing or target exists';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons_powlax' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'powlax_lessons' AND table_schema = 'public') THEN
        ALTER TABLE lessons_powlax RENAME TO powlax_lessons;
        RAISE NOTICE 'Renamed lessons_powlax to powlax_lessons';
    ELSE
        RAISE NOTICE 'Skipping lessons_powlax rename - source missing or target exists';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drill_strategy_map_powlax' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'powlax_drill_strategy_map' AND table_schema = 'public') THEN
        ALTER TABLE drill_strategy_map_powlax RENAME TO powlax_drill_strategy_map;
        RAISE NOTICE 'Renamed drill_strategy_map_powlax to powlax_drill_strategy_map';
    ELSE
        RAISE NOTICE 'Skipping drill_strategy_map_powlax rename - source missing or target exists';
    END IF;
END $$;

-- ============================================================================
-- PHASE 2: SAFE DELETION OF EMPTY TABLES (Check dependencies first!)
-- ============================================================================

-- IMPORTANT: Only run this after verifying these tables are empty and unused
-- Check with: SELECT COUNT(*) FROM table_name; for each table below

-- Drop empty superseded tables (ONLY if they have 0 records)
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    -- Check and drop skills_academy_powlax if empty
    SELECT COUNT(*) INTO table_count FROM skills_academy_powlax;
    IF table_count = 0 THEN
        DROP TABLE IF EXISTS skills_academy_powlax CASCADE;
        RAISE NOTICE 'Dropped empty table: skills_academy_powlax';
    ELSE
        RAISE NOTICE 'Skipping skills_academy_powlax - has % records', table_count;
    END IF;

    -- Note: wall_ball_powlax and lessons_powlax already renamed above
    -- They will be empty under their new names if they were empty before

EXCEPTION 
    WHEN undefined_table THEN
        RAISE NOTICE 'Some tables already do not exist - continuing...';
END $$;

-- ============================================================================
-- PHASE 3: STAGING TABLE CLEANUP (Only after import is complete)
-- ============================================================================

-- DANGER: Only run this if you're sure WordPress import is complete
-- Uncomment and run only when ready:

/*
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    -- Check staging tables before dropping
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staging_wp_drills') THEN
        SELECT COUNT(*) INTO table_count FROM staging_wp_drills;
        RAISE NOTICE 'staging_wp_drills has % records', table_count;
        -- Uncomment next line when ready to drop:
        -- DROP TABLE staging_wp_drills CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staging_wp_strategies') THEN
        SELECT COUNT(*) INTO table_count FROM staging_wp_strategies;
        RAISE NOTICE 'staging_wp_strategies has % records', table_count;
        -- Uncomment next line when ready to drop:
        -- DROP TABLE staging_wp_strategies CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staging_wp_academy_drills') THEN
        SELECT COUNT(*) INTO table_count FROM staging_wp_academy_drills;
        RAISE NOTICE 'staging_wp_academy_drills has % records', table_count;
        -- Uncomment next line when ready to drop:
        -- DROP TABLE staging_wp_academy_drills CASCADE;
    END IF;
END $$;
*/

-- ============================================================================
-- PHASE 4: VERIFICATION QUERIES
-- ============================================================================

-- Verify the renames worked
SELECT 'RENAMED TABLES' as status, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('powlax_drills', 'powlax_strategies', 'powlax_wall_ball', 'powlax_lessons', 'powlax_drill_strategy_map')
ORDER BY table_name;

-- Check for any remaining old-named tables
SELECT 'OLD TABLES REMAINING' as status, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('drills_powlax', 'strategies_powlax', 'wall_ball_powlax', 'lessons_powlax', 'drill_strategy_map_powlax')
ORDER BY table_name;

-- Final table count check
SELECT 
    'FINAL STATUS' as status,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_name LIKE '%powlax%' THEN 1 END) as powlax_tables,
    COUNT(CASE WHEN table_name LIKE '%skills_academy%' THEN 1 END) as skills_academy_tables,
    COUNT(CASE WHEN table_name LIKE '%wall_ball%' THEN 1 END) as wall_ball_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- ============================================================================
-- NOTES FOR MANUAL VERIFICATION
-- ============================================================================

/*
BEFORE RUNNING THIS SCRIPT:
1. Run check-table-dependencies.sql first
2. Backup your database
3. Verify which tables are empty: SELECT COUNT(*) FROM table_name;
4. Check that no critical data will be lost

AFTER RUNNING THIS SCRIPT:
1. Test that practice planner hooks now connect to real data
2. Verify Skills Academy components work
3. Check that all foreign key relationships are intact
4. Run your application tests

TABLES THAT SHOULD NEVER BE DELETED:
- users (auth.users references)
- organizations/club_organizations
- teams/team_teams  
- team_members
- user_points_wallets
- user_badges
- user_ranks
- powlax_points_currencies
- Any table with data that you need

SAFE TO DELETE (if empty):
- staging_* tables (after import complete)
- superseded table versions
- test/sample data tables
*/
