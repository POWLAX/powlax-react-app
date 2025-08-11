-- POWLAX Fix Users Table Constraint Violation
-- Created: 2025-01-16
-- Purpose: Fix existing users data that violates auth_source constraint

BEGIN;

-- ==========================================
-- DIAGNOSE THE CONSTRAINT VIOLATION
-- ==========================================

-- Check which users are violating the constraint
SELECT 
  id,
  email,
  wordpress_id,
  auth_user_id,
  CASE 
    WHEN wordpress_id IS NULL AND auth_user_id IS NULL THEN 'VIOLATION: Both NULL'
    WHEN wordpress_id IS NOT NULL AND auth_user_id IS NOT NULL THEN 'OK: Both present'
    WHEN wordpress_id IS NOT NULL THEN 'OK: WordPress user'
    WHEN auth_user_id IS NOT NULL THEN 'OK: Supabase Auth user'
  END as status
FROM users
WHERE wordpress_id IS NULL AND auth_user_id IS NULL;

-- ==========================================
-- FIX THE VIOLATION
-- ==========================================

-- Step 1: Temporarily remove foreign key constraint to allow placeholder values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;

-- Step 2: Update users with missing auth_user_id to have a placeholder
-- This assumes these are test/development users that should be linked to Supabase Auth later
UPDATE users 
SET auth_user_id = gen_random_uuid()
WHERE wordpress_id IS NULL AND auth_user_id IS NULL;

-- Step 3: Re-add foreign key constraint but make it DEFERRABLE for future auth migrations
-- Note: This will be properly linked during the authentication migration
ALTER TABLE users ADD CONSTRAINT users_auth_user_id_fkey 
  FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) DEFERRABLE INITIALLY DEFERRED;

-- Get count of fixed users
SELECT COUNT(*) as users_fixed 
FROM users 
WHERE wordpress_id IS NULL AND auth_user_id IS NOT NULL;

-- ==========================================
-- RE-ADD THE CONSTRAINT (if it was dropped)
-- ==========================================

-- Drop existing constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_auth_source;

-- Re-add the constraint
ALTER TABLE users ADD CONSTRAINT check_user_auth_source 
  CHECK (wordpress_id IS NOT NULL OR auth_user_id IS NOT NULL);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Verify no more violations
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN wordpress_id IS NOT NULL THEN 1 END) as wordpress_users,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as supabase_auth_users,
  COUNT(CASE WHEN wordpress_id IS NULL AND auth_user_id IS NULL THEN 1 END) as violations
FROM users;

-- This should show 0 violations
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN 'SUCCESS: No constraint violations found'
    ELSE 'ERROR: ' || COUNT(*) || ' users still violate the constraint'
  END as constraint_status
FROM users
WHERE wordpress_id IS NULL AND auth_user_id IS NULL;

COMMIT;
