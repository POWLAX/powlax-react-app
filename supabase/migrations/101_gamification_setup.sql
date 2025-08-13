-- Gamification Setup: Badges and Ranks System
-- Created: 2025-01-13
-- Purpose: Create complete badges system with definitions and populate ranks for Skills Academy

-- ===============================
-- 1. CREATE BADGE DEFINITIONS TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS badge_definitions_powlax (
    id SERIAL PRIMARY KEY,
    badge_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'workout_completion', 'points', 'streaks', 'specialist', 'special'
    requirement_type VARCHAR(50) NOT NULL, -- 'count', 'points', 'streak', 'achievement'
    requirement_value INTEGER NOT NULL DEFAULT 0,
    requirement_context VARCHAR(100), -- 'workouts', 'attack_workouts', 'defense_workouts', etc.
    icon_url TEXT,
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points_award INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_badge_definitions_category ON badge_definitions_powlax(category);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_active ON badge_definitions_powlax(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_badge_definitions_rarity ON badge_definitions_powlax(rarity);

-- ===============================
-- 2. POPULATE BADGE DEFINITIONS
-- ===============================

INSERT INTO badge_definitions_powlax (
    badge_key, name, description, category, requirement_type, requirement_value, requirement_context, 
    icon_url, rarity, points_award, sort_order
) VALUES 
-- Workout Completion Badges
('first_workout', 'First Steps', 'Complete your first workout', 'workout_completion', 'count', 1, 'workouts', '/images/badges/first-workout.png', 'common', 50, 1),
('five_workouts', 'Getting Started', 'Complete 5 workouts', 'workout_completion', 'count', 5, 'workouts', '/images/badges/five-workouts.png', 'common', 100, 2),
('ten_workouts', 'Committed', 'Complete 10 workouts', 'workout_completion', 'count', 10, 'workouts', '/images/badges/ten-workouts.png', 'rare', 200, 3),
('twenty_five_workouts', 'Dedicated', 'Complete 25 workouts', 'workout_completion', 'count', 25, 'workouts', '/images/badges/twenty-five-workouts.png', 'rare', 500, 4),
('fifty_workouts', 'Grinder', 'Complete 50 workouts', 'workout_completion', 'count', 50, 'workouts', '/images/badges/fifty-workouts.png', 'epic', 1000, 5),

-- Point Milestone Badges
('points_100', 'Point Getter', 'Earn 100 academy points', 'points', 'points', 100, 'academy_points', '/images/badges/points-100.png', 'common', 25, 11),
('points_500', 'Point Collector', 'Earn 500 academy points', 'points', 'points', 500, 'academy_points', '/images/badges/points-500.png', 'common', 50, 12),
('points_1000', 'Point Master', 'Earn 1000 academy points', 'points', 'points', 1000, 'academy_points', '/images/badges/points-1000.png', 'rare', 100, 13),
('points_5000', 'Point Champion', 'Earn 5000 academy points', 'points', 'points', 5000, 'academy_points', '/images/badges/points-5000.png', 'epic', 250, 14),
('points_10000', 'Point Legend', 'Earn 10000 academy points', 'points', 'points', 10000, 'academy_points', '/images/badges/points-10000.png', 'legendary', 500, 15),

-- Streak Badges
('streak_3', 'Consistent', 'Complete workouts 3 days in a row', 'streaks', 'streak', 3, 'daily_workouts', '/images/badges/streak-3.png', 'common', 150, 21),
('streak_7', 'Weekly Warrior', 'Complete workouts 7 days in a row', 'streaks', 'streak', 7, 'daily_workouts', '/images/badges/streak-7.png', 'rare', 350, 22),
('streak_14', 'Two Week Terror', 'Complete workouts 14 days in a row', 'streaks', 'streak', 14, 'daily_workouts', '/images/badges/streak-14.png', 'epic', 750, 23),
('streak_30', 'Monthly Master', 'Complete workouts 30 days in a row', 'streaks', 'streak', 30, 'daily_workouts', '/images/badges/streak-30.png', 'legendary', 1500, 24),

-- Series Specialist Badges
('attack_master', 'Attack Master', 'Complete 10 attack workouts', 'specialist', 'count', 10, 'attack_workouts', '/images/badges/attack-master.png', 'rare', 300, 31),
('defense_expert', 'Defense Expert', 'Complete 10 defense workouts', 'specialist', 'count', 10, 'defense_workouts', '/images/badges/defense-expert.png', 'rare', 300, 32),
('midfield_champion', 'Midfield Champion', 'Complete 10 midfield workouts', 'specialist', 'count', 10, 'midfield_workouts', '/images/badges/midfield-champion.png', 'rare', 300, 33),
('wall_ball_warrior', 'Wall Ball Warrior', 'Complete 10 wall ball workouts', 'specialist', 'count', 10, 'wall_ball_workouts', '/images/badges/wall-ball-warrior.png', 'rare', 300, 34),

-- Special Achievement Badges
('perfect_week', 'Perfect Week', 'Complete 7 workouts in 7 days', 'special', 'achievement', 7, 'perfect_week', '/images/badges/perfect-week.png', 'epic', 500, 41),
('early_bird', 'Early Bird', 'Complete 5 workouts before 8 AM', 'special', 'achievement', 5, 'early_morning', '/images/badges/early-bird.png', 'rare', 250, 42),
('night_owl', 'Night Owl', 'Complete 5 workouts after 8 PM', 'special', 'achievement', 5, 'late_evening', '/images/badges/night-owl.png', 'rare', 250, 43);

-- ===============================
-- 3. UPDATE EXISTING RANKS (IF NEEDED)
-- ===============================

-- Clear any test data and ensure proper rank structure
DELETE FROM powlax_player_ranks WHERE title LIKE 'Test%' OR title LIKE '%test%';

-- Insert or update rank definitions (Skills Academy focused)
INSERT INTO powlax_player_ranks (
    title, description, rank_order, lax_credits_required, icon_url, gender, metadata
) VALUES 
('Rookie', 'Just starting your lacrosse journey', 1, 0, '/images/ranks/rookie.png', 'all', '{"color": "#8B4513", "min_points": 0, "max_points": 99}'),
('Junior Varsity', 'Building fundamental skills', 2, 100, '/images/ranks/jv.png', 'all', '{"color": "#4682B4", "min_points": 100, "max_points": 499}'),
('Varsity', 'Developing advanced techniques', 3, 500, '/images/ranks/varsity.png', 'all', '{"color": "#32CD32", "min_points": 500, "max_points": 999}'),
('All-Conference', 'Regional standout player', 4, 1000, '/images/ranks/all-conference.png', 'all', '{"color": "#FF6347", "min_points": 1000, "max_points": 2499}'),
('All-State', 'State-level elite player', 5, 2500, '/images/ranks/all-state.png', 'all', '{"color": "#4169E1", "min_points": 2500, "max_points": 4999}'),
('All-American', 'National recognition level', 6, 5000, '/images/ranks/all-american.png', 'all', '{"color": "#8A2BE2", "min_points": 5000, "max_points": 9999}'),
('Elite', 'Top-tier player status', 7, 10000, '/images/ranks/elite.png', 'all', '{"color": "#FFD700", "min_points": 10000, "max_points": 24999}'),
('Legend', 'Legendary skill level', 8, 25000, '/images/ranks/legend.png', 'all', '{"color": "#FF4500", "min_points": 25000, "max_points": 49999}'),
('Hall of Fame', 'Historic greatness', 9, 50000, '/images/ranks/hall-of-fame.png', 'all', '{"color": "#DC143C", "min_points": 50000, "max_points": 99999}'),
('GOAT', 'Greatest of All Time', 10, 100000, '/images/ranks/goat.png', 'all', '{"color": "#000000", "min_points": 100000, "max_points": null}')
ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    rank_order = EXCLUDED.rank_order,
    lax_credits_required = EXCLUDED.lax_credits_required,
    icon_url = EXCLUDED.icon_url,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ===============================
-- 4. CREATE RPC FUNCTIONS
-- ===============================

-- Function to calculate user rank based on points
CREATE OR REPLACE FUNCTION calculate_user_rank(p_user_id UUID)
RETURNS TABLE(rank_title TEXT, rank_order INTEGER, points_needed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_points INTEGER := 0;
    current_rank RECORD;
BEGIN
    -- Get user's academy points
    SELECT COALESCE(balance, 0) INTO user_points
    FROM user_points_wallets
    WHERE user_id = p_user_id AND currency = 'academy_points';
    
    -- Find appropriate rank
    SELECT title, rank_order, lax_credits_required
    INTO current_rank
    FROM powlax_player_ranks
    WHERE lax_credits_required <= user_points
    ORDER BY rank_order DESC
    LIMIT 1;
    
    -- If no rank found, default to Rookie
    IF current_rank IS NULL THEN
        SELECT title, rank_order, lax_credits_required
        INTO current_rank
        FROM powlax_player_ranks
        WHERE rank_order = 1;
    END IF;
    
    -- Calculate points needed for next rank
    RETURN QUERY
    SELECT 
        current_rank.title,
        current_rank.rank_order,
        COALESCE(
            (SELECT lax_credits_required - user_points 
             FROM powlax_player_ranks 
             WHERE rank_order = current_rank.rank_order + 1),
            0
        );
END;
$$;

-- Function to check badge eligibility
CREATE OR REPLACE FUNCTION check_badge_eligibility(p_user_id UUID)
RETURNS TABLE(badge_key TEXT, badge_name TEXT, description TEXT, points_award INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_points INTEGER := 0;
    workout_count INTEGER := 0;
    badge_rec RECORD;
BEGIN
    -- Get user's current stats
    SELECT COALESCE(balance, 0) INTO user_points
    FROM user_points_wallets
    WHERE user_id = p_user_id AND currency = 'academy_points';
    
    -- Get workout completion count
    SELECT COUNT(*) INTO workout_count
    FROM skills_academy_user_progress
    WHERE user_id = p_user_id;
    
    -- Check each badge definition
    FOR badge_rec IN 
        SELECT bd.badge_key, bd.name, bd.description, bd.requirement_type, 
               bd.requirement_value, bd.requirement_context, bd.points_award
        FROM badge_definitions_powlax bd
        WHERE bd.is_active = true
        AND bd.badge_key NOT IN (
            SELECT ub.badge_key 
            FROM user_badges ub 
            WHERE ub.user_id = p_user_id
        )
    LOOP
        -- Check if user meets requirements
        IF (badge_rec.requirement_type = 'points' AND user_points >= badge_rec.requirement_value) OR
           (badge_rec.requirement_type = 'count' AND badge_rec.requirement_context = 'workouts' AND workout_count >= badge_rec.requirement_value)
        THEN
            RETURN QUERY SELECT badge_rec.badge_key, badge_rec.name, badge_rec.description, badge_rec.points_award;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- Function to award badge to user
CREATE OR REPLACE FUNCTION award_badge(p_user_id UUID, p_badge_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    badge_info RECORD;
    success BOOLEAN := false;
BEGIN
    -- Get badge information
    SELECT name, points_award
    INTO badge_info
    FROM badge_definitions_powlax
    WHERE badge_key = p_badge_key AND is_active = true;
    
    IF badge_info IS NOT NULL THEN
        -- Award the badge
        INSERT INTO user_badges (user_id, badge_key, badge_name, awarded_at, source)
        VALUES (p_user_id, p_badge_key, badge_info.name, NOW(), 'system')
        ON CONFLICT (user_id, badge_key) DO NOTHING;
        
        -- Award points if applicable
        IF badge_info.points_award > 0 THEN
            -- Add points transaction
            INSERT INTO points_transactions_powlax (user_id, point_type, amount, reason, metadata)
            VALUES (p_user_id, 'academy_points', badge_info.points_award, 'Badge awarded: ' || badge_info.name, 
                    jsonb_build_object('badge_key', p_badge_key));
            
            -- Update wallet
            INSERT INTO user_points_wallets (user_id, currency, balance)
            VALUES (p_user_id, 'academy_points', badge_info.points_award)
            ON CONFLICT (user_id, currency) DO UPDATE SET
                balance = user_points_wallets.balance + badge_info.points_award,
                updated_at = NOW();
        END IF;
        
        success := true;
    END IF;
    
    RETURN success;
END;
$$;

-- Function to get user's gamification status
CREATE OR REPLACE FUNCTION get_user_gamification_status(p_user_id UUID)
RETURNS TABLE(
    rank_title TEXT,
    rank_order INTEGER,
    points_needed_for_next INTEGER,
    total_points INTEGER,
    badges_earned INTEGER,
    recent_badges JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_rank RECORD;
    user_points INTEGER := 0;
    badge_count INTEGER := 0;
    recent_badges_json JSON;
BEGIN
    -- Get user rank
    SELECT * INTO user_rank FROM calculate_user_rank(p_user_id);
    
    -- Get total points
    SELECT COALESCE(balance, 0) INTO user_points
    FROM user_points_wallets
    WHERE user_id = p_user_id AND currency = 'academy_points';
    
    -- Get badge count
    SELECT COUNT(*) INTO badge_count
    FROM user_badges
    WHERE user_id = p_user_id;
    
    -- Get recent badges (last 5)
    SELECT json_agg(
        json_build_object(
            'badge_key', ub.badge_key,
            'badge_name', ub.badge_name,
            'awarded_at', ub.awarded_at
        )
    ) INTO recent_badges_json
    FROM (
        SELECT ub.badge_key, ub.badge_name, ub.awarded_at
        FROM user_badges ub
        WHERE ub.user_id = p_user_id
        ORDER BY ub.awarded_at DESC
        LIMIT 5
    ) ub;
    
    RETURN QUERY SELECT 
        user_rank.rank_title,
        user_rank.rank_order,
        user_rank.points_needed,
        user_points,
        badge_count,
        COALESCE(recent_badges_json, '[]'::json);
END;
$$;

-- ===============================
-- 5. ENABLE ROW LEVEL SECURITY
-- ===============================

ALTER TABLE badge_definitions_powlax ENABLE ROW LEVEL SECURITY;

-- Public can view badge definitions
CREATE POLICY "Public can view badge definitions" ON badge_definitions_powlax
FOR SELECT USING (is_active = true);

-- ===============================
-- 6. VERIFICATION QUERIES
-- ===============================

-- Show badge counts by category
SELECT 
    category,
    COUNT(*) as badge_count,
    AVG(points_award) as avg_points
FROM badge_definitions_powlax
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Show rank progression
SELECT 
    rank_order,
    title,
    lax_credits_required,
    (metadata->>'min_points')::integer as min_points,
    (metadata->>'max_points')::integer as max_points
FROM powlax_player_ranks
ORDER BY rank_order;

-- Show summary
SELECT 
    (SELECT COUNT(*) FROM badge_definitions_powlax WHERE is_active = true) as total_badges,
    (SELECT COUNT(*) FROM powlax_player_ranks) as total_ranks,
    (SELECT COUNT(*) FROM user_badges) as total_user_badges;