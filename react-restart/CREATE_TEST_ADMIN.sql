-- Create a test admin user in Supabase Auth
-- Run this in the Supabase SQL editor

-- First, create the user in auth.users (if not exists)
-- Note: You'll need to create the user through Supabase Auth first
-- Go to Authentication > Users > Add User in Supabase Dashboard
-- Email: admin@powlax.local
-- Password: testadmin123

-- After creating the user in Supabase Auth, run this to add admin role:

-- Get the user ID (replace with actual ID after creating user)
-- You can find this in Authentication > Users in Supabase Dashboard
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID by email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'admin@powlax.local'
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    -- Insert or update the user in the public.users table with admin role
    INSERT INTO public.users (id, email, roles, created_at, updated_at)
    VALUES (
      user_id,
      'admin@powlax.local',
      ARRAY['admin'],
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET roles = ARRAY['admin'],
        updated_at = NOW();
    
    RAISE NOTICE 'Admin user created/updated successfully with ID: %', user_id;
  ELSE
    RAISE NOTICE 'User not found. Please create the user in Supabase Auth first.';
  END IF;
END $$;

-- Verify the user was created
SELECT id, email, roles FROM public.users WHERE email = 'admin@powlax.local';