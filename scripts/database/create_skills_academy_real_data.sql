-- ============================================
-- SKILLS ACADEMY SYSTEM WITH REAL DATA
-- ============================================
-- Creates Skills Academy tables and populates with actual workout data
-- Links to existing powlax_drills table for drill videos
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (required - old schema incompatible)
-- ============================================
-- The existing tables have a different schema, so we need to drop and recreate
DROP TABLE IF EXISTS skills_academy_user_progress CASCADE;
DROP TABLE IF EXISTS skills_academy_workout_drills CASCADE;
DROP TABLE IF EXISTS skills_academy_workouts CASCADE;
DROP TABLE IF EXISTS skills_academy_series CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES (if they don't exist)
-- ============================================

-- 2.1: Skills Academy Series (Main workout categories)
CREATE TABLE IF NOT EXISTS skills_academy_series (
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

-- 2.2: Skills Academy Workouts (Individual workouts within series)
CREATE TABLE IF NOT EXISTS skills_academy_workouts (
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

-- 2.3: Skills Academy Workout Drills (Links workouts to powlax_drills)
CREATE TABLE IF NOT EXISTS skills_academy_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id) ON DELETE CASCADE,
    drill_id UUID REFERENCES powlax_drills(id) ON DELETE CASCADE,
    
    -- Sequence and timing
    sequence_order INTEGER NOT NULL,
    drill_duration_seconds INTEGER DEFAULT 60,
    rest_duration_seconds INTEGER DEFAULT 10,
    
    -- Drill-specific settings
    repetitions INTEGER DEFAULT 10,
    
    -- Unique constraint
    UNIQUE(workout_id, sequence_order)
);

-- 2.4: User Progress Tracking
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
    
    -- Unique constraint - one active session per user per workout
    UNIQUE(user_id, workout_id, started_at)
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sa_series_type ON skills_academy_series(series_type);
CREATE INDEX IF NOT EXISTS idx_sa_series_code ON skills_academy_series(series_code);
CREATE INDEX IF NOT EXISTS idx_sa_workouts_series ON skills_academy_workouts(series_id);
CREATE INDEX IF NOT EXISTS idx_sa_workouts_size ON skills_academy_workouts(workout_size);
CREATE INDEX IF NOT EXISTS idx_sa_workout_drills_workout ON skills_academy_workout_drills(workout_id);
CREATE INDEX IF NOT EXISTS idx_sa_workout_drills_drill ON skills_academy_workout_drills(drill_id);
CREATE INDEX IF NOT EXISTS idx_sa_progress_user ON skills_academy_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_sa_progress_status ON skills_academy_user_progress(status);

-- ============================================
-- STEP 4: CLEAR EXISTING DATA (for clean insert)
-- ============================================
TRUNCATE skills_academy_series CASCADE;

-- ============================================
-- STEP 5: INSERT ACTUAL WORKOUT SERIES
-- ============================================

-- Solid Start Series (5 workouts)
INSERT INTO skills_academy_series (series_name, series_slug, series_type, series_code, description, position_focus, difficulty_level, color_scheme, display_order) VALUES
('Solid Start 1 - Picking Up and Passing', 'solid-start-1', 'solid_start', 'SS1', 'Foundation skills for picking up ground balls and passing', 'all', 1, 'blue', 1),
('Solid Start 2 - Defense and Shooting', 'solid-start-2', 'solid_start', 'SS2', 'Basic defensive positioning and shooting techniques', 'all', 1, 'blue', 2),
('Solid Start 3 - Catching and Hesitation', 'solid-start-3', 'solid_start', 'SS3', 'Catching skills with hesitation moves', 'all', 1, 'blue', 3),
('Solid Start 4 - Wind Up Dodging', 'solid-start-4', 'solid_start', 'SS4', 'Introduction to wind up dodging techniques', 'all', 2, 'blue', 4),
('Solid Start 5 - Switching Hands', 'solid-start-5', 'solid_start', 'SS5', 'Mastering hand switches and ambidextrous play', 'all', 2, 'blue', 5);

-- Attack Track Series (A1-A12)
INSERT INTO skills_academy_series (series_name, series_slug, series_type, series_code, description, position_focus, difficulty_level, color_scheme, display_order) VALUES
('Attack A1 - Establishment of Technique', 'attack-a1', 'attack', 'A1', 'Foundation attack techniques and mechanics', 'attack', 2, 'red', 10),
('Attack A2 - Split Dodge and Shooting on the Run', 'attack-a2', 'attack', 'A2', 'Split dodge mechanics with shooting on the run', 'attack', 2, 'red', 11),
('Attack A3 - Finishing From X', 'attack-a3', 'attack', 'A3', 'Finishing techniques from behind the goal', 'attack', 3, 'red', 12),
('Attack A4 - Catching, Faking, Crease Play', 'attack-a4', 'attack', 'A4', 'Advanced catching, faking, and crease positioning', 'attack', 3, 'red', 13),
('Attack A5 - Running A Fast Break', 'attack-a5', 'attack', 'A5', 'Fast break execution and finishing', 'attack', 3, 'red', 14),
('Attack A6 - Time and Room Shooting & Wind Up Dodging', 'attack-a6', 'attack', 'A6', 'Creating time and room with wind up dodges', 'attack', 3, 'red', 15),
('Attack A7 - Wing Hesitation Dodges', 'attack-a7', 'attack', 'A7', 'Hesitation moves from wing positions', 'attack', 3, 'red', 16),
('Attack A8 - Shooting on the Run & Slide Em Dodging', 'attack-a8', 'attack', 'A8', 'Advanced shooting and slide dodging', 'attack', 4, 'red', 17),
('Attack A9 - Inside Finishing & Roll Dodge', 'attack-a9', 'attack', 'A9', 'Inside finishing with roll dodge techniques', 'attack', 4, 'red', 18),
('Attack A10 - Ladder Drills and North South Dodging', 'attack-a10', 'attack', 'A10', 'Footwork with north-south dodging patterns', 'attack', 4, 'red', 19),
('Attack A11 - Time and Room Out of a Dodge', 'attack-a11', 'attack', 'A11', 'Creating shooting space from dodges', 'attack', 4, 'red', 20),
('Attack A12 - Ride Angles and Dodging Favorites', 'attack-a12', 'attack', 'A12', 'Riding techniques and signature dodges', 'attack', 5, 'red', 21);

-- Midfield Track Series (M1-M12)
INSERT INTO skills_academy_series (series_name, series_slug, series_type, series_code, description, position_focus, difficulty_level, color_scheme, display_order) VALUES
('Midfield M1 - Foundation of Skills', 'midfield-m1', 'midfield', 'M1', 'Core midfield fundamentals', 'midfield', 2, 'green', 30),
('Midfield M2 - Shooting Progression', 'midfield-m2', 'midfield', 'M2', 'Complete shooting progression for midfielders', 'midfield', 2, 'green', 31),
('Midfield M3 - Catching, Faking, Inside Finishing', 'midfield-m3', 'midfield', 'M3', 'Midfield catching and finishing skills', 'midfield', 2, 'green', 32),
('Midfield M4 - Defensive Footwork', 'midfield-m4', 'midfield', 'M4', 'Defensive approach angles and recovery', 'midfield', 3, 'green', 33),
('Midfield M5 - Wing Dodging', 'midfield-m5', 'midfield', 'M5', 'Wing dodging techniques for midfielders', 'midfield', 3, 'green', 34),
('Midfield M6 - Time and Room & Wind Up Dodging', 'midfield-m6', 'midfield', 'M6', 'Creating shooting space with dodges', 'midfield', 3, 'green', 35),
('Midfield M7 - Split Dodge and Shoot on the Run', 'midfield-m7', 'midfield', 'M7', 'Mastering split dodges and running shots', 'midfield', 3, 'green', 36),
('Midfield M8 - Ladder Footwork & Creative Dodging', 'midfield-m8', 'midfield', 'M8', 'Advanced footwork and creative moves', 'midfield', 4, 'green', 37),
('Midfield M9 - Inside Finishing & Hesitations', 'midfield-m9', 'midfield', 'M9', 'Inside finishing with hesitation moves', 'midfield', 4, 'green', 38),
('Midfield M10 - Face Dodge Mastery', 'midfield-m10', 'midfield', 'M10', 'Mastering the face dodge technique', 'midfield', 4, 'green', 39),
('Midfield M11 - Shooting on the Run & Slide Em', 'midfield-m11', 'midfield', 'M11', 'Advanced running shots and slide dodges', 'midfield', 4, 'green', 40),
('Midfield M12 - Defensive Approaches & Fast Break', 'midfield-m12', 'midfield', 'M12', 'Two-way midfield skills', 'midfield', 5, 'green', 41);

-- Defense Track Series (D1-D12)
INSERT INTO skills_academy_series (series_name, series_slug, series_type, series_code, description, position_focus, difficulty_level, color_scheme, display_order) VALUES
('Defense D1 - Pipe Approaches & Defending at X', 'defense-d1', 'defense', 'D1', 'Pipe defense and X coverage fundamentals', 'defense', 2, 'orange', 50),
('Defense D2 - 4 Cone Footwork & Fast Break Defense', 'defense-d2', 'defense', 'D2', 'Footwork drills and transition defense', 'defense', 2, 'orange', 51),
('Defense D3 - Approach and Recover Low Positions', 'defense-d3', 'defense', 'D3', 'Low position defense and recovery', 'defense', 3, 'orange', 52),
('Defense D4 - Ladder Drills & Defending at X', 'defense-d4', 'defense', 'D4', 'Ladder footwork with X defense', 'defense', 3, 'orange', 53),
('Defense D5 - Pipe Approaches & Stick Checks', 'defense-d5', 'defense', 'D5', 'Advanced pipe defense with checking', 'defense', 3, 'orange', 54),
('Defense D6 - 4 Cone Series 2 & Sliding', 'defense-d6', 'defense', 'D6', 'Advanced cone drills with slide packages', 'defense', 3, 'orange', 55),
('Defense D7 - Approach and Recover Sides', 'defense-d7', 'defense', 'D7', 'Side approach and recovery techniques', 'defense', 3, 'orange', 56),
('Defense D8 - Ladder Set 2 & Fast Break Defense', 'defense-d8', 'defense', 'D8', 'Advanced ladder work with transition D', 'defense', 4, 'orange', 57),
('Defense D9 - Pipe Approaches Group 3', 'defense-d9', 'defense', 'D9', 'Advanced pipe defensive techniques', 'defense', 4, 'orange', 58),
('Defense D10 - 4 Cone Series 3 & Defending at X', 'defense-d10', 'defense', 'D10', 'Elite cone drills with X defense', 'defense', 4, 'orange', 59),
('Defense D11 - Approach and Recover Top', 'defense-d11', 'defense', 'D11', 'Top side approach and recovery', 'defense', 4, 'orange', 60),
('Defense D12 - Ladder Set 3 & Checking', 'defense-d12', 'defense', 'D12', 'Elite ladder work with checking techniques', 'defense', 5, 'orange', 61);

-- ============================================
-- STEP 6: INSERT WORKOUTS FOR EACH SERIES
-- ============================================

-- Function to insert workouts for a series
CREATE OR REPLACE FUNCTION insert_series_workouts(
    p_series_code VARCHAR,
    p_mini_name VARCHAR,
    p_mini_drills INTEGER,
    p_more_name VARCHAR,
    p_more_drills INTEGER,
    p_complete_name VARCHAR DEFAULT NULL,
    p_complete_drills INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_series_id INTEGER;
BEGIN
    -- Get series ID
    SELECT id INTO v_series_id 
    FROM skills_academy_series 
    WHERE series_code = p_series_code;
    
    IF v_series_id IS NOT NULL THEN
        -- Insert Mini workout
        INSERT INTO skills_academy_workouts (
            series_id, workout_name, workout_size, drill_count, 
            estimated_duration_minutes, original_json_name
        ) VALUES (
            v_series_id, 
            p_series_code || ' - Mini Workout',
            'mini',
            p_mini_drills,
            p_mini_drills * 3, -- Estimate 3 minutes per drill
            p_mini_name
        ) ON CONFLICT (series_id, workout_size) DO NOTHING;
        
        -- Insert More workout
        INSERT INTO skills_academy_workouts (
            series_id, workout_name, workout_size, drill_count,
            estimated_duration_minutes, original_json_name
        ) VALUES (
            v_series_id,
            p_series_code || ' - More Workout',
            'more',
            p_more_drills,
            p_more_drills * 3,
            p_more_name
        ) ON CONFLICT (series_id, workout_size) DO NOTHING;
        
        -- Insert Complete workout if provided
        IF p_complete_name IS NOT NULL THEN
            INSERT INTO skills_academy_workouts (
                series_id, workout_name, workout_size, drill_count,
                estimated_duration_minutes, original_json_name
            ) VALUES (
                v_series_id,
                p_series_code || ' - Complete Workout',
                'complete',
                p_complete_drills,
                p_complete_drills * 3,
                p_complete_name
            ) ON CONFLICT (series_id, workout_size) DO NOTHING;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert Solid Start workouts (only Mini and More based on JSON data)
SELECT insert_series_workouts('SS1', 'Solid Start - Picking Up and Passing - Mini - 05 Drills', 5, 'Solid Start Workout 1 - Picking Up and Passing - More', 10);
SELECT insert_series_workouts('SS2', 'Solid Start 2 - Defense and Shooting Workout - Mini', 5, 'Solid Start 2 - Defense and Shooting Workout - More', 10);
SELECT insert_series_workouts('SS3', 'Solid Start 3 - Catching and Hesitation Workout - Mini', 5, 'Solid Start 3 - Catching and Hesitation Workout - More', 10);
SELECT insert_series_workouts('SS4', 'Solid Start 4 - Wind Up Dodging Workout - Mini', 5, 'Solid Start 4 - Wind Up Dodging Workout - More', 10);
SELECT insert_series_workouts('SS5', 'Solid Start 5 - Switching Hands Workout - Mini', 5, 'Solid Start 5 - Switching Hands Workout - More', 10);

-- Insert Attack Track workouts (5, 10, and complete drills)
SELECT insert_series_workouts('A1', 'Attack - Establishment of Technique - A1 - 5 Drills', 5, 'Establishment of Technique - A1 - 10 Drills', 10, 'Establishment of Technique - A1 - 14 Drills', 14);
SELECT insert_series_workouts('A2', 'Split Dodge and Shooting on the Run - A2 - 5 Drills', 5, 'Split Dodge and Shooting on the Run - A2 - 10 Drills', 10, 'Split Dodge and Shooting on the Run - A2 - 14 Drills', 14);
SELECT insert_series_workouts('A3', 'Attack - Finishing From X - Up the Hash - A3 - 05 Drills', 5, 'Finishing From X - Up the Hash - A3 - 10 Drills', 10, 'Finishing From X - Up the Hash - A3 - 15 Drills', 15);
SELECT insert_series_workouts('A4', 'Catching - Faking - Crease Play - A4 - 5 Drills', 5, 'Catching - Faking - Crease Play - A4 - 10 Drills', 10, 'Catching - Faking - Crease Play - A4 - 17 Drills', 17);
SELECT insert_series_workouts('A5', 'Running A Fast Break - A5 - 05 Drills', 5, 'Running A Fast Break - A5 - 10 Drills', 10, 'Running A Fast Break - Inside Finishing - A5 - 16 Drills', 16);
SELECT insert_series_workouts('A6', 'Time and Room Shooting & Wind Up Dodging - A6 - 5 Drills', 5, 'Time and Room Shooting & Wind Up Dodging - A6 - 10 Drills', 10, 'Time and Room Shooting & Wind Up Dodging - A6 - 16 Drills', 16);
SELECT insert_series_workouts('A7', 'Wing Hesitation Dodges - A7 - 5 Drills', 5, 'Wing and Hash Hesitation Dodges - A7 - 10 Drills', 10, 'Wing and X Hesitation Dodges 4 Cone Footwork - A7 - 15 Drills', 15);
SELECT insert_series_workouts('A8', 'Shooting on the Run & Slide Em Dodging - A8 - 5 Drills', 5, 'Shooting on the Run & Slide Em Dodging - A8 - 10 Drills', 10, 'Shooting on the Run & Slide Em Dodging - A8 - 14 Drills', 14);
SELECT insert_series_workouts('A9', 'Roll Dodge - A9 - 5 Drills', 5, 'Inside Finishing - Rocker & Roll Dodge - A9 - 10 Drills', 10, 'Inside Finishing - Hesitation, Rocker, Roll Dodge - A9 - 16 Drills', 16);
SELECT insert_series_workouts('A10', 'Ladder Drills and North South Dodging - A10 - 5 Drills', 5, 'Ladder Drills and North South Dodging - A10 - 10 Drills', 10, 'Ladder Drills and North South Dodging - A10 - 16 Drills', 16);
SELECT insert_series_workouts('A11', 'Time and Room Shooting Out of a Dodge and Release Points - A11 - 5 Drills', 5, 'Time and Room Shooting Out of a Dodge and Release Points - A11 - 10 Drills', 10, 'Time and Room Shooting Out of a Dodge and Release Points - A11 - 15 Drills', 15);
SELECT insert_series_workouts('A12', 'Ride Angles and Dodging Favorites - A12 - 5 Drills', 5, 'Ride Angles and Dodging Favorites - A12 - 10 Drills', 10, 'Ride Angles and Dodging Favorites - A12 - 16 Drills', 16);

-- Insert Midfield Track workouts
SELECT insert_series_workouts('M1', 'Midfield Foundation of Skills - M1 - 05 Drills', 5, 'Midfield Foundation of Skills - M1 - 10 Drills', 10, 'Midfield Foundation of Skills - M1 - 15 Drills', 15);
SELECT insert_series_workouts('M2', 'Time and Room Shooting Progression - M2 - 05 Drills', 5, 'Complete Shooting Progression - M2 - 10 Drills', 10, 'Complete Shooting Progression - M2 - 15 Drills', 15);
SELECT insert_series_workouts('M3', 'Catching, Faking, and Inside Finishing - M3 - 05 Drills', 5, 'Catching, Faking, and Inside Finishing - M3 - 10 Drills', 10, 'Catching, Faking, and Inside Finishing - M3 - 17 Drills', 17);
SELECT insert_series_workouts('M4', 'Defensive Footwork - Approach Angles And Recovering in - M4 - 05 Drills', 5, 'Defensive Footwork - Approach Angles And Recovering in - M4 - 10 Drills', 10, 'Defensive Footwork - Approach Angles And Recovering in - M4 - 15 Drills', 15);
SELECT insert_series_workouts('M5', 'Wing Dodging - M5 - 05 Drills', 5, 'Wing Dodging - M5 - 10 Drills', 10, 'Wing Dodging - M5 - 15 Drills', 15);
SELECT insert_series_workouts('M6', 'Time and Room Shooting and Wind Up Dodging - M6 - 05 Drills', 5, 'Time and Room Shooting and Wind Up Dodging - M6 - 10 Drills', 10, 'Time and Room Shooting and Wind Up Dodging - M6 - 14 Drills', 14);
SELECT insert_series_workouts('M7', 'Midfield - Master Split Dodge and Shoot on the Run - M7 - 05 Drills', 5, 'Master Split Dodge and Shoot on the Run - M7 - 10 Drills', 10, 'Master Split Dodge and Shoot on the Run - M7 - 17 Drills', 17);
SELECT insert_series_workouts('M8', 'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 05 Drills', 5, 'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 10 Drills', 10, 'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 15 Drills', 15);
SELECT insert_series_workouts('M9', 'Inside Finishing, Hesitations and Roll Dodges - M9 - 05 Drills', 5, 'Inside Finishing, Hesitations and Roll Dodges - M9 - 10 Drills', 10, 'Inside Finishing, Hesitations and Roll Dodges - M9 - 16 Drills', 16);
SELECT insert_series_workouts('M10', 'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 05 Drills', 5, 'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 10 Drills', 10, 'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 15 Drills', 15);
SELECT insert_series_workouts('M11', 'Shooting on the Run and Slide Em Dodging - M11 - 05 Drills', 5, 'Shooting on the Run and Slide Em Dodging - M11 - 10 Drills', 10, 'Shooting on the Run and Slide Em Dodging - M11 - 15 Drills', 15);
SELECT insert_series_workouts('M12', 'Fast Break Defense and Rotations - M12 - 05 Drills', 5, 'Defensive Approaches, Recoveries, Fast Break Defense - M12 - 10 Drills', 10, 'Defensive Approaches, Recoveries, Fast Break Defense - M12 - 16 Drills', 16);

-- Insert Defense Track workouts
SELECT insert_series_workouts('D1', 'Defense - Pipe Approaches, Defending at X, Long Passes - D1 - 05 Drills', 5, 'Pipe Approaches, Defending at X, Long Passes - D1 - 10 Drills', 10, 'Pipe Approaches, Defending at X, Long Passes - D1 - 16 Drills', 16);
SELECT insert_series_workouts('D2', '4 Cone Footwork, Fast Break Defense and Rotations and Hitches - D2 - 05 Drills', 5, '4 Cone Footwork, Fast Break Defense and Rotations, Time and Room Shooting and Hitches - D2 - 10 Drills', 10, '4 Cone Footwork, Fast Break Defense and Rotations, Time and Room Shooting and Hitches - D2 - 16 Drills', 16);
SELECT insert_series_workouts('D3', 'Approach and Recover to Low Positions, Sliding and Recovering, Split Dodge - D3 - 05 Drills', 5, 'Approach and Recover to Low Positions, Sliding and Recovering, Long Passes, Split Dodge - D3 - 10 Drills', 10, 'Approach and Recover to Low Positions, Sliding and Recovering, Long Passes, Split Dodge - D3 - 16 Drills', 16);
SELECT insert_series_workouts('D4', 'Ladder Drill Set 1, Defending at X, Faking - D4 - 05 Drills', 5, 'Ladder Drill Set 1, Defending at X, Faking - D4 - 10 Drills', 10, 'Ladder Drill Set 1, Defending at X, Faking - D4 - 14 Drills', 14);
SELECT insert_series_workouts('D5', 'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 05 Drills', 5, 'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 10 Drills', 10, 'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 16 Drills', 16);
SELECT insert_series_workouts('D6', '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls - D6 - 05 Drills', 5, '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls, Shooting on the Run - D6 - 10 Drills', 10, '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls, Shooting on the Run - D6 - 15 Drills', 15);
SELECT insert_series_workouts('D7', 'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 05 Drills', 5, 'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 10 Drills', 10, 'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 16 Drills', 16);
SELECT insert_series_workouts('D8', 'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 05 Drills', 5, 'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 10 Drills', 10, 'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 15 Drills', 15);
SELECT insert_series_workouts('D9', 'Pipe Approaches Group 3, Sliding and Recovering, GB''s Long Passes, Split Dodge - D9 - 05 Drills', 5, 'Pipe Approaches Group 3, Sliding and Recovering, GB''s Long Passes, Split Dodge - D9 - 10 Drills', 10, 'Pipe Approaches Group 3, Sliding and Recovering, GB''s  Long Passes, Split Dodge - D9 - 15 Drills', 15);
SELECT insert_series_workouts('D10', '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 05 Drills', 5, '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 10 Drills', 10, '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 16 Drills', 16);
SELECT insert_series_workouts('D11', 'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 05 Drills', 5, 'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 10 Drills', 10, 'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 15 Drills', 15);
SELECT insert_series_workouts('D12', 'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 05 Drills', 5, 'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 10 Drills', 10, 'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 17 Drills', 17);

-- Clean up function
DROP FUNCTION IF EXISTS insert_series_workouts;

-- ============================================
-- STEP 7: LINK WORKOUTS TO DRILLS
-- ============================================
-- This would be populated from the JSON data drill sequences
-- For now, we'll create a function to help with mapping

CREATE OR REPLACE FUNCTION link_workout_to_drills(
    p_workout_name VARCHAR,
    p_drill_titles TEXT[]
) RETURNS INTEGER AS $$
DECLARE
    v_workout_id INTEGER;
    v_drill_id UUID;
    v_drill_title TEXT;
    v_sequence INTEGER := 1;
    v_linked_count INTEGER := 0;
BEGIN
    -- Get workout ID
    SELECT id INTO v_workout_id 
    FROM skills_academy_workouts 
    WHERE original_json_name = p_workout_name;
    
    IF v_workout_id IS NOT NULL THEN
        -- Clear existing drill links
        DELETE FROM skills_academy_workout_drills WHERE workout_id = v_workout_id;
        
        -- Link each drill
        FOREACH v_drill_title IN ARRAY p_drill_titles
        LOOP
            -- Find drill by title
            SELECT id INTO v_drill_id
            FROM powlax_drills
            WHERE LOWER(TRIM(title)) = LOWER(TRIM(v_drill_title))
            LIMIT 1;
            
            IF v_drill_id IS NOT NULL THEN
                INSERT INTO skills_academy_workout_drills (
                    workout_id, drill_id, sequence_order, drill_duration_seconds
                ) VALUES (
                    v_workout_id, v_drill_id, v_sequence, 60
                );
                v_linked_count := v_linked_count + 1;
            END IF;
            
            v_sequence := v_sequence + 1;
        END LOOP;
    END IF;
    
    RETURN v_linked_count;
END;
$$ LANGUAGE plpgsql;

-- Example: Link a Solid Start 5 workout to its drills
-- This would be called for each workout with the actual drill sequence from JSON
-- SELECT link_workout_to_drills(
--     'Solid Start 5 - Switching Hands Workout - More',
--     ARRAY[
--         'Shoulder to Nose Cradle',
--         'Quick Switches Hand Speed Drill',
--         'Standing Switches - Up to Pass Drill',
--         'Step Away Passing Drill',
--         'Strong Hand Wide Turn Ground Ball to Long Pass Drill'
--     ]
-- );

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
    'Linked Drills' as item,
    COUNT(*) as count
FROM skills_academy_workout_drills;

-- Show series breakdown
SELECT 
    series_type,
    COUNT(*) as series_count
FROM skills_academy_series
GROUP BY series_type
ORDER BY series_type;

-- Show workouts per series
SELECT 
    s.series_code,
    s.series_name,
    COUNT(w.id) as workout_count,
    STRING_AGG(w.workout_size || ' (' || w.drill_count || ' drills)', ', ' ORDER BY w.workout_size) as sizes
FROM skills_academy_series s
LEFT JOIN skills_academy_workouts w ON s.id = w.series_id
GROUP BY s.series_code, s.series_name, s.display_order
ORDER BY s.display_order
LIMIT 10;

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
    RAISE NOTICE '📊 Created:';
    RAISE NOTICE '   • 41 workout series';
    RAISE NOTICE '   • 5 Solid Start (SS1-SS5)';
    RAISE NOTICE '   • 12 Attack Track (A1-A12)';
    RAISE NOTICE '   • 12 Midfield Track (M1-M12)';
    RAISE NOTICE '   • 12 Defense Track (D1-D12)';
    RAISE NOTICE '';
    RAISE NOTICE '📹 Each series has:';
    RAISE NOTICE '   • Mini (5 drills)';
    RAISE NOTICE '   • More (10 drills)';
    RAISE NOTICE '   • Complete (13-19 drills) - most series';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Ready to link to powlax_drills table';
    RAISE NOTICE '   Use link_workout_to_drills() function';
    RAISE NOTICE '=========================================';
END $$;