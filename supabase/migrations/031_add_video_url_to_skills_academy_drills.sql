-- Migration: Add video_url column to skills_academy_drills table
-- Purpose: Store complete Vimeo URLs instead of just vimeo_id for consistency with powlax_drills
-- Date: 2025-01-09
-- Affects: skills_academy_drills table

-- ============================================
-- PHASE 1: ADD VIDEO_URL COLUMN
-- ============================================

-- Add video_url column to skills_academy_drills table
ALTER TABLE skills_academy_drills 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN skills_academy_drills.video_url IS 'Complete Vimeo URL constructed from vimeo_id for consistency with powlax_drills table';

-- ============================================
-- PHASE 2: POPULATE VIDEO_URL FROM VIMEO_ID
-- ============================================

-- Update all existing records to populate video_url from vimeo_id
UPDATE skills_academy_drills 
SET video_url = 'https://vimeo.com/' || vimeo_id 
WHERE vimeo_id IS NOT NULL 
  AND vimeo_id != '' 
  AND TRIM(vimeo_id) != ''
  AND video_url IS NULL;

-- ============================================
-- PHASE 3: CREATE PERFORMANCE INDEX
-- ============================================

-- Create index on video_url for better query performance
CREATE INDEX IF NOT EXISTS idx_skills_academy_drills_video_url 
ON skills_academy_drills(video_url);

-- ============================================
-- PHASE 4: DATA VALIDATION
-- ============================================

-- Validation query to check migration success
-- This will be included in migration output for verification
DO $$
DECLARE
    total_records INTEGER;
    records_with_vimeo_id INTEGER;
    records_with_video_url INTEGER;
    records_with_both INTEGER;
BEGIN
    -- Count total records
    SELECT COUNT(*) INTO total_records FROM skills_academy_drills;
    
    -- Count records with vimeo_id
    SELECT COUNT(*) INTO records_with_vimeo_id 
    FROM skills_academy_drills 
    WHERE vimeo_id IS NOT NULL AND vimeo_id != '' AND TRIM(vimeo_id) != '';
    
    -- Count records with video_url
    SELECT COUNT(*) INTO records_with_video_url 
    FROM skills_academy_drills 
    WHERE video_url IS NOT NULL AND video_url != '';
    
    -- Count records with both vimeo_id and video_url
    SELECT COUNT(*) INTO records_with_both 
    FROM skills_academy_drills 
    WHERE vimeo_id IS NOT NULL AND vimeo_id != '' AND TRIM(vimeo_id) != ''
      AND video_url IS NOT NULL AND video_url != '';
    
    -- Output validation results
    RAISE NOTICE '=== SKILLS ACADEMY DRILLS VIDEO URL MIGRATION VALIDATION ===';
    RAISE NOTICE 'Total records: %', total_records;
    RAISE NOTICE 'Records with vimeo_id: %', records_with_vimeo_id;
    RAISE NOTICE 'Records with video_url: %', records_with_video_url;
    RAISE NOTICE 'Records with both vimeo_id and video_url: %', records_with_both;
    
    -- Validation check
    IF records_with_vimeo_id = records_with_both THEN
        RAISE NOTICE '✅ SUCCESS: All records with vimeo_id now have video_url';
    ELSE
        RAISE WARNING '⚠️  MISMATCH: % records with vimeo_id but only % have video_url', 
                     records_with_vimeo_id, records_with_both;
    END IF;
    
    RAISE NOTICE '=== END VALIDATION ===';
END$$;

-- ============================================
-- PHASE 5: SAMPLE DATA VERIFICATION
-- ============================================

-- Show sample of migrated data for manual verification
SELECT 
    id,
    original_id,
    title,
    vimeo_id,
    video_url,
    CASE 
        WHEN vimeo_id IS NOT NULL AND video_url IS NOT NULL THEN '✅ Complete'
        WHEN vimeo_id IS NOT NULL AND video_url IS NULL THEN '❌ Missing URL'
        WHEN vimeo_id IS NULL AND video_url IS NULL THEN '⚪ No Video'
        ELSE '❓ Unknown State'
    END as migration_status
FROM skills_academy_drills 
ORDER BY id 
LIMIT 10;

-- ============================================
-- PHASE 6: FUTURE IMPORT TEMPLATE
-- ============================================

-- Template for future inserts (includes both vimeo_id and video_url)
-- INSERT INTO skills_academy_drills (
--     original_id,
--     title,
--     vimeo_id,
--     video_url,
--     drill_category,
--     equipment_needed,
--     age_progressions,
--     space_needed,
--     complexity,
--     sets_and_reps,
--     duration_minutes,
--     point_values,
--     tags
-- ) VALUES (
--     47507,
--     '2 Hand Cradle Away Drill',
--     '1000143414',
--     'https://vimeo.com/1000143414',
--     ARRAY['Offense (with ball)', 'Cradling']::text[],
--     ARRAY[]::text[],
--     '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
--     'Anywhere (No Flying Balls)>5x5 Yard Box',
--     'foundation',
--     '4 Sets (2 per hand) for 20 Seconds Each',
--     3,
--     '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
--     ARRAY['cradling', 'protection', 'Skills-Academy']::text[]
-- );

-- ============================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================

-- To rollback this migration:
-- 1. DROP INDEX IF EXISTS idx_skills_academy_drills_video_url;
-- 2. ALTER TABLE skills_academy_drills DROP COLUMN IF EXISTS video_url;
-- 3. Frontend will continue using vimeo_id for URL construction
