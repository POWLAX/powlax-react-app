-- ============================================
-- COMPLETE WALL BALL DATA POPULATION
-- ============================================
-- This script populates the Wall Ball tables with all workout data
-- Works with existing table structure in Supabase
-- ============================================

-- Clear any existing data first (optional - comment out if you want to keep existing data)
TRUNCATE wall_ball_workout_variants CASCADE;
TRUNCATE wall_ball_workout_series CASCADE;

-- ============================================
-- STEP 1: INSERT WORKOUT SERIES (8 total)
-- ============================================
INSERT INTO wall_ball_workout_series (
    series_name,
    series_slug,
    description,
    difficulty_level,
    display_order,
    is_active
) VALUES 
(
    'Master Fundamentals',
    'master-fundamentals',
    'Build essential wall ball skills with fundamental drills',
    1,
    1,
    true
),
(
    'Dodging',
    'dodging',
    'Develop dodging techniques and footwork',
    2,
    2,
    true
),
(
    'Shooting',
    'shooting',
    'Improve shooting accuracy and power',
    2,
    3,
    true
),
(
    'Conditioning',
    'conditioning',
    'High-intensity wall ball workout for fitness',
    3,
    4,
    true
),
(
    'Faking and Finishing',
    'faking-and-finishing',
    'Master deceptive moves and close-range shots',
    3,
    5,
    true
),
(
    'Catching Everything',
    'catching-everything',
    'Improve catching skills in all situations',
    2,
    6,
    true
),
(
    'Long Pole',
    'long-pole',
    'Specialized training for defensive long stick players',
    3,
    7,
    true
),
(
    'Advanced and Fun',
    'advanced-and-fun',
    'Challenging and entertaining advanced drills',
    4,
    8,
    true
);

-- ============================================
-- STEP 2: INSERT ALL 48 WORKOUT VARIANTS
-- ============================================

-- Get the series IDs into variables for easier reference
DO $$
DECLARE
    master_fundamentals_id INTEGER;
    dodging_id INTEGER;
    shooting_id INTEGER;
    conditioning_id INTEGER;
    faking_id INTEGER;
    catching_id INTEGER;
    long_pole_id INTEGER;
    advanced_id INTEGER;
BEGIN
    -- Get series IDs
    SELECT id INTO master_fundamentals_id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals';
    SELECT id INTO dodging_id FROM wall_ball_workout_series WHERE series_name = 'Dodging';
    SELECT id INTO shooting_id FROM wall_ball_workout_series WHERE series_name = 'Shooting';
    SELECT id INTO conditioning_id FROM wall_ball_workout_series WHERE series_name = 'Conditioning';
    SELECT id INTO faking_id FROM wall_ball_workout_series WHERE series_name = 'Faking and Finishing';
    SELECT id INTO catching_id FROM wall_ball_workout_series WHERE series_name = 'Catching Everything';
    SELECT id INTO long_pole_id FROM wall_ball_workout_series WHERE series_name = 'Long Pole';
    SELECT id INTO advanced_id FROM wall_ball_workout_series WHERE series_name = 'Advanced and Fun';

    -- Insert Master Fundamentals variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (master_fundamentals_id, 'Master Fundamentals - 5 Minutes', 5, true, 'https://vimeo.com/1027151925', '1027151925', '[]'::jsonb, ARRAY[]::integer[]),
    (master_fundamentals_id, 'Master Fundamentals - 10 Minutes', 10, true, 'https://vimeo.com/1027165970', '1027165970', '[]'::jsonb, ARRAY[]::integer[]),
    (master_fundamentals_id, 'Master Fundamentals - Complete', 15, true, 'https://vimeo.com/1028021156', '1028021156', '[]'::jsonb, ARRAY[]::integer[]),
    (master_fundamentals_id, 'Master Fundamentals - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147937', '1027147937', '[]'::jsonb, ARRAY[]::integer[]),
    (master_fundamentals_id, 'Master Fundamentals - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027157079', '1027157079', '[]'::jsonb, ARRAY[]::integer[]),
    (master_fundamentals_id, 'Master Fundamentals - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028020058', '1028020058', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Dodging variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (dodging_id, 'Dodging - 5 Minutes', 5, true, 'https://vimeo.com/1027150322', '1027150322', '[]'::jsonb, ARRAY[]::integer[]),
    (dodging_id, 'Dodging - 10 Minutes', 10, true, 'https://vimeo.com/1027163275', '1027163275', '[]'::jsonb, ARRAY[]::integer[]),
    (dodging_id, 'Dodging - Complete', 15, true, 'https://vimeo.com/1028018958', '1028018958', '[]'::jsonb, ARRAY[]::integer[]),
    (dodging_id, 'Dodging - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027145617', '1027145617', '[]'::jsonb, ARRAY[]::integer[]),
    (dodging_id, 'Dodging - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027154889', '1027154889', '[]'::jsonb, ARRAY[]::integer[]),
    (dodging_id, 'Dodging - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028018449', '1028018449', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Shooting variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (shooting_id, 'Shooting - 5 Minutes', 5, true, 'https://vimeo.com/1027152366', '1027152366', '[]'::jsonb, ARRAY[]::integer[]),
    (shooting_id, 'Shooting - 10 Minutes', 10, true, 'https://vimeo.com/1027166746', '1027166746', '[]'::jsonb, ARRAY[]::integer[]),
    (shooting_id, 'Shooting - Complete', 15, true, 'https://vimeo.com/1028023379', '1028023379', '[]'::jsonb, ARRAY[]::integer[]),
    (shooting_id, 'Shooting - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027148393', '1027148393', '[]'::jsonb, ARRAY[]::integer[]),
    (shooting_id, 'Shooting - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027157788', '1027157788', '[]'::jsonb, ARRAY[]::integer[]),
    (shooting_id, 'Shooting - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028022237', '1028022237', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Conditioning variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (conditioning_id, 'Conditioning - 5 Minutes', 5, true, 'https://vimeo.com/1027149824', '1027149824', '[]'::jsonb, ARRAY[]::integer[]),
    (conditioning_id, 'Conditioning - 10 Minutes', 10, true, 'https://vimeo.com/1027162408', '1027162408', '[]'::jsonb, ARRAY[]::integer[]),
    (conditioning_id, 'Conditioning - Complete', 15, true, 'https://vimeo.com/1028016915', '1028016915', '[]'::jsonb, ARRAY[]::integer[]),
    (conditioning_id, 'Conditioning - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146622', '1027146622', '[]'::jsonb, ARRAY[]::integer[]),
    (conditioning_id, 'Conditioning - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027154205', '1027154205', '[]'::jsonb, ARRAY[]::integer[]),
    (conditioning_id, 'Conditioning - Complete (No Coaching)', 15, false, 'https://vimeo.com/1027168563', '1027168563', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Faking and Finishing variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (faking_id, 'Faking and Finishing - 5 Minutes', 5, true, 'https://vimeo.com/1027150823', '1027150823', '[]'::jsonb, ARRAY[]::integer[]),
    (faking_id, 'Faking and Finishing - 10 Minutes', 10, true, 'https://vimeo.com/1027164139', '1027164139', '[]'::jsonb, ARRAY[]::integer[]),
    (faking_id, 'Faking and Finishing - Complete', 15, true, 'https://vimeo.com/1028017893', '1028017893', '[]'::jsonb, ARRAY[]::integer[]),
    (faking_id, 'Faking and Finishing - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147006', '1027147006', '[]'::jsonb, ARRAY[]::integer[]),
    (faking_id, 'Faking and Finishing - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027155661', '1027155661', '[]'::jsonb, ARRAY[]::integer[]),
    (faking_id, 'Faking and Finishing - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028017452', '1028017452', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Catching Everything variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (catching_id, 'Catching Everything - 5 Minutes', 5, true, 'https://vimeo.com/1027149340', '1027149340', '[]'::jsonb, ARRAY[]::integer[]),
    (catching_id, 'Catching Everything - 10 Minutes', 10, true, 'https://vimeo.com/1027161602', '1027161602', '[]'::jsonb, ARRAY[]::integer[]),
    (catching_id, 'Catching Everything - Complete', 15, true, 'https://vimeo.com/1028016454', '1028016454', '[]'::jsonb, ARRAY[]::integer[]),
    (catching_id, 'Catching Everything - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146369', '1027146369', '[]'::jsonb, ARRAY[]::integer[]),
    (catching_id, 'Catching Everything - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027153488', '1027153488', '[]'::jsonb, ARRAY[]::integer[]),
    (catching_id, 'Catching Everything - Complete (No Coaching)', 15, false, 'https://vimeo.com/1027167455', '1027167455', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Long Pole variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (long_pole_id, 'Long Pole - 5 Minutes', 5, true, 'https://vimeo.com/1027151384', '1027151384', '[]'::jsonb, ARRAY[]::integer[]),
    (long_pole_id, 'Long Pole - 10 Minutes', 10, true, 'https://vimeo.com/1027165123', '1027165123', '[]'::jsonb, ARRAY[]::integer[]),
    (long_pole_id, 'Long Pole - Complete', 15, true, 'https://vimeo.com/1028020623', '1028020623', '[]'::jsonb, ARRAY[]::integer[]),
    (long_pole_id, 'Long Pole - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147420', '1027147420', '[]'::jsonb, ARRAY[]::integer[]),
    (long_pole_id, 'Long Pole - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027156383', '1027156383', '[]'::jsonb, ARRAY[]::integer[]),
    (long_pole_id, 'Long Pole - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028019471', '1028019471', '[]'::jsonb, ARRAY[]::integer[]);

    -- Insert Advanced and Fun variants (6 total)
    INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id, drill_sequence, drill_ids)
    VALUES 
    (advanced_id, 'Advanced and Fun - 5 Minutes', 5, true, 'https://vimeo.com/1027148858', '1027148858', '[]'::jsonb, ARRAY[]::integer[]),
    (advanced_id, 'Advanced and Fun - 10 Minutes', 10, true, 'https://vimeo.com/1027161186', '1027161186', '[]'::jsonb, ARRAY[]::integer[]),
    (advanced_id, 'Advanced and Fun - Complete', 15, true, 'https://vimeo.com/1028022791', '1028022791', '[]'::jsonb, ARRAY[]::integer[]),
    (advanced_id, 'Advanced and Fun - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146103', '1027146103', '[]'::jsonb, ARRAY[]::integer[]),
    (advanced_id, 'Advanced and Fun - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027152773', '1027152773', '[]'::jsonb, ARRAY[]::integer[]),
    (advanced_id, 'Advanced and Fun - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028021728', '1028021728', '[]'::jsonb, ARRAY[]::integer[]);

    RAISE NOTICE 'Successfully inserted all workout variants';
END $$;

-- ============================================
-- STEP 3: VERIFICATION QUERIES
-- ============================================

-- Check total counts
SELECT 
    'Workout Series' as category,
    COUNT(*) as count
FROM wall_ball_workout_series
UNION ALL
SELECT 
    'Total Variants' as category,
    COUNT(*) as count
FROM wall_ball_workout_variants
UNION ALL
SELECT 
    'With Coaching' as category,
    COUNT(*) as count
FROM wall_ball_workout_variants WHERE has_coaching = true
UNION ALL
SELECT 
    'No Coaching' as category,
    COUNT(*) as count
FROM wall_ball_workout_variants WHERE has_coaching = false;

-- Show each series with its variants
SELECT 
    s.series_name,
    s.difficulty_level,
    COUNT(v.id) as total_variants,
    array_agg(DISTINCT v.duration_minutes ORDER BY v.duration_minutes) as available_durations,
    COUNT(CASE WHEN v.has_coaching THEN 1 END) as with_coaching,
    COUNT(CASE WHEN NOT v.has_coaching THEN 1 END) as without_coaching
FROM wall_ball_workout_series s
LEFT JOIN wall_ball_workout_variants v ON s.id = v.series_id
GROUP BY s.id, s.series_name, s.difficulty_level
ORDER BY s.display_order;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '✅ Wall Ball Data Population Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   - 8 workout series created';
    RAISE NOTICE '   - 48 workout variants created';
    RAISE NOTICE '   - 24 with coaching';
    RAISE NOTICE '   - 24 without coaching';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Each series contains:';
    RAISE NOTICE '   - 3 durations: 5 min, 10 min, Complete (15 min)';
    RAISE NOTICE '   - 2 versions: With and Without Coaching';
    RAISE NOTICE '';
    RAISE NOTICE '📹 All Vimeo URLs are from your CSV data';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Next steps:';
    RAISE NOTICE '   1. Update drill_sequence JSONB with actual drill data';
    RAISE NOTICE '   2. Create UI to display series → variants';
    RAISE NOTICE '   3. Test video playback with Vimeo URLs';
END $$;