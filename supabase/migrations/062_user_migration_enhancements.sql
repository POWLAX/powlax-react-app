-- User Migration Enhancement Tables
-- Adds missing columns and relationships for WordPress/MemberPress migration

-- Add missing columns to users table for complete migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS memberpress_subscription_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS buddyboss_group_ids INTEGER[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS migration_source TEXT DEFAULT 'wordpress';
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_band TEXT CHECK (age_band IN ('8-10', '11-13', '14-18', 'adult'));

-- Add status tracking to team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS soft_deleted_at TIMESTAMPTZ;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invitation_token TEXT;

-- Add club membership tracking (for directors)
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES club_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('director', 'admin', 'coach', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  soft_deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_users_wordpress_id ON users(wordpress_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Add metadata to organizations for WordPress sync
ALTER TABLE club_organizations ADD COLUMN IF NOT EXISTS wordpress_group_id INTEGER;
ALTER TABLE club_organizations ADD COLUMN IF NOT EXISTS wordpress_group_name TEXT;
ALTER TABLE club_organizations ADD COLUMN IF NOT EXISTS memberpress_product_id INTEGER;

-- Add metadata to teams for WordPress sync  
ALTER TABLE team_teams ADD COLUMN IF NOT EXISTS wordpress_group_id INTEGER;
ALTER TABLE team_teams ADD COLUMN IF NOT EXISTS wordpress_group_name TEXT;
ALTER TABLE team_teams ADD COLUMN IF NOT EXISTS age_band TEXT;
ALTER TABLE team_teams ADD COLUMN IF NOT EXISTS team_type TEXT CHECK (team_type IN ('varsity', 'jv', 'youth', 'middle_school', 'elementary'));

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_type TEXT NOT NULL,
  source TEXT NOT NULL,
  target_table TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Function to safely add user with WordPress data
CREATE OR REPLACE FUNCTION upsert_wordpress_user(
  p_wordpress_id INTEGER,
  p_email TEXT,
  p_username TEXT,
  p_full_name TEXT,
  p_roles TEXT[],
  p_avatar_url TEXT,
  p_buddyboss_group_ids INTEGER[]
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user exists by wordpress_id
  SELECT id INTO v_user_id FROM users WHERE wordpress_id = p_wordpress_id;
  
  IF v_user_id IS NULL THEN
    -- Insert new user
    INSERT INTO users (
      wordpress_id, email, username, full_name, roles, avatar_url, 
      buddyboss_group_ids, migration_source, created_at, updated_at
    ) VALUES (
      p_wordpress_id, p_email, p_username, p_full_name, p_roles, p_avatar_url,
      p_buddyboss_group_ids, 'wordpress', NOW(), NOW()
    ) RETURNING id INTO v_user_id;
  ELSE
    -- Update existing user
    UPDATE users SET
      email = COALESCE(p_email, email),
      username = COALESCE(p_username, username),
      full_name = COALESCE(p_full_name, full_name),
      roles = COALESCE(p_roles, roles),
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      buddyboss_group_ids = COALESCE(p_buddyboss_group_ids, buddyboss_group_ids),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;

-- Policies for club_members
CREATE POLICY "Club members viewable by authenticated users" ON club_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Club directors can manage members" ON club_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM club_members cm2 
      WHERE cm2.club_id = club_members.club_id 
      AND cm2.user_id = auth.uid() 
      AND cm2.role = 'director'
      AND cm2.status = 'active'
    )
  );

-- Policy for migration_log (admin only)
CREATE POLICY "Migration log viewable by service role only" ON migration_log
  FOR ALL TO service_role USING (true);

-- Helper view for WordPress migration status
CREATE OR REPLACE VIEW wordpress_migration_status AS
SELECT 
  COUNT(DISTINCT wordpress_id) as total_wordpress_users,
  COUNT(DISTINCT auth_user_id) as users_with_auth,
  COUNT(DISTINCT CASE WHEN buddyboss_group_ids IS NOT NULL THEN wordpress_id END) as users_with_groups,
  COUNT(DISTINCT CASE WHEN memberpress_subscription_id IS NOT NULL THEN wordpress_id END) as users_with_subscriptions,
  MAX(updated_at) as last_sync_time
FROM users
WHERE migration_source = 'wordpress';

-- Grant permissions
GRANT SELECT ON wordpress_migration_status TO authenticated;
GRANT ALL ON club_members TO authenticated;