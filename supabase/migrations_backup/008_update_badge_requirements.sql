-- Update badge requirements to use points instead of workout counts
-- Phase 1: Anti-Gaming Foundation

-- First, let's see what badges we currently have and update them to use points
-- Reset all badges to use points-based requirements

UPDATE badges_powlax
SET 
    earned_by_type = 'points',
    points_required = CASE
        -- Attack badges
        WHEN title LIKE '%Attack%' OR title LIKE '%Offense%' OR title LIKE '%Shooting%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 5000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 2000
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 1000
                ELSE 250 -- Basic/Beginner level
            END
        
        -- Defense badges  
        WHEN title LIKE '%Defense%' OR title LIKE '%Defensive%' OR title LIKE '%Guard%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 5000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 2000
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 1000
                ELSE 250
            END
            
        -- Midfield badges
        WHEN title LIKE '%Midfield%' OR title LIKE '%Transition%' OR title LIKE '%Hustle%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 5000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 2000
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 1000
                ELSE 250
            END
            
        -- Wall Ball badges
        WHEN title LIKE '%Wall Ball%' OR title LIKE '%Rebound%' OR title LIKE '%Solo%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 3000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 1500
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 750
                ELSE 150
            END
            
        -- General skill badges
        WHEN title LIKE '%Skill%' OR title LIKE '%Foundation%' OR title LIKE '%Fundamentals%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 4000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 1800
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 900
                ELSE 200
            END
            
        -- Consistency/streak badges
        WHEN title LIKE '%Consistent%' OR title LIKE '%Dedication%' OR title LIKE '%Committed%' THEN
            CASE 
                WHEN title LIKE '%Elite%' OR title LIKE '%Master%' OR title LIKE '%Advanced%' THEN 10000
                WHEN title LIKE '%Pro%' OR title LIKE '%Expert%' THEN 5000
                WHEN title LIKE '%Skilled%' OR title LIKE '%Intermediate%' THEN 2500
                ELSE 500
            END
            
        -- Default case
        ELSE 500
    END,
    
    -- Set appropriate point type based on badge category
    points_type_required = CASE
        WHEN title LIKE '%Attack%' OR title LIKE '%Offense%' OR title LIKE '%Shooting%' THEN 'attack_token'
        WHEN title LIKE '%Defense%' OR title LIKE '%Defensive%' OR title LIKE '%Guard%' THEN 'defense_dollar'
        WHEN title LIKE '%Midfield%' OR title LIKE '%Transition%' OR title LIKE '%Hustle%' THEN 'midfield_medal'
        WHEN title LIKE '%Wall Ball%' OR title LIKE '%Rebound%' OR title LIKE '%Solo%' THEN 'rebound_reward'
        WHEN title LIKE '%IQ%' OR title LIKE '%Strategy%' OR title LIKE '%Knowledge%' THEN 'lax_iq_point'
        ELSE 'lax_credit' -- Universal points
    END

WHERE earned_by_type != 'points' OR points_required IS NULL OR points_required = 0;

-- Create some starter badges if none exist
INSERT INTO badges_powlax (title, description, category, earned_by_type, points_type_required, points_required, icon_url) VALUES

-- Attack Badges
('Attack Rookie', 'Complete your first attack-focused workout', 'attack', 'points', 'attack_token', 25, '/icons/attack-rookie.svg'),
('Attack Apprentice', 'Earn 250 Attack Tokens through offensive drills', 'attack', 'points', 'attack_token', 250, '/icons/attack-apprentice.svg'),
('Attack Specialist', 'Earn 1000 Attack Tokens - you know your offense!', 'attack', 'points', 'attack_token', 1000, '/icons/attack-specialist.svg'),
('Attack Master', 'Earn 5000 Attack Tokens - elite offensive skills', 'attack', 'points', 'attack_token', 5000, '/icons/attack-master.svg'),

-- Defense Badges  
('Defense Rookie', 'Complete your first defensive workout', 'defense', 'points', 'defense_dollar', 25, '/icons/defense-rookie.svg'),
('Defense Apprentice', 'Earn 250 Defense Dollars through defensive drills', 'defense', 'points', 'defense_dollar', 250, '/icons/defense-apprentice.svg'), 
('Defense Specialist', 'Earn 1000 Defense Dollars - solid defensive foundation', 'defense', 'points', 'defense_dollar', 1000, '/icons/defense-specialist.svg'),
('Defense Master', 'Earn 5000 Defense Dollars - lockdown defender', 'defense', 'points', 'defense_dollar', 5000, '/icons/defense-master.svg'),

-- Midfield Badges
('Midfield Rookie', 'Complete your first midfield workout', 'midfield', 'points', 'midfield_medal', 25, '/icons/midfield-rookie.svg'),
('Midfield Apprentice', 'Earn 250 Midfield Medals through transition work', 'midfield', 'points', 'midfield_medal', 250, '/icons/midfield-apprentice.svg'),
('Midfield Specialist', 'Earn 1000 Midfield Medals - run the field!', 'midfield', 'points', 'midfield_medal', 1000, '/icons/midfield-specialist.svg'),
('Midfield Master', 'Earn 5000 Midfield Medals - elite field general', 'midfield', 'points', 'midfield_medal', 5000, '/icons/midfield-master.svg'),

-- Wall Ball Badges
('Wall Ball Warrior', 'Earn 150 Rebound Rewards from wall ball work', 'wall-ball', 'points', 'rebound_reward', 150, '/icons/wall-ball-warrior.svg'),
('Solo Session Star', 'Earn 750 Rebound Rewards - dedicated individual work', 'wall-ball', 'points', 'rebound_reward', 750, '/icons/solo-star.svg'),
('Wall Ball Master', 'Earn 3000 Rebound Rewards - elite individual skills', 'wall-ball', 'points', 'rebound_reward', 3000, '/icons/wall-ball-master.svg'),

-- Consistency Badges (Lax Credits)
('Getting Started', 'Earn your first 100 Lax Credits', 'consistency', 'points', 'lax_credit', 100, '/icons/getting-started.svg'),
('Dedicated Trainee', 'Earn 500 Lax Credits through consistent training', 'consistency', 'points', 'lax_credit', 500, '/icons/dedicated.svg'),
('Committed Player', 'Earn 2500 Lax Credits - serious about improvement', 'consistency', 'points', 'lax_credit', 2500, '/icons/committed.svg'),
('Elite Trainee', 'Earn 10000 Lax Credits - among the most dedicated', 'consistency', 'points', 'lax_credit', 10000, '/icons/elite-trainee.svg'),

-- Difficulty Challenge Badges
('Challenge Seeker', 'Complete 10 workouts with average difficulty 4.0+', 'difficulty', 'action', NULL, NULL, '/icons/challenge-seeker.svg'),
('Elite Challenger', 'Complete 25 workouts with average difficulty 4.5+', 'difficulty', 'action', NULL, NULL, '/icons/elite-challenger.svg')

ON CONFLICT (title) DO UPDATE SET
    earned_by_type = EXCLUDED.earned_by_type,
    points_type_required = EXCLUDED.points_type_required,
    points_required = EXCLUDED.points_required,
    description = EXCLUDED.description;

-- Create function to check badge eligibility
CREATE OR REPLACE FUNCTION check_badge_eligibility(user_uuid UUID, badge_category VARCHAR DEFAULT NULL)
RETURNS TABLE(badge_id INTEGER, badge_title VARCHAR, newly_eligible BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        (upb.badge_id IS NULL) as newly_eligible
    FROM badges_powlax b
    LEFT JOIN user_points_balance_powlax pb ON 
        pb.user_id = user_uuid AND 
        pb.point_type = b.points_type_required
    LEFT JOIN user_badge_progress_powlax upb ON 
        upb.user_id = user_uuid AND 
        upb.badge_id = b.id AND 
        upb.earned_count > 0
    WHERE 
        b.earned_by_type = 'points' AND
        pb.balance >= b.points_required AND
        upb.badge_id IS NULL AND -- Not already earned
        (badge_category IS NULL OR b.category = badge_category)
    ORDER BY b.points_required ASC;
END;
$$ LANGUAGE plpgsql;

-- Update existing user badge progress to reflect new system
-- Reset progress for badges that were earned under old system
UPDATE user_badge_progress_powlax 
SET progress = 0, earned_count = 0, first_earned_at = NULL, last_earned_at = NULL
WHERE badge_id IN (
    SELECT id FROM badges_powlax WHERE earned_by_type = 'points'
);

-- Create trigger to automatically check badge progress when points are awarded
CREATE OR REPLACE FUNCTION auto_check_badge_progress()
RETURNS TRIGGER AS $$
DECLARE
    eligible_badge RECORD;
BEGIN
    -- Check for newly eligible badges when points are earned
    IF NEW.transaction_type = 'earned' THEN
        FOR eligible_badge IN 
            SELECT * FROM check_badge_eligibility(NEW.user_id)
        LOOP
            -- Award the badge
            INSERT INTO user_badge_progress_powlax (
                user_id, 
                badge_id, 
                progress, 
                earned_count, 
                first_earned_at
            ) VALUES (
                NEW.user_id,
                eligible_badge.badge_id,
                (SELECT points_required FROM badges_powlax WHERE id = eligible_badge.badge_id),
                1,
                NOW()
            )
            ON CONFLICT (user_id, badge_id) DO UPDATE SET
                earned_count = user_badge_progress_powlax.earned_count + 1,
                last_earned_at = NOW();
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_badge_check_trigger ON points_transactions_powlax;
CREATE TRIGGER auto_badge_check_trigger
    AFTER INSERT ON points_transactions_powlax
    FOR EACH ROW
    EXECUTE FUNCTION auto_check_badge_progress();

-- Update badge metadata to include new difficulty requirements
UPDATE badges_powlax 
SET metadata = jsonb_build_object(
    'difficulty_requirement', 
    CASE 
        WHEN points_required >= 5000 THEN 4.0
        WHEN points_required >= 2000 THEN 3.5
        WHEN points_required >= 1000 THEN 3.0
        ELSE 2.0
    END,
    'estimated_workouts',
    CASE
        WHEN points_required >= 5000 THEN '100-150 challenging workouts'
        WHEN points_required >= 2000 THEN '50-75 quality workouts'
        WHEN points_required >= 1000 THEN '25-40 solid workouts'
        ELSE '10-15 beginner workouts'
    END
)
WHERE earned_by_type = 'points';

COMMENT ON FUNCTION check_badge_eligibility IS 'Check which badges a user is eligible for based on current points';
COMMENT ON FUNCTION auto_check_badge_progress IS 'Automatically award badges when point thresholds are met';