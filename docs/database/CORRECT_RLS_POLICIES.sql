-- Correct RLS Policies based on actual table structure
-- Run this after the main migration is complete

-- 1. Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_sync_log ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations are editable by admins" ON organizations;
DROP POLICY IF EXISTS "Teams are viewable by members" ON teams;
DROP POLICY IF EXISTS "Teams are editable by coaches and org admins" ON teams;
DROP POLICY IF EXISTS "User roles are viewable by team/org members" ON user_team_roles;
DROP POLICY IF EXISTS "User org roles are viewable by org members" ON user_organization_roles;

-- 3. Organization policies
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT USING (
    -- User has direct organization role
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    ) OR
    -- User is in a team that belongs to a club (organization)
    EXISTS (
      SELECT 1 FROM user_team_roles utr
      JOIN teams t ON t.id = utr.team_id
      WHERE t.club_id = organizations.id 
      AND utr.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizations are editable by admins" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'director')
    )
  );

-- 4. Team policies (using club_id instead of organization_id)
CREATE POLICY "Teams are viewable by members" ON teams
  FOR SELECT USING (
    -- User is directly in the team
    EXISTS (
      SELECT 1 FROM user_team_roles 
      WHERE team_id = teams.id 
      AND user_id = auth.uid()
    ) OR
    -- User has a role in the team's club/organization
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = teams.club_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Teams are editable by coaches and org admins" ON teams
  FOR ALL USING (
    -- User is a coach/admin of the team
    EXISTS (
      SELECT 1 FROM user_team_roles 
      WHERE team_id = teams.id 
      AND user_id = auth.uid()
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    ) OR
    -- User is an admin of the team's club/organization
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = teams.club_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'director')
    )
  );

-- 5. User role policies
CREATE POLICY "User team roles are viewable by team members" ON user_team_roles
  FOR SELECT USING (
    -- User can see their own roles
    user_id = auth.uid() OR
    -- Coaches/admins can see all team member roles
    EXISTS (
      SELECT 1 FROM user_team_roles utr2 
      WHERE utr2.team_id = user_team_roles.team_id
      AND utr2.user_id = auth.uid()
      AND utr2.role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

CREATE POLICY "User org roles are viewable by org members" ON user_organization_roles
  FOR SELECT USING (
    -- User can see their own roles
    user_id = auth.uid() OR
    -- Any org member can see other org member roles
    EXISTS (
      SELECT 1 FROM user_organization_roles uor2 
      WHERE uor2.organization_id = user_organization_roles.organization_id
      AND uor2.user_id = auth.uid()
    )
  );

-- 6. Policies for editing user roles
CREATE POLICY "Only team admins can edit team roles" ON user_team_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_team_roles utr
      WHERE utr.team_id = user_team_roles.team_id
      AND utr.user_id = auth.uid()
      AND utr.role IN ('head_coach', 'team_admin')
    ) OR
    -- Organization admins can also manage team roles
    EXISTS (
      SELECT 1 FROM user_organization_roles uor
      JOIN teams t ON t.club_id = uor.organization_id
      WHERE t.id = user_team_roles.team_id
      AND uor.user_id = auth.uid()
      AND uor.role IN ('owner', 'admin', 'director')
    )
  );

CREATE POLICY "Only org admins can edit org roles" ON user_organization_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_organization_roles uor
      WHERE uor.organization_id = user_organization_roles.organization_id
      AND uor.user_id = auth.uid()
      AND uor.role IN ('owner', 'admin', 'director')
    )
  );

-- 7. wp_sync_log policies (already correct)
-- These are already applied if you ran section 11
DROP POLICY IF EXISTS "Only admins can view sync logs" ON wp_sync_log;
DROP POLICY IF EXISTS "Only admins can create sync logs" ON wp_sync_log;
DROP POLICY IF EXISTS "Only admins can update sync logs" ON wp_sync_log;

CREATE POLICY "Only admins can view sync logs" ON wp_sync_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND ('admin' = ANY(COALESCE(roles, '{}')) OR role = 'admin')
    )
  );

CREATE POLICY "Only admins can create sync logs" ON wp_sync_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND ('admin' = ANY(COALESCE(roles, '{}')) OR role = 'admin')
    )
  );

CREATE POLICY "Only admins can update sync logs" ON wp_sync_log
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND ('admin' = ANY(COALESCE(roles, '{}')) OR role = 'admin')
    )
  );