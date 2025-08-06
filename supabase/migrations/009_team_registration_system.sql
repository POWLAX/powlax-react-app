-- Migration: Team Registration System
-- Description: Adds tables for team registration codes and invitations

-- 1. Create team registration assets table (for QR codes and registration links)
CREATE TABLE IF NOT EXISTS team_registration_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  registration_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  registration_url TEXT,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER, -- null = unlimited
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create team invitations table (for personal invitations)
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL,
  invited_email TEXT,
  invited_first_name TEXT,
  invited_last_name TEXT,
  invited_role TEXT CHECK (invited_role IN ('player', 'parent', 'coach', 'assistant_coach')) NOT NULL,
  personal_message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create registration tracking table
CREATE TABLE IF NOT EXISTS user_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  registration_source TEXT CHECK (registration_source IN ('qr_code', 'invitation', 'direct', 'admin')) NOT NULL,
  registration_code TEXT,
  invitation_id UUID REFERENCES team_invitations(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add registration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_source TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

-- 5. Create indexes for performance
CREATE INDEX idx_registration_assets_team ON team_registration_assets(team_id);
CREATE INDEX idx_registration_assets_code ON team_registration_assets(registration_code);
CREATE INDEX idx_invitations_team ON team_invitations(team_id);
CREATE INDEX idx_invitations_code ON team_invitations(invitation_code);
CREATE INDEX idx_invitations_email ON team_invitations(invited_email);
CREATE INDEX idx_user_registrations_user ON user_registrations(user_id);
CREATE INDEX idx_user_registrations_team ON user_registrations(team_id);

-- 6. Create updated_at triggers
CREATE TRIGGER update_registration_assets_updated_at 
BEFORE UPDATE ON team_registration_assets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at 
BEFORE UPDATE ON team_invitations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS)
ALTER TABLE team_registration_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;

-- Registration assets policies
CREATE POLICY "Registration assets viewable by team members" ON team_registration_assets
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM user_team_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Registration assets manageable by coaches" ON team_registration_assets
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM user_team_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

-- Public policy for validating registration codes (no auth required)
CREATE POLICY "Public can validate registration codes" ON team_registration_assets
  FOR SELECT USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses)
  );

-- Invitation policies
CREATE POLICY "Invitations viewable by team coaches" ON team_invitations
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM user_team_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

CREATE POLICY "Invitations manageable by coaches" ON team_invitations
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM user_team_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

-- Public policy for validating invitation codes (no auth required)
CREATE POLICY "Public can validate invitation codes" ON team_invitations
  FOR SELECT USING (
    status = 'pending'
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Registration tracking policies
CREATE POLICY "Registrations viewable by user or team coaches" ON user_registrations
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM user_team_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('head_coach', 'assistant_coach', 'team_admin')
    )
  );

-- 8. Helper functions for registration

-- Function to generate unique registration code
CREATE OR REPLACE FUNCTION generate_registration_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM team_registration_assets WHERE registration_code = code
      UNION
      SELECT 1 FROM team_invitations WHERE invitation_code = code
    ) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and get team from registration code
CREATE OR REPLACE FUNCTION validate_registration_code(code TEXT)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  organization_id UUID,
  age_group TEXT,
  level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.organization_id,
    t.age_group,
    t.level
  FROM team_registration_assets tra
  JOIN teams t ON t.id = tra.team_id
  WHERE tra.registration_code = code
    AND tra.is_active = true
    AND (tra.expires_at IS NULL OR tra.expires_at > NOW())
    AND (tra.max_uses IS NULL OR tra.current_uses < tra.max_uses);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and get invitation details
CREATE OR REPLACE FUNCTION validate_invitation_code(code TEXT)
RETURNS TABLE (
  invitation_id UUID,
  team_id UUID,
  team_name TEXT,
  invited_email TEXT,
  invited_first_name TEXT,
  invited_last_name TEXT,
  invited_role TEXT,
  personal_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ti.id,
    ti.team_id,
    t.name,
    ti.invited_email,
    ti.invited_first_name,
    ti.invited_last_name,
    ti.invited_role,
    ti.personal_message
  FROM team_invitations ti
  JOIN teams t ON t.id = ti.team_id
  WHERE ti.invitation_code = code
    AND ti.status = 'pending'
    AND (ti.expires_at IS NULL OR ti.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;