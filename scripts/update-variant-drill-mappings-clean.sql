-- ============================================
-- WALL BALL VARIANT DRILL MAPPING UPDATE (CLEAN)
-- ============================================
-- Updates workout variants with correct drill_ids and proper JSONB drill_sequence
-- Uses clean approach without string concatenation
-- Generated: 2025-01-10
-- ============================================

-- ============================================
-- STEP 1: UPDATE MASTER FUNDAMENTALS VARIANTS
-- ============================================

-- Master Fundamentals - Complete (17 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- Master Fundamentals - 10 Minutes (10 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 10
  AND has_coaching = true;

-- Master Fundamentals - 5 Minutes (5 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 5
  AND has_coaching = true;

-- ============================================
-- STEP 2: UPDATE DODGING VARIANTS
-- ============================================

-- Dodging - Complete (16 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- Dodging - 10 Minutes (10 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 10
  AND has_coaching = true;

-- Dodging - 5 Minutes (5 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Switch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Step Back Throw Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 5
  AND has_coaching = true;

-- ============================================
-- STEP 3: UPDATE SHOOTING VARIANTS
-- ============================================

-- Shooting - Complete (18 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- Shooting - 10 Minutes (10 drills)
UPDATE wall_ball_workout_variants 
SET 
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
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes = 10
  AND has_coaching = true;

-- Shooting - 5 Minutes (5 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Shot on the Run'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Up The Hash')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes = 5
  AND has_coaching = true;

-- ============================================
-- STEP 4: UPDATE CONDITIONING VARIANTS
-- ============================================

-- Conditioning - Complete (14 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Top Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Bottom Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Three Steps Up and Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 Ground Balls'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 - Down The Middle'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 - Up The Middle'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Catch and Hitch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog to Wrister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Roll Dodge Chin to Shoulder'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Split to Jump Shot')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- STEP 5: UPDATE FAKING AND INSIDE FINISHING VARIANTS
-- ============================================

-- Faking and Inside Finishing - Complete (15 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Canadian Cross Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Look Back Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Twister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Lever Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Criss Cross Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Near Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Near Far Finish'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Far Side Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Far Near Far Finish'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Behind the Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Around The World'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Leaner')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Inside Finishing')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- STEP 6: UPDATE DEFENSIVE EMPHASIS VARIANTS
-- ============================================

-- Defensive Emphasis - Complete (17 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Face Dodge Shovel Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Look Back Fake'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Three Steps Up and Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 Ground Balls'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Matt Brown Shooting'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Question Mark'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog to Wrister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Shovel Pass to Over The Shoulder'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Lever Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 - Down The Middle'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Figure 8 - Up The Middle'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Ankle Biters'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Hop')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Defensive Emphasis')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- STEP 7: UPDATE CATCH EVERYTHING VARIANTS
-- ============================================

-- Catch Everything - Complete (14 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Overhand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Left'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Turned Right'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Off Stick Side Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Criss Cross Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Shovel Pass to Over The Shoulder'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Pop to Pass and Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Over Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = '80 % Side Arm'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Ankle Biters'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Hop'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm to One Handed Extended Catch')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catch Everything')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- STEP 8: UPDATE ADVANCED VARIANTS
-- ============================================

-- Advanced - Fun and Challenging - Complete (18 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Top Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Bottom Hand Only'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Canadian Cross Hand'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Behind the Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Around The World'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Twister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Lever Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Criss Cross Quick Sticks'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Leaner'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Shovel Pass to Over The Shoulder'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Ankle Biters'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Short Hop'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Side Arm to One Handed Extended Catch'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog to Wrister'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Walk The Dog Pass'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Underhand Behind The Back'),
        (SELECT id FROM wall_ball_drill_library WHERE drill_name = 'Underhand Between The Legs')
    ]
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced - Fun and Challenging')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check drill mappings summary
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching,
    array_length(wbwv.drill_ids, 1) as drill_count,
    wbwv.drill_ids[1:3] as first_three_drill_ids
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NOT NULL AND array_length(wbwv.drill_ids, 1) > 0
ORDER BY wbws.series_name, wbwv.duration_minutes, wbwv.has_coaching;

-- Check for any variants without drill mappings
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching,
    'Missing drill mapping' as status
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NULL OR array_length(wbwv.drill_ids, 1) = 0
ORDER BY wbws.series_name, wbwv.duration_minutes;

-- Show sample drill mapping for Master Fundamentals Complete
SELECT 
    'Master Fundamentals Complete' as workout,
    unnest(drill_ids) as drill_id,
    (SELECT drill_name FROM wall_ball_drill_library WHERE id = unnest(drill_ids)) as drill_name
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbws.series_name = 'Master Fundamentals' 
  AND wbwv.duration_minutes IS NULL
  AND wbwv.has_coaching = true;
