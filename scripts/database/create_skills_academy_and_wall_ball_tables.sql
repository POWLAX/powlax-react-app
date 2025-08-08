-- ============================================
-- POWLAX Skills Academy & Wall Ball Tables
-- ============================================
-- This migration creates all necessary tables for:
-- 1. Skills Academy Workouts (from LearnDash JSON exports)
-- 2. Wall Ball Drills and Workouts
-- 3. Junction tables for relationships
-- ============================================

-- ============================================
-- SKILLS ACADEMY TABLES
-- ============================================

-- Skills Academy Workouts (from JSON master records)
CREATE TABLE IF NOT EXISTS powlax_skills_academy_workouts (
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

-- Skills Academy Drills (individual drills that can be reused)
CREATE TABLE IF NOT EXISTS powlax_skills_academy_drills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE, -- THIS IS THE KEY MAPPING FIELD!
    description TEXT,
    video_url TEXT,
    vimeo_id VARCHAR(50),
    duration_seconds INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    equipment_needed TEXT[],
    skill_categories TEXT[], -- e.g., ['passing', 'catching', 'ground_balls']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Academy Questions (from JSON question records)
CREATE TABLE IF NOT EXISTS powlax_skills_academy_questions (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,  -- Maps to _id from JSON
    workout_id INTEGER REFERENCES powlax_skills_academy_workouts(id) ON DELETE CASCADE,
    drill_id INTEGER REFERENCES powlax_skills_academy_drills(id), -- Links via title match
    sort_order INTEGER,
    title VARCHAR(500), -- This maps to drill title
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

-- Skills Academy Answers (from JSON answer data)
CREATE TABLE IF NOT EXISTS powlax_skills_academy_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES powlax_skills_academy_questions(id) ON DELETE CASCADE,
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
-- WALL BALL TABLES
-- ============================================

-- Wall Ball Drills (individual drills with multiple video variations)
CREATE TABLE IF NOT EXISTS powlax_wall_ball_drills (
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

-- Wall Ball Workouts (composite workouts from JSON)
CREATE TABLE IF NOT EXISTS powlax_wall_ball_workouts (
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

-- Junction table: Wall Ball Workouts to Drills mapping
CREATE TABLE IF NOT EXISTS powlax_wall_ball_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES powlax_wall_ball_workouts(id) ON DELETE CASCADE,
    drill_id INTEGER REFERENCES powlax_wall_ball_drills(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,  -- 1, 2, 3, etc. from CSV
    video_type VARCHAR(20) CHECK (video_type IN ('strong_hand', 'off_hand', 'both_hands')),
    duration_seconds INTEGER, -- Duration of this drill in the workout
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workout_id, sequence_order)
);

-- ============================================
-- USER PROGRESS TRACKING TABLES
-- ============================================

-- Track user completion of workouts
CREATE TABLE IF NOT EXISTS powlax_workout_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    workout_type VARCHAR(50) NOT NULL, -- 'skills_academy' or 'wall_ball'
    workout_id INTEGER NOT NULL, -- References either skills_academy_workouts.id or wall_ball_workouts.id
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_time_seconds INTEGER,
    score INTEGER,
    perfect_completion BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(user_id, workout_type, workout_id, completed_at)
);

-- Track user completion of individual drills
CREATE TABLE IF NOT EXISTS powlax_drill_completions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    drill_type VARCHAR(50) NOT NULL, -- 'skills_academy' or 'wall_ball'
    drill_id INTEGER NOT NULL, -- References either skills_academy_drills.id or wall_ball_drills.id
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_time_seconds INTEGER,
    reps_completed INTEGER,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    notes TEXT
);

-- User favorites for quick access
CREATE TABLE IF NOT EXISTS powlax_user_favorite_workouts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    workout_type VARCHAR(50) NOT NULL, -- 'skills_academy' or 'wall_ball'
    workout_id INTEGER NOT NULL,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, workout_type, workout_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Skills Academy indexes
CREATE INDEX idx_skills_academy_workouts_series ON powlax_skills_academy_workouts(workout_series);
CREATE INDEX idx_skills_academy_workouts_size ON powlax_skills_academy_workouts(workout_size);
CREATE INDEX idx_skills_academy_questions_workout ON powlax_skills_academy_questions(workout_id);
CREATE INDEX idx_skills_academy_questions_drill ON powlax_skills_academy_questions(drill_id);
CREATE INDEX idx_skills_academy_questions_title ON powlax_skills_academy_questions(title);
CREATE INDEX idx_skills_academy_drills_title ON powlax_skills_academy_drills(title);
CREATE INDEX idx_skills_academy_answers_question ON powlax_skills_academy_answers(question_id);

-- Wall Ball indexes
CREATE INDEX idx_wall_ball_workouts_type ON powlax_wall_ball_workouts(workout_type);
CREATE INDEX idx_wall_ball_workouts_duration ON powlax_wall_ball_workouts(duration_minutes);
CREATE INDEX idx_wall_ball_workout_drills_workout ON powlax_wall_ball_workout_drills(workout_id);
CREATE INDEX idx_wall_ball_workout_drills_drill ON powlax_wall_ball_workout_drills(drill_id);
CREATE INDEX idx_wall_ball_workout_drills_sequence ON powlax_wall_ball_workout_drills(workout_id, sequence_order);

-- User progress indexes
CREATE INDEX idx_workout_completions_user ON powlax_workout_completions(user_id);
CREATE INDEX idx_workout_completions_workout ON powlax_workout_completions(workout_type, workout_id);
CREATE INDEX idx_drill_completions_user ON powlax_drill_completions(user_id);
CREATE INDEX idx_drill_completions_drill ON powlax_drill_completions(drill_type, drill_id);
CREATE INDEX idx_favorite_workouts_user ON powlax_user_favorite_workouts(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on user-specific tables
ALTER TABLE powlax_workout_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE powlax_drill_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE powlax_user_favorite_workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout completions
CREATE POLICY "Users can view own workout completions" ON powlax_workout_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout completions" ON powlax_workout_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout completions" ON powlax_workout_completions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout completions" ON powlax_workout_completions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for drill completions
CREATE POLICY "Users can view own drill completions" ON powlax_drill_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drill completions" ON powlax_drill_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drill completions" ON powlax_drill_completions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drill completions" ON powlax_drill_completions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites" ON powlax_user_favorite_workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON powlax_user_favorite_workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON powlax_user_favorite_workouts
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to extract Vimeo ID from URL
CREATE OR REPLACE FUNCTION extract_vimeo_id(url TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
    -- Extract ID from URLs like: https://player.vimeo.com/video/997146099
    RETURN regexp_replace(url, '^.*video/([0-9]+).*$', '\1');
END;
$$ LANGUAGE plpgsql;

-- Function to parse workout name components
CREATE OR REPLACE FUNCTION parse_workout_name(workout_name TEXT)
RETURNS TABLE(
    series VARCHAR(100),
    series_number INTEGER,
    workout_type VARCHAR(100),
    duration_minutes INTEGER,
    has_coaching BOOLEAN
) AS $$
BEGIN
    -- Parse names like "Solid Start 5 - Switching Hands Workout - More"
    -- or "Master Fundamentals Wall Ball Workout (No Coaching) - 10 Minutes"
    -- This is a placeholder - implement actual parsing logic based on patterns
    RETURN QUERY
    SELECT 
        NULL::VARCHAR(100),
        NULL::INTEGER,
        NULL::VARCHAR(100),
        NULL::INTEGER,
        NOT (workout_name LIKE '%(No Coaching)%')::BOOLEAN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE powlax_skills_academy_workouts IS 'Skills Academy workouts from LearnDash JSON exports';
COMMENT ON TABLE powlax_skills_academy_drills IS 'Individual drills that can be used in multiple workouts';
COMMENT ON TABLE powlax_wall_ball_drills IS 'Wall Ball drills with multiple hand variations';
COMMENT ON TABLE powlax_wall_ball_workouts IS 'Complete Wall Ball workout videos';
COMMENT ON TABLE powlax_wall_ball_workout_drills IS 'Maps which drills appear in which Wall Ball workouts and in what order';

COMMENT ON COLUMN powlax_skills_academy_questions.title IS 'CRITICAL: This field maps to powlax_skills_academy_drills.title for drill linkage';
COMMENT ON COLUMN powlax_skills_academy_workouts.workout_size IS 'Mini = 5 drills, More = 10 drills, Complete = 13-19 drills';
COMMENT ON COLUMN powlax_wall_ball_workout_drills.sequence_order IS 'Order from CSV: 1 = first drill shown, 2 = second, etc.';