# Wall Ball Correct Implementation Plan

**Generated:** January 10, 2025  
**Status:** Based on Live Skills Academy Structure  
**Purpose:** Implement Wall Ball using the ACTUAL table structure from the live site

## 🔍 Live Site Analysis

### ✅ Actual Table Structure (From Live Site)
The Skills Academy workouts page uses:

1. **`skills_academy_series`**
   ```sql
   - id, series_name, series_slug, series_type, series_code
   - description, skill_focus, position_focus, difficulty_level
   - color_scheme, display_order, is_featured, is_active, is_premium
   ```

2. **`skills_academy_workouts`**
   ```sql
   - id, series_id, workout_name, workout_size, drill_count
   - description, estimated_duration_minutes, drill_ids (array)
   - original_json_id, original_json_name, is_active
   ```

3. **`wall_ball_drill_library`** (already exists with 48 drills)
   ```sql
   - id, drill_name, drill_slug, difficulty_level
   - strong_hand_video_url, off_hand_video_url, both_hands_video_url
   - strong_hand_vimeo_id, off_hand_vimeo_id, both_hands_vimeo_id
   - description, skill_focus, equipment_needed, is_active
   ```

### ❌ Incorrect Tables (Not Used by Live Site)
- `wall_ball_workout_series` - **DELETE**
- `wall_ball_workout_variants` - **DELETE**
- `powlax_wall_ball_*` tables - **Empty and unused**

## 🚀 Correct Implementation Steps

### Step 1: Upload Missing Drills ✅ READY
**File:** `scripts/upload-remaining-wall-ball-drills-final.sql`
- Uploads 37 missing drills to `wall_ball_drill_library`
- Handles duplicates correctly

### Step 2: Add Wall Ball to Skills Academy ✅ READY
**File:** `scripts/upload-wall-ball-drills-to-skills-academy.sql`
- Inserts 8 Wall Ball series into `skills_academy_series` with `series_type = 'wall_ball'`
- Creates 24 workouts in `skills_academy_workouts` with proper `drill_ids` arrays
- Uses Mini (5 drills), More (10 drills), Complete (15-18 drills) structure

### Step 3: Cleanup Incorrect References ✅ READY
**File:** `scripts/cleanup-incorrect-wall-ball-references.sql`
- Drops unused `wall_ball_workout_*` tables
- Verifies correct tables remain

## 📋 Wall Ball Series for Skills Academy

1. **Master Fundamentals** (series_type: 'wall_ball', display_order: 100)
   - Mini (5 drills, 5 min)
   - More (10 drills, 10 min)  
   - Complete (17 drills, 15 min)

2. **Dodging** (series_type: 'wall_ball', display_order: 101)
   - Mini (5 drills, 5 min)
   - More (10 drills, 10 min)
   - Complete (16 drills, 16 min)

3. **Shooting** (series_type: 'wall_ball', display_order: 102)
   - Mini (5 drills, 5 min)
   - More (10 drills, 10 min)
   - Complete (18 drills, 18 min)

4. **Conditioning** (series_type: 'wall_ball', display_order: 103)
5. **Faking and Inside Finishing** (series_type: 'wall_ball', display_order: 104)
6. **Defensive Emphasis** (series_type: 'wall_ball', display_order: 105)
7. **Catch Everything** (series_type: 'wall_ball', display_order: 106)
8. **Advanced - Fun and Challenging** (series_type: 'wall_ball', display_order: 107)

## 🎮 Integration with Live Site

### Frontend Changes Required: NONE
The existing Skills Academy workouts page will automatically show Wall Ball workouts once they're added to `skills_academy_series` with `series_type = 'wall_ball'`.

### Modal Structure (Already Working)
The live site shows:
- Series name (e.g., "Master Fundamentals")
- Description (e.g., "Build essential wall ball skills")
- 3 workout sizes: 5 Minutes, 10 Minutes, Complete
- With Coaching / No Coaching options (can be added later)

### Workout Runner Integration
The existing workout runner will work with Wall Ball workouts using the `drill_ids` array to load drills from `wall_ball_drill_library`.

## ✅ Execution Order

1. **Upload missing drills:** `scripts/upload-remaining-wall-ball-drills-final.sql`
2. **Add to Skills Academy:** `scripts/upload-wall-ball-drills-to-skills-academy.sql` 
3. **Cleanup unused tables:** `scripts/cleanup-incorrect-wall-ball-references.sql`

**Result:** Wall Ball workouts will appear in the Skills Academy interface exactly like the screenshots show, using the existing UI components and database structure.

## 🧪 Testing

Run Playwright tests to verify:
- Wall Ball series appear in Skills Academy workouts page
- Modal opens with correct workout options
- Workout runner loads Wall Ball drills correctly
- Drill videos play from `wall_ball_drill_library`

**This approach uses the ACTUAL live site structure and requires no frontend changes.**
