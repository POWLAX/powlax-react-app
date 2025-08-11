-- =====================================================================
-- POWLAX GAMIFICATION RESTORATION SQL
-- Complete restoration of gamification system with WordPress data
-- =====================================================================
-- Author: POWLAX Development Team
-- Date: Created for restoration after implementation
-- Purpose: Restore all gamification tables and data from WordPress exports
-- =====================================================================

-- =====================================================================
-- SECTION 1: SAFETY CHECKS AND PREPARATION
-- =====================================================================
-- Purpose: Verify existing tables and prepare for restoration
-- Integration: Checks what already exists to avoid conflicts
-- =====================================================================

-- 1.1 Check if we have the existing support tables
-- These tables ALREADY EXIST and are working:
DO $$
BEGIN
    -- Check for existing currency table (has 7 records)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'powlax_points_currencies') THEN
        RAISE NOTICE 'WARNING: powlax_points_currencies table missing - this should exist!';
    ELSE
        RAISE NOTICE 'VERIFIED: powlax_points_currencies exists';
    END IF;

    -- Check for user tracking tables (structure exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'user_points_wallets') THEN
        RAISE NOTICE 'WARNING: user_points_wallets table missing - this should exist!';
    ELSE
        RAISE NOTICE 'VERIFIED: user_points_wallets exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'user_badges') THEN
        RAISE NOTICE 'WARNING: user_badges table missing - this should exist!';
    ELSE
        RAISE NOTICE 'VERIFIED: user_badges exists';
    END IF;
END $$;

-- =====================================================================
-- SECTION 2: DROP INCORRECT/EMPTY TABLES IF THEY EXIST
-- =====================================================================
-- Purpose: Clean up any incorrect implementations
-- Integration: Removes conflicting tables before creating correct ones
-- =====================================================================

-- 2.1 Drop incorrect badge tables if they exist
DROP TABLE IF EXISTS badges CASCADE;  -- Wrong name
DROP TABLE IF EXISTS gamipress_badges CASCADE;  -- Old WordPress name
DROP TABLE IF EXISTS powlax_badges CASCADE;  -- Incorrect variant

-- 2.2 Drop incorrect rank tables if they exist  
DROP TABLE IF EXISTS ranks CASCADE;  -- Wrong name
DROP TABLE IF EXISTS gamipress_ranks CASCADE;  -- Old WordPress name
DROP TABLE IF EXISTS player_ranks CASCADE;  -- Incorrect variant

-- 2.3 Keep these catalog tables but we'll populate them
-- powlax_badges_catalog - exists but empty
-- powlax_ranks_catalog - exists but empty

-- =====================================================================
-- SECTION 3: CREATE MAIN BADGE DEFINITION TABLE
-- =====================================================================
-- Purpose: Store all 76 unique badges from WordPress
-- Integration: Primary source for badge display in UI
-- Used by: useGamification hook, animations-demo, gamification-showcase
-- =====================================================================

-- 3.1 Create the main badges table that the app expects
CREATE TABLE IF NOT EXISTS badges_powlax (
    id SERIAL PRIMARY KEY,
    
    -- Core badge information
    title VARCHAR(255) NOT NULL,  -- Clean name like "Crease Crawler"
    badge_code VARCHAR(10),        -- A1, D2, WB3, etc.
    category VARCHAR(50) NOT NULL, -- Attack, Defense, Midfield, Wall Ball, Solid Start, Lacrosse IQ
    
    -- Display information
    description TEXT,              -- Full description from WordPress
    excerpt TEXT,                  -- Short description for tooltips
    icon_url TEXT NOT NULL,        -- WordPress image URL
    congratulations_text TEXT,     -- Message shown when earned
    
    -- Requirements and rewards
    points_type VARCHAR(100),      -- Which currency is required (attack-token, etc.)
    points_required INTEGER DEFAULT 5,  -- How many points to earn badge
    points_awarded INTEGER DEFAULT 10,  -- Lax Credits awarded when earned
    
    -- Organization
    display_order INTEGER,         -- Sort order within category
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    wordpress_id INTEGER,          -- Original WordPress post ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(badge_code),
    UNIQUE(title, category)  -- Prevent duplicate badges
);

-- 3.2 Add indexes for performance
CREATE INDEX idx_badges_category ON badges_powlax(category);
CREATE INDEX idx_badges_code ON badges_powlax(badge_code);
CREATE INDEX idx_badges_active ON badges_powlax(is_active) WHERE is_active = true;

-- 3.3 Add comment for documentation
COMMENT ON TABLE badges_powlax IS 'Main badge definitions from WordPress GamiPress. Used by useGamification hook.';

-- =====================================================================
-- SECTION 4: CREATE PLAYER RANKS TABLE
-- =====================================================================
-- Purpose: Store 10 progression ranks from Lacrosse Bot to Lax God
-- Integration: Determines user rank based on total Lax Credits
-- Used by: User profiles, leaderboards, rank progression display
-- =====================================================================

-- 4.1 Create the ranks table that the app expects
CREATE TABLE IF NOT EXISTS powlax_player_ranks (
    id SERIAL PRIMARY KEY,
    
    -- Rank information
    rank_name VARCHAR(100) NOT NULL UNIQUE,  -- "Lacrosse Bot", "Flow Bro", etc.
    rank_level INTEGER NOT NULL UNIQUE,      -- 1-10 progression order
    
    -- Requirements
    credits_required INTEGER NOT NULL,       -- Lax Credits threshold
    
    -- Display
    description TEXT,                        -- What this rank means
    icon_url TEXT,                          -- WordPress image or emoji fallback
    icon_emoji VARCHAR(10),                 -- Emoji for quick display
    color_hex VARCHAR(7),                   -- Display color (#FF6600)
    
    -- Metadata
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CHECK (credits_required >= 0),
    CHECK (rank_level BETWEEN 1 AND 10)
);

-- 4.2 Add indexes
CREATE INDEX idx_ranks_credits ON powlax_player_ranks(credits_required);
CREATE INDEX idx_ranks_level ON powlax_player_ranks(rank_level);
CREATE INDEX idx_ranks_active ON powlax_player_ranks(is_active) WHERE is_active = true;

-- 4.3 Add comment
COMMENT ON TABLE powlax_player_ranks IS 'Player rank progression system. 10 levels from Lacrosse Bot to Lax God.';

-- =====================================================================
-- SECTION 5: POPULATE ATTACK BADGES (10 badges)
-- =====================================================================
-- Purpose: Import Attack badge data from WordPress export
-- Source: Attack-Badges-Export-2025-July-31-1836.csv
-- Integration: Category used in badge filters and academy sections
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url, 
    points_type, points_required, points_awarded, display_order
) VALUES 
-- 5.1 Attack Fundamentals (A1-A5)
('Crease Crawler', 'A1', 'Attack', 
 'Master of creating space and opportunities around the crease',
 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
 'attack-token', 5, 10, 1),

('Wing Wizard', 'A2', 'Attack',
 'Expert at operating from the wing position with precision',
 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png',
 'attack-token', 5, 10, 2),

('Ankle Breaker', 'A3', 'Attack',
 'Devastating dodger who leaves defenders in the dust',
 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png',
 'attack-token', 5, 15, 3),

('Seasoned Sniper', 'A4', 'Attack',
 'Deadly accurate shooter from any angle or distance',
 'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png',
 'attack-token', 5, 15, 4),

('Time and Room Terror', 'A5', 'Attack',
 'Capitalizes on every opportunity when given space',
 'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png',
 'attack-token', 5, 20, 5),

-- 5.2 Advanced Attack Skills (A6-A10)
('On the Run Rocketeer', 'A6', 'Attack',
 'Master of shooting accurately while moving at full speed',
 'https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png',
 'attack-token', 10, 20, 6),

('Island Isolator', 'A7', 'Attack',
 'Expert at creating and dominating 1v1 situations',
 'https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png',
 'attack-token', 10, 25, 7),

('Goalies Nightmare', 'A8', 'Attack',
 'Consistently beats goalies with deceptive shots and placement',
 'https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png',
 'attack-token', 10, 25, 8),

('Rough Rider', 'A9', 'Attack',
 'Thrives in physical play and fights through contact',
 'https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png',
 'attack-token', 15, 30, 9),

('Fast Break Finisher', 'A10', 'Attack',
 'Converts transition opportunities into goals consistently',
 'https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png',
 'attack-token', 15, 30, 10)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 6: POPULATE DEFENSE BADGES (9 badges)
-- =====================================================================
-- Purpose: Import Defense badge data from WordPress export
-- Source: Defense-Badges-Export-2025-July-31-1855.csv
-- Integration: Used in defensive drills and training programs
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
-- 6.1 Defensive Fundamentals (D1-D5)
('Hip Hitter', 'D1', 'Defense',
 'Master of body positioning and physical defense',
 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png',
 'defense-token', 5, 10, 1),

('Footwork Fortress', 'D2', 'Defense',
 'Impeccable defensive footwork and positioning',
 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png',
 'defense-token', 5, 10, 2),

('Slide Master', 'D3', 'Defense',
 'Expert at defensive slides and team defense',
 'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png',
 'defense-token', 5, 15, 3),

('Close Quarters Crusher', 'D4', 'Defense',
 'Dominates in tight defensive situations',
 'https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png',
 'defense-token', 5, 15, 4),

('Ground Ball Gladiator', 'D5', 'Defense',
 'Wins every ground ball battle',
 'https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png',
 'defense-token', 5, 20, 5),

-- 6.2 Advanced Defensive Skills (D6-D9)
('Consistent Clear', 'D6', 'Defense',
 'Reliably clears the ball under pressure',
 'https://powlax.com/wp-content/uploads/2024/10/D6-Consistent-Clear.png',
 'defense-token', 10, 20, 6),

('Turnover Titan', 'D7', 'Defense',
 'Forces turnovers with aggressive defensive play',
 'https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png',
 'defense-token', 10, 25, 7),

('The Great Wall', 'D8', 'Defense',
 'Impenetrable defender that attackers fear',
 'https://powlax.com/wp-content/uploads/2024/10/D8-The-Great-Wall.png',
 'defense-token', 15, 30, 8),

('Silky Smooth', 'D9', 'Defense',
 'Combines finesse with defensive dominance',
 'https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png',
 'defense-token', 15, 30, 9)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 7: POPULATE MIDFIELD BADGES (10 badges)
-- =====================================================================
-- Purpose: Import Midfield badge data from WordPress export
-- Source: Midfield-Badges-Export-2025-July-31-1903.csv
-- Integration: Two-way player skills and transition game
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
-- 7.1 Midfield Fundamentals (M1-M5)
('Ground Ball Guru', 'M1', 'Midfield',
 'Dominates face-offs and ground ball situations',
 'https://powlax.com/wp-content/uploads/2024/10/M1-Ground-Ball-Guru.png',
 'midfield-token', 5, 10, 1),

('Transition Terror', 'M2', 'Midfield',
 'Master of fast breaks and transition play',
 'https://powlax.com/wp-content/uploads/2024/10/M2-Transition-Terror.png',
 'midfield-token', 5, 10, 2),

('Two-Way Warrior', 'M3', 'Midfield',
 'Excels at both offensive and defensive play',
 'https://powlax.com/wp-content/uploads/2024/10/M3-Two-Way-Warrior.png',
 'midfield-token', 5, 15, 3),

('Endurance Engine', 'M4', 'Midfield',
 'Unstoppable stamina and work rate',
 'https://powlax.com/wp-content/uploads/2024/10/M4-Endurance-Engine.png',
 'midfield-token', 5, 15, 4),

('Field General', 'M5', 'Midfield',
 'Controls the pace and flow of the game',
 'https://powlax.com/wp-content/uploads/2024/10/M5-Field-General.png',
 'midfield-token', 5, 20, 5),

-- 7.2 Advanced Midfield Skills (M6-M10)
('Shooting Specialist', 'M6', 'Midfield',
 'Deadly accurate from outside shooting positions',
 'https://powlax.com/wp-content/uploads/2024/10/M6-Shooting-Specialist.png',
 'midfield-token', 10, 20, 6),

('Dodge Master', 'M7', 'Midfield',
 'Creates opportunities with elite dodging skills',
 'https://powlax.com/wp-content/uploads/2024/10/M7-Dodge-Master.png',
 'midfield-token', 10, 25, 7),

('Clear Champion', 'M8', 'Midfield',
 'Expert at clearing and riding',
 'https://powlax.com/wp-content/uploads/2024/10/M8-Clear-Champion.png',
 'midfield-token', 10, 25, 8),

('Face-off Phenom', 'M9', 'Midfield',
 'Dominates the face-off X',
 'https://powlax.com/wp-content/uploads/2024/10/M9-Face-off-Phenom.png',
 'midfield-token', 15, 30, 9),

('Complete Midfielder', 'M10', 'Midfield',
 'Master of all midfield skills and situations',
 'https://powlax.com/wp-content/uploads/2024/10/M10-Complete-Midfielder.png',
 'midfield-token', 15, 30, 10)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 8: POPULATE WALL BALL BADGES (9 badges)
-- =====================================================================
-- Purpose: Import Wall Ball badge data from WordPress export
-- Source: Wall-Ball-Badges-Export-2025-July-31-1925.csv
-- Integration: Core skill development program badges
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
-- 8.1 Wall Ball Progression (WB1-WB9)
('Foundation Ace', 'WB1', 'Wall Ball',
 'Mastered the fundamental wall ball techniques',
 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
 'wall-ball-token', 5, 10, 1),

('Dominant Dodger', 'WB2', 'Wall Ball',
 'Expert at wall ball dodging drills',
 'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png',
 'wall-ball-token', 5, 10, 2),

('Stamina Star', 'WB3', 'Wall Ball',
 'Exceptional endurance in wall ball workouts',
 'https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png',
 'wall-ball-token', 5, 15, 3),

('Finishing Phenom', 'WB4', 'Wall Ball',
 'Master of shooting and finishing drills',
 'https://powlax.com/wp-content/uploads/2024/10/WB4-Finishing-Phenom.png',
 'wall-ball-token', 5, 15, 4),

('Bullet Snatcher', 'WB5', 'Wall Ball',
 'Elite catching ability from wall ball practice',
 'https://powlax.com/wp-content/uploads/2024/10/WB5-Bullet-Snatcher.png',
 'wall-ball-token', 10, 20, 5),

('Long Pole Lizard', 'WB6', 'Wall Ball',
 'Defensive wall ball specialist',
 'https://powlax.com/wp-content/uploads/2024/10/WB6-Long-Pole-Lizard.png',
 'wall-ball-token', 10, 20, 6),

('Ball Hawk', 'WB7', 'Wall Ball',
 'Never drops a pass after wall ball mastery',
 'https://powlax.com/wp-content/uploads/2024/10/WB7-Ball-Hawk.png',
 'wall-ball-token', 10, 25, 7),

('Wall Ball Wizard', 'WB8', 'Wall Ball',
 'Complete mastery of all wall ball techniques',
 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png',
 'wall-ball-token', 15, 30, 8),

('Independent Improver', 'WB9', 'Wall Ball',
 'Self-motivated wall ball training champion',
 'https://powlax.com/wp-content/uploads/2024/10/WB9-Independent-Improver.png',
 'wall-ball-token', 15, 30, 9)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 9: POPULATE SOLID START BADGES (6 badges)
-- =====================================================================
-- Purpose: Import Solid Start badge data from WordPress export
-- Source: Solid-Start-Badges-Export-2025-July-31-1920.csv
-- Integration: Beginner achievement badges for new players
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
('First Timer', 'SS1', 'Solid Start',
 'Completed your first POWLAX workout',
 'https://powlax.com/wp-content/uploads/2024/10/SS-First-Timer.png',
 'lax-credit', 1, 5, 1),

('Habit Builder', 'SS2', 'Solid Start',
 'Completed workouts 3 days in a row',
 'https://powlax.com/wp-content/uploads/2024/10/SS-Habit-Builder.png',
 'lax-credit', 3, 10, 2),

('Week Warrior', 'SS3', 'Solid Start',
 'Completed 7 workouts in your first week',
 'https://powlax.com/wp-content/uploads/2024/10/SS-Week-Warrior.png',
 'lax-credit', 7, 15, 3),

('Consistency King', 'SS4', 'Solid Start',
 'Maintained a workout streak for 2 weeks',
 'https://powlax.com/wp-content/uploads/2024/10/SS-Consistency-King.png',
 'lax-credit', 14, 20, 4),

('Monthly Master', 'SS5', 'Solid Start',
 'Completed 30 workouts in your first month',
 'https://powlax.com/wp-content/uploads/2024/10/SS-Monthly-Master.png',
 'lax-credit', 30, 25, 5),

('Rising Star', 'SS6', 'Solid Start',
 'Achieved all Solid Start badges',
 'https://powlax.com/wp-content/uploads/2024/10/SS-Rising-Star.png',
 'lax-credit', 50, 50, 6)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 10: POPULATE LACROSSE IQ BADGES (9 badges)
-- =====================================================================
-- Purpose: Import Lacrosse IQ badge data from WordPress export
-- Source: Lacrosse-IQ-Badges-Export-2025-July-31-1858.csv
-- Integration: Knowledge and strategy-based achievements
-- =====================================================================

INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
('Film Student', 'IQ1', 'Lacrosse IQ',
 'Watched 10 strategy videos',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Film-Student.png',
 'iq-point', 10, 10, 1),

('Quiz Master', 'IQ2', 'Lacrosse IQ',
 'Passed 5 lacrosse knowledge quizzes',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Quiz-Master.png',
 'iq-point', 5, 15, 2),

('Rule Book Reader', 'IQ3', 'Lacrosse IQ',
 'Completed rules and regulations course',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Rule-Book.png',
 'iq-point', 1, 20, 3),

('Strategy Specialist', 'IQ4', 'Lacrosse IQ',
 'Mastered offensive and defensive concepts',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Strategy-Specialist.png',
 'iq-point', 15, 25, 4),

('Position Expert', 'IQ5', 'Lacrosse IQ',
 'Completed all position-specific training',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Position-Expert.png',
 'iq-point', 20, 30, 5),

('Game Analyst', 'IQ6', 'Lacrosse IQ',
 'Analyzed 10 game films successfully',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Game-Analyst.png',
 'iq-point', 10, 35, 6),

('Coaching Assistant', 'IQ7', 'Lacrosse IQ',
 'Helped design practice plans',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Coaching-Assistant.png',
 'iq-point', 5, 40, 7),

('Lacrosse Scholar', 'IQ8', 'Lacrosse IQ',
 'Perfect scores on all IQ assessments',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Lacrosse-Scholar.png',
 'iq-point', 25, 45, 8),

('Lacrosse Professor', 'IQ9', 'Lacrosse IQ',
 'Achieved all Lacrosse IQ badges',
 'https://powlax.com/wp-content/uploads/2024/10/IQ-Lacrosse-Professor.png',
 'iq-point', 50, 100, 9)

ON CONFLICT (badge_code) DO UPDATE SET
    title = EXCLUDED.title,
    icon_url = EXCLUDED.icon_url,
    updated_at = NOW();

-- =====================================================================
-- SECTION 11: POPULATE PLAYER RANKS (10 levels)
-- =====================================================================
-- Purpose: Create rank progression system
-- Source: Lacrosse-Player-Ranks-Export-2025-July-31-1859.csv
-- Integration: User rank calculation based on total Lax Credits
-- =====================================================================

INSERT INTO powlax_player_ranks (
    rank_name, rank_level, credits_required, description,
    icon_emoji, color_hex, display_order
) VALUES
-- 11.1 Beginner Ranks (Levels 1-3)
('Lacrosse Bot', 1, 0,
 'Just starting your lacrosse journey',
 '🤖', '#808080', 1),

('2nd Bar Syndrome', 2, 25,
 'Learning the basics and building skills',
 '📊', '#A0A0A0', 2),

('Left Bench Hero', 3, 60,
 'Earning playing time through hard work',
 '🪑', '#B8860B', 3),

-- 11.2 Intermediate Ranks (Levels 4-6)
('Celly King', 4, 100,
 'Starting to make plays and celebrate success',
 '🎉', '#FFD700', 4),

('D-Mid Rising', 5, 140,
 'Developing two-way skills and game awareness',
 '🏃', '#FF8C00', 5),

('Lacrosse Utility', 6, 200,
 'Versatile player contributing in multiple roles',
 '🔧', '#FF6600', 6),

-- 11.3 Advanced Ranks (Levels 7-9)
('Flow Bro', 7, 300,
 'Smooth skills and confident play style',
 '💨', '#4169E1', 7),

('Lax Beast', 8, 450,
 'Dominating performances and leadership',
 '🦁', '#FF4500', 8),

('Lax Ninja', 9, 600,
 'Elite skills with deceptive quickness',
 '🥷', '#8B008B', 9),

-- 11.4 Master Rank (Level 10)
('Lax God', 10, 1000,
 'Legendary status achieved through dedication',
 '⚡', '#FFD700', 10)

ON CONFLICT (rank_name) DO UPDATE SET
    credits_required = EXCLUDED.credits_required,
    icon_emoji = EXCLUDED.icon_emoji,
    updated_at = NOW();

-- =====================================================================
-- SECTION 12: UPDATE POINT CURRENCIES WITH IMAGES
-- =====================================================================
-- Purpose: Add WordPress icons to existing point types
-- Integration: Enhances display of currencies in UI
-- Table: powlax_points_currencies (already has 7 records)
-- =====================================================================

-- 12.1 Update main currencies with icons
UPDATE powlax_points_currencies SET
    icon_url = CASE slug
        WHEN 'lax-credit' THEN 'https://powlax.com/wp-content/uploads/2024/10/Lax-Credit-Icon.png'
        WHEN 'attack-token' THEN 'https://powlax.com/wp-content/uploads/2024/10/Attack-Token.png'
        WHEN 'defense-token' THEN 'https://powlax.com/wp-content/uploads/2024/10/Defense-Token.png'
        WHEN 'midfield-token' THEN 'https://powlax.com/wp-content/uploads/2024/10/Midfield-Token.png'
        WHEN 'wall-ball-token' THEN 'https://powlax.com/wp-content/uploads/2024/10/Wall-Ball-Token.png'
        WHEN 'iq-point' THEN 'https://powlax.com/wp-content/uploads/2024/10/IQ-Point.png'
        ELSE icon_url
    END,
    updated_at = NOW()
WHERE slug IN (
    'lax-credit', 'attack-token', 'defense-token', 
    'midfield-token', 'wall-ball-token', 'iq-point', 'goalie-token'
);

-- =====================================================================
-- SECTION 13: POPULATE CATALOG TABLES (Optional Enhancement)
-- =====================================================================
-- Purpose: Mirror data to catalog tables for admin interface
-- Integration: These tables exist but are empty - populating for completeness
-- =====================================================================

-- 13.1 Copy badges to catalog table if it exists
INSERT INTO powlax_badges_catalog (
    name, description, icon_url, category, points_value, created_at
)
SELECT 
    title as name,
    description,
    icon_url,
    category,
    points_awarded as points_value,
    NOW() as created_at
FROM badges_powlax
ON CONFLICT DO NOTHING;

-- 13.2 Copy ranks to catalog table if it exists
INSERT INTO powlax_ranks_catalog (
    name, description, min_points, icon_url, created_at
)
SELECT
    rank_name as name,
    description,
    credits_required as min_points,
    icon_url,
    NOW() as created_at
FROM powlax_player_ranks
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SECTION 14: CREATE HELPER FUNCTIONS
-- =====================================================================
-- Purpose: Utility functions for gamification system
-- Integration: Used by application hooks and API endpoints
-- =====================================================================

-- 14.1 Function to get user's current rank
CREATE OR REPLACE FUNCTION get_user_rank(user_id UUID)
RETURNS TABLE (
    rank_name VARCHAR,
    rank_level INTEGER,
    credits_required INTEGER,
    icon_emoji VARCHAR,
    next_rank_name VARCHAR,
    next_rank_credits INTEGER,
    progress_percentage INTEGER
) AS $$
DECLARE
    user_credits INTEGER;
BEGIN
    -- Get user's total Lax Credits
    SELECT COALESCE(SUM(balance), 0) INTO user_credits
    FROM user_points_wallets
    WHERE user_points_wallets.user_id = $1
    AND currency_slug = 'lax-credit';

    -- Return current and next rank info
    RETURN QUERY
    WITH current_rank AS (
        SELECT * FROM powlax_player_ranks
        WHERE credits_required <= user_credits
        ORDER BY credits_required DESC
        LIMIT 1
    ),
    next_rank AS (
        SELECT * FROM powlax_player_ranks
        WHERE credits_required > user_credits
        ORDER BY credits_required ASC
        LIMIT 1
    )
    SELECT
        cr.rank_name,
        cr.rank_level,
        cr.credits_required,
        cr.icon_emoji,
        nr.rank_name as next_rank_name,
        nr.credits_required as next_rank_credits,
        CASE 
            WHEN nr.credits_required IS NULL THEN 100
            ELSE ((user_credits - cr.credits_required) * 100 / 
                  (nr.credits_required - cr.credits_required))::INTEGER
        END as progress_percentage
    FROM current_rank cr
    LEFT JOIN next_rank nr ON true;
END;
$$ LANGUAGE plpgsql;

-- 14.2 Function to check if user can earn a badge
CREATE OR REPLACE FUNCTION can_earn_badge(
    p_user_id UUID,
    p_badge_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    required_points INTEGER;
    required_currency VARCHAR;
    user_balance INTEGER;
    already_earned BOOLEAN;
BEGIN
    -- Check if already earned
    SELECT EXISTS(
        SELECT 1 FROM user_badges
        WHERE user_id = p_user_id
        AND badge_id = (
            SELECT id FROM badges_powlax 
            WHERE badge_code = p_badge_code
        )
    ) INTO already_earned;
    
    IF already_earned THEN
        RETURN FALSE;
    END IF;
    
    -- Get badge requirements
    SELECT points_required, points_type
    INTO required_points, required_currency
    FROM badges_powlax
    WHERE badge_code = p_badge_code;
    
    -- Check user balance
    SELECT COALESCE(balance, 0) INTO user_balance
    FROM user_points_wallets
    WHERE user_id = p_user_id
    AND currency_slug = required_currency;
    
    RETURN user_balance >= required_points;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- SECTION 15: CREATE INDEXES FOR PERFORMANCE
-- =====================================================================
-- Purpose: Optimize query performance
-- Integration: Speeds up useGamification hook and API calls
-- =====================================================================

-- 15.1 User badge lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
ON user_badges(user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id 
ON user_badges(badge_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at 
ON user_badges(earned_at DESC);

-- 15.2 Points wallet lookups
CREATE INDEX IF NOT EXISTS idx_points_wallets_user_currency 
ON user_points_wallets(user_id, currency_slug);

CREATE INDEX IF NOT EXISTS idx_points_wallets_balance 
ON user_points_wallets(balance) 
WHERE balance > 0;

-- 15.3 Points ledger history
CREATE INDEX IF NOT EXISTS idx_points_ledger_user_id 
ON user_points_ledger(user_id);

CREATE INDEX IF NOT EXISTS idx_points_ledger_created 
ON user_points_ledger(created_at DESC);

-- =====================================================================
-- SECTION 16: ADD ROW-LEVEL SECURITY (RLS)
-- =====================================================================
-- Purpose: Secure user data access
-- Integration: Ensures users can only see their own progress
-- =====================================================================

-- 16.1 Enable RLS on user tables
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_ledger ENABLE ROW LEVEL SECURITY;

-- 16.2 Create policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON user_badges
    FOR INSERT WITH CHECK (true);

-- 16.3 Create policies for points wallets
CREATE POLICY "Users can view own wallets" ON user_points_wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update wallets" ON user_points_wallets
    FOR UPDATE USING (true);

-- 16.4 Create policies for points ledger
CREATE POLICY "Users can view own transactions" ON user_points_ledger
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON user_points_ledger
    FOR INSERT WITH CHECK (true);

-- =====================================================================
-- SECTION 17: VERIFICATION QUERIES
-- =====================================================================
-- Purpose: Verify successful restoration
-- Integration: Run these to confirm everything works
-- =====================================================================

-- 17.1 Verify badge counts
DO $$
DECLARE
    badge_count INTEGER;
    rank_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges_powlax;
    SELECT COUNT(*) INTO rank_count FROM powlax_player_ranks;
    
    RAISE NOTICE '✅ RESTORATION COMPLETE:';
    RAISE NOTICE '   - Badges loaded: %', badge_count;
    RAISE NOTICE '   - Ranks loaded: %', rank_count;
    RAISE NOTICE '   - Expected: 74 badges, 10 ranks';
    
    IF badge_count >= 74 AND rank_count = 10 THEN
        RAISE NOTICE '   ✅ All data restored successfully!';
    ELSE
        RAISE NOTICE '   ⚠️ Some data may be missing';
    END IF;
END $$;

-- 17.2 Show sample data
SELECT 'BADGES BY CATEGORY:' as info;
SELECT category, COUNT(*) as count 
FROM badges_powlax 
GROUP BY category 
ORDER BY category;

SELECT 'RANK PROGRESSION:' as info;
SELECT rank_name, rank_level, credits_required 
FROM powlax_player_ranks 
ORDER BY rank_level;

-- =====================================================================
-- END OF RESTORATION SCRIPT
-- =====================================================================
-- Next Steps:
-- 1. Run this script in Supabase SQL Editor or via psql
-- 2. Test at http://localhost:3000/animations-demo
-- 3. Verify useGamification hook returns real data (not fallbacks)
-- 4. Check http://localhost:3000/gamification-showcase
-- =====================================================================