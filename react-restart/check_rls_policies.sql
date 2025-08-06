-- Check RLS status and policies for skills_academy_drills table
-- Run this in your Supabase SQL Editor

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'skills_academy_drills';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'skills_academy_drills';

-- If RLS is enabled but no policies exist, add a permissive read policy
-- ONLY run this if the above queries show RLS is enabled but no read policies exist:

-- CREATE POLICY "Allow public read access to skills academy drills" 
-- ON skills_academy_drills FOR SELECT 
-- USING (true);