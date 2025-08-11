-- =====================================================
-- POWLAX Gamification Tables - Proper Creation
-- Created: 2025-01-16
-- Purpose: Create the missing gamification tables that the app expects
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
  sub_category VARCHAR(100),
  earned_by_type VARCHAR(50),
  points_type_required VARCHAR(50),
  points_required INTEGER DEFAULT 0,
  wordpress_id INTEGER,
  quest_id INTEGER,
  maximum_earnings INTEGER DEFAULT 1,
  is_hidden BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for badges
CREATE INDEX IF NOT EXISTS idx_badges_powlax_type ON badges_powlax(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_powlax_category ON badges_powlax(category);
CREATE INDEX IF NOT EXISTS idx_badges_powlax_wordpress_id ON badges_powlax(wordpress_id);

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
  benefits JSONB,
  wordpress_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ranks
CREATE INDEX IF NOT EXISTS idx_player_ranks_order ON powlax_player_ranks(rank_order);
CREATE INDEX IF NOT EXISTS idx_player_ranks_credits ON powlax_player_ranks(lax_credits_required);

-- =====================================================
-- 3. POPULATE BADGES WITH WORDPRESS DATA
-- =====================================================

-- Attack Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('Crease Crawler', 'Attack', 'Attack', 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png', 'Master of crease movement and positioning', 1),
('Wing Wizard', 'Attack', 'Attack', 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png', 'Expert at wing play and cutting', 2),
('Ankle Breaker', 'Attack', 'Attack', 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png', 'Devastating dodges that leave defenders behind', 3),
('Shot Doctor', 'Attack', 'Attack', 'https://powlax.com/wp-content/uploads/2024/10/A4-Shot-Doctor.png', 'Precision shooting from any angle', 4),
('Feed Machine', 'Attack', 'Attack', 'https://powlax.com/wp-content/uploads/2024/10/A5-Feed-Machine.png', 'Elite passing and feeding skills', 5)
ON CONFLICT DO NOTHING;

-- Defense Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('Hip Hitter', 'Defense', 'Defense', 'https://powlax.com/wp-content/uploads/2024/10/D1-Hip-Hitter.png', 'Master of defensive positioning and body checks', 1),
('Footwork Fortress', 'Defense', 'Defense', 'https://powlax.com/wp-content/uploads/2024/10/D2-Footwork-Fortress.png', 'Impeccable defensive footwork', 2),
('Slide Master', 'Defense', 'Defense', 'https://powlax.com/wp-content/uploads/2024/10/D3-Slide-Master.png', 'Expert at defensive slides and rotations', 3),
('Takeaway Artist', 'Defense', 'Defense', 'https://powlax.com/wp-content/uploads/2024/10/D4-Takeaway-Artist.png', 'Specialist in causing turnovers', 4),
('Crease Defender', 'Defense', 'Defense', 'https://powlax.com/wp-content/uploads/2024/10/D5-Crease-Defender.png', 'Lockdown defender in the crease', 5)
ON CONFLICT DO NOTHING;

-- Midfield Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('Ground Ball Guru', 'Midfield', 'Midfield', 'https://powlax.com/wp-content/uploads/2024/10/Mid1-Ground-Ball-Guru.png', 'Dominates ground ball battles', 1),
('Transition Terror', 'Midfield', 'Midfield', 'https://powlax.com/wp-content/uploads/2024/10/Mid2-Transition-Terror.png', 'Lightning fast in transition', 2),
('Two-Way Player', 'Midfield', 'Midfield', 'https://powlax.com/wp-content/uploads/2024/10/Mid3-Two-Way-Player.png', 'Excellence on both ends of the field', 3),
('Face-Off Specialist', 'Midfield', 'Midfield', 'https://powlax.com/wp-content/uploads/2024/10/Mid4-Face-Off-Specialist.png', 'Master of the face-off X', 4),
('LSM Legend', 'Midfield', 'Midfield', 'https://powlax.com/wp-content/uploads/2024/10/Mid5-LSM-Legend.png', 'Elite long-stick midfielder', 5)
ON CONFLICT DO NOTHING;

-- Wall Ball Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('Foundation Ace', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB1-Foundation-Ace.png', 'Master of wall ball fundamentals', 1),
('Quick Stick King', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB2-Quick-Stick-King.png', 'Lightning fast stick skills', 2),
('BTB Boss', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB3-BTB-Boss.png', 'Behind the back specialist', 3),
('One-Hand Wonder', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB4-One-Hand-Wonder.png', 'One-handed catching and throwing expert', 4),
('Split Dodge Master', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB5-Split-Dodge-Master.png', 'Perfect split dodge execution', 5),
('Roll Dodge Expert', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB6-Roll-Dodge-Expert.png', 'Smooth roll dodge specialist', 6),
('Cross-Hand Champion', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB7-Cross-Hand-Champion.png', 'Expert at cross-handed play', 7),
('Wall Ball Wizard', 'Wall Ball', 'Wall Ball', 'https://powlax.com/wp-content/uploads/2024/10/WB8-Wall-Ball-Wizard.png', 'Complete wall ball mastery', 8)
ON CONFLICT DO NOTHING;

-- Solid Start Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('First Timer', 'Solid Start', 'Foundation', 'https://powlax.com/wp-content/uploads/2024/10/SS1-First-Timer.png', 'Completed first workout', 1),
('Consistency Builder', 'Solid Start', 'Foundation', 'https://powlax.com/wp-content/uploads/2024/10/SS2-Consistency-Builder.png', '3 workouts completed', 2),
('Habit Former', 'Solid Start', 'Foundation', 'https://powlax.com/wp-content/uploads/2024/10/SS3-Habit-Former.png', '7 day streak achieved', 3),
('Dedicated Player', 'Solid Start', 'Foundation', 'https://powlax.com/wp-content/uploads/2024/10/SS4-Dedicated-Player.png', '14 day streak achieved', 4),
('Rising Star', 'Solid Start', 'Foundation', 'https://powlax.com/wp-content/uploads/2024/10/SS5-Rising-Star.png', '30 workouts completed', 5)
ON CONFLICT DO NOTHING;

-- Lacrosse IQ Badges
INSERT INTO badges_powlax (title, badge_type, category, icon_url, description, sort_order) VALUES
('Film Student', 'Lacrosse IQ', 'Knowledge', 'https://powlax.com/wp-content/uploads/2024/10/IQ1-Film-Student.png', 'Studied game film and tactics', 1),
('Strategy Scholar', 'Lacrosse IQ', 'Knowledge', 'https://powlax.com/wp-content/uploads/2024/10/IQ2-Strategy-Scholar.png', 'Master of lacrosse strategy', 2),
('Play Caller', 'Lacrosse IQ', 'Knowledge', 'https://powlax.com/wp-content/uploads/2024/10/IQ3-Play-Caller.png', 'Can read and call plays', 3),
('Coach Assistant', 'Lacrosse IQ', 'Knowledge', 'https://powlax.com/wp-content/uploads/2024/10/IQ4-Coach-Assistant.png', 'Helps teach younger players', 4),
('Lacrosse Professor', 'Lacrosse IQ', 'Knowledge', 'https://powlax.com/wp-content/uploads/2024/10/IQ5-Lacrosse-Professor.png', 'Complete understanding of the game', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. POPULATE PLAYER RANKS
-- =====================================================

INSERT INTO powlax_player_ranks (title, description, rank_order, lax_credits_required, icon_url) VALUES
('Rookie', 'Just starting your lacrosse journey', 1, 0, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Rookie.png'),
('Grinder', 'Putting in the work every day', 2, 100, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Grinder.png'),
('Baller', 'Making plays on the field', 3, 250, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Baller.png'),
('Stud', 'Standing out from the crowd', 4, 500, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Stud.png'),
('Gamer', 'Clutch performer when it matters', 5, 1000, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Gamer.png'),
('Lax Bro', 'Living the lacrosse lifestyle', 6, 1750, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-Bro.png'),
('Flow Bro', 'Elite player with the flow to match', 7, 2500, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Flow-Bro.png'),
('Lax Ninja', 'Silent but deadly on the field', 8, 3500, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-Ninja.png'),
('Lax Beast', 'Dominating force in every game', 9, 5000, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Lax-Beast.png'),
('Legend', 'Lacrosse immortality achieved', 10, 7500, 'https://powlax.com/wp-content/uploads/2024/10/Rank-Legend.png')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Enable RLS
ALTER TABLE badges_powlax ENABLE ROW LEVEL SECURITY;
ALTER TABLE powlax_player_ranks ENABLE ROW LEVEL SECURITY;

-- Create read policies for authenticated users
CREATE POLICY "Anyone can view badges" ON badges_powlax
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view ranks" ON powlax_player_ranks
  FOR SELECT TO authenticated USING (true);

-- Create anon read policies for public access
CREATE POLICY "Public can view badges" ON badges_powlax
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public can view ranks" ON powlax_player_ranks
  FOR SELECT TO anon USING (true);

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these after migration to verify:
-- SELECT COUNT(*) as badge_count FROM badges_powlax;
-- SELECT COUNT(*) as rank_count FROM powlax_player_ranks;
-- SELECT badge_type, COUNT(*) FROM badges_powlax GROUP BY badge_type;
-- SELECT title, lax_credits_required FROM powlax_player_ranks ORDER BY rank_order;