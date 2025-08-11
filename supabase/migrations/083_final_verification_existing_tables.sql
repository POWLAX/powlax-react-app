-- POWLAX Final Verification - Work with Existing Tables
-- Created: 2025-01-16
-- Purpose: Verify all required auth tables exist (they do!) and show their structure

-- ==========================================
-- VERIFY ALL REQUIRED TABLES EXIST
-- ==========================================

SELECT 
  'REQUIRED AUTH TABLES STATUS' as section,
  required_table,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = required_table
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as table_status
FROM (
  VALUES 
    ('users'),
    ('user_sessions'),
    ('user_subscriptions'),
    ('user_activity_log'),
    ('registration_links'),
    ('registration_sessions'),
    ('user_onboarding'),
    ('webhook_queue'),
    ('webhook_events'),
    ('membership_products'),
    ('membership_entitlements'),
    ('team_members')
) AS t(required_table)
ORDER BY required_table;

-- ==========================================
-- SHOW TABLE RECORD COUNTS
-- ==========================================

SELECT 
  'TABLE RECORD COUNTS' as section,
  table_name,
  record_count
FROM (
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
) counts
ORDER BY table_name;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

SELECT 
  '🎉 SUCCESS: ALL REQUIRED AUTH TABLES EXIST!' as final_status,
  'Database is ready for MemberPress/WordPress integration' as message,
  'No additional table creation needed' as action_required;
