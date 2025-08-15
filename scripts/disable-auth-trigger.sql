-- DISABLE AUTH TRIGGER TEMPORARILY
-- This will allow magic links to work without auth.users creation

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the function (it's causing the issue)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Verify Patrick exists in public.users (this should work fine)
SELECT 
    email,
    role,
    auth_user_id,
    created_at,
    'Ready for magic link authentication' as status
FROM public.users 
WHERE email = 'patrick@powlax.com';

-- Step 4: Show current magic links for Patrick
SELECT 
    token,
    email,
    created_at,
    expires_at,
    CASE 
        WHEN expires_at > NOW() THEN '✅ Valid'
        ELSE '❌ Expired'
    END as status
FROM magic_links 
WHERE email = 'patrick@powlax.com'
ORDER BY created_at DESC
LIMIT 3;