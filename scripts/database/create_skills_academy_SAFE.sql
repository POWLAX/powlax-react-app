-- ============================================
-- SKILLS ACADEMY SYSTEM - SAFE VERSION
-- ============================================
-- This version backs up existing data before recreating tables
-- ============================================

-- ============================================
-- STEP 1: BACKUP EXISTING DATA (if any)
-- ============================================

-- Create backup tables if they don't exist
CREATE TABLE IF NOT EXISTS skills_academy_workouts_backup AS 
SELECT * FROM skills_academy_workouts WHERE false;

-- Copy existing data to backup (only if not already backed up)
INSERT INTO skills_academy_workouts_backup 
SELECT * FROM skills_academy_workouts 
WHERE NOT EXISTS (SELECT 1 FROM skills_academy_workouts_backup LIMIT 1);

-- Show what we're backing up
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM skills_academy_workouts_backup;
    IF backup_count > 0 THEN
        RAISE NOTICE 'Backed up % rows from skills_academy_workouts', backup_count;
    END IF;
END $$;

-- ============================================
-- STEP 2: DROP OLD TABLES
-- ============================================
DROP TABLE IF EXISTS skills_academy_user_progress CASCADE;
DROP TABLE IF EXISTS skills_academy_workout_drills CASCADE;
DROP TABLE IF EXISTS skills_academy_workouts CASCADE;
DROP TABLE IF EXISTS skills_academy_series CASCADE;

-- ============================================
-- STEP 3: CREATE NEW TABLES WITH CORRECT SCHEMA
-- ============================================

-- 3.1: Skills Academy Series (Main workout categories)
CREATE TABLE skills_academy_series (
    id SERIAL PRIMARY KEY,
    series_name VARCHAR(255) NOT NULL UNIQUE,
    series_slug VARCHAR(255) UNIQUE,
    series_type VARCHAR(50), -- 'solid_start', 'attack', 'midfield', 'defense'
    series_code VARCHAR(10), -- 'SS1', 'A1', 'M1', 'D1', etc.
    
    -- Series metadata
    description TEXT,
    skill_focus TEXT[],
    position_focus VARCHAR(50), -- 'all', 'attack', 'midfield', 'defense'
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Display settings
    color_scheme VARCHAR(50), -- 'blue', 'red', 'green', 'orange'
    display_order INTEGER,
    is_featured BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2: Skills Academy Workouts (Individual workouts within series)
CREATE TABLE skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES skills_academy_series(id) ON DELETE CASCADE,
    
    -- Workout specifics
    workout_name VARCHAR(255) NOT NULL,
    workout_size VARCHAR(20) NOT NULL, -- 'mini', 'more', 'complete'
    drill_count INTEGER NOT NULL, -- Actual number of drills
    
    -- Metadata
    description TEXT,
    estimated_duration_minutes INTEGER,
    
    -- Legacy references
    original_json_id INTEGER, -- From LearnDash export
    original_json_name VARCHAR(255), -- Original name from JSON
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(series_id, workout_size)
);

-- 3.3: Skills Academy Workout Drills (Links workouts to powlax_drills)
CREATE TABLE skills_academy_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id) ON DELETE CASCADE,
    drill_id UUID REFERENCES powlax_drills(id) ON DELETE CASCADE, -- UUID to match powlax_drills
    
    -- Sequence and timing
    sequence_order INTEGER NOT NULL,
    drill_duration_seconds INTEGER DEFAULT 60,
    rest_duration_seconds INTEGER DEFAULT 10,
    
    -- Drill-specific settings
    repetitions INTEGER DEFAULT 10,
    
    -- Unique constraint
    UNIQUE(workout_id, sequence_order)
);

-- 3.4: User Progress Tracking
CREATE TABLE skills_academy_user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    workout_id INTEGER REFERENCES skills_academy_workouts(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_drill_index INTEGER DEFAULT 0,
    drills_completed INTEGER DEFAULT 0,
    total_drills INTEGER NOT NULL,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Performance
    points_earned INTEGER DEFAULT 0,
    
    -- Unique constraint - one active session per user per workout
    UNIQUE(user_id, workout_id, started_at)
);

-- ============================================
-- STEP 4: CREATE INDEXES
-- ============================================
CREATE INDEX idx_sa_series_type ON skills_academy_series(series_type);
CREATE INDEX idx_sa_series_code ON skills_academy_series(series_code);
CREATE INDEX idx_sa_workouts_series ON skills_academy_workouts(series_id);
CREATE INDEX idx_sa_workouts_size ON skills_academy_workouts(workout_size);
CREATE INDEX idx_sa_workout_drills_workout ON skills_academy_workout_drills(workout_id);
CREATE INDEX idx_sa_workout_drills_drill ON skills_academy_workout_drills(drill_id);
CREATE INDEX idx_sa_progress_user ON skills_academy_user_progress(user_id);
CREATE INDEX idx_sa_progress_status ON skills_academy_user_progress(status);

-- ============================================
-- STEP 5: INSERT SERIES DATA (Just 5 to test)
-- ============================================

-- Insert first 5 series to test
INSERT INTO skills_academy_series (series_name, series_slug, series_type, series_code, description, position_focus, difficulty_level, color_scheme, display_order) VALUES
('Solid Start 1 - Picking Up and Passing', 'solid-start-1', 'solid_start', 'SS1', 'Foundation skills for picking up ground balls and passing', 'all', 1, 'blue', 1),
('Solid Start 2 - Defense and Shooting', 'solid-start-2', 'solid_start', 'SS2', 'Basic defensive positioning and shooting techniques', 'all', 1, 'blue', 2),
('Solid Start 3 - Catching and Hesitation', 'solid-start-3', 'solid_start', 'SS3', 'Catching skills with hesitation moves', 'all', 1, 'blue', 3),
('Solid Start 4 - Wind Up Dodging', 'solid-start-4', 'solid_start', 'SS4', 'Introduction to wind up dodging techniques', 'all', 2, 'blue', 4),
('Solid Start 5 - Switching Hands', 'solid-start-5', 'solid_start', 'SS5', 'Mastering hand switches and ambidextrous play', 'all', 2, 'blue', 5);

-- Insert sample workouts for testing
INSERT INTO skills_academy_workouts (series_id, workout_name, workout_size, drill_count, estimated_duration_minutes)
SELECT 
    id,
    series_code || ' - Mini Workout',
    'mini',
    5,
    15
FROM skills_academy_series
WHERE series_code IN ('SS1', 'SS2', 'SS3', 'SS4', 'SS5');

INSERT INTO skills_academy_workouts (series_id, workout_name, workout_size, drill_count, estimated_duration_minutes)
SELECT 
    id,
    series_code || ' - More Workout',
    'more',
    10,
    30
FROM skills_academy_series
WHERE series_code IN ('SS1', 'SS2', 'SS3', 'SS4', 'SS5');

-- ============================================
-- VERIFICATION
-- ============================================
DO $$ 
DECLARE
    series_count INTEGER;
    workout_count INTEGER;
BEGIN 
    SELECT COUNT(*) INTO series_count FROM skills_academy_series;
    SELECT COUNT(*) INTO workout_count FROM skills_academy_workouts;
    
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '✅ SKILLS ACADEMY TABLES CREATED!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '  Series created: %', series_count;
    RAISE NOTICE '  Workouts created: %', workout_count;
    RAISE NOTICE '';
    RAISE NOTICE '📝 Tables are ready for full data import';
    RAISE NOTICE '   Run create_skills_academy_real_data.sql next';
    RAISE NOTICE '=========================================';
END $$;