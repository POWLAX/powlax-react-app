-- Update staging tables to better match CSV structure

-- Add columns to handle raw CSV data
ALTER TABLE staging_wp_drills 
ADD COLUMN IF NOT EXISTS wp_id TEXT,
ADD COLUMN IF NOT EXISTS drill_category TEXT,
ADD COLUMN IF NOT EXISTS drill_duration TEXT,
ADD COLUMN IF NOT EXISTS drill_video_url TEXT,
ADD COLUMN IF NOT EXISTS drill_notes TEXT,
ADD COLUMN IF NOT EXISTS game_states TEXT, -- Will store the serialized PHP array
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

ALTER TABLE staging_wp_strategies
ADD COLUMN IF NOT EXISTS wp_id TEXT,
ADD COLUMN IF NOT EXISTS coaching_strategies TEXT,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Enhanced academy drills table for Skills Academy data
ALTER TABLE staging_wp_academy_drills
ADD COLUMN IF NOT EXISTS wp_id TEXT,
ADD COLUMN IF NOT EXISTS lesson_type TEXT,
ADD COLUMN IF NOT EXISTS vimeo_url TEXT,
ADD COLUMN IF NOT EXISTS location_setup TEXT,
ADD COLUMN IF NOT EXISTS equipment_needed JSONB,
ADD COLUMN IF NOT EXISTS attack_relevance TEXT,
ADD COLUMN IF NOT EXISTS midfield_relevance TEXT,
ADD COLUMN IF NOT EXISTS defense_relevance TEXT,
ADD COLUMN IF NOT EXISTS progression_info TEXT,
ADD COLUMN IF NOT EXISTS included_in_workouts JSONB,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

ALTER TABLE staging_wp_wall_ball
ADD COLUMN IF NOT EXISTS vimeo_url TEXT,
ADD COLUMN IF NOT EXISTS included_in_workouts JSONB,
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Create staging table for lessons if it doesn't exist
CREATE TABLE IF NOT EXISTS staging_wp_lessons (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT,
  content TEXT,
  lesson_type TEXT,
  vimeo_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drills_wp_id ON staging_wp_drills(wp_id);
CREATE INDEX IF NOT EXISTS idx_strategies_wp_id ON staging_wp_strategies(wp_id);
CREATE INDEX IF NOT EXISTS idx_academy_wp_id ON staging_wp_academy_drills(wp_id);

-- Create a view to see drills with parsed game states (for later use)
CREATE OR REPLACE VIEW drills_with_game_states AS
SELECT 
  id,
  wp_id,
  title,
  drill_types,
  drill_category,
  drill_duration,
  game_states,
  -- Extract game states when they're in the format we expect
  CASE 
    WHEN game_states LIKE '%pp-%' THEN TRUE
    ELSE FALSE
  END as has_game_states
FROM staging_wp_drills;