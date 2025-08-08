# 🔗 POWLAX DATA CONNECTION SCHEMATIC
*How CSV/JSON Files Map to Database Tables*

---

## 📚 SKILLS ACADEMY WORKOUTS

### SOURCE FILES:
```
/docs/existing/json Academy Workouts./
├── ldqie_export_1754547992.json  (Solid Start workouts)
├── ldqie_export_1754548048.json  (Wall Ball workouts)
├── ldqie_export_1754548090.json  (More workouts)
└── ... (11 total JSON files)
```

### JSON STRUCTURE → DATABASE MAPPING:

#### 1️⃣ **WORKOUT MASTER RECORDS**
```json
// JSON FILE STRUCTURE:
{
  "master": {
    "312": {
      "_id": 312,                    → powlax_academy_workout_collections.original_id
      "_name": "Solid Start 5 - Switching Hands Workout - More"  → powlax_academy_workout_collections.name
      
      // PARSE THE NAME TO GET:
      // "Solid Start 5"              → workout_series = "Solid Start", series_number = 5
      // "More"                        → workout_size = "More" (10 drills)
    }
  }
}
```

**Name Pattern Breakdown:**
- `Solid Start 5 - Switching Hands Workout - More`
  - **Series:** "Solid Start"
  - **Number:** 5 (fifth in the series)
  - **Type:** "Switching Hands Workout"
  - **Size:** 
    - "Mini" = 5 drills
    - "More" = 10 drills
    - "Complete" = 13-19 drills

#### 2️⃣ **WORKOUT QUESTIONS (DRILLS)**
```json
// JSON FILE STRUCTURE:
{
  "question": {
    "312": {                          // This is the workout ID
      "2261": {                       // Question ID
        "_id": 2261,                  → powlax_academy_workout_items.original_id
        "_quizId": 312,               → powlax_academy_workout_items.workout_collection_id
        "_sort": 1,                   → powlax_academy_workout_items.sort_order
        "_title": "Quick Stick",      → powlax_academy_workout_items.drill_title
                                      ⚠️ THIS MAPS TO skills_academy_drills.title!
        "_question": "<p>Quick Stick</p><iframe src='https://player.vimeo.com/video/1000143366'..."
                                      → powlax_academy_workout_items.question_text
      },
      "2262": {
        "_id": 2262,
        "_title": "Cross Hand",       ← CRITICAL: This links to drill!
        "_sort": 2
      }
    }
  }
}
```

**🔴 CRITICAL CONNECTION:**
```
JSON: question._title ("Quick Stick") 
    ↓
MATCHES 
    ↓
DATABASE: skills_academy_drills.title ("Quick Stick")
```

#### 3️⃣ **EXISTING DRILLS TABLE** (Already has 167 drills)
```sql
skills_academy_drills:
├── id: 45
├── title: "Quick Stick"        ← MUST MATCH question._title EXACTLY!
├── vimeo_id: "1000143366"
├── drill_category: "fundamental"
└── duration_seconds: 180
```

---

## 🎾 WALL BALL SYSTEM

### SOURCE FILES:

#### A. **WALL BALL DRILLS CSV:**
```
/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/
└── Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv
```

**CSV STRUCTURE:**
```csv
Drill Name | Strong Hand URL | Off Hand URL | Both Hands URL | In Workout 1 | In Workout 2 | Sequence
-----------|-----------------|--------------|----------------|--------------|--------------|----------
Quick Stick | vimeo.com/123  | vimeo.com/124| vimeo.com/125  | Yes          | No           | 1
Cross Hand  | vimeo.com/126  | vimeo.com/127| vimeo.com/128  | Yes          | Yes          | 2
Behind Back | vimeo.com/129  | vimeo.com/130| vimeo.com/131  | No           | Yes          | 3
```

**Maps to `wall_ball_drill_catalog`:**
```sql
├── drill_name: "Quick Stick"           ← From "Drill Name" column
├── strong_hand_video_url: "vimeo/123"  ← From "Strong Hand URL"
├── off_hand_video_url: "vimeo/124"     ← From "Off Hand URL"
└── both_hands_video_url: "vimeo/125"   ← From "Both Hands URL"
```

#### B. **WALL BALL WORKOUTS CSV:**
```
/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/
└── Wall Ball Workouts and URL's-POWLAX Wall Ball Workouts and Vimeo URL's.csv
```

**CSV STRUCTURE:**
```csv
Workout Name | Duration | Video URL | Has Coaching | Drills Included
-------------|----------|-----------|--------------|----------------
Master Fundamentals - 10 Minutes | 10 | vimeo.com/500 | Yes | Quick Stick, Cross Hand
Advanced Dodging - 15 Minutes | 15 | vimeo.com/501 | Yes | Cross Hand, Behind Back
```

**Maps to `wall_ball_workout_system`:**
```sql
├── workout_name: "Master Fundamentals - 10 Minutes"
├── total_duration_minutes: 10
├── full_workout_video_url: "vimeo.com/500"  ← SINGLE VIDEO FOR ENTIRE WORKOUT!
├── has_coaching: true
└── drill_sequence: [...]  ← Built from "Drills Included" + sequence numbers
```

#### C. **CONNECTING DRILLS TO WORKOUTS:**

The CSV "In Workout X" columns tell us which drills appear in each workout:

```
If "Quick Stick" has:
- In Workout 1: Yes, Sequence: 1
- In Workout 2: No

Then in wall_ball_workout_system.drill_sequence:
Workout 1 includes: {"drill_id": 1, "drill_name": "Quick Stick", "sequence_order": 1}
Workout 2 does NOT include Quick Stick
```

---

## 📊 DATA IMPORT FLOW DIAGRAM

### SKILLS ACADEMY:
```
JSON Files (11 files)
    ↓
Extract "master" section → powlax_academy_workout_collections
    ↓
Extract "question" section → powlax_academy_workout_items
    ↓
Match question._title ←→ skills_academy_drills.title
    ↓
Complete workout with linked drills!
```

### WALL BALL:
```
Wall Ball Drills CSV
    ↓
Import drills → wall_ball_drill_catalog
    ↓
Wall Ball Workouts CSV
    ↓
Import workouts → wall_ball_workout_system
    ↓
Parse "Drills Included" + "In Workout" columns
    ↓
Build drill_sequence JSONB array
    ↓
Complete workout with drill array!
```

---

## 🔑 KEY RELATIONSHIPS

### Skills Academy:
```
powlax_academy_workout_collections (Workout)
    ↓ has many
powlax_academy_workout_items (Questions)
    ↓ links via title to
skills_academy_drills (Actual drill videos)
```

### Wall Ball:
```
wall_ball_workout_system (Complete workout video)
    ↓ contains JSONB array
drill_sequence [{drill_id, sequence, duration}]
    ↓ references
wall_ball_drill_catalog (Individual drill info)
```

---

## 📝 CRITICAL DATA REQUIREMENTS

### For Skills Academy Import:
1. **EXACT TITLE MATCHING** - The question._title MUST match skills_academy_drills.title
2. **WORKOUT NAMING** - Parse to extract series, number, and size
3. **SORT ORDER** - Maintain the _sort field for drill sequence

### For Wall Ball Import:
1. **SINGLE VIDEO** - Each workout is ONE complete video, not multiple
2. **DRILL SEQUENCE** - Shows which drills are demonstrated in the video
3. **HAND VARIATIONS** - Each drill has 3 possible videos (strong/off/both)
4. **IN WORKOUT FLAGS** - CSV columns show which workouts include each drill

---

## 🚨 COMMON PITFALLS TO AVOID

1. **DON'T** treat Wall Ball workouts as collections of individual drill videos
   - They are SINGLE pre-recorded workout videos
   
2. **DON'T** miss the title matching for Skills Academy
   - If titles don't match exactly, drills won't link
   
3. **DON'T** ignore the sequence numbers
   - They determine the order drills appear in workouts
   
4. **DON'T** confuse workout "size" terminology:
   - Mini = 5 drills (quick workout)
   - More = 10 drills (standard workout)
   - Complete = 13-19 drills (full workout)

---

## 📂 FILE LOCATIONS SUMMARY

```
/powlax-react-app/
├── docs/
│   ├── existing/
│   │   └── json Academy Workouts./     ← 11 JSON files for Skills Academy
│   └── Wordpress CSV's/
│       └── 2015 POWLAX Plan CSV's Skills Drills/
│           ├── Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv
│           └── Wall Ball Workouts and URL's-POWLAX Wall Ball Workouts and Vimeo URL's.csv
└── scripts/
    └── database/
        ├── import-academy-workouts.ts  ← Needs to be created
        └── import-wall-ball-data.ts    ← Needs to be created
```

---

## ✅ VERIFICATION QUERIES

### Check Skills Academy Links:
```sql
-- See which workout items successfully linked to drills
SELECT 
    wi.drill_title,
    wi.drill_id,
    sd.title as actual_drill_title
FROM powlax_academy_workout_items wi
LEFT JOIN skills_academy_drills sd ON wi.drill_id = sd.id;
```

### Check Wall Ball Sequences:
```sql
-- See drill sequence for a workout
SELECT 
    workout_name,
    drill_sequence
FROM wall_ball_workout_system
WHERE workout_name LIKE '%Master Fundamentals%';
```