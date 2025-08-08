# 🎯 POWLAX REAL DATA MAPPING GUIDE - NO MOCK DATA
*Last Updated: January 2025*

## ⚠️ CRITICAL: NO MOCK DATA RULE
**ALL DATA MUST BE REAL. If placeholder data is needed temporarily, it MUST be labeled "NOT REAL DATA"**

---

## 📊 ACTUAL DATABASE TABLES (VERIFIED)

### 1️⃣ **DRILLS TABLE: `powlax_drills`** ✅ HAS DATA (135 records)
**Source:** `/docs/Wordpress CSV's/Drills-Export-2025-July-31-1656.csv`
**Purpose:** Main drill library for Practice Planner

| CSV Column | Database Column | Description |
|------------|----------------|-------------|
| Title | title | Drill name |
| Content | content | Drill description/instructions |
| Drill Types | drill_types | Category of drill |
| Drill Duration | drill_duration | Time in minutes |
| Vimeo URL | vimeo_url | Video demonstration |
| Lab URLs | lab_urls | Lacrosse Lab diagram URLs (JSON) |
| Status | status | Published/Draft |

---

### 2️⃣ **STRATEGIES TABLE: `powlax_strategies`** ✅ HAS DATA (221 records)
**Source:** `/docs/Wordpress CSV's/Strategies and Concepts to LL/strategies_transformed.csv`
**Purpose:** Strategy library for teaching concepts

| CSV Column | Database Column | Description |
|------------|----------------|-------------|
| Strategy Name | strategy_name | Name of strategy |
| Description | description | Strategy explanation |
| Strategy Categories | strategy_categories | offensive/defensive/etc |
| Lacrosse Lab Links | lacrosse_lab_links | Diagram URLs (JSONB) |
| Vimeo Link | vimeo_link | Video demonstration |

---

### 3️⃣ **SKILLS ACADEMY DRILLS: `skills_academy_drills`** ✅ HAS DATA (167 records)
**Source:** Already imported - individual skill drills
**Purpose:** Drill library for Skills Academy workouts

| Column | Description |
|--------|-------------|
| title | **CRITICAL: Maps to workout items** |
| vimeo_id | Video ID for drill |
| drill_category | Type of drill |
| duration_seconds | Length of drill |

---

### 4️⃣ **ACADEMY WORKOUT COLLECTIONS: `powlax_academy_workout_collections`** ⚠️ NEEDS DATA
**Source:** `/docs/existing/json Academy Workouts./ldqie_export_*.json` (11 files)
**Purpose:** Main workout records from LearnDash

**JSON Structure to Import:**
```json
{
  "master": {
    "_id": 312,  // → original_id
    "_name": "Solid Start 5 - Switching Hands Workout - More",  // → name
    // Parse name to extract:
    // - workout_series: "Solid Start"
    // - series_number: 5
    // - workout_size: "More" (10 drills)
  }
}
```

**Workout Sizes:**
- **Mini** = 5 drills
- **More** = 10 drills  
- **Complete** = 13-19 drills

---

### 5️⃣ **ACADEMY WORKOUT ITEMS: `powlax_academy_workout_items`** ⚠️ NEEDS DATA
**Source:** Same JSON files - `question` section
**Purpose:** Links workouts to drills

**JSON Structure:**
```json
{
  "question": {
    "312": {  // workout_id
      "2261": {  // question_id
        "_id": 2261,  // → original_id
        "_title": "Shoulder to Nose Cradle",  // → drill_title (MAPS TO skills_academy_drills.title!)
        "_sort": 12,  // → sort_order
        "_question": "<iframe src='vimeo...'>"  // → question_text (contains video)
      }
    }
  }
}
```

---

### 6️⃣ **WALL BALL COLLECTIONS: `powlax_wall_ball_collections`** ✅ HAS DATA (4 records)
**Source:** Already imported with sample data
**Purpose:** Complete Wall Ball workout videos (SINGLE VIDEOS, not drill collections)

| Column | Description |
|--------|-------------|
| name | Workout name (e.g., "Master Fundamentals - 10 Minutes") |
| workout_type | Category (Master Fundamentals/Dodging/Shooting) |
| duration_minutes | Total workout length |
| video_url | **COMPLETE WORKOUT VIDEO** |
| has_coaching | false if name contains "(No Coaching)" |

---

### 7️⃣ **WALL BALL DRILL LIBRARY: `powlax_wall_ball_drill_library`** ✅ HAS DATA (5 records)
**Source:** `/docs/Wordpress CSV's/2015 POWLAX Plan CSV's Skills Drills/Wall Ball-Wall Ball Skills Video and Which Workouts They Are In.csv`
**Purpose:** Individual Wall Ball drills with hand variations

| CSV Column | Database Column | Description |
|------------|----------------|-------------|
| Drill Name | name | Name of drill |
| Strong Hand URL | strong_hand_video_url | Right hand video |
| Off Hand URL | off_hand_video_url | Left hand video |
| Both Hands URL | both_hands_video_url | Two hands video |

---

### 8️⃣ **WALL BALL COLLECTION DRILLS: `powlax_wall_ball_collection_drills`** ✅ HAS DATA (3 records)
**Source:** Same Wall Ball CSV - sequence columns
**Purpose:** Maps which drills appear in which workout videos

| Column | Description |
|--------|-------------|
| collection_id | Which workout video |
| drill_id | Which drill from library |
| sequence_order | Order in workout (1, 2, 3...) |
| video_type | strong_hand/off_hand/both_hands |

---

### 9️⃣ **USER TABLES** ⚠️ EMPTY (Will populate from user actions)

**`user_drills`** - Custom drills created by users
**`user_strategies`** - Custom strategies created by users  
**`user_favorites`** - Drills users have favorited

---

## 📁 DATA IMPORT CHECKLIST

### ✅ Already Imported:
- [x] `powlax_drills` - 135 drills from WordPress
- [x] `powlax_strategies` - 221 strategies
- [x] `skills_academy_drills` - 167 individual skill drills
- [x] Wall Ball sample data

### ⚠️ Need to Import:
- [ ] Academy Workout Collections (11 JSON files)
- [ ] Academy Workout Items (questions from JSON)
- [ ] Academy Workout Item Answers (answer options)
- [ ] Complete Wall Ball drill mapping

---

## 🚫 REMOVING MOCK DATA

### Files to Check for Mock Data:
1. `/src/hooks/useDrills.ts` - ✅ Already connects to real database
2. `/src/hooks/useStrategies.ts` - ✅ Connects to real tables
3. Any component with hardcoded data arrays

### Mock Data Removal Rules:
1. **DELETE** any hardcoded arrays of fake data
2. **REPLACE** with database queries
3. **IF NEEDED** for development, label clearly:
   ```typescript
   // ⚠️ NOT REAL DATA - Placeholder for development
   const PLACEHOLDER_DATA = [
     { name: "NOT REAL - Sample Drill" }
   ]
   ```

---

## 🔄 DATA FLOW

### Practice Planner Flow:
1. Loads drills from `powlax_drills` + `user_drills`
2. Shows strategies from `powlax_strategies` + `user_strategies`
3. Saves practice plans to `practice_plans` table

### Skills Academy Flow:
1. `powlax_academy_workout_collections` defines workouts
2. `powlax_academy_workout_items` links to drills via title match
3. `skills_academy_drills` provides the actual drill videos

### Wall Ball Flow:
1. `powlax_wall_ball_collections` are COMPLETE workout videos
2. `powlax_wall_ball_drill_library` shows which drills are demonstrated
3. Users watch the full workout video, not individual drills

---

## 📝 IMPORT COMMANDS

### Import Academy Workouts JSON:
```bash
npx tsx scripts/import-academy-workouts.ts
```

### Link Workout Items to Drills:
```sql
SELECT link_workout_items_to_drills();
```

### Verify No Mock Data:
```bash
grep -r "mockDrills\|fakeDrills\|sampleData\|dummyData" src/
```

---

## ⚠️ CRITICAL REMINDERS

1. **NO MOCK DATA** - All data must come from database
2. **Wall Ball workouts are SINGLE VIDEOS** - Not collections
3. **Skills Academy uses title matching** - drill_title → skills_academy_drills.title
4. **User tables start empty** - Will populate from user actions
5. **Label any temporary data** - Must say "NOT REAL DATA"

---

## 📞 SUPPORT

If data is missing or incorrect:
1. Check this guide for correct table/column names
2. Verify CSV/JSON source files exist
3. Run import scripts with service role key
4. Check Supabase logs for errors