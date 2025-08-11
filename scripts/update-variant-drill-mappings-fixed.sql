-- ============================================
-- WALL BALL VARIANT DRILL MAPPING UPDATE (FIXED)
-- ============================================
-- Updates workout variants with correct drill_ids and JSONB drill_sequence
-- Generated: 2025-01-10
-- Run AFTER uploading missing drills
-- ============================================

-- First, create a helper function to get drill ID by name
CREATE OR REPLACE FUNCTION get_drill_id_by_name(drill_name_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    drill_id_result INTEGER;
BEGIN
    SELECT id INTO drill_id_result 
    FROM wall_ball_drill_library 
    WHERE drill_name = drill_name_param;
    
    IF drill_id_result IS NULL THEN
        RAISE WARNING 'Drill not found: %', drill_name_param;
        RETURN NULL;
    END IF;
    
    RETURN drill_id_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE MASTER FUNDAMENTALS VARIANTS
-- ============================================

-- Master Fundamentals - Complete (17 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Near Side Fake'),
        get_drill_id_by_name('Far Side Fake'),
        get_drill_id_by_name('Top Hand Only'),
        get_drill_id_by_name('Bottom Hand Only'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Side Arm'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Three Steps Up and Back'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Behind the Back'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Question Mark')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Overhand') || ', "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Quick Sticks') || ', "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Near Side Fake') || ', "drill_name": "Near Side Fake", "sequence_order": 3, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Far Side Fake') || ', "drill_name": "Far Side Fake", "sequence_order": 4, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Top Hand Only') || ', "drill_name": "Top Hand Only", "sequence_order": 5, "duration_seconds": 60, "hand_variation": "strong_hand"},
        {"drill_id": ' || get_drill_id_by_name('Bottom Hand Only') || ', "drill_name": "Bottom Hand Only", "sequence_order": 6, "duration_seconds": 60, "hand_variation": "off_hand"},
        {"drill_id": ' || get_drill_id_by_name('Off Stick Side Catch') || ', "drill_name": "Off Stick Side Catch", "sequence_order": 7, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Turned Left') || ', "drill_name": "Turned Left", "sequence_order": 8, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Turned Right') || ', "drill_name": "Turned Right", "sequence_order": 9, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 10, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Side Arm') || ', "drill_name": "Side Arm", "sequence_order": 11, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Face Dodge Shovel Pass') || ', "drill_name": "Face Dodge Shovel Pass", "sequence_order": 12, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Three Steps Up and Back') || ', "drill_name": "Three Steps Up and Back", "sequence_order": 13, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Figure 8 Ground Balls') || ', "drill_name": "Figure 8 Ground Balls", "sequence_order": 14, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Behind the Back') || ', "drill_name": "Behind the Back", "sequence_order": 15, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Pop to Pass and Catch') || ', "drill_name": "Pop to Pass and Catch", "sequence_order": 16, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Question Mark') || ', "drill_name": "Question Mark", "sequence_order": 17, "duration_seconds": 60, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- Master Fundamentals - 10 Minutes (10 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Near Side Fake'),
        get_drill_id_by_name('Far Side Fake'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Question Mark')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Overhand') || ', "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Quick Sticks') || ', "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Near Side Fake') || ', "drill_name": "Near Side Fake", "sequence_order": 3, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Far Side Fake') || ', "drill_name": "Far Side Fake", "sequence_order": 4, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Off Stick Side Catch') || ', "drill_name": "Off Stick Side Catch", "sequence_order": 5, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 6, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Face Dodge Shovel Pass') || ', "drill_name": "Face Dodge Shovel Pass", "sequence_order": 7, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Figure 8 Ground Balls') || ', "drill_name": "Figure 8 Ground Balls", "sequence_order": 8, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Pop to Pass and Catch') || ', "drill_name": "Pop to Pass and Catch", "sequence_order": 9, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Question Mark') || ', "drill_name": "Question Mark", "sequence_order": 10, "duration_seconds": 60, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 10
  AND has_coaching = true;

-- Master Fundamentals - 5 Minutes (5 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Catch and Switch')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Overhand') || ', "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Quick Sticks') || ', "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Turned Right') || ', "drill_name": "Turned Right", "sequence_order": 3, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Turned Left') || ', "drill_name": "Turned Left", "sequence_order": 4, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 5, "duration_seconds": 60, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 5
  AND has_coaching = true;

-- ============================================
-- UPDATE DODGING VARIANTS
-- ============================================

-- Dodging - Complete (16 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Question Mark'),
        get_drill_id_by_name('Step Back Throw Back'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Jump Shot'),
        get_drill_id_by_name('Split to Jump Shot'),
        get_drill_id_by_name('Short Shot on the Run'),
        get_drill_id_by_name('Up The Hash'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Walk The Dog Pass')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Overhand') || ', "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 2, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Face Dodge Shovel Pass') || ', "drill_name": "Face Dodge Shovel Pass", "sequence_order": 3, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Pop to Pass and Catch') || ', "drill_name": "Pop to Pass and Catch", "sequence_order": 4, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Question Mark') || ', "drill_name": "Question Mark", "sequence_order": 5, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Step Back Throw Back') || ', "drill_name": "Step Back Throw Back", "sequence_order": 6, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Hitch') || ', "drill_name": "Catch and Hitch", "sequence_order": 7, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Lever Pass') || ', "drill_name": "Lever Pass", "sequence_order": 8, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Look Back Fake') || ', "drill_name": "Look Back Fake", "sequence_order": 9, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Jump Shot') || ', "drill_name": "Jump Shot", "sequence_order": 10, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Split to Jump Shot') || ', "drill_name": "Split to Jump Shot", "sequence_order": 11, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Short Shot on the Run') || ', "drill_name": "Short Shot on the Run", "sequence_order": 12, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Up The Hash') || ', "drill_name": "Up The Hash", "sequence_order": 13, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Roll Dodge Chin to Shoulder') || ', "drill_name": "Roll Dodge Chin to Shoulder", "sequence_order": 14, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Walk The Dog to Wrister') || ', "drill_name": "Walk The Dog to Wrister", "sequence_order": 15, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Walk The Dog Pass') || ', "drill_name": "Walk The Dog Pass", "sequence_order": 16, "duration_seconds": 45, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- Dodging - 10 Minutes (10 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Question Mark'),
        get_drill_id_by_name('Step Back Throw Back'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Split to Jump Shot'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 1, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Face Dodge Shovel Pass') || ', "drill_name": "Face Dodge Shovel Pass", "sequence_order": 2, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Pop to Pass and Catch') || ', "drill_name": "Pop to Pass and Catch", "sequence_order": 3, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Question Mark') || ', "drill_name": "Question Mark", "sequence_order": 4, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Step Back Throw Back') || ', "drill_name": "Step Back Throw Back", "sequence_order": 5, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Hitch') || ', "drill_name": "Catch and Hitch", "sequence_order": 6, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Lever Pass') || ', "drill_name": "Lever Pass", "sequence_order": 7, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Look Back Fake') || ', "drill_name": "Look Back Fake", "sequence_order": 8, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Split to Jump Shot') || ', "drill_name": "Split to Jump Shot", "sequence_order": 9, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Roll Dodge Chin to Shoulder') || ', "drill_name": "Roll Dodge Chin to Shoulder", "sequence_order": 10, "duration_seconds": 60, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 10
  AND has_coaching = true;

-- Dodging - 5 Minutes (5 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Step Back Throw Back'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Catch and Switch') || ', "drill_name": "Catch and Switch", "sequence_order": 1, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Face Dodge Shovel Pass') || ', "drill_name": "Face Dodge Shovel Pass", "sequence_order": 2, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Step Back Throw Back') || ', "drill_name": "Step Back Throw Back", "sequence_order": 5, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Hitch') || ', "drill_name": "Catch and Hitch", "sequence_order": 6, "duration_seconds": 60, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Roll Dodge Chin to Shoulder') || ', "drill_name": "Roll Dodge Chin to Shoulder", "sequence_order": 10, "duration_seconds": 60, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 5
  AND has_coaching = true;

-- ============================================
-- UPDATE SHOOTING VARIANTS  
-- ============================================

-- Shooting - Complete (18 drills)
UPDATE wall_ball_workout_variants 
SET 
    drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Matt Brown Shooting'),
        get_drill_id_by_name('Top Hand Only'),
        get_drill_id_by_name('Bottom Hand Only'),
        get_drill_id_by_name('Canadian Cross Hand'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Side Arm'),
        get_drill_id_by_name('80 % Over Hand'),
        get_drill_id_by_name('80 % Side Arm'),
        get_drill_id_by_name('Short Shot on the Run'),
        get_drill_id_by_name('Up The Hash'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Jump Shot'),
        get_drill_id_by_name('Split to Jump Shot'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Leaner')
    ],
    drill_sequence = '[
        {"drill_id": ' || get_drill_id_by_name('Overhand') || ', "drill_name": "Overhand", "sequence_order": 1, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Quick Sticks') || ', "drill_name": "Quick Sticks", "sequence_order": 2, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Matt Brown Shooting') || ', "drill_name": "Matt Brown Shooting", "sequence_order": 3, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Top Hand Only') || ', "drill_name": "Top Hand Only", "sequence_order": 4, "duration_seconds": 45, "hand_variation": "strong_hand"},
        {"drill_id": ' || get_drill_id_by_name('Bottom Hand Only') || ', "drill_name": "Bottom Hand Only", "sequence_order": 5, "duration_seconds": 45, "hand_variation": "off_hand"},
        {"drill_id": ' || get_drill_id_by_name('Canadian Cross Hand') || ', "drill_name": "Canadian Cross Hand", "sequence_order": 6, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Off Stick Side Catch') || ', "drill_name": "Off Stick Side Catch", "sequence_order": 7, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Side Arm') || ', "drill_name": "Side Arm", "sequence_order": 8, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('80 % Over Hand') || ', "drill_name": "80 % Over Hand", "sequence_order": 9, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('80 % Side Arm') || ', "drill_name": "80 % Side Arm", "sequence_order": 10, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Short Shot on the Run') || ', "drill_name": "Short Shot on the Run", "sequence_order": 11, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Up The Hash') || ', "drill_name": "Up The Hash", "sequence_order": 12, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Catch and Hitch') || ', "drill_name": "Catch and Hitch", "sequence_order": 13, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Jump Shot') || ', "drill_name": "Jump Shot", "sequence_order": 14, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Split to Jump Shot') || ', "drill_name": "Split to Jump Shot", "sequence_order": 15, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Walk The Dog to Wrister') || ', "drill_name": "Walk The Dog to Wrister", "sequence_order": 16, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Twister') || ', "drill_name": "Twister", "sequence_order": 17, "duration_seconds": 45, "hand_variation": "both_hands"},
        {"drill_id": ' || get_drill_id_by_name('Leaner') || ', "drill_name": "Leaner", "sequence_order": 18, "duration_seconds": 45, "hand_variation": "both_hands"}
    ]'::jsonb
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes IS NULL
  AND has_coaching = true;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check drill mappings
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching,
    array_length(wbwv.drill_ids, 1) as drill_count,
    jsonb_array_length(wbwv.drill_sequence) as sequence_count
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NOT NULL AND array_length(wbwv.drill_ids, 1) > 0
ORDER BY wbws.series_name, wbwv.duration_minutes, wbwv.has_coaching;

-- Show drill sequence for Master Fundamentals Complete
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    jsonb_pretty(wbwv.drill_sequence) as drill_sequence_formatted
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbws.series_name = 'Master Fundamentals' 
  AND wbwv.duration_minutes IS NULL
  AND wbwv.has_coaching = true;

-- Check for any variants without drill mappings
SELECT 
    wbws.series_name,
    wbwv.variant_name,
    wbwv.duration_minutes,
    wbwv.has_coaching
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NULL OR array_length(wbwv.drill_ids, 1) = 0
ORDER BY wbws.series_name, wbwv.duration_minutes;

-- Drop the helper function
DROP FUNCTION IF EXISTS get_drill_id_by_name(TEXT);
