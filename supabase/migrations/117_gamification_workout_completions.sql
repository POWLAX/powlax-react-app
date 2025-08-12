-- Migration 117: Create workout_completions table
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md
-- Created: 2025-01-11
-- Purpose: Track workout completions for streak calculations

-- Create workout_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS workout_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  workout_id INTEGER REFERENCES skills_academy_workouts(id),
  series_id INTEGER REFERENCES skills_academy_series(id),
  drill_ids INTEGER[], -- Array of completed drill IDs
  drills_completed INTEGER NOT NULL,
  total_drills INTEGER NOT NULL,
  completion_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_drills > 0 THEN (drills_completed::decimal / total_drills::decimal) * 100
      ELSE 0 
    END
  ) STORED,
  points_earned JSONB, -- {"lax_credit": 150, "attack_token": 150, ...}
  time_taken_seconds INTEGER,
  drill_times JSONB, -- {"drill_1": 120, "drill_2": 180, ...}
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_drills_completed CHECK (drills_completed >= 0),
  CONSTRAINT positive_total_drills CHECK (total_drills > 0),
  CONSTRAINT drills_completed_not_greater_than_total CHECK (drills_completed <= total_drills)
);

-- Create indexes for performance and streak calculations
CREATE INDEX IF NOT EXISTS idx_workout_completions_user_id 
ON workout_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_completions_user_date 
ON workout_completions(user_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_workout_completions_workout_id 
ON workout_completions(workout_id);

CREATE INDEX IF NOT EXISTS idx_workout_completions_series_id 
ON workout_completions(series_id);

-- Index for streak calculation optimization (user + date only)
CREATE INDEX IF NOT EXISTS idx_workout_completions_streak_calc 
ON workout_completions(user_id, DATE(completed_at));

-- Add RLS policy
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own workout completions
CREATE POLICY "Users can view their own workout completions" 
ON workout_completions FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert workout completions (handled by RPC functions)
CREATE POLICY "System can insert workout completions" 
ON workout_completions FOR INSERT 
WITH CHECK (true);

-- Users can update their own incomplete workout completions
CREATE POLICY "Users can update their own workout completions" 
ON workout_completions FOR UPDATE 
USING (auth.uid() = user_id);

-- Verify table creation
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'workout_completions';