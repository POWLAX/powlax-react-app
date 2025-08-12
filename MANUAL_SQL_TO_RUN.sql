-- =====================================================
-- MANUAL SQL TO RUN IN SUPABASE DASHBOARD
-- Go to: https://supabase.com/dashboard
-- Navigate to SQL Editor
-- Run these commands one at a time
-- =====================================================

-- 1. Create coach_favorites table
CREATE TABLE IF NOT EXISTS coach_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('drill', 'strategy', 'player', 'workout')),
  visibility_teams INTEGER[] DEFAULT '{}',
  visibility_clubs INTEGER[] DEFAULT '{}',
  shared_with_assistants TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, item_id, item_type)
);

-- 2. Enable RLS
ALTER TABLE coach_favorites ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for authenticated users
CREATE POLICY "Users can manage their own favorites" ON coach_favorites
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Grant permissions
GRANT ALL ON coach_favorites TO authenticated;

-- 5. Test the table
SELECT * FROM coach_favorites;