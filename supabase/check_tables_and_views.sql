-- Check what are tables vs views in your database
-- This will help identify which "unrestricted" items are actually views

-- List all TABLES
SELECT 
    'TABLE' as type,
    tablename as name,
    CASE 
        WHEN rowsecurity = true THEN 'RLS Enabled'
        ELSE 'UNRESTRICTED'
    END as security_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%'

UNION ALL

-- List all VIEWS (these can't have RLS)
SELECT 
    'VIEW' as type,
    viewname as name,
    'N/A - Views cannot have RLS' as security_status
FROM pg_views
WHERE schemaname = 'public'
AND viewname NOT LIKE 'pg_%'

ORDER BY type, name;

-- Specifically check the "unrestricted" items
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = obj_name AND schemaname = 'public') THEN 'TABLE'
        WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = obj_name AND schemaname = 'public') THEN 'VIEW'
        ELSE 'UNKNOWN'
    END as object_type,
    obj_name as name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = obj_name AND schemaname = 'public') THEN 
            CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = obj_name AND schemaname = 'public') THEN 'RLS Enabled' ELSE 'Needs RLS' END
        WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = obj_name AND schemaname = 'public') THEN 'N/A - View'
        ELSE 'Not Found'
    END as status
FROM (VALUES 
    ('drill_lacrosse_lab'),
    ('drill_point_summary'),
    ('leaderboard'),
    ('position_drills'),
    ('practice_summary')
) AS t(obj_name);