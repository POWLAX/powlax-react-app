-- =====================================================================
-- SIMPLE DIAGNOSTIC: SHOW CURRENT DATABASE STATE
-- =====================================================================
-- Safe to run - only reads information, makes no changes
-- =====================================================================

-- 1. Show all gamification-related tables
SELECT '========== GAMIFICATION TABLES ==========' as section;
SELECT table_name as "Table Name"
FROM information_schema.tables
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

-- 2. Show columns in powlax_player_ranks (if it exists)
SELECT '========== POWLAX_PLAYER_RANKS COLUMNS ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Show columns in powlax_ranks_catalog (alternative table)
SELECT '========== POWLAX_RANKS_CATALOG COLUMNS ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type",
    is_nullable as "Nullable"
FROM information_schema.columns
WHERE table_name = 'powlax_ranks_catalog'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Show any badges tables
SELECT '========== ALL BADGES TABLES ==========' as section;
SELECT DISTINCT table_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE '%badge%'
ORDER BY table_name;

-- 5. Show columns in badges_powlax (if it exists)
SELECT '========== BADGES_POWLAX COLUMNS ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_name = 'badges_powlax'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Show columns in powlax_badges_catalog (alternative table)
SELECT '========== POWLAX_BADGES_CATALOG COLUMNS ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_name = 'powlax_badges_catalog'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show points currencies structure
SELECT '========== POWLAX_POINTS_CURRENCIES COLUMNS ==========' as section;
SELECT 
    column_name as "Column", 
    data_type as "Type"
FROM information_schema.columns
WHERE table_name = 'powlax_points_currencies'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Count records in each table
SELECT '========== RECORD COUNTS ==========' as section;
SELECT 'Checking record counts...' as info;

-- Use dynamic SQL to count records safely
DO $$
DECLARE
    tbl RECORD;
    cnt INTEGER;
BEGIN
    FOR tbl IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND (
            table_name LIKE '%badge%' 
            OR table_name LIKE '%rank%' 
            OR table_name LIKE '%point%_curr%'
        )
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl.table_name) INTO cnt;
        RAISE NOTICE 'Table % has % records', tbl.table_name, cnt;
    END LOOP;
END $$;