-- POWLAX User Tables with Team/Club Sharing
-- Creates user_drills and user_strategies tables with sharing functionality
-- Generated: 2025-01-15

-- ========================================
-- 1. USER DRILLS TABLE
-- ========================================
-- Table for user-created drills with same structure as powlax_drills
-- Plus team_share and club_share arrays for sharing functionality

CREATE TABLE IF NOT EXISTS user_drills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  drill_types TEXT,
  drill_category TEXT,
  drill_duration TEXT,
  drill_video_url TEXT,
  drill_notes TEXT,
  game_states TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  status TEXT,
  slug TEXT,
  raw_data JSONB,
  -- Sharing functionality columns
  team_share INTEGER[] DEFAULT '{}', -- Array of team IDs this drill is shared with
  club_share INTEGER[] DEFAULT '{}', -- Array of club/organization IDs this drill is shared with
  is_public BOOLEAN DEFAULT FALSE, -- Whether drill is publicly visible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. USER STRATEGIES TABLE
-- ========================================
-- Table for user-created strategies with same structure as powlax_strategies
-- Plus team_share and club_share arrays for sharing functionality

CREATE TABLE IF NOT EXISTS user_strategies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_id INTEGER,
  reference_id INTEGER,
  strategy_categories TEXT,
  strategy_name TEXT NOT NULL,
  lacrosse_lab_links JSONB,
  description TEXT,
  embed_codes JSONB,
  see_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT FALSE,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id BIGINT,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  -- Sharing functionality columns
  team_share INTEGER[] DEFAULT '{}', -- Array of team IDs this strategy is shared with
  club_share INTEGER[] DEFAULT '{}', -- Array of club/organization IDs this strategy is shared with
  is_public BOOLEAN DEFAULT FALSE, -- Whether strategy is publicly visible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. TRIGGERS FOR UPDATED_AT
-- ========================================

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to both tables
CREATE TRIGGER update_user_drills_updated_at 
  BEFORE UPDATE ON user_drills 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_strategies_updated_at 
  BEFORE UPDATE ON user_strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

-- User Drills Indexes
CREATE INDEX IF NOT EXISTS idx_user_drills_user_id ON user_drills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_drills_title ON user_drills(title);
CREATE INDEX IF NOT EXISTS idx_user_drills_drill_types ON user_drills(drill_types);
CREATE INDEX IF NOT EXISTS idx_user_drills_game_phase ON user_drills(game_phase);
CREATE INDEX IF NOT EXISTS idx_user_drills_team_share ON user_drills USING gin(team_share);
CREATE INDEX IF NOT EXISTS idx_user_drills_club_share ON user_drills USING gin(club_share);
CREATE INDEX IF NOT EXISTS idx_user_drills_is_public ON user_drills(is_public);
CREATE INDEX IF NOT EXISTS idx_user_drills_created_at ON user_drills(created_at);

-- User Strategies Indexes
CREATE INDEX IF NOT EXISTS idx_user_strategies_user_id ON user_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_strategies_name ON user_strategies(strategy_name);
CREATE INDEX IF NOT EXISTS idx_user_strategies_categories ON user_strategies(strategy_categories);
CREATE INDEX IF NOT EXISTS idx_user_strategies_team_share ON user_strategies USING gin(team_share);
CREATE INDEX IF NOT EXISTS idx_user_strategies_club_share ON user_strategies USING gin(club_share);
CREATE INDEX IF NOT EXISTS idx_user_strategies_is_public ON user_strategies(is_public);
CREATE INDEX IF NOT EXISTS idx_user_strategies_created_at ON user_strategies(created_at);

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on both tables
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;

-- User Drills Policies
-- Users can manage their own drills
CREATE POLICY "Users can manage own drills" ON user_drills
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view drills shared with their teams
CREATE POLICY "Users can view team shared drills" ON user_drills
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = ANY(team_share)
    )
  );

-- Users can view drills shared with their clubs/organizations
CREATE POLICY "Users can view club shared drills" ON user_drills
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.organization_id = ANY(club_share)
    )
  );

-- Anyone can view public drills
CREATE POLICY "Anyone can view public drills" ON user_drills
  FOR SELECT TO authenticated
  USING (is_public = true);

-- User Strategies Policies
-- Users can manage their own strategies
CREATE POLICY "Users can manage own strategies" ON user_strategies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view strategies shared with their teams
CREATE POLICY "Users can view team shared strategies" ON user_strategies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_id = ANY(team_share)
    )
  );

-- Users can view strategies shared with their clubs/organizations
CREATE POLICY "Users can view club shared strategies" ON user_strategies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.organization_id = ANY(club_share)
    )
  );

-- Anyone can view public strategies
CREATE POLICY "Anyone can view public strategies" ON user_strategies
  FOR SELECT TO authenticated
  USING (is_public = true);

-- Service role full access for both tables
CREATE POLICY "Service role full access user_drills" ON user_drills
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access user_strategies" ON user_strategies
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function to share a drill with teams
CREATE OR REPLACE FUNCTION share_drill_with_teams(
  drill_id INTEGER,
  team_ids INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_drills 
  SET team_share = array_cat(team_share, team_ids),
      updated_at = NOW()
  WHERE id = drill_id 
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share a drill with clubs
CREATE OR REPLACE FUNCTION share_drill_with_clubs(
  drill_id INTEGER,
  club_ids INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_drills 
  SET club_share = array_cat(club_share, club_ids),
      updated_at = NOW()
  WHERE id = drill_id 
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share a strategy with teams
CREATE OR REPLACE FUNCTION share_strategy_with_teams(
  strategy_id INTEGER,
  team_ids INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_strategies 
  SET team_share = array_cat(team_share, team_ids),
      updated_at = NOW()
  WHERE id = strategy_id 
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share a strategy with clubs
CREATE OR REPLACE FUNCTION share_strategy_with_clubs(
  strategy_id INTEGER,
  club_ids INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_strategies 
  SET club_share = array_cat(club_share, club_ids),
      updated_at = NOW()
  WHERE id = strategy_id 
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get drills accessible to a user (own + shared + public)
CREATE OR REPLACE FUNCTION get_accessible_drills(
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  id INTEGER,
  title TEXT,
  drill_types TEXT,
  drill_category TEXT,
  game_phase TEXT,
  access_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ud.id,
    ud.title,
    ud.drill_types,
    ud.drill_category,
    ud.game_phase,
    CASE 
      WHEN ud.user_id = user_uuid THEN 'own'
      WHEN ud.is_public THEN 'public'
      WHEN EXISTS(SELECT 1 FROM team_members tm WHERE tm.user_id = user_uuid AND tm.team_id = ANY(ud.team_share)) THEN 'team_shared'
      WHEN EXISTS(SELECT 1 FROM organization_members om WHERE om.user_id = user_uuid AND om.organization_id = ANY(ud.club_share)) THEN 'club_shared'
      ELSE 'other'
    END as access_type
  FROM user_drills ud
  WHERE 
    ud.user_id = user_uuid
    OR ud.is_public = true
    OR EXISTS(SELECT 1 FROM team_members tm WHERE tm.user_id = user_uuid AND tm.team_id = ANY(ud.team_share))
    OR EXISTS(SELECT 1 FROM organization_members om WHERE om.user_id = user_uuid AND om.organization_id = ANY(ud.club_share))
  ORDER BY ud.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get strategies accessible to a user (own + shared + public)
CREATE OR REPLACE FUNCTION get_accessible_strategies(
  user_uuid UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  id INTEGER,
  strategy_name TEXT,
  strategy_categories TEXT,
  description TEXT,
  access_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.strategy_name,
    us.strategy_categories,
    us.description,
    CASE 
      WHEN us.user_id = user_uuid THEN 'own'
      WHEN us.is_public THEN 'public'
      WHEN EXISTS(SELECT 1 FROM team_members tm WHERE tm.user_id = user_uuid AND tm.team_id = ANY(us.team_share)) THEN 'team_shared'
      WHEN EXISTS(SELECT 1 FROM organization_members om WHERE om.user_id = user_uuid AND om.organization_id = ANY(us.club_share)) THEN 'club_shared'
      ELSE 'other'
    END as access_type
  FROM user_strategies us
  WHERE 
    us.user_id = user_uuid
    OR us.is_public = true
    OR EXISTS(SELECT 1 FROM team_members tm WHERE tm.user_id = user_uuid AND tm.team_id = ANY(us.team_share))
    OR EXISTS(SELECT 1 FROM organization_members om WHERE om.user_id = user_uuid AND om.organization_id = ANY(us.club_share))
  ORDER BY us.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE user_drills IS 'User-created drills with team/club sharing functionality';
COMMENT ON COLUMN user_drills.team_share IS 'Array of team IDs where this drill is shared';
COMMENT ON COLUMN user_drills.club_share IS 'Array of club/organization IDs where this drill is shared';
COMMENT ON COLUMN user_drills.is_public IS 'Whether drill is visible to all authenticated users';

COMMENT ON TABLE user_strategies IS 'User-created strategies with team/club sharing functionality';
COMMENT ON COLUMN user_strategies.team_share IS 'Array of team IDs where this strategy is shared';
COMMENT ON COLUMN user_strategies.club_share IS 'Array of club/organization IDs where this strategy is shared';
COMMENT ON COLUMN user_strategies.is_public IS 'Whether strategy is visible to all authenticated users';

COMMENT ON FUNCTION share_drill_with_teams IS 'Share a user drill with specific teams';
COMMENT ON FUNCTION share_drill_with_clubs IS 'Share a user drill with specific clubs/organizations';
COMMENT ON FUNCTION share_strategy_with_teams IS 'Share a user strategy with specific teams';
COMMENT ON FUNCTION share_strategy_with_clubs IS 'Share a user strategy with specific clubs/organizations';
COMMENT ON FUNCTION get_accessible_drills IS 'Get all drills accessible to a user (own, shared, public)';
COMMENT ON FUNCTION get_accessible_strategies IS 'Get all strategies accessible to a user (own, shared, public)';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'POWLAX User Tables Created Successfully! 🚀';
    RAISE NOTICE 'Created tables: user_drills, user_strategies';
    RAISE NOTICE 'Added sharing functionality with team_share and club_share arrays';
    RAISE NOTICE 'Implemented Row Level Security policies';
    RAISE NOTICE 'Created helper functions for sharing and access management';
    RAISE NOTICE 'Ready for user-generated content with team/club sharing!';
END $$;
