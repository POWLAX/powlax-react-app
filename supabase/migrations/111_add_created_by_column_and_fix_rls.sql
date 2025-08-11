-- =====================================================
-- Migration: 111_add_created_by_column_and_fix_rls.sql
-- Purpose: Add missing created_by column and fix RLS policy
-- Date: January 11, 2025
-- Status: REQUIRED - Fixes the missing column error from migration 110
-- =====================================================

-- INSTRUCTIONS FOR RUNNING THIS MIGRATION:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Copy and paste this entire SQL script
-- 4. Click "Run" to execute
-- 5. Verify no errors in the output
-- 6. Test Save/Load functionality in Practice Planner

-- =====================================================
-- CHECK CURRENT PRACTICES TABLE STRUCTURE
-- =====================================================

-- Show current table structure (informational)
DO $$
BEGIN
    RAISE NOTICE 'Current practices table structure:';
END $$;

-- Display table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'practices' 
ORDER BY ordinal_position;

-- =====================================================
-- ADD MISSING CREATED_BY COLUMN
-- =====================================================

-- Add created_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'created_by'
    ) THEN
        -- Add the column
        ALTER TABLE practices ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Set default value for existing records (if any)
        -- This will need to be updated manually for existing practices
        RAISE NOTICE 'Added created_by column to practices table';
        RAISE NOTICE 'WARNING: Existing practice records will have NULL created_by - update manually if needed';
    ELSE
        RAISE NOTICE 'created_by column already exists in practices table';
    END IF;
END $$;

-- =====================================================
-- VERIFY AND FIX OTHER REQUIRED COLUMNS
-- =====================================================

-- Ensure other essential columns exist
DO $$
BEGIN
    -- Check for name column (practice plan name)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'name'
    ) THEN
        ALTER TABLE practices ADD COLUMN name TEXT;
        RAISE NOTICE 'Added name column to practices table';
    END IF;

    -- Check for date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'date'
    ) THEN
        ALTER TABLE practices ADD COLUMN date DATE;
        RAISE NOTICE 'Added date column to practices table';
    END IF;

    -- Check for duration column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'duration'
    ) THEN
        ALTER TABLE practices ADD COLUMN duration INTEGER DEFAULT 90;
        RAISE NOTICE 'Added duration column to practices table';
    END IF;

    -- Check for drills column (JSONB for storing drill configuration)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'drills'
    ) THEN
        ALTER TABLE practices ADD COLUMN drills JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added drills column to practices table';
    END IF;

    -- Check for notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'notes'
    ) THEN
        ALTER TABLE practices ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to practices table';
    END IF;

    -- Check for team_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'practices' AND column_name = 'team_id'
    ) THEN
        ALTER TABLE practices ADD COLUMN team_id INTEGER;
        RAISE NOTICE 'Added team_id column to practices table';
    END IF;
END $$;

-- =====================================================
-- SET UP RLS POLICY (NOW THAT CREATED_BY EXISTS)
-- =====================================================

-- Enable RLS on practices table
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own practices" ON practices;
DROP POLICY IF EXISTS "Users can view their own practices" ON practices;
DROP POLICY IF EXISTS "Users can insert their own practices" ON practices;
DROP POLICY IF EXISTS "Users can update their own practices" ON practices;
DROP POLICY IF EXISTS "Users can delete their own practices" ON practices;

-- Create comprehensive RLS policy
CREATE POLICY "Users can manage their own practices" ON practices
    FOR ALL 
    TO authenticated 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant authenticated users access to practices table
GRANT ALL ON practices TO authenticated;

-- Grant access to sequence if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'practices_id_seq') THEN
        GRANT USAGE ON SEQUENCE practices_id_seq TO authenticated;
        RAISE NOTICE 'Granted access to practices_id_seq sequence';
    END IF;
END $$;

-- =====================================================
-- CREATE INDEX FOR PERFORMANCE
-- =====================================================

-- Create index on created_by for faster RLS queries
CREATE INDEX IF NOT EXISTS idx_practices_created_by ON practices(created_by);

-- Create index on team_id for team-based queries
CREATE INDEX IF NOT EXISTS idx_practices_team_id ON practices(team_id);

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

-- Show final table structure
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Final practices table structure:';
END $$;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'practices' 
ORDER BY ordinal_position;

-- Test that RLS policy is working (should return empty result if no practices exist)
-- SELECT COUNT(*) as accessible_practices FROM practices WHERE created_by = auth.uid();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Migration 111 completed successfully!';
    RAISE NOTICE 'Added missing created_by column to practices table';
    RAISE NOTICE 'Fixed RLS policy for practices table';
    RAISE NOTICE 'Save/Load functionality should now work';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'NEXT: Test Practice Planner Save/Load features';
END $$;