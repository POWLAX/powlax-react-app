# 🚨 FIX FOR PRACTICE PLANNER SAVE/LOAD ISSUES

## Problem Identified
The Save/Load functionality in Practice Planner is failing because:
1. The `practices` table has `created_by` column that references `auth.users(id)`
2. But there are NO users in the `auth.users` table (0 auth users found)
3. The app is using IDs from `public.users` table instead
4. This causes a foreign key constraint violation when trying to save

## Root Cause
- The authentication system uses `public.users` table for user data
- The `SupabaseAuthContext` returns `public.users` IDs (not auth.users IDs)
- Migration 111 created a foreign key to `auth.users(id)` which doesn't match our setup

## Solution: Run Migration 112

### Option 1: Via Supabase Dashboard (RECOMMENDED)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/112_fix_practices_public_users_fkey.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run**

### Option 2: Direct SQL
Copy and run this SQL in Supabase Dashboard:

```sql
-- Drop the incorrect foreign key constraint
ALTER TABLE practices 
DROP CONSTRAINT IF EXISTS practices_created_by_fkey;

-- Add correct foreign key to public.users
ALTER TABLE practices
ADD CONSTRAINT practices_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Fix coach_id foreign key too
ALTER TABLE practices
DROP CONSTRAINT IF EXISTS practices_coach_id_fkey;

ALTER TABLE practices
ADD CONSTRAINT practices_coach_id_fkey
FOREIGN KEY (coach_id)
REFERENCES public.users(id)
ON DELETE SET NULL;

-- Update RLS policy to work with public.users
DROP POLICY IF EXISTS "Users can manage their own practices" ON practices;

CREATE POLICY "Users can manage their own practices" ON practices
    FOR ALL 
    TO authenticated 
    USING (
      created_by IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      created_by IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    );

-- Update existing practices
UPDATE practices p
SET created_by = u.id
FROM public.users u
WHERE p.coach_id = u.id
AND p.created_by IS NULL;
```

## What This Fixes
1. ✅ Changes `created_by` to reference `public.users(id)` instead of `auth.users(id)`
2. ✅ Updates RLS policy to work with public.users table
3. ✅ Fixes coach_id foreign key as well
4. ✅ Updates existing practice records to have correct created_by values

## Testing After Fix
1. Log in with chaplalalacrosse22@gmail.com
2. Go to Practice Planner
3. Create a practice plan with some drills
4. Click **Save Practice**
5. Enter a name and save
6. Click **Load Practice** 
7. You should see your saved practice

## Code Updates Already Applied
- ✅ Updated `usePracticePlans.ts` to include `created_by: user?.id` when saving
- ✅ Hook already uses correct user ID from `useAuth` context

## If Still Having Issues
1. Check browser console for errors
2. Verify you're logged in (check for user email in top bar)
3. Try clearing browser cache and refreshing
4. Check that the migration ran successfully in Supabase

## Summary
The core issue is that we're using a custom authentication system with `public.users` table, not Supabase Auth's `auth.users` table. Migration 112 fixes the foreign key constraints to match our actual authentication setup.

After running Migration 112, the Save/Load functionality should work correctly!