-- PRACTICE PLANNER PERFORMANCE OPTIMIZATION
-- Optimizes database for fast drill retrieval and practice plan management

-- ========================================
-- 1. CREATE UNIFIED DRILLS VIEW
-- ========================================

-- Create a unified view that combines all drill sources for the practice planner
CREATE OR REPLACE VIEW drills AS
SELECT 
  id::text,
  wp_id::text as drill_id,
  title as name,
  COALESCE(
    CASE 
      WHEN drill_duration ~ '^\d+$' THEN drill_duration::integer
      ELSE 10 
    END, 10
  ) as duration,
  COALESCE(drill_category, 'skill') as category,
  COALESCE(drill_types, '') as subcategory,
  COALESCE(content, drill_notes, '') as description,
  
  -- Strategy extraction for filtering
  CASE 
    WHEN game_states LIKE '%ground-ball%' OR title ILIKE '%ground ball%' THEN ARRAY['Ground Ball']
    WHEN game_states LIKE '%settled-offense%' OR title ILIKE '%offense%' THEN ARRAY['Offense']  
    WHEN game_states LIKE '%settled-defense%' OR title ILIKE '%defense%' THEN ARRAY['Defense']
    WHEN game_states LIKE '%transition%' OR title ILIKE '%transition%' THEN ARRAY['Transition']
    WHEN game_states LIKE '%clearing%' OR title ILIKE '%clear%' THEN ARRAY['Clearing']
    WHEN title ILIKE '%1v1%' OR title ILIKE '%1 v 1%' THEN ARRAY['1v1']
    ELSE ARRAY[]::text[]
  END as strategies,
  
  ARRAY[]::text[] as concepts, -- Populate later
  ARRAY[]::text[] as skills,   -- Populate later
  ARRAY[]::text[] as skill_ids,
  ARRAY[]::text[] as concept_ids,
  ARRAY[]::text[] as game_phase_ids,
  
  -- Video and lab URLs
  COALESCE(drill_video_url, vimeo_url) as video_url,
  drill_video_url,
  '' as drill_lab_url_1,
  '' as drill_lab_url_2, 
  '' as drill_lab_url_3,
  '' as drill_lab_url_4,
  '' as drill_lab_url_5,
  '' as custom_url,
  '[]'::jsonb as lab_urls,
  
  -- Additional metadata
  'medium' as intensity_level,
  'medium' as difficulty_level,
  COALESCE(difficulty_score, 3) as difficulty_score,
  8 as min_players,
  20 as max_players,
  ARRAY[]::text[] as equipment,
  
  -- Coaching information
  '' as setup_requirements,
  COALESCE(drill_notes, content, '') as coach_instructions,
  COALESCE(drill_notes, content, '') as notes,
  
  -- Age adaptations
  null as age_adaptations,
  do_it_ages as do_it,
  coach_it_ages as coach_it,  
  own_it_ages as own_it,
  
  created_at,
  created_at as updated_at

FROM staging_wp_drills 
WHERE title IS NOT NULL
  AND title != ''

UNION ALL

-- Add academy drills
SELECT 
  'academy_' || id::text as id,
  wp_id::text as drill_id,
  title as name,
  COALESCE(duration_minutes, 10) as duration,
  COALESCE(academy_category, 'skill') as category,
  academy_category as subcategory,
  '' as description,
  
  -- Extract strategies from academy category
  CASE
    WHEN academy_category ILIKE '%ground ball%' THEN ARRAY['Ground Ball']
    WHEN academy_category ILIKE '%shooting%' THEN ARRAY['Shooting'] 
    WHEN academy_category ILIKE '%passing%' THEN ARRAY['Passing']
    WHEN academy_category ILIKE '%dodging%' THEN ARRAY['Dodging']
    ELSE ARRAY[]::text[]
  END as strategies,
  
  ARRAY[]::text[] as concepts,
  ARRAY[]::text[] as skills,
  ARRAY[]::text[] as skill_ids,
  ARRAY[]::text[] as concept_ids, 
  ARRAY[]::text[] as game_phase_ids,
  
  -- Video URLs
  COALESCE(vimeo_url, 'https://vimeo.com/' || vimeo_id) as video_url,
  COALESCE(vimeo_url, 'https://vimeo.com/' || vimeo_id) as drill_video_url,
  '' as drill_lab_url_1,
  '' as drill_lab_url_2,
  '' as drill_lab_url_3, 
  '' as drill_lab_url_4,
  '' as drill_lab_url_5,
  '' as custom_url,
  '[]'::jsonb as lab_urls,
  
  -- Metadata
  CASE complexity
    WHEN 'Foundation' THEN 'low'
    WHEN 'Building' THEN 'medium'  
    WHEN 'Advanced' THEN 'high'
    ELSE 'medium'
  END as intensity_level,
  complexity as difficulty_level,
  COALESCE(difficulty_score, 3) as difficulty_score,
  6 as min_players,
  15 as max_players,
  CASE 
    WHEN equipment_needed IS NOT NULL THEN string_to_array(equipment_needed, ',')
    ELSE ARRAY[]::text[]
  END as equipment,
  
  COALESCE(space_needed, '') as setup_requirements,
  sets_reps as coach_instructions,
  sets_reps as notes,
  
  null as age_adaptations,
  do_it_ages as do_it,
  coach_it_ages as coach_it,
  own_it_ages as own_it,
  
  created_at,
  created_at as updated_at

FROM staging_wp_academy_drills
WHERE title IS NOT NULL
  AND title != '';

-- ========================================
-- 2. CREATE PERFORMANCE INDEXES
-- ========================================

-- Index for fast drill library queries
CREATE INDEX IF NOT EXISTS idx_drills_category_name ON staging_wp_drills(drill_category, title);
CREATE INDEX IF NOT EXISTS idx_drills_duration ON staging_wp_drills(drill_duration);  
CREATE INDEX IF NOT EXISTS idx_drills_game_states ON staging_wp_drills USING gin(game_states gin_trgm_ops);

-- Academy drills indexes
CREATE INDEX IF NOT EXISTS idx_academy_category ON staging_wp_academy_drills(academy_category);
CREATE INDEX IF NOT EXISTS idx_academy_duration ON staging_wp_academy_drills(duration_minutes);

-- Practice plans indexes for team filtering
CREATE INDEX IF NOT EXISTS idx_practice_plans_team_date ON practice_plans_collaborative(team_id, practice_date);
CREATE INDEX IF NOT EXISTS idx_practice_plans_coach ON practice_plans_collaborative(coach_id);

-- ========================================
-- 3. OPTIMIZE RLS POLICIES  
-- ========================================

-- Ensure practice plans are properly secured
DROP POLICY IF EXISTS practice_plans_select_policy ON practice_plans_collaborative;
CREATE POLICY practice_plans_select_policy 
ON practice_plans_collaborative 
FOR SELECT 
USING (
  auth.uid() = coach_id OR 
  auth.uid() = ANY(shared_with) OR
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('coach', 'assistant_coach')
  )
);

DROP POLICY IF EXISTS practice_plans_insert_policy ON practice_plans_collaborative;
CREATE POLICY practice_plans_insert_policy 
ON practice_plans_collaborative 
FOR INSERT 
WITH CHECK (
  auth.uid() = coach_id OR
  team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() 
    AND role IN ('coach', 'assistant_coach')
  )
);

-- ========================================
-- 4. CREATE OPTIMIZED DRILL SEARCH FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION get_drills_optimized(
  category_filter text DEFAULT NULL,
  strategy_filter text DEFAULT NULL,
  search_term text DEFAULT NULL,
  duration_min integer DEFAULT NULL,
  duration_max integer DEFAULT NULL,
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  id text,
  name text,
  duration integer,
  category text,
  strategies text[],
  video_url text,
  notes text,
  coach_instructions text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.duration,
    d.category,
    d.strategies,
    d.video_url,
    d.notes,
    d.coach_instructions
  FROM drills d
  WHERE 
    (category_filter IS NULL OR d.category = category_filter)
    AND (strategy_filter IS NULL OR strategy_filter = ANY(d.strategies))
    AND (search_term IS NULL OR d.name ILIKE '%' || search_term || '%')
    AND (duration_min IS NULL OR d.duration >= duration_min)
    AND (duration_max IS NULL OR d.duration <= duration_max)
  ORDER BY d.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql
STABLE 
SECURITY DEFINER;

-- ========================================
-- 5. CREATE PRACTICE PLAN CRUD FUNCTIONS
-- ========================================

-- Fast practice plan retrieval for teams
CREATE OR REPLACE FUNCTION get_team_practice_plans(team_uuid uuid)
RETURNS TABLE (
  id uuid,
  title text,
  practice_date date,
  duration_minutes integer,
  drill_sequence jsonb,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.title,
    pp.practice_date,
    pp.duration_minutes,
    pp.drill_sequence,
    pp.notes,
    pp.created_at,
    pp.updated_at
  FROM practice_plans_collaborative pp
  WHERE pp.team_id = team_uuid
  ORDER BY pp.practice_date DESC, pp.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql
STABLE 
SECURITY DEFINER;

-- ========================================
-- 6. ADD HELPFUL COMMENTS
-- ========================================

COMMENT ON VIEW drills IS 'Unified drill library combining staging_wp_drills and staging_wp_academy_drills for practice planner';
COMMENT ON FUNCTION get_drills_optimized IS 'Optimized drill search with filtering for practice planner drill library';
COMMENT ON FUNCTION get_team_practice_plans IS 'Fast retrieval of practice plans for a specific team';

-- Success message
SELECT 'Practice Planner database optimization complete! 🚀' as message;