-- POWLAX Create Tables Step by Step - Debug Version
-- Created: 2025-01-16
-- Purpose: Create one table at a time to isolate any issues

-- ==========================================
-- STEP 1: CREATE REGISTRATION_SESSIONS TABLE ONLY
-- ==========================================

-- First, check if table already exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registration_sessions') 
    THEN 'TABLE ALREADY EXISTS'
    ELSE 'TABLE DOES NOT EXIST - WILL CREATE'
  END as table_status;

-- Create the table
CREATE TABLE IF NOT EXISTS registration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  reg_status TEXT NOT NULL CHECK (reg_status IN ('started', 'email_verified', 'completed', 'expired')),
  user_id UUID,
  registration_link_id UUID,
  team_id UUID,
  club_id UUID,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify the table was created with the correct columns
SELECT 
  'REGISTRATION_SESSIONS COLUMNS' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'registration_sessions'
ORDER BY ordinal_position;

-- Create indexes one by one
CREATE INDEX IF NOT EXISTS idx_registration_sessions_token ON registration_sessions(token);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_email ON registration_sessions(email);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_reg_status ON registration_sessions(reg_status);
CREATE INDEX IF NOT EXISTS idx_registration_sessions_expires_at ON registration_sessions(expires_at);

-- Show success message
SELECT 'SUCCESS: registration_sessions table created with indexes' as result;
