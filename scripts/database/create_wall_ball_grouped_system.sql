-- ============================================
-- POWLAX Wall Ball Grouped System - With Variants
-- ============================================
-- Groups Wall Ball workouts by series with duration/coaching variants
-- ============================================

-- Drop existing tables if needed (comment out in production)
-- DROP TABLE IF EXISTS wall_ball_workout_variants CASCADE;
-- DROP TABLE IF EXISTS wall_ball_workout_series CASCADE;
-- DROP TABLE IF EXISTS wall_ball_drill_library CASCADE;

-- ============================================
-- WALL BALL DRILL LIBRARY (Same as before)
-- ============================================
CREATE TABLE IF NOT EXISTS wall_ball_drill_library (
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

-- ============================================
-- WALL BALL WORKOUT SERIES (Main Grouping)
-- ============================================
-- Groups workouts by their base name (e.g., "Master Fundamentals")
CREATE TABLE IF NOT EXISTS wall_ball_workout_series (
    id SERIAL PRIMARY KEY,
    series_name VARCHAR(255) NOT NULL UNIQUE,  -- "Master Fundamentals", "Dodging", "Shooting", etc.
    series_slug VARCHAR(255) UNIQUE,
    
    -- Series metadata
    description TEXT,
    skill_focus TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    target_audience TEXT,  -- '8-10 years', '11-14 years', '15+ years'
    
    -- Display settings
    thumbnail_url TEXT,
    preview_video_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    
    -- Available variants summary (auto-populated from variants table)
    available_durations INTEGER[],  -- [5, 10, 15] minutes available
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

-- ============================================
-- WALL BALL WORKOUT VARIANTS
-- ============================================
-- Individual workout videos with specific duration and coaching options
CREATE TABLE IF NOT EXISTS wall_ball_workout_variants (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES wall_ball_workout_series(id) ON DELETE CASCADE,
    
    -- Variant specifics
    variant_name VARCHAR(255) NOT NULL,  -- Full name like "Master Fundamentals - 10 Minutes"
    duration_minutes INTEGER NOT NULL,
    has_coaching BOOLEAN DEFAULT true,
    
    -- The complete workout video (SINGLE VIDEO)
    full_workout_video_url TEXT NOT NULL,
    full_workout_vimeo_id VARCHAR(50),
    
    -- Drill sequence for this variant
    drill_sequence JSONB NOT NULL,
    /* 
    Example structure:
    [
        {
            "drill_id": 1,
            "drill_name": "Overhand",
            "sequence_order": 1,
            "duration_seconds": 60,
            "hand_variation": "both_hands",
            "reps": 30
        },
        {
            "drill_id": 2,
            "drill_name": "Quick Sticks",
            "sequence_order": 2,
            "duration_seconds": 90,
            "hand_variation": "strong_hand",
            "reps": 45
        }
    ]
    */
    
    -- Quick access
    drill_ids INTEGER[],  -- Array of drill IDs for filtering
    total_drills INTEGER GENERATED ALWAYS AS (jsonb_array_length(drill_sequence)) STORED,
    
    -- WordPress legacy
    wp_post_id INTEGER,
    original_csv_column VARCHAR(100),  -- Track which CSV column this came from
    
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
-- HELPER FUNCTIONS
-- ============================================

-- Function to get all variants for a series
CREATE OR REPLACE FUNCTION get_series_variants(p_series_id INTEGER)
RETURNS TABLE (
    variant_id INTEGER,
    variant_name VARCHAR(255),
    duration_minutes INTEGER,
    has_coaching BOOLEAN,
    total_drills INTEGER,
    video_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.variant_name,
        v.duration_minutes,
        v.has_coaching,
        v.total_drills,
        v.full_workout_video_url
    FROM wall_ball_workout_variants v
    WHERE v.series_id = p_series_id
    AND v.is_active = true
    ORDER BY v.duration_minutes, v.has_coaching DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update series summary after variants change
CREATE OR REPLACE FUNCTION update_series_summary()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE wall_ball_workout_series
    SET 
        available_durations = (
            SELECT array_agg(DISTINCT duration_minutes ORDER BY duration_minutes)
            FROM wall_ball_workout_variants
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
            AND is_active = true
        ),
        has_coaching_version = (
            SELECT bool_or(has_coaching)
            FROM wall_ball_workout_variants
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
            AND is_active = true
        ),
        has_no_coaching_version = (
            SELECT bool_or(NOT has_coaching)
            FROM wall_ball_workout_variants
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
            AND is_active = true
        ),
        total_variants = (
            SELECT COUNT(*)
            FROM wall_ball_workout_variants
            WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
            AND is_active = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.series_id, OLD.series_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update series summary
CREATE TRIGGER update_series_on_variant_change
AFTER INSERT OR UPDATE OR DELETE ON wall_ball_workout_variants
FOR EACH ROW EXECUTE FUNCTION update_series_summary();

-- ============================================
-- VIEWS FOR EASY ACCESS
-- ============================================

-- View to see all series with their variant counts
CREATE OR REPLACE VIEW wall_ball_series_overview AS
SELECT 
    s.id,
    s.series_name,
    s.description,
    s.difficulty_level,
    s.available_durations,
    s.has_coaching_version,
    s.has_no_coaching_version,
    s.total_variants,
    s.is_featured,
    s.average_rating,
    COUNT(DISTINCT v.id) as variant_count,
    MIN(v.duration_minutes) as min_duration,
    MAX(v.duration_minutes) as max_duration
FROM wall_ball_workout_series s
LEFT JOIN wall_ball_workout_variants v ON s.id = v.series_id AND v.is_active = true
WHERE s.is_active = true
GROUP BY s.id;

-- View to see all variants with their series info
CREATE OR REPLACE VIEW wall_ball_all_variants AS
SELECT 
    s.id as series_id,
    s.series_name,
    s.difficulty_level,
    v.id as variant_id,
    v.variant_name,
    v.duration_minutes,
    v.has_coaching,
    v.total_drills,
    v.full_workout_video_url,
    v.drill_sequence
FROM wall_ball_workout_series s
JOIN wall_ball_workout_variants v ON s.id = v.series_id
WHERE s.is_active = true AND v.is_active = true
ORDER BY s.series_name, v.duration_minutes, v.has_coaching DESC;

-- ============================================
-- SAMPLE DATA BASED ON CSV STRUCTURE
-- ============================================

-- Insert sample drills
INSERT INTO wall_ball_drill_library (drill_name, difficulty_level) VALUES
('Overhand', 1),
('Quick Sticks', 1),
('Turned Right', 1),
('Turned Left', 1),
('Catch and Switch', 1),
('Near Side Fake', 1),
('Twister', 2)
ON CONFLICT (drill_name) DO NOTHING;

-- Insert workout series
INSERT INTO wall_ball_workout_series (
    series_name,
    series_slug,
    description,
    difficulty_level
) VALUES 
(
    'Master Fundamentals',
    'master-fundamentals',
    'Build essential wall ball skills with fundamental drills',
    1
),
(
    'Dodging',
    'dodging',
    'Develop dodging techniques and footwork',
    2
),
(
    'Shooting',
    'shooting',
    'Improve shooting accuracy and power',
    2
),
(
    'Conditioning',
    'conditioning',
    'High-intensity wall ball workout for fitness',
    3
),
(
    'Faking and Inside Finishing',
    'faking-inside-finishing',
    'Master deceptive moves and close-range shots',
    3
)
ON CONFLICT (series_name) DO NOTHING;

-- Insert workout variants for Master Fundamentals
INSERT INTO wall_ball_workout_variants (
    series_id,
    variant_name,
    duration_minutes,
    has_coaching,
    full_workout_video_url,
    original_csv_column,
    drill_sequence,
    drill_ids
) VALUES 
-- Master Fundamentals - Full workout with coaching
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    'Master Fundamentals',
    15,  -- Estimated full duration
    true,
    'https://vimeo.com/master-fundamentals-full',
    'Master Fundamentals',
    '[
        {"drill_id": 1, "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 90},
        {"drill_id": 2, "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 90},
        {"drill_id": 6, "drill_name": "Near Side Fake", "sequence_order": 3, "duration_seconds": 90},
        {"drill_id": 4, "drill_name": "Turned Left", "sequence_order": 8, "duration_seconds": 90},
        {"drill_id": 3, "drill_name": "Turned Right", "sequence_order": 9, "duration_seconds": 90},
        {"drill_id": 5, "drill_name": "Catch and Switch", "sequence_order": 10, "duration_seconds": 90}
    ]'::jsonb,
    ARRAY[1, 2, 6, 4, 3, 5]
),
-- Master Fundamentals - 10 minute version (abbreviated in CSV as "10 Master Fund")
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    '10 Master Fund',
    10,
    true,
    'https://vimeo.com/master-fundamentals-10min',
    '10 Master Fund',
    '[
        {"drill_id": 1, "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 120},
        {"drill_id": 2, "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 120},
        {"drill_id": 6, "drill_name": "Near Side Fake", "sequence_order": 3, "duration_seconds": 120},
        {"drill_id": 5, "drill_name": "Catch and Switch", "sequence_order": 6, "duration_seconds": 120}
    ]'::jsonb,
    ARRAY[1, 2, 6, 5]
),
-- Master Fundamentals - 5 minute version
(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals'),
    '5 Minute Master Fundamentals',
    5,
    true,
    'https://vimeo.com/master-fundamentals-5min',
    '5 Minute Master Fundamentals',
    '[
        {"drill_id": 1, "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 60},
        {"drill_id": 2, "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 60},
        {"drill_id": 3, "drill_name": "Turned Right", "sequence_order": 3, "duration_seconds": 60},
        {"drill_id": 4, "drill_name": "Turned Left", "sequence_order": 4, "duration_seconds": 60},
        {"drill_id": 5, "drill_name": "Catch and Switch", "sequence_order": 5, "duration_seconds": 60}
    ]'::jsonb,
    ARRAY[1, 2, 3, 4, 5]
)
ON CONFLICT (series_id, duration_minutes, has_coaching) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Series indexes
CREATE INDEX idx_wall_ball_series_name ON wall_ball_workout_series(series_name);
CREATE INDEX idx_wall_ball_series_slug ON wall_ball_workout_series(series_slug);
CREATE INDEX idx_wall_ball_series_featured ON wall_ball_workout_series(is_featured);
CREATE INDEX idx_wall_ball_series_active ON wall_ball_workout_series(is_active);

-- Variant indexes
CREATE INDEX idx_wall_ball_variants_series ON wall_ball_workout_variants(series_id);
CREATE INDEX idx_wall_ball_variants_duration ON wall_ball_workout_variants(duration_minutes);
CREATE INDEX idx_wall_ball_variants_coaching ON wall_ball_workout_variants(has_coaching);
CREATE INDEX idx_wall_ball_variants_drills ON wall_ball_workout_variants USING gin(drill_ids);
CREATE INDEX idx_wall_ball_variants_active ON wall_ball_workout_variants(is_active);

-- ============================================
-- USAGE EXAMPLES
-- ============================================

/*
-- Get all variants for Master Fundamentals:
SELECT * FROM get_series_variants(
    (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
);

-- Show workout series page (lists all series):
SELECT * FROM wall_ball_series_overview ORDER BY display_order, series_name;

-- When user clicks on a series, show all variants:
SELECT 
    variant_name,
    duration_minutes || ' minutes' as duration,
    CASE WHEN has_coaching THEN 'With Coaching' ELSE 'No Coaching' END as coaching,
    total_drills || ' drills' as drill_count
FROM wall_ball_workout_variants
WHERE series_id = 1
ORDER BY duration_minutes DESC, has_coaching DESC;

-- Get specific variant with drills:
SELECT 
    variant_name,
    drill_sequence
FROM wall_ball_workout_variants
WHERE series_id = 1 
AND duration_minutes = 10 
AND has_coaching = true;
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Wall Ball Grouped System Created Successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 New Structure:';
    RAISE NOTICE '   - wall_ball_workout_series: Groups workouts by base name';
    RAISE NOTICE '   - wall_ball_workout_variants: Individual videos with duration/coaching options';
    RAISE NOTICE '   - wall_ball_drill_library: Drill definitions';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Key Features:';
    RAISE NOTICE '   - Workouts grouped by series (Master Fundamentals, Dodging, etc.)';
    RAISE NOTICE '   - Each series has multiple variants (5 min, 10 min, with/without coaching)';
    RAISE NOTICE '   - Clicking a series shows all available variants';
    RAISE NOTICE '   - Auto-updates series summary when variants change';
    RAISE NOTICE '';
    RAISE NOTICE '📱 User Experience:';
    RAISE NOTICE '   1. User sees list of workout series';
    RAISE NOTICE '   2. Clicks "Master Fundamentals"';
    RAISE NOTICE '   3. Sees all variants: 5 min, 10 min, 15 min, with/without coaching';
    RAISE NOTICE '   4. Selects specific variant to play';
END $$;