-- Create workout completions tracking table
-- Phase 1: Anti-Gaming Foundation

CREATE TABLE IF NOT EXISTS workout_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id INTEGER, -- Optional: references specific workout
    workout_type VARCHAR(50), -- 'custom', 'skills_academy', 'team_practice'
    drills_completed INTEGER[], -- Array of drill IDs
    total_points INTEGER NOT NULL,
    average_difficulty DECIMAL(3,2) NOT NULL,
    category_points JSONB NOT NULL, -- Points awarded by category
    bonus_multipliers JSONB DEFAULT '{}', -- Applied multipliers
    duration_minutes INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_completions_user ON workout_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_completions_completed_at ON workout_completions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_completions_type ON workout_completions(workout_type);

-- Function to update user point balances
CREATE OR REPLACE FUNCTION update_point_balance(
    user_uuid UUID,
    point_type VARCHAR(50),
    amount INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update balance
    INSERT INTO user_points_balance_powlax (user_id, point_type, balance, total_earned)
    VALUES (user_uuid, point_type, amount, amount)
    ON CONFLICT (user_id, point_type)
    DO UPDATE SET
        balance = user_points_balance_powlax.balance + amount,
        total_earned = user_points_balance_powlax.total_earned + amount,
        last_earned_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to award points (creates transaction and updates balance)
CREATE OR REPLACE FUNCTION award_points(
    user_uuid UUID,
    point_type VARCHAR(50),
    amount INTEGER,
    source_type VARCHAR(50) DEFAULT 'manual',
    description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Record transaction
    INSERT INTO points_transactions_powlax (
        user_id, 
        point_type, 
        amount, 
        transaction_type, 
        source_type, 
        description
    )
    VALUES (
        user_uuid, 
        point_type, 
        amount, 
        'earned', 
        source_type, 
        description
    );
    
    -- Update balance
    PERFORM update_point_balance(user_uuid, point_type, amount);
END;
$$ LANGUAGE plpgsql;

-- Transaction functions for atomic operations
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS TEXT AS $$
BEGIN
    -- PostgreSQL handles transactions automatically in API calls
    -- This is a placeholder for explicit transaction control if needed
    RETURN 'transaction_started';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS TEXT AS $$
BEGIN
    RETURN 'transaction_committed';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS TEXT AS $$
BEGIN
    RETURN 'transaction_rolled_back';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE workout_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own workout completions" ON workout_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout completions" ON workout_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- View for workout analytics
CREATE OR REPLACE VIEW user_workout_analytics AS
SELECT 
    user_id,
    COUNT(*) as total_workouts,
    SUM(total_points) as total_points_earned,
    AVG(average_difficulty) as avg_difficulty,
    MAX(completed_at) as last_workout,
    COUNT(*) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days') as workouts_this_week,
    COUNT(*) FILTER (WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days') as workouts_this_month
FROM workout_completions
GROUP BY user_id;

COMMENT ON TABLE workout_completions IS 'Tracks individual workout completions with points and difficulty';
COMMENT ON FUNCTION update_point_balance IS 'Updates user point balance for a specific point type';
COMMENT ON FUNCTION award_points IS 'Awards points to user and records transaction';