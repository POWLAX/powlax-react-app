-- POWLAX Final Missing Authentication Tables
-- Created: 2025-01-16
-- Purpose: Create the final 3 missing tables identified by verification script

BEGIN;

-- ==========================================
-- USER SUBSCRIPTIONS TABLE (MemberPress Sync)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordpress_user_id INTEGER NOT NULL,
  membership_id INTEGER NOT NULL,
  subscription_id INTEGER,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  product_name TEXT,
  subscription_type TEXT,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  gateway TEXT, -- stripe, paypal, etc.
  gateway_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to users table
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  UNIQUE(wordpress_user_id, membership_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_wordpress_user_id ON user_subscriptions(wordpress_user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- ==========================================
-- USER ACTIVITY LOG TABLE (Audit Trail)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT, -- 'drill', 'strategy', 'practice_plan', 'team', etc.
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (action IS NOT NULL AND LENGTH(action) > 0)
);

-- Create indexes for performance and querying
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_entity_type ON user_activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_session_id ON user_activity_log(session_id);

-- ==========================================
-- WEBHOOK EVENTS TABLE (MemberPress Audit)
-- ==========================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  wordpress_user_id INTEGER,
  membership_id INTEGER,
  subscription_id INTEGER,
  raw_payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key relationships
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraints
  CHECK (event_type IS NOT NULL AND LENGTH(event_type) > 0),
  CHECK (retry_count >= 0)
);

-- Create indexes for webhook processing performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_wordpress_user_id ON webhook_events(wordpress_user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON webhook_events(user_id);

-- ==========================================
-- ADD TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER update_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only see their own data)
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own activity log" ON user_activity_log
  FOR SELECT USING (user_id = auth.uid());

-- Webhook events are admin-only
CREATE POLICY "Admin can manage webhook events" ON webhook_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Verify tables were created successfully
DO $$
DECLARE
    created_tables TEXT[] := ARRAY['user_subscriptions', 'user_activity_log', 'webhook_events'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY created_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            RAISE NOTICE 'SUCCESS: Created table %', tbl;
        ELSE
            RAISE EXCEPTION 'FAILED: Table % was not created', tbl;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All 3 missing authentication tables created successfully!';
END$$;

COMMIT;
