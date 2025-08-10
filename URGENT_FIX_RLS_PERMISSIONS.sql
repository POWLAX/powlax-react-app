-- URGENT: Fix Skills Academy Video Issues
-- Problem: Videos are not loading because anonymous users cannot access the database tables
-- Solution: Run this SQL in your Supabase Dashboard SQL Editor

-- ============================================
-- CRITICAL FIX: Disable RLS on Skills Academy Tables
-- ============================================
-- This allows public read access to drill and workout data
-- Without this, the app will use fallback data with fake video IDs

-- 1. Disable RLS on skills_academy_drills (contains video URLs)
ALTER TABLE skills_academy_drills DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on skills_academy_workouts (contains workout definitions)
ALTER TABLE skills_academy_workouts DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on skills_academy_series (contains series metadata)
ALTER TABLE skills_academy_series DISABLE ROW LEVEL SECURITY;

-- 4. Optional: Also disable on related tables for consistency
ALTER TABLE skills_academy_workout_drills DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills_academy_user_progress DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVE: If you prefer to keep RLS enabled
-- ============================================
-- Use these policies instead (but disabling RLS is simpler for development)

-- CREATE POLICY "Allow public read access to drills" 
-- ON skills_academy_drills FOR SELECT 
-- USING (true);

-- CREATE POLICY "Allow public read access to workouts" 
-- ON skills_academy_workouts FOR SELECT 
-- USING (true);

-- CREATE POLICY "Allow public read access to series" 
-- ON skills_academy_series FOR SELECT 
-- USING (true);

-- ============================================
-- TEST: Verify the fix worked
-- ============================================
-- After running the above, test with this query:
-- It should return 5 drill records

SELECT id, title, video_url, vimeo_id 
FROM skills_academy_drills 
WHERE id IN (1, 2, 3, 4, 5)
LIMIT 5;

-- You should see drills with video_urls like:
-- https://vimeo.com/1000143414
-- https://vimeo.com/995813226
-- etc.

-- If this returns data, the videos will work in the app!