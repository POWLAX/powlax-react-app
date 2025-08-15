-- Role Migration Rollback Script
-- Generated: 2025-08-14T17:18:01.715Z
-- Purpose: Emergency rollback from "administrator" back to "admin" if needed
-- ⚠️  ONLY USE IF MIGRATION FAILS AND ROLLBACK IS NEEDED

BEGIN;

-- Verify current state before rollback
SELECT 
  'Before rollback:' as status,
  email, 
  role,
  full_name
FROM public.users 
WHERE email = 'patrick@powlax.com';

-- Rollback Patrick's role from "administrator" to "admin"
UPDATE public.users 
SET role = 'admin'
WHERE email = 'patrick@powlax.com' 
  AND role = 'administrator';

-- Verify rollback
SELECT 
  'After rollback:' as status,
  email, 
  role,
  full_name,
  CASE WHEN role = 'admin' 
       THEN '✅ Rollback successful' 
       ELSE '❌ Rollback failed' 
  END as rollback_status
FROM public.users 
WHERE email = 'patrick@powlax.com';

COMMIT;

-- Post-rollback verification:
-- 1. Check Patrick can still log in
-- 2. Verify admin dashboard access
-- 3. Clear Next.js cache: rm -rf .next
-- 4. Restart dev server: npm run dev
