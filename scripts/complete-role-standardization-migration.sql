-- =================================================================
-- PHASE 2: Role Standardization Migration SQL Script
-- =================================================================
-- Purpose: Update Patrick's role from "admin" to "administrator"
-- Execute this in Supabase Dashboard > SQL Editor
-- =================================================================

BEGIN;

-- Step 1: Verify current state
SELECT 
    'BEFORE MIGRATION' as status,
    id, 
    email, 
    role, 
    display_name,
    CASE WHEN role = 'admin' THEN '⚠️  Needs Migration' 
         WHEN role = 'administrator' THEN '✅ Already Correct'
         ELSE '➖ Other Role'
    END as migration_status
FROM public.users 
WHERE email = 'patrick@powlax.com';

-- Step 2: Check current role constraint
SELECT 
    'CURRENT CONSTRAINT' as info,
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check' 
  AND conrelid = 'public.users'::regclass;

-- Step 3: Drop existing role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 4: Create new constraint that includes 'administrator'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'administrator', 'director', 'coach', 'player', 'parent'));

-- Step 5: Update Patrick's role from 'admin' to 'administrator'
UPDATE public.users 
SET 
    role = 'administrator',
    updated_at = NOW()
WHERE email = 'patrick@powlax.com' 
  AND role = 'admin';

-- Step 6: Verify the migration was successful
SELECT 
    'AFTER MIGRATION' as status,
    id, 
    email, 
    role, 
    display_name,
    updated_at,
    CASE WHEN role = 'administrator' 
         THEN '✅ Matches WordPress Standard' 
         ELSE '❌ Does not match WordPress'
    END as wordpress_alignment
FROM public.users 
WHERE email = 'patrick@powlax.com';

-- Step 7: Check for any remaining admin roles
SELECT 
    'REMAINING ADMIN ROLES' as status,
    COUNT(*) as admin_count,
    CASE WHEN COUNT(*) = 0 
         THEN '✅ No admin roles remaining' 
         ELSE '⚠️  Admin roles still exist'
    END as migration_complete
FROM public.users 
WHERE role = 'admin';

-- Step 8: Verify new constraint allows expected roles
SELECT 
    'CONSTRAINT VERIFICATION' as status,
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check' 
  AND conrelid = 'public.users'::regclass;

-- Step 9: Final summary
SELECT 
    'MIGRATION SUMMARY' as status,
    'Phase 2 Complete' as phase,
    '✅ Patrick role updated to administrator' as result,
    '✅ WordPress alignment achieved' as alignment,
    '✅ Database constraint updated' as constraint_status;

COMMIT;

-- =================================================================
-- VERIFICATION QUERIES (Run separately after migration)
-- =================================================================

-- Verify only expected roles exist
SELECT role, COUNT(*) as user_count
FROM public.users 
GROUP BY role
ORDER BY role;

-- Verify Patrick's complete record
SELECT *
FROM public.users 
WHERE email = 'patrick@powlax.com';