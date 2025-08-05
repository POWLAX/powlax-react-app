-- Skills Academy Drills Import
-- Generated: 2025-08-04T22:33:33.375007
-- Total Drills: 167


-- Skills Academy Drills Table
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
    point_values JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_vimeo_id ON skills_academy_drills(vimeo_id);
CREATE INDEX idx_complexity ON skills_academy_drills(complexity);
CREATE INDEX idx_tags ON skills_academy_drills USING GIN(tags);
CREATE INDEX idx_drill_category ON skills_academy_drills USING GIN(drill_category);


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
    tags,
    created_at
) VALUES (
    47507,
    '2 Hand Cradle Away Drill',
    '1000143414',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'protection', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47509,
    '2 Hockey Pick Up Ground Ball Drill',
    '995813226',
    ARRAY['Offense (with ball)', 'Ground Balls']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>15x15 Yard Box',
    'foundation',
    '3 Sets for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hockey style', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47511,
    '3 Step Face Dodge to Roll Dodge Drill',
    '995813809',
    ARRAY['Offense (with ball)', 'Dodging', 'Roll Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['face dodge', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47513,
    '4 Cone - Infinity Close The Gate Drill',
    '1003776563',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['agility', 'footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47515,
    '4 Cone - Infinity Drop Step and Run Drill',
    '1003776447',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['drop step', 'footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47517,
    '4 Cone - Infinity Drop Step and Shuffle Drill',
    '1003776350',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'One Defense Dollar', 'shuffle', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47519,
    '4 Cone - Side Shuffle Drill',
    '1003776290',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'One Defense Dollar', 'shuffle', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47521,
    '4 Cone Footwork - Circle The Cone Shuffle',
    '1010346954',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['agility', 'footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47523,
    '4 Cone Footwork - Circle The Cone Sideways Run',
    '1010347044',
    ARRAY['Defense (no ball)', '4 Cone Drills']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '2 Sets - 1 Per Direction of 3 Reps Each',
    5,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['agility', 'footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47525,
    'Answer Move to Time and Room - Time and Room Shooting Drill',
    '995813316',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['answer move', 'Skills-Academy', 'time and room shooting']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47527,
    'Approach and Recover Clockwise - Back Left',
    '1002923082',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47529,
    'Approach and Recover Clockwise - Back Right',
    '1002921894',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47531,
    'Approach and Recover Clockwise - Side Left',
    '1002922861',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47533,
    'Approach and Recover Clockwise - Side Right',
    '1002922120',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47535,
    'Approach and Recover Clockwise - Top Center',
    '1002922522',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47537,
    'Approach and Recover Clockwise - Top Left',
    '1002922752',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47539,
    'Approach and Recover Clockwise - Top Right',
    '1002922420',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47541,
    'Approach and Recover Counter Clockwise - Back Left',
    '1002922983',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47543,
    'Approach and Recover Counter Clockwise - Back Right',
    '1002921781',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47545,
    'Approach and Recover Counter Clockwise - Side Left',
    '1002921672',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47547,
    'Approach and Recover Counter Clockwise - Side Right',
    '1002922008',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47549,
    'Approach and Recover Counter Clockwise - Top Center',
    '1002922628',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47551,
    'Approach and Recover Counter Clockwise - Top Left',
    '1002933308',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47553,
    'Approach and Recover Counter Clockwise - Top Right',
    '1002922298',
    ARRAY['Defense (no ball)', 'Approach and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['approach and recover', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47555,
    'Back Foot Hitch Drill',
    '998233304',
    ARRAY['Offense (with ball)', 'Dodging', 'Hitch']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hitch step', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47557,
    'Bottom Hand Fake Drill',
    '997569605',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '2 Sets (1 per hand) for 20 Seconds Each',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['faking', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47559,
    'Catch Across Body - Time and Room Shooting Drill',
    '1002923636',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47561,
    'Crease Slide Drill - Left Alley Dodge',
    '1010346621',
    ARRAY['Defense (no ball)', 'Slide and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['crease defense', 'defensive sliding', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47563,
    'Cross Body Catch and Pause Drill',
    '1005106024',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'building',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'cross body', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47565,
    'Cross Over Step Roll Dodge to Shot on the Run Drill',
    '998918912',
    ARRAY['Offense (with ball)', 'Dodging', 'Roll Dodge']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cross over', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47567,
    'Defending at X - Run The Rails',
    '1003776061',
    ARRAY['Defense (no ball)', 'Defending at X']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'One Defense Dollar', 'running', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47569,
    'Defending at X - Through X Roll Back Drill',
    '1003777493',
    ARRAY['Defense (no ball)', 'Defending at X']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['One Defense Dollar', 'over the goal', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47571,
    'Defending at X - Through X Run The Rails',
    '1003776175',
    ARRAY['Defense (no ball)', 'Defending at X']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'One Defense Dollar', 'running', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47573,
    'Ding Dong Check on the Goal Drill',
    '1006973273',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'goal defense', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47575,
    'Double Hitch Drill',
    '998233177',
    ARRAY['Offense (with ball)', 'Dodging', 'Hitch']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hitch step', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47577,
    'Explode Speed Change Hesitation Drill',
    '1000499807',
    ARRAY['Offense (with ball)', 'Dodging', 'Rocker / Hesitation']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47579,
    'Extended Swat The Fly Drill',
    '995813655',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['extended release', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47581,
    'Face Dodge to Answer Move Drill',
    '995813715',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 5 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['answer move', 'face dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47583,
    'Fake Far Finish Near Drill',
    '997569734',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['faking', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47585,
    'Fake Near Finish Far Drill',
    '997569673',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['faking', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47587,
    'Fake The Slide Away Dodging Drill',
    '997569758',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['dodging', 'faking', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47589,
    'Far Side Fake Drill',
    '997569702',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['face dodge', 'faking', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47591,
    'Fast Break - Back Pipe Cross Crease Cut Drill',
    '1005105857',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['catching', 'fast break', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47593,
    'Fast Break - Low, Catch to Up the Hash Shot on the Run Drill',
    '1005105382',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47595,
    'Fast Break - Low, Catch to Up the Hash Time and Room Shot Drill',
    '1005105608',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'low catching', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47597,
    'Fast Break - Low, Up The Hash, Catch, Protect, and Turn The Corner Drill',
    '1005105643',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'protecting stick', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47599,
    'Fast Break - Point Catch and Fire Drill',
    '1005105696',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['catch and shoot', 'fast break', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47601,
    'Fast Break - Point Catch, Hitch, Shoot on the Run Drill',
    '1005105748',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47603,
    'Fast Break - Point Pass to Low Drill',
    '1005105796',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47605,
    'Fast Break - Skip to Low, Snively Catch and Finish Drill',
    '1005105960',
    ARRAY['Offense (with ball)', 'Fast Break Drills']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['fast break', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47607,
    'Fast Break Defense - Cross Crease Rotation Drill',
    '1007665438',
    ARRAY['Defense (no ball)', 'Fast Break Rotations']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive rotation', 'fast break defense', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47609,
    'Fast Break Defense - Get Down The Back Pipe Rotation Drill',
    '1010346853',
    ARRAY['Defense (no ball)', 'Fast Break Rotations']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive positioning', 'fast break defense', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47611,
    'Fast Break Defense - Point Slide Drill',
    '1007661944',
    ARRAY['Defense (no ball)', 'Fast Break Rotations']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive sliding', 'fast break defense', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47613,
    'Fast Break Defense - Up The Hash Rotation Drill',
    '1007665531',
    ARRAY['Defense (no ball)', 'Fast Break Rotations']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive rotation', 'fast break defense', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47615,
    'Foot Fire 3 Step Split Dodge Drill',
    '995904766',
    ARRAY['Offense (with ball)', 'Dodging', 'Split Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'Skills-Academy', 'split dodge']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47617,
    'Foot Fire Single Jab Face Dodge Drill',
    '995814381',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['face dodge', 'jab step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47619,
    'Foot Fire Single Jab Face Dodge to Answer Move',
    '995814233',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['answer move', 'face dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47621,
    'Foot Fire Single Jab Face Dodge to Roll Back Drill',
    '995813809',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['face dodge', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47623,
    'Foot Fire Single Jab Split Dodge Drill',
    '995814100',
    ARRAY['Offense (with ball)', 'Dodging', 'Split Dodge']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['jab step', 'Skills-Academy', 'split dodge']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47625,
    'Front Foot Hitch Drill',
    '998233385',
    ARRAY['Offense (with ball)', 'Dodging', 'Hitch']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hitch step', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47627,
    'High Crease - Back Pipe Cut Catch and Finish Drill',
    '1005105413',
    ARRAY['Offense (with ball)', 'Inside Finishing']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 8, "max": 12}, "coach_it": {"min": 10, "max": 14}, "own_it": {"min": 12, "max": 16}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cutting', 'dodging from X', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47629,
    'High Crease - Ball Cut Catch and Finish Drill',
    '1005105345',
    ARRAY['Offense (with ball)', 'Inside Finishing']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cutting', 'dodging from X', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47631,
    'High Crease - Clear Through Cut Catch and Finish Drill',
    '1005105345',
    ARRAY['Offense (with ball)', 'Inside Finishing']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cutting', 'dodging from X', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47633,
    'Horizontal Cradle Circles',
    '1000143480',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47635,
    'Infinity Down Checking and Footwork Drill',
    '1006972761',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '3 Sets of 20 Seconds Each',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47637,
    'Infinity Up Checking and Footwork Drill',
    '1006972662',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '3 Sets of 20 Seconds Each',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47639,
    'Inside Roll Dodging from X Drill',
    '1010351895',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['dodging from X', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47641,
    'Jump Shot on the Run Drill',
    '995899368',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['jump shot', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47643,
    'Ladder Drill - Icky Shuffle',
    '1003776640',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47645,
    'Ladder Drill - Left Foot In and Out',
    '1003777328',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47647,
    'Ladder Drill - One Foot In Each',
    '1003777403',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47649,
    'Ladder Drill - Right Foot In and Out',
    '1003775861',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47651,
    'Ladder Drill - Sideways In and Out - Left',
    '1003777224',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47653,
    'Ladder Drill - Sideways In and Out - Right',
    '1003777139',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47655,
    'Ladder Drill - Two Feet In Each - Left First',
    '1003775538',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47657,
    'Ladder Drill - Two Feet in Each - Right First',
    '1003776763',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47659,
    'Ladder Drill - Two In Two Out',
    '1003776857',
    ARRAY['Defense (with ball)', 'Ladder Drill']::text[],
    ARRAY['Goal', 'Speed Ladder']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x10 Yard Box',
    'building',
    '1 Set of 2 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['footwork', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47661,
    'Long Passing Drill',
    '1006972824',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal', 'Multiple Balls']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x30+ Yards Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['long passing', 'Skills-Academy', 'throwing']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47663,
    'Low Catch Drill',
    '1005106359',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'building',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'low catches', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47665,
    'Low Crease - Up Field Cut Catch and Finish Drill',
    '1005105297',
    ARRAY['Offense (with ball)', 'Inside Finishing']::text[],
    ARRAY['Bounce Back or Partner', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cutting', 'finishing', 'Skills-Academy', 'sweep dodge']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47667,
    'M Checking and Footwork Drill',
    '1006972399',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '3 Sets of 20 Seconds Each',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47669,
    'Matt Brown Shooting Drill',
    '989570487',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['Matt Brown technique', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47671,
    'Minnows Ground Ball Drill, Miss, Kick, Scoop',
    '995814739',
    ARRAY['Offense (with ball)', 'Ground Balls']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x30 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['ground ball recovery', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47673,
    'Minnows Ground Balls, Kiss The Stick Up to Pass Drill',
    '995814706',
    ARRAY['Offense (with ball)', 'Ground Balls']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x30 Yard Box',
    'foundation',
    '1 Set of 2 Reps',
    2,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['ground ball drill', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47675,
    'MJ Move Dodging from X Drill',
    '1010348045',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['advanced dodging', 'MJ move', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47677,
    'Near Side Fake Drill',
    '997569634',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['face dodge', 'faking', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47679,
    'Off Hand Wide Turn Ground Ball to Long Pass Drill',
    '1006972877',
    ARRAY['Defense (with ball)', 'Ground Balls']::text[],
    ARRAY['Cones', 'Goal', 'Multiple Balls']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x30+ Yards Box',
    'building',
    '1 Set of 5 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['long passing', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47681,
    'Off Hand Wide Turn Ground Balls',
    '995816035',
    ARRAY['Offense (with ball)', 'Ground Balls']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['scooping', 'Skills-Academy', 'wide turn']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47683,
    'On Ball Defense to Recover Drill',
    '1010390853',
    ARRAY['Defense (no ball)', 'Slide and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defense', 'One Defense Dollar', 'recovery', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47685,
    'One Handed Protected Cradle',
    '1000143432',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'protection', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47687,
    'Over The Shoulder Catching Drill',
    '1005106217',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'over shoulder', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47689,
    'Paint The Pipe Drill',
    '995814874',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['accuracy', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47691,
    'Pipe Approaches - Approach and Backpedal',
    '1002923252',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'foundation',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['backpedal', 'defensive footwork', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47693,
    'Pipe Approaches - C Approach and Shuffle',
    '1002923331',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'One Defense Dollar', 'shuffle', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47695,
    'Pipe Approaches - C Approach and Shuffle Drop Step',
    '1002923401',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'One Defense Dollar', 'shuffle', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47697,
    'Pipe Approaches - C Approach Turn and Run',
    '1002923573',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'One Defense Dollar', 'pipe approach', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47699,
    'Pipe Approaches - C Approach Turn and Run Drop Step',
    '1002923710',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'drop step', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47701,
    'Pipe Approaches - Left Foot Forward Retreat Steps',
    '1010346541',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'One Defense Dollar', 'retreat steps', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47703,
    'Pipe Approaches - Right Foot Forward Retreat Steps',
    '1010346448',
    ARRAY['Defense (no ball)', 'Pipe Approaches']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive footwork', 'One Defense Dollar', 'retreat steps', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47705,
    'Pipe Approaches - Slap Check Drill',
    '1006973050',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'slap check']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47707,
    'Pop to Catch Drill',
    '1005106321',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'pop technique', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47709,
    'Pop to Hitch Drill',
    '998233057',
    ARRAY['Offense (with ball)', 'Dodging', 'Hitch']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'hitch step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47711,
    'Pop to Shot - Time and Room Shooting Drill',
    '995814969',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['pop technique', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47713,
    'Post Up BTB Dodging from X Drill',
    '1010347922',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 8, "max": 12}, "coach_it": {"min": 10, "max": 14}, "own_it": {"min": 12, "max": 16}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['BTB', 'dodging from X', 'post up', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47715,
    'Punch and Pull Passing Drill',
    '995815050',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['passing', 'punch and pull', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47717,
    'Question Mark Shooting Drill',
    '1010347709',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['question mark technique', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47719,
    'Question Mark Spot Training Drill',
    '1010347595',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['question mark technique', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47721,
    'Quick Stick Catching Drill',
    '1002923901',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'quick stick', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47723,
    'Quick Switches Hand Speed Drill',
    '1002923934',
    ARRAY['Offense (with ball)', 'Dodging', 'Split Dodge']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '3 Sets for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hand switching', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47725,
    'Rebound Roll Dodge Drill',
    '999673005',
    ARRAY['Offense (with ball)', 'Dodging', 'Roll Dodge']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['rebound', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47727,
    'Richmond Step and Shoot on the Run Drill',
    '995815179',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47729,
    'Right Alley Crease Slide Drill',
    '1010346738',
    ARRAY['Defense (no ball)', 'Slide and Recover']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['crease defense', 'defensive sliding', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47731,
    'Rocker Dodge From X Drill',
    '1010352117',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['dodging from X', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47733,
    'Rocker to Roll Dodge Drill',
    '998919015',
    ARRAY['Offense (with ball)', 'Dodging', 'Rocker / Hesitation']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['rocker step', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47735,
    'Roll Dodge to Set Feet - Time and Room Shooting Drill',
    '995815254',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['roll dodge', 'Skills-Academy', 'time and room shooting']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47737,
    'Sell the Shot Roll Dodge Drill',
    '998919094',
    ARRAY['Offense (with ball)', 'Dodging', 'Roll Dodge']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['roll dodge', 'shot fake', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47739,
    'Shooting Cradle Circles Drill',
    '1000143531',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'building',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'shooting preparation', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47741,
    'Shooting on the Run - No Shooting Cradle - Quick Release Drill',
    '995814803',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47743,
    'Shooting on the Run Around a Curve Drill - Across The Top',
    '995813416',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['curved path', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47745,
    'Shooting on the Run Around a Curve Drill - Down The Alley',
    '995813504',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['curved path', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47747,
    'Shooting on the Run Around a Curve Drill - Up The Hash / Turn The Corner',
    '995813569',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['curved path', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47749,
    'Shoulder to Nose Cradle',
    '1000143366',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'shoulder to nose', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47751,
    'Shoulder to Shoulder Cradle',
    '1000143384',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'foundation',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'shoulder to shoulder', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47753,
    'Shuffle Step Time and Room Shooting Drill - Behind The Goal',
    '995815371',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 10}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['shooting', 'shuffle step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47755,
    'Side Arm Extended Swat The Fly Shooting Drill',
    '1010347821',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['extended release', 'sidearm shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47757,
    'Side Arm Shuffle and Shoot Drill',
    '1007726527',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'sidearm shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47759,
    'Sidearm Swat The Fly Shooting Drill',
    '1007664485',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['sidearm shooting', 'Skills-Academy', 'swat the fly']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47761,
    'Single Cradle Catching Drill',
    '1005106282',
    ARRAY['Offense (with ball)', 'Catching Drills']::text[],
    ARRAY['Bounce Back or Partner']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>5x15 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 10 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['catching', 'cradling', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47763,
    'Single Jab Split Dodge Drill',
    '995815475',
    ARRAY['Offense (with ball)', 'Dodging', 'Split Dodge']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['jab step', 'Skills-Academy', 'split dodge']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47765,
    'Skeleton Defending at X Drill',
    '1010348273',
    ARRAY['Defense (no ball)', 'Defending at X']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defending X', 'defensive positioning', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47767,
    'Skip Step Hesitation Drill',
    '1000499893',
    ARRAY['Offense (with ball)', 'Dodging', 'Rocker / Hesitation']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47769,
    'Slide Em Down - 2 Jab Explode Over The Top Drill',
    '996263742',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'jab step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47771,
    'Slide Em Down - Explode Over The Top Drill',
    '1007664383',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47773,
    'Slide Em Down - Explode Underneath Drill',
    '996263664',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47775,
    'Slide Em Down - Jab and Go Underneath Drill',
    '996263566',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'jab step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47777,
    'Slide Em Down - Jab to Keep Em Honest Drill',
    '1007664325',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'jab step', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47779,
    'Slide Em Up - 3 Step Split Underneath.',
    '996264010',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['jab step', 'Skills-Academy', 'split dodge']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47781,
    'Slide Em Up - Explode Over The Top',
    '996263840',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47783,
    'Slide Em Up - Explode Underneath Dodging Drill',
    '1007664421',
    ARRAY['Offense (with ball)', 'Dodging', 'Slide Em Dodging']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47785,
    'Split to Set Feet - Time and Room Shooting Drill',
    '995815554',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['Skills-Academy', 'split dodge', 'time and room shooting']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47787,
    'Standing Switches - Up to Pass Drill',
    '995815631',
    ARRAY['Offense (with ball)', 'Dodging', 'Split Dodge']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '1 Set of 4 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['hand switching', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47789,
    'Step Away Inside Roll on GLE Drill',
    '1010347237',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['GLE play', 'roll dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47791,
    'Step Away Passing Drill',
    '995815695',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47793,
    'Step Away ReAttack Drill',
    '1000499951',
    ARRAY['Offense (with ball)', 'Dodging', 'Rocker / Hesitation']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47795,
    'Step Away Turn The Corner - Island Finishing Drill',
    '1007664259',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['finishing', 'Skills-Academy', 'turn the corner']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47797,
    'Stick Away Turn and Switch Hands Drill',
    '998918868',
    ARRAY['Offense (with ball)', 'Dodging', 'Roll Dodge']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['Skills-Academy', 'stick protection', 'turning']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47799,
    'Strong Hand Wide Turn Ground Ball to Long Pass Drill',
    '1006972934',
    ARRAY['Defense (with ball)', 'Ground Balls']::text[],
    ARRAY['Cones', 'Goal', 'Multiple Balls']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Field (Balls in Flight)>10x30+ Yards Box',
    'building',
    '1 Set of 5 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['long passing', 'scooping', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47801,
    'Strong Hand Wide Turn Ground Balls',
    '995816128',
    ARRAY['Offense (with ball)', 'Ground Balls']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['scooping', 'Skills-Academy', 'wide turn']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47803,
    'Swat The Fly - Extended - Time and Room Shooting Drill',
    '995813655',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['extended release', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47805,
    'Swat The Fly - Inside Hand Passing Drill',
    '995814508',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['inside hand', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47807,
    'Swat The Fly Drill - Behind The Goal',
    '995815775',
    ARRAY['Offense (with ball)', 'Passing']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['passing', 'Skills-Academy', 'swat the fly']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47809,
    'T2 Shooting on the Run Footwork Drill',
    '995815891',
    ARRAY['Offense (with ball)', 'Shooting', 'Shooting on the Run']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'shooting on the run', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47811,
    'Talk To - Listen To Top Hand Fake Drill',
    '997569552',
    ARRAY['Offense (with ball)', 'Faking']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '2 Sets (1 per hand) of 2 Reps - 20 Seconds Each',
    3,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cradling', 'faking', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47813,
    'True Rocker Drill',
    '1000500048',
    ARRAY['Offense (with ball)', 'Dodging', 'Rocker / Hesitation']::text[],
    ARRAY['Cones', 'Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['dodging', 'explosive movement', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47815,
    'Underhand Extended Swat The Fly Shooting Drill',
    '1010346356',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 10}, "coach_it": {"min": 8, "max": 12}, "own_it": {"min": 10, "max": 14}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'building',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['extended release', 'Skills-Academy', 'underhand passing']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47817,
    'Underhand Shuffle and Shoot Drill',
    '1007726431',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['footwork', 'Skills-Academy', 'underhand shooting']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47819,
    'Underhand Swat The Fly Shooting Drill',
    '1007664559',
    ARRAY['Offense (with ball)', 'Shooting', 'Time and Room']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 5 Reps',
    5,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['Skills-Academy', 'swat the fly', 'underhand shooting']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47821,
    'Up The Hash - Lever Shot Drill',
    '1007665612',
    ARRAY['Offense (with ball)', 'Finishing From X']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 4 Reps',
    5,
    '{"attack_token": 1, "lax_credit": 1}'::jsonb,
    ARRAY['lever technique', 'shooting', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47823,
    'Up to Pass Face Dodge Drill',
    '994566727',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x30 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 2 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['face dodge', 'passing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47825,
    'V-Hold Wrap Check on a Goal Drill',
    '1006973004',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['One Defense Dollar', 'Skills-Academy', 'V-hold', 'wrap check']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47827,
    'V-Hold Wrap Check the Roll on the Goal Drill',
    '1010352013',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    3,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'V-hold']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47829,
    'Vertical Cradle Circles',
    '1000143452',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'building',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47831,
    'W Checking and Footwork Drill',
    '1006972513',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Cones']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'building',
    '3 Sets of 20 Seconds Each',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['defensive checking', 'One Defense Dollar', 'Skills-Academy', 'stick work']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47833,
    'Wind Up Face Dodge to Shin Cradles',
    '1000143512',
    ARRAY['Offense (with ball)', 'Cradling']::text[],
    ARRAY[]::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Anywhere (No Flying Balls)>5x5 Yard Box',
    'building',
    '4 Sets (2 per hand) for 20 Seconds Each',
    3,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['cradling', 'face dodge', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47835,
    'Wind Up Face Dodge to Shot Drill',
    '995816196',
    ARRAY['Offense (with ball)', 'Dodging', 'Face Dodge']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>20x20 Yard Box',
    'foundation',
    '2 Sets (1 per hand) of 3 Reps',
    4,
    '{"lax_credit": 1, "midfield_medal": 1}'::jsonb,
    ARRAY['face dodge', 'finishing', 'Skills-Academy']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47837,
    'Wrap Check on a Goal Drill',
    '1006973110',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 6, "max": 8}, "coach_it": {"min": 6, "max": 8}, "own_it": {"min": 9, "max": 10}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cross check', 'One Defense Dollar', 'Skills-Academy', 'wrap check']::text[],
    NOW()
);

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
    tags,
    created_at
) VALUES (
    47839,
    'Wrap Check the Roll on the Goal Drill',
    '1010347474',
    ARRAY['Defense (no ball)', 'Checking']::text[],
    ARRAY['Goal']::text[],
    '{"do_it": {"min": 8, "max": 10}, "coach_it": {"min": 10, "max": 14}, "own_it": {"min": 14, "max": 18}}'::jsonb,
    'Goal Area Spaces (Goals for shooting or reference)>10x10 Yard Box',
    'advanced',
    '1 Set of 3 Reps',
    2,
    '{"defense_dollar": 1, "lax_credit": 1}'::jsonb,
    ARRAY['cross check', 'defensive checking', 'One Defense Dollar', 'Skills-Academy']::text[],
    NOW()
);