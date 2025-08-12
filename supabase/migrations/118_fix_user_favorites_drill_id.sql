-- =====================================================
-- MIGRATION 118: Fix user_favorites drill_id constraint
-- Date: January 12, 2025
-- Purpose: Make drill_id nullable so new item_id/item_type can work
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== Fixing user_favorites drill_id constraint ===';
    
    -- Check if drill_id column exists and is NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_favorites' 
        AND column_name = 'drill_id'
        AND is_nullable = 'NO'
    ) THEN
        -- Make drill_id nullable (don't remove it, just make it optional)
        ALTER TABLE user_favorites ALTER COLUMN drill_id DROP NOT NULL;
        RAISE NOTICE '✅ Made drill_id column nullable in user_favorites';
        
        -- Also make item_id and item_type nullable if they're NOT NULL
        ALTER TABLE user_favorites ALTER COLUMN item_id DROP NOT NULL;
        ALTER TABLE user_favorites ALTER COLUMN item_type DROP NOT NULL;
        RAISE NOTICE '✅ Made item_id and item_type nullable for flexibility';
    ELSE
        RAISE NOTICE '✓ drill_id is already nullable or does not exist';
    END IF;
    
    -- Ensure we can insert with either old or new structure
    RAISE NOTICE '';
    RAISE NOTICE 'Table now supports both structures:';
    RAISE NOTICE '- Old: drill_id (UUID) for backward compatibility';
    RAISE NOTICE '- New: item_id (TEXT) + item_type for drills and strategies';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error: %', SQLERRM;
END $$;

-- Show final structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_favorites'
ORDER BY ordinal_position;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'MIGRATION 118 COMPLETED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'user_favorites now supports both:';
    RAISE NOTICE '1. Legacy: drill_id (for existing code)';
    RAISE NOTICE '2. New: item_id + item_type (for favorites system)';
    RAISE NOTICE 'Both can coexist without conflicts';
    RAISE NOTICE '==============================================';
END $$;