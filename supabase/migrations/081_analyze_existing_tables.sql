-- POWLAX Analyze Existing Tables
-- Created: 2025-01-16
-- Purpose: Check what tables actually exist and their column structures

-- ==========================================
-- CHECK WHAT AUTH TABLES EXIST
-- ==========================================

-- Show all auth-related tables that exist
SELECT 
  'EXISTING AUTH TABLES' as check_type,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (
    table_name LIKE 'user_%' OR 
    table_name LIKE 'registration_%' OR 
    table_name LIKE 'membership_%' OR 
    table_name LIKE 'webhook_%' OR
    table_name = 'team_members' OR
    table_name = 'users'
  )
ORDER BY table_name;

-- ==========================================
-- CHECK REGISTRATION_SESSIONS TABLE STRUCTURE
-- ==========================================

SELECT 
  'REGISTRATION_SESSIONS COLUMNS' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'registration_sessions'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK USER_ONBOARDING TABLE STRUCTURE
-- ==========================================

SELECT 
  'USER_ONBOARDING COLUMNS' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_onboarding'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK MEMBERSHIP_PRODUCTS TABLE STRUCTURE
-- ==========================================

SELECT 
  'MEMBERSHIP_PRODUCTS COLUMNS' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_products'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK MEMBERSHIP_ENTITLEMENTS TABLE STRUCTURE
-- ==========================================

SELECT 
  'MEMBERSHIP_ENTITLEMENTS COLUMNS' as info,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_entitlements'
ORDER BY ordinal_position;

-- ==========================================
-- CHECK FOR CONFLICTING POLICIES
-- ==========================================

SELECT 
  'EXISTING POLICIES' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename IN ('registration_sessions', 'user_onboarding', 'membership_products', 'membership_entitlements')
ORDER BY tablename, policyname;
