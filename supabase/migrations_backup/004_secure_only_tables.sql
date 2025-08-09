-- Secure only actual TABLES (not views)
-- This migration only applies RLS to tables, skipping views

DO $$
DECLARE
    t_name text;
BEGIN
    -- Only process actual tables that need RLS
    FOR t_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND rowsecurity = false  -- Only tables without RLS
        AND tablename IN (
            'drill_lacrosse_lab',
            'drill_point_summary', 
            'leaderboard',
            'position_drills',
            'practice_summary'
        )
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t_name);
        
        -- Create basic read policy
        EXECUTE format('CREATE POLICY "read_%s" ON %I FOR SELECT USING (true)', t_name, t_name);
        
        RAISE NOTICE 'Secured table: %', t_name;
    END LOOP;
    
    -- Report on views (which can't have RLS)
    FOR t_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
        AND viewname IN (
            'drill_lacrosse_lab',
            'drill_point_summary',
            'leaderboard', 
            'position_drills',
            'practice_summary'
        )
    LOOP
        RAISE NOTICE 'Skipped view (cannot add RLS): %', t_name;
    END LOOP;
END $$;

-- Option to convert views to tables if you want RLS
-- Uncomment below if you want to convert specific views to tables

/*
-- Example: Convert leaderboard view to a table with RLS
-- Step 1: Create table from view
CREATE TABLE leaderboard_table AS SELECT * FROM leaderboard;

-- Step 2: Drop the view
DROP VIEW leaderboard;

-- Step 3: Rename table
ALTER TABLE leaderboard_table RENAME TO leaderboard;

-- Step 4: Add RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_leaderboard" ON leaderboard FOR SELECT USING (true);
*/