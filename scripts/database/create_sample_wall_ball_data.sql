-- ============================================
-- POWLAX Wall Ball Sample Data
-- ============================================
-- Creates sample data for testing wall ball functionality
-- ============================================

-- First, ensure the V2 tables exist
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
-- SAMPLE DATA
-- ============================================

-- Insert sample drills
INSERT INTO powlax_wall_ball_drill_library (name, strong_hand_video_url, description, difficulty_level) VALUES
('3 Steps Up and Back', 'https://player.vimeo.com/video/997146099', 'Basic footwork drill with wall ball', 2),
('Quick Stick', 'https://player.vimeo.com/video/997146100', 'Fast hands drill for stick skills', 3),
('Right Hand High to Low', 'https://player.vimeo.com/video/997146101', 'Hand positioning and control drill', 2),
('Left Hand High to Low', 'https://player.vimeo.com/video/997146102', 'Off-hand development drill', 3),
('Both Hands Alternating', 'https://player.vimeo.com/video/997146103', 'Ambidextrous skill development', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample workout collections
INSERT INTO powlax_wall_ball_collections (name, workout_type, duration_minutes, has_coaching, description, difficulty_level) VALUES
('Master Fundamentals - 10 Minutes', 'Master Fundamentals', 10, true, 'Essential wall ball skills for beginners', 2),
('Quick Skills - 5 Minutes', 'Master Fundamentals', 5, false, 'Fast-paced skill development', 3),
('Advanced Dodging - 15 Minutes', 'Dodging', 15, true, 'Advanced dodging techniques with wall ball', 4),
('Shooting Precision - 12 Minutes', 'Shooting', 12, true, 'Improve shooting accuracy and form', 3)
ON CONFLICT (original_id) DO NOTHING;

-- Insert sample drill sequences for workouts
INSERT INTO powlax_wall_ball_collection_drills (collection_id, drill_id, sequence_order, video_type, duration_seconds)
SELECT 
    wc.id,
    wd.id,
    sequence_data.seq_order,
    sequence_data.video_type,
    sequence_data.duration
FROM powlax_wall_ball_collections wc
CROSS JOIN powlax_wall_ball_drill_library wd
CROSS JOIN (
    VALUES 
    ('Master Fundamentals - 10 Minutes', '3 Steps Up and Back', 1, 'strong_hand', 120),
    ('Master Fundamentals - 10 Minutes', 'Quick Stick', 2, 'strong_hand', 90),
    ('Master Fundamentals - 10 Minutes', 'Right Hand High to Low', 3, 'strong_hand', 60),
    ('Quick Skills - 5 Minutes', 'Quick Stick', 1, 'both_hands', 180),
    ('Quick Skills - 5 Minutes', 'Both Hands Alternating', 2, 'both_hands', 120),
    ('Advanced Dodging - 15 Minutes', '3 Steps Up and Back', 1, 'strong_hand', 180),
    ('Advanced Dodging - 15 Minutes', 'Left Hand High to Low', 2, 'off_hand', 150),
    ('Advanced Dodging - 15 Minutes', 'Both Hands Alternating', 3, 'both_hands', 120),
    ('Shooting Precision - 12 Minutes', 'Right Hand High to Low', 1, 'strong_hand', 180),
    ('Shooting Precision - 12 Minutes', 'Left Hand High to Low', 2, 'off_hand', 180),
    ('Shooting Precision - 12 Minutes', 'Quick Stick', 3, 'both_hands', 120)
) AS sequence_data(workout_name, drill_name, seq_order, video_type, duration)
WHERE wc.name = sequence_data.workout_name AND wd.name = sequence_data.drill_name
ON CONFLICT (collection_id, sequence_order) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all workouts with drill counts
SELECT 
    wc.id,
    wc.name,
    wc.workout_type,
    wc.duration_minutes,
    COUNT(wcd.id) as drill_count
FROM powlax_wall_ball_collections wc
LEFT JOIN powlax_wall_ball_collection_drills wcd ON wc.id = wcd.collection_id
GROUP BY wc.id, wc.name, wc.workout_type, wc.duration_minutes
ORDER BY wc.id;

-- Show sample workout sequence
SELECT 
    wc.name as workout_name,
    wcd.sequence_order,
    wd.name as drill_name,
    wcd.video_type,
    wcd.duration_seconds
FROM powlax_wall_ball_collections wc
JOIN powlax_wall_ball_collection_drills wcd ON wc.id = wcd.collection_id
JOIN powlax_wall_ball_drill_library wd ON wcd.drill_id = wd.id
WHERE wc.name = 'Master Fundamentals - 10 Minutes'
ORDER BY wcd.sequence_order;
