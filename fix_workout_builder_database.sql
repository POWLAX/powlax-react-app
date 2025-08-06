-- Fix Workout Builder Database Issue
-- Run this in your Supabase SQL Editor to create the missing skills_academy_drills table

-- Create the skills_academy_drills table that the workout builder expects
CREATE TABLE IF NOT EXISTS skills_academy_drills (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),
    drill_category TEXT[],
    equipment_needed TEXT[],
    age_progressions JSONB,
    space_needed VARCHAR(255),
    complexity VARCHAR(50) CHECK (complexity IN ('building', 'foundation', 'advanced')),
    sets_and_reps TEXT,
    duration_minutes INTEGER,
    point_values JSONB DEFAULT '{"lax_credit": 10}'::JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_vimeo_id ON skills_academy_drills(vimeo_id);
CREATE INDEX IF NOT EXISTS idx_skills_complexity ON skills_academy_drills(complexity);
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills_academy_drills USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_skills_drill_category ON skills_academy_drills USING GIN(drill_category);

-- Insert some sample data for testing
INSERT INTO skills_academy_drills (
    original_id,
    title,
    vimeo_id,
    drill_category,
    equipment_needed,
    age_progressions,
    space_needed,
    complexity,
    sets_and_reps,
    duration_minutes,
    point_values,
    tags
) VALUES 
(1, 'Wall Ball Fundamentals', '1000143414', ARRAY['Wall Ball']::text[], ARRAY['Stick', 'Ball', 'Wall']::text[], 
 '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 8, "max": 10}, "own_it": {"min": 10, "max": 12}}'::jsonb,
 'Wall or Rebounder', 'foundation', '4 Sets of 25 Each Hand', 3,
 '{"lax_credit": 3, "rebound_rewards": 3}'::jsonb, ARRAY['wall_ball', 'fundamentals', 'Skills-Academy']::text[]),

(2, 'Split Dodge Technique', '1000143415', ARRAY['Attack', 'Dodging']::text[], ARRAY['Stick', 'Ball', 'Cone']::text[], 
 '{"do_it": {"min": 8, "max": 10}, "coach_it": {"min": 10, "max": 12}, "own_it": {"min": 12, "max": 14}}'::jsonb,
 'Open Field - 10x10 Yard Area', 'building', '3 Sets of 10 Reps Each Direction', 4,
 '{"lax_credit": 6, "attack_tokens": 6}'::jsonb, ARRAY['dodging', 'attack', 'Skills-Academy']::text[]),

(3, 'Advanced Shooting Mechanics', '1000143416', ARRAY['Attack', 'Shooting']::text[], ARRAY['Stick', 'Ball', 'Goal']::text[], 
 '{"do_it": {"min": 10, "max": 12}, "coach_it": {"min": 12, "max": 14}, "own_it": {"min": 14, "max": 18}}'::jsonb,
 'Goal Required', 'advanced', '5 Sets of 10 Shots Each Position', 8,
 '{"lax_credit": 12, "attack_tokens": 15, "lax_iq_points": 5}'::jsonb, ARRAY['shooting', 'advanced', 'Skills-Academy']::text[]),

(4, 'Defensive Footwork Drills', '1000143417', ARRAY['Defense', 'Footwork']::text[], ARRAY['Stick', 'Cones']::text[], 
 '{"do_it": {"min": 8, "max": 10}, "coach_it": {"min": 10, "max": 12}, "own_it": {"min": 12, "max": 14}}'::jsonb,
 '15x15 Yard Area', 'building', '4 Sets of 30 Second Intervals', 6,
 '{"lax_credit": 8, "defense_dollars": 8}'::jsonb, ARRAY['defense', 'footwork', 'Skills-Academy']::text[]),

(5, 'Ground Ball Fundamentals', '1000143418', ARRAY['Midfield', 'Ground Balls']::text[], ARRAY['Stick', 'Ball']::text[], 
 '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 8, "max": 10}, "own_it": {"min": 10, "max": 12}}'::jsonb,
 'Open Field', 'foundation', '3 Sets of 15 Ground Balls', 5,
 '{"lax_credit": 5, "midfield_medals": 5}'::jsonb, ARRAY['ground_balls', 'midfield', 'Skills-Academy']::text[])
ON CONFLICT (original_id) DO NOTHING;

-- Enable RLS (Row Level Security) if needed
ALTER TABLE skills_academy_drills ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (adjust as needed for your auth setup)
CREATE POLICY "Allow public read access to skills academy drills" ON skills_academy_drills FOR SELECT USING (true);

-- Optional: Create skills_academy_workouts table for future use
CREATE TABLE IF NOT EXISTS skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    workout_type VARCHAR(100),
    duration_minutes INTEGER,
    complexity VARCHAR(50) CHECK (complexity IN ('building', 'foundation', 'advanced')),
    point_values JSONB DEFAULT '{"lax_credit": 0}'::JSONB,
    vimeo_link TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for workouts table too
ALTER TABLE skills_academy_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to skills academy workouts" ON skills_academy_workouts FOR SELECT USING (true);