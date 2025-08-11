-- =====================================================================
-- POPULATE GAMIFICATION TABLES - MINIMAL VERSION
-- =====================================================================
-- Only uses columns that definitely exist based on create-ranks-table.sql
-- =====================================================================

BEGIN;

-- =====================================================================
-- SECTION 1: POPULATE PLAYER RANKS
-- =====================================================================
-- Known columns from create-ranks-table.sql:
-- title, description, icon_url, rank_order, lax_credits_required, metadata
-- =====================================================================

-- Clear any test data
DELETE FROM powlax_player_ranks WHERE title LIKE 'Test%';

-- Insert the 10 player ranks using ONLY existing columns
INSERT INTO powlax_player_ranks (
    title,
    rank_order,
    lax_credits_required,
    description,
    icon_url,
    metadata
) VALUES
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

ON CONFLICT (title) DO UPDATE SET
    lax_credits_required = EXCLUDED.lax_credits_required,
    rank_order = EXCLUDED.rank_order,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- =====================================================================
-- SECTION 2: POPULATE BADGES  
-- =====================================================================
-- Known columns from create-badges-table.sql:
-- title, description, icon_url, category, badge_type, points_type_required, 
-- points_required, sort_order, metadata
-- =====================================================================

-- Clear any test badges
DELETE FROM badges_powlax WHERE title LIKE 'Test%';

-- ATTACK BADGES (A1-A10)
INSERT INTO badges_powlax (
    title, 
    badge_type, 
    category, 
    description, 
    icon_url,
    points_type_required,
    points_required,
    sort_order,
    metadata
) VALUES
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
 '{"code": "A5", "points_awarded": 20}'::jsonb)

ON CONFLICT DO NOTHING;

-- Continue with more badges (abbreviated for testing)
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
) VALUES
-- Defense samples
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

-- Wall Ball samples
('Foundation Ace', 'Wall Ball', 'Wall Ball',
 'Mastered the fundamental wall ball techniques',
 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png',
 'wall-ball-token', 5, 1,
 '{"code": "WB1", "points_awarded": 10}'::jsonb),

('Wall Ball Wizard', 'Wall Ball', 'Wall Ball',
 'Complete mastery of all wall ball techniques',
 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png',
 'wall-ball-token', 15, 8,
 '{"code": "WB8", "points_awarded": 30}'::jsonb)

ON CONFLICT DO NOTHING;

-- =====================================================================
-- SECTION 3: VERIFICATION
-- =====================================================================
DO $$
DECLARE
    badge_count INTEGER;
    rank_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO badge_count FROM badges_powlax;
    SELECT COUNT(*) INTO rank_count FROM powlax_player_ranks;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ GAMIFICATION DATA POPULATED:';
    RAISE NOTICE '   - Badges loaded: %', badge_count;
    RAISE NOTICE '   - Ranks loaded: %', rank_count;
    RAISE NOTICE '========================================';
END $$;

-- Show what was loaded
SELECT 'RANKS LOADED:' as info;
SELECT title, rank_order, lax_credits_required 
FROM powlax_player_ranks 
ORDER BY rank_order;

SELECT 'SAMPLE BADGES LOADED:' as info;
SELECT badge_type, title, icon_url 
FROM badges_powlax 
LIMIT 10;

COMMIT;

-- =====================================================================
-- This minimal version only uses columns that definitely exist.
-- Run this first to get basic data in, then we can add more badges.
-- =====================================================================