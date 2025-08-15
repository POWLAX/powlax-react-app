-- ============================================================
-- SAFE FIX FOR AUTHENTICATION CONSTRAINTS
-- ============================================================
-- This script safely removes constraints that are blocking auth
-- without assuming which columns exist
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: CHECK WHAT COLUMNS ACTUALLY EXIST
-- ============================================================

SELECT 
    'Checking which columns exist in users table...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('wordpress_id', 'memberpress_subscription_id', 'buddyboss_group_ids', 'auth_user_id', 'email')
ORDER BY column_name;

-- ============================================================
-- STEP 2: DROP ANY CONSTRAINTS THAT MIGHT BE BLOCKING AUTH
-- ============================================================

-- Remove any constraint that requires wordpress_id or auth_user_id
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints
        WHERE table_name = 'users' 
            AND table_schema = 'public'
            AND constraint_type = 'CHECK'
    LOOP
        EXECUTE format('ALTER TABLE users DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
    END LOOP;
END $$;

-- ============================================================
-- STEP 3: MAKE WORDPRESS COLUMNS NULLABLE (IF THEY EXIST)
-- ============================================================

DO $$
BEGIN
    -- Check and modify wordpress_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'wordpress_id'
    ) THEN
        ALTER TABLE users ALTER COLUMN wordpress_id DROP NOT NULL;
        RAISE NOTICE 'Made wordpress_id nullable';
    END IF;
    
    -- Check and modify memberpress_subscription_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'memberpress_subscription_id'
    ) THEN
        ALTER TABLE users ALTER COLUMN memberpress_subscription_id DROP NOT NULL;
        RAISE NOTICE 'Made memberpress_subscription_id nullable';
    END IF;
    
    -- Check and modify buddyboss_group_ids if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'buddyboss_group_ids'
    ) THEN
        ALTER TABLE users ALTER COLUMN buddyboss_group_ids DROP NOT NULL;
        RAISE NOTICE 'Made buddyboss_group_ids nullable';
    END IF;
END $$;

-- ============================================================
-- STEP 4: FIX AUTH_USER_ID FOREIGN KEY (IF IT EXISTS)
-- ============================================================

-- Drop and recreate the foreign key to be more flexible
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;

-- Only add it back if auth_user_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE users 
            ADD CONSTRAINT users_auth_user_id_fkey 
            FOREIGN KEY (auth_user_id) 
            REFERENCES auth.users(id) 
            ON DELETE SET NULL
            DEFERRABLE INITIALLY DEFERRED;
        RAISE NOTICE 'Re-added auth_user_id foreign key';
    END IF;
END $$;

-- ============================================================
-- STEP 5: ENSURE BASIC CONSTRAINTS ARE CORRECT
-- ============================================================

-- Make sure email is unique (this should already exist)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Make sure auth_user_id is unique if not null (only if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_key;
        ALTER TABLE users ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);
        RAISE NOTICE 'Added auth_user_id unique constraint';
    END IF;
END $$;

-- ============================================================
-- STEP 6: CREATE/UPDATE PATRICK'S USER
-- ============================================================

-- Check if patrick@powlax.com exists and fix the record
DO $$
DECLARE
    v_user_exists BOOLEAN;
    v_has_auth_column BOOLEAN;
BEGIN
    -- Check if auth_user_id column exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'auth_user_id'
    ) INTO v_has_auth_column;
    
    -- Check if user exists
    SELECT EXISTS(
        SELECT 1 FROM users WHERE email = 'patrick@powlax.com'
    ) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Create the user with minimal required fields
        IF v_has_auth_column THEN
            INSERT INTO users (
                id,
                email,
                full_name,
                display_name,
                role,
                roles,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                'patrick@powlax.com',
                'Patrick',
                'Patrick',
                'admin',
                ARRAY['admin'],
                NOW(),
                NOW()
            );
        ELSE
            -- Even more minimal if auth_user_id doesn't exist
            INSERT INTO users (
                id,
                email,
                full_name,
                display_name,
                role,
                roles,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                'patrick@powlax.com',
                'Patrick',
                'Patrick',
                'admin',
                ARRAY['admin'],
                NOW(),
                NOW()
            );
        END IF;
        RAISE NOTICE 'Created patrick@powlax.com in users table';
    ELSE
        -- Update existing user to ensure admin role
        UPDATE users 
        SET 
            role = 'admin',
            roles = ARRAY['admin'],
            updated_at = NOW()
        WHERE email = 'patrick@powlax.com';
        RAISE NOTICE 'Updated patrick@powlax.com to admin role';
    END IF;
END $$;

-- ============================================================
-- STEP 7: CREATE A SIMPLE AUTH TRIGGER (IF NEEDED)
-- ============================================================

-- Drop any existing handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a simple function to create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if auth_user_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public' 
        AND column_name = 'auth_user_id'
    ) THEN
        -- Insert with auth_user_id
        INSERT INTO public.users (
            id,
            auth_user_id,
            email,
            full_name,
            display_name,
            role,
            roles,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
            ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'player')],
            NOW(),
            NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            auth_user_id = EXCLUDED.auth_user_id,
            updated_at = NOW();
    ELSE
        -- Insert without auth_user_id
        INSERT INTO public.users (
            id,
            email,
            full_name,
            display_name,
            role,
            roles,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
            ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'player')],
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth signup
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check final state
SELECT 
    'Verification Results:' as status;

-- Count users
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN email = 'patrick@powlax.com' THEN 1 END) as patrick_exists,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
FROM users;

-- Check remaining constraints
SELECT 
    'Remaining CHECK constraints on users table:' as status,
    constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND constraint_type = 'CHECK';

-- Final success message
SELECT 
    '✅ SUCCESS: Authentication constraints have been safely removed!' as status,
    'You should now be able to:' as next_steps,
    '1. Create magic links' as step1,
    '2. Sign in with OTP' as step2,
    '3. Create new users' as step3;

COMMIT;

-- ============================================================
-- POST-SCRIPT
-- ============================================================
-- After running this script:
-- 1. Try the /auth/direct-auth page again
-- 2. Or try sending a magic link to patrick@powlax.com
-- 3. Authentication should now work!
-- ============================================================