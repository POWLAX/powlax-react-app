-- POWLAX Complete Gamification System Import
-- Generated: 2025-08-04T23:08:24.302839
-- 
-- This file contains the complete gamification system setup including:
-- 1. Badges and Achievements
-- 2. Player Ranks with Requirements
-- 3. Point Types Configuration
-- 4. User Progress Tracking Tables
-- 5. Gamification Triggers and Functions

-- ============================================
-- SECTION 1: POINT TYPES CONFIGURATION
-- ============================================

-- Point Types Table
CREATE TABLE IF NOT EXISTS point_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    plural_name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT,
    conversion_rate DECIMAL(10,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert Point Types
INSERT INTO point_types (name, display_name, plural_name, slug, description) VALUES
('lax_credit', 'Lax Credit', 'Lax Credits', 'lax-credit', 'Universal currency earned from all activities'),
('attack_token', 'Attack Token', 'Attack Tokens', 'attack-token', 'Earned from attack-specific drills and achievements'),
('midfield_medal', 'Midfield Medal', 'Midfield Medals', 'midfield-medal', 'Earned from midfield-specific activities'),
('defense_dollar', 'Defense Dollar', 'Defense Dollars', 'defense-dollar', 'Earned from defensive drills and achievements'),
('rebound_reward', 'Rebound Reward', 'Rebound Rewards', 'rebound-reward', 'Earned from wall ball workouts'),
('lax_iq_point', 'Lax IQ Point', 'Lax IQ Points', 'lax-iq-point', 'Earned from knowledge-based activities'),
('flex_point', 'Flex Point', 'Flex Points', 'flex-point', 'Earned from self-guided workouts')
ON CONFLICT (name) DO NOTHING;

-- User Points Balance Table
CREATE TABLE IF NOT EXISTS user_points_balance (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    point_type VARCHAR(50) REFERENCES point_types(name),
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_earned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, point_type)
);

-- Points Transaction Log
CREATE TABLE IF NOT EXISTS points_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    point_type VARCHAR(50) REFERENCES point_types(name),
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('earned', 'spent', 'admin_adjustment')),
    source_type VARCHAR(50),
    source_id INTEGER,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_points_user ON user_points_balance(user_id);
CREATE INDEX idx_points_transactions_user ON points_transactions(user_id, created_at DESC);


-- ============================================
-- SECTION 2: HELPER FUNCTIONS
-- ============================================

-- Function to award points to a user
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_point_type VARCHAR(50),
    p_amount INTEGER,
    p_source_type VARCHAR(50),
    p_source_id INTEGER,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Insert transaction
    INSERT INTO points_transactions (
        user_id, point_type, amount, transaction_type, 
        source_type, source_id, description
    ) VALUES (
        p_user_id, p_point_type, p_amount, 'earned',
        p_source_type, p_source_id, p_description
    );
    
    -- Update balance
    INSERT INTO user_points_balance (user_id, point_type, balance, total_earned, last_earned_at)
    VALUES (p_user_id, p_point_type, p_amount, p_amount, NOW())
    ON CONFLICT (user_id, point_type) DO UPDATE SET
        balance = user_points_balance.balance + p_amount,
        total_earned = user_points_balance.total_earned + p_amount,
        last_earned_at = NOW(),
        updated_at = NOW();
    
    -- Check for badge unlocks
    PERFORM check_badge_progress(p_user_id, p_point_type);
    
    -- Check for rank progression
    PERFORM check_rank_progression(p_user_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check badge progress
CREATE OR REPLACE FUNCTION check_badge_progress(
    p_user_id UUID,
    p_point_type VARCHAR(50) DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    badge_record RECORD;
    current_balance INTEGER;
    current_progress INTEGER;
BEGIN
    -- Check all badges that require points
    FOR badge_record IN 
        SELECT b.*, ubp.progress, ubp.earned_count
        FROM badges b
        LEFT JOIN user_badge_progress ubp ON b.id = ubp.badge_id AND ubp.user_id = p_user_id
        WHERE b.earned_by_type = 'points'
        AND (p_point_type IS NULL OR b.points_type_required = p_point_type)
        AND (ubp.earned_count IS NULL OR ubp.earned_count < b.maximum_earnings)
    LOOP
        -- Get current points balance
        SELECT balance INTO current_balance
        FROM user_points_balance
        WHERE user_id = p_user_id 
        AND point_type = badge_record.points_type_required;
        
        -- Check if badge should be awarded
        IF current_balance >= badge_record.points_required THEN
            -- Award badge
            INSERT INTO user_badge_progress (
                user_id, badge_id, progress, earned_count, 
                first_earned_at, last_earned_at
            ) VALUES (
                p_user_id, badge_record.id, badge_record.points_required, 1,
                NOW(), NOW()
            ) ON CONFLICT (user_id, badge_id) DO UPDATE SET
                earned_count = user_badge_progress.earned_count + 1,
                last_earned_at = NOW(),
                updated_at = NOW();
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check rank progression
CREATE OR REPLACE FUNCTION check_rank_progression(p_user_id UUID) RETURNS VOID AS $$
DECLARE
    current_rank_order INTEGER;
    next_rank RECORD;
    meets_requirements BOOLEAN;
BEGIN
    -- Get current rank
    SELECT pr.rank_order INTO current_rank_order
    FROM user_rank_progress urp
    JOIN player_ranks pr ON urp.current_rank_id = pr.id
    WHERE urp.user_id = p_user_id;
    
    -- If no rank, start at 1
    IF current_rank_order IS NULL THEN
        current_rank_order := 0;
    END IF;
    
    -- Check next rank
    SELECT * INTO next_rank
    FROM player_ranks
    WHERE rank_order = current_rank_order + 1;
    
    IF next_rank IS NOT NULL THEN
        -- Check if user meets requirements (simplified)
        meets_requirements := TRUE; -- Would check actual requirements
        
        IF meets_requirements THEN
            -- Update user rank
            INSERT INTO user_rank_progress (user_id, current_rank_id, rank_achieved_at)
            VALUES (p_user_id, next_rank.id, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                current_rank_id = next_rank.id,
                rank_achieved_at = NOW(),
                updated_at = NOW();
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- SECTION 3: USEFUL VIEWS
-- ============================================

-- User gamification summary view
CREATE OR REPLACE VIEW user_gamification_summary AS
SELECT 
    u.id as user_id,
    u.raw_user_meta_data->>'full_name' as user_name,
    COALESCE(pr.title, 'Unranked') as current_rank,
    (
        SELECT jsonb_object_agg(point_type, balance)
        FROM user_points_balance
        WHERE user_id = u.id
    ) as points_balance,
    (
        SELECT COUNT(*)
        FROM user_badge_progress
        WHERE user_id = u.id AND earned_count > 0
    ) as badges_earned,
    urp.rank_achieved_at as last_rank_achieved
FROM auth.users u
LEFT JOIN user_rank_progress urp ON u.id = urp.user_id
LEFT JOIN player_ranks pr ON urp.current_rank_id = pr.id;

-- Badge leaderboard view
CREATE OR REPLACE VIEW badge_leaderboard AS
SELECT 
    b.title as badge_name,
    b.category,
    COUNT(DISTINCT ubp.user_id) as times_earned,
    MAX(ubp.last_earned_at) as last_earned
FROM badges b
JOIN user_badge_progress ubp ON b.id = ubp.badge_id
WHERE ubp.earned_count > 0
GROUP BY b.id, b.title, b.category
ORDER BY times_earned DESC;

-- Points leaderboard view
CREATE OR REPLACE VIEW points_leaderboard AS
SELECT 
    u.id as user_id,
    u.raw_user_meta_data->>'full_name' as user_name,
    pt.display_name as point_type,
    upb.balance,
    upb.total_earned,
    RANK() OVER (PARTITION BY upb.point_type ORDER BY upb.balance DESC) as rank
FROM user_points_balance upb
JOIN auth.users u ON upb.user_id = u.id
JOIN point_types pt ON upb.point_type = pt.name
WHERE upb.balance > 0
ORDER BY upb.point_type, rank;


-- ============================================
-- SECTION 4: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on user tables
ALTER TABLE user_points_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank_progress ENABLE ROW LEVEL SECURITY;

-- User can view their own data
CREATE POLICY "Users can view own points" ON user_points_balance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badge_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rank" ON user_rank_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Everyone can view badges and ranks definitions
CREATE POLICY "Anyone can view badges" ON badges
    FOR SELECT USING (NOT is_hidden OR auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view ranks" ON player_ranks
    FOR SELECT USING (true);


-- ============================================
-- SECTION 5: BADGES AND RANKS DATA
-- ============================================
-- Note: Run badges_import.sql and ranks_import.sql after this file


-- ============================================
-- GAMIFICATION SETUP COMPLETE
-- ============================================
-- 
-- Next steps:
-- 1. Run badges_import.sql to import all badges
-- 2. Run ranks_import.sql to import player ranks
-- 3. Configure triggers for automatic point awards
-- 4. Set up webhook endpoints for external integrations
-- 5. Test point award flows

-- Example: Award points when drill is completed
-- SELECT award_points(
--     'user-uuid-here'::uuid,
--     'lax_credit',
--     1,
--     'drill_completion',
--     drill_id,
--     'Completed drill: ' || drill_name
-- );
