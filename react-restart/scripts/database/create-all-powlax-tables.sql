-- POWLAX Database Schema
-- Create all tables following the [entity]_powlax naming convention

-- 1. Team Drills Table
CREATE TABLE IF NOT EXISTS drills_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  drill_types TEXT,
  drill_category TEXT,
  drill_duration TEXT,
  drill_video_url TEXT,
  drill_notes TEXT,
  game_states TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
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

-- 2. Skills Academy Drills Table
CREATE TABLE IF NOT EXISTS skills_academy_powlax (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  vimeo_url TEXT,
  academy_category TEXT,
  location_setup TEXT,
  equipment_needed JSONB,
  attack_relevance TEXT,
  midfield_relevance TEXT,
  defense_relevance TEXT,
  progression_info TEXT,
  included_in_workouts JSONB,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Wall Ball Skills Table
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

-- 4. Lessons Table
CREATE TABLE IF NOT EXISTS lessons_powlax (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type TEXT,
  vimeo_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Drill-Strategy Mapping Table
CREATE TABLE IF NOT EXISTS drill_strategy_map_powlax (
  id SERIAL PRIMARY KEY,
  drill_id INTEGER REFERENCES drills_powlax(id),
  strategy_id INTEGER REFERENCES strategies_powlax(id),
  confidence_score DECIMAL(3,2),
  mapping_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drill_id, strategy_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drills_powlax_title ON drills_powlax(title);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_drill_types ON drills_powlax(drill_types);
CREATE INDEX IF NOT EXISTS idx_drills_powlax_game_phase ON drills_powlax(game_phase);

CREATE INDEX IF NOT EXISTS idx_skills_academy_powlax_title ON skills_academy_powlax(title);
CREATE INDEX IF NOT EXISTS idx_skills_academy_powlax_category ON skills_academy_powlax(academy_category);
CREATE INDEX IF NOT EXISTS idx_skills_academy_powlax_equipment ON skills_academy_powlax USING gin(equipment_needed);

CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_title ON wall_ball_powlax(title);
CREATE INDEX IF NOT EXISTS idx_wall_ball_powlax_workouts ON wall_ball_powlax USING gin(included_in_workouts);

CREATE INDEX IF NOT EXISTS idx_lessons_powlax_title ON lessons_powlax(title);
CREATE INDEX IF NOT EXISTS idx_lessons_powlax_type ON lessons_powlax(lesson_type);

-- Enable RLS on all tables (but with permissive policies for now)
ALTER TABLE drills_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_academy_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_ball_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_strategy_map_powlax ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY['drills_powlax', 'skills_academy_powlax', 'wall_ball_powlax', 'lessons_powlax', 'drill_strategy_map_powlax'];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    -- Anonymous read access
    EXECUTE format('CREATE POLICY "Allow anonymous read" ON %I FOR SELECT TO anon USING (true)', table_name);
    
    -- Authenticated full access
    EXECUTE format('CREATE POLICY "Allow authenticated full access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', table_name);
    
    -- Service role full access
    EXECUTE format('CREATE POLICY "Service role full access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END$$;