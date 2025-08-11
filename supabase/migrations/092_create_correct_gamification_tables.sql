-- =====================================================
-- POWLAX Gamification Tables - CORRECT Version
-- Created: 2025-01-16
-- Purpose: Create the correct gamification tables with actual POWLAX data
-- Based on: WordPress CSV exports and populate-player-ranks-correct.ts
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE BADGES_POWLAX TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS badges_powlax (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(100),
  badge_type VARCHAR(50), -- Attack, Defense, Midfield, Wall Ball, Solid Start, Lacrosse IQ
  points_required INTEGER DEFAULT 0,
  wordpress_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for badges
CREATE INDEX IF NOT EXISTS idx_badges_powlax_type ON badges_powlax(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_powlax_category ON badges_powlax(category);

-- =====================================================
-- 2. CREATE POWLAX_PLAYER_RANKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS powlax_player_ranks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  rank_order INTEGER NOT NULL,
  lax_credits_required INTEGER DEFAULT 0,
  gender VARCHAR(20) DEFAULT 'neutral',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ranks
CREATE INDEX IF NOT EXISTS idx_player_ranks_order ON powlax_player_ranks(rank_order);
CREATE INDEX IF NOT EXISTS idx_player_ranks_credits ON powlax_player_ranks(lax_credits_required);

-- =====================================================
-- 3. POPULATE PLAYER RANKS (From populate-player-ranks-correct.ts)
-- =====================================================

INSERT INTO powlax_player_ranks (title, lax_credits_required, rank_order, icon_url, description, gender) VALUES
('Lacrosse Bot', 0, 1, 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.11-A-cartoonish-3D-animated-lacrosse-player-with-a-robotic-appearance-showcasing-a-confused-expression.-The-character-is-depicted-mechanically-moving-th.webp', 
 'Everyone starts out as a "Lacrosse Bot" lacks game awareness and skill, often making basic mistakes and following others without understanding why.', 'neutral'),
 
('2nd Bar Syndrome', 25, 2, 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.27.45-A-3D-animated-cartoonish-lacrosse-player-with-oversized-helmet-bars-that-obscure-his-vision-like-peering-through-a-mail-slot.-This-character-is-awkw.webp',
 'Ever feel like you''re just not seeing the big picture? That''s our friend with the 2nd Bar Syndrome, constantly navigating the field as if he''s peering through a mail slot.', 'neutral'),

('Left Bench Hero', 60, 3, 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.12-A-high-resolution-3D-animated-image-of-a-cheerful-lacrosse-player-sitting-on-the-sideline-fully-equipped-intensely-observing-the-game.-The-player-d.webp',
 'He made the team, but that''s just the start. Our Left Bench hero might not play much, but he''s got the best seat in the house to learn.', 'neutral'),

('Celly King', 100, 4, 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-03-12.30.10-Animated-scene-of-a-lacrosse-player-on-the-bench-leading-celebrations-with-dynamic-exaggerated-motions-like-dances-and-fist-pumps.-The-character-is-.webp',
 'The hype-man of the bench. He might not score the goals, but he leads the league in celebrations.', 'neutral'),

('D-Mid Rising', 140, 5, 'https://powlax.com/wp-content/uploads/2024/10/DALL·E-2024-10-05-22.10.09-A-cartoonish-3D-animated-image-of-a-lacrosse-defensive-midfielder-known-as-D-Mid-Rising-viewed-from-the-front.-The-top-of-the-helmet-slightly-cover.webp',
 'Emerging from the sidelines to the heart of the action, you''re honing your transition skills and sharpening defensive instincts.', 'neutral'),

('Lacrosse Utility', 200, 6, 'https://powlax.com/wp-content/uploads/2024/10/Lacrosse-Utility.png',
 'Versatile level. Like a Swiss Army knife, your ability to adapt and fill various roles makes you invaluable.', 'neutral'),

('Flow Bro', 300, 7, 'https://powlax.com/wp-content/uploads/2024/10/Flow-Bro.png',
 'Stylist level. Not only do you play with flair, but your iconic style sets you apart on and off the field.', 'neutral'),

('Lax Beast', 450, 8, 'https://powlax.com/wp-content/uploads/2024/10/Lax-Beast.png',
 'The Lax Beast is a fearsome competitor on the lacrosse field, combining raw intensity with unmatched skill.', 'neutral'),

('Lax Ninja', 600, 9, 'https://powlax.com/wp-content/uploads/2024/10/Lax-Ninja.png',
 'The Lax Ninja moves with stealth and precision, blending agility, focus, and technique.', 'neutral'),

('Lax God', 1000, 10, 'https://powlax.com/wp-content/uploads/2024/10/Lax-God-2.png',
 'The Lax God reigns supreme over the lacrosse universe, with unmatched power and prowess.', 'neutral')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. POPULATE BADGES (Based on CSV exports)
-- Note: These are the actual badge names from your WordPress exports
-- The icon URLs will need to be mapped later using the map-badge-images.ts script
-- =====================================================

-- Attack Badges (from Attack-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('Crease Crawler Badge', 'Attack', 'Attack', 'Awarded for completing drills focused on finishing around the crease with finesse.', 1),
('Wing Wizard Badge', 'Attack', 'Attack', 'Mastery of wing play and cutting techniques.', 2),
('Ankle Breaker Badge', 'Attack', 'Attack', 'Devastating dodges that leave defenders behind.', 3),
('Shot Doctor Badge', 'Attack', 'Attack', 'Precision shooting from any angle.', 4),
('Feed Machine Badge', 'Attack', 'Attack', 'Elite passing and feeding skills.', 5)
ON CONFLICT DO NOTHING;

-- Defense Badges (from Defense-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('Hip Hitter Badge', 'Defense', 'Defense', 'Master of defensive positioning and body checks.', 1),
('Footwork Fortress Badge', 'Defense', 'Defense', 'Impeccable defensive footwork.', 2),
('Slide Master Badge', 'Defense', 'Defense', 'Expert at defensive slides and rotations.', 3),
('Takeaway Artist Badge', 'Defense', 'Defense', 'Specialist in causing turnovers.', 4),
('Crease Defender Badge', 'Defense', 'Defense', 'Lockdown defender in the crease.', 5)
ON CONFLICT DO NOTHING;

-- Midfield Badges (from Midfield-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('Ground Ball Guru Badge', 'Midfield', 'Midfield', 'Dominates ground ball battles.', 1),
('Transition Terror Badge', 'Midfield', 'Midfield', 'Lightning fast in transition.', 2),
('Two-Way Player Badge', 'Midfield', 'Midfield', 'Excellence on both ends of the field.', 3),
('Face-Off Specialist Badge', 'Midfield', 'Midfield', 'Master of the face-off X.', 4),
('LSM Legend Badge', 'Midfield', 'Midfield', 'Elite long-stick midfielder.', 5)
ON CONFLICT DO NOTHING;

-- Wall Ball Badges (from Wall-Ball-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('Foundation Ace Badge', 'Wall Ball', 'Wall Ball', 'Master of wall ball fundamentals.', 1),
('Quick Stick King Badge', 'Wall Ball', 'Wall Ball', 'Lightning fast stick skills.', 2),
('BTB Boss Badge', 'Wall Ball', 'Wall Ball', 'Behind the back specialist.', 3),
('One-Hand Wonder Badge', 'Wall Ball', 'Wall Ball', 'One-handed catching and throwing expert.', 4),
('Split Dodge Master Badge', 'Wall Ball', 'Wall Ball', 'Perfect split dodge execution.', 5),
('Roll Dodge Expert Badge', 'Wall Ball', 'Wall Ball', 'Smooth roll dodge specialist.', 6),
('Cross-Hand Champion Badge', 'Wall Ball', 'Wall Ball', 'Expert at cross-handed play.', 7),
('Wall Ball Wizard Badge', 'Wall Ball', 'Wall Ball', 'Complete wall ball mastery.', 8)
ON CONFLICT DO NOTHING;

-- Solid Start Badges (from Solid-Start-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('First Timer Badge', 'Solid Start', 'Foundation', 'Completed first workout.', 1),
('Consistency Builder Badge', 'Solid Start', 'Foundation', '3 workouts completed.', 2),
('Habit Former Badge', 'Solid Start', 'Foundation', '7 day streak achieved.', 3),
('Dedicated Player Badge', 'Solid Start', 'Foundation', '14 day streak achieved.', 4),
('Rising Star Badge', 'Solid Start', 'Foundation', '30 workouts completed.', 5)
ON CONFLICT DO NOTHING;

-- Lacrosse IQ Badges (from Lacrosse-IQ-Badges-Export CSV)
INSERT INTO badges_powlax (title, badge_type, category, description, sort_order) VALUES
('Film Student Badge', 'Lacrosse IQ', 'Knowledge', 'Studied game film and tactics.', 1),
('Strategy Scholar Badge', 'Lacrosse IQ', 'Knowledge', 'Master of lacrosse strategy.', 2),
('Play Caller Badge', 'Lacrosse IQ', 'Knowledge', 'Can read and call plays.', 3),
('Coach Assistant Badge', 'Lacrosse IQ', 'Knowledge', 'Helps teach younger players.', 4),
('Lacrosse Professor Badge', 'Lacrosse IQ', 'Knowledge', 'Complete understanding of the game.', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Enable RLS
ALTER TABLE badges_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE powlax_player_ranks ENABLE ROW LEVEL SECURITY;

-- Create read policies for authenticated users
DROP POLICY IF EXISTS "Anyone can view badges" ON badges_powlax;
CREATE POLICY "Anyone can view badges" ON badges_powlax
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view ranks" ON powlax_player_ranks;
CREATE POLICY "Anyone can view ranks" ON powlax_player_ranks
  FOR SELECT TO authenticated USING (true);

-- Create anon read policies for public access
DROP POLICY IF EXISTS "Public can view badges" ON badges_powlax;
CREATE POLICY "Public can view badges" ON badges_powlax
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public can view ranks" ON powlax_player_ranks;
CREATE POLICY "Public can view ranks" ON powlax_player_ranks
  FOR SELECT TO anon USING (true);

COMMIT;

-- =====================================================
-- NEXT STEPS AFTER RUNNING THIS MIGRATION:
-- =====================================================
-- 1. Run this SQL in Supabase Dashboard
-- 2. Then run: npx tsx scripts/map-badge-images.ts
--    This will map the WordPress image URLs to the badges
-- 3. Verify at: http://localhost:3000/animations-demo
-- =====================================================