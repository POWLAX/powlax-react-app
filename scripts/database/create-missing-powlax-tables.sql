-- POWLAX Missing Tables Creation
-- Based on Source of Truth inspection: 2025-08-05
-- 
-- This script creates the missing _powlax tables that were referenced
-- but don't actually exist in Supabase yet.

-- 1. Team Drills Table (for WordPress drill exports)
CREATE TABLE IF NOT EXISTS drills_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  drill_types TEXT,
  drill_category TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
  drill_duration TEXT,
  drill_video_url TEXT,
  drill_notes TEXT,
  game_states TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  status TEXT,
  slug TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Wall Ball Skills Table
CREATE TABLE IF NOT EXISTS wall_ball_powlax (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  vimeo_url TEXT,
  workout_type TEXT,
  included_in_workouts JSONB,
  description TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS lessons_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  categories TEXT,
  tags TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Drill-Strategy Mapping Table
CREATE TABLE IF NOT EXISTS drill_strategy_map_powlax (
  id SERIAL PRIMARY KEY,
  drill_id INTEGER REFERENCES drills_powlax(id) ON DELETE CASCADE,
  strategy_id INTEGER REFERENCES strategies_powlax(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2),
  mapping_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drill_id, strategy_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drills_powlax_title ON drills_powlax(title);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_drill_types ON drills_powlax(drill_types);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_game_phase ON drills_powlax(game_phase);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_wp_id ON drills_powlax(wp_id);

CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_title ON wall_ball_powlax(title);
CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_workouts ON wall_ball_powlax USING gin(included_in_workouts);

CREATE INDEX IF NOT EXISTS idx_lessons_powlax_title ON lessons_powlax(title);
CREATE INDEX IF NOT EXISTS idx_lessons_powlax_type ON lessons_powlax(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_powlax_wp_id ON lessons_powlax(wp_id);

-- Enable RLS with permissive policies
ALTER TABLE drills_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_ball_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_strategy_map_powlax ENABLE ROW LEVEL SECURITY;

-- Create read access for anonymous users
CREATE POLICY "Allow anonymous read" ON drills_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON wall_ball_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON lessons_powlax FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read" ON drill_strategy_map_powlax FOR SELECT TO anon USING (true);

-- Create full access for authenticated users
CREATE POLICY "Allow authenticated full access" ON drills_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON wall_ball_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON lessons_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access" ON drill_strategy_map_powlax FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create full access for service role
CREATE POLICY "Service role full access" ON drills_powlax FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON wall_ball_powlax FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON lessons_powlax FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON drill_strategy_map_powlax FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Note: skills_academy tables already exist without _powlax suffix
-- We'll use the existing tables: skills_academy_drills and skills_academy_workouts