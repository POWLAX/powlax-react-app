-- Skills Academy Workouts Import
-- Generated: 2025-08-04T22:48:56.987963
-- Total Workouts: 192


-- Skills Academy Workouts Table
CREATE TABLE IF NOT EXISTS skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    workout_type VARCHAR(50) CHECK (workout_type IN ('wall_ball', 'attack', 'defense', 'midfield', 'flex', 'general')),
    duration_minutes INTEGER,
    point_values JSONB,
    tags TEXT[],
    description TEXT,
    drill_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workout_type ON skills_academy_workouts(workout_type);
CREATE INDEX idx_workout_tags ON skills_academy_workouts USING GIN(tags);

-- Create workout-to-drills relationship table
CREATE TABLE IF NOT EXISTS workout_drill_relationships (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id),
    drill_id INTEGER REFERENCES skills_academy_drills(id),
    sequence_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);


INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    15726,
    'Running an 8U Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Running an 8U Practice Quiz" POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    15744,
    'Running an Introductory Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Running an Introductory Practice Plan Quiz" POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16019,
    'Practice Planning to Build Transition Offense 1',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Practice Planning to Build Transition Offense 1 Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16044,
    'Practice Planning to Build Transition Offense 2 Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Practice Planning to Build Transition Offense 2 Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16090,
    'Settled Offense and Defense Practice Plan 1 Quiz',
    'defense',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Settled Offense and Defense Practice Plan 1 Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16119,
    'Settled Offense and Defense Practice Plan 2 Quiz',
    'defense',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Settled Offense and Defense Practice Plan 2 Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16142,
    'Pre-game Practice Plan Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Pre-game Practice Plan Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16165,
    'Goalie Training in Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Goalie Training in Practice Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16177,
    'Face Off Training in Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Face-off Training in Practice” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16183,
    'Coaching Roles and Responsibilities in Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Coaching Roles and Responsibilities in Practice Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16195,
    'Elements of a Great Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Elements of a Great Practice Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16201,
    'Accomplishing Our Goal in Practice Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Accomplishing Our Goal in Practice Quiz” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16223,
    'Practice Essentials Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Practice Essentials” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    16238,
    'How I Practice Plan Quiz',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Complete this quiz with a score of 80% or better to receive the “Face-off Training in Practice” POWLAX Certificate of Completion. After completing the quiz, you must print or save the certificate! If you leave the quiz without saving or printing it, you will have to complete the quiz again.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    24872,
    '5 Minute Maintenance Wall Ball Workout (With Coaching)',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    24942,
    '.5 Midfield Wall Ball Workout - 5 Minute Maintenance',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    'Perfect for when you’re short on time—our 5-Minute Quick Stick Skill Maintenance Workout keeps your hands sharp and your reflexes razor fast! Rapid-fire reps will maintain your edge and keep your stick skills game-ready in just minutes!',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25605,
    'Defense Practice 1',
    'defense',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'Pipe Approaches, Defending at X, Long Passes, Face Dodge',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25730,
    'Wall Ball - Master Fundamentals Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['foundation-ace', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25750,
    'Attack Practice 1: Establishment of Technique',
    'attack',
    NULL,
    '{"lax_credit": 0, "attack_token": 4}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    'This quiz is a set of drills to establish technique for Attackman.',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25760,
    '10 Drill Defense Practice 1:',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    'This is a defensive practice focusing on Pipe Approaches, Defending at X, Long Passes, Face Dodge.',
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25828,
    '5 Drill Defense Practice 1:',
    'defense',
    NULL,
    '{"lax_credit": 0}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    'This is a defensive practice focusing on Pipe Approaches, Defending at X, Long Passes, Face Dodge.',
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25866,
    'Defense Practice 2: 5 Drill Version',
    'defense',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25942,
    '5 Minute Establishing Technique Work Out',
    'attack',
    5,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25969,
    'Master Fundamentals Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['foundation-ace', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25972,
    'Master Fundamentals Wall Ball Workout - 17 Minutes',
    'wall_ball',
    17,
    '{"lax_credit": 17, "rebound_reward": 17}'::jsonb,
    ARRAY['foundation-ace', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25974,
    'Dodging Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25978,
    'Dodging Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25982,
    'Dodging Wall Ball Workout - 16 Minutes',
    'wall_ball',
    16,
    '{"lax_credit": 16, "rebound_reward": 16}'::jsonb,
    ARRAY['long-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25985,
    'Conditioning Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['stamina-star', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25987,
    'Conditioning Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['stamina-star', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25989,
    'Conditioning Wall Ball Workout - 14 Minutes',
    'wall_ball',
    14,
    '{"lax_credit": 14, "rebound_reward": 14}'::jsonb,
    ARRAY['stamina-star', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25991,
    'Faking and Inside Finishing Wall Ball Workout - 15 Minutes',
    'wall_ball',
    15,
    '{"rebound_reward": 15}'::jsonb,
    ARRAY['finishing-phenom', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25993,
    'Faking and Inside Finishing Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'finishing-phenom', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25995,
    'Faking and Inside Finishing Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'finishing-phenom', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25997,
    'Shooting Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'bullet-snatcher', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    25999,
    'Shooting Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'bullet-snatcher', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26001,
    'Shooting Wall Ball Workout - 18 Minutes',
    'wall_ball',
    18,
    '{"lax_credit": 18, "rebound_reward": 18}'::jsonb,
    ARRAY['bullet-snatcher', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26003,
    'Long Pole Skills Wall Ball Workout - 17 Minutes',
    'wall_ball',
    17,
    '{"lax_credit": 17, "rebound_reward": 17}'::jsonb,
    ARRAY['long-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26005,
    'Long Pole Skills Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26007,
    'Long Pole Skills Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26009,
    'Catch Everything Wall Ball Workout - 14 Minutes',
    'wall_ball',
    14,
    '{"lax_credit": 14, "rebound_reward": 14}'::jsonb,
    ARRAY['wall-ball-hawk', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26011,
    'Catch Everything Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['wall-ball-hawk', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26013,
    'Catch Everything Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['wall-ball-hawk', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26015,
    'Advanced Fun and Challenging Wall Ball Workout - 18 Minutes',
    'wall_ball',
    18,
    '{"lax_credit": 18, "rebound_reward": 18}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26018,
    'Advanced Fun and Challenging Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26020,
    'Advanced Fun and Challenging Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26025,
    'Master Fundamentals Wall Ball Routine (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['foundation-ace', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26027,
    'Master Fundamentals Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['foundation-ace', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26029,
    'Master Fundamentals Wall Ball Workout (No Coaching) - 17 Minutes',
    'wall_ball',
    17,
    '{"lax_credit": 17, "rebound_reward": 17}'::jsonb,
    ARRAY['foundation-ace', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26031,
    'Dodging Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26036,
    'Dodging Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26038,
    'Dodging Wall Ball Workout (No Coaching) - 16 Minutes',
    'wall_ball',
    16,
    '{"lax_credit": 16, "rebound_reward": 16}'::jsonb,
    ARRAY['long-workout', 'Skills-Academy', 'dominant-dodger']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26040,
    'Conditioning Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['stamina-star', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26045,
    'Conditioning Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['stamina-star', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26048,
    'Conditioning Wall Ball Workout (No Coaching) - 14 Minutes',
    'wall_ball',
    14,
    '{"lax_credit": 14, "rebound_reward": 14}'::jsonb,
    ARRAY['stamina-star', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26050,
    'Faking and Inside Finishing Wall Ball Workout (No Coaching) - 15 Minutes',
    'wall_ball',
    15,
    '{"rebound_reward": 15}'::jsonb,
    ARRAY['finishing-phenom', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26052,
    'Faking and Inside Finishing Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'finishing-phenom', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26054,
    'Faking and Inside Finishing Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'finishing-phenom', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26056,
    'Shooting Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'bullet-snatcher', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26063,
    'Shooting Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'bullet-snatcher', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26065,
    'Shooting Wall Ball Workout (No Coaching) - 18 Minutes',
    'wall_ball',
    18,
    '{"lax_credit": 16, "rebound_reward": 16}'::jsonb,
    ARRAY['bullet-snatcher', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26068,
    'Long Pole Skills Wall Ball Workout (No Coaching) - 17 Minutes',
    'wall_ball',
    17,
    '{"lax_credit": 17, "rebound_reward": 17}'::jsonb,
    ARRAY['long-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26070,
    'Long Pole Skills Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26072,
    'Long Pole Skills Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy', 'long-pole-lizard']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26076,
    'Catch Everything Wall Ball Workout (No Coaching) - 14 Minutes',
    'wall_ball',
    14,
    '{"lax_credit": 14, "rebound_reward": 14}'::jsonb,
    ARRAY['wall-ball-hawk', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26078,
    'Catch Everything Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['wall-ball-hawk', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26080,
    'Catch Everything Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['wall-ball-hawk', '5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26082,
    'Advanced Fun and Challenging Wall Ball Workout (No Coaching) - 18 Minutes',
    'wall_ball',
    18,
    '{"lax_credit": 18, "rebound_reward": 18}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26084,
    'Advanced Fun and Challenging Wall Ball Workout (No Coaching) - 10 Minutes',
    'wall_ball',
    10,
    '{"lax_credit": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26086,
    'Advanced Fun and Challenging Wall Ball Workout (No Coaching) - 05 Minutes',
    'wall_ball',
    5,
    '{"lax_credit": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26407,
    'Attack Establishment of Technique - A1 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26410,
    'Establishment of Technique - A1 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26412,
    'Establishment of Technique - A1 - 14 Drills',
    'attack',
    NULL,
    '{"lax_credit": 14, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    'Earn Attack Tokens and Lax Credits for completing Attack Based Workouts!',
    14,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26599,
    'Self-Guided Wall Ball Workout - 05 Minutes',
    'wall_ball',
    5,
    '{"flex_points": 5, "rebound_reward": 5}'::jsonb,
    ARRAY['Skills-Academy-Flex', 'Skills-Academy', 'independent-improver']::text[],
    'Log your self-guided wall ball workout to earn 5 Flex Points and track your progress!',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26606,
    'Self-Guided Wall Ball Workout - 10 Minutes',
    'wall_ball',
    10,
    '{"flex_points": 10, "rebound_reward": 10}'::jsonb,
    ARRAY['Skills-Academy-Flex', 'Skills-Academy', 'independent-improver']::text[],
    'Log your self-guided wall ball workout to earn 10 Flex Points and track your progress!',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26608,
    'Self-Guided Wall Ball Workout - 15 Minutes',
    'wall_ball',
    15,
    '{"flex_points": 15, "rebound_reward": 15}'::jsonb,
    ARRAY['Skills-Academy-Flex', 'Skills-Academy', 'independent-improver']::text[],
    'Log your self-guided wall ball workout to earn 15 Flex Points and track your progress!',
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26697,
    'Pipe Approaches, Defending at X, Long Passes - D1 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26699,
    'Split Dodge and Shooting on the Run - A2 - 14 Drills',
    'attack',
    NULL,
    '{"lax_credit": 14, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    14,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26704,
    'Split Dodge and Shooting on the Run - A2 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26708,
    'Finishing From X - Up the Hash - A3 - 15 Drills',
    'attack',
    NULL,
    '{"lax_credit": 15, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26710,
    'Split Dodge and Shooting on the Run - A2 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26717,
    'Finishing From X - Up the Hash - A3 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26719,
    'Attack - Finishing From X - Up the Hash - A3 - 05 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26723,
    'Catching - Faking - Crease Play - A4 - 17 Drills',
    'attack',
    NULL,
    '{"lax_credit": 17, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    17,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26725,
    'Catching - Faking - Crease Play - A4 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26727,
    'Catching - Faking - Crease Play - A4 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26733,
    'Running A Fast Break - A5 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26735,
    'Running A Fast Break - Inside Finishing - A5 - 16 Drills',
    'attack',
    NULL,
    '{"lax_credit": 16, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26737,
    'Running A Fast Break - A5 - 05 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26755,
    'Time and Room Shooting &amp; Wind Up Dodging - A6 - 16 Drills',
    'attack',
    NULL,
    '{"lax_credit": 16, "attack_token": 3}'::jsonb,
    ARRAY['Fence Saver', 'Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26757,
    'Time and Room Shooting &amp; Wind Up Dodging - A6 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['Fence Saver', '10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26759,
    'Time and Room Shooting &amp; Wind Up Dodging - A6 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['Fence Saver', 'Ankle Breaker 5', 'Skills-Academy', '5-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26767,
    'Shooting on the Run &amp; Slide Em Dodging - A8 - 14 Drills',
    'attack',
    NULL,
    '{"lax_credit": 14, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 15', 'Ankle Breaker', 'long-workout']::text[],
    NULL,
    14,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26769,
    'Wing and X Hesitation Dodges 4 Cone Footwork - A7 - 15 Drills',
    'attack',
    NULL,
    '{"lax_credit": 15, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 15', 'Ankle Breaker', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26771,
    'Wing Hesitation Dodges - A7 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 5', '5-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26773,
    'Wing and Hash Hesitation Dodges - A7 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 10', '10-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26786,
    'Shooting on the Run &amp; Slide Em Dodging - A8 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 5', '5-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26788,
    'Shooting on the Run &amp; Slide Em Dodging - A8 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 10', '10-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26795,
    'Inside Finishing - Rocker &amp; Roll Dodge - A9 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26797,
    'Roll Dodge - A9 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26799,
    'Inside Finishing - Hesitation, Rocker, Roll Dodge - A9 - 16 Drills',
    'attack',
    NULL,
    '{"lax_credit": 16, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26807,
    'Time and Room Shooting Out of a Dodge and Release Points - A11 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26809,
    'Time and Room Shooting Out of a Dodge and Release Points - A11 - 15 Drills',
    'attack',
    NULL,
    '{"lax_credit": 15, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26811,
    'Time and Room Shooting Out of a Dodge and Release Points - A11 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26819,
    'Ride Angles and Dodging Favorites - A12 - 16 Drills',
    'attack',
    NULL,
    '{"lax_credit": 16, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26821,
    'Ride Angles and Dodging Favorites - A12 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26823,
    'Ride Angles and Dodging Favorites - A12 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26830,
    'Ladder Drills and North South Dodging - A10 - 16 Drills',
    'attack',
    NULL,
    '{"lax_credit": 16, "attack_token": 3}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 15', 'Ankle Breaker', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26832,
    'Ladder Drills and North South Dodging - A10 - 5 Drills',
    'attack',
    NULL,
    '{"lax_credit": 5, "attack_token": 1}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 5', '5-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26834,
    'Ladder Drills and North South Dodging - A10 - 10 Drills',
    'attack',
    NULL,
    '{"lax_credit": 10, "attack_token": 2}'::jsonb,
    ARRAY['Skills-Academy', 'Ankle Breaker 10', '10-drill-workout', 'Ankle Breaker']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26841,
    'Midfield Foundation of Skills - M1 - 10 Drills',
    'midfield',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26845,
    'Midfield Foundation of Skills - M1 - 05 Drills',
    'midfield',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26855,
    'Complete Shooting Progression - M2 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Fence Saver', 'Skills-Academy', 'Easy Ball Hunt', 'Long Workout', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26857,
    'Complete Shooting Progression - M2 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Fence Saver', '10-drill-workout', 'Easy Ball Hunt', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26859,
    'Time and Room Shooting Progression - M2 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Fence Saver', 'Easy Ball Hunt', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26861,
    'Catching, Faking, and Inside Finishing - M3 - 17 Drills',
    'general',
    NULL,
    '{"lax_credit": 17}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    17,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26869,
    'Defensive Footwork - Approach Angles And Recovering in - M4 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26871,
    'Catching, Faking, and Inside Finishing - M3 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26873,
    'Catching, Faking, and Inside Finishing - M3 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26880,
    'Wing Dodging - M5 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26883,
    'Defensive Footwork - Approach Angles And Recovering in - M4 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26885,
    'Defensive Footwork - Approach Angles And Recovering in - M4 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26890,
    'Time and Room Shooting and Wind Up Dodging - M6 - 14 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    14,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26892,
    'Wing Dodging - M5 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26894,
    'Wing Dodging - M5 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26903,
    'Time and Room Shooting and Wind Up Dodging - M6 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26905,
    'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26907,
    'Time and Room Shooting and Wind Up Dodging - M6 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26915,
    'Midfield - Master Split Dodge and Shoot on the Run - M7 - 05 Drills',
    'midfield',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26917,
    'Master Split Dodge and Shoot on the Run - M7 - 17 Drills',
    'general',
    NULL,
    '{"lax_credit": 17}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    17,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26919,
    'Master Split Dodge and Shoot on the Run - M7 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26929,
    'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26931,
    'Ladder Footwork - Approach Angles - Creative Dodging - M8 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26945,
    'Inside Finishing, Hesitations and Roll Dodges - M9 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26947,
    'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26949,
    'Inside Finishing, Hesitations and Roll Dodges - M9 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26958,
    'Shooting on the Run and Slide Em Dodging - M11 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26960,
    'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26962,
    'Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26972,
    'Shooting on the Run and Slide Em Dodging - M11 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26974,
    'Shooting on the Run and Slide Em Dodging - M11 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26976,
    'Defensive Approaches, Recoveries, Fast Break Defense - M12 - 16 Drills',
    'defense',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26985,
    'Defensive Approaches, Recoveries, Fast Break Defense - M12 - 10 Drills',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    26989,
    'Fast Break Defense and Rotations - M12 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27062,
    'Pipe Approaches, Defending at X, Long Passes - D1 - 16 Drills',
    'general',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27070,
    '4 Cone Footwork, Fast Break Defense and Rotations, Time and Room Shooting and Hitches - D2 - 10 Drills',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27072,
    '4 Cone Footwork, Fast Break Defense and Rotations, Time and Room Shooting and Hitches - D2 - 16 Drills',
    'defense',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27074,
    'Defense - Pipe Approaches, Defending at X, Long Passes - D1 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27079,
    '4 Cone Footwork, Fast Break Defense and Rotations and Hitches - D2 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27083,
    'Approach and Recover to Low Positions, Sliding and Recovering, Long Passes, Split Dodge - D3 - 16 Drills',
    'general',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27085,
    'Approach and Recover to Low Positions, Sliding and Recovering, Long Passes, Split Dodge - D3 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27090,
    'Ladder Drill Set 1, Defending at X, Faking - D4 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27092,
    'Ladder Drill Set 1, Defending at X, Faking - D4 - 14 Drills',
    'general',
    NULL,
    '{"lax_credit": 14}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    14,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27094,
    'Approach and Recover to Low Positions, Sliding and Recovering, Split Dodge - D3 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27102,
    'Ladder Drill Set 1, Defending at X, Faking - D4 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27104,
    'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 10 Drills',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27106,
    'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 16 Drills',
    'defense',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27112,
    '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls, Shooting on the Run - D6 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27114,
    '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls, Shooting on the Run - D6 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27116,
    'Pipe Approaches Set 2, Fast Break Defense and Rotations, Stick Checks - D5 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27123,
    'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27125,
    'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 16 Drills',
    'general',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27127,
    '4 Cone Footwork Series 2, Sliding and Recovering, Ground Balls - D6 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27143,
    'Approach and Recover, Sides, Defending at X, Face Dodge - D7 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27145,
    'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 10 Drills',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27147,
    'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 15 Drills',
    'defense',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27153,
    'Pipe Approaches Group 3, Sliding and Recovering, GB''s Long Passes, Split Dodge - D9 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27155,
    'Pipe Approaches Group 3, Sliding and Recovering, GB''s  Long Passes, Split Dodge - D9 - 15 Drills',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27157,
    'Ladder Drill Set 2, Fast Break Defense and Rotations, Time and Room Shooting / Hitches - D8 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27163,
    '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 16 Drills',
    'general',
    NULL,
    '{"lax_credit": 16}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    16,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27165,
    'Pipe Approaches Group 3, Sliding and Recovering, GB''s Long Passes, Split Dodge - D9 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27167,
    '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27175,
    'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 05 Drills',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27177,
    '4 Cone Footwork Series 3, Defending at X, Faking - D10 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27179,
    'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 15 Drills',
    'defense',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    15,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27185,
    'Approach and Recover Top, Fast Break Defense and Rotations, GB''s and Long Passes - D11 - 10 Drills',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27187,
    'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 17 Drills',
    'general',
    NULL,
    '{"lax_credit": 17}'::jsonb,
    ARRAY['Skills-Academy', 'long-workout']::text[],
    NULL,
    17,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27189,
    'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 10 Drills',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['10-drill-workout', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    27199,
    'Ladder Drill Set 3, Sliding and Recovering, Checking, and Shooting on the Run - D12 - 05 Drills',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['5-drill-workout', 'Skills-Academy']::text[],
    NULL,
    5,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    30065,
    '5 Min - Smart Backstop Fence Saver Workout',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['Fence Saver', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    30068,
    '15 Min - Smart Backstop Fence Saver Workout',
    'general',
    NULL,
    '{"lax_credit": 15}'::jsonb,
    ARRAY['Fence Saver', 'Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    30073,
    '10 Drills - Smart Backstop Fence Saver Workout',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Fence Saver', 'Skills-Academy']::text[],
    NULL,
    10,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34324,
    'Solid Start Workout 1 - Picking Up and Passing - More',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34330,
    'Solid Start 2 - Defense and Shooting Workout - Mini',
    'defense',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34332,
    'Solid Start 2 - Defense and Shooting Workout - More',
    'defense',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34338,
    'Solid Start 3 - Catching and Hesitation Workout - Mini',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34340,
    'Solid Start 3 - Catching and Hesitation Workout - More',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34342,
    'Solid Start 4 - Wind Up Dodging Workout - Mini',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34344,
    'Solid Start 4 - Wind Up Dodging Workout - More',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34346,
    'Solid Start 5 - Switching Hands Workout - Mini',
    'general',
    NULL,
    '{"lax_credit": 5}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    34348,
    'Solid Start 5 - Switching Hands Workout - More',
    'general',
    NULL,
    '{"lax_credit": 10}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);

INSERT INTO skills_academy_workouts (
    original_id,
    title,
    workout_type,
    duration_minutes,
    point_values,
    tags,
    description,
    drill_count,
    created_at
) VALUES (
    48192,
    'Quiz / Workout Title',
    'general',
    NULL,
    '{}'::jsonb,
    ARRAY['Skills-Academy']::text[],
    NULL,
    NULL,
    NOW()
);