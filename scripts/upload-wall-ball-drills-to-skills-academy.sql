-- ============================================
-- WALL BALL DRILLS UPLOAD TO SKILLS ACADEMY STRUCTURE
-- ============================================
-- Uploads Wall Ball drills to the ACTUAL Skills Academy structure
-- Based on the live site using skills_academy_series and skills_academy_workouts
-- ============================================

-- ============================================
-- STEP 1: INSERT WALL BALL SERIES INTO SKILLS ACADEMY
-- ============================================

-- Insert Wall Ball series into skills_academy_series
INSERT INTO skills_academy_series (
    series_name,
    series_type,
    description,
    difficulty_level,
    display_order,
    is_active
) VALUES 
(
    'Master Fundamentals',
    'wall_ball',
    'Build essential wall ball skills with fundamental drills',
    1,
    100,
    true
),
(
    'Dodging',
    'wall_ball', 
    'Develop dodging techniques and footwork',
    2,
    101,
    true
),
(
    'Shooting',
    'wall_ball',
    'Improve shooting accuracy and power', 
    2,
    102,
    true
),
(
    'Conditioning',
    'wall_ball',
    'High-intensity wall ball workout for fitness',
    3,
    103,
    true
),
(
    'Faking and Inside Finishing',
    'wall_ball',
    'Master deceptive moves and close-range shots',
    3,
    104,
    true
),
(
    'Defensive Emphasis',
    'wall_ball',
    'Defensive positioning and stick work',
    2,
    105,
    true
),
(
    'Catch Everything', 
    'wall_ball',
    'Improve catching skills in all situations',
    2,
    106,
    true
),
(
    'Advanced - Fun and Challenging',
    'wall_ball',
    'Challenging and entertaining advanced drills',
    4,
    107,
    true
)
ON CONFLICT (series_name) DO UPDATE SET
    series_type = EXCLUDED.series_type,
    description = EXCLUDED.description,
    difficulty_level = EXCLUDED.difficulty_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ============================================
-- STEP 2: INSERT WALL BALL WORKOUTS INTO SKILLS ACADEMY
-- ============================================

-- Master Fundamentals Workouts
INSERT INTO skills_academy_workouts (
    workout_name,
    series_id,
    workout_size,
    drill_ids,
    estimated_duration_minutes,
    is_active
) VALUES 
(
    'Master Fundamentals - 5 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Master Fundamentals'),
    'Mini',
    5,
    ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch')
    ],
    5,
    true
),
(
    'Master Fundamentals - 10 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Master Fundamentals'),
    'More', 
    ARRAY[
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
    10,
    true
),
(
    'Master Fundamentals - Complete',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Master Fundamentals'),
    'Complete',
    ARRAY[
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
    15,
    true
);

-- Dodging Workouts
INSERT INTO skills_academy_workouts (
    workout_name,
    series_id,
    workout_size,
    drill_ids,
    estimated_duration_minutes,
    is_active
) VALUES 
(
    'Dodging - 5 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Dodging'),
    'Mini',
    ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Step Back Throw Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder')
    ],
    5,
    true
),
(
    'Dodging - 10 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Dodging'),
    'More',
    ARRAY[
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
    10,
    true
),
(
    'Dodging - Complete',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Dodging'),
    'Complete',
    ARRAY[
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
    16,
    true
);

-- Shooting Workouts  
INSERT INTO skills_academy_workouts (
    workout_name,
    series_id,
    workout_size,
    drill_ids,
    estimated_duration_minutes,
    is_active
) VALUES 
(
    'Shooting - 5 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Shooting'),
    'Mini',
    ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash')
    ],
    5,
    true
),
(
    'Shooting - 10 Minutes',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Shooting'),
    'More',
    ARRAY[
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
    10,
    true
),
(
    'Shooting - Complete',
    (SELECT id FROM skills_academy_series WHERE series_name = 'Shooting'),
    'Complete',
    ARRAY[
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
    18,
    true
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check wall ball series in Skills Academy
SELECT 
    id,
    series_name,
    series_type,
    description,
    difficulty_level
FROM skills_academy_series 
WHERE series_type = 'wall_ball'
ORDER BY display_order;

-- Check wall ball workouts in Skills Academy
SELECT 
    w.id,
    w.workout_name,
    s.series_name,
    w.workout_size,
    array_length(w.drill_ids, 1) as drill_count,
    w.estimated_duration_minutes
FROM skills_academy_workouts w
JOIN skills_academy_series s ON w.series_id = s.id
WHERE s.series_type = 'wall_ball'
ORDER BY s.series_name, w.estimated_duration_minutes;

-- Check drill mappings
SELECT 
    w.workout_name,
    unnest(w.drill_ids) as drill_id,
    (SELECT drill_name FROM wall_ball_drill_library WHERE id = unnest(w.drill_ids)) as drill_name
FROM skills_academy_workouts w
JOIN skills_academy_series s ON w.series_id = s.id
WHERE s.series_type = 'wall_ball' 
  AND w.workout_name LIKE 'Master Fundamentals - 5 Minutes';
