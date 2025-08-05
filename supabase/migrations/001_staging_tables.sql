-- POWLAX Staging Tables for CSV Import
-- These tables will hold the imported data with relationship columns

-- Staging table for team drills (rows 1-276)
CREATE TABLE IF NOT EXISTS staging_wp_drills (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  drill_types TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  pdf_url TEXT,
  -- Relationship columns to be populated
  strategy_ids INTEGER[],
  skill_ids INTEGER[],
  concept_ids INTEGER[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staging table for strategies (from Master Classes where coaches corner with no drill type)
CREATE TABLE IF NOT EXISTS staging_wp_strategies (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  coaching_strategies TEXT,
  game_phase TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  featured_image TEXT,
  has_printable_playbook BOOLEAN DEFAULT FALSE,
  pdf_url TEXT,
  vimeo_url TEXT,
  master_class_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staging table for skills (from terminology and online skills academy)
CREATE TABLE IF NOT EXISTS staging_wp_skills (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  skill_type TEXT,
  position TEXT,
  progression_level TEXT,
  terminology_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staging table for academy drills (rows 277-443)
CREATE TABLE IF NOT EXISTS staging_wp_academy_drills (
  id SERIAL PRIMARY KEY,
  title TEXT,
  vimeo_id TEXT,
  academy_category TEXT,
  equipment_needed TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  space_needed TEXT,
  complexity TEXT, -- Building, Foundation, Advanced
  sets_reps TEXT,
  duration_minutes INTEGER,
  workout_categories TEXT,
  workout_tags TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staging table for wall ball content
CREATE TABLE IF NOT EXISTS staging_wp_wall_ball (
  id SERIAL PRIMARY KEY,
  title TEXT,
  workout_type TEXT, -- 'workout' or 'drill'
  duration_variant TEXT, -- 'short', 'medium', 'long'
  has_coaching BOOLEAN DEFAULT TRUE,
  vimeo_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mapping table for drill-strategy relationships
CREATE TABLE IF NOT EXISTS staging_drill_strategy_map (
  id SERIAL PRIMARY KEY,
  drill_id INTEGER,
  strategy_id INTEGER,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  mapping_source TEXT, -- 'manual', 'keyword', 'ai_suggested'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_drill_strategy_drill ON staging_drill_strategy_map(drill_id);
CREATE INDEX idx_drill_strategy_strategy ON staging_drill_strategy_map(strategy_id);
CREATE INDEX idx_drills_title ON staging_wp_drills(title);
CREATE INDEX idx_strategies_title ON staging_wp_strategies(title);