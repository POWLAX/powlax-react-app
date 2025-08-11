-- ============================================
-- CLEANUP INCORRECT WALL BALL TABLE REFERENCES  
-- ============================================
-- Removes unused wall_ball_workout_series table only
-- KEEPS wall_ball_workout_variants - it's used for workout videos!
-- ============================================

-- ============================================
-- STEP 1: DROP UNUSED WALL BALL TABLES
-- ============================================

-- Remove only wall_ball_workout_series - not used by live site
-- KEEP wall_ball_workout_variants - contains workout videos for player!

DROP TABLE IF EXISTS wall_ball_workout_series CASCADE;

-- ============================================
-- STEP 2: VERIFY CLEANUP
-- ============================================

-- Check that the correct tables still exist and have data
SELECT 'wall_ball_drill_library' as table_name, COUNT(*) as record_count 
FROM wall_ball_drill_library
UNION ALL
SELECT 'wall_ball_workout_variants', COUNT(*) 
FROM wall_ball_workout_variants  
UNION ALL
SELECT 'skills_academy_series', COUNT(*) 
FROM skills_academy_series
UNION ALL  
SELECT 'skills_academy_workouts', COUNT(*)
FROM skills_academy_workouts;

-- Show wall ball series in Skills Academy structure
SELECT 
    id,
    series_name,
    series_type,
    series_code,
    description
FROM skills_academy_series 
WHERE series_type = 'wall_ball' OR series_name ILIKE '%wall%ball%'
ORDER BY display_order;
