-- ============================================
-- UPDATE WALL BALL DRILL LIBRARY WITH VIMEO VIDEOS
-- ============================================
-- Updates wall_ball_drill_library with Vimeo video URLs and IDs
-- Based on Wall Ball Workout.md video mapping
-- ============================================

-- ============================================
-- STEP 1: UPDATE DRILL VIDEOS WITH VIMEO IDS
-- ============================================

-- No helper function needed - we'll use direct Vimeo IDs

-- ============================================
-- STEP 2: UPDATE ALL DRILL VIDEOS
-- ============================================

-- 3 Steps Up and Back
UPDATE wall_ball_drill_library SET 
    strong_hand_video_url = 'https://player.vimeo.com/video/997146099',
    strong_hand_vimeo_id = '997146099',
    off_hand_video_url = 'https://player.vimeo.com/video/997153712', 
    off_hand_vimeo_id = '997153712'
WHERE drill_name = '3 Steps Up and Back' OR drill_name = 'Three Steps Up and Back';

-- 80% Overhand Shooting  
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997146323',
    both_hands_vimeo_id = '997146323'
WHERE drill_name = '80 % Over Hand' OR drill_name = '80% Overhand Shooting';

-- 80% Side Arm Shooting
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997146248',
    strong_hand_vimeo_id = '997146248',
    off_hand_video_url = 'https://player.vimeo.com/video/997146177',
    off_hand_vimeo_id = '997146177' 
WHERE drill_name = '80 % Side Arm' OR drill_name = '80% Side Arm Shooting';

-- Ankle Biters
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997146551',
    strong_hand_vimeo_id = '997146551',
    off_hand_video_url = 'https://player.vimeo.com/video/997145951',
    off_hand_vimeo_id = '997145951'
WHERE drill_name = 'Ankle Biters';

-- Around The World
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997146713',
    strong_hand_vimeo_id = '997146713',
    off_hand_video_url = 'https://player.vimeo.com/video/997146631',
    off_hand_vimeo_id = '997146631'
WHERE drill_name = 'Around The World';

-- Behind The Back
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997146917',
    strong_hand_vimeo_id = '997146917',
    off_hand_video_url = 'https://player.vimeo.com/video/997146803',
    off_hand_vimeo_id = '997146803'
WHERE drill_name = 'Behind the Back' OR drill_name = 'Behind The Back';

-- Bottom Hand Only
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997147289',
    strong_hand_vimeo_id = '997147289',
    off_hand_video_url = 'https://player.vimeo.com/video/997147132',
    off_hand_vimeo_id = '997147132'
WHERE drill_name = 'Bottom Hand Only';

-- Canadian Cross Hand
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997147539',
    strong_hand_vimeo_id = '997147539',
    off_hand_video_url = 'https://player.vimeo.com/video/997147443',
    off_hand_vimeo_id = '997147443'
WHERE drill_name = 'Canadian Cross Hand';

-- Catch and Hitch
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997147689',
    both_hands_vimeo_id = '997147689'
WHERE drill_name = 'Catch and Hitch';

-- Catch and Switch
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997147863',
    both_hands_vimeo_id = '997147863'
WHERE drill_name = 'Catch and Switch';

-- Criss Cross Quick Sticks
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148080',
    strong_hand_vimeo_id = '997148080',
    off_hand_video_url = 'https://player.vimeo.com/video/997147987',
    off_hand_vimeo_id = '997147987'
WHERE drill_name = 'Criss Cross Quick Sticks';

-- Face Dodge Shovel Pass
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148282',
    strong_hand_vimeo_id = '997148282',
    off_hand_video_url = 'https://player.vimeo.com/video/997148200',
    off_hand_vimeo_id = '997148200'
WHERE drill_name = 'Face Dodge Shovel Pass';

-- Far Fake - Near Fake - Finish Far
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148444',
    strong_hand_vimeo_id = '997148444',
    off_hand_video_url = 'https://player.vimeo.com/video/997148402',
    off_hand_vimeo_id = '997148402'
WHERE drill_name = 'Far Fake - Near Fake - Finish Far';

-- Far Side Fake
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148620',
    strong_hand_vimeo_id = '997148620',
    off_hand_video_url = 'https://player.vimeo.com/video/997148528',
    off_hand_vimeo_id = '997148528'
WHERE drill_name = 'Far Side Fake';

-- Figure 8 - Down the Middle
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148704',
    strong_hand_vimeo_id = '997148704',
    off_hand_video_url = 'https://player.vimeo.com/video/997148657',
    off_hand_vimeo_id = '997148657'
WHERE drill_name = 'Figure 8 - Down the Middle';

-- Figure 8 - Up the Middle
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997148792',
    strong_hand_vimeo_id = '997148792',
    off_hand_video_url = 'https://player.vimeo.com/video/997148748',
    off_hand_vimeo_id = '997148748'
WHERE drill_name = 'Figure 8 - Up the Middle';

-- Figure 8 - Ground Balls
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997149045',
    both_hands_vimeo_id = '997149045'
WHERE drill_name = 'Figure 8 Ground Balls' OR drill_name = 'Figure 8 - Ground Balls';

-- Jump Shot
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997150144',
    strong_hand_vimeo_id = '997150144',
    off_hand_video_url = 'https://player.vimeo.com/video/997150061',
    off_hand_vimeo_id = '997150061'
WHERE drill_name = 'Jump Shot';

-- Leaner
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997150361',
    strong_hand_vimeo_id = '997150361',
    off_hand_video_url = 'https://player.vimeo.com/video/997150236',
    off_hand_vimeo_id = '997150236'
WHERE drill_name = 'Leaner';

-- Lever Pass
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997150608',
    strong_hand_vimeo_id = '997150608',
    off_hand_video_url = 'https://player.vimeo.com/video/997150493',
    off_hand_vimeo_id = '997150493'
WHERE drill_name = 'Lever Pass';

-- Look Back Fake
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997150871',
    strong_hand_vimeo_id = '997150871',
    off_hand_video_url = 'https://player.vimeo.com/video/997150734',
    off_hand_vimeo_id = '997150734'
WHERE drill_name = 'Look Back Fake';

-- Matt Brown Shooting
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151121',
    strong_hand_vimeo_id = '997151121',
    off_hand_video_url = 'https://player.vimeo.com/video/997151008',
    off_hand_vimeo_id = '997151008'
WHERE drill_name = 'Matt Brown Shooting';

-- Near Fake - Far Fake - Finish Near
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151360',
    strong_hand_vimeo_id = '997151360',
    off_hand_video_url = 'https://player.vimeo.com/video/997151296',
    off_hand_vimeo_id = '997151296'
WHERE drill_name = 'Near Fake - Far Fake - Finish Near';

-- Near Side Fake
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151692',
    strong_hand_vimeo_id = '997151692',
    off_hand_video_url = 'https://player.vimeo.com/video/997151500',
    off_hand_vimeo_id = '997151500'
WHERE drill_name = 'Near Side Fake';

-- Off Stick Side Catch
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151947',
    strong_hand_vimeo_id = '997151947',
    off_hand_video_url = 'https://player.vimeo.com/video/997151891',
    off_hand_vimeo_id = '997151891'
WHERE drill_name = 'Off Stick Side Catch';

-- Overhand
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997153686',
    strong_hand_vimeo_id = '997153686',
    off_hand_video_url = 'https://player.vimeo.com/video/997151828',
    off_hand_vimeo_id = '997151828'
WHERE drill_name = 'Overhand';

-- Pop to Pass and Catch
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997152579',
    both_hands_vimeo_id = '997152579'
WHERE drill_name = 'Pop to Pass and Catch';

-- Question Mark (has 3 videos - Strong Hand, Off Hand, Both)
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997152959',
    strong_hand_vimeo_id = '997152959',
    off_hand_video_url = 'https://player.vimeo.com/video/997153032',
    off_hand_vimeo_id = '997153032',
    both_hands_video_url = 'https://player.vimeo.com/video/997152824',
    both_hands_vimeo_id = '997152824'
WHERE drill_name = 'Question Mark';

-- Quick Sticks
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997153630',
    strong_hand_vimeo_id = '997153630',
    off_hand_video_url = 'https://player.vimeo.com/video/997153513',
    off_hand_vimeo_id = '997153513'
WHERE drill_name = 'Quick Sticks';

-- Roll Dodge - Chin to Shoulder
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997150252',
    both_hands_vimeo_id = '997150252'
WHERE drill_name = 'Roll Dodge Chin to Shoulder' OR drill_name = 'Roll Dodge - Chin to Shoulder';

-- Short Hop
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997150674',
    strong_hand_vimeo_id = '997150674',
    off_hand_video_url = 'https://player.vimeo.com/video/997150561',
    off_hand_vimeo_id = '997150561'
WHERE drill_name = 'Short Hop';

-- Short Shot on the Run
UPDATE wall_ball_drill_library SET
    both_hands_video_url = 'https://player.vimeo.com/video/997150867',
    both_hands_vimeo_id = '997150867'
WHERE drill_name = 'Short Shot on the Run';

-- Shovel Pass to Over the Shoulder
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151416',
    strong_hand_vimeo_id = '997151416',
    off_hand_video_url = 'https://player.vimeo.com/video/997151230',
    off_hand_vimeo_id = '997151230'
WHERE drill_name = 'Shovel Pass to Over the Shoulder';

-- Side Arm
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997151944',
    strong_hand_vimeo_id = '997151944',
    off_hand_video_url = 'https://player.vimeo.com/video/997151620',
    off_hand_vimeo_id = '997151620'
WHERE drill_name = 'Side Arm';

-- Side Arm to One Handed Extended Catch
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997152331',
    strong_hand_vimeo_id = '997152331',
    off_hand_video_url = 'https://player.vimeo.com/video/997152086',
    off_hand_vimeo_id = '997152086'
WHERE drill_name = 'Side Arm to One Handed Extended Catch';

-- Split to Jump Shot (has 3 videos)
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997152904',
    strong_hand_vimeo_id = '997152904',
    off_hand_video_url = 'https://player.vimeo.com/video/997152686',
    off_hand_vimeo_id = '997152686',
    both_hands_video_url = 'https://player.vimeo.com/video/997152572',
    both_hands_vimeo_id = '997152572'
WHERE drill_name = 'Split to Jump Shot';

-- Step Back Throw Back (has 3 videos)
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997153635',
    strong_hand_vimeo_id = '997153635',
    off_hand_video_url = 'https://player.vimeo.com/video/997153515',
    off_hand_vimeo_id = '997153515',
    both_hands_video_url = 'https://player.vimeo.com/video/997153322',
    both_hands_vimeo_id = '997153322'
WHERE drill_name = 'Step Back Throw Back';

-- Top Hand Only
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997153985',
    strong_hand_vimeo_id = '997153985',
    off_hand_video_url = 'https://player.vimeo.com/video/997153886',
    off_hand_vimeo_id = '997153886'
WHERE drill_name = 'Top Hand Only';

-- Turned Left
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154167',
    strong_hand_vimeo_id = '997154167',
    off_hand_video_url = 'https://player.vimeo.com/video/997154080',
    off_hand_vimeo_id = '997154080'
WHERE drill_name = 'Turned Left';

-- Turned Right
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154308',
    strong_hand_vimeo_id = '997154308',
    off_hand_video_url = 'https://player.vimeo.com/video/997154231',
    off_hand_vimeo_id = '997154231'
WHERE drill_name = 'Turned Right';

-- Twister
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154514',
    strong_hand_vimeo_id = '997154514',
    off_hand_video_url = 'https://player.vimeo.com/video/997154428',
    off_hand_vimeo_id = '997154428'
WHERE drill_name = 'Twister';

-- Underhand Behind The Back
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154661',
    strong_hand_vimeo_id = '997154661',
    off_hand_video_url = 'https://player.vimeo.com/video/997154577',
    off_hand_vimeo_id = '997154577'
WHERE drill_name = 'Underhand Behind The Back';

-- Underhand Between the Legs
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154784',
    strong_hand_vimeo_id = '997154784',
    off_hand_video_url = 'https://player.vimeo.com/video/997154725',
    off_hand_vimeo_id = '997154725'
WHERE drill_name = 'Underhand Between the Legs';

-- Up the Hash
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997154935',
    strong_hand_vimeo_id = '997154935',
    off_hand_video_url = 'https://player.vimeo.com/video/997154854',
    off_hand_vimeo_id = '997154854'
WHERE drill_name = 'Up The Hash' OR drill_name = 'Up the Hash';

-- Walk the Dog Pass
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997155081',
    strong_hand_vimeo_id = '997155081',
    off_hand_video_url = 'https://player.vimeo.com/video/997147863',
    off_hand_vimeo_id = '997147863'
WHERE drill_name = 'Walk The Dog Pass' OR drill_name = 'Walk the Dog Pass';

-- Walk the Dog to Wrister
UPDATE wall_ball_drill_library SET
    strong_hand_video_url = 'https://player.vimeo.com/video/997155211',
    strong_hand_vimeo_id = '997155211',
    off_hand_video_url = 'https://player.vimeo.com/video/997155147',
    off_hand_vimeo_id = '997155147'
WHERE drill_name = 'Walk The Dog to Wrister' OR drill_name = 'Walk the Dog to Wrister';

-- ============================================
-- STEP 3: VERIFICATION QUERIES
-- ============================================

-- Check updated drill videos
SELECT 
    drill_name,
    CASE 
        WHEN strong_hand_vimeo_id IS NOT NULL THEN 'Strong Hand: ' || strong_hand_vimeo_id
        ELSE 'No Strong Hand'
    END as strong_hand,
    CASE 
        WHEN off_hand_vimeo_id IS NOT NULL THEN 'Off Hand: ' || off_hand_vimeo_id
        ELSE 'No Off Hand'
    END as off_hand,
    CASE 
        WHEN both_hands_vimeo_id IS NOT NULL THEN 'Both Hands: ' || both_hands_vimeo_id
        ELSE 'No Both Hands'
    END as both_hands
FROM wall_ball_drill_library
WHERE strong_hand_vimeo_id IS NOT NULL 
   OR off_hand_vimeo_id IS NOT NULL 
   OR both_hands_vimeo_id IS NOT NULL
ORDER BY drill_name;

-- Check drills without videos
SELECT drill_name, drill_slug
FROM wall_ball_drill_library  
WHERE strong_hand_vimeo_id IS NULL 
  AND off_hand_vimeo_id IS NULL 
  AND both_hands_vimeo_id IS NULL
ORDER BY drill_name;

-- ============================================
-- STEP 4: FINAL VERIFICATION
-- ============================================

-- Count drills with videos vs without
SELECT 
    'Drills with videos' as status,
    COUNT(*) as count
FROM wall_ball_drill_library
WHERE strong_hand_vimeo_id IS NOT NULL 
   OR off_hand_vimeo_id IS NOT NULL 
   OR both_hands_vimeo_id IS NOT NULL

UNION ALL

SELECT 
    'Drills without videos' as status,
    COUNT(*) as count
FROM wall_ball_drill_library
WHERE strong_hand_vimeo_id IS NULL 
  AND off_hand_vimeo_id IS NULL 
  AND both_hands_vimeo_id IS NULL;
