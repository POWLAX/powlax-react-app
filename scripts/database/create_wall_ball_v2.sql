-- ============================================
-- POWLAX Wall Ball V2 - New Tables
-- ============================================
-- Creates Wall Ball tables with consistent naming
-- ============================================

-- Wall Ball Drill Library (individual drills with multiple video variations)
CREATE TABLE IF NOT EXISTS powlax_wall_ball_drill_library (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    strong_hand_video_url TEXT,
    strong_hand_vimeo_id VARCHAR(50),
    off_hand_video_url TEXT,
    off_hand_vimeo_id VARCHAR(50),
    both_hands_video_url TEXT,
    both_hands_vimeo_id VARCHAR(50),
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wall Ball Workout Collections (composite workouts from JSON)
CREATE TABLE IF NOT EXISTS powlax_wall_ball_collections (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- From JSON _id
    name VARCHAR(255) NOT NULL,
    workout_type VARCHAR(100),  -- e.g., "Master Fundamentals", "Dodging", "Shooting"
    duration_minutes INTEGER,    -- e.g., 5, 10, 14, 17, 18
    has_coaching BOOLEAN DEFAULT true, -- false if name contains "(No Coaching)"
    video_url TEXT, -- URL for the complete workout video
    vimeo_id VARCHAR(50),
    wp_post_id INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table: Wall Ball Collections to Drill Library mapping
CREATE TABLE IF NOT EXISTS powlax_wall_ball_collection_drills (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES powlax_wall_ball_collections(id) ON DELETE CASCADE,
    drill_id INTEGER REFERENCES powlax_wall_ball_drill_library(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,  -- 1, 2, 3, etc. from CSV
    video_type VARCHAR(20) CHECK (video_type IN ('strong_hand', 'off_hand', 'both_hands')),
    duration_seconds INTEGER, -- Duration of this drill in the workout
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, sequence_order)
);

-- ============================================
-- HELPER VIEW to see Wall Ball workout sequences
-- ============================================
CREATE OR REPLACE VIEW powlax_wall_ball_sequences AS
SELECT 
    wc.id as collection_id,
    wc.name as workout_name,
    wc.workout_type,
    wc.duration_minutes,
    wc.has_coaching,
    wcd.sequence_order,
    wcd.video_type,
    wd.id as drill_id,
    wd.name as drill_name,
    CASE 
        WHEN wcd.video_type = 'strong_hand' THEN wd.strong_hand_video_url
        WHEN wcd.video_type = 'off_hand' THEN wd.off_hand_video_url
        WHEN wcd.video_type = 'both_hands' THEN wd.both_hands_video_url
        ELSE NULL
    END as video_url
FROM powlax_wall_ball_collections wc
LEFT JOIN powlax_wall_ball_collection_drills wcd ON wc.id = wcd.collection_id
LEFT JOIN powlax_wall_ball_drill_library wd ON wcd.drill_id = wd.id
ORDER BY wc.id, wcd.sequence_order;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_wall_ball_collections_type ON powlax_wall_ball_collections(workout_type);
CREATE INDEX idx_wall_ball_collections_duration ON powlax_wall_ball_collections(duration_minutes);
CREATE INDEX idx_wall_ball_collection_drills_collection ON powlax_wall_ball_collection_drills(collection_id);
CREATE INDEX idx_wall_ball_collection_drills_drill ON powlax_wall_ball_collection_drills(drill_id);
CREATE INDEX idx_wall_ball_collection_drills_sequence ON powlax_wall_ball_collection_drills(collection_id, sequence_order);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract Vimeo ID from URL
CREATE OR REPLACE FUNCTION extract_wall_ball_vimeo_id(url TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
    -- Extract ID from URLs like: https://player.vimeo.com/video/997146099
    IF url IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN regexp_replace(url, '^.*video/([0-9]+).*$', '\1');
END;
$$ LANGUAGE plpgsql;

-- Function to populate Vimeo IDs from URLs
CREATE OR REPLACE FUNCTION populate_wall_ball_vimeo_ids()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update strong hand Vimeo IDs
    UPDATE powlax_wall_ball_drill_library
    SET strong_hand_vimeo_id = extract_wall_ball_vimeo_id(strong_hand_video_url)
    WHERE strong_hand_video_url IS NOT NULL AND strong_hand_vimeo_id IS NULL;
    
    -- Update off hand Vimeo IDs
    UPDATE powlax_wall_ball_drill_library
    SET off_hand_vimeo_id = extract_wall_ball_vimeo_id(off_hand_video_url)
    WHERE off_hand_video_url IS NOT NULL AND off_hand_vimeo_id IS NULL;
    
    -- Update both hands Vimeo IDs
    UPDATE powlax_wall_ball_drill_library
    SET both_hands_vimeo_id = extract_wall_ball_vimeo_id(both_hands_video_url)
    WHERE both_hands_video_url IS NOT NULL AND both_hands_vimeo_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % Vimeo IDs', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE powlax_wall_ball_drill_library IS 'Wall Ball drills with multiple hand variations from CSV';
COMMENT ON TABLE powlax_wall_ball_collections IS 'Complete Wall Ball workout videos from JSON';
COMMENT ON TABLE powlax_wall_ball_collection_drills IS 'Maps which drills appear in which Wall Ball workouts and in what order';

COMMENT ON COLUMN powlax_wall_ball_collection_drills.sequence_order IS 'Order from CSV: 1 = first drill shown, 2 = second, etc.';
COMMENT ON COLUMN powlax_wall_ball_drill_library.name IS 'Must match exactly with CSV drill names for proper mapping';

-- ============================================
-- Sample queries
-- ============================================
-- Get all drills in a specific workout:
-- SELECT * FROM powlax_wall_ball_sequences WHERE workout_name LIKE '%Master Fundamentals%10 Minutes%';

-- Get all workouts that use a specific drill:
-- SELECT DISTINCT workout_name FROM powlax_wall_ball_sequences WHERE drill_name = '3 Steps Up and Back';