-- FIX FOR USER CREATION ISSUE
-- The problem: sync_auth_users_to_users only handles UPDATE, not INSERT
-- We need to create a trigger for INSERT or modify the existing function

-- Option 1: Create a new trigger function for INSERT
CREATE OR REPLACE FUNCTION public.handle_new_auth_user() 
RETURNS trigger AS $$
BEGIN
  -- When a new auth user is created, create corresponding users record
  INSERT INTO public.users (
    id,
    auth_user_id,
    email,
    display_name,
    role,
    created_at,
    updated_at,
    metadata,
    roles
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
    NOW(),
    NOW(),
    '{}',
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'player')]
  )
  ON CONFLICT (auth_user_id) DO NOTHING; -- Prevent duplicates
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the INSERT trigger
CREATE TRIGGER handle_new_auth_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Option 2: Fix the existing sync function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_users()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Handle new user creation
    INSERT INTO public.users (
      id,
      auth_user_id,
      email,
      display_name,
      role,
      created_at,
      updated_at,
      metadata,
      roles
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
      NOW(),
      NOW(),
      '{}',
      ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'player')]
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle user updates
    UPDATE public.users
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE auth_user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger and recreate it to handle both INSERT and UPDATE
DROP TRIGGER IF EXISTS sync_auth_users_trigger ON auth.users;

CREATE TRIGGER sync_auth_users_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_users_to_users();

-- Now try creating Patrick's user
-- This should work with the fixed trigger
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
  jsonb_build_object('full_name', 'Patrick Chapla', 'role', 'administrator'),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the user was created in both tables
SELECT 'Auth User:' as table_name, id, email FROM auth.users WHERE email = 'patrick@powlax.com'
UNION ALL
SELECT 'App User:' as table_name, id::text, email FROM public.users WHERE email = 'patrick@powlax.com';