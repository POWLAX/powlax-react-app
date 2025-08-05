-- Leverage Supabase Paid Features for Better Performance & Connections

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

-- Create index for fast refresh
CREATE INDEX IF NOT EXISTS idx_drill_strategy_connections_drill_id 
ON drill_strategy_connections(drill_id);

-- 2. Create full-text search indexes for better content discovery
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_drills_title_trgm 
ON staging_wp_drills USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_drills_content_trgm 
ON staging_wp_drills USING gin(content gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_strategies_title_trgm 
ON staging_wp_strategies USING gin(title gin_trgm_ops);

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

COMMENT ON FUNCTION search_drills_by_strategy IS 'Search drills with optional strategy filtering and text search';
COMMENT ON FUNCTION get_position_drills IS 'Get position-specific drill recommendations from Skills Academy';
COMMENT ON FUNCTION refresh_drill_connections IS 'Refresh the drill-strategy connections materialized view';