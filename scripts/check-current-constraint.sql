-- Check what constraint currently exists on the users table
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM 
    pg_constraint con
    JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    JOIN pg_class cls ON cls.oid = con.conrelid
WHERE 
    nsp.nspname = 'public'
    AND cls.relname = 'users'
    AND con.contype = 'c'  -- Check constraints
ORDER BY 
    con.conname;