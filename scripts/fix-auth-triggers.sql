-- Fix Auth Trigger Race Conditions
-- This script makes auth triggers more resilient to prevent user creation failures

-- 1. Fix the user streak data trigger to handle errors gracefully
CREATE OR REPLACE FUNCTION create_user_streak_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create streak data if it doesn't exist
    INSERT INTO user_streak_data (user_id, current_streak, best_streak, last_activity_date)
    VALUES (NEW.id, 0, 0, NULL)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION 
    WHEN others THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Failed to create streak data for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a safer auth user sync function
CREATE OR REPLACE FUNCTION safe_sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to create/update the users table entry
    BEGIN
        INSERT INTO users (
            auth_user_id,
            email,
            display_name,
            role,
            account_type,
            roles,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
            'individual',
            ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'player')]::text[],
            NOW(),
            NOW()
        )
        ON CONFLICT (auth_user_id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
    EXCEPTION
        WHEN others THEN
            -- Log error but continue
            RAISE LOG 'Error syncing auth user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop problematic triggers if they exist
DROP TRIGGER IF EXISTS create_user_streak_data_trigger ON auth.users;
DROP TRIGGER IF EXISTS sync_auth_users_trigger ON auth.users;

-- 4. Recreate triggers with better error handling
CREATE TRIGGER create_user_streak_data_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_streak_data();

CREATE TRIGGER safe_sync_auth_user_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION safe_sync_auth_user();

-- 5. Create a function to manually fix orphaned auth users
CREATE OR REPLACE FUNCTION fix_orphaned_auth_users()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Find auth users without corresponding users table entries
    FOR auth_user IN 
        SELECT au.* 
        FROM auth.users au
        LEFT JOIN public.users u ON u.auth_user_id = au.id
        WHERE u.id IS NULL
    LOOP
        -- Create missing users table entry
        INSERT INTO users (
            auth_user_id,
            email,
            display_name,
            role,
            account_type,
            roles,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.raw_user_meta_data->>'display_name', split_part(auth_user.email, '@', 1)),
            COALESCE(auth_user.raw_user_meta_data->>'role', 'player'),
            'individual',
            ARRAY[COALESCE(auth_user.raw_user_meta_data->>'role', 'player')]::text[],
            auth_user.created_at,
            NOW()
        )
        ON CONFLICT (auth_user_id) DO NOTHING;
        
        RAISE NOTICE 'Fixed orphaned auth user: %', auth_user.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Run the fix for any existing orphaned users
SELECT fix_orphaned_auth_users();

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_streak_data() TO service_role;
GRANT EXECUTE ON FUNCTION safe_sync_auth_user() TO service_role;
GRANT EXECUTE ON FUNCTION fix_orphaned_auth_users() TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Auth triggers have been fixed and made more resilient';
    RAISE NOTICE 'Orphaned auth users have been synced to users table';
    RAISE NOTICE 'User creation should now work without trigger failures';
END $$;