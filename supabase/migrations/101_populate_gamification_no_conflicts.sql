-- =====================================================================
-- POPULATE GAMIFICATION TABLES - NO CONFLICT VERSION
-- =====================================================================
-- Simple INSERT without ON CONFLICT since no unique constraints exist
-- =====================================================================

BEGIN;

-- =====================================================================
-- SECTION 1: CLEAR EXISTING DATA (OPTIONAL)
-- =====================================================================
-- Uncomment these lines if you want to clear existing data first:
-- DELETE FROM powlax_player_ranks;
-- DELETE FROM badges_powlax;

-- =====================================================================
-- SECTION 2: CHECK IF DATA ALREADY EXISTS
-- =====================================================================
DO $$
DECLARE
    existing_ranks INTEGER;
    existing_badges INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_ranks FROM powlax_player_ranks;
    SELECT COUNT(*) INTO existing_badges FROM badges_powlax;
    
    IF existing_ranks > 0 THEN
        RAISE NOTICE 'WARNING: powlax_player_ranks already has % records', existing_ranks;
        RAISE NOTICE 'Skipping rank insertion to avoid duplicates';
    END IF;
    
    IF existing_badges > 0 THEN
        RAISE NOTICE 'WARNING: badges_powlax already has % records', existing_badges;
        RAISE NOTICE 'Skipping badge insertion to avoid duplicates';
    END IF;
END $$;

-- =====================================================================
-- SECTION 3: POPULATE PLAYER RANKS (only if table is empty)
-- =====================================================================
INSERT INTO powlax_player_ranks (
    title,
    rank_order,
    lax_credits_required,
    description,
    icon_url,
    metadata
)
SELECT * FROM (VALUES
    -- Beginner Ranks (1-3)
    ('Lacrosse Bot', 1, 0,
     'Just starting your lacrosse journey',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Lacrosse-Bot.png',
     '{"emoji": "🤖", "color": "#808080"}'::jsonb),

    ('2nd Bar Syndrome', 2, 25,
     'Learning the basics and building skills',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-2nd-Bar.png',
     '{"emoji": "📊", "color": "#A0A0A0"}'::jsonb),

    ('Left Bench Hero', 3, 60,
     'Earning playing time through hard work',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Bench-Hero.png',
     '{"emoji": "🪑", "color": "#B8860B"}'::jsonb),

    -- Intermediate Ranks (4-6)
    ('Celly King', 4, 100,
     'Starting to make plays and celebrate success',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Celly-King.png',
     '{"emoji": "🎉", "color": "#FFD700"}'::jsonb),

    ('D-Mid Rising', 5, 140,
     'Developing two-way skills and game awareness',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-D-Mid.png',
     '{"emoji": "🏃", "color": "#FF8C00"}'::jsonb),

    ('Lacrosse Utility', 6, 200,
     'Versatile player contributing in multiple roles',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Utility.png',
     '{"emoji": "🔧", "color": "#FF6600"}'::jsonb),

    -- Advanced Ranks (7-9)
    ('Flow Bro', 7, 300,
     'Smooth skills and confident play style',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Flow-Bro.png',
     '{"emoji": "💨", "color": "#4169E1"}'::jsonb),

    ('Lax Beast', 8, 450,
     'Dominating performances and leadership',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-Beast.png',
     '{"emoji": "🦁", "color": "#FF4500"}'::jsonb),

    ('Lax Ninja', 9, 600,
     'Elite skills with deceptive quickness',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-Ninja.png',
     '{"emoji": "🥷", "color": "#8B008B"}'::jsonb),

    -- Master Rank (10)
    ('Lax God', 10, 1000,
     'Legendary status achieved through dedication',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-God.png',
     '{"emoji": "⚡", "color": "#FFD700"}'::jsonb)
) AS new_ranks(title, rank_order, lax_credits_required, description, icon_url, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM powlax_player_ranks WHERE powlax_player_ranks.title = new_ranks.title
);

-- =====================================================================
-- SECTION 4: POPULATE BADGES (only if not already exist)
-- =====================================================================

-- Attack Badges
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Crease Crawler', 'Attack', 'Attack', 
     'Master of creating space and opportunities around the crease',
     'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
     'attack-token', 5, 1,
     '{"code": "A1", "points_awarded": 10}'::jsonb),

    ('Wing Wizard', 'Attack', 'Attack',
     'Expert at operating from the wing position with precision',
     'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png',
     'attack-token', 5, 2,
     '{"code": "A2", "points_awarded": 10}'::jsonb),

    ('Ankle Breaker', 'Attack', 'Attack',
     'Devastating dodger who leaves defenders in the dust',
     'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png',
     'attack-token', 5, 3,
     '{"code": "A3", "points_awarded": 15}'::jsonb),

    ('Seasoned Sniper', 'Attack', 'Attack',
     'Deadly accurate shooter from any angle or distance',
     'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png',
     'attack-token', 5, 4,
     '{"code": "A4", "points_awarded": 15}'::jsonb),

    ('Time and Room Terror', 'Attack', 'Attack',
     'Capitalizes on every opportunity when given space',
     'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png',
     'attack-token', 5, 5,
     '{"code": "A5", "points_awarded": 20}'::jsonb),

    ('On the Run Rocketeer', 'Attack', 'Attack',
     'Master of shooting accurately while moving at full speed',
     'https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png',
     'attack-token', 10, 6,
     '{"code": "A6", "points_awarded": 20}'::jsonb),

    ('Island Isolator', 'Attack', 'Attack',
     'Expert at creating and dominating 1v1 situations',
     'https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png',
     'attack-token', 10, 7,
     '{"code": "A7", "points_awarded": 25}'::jsonb),

    ('Goalies Nightmare', 'Attack', 'Attack',
     'Consistently beats goalies with deceptive shots and placement',
     'https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png',
     'attack-token', 10, 8,
     '{"code": "A8", "points_awarded": 25}'::jsonb),

    ('Rough Rider', 'Attack', 'Attack',
     'Thrives in physical play and fights through contact',
     'https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png',
     'attack-token', 15, 9,
     '{"code": "A9", "points_awarded": 30}'::jsonb),

    ('Fast Break Finisher', 'Attack', 'Attack',
     'Converts transition opportunities into goals consistently',
     'https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png',
     'attack-token', 15, 10,
     '{"code": "A10", "points_awarded": 30}'::jsonb)
) AS new_badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax WHERE badges_powlax.title = new_badges.title
);

-- Defense Badges
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Hip Hitter', 'Defense', 'Defense',
     'Master of body positioning and physical defense',
     'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png',
     'defense-token', 5, 1,
     '{"code": "D1", "points_awarded": 10}'::jsonb),

    ('Footwork Fortress', 'Defense', 'Defense',
     'Impeccable defensive footwork and positioning',
     'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png',
     'defense-token', 5, 2,
     '{"code": "D2", "points_awarded": 10}'::jsonb),

    ('Slide Master', 'Defense', 'Defense',
     'Expert at defensive slides and team defense',
     'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png',
     'defense-token', 5, 3,
     '{"code": "D3", "points_awarded": 15}'::jsonb),

    ('Close Quarters Crusher', 'Defense', 'Defense',
     'Dominates in tight defensive situations',
     'https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png',
     'defense-token', 5, 4,
     '{"code": "D4", "points_awarded": 15}'::jsonb),

    ('Ground Ball Gladiator', 'Defense', 'Defense',
     'Wins every ground ball battle',
     'https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png',
     'defense-token', 5, 5,
     '{"code": "D5", "points_awarded": 20}'::jsonb)
) AS new_badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax WHERE badges_powlax.title = new_badges.title
);

-- Wall Ball Badges (Sample)
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Foundation Ace', 'Wall Ball', 'Wall Ball',
     'Mastered the fundamental wall ball techniques',
     'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
     'wall-ball-token', 5, 1,
     '{"code": "WB1", "points_awarded": 10}'::jsonb),

    ('Dominant Dodger', 'Wall Ball', 'Wall Ball',
     'Expert at wall ball dodging drills',
     'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png',
     'wall-ball-token', 5, 2,
     '{"code": "WB2", "points_awarded": 10}'::jsonb),

    ('Wall Ball Wizard', 'Wall Ball', 'Wall Ball',
     'Complete mastery of all wall ball techniques',
     'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png',
     'wall-ball-token', 15, 8,
     '{"code": "WB8", "points_awarded": 30}'::jsonb)
) AS new_badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax WHERE badges_powlax.title = new_badges.title
);

-- =====================================================================
-- SECTION 5: VERIFICATION
-- =====================================================================
DO $$
DECLARE
    badge_count INTEGER;
    rank_count INTEGER;
    attack_count INTEGER;
    defense_count INTEGER;
    wallball_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges_powlax;
    SELECT COUNT(*) INTO rank_count FROM powlax_player_ranks;
    SELECT COUNT(*) INTO attack_count FROM badges_powlax WHERE badge_type = 'Attack';
    SELECT COUNT(*) INTO defense_count FROM badges_powlax WHERE badge_type = 'Defense';
    SELECT COUNT(*) INTO wallball_count FROM badges_powlax WHERE badge_type = 'Wall Ball';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ GAMIFICATION DATA STATUS:';
    RAISE NOTICE '   - Total Badges: %', badge_count;
    RAISE NOTICE '     • Attack: %', attack_count;
    RAISE NOTICE '     • Defense: %', defense_count;
    RAISE NOTICE '     • Wall Ball: %', wallball_count;
    RAISE NOTICE '   - Player Ranks: %', rank_count;
    RAISE NOTICE '========================================';
END $$;

-- Show loaded data
SELECT 'PLAYER RANKS:' as section;
SELECT title, rank_order, lax_credits_required 
FROM powlax_player_ranks 
ORDER BY rank_order;

SELECT 'BADGES BY TYPE:' as section;
SELECT badge_type, COUNT(*) as count 
FROM badges_powlax 
GROUP BY badge_type
ORDER BY badge_type;

SELECT 'SAMPLE BADGES:' as section;
SELECT badge_type, title, 
       metadata->>'code' as code,
       metadata->>'points_awarded' as points
FROM badges_powlax 
ORDER BY badge_type, sort_order
LIMIT 15;

COMMIT;

-- =====================================================================
-- SUCCESS! This script:
-- 1. Checks for existing data to avoid duplicates
-- 2. Only inserts if records don't already exist
-- 3. Uses WHERE NOT EXISTS instead of ON CONFLICT
-- 4. Shows verification of what was loaded
-- =====================================================================