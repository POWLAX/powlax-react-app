-- Migration: 103_gamification_progress_tables.sql
-- Purpose: Create badge and rank progress tracking tables following Permanence Pattern
-- Author: Claude (YOLO Mode)
-- Date: 2025-08-13

-- ============================================================================
-- BADGE PROGRESS TRACKING TABLE
-- ============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_badge_progress CASCADE;

-- Create badge progress tracking table with direct column mapping
CREATE TABLE user_badge_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id INTEGER NOT NULL,
  series_id INTEGER REFERENCES skills_academy_series(id),
  drills_completed INTEGER DEFAULT 0,
  drills_required INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN drills_required > 0 THEN (drills_completed::decimal / drills_required) * 100
      ELSE 0 
    END
  ) STORED,
  is_eligible BOOLEAN DEFAULT FALSE,
  earned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id, series_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_badge_progress_user_id ON user_badge_progress(user_id);
CREATE INDEX idx_user_badge_progress_badge_id ON user_badge_progress(badge_id);
CREATE INDEX idx_user_badge_progress_series_id ON user_badge_progress(series_id);
CREATE INDEX idx_user_badge_progress_eligible ON user_badge_progress(is_eligible) WHERE is_eligible = true;

-- ============================================================================
-- RANK PROGRESS TRACKING TABLE
-- ============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_rank_progress CASCADE;

-- Create rank progress tracking table
CREATE TABLE user_rank_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_rank_id INTEGER REFERENCES powlax_player_ranks(id) DEFAULT 1,
  academy_points_total INTEGER DEFAULT 0,
  points_to_next_rank INTEGER,
  rank_progress_percentage DECIMAL(5,2) DEFAULT 0,
  highest_rank_achieved INTEGER DEFAULT 1,
  rank_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_rank_progress_user_id ON user_rank_progress(user_id);
CREATE INDEX idx_user_rank_progress_current_rank ON user_rank_progress(current_rank_id);
CREATE INDEX idx_user_rank_progress_points ON user_rank_progress(academy_points_total);

-- ============================================================================
-- BADGE-SERIES MAPPING TABLE
-- ============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS badge_series_mapping CASCADE;

-- Create badge-series relationship table
CREATE TABLE badge_series_mapping (
  badge_id INTEGER NOT NULL,
  series_id INTEGER REFERENCES skills_academy_series(id),
  drills_required INTEGER NOT NULL,
  is_combination_badge BOOLEAN DEFAULT FALSE,
  combination_badge_ids INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (badge_id, COALESCE(series_id, 0))
);

-- Create indexes
CREATE INDEX idx_badge_series_mapping_badge ON badge_series_mapping(badge_id);
CREATE INDEX idx_badge_series_mapping_series ON badge_series_mapping(series_id);
CREATE INDEX idx_badge_series_combination ON badge_series_mapping(is_combination_badge) WHERE is_combination_badge = true;

-- ============================================================================
-- POPULATE BADGE-SERIES MAPPINGS
-- ============================================================================

-- Clear any existing mappings
TRUNCATE TABLE badge_series_mapping;

-- SOLID START SERIES (20 drills required)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required) VALUES
(137, 1, 20),  -- Ball Mover <- SS1 Picking Up and Passing
(138, 2, 20),  -- Dual Threat <- SS2 Defense and Shooting  
(139, 3, 20),  -- Sure Hands <- SS3 Catching and Hesitation
(140, 4, 20),  -- The Great Deceiver <- SS4 Wind Up Dodging
(141, 5, 20);  -- Both Badge <- SS5 Switching Hands

-- ATTACK SERIES (50 drills required)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required) VALUES
(94, 7, 50),   -- On the Run Rocketeer <- A2 Split Dodge/Shooting
(95, 8, 50),   -- Island Isolator <- A3 Finishing From X
(89, 9, 50),   -- Crease Crawler <- A4 Catching/Faking/Crease
(98, 10, 50),  -- Fast Break Finisher <- A5 Running Fast Break
(93, 11, 50),  -- Time and Room Terror <- A6 Time/Room/Wind Up
(91, 12, 50),  -- Ankle Breaker <- A7 Wing Hesitation
(94, 13, 50),  -- On the Run Rocketeer <- A8 Shooting/Slide Em (duplicate mapping OK)
(91, 14, 50),  -- Ankle Breaker <- A9 Inside/Roll Dodge (duplicate mapping OK)
(91, 15, 50),  -- Ankle Breaker <- A10 Ladder/North South (duplicate mapping OK)
(93, 16, 50),  -- Time and Room Terror <- A11 Time/Room from Dodge (duplicate mapping OK)
(97, 17, 50);  -- Rough Rider <- A12 Ride Angles/Favorites

-- DEFENSE SERIES (50 drills required)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required) VALUES
(101, 19, 50), -- Slide Master <- D2 4 Cone/Fast Break
(100, 20, 50), -- Footwork Fortress <- D3 Approach/Recover Low
(102, 21, 50), -- Close Quarters Crusher <- D4 Ladder/Defending X
(105, 22, 50), -- Turnover Titan <- D5 Pipe/Stick Checks
(103, 23, 50), -- Ground Ball Gladiator <- D6 4 Cone Series 2/Sliding
(101, 23, 50), -- Slide Master <- D6 (also maps to this)
(100, 24, 50), -- Footwork Fortress <- D7 Approach/Recover Sides
(107, 25, 50), -- Silky Smooth <- D8 Ladder Set 2/Fast Break
(99, 26, 50),  -- Hip Hitter <- D9 Pipe Approaches Group 3
(102, 27, 50), -- Close Quarters Crusher <- D10 4 Cone Series 3/X Defense
(104, 28, 50), -- Consistent Clear <- D11 Approach/Recover Top
(105, 29, 50); -- Turnover Titan <- D12 Ladder Set 3/Checking

-- MIDFIELD SERIES (50 drills required)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required) VALUES
(113, 31, 50), -- Shooting Sharp Shooter <- M2 Shooting Progression
(117, 32, 50), -- Inside Man <- M3 Catching/Faking/Inside
(116, 33, 50), -- Determined D-Mid <- M4 Defensive Footwork
(110, 34, 50), -- Wing Man Warrior <- M5 Wing Dodging
(111, 35, 50), -- Dodging Dynamo <- M6 Time/Room/Wind Up
(111, 36, 50), -- Dodging Dynamo <- M7 Split Dodge/Shoot Run
(109, 37, 50), -- 2 Way Tornado <- M8 Ladder/Creative Dodging
(117, 38, 50), -- Inside Man <- M9 Inside/Hesitations
(112, 39, 50), -- Fast Break Starter <- M10 Face Dodge Mastery
(113, 40, 50), -- Shooting Sharp Shooter <- M11 Shooting/Slide Em
(116, 41, 50); -- Determined D-Mid <- M12 Defensive/Fast Break

-- WALL BALL SERIES (50 drills required)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required) VALUES
(118, 42, 50), -- Foundation Ace <- WB1 Master Fundamentals
(119, 43, 50), -- Dominant Dodger <- WB2 Dodging
(122, 44, 50), -- Bullet Snatcher <- WB3 Shooting
(120, 45, 50), -- Stamina Star <- WB4 Conditioning
(121, 46, 50), -- Finishing Phenom <- WB5 Faking and Finishing
(124, 47, 50), -- Ball Hawk <- WB6 Catching Everything
(123, 48, 50), -- Long Pole Lizard <- WB7 Long Pole
(125, 49, 50); -- Wall Ball Wizard <- WB8 Advanced and Fun

-- COMBINATION BADGES (earned by collecting other badges)
INSERT INTO badge_series_mapping (badge_id, series_id, drills_required, is_combination_badge, combination_badge_ids) VALUES
(96, NULL, 0, TRUE, ARRAY[92, 89, 94]),  -- Goalies Nightmare <- Seasoned Sniper + Crease Crawler + On the Run Rocketeer
(106, NULL, 0, TRUE, ARRAY[100, 101, 102]), -- The Great Wall <- Footwork Fortress + Slide Master + Close Quarters Crusher
(115, NULL, 0, TRUE, ARRAY[111, 117, 113]), -- Middie Machine <- Dodging Dynamo + Inside Man + Shooting Sharp Shooter
(142, NULL, 0, TRUE, ARRAY[137, 138, 139, 140, 141]); -- Solid Start Master <- All 5 Solid Start badges

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_series_mapping ENABLE ROW LEVEL SECURITY;

-- Badge Progress Policies
CREATE POLICY "Users can view own badge progress" ON user_badge_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own badge progress" ON user_badge_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own badge progress" ON user_badge_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Rank Progress Policies
CREATE POLICY "Users can view own rank progress" ON user_rank_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own rank progress" ON user_rank_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rank progress" ON user_rank_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Badge Series Mapping (Public Read)
CREATE POLICY "Badge series mapping public read" ON badge_series_mapping
  FOR SELECT USING (true);

-- ============================================================================
-- UPDATE TRIGGER FOR TIMESTAMPS
-- ============================================================================

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_badge_progress_updated_at
  BEFORE UPDATE ON user_badge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rank_progress_updated_at
  BEFORE UPDATE ON user_rank_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate rank from Academy Points
CREATE OR REPLACE FUNCTION calculate_rank_from_points(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF points >= 10000 THEN RETURN 10;  -- Lax God
  ELSIF points >= 6000 THEN RETURN 9;  -- Lax Ninja
  ELSIF points >= 4500 THEN RETURN 8;  -- Lax Beast
  ELSIF points >= 3000 THEN RETURN 7;  -- Flow Bro
  ELSIF points >= 2000 THEN RETURN 6;  -- Lacrosse Utility
  ELSIF points >= 1400 THEN RETURN 5;  -- D-Mid Rising
  ELSIF points >= 1000 THEN RETURN 4;  -- Celly King
  ELSIF points >= 600 THEN RETURN 3;   -- Left Bench Hero
  ELSIF points >= 250 THEN RETURN 2;   -- 2nd Bar Syndrome
  ELSE RETURN 1;                        -- Lacrosse Bot
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get next rank points requirement
CREATE OR REPLACE FUNCTION get_next_rank_points(current_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF current_points < 250 THEN RETURN 250;
  ELSIF current_points < 600 THEN RETURN 600;
  ELSIF current_points < 1000 THEN RETURN 1000;
  ELSIF current_points < 1400 THEN RETURN 1400;
  ELSIF current_points < 2000 THEN RETURN 2000;
  ELSIF current_points < 3000 THEN RETURN 3000;
  ELSIF current_points < 4500 THEN RETURN 4500;
  ELSIF current_points < 6000 THEN RETURN 6000;
  ELSIF current_points < 10000 THEN RETURN 10000;
  ELSE RETURN 0; -- Max rank achieved
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_badge_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_rank_progress TO authenticated;
GRANT SELECT ON badge_series_mapping TO authenticated;
GRANT USAGE ON SEQUENCE user_badge_progress_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE user_rank_progress_id_seq TO authenticated;

-- Grant permissions to anon for public data
GRANT SELECT ON badge_series_mapping TO anon;

COMMENT ON TABLE user_badge_progress IS 'Tracks user progress towards earning badges through drill completions';
COMMENT ON TABLE user_rank_progress IS 'Tracks user rank progression based on Academy Points accumulation';
COMMENT ON TABLE badge_series_mapping IS 'Maps badges to series requirements and combination badge prerequisites';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================