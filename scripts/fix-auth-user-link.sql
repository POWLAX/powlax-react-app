-- ============================================================
-- FIX AUTH USER LINK FOR PATRICK@POWLAX.COM
-- ============================================================
-- The issue: patrick@powlax.com has auth_user_id but that ID
-- doesn't exist in auth.users table, causing "Database error finding user"
-- ============================================================

BEGIN;

-- Step 1: Check current state
SELECT 
    'Current patrick@powlax.com status:' as info,
    id,
    email,
    auth_user_id,
    wordpress_id,
    role
FROM users 
WHERE email = 'patrick@powlax.com';

-- Step 2: Check if the auth_user_id exists in auth.users
SELECT 
    'Checking if auth_user_id exists in auth.users:' as info,
    COUNT(*) as exists_count
FROM auth.users 
WHERE id = 'b6fe5b01-79c4-4b4e-99e5-835eb89a1d6e';

-- Step 3: Remove the invalid auth_user_id reference
UPDATE users 
SET auth_user_id = NULL
WHERE email = 'patrick@powlax.com'
    AND auth_user_id = 'b6fe5b01-79c4-4b4e-99e5-835eb89a1d6e'
    AND NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = 'b6fe5b01-79c4-4b4e-99e5-835eb89a1d6e'
    );

-- Step 4: Create auth.users entry for patrick
DO $$
DECLARE
    v_user_exists BOOLEAN;
    v_new_auth_id UUID;
BEGIN
    -- Check if patrick exists in auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'patrick@powlax.com'
    ) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Generate new UUID for auth user
        v_new_auth_id := gen_random_uuid();
        
        -- Create auth user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_new_auth_id,
            'authenticated',
            'authenticated',
            'patrick@powlax.com',
            crypt('TempPassword123!', gen_salt('bf')),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
            jsonb_build_object('full_name', 'Patrick', 'role', 'admin'),
            NOW(),
            NOW(),
            NOW()
        );
        
        -- Update users table with new auth_user_id
        UPDATE users 
        SET auth_user_id = v_new_auth_id
        WHERE email = 'patrick@powlax.com';
        
        RAISE NOTICE 'Created auth user for patrick@powlax.com with ID: %', v_new_auth_id;
    ELSE
        -- Get existing auth user id and update users table
        SELECT id INTO v_new_auth_id 
        FROM auth.users 
        WHERE email = 'patrick@powlax.com' 
        LIMIT 1;
        
        UPDATE users 
        SET auth_user_id = v_new_auth_id
        WHERE email = 'patrick@powlax.com';
        
        RAISE NOTICE 'Linked existing auth user: %', v_new_auth_id;
    END IF;
END $$;

-- Step 5: Verify the fix
SELECT 
    'Final patrick@powlax.com status:' as info,
    u.id,
    u.email,
    u.auth_user_id,
    u.role,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Auth user exists'
        ELSE '❌ Auth user missing'
    END as auth_status
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';

-- Step 6: Test if we can now generate a magic link
-- This is just informational - the actual test happens in the application
SELECT 
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ Ready for magic link generation'
        ELSE '❌ Still needs fixing'
    END as magic_link_ready
FROM users u
JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';

COMMIT;

-- ============================================================
-- AFTER RUNNING THIS SCRIPT:
-- 1. Magic links should work for patrick@powlax.com
-- 2. The "Database error finding user" should be resolved
-- 3. Try logging in with patrick@powlax.com on /auth/login
-- ============================================================