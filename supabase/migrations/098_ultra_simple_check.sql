-- =====================================================================
-- ULTRA SIMPLE CHECK - NO COMPLEX QUERIES
-- =====================================================================

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%rank%'
ORDER BY table_name;

-- Check columns in powlax_player_ranks
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
ORDER BY ordinal_position;

-- Check columns in powlax_ranks_catalog  
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'powlax_ranks_catalog'
ORDER BY ordinal_position;

-- Check what badge tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%badge%'
ORDER BY table_name;

-- Check columns in badges_powlax
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'badges_powlax'
ORDER BY ordinal_position;

-- Check columns in powlax_badges_catalog
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'powlax_badges_catalog'
ORDER BY ordinal_position;