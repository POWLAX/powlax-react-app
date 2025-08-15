-- SAFE FIX FOR USER CREATION - Checks valid roles first
-- Run this entire script in your Supabase SQL Editor

-- Step 1: First, let's check what valid roles are allowed
DO $$
DECLARE
    valid_roles TEXT;
    admin_role TEXT;
BEGIN
    -- Check the constraint definition to see valid roles
    SELECT pg_get_constraintdef(oid) INTO valid_roles
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND conname LIKE '%role%';
    
    RAISE NOTICE 'Role constraint: %', valid_roles;
    
    -- Try to determine the correct admin role name
    IF valid_roles LIKE '%admin%' AND valid_roles NOT LIKE '%administrator%' THEN
        admin_role := 'admin';
    ELSIF valid_roles LIKE '%coach%' THEN
        admin_role := 'coach';  -- Use coach if admin doesn't exist
    ELSE
        admin_role := 'player';  -- Fallback to player
    END IF;
    
    RAISE NOTICE 'Will use role: % for Patrick', admin_role;
END $$;

-- Step 2: Check current trigger situation
SELECT 
    n.nspname as schema,
    c.relname as table,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' 
  AND c.relname = 'users';

-- Step 3: Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a record in public.users when a new auth user is created
    -- Use minimal columns that we know exist
    INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data->>'role' IN ('admin', 'coach', 'player') 
                THEN NEW.raw_user_meta_data->>'role'
                ELSE 'player'
            END,
            'player'
        ),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (auth_user_id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the auth user creation
        RAISE WARNING 'Failed to create user record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 5: Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Create Patrick's user manually with role detection
DO $$
DECLARE
    patrick_id UUID;
    valid_roles TEXT;
    admin_role TEXT := 'player';  -- Default fallback
BEGIN
    -- Detect valid admin role
    SELECT pg_get_constraintdef(oid) INTO valid_roles
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND conname LIKE '%role%';
    
    -- Determine the correct admin role
    IF valid_roles LIKE '%''admin''%' THEN
        admin_role := 'admin';
    ELSIF valid_roles LIKE '%''coach''%' THEN
        admin_role := 'coach';
    ELSIF valid_roles LIKE '%''player''%' THEN
        admin_role := 'player';
    END IF;
    
    RAISE NOTICE 'Using role: % for Patrick', admin_role;
    
    -- Check if Patrick exists in auth.users
    SELECT id INTO patrick_id 
    FROM auth.users 
    WHERE email = 'patrick@powlax.com';
    
    IF patrick_id IS NULL THEN
        -- Create auth user for Patrick
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
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'patrick@powlax.com',
            crypt('TempPassword123!', gen_salt('bf')),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
            jsonb_build_object(
                'full_name', 'Patrick Chapla',
                'role', admin_role
            ),
            NOW(),
            NOW()
        )
        RETURNING id INTO patrick_id;
        
        RAISE NOTICE 'Created Patrick in auth.users with ID: %', patrick_id;
    ELSE
        RAISE NOTICE 'Patrick already exists in auth.users with ID: %', patrick_id;
    END IF;
    
    -- Insert into public.users with detected role
    INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at)
    VALUES (patrick_id, 'patrick@powlax.com', admin_role, NOW(), NOW())
    ON CONFLICT (auth_user_id) DO UPDATE
    SET role = admin_role, updated_at = NOW();
    
    -- Try to update display_name if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'users' 
               AND column_name = 'display_name') THEN
        UPDATE public.users 
        SET display_name = 'Patrick Chapla'
        WHERE auth_user_id = patrick_id;
    END IF;
    
    RAISE NOTICE 'Patrick user setup complete with role: %', admin_role;
END $$;

-- Step 7: Verify the fix worked
SELECT 
    'Auth Users' as table_type,
    COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as table_type,
    COUNT(*) as count 
FROM public.users;

-- Check Patrick's user specifically
SELECT 
    u.email,
    u.role,
    u.auth_user_id,
    u.created_at,
    CASE WHEN au.id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';

-- Show what roles are actually valid
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS valid_roles
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';

-- Show success message
SELECT '✅ User creation fix complete! Patrick should now be able to login with magic links.' as status;