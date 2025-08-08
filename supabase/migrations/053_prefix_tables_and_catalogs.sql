-- Prefix-compliant tables and catalogs; provide compatibility views

-- 1) Club organizations (prefix: club_*)
CREATE TABLE IF NOT EXISTS club_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill from legacy organizations table if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations'
  ) THEN
    INSERT INTO club_organizations (id, name, created_at, updated_at)
    SELECT id, name,
           COALESCE(created_at, NOW()),
           COALESCE(updated_at, NOW())
    FROM organizations o
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2) Team teams (prefix: team_*)
CREATE TABLE IF NOT EXISTS team_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NULL REFERENCES club_organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill from legacy teams table if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams'
  ) THEN
    INSERT INTO team_teams (id, club_id, name, created_at, updated_at)
    SELECT id, NULL::uuid as club_id, name,
           COALESCE(created_at, NOW()),
           COALESCE(updated_at, NOW())
    FROM teams t
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 3) Compatibility views for existing code paths
CREATE OR REPLACE VIEW organizations AS
SELECT id, name, created_at, updated_at FROM club_organizations;

CREATE OR REPLACE VIEW teams AS
SELECT id, name, created_at, updated_at, club_id AS organization_id FROM team_teams;

-- 4) POWLAX catalogs for gamification (prefix: powlax_*)
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

-- Optional catalogs
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

-- Mapping from external (WordPress/Gamipress) to internal keys
CREATE TABLE IF NOT EXISTS powlax_gamipress_mappings (
  source TEXT NOT NULL,                 -- e.g., 'gamipress_badge','gamipress_rank','gamipress_points'
  source_key TEXT NOT NULL,             -- external slug/id
  target_type TEXT NOT NULL,            -- 'badge','rank','currency'
  target_key TEXT NOT NULL,             -- our key (e.g., 'lax_credits')
  PRIMARY KEY (source, source_key)
);

-- 5) Ensure user_points_wallets currency references the catalog
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_wallets'
  ) THEN
    -- Drop legacy check constraint if present
    IF EXISTS (
      SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE 'user_points_wallets_currency_check%'
    ) THEN
      ALTER TABLE user_points_wallets DROP CONSTRAINT IF EXISTS user_points_wallets_currency_check;
    END IF;
    -- Add FK to catalog
    ALTER TABLE user_points_wallets
      DROP CONSTRAINT IF EXISTS user_points_wallets_currency_fkey,
      ADD CONSTRAINT user_points_wallets_currency_fkey
        FOREIGN KEY (currency) REFERENCES powlax_points_currencies(currency) ON DELETE RESTRICT;
  END IF;
END $$;

-- 6) RLS defaults
ALTER TABLE club_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='club_organizations' AND policyname='club_organizations_read_auth') THEN
    CREATE POLICY club_organizations_read_auth ON club_organizations FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_teams' AND policyname='team_teams_read_auth') THEN
    CREATE POLICY team_teams_read_auth ON team_teams FOR SELECT TO authenticated USING (true);
  END IF;
END $$;


