-- Fix RLS permissions for Skills Academy tables
-- This allows public read access to drill and workout data

-- Disable RLS on skills_academy_drills (simplest approach for development)
ALTER TABLE skills_academy_drills DISABLE ROW LEVEL SECURITY;

-- Disable RLS on skills_academy_workouts
ALTER TABLE skills_academy_workouts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on skills_academy_series
ALTER TABLE skills_academy_series DISABLE ROW LEVEL SECURITY;

-- Alternative: Create read-only policies if you prefer to keep RLS enabled
-- CREATE POLICY "Allow public read access" ON skills_academy_drills
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow public read access" ON skills_academy_workouts
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow public read access" ON skills_academy_series
--   FOR SELECT USING (true);