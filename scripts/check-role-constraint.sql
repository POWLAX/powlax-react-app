-- Check what the valid roles are in the users table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

-- Also check if there's an enum type for roles
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%role%'
ORDER BY e.enumsortorder;

-- Check actual role values in the users table
SELECT DISTINCT role, COUNT(*) as count
FROM public.users
WHERE role IS NOT NULL
GROUP BY role
ORDER BY count DESC;

-- Show the full table structure
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'role';