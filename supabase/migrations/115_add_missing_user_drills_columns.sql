-- Migration: Add Missing Columns to user_drills Table  
-- Created: 2025-01-12
-- Purpose: Fix Custom Drill creation by adding missing columns that AddCustomDrillModal expects
--
-- The Problem:
-- Custom Drill creation fails with "Could not find the 'category' column" error
-- The useUserDrills hook expects columns that don't exist in the current user_drills table
--
-- Expected columns from useUserDrills.createUserDrill():
-- - category, notes, coach_instructions, video_url
-- - drill_lab_url_1 through drill_lab_url_5, equipment, tags, game_states, duration_minutes

-- Check if user_drills table exists, if not create it with all expected columns
CREATE TABLE IF NOT EXISTS user_drills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns that are expected by the code
-- These are the columns that AddCustomDrillModal and useUserDrills try to use
ALTER TABLE user_drills 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS coach_instructions TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_1 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_2 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_3 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_4 TEXT,
ADD COLUMN IF NOT EXISTS drill_lab_url_5 TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS game_states TEXT[],
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_share INTEGER[],
ADD COLUMN IF NOT EXISTS club_share INTEGER[];

-- Add additional columns that useUserDrills expects for compatibility
ALTER TABLE user_drills
ADD COLUMN IF NOT EXISTS drill_types TEXT,
ADD COLUMN IF NOT EXISTS drill_category TEXT,
ADD COLUMN IF NOT EXISTS drill_duration TEXT,
ADD COLUMN IF NOT EXISTS drill_video_url TEXT,
ADD COLUMN IF NOT EXISTS drill_notes TEXT,
ADD COLUMN IF NOT EXISTS drill_emphasis TEXT,
ADD COLUMN IF NOT EXISTS game_phase TEXT,
ADD COLUMN IF NOT EXISTS do_it_ages TEXT,
ADD COLUMN IF NOT EXISTS coach_it_ages TEXT,
ADD COLUMN IF NOT EXISTS own_it_ages TEXT,
ADD COLUMN IF NOT EXISTS vimeo_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Ensure RLS is properly configured
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_drills_select" ON user_drills;
DROP POLICY IF EXISTS "user_drills_insert" ON user_drills;
DROP POLICY IF EXISTS "user_drills_update" ON user_drills;
DROP POLICY IF EXISTS "user_drills_delete" ON user_drills;

-- Create RLS policies
CREATE POLICY "user_drills_select" 
ON user_drills 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid()
  OR is_public = true
  OR team_share @> ARRAY[(
    SELECT team_id::integer 
    FROM team_members 
    WHERE user_id = auth.uid()::text 
    LIMIT 1
  )]
);

CREATE POLICY "user_drills_insert" 
ON user_drills 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_drills_update" 
ON user_drills 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_drills_delete" 
ON user_drills 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace trigger for updated_at
DROP TRIGGER IF EXISTS update_user_drills_updated_at ON user_drills;
CREATE TRIGGER update_user_drills_updated_at
    BEFORE UPDATE ON user_drills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- VERIFICATION QUERIES:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'user_drills' ORDER BY ordinal_position;
-- INSERT INTO user_drills (title, category, duration_minutes, user_id) VALUES ('Test Drill', 'custom', 10, auth.uid());