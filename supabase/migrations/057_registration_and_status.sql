-- Registration links, membership mapping, entitlements, and status soft-unlink

-- 1) team_members.status for soft unlink on cancel
ALTER TABLE IF EXISTS team_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active','inactive'));

-- 2) Registration Links (for app-only onboarding)
CREATE TABLE IF NOT EXISTS registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('team','club')),
  target_id UUID NOT NULL,
  default_role TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_links_token ON registration_links(token);

-- 3) MemberPress product mapping → app entitlements/behavior
CREATE TABLE IF NOT EXISTS membership_products (
  wp_membership_id INT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  entitlement_key TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('user','team','club')),
  create_behavior TEXT NOT NULL CHECK (create_behavior IN ('none','create_team','create_club')),
  default_role TEXT NOT NULL,
  metadata JSONB
);

-- 4) Issued entitlements
CREATE TABLE IF NOT EXISTS membership_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  club_id UUID,
  team_id UUID,
  entitlement_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','expired','canceled')),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'memberpress',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON membership_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_team ON membership_entitlements(team_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_club ON membership_entitlements(club_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON membership_entitlements(status);

-- 5) Seed canonical product mappings (12)
INSERT INTO membership_products (wp_membership_id, product_slug, entitlement_key, scope, create_behavior, default_role)
VALUES
  (5663,  'create_account',                    'create_account',          'user', 'none',        'player'),
  (37375, 'skills_academy_basic',              'skills_academy_basic',    'user', 'none',        'player'),
  (21279, 'skills_academy_monthly',            'skills_academy_monthly',  'user', 'none',        'player'),
  (21281, 'skills_academy_annual',             'skills_academy_annual',   'user', 'none',        'player'),
  (41930, 'coach_essentials_kit',              'coach_essentials_kit',    'user', 'none',        'coach'),
  (41931, 'coach_confidence_kit',              'coach_confidence_kit',    'user', 'none',        'coach'),
  (41932, 'team_hq_structure',                 'team_hq_structure',       'team', 'create_team', 'head_coach'),
  (41933, 'team_hq_leadership',                'team_hq_leadership',      'team', 'create_team', 'head_coach'),
  (41934, 'team_hq_activated',                 'team_hq_activated',       'team', 'create_team', 'head_coach'),
  (41935, 'club_os_foundation',                'club_os_foundation',      'club', 'create_club', 'director'),
  (41936, 'club_os_growth',                    'club_os_growth',          'club', 'create_club', 'director'),
  (41937, 'club_os_command',                   'club_os_command',         'club', 'create_club', 'director')
ON CONFLICT (wp_membership_id) DO UPDATE
  SET product_slug = EXCLUDED.product_slug,
      entitlement_key = EXCLUDED.entitlement_key,
      scope = EXCLUDED.scope,
      create_behavior = EXCLUDED.create_behavior,
      default_role = EXCLUDED.default_role;


