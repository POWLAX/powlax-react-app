-- DIAGNOSTIC QUERY FOR CLAUDE - Run this in Supabase SQL Editor
-- Copy and paste ALL the results to Claude for analysis
-- This will show exactly what tables exist and their structures

-- ==========================================
-- 1. SHOW ALL AUTH-RELATED TABLES THAT EXIST
-- ==========================================

SELECT 
  '=== EXISTING AUTH TABLES ===' as section,
  table_name,
  table_type
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
-- 2. SHOW DETAILED COLUMN STRUCTURE FOR EACH TABLE
-- ==========================================

-- Users table structure
SELECT 
  '=== USERS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- User_sessions table structure
SELECT 
  '=== USER_SESSIONS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_sessions'
ORDER BY ordinal_position;

-- User_subscriptions table structure
SELECT 
  '=== USER_SUBSCRIPTIONS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- User_activity_log table structure
SELECT 
  '=== USER_ACTIVITY_LOG TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_activity_log'
ORDER BY ordinal_position;

-- Registration_links table structure
SELECT 
  '=== REGISTRATION_LINKS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'registration_links'
ORDER BY ordinal_position;

-- Registration_sessions table structure (if it exists)
SELECT 
  '=== REGISTRATION_SESSIONS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'registration_sessions'
ORDER BY ordinal_position;

-- User_onboarding table structure (if it exists)
SELECT 
  '=== USER_ONBOARDING TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_onboarding'
ORDER BY ordinal_position;

-- Membership_products table structure
SELECT 
  '=== MEMBERSHIP_PRODUCTS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_products'
ORDER BY ordinal_position;

-- Membership_entitlements table structure
SELECT 
  '=== MEMBERSHIP_ENTITLEMENTS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_entitlements'
ORDER BY ordinal_position;

-- Webhook_events table structure (if it exists)
SELECT 
  '=== WEBHOOK_EVENTS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'webhook_events'
ORDER BY ordinal_position;

-- Webhook_queue table structure (if it exists)
SELECT 
  '=== WEBHOOK_QUEUE TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'webhook_queue'
ORDER BY ordinal_position;

-- Team_members table structure
SELECT 
  '=== TEAM_MEMBERS TABLE COLUMNS ===' as section,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'team_members'
ORDER BY ordinal_position;

-- ==========================================
-- 3. SHOW EXISTING POLICIES THAT MIGHT CONFLICT
-- ==========================================

SELECT 
  '=== EXISTING RLS POLICIES ===' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename IN (
  'users', 'user_sessions', 'user_subscriptions', 'user_activity_log',
  'registration_links', 'registration_sessions', 'user_onboarding', 
  'membership_products', 'membership_entitlements', 'webhook_events', 'webhook_queue'
)
ORDER BY tablename, policyname;

-- ==========================================
-- 4. SHOW TABLE RECORD COUNTS
-- ==========================================

-- This will show which tables have data
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'user_activity_log', COUNT(*) FROM user_activity_log
UNION ALL
SELECT 'registration_links', COUNT(*) FROM registration_links
UNION ALL
SELECT 'membership_products', COUNT(*) FROM membership_products
UNION ALL
SELECT 'membership_entitlements', COUNT(*) FROM membership_entitlements
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
ORDER BY table_name;
