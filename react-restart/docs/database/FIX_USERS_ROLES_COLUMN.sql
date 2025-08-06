-- Fix: Add roles column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';

-- Now you can run section 11 RLS policies for wp_sync_log
ALTER TABLE wp_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view sync logs" ON wp_sync_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(COALESCE(roles, '{}'))
    )
  );

CREATE POLICY "Only admins can create sync logs" ON wp_sync_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(COALESCE(roles, '{}'))
    )
  );

CREATE POLICY "Only admins can update sync logs" ON wp_sync_log
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(COALESCE(roles, '{}'))
    )
  );