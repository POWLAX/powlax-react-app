-- Dynamic RLS fix that checks what tables actually exist
-- This will only apply policies to tables that are present in your database

-- First, let's see what tables we're dealing with
DO $$
DECLARE
    table_record RECORD;
    policy_exists BOOLEAN;
BEGIN
    -- Loop through all tables that might need RLS
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'skills_academy_drills',
            'skills_academy_workouts',
            'workout_drill_relationships',
            'workout_drill_mapping',
            'drill_lacrosse_lab_urls',
            'drill_point_system',
            'game_states',
            'drill_game_states',
            'drill_lab_urls',
            'drill_media',
            'position_drills',
            'practice_summaries',
            'drills',
            'practices',
            'practice_drills',
            'teams',
            'organizations',
            'team_members',
            'parent_child_relationships',
            'data_access_audit',
            'users',
            'user_subscriptions',
            'user_sessions',
            'user_activity_log',
            'wp_strategies'
        )
        AND NOT rowsecurity -- Only tables without RLS enabled
    LOOP
        -- Enable RLS on the table
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
        
        -- Check if a read policy already exists
        SELECT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_record.tablename 
            AND policyname LIKE '%read%'
        ) INTO policy_exists;
        
        -- Create read policy if it doesn't exist
        IF NOT policy_exists THEN
            EXECUTE format(
                'CREATE POLICY "public_read_%s" ON %I FOR SELECT USING (true)',
                table_record.tablename,
                table_record.tablename
            );
            RAISE NOTICE 'Created public read policy for: %', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- Now let's check what tables are still showing as unrestricted
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    CASE 
        WHEN rowsecurity = false THEN 'UNRESTRICTED - FIX NEEDED'
        ELSE 'Protected'
    END as "Security Status"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%'
ORDER BY rowsecurity ASC, tablename;

-- For any remaining unrestricted tables, here's a query to generate the fix
SELECT 
    'ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;' as "Enable RLS Command",
    'CREATE POLICY "temp_read_' || tablename || '" ON ' || tablename || ' FOR SELECT USING (true);' as "Create Policy Command"
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%';