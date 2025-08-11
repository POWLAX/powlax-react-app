-- =====================================================================
-- DISCOVER ACTUAL TABLE STRUCTURE AND FIX
-- =====================================================================
-- Purpose: Find out what columns actually exist and adapt to them
-- =====================================================================

-- STEP 1: DISCOVER ACTUAL STRUCTURE
-- =====================================================================
\echo '===== DISCOVERING ACTUAL TABLE STRUCTURES ====='

-- 1.1 List all gamification-related tables
\echo 'Gamification Tables in Database:'
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%badge%' 
    OR table_name LIKE '%rank%' 
    OR table_name LIKE '%point%'
    OR table_name LIKE '%gamif%'
)
ORDER BY table_name;

-- 1.2 Show ACTUAL columns in powlax_player_ranks
\echo ''
\echo 'ACTUAL COLUMNS in powlax_player_ranks:'
SELECT 
    ordinal_position as pos,
    column_name, 
    data_type,
    character_maximum_length as max_len,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 1.3 Show ACTUAL columns in badges_powlax (if exists)
\echo ''
\echo 'ACTUAL COLUMNS in badges_powlax:'
SELECT 
    ordinal_position as pos,
    column_name, 
    data_type,
    character_maximum_length as max_len,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'badges_powlax'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 1.4 Check if there's a different ranks table
\echo ''
\echo 'Other rank-related tables:'
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE c.table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%rank%'
ORDER BY table_name;

-- STEP 2: CHECK DATA IN EXISTING TABLES
-- =====================================================================
\echo ''
\echo '===== CHECKING EXISTING DATA ====='

-- 2.1 Check if powlax_player_ranks has any data
DO $$
DECLARE
    record_count INTEGER;
    sample_data RECORD;
BEGIN
    -- Count records
    EXECUTE 'SELECT COUNT(*) FROM powlax_player_ranks' INTO record_count;
    RAISE NOTICE 'powlax_player_ranks has % records', record_count;
    
    -- Show sample if any exist
    IF record_count > 0 THEN
        RAISE NOTICE 'Sample data from powlax_player_ranks:';
        FOR sample_data IN 
            EXECUTE 'SELECT * FROM powlax_player_ranks LIMIT 3'
        LOOP
            RAISE NOTICE 'Row: %', sample_data;
        END LOOP;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not query powlax_player_ranks: %', SQLERRM;
END $$;

-- STEP 3: ADAPTIVE FIX - Rename or recreate table
-- =====================================================================
\echo ''
\echo '===== APPLYING ADAPTIVE FIX ====='

DO $$
DECLARE
    col_exists BOOLEAN;
    table_empty BOOLEAN;
BEGIN
    -- Check if the expected columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'powlax_player_ranks' 
        AND column_name = 'rank_name'
    ) INTO col_exists;
    
    -- Check if table is empty
    EXECUTE 'SELECT COUNT(*) = 0 FROM powlax_player_ranks' INTO table_empty;
    
    IF NOT col_exists THEN
        RAISE NOTICE 'Table powlax_player_ranks exists but with wrong schema';
        
        IF table_empty THEN
            -- Table is empty, safe to drop and recreate
            RAISE NOTICE 'Table is empty - dropping and recreating with correct schema';
            
            DROP TABLE IF EXISTS powlax_player_ranks CASCADE;
            
            CREATE TABLE powlax_player_ranks (
                id SERIAL PRIMARY KEY,
                rank_name VARCHAR(100) NOT NULL UNIQUE,
                rank_level INTEGER NOT NULL UNIQUE,
                credits_required INTEGER NOT NULL,
                description TEXT,
                icon_url TEXT,
                icon_emoji VARCHAR(10),
                color_hex VARCHAR(7),
                display_order INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CHECK (credits_required >= 0),
                CHECK (rank_level BETWEEN 1 AND 10)
            );
            
            RAISE NOTICE 'Created new powlax_player_ranks table with correct schema';
        ELSE
            -- Table has data, need to preserve it
            RAISE NOTICE 'Table has data - creating new table and migrating';
            
            -- Create new table with correct schema
            CREATE TABLE IF NOT EXISTS powlax_player_ranks_new (
                id SERIAL PRIMARY KEY,
                rank_name VARCHAR(100) NOT NULL UNIQUE,
                rank_level INTEGER NOT NULL UNIQUE,
                credits_required INTEGER NOT NULL,
                description TEXT,
                icon_url TEXT,
                icon_emoji VARCHAR(10),
                color_hex VARCHAR(7),
                display_order INTEGER NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CHECK (credits_required >= 0),
                CHECK (rank_level BETWEEN 1 AND 10)
            );
            
            -- Show what columns we need to map
            RAISE NOTICE 'Please manually map data from old table to new table';
            RAISE NOTICE 'Old table preserved as: powlax_player_ranks';
            RAISE NOTICE 'New table created as: powlax_player_ranks_new';
        END IF;
    ELSE
        RAISE NOTICE 'Table powlax_player_ranks already has correct schema';
    END IF;
END $$;

-- STEP 4: FIX badges_powlax TABLE
-- =====================================================================
\echo ''
\echo '===== FIXING BADGES TABLE ====='

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'badges_powlax'
    ) THEN
        CREATE TABLE badges_powlax (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            badge_code VARCHAR(10),
            category VARCHAR(50) NOT NULL,
            description TEXT,
            excerpt TEXT,
            icon_url TEXT NOT NULL,
            congratulations_text TEXT,
            points_type VARCHAR(100),
            points_required INTEGER DEFAULT 5,
            points_awarded INTEGER DEFAULT 10,
            display_order INTEGER,
            is_active BOOLEAN DEFAULT true,
            wordpress_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(badge_code),
            UNIQUE(title, category)
        );
        
        RAISE NOTICE 'Created badges_powlax table';
    ELSE
        RAISE NOTICE 'badges_powlax table already exists';
    END IF;
END $$;

-- STEP 5: INSERT SAMPLE DATA TO TEST
-- =====================================================================
\echo ''
\echo '===== INSERTING TEST DATA ====='

-- 5.1 Test rank insertion (only if table was recreated)
INSERT INTO powlax_player_ranks (
    rank_name, rank_level, credits_required, description,
    icon_emoji, color_hex, display_order
) VALUES
('Test Rank', 1, 0, 'Test rank entry', '🎯', '#FF0000', 1)
ON CONFLICT (rank_name) DO NOTHING;

-- 5.2 Test badge insertion
INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url,
    points_type, points_required, points_awarded, display_order
) VALUES
('Test Badge', 'TEST1', 'Test', 'Test badge entry',
 'https://example.com/test.png', 'test-token', 1, 5, 1)
ON CONFLICT (badge_code) DO NOTHING;

-- STEP 6: FINAL VERIFICATION
-- =====================================================================
\echo ''
\echo '===== FINAL VERIFICATION ====='

-- Show final structure
SELECT 'powlax_player_ranks columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
ORDER BY ordinal_position;

SELECT 'badges_powlax columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'badges_powlax'
ORDER BY ordinal_position;

-- Show test data
SELECT 'Test data in powlax_player_ranks:' as info;
SELECT * FROM powlax_player_ranks LIMIT 2;

SELECT 'Test data in badges_powlax:' as info;
SELECT badge_code, title, category FROM badges_powlax LIMIT 2;