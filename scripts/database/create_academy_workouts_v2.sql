-- ============================================
-- POWLAX Academy Workouts V2 - New Tables
-- ============================================
-- Creates new tables for JSON workout data that work with existing skills_academy_drills
-- ============================================

-- Academy Workout Collections (from JSON master records)
-- Using different name to avoid conflict with existing skills_academy_workouts
CREATE TABLE IF NOT EXISTS powlax_academy_workout_collections (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- Maps to _id from JSON
    name VARCHAR(255) NOT NULL,
    workout_series VARCHAR(100), -- e.g., "Solid Start", "Wall Ball"
    series_number INTEGER, -- e.g., 5 for "Solid Start 5"
    workout_size VARCHAR(20), -- "Mini" (5 drills), "More" (10 drills), "Complete" (13-19 drills)
    wp_post_id INTEGER,
    show_title BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT false,
    randomize_answers BOOLEAN DEFAULT false,
    time_limit INTEGER DEFAULT 0,
    track_stats BOOLEAN DEFAULT true,
    show_points BOOLEAN DEFAULT false,
    single_attempt BOOLEAN DEFAULT false,
    auto_start BOOLEAN DEFAULT false,
    questions_per_page INTEGER DEFAULT 0,
    show_category BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy Workout Items (from JSON question records)
-- Links workouts to existing skills_academy_drills via title matching
CREATE TABLE IF NOT EXISTS powlax_academy_workout_items (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- Maps to _id from JSON
    workout_collection_id INTEGER REFERENCES powlax_academy_workout_collections(id) ON DELETE CASCADE,
    drill_id INTEGER REFERENCES skills_academy_drills(id), -- Links to EXISTING drills table
    drill_title VARCHAR(500), -- The title from JSON that maps to skills_academy_drills.title
    sort_order INTEGER,
    question_text TEXT,
    points INTEGER DEFAULT 0,
    correct_message TEXT,
    incorrect_message TEXT,
    answer_type VARCHAR(50),
    use_same_correct_msg BOOLEAN DEFAULT true,
    show_tips BOOLEAN DEFAULT false,
    tip_message TEXT,
    use_answer_points BOOLEAN DEFAULT false,
    show_points_in_box BOOLEAN DEFAULT false,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy Workout Item Answers (from JSON answer data)
CREATE TABLE IF NOT EXISTS powlax_academy_workout_item_answers (
    id SERIAL PRIMARY KEY,
    workout_item_id INTEGER REFERENCES powlax_academy_workout_items(id) ON DELETE CASCADE,
    position INTEGER,
    answer_text TEXT,
    is_html BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    is_correct BOOLEAN DEFAULT false,
    sort_string VARCHAR(255),
    sort_string_html BOOLEAN DEFAULT false,
    is_graded BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HELPER VIEW to easily see workout drill sequences
-- ============================================
CREATE OR REPLACE VIEW powlax_workout_drill_sequences AS
SELECT 
    wc.id as workout_id,
    wc.name as workout_name,
    wc.workout_series,
    wc.series_number,
    wc.workout_size,
    wi.sort_order,
    wi.drill_title,
    sd.id as drill_id,
    sd.title as drill_name,
    sd.vimeo_id,
    sd.drill_category
FROM powlax_academy_workout_collections wc
LEFT JOIN powlax_academy_workout_items wi ON wc.id = wi.workout_collection_id
LEFT JOIN skills_academy_drills sd ON wi.drill_title = sd.title
ORDER BY wc.id, wi.sort_order;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_academy_workout_collections_series ON powlax_academy_workout_collections(workout_series);
CREATE INDEX idx_academy_workout_collections_size ON powlax_academy_workout_collections(workout_size);
CREATE INDEX idx_academy_workout_items_collection ON powlax_academy_workout_items(workout_collection_id);
CREATE INDEX idx_academy_workout_items_drill ON powlax_academy_workout_items(drill_id);
CREATE INDEX idx_academy_workout_items_title ON powlax_academy_workout_items(drill_title);
CREATE INDEX idx_academy_workout_item_answers_item ON powlax_academy_workout_item_answers(workout_item_id);

-- ============================================
-- FUNCTION to link workout items to drills after import
-- ============================================
CREATE OR REPLACE FUNCTION link_workout_items_to_drills()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update drill_id based on title matching
    UPDATE powlax_academy_workout_items wi
    SET drill_id = sd.id
    FROM skills_academy_drills sd
    WHERE LOWER(TRIM(wi.drill_title)) = LOWER(TRIM(sd.title))
    AND wi.drill_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Linked % workout items to drills', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE powlax_academy_workout_collections IS 'Academy workouts from LearnDash JSON exports (master records)';
COMMENT ON TABLE powlax_academy_workout_items IS 'Individual items/questions in workouts, linked to skills_academy_drills';
COMMENT ON TABLE powlax_academy_workout_item_answers IS 'Answer options for workout items';

COMMENT ON COLUMN powlax_academy_workout_items.drill_title IS 'CRITICAL: This field maps to skills_academy_drills.title for drill linkage';
COMMENT ON COLUMN powlax_academy_workout_collections.workout_size IS 'Mini = 5 drills, More = 10 drills, Complete = 13-19 drills';

-- ============================================
-- Sample query to see workout with drills
-- ============================================
-- SELECT * FROM powlax_workout_drill_sequences WHERE workout_series = 'Solid Start' AND series_number = 5;