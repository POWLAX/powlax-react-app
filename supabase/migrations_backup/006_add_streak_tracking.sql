-- Add streak tracking fields for users
-- Phase 1: Anti-Gaming Foundation

-- Create user_streak_data table since we can't modify auth.users directly
CREATE TABLE IF NOT EXISTS user_streak_data (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_freeze_count INTEGER DEFAULT 2,
    last_freeze_used DATE,
    total_workouts_completed INTEGER DEFAULT 0,
    streak_milestone_reached INTEGER DEFAULT 0, -- Highest milestone reached (7, 30, 100)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically create streak data for new users
CREATE OR REPLACE FUNCTION create_user_streak_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_streak_data (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create streak data
DROP TRIGGER IF EXISTS create_user_streak_data_trigger ON auth.users;
CREATE TRIGGER create_user_streak_data_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_streak_data();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streak_data_activity ON user_streak_data(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_user_streak_data_streak ON user_streak_data(current_streak DESC);

-- Create function to update streak data
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    streak_data user_streak_data%ROWTYPE;
    today_date DATE := CURRENT_DATE;
    days_since_activity INTEGER;
    result JSONB;
BEGIN
    -- Get current streak data
    SELECT * INTO streak_data FROM user_streak_data WHERE user_id = user_uuid;
    
    -- Create record if doesn't exist
    IF NOT FOUND THEN
        INSERT INTO user_streak_data (user_id, last_activity_date)
        VALUES (user_uuid, today_date)
        RETURNING * INTO streak_data;
    END IF;
    
    -- If already active today, return current data
    IF streak_data.last_activity_date = today_date THEN
        RETURN jsonb_build_object(
            'current_streak', streak_data.current_streak,
            'longest_streak', streak_data.longest_streak,
            'already_today', true
        );
    END IF;
    
    -- Calculate days since last activity
    days_since_activity := COALESCE(today_date - streak_data.last_activity_date, 0);
    
    -- Update streak logic
    IF days_since_activity = 1 THEN
        -- Continue streak
        streak_data.current_streak := streak_data.current_streak + 1;
        streak_data.longest_streak := GREATEST(streak_data.longest_streak, streak_data.current_streak);
    ELSIF days_since_activity > 1 THEN
        -- Check if can use streak freeze (within 3 days and has freezes left)
        IF days_since_activity <= 3 AND 
           streak_data.streak_freeze_count > 0 AND 
           (streak_data.last_freeze_used IS NULL OR streak_data.last_freeze_used < today_date - INTERVAL '7 days') THEN
            -- Use freeze, maintain streak
            streak_data.streak_freeze_count := streak_data.streak_freeze_count - 1;
            streak_data.last_freeze_used := today_date;
            streak_data.current_streak := streak_data.current_streak + 1;
        ELSE
            -- Reset streak
            streak_data.current_streak := 1;
        END IF;
    ELSE
        -- First activity ever
        streak_data.current_streak := 1;
    END IF;
    
    -- Update counters
    streak_data.total_workouts_completed := streak_data.total_workouts_completed + 1;
    streak_data.last_activity_date := today_date;
    streak_data.updated_at := NOW();
    
    -- Check for milestone achievements
    IF streak_data.current_streak >= 100 AND streak_data.streak_milestone_reached < 100 THEN
        streak_data.streak_milestone_reached := 100;
    ELSIF streak_data.current_streak >= 30 AND streak_data.streak_milestone_reached < 30 THEN
        streak_data.streak_milestone_reached := 30;
    ELSIF streak_data.current_streak >= 7 AND streak_data.streak_milestone_reached < 7 THEN
        streak_data.streak_milestone_reached := 7;
    END IF;
    
    -- Save updated data
    UPDATE user_streak_data SET
        current_streak = streak_data.current_streak,
        longest_streak = streak_data.longest_streak,
        last_activity_date = streak_data.last_activity_date,
        streak_freeze_count = streak_data.streak_freeze_count,
        last_freeze_used = streak_data.last_freeze_used,
        total_workouts_completed = streak_data.total_workouts_completed,
        streak_milestone_reached = streak_data.streak_milestone_reached,
        updated_at = streak_data.updated_at
    WHERE user_id = user_uuid;
    
    -- Return result
    result := jsonb_build_object(
        'current_streak', streak_data.current_streak,
        'longest_streak', streak_data.longest_streak,
        'milestone_reached', CASE 
            WHEN streak_data.current_streak = streak_data.streak_milestone_reached 
            THEN streak_data.streak_milestone_reached 
            ELSE null 
        END,
        'freezes_remaining', streak_data.streak_freeze_count,
        'already_today', false
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_streak_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own streak data" ON user_streak_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data" ON user_streak_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data" ON user_streak_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create view for easy access
CREATE OR REPLACE VIEW user_streak_view AS
SELECT 
    usd.*,
    CASE 
        WHEN current_streak >= 100 THEN 'Century Club'
        WHEN current_streak >= 30 THEN 'Monthly Master' 
        WHEN current_streak >= 7 THEN 'Weekly Warrior'
        WHEN current_streak >= 3 THEN 'Building Momentum'
        ELSE 'Getting Started'
    END as streak_title
FROM user_streak_data usd;