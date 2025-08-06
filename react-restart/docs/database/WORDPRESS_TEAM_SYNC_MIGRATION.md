# WordPress Team Sync Migration Guide

## Overview
This document contains the SQL migration to enable WordPress team and organization syncing in the POWLAX React application. The migration builds upon the existing authentication tables and creates new structures for managing teams, organizations, and their relationships.

## Migration Analysis

### Existing Table Dependencies
The migration references these existing tables:
- **users** (from `002_wordpress_auth_tables.sql`)
  - Contains: `id` (UUID), `wordpress_id` (INTEGER), `roles` (TEXT[])
  - Required for: Foreign key relationships in user_team_roles and user_organization_roles

### Migration Order Considerations
After reviewing the existing migrations:

1. **Migration 002** (`wordpress_auth_tables.sql`):
   - Creates `users` table with `wordpress_id`
   - Creates `update_updated_at_column()` function
   - This migration has likely been run

2. **Migration 003** (`enhanced_security_policies.sql`):
   - Creates basic `organizations` and `teams` tables
   - May or may not have been run yet

3. **Our Migration** (`004_organizations_and_teams.sql`):
   - Needs to work whether migration 003 has run or not
   - Uses CREATE TABLE IF NOT EXISTS with full schema
   - Uses ALTER TABLE ADD COLUMN IF NOT EXISTS for safety

## Corrected Migration SQL

```sql
-- WordPress Team Sync Migration
-- Creates or extends tables with WordPress sync capabilities

-- 1. Create or alter organizations table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE organizations (
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
  ELSE
    -- Add columns if table exists
    ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS wp_group_id INTEGER UNIQUE,
      ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('club_os', 'club_team_os')),
      ADD COLUMN IF NOT EXISTS parent_org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS tier TEXT CHECK (tier IN ('foundation', 'growth', 'command')),
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
        "primary_color": "#003366",
        "secondary_color": "#FF6600",
        "logo_url": null
      }',
      ADD COLUMN IF NOT EXISTS wp_last_synced TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Create or alter teams table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE teams (
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
  ELSE
    -- Add columns if table exists
    ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS wp_group_id INTEGER UNIQUE,
      ADD COLUMN IF NOT EXISTS wp_buddyboss_group_id INTEGER,
      ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS team_type TEXT CHECK (team_type IN ('single_team_hq', 'team_hq')) DEFAULT 'team_hq',
      ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('structure', 'leadership', 'activated')) DEFAULT 'structure',
      ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('boys', 'girls', 'mixed')),
      ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('varsity', 'jv', 'freshman', 'youth', 'other')),
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
        "practice_duration_default": 90,
        "practice_start_time_default": "15:30",
        "field_type_default": "Turf"
      }',
      ADD COLUMN IF NOT EXISTS wp_last_synced TIMESTAMPTZ;
      
    -- Also add age_group if teams exists but doesn't have it (from our schema, not migration 003's age_band)
    ALTER TABLE teams ADD COLUMN IF NOT EXISTS age_group TEXT;
  END IF;
END $$;

-- 3. Create user-organization relationships (doesn't exist in previous migrations)
CREATE TABLE IF NOT EXISTS user_organization_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'director')) NOT NULL,
  wp_last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 4. Create user-team relationships (separate from team_members table)
-- This is more specific than the generic team_members table in migration 003
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
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_parent ON organizations(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_organizations_wp_group_id ON organizations(wp_group_id);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_wp_group_id ON teams(wp_group_id);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_user ON user_organization_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_roles_org ON user_organization_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_team_roles_user ON user_team_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_team_roles_team ON user_team_roles(team_id);

-- 6. Create updated_at triggers (drop first to avoid conflicts)
-- PostgreSQL doesn't support CREATE TRIGGER IF NOT EXISTS, so we drop first
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
BEFORE UPDATE ON organizations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at 
BEFORE UPDATE ON teams 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- 8. WordPress sync tracking table
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

-- 11. Add RLS for wp_sync_log (admin only)
ALTER TABLE wp_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view sync logs" ON wp_sync_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Only admins can create sync logs" ON wp_sync_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Only admins can update sync logs" ON wp_sync_log
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );
```

## Important Notes

### 1. Table Relationships
- This migration assumes `users` table exists with `id` (UUID) and `wordpress_id` (INTEGER)
- It extends the basic `organizations` and `teams` tables from migration 003
- Creates new relationship tables: `user_organization_roles` and `user_team_roles`

### 2. Potential Issues to Watch
- The `team_members` table from migration 003 serves a similar purpose to `user_team_roles`
- You may want to migrate data from `team_members` to `user_team_roles` or use both
- The `age_band` column in teams (from migration 003) vs our `age_group` column

### 3. WordPress Data Mapping
```
WordPress/LearnDash → POWLAX Database
- LearnDash Groups → teams table (wp_group_id)
- BuddyBoss Groups → organizations table (wp_group_id)
- learndash_group_users_* → user_team_roles table
- Group hierarchy → parent_org_id relationships
```

### 4. Security Considerations
- All tables have Row Level Security (RLS) enabled
- Admin role checks use the `roles` array from the users table
- Sync operations are admin-only
- Team/org access is role-based

## How to Apply This Migration

1. **Backup your database first!**

2. **In Supabase Dashboard:**
   - Go to SQL Editor
   - Create a new query
   - Copy the entire SQL from the "Corrected Migration SQL" section
   - Review and modify if needed based on your existing schema
   - Execute the query

3. **Verify the migration:**
   ```sql
   -- Check if all columns were added
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name IN ('organizations', 'teams', 'user_team_roles', 'user_organization_roles', 'wp_sync_log')
   ORDER BY table_name, ordinal_position;
   
   -- Check if indexes were created
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('organizations', 'teams', 'user_team_roles', 'user_organization_roles', 'wp_sync_log');
   
   -- Check RLS policies
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('organizations', 'teams', 'user_team_roles', 'user_organization_roles', 'wp_sync_log');
   ```

4. **Test the sync:**
   - Navigate to `/admin/sync` in your app
   - Try syncing organizations first
   - Then sync teams
   - Finally sync user memberships

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove new columns from existing tables
ALTER TABLE organizations 
  DROP COLUMN IF EXISTS wp_group_id,
  DROP COLUMN IF EXISTS slug,
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS parent_org_id,
  DROP COLUMN IF EXISTS tier,
  DROP COLUMN IF EXISTS settings,
  DROP COLUMN IF EXISTS branding,
  DROP COLUMN IF EXISTS wp_last_synced;

ALTER TABLE teams 
  DROP COLUMN IF EXISTS wp_group_id,
  DROP COLUMN IF EXISTS wp_buddyboss_group_id,
  DROP COLUMN IF EXISTS slug,
  DROP COLUMN IF EXISTS team_type,
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS settings,
  DROP COLUMN IF EXISTS wp_last_synced;

-- Drop new tables
DROP TABLE IF EXISTS user_organization_roles CASCADE;
DROP TABLE IF EXISTS user_team_roles CASCADE;
DROP TABLE IF EXISTS wp_sync_log CASCADE;

-- Drop views and functions
DROP VIEW IF EXISTS team_hierarchy;
DROP FUNCTION IF EXISTS get_user_teams(UUID);
```