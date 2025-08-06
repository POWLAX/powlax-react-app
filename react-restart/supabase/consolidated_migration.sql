-- POWLAX Complete Database Migration
-- Run this entire script in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/editor

-- ========================================
-- MIGRATION 1: Basic Staging Tables
-- ========================================

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

-- ========================================
-- MIGRATION 2: Table Updates & Enhancements
-- ========================================

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

-- ========================================
-- MIGRATION 3: Paid Features & Advanced Functions
-- ========================================

-- 1. Create materialized views for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS drill_strategy_connections AS
SELECT 
  d.id as drill_id,
  d.title as drill_title,
  d.drill_types,
  d.game_states,
  -- Parse game states to create strategy connections
  CASE 
    WHEN d.game_states LIKE '%pp-settled-offense%' THEN TRUE
    ELSE FALSE
  END as has_settled_offense,
  CASE 
    WHEN d.game_states LIKE '%pp-settled-defense%' THEN TRUE
    ELSE FALSE
  END as has_settled_defense,
  CASE 
    WHEN d.game_states LIKE '%pp-offensive-transition%' THEN TRUE
    ELSE FALSE
  END as has_transition_offense,
  CASE 
    WHEN d.game_states LIKE '%pp-transition-defense%' THEN TRUE
    ELSE FALSE
  END as has_transition_defense,
  CASE 
    WHEN d.game_states LIKE '%pp-clearing%' THEN TRUE
    ELSE FALSE
  END as has_clearing,
  CASE 
    WHEN d.game_states LIKE '%pp-ground-ball%' THEN TRUE
    ELSE FALSE
  END as has_ground_ball
FROM staging_wp_drills d
WHERE d.game_states IS NOT NULL;

-- 2. Create full-text search indexes for better content discovery
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Create function for smart drill search with strategy filtering
CREATE OR REPLACE FUNCTION search_drills_by_strategy(
  strategy_filter TEXT DEFAULT NULL,
  search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
  drill_id INTEGER,
  title TEXT,
  drill_types TEXT,
  duration TEXT,
  video_url TEXT,
  matched_strategies TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.drill_types,
    d.drill_duration,
    d.drill_video_url,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN dsc.has_settled_offense THEN 'Settled Offense' END,
      CASE WHEN dsc.has_settled_defense THEN 'Settled Defense' END,
      CASE WHEN dsc.has_transition_offense THEN 'Transition Offense' END,
      CASE WHEN dsc.has_transition_defense THEN 'Transition Defense' END,
      CASE WHEN dsc.has_clearing THEN 'Clearing' END,
      CASE WHEN dsc.has_ground_ball THEN 'Ground Ball' END
    ], NULL) as matched_strategies
  FROM staging_wp_drills d
  LEFT JOIN drill_strategy_connections dsc ON d.id = dsc.drill_id
  WHERE 
    (strategy_filter IS NULL OR 
      CASE strategy_filter
        WHEN 'Settled Offense' THEN dsc.has_settled_offense
        WHEN 'Settled Defense' THEN dsc.has_settled_defense
        WHEN 'Transition Offense' THEN dsc.has_transition_offense
        WHEN 'Transition Defense' THEN dsc.has_transition_defense
        WHEN 'Clearing' THEN dsc.has_clearing
        WHEN 'Ground Ball' THEN dsc.has_ground_ball
        ELSE TRUE
      END
    )
    AND (search_term IS NULL OR 
      d.title ILIKE '%' || search_term || '%' OR
      d.content ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Create position-specific drill recommendations
CREATE OR REPLACE FUNCTION get_position_drills(
  player_position TEXT,
  workout_number INTEGER DEFAULT NULL
)
RETURNS TABLE (
  drill_id INTEGER,
  title TEXT,
  category TEXT,
  relevance TEXT,
  included_in_workout BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.academy_category,
    CASE player_position
      WHEN 'Attack' THEN a.attack_relevance
      WHEN 'Midfield' THEN a.midfield_relevance
      WHEN 'Defense' THEN a.defense_relevance
    END as relevance,
    CASE 
      WHEN workout_number IS NULL THEN NULL
      ELSE 
        CASE player_position
          WHEN 'Attack' THEN workout_number = ANY((a.included_in_workouts->>'attack')::int[])
          WHEN 'Midfield' THEN workout_number = ANY((a.included_in_workouts->>'midfield')::int[])
          WHEN 'Defense' THEN workout_number = ANY((a.included_in_workouts->>'defense')::int[])
        END
    END as included_in_workout
  FROM staging_wp_academy_drills a
  WHERE 
    CASE player_position
      WHEN 'Attack' THEN a.attack_relevance IS NOT NULL
      WHEN 'Midfield' THEN a.midfield_relevance IS NOT NULL
      WHEN 'Defense' THEN a.defense_relevance IS NOT NULL
      ELSE FALSE
    END
  ORDER BY 
    CASE 
      WHEN relevance IN ('F', 'Foundation') THEN 1
      WHEN relevance IN ('B', 'Basics') THEN 2
      WHEN relevance IN ('S', 'Supplementary') THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql;

-- 5. Create real-time enabled table for practice plan collaboration
CREATE TABLE IF NOT EXISTS practice_plans_collaborative (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  coach_id UUID,
  team_id UUID,
  practice_date DATE,
  duration_minutes INTEGER,
  drill_sequence JSONB DEFAULT '[]',
  strategies_focus TEXT[],
  notes TEXT,
  shared_with UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time for collaborative editing
ALTER TABLE practice_plans_collaborative REPLICA IDENTITY FULL;

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_plans_updated_at 
BEFORE UPDATE ON practice_plans_collaborative 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create analytics view for drill usage
CREATE OR REPLACE VIEW drill_analytics AS
SELECT 
  d.id,
  d.title,
  d.drill_types,
  COUNT(DISTINCT pp.id) as times_used_in_plans,
  ARRAY_AGG(DISTINCT pp.strategies_focus) as used_for_strategies,
  AVG(pp.duration_minutes) as avg_practice_duration
FROM staging_wp_drills d
LEFT JOIN practice_plans_collaborative pp 
  ON d.id = ANY((pp.drill_sequence->>'drill_ids')::int[])
GROUP BY d.id, d.title, d.drill_types;

-- 8. Row Level Security for multi-tenant access (if needed)
ALTER TABLE practice_plans_collaborative ENABLE ROW LEVEL SECURITY;

-- Create policy for coach access
CREATE POLICY "Coaches can manage their own practice plans"
ON practice_plans_collaborative
FOR ALL
USING (
  auth.uid() = coach_id OR 
  auth.uid() = ANY(shared_with)
);

-- 9. Create function to refresh materialized view (can be scheduled)
CREATE OR REPLACE FUNCTION refresh_drill_connections()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY drill_strategy_connections;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CREATE ALL INDEXES FOR PERFORMANCE
-- ========================================

-- Basic performance indexes
CREATE INDEX IF NOT EXISTS idx_drill_strategy_drill ON staging_drill_strategy_map(drill_id);
CREATE INDEX IF NOT EXISTS idx_drill_strategy_strategy ON staging_drill_strategy_map(strategy_id);
CREATE INDEX IF NOT EXISTS idx_drills_title ON staging_wp_drills(title);
CREATE INDEX IF NOT EXISTS idx_strategies_title ON staging_wp_strategies(title);

-- Enhanced indexes for CSV import
CREATE INDEX IF NOT EXISTS idx_drills_wp_id ON staging_wp_drills(wp_id);
CREATE INDEX IF NOT EXISTS idx_strategies_wp_id ON staging_wp_strategies(wp_id);
CREATE INDEX IF NOT EXISTS idx_academy_wp_id ON staging_wp_academy_drills(wp_id);

-- Materialized view index
CREATE INDEX IF NOT EXISTS idx_drill_strategy_connections_drill_id 
ON drill_strategy_connections(drill_id);

-- Full-text search indexes (these require the pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_drills_title_trgm 
ON staging_wp_drills USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_drills_content_trgm 
ON staging_wp_drills USING gin(content gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_strategies_title_trgm 
ON staging_wp_strategies USING gin(title gin_trgm_ops);

-- ========================================
-- CREATE HELPFUL VIEWS
-- ========================================

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

-- Add comments for documentation
COMMENT ON FUNCTION search_drills_by_strategy IS 'Search drills with optional strategy filtering and text search';
COMMENT ON FUNCTION get_position_drills IS 'Get position-specific drill recommendations from Skills Academy';
COMMENT ON FUNCTION refresh_drill_connections IS 'Refresh the drill-strategy connections materialized view';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'POWLAX Database Migration Complete! 🚀';
    RAISE NOTICE 'Created tables: staging_wp_drills, staging_wp_strategies, staging_wp_skills, staging_wp_academy_drills, staging_wp_wall_ball, staging_wp_lessons';
    RAISE NOTICE 'Created functions: search_drills_by_strategy(), get_position_drills(), refresh_drill_connections()';
    RAISE NOTICE 'Created views: drills_with_game_states, drill_analytics';
    RAISE NOTICE 'Ready for CSV import with: npm run import:csv';
END $$;