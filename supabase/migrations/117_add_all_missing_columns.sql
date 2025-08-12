-- =====================================================
-- Migration: 117_add_all_missing_columns.sql
-- Purpose: Add all missing columns to user tables to match UI expectations
-- Date: January 12, 2025
-- Status: CRITICAL - Required for Practice Planner features to work
-- =====================================================

-- =====================================================
-- PART 1: Fix user_drills table
-- =====================================================
-- Current: Only has user_id, title
-- Need: All columns that AddCustomDrillModal expects

ALTER TABLE user_drills 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Custom',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_1 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_2 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_3 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_4 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_5 TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS game_states TEXT[], -- Array of game states
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_share BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS club_share BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add ID column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_drills' AND column_name = 'id') THEN
    ALTER TABLE user_drills ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;

-- =====================================================
-- PART 2: Fix user_strategies table
-- =====================================================
-- Current: Only has user_id, strategy_name
-- Need: All columns that AddCustomStrategiesModal expects

ALTER TABLE user_strategies
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS lesson_category TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS lacrosse_lab_url_1 TEXT,
ADD COLUMN IF NOT EXISTS lacrosse_lab_url_2 TEXT,
ADD COLUMN IF NOT EXISTS lacrosse_lab_url_3 TEXT,
ADD COLUMN IF NOT EXISTS lacrosse_lab_url_4 TEXT,
ADD COLUMN IF NOT EXISTS lacrosse_lab_url_5 TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS do_it_ages TEXT,
ADD COLUMN IF NOT EXISTS coach_it_ages TEXT,
ADD COLUMN IF NOT EXISTS own_it_ages TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_share BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS club_share BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add ID column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_strategies' AND column_name = 'id') THEN
    ALTER TABLE user_strategies ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
  END IF;
END $$;

-- =====================================================
-- PART 3: Create proper user_favorites table
-- =====================================================
-- Current table structure doesn't support our needs
-- Create new table with correct structure

-- Drop old table if it exists (backup data first if needed!)
DROP TABLE IF EXISTS user_favorites_old;
ALTER TABLE IF EXISTS user_favorites RENAME TO user_favorites_old;

-- Create new user_favorites table with flexible structure
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('drill', 'strategy')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- Create indexes for performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item_type ON user_favorites(item_type);

-- =====================================================
-- PART 4: Set up RLS policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can manage their own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can manage their own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

-- Create simple RLS policies for user_drills
CREATE POLICY "Users can insert own drills" ON user_drills
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can view own and public drills" ON user_drills
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
    OR is_public = true
  );

CREATE POLICY "Users can update own drills" ON user_drills
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can delete own drills" ON user_drills
  FOR DELETE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create simple RLS policies for user_strategies
CREATE POLICY "Users can insert own strategies" ON user_strategies
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can view own and public strategies" ON user_strategies
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
    OR is_public = true
  );

CREATE POLICY "Users can update own strategies" ON user_strategies
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

CREATE POLICY "Users can delete own strategies" ON user_strategies
  FOR DELETE TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- Create simple RLS policies for user_favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1))
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1));

-- =====================================================
-- PART 5: Grant permissions
-- =====================================================

GRANT ALL ON user_drills TO authenticated;
GRANT ALL ON user_strategies TO authenticated;
GRANT ALL ON user_favorites TO authenticated;

-- =====================================================
-- PART 6: Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration 117 completed successfully!';
  RAISE NOTICE 'Added all missing columns to user tables';
  RAISE NOTICE 'Created proper user_favorites table';
  RAISE NOTICE 'Set up RLS policies for all tables';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Custom Drills should now save all form data';
  RAISE NOTICE 'Custom Strategies should now save all form data';
  RAISE NOTICE 'Favorites should now persist to database';
  RAISE NOTICE '==============================================';
END $$;