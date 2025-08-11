-- POWLAX Missing Authentication Tables
-- Created: 2025-01-16
-- Purpose: Create missing tables required for complete MemberPress/WordPress integration

BEGIN;

-- ==========================================
-- REGISTRATION SESSIONS TABLE
-- ==========================================
-- Track registration progress (started → email verified → completed)

CREATE TABLE IF NOT EXISTS registration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'email_verified', 'completed', 'expired')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  registration_link_id UUID REFERENCES registration_links(id) ON DELETE CASCADE,
  team_id UUID REFERENCES team_teams(id) ON DELETE SET NULL,
  club_id UUID REFERENCES club_organizations(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verification_code TEXT, -- For email verification
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for registration_sessions
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_status ON registration_sessions(status);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expires ON registration_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_user ON registration_sessions(user_id);

-- ==========================================
-- USER ONBOARDING TABLE
-- ==========================================
-- Step-by-step onboarding progress tracking

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN (
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
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}', -- Store step-specific data
  skipped BOOLEAN DEFAULT FALSE,
  skipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step)
);

-- Indexes for user_onboarding
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_step ON user_onboarding(step);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON user_onboarding(completed);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress ON user_onboarding(user_id, step, completed);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE registration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registration_sessions
-- Only service role can manage registration sessions (security-sensitive)
CREATE POLICY "Service role can manage registration sessions" ON registration_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can view their own registration sessions
CREATE POLICY "Users can view own registration sessions" ON registration_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RLS Policies for user_onboarding
-- Users can view and update their own onboarding progress
CREATE POLICY "Users can view own onboarding" ON user_onboarding
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own onboarding" ON user_onboarding
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage onboarding" ON user_onboarding
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to create default onboarding steps for new users
CREATE OR REPLACE FUNCTION create_user_onboarding_steps(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_onboarding (user_id, step, completed, data) VALUES
    (p_user_id, 'welcome', FALSE, '{"title": "Welcome to POWLAX", "description": "Get started with your lacrosse training journey"}'),
    (p_user_id, 'profile_setup', FALSE, '{"title": "Complete Your Profile", "description": "Add your coaching experience and preferences"}'),
    (p_user_id, 'team_selection', FALSE, '{"title": "Join or Create Teams", "description": "Connect with your lacrosse teams"}'),
    (p_user_id, 'role_confirmation', FALSE, '{"title": "Confirm Your Role", "description": "Set up your coaching or player profile"}'),
    (p_user_id, 'dashboard_tour', FALSE, '{"title": "Dashboard Overview", "description": "Learn about your coaching dashboard"}'),
    (p_user_id, 'practice_planner_intro', FALSE, '{"title": "Practice Planner", "description": "Create your first practice plan"}'),
    (p_user_id, 'skills_academy_intro', FALSE, '{"title": "Skills Academy", "description": "Explore training workouts"}'),
    (p_user_id, 'gamification_intro', FALSE, '{"title": "Points & Badges", "description": "Understand the achievement system"}')
  ON CONFLICT (user_id, step) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user onboarding progress
CREATE OR REPLACE FUNCTION get_user_onboarding_progress(p_user_id UUID)
RETURNS TABLE(
  total_steps INTEGER,
  completed_steps INTEGER,
  completion_percentage INTEGER,
  current_step TEXT,
  is_complete BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_steps,
    COUNT(CASE WHEN completed THEN 1 END)::INTEGER as completed_steps,
    ROUND((COUNT(CASE WHEN completed THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100)::INTEGER as completion_percentage,
    (SELECT step FROM user_onboarding WHERE user_id = p_user_id AND NOT completed ORDER BY created_at LIMIT 1) as current_step,
    (COUNT(CASE WHEN NOT completed THEN 1 END) = 0) as is_complete
  FROM user_onboarding 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark onboarding step as complete
CREATE OR REPLACE FUNCTION complete_onboarding_step(p_user_id UUID, p_step TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_onboarding 
  SET 
    completed = TRUE,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND step = p_step;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_user_onboarding_updated_at();

-- Log creation of new tables
-- Log table creation and verification (only if gamipress_sync_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gamipress_sync_log') THEN
    INSERT INTO gamipress_sync_log (entity_type, wordpress_id, action_type, sync_data, synced_at)
    VALUES ('database_cleanup', 0, 'created', 
      '{"phase": "2", "action": "created_missing_auth_tables", "tables_created": ["registration_sessions", "user_onboarding"]}',
      NOW());
    RAISE NOTICE 'Logged table creation to gamipress_sync_log';
  ELSE
    RAISE NOTICE 'gamipress_sync_log table does not exist - skipping log entry';
  END IF;
END$$;

COMMIT;

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE registration_sessions IS 'Tracks registration progress from MemberPress webhooks through email verification to completion';
COMMENT ON TABLE user_onboarding IS 'Step-by-step onboarding progress for new users with gamified completion tracking';

COMMENT ON COLUMN registration_sessions.token IS 'Secure token for registration link validation';
COMMENT ON COLUMN registration_sessions.verification_code IS 'Email verification code for security';
COMMENT ON COLUMN user_onboarding.step IS 'Onboarding step identifier - must match frontend step constants';
COMMENT ON COLUMN user_onboarding.data IS 'Step-specific data including titles, descriptions, and progress metadata';
