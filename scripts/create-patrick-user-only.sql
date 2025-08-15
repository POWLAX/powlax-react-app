-- STEP 5 ONLY: Create Patrick's user with automatic role detection
-- This assumes you've already run steps 1-4 from fix-user-creation-full.sql

DO $$
DECLARE
    patrick_id UUID;
    valid_roles TEXT;
    admin_role TEXT := 'player';  -- Default fallback
BEGIN
    -- First, detect what roles are valid in your database
    SELECT pg_get_constraintdef(oid) INTO valid_roles
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND conname LIKE '%role%';
    
    RAISE NOTICE 'Found role constraint: %', valid_roles;
    
    -- Determine the correct admin role based on the constraint
    IF valid_roles LIKE '%''admin''%' THEN
        admin_role := 'admin';
        RAISE NOTICE 'Found "admin" role in constraint';
    ELSIF valid_roles LIKE '%''coach''%' THEN
        admin_role := 'coach';
        RAISE NOTICE 'No "admin" role found, using "coach"';
    ELSIF valid_roles LIKE '%''player''%' THEN
        admin_role := 'player';
        RAISE NOTICE 'Only "player" role found, using that';
    END IF;
    
    RAISE NOTICE 'Will use role: "%" for Patrick', admin_role;
    
    -- Check if Patrick already exists in auth.users
    SELECT id INTO patrick_id 
    FROM auth.users 
    WHERE email = 'patrick@powlax.com';
    
    IF patrick_id IS NULL THEN
        -- Create auth user for Patrick
        RAISE NOTICE 'Creating new auth user for patrick@powlax.com...';
        
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
        
        RAISE NOTICE '✅ Created Patrick in auth.users with ID: %', patrick_id;
    ELSE
        RAISE NOTICE '✅ Patrick already exists in auth.users with ID: %', patrick_id;
    END IF;
    
    -- Now ensure Patrick exists in public.users with minimal required fields
    RAISE NOTICE 'Creating/updating user in public.users table...';
    
    INSERT INTO public.users (
        auth_user_id, 
        email, 
        role, 
        created_at, 
        updated_at
    ) VALUES (
        patrick_id, 
        'patrick@powlax.com', 
        admin_role, 
        NOW(), 
        NOW()
    )
    ON CONFLICT (auth_user_id) DO UPDATE
    SET 
        role = admin_role, 
        updated_at = NOW();
    
    RAISE NOTICE '✅ User record created/updated in public.users';
    
    -- Try to update optional fields if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'users' 
               AND column_name = 'display_name') THEN
        UPDATE public.users 
        SET display_name = 'Patrick Chapla'
        WHERE auth_user_id = patrick_id;
        RAISE NOTICE '✅ Updated display_name';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'users' 
               AND column_name = 'full_name') THEN
        UPDATE public.users 
        SET full_name = 'Patrick Chapla'
        WHERE auth_user_id = patrick_id;
        RAISE NOTICE '✅ Updated full_name';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PATRICK USER SETUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: patrick@powlax.com';
    RAISE NOTICE 'Role: %', admin_role;
    RAISE NOTICE 'Auth ID: %', patrick_id;
    RAISE NOTICE '';
    RAISE NOTICE 'You can now use magic links to login!';
END $$;

-- Verify Patrick was created successfully
SELECT 
    u.email,
    u.role,
    u.auth_user_id,
    u.created_at,
    CASE WHEN au.id IS NOT NULL THEN '✅ Linked to auth.users' ELSE '❌ Not linked' END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';

-- Show what role was used
SELECT 
    'Role Constraint' as info,
    pg_get_constraintdef(oid) AS valid_roles
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND contype = 'c'
  AND conname LIKE '%role%';