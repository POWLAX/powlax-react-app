-- =====================================================================
-- SIMPLE DIAGNOSTIC: JUST SHOW WHAT EXISTS
-- =====================================================================
-- Run this FIRST to understand your current database state
-- =====================================================================

-- Show all gamification-related tables
SELECT '========== GAMIFICATION TABLES ==========' as section;
SELECT table_name as "Table Name", 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE c.table_name = t.table_name) as "Columns"
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%badge%' 
    OR table_name LIKE '%rank%' 
    OR table_name LIKE '%point%'
    OR table_name LIKE '%gamif%'
    OR table_name = 'user_badges'
    OR table_name = 'user_ranks'
)
ORDER BY table_name;

-- Show columns in powlax_player_ranks
SELECT '========== POWLAX_PLAYER_RANKS STRUCTURE ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type",
    is_nullable as "Nullable",
    column_default as "Default"
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show columns in any badges table
SELECT '========== BADGES TABLE STRUCTURE ==========' as section;
SELECT 
    table_name as "Table",
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE '%badge%'
ORDER BY table_name, ordinal_position;

-- Show columns in powlax_points_currencies
SELECT '========== POINTS CURRENCIES STRUCTURE ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_name = 'powlax_points_currencies'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what's in powlax_ranks_catalog
SELECT '========== POWLAX_RANKS_CATALOG STRUCTURE ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_name = 'powlax_ranks_catalog'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what's in powlax_badges_catalog  
SELECT '========== POWLAX_BADGES_CATALOG STRUCTURE ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_name = 'powlax_badges_catalog'
AND table_schema = 'public'
ORDER BY ordinal_position;