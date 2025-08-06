-- 7. Row Level Security (RLS) - Organizations and teams already have RLS from migration 003
-- Just add RLS for our new tables
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate with WordPress sync in mind
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations are editable by admins" ON organizations;
DROP POLICY IF EXISTS "Teams are viewable by members" ON teams;
DROP POLICY IF EXISTS "Teams are editable by coaches and org admins" ON teams;

-- Organization policies (updated)
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_organization_roles WHERE organization_id = organizations.id
    ) OR
    auth.uid() IN (
      SELECT utr.user_id 
      FROM user_team_roles utr
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

-- Team policies (updated)
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