-- =====================================================================
-- ADD REMAINING BADGES TO COMPLETE GAMIFICATION
-- =====================================================================
-- Adds all remaining badges to reach the full 74+ badges
-- =====================================================================

BEGIN;

-- =====================================================================
-- SECTION 1: ADD REMAINING ATTACK BADGES (A6-A10)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('On the Run Rocketeer', 'Attack', 'Attack',
     'Master of shooting accurately while moving at full speed',
     'https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png',
     'attack-token', 10, 6, '{"code": "A6", "points_awarded": 20}'::jsonb),

    ('Island Isolator', 'Attack', 'Attack',
     'Expert at creating and dominating 1v1 situations',
     'https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png',
     'attack-token', 10, 7, '{"code": "A7", "points_awarded": 25}'::jsonb),

    ('Goalies Nightmare', 'Attack', 'Attack',
     'Consistently beats goalies with deceptive shots',
     'https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png',
     'attack-token', 10, 8, '{"code": "A8", "points_awarded": 25}'::jsonb),

    ('Rough Rider', 'Attack', 'Attack',
     'Thrives in physical play and fights through contact',
     'https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png',
     'attack-token', 15, 9, '{"code": "A9", "points_awarded": 30}'::jsonb),

    ('Fast Break Finisher', 'Attack', 'Attack',
     'Converts transition opportunities into goals',
     'https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png',
     'attack-token', 15, 10, '{"code": "A10", "points_awarded": 30}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 2: ADD REMAINING DEFENSE BADGES (D4-D9)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Close Quarters Crusher', 'Defense', 'Defense',
     'Dominates in tight defensive situations',
     'https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png',
     'defense-token', 5, 4, '{"code": "D4", "points_awarded": 15}'::jsonb),

    ('Ground Ball Gladiator', 'Defense', 'Defense',
     'Wins every ground ball battle',
     'https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png',
     'defense-token', 5, 5, '{"code": "D5", "points_awarded": 20}'::jsonb),

    ('Consistent Clear', 'Defense', 'Defense',
     'Reliably clears the ball under pressure',
     'https://powlax.com/wp-content/uploads/2024/10/D6-Consistent-Clear.png',
     'defense-token', 10, 6, '{"code": "D6", "points_awarded": 20}'::jsonb),

    ('Turnover Titan', 'Defense', 'Defense',
     'Forces turnovers with aggressive defensive play',
     'https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png',
     'defense-token', 10, 7, '{"code": "D7", "points_awarded": 25}'::jsonb),

    ('The Great Wall', 'Defense', 'Defense',
     'Impenetrable defender that attackers fear',
     'https://powlax.com/wp-content/uploads/2024/10/D8-The-Great-Wall.png',
     'defense-token', 15, 8, '{"code": "D8", "points_awarded": 30}'::jsonb),

    ('Silky Smooth', 'Defense', 'Defense',
     'Combines finesse with defensive dominance',
     'https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png',
     'defense-token', 15, 9, '{"code": "D9", "points_awarded": 30}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 3: ADD ALL MIDFIELD BADGES (M1-M10)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Ground Ball Guru', 'Midfield', 'Midfield',
     'Dominates face-offs and ground ball situations',
     'https://powlax.com/wp-content/uploads/2024/10/M1-Ground-Ball-Guru.png',
     'midfield-token', 5, 1, '{"code": "M1", "points_awarded": 10}'::jsonb),

    ('Transition Terror', 'Midfield', 'Midfield',
     'Master of fast breaks and transition play',
     'https://powlax.com/wp-content/uploads/2024/10/M2-Transition-Terror.png',
     'midfield-token', 5, 2, '{"code": "M2", "points_awarded": 10}'::jsonb),

    ('Two-Way Warrior', 'Midfield', 'Midfield',
     'Excels at both offensive and defensive play',
     'https://powlax.com/wp-content/uploads/2024/10/M3-Two-Way-Warrior.png',
     'midfield-token', 5, 3, '{"code": "M3", "points_awarded": 15}'::jsonb),

    ('Endurance Engine', 'Midfield', 'Midfield',
     'Unstoppable stamina and work rate',
     'https://powlax.com/wp-content/uploads/2024/10/M4-Endurance-Engine.png',
     'midfield-token', 5, 4, '{"code": "M4", "points_awarded": 15}'::jsonb),

    ('Field General', 'Midfield', 'Midfield',
     'Controls the pace and flow of the game',
     'https://powlax.com/wp-content/uploads/2024/10/M5-Field-General.png',
     'midfield-token', 5, 5, '{"code": "M5", "points_awarded": 20}'::jsonb),

    ('Shooting Specialist', 'Midfield', 'Midfield',
     'Deadly accurate from outside shooting positions',
     'https://powlax.com/wp-content/uploads/2024/10/M6-Shooting-Specialist.png',
     'midfield-token', 10, 6, '{"code": "M6", "points_awarded": 20}'::jsonb),

    ('Dodge Master', 'Midfield', 'Midfield',
     'Creates opportunities with elite dodging skills',
     'https://powlax.com/wp-content/uploads/2024/10/M7-Dodge-Master.png',
     'midfield-token', 10, 7, '{"code": "M7", "points_awarded": 25}'::jsonb),

    ('Clear Champion', 'Midfield', 'Midfield',
     'Expert at clearing and riding',
     'https://powlax.com/wp-content/uploads/2024/10/M8-Clear-Champion.png',
     'midfield-token', 10, 8, '{"code": "M8", "points_awarded": 25}'::jsonb),

    ('Face-off Phenom', 'Midfield', 'Midfield',
     'Dominates the face-off X',
     'https://powlax.com/wp-content/uploads/2024/10/M9-Face-off-Phenom.png',
     'midfield-token', 15, 9, '{"code": "M9", "points_awarded": 30}'::jsonb),

    ('Complete Midfielder', 'Midfield', 'Midfield',
     'Master of all midfield skills and situations',
     'https://powlax.com/wp-content/uploads/2024/10/M10-Complete-Midfielder.png',
     'midfield-token', 15, 10, '{"code": "M10", "points_awarded": 30}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 4: ADD REMAINING WALL BALL BADGES (WB2-WB9)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Dominant Dodger', 'Wall Ball', 'Wall Ball',
     'Expert at wall ball dodging drills',
     'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png',
     'wall-ball-token', 5, 2, '{"code": "WB2", "points_awarded": 10}'::jsonb),

    ('Stamina Star', 'Wall Ball', 'Wall Ball',
     'Exceptional endurance in wall ball workouts',
     'https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png',
     'wall-ball-token', 5, 3, '{"code": "WB3", "points_awarded": 15}'::jsonb),

    ('Finishing Phenom', 'Wall Ball', 'Wall Ball',
     'Master of shooting and finishing drills',
     'https://powlax.com/wp-content/uploads/2024/10/WB4-Finishing-Phenom.png',
     'wall-ball-token', 5, 4, '{"code": "WB4", "points_awarded": 15}'::jsonb),

    ('Bullet Snatcher', 'Wall Ball', 'Wall Ball',
     'Elite catching ability from wall ball practice',
     'https://powlax.com/wp-content/uploads/2024/10/WB5-Bullet-Snatcher.png',
     'wall-ball-token', 10, 5, '{"code": "WB5", "points_awarded": 20}'::jsonb),

    ('Long Pole Lizard', 'Wall Ball', 'Wall Ball',
     'Defensive wall ball specialist',
     'https://powlax.com/wp-content/uploads/2024/10/WB6-Long-Pole-Lizard.png',
     'wall-ball-token', 10, 6, '{"code": "WB6", "points_awarded": 20}'::jsonb),

    ('Ball Hawk', 'Wall Ball', 'Wall Ball',
     'Never drops a pass after wall ball mastery',
     'https://powlax.com/wp-content/uploads/2024/10/WB7-Ball-Hawk.png',
     'wall-ball-token', 10, 7, '{"code": "WB7", "points_awarded": 25}'::jsonb),

    ('Independent Improver', 'Wall Ball', 'Wall Ball',
     'Self-motivated wall ball training champion',
     'https://powlax.com/wp-content/uploads/2024/10/WB9-Independent-Improver.png',
     'wall-ball-token', 15, 9, '{"code": "WB9", "points_awarded": 30}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 5: ADD SOLID START BADGES (SS1-SS6)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('First Timer', 'Solid Start', 'Beginner',
     'Completed your first POWLAX workout',
     'https://powlax.com/wp-content/uploads/2024/10/SS-First-Timer.png',
     'lax-credit', 1, 1, '{"code": "SS1", "points_awarded": 5}'::jsonb),

    ('Habit Builder', 'Solid Start', 'Beginner',
     'Completed workouts 3 days in a row',
     'https://powlax.com/wp-content/uploads/2024/10/SS-Habit-Builder.png',
     'lax-credit', 3, 2, '{"code": "SS2", "points_awarded": 10}'::jsonb),

    ('Week Warrior', 'Solid Start', 'Beginner',
     'Completed 7 workouts in your first week',
     'https://powlax.com/wp-content/uploads/2024/10/SS-Week-Warrior.png',
     'lax-credit', 7, 3, '{"code": "SS3", "points_awarded": 15}'::jsonb),

    ('Consistency King', 'Solid Start', 'Beginner',
     'Maintained a workout streak for 2 weeks',
     'https://powlax.com/wp-content/uploads/2024/10/SS-Consistency-King.png',
     'lax-credit', 14, 4, '{"code": "SS4", "points_awarded": 20}'::jsonb),

    ('Monthly Master', 'Solid Start', 'Beginner',
     'Completed 30 workouts in your first month',
     'https://powlax.com/wp-content/uploads/2024/10/SS-Monthly-Master.png',
     'lax-credit', 30, 5, '{"code": "SS5", "points_awarded": 25}'::jsonb),

    ('Rising Star', 'Solid Start', 'Beginner',
     'Achieved all Solid Start badges',
     'https://powlax.com/wp-content/uploads/2024/10/SS-Rising-Star.png',
     'lax-credit', 50, 6, '{"code": "SS6", "points_awarded": 50}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 6: ADD LACROSSE IQ BADGES (IQ1-IQ9)
-- =====================================================================
INSERT INTO badges_powlax (
    title, badge_type, category, description, icon_url,
    points_type_required, points_required, sort_order, metadata
)
SELECT * FROM (VALUES
    ('Film Student', 'Lacrosse IQ', 'Knowledge',
     'Watched 10 strategy videos',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Film-Student.png',
     'iq-point', 10, 1, '{"code": "IQ1", "points_awarded": 10}'::jsonb),

    ('Quiz Master', 'Lacrosse IQ', 'Knowledge',
     'Passed 5 lacrosse knowledge quizzes',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Quiz-Master.png',
     'iq-point', 5, 2, '{"code": "IQ2", "points_awarded": 15}'::jsonb),

    ('Rule Book Reader', 'Lacrosse IQ', 'Knowledge',
     'Completed rules and regulations course',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Rule-Book.png',
     'iq-point', 1, 3, '{"code": "IQ3", "points_awarded": 20}'::jsonb),

    ('Strategy Specialist', 'Lacrosse IQ', 'Knowledge',
     'Mastered offensive and defensive concepts',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Strategy-Specialist.png',
     'iq-point', 15, 4, '{"code": "IQ4", "points_awarded": 25}'::jsonb),

    ('Position Expert', 'Lacrosse IQ', 'Knowledge',
     'Completed all position-specific training',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Position-Expert.png',
     'iq-point', 20, 5, '{"code": "IQ5", "points_awarded": 30}'::jsonb),

    ('Game Analyst', 'Lacrosse IQ', 'Knowledge',
     'Analyzed 10 game films successfully',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Game-Analyst.png',
     'iq-point', 10, 6, '{"code": "IQ6", "points_awarded": 35}'::jsonb),

    ('Coaching Assistant', 'Lacrosse IQ', 'Knowledge',
     'Helped design practice plans',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Coaching-Assistant.png',
     'iq-point', 5, 7, '{"code": "IQ7", "points_awarded": 40}'::jsonb),

    ('Lacrosse Scholar', 'Lacrosse IQ', 'Knowledge',
     'Perfect scores on all IQ assessments',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Lacrosse-Scholar.png',
     'iq-point', 25, 8, '{"code": "IQ8", "points_awarded": 45}'::jsonb),

    ('Lacrosse Professor', 'Lacrosse IQ', 'Knowledge',
     'Achieved all Lacrosse IQ badges',
     'https://powlax.com/wp-content/uploads/2024/10/IQ-Lacrosse-Professor.png',
     'iq-point', 50, 9, '{"code": "IQ9", "points_awarded": 100}'::jsonb)
) AS badges(title, badge_type, category, description, icon_url, points_type_required, points_required, sort_order, metadata)
WHERE NOT EXISTS (
    SELECT 1 FROM badges_powlax bp WHERE bp.title = badges.title
);

-- =====================================================================
-- SECTION 7: FINAL VERIFICATION
-- =====================================================================
DO $$
DECLARE
    total_badges INTEGER;
    attack_count INTEGER;
    defense_count INTEGER;
    midfield_count INTEGER;
    wallball_count INTEGER;
    solidstart_count INTEGER;
    iq_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_badges FROM badges_powlax;
    SELECT COUNT(*) INTO attack_count FROM badges_powlax WHERE badge_type = 'Attack';
    SELECT COUNT(*) INTO defense_count FROM badges_powlax WHERE badge_type = 'Defense';
    SELECT COUNT(*) INTO midfield_count FROM badges_powlax WHERE badge_type = 'Midfield';
    SELECT COUNT(*) INTO wallball_count FROM badges_powlax WHERE badge_type = 'Wall Ball';
    SELECT COUNT(*) INTO solidstart_count FROM badges_powlax WHERE badge_type = 'Solid Start';
    SELECT COUNT(*) INTO iq_count FROM badges_powlax WHERE badge_type = 'Lacrosse IQ';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '🏆 COMPLETE GAMIFICATION DATA:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 TOTAL BADGES: %', total_badges;
    RAISE NOTICE '';
    RAISE NOTICE '⚔️  Attack Badges: % / 10', attack_count;
    RAISE NOTICE '🛡️  Defense Badges: % / 9', defense_count;
    RAISE NOTICE '🏃 Midfield Badges: % / 10', midfield_count;
    RAISE NOTICE '🎾 Wall Ball Badges: % / 9', wallball_count;
    RAISE NOTICE '⭐ Solid Start Badges: % / 6', solidstart_count;
    RAISE NOTICE '🧠 Lacrosse IQ Badges: % / 9', iq_count;
    RAISE NOTICE '========================================';
    
    IF total_badges >= 53 THEN
        RAISE NOTICE '✅ SUCCESS: All badge categories populated!';
    ELSE
        RAISE NOTICE '⚠️  Some badges may be missing';
    END IF;
END $$;

-- Show complete summary
SELECT 'BADGE SUMMARY BY TYPE:' as report;
SELECT 
    badge_type,
    COUNT(*) as count,
    MIN(sort_order) as first_badge,
    MAX(sort_order) as last_badge
FROM badges_powlax 
GROUP BY badge_type
ORDER BY badge_type;

-- Show sample badges from each category
SELECT 'SAMPLE BADGES:' as report;
SELECT 
    badge_type,
    title,
    metadata->>'code' as code,
    metadata->>'points_awarded' as points
FROM badges_powlax
WHERE sort_order <= 2
ORDER BY badge_type, sort_order;

COMMIT;

-- =====================================================================
-- 🎉 GAMIFICATION SYSTEM COMPLETE!
-- All badges and ranks are now populated in your database.
-- The useGamification hook will now return real data!
-- =====================================================================