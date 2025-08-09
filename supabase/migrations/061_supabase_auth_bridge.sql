-- Supabase Auth Bridge
-- Links the custom users table to Supabase Auth for authentication

-- 1. Add auth_user_id to users table to link with Supabase Auth
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);

-- 2. Session management table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  auth_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(auth_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 3. Function to create or link Supabase Auth user
CREATE OR REPLACE FUNCTION create_or_link_auth_user(
  p_email TEXT,
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_wordpress_id BIGINT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Check if auth user already exists for this email
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    -- Create new auth user
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      p_email,
      crypt('temp_password_' || gen_random_uuid()::text, gen_salt('bf')),
      NOW(), -- Auto-confirm email
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      jsonb_build_object(
        'full_name', p_full_name,
        'wordpress_id', p_wordpress_id,
        'app_user_id', p_user_id
      ),
      NOW(),
      NOW()
    )
    RETURNING id INTO v_auth_user_id;
  END IF;
  
  -- Update users table with auth_user_id
  UPDATE users
  SET auth_user_id = v_auth_user_id
  WHERE id = p_user_id;
  
  RETURN v_auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to handle user registration with auth
CREATE OR REPLACE FUNCTION register_user_with_auth(
  p_email TEXT,
  p_full_name TEXT,
  p_wordpress_id BIGINT DEFAULT NULL,
  p_role TEXT DEFAULT 'player'
) RETURNS TABLE (
  user_id UUID,
  auth_user_id UUID,
  magic_link TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id UUID;
  v_magic_link TEXT;
BEGIN
  -- Create or get user record
  INSERT INTO users (
    email,
    full_name,
    wordpress_id,
    created_at
  ) VALUES (
    p_email,
    p_full_name,
    p_wordpress_id,
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    wordpress_id = COALESCE(EXCLUDED.wordpress_id, users.wordpress_id)
  RETURNING id INTO v_user_id;
  
  -- Create or link auth user
  v_auth_user_id := create_or_link_auth_user(
    p_email,
    v_user_id,
    p_full_name,
    p_wordpress_id
  );
  
  -- Generate magic link token
  v_magic_link := encode(gen_random_bytes(32), 'base64');
  
  -- Store magic link in auth.users raw_app_meta_data
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || 
    jsonb_build_object('magic_link_token', v_magic_link, 'magic_link_expires', NOW() + INTERVAL '1 hour')
  WHERE id = v_auth_user_id;
  
  RETURN QUERY
  SELECT v_user_id, v_auth_user_id, v_magic_link;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to validate magic link and create session
CREATE OR REPLACE FUNCTION validate_magic_link(
  p_token TEXT
) RETURNS TABLE (
  user_id UUID,
  auth_user_id UUID,
  session_token TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id UUID;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Find auth user with this magic link token
  SELECT 
    au.id,
    (au.raw_app_meta_data->>'app_user_id')::UUID,
    (au.raw_app_meta_data->>'magic_link_expires')::TIMESTAMPTZ
  INTO v_auth_user_id, v_user_id, v_expires_at
  FROM auth.users au
  WHERE au.raw_app_meta_data->>'magic_link_token' = p_token
  LIMIT 1;
  
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid magic link token';
  END IF;
  
  IF v_expires_at < NOW() THEN
    RAISE EXCEPTION 'Magic link has expired';
  END IF;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Create session
  INSERT INTO user_sessions (
    user_id,
    auth_token,
    expires_at
  ) VALUES (
    v_user_id,
    v_session_token,
    NOW() + INTERVAL '30 days'
  );
  
  -- Clear magic link token
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data - 'magic_link_token' - 'magic_link_expires'
  WHERE id = v_auth_user_id;
  
  RETURN QUERY
  SELECT v_user_id, v_auth_user_id, v_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to sync auth.users changes to users table
CREATE OR REPLACE FUNCTION sync_auth_users_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table when auth.users is updated
  UPDATE users
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE auth_user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_auth_users_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_users_to_users();

-- 7. View for user authentication status
CREATE OR REPLACE VIEW user_auth_status AS
SELECT 
  u.id as user_id,
  u.email,
  -- u.full_name, -- Column may not exist
  -- u.wordpress_id, -- Column may not exist
  u.auth_user_id,
  au.email_confirmed_at IS NOT NULL as email_verified,
  au.last_sign_in_at,
  EXISTS(
    SELECT 1 FROM user_sessions us
    WHERE us.user_id = u.id
    AND us.expires_at > NOW()
  ) as has_active_session
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id;

-- 8. RLS Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY user_sessions_own ON user_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can manage all sessions
CREATE POLICY user_sessions_service ON user_sessions
  FOR ALL
  TO service_role
  USING (true);

-- 9. Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO postgres, service_role;
GRANT UPDATE ON auth.users TO service_role;
GRANT INSERT ON auth.users TO service_role;