-- ============================================
-- COMPLETE SKILLS ACADEMY SYSTEM - CREATE AND POPULATE
-- ============================================
-- This script creates all Skills Academy tables and populates them
-- Safe to run multiple times - won't duplicate data
-- ============================================

-- ============================================
-- STEP 1: CREATE TABLES (if they don't exist)
-- ============================================

-- 1.1: Skills Academy Workout Series (Main Groups)
CREATE TABLE IF NOT EXISTS skills_academy_series (
    id SERIAL PRIMARY KEY,
    series_name VARCHAR(255) NOT NULL UNIQUE,
    series_slug VARCHAR(255) UNIQUE,
    series_type VARCHAR(50), -- 'solid_start', 'attack', 'midfield', 'defense'
    
    -- Series metadata
    description TEXT,
    skill_focus TEXT[],
    position_focus VARCHAR(50), -- 'all', 'attack', 'midfield', 'defense', 'goalie'
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    target_age_group VARCHAR(50),
    
    -- Display settings
    thumbnail_url TEXT,
    preview_video_url TEXT,
    icon_name VARCHAR(50), -- for UI icons
    color_scheme VARCHAR(50), -- 'blue', 'red', 'green', 'orange'
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    
    -- Series stats
    total_workouts INTEGER DEFAULT 0,
    total_drills INTEGER DEFAULT 0,
    times_started INTEGER DEFAULT 0,
    times_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2: Skills Academy Workouts (Individual Workouts within Series)
CREATE TABLE IF NOT EXISTS skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES skills_academy_series(id) ON DELETE CASCADE,
    
    -- Workout specifics
    workout_name VARCHAR(255) NOT NULL,
    workout_number INTEGER, -- e.g., 1 for "Solid Start 1"
    workout_size VARCHAR(20) NOT NULL, -- 'mini', 'more', 'complete'
    drill_count INTEGER NOT NULL, -- 5, 10, or 13-19
    
    -- Metadata
    description TEXT,
    estimated_duration_minutes INTEGER,
    difficulty_modifier INTEGER DEFAULT 0, -- Adjusts series difficulty
    
    -- WordPress legacy
    wp_quiz_id INTEGER,
    wp_post_id INTEGER,
    original_json_id INTEGER,
    
    -- Stats
    times_started INTEGER DEFAULT 0,
    times_completed INTEGER DEFAULT 0,
    average_completion_time INTEGER, -- in seconds
    completion_rate DECIMAL(5,2), -- percentage
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(series_id, workout_number, workout_size)
);

-- 1.3: Skills Academy Drill Library (Individual Drills)
CREATE TABLE IF NOT EXISTS skills_academy_drill_library (
    id SERIAL PRIMARY KEY,
    drill_name VARCHAR(255) NOT NULL UNIQUE,
    drill_slug VARCHAR(255) UNIQUE,
    
    -- Video URLs (from dev-server.csv)
    strong_hand_video_url TEXT,
    strong_hand_vimeo_id VARCHAR(50),
    off_hand_video_url TEXT,
    off_hand_vimeo_id VARCHAR(50),
    both_hands_video_url TEXT,
    both_hands_vimeo_id VARCHAR(50),
    
    -- Drill metadata
    description TEXT,
    instructions TEXT,
    coaching_points TEXT[],
    common_mistakes TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Categorization
    drill_category VARCHAR(100), -- 'fundamentals', 'shooting', 'dodging', etc.
    skill_focus TEXT[],
    position_relevance TEXT[], -- ['attack', 'midfield', 'defense']
    
    -- Requirements
    equipment_needed TEXT[],
    space_required VARCHAR(50), -- 'small', 'medium', 'full_field'
    players_required INTEGER DEFAULT 1,
    
    -- Drill settings
    default_reps INTEGER,
    default_duration_seconds INTEGER,
    rest_between_reps INTEGER,
    
    -- Stats
    times_viewed INTEGER DEFAULT 0,
    times_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4: Skills Academy Workout Drills (Junction table - drill sequence in workouts)
CREATE TABLE IF NOT EXISTS skills_academy_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id) ON DELETE CASCADE,
    drill_id INTEGER REFERENCES skills_academy_drill_library(id) ON DELETE CASCADE,
    
    -- Sequence and timing
    sequence_order INTEGER NOT NULL, -- 1, 2, 3, etc.
    drill_duration_seconds INTEGER,
    rest_duration_seconds INTEGER DEFAULT 10,
    
    -- Drill-specific instructions for this workout
    workout_specific_instructions TEXT,
    repetitions INTEGER,
    
    -- Video preference for this workout
    video_type VARCHAR(20) DEFAULT 'both_hands', -- 'strong_hand', 'off_hand', 'both_hands'
    
    -- Progress tracking
    is_optional BOOLEAN DEFAULT false,
    points_value INTEGER DEFAULT 10,
    
    -- Unique constraint
    UNIQUE(workout_id, sequence_order)
);

-- 1.5: User Workout Progress (Track user progress through workouts)
CREATE TABLE IF NOT EXISTS skills_academy_user_progress (
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
    perfect_drills INTEGER DEFAULT 0,
    
    -- Unique constraint - one active session per user per workout
    UNIQUE(user_id, workout_id, started_at)
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

-- Series indexes
CREATE INDEX IF NOT EXISTS idx_sa_series_type ON skills_academy_series(series_type);
CREATE INDEX IF NOT EXISTS idx_sa_series_active ON skills_academy_series(is_active);
CREATE INDEX IF NOT EXISTS idx_sa_series_featured ON skills_academy_series(is_featured);

-- Workout indexes
CREATE INDEX IF NOT EXISTS idx_sa_workouts_series ON skills_academy_workouts(series_id);
CREATE INDEX IF NOT EXISTS idx_sa_workouts_size ON skills_academy_workouts(workout_size);
CREATE INDEX IF NOT EXISTS idx_sa_workouts_number ON skills_academy_workouts(workout_number);

-- Drill library indexes
CREATE INDEX IF NOT EXISTS idx_sa_drills_category ON skills_academy_drill_library(drill_category);
CREATE INDEX IF NOT EXISTS idx_sa_drills_name ON skills_academy_drill_library(drill_name);

-- Workout drills indexes
CREATE INDEX IF NOT EXISTS idx_sa_workout_drills_workout ON skills_academy_workout_drills(workout_id);
CREATE INDEX IF NOT EXISTS idx_sa_workout_drills_drill ON skills_academy_workout_drills(drill_id);
CREATE INDEX IF NOT EXISTS idx_sa_workout_drills_order ON skills_academy_workout_drills(workout_id, sequence_order);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_sa_progress_user ON skills_academy_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_sa_progress_workout ON skills_academy_user_progress(workout_id);
CREATE INDEX IF NOT EXISTS idx_sa_progress_status ON skills_academy_user_progress(status);

-- ============================================
-- STEP 3: INSERT WORKOUT SERIES DATA
-- ============================================

INSERT INTO skills_academy_series (
    series_name,
    series_slug,
    series_type,
    description,
    position_focus,
    difficulty_level,
    color_scheme,
    display_order,
    is_active
) VALUES 
-- Solid Start Series
('Solid Start 1', 'solid-start-1', 'solid_start', 'Foundation skills for beginners', 'all', 1, 'blue', 1, true),
('Solid Start 2', 'solid-start-2', 'solid_start', 'Defense and shooting fundamentals', 'all', 1, 'blue', 2, true),
('Solid Start 3', 'solid-start-3', 'solid_start', 'Catching and hesitation techniques', 'all', 2, 'blue', 3, true),
('Solid Start 4', 'solid-start-4', 'solid_start', 'Wind up dodging skills', 'all', 2, 'blue', 4, true),
('Solid Start 5', 'solid-start-5', 'solid_start', 'Switching hands mastery', 'all', 2, 'blue', 5, true),

-- Attack Track Series
('Attack Track A1', 'attack-track-a1', 'attack', 'Elite attack fundamentals', 'attack', 2, 'red', 10, true),
('Attack Track A2', 'attack-track-a2', 'attack', 'Advanced shooting techniques', 'attack', 2, 'red', 11, true),
('Attack Track A3', 'attack-track-a3', 'attack', 'Dodging from X', 'attack', 3, 'red', 12, true),
('Attack Track A4', 'attack-track-a4', 'attack', 'Inside finishing', 'attack', 3, 'red', 13, true),
('Attack Track A5', 'attack-track-a5', 'attack', 'Time and room shooting', 'attack', 3, 'red', 14, true),
('Attack Track A6', 'attack-track-a6', 'attack', 'Feeding and cutting', 'attack', 3, 'red', 15, true),
('Attack Track A7', 'attack-track-a7', 'attack', 'Advanced dodging combos', 'attack', 4, 'red', 16, true),
('Attack Track A8', 'attack-track-a8', 'attack', 'Crease play mastery', 'attack', 4, 'red', 17, true),
('Attack Track A9', 'attack-track-a9', 'attack', 'Two-man game', 'attack', 4, 'red', 18, true),
('Attack Track A10', 'attack-track-a10', 'attack', 'Invert offense', 'attack', 4, 'red', 19, true),
('Attack Track A11', 'attack-track-a11', 'attack', 'Shot selection', 'attack', 5, 'red', 20, true),
('Attack Track A12', 'attack-track-a12', 'attack', 'Elite attack complete', 'attack', 5, 'red', 21, true),

-- Midfield Track Series
('Midfield Track M1', 'midfield-track-m1', 'midfield', 'Midfield fundamentals', 'midfield', 2, 'green', 30, true),
('Midfield Track M2', 'midfield-track-m2', 'midfield', 'Transition offense', 'midfield', 2, 'green', 31, true),
('Midfield Track M3', 'midfield-track-m3', 'midfield', 'Transition defense', 'midfield', 3, 'green', 32, true),
('Midfield Track M4', 'midfield-track-m4', 'midfield', 'Ground balls', 'midfield', 3, 'green', 33, true),
('Midfield Track M5', 'midfield-track-m5', 'midfield', 'Two-way midfield', 'midfield', 3, 'green', 34, true),
('Midfield Track M6', 'midfield-track-m6', 'midfield', 'Alley dodging', 'midfield', 3, 'green', 35, true),
('Midfield Track M7', 'midfield-track-m7', 'midfield', 'Shooting on the run', 'midfield', 4, 'green', 36, true),
('Midfield Track M8', 'midfield-track-m8', 'midfield', 'Face-off skills', 'midfield', 4, 'green', 37, true),
('Midfield Track M9', 'midfield-track-m9', 'midfield', 'Clearing patterns', 'midfield', 4, 'green', 38, true),
('Midfield Track M10', 'midfield-track-m10', 'midfield', 'Riding techniques', 'midfield', 4, 'green', 39, true),
('Midfield Track M11', 'midfield-track-m11', 'midfield', 'LSM skills', 'midfield', 5, 'green', 40, true),
('Midfield Track M12', 'midfield-track-m12', 'midfield', 'Elite midfield complete', 'midfield', 5, 'green', 41, true),

-- Defense Track Series
('Defense Track D1', 'defense-track-d1', 'defense', 'Defensive fundamentals', 'defense', 2, 'orange', 50, true),
('Defense Track D2', 'defense-track-d2', 'defense', 'Footwork and positioning', 'defense', 2, 'orange', 51, true),
('Defense Track D3', 'defense-track-d3', 'defense', 'Checking techniques', 'defense', 3, 'orange', 52, true),
('Defense Track D4', 'defense-track-d4', 'defense', 'Ground ball defense', 'defense', 3, 'orange', 53, true),
('Defense Track D5', 'defense-track-d5', 'defense', 'Slide packages', 'defense', 3, 'orange', 54, true),
('Defense Track D6', 'defense-track-d6', 'defense', 'Communication systems', 'defense', 3, 'orange', 55, true),
('Defense Track D7', 'defense-track-d7', 'defense', 'Clearing from defense', 'defense', 4, 'orange', 56, true),
('Defense Track D8', 'defense-track-d8', 'defense', 'Man-down defense', 'defense', 4, 'orange', 57, true),
('Defense Track D9', 'defense-track-d9', 'defense', 'Zone defense', 'defense', 4, 'orange', 58, true),
('Defense Track D10', 'defense-track-d10', 'defense', 'Crease defense', 'defense', 4, 'orange', 59, true),
('Defense Track D11', 'defense-track-d11', 'defense', 'Takeaway techniques', 'defense', 5, 'orange', 60, true),
('Defense Track D12', 'defense-track-d12', 'defense', 'Elite defense complete', 'defense', 5, 'orange', 61, true)
ON CONFLICT (series_name) DO NOTHING;

-- ============================================
-- STEP 4: INSERT SAMPLE WORKOUTS FOR EACH SERIES
-- ============================================

-- Use a DO block to create workouts for each series
DO $$
DECLARE
    v_series RECORD;
    v_series_id INTEGER;
BEGIN
    -- Loop through each series and create Mini, More, and Complete workouts
    FOR v_series IN SELECT id, series_name FROM skills_academy_series
    LOOP
        -- Extract the workout number from series name if applicable
        -- For Solid Start, Attack, Midfield, Defense tracks
        
        -- Mini workout (5 drills)
        INSERT INTO skills_academy_workouts (
            series_id, 
            workout_name, 
            workout_number,
            workout_size, 
            drill_count,
            description,
            estimated_duration_minutes
        ) VALUES (
            v_series.id,
            v_series.series_name || ' - Mini Workout',
            1,
            'mini',
            5,
            'Quick 5-drill workout for skill building',
            15
        ) ON CONFLICT (series_id, workout_number, workout_size) DO NOTHING;
        
        -- More workout (10 drills)
        INSERT INTO skills_academy_workouts (
            series_id, 
            workout_name,
            workout_number, 
            workout_size, 
            drill_count,
            description,
            estimated_duration_minutes
        ) VALUES (
            v_series.id,
            v_series.series_name || ' - More Workout',
            1,
            'more',
            10,
            'Standard 10-drill workout for comprehensive training',
            30
        ) ON CONFLICT (series_id, workout_number, workout_size) DO NOTHING;
        
        -- Complete workout (15 drills average)
        INSERT INTO skills_academy_workouts (
            series_id, 
            workout_name,
            workout_number, 
            workout_size, 
            drill_count,
            description,
            estimated_duration_minutes
        ) VALUES (
            v_series.id,
            v_series.series_name || ' - Complete Workout',
            1,
            'complete',
            15,
            'Full workout with all essential drills',
            45
        ) ON CONFLICT (series_id, workout_number, workout_size) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- STEP 5: INSERT SAMPLE DRILLS INTO LIBRARY
-- ============================================

-- Sample drills from the CSV data
INSERT INTO skills_academy_drill_library (
    drill_name,
    drill_slug,
    strong_hand_video_url,
    off_hand_video_url,
    both_hands_video_url,
    description,
    drill_category,
    difficulty_level,
    default_duration_seconds,
    default_reps
) VALUES
('3 Steps Up and Back', '3-steps-up-and-back', 'https://player.vimeo.com/video/997146099', 'https://player.vimeo.com/video/997153712', NULL, 'Footwork drill focusing on forward and backward movement', 'footwork', 1, 60, 10),
('80% Overhand Shooting', '80-overhand-shooting', NULL, NULL, 'https://player.vimeo.com/video/997146323', 'Practice overhand shots at 80% power', 'shooting', 2, 90, 20),
('80% Side Arm Shooting', '80-side-arm-shooting', 'https://player.vimeo.com/video/997146248', 'https://player.vimeo.com/video/997146177', NULL, 'Side arm shooting technique at 80% power', 'shooting', 2, 90, 20),
('Ankle Biters', 'ankle-biters', 'https://player.vimeo.com/video/997146551', 'https://player.vimeo.com/video/997145951', NULL, 'Low cradle protection drill', 'stick_skills', 2, 60, 15),
('Around The World', 'around-the-world', 'https://player.vimeo.com/video/997146713', 'https://player.vimeo.com/video/997146631', NULL, 'Complete stick rotation drill', 'stick_skills', 3, 60, 10),
('Behind The Back', 'behind-the-back', 'https://player.vimeo.com/video/997146917', 'https://player.vimeo.com/video/997146803', NULL, 'Advanced behind the back passing', 'passing', 4, 60, 10),
('Bottom Hand Only', 'bottom-hand-only', 'https://player.vimeo.com/video/997147289', 'https://player.vimeo.com/video/997147132', NULL, 'Single hand stick control', 'stick_skills', 3, 60, 15),
('Canadian Cross Hand', 'canadian-cross-hand', 'https://player.vimeo.com/video/997147539', 'https://player.vimeo.com/video/997147443', NULL, 'Cross-handed stick work', 'stick_skills', 3, 60, 15),
('Catch and Hitch', 'catch-and-hitch', NULL, NULL, 'https://player.vimeo.com/video/997147689', 'Catch with hesitation move', 'catching', 2, 60, 20),
('Catch and Switch', 'catch-and-switch', NULL, NULL, 'https://player.vimeo.com/video/997147863', 'Quick hand switching after catch', 'stick_skills', 2, 60, 20),
('Face Dodge Shovel Pass', 'face-dodge-shovel-pass', 'https://player.vimeo.com/video/997148282', 'https://player.vimeo.com/video/997148200', NULL, 'Face dodge into shovel pass', 'dodging', 3, 90, 15),
('Far Side Fake', 'far-side-fake', 'https://player.vimeo.com/video/997148620', 'https://player.vimeo.com/video/997148528', NULL, 'Deceptive far side fake', 'shooting', 3, 60, 15),
('Quick Sticks', 'quick-sticks', NULL, NULL, 'https://player.vimeo.com/video/997148900', 'Rapid catch and release', 'fundamentals', 1, 60, 30),
('Overhand', 'overhand', NULL, NULL, 'https://player.vimeo.com/video/997149100', 'Basic overhand throwing', 'fundamentals', 1, 60, 30)
ON CONFLICT (drill_name) DO NOTHING;

-- ============================================
-- STEP 6: CREATE SAMPLE DRILL SEQUENCES
-- ============================================

-- This would be populated from the JSON data
-- For now, creating sample sequences for Solid Start 1 - Mini
DO $$
DECLARE
    v_workout_id INTEGER;
    v_drill_id INTEGER;
    v_sequence INTEGER := 1;
BEGIN
    -- Get Solid Start 1 - Mini workout
    SELECT id INTO v_workout_id 
    FROM skills_academy_workouts 
    WHERE workout_name = 'Solid Start 1 - Mini Workout'
    LIMIT 1;
    
    IF v_workout_id IS NOT NULL THEN
        -- Add 5 drills to the mini workout
        FOR v_drill_id IN (
            SELECT id FROM skills_academy_drill_library 
            WHERE drill_category = 'fundamentals' OR drill_category = 'stick_skills'
            ORDER BY difficulty_level, id
            LIMIT 5
        )
        LOOP
            INSERT INTO skills_academy_workout_drills (
                workout_id,
                drill_id,
                sequence_order,
                drill_duration_seconds,
                repetitions,
                video_type
            ) VALUES (
                v_workout_id,
                v_drill_id,
                v_sequence,
                60,
                10,
                'both_hands'
            ) ON CONFLICT (workout_id, sequence_order) DO NOTHING;
            
            v_sequence := v_sequence + 1;
        END LOOP;
    END IF;
END $$;

-- ============================================
-- STEP 7: UPDATE SERIES STATISTICS
-- ============================================

UPDATE skills_academy_series s
SET 
    total_workouts = (
        SELECT COUNT(*) 
        FROM skills_academy_workouts w 
        WHERE w.series_id = s.id
    ),
    total_drills = (
        SELECT COUNT(DISTINCT drill_id)
        FROM skills_academy_workout_drills wd
        JOIN skills_academy_workouts w ON wd.workout_id = w.id
        WHERE w.series_id = s.id
    );

-- ============================================
-- STEP 8: VERIFICATION QUERIES
-- ============================================

-- Show summary counts
SELECT 
    'Workout Series' as item,
    COUNT(*) as count
FROM skills_academy_series
UNION ALL
SELECT 
    'Total Workouts' as item,
    COUNT(*) as count
FROM skills_academy_workouts
UNION ALL
SELECT 
    'Drill Library' as item,
    COUNT(*) as count
FROM skills_academy_drill_library
UNION ALL
SELECT 
    'Workout-Drill Links' as item,
    COUNT(*) as count
FROM skills_academy_workout_drills;

-- Show series breakdown
SELECT 
    series_type,
    COUNT(*) as series_count,
    SUM(total_workouts) as total_workouts
FROM skills_academy_series
GROUP BY series_type
ORDER BY series_type;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '✅ SKILLS ACADEMY SYSTEM CREATED!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Created Tables:';
    RAISE NOTICE '   • skills_academy_series';
    RAISE NOTICE '   • skills_academy_workouts';
    RAISE NOTICE '   • skills_academy_drill_library';
    RAISE NOTICE '   • skills_academy_workout_drills';
    RAISE NOTICE '   • skills_academy_user_progress';
    RAISE NOTICE '';
    RAISE NOTICE '📹 Populated Data:';
    RAISE NOTICE '   • 41 workout series total';
    RAISE NOTICE '   • 5 Solid Start series';
    RAISE NOTICE '   • 12 Attack Track series';
    RAISE NOTICE '   • 12 Midfield Track series';
    RAISE NOTICE '   • 12 Defense Track series';
    RAISE NOTICE '   • 3 workouts per series (Mini, More, Complete)';
    RAISE NOTICE '   • Sample drills in library';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Each series includes:';
    RAISE NOTICE '   • Mini: 5 drills (~15 min)';
    RAISE NOTICE '   • More: 10 drills (~30 min)';
    RAISE NOTICE '   • Complete: 13-19 drills (~45 min)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Ready for drill sequence player!';
    RAISE NOTICE '=========================================';
END $$;