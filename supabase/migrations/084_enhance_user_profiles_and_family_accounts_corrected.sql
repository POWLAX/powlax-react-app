-- POWLAX User Profile Enhancement & Family Account System (CORRECTED)
-- Created: 2025-01-16
-- Purpose: Add missing profile columns and create family relationship tables

BEGIN;

-- ==========================================
-- ENHANCE USERS TABLE WITH MISSING PROFILE DATA
-- ==========================================

-- Add missing profile columns to the actual users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS player_position TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add family account support
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'individual' 
  CHECK (account_type IN ('individual', 'parent', 'child', 'family_admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group TEXT 
  CHECK (age_group IN ('youth_8_10', 'youth_11_13', 'youth_14_18', 'adult', 'unknown'));

-- Add privacy and notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visible": true, "stats_visible": true}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}';

-- ==========================================
-- CREATE PARENT-CHILD RELATIONSHIPS TABLE (NEW)
-- ==========================================

CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent' 
    CHECK (relationship_type IN ('parent', 'guardian', 'coach_guardian', 'emergency_contact')),
  permissions JSONB DEFAULT '{"view_progress": true, "manage_schedule": true, "billing": true}',
  is_primary_guardian BOOLEAN DEFAULT false,
  emergency_contact BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- ==========================================
-- CREATE FAMILY ACCOUNT MANAGEMENT TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS family_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  billing_parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  emergency_contact JSONB,
  family_settings JSONB DEFAULT '{"shared_calendar": true, "combined_stats": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link users to family accounts
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES family_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_family TEXT NOT NULL CHECK (role_in_family IN ('primary_parent', 'secondary_parent', 'child', 'guardian')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_age_group ON users(age_group);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);

-- Family account indexes
CREATE INDEX IF NOT EXISTS idx_family_accounts_primary_parent ON family_accounts(primary_parent_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);

-- Parent-child relationship indexes
CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON parent_child_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child ON parent_child_relationships(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_primary ON parent_child_relationships(is_primary_guardian) WHERE is_primary_guardian = true;

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Parent-child relationship policies
CREATE POLICY "Users can view their own relationships" ON parent_child_relationships
  FOR SELECT USING (
    parent_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR
    child_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Parents can manage their relationships" ON parent_child_relationships
  FOR ALL USING (
    parent_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- Family account policies
CREATE POLICY "Users can view family accounts they belong to" ON family_accounts
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Primary parents can manage family accounts" ON family_accounts
  FOR ALL USING (
    primary_parent_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Family member policies
CREATE POLICY "Users can view family members in their family" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Primary parents can manage family members" ON family_members
  FOR ALL USING (
    family_id IN (
      SELECT id FROM family_accounts 
      WHERE primary_parent_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ==========================================
-- CREATE HELPER FUNCTIONS
-- ==========================================

-- Function to create family account and link users
CREATE OR REPLACE FUNCTION create_family_account(
  p_primary_parent_email TEXT,
  p_family_name TEXT,
  p_child_emails TEXT[]
) RETURNS UUID AS $$
DECLARE
  v_family_id UUID;
  v_parent_id UUID;
  v_child_id UUID;
  v_child_email TEXT;
BEGIN
  -- Get parent user ID
  SELECT id INTO v_parent_id 
  FROM users 
  WHERE email = p_primary_parent_email;
  
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'Parent user not found: %', p_primary_parent_email;
  END IF;
  
  -- Create family account
  INSERT INTO family_accounts (primary_parent_id, family_name, billing_parent_id)
  VALUES (v_parent_id, p_family_name, v_parent_id)
  RETURNING id INTO v_family_id;
  
  -- Add parent to family members
  INSERT INTO family_members (family_id, user_id, role_in_family, permissions)
  VALUES (v_family_id, v_parent_id, 'primary_parent', '{"full_access": true}');
  
  -- Add children to family
  IF p_child_emails IS NOT NULL THEN
    FOREACH v_child_email IN ARRAY p_child_emails LOOP
      SELECT id INTO v_child_id 
      FROM users 
      WHERE email = v_child_email;
      
      IF v_child_id IS NOT NULL THEN
        -- Add to family members
        INSERT INTO family_members (family_id, user_id, role_in_family)
        VALUES (v_family_id, v_child_id, 'child');
        
        -- Create parent-child relationship
        INSERT INTO parent_child_relationships (parent_id, child_id, is_primary_guardian)
        VALUES (v_parent_id, v_child_id, true)
        ON CONFLICT (parent_id, child_id) DO NOTHING;
        
        -- Update child account type
        UPDATE users 
        SET account_type = 'child'
        WHERE id = v_child_id;
      END IF;
    END LOOP;
  END IF;
  
  -- Update parent account type
  UPDATE users 
  SET account_type = 'parent'
  WHERE id = v_parent_id;
  
  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's family members
CREATE OR REPLACE FUNCTION get_family_members(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  display_name TEXT,
  role_in_family TEXT,
  account_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email,
    u.display_name,
    fm.role_in_family,
    u.account_type
  FROM family_members fm
  JOIN users u ON u.id = fm.user_id
  WHERE fm.family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = p_user_id
  )
  ORDER BY 
    CASE fm.role_in_family
      WHEN 'primary_parent' THEN 1
      WHEN 'secondary_parent' THEN 2
      WHEN 'guardian' THEN 3
      WHEN 'child' THEN 4
    END,
    u.display_name;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Show enhanced user table structure
DO $$
BEGIN
  RAISE NOTICE 'User table columns after migration:';
  RAISE NOTICE '%', (
    SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND column_name IN ('first_name', 'last_name', 'phone', 'date_of_birth', 'account_type', 'age_group')
  );
END $$;

-- Show current user data summary
DO $$
DECLARE
  v_total_users INTEGER;
  v_with_auth INTEGER;
  v_with_wordpress INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM users;
  SELECT COUNT(*) INTO v_with_auth FROM users WHERE auth_user_id IS NOT NULL;
  SELECT COUNT(*) INTO v_with_wordpress FROM users WHERE wordpress_id IS NOT NULL;
  
  RAISE NOTICE 'User Summary:';
  RAISE NOTICE '  Total users: %', v_total_users;
  RAISE NOTICE '  With Supabase auth: %', v_with_auth;
  RAISE NOTICE '  With WordPress ID: %', v_with_wordpress;
END $$;

-- Show new tables created
DO $$
BEGIN
  RAISE NOTICE 'New tables created:';
  RAISE NOTICE '  ✅ parent_child_relationships';
  RAISE NOTICE '  ✅ family_accounts';
  RAISE NOTICE '  ✅ family_members';
END $$;

COMMIT;

-- ==========================================
-- POST-MIGRATION NOTES
-- ==========================================

/*
MIGRATION COMPLETE! ✅

Changes made to users table:
✅ Added: first_name, last_name, phone, date_of_birth
✅ Added: emergency_contact, player_position, graduation_year
✅ Added: profile_image_url, account_type, age_group
✅ Added: privacy_settings, notification_preferences

New tables created:
✅ parent_child_relationships - Track parent-child relationships
✅ family_accounts - Manage family units
✅ family_members - Link users to families

Helper functions created:
✅ create_family_account() - Create family and link members
✅ get_family_members() - Get all family members for a user

Row Level Security enabled on all new tables with appropriate policies.

NEXT STEPS:
1. Populate first_name and last_name from display_name
2. Create Supabase Auth accounts for existing users
3. Set up parent-child relationships based on team rosters
4. Generate magic links for user onboarding
*/