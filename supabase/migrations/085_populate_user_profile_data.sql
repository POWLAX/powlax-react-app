-- POWLAX Populate User Profile Data
-- Created: 2025-01-16
-- Purpose: Populate first_name/last_name from display_name and prepare for Supabase Auth

BEGIN;

-- ==========================================
-- POPULATE MISSING PROFILE DATA
-- ==========================================

-- Split display_name into first_name and last_name where missing
UPDATE users 
SET 
  first_name = CASE 
    WHEN first_name IS NULL AND display_name IS NOT NULL THEN
      TRIM(SPLIT_PART(display_name, ' ', 1))
    ELSE first_name
  END,
  last_name = CASE 
    WHEN last_name IS NULL AND display_name IS NOT NULL THEN
      TRIM(SUBSTRING(display_name FROM POSITION(' ' IN display_name) + 1))
    ELSE last_name
  END,
  full_name = CASE 
    WHEN full_name IS NULL AND display_name IS NOT NULL THEN
      display_name
    ELSE full_name
  END
WHERE display_name IS NOT NULL 
  AND (first_name IS NULL OR last_name IS NULL OR full_name IS NULL);

-- Set default account type for existing users
UPDATE users 
SET account_type = 'individual'
WHERE account_type IS NULL;

-- Set age group based on existing data if available
UPDATE users 
SET age_group = CASE 
  WHEN date_of_birth IS NOT NULL THEN
    CASE 
      WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 8 AND 10 THEN 'youth_8_10'
      WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 11 AND 13 THEN 'youth_11_13'
      WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) BETWEEN 14 AND 18 THEN 'youth_14_18'
      WHEN EXTRACT(YEAR FROM AGE(date_of_birth)) >= 19 THEN 'adult'
      ELSE 'unknown'
    END
  ELSE 'unknown'
END
WHERE age_group IS NULL;

-- ==========================================
-- SHOW CURRENT USER DATA FOR MIGRATION PLANNING
-- ==========================================

-- Display all users with their current profile data
SELECT 
  'CURRENT USERS FOR SUPABASE AUTH MIGRATION' as info;

SELECT 
  id,
  email,
  display_name,
  first_name,
  last_name,
  full_name,
  account_type,
  age_group,
  auth_user_id,
  wordpress_id,
  subscription_status,
  is_active
FROM users 
ORDER BY created_at;

-- Show summary statistics
SELECT 
  'USER MIGRATION READINESS SUMMARY' as summary,
  COUNT(*) as total_users,
  COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as users_with_first_name,
  COUNT(CASE WHEN last_name IS NOT NULL THEN 1 END) as users_with_last_name,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_email,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as users_with_supabase_auth,
  COUNT(CASE WHEN wordpress_id IS NOT NULL THEN 1 END) as users_with_wordpress_id
FROM users;

-- Show account types
SELECT 
  'ACCOUNT TYPE DISTRIBUTION' as info,
  account_type,
  COUNT(*) as count
FROM users 
GROUP BY account_type
ORDER BY count DESC;

COMMIT;

-- ==========================================
-- MIGRATION INSTRUCTIONS
-- ==========================================

/*
✅ PROFILE DATA POPULATED!

Your 12 users now have:
✅ first_name and last_name (split from display_name)
✅ account_type set to 'individual' 
✅ age_group calculated from date_of_birth
✅ Ready for Supabase Auth migration

NEXT STEPS:
1. Review the user data shown above
2. Run the TypeScript migration script:
   npx ts-node scripts/migrations/migrate-users-to-supabase-auth.ts
3. Set up parent-child relationships for families
4. Generate magic links for user onboarding

FAMILY ACCOUNT SETUP EXAMPLES:
-- Create a family account
SELECT create_family_account(
  'parent@example.com',
  'Smith Family', 
  ARRAY['child1@example.com', 'child2@example.com']
);

-- View family members
SELECT * FROM get_family_members('parent-user-id-here');
*/
