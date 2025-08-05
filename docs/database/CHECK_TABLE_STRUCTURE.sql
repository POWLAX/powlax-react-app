-- Check the actual structure of our tables to write accurate policies
SELECT 
    t.table_name,
    t.column_name,
    t.data_type,
    t.is_nullable
FROM information_schema.columns t
WHERE t.table_schema = 'public' 
AND t.table_name IN ('users', 'organizations', 'teams', 'user_organization_roles', 'user_team_roles', 'wp_sync_log')
ORDER BY t.table_name, t.ordinal_position;