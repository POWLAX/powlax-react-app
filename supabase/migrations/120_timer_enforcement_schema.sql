-- Migration 120: Timer Enforcement Schema Extensions
-- Contract: src/components/skills-academy/TIMER_ENFORCEMENT_CONTRACT.md
-- FOCUS: AGENT 3 - Database Schema Extensions
-- Created: 2025-01-11
-- Purpose: Extend database to store detailed timing data for timer enforcement

-- Extend workout_completions table with timer enforcement columns
ALTER TABLE workout_completions 
ADD COLUMN IF NOT EXISTS required_times JSONB,
ADD COLUMN IF NOT EXISTS timer_enforced BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS drill_completion_details JSONB;

-- Update the drill_times column comment for clarity
COMMENT ON COLUMN workout_completions.drill_times IS 'JSONB storing actual drill completion times: {"drill_id": {"actual_seconds": 165, "required_seconds": 120, "drill_name": "Wall Ball Basics"}}';

COMMENT ON COLUMN workout_completions.required_times IS 'JSONB storing required drill times for reference: {"drill_id": {"required_seconds": 120, "type": "regular|wall_ball"}}';

COMMENT ON COLUMN workout_completions.timer_enforced IS 'Boolean indicating if timer enforcement was active during this workout completion';

COMMENT ON COLUMN workout_completions.drill_completion_details IS 'JSONB storing detailed completion data: {"drill_id": {"started_at": "timestamp", "completed_at": "timestamp", "compliance": true}}';

-- Create an enhanced award_drill_points function that includes timing data
CREATE OR REPLACE FUNCTION award_drill_points_with_timing(
  p_user_id UUID,
  p_drill_id INTEGER,
  p_drill_count INTEGER,
  p_actual_time INTEGER,
  p_required_time INTEGER,
  p_workout_id INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_time_compliance BOOLEAN;
BEGIN
  -- Calculate time compliance
  v_time_compliance = p_actual_time >= p_required_time;
  
  -- Call existing award_drill_points function
  SELECT award_drill_points(p_user_id, p_drill_id, p_drill_count, p_workout_id) INTO v_result;
  
  -- Log timing data in the most recent points transaction
  UPDATE points_transactions_powlax 
  SET multipliers_applied = multipliers_applied || 
    jsonb_build_object(
      'actual_time', p_actual_time,
      'required_time', p_required_time,
      'time_compliance', v_time_compliance,
      'timing_tracked', true
    )
  WHERE user_id = p_user_id 
    AND source_id = p_drill_id::TEXT 
    AND created_at > NOW() - INTERVAL '1 minute'
    AND NOT (multipliers_applied ? 'timing_tracked');
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save complete workout timing data
CREATE OR REPLACE FUNCTION save_workout_timing(
  p_user_id UUID,
  p_workout_id INTEGER,
  p_drill_times JSONB,
  p_total_time INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_required_times JSONB := '{}';
  v_drill_details JSONB := '{}';
  v_drill_id TEXT;
  v_drill_info JSONB;
BEGIN
  -- Build required_times and drill_details from drill_times input
  FOR v_drill_id, v_drill_info IN 
    SELECT key, value 
    FROM jsonb_each(p_drill_times)
  LOOP
    -- Extract required times
    v_required_times = v_required_times || 
      jsonb_build_object(
        v_drill_id, 
        jsonb_build_object(
          'required_seconds', (v_drill_info->>'required_seconds')::INTEGER,
          'type', CASE 
            WHEN v_drill_info->>'drill_name' ILIKE '%wall ball%' THEN 'wall_ball'
            ELSE 'regular'
          END
        )
      );
      
    -- Extract completion details
    v_drill_details = v_drill_details ||
      jsonb_build_object(
        v_drill_id,
        jsonb_build_object(
          'started_at', v_drill_info->>'started_at',
          'completed_at', v_drill_info->>'completed_at', 
          'compliance', (v_drill_info->>'actual_seconds')::INTEGER >= (v_drill_info->>'required_seconds')::INTEGER,
          'drill_name', v_drill_info->>'drill_name'
        )
      );
  END LOOP;
  
  -- Update the most recent workout completion for this user/workout
  UPDATE workout_completions 
  SET 
    drill_times = p_drill_times,
    required_times = v_required_times,
    drill_completion_details = v_drill_details,
    time_taken_seconds = p_total_time,
    timer_enforced = true
  WHERE user_id = p_user_id 
    AND workout_id = p_workout_id 
    AND completed_at > NOW() - INTERVAL '1 hour';
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get timing statistics for a user
CREATE OR REPLACE FUNCTION get_user_timing_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB := '{}';
  v_total_workouts INTEGER;
  v_timer_enforced_workouts INTEGER;
  v_avg_compliance_rate DECIMAL;
BEGIN
  -- Count total workouts
  SELECT COUNT(*) INTO v_total_workouts
  FROM workout_completions
  WHERE user_id = p_user_id;
  
  -- Count timer-enforced workouts
  SELECT COUNT(*) INTO v_timer_enforced_workouts
  FROM workout_completions
  WHERE user_id = p_user_id AND timer_enforced = true;
  
  -- Calculate average compliance rate from drill details
  WITH compliance_data AS (
    SELECT 
      drill_completion_details,
      jsonb_array_length(jsonb_path_query_array(drill_completion_details, '$.*')) as total_drills,
      jsonb_array_length(jsonb_path_query_array(drill_completion_details, '$.* ? (@.compliance == true)')) as compliant_drills
    FROM workout_completions
    WHERE user_id = p_user_id 
      AND timer_enforced = true
      AND drill_completion_details IS NOT NULL
  )
  SELECT COALESCE(AVG(compliant_drills::DECIMAL / NULLIF(total_drills, 0) * 100), 0)
  INTO v_avg_compliance_rate
  FROM compliance_data;
  
  -- Build result
  v_stats = jsonb_build_object(
    'total_workouts', v_total_workouts,
    'timer_enforced_workouts', v_timer_enforced_workouts,
    'average_compliance_rate', v_avg_compliance_rate,
    'last_updated', NOW()
  );
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION award_drill_points_with_timing(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION save_workout_timing(UUID, INTEGER, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_timing_stats(UUID) TO authenticated;

-- Create index for timer enforcement queries
CREATE INDEX IF NOT EXISTS idx_workout_completions_timer_enforced 
ON workout_completions(user_id, timer_enforced, completed_at) 
WHERE timer_enforced = true;

-- Create index for drill timing lookups
CREATE INDEX IF NOT EXISTS idx_workout_completions_drill_times 
ON workout_completions USING GIN(drill_times) 
WHERE drill_times IS NOT NULL;

-- Verify the schema extensions
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'workout_completions' 
  AND column_name IN ('drill_times', 'required_times', 'timer_enforced', 'drill_completion_details')
ORDER BY ordinal_position;

-- Verify the new functions were created
SELECT 
  proname, 
  prorettype::regtype, 
  pronargs 
FROM pg_proc 
WHERE proname IN ('award_drill_points_with_timing', 'save_workout_timing', 'get_user_timing_stats')
ORDER BY proname;

-- Test the schema with a sample query (commented out for safety)
/*
-- Example of the expected drill_times format:
-- {
--   "1": {
--     "drill_name": "Wall Ball Basics",
--     "started_at": "2025-01-11T10:00:00Z",
--     "completed_at": "2025-01-11T10:02:45Z", 
--     "actual_seconds": 165,
--     "required_seconds": 120
--   },
--   "2": {
--     "drill_name": "Catching Practice",
--     "started_at": "2025-01-11T10:03:00Z",
--     "completed_at": "2025-01-11T10:05:30Z",
--     "actual_seconds": 150,
--     "required_seconds": 180
--   }
-- }
*/