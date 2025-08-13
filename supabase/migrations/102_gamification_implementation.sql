-- =================================================================
-- POWLAX Skills Academy Gamification System Implementation
-- Migration: 102_gamification_implementation
-- Date: 2025-08-13
-- Purpose: Create comprehensive badges and ranks system following Permanence Pattern
-- =================================================================

-- ===========================
-- PHASE 1: BADGE PROGRESS TRACKING
-- ===========================

-- Badge progress tracking table (following Permanence Pattern)
CREATE TABLE IF NOT EXISTS user_badge_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id INTEGER NOT NULL,  -- References badges_powlax.id
  series_id INTEGER REFERENCES skills_academy_series(id),
  drills_completed INTEGER DEFAULT 0,
  drills_required INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  is_eligible BOOLEAN DEFAULT FALSE,
  is_combination_badge BOOLEAN DEFAULT FALSE,
  prerequisite_badge_ids INTEGER[],
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique progress per user-badge-series combination
  UNIQUE(user_id, badge_id, series_id),
  
  -- Constraint to ensure valid progress percentage
  CONSTRAINT progress_percentage_valid CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Constraint for combination badges (no series_id when combination)
  CONSTRAINT combination_badge_logic CHECK (
    (is_combination_badge = FALSE AND series_id IS NOT NULL) OR
    (is_combination_badge = TRUE AND series_id IS NULL)
  )
);

-- ===========================
-- PHASE 2: RANK PROGRESS TRACKING  
-- ===========================

-- Rank progress tracking table (following Permanence Pattern)
CREATE TABLE IF NOT EXISTS user_rank_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_rank_id INTEGER DEFAULT 1, -- References powlax_player_ranks.id
  academy_points_total INTEGER DEFAULT 0,
  points_to_next_rank INTEGER,
  rank_progress_percentage DECIMAL(5,2) DEFAULT 0,
  highest_rank_achieved INTEGER DEFAULT 1,
  rank_achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One record per user
  UNIQUE(user_id),
  
  -- Constraint to ensure valid progress percentage
  CONSTRAINT rank_progress_percentage_valid CHECK (rank_progress_percentage >= 0 AND rank_progress_percentage <= 100)
);

-- ===========================
-- PHASE 3: BADGE REQUIREMENTS MAPPING
-- ===========================

-- Badge requirements mapping (populate from series_badges_link.csv data)
CREATE TABLE IF NOT EXISTS badge_requirements (
  id SERIAL PRIMARY KEY,
  badge_id INTEGER NOT NULL, -- References badges_powlax.id
  series_id INTEGER REFERENCES skills_academy_series(id),
  drills_required INTEGER NOT NULL,
  is_combination_badge BOOLEAN DEFAULT FALSE,
  prerequisite_badge_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure each badge requirement is unique
  UNIQUE(badge_id, series_id)
);

-- ===========================
-- PHASE 4: RANK REQUIREMENTS  
-- ===========================

-- Rank requirements with 10x multiplier (from contract)
CREATE TABLE IF NOT EXISTS rank_requirements (
  id SERIAL PRIMARY KEY,
  rank_id INTEGER NOT NULL, -- References powlax_player_ranks.id
  rank_order INTEGER NOT NULL,
  rank_title VARCHAR(255) NOT NULL,
  academy_points_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique rank
  UNIQUE(rank_id),
  UNIQUE(rank_order)
);

-- ===========================
-- PHASE 5: POPULATE BADGE REQUIREMENTS
-- ===========================

-- Populate badge requirements from series_badges_link.csv mapping
-- Solid Start badges (20 drills required per series)
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge) VALUES
  (137, 1, 20, FALSE),   -- Ball Mover <- SS1 Picking Up and Passing
  (138, 2, 20, FALSE),   -- Dual Threat <- SS2 Defense and Shooting  
  (139, 3, 20, FALSE),   -- Sure Hands <- SS3 Catching and Hesitation
  (140, 4, 20, FALSE),   -- The Great Deceiver <- SS4 Wind Up Dodging
  (141, 5, 20, FALSE)    -- Both Badge <- SS5 Switching Hands
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- Attack badges (50 drills required per series)
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge) VALUES
  (94, 7, 50, FALSE),    -- On the Run Rocketeer <- A2 Split Dodge
  (95, 8, 50, FALSE),    -- Island Isolator <- A3 Finishing From X
  (89, 9, 50, FALSE),    -- Crease Crawler <- A4 Catching/Faking/Crease
  (98, 10, 50, FALSE),   -- Fast Break Finisher <- A5 Running Fast Break
  (93, 11, 50, FALSE),   -- Time and Room Terror <- A6 Time/Room/Wind Up
  (91, 12, 50, FALSE),   -- Ankle Breaker <- A7 Wing Hesitation
  (94, 13, 50, FALSE),   -- On the Run Rocketeer <- A8 Shooting/Slide Em
  (91, 14, 50, FALSE),   -- Ankle Breaker <- A9 Inside/Roll Dodge
  (91, 15, 50, FALSE),   -- Ankle Breaker <- A10 Ladder/North South
  (93, 16, 50, FALSE),   -- Time and Room Terror <- A11 Time/Room from Dodge
  (97, 17, 50, FALSE)    -- Rough Rider <- A12 Ride Angles/Favorites
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- Defense badges (50 drills required per series)
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge) VALUES
  (101, 31, 50, FALSE),  -- Slide Master <- D2 4 Cone/Fast Break
  (100, 32, 50, FALSE),  -- Footwork Fortress <- D3 Approach/Recover Low
  (102, 33, 50, FALSE),  -- Close Quarters Crusher <- D4 Ladder/Defending X
  (105, 34, 50, FALSE),  -- Turnover Titan <- D5 Pipe/Stick Checks
  (103, 35, 50, FALSE),  -- Ground Ball Gladiator <- D6 4 Cone Series 2/Sliding
  (101, 35, 50, FALSE),  -- Slide Master <- D6 4 Cone Series 2/Sliding (dual badge)
  (100, 36, 50, FALSE),  -- Footwork Fortress <- D7 Approach/Recover Sides
  (107, 37, 50, FALSE),  -- Silky Smooth <- D8 Ladder Set 2/Fast Break
  (99, 38, 50, FALSE),   -- Hip Hitter <- D9 Pipe Approaches Group 3
  (102, 39, 50, FALSE),  -- Close Quarters Crusher <- D10 4 Cone Series 3/X Defense
  (104, 40, 50, FALSE),  -- Consistent Clear <- D11 Approach/Recover Top
  (105, 41, 50, FALSE)   -- Turnover Titan <- D12 Ladder Set 3/Checking
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- Midfield badges (50 drills required per series)
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge) VALUES
  (113, 19, 50, FALSE),  -- Shooting Sharp Shooter <- M2 Shooting Progression
  (117, 20, 50, FALSE),  -- Inside Man <- M3 Catching/Faking/Inside
  (116, 21, 50, FALSE),  -- Determined D-Mid <- M4 Defensive Footwork
  (110, 22, 50, FALSE),  -- Wing Man Warrior <- M5 Wing Dodging
  (111, 23, 50, FALSE),  -- Dodging Dynamo <- M6 Time/Room/Wind Up
  (111, 24, 50, FALSE),  -- Dodging Dynamo <- M7 Split Dodge/Shoot Run
  (109, 25, 50, FALSE),  -- 2 Way Tornado <- M8 Ladder/Creative Dodging
  (117, 26, 50, FALSE),  -- Inside Man <- M9 Inside/Hesitations
  (112, 27, 50, FALSE),  -- Fast Break Starter <- M10 Face Dodge Mastery
  (113, 28, 50, FALSE),  -- Shooting Sharp Shooter <- M11 Shooting/Slide Em
  (116, 29, 50, FALSE)   -- Determined D-Mid <- M12 Defensive/Fast Break
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- Wall Ball badges (50 drills required per series)  
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge) VALUES
  (118, 46, 50, FALSE),  -- Foundation Ace <- WB1 Master Fundamentals
  (119, 47, 50, FALSE),  -- Dominant Dodger <- WB2 Dodging
  (122, 48, 50, FALSE),  -- Bullet Snatcher <- WB3 Shooting
  (120, 49, 50, FALSE),  -- Stamina Star <- WB4 Conditioning
  (121, 50, 50, FALSE),  -- Finishing Phenom <- WB5 Faking and Finishing
  (124, 51, 50, FALSE),  -- Ball Hawk <- WB6 Catching Everything
  (123, 52, 50, FALSE),  -- Long Pole Lizard <- WB7 Long Pole
  (125, 53, 50, FALSE)   -- Wall Ball Wizard <- WB8 Advanced and Fun
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- Combination badges (earned by collecting prerequisite badges)
INSERT INTO badge_requirements (badge_id, series_id, drills_required, is_combination_badge, prerequisite_badge_ids) VALUES
  (96, NULL, 0, TRUE, ARRAY[92, 89, 94]),     -- Goalies Nightmare <- Seasoned Sniper + Crease Crawler + On the Run Rocketeer
  (106, NULL, 0, TRUE, ARRAY[100, 101, 102]), -- The Great Wall <- Footwork Fortress + Slide Master + Close Quarters Crusher  
  (115, NULL, 0, TRUE, ARRAY[111, 117, 113]), -- Middie Machine <- Dodging Dynamo + Inside Man + Shooting Sharp Shooter
  (138, NULL, 0, TRUE, ARRAY[137, 138, 139, 140, 141]) -- Dual Threat <- All 5 Solid Start badges
ON CONFLICT (badge_id, series_id) DO NOTHING;

-- ===========================
-- PHASE 6: POPULATE RANK REQUIREMENTS (10x MULTIPLIER)
-- ===========================

-- Populate rank requirements with 10x Academy Points multiplier
INSERT INTO rank_requirements (rank_id, rank_order, rank_title, academy_points_required) VALUES
  (1, 1, 'Lacrosse Bot', 0),
  (2, 2, '2nd Bar Syndrome', 250),      -- 25 * 10 = 250
  (3, 3, 'Left Bench Hero', 600),       -- 60 * 10 = 600  
  (4, 4, 'Celly King', 1000),           -- 100 * 10 = 1000
  (5, 5, 'D-Mid Rising', 1400),         -- 140 * 10 = 1400
  (6, 6, 'Lacrosse Utility', 2000),     -- 200 * 10 = 2000
  (7, 7, 'Flow Bro', 3000),             -- 300 * 10 = 3000
  (8, 8, 'Lax Beast', 4500),            -- 450 * 10 = 4500
  (9, 9, 'Lax Ninja', 6000),            -- 600 * 10 = 6000
  (10, 10, 'Lax God', 10000)            -- 1000 * 10 = 10000
ON CONFLICT (rank_id) DO NOTHING;

-- ===========================
-- PHASE 7: RLS POLICIES
-- ===========================

-- Enable RLS on new tables
ALTER TABLE user_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_requirements ENABLE ROW LEVEL SECURITY;

-- Badge progress policies
CREATE POLICY "Users can view own badge progress" ON user_badge_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own badge progress" ON user_badge_progress
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "System can insert badge progress" ON user_badge_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Rank progress policies  
CREATE POLICY "Users can view own rank progress" ON user_rank_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own rank progress" ON user_rank_progress
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY "System can insert rank progress" ON user_rank_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Badge requirements (public read)
CREATE POLICY "Badge requirements public read" ON badge_requirements
  FOR SELECT USING (true);

-- Rank requirements (public read)  
CREATE POLICY "Rank requirements public read" ON rank_requirements
  FOR SELECT USING (true);

-- ===========================
-- PHASE 8: UPDATE TRIGGERS
-- ===========================

-- Function to update badge progress percentage
CREATE OR REPLACE FUNCTION update_badge_progress_percentage()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate percentage based on drills completed vs required
  NEW.progress_percentage = CASE 
    WHEN NEW.drills_required > 0 THEN (NEW.drills_completed::DECIMAL / NEW.drills_required) * 100
    ELSE 0
  END;
  
  -- Check if badge is eligible (meets drill requirements)
  NEW.is_eligible = (NEW.drills_completed >= NEW.drills_required);
  
  -- Set earned timestamp if just became eligible
  IF NEW.is_eligible AND OLD.is_eligible = FALSE THEN
    NEW.earned_at = NOW();
  END IF;
  
  -- Update timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for badge progress updates
DROP TRIGGER IF EXISTS trigger_update_badge_progress ON user_badge_progress;
CREATE TRIGGER trigger_update_badge_progress
  BEFORE UPDATE ON user_badge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_badge_progress_percentage();

-- Function to calculate rank progression
CREATE OR REPLACE FUNCTION update_rank_progression()
RETURNS TRIGGER AS $$
DECLARE
  next_rank_requirement INTEGER;
  current_rank_requirement INTEGER;
  new_rank_id INTEGER;
BEGIN
  -- Find the appropriate rank based on academy points
  SELECT r.rank_id, r.academy_points_required INTO new_rank_id, current_rank_requirement
  FROM rank_requirements r
  WHERE r.academy_points_required <= NEW.academy_points_total
  ORDER BY r.academy_points_required DESC
  LIMIT 1;
  
  -- Get next rank requirement
  SELECT r.academy_points_required INTO next_rank_requirement
  FROM rank_requirements r
  WHERE r.academy_points_required > NEW.academy_points_total
  ORDER BY r.academy_points_required ASC
  LIMIT 1;
  
  -- Update rank if changed
  IF new_rank_id != OLD.current_rank_id THEN
    NEW.current_rank_id = new_rank_id;
    NEW.rank_achieved_at = NOW();
    
    -- Update highest rank achieved
    IF new_rank_id > NEW.highest_rank_achieved THEN
      NEW.highest_rank_achieved = new_rank_id;
    END IF;
  END IF;
  
  -- Calculate points to next rank
  NEW.points_to_next_rank = COALESCE(next_rank_requirement - NEW.academy_points_total, 0);
  
  -- Calculate rank progress percentage
  NEW.rank_progress_percentage = CASE
    WHEN next_rank_requirement IS NOT NULL THEN
      ((NEW.academy_points_total - current_rank_requirement)::DECIMAL / 
       (next_rank_requirement - current_rank_requirement)) * 100
    ELSE 100 -- Max rank achieved
  END;
  
  -- Update timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rank progression updates
DROP TRIGGER IF EXISTS trigger_update_rank_progression ON user_rank_progress;
CREATE TRIGGER trigger_update_rank_progression
  BEFORE UPDATE ON user_rank_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_rank_progression();

-- ===========================
-- PHASE 9: INDEXES FOR PERFORMANCE
-- ===========================

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_user_id ON user_badge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_badge_id ON user_badge_progress(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_series_id ON user_badge_progress(series_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_progress_eligible ON user_badge_progress(user_id, is_eligible);

CREATE INDEX IF NOT EXISTS idx_user_rank_progress_user_id ON user_rank_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rank_progress_rank_id ON user_rank_progress(current_rank_id);

CREATE INDEX IF NOT EXISTS idx_badge_requirements_badge_id ON badge_requirements(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_requirements_series_id ON badge_requirements(series_id);

CREATE INDEX IF NOT EXISTS idx_rank_requirements_rank_id ON rank_requirements(rank_id);
CREATE INDEX IF NOT EXISTS idx_rank_requirements_points ON rank_requirements(academy_points_required);

-- =================================================================
-- MIGRATION COMPLETE: POWLAX Gamification System Ready
-- - Badge progress tracking with drill count thresholds
-- - Rank progression with 10x Academy Points multiplier  
-- - Combination badge logic with prerequisite validation
-- - Real-time triggers for automatic calculations
-- - RLS policies for secure user data access
-- - Performance indexes for efficient queries
-- =================================================================