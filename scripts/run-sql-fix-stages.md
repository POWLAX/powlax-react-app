# SQL Fix Execution Guide

**IMPORTANT**: Run these in your Supabase SQL Editor in order.

## Stage 1: Check Current State

```sql
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
```

## Stage 2: Create Fix Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
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
        RAISE WARNING 'Failed to create user record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Stage 3: Install Trigger

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

## Stage 4: Create Patrick's Account

```sql
DO $$
DECLARE
    patrick_id UUID;
BEGIN
    SELECT id INTO patrick_id 
    FROM auth.users 
    WHERE email = 'patrick@powlax.com';
    
    IF patrick_id IS NULL THEN
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
                'role', 'admin',
                'is_admin', true
            ),
            NOW(),
            NOW()
        )
        RETURNING id INTO patrick_id;
        
        RAISE NOTICE 'Created Patrick in auth.users with ID: %', patrick_id;
    ELSE
        RAISE NOTICE 'Patrick already exists in auth.users with ID: %', patrick_id;
    END IF;
    
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
        patrick_id,
        'patrick@powlax.com',
        'admin',
        true,
        'Patrick Chapla',
        'Patrick Chapla',
        NOW(),
        NOW()
    )
    ON CONFLICT (auth_user_id) DO UPDATE
    SET 
        role = 'admin',
        is_admin = true,
        updated_at = NOW();
    
    RAISE NOTICE 'Patrick user setup complete!';
END $$;
```

## Stage 5: Verify Success

```sql
SELECT 
    'Auth Users' as table_type,
    COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as table_type,
    COUNT(*) as count 
FROM public.users;
```

```sql
SELECT 
    u.email,
    u.role,
    u.is_admin,
    u.auth_user_id,
    CASE WHEN au.id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.email = 'patrick@powlax.com';
```

```sql
SELECT '✅ User creation fix complete! Patrick should now be able to login with magic links.' as status;
```
