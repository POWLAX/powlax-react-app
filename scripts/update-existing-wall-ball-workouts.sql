-- ============================================
-- UPDATE EXISTING WALL BALL WORKOUTS WITH DRILL MAPPINGS
-- ============================================
-- Updates the existing wall ball workouts in skills_academy_workouts
-- Adds proper drill_ids arrays and drill_count values
-- ============================================

-- ============================================
-- STEP 1: UPDATE MASTER FUNDAMENTALS WORKOUTS
-- ============================================

-- Master Fundamentals - 5 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 5,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch')
    ],
    estimated_duration_minutes = 5
WHERE workout_name = 'Master Fundamentals - 5 Minutes';

-- Master Fundamentals - 10 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 10,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Near Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Far Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 Ground Balls'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Question Mark')
    ],
    estimated_duration_minutes = 10
WHERE workout_name = 'Master Fundamentals - 10 Minutes';

-- Master Fundamentals - Complete
UPDATE skills_academy_workouts SET
    drill_count = 17,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Near Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Far Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Top Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Bottom Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Three Steps Up and Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 Ground Balls'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Behind the Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Question Mark')
    ],
    estimated_duration_minutes = 15
WHERE workout_name = 'Master Fundamentals - Complete';

-- ============================================
-- STEP 2: UPDATE DODGING WORKOUTS
-- ============================================

-- Dodging - 5 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 5,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Step Back Throw Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder')
    ],
    estimated_duration_minutes = 5
WHERE workout_name = 'Dodging - 5 Minutes';

-- Dodging - 10 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 10,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Question Mark'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Step Back Throw Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Lever Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Look Back Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Split to Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder')
    ],
    estimated_duration_minutes = 10
WHERE workout_name = 'Dodging - 10 Minutes';

-- Dodging - Complete
UPDATE skills_academy_workouts SET
    drill_count = 16,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Question Mark'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Step Back Throw Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Lever Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Look Back Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Split to Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog to Wrister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog Pass')
    ],
    estimated_duration_minutes = 16
WHERE workout_name = 'Dodging - Complete';

-- ============================================
-- STEP 3: UPDATE SHOOTING WORKOUTS
-- ============================================

-- Shooting - 5 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 5,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash')
    ],
    estimated_duration_minutes = 5
WHERE workout_name = 'Shooting - 5 Minutes';

-- Shooting - 10 Minutes
UPDATE skills_academy_workouts SET
    drill_count = 10,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Twister')
    ],
    estimated_duration_minutes = 10
WHERE workout_name = 'Shooting - 10 Minutes';

-- Shooting - Complete
UPDATE skills_academy_workouts SET
    drill_count = 18,
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Top Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Bottom Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Canadian Cross Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Split to Jump Shot'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog to Wrister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Twister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Leaner')
    ],
    estimated_duration_minutes = 18
WHERE workout_name = 'Shooting - Complete';

-- ============================================
-- VERIFICATION QUERIES (Run separately if needed)
-- ============================================

-- Check updated workouts
-- SELECT 
--     w.id,
--     w.workout_name,
--     s.series_name,
--     w.workout_size,
--     w.drill_count,
--     array_length(w.drill_ids, 1) as actual_drill_count,
--     w.estimated_duration_minutes
-- FROM skills_academy_workouts w
-- JOIN skills_academy_series s ON w.series_id = s.id
-- WHERE s.series_type = 'wall_ball'
--   AND w.drill_count > 0
-- ORDER BY s.series_name, w.estimated_duration_minutes;
