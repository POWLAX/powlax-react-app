-- COMPLETE FIX FOR USER CREATION ISSUE
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Check current trigger situation
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

-- Step 2: First check what columns exist in the users table
DO $$
DECLARE
    has_is_admin BOOLEAN;
    has_full_name BOOLEAN;
    has_display_name BOOLEAN;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_admin'
    ) INTO has_is_admin;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'full_name'
    ) INTO has_full_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'display_name'
    ) INTO has_display_name;
    
    RAISE NOTICE 'Column check - is_admin: %, full_name: %, display_name: %', 
        has_is_admin, has_full_name, has_display_name;
END $$;

-- Create or replace the function that handles new user creation
-- This version adapts to whatever columns actually exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    insert_query TEXT;
BEGIN
    -- Build dynamic insert based on existing columns
    insert_query := 'INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at';
    
    -- Add optional columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        insert_query := insert_query || ', full_name';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        insert_query := insert_query || ', display_name';
    END IF;
    
    insert_query := insert_query || ') VALUES ($1, $2, $3, $4, $5';
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        insert_query := insert_query || ', $6';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        insert_query := insert_query || ', $7';
    END IF;
    
    insert_query := insert_query || ') ON CONFLICT (auth_user_id) DO UPDATE SET email = EXCLUDED.email, updated_at = EXCLUDED.updated_at';
    
    -- Execute the dynamic query
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        EXECUTE insert_query USING 
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
            NEW.created_at,
            NEW.updated_at,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        EXECUTE insert_query USING 
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
            NEW.created_at,
            NEW.updated_at,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    ELSE
        -- Minimal insert with only required columns
        INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at)
        VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'player'), NEW.created_at, NEW.updated_at)
        ON CONFLICT (auth_user_id) DO UPDATE
        SET email = EXCLUDED.email, updated_at = EXCLUDED.updated_at;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't fail the auth user creation
        RAISE WARNING 'Failed to create user record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create new trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create Patrick's user manually (adapted to actual table structure)
DO $$
DECLARE
    patrick_id UUID;
    insert_stmt TEXT;
    update_stmt TEXT;
BEGIN
    -- First, check if Patrick exists in auth.users
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
                'role', 'admin'
            ),
            NOW(),
            NOW()
        )
        RETURNING id INTO patrick_id;
        
        RAISE NOTICE 'Created Patrick in auth.users with ID: %', patrick_id;
    ELSE
        RAISE NOTICE 'Patrick already exists in auth.users with ID: %', patrick_id;
    END IF;
    
    -- Build dynamic insert for public.users based on existing columns
    insert_stmt := 'INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at';
    update_stmt := 'role = ''admin'', updated_at = NOW()';
    
    -- Check for optional columns and add them if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        insert_stmt := insert_stmt || ', full_name';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        insert_stmt := insert_stmt || ', display_name';
    END IF;
    
    insert_stmt := insert_stmt || ') VALUES ($1, $2, $3, $4, $5';
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        insert_stmt := insert_stmt || ', $6';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
            insert_stmt := insert_stmt || ', $7';
        ELSE
            insert_stmt := insert_stmt || ', $6';
        END IF;
    END IF;
    
    insert_stmt := insert_stmt || ') ON CONFLICT (auth_user_id) DO UPDATE SET ' || update_stmt;
    
    -- Execute the dynamic insert
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        EXECUTE insert_stmt USING 
            patrick_id,
            'patrick@powlax.com',
            'admin',
            NOW(),
            NOW(),
            'Patrick Chapla',
            'Patrick Chapla';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
        EXECUTE insert_stmt USING 
            patrick_id,
            'patrick@powlax.com',
            'admin',
            NOW(),
            NOW(),
            'Patrick Chapla';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'display_name') THEN
        EXECUTE insert_stmt USING 
            patrick_id,
            'patrick@powlax.com',
            'admin',
            NOW(),
            NOW(),
            'Patrick Chapla';
    ELSE
        -- Minimal insert with only required columns
        INSERT INTO public.users (auth_user_id, email, role, created_at, updated_at)
        VALUES (patrick_id, 'patrick@powlax.com', 'admin', NOW(), NOW())
        ON CONFLICT (auth_user_id) DO UPDATE
        SET role = 'admin', updated_at = NOW();
    END IF;
    
    RAISE NOTICE 'Patrick user setup complete!';
END $$;

-- Step 6: Verify the fix worked
SELECT 
    'Auth Users' as table_type,
    COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as table_type,
    COUNT(*) as count 
FROM public.users;

-- Check Patrick's user specifically (only using columns that exist)
SELECT 
    u.email,
    u.role,
    u.auth_user_id,
    u.created_at,
    u.updated_at,
    CASE WHEN au.id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';

-- Show success message
SELECT '✅ User creation fix complete! Patrick should now be able to login with magic links.' as status;