-- DIAGNOSTIC QUERIES TO RUN IN SUPABASE SQL EDITOR

-- 1. Check if there's a trigger on auth.users
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- 2. Check for functions that might be failing
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%user%' 
    AND n.nspname IN ('public', 'auth')
ORDER BY n.nspname, p.proname;

-- 3. Check the users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. TEMPORARY FIX: Disable the problematic trigger
-- Run this to temporarily disable triggers and create your user
BEGIN;

-- Disable triggers on auth.users
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Try to manually insert a user (this should work with triggers disabled)
-- Note: You'll need to get a proper encrypted password or use Supabase's auth functions
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id
    gen_random_uuid(), -- id
    'authenticated', -- aud
    'authenticated', -- role
    'patrick@powlax.com', -- email
    crypt('TempPassword123!', gen_salt('bf')), -- encrypted_password (temporary)
    NOW(), -- email_confirmed_at
    NULL, -- recovery_sent_at
    NULL, -- last_sign_in_at
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']), -- raw_app_meta_data
    jsonb_build_object('full_name', 'Patrick Chapla'), -- raw_user_meta_data
    NOW(), -- created_at
    NOW(), -- updated_at
    NULL, -- confirmation_sent_at
    NULL, -- email_change
    NULL, -- email_change_token_new
    NULL -- recovery_token
);

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;

COMMIT;

-- 5. Get the created user's ID
SELECT id, email FROM auth.users WHERE email = 'patrick@powlax.com';

-- 6. Manually create the corresponding users table record
-- Replace 'YOUR_AUTH_USER_ID' with the ID from step 5
INSERT INTO public.users (
    auth_user_id,
    email,
    role,
    is_admin,
    full_name,
    display_name,
    created_at,
    updated_at
) VALUES (
    'YOUR_AUTH_USER_ID', -- Replace with actual ID from step 5
    'patrick@powlax.com',
    'administrator',
    true,
    'Patrick Chapla',
    'Patrick Chapla',
    NOW(),
    NOW()
);

-- 7. PERMANENT FIX: Check what the trigger is trying to do
-- If there's a broken trigger, you might need to fix or recreate it
-- This query will show you the trigger function code
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%handle%user%'
    AND routine_type = 'FUNCTION';