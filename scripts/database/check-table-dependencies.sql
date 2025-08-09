-- POWLAX Table Dependency Checker
-- Use this to safely identify which tables can be deleted
-- Run in Supabase SQL Editor before making any deletions

-- 1. Check all foreign key relationships
SELECT 
    'DEPENDENCY CHECK' as check_type,
    tc.table_name as table_with_fk, 
    kcu.column_name as fk_column, 
    ccu.table_name as referenced_table,
    ccu.column_name as referenced_column,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY ccu.table_name, tc.table_name;

-- 2. Check which tables are referenced by others (CANNOT delete these)
SELECT 
    'CANNOT DELETE' as safety_status,
    ccu.table_name as table_name,
    COUNT(*) as times_referenced,
    STRING_AGG(tc.table_name, ', ') as referenced_by_tables
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
GROUP BY ccu.table_name
ORDER BY times_referenced DESC;

-- 3. Check which tables have NO foreign key references (SAFE to delete)
SELECT 
    'SAFE TO DELETE' as safety_status,
    t.table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = t.table_name 
            AND constraint_type = 'FOREIGN KEY'
            AND table_schema = 'public'
        ) THEN 'Has outgoing FKs'
        ELSE 'No relationships'
    END as relationship_status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT IN (
    -- Exclude tables that are referenced by others
    SELECT DISTINCT ccu.table_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
  )
ORDER BY t.table_name;

-- 4. Check table sizes to identify empty tables
SELECT 
    'TABLE SIZE CHECK' as check_type,
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    null_frac,
    avg_width
FROM pg_stats 
WHERE schemaname = 'public'
  AND tablename LIKE '%powlax%' 
  OR tablename LIKE '%skills_academy%'
  OR tablename LIKE '%wall_ball%'
  OR tablename LIKE '%strategies%'
  OR tablename LIKE '%drills%'
ORDER BY tablename, attname;

-- 5. List all POWLAX-related tables with their types
SELECT 
    'TABLE INVENTORY' as check_type,
    table_name,
    table_type,
    CASE 
        WHEN table_name LIKE '%powlax%' THEN 'POWLAX Core'
        WHEN table_name LIKE '%skills_academy%' THEN 'Skills Academy'
        WHEN table_name LIKE '%wall_ball%' THEN 'Wall Ball'
        WHEN table_name LIKE '%user_%' THEN 'User Data'
        WHEN table_name LIKE '%team%' THEN 'Team/Org'
        WHEN table_name LIKE '%staging%' THEN 'Staging/Import'
        ELSE 'Other'
    END as category
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND (
    table_name LIKE '%powlax%' 
    OR table_name LIKE '%skills_academy%'
    OR table_name LIKE '%wall_ball%'
    OR table_name LIKE '%strategies%'
    OR table_name LIKE '%drills%'
    OR table_name LIKE '%user_%'
    OR table_name LIKE '%team%'
    OR table_name LIKE '%staging%'
  )
ORDER BY category, table_name;

-- 6. Check for views that might depend on tables
SELECT 
    'VIEW DEPENDENCIES' as check_type,
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
  AND (
    view_definition ILIKE '%powlax%'
    OR view_definition ILIKE '%skills_academy%'
    OR view_definition ILIKE '%wall_ball%'
    OR view_definition ILIKE '%strategies%'
    OR view_definition ILIKE '%drills%'
  );
