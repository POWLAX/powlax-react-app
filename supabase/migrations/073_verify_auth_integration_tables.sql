-- POWLAX Authentication Integration Verification
-- Created: 2025-01-16
-- Purpose: Verify all required MemberPress/WordPress integration tables exist and are properly linked

-- ==========================================
-- VERIFICATION: MANDATORY AUTH TABLES
-- ==========================================

DO $$
DECLARE
    missing_tables TEXT[] := '{}';
    current_table TEXT;
    required_tables TEXT[] := ARRAY[
        'users',
        'user_sessions', 
        'user_subscriptions',
        'user_activity_log',
        'registration_links',
        'registration_sessions',
        'user_onboarding',
        'webhook_queue',
        'webhook_events',
        'membership_products',
        'membership_entitlements',
        'team_members'
    ];
BEGIN
    -- Check each required table exists
    FOREACH current_table IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = current_table
        ) THEN
            missing_tables := array_append(missing_tables, current_table);
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'CRITICAL: Missing required auth tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'SUCCESS: All % required authentication tables exist', array_length(required_tables, 1);
    END IF;
END$$;

-- ==========================================
-- VERIFICATION: FOREIGN KEY RELATIONSHIPS
-- ==========================================

-- Verify critical foreign key relationships exist
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Check user_sessions → users relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'user_sessions'
      AND kcu.column_name = 'user_id'
      AND ccu.table_name = 'users';
    
    IF fk_count = 0 THEN
        RAISE WARNING 'Missing FK: user_sessions.user_id → users.id';
    END IF;
    
    -- Check team_members → team_teams relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'team_members'
      AND kcu.column_name = 'team_id'
      AND ccu.table_name = 'team_teams';
    
    IF fk_count = 0 THEN
        RAISE WARNING 'Missing FK: team_members.team_id → team_teams.id';
    END IF;
    
    -- Check team_teams → club_organizations relationship
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'team_teams'
      AND kcu.column_name = 'club_id'
      AND ccu.table_name = 'club_organizations';
    
    IF fk_count = 0 THEN
        RAISE WARNING 'Missing FK: team_teams.club_id → club_organizations.id';
    END IF;
    
    RAISE NOTICE 'Foreign key relationship verification completed';
END$$;

-- ==========================================
-- ADD MISSING COLUMNS FOR SUPABASE AUTH
-- ==========================================

-- Add auth_user_id to users table for Supabase Auth linking
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Add index for auth_user_id lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- Add constraint to ensure either wordpress_id OR auth_user_id exists
-- (This allows for both WordPress users and native Supabase Auth users)
ALTER TABLE users ADD CONSTRAINT check_user_auth_source 
  CHECK (wordpress_id IS NOT NULL OR auth_user_id IS NOT NULL);

-- ==========================================
-- ENHANCE EXISTING TABLES FOR INTEGRATION
-- ==========================================

-- Enhance user_sessions for magic link compatibility
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'jwt' 
  CHECK (session_type IN ('jwt', 'magic_link', 'supabase_auth'));

-- Enhance registration_links for better tracking
ALTER TABLE registration_links ADD COLUMN IF NOT EXISTS used_by_user_id UUID REFERENCES users(id);
ALTER TABLE registration_links ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ==========================================
-- HELPER FUNCTIONS FOR AUTH MIGRATION
-- ==========================================

-- Function to link WordPress user to Supabase Auth
CREATE OR REPLACE FUNCTION link_wordpress_user_to_supabase(
  p_wordpress_id INTEGER,
  p_auth_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET auth_user_id = p_auth_user_id,
      updated_at = NOW()
  WHERE wordpress_id = p_wordpress_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user by either auth method
CREATE OR REPLACE FUNCTION get_user_by_auth(
  p_auth_user_id UUID DEFAULT NULL,
  p_wordpress_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  full_name TEXT,
  wordpress_id INTEGER,
  auth_user_id UUID,
  roles TEXT[],
  subscription_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.wordpress_id,
    u.auth_user_id,
    u.roles,
    u.subscription_status
  FROM users u
  WHERE (p_auth_user_id IS NOT NULL AND u.auth_user_id = p_auth_user_id)
     OR (p_wordpress_id IS NOT NULL AND u.wordpress_id = p_wordpress_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log table creation and verification
INSERT INTO gamipress_sync_log (entity_type, wordpress_id, action_type, sync_data, synced_at)
VALUES ('database_setup', 0, 'created', 
  '{"action": "created_missing_auth_tables", "tables": ["registration_sessions", "user_onboarding"], "enhanced_existing": ["users", "user_sessions", "registration_links"]}',
  NOW()
);

COMMIT;

-- ==========================================
-- POST-MIGRATION VERIFICATION
-- ==========================================

-- Display final table structure
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'user_sessions', 'user_subscriptions', 'user_activity_log',
    'registration_links', 'registration_sessions', 'user_onboarding',
    'webhook_queue', 'webhook_events', 'membership_products', 
    'membership_entitlements', 'team_members'
  )
ORDER BY tablename;

-- Display column structure for key auth tables
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public' 
  AND c.table_name IN ('users', 'user_sessions', 'registration_sessions', 'user_onboarding')
ORDER BY c.table_name, c.ordinal_position;
