-- ============================================
-- WALL BALL VARIANT DRILL MAPPING UPDATE
-- ============================================
-- Updates workout variants with correct drill_ids based on CSV sequence
-- Generated: 2025-08-10T17:21:04.833Z
-- Run AFTER uploading missing drills
-- ============================================

-- First, let's create a helper function to get drill ID by name
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
-- UPDATE WORKOUT VARIANTS WITH DRILL MAPPINGS
-- ============================================


-- Update Master Fundamentals
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
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
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Question Mark')
    ],
    total_drills = 17,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Near Side Fake, 4:Far Side Fake, 5:Top Hand Only, 6:Bottom Hand Only, 7:Off Stick Side Catch, 8:Turned Left, 9:Turned Right, 10:Catch and Switch, 11:Side Arm, 12:Face Dodge Shovel Pass, 13:Three Steps Up and Back, 14:Figure 8 Ground Balls, 15:Behind The Back, 16:Pop to Pass and Catch, 17:Question Mark'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Master Fund
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
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
    total_drills = 10,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Near Side Fake, 4:Far Side Fake, 5:Off Stick Side Catch, 6:Catch and Switch, 7:Face Dodge Shovel Pass, 8:Figure 8 Ground Balls, 9:Pop to Pass and Catch, 10:Question Mark'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Minute Master Fundamentals
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Catch and Switch')
    ],
    total_drills = 5,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Turned Right, 4:Turned Left, 5:Catch and Switch'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Master Fundamentals')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Dodging
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
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
    total_drills = 16,
    drill_sequence = '1:Overhand, 2:Catch and Switch, 3:Face Dodge Shovel Pass, 4:Pop to Pass and Catch, 5:Question Mark, 6:Step Back Throw Back, 7:Catch and Hitch, 8:Lever Pass, 9:Look Back Fake, 10:Jump Shot, 11:Split to Jump Shot, 12:Short Shot on the Run, 13:Up The Hash, 14:Roll Dodge Chin to Shoulder, 15:Walk The Dog to Wrister, 16:Walk The Dog Pass'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Dodging
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
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
    total_drills = 10,
    drill_sequence = '1:Catch and Switch, 2:Face Dodge Shovel Pass, 3:Pop to Pass and Catch, 4:Question Mark, 5:Step Back Throw Back, 6:Catch and Hitch, 7:Lever Pass, 8:Look Back Fake, 9:Split to Jump Shot, 10:Roll Dodge Chin to Shoulder'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Dodging
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Catch and Switch'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Step Back Throw Back'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder')
    ],
    total_drills = 5,
    drill_sequence = '1:Catch and Switch, 2:Face Dodge Shovel Pass, 5:Step Back Throw Back, 6:Catch and Hitch, 10:Roll Dodge Chin to Shoulder'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Dodging')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Conditioning
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Top Hand Only'),
        get_drill_id_by_name('Bottom Hand Only'),
        get_drill_id_by_name('Three Steps Up and Back'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Figure 8 - Down The Middle'),
        get_drill_id_by_name('Figure 8 - Up The Middle'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Walk The Dog Pass'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder'),
        get_drill_id_by_name('Split to Jump Shot')
    ],
    total_drills = 14,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Top Hand Only, 4:Bottom Hand Only, 5:Three Steps Up and Back, 6:Pop to Pass and Catch, 7:Figure 8 Ground Balls, 8:Figure 8 - Down The Middle, 8:Figure 8 - Up The Middle, 10:Catch and Hitch, 11:Walk The Dog to Wrister, 12:Walk The Dog Pass, 13:Roll Dodge Chin to Shoulder, 14:Split to Jump Shot'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Min Conditioning
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Three Steps Up and Back'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Figure 8 - Down The Middle'),
        get_drill_id_by_name('Figure 8 - Up The Middle'),
        get_drill_id_by_name('Catch and Hitch'),
        get_drill_id_by_name('Roll Dodge Chin to Shoulder'),
        get_drill_id_by_name('Split to Jump Shot')
    ],
    total_drills = 10,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Three Steps Up and Back, 4:Pop to Pass and Catch, 5:Figure 8 Ground Balls, 6:Figure 8 - Down The Middle, 7:Figure 8 - Up The Middle, 8:Catch and Hitch, 9:Roll Dodge Chin to Shoulder, 10:Split to Jump Shot'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Min Conditioning
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Three Steps Up and Back'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Figure 8 - Down The Middle'),
        get_drill_id_by_name('Figure 8 - Up The Middle')
    ],
    total_drills = 5,
    drill_sequence = '1:Three Steps Up and Back, 2:Pop to Pass and Catch, 3:Figure 8 Ground Balls, 4:Figure 8 - Down The Middle, 5:Figure 8 - Up The Middle'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Conditioning')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Faking and Inside Finishing
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Canadian Cross Hand'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Near Side Fake'),
        get_drill_id_by_name('Near Far Finish'),
        get_drill_id_by_name('Far Side Fake'),
        get_drill_id_by_name('Far Near Far Finish'),
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Around The World'),
        get_drill_id_by_name('Leaner')
    ],
    total_drills = 15,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Canadian Cross Hand, 4:Off Stick Side Catch, 5:Look Back Fake, 6:Twister, 7:Lever Pass, 8:Criss Cross Quick Sticks, 9:Near Side Fake, 10:Near Far Finish, 11:Far Side Fake, 12:Far Near Far Finish, 13:Behind The Back, 14:Around The World, 15:Leaner'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Inside Finishing')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Min Faking
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Near Side Fake'),
        get_drill_id_by_name('Far Side Fake'),
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Around The World'),
        get_drill_id_by_name('Leaner')
    ],
    total_drills = 10,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Off Stick Side Catch, 4:Twister, 5:Lever Pass, 6:Near Side Fake, 7:Far Side Fake, 8:Behind The Back, 9:Around The World, 10:Leaner'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Inside Finishing')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Minute Faking
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Near Side Fake'),
        get_drill_id_by_name('Far Side Fake'),
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Leaner')
    ],
    total_drills = 5,
    drill_sequence = '1:Twister, 2:Near Side Fake, 3:Far Side Fake, 4:Behind The Back, 5:Leaner'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Faking and Inside Finishing')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Shooting
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
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
    total_drills = 18,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Matt Brown Shooting, 4:Top Hand Only, 5:Bottom Hand Only, 6:Canadian Cross Hand, 7:Off Stick Side Catch, 8:Side Arm, 9:80 % Over Hand, 10:80 % Side Arm, 11:Short Shot on the Run, 12:Up The Hash, 13:Catch and Hitch, 14:Jump Shot, 15:Split to Jump Shot, 16:Walk The Dog to Wrister, 17:Twister, 18:Leaner'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Shooting
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Matt Brown Shooting'),
        get_drill_id_by_name('Side Arm'),
        get_drill_id_by_name('80 % Over Hand'),
        get_drill_id_by_name('80 % Side Arm'),
        get_drill_id_by_name('Short Shot on the Run'),
        get_drill_id_by_name('Up The Hash'),
        get_drill_id_by_name('Jump Shot'),
        get_drill_id_by_name('Twister')
    ],
    total_drills = 10,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Matt Brown Shooting, 4:Side Arm, 5:80 % Over Hand, 6:80 % Side Arm, 7:Short Shot on the Run, 8:Up The Hash, 9:Jump Shot, 10:Twister'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Shooting
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Matt Brown Shooting'),
        get_drill_id_by_name('80 % Over Hand'),
        get_drill_id_by_name('Short Shot on the Run'),
        get_drill_id_by_name('Up The Hash')
    ],
    total_drills = 5,
    drill_sequence = '1:Overhand, 2:Matt Brown Shooting, 3:80 % Over Hand, 4:Short Shot on the Run, 5:Up The Hash'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Shooting')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Defensive Emphasis
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Three Steps Up and Back'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Matt Brown Shooting'),
        get_drill_id_by_name('Question Mark'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Figure 8 - Down The Middle'),
        get_drill_id_by_name('Figure 8 - Up The Middle'),
        get_drill_id_by_name('Ankle Biters'),
        get_drill_id_by_name('Short Hop')
    ],
    total_drills = 17,
    drill_sequence = '1:Overhand, 2:Off Stick Side Catch, 3:Turned Left, 4:Turned Right, 5:Face Dodge Shovel Pass, 6:Look Back Fake, 7:Three Steps Up and Back, 8:Figure 8 Ground Balls, 9:Matt Brown Shooting, 10:Question Mark, 11:Walk The Dog to Wrister, 12:Shovel Pass to Over The Shoulder, 13:Lever Pass, 14:Figure 8 - Down The Middle, 15:Figure 8 - Up The Middle, 16:Ankle Biters, 17:Short Hop'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Defensive Emphasis')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Defense
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Question Mark'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder')
    ],
    total_drills = 10,
    drill_sequence = '1:Overhand, 2:Off Stick Side Catch, 3:Turned Left, 4:Turned Right, 5:Face Dodge Shovel Pass, 6:Look Back Fake, 7:Figure 8 Ground Balls, 8:Question Mark, 9:Walk The Dog to Wrister, 10:Shovel Pass to Over The Shoulder'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Defensive Emphasis')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Defense
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Face Dodge Shovel Pass'),
        get_drill_id_by_name('Look Back Fake'),
        get_drill_id_by_name('Figure 8 Ground Balls'),
        get_drill_id_by_name('Question Mark')
    ],
    total_drills = 5,
    drill_sequence = '1:Overhand, 2:Face Dodge Shovel Pass, 3:Look Back Fake, 4:Figure 8 Ground Balls, 5:Question Mark'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Defensive Emphasis')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Catch Everything
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Side Arm'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('80 % Over Hand'),
        get_drill_id_by_name('80 % Side Arm'),
        get_drill_id_by_name('Ankle Biters'),
        get_drill_id_by_name('Short Hop'),
        get_drill_id_by_name('Side Arm to One Handed Extended Catch')
    ],
    total_drills = 14,
    drill_sequence = '1:Overhand, 2:Quick Sticks, 3:Turned Left, 4:Turned Right, 5:Off Stick Side Catch, 6:Criss Cross Quick Sticks, 7:Shovel Pass to Over The Shoulder, 8:Side Arm, 9:Pop to Pass and Catch, 10:80 % Over Hand, 11:80 % Side Arm, 12:Ankle Biters, 13:Short Hop, 14:Side Arm to One Handed Extended Catch'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catch Everything')
  AND duration_minutes IS NULL
  AND has_coaching = true;


-- Update 10 Catch Everything
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Overhand'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Around The World'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Leaner'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Pop to Pass and Catch'),
        get_drill_id_by_name('Short Hop'),
        get_drill_id_by_name('Ankle Biters'),
        get_drill_id_by_name('Short Hop'),
        get_drill_id_by_name('Side Arm to One Handed Extended Catch')
    ],
    total_drills = 20,
    drill_sequence = '1:Overhand, 1:Quick Sticks, 2:Quick Sticks, 2:Behind The Back, 3:Turned Left, 3:Around The World, 4:Turned Right, 4:Twister, 5:Lever Pass, 5:Off Stick Side Catch, 6:Criss Cross Quick Sticks, 6:Criss Cross Quick Sticks, 7:Leaner, 7:Shovel Pass to Over The Shoulder, 8:Shovel Pass to Over The Shoulder, 8:Pop to Pass and Catch, 9:Short Hop, 9:Ankle Biters, 10:Short Hop, 10:Side Arm to One Handed Extended Catch'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catch Everything')
  AND duration_minutes = 10
  AND has_coaching = true;


-- Update 5 Catch Everything
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Turned Left'),
        get_drill_id_by_name('Leaner'),
        get_drill_id_by_name('Turned Right'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Short Hop'),
        get_drill_id_by_name('Off Stick Side Catch'),
        get_drill_id_by_name('Side Arm to One Handed Extended Catch'),
        get_drill_id_by_name('Pop to Pass and Catch')
    ],
    total_drills = 10,
    drill_sequence = '1:Quick Sticks, 1:Criss Cross Quick Sticks, 2:Turned Left, 2:Leaner, 3:Turned Right, 3:Shovel Pass to Over The Shoulder, 4:Short Hop, 4:Off Stick Side Catch, 5:Side Arm to One Handed Extended Catch, 5:Pop to Pass and Catch'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Catch Everything')
  AND duration_minutes = 5
  AND has_coaching = true;


-- Update Advanced - Fun and Challenging
UPDATE wall_ball_workout_variants 
SET drill_ids = ARRAY[
        get_drill_id_by_name('Quick Sticks'),
        get_drill_id_by_name('Top Hand Only'),
        get_drill_id_by_name('Bottom Hand Only'),
        get_drill_id_by_name('Canadian Cross Hand'),
        get_drill_id_by_name('Behind The Back'),
        get_drill_id_by_name('Around The World'),
        get_drill_id_by_name('Twister'),
        get_drill_id_by_name('Lever Pass'),
        get_drill_id_by_name('Criss Cross Quick Sticks'),
        get_drill_id_by_name('Leaner'),
        get_drill_id_by_name('Shovel Pass to Over The Shoulder'),
        get_drill_id_by_name('Ankle Biters'),
        get_drill_id_by_name('Short Hop'),
        get_drill_id_by_name('Side Arm to One Handed Extended Catch'),
        get_drill_id_by_name('Walk The Dog to Wrister'),
        get_drill_id_by_name('Walk The Dog Pass'),
        get_drill_id_by_name('Underhand Behind The Back'),
        get_drill_id_by_name('Underhand Between The Legs')
    ],
    total_drills = 18,
    drill_sequence = '1:Quick Sticks, 2:Top Hand Only, 3:Bottom Hand Only, 4:Canadian Cross Hand, 5:Behind The Back, 6:Around The World, 7:Twister, 8:Lever Pass, 9:Criss Cross Quick Sticks, 10:Leaner, 11:Shovel Pass to Over The Shoulder, 12:Ankle Biters, 13:Short Hop, 14:Side Arm to One Handed Extended Catch, 15:Walk The Dog to Wrister, 16:Walk The Dog Pass, 17:Underhand Behind The Back, 18:Underhand Between The Legs'
WHERE series_id = (SELECT id FROM wall_ball_workout_series WHERE series_name = 'Advanced - Fun and Challenging')
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
    wbwv.total_drills,
    array_length(wbwv.drill_ids, 1) as drill_count,
    wbwv.drill_sequence
FROM wall_ball_workout_variants wbwv
JOIN wall_ball_workout_series wbws ON wbwv.series_id = wbws.id
WHERE wbwv.drill_ids IS NOT NULL AND array_length(wbwv.drill_ids, 1) > 0
ORDER BY wbws.series_name, wbwv.duration_minutes, wbwv.has_coaching;

-- Check for any missing drill mappings
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
