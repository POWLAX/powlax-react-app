-- ============================================
-- COMPLETE WALL BALL SYSTEM - CREATE AND POPULATE
-- ============================================
-- This script creates all new Wall Ball tables and populates them
-- with complete workout data including coaching/no-coaching variants
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (if they exist)
-- ============================================
-- Comment these out if you want to preserve existing data
DROP TABLE IF EXISTS wall_ball_workout_variants CASCADE;
DROP TABLE IF EXISTS wall_ball_workout_series CASCADE;
DROP TABLE IF EXISTS wall_ball_drill_library CASCADE;

-- ============================================
-- STEP 2: CREATE NEW WALL BALL TABLES
-- ============================================

-- 2.1: Wall Ball Drill Library
CREATE TABLE wall_ball_drill_library (
    id SERIAL PRIMARY KEY,
    drill_name VARCHAR(255) NOT NULL UNIQUE,
    drill_slug VARCHAR(255) UNIQUE,
    
    -- Video URLs for different hand variations
    strong_hand_video_url TEXT,
    strong_hand_vimeo_id VARCHAR(50),
    off_hand_video_url TEXT,
    off_hand_vimeo_id VARCHAR(50),
    both_hands_video_url TEXT,
    both_hands_vimeo_id VARCHAR(50),
    
    -- Drill metadata
    description TEXT,
    coaching_points TEXT[],
    common_mistakes TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    skill_focus TEXT[],
    drill_type VARCHAR(50),
    
    -- Equipment and setup
    equipment_needed TEXT[],
    wall_distance_feet INTEGER,
    recommended_reps INTEGER,
    
    -- Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2: Wall Ball Workout Series (Main Groups)
CREATE TABLE wall_ball_workout_series (
    id SERIAL PRIMARY KEY,
    series_name VARCHAR(255) NOT NULL UNIQUE,
    series_slug VARCHAR(255) UNIQUE,
    
    -- Series metadata
    description TEXT,
    skill_focus TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    target_audience TEXT,
    
    -- Display settings
    thumbnail_url TEXT,
    preview_video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    
    -- Available variants summary
    available_durations INTEGER[],
    has_coaching_version BOOLEAN DEFAULT true,
    has_no_coaching_version BOOLEAN DEFAULT false,
    
    -- Stats
    total_variants INTEGER DEFAULT 0,
    times_accessed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3: Wall Ball Workout Variants (Individual Videos)
CREATE TABLE wall_ball_workout_variants (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES wall_ball_workout_series(id) ON DELETE CASCADE,
    
    -- Variant specifics
    variant_name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    has_coaching BOOLEAN DEFAULT true,
    
    -- The complete workout video (SINGLE VIDEO)
    full_workout_video_url TEXT NOT NULL,
    full_workout_vimeo_id VARCHAR(50),
    
    -- Drill sequence for this variant
    drill_sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Quick access
    drill_ids INTEGER[] DEFAULT ARRAY[]::integer[],
    total_drills INTEGER GENERATED ALWAYS AS (jsonb_array_length(drill_sequence)) STORED,
    
    -- WordPress legacy
    wp_post_id INTEGER,
    original_csv_column VARCHAR(100),
    
    -- Stats
    times_completed INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(series_id, duration_minutes, has_coaching)
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

-- Series indexes
CREATE INDEX idx_wb_series_name ON wall_ball_workout_series(series_name);
CREATE INDEX idx_wb_series_slug ON wall_ball_workout_series(series_slug);
CREATE INDEX idx_wb_series_featured ON wall_ball_workout_series(is_featured);
CREATE INDEX idx_wb_series_active ON wall_ball_workout_series(is_active);

-- Variant indexes
CREATE INDEX idx_wb_variants_series ON wall_ball_workout_variants(series_id);
CREATE INDEX idx_wb_variants_duration ON wall_ball_workout_variants(duration_minutes);
CREATE INDEX idx_wb_variants_coaching ON wall_ball_workout_variants(has_coaching);
CREATE INDEX idx_wb_variants_active ON wall_ball_workout_variants(is_active);

-- Drill library indexes
CREATE INDEX idx_wb_drill_name ON wall_ball_drill_library(drill_name);
CREATE INDEX idx_wb_drill_slug ON wall_ball_drill_library(drill_slug);
CREATE INDEX idx_wb_drill_active ON wall_ball_drill_library(is_active);

-- ============================================
-- STEP 4: INSERT WORKOUT SERIES DATA
-- ============================================

INSERT INTO wall_ball_workout_series (
    series_name,
    series_slug,
    description,
    difficulty_level,
    display_order,
    is_active
) VALUES 
('Master Fundamentals', 'master-fundamentals', 'Build essential wall ball skills with fundamental drills', 1, 1, true),
('Dodging', 'dodging', 'Develop dodging techniques and footwork', 2, 2, true),
('Shooting', 'shooting', 'Improve shooting accuracy and power', 2, 3, true),
('Conditioning', 'conditioning', 'High-intensity wall ball workout for fitness', 3, 4, true),
('Faking and Finishing', 'faking-and-finishing', 'Master deceptive moves and close-range shots', 3, 5, true),
('Catching Everything', 'catching-everything', 'Improve catching skills in all situations', 2, 6, true),
('Long Pole', 'long-pole', 'Specialized training for defensive long stick players', 3, 7, true),
('Advanced and Fun', 'advanced-and-fun', 'Challenging and entertaining advanced drills', 4, 8, true);

-- ============================================
-- STEP 5: INSERT ALL 48 WORKOUT VARIANTS
-- ============================================

-- Master Fundamentals Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Master Fundamentals - 5 Minutes', 5, true, 'https://vimeo.com/1027151925', '1027151925'),
    ('Master Fundamentals - 10 Minutes', 10, true, 'https://vimeo.com/1027165970', '1027165970'),
    ('Master Fundamentals - Complete', 15, true, 'https://vimeo.com/1028021156', '1028021156'),
    ('Master Fundamentals - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147937', '1027147937'),
    ('Master Fundamentals - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027157079', '1027157079'),
    ('Master Fundamentals - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028020058', '1028020058')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Master Fundamentals';

-- Dodging Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Dodging - 5 Minutes', 5, true, 'https://vimeo.com/1027150322', '1027150322'),
    ('Dodging - 10 Minutes', 10, true, 'https://vimeo.com/1027163275', '1027163275'),
    ('Dodging - Complete', 15, true, 'https://vimeo.com/1028018958', '1028018958'),
    ('Dodging - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027145617', '1027145617'),
    ('Dodging - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027154889', '1027154889'),
    ('Dodging - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028018449', '1028018449')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Dodging';

-- Shooting Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Shooting - 5 Minutes', 5, true, 'https://vimeo.com/1027152366', '1027152366'),
    ('Shooting - 10 Minutes', 10, true, 'https://vimeo.com/1027166746', '1027166746'),
    ('Shooting - Complete', 15, true, 'https://vimeo.com/1028023379', '1028023379'),
    ('Shooting - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027148393', '1027148393'),
    ('Shooting - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027157788', '1027157788'),
    ('Shooting - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028022237', '1028022237')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Shooting';

-- Conditioning Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Conditioning - 5 Minutes', 5, true, 'https://vimeo.com/1027149824', '1027149824'),
    ('Conditioning - 10 Minutes', 10, true, 'https://vimeo.com/1027162408', '1027162408'),
    ('Conditioning - Complete', 15, true, 'https://vimeo.com/1028016915', '1028016915'),
    ('Conditioning - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146622', '1027146622'),
    ('Conditioning - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027154205', '1027154205'),
    ('Conditioning - Complete (No Coaching)', 15, false, 'https://vimeo.com/1027168563', '1027168563')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Conditioning';

-- Faking and Finishing Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Faking and Finishing - 5 Minutes', 5, true, 'https://vimeo.com/1027150823', '1027150823'),
    ('Faking and Finishing - 10 Minutes', 10, true, 'https://vimeo.com/1027164139', '1027164139'),
    ('Faking and Finishing - Complete', 15, true, 'https://vimeo.com/1028017893', '1028017893'),
    ('Faking and Finishing - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147006', '1027147006'),
    ('Faking and Finishing - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027155661', '1027155661'),
    ('Faking and Finishing - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028017452', '1028017452')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Faking and Finishing';

-- Catching Everything Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Catching Everything - 5 Minutes', 5, true, 'https://vimeo.com/1027149340', '1027149340'),
    ('Catching Everything - 10 Minutes', 10, true, 'https://vimeo.com/1027161602', '1027161602'),
    ('Catching Everything - Complete', 15, true, 'https://vimeo.com/1028016454', '1028016454'),
    ('Catching Everything - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146369', '1027146369'),
    ('Catching Everything - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027153488', '1027153488'),
    ('Catching Everything - Complete (No Coaching)', 15, false, 'https://vimeo.com/1027167455', '1027167455')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Catching Everything';

-- Long Pole Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Long Pole - 5 Minutes', 5, true, 'https://vimeo.com/1027151384', '1027151384'),
    ('Long Pole - 10 Minutes', 10, true, 'https://vimeo.com/1027165123', '1027165123'),
    ('Long Pole - Complete', 15, true, 'https://vimeo.com/1028020623', '1028020623'),
    ('Long Pole - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027147420', '1027147420'),
    ('Long Pole - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027156383', '1027156383'),
    ('Long Pole - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028019471', '1028019471')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Long Pole';

-- Advanced and Fun Variants (6 total)
INSERT INTO wall_ball_workout_variants (series_id, variant_name, duration_minutes, has_coaching, full_workout_video_url, full_workout_vimeo_id)
SELECT 
    id,
    variant_name,
    duration_minutes,
    has_coaching,
    video_url,
    vimeo_id
FROM wall_ball_workout_series
CROSS JOIN (VALUES
    ('Advanced and Fun - 5 Minutes', 5, true, 'https://vimeo.com/1027148858', '1027148858'),
    ('Advanced and Fun - 10 Minutes', 10, true, 'https://vimeo.com/1027161186', '1027161186'),
    ('Advanced and Fun - Complete', 15, true, 'https://vimeo.com/1028022791', '1028022791'),
    ('Advanced and Fun - 5 Minutes (No Coaching)', 5, false, 'https://vimeo.com/1027146103', '1027146103'),
    ('Advanced and Fun - 10 Minutes (No Coaching)', 10, false, 'https://vimeo.com/1027152773', '1027152773'),
    ('Advanced and Fun - Complete (No Coaching)', 15, false, 'https://vimeo.com/1028021728', '1028021728')
) AS v(variant_name, duration_minutes, has_coaching, video_url, vimeo_id)
WHERE wall_ball_workout_series.series_name = 'Advanced and Fun';

-- ============================================
-- STEP 6: UPDATE SERIES SUMMARY DATA
-- ============================================

UPDATE wall_ball_workout_series s
SET 
    available_durations = subquery.durations,
    has_coaching_version = subquery.has_coaching,
    has_no_coaching_version = subquery.has_no_coaching,
    total_variants = subquery.variant_count
FROM (
    SELECT 
        series_id,
        array_agg(DISTINCT duration_minutes ORDER BY duration_minutes) as durations,
        bool_or(has_coaching) as has_coaching,
        bool_or(NOT has_coaching) as has_no_coaching,
        COUNT(*) as variant_count
    FROM wall_ball_workout_variants
    GROUP BY series_id
) subquery
WHERE s.id = subquery.series_id;

-- ============================================
-- STEP 7: INSERT SAMPLE DRILL DATA
-- ============================================

INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    description,
    difficulty_level,
    skill_focus,
    drill_type,
    wall_distance_feet,
    recommended_reps
) VALUES
('Overhand', 'overhand', 'Basic overhand throwing and catching', 1, ARRAY['fundamentals', 'accuracy'], 'fundamental', 5, 30),
('Quick Sticks', 'quick-sticks', 'Rapid catch and release for hand speed', 1, ARRAY['hand_speed', 'reaction'], 'fundamental', 5, 30),
('Turned Right', 'turned-right', 'Catching and throwing while turned right', 2, ARRAY['footwork', 'coordination'], 'advanced', 5, 20),
('Turned Left', 'turned-left', 'Catching and throwing while turned left', 2, ARRAY['footwork', 'coordination'], 'advanced', 5, 20),
('Catch and Switch', 'catch-and-switch', 'Catch with one hand, switch to other', 2, ARRAY['hand_speed', 'coordination'], 'advanced', 5, 25),
('Near Side Fake', 'near-side-fake', 'Fake shot near side before throwing', 3, ARRAY['deception', 'shooting'], 'game_situation', 5, 20),
('Twister', 'twister', 'Full body rotation while maintaining control', 3, ARRAY['core_strength', 'coordination'], 'advanced', 5, 15),
('Behind the Back', 'behind-the-back', 'Catch and throw behind the back', 4, ARRAY['creativity', 'stick_skills'], 'advanced', 4, 15),
('One Handed', 'one-handed', 'Single hand catch and release', 3, ARRAY['hand_strength', 'control'], 'advanced', 5, 20);

-- ============================================
-- STEP 8: VERIFICATION QUERIES
-- ============================================

-- Show summary counts
SELECT 
    'Workout Series' as item,
    COUNT(*) as count
FROM wall_ball_workout_series
UNION ALL
SELECT 
    'Workout Variants' as item,
    COUNT(*) as count
FROM wall_ball_workout_variants
UNION ALL
SELECT 
    'With Coaching' as item,
    COUNT(*) as count
FROM wall_ball_workout_variants WHERE has_coaching = true
UNION ALL
SELECT 
    'No Coaching' as item,
    COUNT(*) as count
FROM wall_ball_workout_variants WHERE has_coaching = false
UNION ALL
SELECT 
    'Drill Library' as item,
    COUNT(*) as count
FROM wall_ball_drill_library;

-- Show each series with variant details
SELECT 
    s.series_name,
    s.difficulty_level,
    s.total_variants,
    s.available_durations,
    COUNT(CASE WHEN v.has_coaching THEN 1 END) as with_coaching,
    COUNT(CASE WHEN NOT v.has_coaching THEN 1 END) as without_coaching
FROM wall_ball_workout_series s
LEFT JOIN wall_ball_workout_variants v ON s.id = v.series_id
GROUP BY s.id, s.series_name, s.difficulty_level, s.total_variants, s.available_durations
ORDER BY s.display_order;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '✅ WALL BALL SYSTEM CREATED SUCCESSFULLY!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created Tables:';
    RAISE NOTICE '   • wall_ball_workout_series';
    RAISE NOTICE '   • wall_ball_workout_variants';
    RAISE NOTICE '   • wall_ball_drill_library';
    RAISE NOTICE '';
    RAISE NOTICE '📹 Populated Data:';
    RAISE NOTICE '   • 8 workout series';
    RAISE NOTICE '   • 48 workout variants (6 per series)';
    RAISE NOTICE '   • 24 with coaching';
    RAISE NOTICE '   • 24 without coaching';
    RAISE NOTICE '   • 9 sample drills in library';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Each series includes:';
    RAISE NOTICE '   • 5 Minutes (with/without coaching)';
    RAISE NOTICE '   • 10 Minutes (with/without coaching)';
    RAISE NOTICE '   • Complete/15 Minutes (with/without coaching)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ All Vimeo URLs are included and ready!';
    RAISE NOTICE '=========================================';
END $$;