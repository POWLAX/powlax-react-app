# 🎯 DRILL-TO-WORKOUT MAPPING ANALYSIS

**Found:** CSV files with exact drill-to-workout mapping structure  
**Generated:** 2025-01-15

---

## 📊 **CSV Structure Analysis**

### **1. Wall Ball Drill-to-Workout Mapping**
**File:** `docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv`

**Structure:**
```csv
Row | Column B: Drill Name | Columns E-AD: Workout Names with Sequence Numbers
----|---------------------|------------------------------------------------
4   | Overhand           | Master Fund: 1, 10 Master Fund: 1, 5 Min Master Fund: 1, Dodging: 1, etc.
5   | Quick Sticks       | Master Fund: 2, 10 Master Fund: 2, 5 Min Master Fund: 2, Conditioning: 2, etc.
6   | Turned Right       | Master Fund: 9, 5 Min Master Fund: 3, Defense: 4, etc.
```

**Key Insight:** 
- **Column B** = Drill name (maps to `skills_academy_drills.title`)
- **Columns E-AD** = Workout names with **integer sequence numbers**
- **Numbers in cells** = sequence order within that workout
- **Empty cells** = drill not included in that workout

### **2. Skills Academy Drill-to-Workout Mapping**
**File:** `docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/POWLAX Online Skills Academy Initial workout layout.csv`

**Structure:**
```csv
Row | Column B: Drill Name | Columns K-AQ: Attack/Midfield/Defense Workouts with Sequence Numbers
----|---------------------|----------------------------------------------------------------
20  | Cross Body Catch   | Attack 5: (sequence number), Midfield 7: (sequence), etc.
21  | Low Catch Drill    | Attack 7: (sequence number), Midfield 8: (sequence), etc.
```

**Key Insight:**
- **Column B** = Drill name (maps to `skills_academy_drills.title`)
- **Columns K-AQ** = Position-specific workout names with sequence numbers
- **Numbers in workout columns** = sequence order within that workout

---

## 🔍 **Mapping Logic Discovered**

### **Wall Ball Workouts:**
```
CSV Column Headers → Workout Names:
- "Master Fundamentals" → workout_type: 'wall_ball', title: 'Master Fundamentals'
- "10 Master Fund" → workout_type: 'wall_ball', title: 'Master Fundamentals 10 Min'
- "5 Minute Master Fundamentals" → workout_type: 'wall_ball', title: 'Master Fundamentals 5 Min'
- "Dodging" → workout_type: 'wall_ball', title: 'Dodging'
- "Conditioning" → workout_type: 'wall_ball', title: 'Conditioning'
- etc.
```

### **Skills Academy Workouts:**
```
CSV Column Headers → Workout Names:
- "Attack 1" → workout_type: 'attack', title: 'Attack Practice 1'
- "Attack 2" → workout_type: 'attack', title: 'Attack Practice 2'
- "Midfield 1" → workout_type: 'midfield', title: 'Midfield Practice 1'
- "Defense 1" → workout_type: 'defense', title: 'Defense Practice 1'
- etc.
```

---

## 📋 **Implementation Plan**

### **Step 1: Parse CSV Files**
1. Read Wall Ball CSV starting from row 4 (data rows)
2. Read Skills Academy CSV starting from row 20 (data rows)
3. Extract drill names from Column B
4. Extract workout columns and their sequence numbers

### **Step 2: Match Drills to Database**
```sql
-- Find drill IDs by matching titles
SELECT id, title FROM skills_academy_drills 
WHERE title IN ('Overhand', 'Quick Sticks', 'Turned Right', ...);
```

### **Step 3: Match Workouts to Database**
```sql
-- Find workout IDs by matching titles/types
SELECT id, title, workout_type FROM skills_academy_workouts 
WHERE title LIKE 'Master Fundamentals%' OR workout_type = 'wall_ball';
```

### **Step 4: Populate drill_ids Arrays**
```sql
-- For each workout, build array of drill IDs in sequence order
UPDATE skills_academy_workouts 
SET drill_ids = ARRAY[drill_id_1, drill_id_2, drill_id_3, ...]
WHERE id = workout_id;
```

---

## 🛠️ **SQL Script Structure**

```sql
-- 1. Create temporary mapping table
CREATE TEMP TABLE drill_workout_mapping (
    drill_name TEXT,
    workout_name TEXT,
    sequence_order INTEGER
);

-- 2. Insert mapping data from CSV analysis
INSERT INTO drill_workout_mapping VALUES
('Overhand', 'Master Fundamentals', 1),
('Quick Sticks', 'Master Fundamentals', 2),
('Turned Right', 'Master Fundamentals', 9),
-- ... continue for all mappings

-- 3. Update skills_academy_workouts with drill arrays
UPDATE skills_academy_workouts 
SET drill_ids = (
    SELECT ARRAY_AGG(sad.id ORDER BY dwm.sequence_order)
    FROM drill_workout_mapping dwm
    JOIN skills_academy_drills sad ON sad.title = dwm.drill_name
    WHERE dwm.workout_name = skills_academy_workouts.title
);
```

---

## 📊 **Data Volume Estimates**

### **Wall Ball Mappings:**
- **~50 drills** × **~24 workouts** = **~1,200 potential mappings**
- **Actual populated cells:** ~400-600 mappings (many empty cells)

### **Skills Academy Mappings:**
- **~167 drills** × **~36 workouts** (12 Attack + 12 Midfield + 12 Defense)
- **Actual populated cells:** ~800-1,000 mappings

### **Total Expected Mappings:** ~1,400-1,600 drill-workout relationships

---

## ✅ **Next Steps**

1. **Parse CSV files** and extract all drill-workout mappings
2. **Create mapping SQL script** with all relationships
3. **Test on subset** to verify drill/workout ID matching
4. **Execute full mapping** to populate `drill_ids` arrays
5. **Verify results** using helper functions

---

*This analysis provides the exact roadmap for implementing drill-to-workout mapping using the existing CSV data structure.*
