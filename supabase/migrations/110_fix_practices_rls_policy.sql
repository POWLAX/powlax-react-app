-- =====================================================
-- Migration: 110_fix_practices_rls_policy.sql
-- Purpose: Fix RLS policy for practices table to enable Save/Load functionality
-- Date: January 11, 2025
-- Status: REQUIRED - Save/Load Practice Plans currently broken
-- =====================================================

-- INSTRUCTIONS FOR RUNNING THIS MIGRATION:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Verify no errors in the output
-- 6. Test Save/Load functionality in Practice Planner

-- =====================================================
-- FIX PRACTICES TABLE RLS POLICY
-- =====================================================

-- Enable RLS on practices table (if not already enabled)
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can manage their own practices" ON practices;
DROP POLICY IF EXISTS "Users can view their own practices" ON practices;
DROP POLICY IF EXISTS "Users can insert their own practices" ON practices;
DROP POLICY IF EXISTS "Users can update their own practices" ON practices;
DROP POLICY IF EXISTS "Users can delete their own practices" ON practices;

-- Create comprehensive RLS policy for practices table
CREATE POLICY "Users can manage their own practices" ON practices
    FOR ALL 
    TO authenticated 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- =====================================================
-- VERIFY PRACTICES TABLE STRUCTURE
-- =====================================================

-- Ensure practices table has required columns
-- (This is informational - will show error if columns missing)
DO $$
BEGIN
    -- Check if practices table exists with required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'practices'
    ) THEN
        RAISE EXCEPTION 'practices table does not exist!';
    END IF;

    -- Check for required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'created_by'
    ) THEN
        RAISE EXCEPTION 'practices table missing created_by column!';
    END IF;

    RAISE NOTICE 'practices table structure verified successfully';
END $$;

-- =====================================================
-- GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant authenticated users access to practices table
GRANT ALL ON practices TO authenticated;
GRANT USAGE ON SEQUENCE practices_id_seq TO authenticated;

-- =====================================================
-- TEST QUERY (OPTIONAL)
-- =====================================================

-- Uncomment the following lines to test if RLS is working:
-- This should only show practices created by the current user
-- SELECT id, name, date, created_by, created_at 
-- FROM practices 
-- WHERE created_by = auth.uid()
-- LIMIT 5;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration 110 completed successfully!';
    RAISE NOTICE 'RLS policy fixed for practices table';
    RAISE NOTICE 'Save/Load functionality should now work';
    RAISE NOTICE '==============================================';
END $$;