# 🎯 SKILLS ACADEMY SQL IMPLEMENTATION PLAN

**Purpose:** Complete plan for mapping Skills Academy drills to workouts with easy manipulation  
**Generated:** 2025-01-15  
**Focus:** Flexible, maintainable drill-workout relationships

---

## 📊 **IMPLEMENTATION OVERVIEW**

### **Current Status:**
- ✅ **182 drill-workout mappings** extracted from CSV
- ✅ **99.1% drill name accuracy** (106/107 matches)
- ✅ **1 drill name fixed** (quotes removed)
- ✅ **12 Skills Academy workouts** ready for implementation

### **Target Result:**
- 🎯 **Populate `drill_ids` arrays** in `skills_academy_workouts` table
- 🎯 **Maintain sequence order** for each workout
- 🎯 **Enable easy manipulation** for future drill management

---

## 🏗️ **DATABASE STRUCTURE FOR EASY MANIPULATION**

### **Primary Approach: `drill_ids` Array Column**
```sql
-- Current skills_academy_workouts table structure
CREATE TABLE skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    workout_type VARCHAR(50),
    drill_ids INTEGER[] DEFAULT '{}',  -- ← This is our target
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Why This Approach is Optimal:**

#### **✅ Advantages:**
1. **Simple Structure** - Single array column for drill sequence
2. **Maintains Order** - Array preserves exact drill sequence (1,2,3...)
3. **Easy Queries** - PostgreSQL array functions for manipulation
4. **Performance** - No joins required for basic workout display
5. **Flexible** - Easy to add, remove, or reorder drills

#### **🔧 Easy Manipulation Examples:**
```sql
-- Add drill to end of workout
UPDATE skills_academy_workouts 
SET drill_ids = drill_ids || ARRAY[new_drill_id]
WHERE title = 'Midfield 1';

-- Insert drill at specific position (position 3)
UPDATE skills_academy_workouts 
SET drill_ids = drill_ids[1:2] || ARRAY[new_drill_id] || drill_ids[3:]
WHERE title = 'Midfield 1';

-- Remove drill by ID
UPDATE skills_academy_workouts 
SET drill_ids = array_remove(drill_ids, drill_id_to_remove)
WHERE title = 'Midfield 1';

-- Reorder: Move drill from position 5 to position 2
UPDATE skills_academy_workouts 
SET drill_ids = (
    drill_ids[1:1] || 
    ARRAY[drill_ids[5]] || 
    drill_ids[2:4] || 
    drill_ids[6:]
)
WHERE title = 'Midfield 1';
```

---

## 📋 **STEP-BY-STEP IMPLEMENTATION PLAN**

### **Phase 1: Database Preparation**
```sql
-- 1.1: Ensure drill_ids column exists
ALTER TABLE skills_academy_workouts 
ADD COLUMN IF NOT EXISTS drill_ids INTEGER[] DEFAULT '{}';

-- 1.2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
ON skills_academy_workouts USING GIN (drill_ids);

-- 1.3: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skills_academy_workouts_updated_at 
BEFORE UPDATE ON skills_academy_workouts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Phase 2: Create Mapping Table (Temporary)**
```sql
-- 2.1: Create temporary mapping table
CREATE TEMP TABLE drill_workout_mapping (
    workout_name TEXT,
    drill_name TEXT,
    sequence_order INTEGER
);

-- 2.2: Insert all 182 mappings
INSERT INTO drill_workout_mapping (workout_name, drill_name, sequence_order) VALUES
('Midfield 1', 'Shoulder to Shoulder Cradle', 1),
('Midfield 1', 'Shoulder to Nose Cradle', 2),
-- ... (all 182 mappings from verification document)
('Midfield 9', 'Sell the Shot Roll Dodge Drill', 14);
```

### **Phase 3: Execute Mapping Logic**
```sql
-- 3.1: Update workouts with drill_ids arrays
DO $$
DECLARE
    workout_record RECORD;
    drill_ids_array INTEGER[];
BEGIN
    -- Loop through each unique workout
    FOR workout_record IN
        SELECT DISTINCT workout_name FROM drill_workout_mapping
    LOOP
        -- Build ordered array of drill IDs
        SELECT ARRAY_AGG(sad.id ORDER BY dwm.sequence_order)
        INTO drill_ids_array
        FROM drill_workout_mapping dwm
        JOIN skills_academy_drills sad ON LOWER(TRIM(sad.title)) = LOWER(TRIM(dwm.drill_name))
        WHERE dwm.workout_name = workout_record.workout_name;

        -- Update workout with drill IDs
        UPDATE skills_academy_workouts
        SET drill_ids = drill_ids_array,
            updated_at = NOW()
        WHERE LOWER(TRIM(title)) LIKE '%' || LOWER(TRIM(workout_record.workout_name)) || '%';
        
        RAISE NOTICE 'Updated workout: % with % drills', 
                     workout_record.workout_name, 
                     array_length(drill_ids_array, 1);
    END LOOP;
END$$;
```

### **Phase 4: Verification & Cleanup**
```sql
-- 4.1: Verify results
SELECT 
    title,
    workout_type,
    array_length(drill_ids, 1) as drill_count,
    drill_ids
FROM skills_academy_workouts
WHERE drill_ids IS NOT NULL AND array_length(drill_ids, 1) > 0
ORDER BY title;

-- 4.2: Clean up temporary table
DROP TABLE drill_workout_mapping;
```

---

## 🔧 **HELPER FUNCTIONS FOR EASY MANIPULATION**

### **Function 1: Add Drill to Workout**
```sql
CREATE OR REPLACE FUNCTION add_drill_to_workout(
    workout_id_param INTEGER,
    drill_id_param INTEGER,
    position_param INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF position_param IS NULL THEN
        -- Add to end
        UPDATE skills_academy_workouts
        SET drill_ids = drill_ids || ARRAY[drill_id_param]
        WHERE id = workout_id_param;
    ELSE
        -- Insert at specific position
        UPDATE skills_academy_workouts
        SET drill_ids = (
            drill_ids[1:position_param-1] || 
            ARRAY[drill_id_param] || 
            drill_ids[position_param:]
        )
        WHERE id = workout_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### **Function 2: Remove Drill from Workout**
```sql
CREATE OR REPLACE FUNCTION remove_drill_from_workout(
    workout_id_param INTEGER,
    drill_id_param INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE skills_academy_workouts
    SET drill_ids = array_remove(drill_ids, drill_id_param)
    WHERE id = workout_id_param;
END;
$$ LANGUAGE plpgsql;
```

### **Function 3: Reorder Drill in Workout**
```sql
CREATE OR REPLACE FUNCTION reorder_drill_in_workout(
    workout_id_param INTEGER,
    from_position INTEGER,
    to_position INTEGER
)
RETURNS VOID AS $$
DECLARE
    drill_to_move INTEGER;
    current_drills INTEGER[];
BEGIN
    -- Get current drill array
    SELECT drill_ids INTO current_drills
    FROM skills_academy_workouts
    WHERE id = workout_id_param;
    
    -- Get drill to move
    drill_to_move := current_drills[from_position];
    
    -- Remove drill from current position
    current_drills := array_remove(current_drills, drill_to_move);
    
    -- Insert at new position
    UPDATE skills_academy_workouts
    SET drill_ids = (
        current_drills[1:to_position-1] || 
        ARRAY[drill_to_move] || 
        current_drills[to_position:]
    )
    WHERE id = workout_id_param;
END;
$$ LANGUAGE plpgsql;
```

### **Function 4: Get Workout Drills with Details**
```sql
CREATE OR REPLACE FUNCTION get_workout_drills(workout_id_param INTEGER)
RETURNS TABLE (
    sequence_order INTEGER,
    drill_id INTEGER,
    drill_title TEXT,
    drill_category TEXT[],
    vimeo_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        row_number() OVER ()::INTEGER as sequence_order,
        sad.id as drill_id,
        sad.title as drill_title,
        sad.drill_category,
        sad.vimeo_id
    FROM skills_academy_workouts saw
    CROSS JOIN LATERAL unnest(saw.drill_ids) WITH ORDINALITY AS t(drill_id, pos)
    JOIN skills_academy_drills sad ON sad.id = t.drill_id
    WHERE saw.id = workout_id_param
    ORDER BY t.pos;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 **WORKOUT NAME MAPPING STRATEGY**

### **Mapping CSV Names to Database Titles:**

| CSV Workout Name | Database Title Pattern | Match Strategy |
|------------------|------------------------|----------------|
| `Midfield 1` | `Midfield Foundation of Skills - M1 - 05 Drills` | Contains "M1" |
| `Midfield 2` | `Complete Shooting Progression - M2 - 05 Drills` | Contains "M2" |
| `Midfield 3` | `Catching, Faking, and Inside Finishing - M3 - 05 Drills` | Contains "M3" |
| `Midfield 4` | `Defensive Footwork - Approach Angles And Recovering in - M4 - 05 Drills` | Contains "M4" |
| `Midfield 5` | `Wing Dodging - M5 - 05 Drills` | Contains "M5" |
| `Midfield 6` | `Time and Room Shooting and Wind Up Dodging - M6 - 05 Drills` | Contains "M6" |
| `Midfield 7` | `Master Split Dodge and Shoot on the Run - M7 - 05 Drills` | Contains "M7" |
| `Midfield 8` | `Ladder Footwork - Approach Angles - Creative Dodging - M8 - 05 Drills` | Contains "M8" |
| `Midfield 9` | `Inside Finishing, Hesitations and Roll Dodges - M9 - 05 Drills` | Contains "M9" |
| `Midfield 10` | `Inside Finishing - Time and Room Release points - Mastering the Face Dodge - M10 - 05 Drills` | Contains "M10" |
| `Midfield 11` | `Shooting on the Run and Slide Em Dodging - M11 - 05 Drills` | Contains "M11" |
| `Midfield 12` | `Defensive Approaches, Recoveries, Fast Break Defense - M12 - 05 Drills` | Contains "M12" |

### **Improved Mapping Logic:**
```sql
-- Updated mapping with pattern matching
UPDATE skills_academy_workouts
SET drill_ids = drill_ids_array,
    updated_at = NOW()
WHERE (
    -- Match by M1, M2, etc. pattern
    title LIKE '%M' || SUBSTRING(workout_record.workout_name FROM '\d+') || '%'
    OR
    -- Fallback: partial title match
    LOWER(TRIM(title)) LIKE '%' || LOWER(TRIM(workout_record.workout_name)) || '%'
);
```

---

## 🚀 **IMPLEMENTATION TIMELINE**

### **Phase 1: Preparation (15 minutes)**
1. ✅ Verify `drill_ids` column exists
2. ✅ Create indexes and triggers
3. ✅ Create helper functions

### **Phase 2: Data Migration (10 minutes)**
1. ✅ Create temporary mapping table
2. ✅ Insert 182 drill-workout mappings
3. ✅ Execute mapping logic with improved pattern matching

### **Phase 3: Verification (5 minutes)**
1. ✅ Verify all 12 workouts have drill_ids populated
2. ✅ Check drill sequences are correct
3. ✅ Test helper functions

### **Phase 4: Cleanup (2 minutes)**
1. ✅ Drop temporary tables
2. ✅ Document results

---

## 🔧 **FUTURE MANIPULATION EXAMPLES**

### **Adding a New Drill:**
```sql
-- 1. Add drill to skills_academy_drills table
INSERT INTO skills_academy_drills (title, drill_category, vimeo_id) 
VALUES ('New Amazing Drill', ARRAY['Shooting'], '123456789');

-- 2. Add to specific workout at position 3
SELECT add_drill_to_workout(workout_id, new_drill_id, 3);
```

### **Rearranging Workout:**
```sql
-- Move drill from position 5 to position 2
SELECT reorder_drill_in_workout(workout_id, 5, 2);
```

### **Creating Custom Workout:**
```sql
-- 1. Create new workout
INSERT INTO skills_academy_workouts (title, workout_type, drill_ids)
VALUES ('Custom Midfield Workout', 'midfield', ARRAY[1,5,10,15,20]);

-- 2. Or build incrementally
INSERT INTO skills_academy_workouts (title, workout_type)
VALUES ('Custom Workout', 'midfield');

SELECT add_drill_to_workout(new_workout_id, drill_id_1);
SELECT add_drill_to_workout(new_workout_id, drill_id_2);
-- etc.
```

---

## ✅ **SUCCESS CRITERIA**

### **Technical Requirements:**
- [ ] All 12 Skills Academy workouts have populated `drill_ids` arrays
- [ ] Drill sequences match CSV order exactly
- [ ] Helper functions work correctly
- [ ] Performance is acceptable (< 100ms for workout queries)

### **Usability Requirements:**
- [ ] Easy to add new drills to workouts
- [ ] Easy to reorder existing drills
- [ ] Easy to remove drills from workouts
- [ ] Easy to create custom workouts

### **Data Integrity:**
- [ ] No orphaned drill references
- [ ] All drill IDs exist in `skills_academy_drills` table
- [ ] Sequence order is maintained
- [ ] No duplicate drills in same workout

---

## 🎯 **FINAL RESULT**

After implementation, you'll have:

1. **Flexible drill management** - Add, remove, reorder drills easily
2. **Maintainable structure** - Simple array-based approach
3. **Performance optimized** - Indexed arrays for fast queries
4. **Future-proof** - Helper functions for common operations
5. **Data integrity** - Proper foreign key relationships

**Ready to execute!** 🚀
