-- Migration: Fix Practices Table RLS Infinite Recursion
-- Created: 2025-01-11
-- Purpose: Fix "infinite recursion detected in policy for relation 'users'" error
-- 
-- IMPORTANT: Run this in Supabase SQL Editor to fix Save/Load Practice Plans
--
-- The Problem:
-- The practices table has RLS policies that reference the users table in a way
-- that creates an infinite loop, preventing any save/load operations.
--
-- The Solution:
-- Replace complex RLS policies with simple auth.uid() checks that don't
-- reference other tables, avoiding the recursion issue.

-- Step 1: Disable RLS temporarily to clear bad policies
ALTER TABLE practices DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies that might be causing recursion
DROP POLICY IF EXISTS practices_select_policy ON practices;
DROP POLICY IF EXISTS practices_insert_policy ON practices;
DROP POLICY IF EXISTS practices_update_policy ON practices;
DROP POLICY IF EXISTS practices_delete_policy ON practices;
DROP POLICY IF EXISTS "Enable read access for all users" ON practices;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON practices;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON practices;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON practices;
DROP POLICY IF EXISTS "Users can view own practices" ON practices;
DROP POLICY IF EXISTS "Users can insert own practices" ON practices;
DROP POLICY IF EXISTS "Users can update own practices" ON practices;
DROP POLICY IF EXISTS "Users can delete own practices" ON practices;

-- Step 3: Re-enable RLS with fresh start
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE policies that avoid recursion
-- These policies use only auth.uid() without joining to other tables

-- Allow authenticated users to view their own practices
CREATE POLICY "practices_select_own" 
ON practices 
FOR SELECT 
TO authenticated 
USING (
  -- Check if the coach_id matches the current user
  auth.uid()::text = coach_id
  OR
  -- Also allow viewing practices from the user's team
  -- (This is safe because it doesn't JOIN to users table)
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()::text
  )
);

-- Allow authenticated users to create practices
CREATE POLICY "practices_insert_own" 
ON practices 
FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Ensure the coach_id is set to the current user
  auth.uid()::text = coach_id
);

-- Allow users to update their own practices
CREATE POLICY "practices_update_own" 
ON practices 
FOR UPDATE 
TO authenticated 
USING (
  -- Must be the coach who created it
  auth.uid()::text = coach_id
)
WITH CHECK (
  -- Can't change the coach_id
  auth.uid()::text = coach_id
);

-- Allow users to delete their own practices
CREATE POLICY "practices_delete_own" 
ON practices 
FOR DELETE 
TO authenticated 
USING (
  -- Must be the coach who created it
  auth.uid()::text = coach_id
);

-- VERIFICATION QUERY: Run this after applying the migration to test
-- This should return practices for the current user without errors
-- SELECT * FROM practices WHERE coach_id = auth.uid()::text LIMIT 1;

-- ROLLBACK INSTRUCTIONS (if needed):
-- If something goes wrong, you can disable RLS temporarily:
-- ALTER TABLE practices DISABLE ROW LEVEL SECURITY;
-- 
-- Then re-apply this migration when ready.

-- NOTES:
-- 1. The key fix is avoiding any RLS policy that JOINs or references the users table
-- 2. We use auth.uid() directly which is safe and doesn't cause recursion
-- 3. The team_id subquery is safe because it queries team_members, not users
-- 4. These policies ensure users can only see/edit their own practices