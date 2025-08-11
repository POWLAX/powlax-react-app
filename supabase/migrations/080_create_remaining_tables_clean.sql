-- POWLAX Create Remaining Tables - Clean Version
-- Created: 2025-01-16
-- Purpose: Create remaining missing tables without policy conflicts

-- ==========================================
-- CREATE USER_ONBOARDING TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_status TEXT NOT NULL DEFAULT 'pending' CHECK (step_status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, step_name)
);

-- Indexes for user_onboarding
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_status ON user_onboarding(step_status);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_order ON user_onboarding(step_order);

-- ==========================================
-- CREATE MEMBERSHIP_PRODUCTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS membership_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memberpress_product_id INTEGER UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  price DECIMAL(10,2),
  billing_type TEXT CHECK (billing_type IN ('one_time', 'recurring')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  access_level TEXT NOT NULL DEFAULT 'basic',
  product_features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for membership_products
CREATE INDEX IF NOT EXISTS idx_membership_products_memberpress_id ON membership_products(memberpress_product_id);
CREATE INDEX IF NOT EXISTS idx_membership_products_active ON membership_products(is_active);
CREATE INDEX IF NOT EXISTS idx_membership_products_access_level ON membership_products(access_level);

-- ==========================================
-- CREATE MEMBERSHIP_ENTITLEMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS membership_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  memberpress_subscription_id INTEGER,
  entitlement_status TEXT NOT NULL CHECK (entitlement_status IN ('active', 'expired', 'cancelled', 'pending')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  features_granted JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for membership_entitlements
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_user_id ON membership_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_status ON membership_entitlements(entitlement_status);
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_expires_at ON membership_entitlements(expires_at);
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_product_id ON membership_entitlements(product_id);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (NO POLICIES YET)
-- ==========================================

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_entitlements ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

-- Show all newly created tables
SELECT 
  'FINAL TABLE CHECK' as check_type,
  table_name,
  '✅ CREATED' as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('registration_sessions', 'user_onboarding', 'membership_products', 'membership_entitlements')
ORDER BY table_name;

-- Show total auth table count
SELECT 
  'TOTAL AUTH TABLES' as summary,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name ~ '^(user_|registration_|webhook_|membership_|team_members)';
