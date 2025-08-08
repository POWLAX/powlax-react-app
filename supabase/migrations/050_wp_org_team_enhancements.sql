-- Enhance organizations/teams for WordPress mapping and add sync log

-- Organizations: metadata for wp_group_id and other external refs
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Teams: metadata and subscription tier (gating)
ALTER TABLE teams 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'structure';

-- Sync log table for WordPress imports (groups/users)
CREATE TABLE IF NOT EXISTS wp_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL, -- e.g., 'groups-analyze', 'groups-import'
  status TEXT NOT NULL DEFAULT 'started',
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Basic RLS: service_role full access, no public
ALTER TABLE wp_sync_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wp_sync_log' AND policyname = 'service_role_full_wp_sync_log'
  ) THEN
    CREATE POLICY "service_role_full_wp_sync_log" ON wp_sync_log
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_teams_subscription_tier ON teams (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_organizations_metadata ON organizations USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_teams_metadata ON teams USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_wp_sync_log_created_at ON wp_sync_log (created_at DESC);


