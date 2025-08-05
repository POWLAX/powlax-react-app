-- Check what columns exist in the organizations and teams tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('organizations', 'teams')
ORDER BY table_name, ordinal_position;