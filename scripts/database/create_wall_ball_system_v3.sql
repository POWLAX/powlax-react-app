-- ============================================
-- POWLAX Wall Ball System V3 - Complete Schema
-- ============================================
-- Creates new Wall Ball tables with array-based drill references
-- Allows workouts to directly reference multiple drills
-- ============================================

-- Drop existing tables if needed (comment out in production)
-- DROP TABLE IF EXISTS wall_ball_workout_system CASCADE;
-- DROP TABLE IF EXISTS wall_ball_drill_catalog CASCADE;

-- ============================================
-- WALL BALL DRILL CATALOG
-- ============================================
-- Individual Wall Ball drills with all variations
CREATE TABLE IF NOT EXISTS wall_ball_drill_catalog (
    id SERIAL PRIMARY KEY,
    drill_name VARCHAR(255) NOT NULL UNIQUE,
    drill_slug VARCHAR(255) UNIQUE, -- URL-friendly version
    
    -- Video URLs for different hand variations
    strong_hand_video_url TEXT,
    strong_hand_vimeo_id VARCHAR(50),
    strong_hand_duration_seconds INTEGER,
    
    off_hand_video_url TEXT,
    off_hand_vimeo_id VARCHAR(50),
    off_hand_duration_seconds INTEGER,
    
    both_hands_video_url TEXT,
    both_hands_vimeo_id VARCHAR(50),
    both_hands_duration_seconds INTEGER,
    
    -- Drill metadata
    description TEXT,
    coaching_points TEXT[],  -- Array of coaching tips
    common_mistakes TEXT[],  -- Array of mistakes to avoid
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Categorization
    skill_focus TEXT[], -- ['hand_speed', 'accuracy', 'power', 'footwork']
    drill_type VARCHAR(50), -- 'fundamental', 'advanced', 'game_situation'
    
    -- Equipment and setup
    equipment_needed TEXT[],
    wall_distance_feet INTEGER,
    recommended_reps INTEGER,
    recommended_sets INTEGER,
    
    -- Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WALL BALL WORKOUT SYSTEM
-- ============================================
-- Complete Wall Ball workout videos with drill sequences
CREATE TABLE IF NOT EXISTS wall_ball_workout_system (
    id SERIAL PRIMARY KEY,
    workout_name VARCHAR(255) NOT NULL,
    workout_slug VARCHAR(255) UNIQUE,
    
    -- Workout categorization
    workout_series VARCHAR(100), -- 'Master Fundamentals', 'Elite Skills', 'Game Ready'
    workout_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'elite'
    workout_focus VARCHAR(100), -- 'fundamentals', 'dodging', 'shooting', 'complete'
    
    -- Duration and format
    total_duration_minutes INTEGER NOT NULL,
    has_coaching BOOLEAN DEFAULT true,
    coaching_style VARCHAR(50), -- 'detailed', 'quick_tips', 'follow_along', 'none'
    
    -- Complete workout video (single pre-built video)
    full_workout_video_url TEXT NOT NULL,
    full_workout_vimeo_id VARCHAR(50),
    thumbnail_url TEXT,
    
    -- ARRAY OF DRILL IDs WITH METADATA
    drill_sequence JSONB NOT NULL,
    /* 
    Example structure:
    [
        {
            "drill_id": 1,
            "drill_name": "Quick Stick",
            "sequence_order": 1,
            "duration_seconds": 60,
            "hand_variation": "both_hands",
            "reps": 30,
            "coaching_cues": ["Keep elbows up", "Quick release"]
        },
        {
            "drill_id": 2,
            "drill_name": "Cross Hand",
            "sequence_order": 2,
            "duration_seconds": 90,
            "hand_variation": "strong_hand",
            "reps": 45,
            "coaching_cues": ["Full extension", "Snap the wrist"]
        }
    ]
    */
    
    -- Quick access arrays for filtering
    drill_ids INTEGER[], -- Array of drill catalog IDs for quick queries
    total_drills INTEGER GENERATED ALWAYS AS (jsonb_array_length(drill_sequence)) STORED,
    
    -- Workout metadata
    description TEXT,
    workout_goals TEXT[],
    target_audience TEXT, -- '8-10 years', '11-14 years', '15+ years', 'all ages'
    prerequisites TEXT[],
    
    -- Coaching content
    intro_message TEXT,
    outro_message TEXT,
    key_focus_points TEXT[],
    
    -- WordPress legacy
    wp_post_id INTEGER,
    wp_quiz_id INTEGER,
    
    -- Tracking
    times_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get all drills in a workout with full details
CREATE OR REPLACE FUNCTION get_workout_drills_detailed(workout_id INTEGER)
RETURNS TABLE (
    sequence_order INTEGER,
    drill_id INTEGER,
    drill_name VARCHAR(255),
    duration_seconds INTEGER,
    hand_variation TEXT,
    reps INTEGER,
    video_url TEXT,
    difficulty_level INTEGER,
    coaching_cues TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (drill_item->>'sequence_order')::INTEGER as sequence_order,
        (drill_item->>'drill_id')::INTEGER as drill_id,
        d.drill_name,
        (drill_item->>'duration_seconds')::INTEGER as duration_seconds,
        drill_item->>'hand_variation' as hand_variation,
        (drill_item->>'reps')::INTEGER as reps,
        CASE drill_item->>'hand_variation'
            WHEN 'strong_hand' THEN d.strong_hand_video_url
            WHEN 'off_hand' THEN d.off_hand_video_url
            WHEN 'both_hands' THEN d.both_hands_video_url
            ELSE d.both_hands_video_url
        END as video_url,
        d.difficulty_level,
        ARRAY(SELECT jsonb_array_elements_text(drill_item->'coaching_cues'))::TEXT[] as coaching_cues
    FROM 
        wall_ball_workout_system w,
        jsonb_array_elements(w.drill_sequence) as drill_item
        LEFT JOIN wall_ball_drill_catalog d ON d.id = (drill_item->>'drill_id')::INTEGER
    WHERE 
        w.id = workout_id
    ORDER BY 
        (drill_item->>'sequence_order')::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to add a drill to a workout
CREATE OR REPLACE FUNCTION add_drill_to_workout(
    p_workout_id INTEGER,
    p_drill_id INTEGER,
    p_duration_seconds INTEGER,
    p_hand_variation VARCHAR(20),
    p_reps INTEGER DEFAULT NULL,
    p_coaching_cues TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_drill_name VARCHAR(255);
    v_next_order INTEGER;
    v_new_drill JSONB;
BEGIN
    -- Get drill name
    SELECT drill_name INTO v_drill_name
    FROM wall_ball_drill_catalog
    WHERE id = p_drill_id;
    
    IF v_drill_name IS NULL THEN
        RAISE EXCEPTION 'Drill with id % not found', p_drill_id;
        RETURN FALSE;
    END IF;
    
    -- Get next sequence order
    SELECT COALESCE(MAX((drill_item->>'sequence_order')::INTEGER), 0) + 1 INTO v_next_order
    FROM wall_ball_workout_system w,
         jsonb_array_elements(w.drill_sequence) as drill_item
    WHERE w.id = p_workout_id;
    
    -- Create new drill object
    v_new_drill := jsonb_build_object(
        'drill_id', p_drill_id,
        'drill_name', v_drill_name,
        'sequence_order', v_next_order,
        'duration_seconds', p_duration_seconds,
        'hand_variation', p_hand_variation,
        'reps', p_reps,
        'coaching_cues', p_coaching_cues
    );
    
    -- Add to workout
    UPDATE wall_ball_workout_system
    SET 
        drill_sequence = drill_sequence || v_new_drill,
        drill_ids = array_append(drill_ids, p_drill_id),
        updated_at = NOW()
    WHERE id = p_workout_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder drills in a workout
CREATE OR REPLACE FUNCTION reorder_workout_drills(
    p_workout_id INTEGER,
    p_new_order INTEGER[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_reordered JSONB;
BEGIN
    -- Build reordered sequence
    WITH ordered_drills AS (
        SELECT 
            drill_item,
            array_position(p_new_order, (drill_item->>'drill_id')::INTEGER) as new_pos
        FROM 
            wall_ball_workout_system w,
            jsonb_array_elements(w.drill_sequence) as drill_item
        WHERE 
            w.id = p_workout_id
    )
    SELECT jsonb_agg(
        jsonb_set(drill_item, '{sequence_order}', to_jsonb(new_pos))
        ORDER BY new_pos
    ) INTO v_reordered
    FROM ordered_drills
    WHERE new_pos IS NOT NULL;
    
    -- Update workout
    UPDATE wall_ball_workout_system
    SET 
        drill_sequence = v_reordered,
        updated_at = NOW()
    WHERE id = p_workout_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR EASY ACCESS
-- ============================================

-- View to see workout summaries with drill counts
CREATE OR REPLACE VIEW wall_ball_workout_summary AS
SELECT 
    w.id,
    w.workout_name,
    w.workout_series,
    w.workout_level,
    w.total_duration_minutes,
    w.total_drills,
    w.has_coaching,
    w.is_featured,
    w.drill_ids,
    array_agg(DISTINCT d.drill_name ORDER BY d.drill_name) as drill_names,
    avg(d.difficulty_level)::DECIMAL(3,2) as avg_difficulty
FROM 
    wall_ball_workout_system w
    LEFT JOIN wall_ball_drill_catalog d ON d.id = ANY(w.drill_ids)
WHERE 
    w.is_active = true
GROUP BY 
    w.id, w.workout_name, w.workout_series, w.workout_level, 
    w.total_duration_minutes, w.total_drills, w.has_coaching, 
    w.is_featured, w.drill_ids;

-- View to see all workout-drill relationships expanded
CREATE OR REPLACE VIEW wall_ball_workout_drills_expanded AS
SELECT 
    w.id as workout_id,
    w.workout_name,
    w.total_duration_minutes,
    (drill_item->>'sequence_order')::INTEGER as sequence_order,
    (drill_item->>'drill_id')::INTEGER as drill_id,
    d.drill_name,
    (drill_item->>'duration_seconds')::INTEGER as duration_seconds,
    drill_item->>'hand_variation' as hand_variation,
    (drill_item->>'reps')::INTEGER as reps,
    d.difficulty_level,
    CASE drill_item->>'hand_variation'
        WHEN 'strong_hand' THEN d.strong_hand_video_url
        WHEN 'off_hand' THEN d.off_hand_video_url
        WHEN 'both_hands' THEN d.both_hands_video_url
        ELSE d.both_hands_video_url
    END as drill_video_url
FROM 
    wall_ball_workout_system w,
    jsonb_array_elements(w.drill_sequence) as drill_item
    LEFT JOIN wall_ball_drill_catalog d ON d.id = (drill_item->>'drill_id')::INTEGER
ORDER BY 
    w.id, (drill_item->>'sequence_order')::INTEGER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Drill catalog indexes
CREATE INDEX idx_wall_ball_drill_catalog_name ON wall_ball_drill_catalog(drill_name);
CREATE INDEX idx_wall_ball_drill_catalog_slug ON wall_ball_drill_catalog(drill_slug);
CREATE INDEX idx_wall_ball_drill_catalog_type ON wall_ball_drill_catalog(drill_type);
CREATE INDEX idx_wall_ball_drill_catalog_difficulty ON wall_ball_drill_catalog(difficulty_level);
CREATE INDEX idx_wall_ball_drill_catalog_active ON wall_ball_drill_catalog(is_active);

-- Workout system indexes
CREATE INDEX idx_wall_ball_workout_system_name ON wall_ball_workout_system(workout_name);
CREATE INDEX idx_wall_ball_workout_system_slug ON wall_ball_workout_system(workout_slug);
CREATE INDEX idx_wall_ball_workout_system_series ON wall_ball_workout_system(workout_series);
CREATE INDEX idx_wall_ball_workout_system_level ON wall_ball_workout_system(workout_level);
CREATE INDEX idx_wall_ball_workout_system_drill_ids ON wall_ball_workout_system USING gin(drill_ids);
CREATE INDEX idx_wall_ball_workout_system_drill_sequence ON wall_ball_workout_system USING gin(drill_sequence);
CREATE INDEX idx_wall_ball_workout_system_featured ON wall_ball_workout_system(is_featured);
CREATE INDEX idx_wall_ball_workout_system_active ON wall_ball_workout_system(is_active);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample drills
INSERT INTO wall_ball_drill_catalog (
    drill_name, drill_slug, 
    strong_hand_video_url, off_hand_video_url, both_hands_video_url,
    description, difficulty_level, skill_focus, drill_type,
    wall_distance_feet, recommended_reps, recommended_sets
) VALUES 
(
    'Quick Stick',
    'quick-stick',
    'https://player.vimeo.com/video/997146099',
    'https://player.vimeo.com/video/997146100',
    'https://player.vimeo.com/video/997146101',
    'Rapid catch and release to develop hand speed',
    2,
    ARRAY['hand_speed', 'accuracy'],
    'fundamental',
    5,
    30,
    3
),
(
    'Cross Hand',
    'cross-hand',
    'https://player.vimeo.com/video/997146102',
    'https://player.vimeo.com/video/997146103',
    'https://player.vimeo.com/video/997146104',
    'Cross-body catches to improve hand-eye coordination',
    3,
    ARRAY['coordination', 'flexibility'],
    'advanced',
    5,
    20,
    3
),
(
    'Behind the Back',
    'behind-the-back',
    'https://player.vimeo.com/video/997146105',
    'https://player.vimeo.com/video/997146106',
    'https://player.vimeo.com/video/997146107',
    'Advanced drill for stick control and spatial awareness',
    4,
    ARRAY['stick_control', 'creativity'],
    'advanced',
    4,
    15,
    2
)
ON CONFLICT (drill_name) DO NOTHING;

-- Insert sample workout with drill array
INSERT INTO wall_ball_workout_system (
    workout_name, workout_slug,
    workout_series, workout_level, workout_focus,
    total_duration_minutes, has_coaching,
    full_workout_video_url, full_workout_vimeo_id,
    drill_sequence,
    drill_ids,
    description,
    target_audience
) VALUES (
    'Master Fundamentals - 10 Minute Workout',
    'master-fundamentals-10-min',
    'Master Fundamentals',
    'beginner',
    'fundamentals',
    10,
    true,
    'https://player.vimeo.com/video/997146200',
    '997146200',
    '[
        {
            "drill_id": 1,
            "drill_name": "Quick Stick",
            "sequence_order": 1,
            "duration_seconds": 180,
            "hand_variation": "both_hands",
            "reps": 90,
            "coaching_cues": ["Keep elbows up", "Quick release", "Soft hands"]
        },
        {
            "drill_id": 2,
            "drill_name": "Cross Hand",
            "sequence_order": 2,
            "duration_seconds": 240,
            "hand_variation": "strong_hand",
            "reps": 60,
            "coaching_cues": ["Full extension", "Follow through", "Eyes on the ball"]
        },
        {
            "drill_id": 3,
            "drill_name": "Behind the Back",
            "sequence_order": 3,
            "duration_seconds": 180,
            "hand_variation": "both_hands",
            "reps": 45,
            "coaching_cues": ["Stay low", "Quick transition", "Control the cradle"]
        }
    ]'::jsonb,
    ARRAY[1, 2, 3],
    'Perfect for beginners to master the fundamental wall ball skills',
    '8-10 years'
) ON CONFLICT (workout_slug) DO NOTHING;

-- ============================================
-- PERMISSIONS (Row Level Security)
-- ============================================

-- Anyone can read drills and workouts
GRANT SELECT ON wall_ball_drill_catalog TO authenticated;
GRANT SELECT ON wall_ball_workout_system TO authenticated;
GRANT SELECT ON wall_ball_workout_summary TO authenticated;
GRANT SELECT ON wall_ball_workout_drills_expanded TO authenticated;

-- Only admins can modify
GRANT INSERT, UPDATE, DELETE ON wall_ball_drill_catalog TO service_role;
GRANT INSERT, UPDATE, DELETE ON wall_ball_workout_system TO service_role;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

/*
-- Get all drills in a workout with details:
SELECT * FROM get_workout_drills_detailed(1);

-- Get workout summary:
SELECT * FROM wall_ball_workout_summary WHERE workout_level = 'beginner';

-- Add a new drill to a workout:
SELECT add_drill_to_workout(
    p_workout_id := 1,
    p_drill_id := 2,
    p_duration_seconds := 120,
    p_hand_variation := 'off_hand',
    p_reps := 40,
    p_coaching_cues := ARRAY['Keep moving', 'Stay focused']
);

-- Access drill sequence from application:
SELECT 
    workout_name,
    drill_sequence
FROM wall_ball_workout_system
WHERE id = 1;

-- Extract specific drill from sequence:
SELECT 
    workout_name,
    drill_sequence->0 as first_drill,
    drill_sequence->0->>'drill_name' as first_drill_name
FROM wall_ball_workout_system
WHERE id = 1;
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Wall Ball System V3 Created Successfully!';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '   - wall_ball_drill_catalog (individual drills)';
    RAISE NOTICE '   - wall_ball_workout_system (workouts with drill arrays)';
    RAISE NOTICE '🔧 Features:';
    RAISE NOTICE '   - JSONB drill_sequence array for flexible drill ordering';
    RAISE NOTICE '   - Helper functions for drill management';
    RAISE NOTICE '   - Views for easy data access';
    RAISE NOTICE '   - Sample data included';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Key difference: Workouts now contain a drill_sequence JSONB array';
    RAISE NOTICE '   that stores all drill information and can be directly accessed';
    RAISE NOTICE '   from the application without additional joins.';
END $$;