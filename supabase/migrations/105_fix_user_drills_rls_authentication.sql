-- Migration: Fix User Drills RLS Authentication Issues
-- Created: 2025-01-11
-- Purpose: Fix "need to log in" error when creating custom drills
--
-- The Problem:
-- Users are getting authentication errors when trying to create custom drills
-- even though they are logged in. This is due to missing or incorrect RLS policies.

-- Step 1: Ensure the user_drills table exists with proper structure
-- (Skip this if table already exists)
CREATE TABLE IF NOT EXISTS user_drills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 10,
  category TEXT,
  video_url TEXT,
  drill_lab_url_1 TEXT,
  drill_lab_url_2 TEXT,
  drill_lab_url_3 TEXT,
  drill_lab_url_4 TEXT,
  drill_lab_url_5 TEXT,
  game_states TEXT[],
  tags TEXT,
  content TEXT,
  coach_instructions TEXT,
  notes TEXT,
  equipment TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_share INTEGER[],
  club_share INTEGER[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Clear existing policies
ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can create own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can update own drills" ON user_drills;
DROP POLICY IF EXISTS "Users can delete own drills" ON user_drills;
DROP POLICY IF EXISTS "Public drills are viewable by everyone" ON user_drills;

-- Step 3: Enable RLS
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper policies

-- Allow users to view their own drills and public drills
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

-- Allow authenticated users to create drills
CREATE POLICY "user_drills_insert" 
ON user_drills 
FOR INSERT 
TO authenticated 
WITH CHECK (
  user_id = auth.uid()
);

-- Allow users to update their own drills
CREATE POLICY "user_drills_update" 
ON user_drills 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own drills
CREATE POLICY "user_drills_delete" 
ON user_drills 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- VERIFICATION:
-- SELECT * FROM user_drills WHERE user_id = auth.uid();
-- INSERT INTO user_drills (title, user_id) VALUES ('Test Drill', auth.uid());