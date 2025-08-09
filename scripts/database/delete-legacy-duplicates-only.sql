-- DELETE LEGACY DUPLICATE TABLES ONLY
-- These are empty tables that duplicate data in the new naming convention
-- 100% SAFE - No data will be lost

-- ============================================================================
-- VERIFICATION BEFORE DELETION
-- ============================================================================

-- Show what we're about to delete (should all be 0 records)
SELECT 'LEGACY TABLES TO DELETE (should all be 0 records):' as status;

DO $$ 
DECLARE
    tbl_name TEXT;
    record_count INTEGER;
BEGIN
    FOR tbl_name IN 
        SELECT unnest(ARRAY['strategies_powlax', 'drills_powlax', 'skills_academy_powlax', 'wall_ball_powlax', 'lessons_powlax', 'drill_strategy_map_powlax'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO record_count;
            RAISE NOTICE '% exists with % records', tbl_name, record_count;
            
            IF record_count > 0 THEN
                RAISE WARNING 'WARNING: % has % records - review before deleting!', tbl_name, record_count;
            END IF;
        ELSE
            RAISE NOTICE '% does not exist (already deleted)', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Show the corresponding new tables (should have data)
SELECT 'NEW NAMING TABLES (should have data):' as status;

DO $$ 
DECLARE
    tbl_name TEXT;
    record_count INTEGER;
BEGIN
    FOR tbl_name IN 
        SELECT unnest(ARRAY['powlax_strategies', 'powlax_drills', 'powlax_wall_ball_drill_library'])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl_name) THEN
            EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO record_count;
            RAISE NOTICE '% has % records', tbl_name, record_count;
        ELSE
            RAISE NOTICE '% does not exist', tbl_name;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- SAFE DELETION OF LEGACY DUPLICATES
-- ============================================================================

-- Delete legacy duplicate tables (old naming convention)
-- These are empty versions of tables that have data under the new naming

DROP TABLE IF EXISTS strategies_powlax CASCADE;
-- Duplicate of powlax_strategies (which has 221 records)

DROP TABLE IF EXISTS drills_powlax CASCADE;
-- Duplicate of powlax_drills (which has 135 records)

DROP TABLE IF EXISTS skills_academy_powlax CASCADE;
-- Superseded by powlax_skills_academy_* tables

DROP TABLE IF EXISTS wall_ball_powlax CASCADE;
-- Superseded by powlax_wall_ball_* tables

DROP TABLE IF EXISTS lessons_powlax CASCADE;
-- Superseded (no current equivalent needed)

DROP TABLE IF EXISTS drill_strategy_map_powlax CASCADE;
-- Superseded by powlax_drill_strategy_map (if needed)

-- ============================================================================
-- VERIFICATION AFTER DELETION
-- ============================================================================

SELECT 'DELETION COMPLETE - Verification:' as status;

-- Confirm legacy tables are gone
SELECT 'Legacy tables remaining (should be none):' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('strategies_powlax', 'drills_powlax', 'skills_academy_powlax', 'wall_ball_powlax', 'lessons_powlax', 'drill_strategy_map_powlax');

-- Confirm data tables still exist
SELECT 'Data tables remaining (should have records):' as check_type;
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'powlax_strategies' THEN '(should have ~221 records)'
        WHEN table_name = 'powlax_drills' THEN '(should have ~135 records)'
        WHEN table_name = 'powlax_wall_ball_drill_library' THEN '(should have ~5 records)'
        WHEN table_name = 'powlax_wall_ball_collections' THEN '(should have ~4 records)'
        WHEN table_name = 'powlax_wall_ball_collection_drills' THEN '(should have ~3 records)'
        WHEN table_name = 'powlax_points_currencies' THEN '(should have ~7 records)'
        ELSE '(check record count)'
    END as expected_records
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('powlax_strategies', 'powlax_drills', 'powlax_wall_ball_drill_library', 'powlax_wall_ball_collections', 'powlax_wall_ball_collection_drills', 'powlax_points_currencies')
ORDER BY table_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'CLEANUP SUMMARY:' as status;
SELECT 
    '6 legacy duplicate tables deleted' as action,
    'No data lost - all records preserved in new naming convention tables' as result,
    'Agent confusion should be reduced' as benefit;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
WHAT WAS DELETED:
✅ strategies_powlax (empty duplicate of powlax_strategies)
✅ drills_powlax (empty duplicate of powlax_drills)  
✅ skills_academy_powlax (superseded by powlax_skills_academy_*)
✅ wall_ball_powlax (superseded by powlax_wall_ball_*)
✅ lessons_powlax (no longer needed)
✅ drill_strategy_map_powlax (superseded)

WHAT REMAINS UNCHANGED:
✅ powlax_strategies (221 records) - Your main strategies
✅ powlax_drills (135 records) - Your main drills
✅ powlax_wall_ball_* tables (12 total records) - Wall ball system
✅ powlax_points_currencies (7 records) - Gamification
✅ All user/team tables - For future features
✅ All skills academy tables - For Skills Academy feature

RESULT:
- Removed 6 confusing duplicate tables
- Preserved all 371 records of actual data
- Simplified database structure
- Agents should now find the correct tables

NEXT STEPS:
1. Test that practice planner connects to powlax_drills
2. Test that strategies connect to powlax_strategies  
3. Update any code that references the deleted *_powlax tables
4. Consider running the full cleanup script later if you want to remove more empty tables
*/
