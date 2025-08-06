-- Enhanced Security Policies for POWLAX Role-Based Access
-- This migration implements the comprehensive security model defined in the data access plan

-- First, let's add organization_id to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_ids UUID[];

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table if not exists
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  age_band TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table for managing relationships
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('coach', 'player', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create parent-child relationships table
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES users(id),
  child_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS data_access_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  organization_id UUID,
  team_id UUID,
  success BOOLEAN NOT NULL,
  denied_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  additional_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON data_access_audit(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON data_access_audit(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity_log;

-- =====================================================
-- ORGANIZATION POLICIES
-- =====================================================

-- Admins can do everything with organizations
CREATE POLICY "admin_all_organizations" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Directors can manage their own organization
CREATE POLICY "director_own_organization" ON organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'club_director' = ANY(roles)
      AND organization_id = organizations.id
    )
  );

-- Coaches can view their organization
CREATE POLICY "coach_view_organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'coach'
      AND t.organization_id = organizations.id
    )
  );

-- Players can see limited organization info
CREATE POLICY "player_view_organization" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'player'
      AND t.organization_id = organizations.id
    )
  );

-- =====================================================
-- TEAM POLICIES
-- =====================================================

-- Admins can do everything with teams
CREATE POLICY "admin_all_teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Directors can manage all teams in their organization
CREATE POLICY "director_organization_teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'club_director' = ANY(roles)
      AND organization_id = teams.organization_id
    )
  );

-- Team members can view their teams
CREATE POLICY "member_view_teams" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
    )
  );

-- Coaches can update their teams
CREATE POLICY "coach_update_teams" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
      AND role = 'coach'
    )
  );

-- =====================================================
-- TEAM MEMBER POLICIES
-- =====================================================

-- Admins can manage all team members
CREATE POLICY "admin_all_team_members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Directors can manage team members in their organization
CREATE POLICY "director_manage_team_members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN teams t ON t.organization_id = u.organization_id
      WHERE u.id = auth.uid() 
      AND 'club_director' = ANY(u.roles)
      AND t.id = team_members.team_id
    )
  );

-- Coaches can view and add team members
CREATE POLICY "coach_manage_team_members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND tm2.role = 'coach'
    )
  );

-- Members can view their team roster
CREATE POLICY "member_view_roster" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm2
      WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
    )
  );

-- =====================================================
-- USER POLICIES (Updated)
-- =====================================================

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "admin_view_all_users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND 'administrator' = ANY(u.roles)
    )
  );

-- Directors can view users in their organization
CREATE POLICY "director_view_org_users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND 'club_director' = ANY(u.roles)
      AND u.organization_id = users.organization_id
    )
  );

-- Coaches can view their team members
CREATE POLICY "coach_view_team_users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm1.role = 'coach'
      AND tm2.user_id = users.id
    )
  );

-- Parents can view their children
CREATE POLICY "parent_view_children" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_child_relationships
      WHERE parent_id = auth.uid()
      AND child_id = users.id
    )
  );

-- =====================================================
-- PARENT-CHILD RELATIONSHIP POLICIES
-- =====================================================

-- Parents can view their relationships
CREATE POLICY "parent_view_relationships" ON parent_child_relationships
  FOR SELECT USING (parent_id = auth.uid());

-- Admins can manage all relationships
CREATE POLICY "admin_manage_relationships" ON parent_child_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- =====================================================
-- AUDIT LOG POLICIES
-- =====================================================

-- Only admins can view audit logs
CREATE POLICY "admin_view_audit_logs" ON data_access_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'administrator' = ANY(roles)
    )
  );

-- Directors can view audit logs for their organization
CREATE POLICY "director_view_org_audit_logs" ON data_access_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'club_director' = ANY(roles)
      AND organization_id = data_access_audit.organization_id
    )
  );

-- =====================================================
-- SUBSCRIPTION POLICIES (Updated)
-- =====================================================

-- Users can view their own subscriptions
CREATE POLICY "users_view_own_subscriptions" ON user_subscriptions
  FOR SELECT USING (
    wordpress_user_id IN (
      SELECT wordpress_id FROM users WHERE id = auth.uid()
    )
  );

-- Parents can view their children's subscriptions
CREATE POLICY "parents_view_children_subscriptions" ON user_subscriptions
  FOR SELECT USING (
    wordpress_user_id IN (
      SELECT u.wordpress_id 
      FROM users u
      JOIN parent_child_relationships pcr ON u.id = pcr.child_id
      WHERE pcr.parent_id = auth.uid()
    )
  );

-- =====================================================
-- SESSION POLICIES (Updated)
-- =====================================================

-- Users can manage their own sessions
CREATE POLICY "users_manage_own_sessions" ON user_sessions
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- ACTIVITY LOG POLICIES (Updated)
-- =====================================================

-- Users can view their own activity
CREATE POLICY "users_view_own_activity" ON user_activity_log
  FOR SELECT USING (user_id = auth.uid());

-- Parents can view their children's activity
CREATE POLICY "parents_view_children_activity" ON user_activity_log
  FOR SELECT USING (
    user_id IN (
      SELECT child_id 
      FROM parent_child_relationships
      WHERE parent_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is in organization
CREATE OR REPLACE FUNCTION user_in_organization(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND organization_id = org_id
  ) OR EXISTS (
    SELECT 1 FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE tm.user_id = user_id
    AND t.organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_denied_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_role TEXT;
  v_org_id UUID;
  v_team_id UUID;
BEGIN
  -- Get user role
  SELECT roles[1] INTO v_user_role
  FROM users WHERE id = auth.uid();
  
  -- Get organization and team context
  SELECT organization_id INTO v_org_id
  FROM users WHERE id = auth.uid();
  
  -- Log the access
  INSERT INTO data_access_audit (
    user_id, user_role, action, resource_type, resource_id,
    organization_id, team_id, success, denied_reason
  ) VALUES (
    auth.uid(), v_user_role, p_action, p_resource_type, p_resource_id,
    v_org_id, v_team_id, p_success, p_denied_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;