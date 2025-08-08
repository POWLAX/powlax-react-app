
# 📐 EXACT DATA STRUCTURE GUIDE
*Precise CSV/JSON Structure and Database Mapping*

---

## 🎯 SKILLS ACADEMY - JSON STRUCTURE

### FILE LOCATION:
```
/docs/existing/json Academy Workouts./ldqie_export_*.json (11 files)
```

### EXACT JSON STRUCTURE:
```json
{
  "version": "0.29",
  "exportVersion": 4,
  "ld_version": "4.23.2.1",
  "date": 1754547992,
  
  // WORKOUT DEFINITIONS
  "master": [
    {
      "_id": 312,                    // → original_id in database
      "_name": "Solid Start 5 - Switching Hands Workout - More",  // → name
      "_quiz_post_id": 0,            // → wp_post_id
      "_titleHidden": true,          // → show_title (inverted)
      "_questionRandom": false,      // → randomize_questions
      "_answerRandom": false,        // → randomize_answers
      "_timeLimit": 0,               // → time_limit
      "_statisticsOn": true,         // → track_stats
      "_showPoints": false,          // → show_points
      "_quizRunOnce": false,         // → single_attempt
      "_autostart": false,           // → auto_start
      "_questionsPerPage": 0,        // → questions_per_page
      "_showCategory": false         // → show_category
    }
  ],
  
  // DRILL QUESTIONS (Nested by workout ID then question ID)
  "question": {
    "312": {  // Workout ID
      "2261": {  // Question ID
        "_id": 2261,                 // → original_id
        "_quizId": 312,              // → workout_collection_id
        "_sort": 1,                  // → sort_order (drill sequence)
        "_title": "Quick Stick",     // → drill_title (LINKS TO skills_academy_drills.title!)
        "_points": 1,                // → points
        "_question": "<p>Quick Stick</p>\n\n<iframe src=\"https://player.vimeo.com/video/1000143366\"...",
        "_correctMsg": "<p>Keep the Heat Coming!</p>",
        "_incorrectMsg": "<p>Keep the Heat Coming!</p>",
        "_answerType": "single",
        "_correctSame": "",
        "_tipEnabled": false,
        "_answerData": [  // Answer options
          {
            "_answer": "Boom! Nailed It!",
            "_correct": true,
            "_points": 1
          },
          {
            "_answer": "I'm skipping that episode",
            "_correct": false,
            "_points": 0
          }
        ]
      }
    }
  }
}
```

### DATABASE MAPPING:

#### Table: `powlax_academy_workout_collections`
```sql
INSERT INTO powlax_academy_workout_collections (
  original_id,        -- 312 (from master._id)
  name,              -- "Solid Start 5 - Switching Hands Workout - More"
  workout_series,    -- "Solid Start" (parsed from name)
  series_number,     -- 5 (parsed from name)
  workout_size,      -- "More" (parsed from name)
  wp_post_id,        -- 0
  show_title,        -- false (inverted from _titleHidden)
  randomize_questions, -- false
  track_stats        -- true
)
```

#### Table: `powlax_academy_workout_items`
```sql
INSERT INTO powlax_academy_workout_items (
  original_id,            -- 2261 (from question._id)
  workout_collection_id,  -- 312 (from question._quizId)
  drill_title,           -- "Quick Stick" (⚠️ CRITICAL FOR LINKING!)
  sort_order,            -- 1 (sequence in workout)
  question_text,         -- Full HTML with video iframe
  points                 -- 1
)
```

---

## 🎾 WALL BALL - CSV STRUCTURE

### FILE 1: WALL BALL DRILLS
**Location:** `/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv`

### EXACT CSV STRUCTURE:
```
Row 1: Headers for workout columns
Row 2: Exercise names and hand variations
Row 3: Sequence numbers for each workout
Row 4+: Drill data

Column Structure:
A: Number (row ID)
B: Wall Ball Exercise (drill name)
C: Difficulty (1-5)
D: "X" marker
E-AB: Workout inclusion columns (sequence number if included)
AC-AG: Video URLs (Strong Hand, Off Hand, Both variations)
```

### ACTUAL DATA EXAMPLE:
```csv
Row | Exercise     | Diff | X | Master Fund | 10 Master | 5 Min Master | ... | Strong Hand URL        | Off Hand URL
----|--------------|------|---|-------------|-----------|--------------|-----|------------------------|----------------
1   | Overhand     | 1    | X | 1           | 1         | 1            | ... | vimeo.com/997153686   | vimeo.com/997151828
2   | Quick Sticks | 1    | X | 2           | 2         | 2            | ... | vimeo.com/997153630   | vimeo.com/997153513
3   | Cross Hand   | 2    | X |             | 3         |              | ... | vimeo.com/997153574   | vimeo.com/997153517
```

**Reading the Workout Columns:**
- If a drill has a NUMBER in a workout column, it's IN that workout at that sequence
- If empty, the drill is NOT in that workout
- Example: "Quick Sticks" is drill #2 in "Master Fund" workout

### DATABASE MAPPING:

#### Table: `wall_ball_drill_catalog`
```sql
INSERT INTO wall_ball_drill_catalog (
  drill_name,              -- "Quick Sticks" (from column B)
  difficulty_level,        -- 1 (from column C)
  strong_hand_video_url,   -- "https://vimeo.com/997153630" (column AC)
  off_hand_video_url,      -- "https://vimeo.com/997153513" (column AD)
  both_hands_video_url     -- (if exists in column AE/AF)
)
```

---

### FILE 2: WALL BALL WORKOUTS
**Location:** `/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball Workouts and URL's-POWLAX Wall Ball Workouts and Vimeo URL's.csv`

### EXPECTED STRUCTURE:
```csv
Workout Name                        | Duration | Full Video URL      | Has Coaching
------------------------------------|----------|--------------------|--------------
Master Fundamentals - 10 Minutes    | 10       | vimeo.com/997200001| Yes
Master Fundamentals - 5 Minutes     | 5        | vimeo.com/997200002| Yes
Dodging Workout - 10 Minutes        | 10       | vimeo.com/997200003| Yes
```

### DATABASE MAPPING:

#### Table: `wall_ball_workout_system`
```sql
INSERT INTO wall_ball_workout_system (
  workout_name,           -- "Master Fundamentals - 10 Minutes"
  total_duration_minutes, -- 10
  full_workout_video_url, -- "https://vimeo.com/997200001" (SINGLE VIDEO!)
  has_coaching,          -- true
  workout_series,        -- "Master Fundamentals" (parsed from name)
  drill_sequence,        -- Built from drill CSV workout columns
  drill_ids              -- Array of drill IDs included
)
```

---

## 🔗 BUILDING THE DRILL SEQUENCE

### For Skills Academy:
```javascript
// From JSON question data
drill_sequence = questions
  .sort((a, b) => a._sort - b._sort)
  .map(q => ({
    drill_title: q._title,  // "Quick Stick"
    sort_order: q._sort,    // 1, 2, 3...
    // Link to skills_academy_drills WHERE title = q._title
  }))
```

### For Wall Ball:
```javascript
// From CSV workout columns
// If drill row has "2" in "Master Fund" column:
drill_sequence.push({
  drill_id: drill.id,
  drill_name: "Quick Sticks",
  sequence_order: 2,  // The number from the cell
  hand_variation: "both_hands",  // Determined by workout type
  duration_seconds: 60  // Calculate based on total workout time
})
```

---

## ⚠️ CRITICAL DATA CONNECTIONS

### 1. **Skills Academy Title Matching:**
```
JSON: question["312"]["2261"]._title = "Quick Stick"
                    ↓ MUST MATCH EXACTLY ↓
DATABASE: skills_academy_drills.title = "Quick Stick"
```

### 2. **Wall Ball Sequence Building:**
```
CSV Cell Value: "2" in "Master Fund" column for "Quick Sticks" row
                    ↓ MEANS ↓
This drill is #2 in the Master Fundamentals workout sequence
```

### 3. **Workout Name Parsing:**
```
"Solid Start 5 - Switching Hands Workout - More"
     ↓               ↓                      ↓
Series: "Solid Start"  |              Size: "More" (10 drills)
Number: 5 ─────────────┘
```

---

## 📊 VERIFICATION QUERIES

### Check Skills Academy Connections:
```sql
-- Should show matched drills
SELECT 
  wc.name as workout_name,
  wi.drill_title,
  sd.id as drill_id,
  sd.title as matched_drill
FROM powlax_academy_workout_collections wc
JOIN powlax_academy_workout_items wi ON wi.workout_collection_id = wc.id
LEFT JOIN skills_academy_drills sd ON sd.title = wi.drill_title
ORDER BY wc.id, wi.sort_order;
```

### Check Wall Ball Sequences:
```sql
-- Should show drill order in workouts
SELECT 
  workout_name,
  jsonb_array_elements(drill_sequence)->>'sequence_order' as seq,
  jsonb_array_elements(drill_sequence)->>'drill_name' as drill
FROM wall_ball_workout_system
ORDER BY workout_name, seq::int;
```

---

## 🚀 IMPORT STEPS

### Skills Academy:
1. Read JSON file
2. Extract `master` array → Insert into `powlax_academy_workout_collections`
3. Extract `question` object → Insert into `powlax_academy_workout_items`
4. Run linking function to match titles with `skills_academy_drills`

### Wall Ball:
1. Read drill CSV → Insert into `wall_ball_drill_catalog`
2. Read workout CSV → Insert into `wall_ball_workout_system`
3. Parse workout columns from drill CSV
4. Build `drill_sequence` JSONB arrays
5. Update workouts with complete sequences