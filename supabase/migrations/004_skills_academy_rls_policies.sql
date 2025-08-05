-- Fix unrestricted access for Skills Academy and related tables
-- This migration adds RLS policies to prevent unauthorized access

-- First, check which tables actually exist and enable RLS only on those
DO $$
BEGIN
  -- Enable RLS on Skills Academy tables if they exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skills_academy_drills') THEN
    ALTER TABLE skills_academy_drills ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skills_academy_workouts') THEN
    ALTER TABLE skills_academy_workouts ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_drill_relationships') THEN
    ALTER TABLE workout_drill_relationships ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_drill_mapping') THEN
    ALTER TABLE workout_drill_mapping ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on other tables that show as unrestricted
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drill_lacrosse_lab_urls') THEN
    ALTER TABLE drill_lacrosse_lab_urls ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drill_point_system') THEN
    ALTER TABLE drill_point_system ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_states') THEN
    ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'position_drills') THEN
    ALTER TABLE position_drills ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practice_summaries') THEN
    ALTER TABLE practice_summaries ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drill_media') THEN
    ALTER TABLE drill_media ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drills') THEN
    ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practices') THEN
    ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'practice_drills') THEN
    ALTER TABLE practice_drills ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =====================================================
-- PUBLIC READ ACCESS POLICIES
-- Allow all authenticated users to read drill content
-- =====================================================

-- Skills Academy Drills - Public read for authenticated users
CREATE POLICY "authenticated_read_skills_drills" ON skills_academy_drills
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Skills Academy Workouts - Public read for authenticated users
CREATE POLICY "authenticated_read_skills_workouts" ON skills_academy_workouts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Workout Drill Relationships - Public read for authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_drill_relationships') THEN
    CREATE POLICY "authenticated_read_workout_relationships" ON workout_drill_relationships
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Workout Drill Mapping - Public read for authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workout_drill_mapping') THEN
    CREATE POLICY "authenticated_read_workout_mapping" ON workout_drill_mapping
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Position Drills - Public read for authenticated users
CREATE POLICY "authenticated_read_position_drills" ON position_drills
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Game States - Public read for authenticated users
CREATE POLICY "authenticated_read_game_states" ON game_states
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Drill Game States - Public read for authenticated users
CREATE POLICY "authenticated_read_drill_game_states" ON drill_game_states
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Lab URLs - Public read for authenticated users
CREATE POLICY "authenticated_read_lab_urls" ON drill_lab_urls
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_read_lacrosse_lab_urls" ON drill_lacrosse_lab_urls
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Drill Points - Public read for authenticated users
CREATE POLICY "authenticated_read_drill_points" ON drill_point_system
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Drill Media - Public read for authenticated users
CREATE POLICY "authenticated_read_drill_media" ON drill_media
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Base Drills - Public read for authenticated users
CREATE POLICY "authenticated_read_drills" ON drills
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PRACTICE MANAGEMENT POLICIES
-- Users can only manage their own practices
-- =====================================================

-- Practices - Users can view their own practices
CREATE POLICY "users_view_own_practices" ON practices
  FOR SELECT USING (user_id = auth.uid());

-- Practices - Users can create their own practices
CREATE POLICY "users_create_own_practices" ON practices
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Practices - Users can update their own practices
CREATE POLICY "users_update_own_practices" ON practices
  FOR UPDATE USING (user_id = auth.uid());

-- Practices - Users can delete their own practices
CREATE POLICY "users_delete_own_practices" ON practices
  FOR DELETE USING (user_id = auth.uid());

-- Practice Drills - Users can manage drills in their practices
CREATE POLICY "users_manage_practice_drills" ON practice_drills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM practices
      WHERE practices.id = practice_drills.practice_id
      AND practices.user_id = auth.uid()
    )
  );

-- Practice Summaries - Users can manage summaries for their practices
CREATE POLICY "users_manage_practice_summaries" ON practice_summaries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM practices
      WHERE practices.id = practice_summaries.practice_id
      AND practices.user_id = auth.uid()
    )
  );

-- =====================================================
-- ADMIN POLICIES
-- Admins can manage all content
-- =====================================================

-- Admin policy for Skills Academy Drills
CREATE POLICY "admin_all_skills_drills" ON skills_academy_drills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Admin policy for Skills Academy Workouts
CREATE POLICY "admin_all_skills_workouts" ON skills_academy_workouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Admin policy for all other tables
CREATE POLICY "admin_all_workout_drills" ON workout_drills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_all_position_drills" ON position_drills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_all_game_states" ON game_states
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_all_practices" ON practices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- =====================================================
-- SUBSCRIPTION-BASED ACCESS (Optional)
-- Uncomment to restrict by subscription level
-- =====================================================

-- -- Premium content access for Skills Academy
-- CREATE POLICY "premium_access_skills_academy" ON skills_academy_drills
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM user_subscriptions
--       WHERE user_id = auth.uid()
--       AND status = 'active'
--       AND subscription_level IN ('premium', 'pro', 'elite')
--     )
--   );

-- =====================================================
-- HELPER COMMENT
-- =====================================================
COMMENT ON SCHEMA public IS 'Skills Academy RLS policies added to secure drill and workout data';