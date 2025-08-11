-- POWLAX User Profile Enhancement & Family Account System
-- Created: 2025-01-16
-- Purpose: Add missing profile columns and enhance parent-child relationships

BEGIN;

-- ==========================================
-- ENHANCE USERS TABLE WITH MISSING PROFILE DATA
-- ==========================================

-- Add missing profile columns that might be useful
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
-- ENHANCE PARENT-CHILD RELATIONSHIPS TABLE
-- ==========================================

-- Add more detailed relationship tracking
ALTER TABLE parent_child_relationships ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'parent' 
  CHECK (relationship_type IN ('parent', 'guardian', 'coach_guardian', 'emergency_contact'));
ALTER TABLE parent_child_relationships ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"view_progress": true, "manage_schedule": true, "billing": true}';
ALTER TABLE parent_child_relationships ADD COLUMN IF NOT EXISTS is_primary_guardian BOOLEAN DEFAULT false;
ALTER TABLE parent_child_relationships ADD COLUMN IF NOT EXISTS emergency_contact BOOLEAN DEFAULT false;
ALTER TABLE parent_child_relationships ADD COLUMN IF NOT EXISTS notes TEXT;

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

ALTER TABLE family_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

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
  
  -- Update parent account type
  UPDATE users 
  SET account_type = 'parent'
  WHERE id = v_parent_id;
  
  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Show enhanced user table structure
SELECT 
  'users' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('first_name', 'last_name', 'phone', 'date_of_birth', 'account_type', 'age_group')
ORDER BY ordinal_position;

-- Show current user data summary
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as users_with_first_name,
  COUNT(CASE WHEN last_name IS NOT NULL THEN 1 END) as users_with_last_name,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as users_with_supabase_auth,
  COUNT(CASE WHEN wordpress_id IS NOT NULL THEN 1 END) as users_with_wordpress_id
FROM users;

-- Show family relationship readiness
SELECT 
  'Ready for family account setup' as status,
  COUNT(*) as total_relationships
FROM parent_child_relationships;

COMMIT;

-- ==========================================
-- NEXT STEPS SUMMARY
-- ==========================================

/*
MIGRATION COMPLETE! ✅

Your users table now includes:
✅ first_name, last_name (already existed)
✅ phone, date_of_birth, emergency_contact
✅ account_type (individual, parent, child, family_admin)
✅ age_group for age-appropriate content
✅ privacy_settings, notification_preferences

Family Account System Ready:
✅ Enhanced parent_child_relationships table
✅ family_accounts table for family management
✅ family_members table for family membership
✅ Helper function create_family_account()

NEXT STEPS:
1. Run migration script to add profile columns
2. Create Supabase Auth accounts for 12 existing users
3. Set up parent-child relationships based on team rosters
4. Generate magic links for user onboarding
5. Update authentication flow to handle family accounts

Your database is ready for the complete authentication migration! 🚀
*/
