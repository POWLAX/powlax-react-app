-- Migration: Fix User Strategies RLS Authentication Issues
-- Created: 2025-01-11
-- Purpose: Fix authentication errors when creating custom strategies
--
-- The Problem:
-- Custom strategy creation is failing due to RLS policy issues
-- Users can't save strategies even when logged in

-- Step 1: Ensure the user_strategies table exists with proper structure
CREATE TABLE IF NOT EXISTS user_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name TEXT NOT NULL,
  strategy_categories TEXT,
  description TEXT,
  lacrosse_lab_links JSONB,
  embed_codes JSONB,
  see_it_ages TEXT,  -- Note: Should be changed to "do_it_ages" in future migration
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT false,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id INTEGER,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_share INTEGER[],
  club_share INTEGER[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Clear existing policies
ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can create own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can update own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Users can delete own strategies" ON user_strategies;
DROP POLICY IF EXISTS "Public strategies are viewable by everyone" ON user_strategies;

-- Step 3: Enable RLS
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper policies

-- Allow users to view their own strategies and public strategies
CREATE POLICY "user_strategies_select" 
ON user_strategies 
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

-- Allow authenticated users to create strategies
CREATE POLICY "user_strategies_insert" 
ON user_strategies 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own strategies
CREATE POLICY "user_strategies_update" 
ON user_strategies 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own strategies
CREATE POLICY "user_strategies_delete" 
ON user_strategies 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- VERIFICATION:
-- SELECT * FROM user_strategies WHERE user_id = auth.uid();
-- INSERT INTO user_strategies (strategy_name, user_id) VALUES ('Test Strategy', auth.uid());