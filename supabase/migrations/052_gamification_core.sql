-- Gamification core tables: points, badges, ranks (idempotent)

-- Points wallets per user (multiple currencies)
CREATE TABLE IF NOT EXISTS user_points_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN (
    'lax_credits','attack_tokens','defense_dollars','midfield_medals','flex_points','rebound_rewards','lax_iq_points'
  )),
  balance BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_user_points_wallets_user ON user_points_wallets(user_id);

-- Points ledger (auditable)
CREATE TABLE IF NOT EXISTS user_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL,
  delta BIGINT NOT NULL,
  reason TEXT,
  source TEXT, -- 'wordpress_gamipress', 'skills_academy', 'manual', etc.
  source_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_points_ledger_user ON user_points_ledger(user_id);

-- Badges earned
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL, -- stable identifier
  badge_name TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  UNIQUE(user_id, badge_key)
);

-- Ranks
CREATE TABLE IF NOT EXISTS user_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_key TEXT NOT NULL,
  rank_name TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  UNIQUE(user_id, rank_key)
);

-- Enable RLS (read for authenticated)
ALTER TABLE user_points_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
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


