# RLS Policy Fix Instructions for Save/Load Practice Plans

## Steps to Fix in Supabase Dashboard:

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/[your-project-id]

2. **Navigate to SQL Editor** (left sidebar)

3. **Run this SQL to fix the practices table RLS:**

```sql
-- Step 1: Disable RLS temporarily to clear bad policies
ALTER TABLE practices DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing problematic policies
DROP POLICY IF EXISTS practices_select_policy ON practices;
DROP POLICY IF EXISTS practices_insert_policy ON practices;
DROP POLICY IF EXISTS practices_update_policy ON practices;
DROP POLICY IF EXISTS practices_delete_policy ON practices;

-- Step 3: Re-enable RLS
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Allow users to read their own practices
CREATE POLICY "Users can view own practices" 
ON practices FOR SELECT 
TO authenticated 
USING (auth.uid()::text = coach_id);

-- Allow users to insert their own practices
CREATE POLICY "Users can insert own practices" 
ON practices FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = coach_id);

-- Allow users to update their own practices
CREATE POLICY "Users can update own practices" 
ON practices FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = coach_id)
WITH CHECK (auth.uid()::text = coach_id);

-- Allow users to delete their own practices
CREATE POLICY "Users can delete own practices" 
ON practices FOR DELETE 
TO authenticated 
USING (auth.uid()::text = coach_id);
```

4. **Click "Run" to execute the SQL**

5. **Test the fix:**
   - Go back to your Practice Planner
   - Try to save a practice plan
   - Try to load saved practices

## Alternative: Temporary Testing (Less Secure)

If you just want to test functionality without auth:

```sql
-- TEMPORARY: Allow all authenticated users (for testing only!)
ALTER TABLE practices DISABLE ROW LEVEL SECURITY;

-- When done testing, re-enable with:
-- ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
```

## Note:
The error "infinite recursion detected in policy for relation 'users'" happens when RLS policies reference the users table in a way that creates a loop. The fix above avoids this by using simple auth.uid() checks.