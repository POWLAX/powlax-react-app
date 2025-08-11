-- POWLAX Create Only Actually Missing Tables - Final Version
-- Created: 2025-01-16
-- Purpose: Based on actual database analysis - only create what's truly missing

-- ==========================================
-- FIRST: CHECK WHAT'S MISSING
-- ==========================================

-- Show which required tables are missing
SELECT 
  'MISSING TABLE CHECK' as section,
  required_table,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = required_table
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - WILL CREATE'
  END as table_status
FROM (
  VALUES 
    ('registration_sessions'),
    ('user_onboarding'), 
    ('webhook_queue'),
    ('webhook_events')
) AS t(required_table)
ORDER BY required_table;

-- ==========================================
-- CREATE REGISTRATION_SESSIONS (if missing)
-- ==========================================

CREATE TABLE IF NOT EXISTS registration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  session_status TEXT NOT NULL CHECK (session_status IN ('started', 'email_verified', 'completed', 'expired')),
  user_id UUID,
  registration_link_id UUID,
  team_id UUID,
  club_id UUID,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMPTZ,
  verification_code TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE USER_ONBOARDING (if missing)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  onboarding_step TEXT NOT NULL CHECK (onboarding_step IN (
    'welcome', 
    'profile_setup', 
    'team_selection', 
    'role_confirmation',
    'first_login_complete',
    'dashboard_tour',
    'practice_planner_intro',
    'skills_academy_intro',
    'gamification_intro',
    'mobile_app_download',
    'onboarding_complete'
  )),
  step_order INTEGER NOT NULL,
  step_status TEXT NOT NULL DEFAULT 'pending' CHECK (step_status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, onboarding_step)
);

-- ==========================================
-- CREATE WEBHOOK_QUEUE (if missing)
-- ==========================================

CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB DEFAULT '{}',
  queue_status TEXT NOT NULL DEFAULT 'pending' CHECK (queue_status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE WEBHOOK_EVENTS (if missing)
-- ==========================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'memberpress',
  wordpress_user_id INTEGER,
  membership_id INTEGER,
  subscription_id INTEGER,
  raw_payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  user_id UUID,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  headers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE BASIC INDEXES (NO CONFLICTS)
-- ==========================================

-- Registration sessions indexes
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_status ON registration_sessions(session_status);

-- User onboarding indexes  
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_status ON user_onboarding(step_status);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step_order ON user_onboarding(step_order);

-- Webhook queue indexes
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(queue_status);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_scheduled_for ON webhook_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_retry_count ON webhook_queue(retry_count);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_wordpress_user_id ON webhook_events(wordpress_user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (NO POLICIES TO AVOID CONFLICTS)
-- ==========================================

ALTER TABLE registration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

-- Show what was created
SELECT 
  'FINAL VERIFICATION' as section,
  table_name,
  CASE 
    WHEN table_name IN ('registration_sessions', 'user_onboarding', 'webhook_queue', 'webhook_events')
    THEN '✅ REQUIRED AUTH TABLE'
    ELSE 'Other table'
  END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('registration_sessions', 'user_onboarding', 'webhook_queue', 'webhook_events')
ORDER BY table_name;
