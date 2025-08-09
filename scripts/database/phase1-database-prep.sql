-- PHASE 1: DATABASE PREPARATION
-- Purpose: Ensure drill_ids column exists and create indexes

-- 1.1: Ensure drill_ids column exists
ALTER TABLE skills_academy_workouts 
ADD COLUMN IF NOT EXISTS drill_ids INTEGER[] DEFAULT '{}';

-- 1.2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
ON skills_academy_workouts USING GIN (drill_ids);

-- 1.3: Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1.4: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_skills_academy_workouts_updated_at ON skills_academy_workouts;
CREATE TRIGGER update_skills_academy_workouts_updated_at 
BEFORE UPDATE ON skills_academy_workouts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'skills_academy_workouts' 
    AND column_name = 'drill_ids';