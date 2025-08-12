-- Migration 116: Create points_transactions_powlax table
-- Contract: src/components/skills-academy/GAMIFICATION_CONTRACT.md
-- Created: 2025-01-11
-- Purpose: Track all point transactions for audit trail

-- Create points_transactions_powlax table if it doesn't exist
CREATE TABLE IF NOT EXISTS points_transactions_powlax (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus'
  source_type TEXT, -- 'drill', 'workout', 'streak', 'track'
  source_id TEXT, -- drill_id or workout_id
  drill_count INTEGER, -- Number of drills for multiplier calculation
  multipliers_applied JSONB, -- {"drill_multiplier": 1.2, "streak_multiplier": 1.15}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('earned', 'spent', 'bonus')),
  CONSTRAINT valid_source_type CHECK (source_type IN ('drill', 'workout', 'streak', 'track', 'manual'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id 
ON points_transactions_powlax(user_id);

CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at 
ON points_transactions_powlax(created_at);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user_currency 
ON points_transactions_powlax(user_id, currency);

CREATE INDEX IF NOT EXISTS idx_points_transactions_source 
ON points_transactions_powlax(source_type, source_id);

-- Add RLS policy
ALTER TABLE points_transactions_powlax ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view their own point transactions" 
ON points_transactions_powlax FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert transactions (handled by RPC functions)
CREATE POLICY "System can insert point transactions" 
ON points_transactions_powlax FOR INSERT 
WITH CHECK (true);

-- Verify table creation
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'points_transactions_powlax';