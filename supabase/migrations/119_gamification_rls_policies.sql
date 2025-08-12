-- 119_gamification_rls_policies.sql
-- Row Level Security policies for gamification tables
-- Created: 2025-01-11
-- Purpose: Secure access to points, transactions, and completions
-- NOTE: Must run AFTER tables are created (migrations 115-118)

-- Enable RLS on gamification tables (if not already enabled)
ALTER TABLE user_points_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions_powlax ENABLE ROW LEVEL SECURITY;
-- workout_completions RLS already enabled in migration 117

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users read own points" ON user_points_wallets;
DROP POLICY IF EXISTS "Users read own transactions" ON points_transactions_powlax;
DROP POLICY IF EXISTS "Users read own completions" ON workout_completions;
DROP POLICY IF EXISTS "Service role all access wallets" ON user_points_wallets;
DROP POLICY IF EXISTS "Service role all access transactions" ON points_transactions_powlax;
DROP POLICY IF EXISTS "Service role all access completions" ON workout_completions;

-- user_points_wallets policies
CREATE POLICY "Users read own points" 
  ON user_points_wallets
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role all access wallets" 
  ON user_points_wallets
  FOR ALL 
  USING (
    auth.role() = 'service_role' OR
    auth.jwt()->>'role' = 'service_role'
  );

-- points_transactions_powlax policies  
CREATE POLICY "Users read own transactions" 
  ON points_transactions_powlax
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role all access transactions" 
  ON points_transactions_powlax
  FOR ALL 
  USING (
    auth.role() = 'service_role' OR
    auth.jwt()->>'role' = 'service_role'
  );

-- workout_completions policies
CREATE POLICY "Users read own completions" 
  ON workout_completions
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role all access completions" 
  ON workout_completions
  FOR ALL 
  USING (
    auth.role() = 'service_role' OR
    auth.jwt()->>'role' = 'service_role'
  );

-- Grant necessary permissions
GRANT SELECT ON user_points_wallets TO authenticated;
GRANT SELECT ON points_transactions_powlax TO authenticated;
GRANT SELECT ON workout_completions TO authenticated;

-- Allow RPC functions to bypass RLS (they use SECURITY DEFINER)
GRANT ALL ON user_points_wallets TO service_role;
GRANT ALL ON points_transactions_powlax TO service_role;
GRANT ALL ON workout_completions TO service_role;

-- Verify policies are working
DO $$
BEGIN
  RAISE NOTICE 'RLS policies created successfully for gamification tables';
  RAISE NOTICE 'Users can read their own data';
  RAISE NOTICE 'Service role has full access';
  RAISE NOTICE 'RPC functions will use SECURITY DEFINER to bypass RLS';
END $$;