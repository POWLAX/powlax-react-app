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
-- First check if teams table has organization_id column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'teams' 
    AND column_name = 'organization_id'
  ) THEN
    -- Create view only if the column exists
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
  END IF;
END $$;

-- 10. Function to get user's accessible teams
-- Create function only if teams.organization_id exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'teams' 
    AND column_name = 'organization_id'
  ) THEN
    CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
    RETURNS TABLE (
      team_id UUID,
      team_name TEXT,
      team_slug TEXT,
      user_role TEXT,
      organization_name TEXT,
      club_name TEXT
    ) AS $func$
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
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END $$;

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