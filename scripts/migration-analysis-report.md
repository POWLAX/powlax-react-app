# CRITICAL WALL BALL TO SKILLS ACADEMY MIGRATION ANALYSIS

## Current State Summary

### Wall Ball Source Tables ✅
- **Collections**: 4 total
  - Collection 1: "Master Fundamentals - 10 Minutes" (HAS 3 drills: 1,2,3)
  - Collection 2: "Quick Skills - 5 Minutes" (NO DRILLS ASSIGNED)
  - Collection 3: "Advanced Dodging - 15 Minutes" (NO DRILLS ASSIGNED) 
  - Collection 4: "Shooting Precision - 12 Minutes" (NO DRILLS ASSIGNED)

- **Drills**: 5 total with player.vimeo.com URLs
  - Drill 1: "3 Steps Up and Back" - vimeo.com/video/997146099
  - Drill 2: "Quick Stick" - vimeo.com/video/997146100
  - Drill 3: "Right Hand High to Low" - vimeo.com/video/997146101
  - Drill 4: "Left Hand High to Low" - vimeo.com/video/997146102
  - Drill 5: "Both Hands Alternating" - vimeo.com/video/997146103

### Skills Academy Target Tables 🚧
- **Series**: ✅ ALREADY MIGRATED (IDs 42-45) - Created today 2025-08-10
- **Drills**: ❌ NOT MIGRATED (last ID: 167, need to add 5 starting at 168)
- **Workouts**: ❌ NOT MIGRATED (last ID: 118, need to add 4 starting at 119)  
- **Junction**: ❌ EMPTY (0 records, need to populate)

## CRITICAL RISKS IDENTIFIED

### 🚨 HIGH RISK: Missing Drill Assignments
- **Problem**: 3 out of 4 collections have NO drills assigned in source data
- **Impact**: Collections 2, 3, 4 would have empty workouts
- **Solution Required**: Intelligent drill assignment based on collection names/themes

### 🚨 MEDIUM RISK: ID Conflicts
- **Series IDs**: Safe (already assigned 42-45)
- **Drill IDs**: Safe (starting at 168, last current is 167)
- **Workout IDs**: Safe (starting at 119, last current is 118)
- **Junction**: Safe (table is empty)

### 🚨 MEDIUM RISK: Video URL Conversion
- **Source Format**: `https://player.vimeo.com/video/{ID}`
- **Target Format**: `https://vimeo.com/{ID}`
- **All 5 videos need URL transformation**

### 🚨 LOW RISK: Data Structure Differences
- Skills Academy drills have much more complex structure
- Need to populate: categories, equipment, age_progressions, etc.
- Can use sensible defaults for wall ball drills

## PROPOSED DATA MAPPING STRATEGY

### Drill Assignment Logic
Since collections 2, 3, 4 have no assigned drills, use intelligent assignment:

**Collection 1: "Master Fundamentals"** (Current: drills 1,2,3)
- ✅ Keep existing: 3 Steps Up and Back, Quick Stick, Right Hand High to Low

**Collection 2: "Quick Skills - 5 Minutes"** (Currently empty)
- 📋 Assign: Quick Stick (drill 2) - fits the "quick" theme
- 📋 Assign: Both Hands Alternating (drill 5) - good for quick skill building

**Collection 3: "Advanced Dodging - 15 Minutes"** (Currently empty)  
- 📋 Assign: Left Hand High to Low (drill 4) - dodging requires weak hand skill
- 📋 Assign: Both Hands Alternating (drill 5) - advanced coordination
- 📋 Assign: 3 Steps Up and Back (drill 1) - movement-based for dodging

**Collection 4: "Shooting Precision - 12 Minutes"** (Currently empty)
- 📋 Assign: Right Hand High to Low (drill 3) - shooting accuracy
- 📋 Assign: Left Hand High to Low (drill 4) - both hands for precision
- 📋 Assign: Quick Stick (drill 2) - release timing for shots

### Skills Academy Drill Structure Template
```json
{
  "title": "{original_name}",
  "vimeo_id": "{extracted_id}",
  "drill_category": ["Wall Ball", "Fundamentals"],
  "equipment_needed": ["Lacrosse Stick", "Ball", "Wall"],
  "age_progressions": {
    "do_it": {"min": 8, "max": 12},
    "own_it": {"min": 13, "max": 16},
    "coach_it": {"min": 17, "max": 99}
  },
  "space_needed": "Wall Space>10x10 Yard Area",
  "complexity": "foundation",
  "sets_and_reps": "3 Sets of 20 Reps Each Hand",
  "duration_minutes": 5,
  "point_values": {
    "lax_credit": 2,
    "wall_ball_badge": 1
  },
  "tags": ["wall-ball", "fundamentals", "repetition"],
  "video_url": "https://vimeo.com/{vimeo_id}"
}
```

### Workout Structure Template
```json
{
  "series_id": "{wall_ball_series_id}",
  "workout_name": "{collection_name}",
  "workout_size": "mini",
  "drill_count": "{actual_drill_count}",
  "description": "Wall ball workout focusing on {theme}",
  "estimated_duration_minutes": "{collection_duration}",
  "drill_ids": ["{assigned_drill_ids}"],
  "is_active": true
}
```

## VERIFICATION STRATEGY

### Pre-Migration Checks ✅
- [x] Verify series already exist (IDs 42-45)
- [x] Confirm drill/workout ID ranges are safe  
- [x] Validate video URLs are accessible
- [x] Check junction table is empty

### Post-Migration Verification Required 📋
1. **Drill Count**: Should be 172 total (167 + 5)
2. **Workout Count**: Should be 122 total (118 + 4)  
3. **Junction Records**: Should have ~11 total records
4. **Video URL Format**: All should use vimeo.com format
5. **Series Connections**: Each workout should reference correct series_id
6. **Drill Assignments**: Each collection should have appropriate drills

### Test Queries for Verification
```sql
-- Check drill count
SELECT COUNT(*) FROM skills_academy_drills WHERE tags @> '["wall-ball"]';

-- Check workouts by series
SELECT series_id, COUNT(*) FROM skills_academy_workouts WHERE series_id IN (42,43,44,45) GROUP BY series_id;

-- Check junction records
SELECT COUNT(*) FROM skills_academy_workout_drills 
JOIN skills_academy_workouts ON skills_academy_workout_drills.workout_id = skills_academy_workouts.id 
WHERE skills_academy_workouts.series_id IN (42,43,44,45);

-- Verify video URLs
SELECT title, video_url FROM skills_academy_drills WHERE tags @> '["wall-ball"]';
```

## ROLLBACK STRATEGY

### If Migration Fails 🆘
1. **Series**: Do NOT delete (already existed)
2. **Drills**: DELETE WHERE tags @> '["wall-ball"]'  
3. **Workouts**: DELETE WHERE series_id IN (42,43,44,45)
4. **Junction**: DELETE all records for deleted workouts

### Rollback SQL
```sql
-- Save workout IDs first
CREATE TEMP TABLE temp_wall_ball_workouts AS 
SELECT id FROM skills_academy_workouts WHERE series_id IN (42,43,44,45);

-- Delete junction records
DELETE FROM skills_academy_workout_drills 
WHERE workout_id IN (SELECT id FROM temp_wall_ball_workouts);

-- Delete workouts  
DELETE FROM skills_academy_workouts WHERE series_id IN (42,43,44,45);

-- Delete drills
DELETE FROM skills_academy_drills WHERE tags @> '["wall-ball"]';

-- Clean up
DROP TABLE temp_wall_ball_workouts;
```

## EXECUTION PLAN

1. **Create Migration Script** with drill assignment logic
2. **Insert Wall Ball Drills** (IDs 168-172) with converted URLs
3. **Insert Wall Ball Workouts** (IDs 119-122) with drill_ids arrays
4. **Populate Junction Table** based on workout drill_ids
5. **Run Verification Queries** to ensure data integrity
6. **Test User Interface** to ensure workouts display correctly

## ESTIMATED IMPACT
- **Added Records**: 5 drills + 4 workouts + ~11 junction records = 20 total
- **User Experience**: Wall ball collections become functional Skills Academy workouts
- **Data Integrity**: Maintains all existing data, only adds new records
- **Rollback Time**: < 30 seconds if needed

---
**Analysis completed at**: 2025-08-10  
**Migration Status**: Ready for implementation
**Risk Level**: MEDIUM (due to missing drill assignments requiring intelligent mapping)