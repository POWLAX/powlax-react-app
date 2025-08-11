-- Migration: Fix User Favorites RLS Authentication Issues
-- Created: 2025-01-11
-- Purpose: Fix "need to log in" error when using favorites feature
--
-- The Problem:
-- Users are getting authentication errors when trying to favorite drills/strategies
-- even though they are logged in. The user_favorites table may not exist or have proper RLS.

-- Step 1: Create the user_favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('drill', 'strategy')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item ON user_favorites(item_id, item_type);

-- Step 3: Clear existing policies
ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can create own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;

-- Step 4: Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Step 5: Create proper policies

-- Allow users to view only their own favorites
CREATE POLICY "user_favorites_select" 
ON user_favorites 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Allow authenticated users to create favorites
CREATE POLICY "user_favorites_insert" 
ON user_favorites 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own favorites
CREATE POLICY "user_favorites_delete" 
ON user_favorites 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- VERIFICATION:
-- SELECT * FROM user_favorites WHERE user_id = auth.uid();
-- INSERT INTO user_favorites (user_id, item_id, item_type) VALUES (auth.uid(), 'test-drill-1', 'drill');