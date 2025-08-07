-- Add drill_ids column to skills_academy_workouts table
-- Simple migration to add drill array functionality
-- Generated: 2025-01-15

-- Add drill_ids array column to skills_academy_workouts
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'skills_academy_workouts' 
        AND column_name = 'drill_ids'
    ) THEN
        ALTER TABLE skills_academy_workouts 
        ADD COLUMN drill_ids INTEGER[] DEFAULT '{}';
        
        RAISE NOTICE 'Added drill_ids array column to skills_academy_workouts';
    ELSE
        RAISE NOTICE 'drill_ids column already exists in skills_academy_workouts';
    END IF;
END$$;

-- Add index for drill_ids array column for better query performance
CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
ON skills_academy_workouts USING gin(drill_ids);

-- Add comment for documentation
COMMENT ON COLUMN skills_academy_workouts.drill_ids IS 'Array of skills_academy_drills.id values that make up this workout';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Skills Academy Workouts Enhanced! 🚀';
    RAISE NOTICE 'Added drill_ids array column for workout-drill relationships';
    RAISE NOTICE 'Skills Academy workouts can now contain actual drill content!';
END $$;
