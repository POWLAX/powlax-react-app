-- =====================================================================
-- CREATE AND POPULATE GAMIFICATION TABLES
-- =====================================================================
-- Creates tables if they don't exist, then populates with data
-- =====================================================================

BEGIN;

-- =====================================================================
-- SECTION 1: CREATE TABLES IF THEY DON'T EXIST
-- =====================================================================

-- 1.1 Create powlax_player_ranks table (from create-ranks-table.sql)
CREATE TABLE IF NOT EXISTS powlax_player_ranks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  rank_order INTEGER NOT NULL,
  lax_credits_required INTEGER DEFAULT 0,
  wordpress_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Create badges_powlax table (from create-badges-table.sql)
CREATE TABLE IF NOT EXISTS badges_powlax (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(100),
  badge_type VARCHAR(50),
  sub_category VARCHAR(100),
  earned_by_type VARCHAR(50),
  points_type_required VARCHAR(50),
  points_required INTEGER DEFAULT 0,
  wordpress_id INTEGER,
  quest_id INTEGER,
  maximum_earnings INTEGER DEFAULT 1,
  is_hidden BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Create indexes
CREATE INDEX IF NOT EXISTS idx_player_ranks_order ON powlax_player_ranks(rank_order);
CREATE INDEX IF NOT EXISTS idx_player_ranks_credits ON powlax_player_ranks(lax_credits_required);
CREATE INDEX IF NOT EXISTS idx_badges_type ON badges_powlax(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges_powlax(category);
CREATE INDEX IF NOT EXISTS idx_badges_sort ON badges_powlax(sort_order);

-- =====================================================================
-- SECTION 2: CHECK CURRENT STATE
-- =====================================================================
DO $$
DECLARE
    existing_ranks INTEGER;
    existing_badges INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_ranks FROM powlax_player_ranks;
    SELECT COUNT(*) INTO existing_badges FROM badges_powlax;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CURRENT STATE:';
    RAISE NOTICE '   - Existing Ranks: %', existing_ranks;
    RAISE NOTICE '   - Existing Badges: %', existing_badges;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================================
-- SECTION 3: POPULATE PLAYER RANKS
-- =====================================================================

-- Clear test data if any
DELETE FROM powlax_player_ranks WHERE title LIKE 'Test%';

-- Insert ranks (checking for duplicates)
INSERT INTO powlax_player_ranks (
    title, rank_order, lax_credits_required, description, icon_url, metadata
)
SELECT * FROM (VALUES
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

    ('Lax God', 10, 1000,
     'Legendary status achieved through dedication',
     'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-God.png',
     '{"emoji": "⚡", "color": "#FFD700"}'::jsonb)
) AS ranks(title, rank_order, lax_credits_required, description, icon_url, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM powlax_player_ranks pr WHERE pr.title = ranks.title
);

-- =====================================================================
-- SECTION 4: POPULATE BADGES
-- =====================================================================

-- Clear test badges
DELETE FROM badges_powlax WHERE title LIKE 'Test%';

-- Insert Attack Badges
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Crease Crawler', 'Attack', 'Attack', 
     'Master of creating space around the crease',
     'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
     'attack-token', 5, 1, '{"code": "A1", "points_awarded": 10}'::jsonb),

    ('Wing Wizard', 'Attack', 'Attack',
     'Expert at wing position play',
     'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png',
     'attack-token', 5, 2, '{"code": "A2", "points_awarded": 10}'::jsonb),

    ('Ankle Breaker', 'Attack', 'Attack',
     'Devastating dodger',
     'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png',
     'attack-token', 5, 3, '{"code": "A3", "points_awarded": 15}'::jsonb),

    ('Seasoned Sniper', 'Attack', 'Attack',
     'Deadly accurate shooter',
     'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png',
     'attack-token', 5, 4, '{"code": "A4", "points_awarded": 15}'::jsonb),

    ('Time and Room Terror', 'Attack', 'Attack',
     'Capitalizes on space',
     'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png',
     'attack-token', 5, 5, '{"code": "A5", "points_awarded": 20}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- Insert Defense Badges
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Hip Hitter', 'Defense', 'Defense',
     'Master of body positioning',
     'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png',
     'defense-token', 5, 1, '{"code": "D1", "points_awarded": 10}'::jsonb),

    ('Footwork Fortress', 'Defense', 'Defense',
     'Impeccable defensive footwork',
     'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png',
     'defense-token', 5, 2, '{"code": "D2", "points_awarded": 10}'::jsonb),

    ('Slide Master', 'Defense', 'Defense',
     'Expert at defensive slides',
     'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png',
     'defense-token', 5, 3, '{"code": "D3", "points_awarded": 15}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- Insert Wall Ball Badges
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Foundation Ace', 'Wall Ball', 'Wall Ball',
     'Mastered wall ball fundamentals',
     'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
     'wall-ball-token', 5, 1, '{"code": "WB1", "points_awarded": 10}'::jsonb),

    ('Wall Ball Wizard', 'Wall Ball', 'Wall Ball',
     'Complete wall ball mastery',
     'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png',
     'wall-ball-token', 15, 8, '{"code": "WB8", "points_awarded": 30}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 5: FINAL VERIFICATION
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
    RAISE NOTICE '✅ GAMIFICATION DATA LOADED:';
    RAISE NOTICE '   - Player Ranks: % / 10', rank_count;
    RAISE NOTICE '   - Total Badges: %', badge_count;
    RAISE NOTICE '     • Attack: %', attack_count;
    RAISE NOTICE '     • Defense: %', defense_count;
    RAISE NOTICE '     • Wall Ball: %', wallball_count;
    RAISE NOTICE '========================================';
    
    IF rank_count >= 10 THEN
        RAISE NOTICE '✅ All 10 ranks loaded successfully!';
    ELSE
        RAISE NOTICE '⚠️  Only % ranks loaded - check for duplicates', rank_count;
    END IF;
END $$;

-- Show what was loaded
SELECT 'PLAYER RANKS:' as section;
SELECT title, rank_order, lax_credits_required,
       metadata->>'emoji' as emoji
FROM powlax_player_ranks 
ORDER BY rank_order;

SELECT 'BADGES SUMMARY:' as section;
SELECT badge_type, COUNT(*) as count 
FROM badges_powlax 
GROUP BY badge_type
ORDER BY badge_type;

COMMIT;

-- =====================================================================
-- This script:
-- 1. Creates tables if they don't exist
-- 2. Populates with sample data
-- 3. Avoids duplicates with WHERE NOT EXISTS
-- 4. Shows verification of what was loaded
--
-- After this works, you can add more badges using the same pattern
-- =====================================================================