-- Migration 118: Create RPC functions for gamification
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md
-- Created: 2025-01-11
-- Purpose: Create award_drill_points, calculate_streak_multiplier, and get_user_points functions

-- Function to calculate streak multiplier
CREATE OR REPLACE FUNCTION calculate_streak_multiplier(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_streak_days INTEGER;
BEGIN
  -- Count consecutive days with workouts (excluding today)
  WITH daily_workouts AS (
    SELECT DATE(completed_at) as workout_date
    FROM workout_completions
    WHERE user_id = p_user_id
      AND completed_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(completed_at)
    ORDER BY workout_date DESC
  ),
  streak_calc AS (
    SELECT 
      workout_date,
      workout_date - (ROW_NUMBER() OVER (ORDER BY workout_date DESC))::INTEGER AS streak_group
    FROM daily_workouts
  )
  SELECT COALESCE(COUNT(DISTINCT workout_date), 0) INTO v_streak_days
  FROM streak_calc
  WHERE streak_group = (
    SELECT streak_group 
    FROM streak_calc 
    LIMIT 1
  );
  
  -- Return multiplier based on streak
  RETURN CASE
    WHEN v_streak_days >= 7 THEN 1.3
    WHEN v_streak_days >= 3 THEN 1.15
    ELSE 1.0
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award points for drill completion
CREATE OR REPLACE FUNCTION award_drill_points(
  p_user_id UUID,
  p_drill_id INTEGER,
  p_drill_count INTEGER,
  p_workout_id INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_base_points JSONB;
  v_drill_multiplier DECIMAL;
  v_streak_multiplier DECIMAL;
  v_final_points JSONB = '{}';
  v_currency TEXT;
  v_base_amount INTEGER;
  v_final_amount INTEGER;
BEGIN
  -- Get base points from drill - check BOTH tables as specified in contract
  SELECT COALESCE(
    (SELECT point_values FROM skills_academy_drills WHERE id = p_drill_id),
    (SELECT point_values FROM wall_ball_drill_library WHERE id = p_drill_id)
  ) INTO v_base_points;
  
  -- If no point_values, use default all-6-currency approach
  IF v_base_points IS NULL THEN
    v_base_points = '{
      "lax_credit": 10,
      "attack_token": 10,
      "defense_dollar": 10,
      "midfield_medal": 10,
      "rebound_reward": 10,
      "flex_points": 10
    }'::JSONB;
  END IF;
  
  -- Calculate drill count multiplier
  v_drill_multiplier = CASE
    WHEN p_drill_count >= 10 THEN 1.5
    WHEN p_drill_count >= 5 THEN 1.2
    ELSE 1.0
  END;
  
  -- Calculate streak multiplier (excluding flex_points)
  v_streak_multiplier = calculate_streak_multiplier(p_user_id);
  
  -- Process each point type
  FOR v_currency, v_base_amount IN 
    SELECT key, value::INTEGER 
    FROM jsonb_each_text(v_base_points)
  LOOP
    -- Apply multipliers (flex_points don't get streak bonus per contract)
    IF v_currency = 'flex_points' THEN
      v_final_amount = FLOOR(v_base_amount * v_drill_multiplier);
    ELSE
      v_final_amount = FLOOR(v_base_amount * v_drill_multiplier * v_streak_multiplier);
    END IF;
    
    -- Update wallet
    INSERT INTO user_points_wallets (user_id, currency, balance)
    VALUES (p_user_id, v_currency, v_final_amount)
    ON CONFLICT (user_id, currency) 
    DO UPDATE SET 
      balance = user_points_wallets.balance + v_final_amount,
      updated_at = NOW();
    
    -- Log transaction
    INSERT INTO points_transactions_powlax (
      user_id, currency, amount, transaction_type,
      source_type, source_id, drill_count,
      multipliers_applied
    ) VALUES (
      p_user_id, v_currency, v_final_amount, 'earned',
      'drill', p_drill_id::TEXT, p_drill_count,
      jsonb_build_object(
        'drill_multiplier', v_drill_multiplier,
        'streak_multiplier', CASE 
          WHEN v_currency = 'flex_points' THEN 1.0 
          ELSE v_streak_multiplier 
        END
      )
    );
    
    -- Add to result
    v_final_points = v_final_points || 
      jsonb_build_object(v_currency, v_final_amount);
  END LOOP;
  
  -- Update progress tracking
  INSERT INTO skills_academy_user_progress (
    user_id, action, entity_type, entity_id
  ) VALUES (
    p_user_id, 'drill_completed', 'drill', p_drill_id::TEXT
  );
  
  RETURN v_final_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current points
CREATE OR REPLACE FUNCTION get_user_points(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(
    (SELECT jsonb_object_agg(currency, balance)
     FROM user_points_wallets
     WHERE user_id = p_user_id),
    '{}'::JSONB
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION award_drill_points(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_streak_multiplier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_points(UUID) TO authenticated;

-- Verify functions were created
SELECT 
  proname, 
  prorettype::regtype, 
  pronargs 
FROM pg_proc 
WHERE proname IN ('award_drill_points', 'calculate_streak_multiplier', 'get_user_points');