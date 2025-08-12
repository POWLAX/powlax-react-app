# 🔐 AUTHENTICATION CONTEXT ANALYSIS

## The Core Problem
The app can save drills with service role key, but fails in browser with RLS error.
This means the authentication context in the browser is not working correctly.

## How POWLAX Authentication Works

1. **NO Supabase Auth**: The app does NOT use Supabase Auth (auth.users)
2. **Custom Auth**: Uses public.users table with custom session management
3. **RLS Policies**: Expect auth.uid() but app provides public.users ID
4. **Context Mismatch**: RLS checks auth.uid() which is always NULL

## Current RLS Policy Analysis

### RLS Policies in Database:
```sql

    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename IN ('user_drills', 'user_strategies', 'user_favorites', 'practices')
    ORDER BY tablename, policyname;
  
```

## 🚨 THE REAL ISSUE

### What's Happening:
1. Browser sends request with user_id from public.users
2. RLS policy checks auth.uid() (Supabase Auth)
3. auth.uid() is NULL because no Supabase Auth session
4. RLS blocks the operation

### Why Service Role Works:
Service role key BYPASSES all RLS policies, so it works

## 🔧 THE SOLUTION

We need RLS policies that DON'T rely on auth.uid().
Instead, they should either:
1. Be completely open for authenticated role
2. Check user_id column directly without auth context

### Option 1: Disable RLS (Simplest)
```sql
-- Disable RLS completely (least secure but will work)
ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE practices DISABLE ROW LEVEL SECURITY;
```

### Option 2: Wide-Open RLS Policies
```sql
-- Keep RLS enabled but allow everything
DROP POLICY IF EXISTS "Authenticated users can manage drills" ON user_drills;
CREATE POLICY "Open access" ON user_drills
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage strategies" ON user_strategies;
CREATE POLICY "Open access" ON user_strategies
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage favorites" ON user_favorites;
CREATE POLICY "Open access" ON user_favorites
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage practices" ON practices;
CREATE POLICY "Open access" ON practices
  FOR ALL USING (true) WITH CHECK (true);
```

### Option 3: Use Anon Key in Frontend (Current Approach)
The app currently uses ANON key in the frontend.
With anon key, we need policies that allow anon role:
```sql
-- Allow both anon and authenticated roles
DROP POLICY IF EXISTS "Open access" ON user_drills;
CREATE POLICY "Public access" ON user_drills
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
```

## Current Configuration

### Environment Variables:
NEXT_PUBLIC_SUPABASE_URL: ✅ Set
NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ Set
SUPABASE_SERVICE_ROLE_KEY: ✅ Set (for scripts only)

## Testing with ANON key (like browser does)

❌ INSERT with ANON key FAILED: new row violates row-level security policy for table "user_drills"
   This is why the browser fails!