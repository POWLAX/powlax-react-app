-- ============================================================
-- REMOVE WORDPRESS/MEMBERPRESS AUTHENTICATION BLOCKS
-- ============================================================
-- This script removes all WordPress/MemberPress related
-- constraints, triggers, and functions that are blocking
-- native Supabase authentication from working properly
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: DIAGNOSE THE ISSUES
-- ============================================================

-- Check existing constraints on users table
SELECT 
    'Current constraints on users table:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users' 
    AND table_schema = 'public';

-- Check for WordPress-related columns
SELECT 
    'WordPress-related columns in users table:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND (
        column_name LIKE '%wordpress%' 
        OR column_name LIKE '%memberpress%'
        OR column_name LIKE '%buddyboss%'
    );

-- Check for triggers on users table
SELECT 
    'Triggers on users table:' as info,
    tgname as trigger_name
FROM pg_trigger
WHERE tgrelid = 'public.users'::regclass;

-- Check for WordPress-related functions
SELECT 
    'WordPress-related functions:' as info,
    proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND (
        proname LIKE '%wordpress%' 
        OR proname LIKE '%memberpress%'
        OR proname = 'upsert_wordpress_user'
        OR proname = 'handle_new_user'
    );

-- ============================================================
-- STEP 2: REMOVE WORDPRESS CONSTRAINTS
-- ============================================================

-- Remove the constraint that requires wordpress_id OR auth_user_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_auth_source;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_auth_source_constraint;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_source_check;

-- Log what we removed
DO $$ 
BEGIN
    RAISE NOTICE 'Removed WordPress authentication constraints from users table';
END $$;

-- ============================================================
-- STEP 3: REMOVE WORDPRESS FUNCTIONS
-- ============================================================

-- Drop WordPress user sync function
DROP FUNCTION IF EXISTS upsert_wordpress_user CASCADE;
DROP FUNCTION IF EXISTS sync_wordpress_user CASCADE;
DROP FUNCTION IF EXISTS handle_wordpress_user CASCADE;
DROP FUNCTION IF EXISTS migrate_wordpress_user CASCADE;

-- Log what we removed
DO $$ 
BEGIN
    RAISE NOTICE 'Removed WordPress sync functions';
END $$;

-- ============================================================
-- STEP 4: REMOVE OR FIX TRIGGERS
-- ============================================================

-- Check if there's a trigger that might be causing issues
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'public.users'::regclass
            AND tgname LIKE '%wordpress%' OR tgname LIKE '%sync%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON users', trigger_rec.tgname);
        RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- ============================================================
-- STEP 5: CLEAN UP WORDPRESS COLUMNS (OPTIONAL)
-- ============================================================

-- Comment these out if you want to keep the WordPress data
-- ALTER TABLE users DROP COLUMN IF EXISTS wordpress_id CASCADE;
-- ALTER TABLE users DROP COLUMN IF EXISTS memberpress_subscription_id CASCADE;
-- ALTER TABLE users DROP COLUMN IF EXISTS buddyboss_group_ids CASCADE;
-- ALTER TABLE users DROP COLUMN IF EXISTS migration_source CASCADE;

-- Instead, let's just make them nullable without constraints
ALTER TABLE users ALTER COLUMN wordpress_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN memberpress_subscription_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN buddyboss_group_ids DROP NOT NULL;

-- ============================================================
-- STEP 6: FIX AUTH_USER_ID FOREIGN KEY
-- ============================================================

-- Drop and recreate the foreign key to be more flexible
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;

-- Re-add it but make it DEFERRABLE for migrations
ALTER TABLE users 
    ADD CONSTRAINT users_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

-- ============================================================
-- STEP 7: ENSURE BASIC CONSTRAINTS ARE CORRECT
-- ============================================================

-- Make sure email is unique (this should already exist)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Make sure auth_user_id is unique if not null
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_user_id_key;
ALTER TABLE users ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);

-- ============================================================
-- STEP 8: CREATE A SIMPLE AUTH TRIGGER (REPLACE WORDPRESS ONE)
-- ============================================================

-- Drop any existing handle_new_user function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a simple function to create user record on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create if email doesn't already exist
    INSERT INTO public.users (
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
        updated_at = NOW()
    WHERE users.auth_user_id IS NULL; -- Only update if not already linked
    
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
-- STEP 9: FIX EXISTING DATA
-- ============================================================

-- Update any users without auth_user_id to prevent constraint issues
-- This is safe because we removed the constraint requiring one or the other
UPDATE users 
SET updated_at = NOW()
WHERE auth_user_id IS NULL AND wordpress_id IS NULL;

-- ============================================================
-- STEP 10: CREATE PATRICK'S USER IF NEEDED
-- ============================================================

-- Check if patrick@powlax.com exists
DO $$
DECLARE
    v_user_exists BOOLEAN;
    v_auth_id UUID;
BEGIN
    -- Check if user exists in public.users
    SELECT EXISTS(
        SELECT 1 FROM users WHERE email = 'patrick@powlax.com'
    ) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Create the user
        INSERT INTO users (
            email,
            full_name,
            display_name,
            role,
            roles,
            created_at,
            updated_at
        ) VALUES (
            'patrick@powlax.com',
            'Patrick',
            'Patrick',
            'admin',
            ARRAY['admin'],
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created patrick@powlax.com in users table';
    ELSE
        -- Make sure role is admin
        UPDATE users 
        SET 
            role = 'admin',
            roles = ARRAY['admin'],
            updated_at = NOW()
        WHERE email = 'patrick@powlax.com'
            AND role != 'admin';
        RAISE NOTICE 'patrick@powlax.com already exists';
    END IF;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Show final state
SELECT 
    'Final verification - Users table constraints:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN wordpress_id IS NOT NULL THEN 1 END) as wordpress_users,
    COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as auth_linked_users,
    COUNT(CASE WHEN email = 'patrick@powlax.com' THEN 1 END) as patrick_exists
FROM users;

-- Show if there are any constraint violations remaining
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS: All WordPress constraints removed!'
        ELSE '⚠️ WARNING: Some issues may remain'
    END as status
FROM information_schema.table_constraints
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND constraint_name LIKE '%wordpress%' OR constraint_name LIKE '%auth_source%';

COMMIT;

-- ============================================================
-- POST-SCRIPT INSTRUCTIONS
-- ============================================================
-- After running this script:
-- 1. Try creating a magic link for patrick@powlax.com
-- 2. If it still fails, check the Supabase logs for the specific error
-- 3. The auth system should now work without WordPress dependencies
-- ============================================================