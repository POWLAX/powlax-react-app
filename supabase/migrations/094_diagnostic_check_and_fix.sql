-- =====================================================================
-- DIAGNOSTIC AND FIX SCRIPT FOR GAMIFICATION TABLES
-- =====================================================================
-- Purpose: Check what exists and fix the schema issues
-- =====================================================================

-- STEP 1: Check what tables actually exist
-- =====================================================================
SELECT 'CHECKING EXISTING TABLES:' as diagnostic_step;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'badges_powlax',
    'powlax_player_ranks',
    'powlax_points_currencies',
    'user_badges',
    'user_points_wallets',
    'powlax_badges_catalog',
    'powlax_ranks_catalog'
)
ORDER BY table_name;

-- STEP 2: Check columns in powlax_player_ranks if it exists
-- =====================================================================
SELECT 'CHECKING POWLAX_PLAYER_RANKS COLUMNS:' as diagnostic_step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'powlax_player_ranks'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 3: Check columns in badges_powlax if it exists
-- =====================================================================
SELECT 'CHECKING BADGES_POWLAX COLUMNS:' as diagnostic_step;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'badges_powlax'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 4: Create tables ONLY if they don't exist
-- =====================================================================

-- 4.1 Create badges_powlax if missing
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
        
        CREATE INDEX idx_badges_category ON badges_powlax(category);
        CREATE INDEX idx_badges_code ON badges_powlax(badge_code);
        CREATE INDEX idx_badges_active ON badges_powlax(is_active) WHERE is_active = true;
        
        RAISE NOTICE 'Created badges_powlax table';
    ELSE
        RAISE NOTICE 'badges_powlax table already exists';
    END IF;
END $$;

-- 4.2 Create powlax_player_ranks if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'powlax_player_ranks'
    ) THEN
        CREATE TABLE powlax_player_ranks (
            id SERIAL PRIMARY KEY,
            rank_name VARCHAR(100) NOT NULL UNIQUE,
            rank_level INTEGER NOT NULL UNIQUE,
            credits_required INTEGER NOT NULL,  -- This is the column that was missing!
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
        
        CREATE INDEX idx_ranks_credits ON powlax_player_ranks(credits_required);
        CREATE INDEX idx_ranks_level ON powlax_player_ranks(rank_level);
        CREATE INDEX idx_ranks_active ON powlax_player_ranks(is_active) WHERE is_active = true;
        
        RAISE NOTICE 'Created powlax_player_ranks table';
    ELSE
        -- Check if credits_required column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'powlax_player_ranks' 
            AND column_name = 'credits_required'
        ) THEN
            -- Add the missing column
            ALTER TABLE powlax_player_ranks 
            ADD COLUMN credits_required INTEGER NOT NULL DEFAULT 0;
            
            RAISE NOTICE 'Added credits_required column to powlax_player_ranks';
        ELSE
            RAISE NOTICE 'powlax_player_ranks table already has credits_required column';
        END IF;
    END IF;
END $$;

-- STEP 5: Now populate the data
-- =====================================================================

-- 5.1 Populate Attack Badges
INSERT INTO badges_powlax (
    title, badge_code, category, description, icon_url, 
    points_type, points_required, points_awarded, display_order
) VALUES 
('Crease Crawler', 'A1', 'Attack', 
 'Master of creating space and opportunities around the crease',
 'https://powlax.com/wp-content/uploads/2024/10/A1-Crease-Crawler.png',
 'attack-token', 5, 10, 1),
('Wing Wizard', 'A2', 'Attack',
 'Expert at operating from the wing position with precision',
 'https://powlax.com/wp-content/uploads/2024/10/A2-Wing-Wizard.png',
 'attack-token', 5, 10, 2),
('Ankle Breaker', 'A3', 'Attack',
 'Devastating dodger who leaves defenders in the dust',
 'https://powlax.com/wp-content/uploads/2024/10/A3-Ankle-Breaker.png',
 'attack-token', 5, 15, 3),
('Seasoned Sniper', 'A4', 'Attack',
 'Deadly accurate shooter from any angle or distance',
 'https://powlax.com/wp-content/uploads/2024/10/A4-Seasoned-Sniper.png',
 'attack-token', 5, 15, 4),
('Time and Room Terror', 'A5', 'Attack',
 'Capitalizes on every opportunity when given space',
 'https://powlax.com/wp-content/uploads/2024/10/A5-Time-and-room-terror.png',
 'attack-token', 5, 20, 5)
ON CONFLICT (badge_code) DO NOTHING;

-- 5.2 Populate Player Ranks
INSERT INTO powlax_player_ranks (
    rank_name, rank_level, credits_required, description,
    icon_emoji, color_hex, display_order
) VALUES
('Lacrosse Bot', 1, 0,
 'Just starting your lacrosse journey',
 '🤖', '#808080', 1),
('2nd Bar Syndrome', 2, 25,
 'Learning the basics and building skills',
 '📊', '#A0A0A0', 2),
('Left Bench Hero', 3, 60,
 'Earning playing time through hard work',
 '🪑', '#B8860B', 3),
('Celly King', 4, 100,
 'Starting to make plays and celebrate success',
 '🎉', '#FFD700', 4),
('D-Mid Rising', 5, 140,
 'Developing two-way skills and game awareness',
 '🏃', '#FF8C00', 5)
ON CONFLICT (rank_name) DO NOTHING;

-- STEP 6: Verify the results
-- =====================================================================
SELECT 'VERIFICATION - Badge Count:' as check_type, COUNT(*) as count FROM badges_powlax;
SELECT 'VERIFICATION - Rank Count:' as check_type, COUNT(*) as count FROM powlax_player_ranks;

-- STEP 7: Show sample data
-- =====================================================================
SELECT 'SAMPLE BADGES:' as data_type;
SELECT badge_code, title, category, icon_url 
FROM badges_powlax 
LIMIT 5;

SELECT 'SAMPLE RANKS:' as data_type;
SELECT rank_level, rank_name, credits_required, icon_emoji 
FROM powlax_player_ranks 
ORDER BY rank_level
LIMIT 5;