-- Create user_favorites table for persistent favorites storage
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  drill_id TEXT NOT NULL,
  drill_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, drill_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_drill_id ON user_favorites(drill_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites"
ON user_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON user_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
ON user_favorites FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON user_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create RPC function to check if table exists (used by useFavorites hook)
CREATE OR REPLACE FUNCTION create_user_favorites_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is just a check - the table is already created above
  -- Used by the hook to verify table existence
  NULL;
END;
$$;