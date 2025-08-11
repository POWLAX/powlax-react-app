-- ============================================
-- WALL BALL REMAINING DRILLS UPLOAD (FINAL)
-- ============================================
-- Uploads 33 truly missing drills + handles 4 similar matches
-- Excludes 8 exact matches already in database
-- Generated: 2025-01-10
-- ============================================

-- ============================================
-- STEP 1: UPDATE EXISTING DRILLS WITH CSV DATA
-- ============================================

-- Update "Behind the Back" with CSV video data and metadata
UPDATE wall_ball_drill_library 
SET 
    difficulty_level = 2,
    description = 'Behind The Back wall ball drill (Difficulty: 2)',
    skill_focus = ARRAY['Master Fundamentals', 'Faking and Inside Finishing', 'Catch Everything', 'Advanced - Fun and Challenging'],
    drill_type = 'Wall Ball',
    equipment_needed = ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick']
WHERE drill_name = 'Behind the Back';

-- ============================================
-- STEP 2: INSERT TRULY MISSING DRILLS (33 drills)
-- ============================================

INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    strong_hand_video_url,
    strong_hand_vimeo_id,
    off_hand_video_url,
    off_hand_vimeo_id,
    both_hands_video_url,
    both_hands_vimeo_id,
    difficulty_level,
    description,
    skill_focus,
    drill_type,
    equipment_needed,
    is_active
) VALUES
    -- Row 30: Far Side Fake
    (
        'Far Side Fake',
        'far-side-fake',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Far Side Fake wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Faking and Inside Finishing'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 33: Leaner  
    (
        'Leaner',
        'leaner',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        'Leaner wall ball drill (Difficulty: 2)',
        ARRAY['Faking and Inside Finishing', 'Shooting', 'Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 34: Matt Brown Shooting
    (
        'Matt Brown Shooting',
        'matt-brown-shooting',
        'https://vimeo.com/997151121',
        '997151121',
        'https://vimeo.com/997151008',
        '997151008',
        NULL,
        NULL,
        1,
        'Matt Brown Shooting wall ball drill (Difficulty: 1)',
        ARRAY['Shooting', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 37: Short Shot on the Run
    (
        'Short Shot on the Run',
        'short-shot-on-the-run',
        NULL,
        NULL,
        NULL,
        NULL,
        'https://vimeo.com/997150867',
        '997150867',
        2,
        'Short Shot on the Run wall ball drill (Difficulty: 2)',
        ARRAY['Dodging', 'Shooting'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 38: Up The Hash
    (
        'Up The Hash',
        'up-the-hash',
        'https://vimeo.com/997154935',
        '997154935',
        'https://vimeo.com/997154854',
        '997154854',
        NULL,
        NULL,
        2,
        'Up The Hash wall ball drill (Difficulty: 2)',
        ARRAY['Dodging', 'Shooting'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 40: Shovel Pass to Over The Shoulder
    (
        'Shovel Pass to Over The Shoulder',
        'shovel-pass-to-over-the-shoulder',
        'https://vimeo.com/997151416',
        '997151416',
        'https://vimeo.com/997151230',
        '997151230',
        NULL,
        NULL,
        2,
        'Shovel Pass to Over The Shoulder wall ball drill (Difficulty: 2)',
        ARRAY['Defensive Emphasis', 'Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 42: Short Hop
    (
        'Short Hop',
        'short-hop',
        'https://vimeo.com/997150674',
        '997150674',
        'https://vimeo.com/997150561',
        '997150561',
        NULL,
        NULL,
        2,
        'Short Hop wall ball drill (Difficulty: 2)',
        ARRAY['Defensive Emphasis', 'Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 36: 80 % Side Arm
    (
        '80 % Side Arm',
        '80-side-arm',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        '80 % Side Arm wall ball drill (Difficulty: 2)',
        ARRAY['Shooting', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 41: Ankle Biters
    (
        'Ankle Biters',
        'ankle-biters',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        'Ankle Biters wall ball drill (Difficulty: 2)',
        ARRAY['Defensive Emphasis', 'Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 7: Bottom Hand Only
    (
        'Bottom Hand Only',
        'bottom-hand-only',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Bottom Hand Only wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Conditioning', 'Shooting', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 25: Canadian Cross Hand
    (
        'Canadian Cross Hand',
        'canadian-cross-hand',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Canadian Cross Hand wall ball drill (Difficulty: 1)',
        ARRAY['Faking and Inside Finishing', 'Shooting', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 17: Catch and Hitch
    (
        'Catch and Hitch',
        'catch-and-hitch',
        NULL,
        NULL,
        NULL,
        NULL,
        'https://vimeo.com/997147689',
        '997147689',
        1,
        'Catch and Hitch wall ball drill (Difficulty: 1)',
        ARRAY['Dodging', 'Conditioning', 'Shooting'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 10: Face Dodge Shovel Pass
    (
        'Face Dodge Shovel Pass',
        'face-dodge-shovel-pass',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        'Face Dodge Shovel Pass wall ball drill (Difficulty: 2)',
        ARRAY['Master Fundamentals', 'Dodging', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 31: Far Near Far Finish
    (
        'Far Near Far Finish',
        'far-near-far-finish',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Far Near Far Finish wall ball drill (Difficulty: 1)',
        ARRAY['Faking and Inside Finishing'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 22: Figure 8 - Down The Middle
    (
        'Figure 8 - Down The Middle',
        'figure-8-down-the-middle',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Figure 8 - Down The Middle wall ball drill (Difficulty: 1)',
        ARRAY['Conditioning', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 23: Figure 8 - Up The Middle
    (
        'Figure 8 - Up The Middle',
        'figure-8-up-the-middle',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Figure 8 - Up The Middle wall ball drill (Difficulty: 1)',
        ARRAY['Conditioning', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 12: Figure 8 Ground Balls
    (
        'Figure 8 Ground Balls',
        'figure-8-ground-balls',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Figure 8 Ground Balls wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Conditioning', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 39: Jump Shot
    (
        'Jump Shot',
        'jump-shot',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        'Jump Shot wall ball drill (Difficulty: 2)',
        ARRAY['Dodging', 'Shooting'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 18: Lever Pass
    (
        'Lever Pass',
        'lever-pass',
        'https://vimeo.com/997150608',
        '997150608',
        NULL,
        NULL,
        NULL,
        NULL,
        1,
        'Lever Pass wall ball drill (Difficulty: 1)',
        ARRAY['Dodging', 'Faking and Inside Finishing', 'Defensive Emphasis', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 32: Look Back Fake
    (
        'Look Back Fake',
        'look-back-fake',
        'https://vimeo.com/997150871',
        '997150871',
        'https://vimeo.com/997150734',
        '997150734',
        NULL,
        NULL,
        1,
        'Look Back Fake wall ball drill (Difficulty: 1)',
        ARRAY['Dodging', 'Faking and Inside Finishing', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 29: Near Far Finish
    (
        'Near Far Finish',
        'near-far-finish',
        'https://vimeo.com/997151360',
        '997151360',
        'https://vimeo.com/997151296',
        '997151296',
        NULL,
        NULL,
        1,
        'Near Far Finish wall ball drill (Difficulty: 1)',
        ARRAY['Faking and Inside Finishing'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 8: Off Stick Side Catch
    (
        'Off Stick Side Catch',
        'off-stick-side-catch',
        'https://vimeo.com/997151947',
        '997151947',
        'https://vimeo.com/997151891',
        '997151891',
        NULL,
        NULL,
        1,
        'Off Stick Side Catch wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Faking and Inside Finishing', 'Shooting', 'Defensive Emphasis', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 14: Pop to Pass and Catch
    (
        'Pop to Pass and Catch',
        'pop-to-pass-and-catch',
        NULL,
        NULL,
        NULL,
        NULL,
        'https://vimeo.com/997152579',
        '997152579',
        1,
        'Pop to Pass and Catch wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Dodging', 'Conditioning', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 15: Question Mark
    (
        'Question Mark',
        'question-mark',
        'https://vimeo.com/997153218',
        '997153218',
        'https://vimeo.com/997153032',
        '997153032',
        'https://vimeo.com/997152824',
        '997152824',
        1,
        'Question Mark wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Dodging', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 21: Roll Dodge Chin to Shoulder
    (
        'Roll Dodge Chin to Shoulder',
        'roll-dodge-chin-to-shoulder',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        'Roll Dodge Chin to Shoulder wall ball drill (Difficulty: 2)',
        ARRAY['Dodging', 'Conditioning'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 9: Side Arm
    (
        'Side Arm',
        'side-arm',
        'https://vimeo.com/997151690',
        '997151690',
        'https://vimeo.com/997151493',
        '997151493',
        NULL,
        NULL,
        1,
        'Side Arm wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Shooting', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 24: Split to Jump Shot
    (
        'Split to Jump Shot',
        'split-to-jump-shot',
        'https://vimeo.com/997152904',
        '997152904',
        'https://vimeo.com/997152973',
        '997152973',
        'https://vimeo.com/997152572',
        '997152572',
        2,
        'Split to Jump Shot wall ball drill (Difficulty: 2)',
        ARRAY['Dodging', 'Conditioning', 'Shooting'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 16: Step Back Throw Back
    (
        'Step Back Throw Back',
        'step-back-throw-back',
        'https://vimeo.com/997153635',
        '997153635',
        'https://vimeo.com/997153515',
        '997153515',
        'https://vimeo.com/997153322',
        '997153322',
        1,
        'Step Back Throw Back wall ball drill (Difficulty: 1)',
        ARRAY['Dodging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 11: Three Steps Up and Back
    (
        'Three Steps Up and Back',
        'three-steps-up-and-back',
        NULL,
        NULL,
        'https://vimeo.com/997153712',
        '997153712',
        NULL,
        NULL,
        2,
        'Three Steps Up and Back wall ball drill (Difficulty: 2)',
        ARRAY['Master Fundamentals', 'Conditioning', 'Defensive Emphasis'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 6: Top Hand Only
    (
        'Top Hand Only',
        'top-hand-only',
        'https://vimeo.com/997153985',
        '997153985',
        'https://vimeo.com/997153886',
        '997153886',
        NULL,
        NULL,
        1,
        'Top Hand Only wall ball drill (Difficulty: 1)',
        ARRAY['Master Fundamentals', 'Conditioning', 'Shooting', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 45: Underhand Between The Legs
    (
        'Underhand Between The Legs',
        'underhand-between-the-legs',
        'https://vimeo.com/997154784',
        '997154784',
        'https://vimeo.com/997154725',
        '997154725',
        NULL,
        NULL,
        3,
        'Underhand Between The Legs wall ball drill (Difficulty: 3)',
        ARRAY['Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 20: Walk The Dog Pass
    (
        'Walk The Dog Pass',
        'walk-the-dog-pass',
        'https://vimeo.com/997155081',
        '997155081',
        'https://vimeo.com/997155010',
        '997155010',
        NULL,
        NULL,
        3,
        'Walk The Dog Pass wall ball drill (Difficulty: 3)',
        ARRAY['Dodging', 'Conditioning', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Row 19: Walk The Dog to Wrister
    (
        'Walk The Dog to Wrister',
        'walk-the-dog-to-wrister',
        'https://vimeo.com/997155211',
        '997155211',
        'https://vimeo.com/997155147',
        '997155147',
        NULL,
        NULL,
        3,
        'Walk The Dog to Wrister wall ball drill (Difficulty: 3)',
        ARRAY['Dodging', 'Conditioning', 'Shooting', 'Defensive Emphasis', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    );

-- ============================================
-- STEP 3: INSERT SIMILAR MATCHES AS DISTINCT DRILLS
-- ============================================

-- These are similar to existing drills but are distinct techniques
INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    strong_hand_video_url,
    strong_hand_vimeo_id,
    off_hand_video_url,
    off_hand_vimeo_id,
    both_hands_video_url,
    both_hands_vimeo_id,
    difficulty_level,
    description,
    skill_focus,
    drill_type,
    equipment_needed,
    is_active
) VALUES
    -- 80% Over Hand (distinct from regular Overhand)
    (
        '80 % Over Hand',
        '80-percent-over-hand',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        2,
        '80 % Over Hand wall ball drill - shooting at 80% power (Difficulty: 2)',
        ARRAY['Shooting', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Criss Cross Quick Sticks (distinct from regular Quick Sticks)
    (
        'Criss Cross Quick Sticks',
        'criss-cross-quick-sticks',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        3,
        'Criss Cross Quick Sticks wall ball drill - advanced quick stick pattern (Difficulty: 3)',
        ARRAY['Faking and Inside Finishing', 'Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Side Arm to One Handed Extended Catch (distinct from One Handed)
    (
        'Side Arm to One Handed Extended Catch',
        'side-arm-to-one-handed-extended-catch',
        'https://vimeo.com/997152331',
        '997152331',
        'https://vimeo.com/997152086',
        '997152086',
        NULL,
        NULL,
        2,
        'Side Arm to One Handed Extended Catch wall ball drill - combination technique (Difficulty: 2)',
        ARRAY['Catch Everything', 'Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    ),
    -- Underhand Behind The Back (distinct from Behind the Back)
    (
        'Underhand Behind The Back',
        'underhand-behind-the-back',
        'https://vimeo.com/997154661',
        '997154661',
        'https://vimeo.com/997154577',
        '997154577',
        NULL,
        NULL,
        3,
        'Underhand Behind The Back wall ball drill - underhand variation (Difficulty: 3)',
        ARRAY['Advanced - Fun and Challenging'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    );

-- ============================================
-- STEP 4: HANDLE SPECIAL CASES
-- ============================================

-- Handle the duplicate "Around The World" entries in CSV
INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    difficulty_level,
    description,
    skill_focus,
    drill_type,
    equipment_needed,
    is_active
) VALUES
    (
        'Around The World',
        'around-the-world',
        2,
        'Around The World wall ball drill (Difficulty: 2)',
        ARRAY['Faking and Inside Finishing', 'Catch Everything'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    );

-- Handle "3 Step Up and Backs" (appears to be different from "Three Steps Up and Back")
INSERT INTO wall_ball_drill_library (
    drill_name,
    drill_slug,
    difficulty_level,
    description,
    skill_focus,
    drill_type,
    equipment_needed,
    is_active
) VALUES
    (
        '3 Step Up and Backs',
        '3-step-up-and-backs',
        2,
        '3 Step Up and Backs wall ball drill - specific 3-step pattern (Difficulty: 2)',
        ARRAY['Wall Ball'],
        'Wall Ball',
        ARRAY['Wall', 'Lacrosse Ball', 'Lacrosse Stick'],
        true
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total drills after insert
SELECT COUNT(*) as total_drills FROM wall_ball_drill_library;

-- Show all drills by difficulty
SELECT 
    difficulty_level,
    COUNT(*) as drill_count,
    array_agg(drill_name ORDER BY drill_name) as drill_names
FROM wall_ball_drill_library
GROUP BY difficulty_level
ORDER BY difficulty_level;

-- Check for any duplicate names
SELECT drill_name, COUNT(*) as count
FROM wall_ball_drill_library
GROUP BY drill_name
HAVING COUNT(*) > 1;

-- Check for any duplicate slugs
SELECT drill_slug, COUNT(*) as count
FROM wall_ball_drill_library
GROUP BY drill_slug
HAVING COUNT(*) > 1;

-- Show drills with videos
SELECT 
    drill_name,
    CASE WHEN strong_hand_vimeo_id IS NOT NULL THEN '✓' ELSE '✗' END as strong_hand,
    CASE WHEN off_hand_vimeo_id IS NOT NULL THEN '✓' ELSE '✗' END as off_hand,
    CASE WHEN both_hands_vimeo_id IS NOT NULL THEN '✓' ELSE '✗' END as both_hands,
    difficulty_level
FROM wall_ball_drill_library
ORDER BY difficulty_level, drill_name;
