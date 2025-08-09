-- Fix Unrestricted Tables in POWLAX Database
-- This migration secures the tables showing as "Unrestricted" in your screenshot

-- Enable RLS on all unrestricted tables
ALTER TABLE drill_lacrosse_lab ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_point_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_summary ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES
-- These allow authenticated users to read the content
-- =====================================================

-- Drill Lab URLs - Public read for authenticated users
CREATE POLICY "authenticated_read_drill_lab_urls" ON drill_lacrosse_lab
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Drill Point System - Public read for authenticated users
CREATE POLICY "authenticated_read_drill_points" ON drill_point_summary
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Leaderboard - Public read for all (leaderboards are typically public)
CREATE POLICY "public_read_leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- Position Drills - Public read for authenticated users
CREATE POLICY "authenticated_read_position_drills" ON position_drills
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Practice Summary - Users can only see their own summaries
CREATE POLICY "users_read_own_practice_summary" ON practice_summary
  FOR SELECT USING (
    -- Check if there's a user_id column
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practice_summary' 
        AND column_name = 'user_id'
      ) THEN user_id = auth.uid()
      -- If no user_id column, check via practices table
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practice_summary' 
        AND column_name = 'practice_id'
      ) THEN EXISTS (
        SELECT 1 FROM practices 
        WHERE practices.id = practice_summary.practice_id 
        AND practices.user_id = auth.uid()
      )
      -- Otherwise allow authenticated access
      ELSE auth.uid() IS NOT NULL
    END
  );

-- =====================================================
-- ADMIN POLICIES
-- Admins can manage all content
-- =====================================================

-- Admin access to all tables
CREATE POLICY "admin_all_drill_lab_urls" ON drill_lacrosse_lab
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_all_drill_points" ON drill_point_summary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

CREATE POLICY "admin_all_leaderboard" ON leaderboard
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

CREATE POLICY "admin_all_practice_summary" ON practice_summary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- =====================================================
-- USER WRITE POLICIES
-- Users can create/update certain records
-- =====================================================

-- Users can update their own leaderboard entries
CREATE POLICY "users_update_own_leaderboard" ON leaderboard
  FOR UPDATE USING (
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leaderboard' 
        AND column_name = 'user_id'
      ) THEN user_id = auth.uid()
      ELSE false
    END
  );

-- Users can create practice summaries for their practices
CREATE POLICY "users_create_practice_summary" ON practice_summary
  FOR INSERT WITH CHECK (
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practice_summary' 
        AND column_name = 'practice_id'
      ) THEN EXISTS (
        SELECT 1 FROM practices 
        WHERE practices.id = practice_summary.practice_id 
        AND practices.user_id = auth.uid()
      )
      ELSE auth.uid() IS NOT NULL
    END
  );

COMMENT ON SCHEMA public IS 'RLS policies applied to secure unrestricted tables';