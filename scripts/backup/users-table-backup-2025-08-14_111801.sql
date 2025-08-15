-- Users Table Backup
-- Generated: 2025-08-14T17:18:01.714Z
-- Purpose: Backup before role standardization migration (admin -> administrator)
-- Total users: 21

BEGIN;

-- Create backup table
CREATE TABLE IF NOT EXISTS users_backup_2025_08_14_111801 AS 
SELECT * FROM public.users;

-- Verify backup
SELECT 
  'Backup created: users_backup_2025_08_14_111801' as status,
  COUNT(*) as user_count 
FROM users_backup_2025_08_14_111801;

COMMIT;

-- Backup verification queries:
-- SELECT * FROM users_backup_2025_08_14_111801 WHERE email = 'patrick@powlax.com';
-- SELECT role, COUNT(*) FROM users_backup_2025_08_14_111801 GROUP BY role;
