-- COMPLETE GAMIFICATION SETUP SCRIPT
-- Run this entire script to set up the gamification system
-- Created: 2025-01-11
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md

-- ============================================
-- STEP 1: Initialize User Points Wallets
-- ============================================

-- Initialize user_points_wallets for all users with all 6 point types
INSERT INTO user_points_wallets (user_id, currency, balance, updated_at)
SELECT 
  u.id,
  pt.currency_type,
  0,
  NOW()
FROM users u
CROSS JOIN (
  VALUES 
    ('lax_credit'),
    ('attack_token'), 
    ('defense_dollar'),
    ('midfield_medal'),
    ('rebound_reward'),
    ('flex_points')
) AS pt(currency_type)
ON CONFLICT (user_id, currency) DO NOTHING;

-- Verify wallet initialization
SELECT 
  'Step 1: Wallets initialized' as step,
  COUNT(*) as total_wallet_records,
  COUNT(DISTINCT user_id) as users_with_wallets
FROM user_points_wallets;

-- ============================================
-- STEP 2: Create Points Transaction Table
-- ============================================

CREATE TABLE IF NOT EXISTS points_transactions_powlax (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus'
  source_type TEXT, -- 'drill', 'workout', 'streak', 'track'
  source_id TEXT, -- drill_id or workout_id
  drill_count INTEGER, -- Number of drills for multiplier
  multipliers_applied JSONB, -- {"drill": 1.2, "streak": 1.15}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user 
  ON points_transactions_powlax(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created 
  ON points_transactions_powlax(created_at);

-- ============================================
-- STEP 3: Create Workout Completions Table
-- ============================================

CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  workout_id INTEGER REFERENCES skills_academy_workouts(id),
  series_id INTEGER REFERENCES skills_academy_series(id),
  drill_ids INTEGER[], -- Array of completed drill IDs
  drills_completed INTEGER NOT NULL,
  total_drills INTEGER NOT NULL,
  completion_percentage DECIMAL(5,2),
  points_earned JSONB, -- {"lax_credit": 150, "attack_token": 150, ...}
  time_taken_seconds INTEGER,
  drill_times JSONB, -- {"drill_1": 120, "drill_2": 180, ...}
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for streak calculation
CREATE INDEX IF NOT EXISTS idx_workout_completions_user_date 
  ON workout_completions(user_id, completed_at);

-- ============================================
-- STEP 4: Create RPC Functions
-- ============================================

-- Function to calculate streak multiplier
CREATE OR REPLACE FUNCTION calculate_streak_multiplier(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_streak_days INTEGER;
BEGIN
  -- Count consecutive days with workouts
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
  SELECT COUNT(DISTINCT workout_date) INTO v_streak_days
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
$$ LANGUAGE plpgsql;

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
  -- Get base points from drill (check both tables)
  SELECT COALESCE(
    (SELECT point_values FROM skills_academy_drills WHERE id = p_drill_id),
    (SELECT point_values FROM wall_ball_drill_library WHERE id = p_drill_id)
  ) INTO v_base_points;
  
  -- If no point_values, use defaults (10 points for each currency)
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
  
  -- Calculate streak multiplier
  v_streak_multiplier = calculate_streak_multiplier(p_user_id);
  
  -- Process each point type
  FOR v_currency, v_base_amount IN 
    SELECT key, value::INTEGER 
    FROM jsonb_each_text(v_base_points)
  LOOP
    -- Apply multipliers (flex_points don't get streak bonus)
    IF v_currency = 'flex_points' THEN
      v_final_amount = FLOOR(v_base_amount * v_drill_multiplier);
    ELSE
      v_final_amount = FLOOR(v_base_amount * v_drill_multiplier * v_streak_multiplier);
    END IF;
    
    -- Update wallet
    INSERT INTO user_points_wallets (user_id, currency, balance, updated_at)
    VALUES (p_user_id, v_currency, v_final_amount, NOW())
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
    user_id, action, entity_type
  ) VALUES (
    p_user_id, 'drill_completed', 'drill'
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

-- ============================================
-- STEP 5: Set up RLS Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE user_points_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users read own points" ON user_points_wallets;
DROP POLICY IF EXISTS "Users read own transactions" ON points_transactions_powlax;
DROP POLICY IF EXISTS "Users read own completions" ON workout_completions;
DROP POLICY IF EXISTS "Service role all access wallets" ON user_points_wallets;
DROP POLICY IF EXISTS "Service role all access transactions" ON points_transactions_powlax;
DROP POLICY IF EXISTS "Service role all access completions" ON workout_completions;

-- Users can read their own data
CREATE POLICY "Users read own points" ON user_points_wallets
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users read own transactions" ON points_transactions_powlax
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users read own completions" ON workout_completions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role all access wallets" ON user_points_wallets
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role all access transactions" ON points_transactions_powlax
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role all access completions" ON workout_completions
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.jwt()->>'role' = 'service_role'
  );

-- ============================================
-- STEP 6: Verification Queries
-- ============================================

-- Check wallet initialization
SELECT 
  'Wallets' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT currency) as unique_currencies
FROM user_points_wallets;

-- Check if tables were created
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'Created'
    ELSE 'Not Created'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'points_transactions_powlax',
    'workout_completions'
  );

-- Check if functions were created
SELECT 
  routine_name,
  'Created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'award_drill_points',
    'calculate_streak_multiplier',
    'get_user_points'
  );

-- Test the functions (replace with actual user_id)
-- SELECT get_user_points('YOUR_USER_ID_HERE'::UUID);

-- ============================================
-- FINAL STATUS
-- ============================================
SELECT 
  'Gamification setup complete!' as message,
  NOW() as completed_at;