-- Run this AFTER the main migration is complete
-- This adds all the Row Level Security policies

-- First, enable RLS on all tables if not already enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations are editable by admins" ON organizations;
DROP POLICY IF EXISTS "Teams are viewable by members" ON teams;
DROP POLICY IF EXISTS "Teams are editable by coaches and org admins" ON teams;
DROP POLICY IF EXISTS "User roles are viewable by team/org members" ON user_team_roles;
DROP POLICY IF EXISTS "User org roles are viewable by org members" ON user_organization_roles;

-- Organization policies
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_team_roles utr
      JOIN teams t ON t.id = utr.team_id
      WHERE t.organization_id = organizations.id 
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

-- Team policies
CREATE POLICY "Teams are viewable by members" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_team_roles 
      WHERE team_id = teams.id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = teams.organization_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Teams are editable by coaches and org admins" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_team_roles 
      WHERE team_id = teams.id 
      AND user_id = auth.uid()
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    ) OR
    EXISTS (
      SELECT 1 FROM user_organization_roles 
      WHERE organization_id = teams.organization_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'director')
    )
  );

-- User role policies
CREATE POLICY "User roles are viewable by team/org members" ON user_team_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_team_roles utr2 
      WHERE utr2.team_id = user_team_roles.team_id
      AND utr2.user_id = auth.uid()
      AND utr2.role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

CREATE POLICY "User org roles are viewable by org members" ON user_organization_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organization_roles uor2 
      WHERE uor2.organization_id = user_organization_roles.organization_id
      AND uor2.user_id = auth.uid()
    )
  );