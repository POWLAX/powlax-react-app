-- Simple RLS fix for Skills Academy tables
-- This version only creates policies for tables that exist

-- Create policies with existence checks
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'skills_academy_drills',
    'skills_academy_workouts', 
    'workout_drill_relationships',
    'workout_drill_mapping',
    'drill_lacrosse_lab_urls',
    'drill_point_system',
    'game_states',
    'position_drills',
    'practice_summaries',
    'drill_media',
    'drills',
    'practices',
    'practice_drills'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    -- Enable RLS if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      
      -- Create simple read policy for authenticated users
      EXECUTE format('CREATE POLICY IF NOT EXISTS "read_%s" ON %I FOR SELECT USING (auth.uid() IS NOT NULL)', t, t);
      
      RAISE NOTICE 'Enabled RLS and created policy for table: %', t;
    END IF;
  END LOOP;
END $$;

-- For practices tables, add user-specific policies
DO $$
BEGIN
  -- Practices - users can manage their own
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practices') THEN
    -- Only if user_id column exists
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'practices' 
               AND column_name = 'user_id') THEN
      CREATE POLICY IF NOT EXISTS "users_insert_own_practices" ON practices
        FOR INSERT WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY IF NOT EXISTS "users_update_own_practices" ON practices
        FOR UPDATE USING (user_id = auth.uid());
        
      CREATE POLICY IF NOT EXISTS "users_delete_own_practices" ON practices
        FOR DELETE USING (user_id = auth.uid());
    END IF;
  END IF;
  
  -- Practice drills - users can manage drills in their practices
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practice_drills') 
     AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practices') THEN
    CREATE POLICY IF NOT EXISTS "users_manage_practice_drills" ON practice_drills
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM practices
          WHERE practices.id = practice_drills.practice_id
          AND practices.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Add admin policies for content management
DO $$
DECLARE
  t text;
  admin_tables text[] := ARRAY[
    'skills_academy_drills',
    'skills_academy_workouts',
    'game_states',
    'drill_point_system'
  ];
BEGIN
  FOREACH t IN ARRAY admin_tables
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('CREATE POLICY IF NOT EXISTS "admin_all_%s" ON %I FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND ''administrator'' = ANY(roles)
        )
      )', t, t);
    END IF;
  END LOOP;
END $$;

COMMENT ON SCHEMA public IS 'Skills Academy RLS policies applied with existence checks';