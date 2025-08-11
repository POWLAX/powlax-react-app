-- POWLAX Safe Table Dependency Check
-- Created: 2025-01-16
-- Purpose: Check all dependencies before removing any tables to prevent CASCADE issues
-- 
-- ⚠️ RUN THIS FIRST BEFORE ANY TABLE REMOVAL!

BEGIN;

-- ==========================================
-- COMPREHENSIVE DEPENDENCY CHECK
-- ==========================================

-- Create a temporary function to check dependencies
CREATE OR REPLACE FUNCTION check_table_dependencies(p_table_name TEXT)
RETURNS TABLE(
  dependency_type TEXT,
  dependent_object TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check for foreign key dependencies (tables that reference this table)
  RETURN QUERY
  SELECT 
    'FOREIGN KEY'::TEXT as dependency_type,
    tc.table_name::TEXT as dependent_object,
    ('Column ' || kcu.column_name || ' references ' || p_table_name || '.' || ccu.column_name)::TEXT as details
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = p_table_name;

  -- Check for views that depend on this table
  RETURN QUERY
  SELECT 
    'VIEW'::TEXT as dependency_type,
    viewname::TEXT as dependent_object,
    ('View depends on table ' || p_table_name)::TEXT as details
  FROM pg_views
  WHERE definition ILIKE '%' || p_table_name || '%'
    AND schemaname = 'public';

  -- Check for functions that might reference this table
  RETURN QUERY
  SELECT 
    'FUNCTION'::TEXT as dependency_type,
    proname::TEXT as dependent_object,
    ('Function may reference table ' || p_table_name)::TEXT as details
  FROM pg_proc
  WHERE prosrc ILIKE '%' || p_table_name || '%'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  -- Check for triggers on this table
  RETURN QUERY
  SELECT 
    'TRIGGER'::TEXT as dependency_type,
    tgname::TEXT as dependent_object,
    ('Trigger on table ' || p_table_name)::TEXT as details
  FROM pg_trigger
  WHERE tgrelid = (p_table_name)::regclass;

  -- Check for indexes (informational)
  RETURN QUERY
  SELECT 
    'INDEX'::TEXT as dependency_type,
    indexname::TEXT as dependent_object,
    ('Index on table ' || p_table_name)::TEXT as details
  FROM pg_indexes
  WHERE tablename = p_table_name
    AND schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- CHECK EACH TABLE MARKED FOR REMOVAL
-- ==========================================

DO $$
DECLARE
  v_table_name TEXT;
  v_exists BOOLEAN;
  v_dependency RECORD;
  v_has_dependencies BOOLEAN;
  v_safe_to_drop TEXT[];
  v_has_blockers TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '🔍 POWLAX TABLE DEPENDENCY SAFETY CHECK';
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '';
  
  -- Initialize arrays
  v_safe_to_drop := ARRAY[]::TEXT[];
  v_has_blockers := ARRAY[]::TEXT[];
  
  -- List of all tables we want to check
  FOR v_table_name IN 
    SELECT unnest(ARRAY[
      -- Only checking the 2 tables that still exist
      'badges_powlax',
      'powlax_player_ranks'
    ])
  LOOP
    -- Check if table exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table_name
    ) INTO v_exists;
    
    IF v_exists THEN
      RAISE NOTICE '📊 Checking table: %', v_table_name;
      RAISE NOTICE '----------------------------------------';
      
      v_has_dependencies := FALSE;
      
      -- Check all dependencies
      FOR v_dependency IN 
        SELECT * FROM check_table_dependencies(v_table_name)
        WHERE dependency_type NOT IN ('INDEX') -- Indexes are auto-dropped
      LOOP
        v_has_dependencies := TRUE;
        RAISE NOTICE '  ⚠️  % dependency: %', v_dependency.dependency_type, v_dependency.dependent_object;
        RAISE NOTICE '      Details: %', v_dependency.details;
      END LOOP;
      
      IF NOT v_has_dependencies THEN
        RAISE NOTICE '  ✅ No blocking dependencies found - SAFE TO DROP';
        v_safe_to_drop := array_append(v_safe_to_drop, v_table_name);
      ELSE
        RAISE NOTICE '  ❌ Has dependencies - DO NOT use CASCADE without investigation';
        v_has_blockers := array_append(v_has_blockers, v_table_name);
      END IF;
      
      RAISE NOTICE '';
    END IF;
  END LOOP;
  
  -- Summary
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '📋 SUMMARY';
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '';
  
  IF array_length(v_safe_to_drop, 1) > 0 THEN
    RAISE NOTICE '✅ SAFE TO DROP (no dependencies):';
    FOR v_table_name IN SELECT unnest(v_safe_to_drop)
    LOOP
      RAISE NOTICE '   - %', v_table_name;
    END LOOP;
    RAISE NOTICE '';
  END IF;
  
  IF array_length(v_has_blockers, 1) > 0 THEN
    RAISE NOTICE '❌ HAS DEPENDENCIES (investigate before dropping):';
    FOR v_table_name IN SELECT unnest(v_has_blockers)
    LOOP
      RAISE NOTICE '   - %', v_table_name;
    END LOOP;
    RAISE NOTICE '';
  END IF;
  
  RAISE NOTICE '⚠️  RECOMMENDATIONS:';
  RAISE NOTICE '   1. For SAFE tables: Use DROP TABLE IF EXISTS table_name;';
  RAISE NOTICE '   2. For BLOCKED tables: Investigate dependencies first';
  RAISE NOTICE '   3. NEVER use CASCADE without understanding impact';
  RAISE NOTICE '   4. Take a backup before dropping any tables';
  RAISE NOTICE '';
END $$;

-- ==========================================
-- CHECK RENAMED TABLES
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '🔄 CHECKING RENAMED TABLES';
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '';
  
  -- Check if old names exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'club_organizations') THEN
    RAISE NOTICE '⚠️  club_organizations still exists (should be renamed to clubs)';
  ELSE
    RAISE NOTICE '✅ club_organizations does not exist (correctly renamed to clubs)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_teams') THEN
    RAISE NOTICE '⚠️  team_teams still exists (should be renamed to teams)';
  ELSE
    RAISE NOTICE '✅ team_teams does not exist (correctly renamed to teams)';
  END IF;
  
  -- Check if new names exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN
    RAISE NOTICE '✅ clubs table exists (correct)';
  ELSE
    RAISE NOTICE '❌ clubs table does not exist (problem!)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
    RAISE NOTICE '✅ teams table exists (correct)';
  ELSE
    RAISE NOTICE '❌ teams table does not exist (problem!)';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ==========================================
-- GENERATE SAFE DROP COMMANDS
-- ==========================================

DO $$
DECLARE
  v_sql TEXT;
BEGIN
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '💾 SAFE DROP COMMANDS';
  RAISE NOTICE '================================================================================';
  RAISE NOTICE '';
  RAISE NOTICE '-- Copy and run these commands after verifying dependencies:';
  RAISE NOTICE '';
  
  -- Generate DROP commands for tables that exist
  FOR v_sql IN
    SELECT 'DROP TABLE IF EXISTS ' || table_name || ';  -- Check dependencies first!'
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('badges_powlax', 'powlax_player_ranks')
    ORDER BY table_name
  LOOP
    RAISE NOTICE '%', v_sql;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '-- ⚠️  NEVER add CASCADE without checking what will be deleted!';
  RAISE NOTICE '';
END $$;

-- Clean up temporary function
DROP FUNCTION IF EXISTS check_table_dependencies(TEXT);

ROLLBACK; -- This script is read-only, no changes made

-- ==========================================
-- MANUAL VERIFICATION QUERIES
-- ==========================================

-- Run these queries to double-check specific concerns:

-- 1. Check what references badges_powlax
/*
SELECT 
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'badges_powlax';
*/

-- 2. Check what references powlax_player_ranks
/*
SELECT 
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'powlax_player_ranks';
*/

-- 3. Check if any views reference these tables
/*
SELECT viewname, definition 
FROM pg_views 
WHERE definition ILIKE '%badges_powlax%' 
   OR definition ILIKE '%powlax_player_ranks%';
*/

-- 4. Check if any functions reference these tables
/*
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc ILIKE '%badges_powlax%' 
   OR prosrc ILIKE '%powlax_player_ranks%';
*/