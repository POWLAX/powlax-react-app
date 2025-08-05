-- Migration: Create Organizations and Teams Structure
-- Description: Implements the POWLAX Club OS and Team HQ hierarchy with WordPress sync support

-- 1. Create organizations table (Club OS and Club Team OS)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wp_group_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('club_os', 'club_team_os')) NOT NULL,
  parent_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('foundation', 'growth', 'command')),
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{
    "primary_color": "#003366",
    "secondary_color": "#FF6600",
    "logo_url": null
  }',
  wp_last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create teams table (Team HQ)
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  wp_group_id INTEGER UNIQUE,
  wp_buddyboss_group_id INTEGER,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  team_type TEXT CHECK (team_type IN ('single_team_hq', 'team_hq')) DEFAULT 'team_hq',
  subscription_tier TEXT CHECK (subscription_tier IN ('structure', 'leadership', 'activated')) DEFAULT 'structure',
  age_group TEXT,
  gender TEXT CHECK (gender IN ('boys', 'girls', 'mixed')),
  level TEXT CHECK (level IN ('varsity', 'jv', 'freshman', 'youth', 'other')),
  settings JSONB DEFAULT '{
    "practice_duration_default": 90,
    "practice_start_time_default": "15:30",
    "field_type_default": "Turf"
  }',
  wp_last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user-organization relationships
CREATE TABLE IF NOT EXISTS user_organization_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'director')) NOT NULL,
  wp_last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 4. Create user-team relationships
CREATE TABLE IF NOT EXISTS user_team_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('head_coach', 'assistant_coach', 'team_admin', 'player', 'parent')) NOT NULL,
  jersey_number TEXT,
  position TEXT,
  wp_last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id, role)
);

-- 5. Create indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_parent ON organizations(parent_org_id);
CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_user_org_roles_user ON user_organization_roles(user_id);
CREATE INDEX idx_user_org_roles_org ON user_organization_roles(organization_id);
CREATE INDEX idx_user_team_roles_user ON user_team_roles(user_id);
CREATE INDEX idx_user_team_roles_team ON user_team_roles(team_id);

-- 6. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at 
BEFORE UPDATE ON organizations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
BEFORE UPDATE ON teams 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles WHERE organization_id = organizations.id
    ) OR
    auth.uid() IN (
      SELECT utr.user_id FROM user_team_roles utr
      JOIN teams t ON t.id = utr.team_id
      WHERE t.organization_id = organizations.id
    )
  );

CREATE POLICY "Organizations are editable by admins" ON organizations
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles 
      WHERE organization_id = organizations.id 
      AND role IN ('owner', 'admin', 'director')
    )
  );

-- Team policies
CREATE POLICY "Teams are viewable by members" ON teams
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_team_roles WHERE team_id = teams.id
    ) OR
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles WHERE organization_id = teams.organization_id
    )
  );

CREATE POLICY "Teams are editable by coaches and org admins" ON teams
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM user_team_roles 
      WHERE team_id = teams.id 
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    ) OR
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles 
      WHERE organization_id = teams.organization_id
      AND role IN ('owner', 'admin', 'director')
    )
  );

-- User role policies
CREATE POLICY "User roles are viewable by team/org members" ON user_team_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM user_team_roles utr2 
      WHERE utr2.team_id = user_team_roles.team_id
      AND utr2.role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

CREATE POLICY "User org roles are viewable by org members" ON user_organization_roles
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles uor2 
      WHERE uor2.organization_id = user_organization_roles.organization_id
    )
  );

-- 8. WordPress sync tracking table
-- This table logs sync operations for monitoring and debugging
CREATE TABLE IF NOT EXISTS wp_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT CHECK (sync_type IN ('organizations', 'teams', 'users', 'full')) NOT NULL,
  status TEXT CHECK (status IN ('started', 'completed', 'failed')) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Add index for sync log queries
CREATE INDEX idx_wp_sync_log_started_at ON wp_sync_log(started_at DESC);
CREATE INDEX idx_wp_sync_log_status ON wp_sync_log(status);

-- 9. Create views for easier querying
CREATE OR REPLACE VIEW team_hierarchy AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.slug as team_slug,
  t.level,
  t.gender,
  t.age_group,
  t.subscription_tier,
  o1.id as program_id,
  o1.name as program_name,
  o2.id as club_id,
  o2.name as club_name
FROM teams t
JOIN organizations o1 ON t.organization_id = o1.id
LEFT JOIN organizations o2 ON o1.parent_org_id = o2.id;

-- 10. Function to get user's accessible teams
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_slug TEXT,
  user_role TEXT,
  organization_name TEXT,
  club_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    t.id,
    t.name,
    t.slug,
    utr.role,
    o1.name,
    o2.name
  FROM teams t
  JOIN user_team_roles utr ON t.id = utr.team_id
  JOIN organizations o1 ON t.organization_id = o1.id
  LEFT JOIN organizations o2 ON o1.parent_org_id = o2.id
  WHERE utr.user_id = user_uuid
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;