-- POWLAX Create Only Actually Missing Tables
-- Created: 2025-01-16
-- Purpose: Create only the tables that don't exist yet

BEGIN;

-- ==========================================
-- CREATE MISSING REGISTRATION TABLES
-- ==========================================

-- Registration sessions table (likely missing)
CREATE TABLE IF NOT EXISTS registration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'email_verified', 'completed', 'expired')),
  user_id UUID, -- No foreign key constraint for now
  registration_link_id UUID, -- No foreign key constraint for now
  team_id UUID, -- No foreign key constraint for now
  club_id UUID, -- No foreign key constraint for now
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User onboarding table (likely missing)
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- No foreign key constraint for now
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, step_name)
);

-- Membership products table (likely missing)
CREATE TABLE IF NOT EXISTS membership_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memberpress_product_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  billing_type TEXT CHECK (billing_type IN ('one_time', 'recurring')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  access_level TEXT NOT NULL DEFAULT 'basic',
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membership entitlements table (likely missing)
CREATE TABLE IF NOT EXISTS membership_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- No foreign key constraint for now
  product_id UUID, -- No foreign key constraint for now
  memberpress_subscription_id INTEGER,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  features_granted JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Registration sessions indexes
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_status ON registration_sessions(status);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expires_at ON registration_sessions(expires_at);

-- User onboarding indexes
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_status ON user_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_order ON user_onboarding(step_order);

-- Membership products indexes
CREATE INDEX IF NOT EXISTS idx_membership_products_memberpress_id ON membership_products(memberpress_product_id);
CREATE INDEX IF NOT EXISTS idx_membership_products_active ON membership_products(is_active);

-- Membership entitlements indexes
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_user_id ON membership_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_status ON membership_entitlements(status);
CREATE INDEX IF NOT EXISTS idx_membership_entitlements_expires_at ON membership_entitlements(expires_at);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE registration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_entitlements ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- BASIC RLS POLICIES
-- ==========================================

-- Registration sessions - users can only see their own
CREATE POLICY "Users can view their own registration sessions" ON registration_sessions
  FOR SELECT USING (email = (SELECT email FROM users WHERE id = auth.uid()));

-- User onboarding - users can only see their own
CREATE POLICY "Users can view their own onboarding" ON user_onboarding
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding" ON user_onboarding
  FOR UPDATE USING (user_id = auth.uid());

-- Membership products - readable by all authenticated users
CREATE POLICY "Authenticated users can view membership products" ON membership_products
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Membership entitlements - users can only see their own
CREATE POLICY "Users can view their own entitlements" ON membership_entitlements
  FOR SELECT USING (user_id = auth.uid());

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Show what we created
SELECT 
  'NEWLY CREATED TABLES' as check_type,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('registration_sessions', 'user_onboarding', 'membership_products', 'membership_entitlements')
ORDER BY table_name;

COMMIT;
