-- =====================================================
-- DROP INCORRECT GAMIFICATION TABLES
-- Created: 2025-01-16
-- Purpose: Remove incorrectly created gamification tables
-- =====================================================

BEGIN;

-- Drop the badges_powlax table and all its dependencies
DROP TABLE IF EXISTS badges_powlax CASCADE;

-- Drop the powlax_player_ranks table and all its dependencies
DROP TABLE IF EXISTS powlax_player_ranks CASCADE;

-- Also drop any related indexes that might have been created
DROP INDEX IF EXISTS idx_badges_powlax_type;
DROP INDEX IF EXISTS idx_badges_powlax_category;
DROP INDEX IF EXISTS idx_badges_powlax_wordpress_id;
DROP INDEX IF EXISTS idx_player_ranks_order;
DROP INDEX IF EXISTS idx_player_ranks_credits;

-- Drop any policies that were created
DROP POLICY IF EXISTS "Anyone can view badges" ON badges_powlax;
DROP POLICY IF EXISTS "Anyone can view ranks" ON powlax_player_ranks;
DROP POLICY IF EXISTS "Public can view badges" ON badges_powlax;
DROP POLICY IF EXISTS "Public can view ranks" ON powlax_player_ranks;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running this, verify tables are gone:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('badges_powlax', 'powlax_player_ranks');