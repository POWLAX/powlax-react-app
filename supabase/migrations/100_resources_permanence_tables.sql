-- =====================================================
-- RESOURCES PERMANENCE PATTERN IMPLEMENTATION
-- Created: January 2025
-- Purpose: Implement Resources tables with array-based sharing
-- Following proven permanence pattern from user_drills/user_strategies
-- =====================================================

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS user_resource_interactions CASCADE;
DROP TABLE IF EXISTS resource_collections CASCADE;
DROP TABLE IF EXISTS powlax_resources CASCADE;

-- =====================================================
-- 1. MAIN RESOURCES TABLE
-- =====================================================
CREATE TABLE powlax_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic resource information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  resource_type VARCHAR(50) CHECK (resource_type IN ('video', 'pdf', 'template', 'link')),
  
  -- Resource location
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_path TEXT, -- For local files
  file_size INTEGER,
  duration_seconds INTEGER,
  
  -- CRITICAL: Arrays for role-based access (following permanence pattern)
  age_groups TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}', -- ['coach', 'player', 'parent', 'director', 'admin']
  
  -- CRITICAL: Arrays for sharing restrictions (NOT booleans!)
  team_restrictions INTEGER[] DEFAULT '{}', -- Empty = all teams, populated = specific teams only
  club_restrictions INTEGER[] DEFAULT '{}', -- Empty = all clubs, populated = specific clubs only
  
  -- Metadata and categorization
  tags TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  
  -- Usage tracking
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  -- Access control
  is_premium BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Ownership and timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Additional metadata
  source VARCHAR(100), -- 'powlax', 'user', 'partner', etc.
  external_id VARCHAR(100), -- For third-party resources
  version VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en'
);

-- =====================================================
-- 2. USER RESOURCE INTERACTIONS TABLE
-- =====================================================
CREATE TABLE user_resource_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  resource_id UUID REFERENCES powlax_resources(id) NOT NULL,
  
  -- CRITICAL: Arrays for collections/sharing (following permanence pattern)
  collection_ids UUID[] DEFAULT '{}', -- Resources can be in multiple collections
  shared_with_teams INTEGER[] DEFAULT '{}', -- Teams this user has shared with
  shared_with_users UUID[] DEFAULT '{}', -- Individual users shared with
  
  -- Interaction data
  is_favorite BOOLEAN DEFAULT FALSE,
  is_downloaded BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- User-specific metadata
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  custom_tags TEXT[] DEFAULT '{}',
  
  -- Progress tracking (for videos/courses)
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_position_seconds INTEGER,
  
  -- Usage tracking
  last_viewed TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Ensure unique interaction per user-resource pair
  UNIQUE(user_id, resource_id)
);

-- =====================================================
-- 3. RESOURCE COLLECTIONS (FOLDERS)
-- =====================================================
CREATE TABLE resource_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Collection information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  
  -- CRITICAL: Sharing arrays (following permanence pattern)
  shared_with_teams INTEGER[] DEFAULT '{}',
  shared_with_users UUID[] DEFAULT '{}',
  shared_with_clubs INTEGER[] DEFAULT '{}',
  
  -- Hierarchy (collections can be nested)
  parent_collection_id UUID REFERENCES resource_collections(id),
  path TEXT, -- Materialized path for efficient queries
  depth INTEGER DEFAULT 0,
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE, -- System-created collections
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Statistics
  resource_count INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Resources table indexes
CREATE INDEX idx_resources_category ON powlax_resources(category);
CREATE INDEX idx_resources_type ON powlax_resources(resource_type);
CREATE INDEX idx_resources_roles ON powlax_resources USING GIN(roles);
CREATE INDEX idx_resources_age_groups ON powlax_resources USING GIN(age_groups);
CREATE INDEX idx_resources_tags ON powlax_resources USING GIN(tags);
CREATE INDEX idx_resources_team_restrictions ON powlax_resources USING GIN(team_restrictions);
CREATE INDEX idx_resources_club_restrictions ON powlax_resources USING GIN(club_restrictions);
CREATE INDEX idx_resources_created_by ON powlax_resources(created_by);
CREATE INDEX idx_resources_is_public ON powlax_resources(is_public);
CREATE INDEX idx_resources_created_at ON powlax_resources(created_at DESC);

-- User interactions indexes
CREATE INDEX idx_interactions_user_id ON user_resource_interactions(user_id);
CREATE INDEX idx_interactions_resource_id ON user_resource_interactions(resource_id);
CREATE INDEX idx_interactions_collections ON user_resource_interactions USING GIN(collection_ids);
CREATE INDEX idx_interactions_shared_teams ON user_resource_interactions USING GIN(shared_with_teams);
CREATE INDEX idx_interactions_shared_users ON user_resource_interactions USING GIN(shared_with_users);
CREATE INDEX idx_interactions_favorite ON user_resource_interactions(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_interactions_last_viewed ON user_resource_interactions(last_viewed DESC);

-- Collections indexes
CREATE INDEX idx_collections_user_id ON resource_collections(user_id);
CREATE INDEX idx_collections_parent ON resource_collections(parent_collection_id);
CREATE INDEX idx_collections_shared_teams ON resource_collections USING GIN(shared_with_teams);
CREATE INDEX idx_collections_shared_users ON resource_collections USING GIN(shared_with_users);
CREATE INDEX idx_collections_path ON resource_collections(path);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE powlax_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Public resources are viewable by all"
  ON powlax_resources
  FOR SELECT
  USING (is_public = TRUE AND is_active = TRUE);

CREATE POLICY "Users can view resources for their role"
  ON powlax_resources
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    is_active = TRUE AND
    (
      is_public = TRUE OR
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.auth_user_id = auth.uid()
        AND u.role = ANY(roles)
      )
    )
  );

CREATE POLICY "Users can view team-restricted resources"
  ON powlax_resources
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    is_active = TRUE AND
    (
      ARRAY_LENGTH(team_restrictions, 1) IS NULL OR
      ARRAY_LENGTH(team_restrictions, 1) = 0 OR
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        AND tm.team_id = ANY(team_restrictions)
      )
    )
  );

CREATE POLICY "Admins can manage all resources"
  ON powlax_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('administrator', 'club_director')
    )
  );

-- User interactions policies
CREATE POLICY "Users can view their own interactions"
  ON user_resource_interactions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage their own interactions"
  ON user_resource_interactions
  FOR ALL
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view shared interactions"
  ON user_resource_interactions
  FOR SELECT
  USING (
    (SELECT id FROM users WHERE auth_user_id = auth.uid()) = ANY(shared_with_users) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
      AND tm.team_id = ANY(shared_with_teams)
    )
  );

-- Collections policies
CREATE POLICY "Users can view their own collections"
  ON resource_collections
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage their own collections"
  ON resource_collections
  FOR ALL
  USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view shared collections"
  ON resource_collections
  FOR SELECT
  USING (
    is_public = TRUE OR
    (SELECT id FROM users WHERE auth_user_id = auth.uid()) = ANY(shared_with_users) OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
      AND tm.team_id = ANY(shared_with_teams)
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment resource view count
CREATE OR REPLACE FUNCTION increment_resource_views(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE powlax_resources
  SET views_count = views_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update resource rating based on user ratings
CREATE OR REPLACE FUNCTION update_resource_rating(resource_id UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL(2,1);
BEGIN
  SELECT AVG(rating)::DECIMAL(2,1) INTO avg_rating
  FROM user_resource_interactions
  WHERE resource_id = resource_id AND rating IS NOT NULL;
  
  UPDATE powlax_resources
  SET rating = avg_rating
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update resource rating when user rating changes
CREATE OR REPLACE FUNCTION trigger_update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_resource_rating(NEW.resource_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_interaction_rating_change
  AFTER INSERT OR UPDATE OF rating ON user_resource_interactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_resource_rating();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON powlax_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON user_resource_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON resource_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample resources for different roles
INSERT INTO powlax_resources (title, description, category, resource_type, url, roles, age_groups, tags, is_public) VALUES
-- Coach resources
('U12 Practice Plan Template', 'Complete practice plan template for U12 teams', 'Practice Planning', 'template', '/templates/u12-practice-plan.pdf', ARRAY['coach', 'team_coach'], ARRAY['11-14'], ARRAY['practice', 'planning', 'template'], true),
('Ground Ball Technique Video', 'Master ground ball fundamentals', 'Training Videos', 'video', 'https://youtube.com/watch?v=example1', ARRAY['coach', 'team_coach'], ARRAY['8-10', '11-14'], ARRAY['technique', 'ground balls'], true),
('Defensive Positioning Guide', 'Complete guide to teaching defense', 'Strategy Guides', 'pdf', '/guides/defensive-positioning.pdf', ARRAY['coach', 'team_coach'], ARRAY['11-14', '15+'], ARRAY['defense', 'strategy'], true),

-- Player resources
('Wall Ball Workout Series', '12-part wall ball series', 'Skill Development', 'video', 'https://youtube.com/watch?v=example2', ARRAY['player'], ARRAY['8-10', '11-14', '15+'], ARRAY['wall ball', 'skills'], true),
('Attack Position Training', 'Position-specific training for attackmen', 'Workouts', 'pdf', '/guides/attack-training.pdf', ARRAY['player'], ARRAY['11-14', '15+'], ARRAY['attack', 'position'], true),

-- Parent resources
('Youth Equipment Guide 2025', 'Complete equipment buying guide', 'Equipment Guide', 'pdf', '/guides/equipment-2025.pdf', ARRAY['parent'], ARRAY['8-10', '11-14'], ARRAY['equipment', 'youth'], true),
('Game Day Nutrition', 'Nutrition tips for game day', 'Nutrition', 'link', 'https://example.com/nutrition', ARRAY['parent'], NULL, ARRAY['nutrition', 'health'], true),

-- Director resources
('Club Registration Forms', 'Complete registration package', 'Administration', 'template', '/forms/registration.zip', ARRAY['club_director'], NULL, ARRAY['registration', 'forms'], true),
('Annual Budget Template', 'Budget planning spreadsheet', 'Financial', 'template', '/templates/budget.xlsx', ARRAY['club_director'], NULL, ARRAY['budget', 'financial'], true),

-- Admin resources
('Platform User Guide', 'Complete POWLAX user guide', 'System Docs', 'pdf', '/docs/user-guide.pdf', ARRAY['administrator'], NULL, ARRAY['documentation', 'platform'], true);

-- Add a system collection for favorites
INSERT INTO resource_collections (user_id, name, description, icon, is_system) 
SELECT id, 'Favorites', 'Your favorite resources', 'star', true
FROM users
WHERE role IN ('coach', 'team_coach', 'player')
LIMIT 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist with correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('powlax_resources', 'user_resource_interactions', 'resource_collections')
ORDER BY table_name, ordinal_position;

-- Verify array columns are properly created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('powlax_resources', 'user_resource_interactions', 'resource_collections')
AND data_type LIKE '%ARRAY%'
ORDER BY table_name, column_name;

-- Count sample data
SELECT 
  'powlax_resources' as table_name,
  COUNT(*) as count
FROM powlax_resources
UNION ALL
SELECT 
  'resource_collections' as table_name,
  COUNT(*) as count
FROM resource_collections;

COMMENT ON TABLE powlax_resources IS 'Main resource library following permanence pattern with array-based sharing';
COMMENT ON TABLE user_resource_interactions IS 'User interactions with resources including favorites and sharing arrays';
COMMENT ON TABLE resource_collections IS 'User-created collections for organizing resources with array-based sharing';