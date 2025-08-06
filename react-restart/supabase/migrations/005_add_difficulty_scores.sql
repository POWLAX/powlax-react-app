-- Add difficulty scores to drill tables
-- Phase 1: Anti-Gaming Foundation

-- Add difficulty_score column to drills_powlax
ALTER TABLE drills_powlax 
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score BETWEEN 1 AND 5);

-- Add difficulty_score column to skills_academy_powlax  
ALTER TABLE skills_academy_powlax 
ADD COLUMN IF NOT EXISTS difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score BETWEEN 1 AND 5);

-- Update drills_powlax difficulty based on age progressions
UPDATE drills_powlax
SET difficulty_score = CASE
    WHEN own_it_ages LIKE '%18+%' OR own_it_ages LIKE '%17%' OR own_it_ages LIKE '%16%' THEN 5
    WHEN own_it_ages LIKE '%15%' OR coach_it_ages LIKE '%15%' THEN 4
    WHEN coach_it_ages LIKE '%13%' OR coach_it_ages LIKE '%14%' THEN 3
    WHEN do_it_ages LIKE '%10%' OR do_it_ages LIKE '%11%' OR do_it_ages LIKE '%12%' THEN 2
    WHEN do_it_ages LIKE '%8%' OR do_it_ages LIKE '%9%' THEN 1
    ELSE 3 -- Default to medium difficulty
END
WHERE difficulty_score = 3; -- Only update defaults

-- Update skills_academy_powlax difficulty based on complexity field
UPDATE skills_academy_powlax
SET difficulty_score = CASE
    WHEN complexity = 'advanced' THEN 5
    WHEN complexity = 'building' THEN 3
    WHEN complexity = 'foundation' THEN 2
    ELSE 3
END
WHERE difficulty_score = 3; -- Only update defaults

-- Create index for fast difficulty filtering
CREATE INDEX IF NOT EXISTS idx_drills_powlax_difficulty ON drills_powlax(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_skills_academy_powlax_difficulty ON skills_academy_powlax(difficulty_score);

-- Add comments for clarity
COMMENT ON COLUMN drills_powlax.difficulty_score IS 'Drill difficulty: 1=Beginner, 2=Easy, 3=Medium, 4=Hard, 5=Elite';
COMMENT ON COLUMN skills_academy_powlax.difficulty_score IS 'Drill difficulty: 1=Beginner, 2=Easy, 3=Medium, 4=Hard, 5=Elite';