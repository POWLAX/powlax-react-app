-- =====================================================
-- POWLAX Badge Data Cleanup and Image Mapping SQL
-- =====================================================
-- This script:
-- 1. Adds badge_type column for classification
-- 2. Removes duplicates
-- 3. Cleans titles (removes prefixes like A1, D2, etc.)
-- 4. Maps WordPress image URLs to badges
-- =====================================================

-- Step 1: Add badge_type column if it doesn't exist
ALTER TABLE badges_powlax 
ADD COLUMN IF NOT EXISTS badge_type VARCHAR(20);

-- Step 2: Create temporary table with clean data and remove duplicates
CREATE TEMP TABLE clean_badges AS
WITH ranked_badges AS (
  SELECT 
    *,
    -- Extract badge prefix (A1, D2, M3, WB1, SS, IQ, etc.)
    CASE 
      WHEN title ~ '^A\d+' THEN 'Attack'
      WHEN title ~ '^D\d+' THEN 'Defense'
      WHEN title ~ '^M\d+' OR title ~ '^Mid' THEN 'Midfield'
      WHEN title ~ '^WB\d+' THEN 'Wall Ball'
      WHEN title ~ '^SS' THEN 'Solid Start'
      WHEN title ~ '^IQ' THEN 'Lacrosse IQ'
      WHEN title ~ '^Both' THEN 'Solid Start'
      ELSE category  -- Fallback to category
    END as derived_badge_type,
    -- Clean title: remove prefix and dash
    CASE 
      WHEN title ~ '^\w+\d*\s*-\s*' THEN 
        TRIM(regexp_replace(title, '^\w+\d*\s*-\s*', ''))
      ELSE title
    END as clean_title,
    -- Rank for duplicate detection (prefer records with more complete data)
    ROW_NUMBER() OVER (
      PARTITION BY 
        LOWER(TRIM(regexp_replace(title, '^\w+\d*\s*-\s*', ''))),  -- Group by clean title
        category
      ORDER BY 
        CASE WHEN icon_url IS NOT NULL THEN 0 ELSE 1 END,  -- Prefer records with icons
        LENGTH(COALESCE(description, '')),  -- Prefer longer descriptions
        id  -- Tiebreaker
    ) as rn
  FROM badges_powlax
)
SELECT * FROM ranked_badges WHERE rn = 1;

-- Step 3: Delete all existing records and insert clean data
DELETE FROM badges_powlax;

-- Step 4: Insert cleaned data back
INSERT INTO badges_powlax (
  id,
  original_id,
  title,
  description,
  icon_url,
  category,
  sub_category,
  earned_by_type,
  points_type_required,
  points_required,
  quest_id,
  maximum_earnings,
  is_hidden,
  sort_order,
  metadata,
  badge_type,
  created_at,
  updated_at
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY derived_badge_type, clean_title) as id,
  original_id,
  clean_title as title,
  description,
  icon_url,
  category,
  sub_category,
  earned_by_type,
  points_type_required,
  points_required,
  quest_id,
  maximum_earnings,
  is_hidden,
  ROW_NUMBER() OVER (PARTITION BY derived_badge_type ORDER BY clean_title) - 1 as sort_order,
  metadata,
  derived_badge_type as badge_type,
  created_at,
  NOW() as updated_at
FROM clean_badges;

-- Step 5: Map WordPress image URLs based on badge names
-- Attack Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png' 
WHERE LOWER(title) LIKE '%crease crawler%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png' 
WHERE LOWER(title) LIKE '%wing wizard%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png' 
WHERE LOWER(title) LIKE '%ankle breaker%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png' 
WHERE LOWER(title) LIKE '%seasoned sniper%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png' 
WHERE LOWER(title) LIKE '%time and room terror%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A6-On-the-run-rocketeer.png' 
WHERE LOWER(title) LIKE '%on the run rocketeer%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A7-Island-Isolator.png' 
WHERE LOWER(title) LIKE '%island isolator%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A8-Goalies-Nightmare.png' 
WHERE LOWER(title) LIKE '%goalies nightmare%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A9-Rough-Rider.png' 
WHERE LOWER(title) LIKE '%rough rider%' AND badge_type = 'Attack';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/A10-Fast-Break-Finisher.png' 
WHERE LOWER(title) LIKE '%fast break finisher%' AND badge_type = 'Attack';

-- Defense Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png' 
WHERE LOWER(title) LIKE '%hip hitter%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png' 
WHERE LOWER(title) LIKE '%footwork fortress%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png' 
WHERE LOWER(title) LIKE '%slide master%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D4-Close-Quarters-Crusher.png' 
WHERE LOWER(title) LIKE '%close quarters crusher%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D5-Ground-Ball-Gladiator.png' 
WHERE LOWER(title) LIKE '%ground ball gladiator%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D6-Consistent-Clear.png' 
WHERE LOWER(title) LIKE '%consistent clear%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D7-Turnover-Titan.png' 
WHERE LOWER(title) LIKE '%turnover titan%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D8-The-Great-Wall.png' 
WHERE LOWER(title) LIKE '%great wall%' AND badge_type = 'Defense';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/D9-Silky-Smooth.png' 
WHERE LOWER(title) LIKE '%silky smooth%' AND badge_type = 'Defense';

-- Midfield Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png' 
WHERE LOWER(title) LIKE '%ground ball guru%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/Mid-2-2-Way-Tornado.png' 
WHERE LOWER(title) LIKE '%2 way tornado%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M3-Wing-Man-Warrior.png' 
WHERE LOWER(title) LIKE '%wing man warrior%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M4-Dodging-Dynaomo.png' 
WHERE LOWER(title) LIKE '%dodging%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M5-Fast-Break-Finisher.png' 
WHERE LOWER(title) LIKE '%fast break starter%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M6-Shooting-Sharp-Shooter.png' 
WHERE LOWER(title) LIKE '%shooting sharp shooter%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M7-Clearing-Commander.png' 
WHERE LOWER(title) LIKE '%clearing commander%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M8-Middie-Machine.png' 
WHERE LOWER(title) LIKE '%middie machine%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/M-9-Determined-D-Mid.png' 
WHERE LOWER(title) LIKE '%determined d%' AND badge_type = 'Midfield';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/m10-Inside-Man.png' 
WHERE LOWER(title) LIKE '%inside man%' AND badge_type = 'Midfield';

-- Wall Ball Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png' 
WHERE LOWER(title) LIKE '%foundation ace%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB2-Dominant-Dodger.png' 
WHERE LOWER(title) LIKE '%dominant dodger%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB3-Stamina-Star.png' 
WHERE LOWER(title) LIKE '%stamina star%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB4-Finishing-Phenom.png' 
WHERE LOWER(title) LIKE '%finishing phenom%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB5-Bullet-Snatcher.png' 
WHERE LOWER(title) LIKE '%bullet snatcher%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB6-Long-Pole-Lizard.png' 
WHERE LOWER(title) LIKE '%long pole lizard%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB7-Ball-Hawk.png' 
WHERE LOWER(title) LIKE '%ball hawk%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png' 
WHERE LOWER(title) LIKE '%wall ball wizard%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB8-Fully-Fancy-Freddie.png' 
WHERE LOWER(title) LIKE '%fully fancy freddie%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/WB9-Independent-Improver.png' 
WHERE LOWER(title) LIKE '%independent improver%' AND badge_type = 'Wall Ball';

-- Additional Wall Ball Award Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/1-Brick-Slayer-Wall-Ball-Award.png' 
WHERE LOWER(title) LIKE '%brick slayer%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/2-Precision-Pinger.png' 
WHERE LOWER(title) LIKE '%precision pinger%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/3-The-Wall-Wizard-Wall-Ball-Award.png' 
WHERE LOWER(title) LIKE '%wall wizard%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/4-Concrete-Commander-Wall-Ball-Award.png' 
WHERE LOWER(title) LIKE '%concrete commander%' AND badge_type = 'Wall Ball';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/5-Brick-Whisperer-Wall-Ball-Award-2.png' 
WHERE LOWER(title) LIKE '%brick whisperer%' AND badge_type = 'Wall Ball';

-- Solid Start Badges (SS prefix)
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/SS-Solid-Starter.png' 
WHERE LOWER(title) LIKE '%solid starter%' AND badge_type = 'Solid Start';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/SS-Ball-Mover.png' 
WHERE LOWER(title) LIKE '%ball mover%' AND badge_type = 'Solid Start';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/SS-Dual-Threat.png' 
WHERE LOWER(title) LIKE '%dual threat%' AND badge_type = 'Solid Start';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/SS-Sure-Hands.png' 
WHERE LOWER(title) LIKE '%sure hands%' AND badge_type = 'Solid Start';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/SS-Great-Deceiver.png' 
WHERE LOWER(title) LIKE '%great deceiver%' AND badge_type = 'Solid Start';

-- Lacrosse IQ Badges
UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Offense.png' 
WHERE LOWER(title) LIKE '%offense%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Settled-Defense.png' 
WHERE LOWER(title) LIKE '%settled defense%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Offensive-Transition.png' 
WHERE LOWER(title) LIKE '%offensive transition%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Transition-Defense.png' 
WHERE LOWER(title) LIKE '%transition defense%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Man-Up.png' 
WHERE LOWER(title) LIKE '%man up%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Man-Down.png' 
WHERE LOWER(title) LIKE '%man down%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Riding-Trap.png' 
WHERE LOWER(title) LIKE '%riding trap%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Clearing.png' 
WHERE LOWER(title) LIKE '%clearing%' AND badge_type = 'Lacrosse IQ';

UPDATE badges_powlax SET icon_url = 'https://powlax.com/wp-content/uploads/2024/10/IQ-Face-Off.png' 
WHERE LOWER(title) LIKE '%face off%' AND badge_type = 'Lacrosse IQ';

-- Step 6: Report results
SELECT 
  badge_type,
  COUNT(*) as badge_count,
  COUNT(DISTINCT title) as unique_titles,
  COUNT(icon_url) as badges_with_icons
FROM badges_powlax
GROUP BY badge_type
ORDER BY badge_type;

-- Show sample of cleaned data
SELECT 
  badge_type,
  title,
  category,
  CASE WHEN icon_url IS NOT NULL THEN '✅ Has Icon' ELSE '❌ No Icon' END as icon_status,
  LEFT(icon_url, 50) || '...' as icon_preview
FROM badges_powlax
ORDER BY badge_type, title
LIMIT 20;