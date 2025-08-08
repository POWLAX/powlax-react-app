-- One-shot bootstrap to ensure all required tables exist (safe/idempotent)
-- Run this if prior migrations were not applied. It mirrors 051–053 in a single file.

-- Users mapping to WordPress
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS wordpress_id BIGINT;

-- Club (organizations)
CREATE TABLE IF NOT EXISTS club_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team (teams)
CREATE TABLE IF NOT EXISTS team_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NULL REFERENCES club_organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team members (membership links)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('head_coach','assistant_coach','player','parent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_teams_club ON team_teams(club_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Compatibility views for legacy code paths (only create if neither a view nor a table already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='organizations'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='organizations'
  ) THEN
    EXECUTE 'CREATE VIEW organizations AS SELECT id, name, created_at, updated_at FROM club_organizations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='teams'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='teams'
  ) THEN
    EXECUTE 'CREATE VIEW teams AS SELECT id, name, created_at, updated_at, club_id AS organization_id FROM team_teams';
  END IF;
END $$;

-- Gamification catalogs
CREATE TABLE IF NOT EXISTS powlax_points_currencies (
  currency TEXT PRIMARY KEY,
  display_name TEXT NOT NULL
);

INSERT INTO powlax_points_currencies (currency, display_name) VALUES
  ('lax_credits','Lax Credits'),
  ('attack_tokens','Attack Tokens'),
  ('defense_dollars','Defense Dollars'),
  ('midfield_medals','Midfield Medals'),
  ('flex_points','Flex Points'),
  ('rebound_rewards','Rebound Rewards'),
  ('lax_iq_points','Lax IQ Points')
ON CONFLICT (currency) DO NOTHING;

CREATE TABLE IF NOT EXISTS powlax_badges_catalog (
  badge_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS powlax_ranks_catalog (
  rank_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS powlax_gamipress_mappings (
  source TEXT NOT NULL,
  source_key TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_key TEXT NOT NULL,
  PRIMARY KEY (source, source_key)
);

-- User gamification data
CREATE TABLE IF NOT EXISTS user_points_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL REFERENCES powlax_points_currencies(currency) ON DELETE RESTRICT,
  balance BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

CREATE TABLE IF NOT EXISTS user_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  delta BIGINT NOT NULL,
  reason TEXT,
  source TEXT,
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  UNIQUE(user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS user_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_key TEXT NOT NULL,
  rank_name TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  UNIQUE(user_id, rank_key)
);

-- RLS (read policies for authenticated users)
ALTER TABLE club_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='club_organizations' AND policyname='club_organizations_read_auth') THEN
    CREATE POLICY club_organizations_read_auth ON club_organizations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_teams' AND policyname='team_teams_read_auth') THEN
    CREATE POLICY team_teams_read_auth ON team_teams FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='team_members_read_auth') THEN
    CREATE POLICY team_members_read_auth ON team_members FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_points_wallets' AND policyname='wallets_read_auth') THEN
    CREATE POLICY wallets_read_auth ON user_points_wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_points_ledger' AND policyname='ledger_read_auth') THEN
    CREATE POLICY ledger_read_auth ON user_points_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_badges' AND policyname='badges_read_auth') THEN
    CREATE POLICY badges_read_auth ON user_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_ranks' AND policyname='ranks_read_auth') THEN
    CREATE POLICY ranks_read_auth ON user_ranks FOR SELECT TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;


