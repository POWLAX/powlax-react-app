-- POWLAX Table Naming Standardization & Skills Academy Workout Fix
-- Standardizes table names to powlax_[entity] convention and fixes skills academy workouts
-- Generated: 2025-01-15

-- ========================================
-- 1. RENAME TABLES TO POWLAX_[ENTITY] CONVENTION
-- ========================================

-- Rename drills_powlax to powlax_drills (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drills_powlax') THEN
        -- Rename the table
        ALTER TABLE drills_powlax RENAME TO powlax_drills;
        RAISE NOTICE 'Renamed drills_powlax to powlax_drills';
        
        -- Update any indexes that reference the old table name
        DROP INDEX IF EXISTS idx_drills_powlax_title;
        DROP INDEX IF EXISTS idx_drills_powlax_drill_types;
        DROP INDEX IF EXISTS idx_drills_powlax_game_phase;
        
        -- Recreate indexes with new naming
        CREATE INDEX IF NOT EXISTS idx_powlax_drills_title ON powlax_drills(title);
        CREATE INDEX IF NOT EXISTS idx_powlax_drills_drill_types ON powlax_drills(drill_types);
        CREATE INDEX IF NOT EXISTS idx_powlax_drills_game_phase ON powlax_drills(game_phase);
        CREATE INDEX IF NOT EXISTS idx_powlax_drills_wp_id ON powlax_drills(wp_id);
        CREATE INDEX IF NOT EXISTS idx_powlax_drills_status ON powlax_drills(status);
        
        RAISE NOTICE 'Updated indexes for powlax_drills';
    ELSE
        RAISE NOTICE 'Table drills_powlax does not exist, skipping rename';
    END IF;
END$$;

-- Rename strategies_powlax to powlax_strategies (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategies_powlax') THEN
        -- Rename the table
        ALTER TABLE strategies_powlax RENAME TO powlax_strategies;
        RAISE NOTICE 'Renamed strategies_powlax to powlax_strategies';
        
        -- Update any indexes that reference the old table name
        DROP INDEX IF EXISTS idx_strategies_powlax_title;
        DROP INDEX IF EXISTS idx_strategies_powlax_categories;
        DROP INDEX IF EXISTS idx_strategies_powlax_wp_id;
        
        -- Recreate indexes with new naming
        CREATE INDEX IF NOT EXISTS idx_powlax_strategies_strategy_name ON powlax_strategies(strategy_name);
        CREATE INDEX IF NOT EXISTS idx_powlax_strategies_categories ON powlax_strategies(strategy_categories);
        CREATE INDEX IF NOT EXISTS idx_powlax_strategies_reference_id ON powlax_strategies(reference_id);
        CREATE INDEX IF NOT EXISTS idx_powlax_strategies_target_audience ON powlax_strategies(target_audience);
        
        RAISE NOTICE 'Updated indexes for powlax_strategies';
    ELSE
        RAISE NOTICE 'Table strategies_powlax does not exist, skipping rename';
    END IF;
END$$;

-- Update foreign key references in drill_strategy_map_powlax (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drill_strategy_map_powlax') THEN
        -- Drop existing foreign key constraints
        ALTER TABLE drill_strategy_map_powlax DROP CONSTRAINT IF EXISTS drill_strategy_map_powlax_drill_id_fkey;
        ALTER TABLE drill_strategy_map_powlax DROP CONSTRAINT IF EXISTS drill_strategy_map_powlax_strategy_id_fkey;
        
        -- Add new foreign key constraints with correct table names
        ALTER TABLE drill_strategy_map_powlax 
        ADD CONSTRAINT drill_strategy_map_powlax_drill_id_fkey 
        FOREIGN KEY (drill_id) REFERENCES powlax_drills(id) ON DELETE CASCADE;
        
        ALTER TABLE drill_strategy_map_powlax 
        ADD CONSTRAINT drill_strategy_map_powlax_strategy_id_fkey 
        FOREIGN KEY (strategy_id) REFERENCES powlax_strategies(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Updated foreign key constraints in drill_strategy_map_powlax';
    END IF;
END$$;

-- ========================================
-- 2. CREATE TABLES IF THEY DON'T EXIST (WITH CORRECT NAMING)
-- ========================================

-- Create powlax_drills table if it doesn't exist
CREATE TABLE IF NOT EXISTS powlax_drills (
  id SERIAL PRIMARY KEY,
  wp_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  drill_types TEXT,
  drill_category TEXT,
  drill_duration TEXT,
  drill_video_url TEXT,
  drill_notes TEXT,
  game_states TEXT,
  drill_emphasis TEXT,
  game_phase TEXT,
  do_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  vimeo_url TEXT,
  featured_image TEXT,
  status TEXT,
  slug TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create powlax_strategies table if it doesn't exist
CREATE TABLE IF NOT EXISTS powlax_strategies (
  id SERIAL PRIMARY KEY,
  strategy_id INTEGER,
  reference_id INTEGER,
  strategy_categories TEXT,
  strategy_name TEXT NOT NULL,
  lacrosse_lab_links JSONB,
  description TEXT,
  embed_codes JSONB,
  see_it_ages TEXT,
  coach_it_ages TEXT,
  own_it_ages TEXT,
  has_pdf BOOLEAN DEFAULT FALSE,
  target_audience TEXT,
  lesson_category TEXT,
  master_pdf_url TEXT,
  vimeo_id BIGINT,
  vimeo_link TEXT,
  pdf_shortcode TEXT,
  thumbnail_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_powlax_drills_title ON powlax_drills(title);
CREATE INDEX IF NOT EXISTS idx_powlax_drills_drill_types ON powlax_drills(drill_types);
CREATE INDEX IF NOT EXISTS idx_powlax_drills_game_phase ON powlax_drills(game_phase);
CREATE INDEX IF NOT EXISTS idx_powlax_drills_wp_id ON powlax_drills(wp_id);
CREATE INDEX IF NOT EXISTS idx_powlax_drills_status ON powlax_drills(status);

CREATE INDEX IF NOT EXISTS idx_powlax_strategies_strategy_name ON powlax_strategies(strategy_name);
CREATE INDEX IF NOT EXISTS idx_powlax_strategies_categories ON powlax_strategies(strategy_categories);
CREATE INDEX IF NOT EXISTS idx_powlax_strategies_reference_id ON powlax_strategies(reference_id);
CREATE INDEX IF NOT EXISTS idx_powlax_strategies_target_audience ON powlax_strategies(target_audience);

-- ========================================
-- 3. FIX SKILLS ACADEMY WORKOUTS TABLE
-- ========================================

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

-- Add comments for documentation
COMMENT ON COLUMN skills_academy_workouts.drill_ids IS 'Array of skills_academy_drills.id values that make up this workout';

-- ========================================
-- 4. ENABLE RLS ON MAIN CONTENT TABLES
-- ========================================

-- Enable RLS on main content tables if not already enabled
ALTER TABLE powlax_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE powlax_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_academy_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_academy_workouts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for main content tables (read-only for authenticated users)
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY['powlax_drills', 'powlax_strategies', 'skills_academy_drills', 'skills_academy_workouts'];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        -- Anonymous read access
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Allow anonymous read %I" 
            ON %I FOR SELECT TO anon USING (true)', table_name, table_name);
        
        -- Authenticated read access
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Allow authenticated read %I" 
            ON %I FOR SELECT TO authenticated USING (true)', table_name, table_name);
        
        -- Service role full access
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Service role full access %I" 
            ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name, table_name);
        
        RAISE NOTICE 'Created RLS policies for %', table_name;
    END LOOP;
END$$;

-- ========================================
-- 5. CREATE HELPER FUNCTIONS FOR SKILLS ACADEMY WORKOUTS
-- ========================================

-- Function to add drills to a workout
CREATE OR REPLACE FUNCTION add_drills_to_workout(
    workout_id INTEGER,
    drill_ids_to_add INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE skills_academy_workouts 
    SET drill_ids = array_cat(drill_ids, drill_ids_to_add),
        updated_at = NOW()
    WHERE id = workout_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove drills from a workout
CREATE OR REPLACE FUNCTION remove_drills_from_workout(
    workout_id INTEGER,
    drill_ids_to_remove INTEGER[]
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE skills_academy_workouts 
    SET drill_ids = (
        SELECT ARRAY_AGG(drill_id) 
        FROM UNNEST(drill_ids) AS drill_id 
        WHERE drill_id <> ALL(drill_ids_to_remove)
    ),
    updated_at = NOW()
    WHERE id = workout_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workout with drill details
CREATE OR REPLACE FUNCTION get_workout_with_drills(workout_id INTEGER)
RETURNS TABLE (
    workout_id INTEGER,
    workout_title TEXT,
    workout_type TEXT,
    duration_minutes INTEGER,
    drill_count INTEGER,
    drills JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.title,
        w.workout_type::TEXT,
        w.duration_minutes,
        array_length(w.drill_ids, 1) as drill_count,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', d.id,
                    'title', d.title,
                    'vimeo_id', d.vimeo_id,
                    'complexity', d.complexity,
                    'duration_minutes', d.duration_minutes,
                    'point_values', d.point_values
                ) ORDER BY array_position(w.drill_ids, d.id)
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'::jsonb
        ) as drills
    FROM skills_academy_workouts w
    LEFT JOIN skills_academy_drills d ON d.id = ANY(w.drill_ids)
    WHERE w.id = workout_id
    GROUP BY w.id, w.title, w.workout_type, w.duration_minutes, w.drill_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. UPDATE TABLE COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE powlax_drills IS 'Core drill library for practice planner - contains all POWLAX coaching drills';
COMMENT ON TABLE powlax_strategies IS 'Strategy and concept library - contains all POWLAX coaching strategies';
COMMENT ON TABLE skills_academy_drills IS 'Individual skill-building drills for Skills Academy workouts';
COMMENT ON TABLE skills_academy_workouts IS 'Skills Academy workout collections with drill arrays';

COMMENT ON FUNCTION add_drills_to_workout IS 'Add drills to a Skills Academy workout by ID array';
COMMENT ON FUNCTION remove_drills_from_workout IS 'Remove drills from a Skills Academy workout by ID array';
COMMENT ON FUNCTION get_workout_with_drills IS 'Get workout details with full drill information in proper sequence';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'POWLAX Table Standardization Complete! 🚀';
    RAISE NOTICE 'Standardized table names: powlax_drills, powlax_strategies';
    RAISE NOTICE 'Fixed skills_academy_workouts: Added drill_ids array column';
    RAISE NOTICE 'Created helper functions for workout-drill management';
    RAISE NOTICE 'Enabled RLS policies on all main content tables';
    RAISE NOTICE 'Practice planner should now connect to real data!';
END $$;
