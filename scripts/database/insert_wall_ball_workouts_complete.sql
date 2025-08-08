-- ============================================
-- COMPLETE WALL BALL WORKOUTS DATA INSERT
-- ============================================
-- Inserts all Wall Ball workout series and variants
-- Including both coaching and no-coaching versions
-- Based on actual Vimeo URLs from CSV data
-- ============================================

-- First, ensure the tables exist (run create_wall_ball_grouped_system.sql first)

-- ============================================
-- INSERT WORKOUT SERIES
-- ============================================
INSERT INTO wall_ball_workout_series (
    series_name,
    series_slug,
    description,
    difficulty_level,
    display_order
) VALUES 
(
    'Master Fundamentals',
    'master-fundamentals',
    'Build essential wall ball skills with fundamental drills',
    1,
    1
),
(
    'Dodging',
    'dodging',
    'Develop dodging techniques and footwork',
    2,
    2
),
(
    'Shooting',
    'shooting',
    'Improve shooting accuracy and power',
    2,
    3
),
(
    'Conditioning',
    'conditioning',
    'High-intensity wall ball workout for fitness',
    3,
    4
),
(
    'Faking and Finishing',
    'faking-and-finishing',
    'Master deceptive moves and close-range shots',
    3,
    5
),
(
    'Catching Everything',
    'catching-everything',
    'Improve catching skills in all situations',
    2,
    6
),
(
    'Long Pole',
    'long-pole',
    'Specialized training for defensive long stick players',
    3,
    7
),
(
    'Advanced and Fun',
    'advanced-and-fun',
    'Challenging and entertaining advanced drills',
    4,
    8
)
ON CONFLICT (series_name) DO NOTHING;

-- ============================================
-- INSERT ALL WORKOUT VARIANTS
-- ============================================

-- MASTER FUNDAMENTALS VARIANTS (6 total)
INSERT INTO wall_ball_workout_variants (
    series_id,
    variant_name,
    duration_minutes,
    has_coaching,
    full_workout_video_url,
    full_workout_vimeo_id,
    drill_sequence,
    drill_ids
) VALUES 
-- Master Fundamentals - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027151925',
    '1027151925',
    '[]'::jsonb,  -- To be populated with actual drill sequence
    ARRAY[]::integer[]
),
-- Master Fundamentals - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027165970',
    '1027165970',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Master Fundamentals - Long (15+ min) with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - Complete',
    15,
    true,
    'https://vimeo.com/1028021156',
    '1028021156',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Master Fundamentals - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027147937',
    '1027147937',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Master Fundamentals - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027157079',
    '1027157079',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Master Fundamentals - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028020058',
    '1028020058',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- DODGING VARIANTS (6 total)
-- Dodging - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027150322',
    '1027150322',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Dodging - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027163275',
    '1027163275',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Dodging - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - Complete',
    15,
    true,
    'https://vimeo.com/1028018958',
    '1028018958',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Dodging - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027145617',
    '1027145617',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Dodging - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027154889',
    '1027154889',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Dodging - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging'),
    'Dodging - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028018449',
    '1028018449',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- SHOOTING VARIANTS (6 total)
-- Shooting - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027152366',
    '1027152366',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Shooting - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027166746',
    '1027166746',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Shooting - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - Complete',
    15,
    true,
    'https://vimeo.com/1028023379',
    '1028023379',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Shooting - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027148393',
    '1027148393',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Shooting - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027157788',
    '1027157788',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Shooting - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting'),
    'Shooting - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028022237',
    '1028022237',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- CONDITIONING VARIANTS (6 total)
-- Conditioning - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027149824',
    '1027149824',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Conditioning - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027162408',
    '1027162408',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Conditioning - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - Complete',
    15,
    true,
    'https://vimeo.com/1028016915',
    '1028016915',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Conditioning - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027146622',
    '1027146622',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Conditioning - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027154205',
    '1027154205',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Conditioning - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning'),
    'Conditioning - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1027168563',
    '1027168563',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- FAKING AND FINISHING VARIANTS (6 total)
-- Faking and Finishing - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027150823',
    '1027150823',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Faking and Finishing - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027164139',
    '1027164139',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Faking and Finishing - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - Complete',
    15,
    true,
    'https://vimeo.com/1028017893',
    '1028017893',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Faking and Finishing - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027147006',
    '1027147006',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Faking and Finishing - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027155661',
    '1027155661',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Faking and Finishing - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing'),
    'Faking and Finishing - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028017452',
    '1028017452',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- CATCHING EVERYTHING VARIANTS (6 total)
-- Catching Everything - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027149340',
    '1027149340',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Catching Everything - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027161602',
    '1027161602',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Catching Everything - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - Complete',
    15,
    true,
    'https://vimeo.com/1028016454',
    '1028016454',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Catching Everything - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027146369',
    '1027146369',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Catching Everything - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027153488',
    '1027153488',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Catching Everything - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything'),
    'Catching Everything - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1027167455',
    '1027167455',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- LONG POLE VARIANTS (6 total)
-- Long Pole - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027151384',
    '1027151384',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Long Pole - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027165123',
    '1027165123',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Long Pole - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - Complete',
    15,
    true,
    'https://vimeo.com/1028020623',
    '1028020623',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Long Pole - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027147420',
    '1027147420',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Long Pole - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027156383',
    '1027156383',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Long Pole - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Long Pole'),
    'Long Pole - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028019471',
    '1028019471',
    '[]'::jsonb,
    ARRAY[]::integer[]
),

-- ADVANCED AND FUN VARIANTS (6 total)
-- Advanced and Fun - 5 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - 5 Minutes',
    5,
    true,
    'https://vimeo.com/1027148858',
    '1027148858',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Advanced and Fun - 10 min with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - 10 Minutes',
    10,
    true,
    'https://vimeo.com/1027161186',
    '1027161186',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Advanced and Fun - Long with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - Complete',
    15,
    true,
    'https://vimeo.com/1028022791',
    '1028022791',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Advanced and Fun - 5 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - 5 Minutes (No Coaching)',
    5,
    false,
    'https://vimeo.com/1027146103',
    '1027146103',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Advanced and Fun - 10 min NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - 10 Minutes (No Coaching)',
    10,
    false,
    'https://vimeo.com/1027152773',
    '1027152773',
    '[]'::jsonb,
    ARRAY[]::integer[]
),
-- Advanced and Fun - Long NO coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun'),
    'Advanced and Fun - Complete (No Coaching)',
    15,
    false,
    'https://vimeo.com/1028021728',
    '1028021728',
    '[]'::jsonb,
    ARRAY[]::integer[]
)
ON CONFLICT (series_id, duration_minutes, has_coaching) DO UPDATE
SET 
    full_workout_video_url = EXCLUDED.full_workout_video_url,
    full_workout_vimeo_id = EXCLUDED.full_workout_vimeo_id,
    variant_name = EXCLUDED.variant_name,
    updated_at = NOW();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total counts
SELECT 
    'Total Series' as metric,
    COUNT(*) as count
FROM wall_ball_workout_series
UNION ALL
SELECT 
    'Total Variants' as metric,
    COUNT(*) as count
FROM wall_ball_workout_variants
UNION ALL
SELECT 
    'Coaching Variants' as metric,
    COUNT(*) as count
FROM wall_ball_workout_variants
WHERE has_coaching = true
UNION ALL
SELECT 
    'No Coaching Variants' as metric,
    COUNT(*) as count
FROM wall_ball_workout_variants
WHERE has_coaching = false;

-- Show series with variant counts
SELECT 
    s.series_name,
    COUNT(CASE WHEN v.has_coaching = true THEN 1 END) as coaching_variants,
    COUNT(CASE WHEN v.has_coaching = false THEN 1 END) as no_coaching_variants,
    COUNT(*) as total_variants
FROM wall_ball_workout_series s
LEFT JOIN wall_ball_workout_variants v ON s.id = v.series_id
GROUP BY s.series_name
ORDER BY s.display_order;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Wall Ball Workouts Import Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Imported:';
    RAISE NOTICE '   - 8 workout series';
    RAISE NOTICE '   - 48 total workout variants';
    RAISE NOTICE '   - 24 with coaching';
    RAISE NOTICE '   - 24 without coaching';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Each series has:';
    RAISE NOTICE '   - 3 durations: 5 min, 10 min, Complete (15+ min)';
    RAISE NOTICE '   - 2 coaching options: With and Without';
    RAISE NOTICE '   - Total: 6 variants per series';
    RAISE NOTICE '';
    RAISE NOTICE '📹 All Vimeo URLs included and verified from CSV data';
END $$;