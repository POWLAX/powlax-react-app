# Wall Ball → Skills Academy Unification - Handoff Document

**Date:** 2025-08-10  
**Status:** Ready for Implementation  
**Objective:** Duplicate wall ball workout data into Skills Academy tables so wall ball uses the same workout runner interface as other tracks

## 🎯 Project Goal

Unify the user experience so wall ball workouts use the same interface as Attack, Midfield, and Defense training, eliminating the need for a separate wall ball workout runner page.

## 🔍 Current State Analysis

### What's Working ✅
- Wall ball workouts currently display in Skills Academy workouts modal
- Wall ball track (5th track) visible with rust/orange color
- Original wall ball tables contain all necessary data:
  - `powlax_wall_ball_collections` (4 collections)
  - `powlax_wall_ball_collection_drills` (3 junction records)
  - `powlax_wall_ball_drill_library` (5 drills with videos)

### What Needs to Change 🔄
- Wall ball workouts currently route to `/skills-academy/wall-ball/[id]` (separate page)
- **Goal**: Route to `/skills-academy/workout/[id]` (same as other tracks)
- Need wall ball data duplicated in Skills Academy tables

## 📊 Data Architecture Plan

### Keep Original Tables ✅
**IMPORTANT**: Do NOT delete original wall ball tables. They serve important purposes:
- **Video mapping**: Connecting wall workout videos to individual drill videos
- **Drill explanations**: Metadata about what each drill video contains
- **Reference data**: Original structure for future enhancements

### Duplicate Into Skills Academy Tables 📥

#### 1. Wall Ball Collections → Skills Academy Series
```sql
-- 4 wall ball collections become 4 skills academy series
INSERT INTO skills_academy_series (
  series_name, series_slug, series_type, series_code,
  description, position_focus, difficulty_level, 
  color_scheme, display_order, is_active
) 
SELECT 
  name, 
  LOWER(REPLACE(name, ' ', '-')),
  'wall_ball',
  'WB' || id,
  description,
  'wall_ball',
  difficulty_level,
  'orange',
  50 + id, -- Display after other series
  true
FROM powlax_wall_ball_collections;
```

#### 2. Wall Ball Drills → Skills Academy Drills  
```sql
-- 5 wall ball drills become skills academy drills
INSERT INTO skills_academy_drills (
  title, drill_category, complexity, duration_minutes,
  video_url, vimeo_id, tags, created_at, updated_at
)
SELECT 
  name,
  'Wall Ball,Skill Development',
  CASE 
    WHEN difficulty_level <= 2 THEN 'foundation'
    ELSE 'intermediate'
  END,
  2, -- Default duration
  REPLACE(strong_hand_video_url, 'player.vimeo.com/video/', 'vimeo.com/'),
  REGEXP_REPLACE(strong_hand_video_url, '.*video/([0-9]+).*', '\1'),
  'wall-ball,fundamentals',
  NOW(),
  NOW()
FROM powlax_wall_ball_drill_library;
```

#### 3. Create Wall Ball Workouts (12 total: 4 collections × 3 sizes)
```sql
-- Each wall ball collection becomes 3 workout sizes
INSERT INTO skills_academy_workouts (
  series_id, workout_name, workout_size, drill_count,
  estimated_duration_minutes, drill_ids, is_active
)
SELECT 
  sa_series.id,
  wb_collection.name || ' - Mini',
  'mini',
  2,
  6,
  ARRAY[drill1_id, drill2_id], -- First 2 drills
  true
FROM powlax_wall_ball_collections wb_collection
JOIN skills_academy_series sa_series ON sa_series.series_code = 'WB' || wb_collection.id;

-- Similar for 'more' and 'complete' sizes with different drill counts
```

## 🛠️ Implementation Steps

### Phase 1: Data Migration Script
Create: `scripts/duplicate-wall-ball-to-skills-academy.ts`

```typescript
async function migrateWallBallData() {
  console.log('🏐 Duplicating Wall Ball → Skills Academy Data\n')
  
  // Step 1: Migrate Collections → Series (keeping original tables)
  const newSeries = await duplicateCollectionsToSeries()
  
  // Step 2: Migrate Drills → Skills Academy Drills (keeping originals)
  const newDrills = await duplicateDrillsToSkillsAcademy()
  
  // Step 3: Create Workouts with proper drill_ids arrays
  const newWorkouts = await createWorkoutsFromCollections(newSeries, newDrills)
  
  // Step 4: Verify migration maintains original data
  await verifyOriginalTablesIntact()
  
  console.log('✅ Wall Ball data duplicated to Skills Academy!')
}
```

### Phase 2: Update Workout Modal 
File: `src/app/(authenticated)/skills-academy/workouts/page.tsx`

**Already Completed**: Modal now treats wall ball as regular Skills Academy track
- ✅ Removed wall ball specific modal rendering
- ✅ Wall ball workouts now use standard Skills Academy workflow  
- ✅ Route to `/skills-academy/workout/[id]` instead of `/skills-academy/wall-ball/[id]`

### Phase 3: Clean Up Routing
Remove or deprecate:
- `/skills-academy/wall-ball/[id]/page.tsx` 
- `WallBallWorkoutRunner` component
- `useWallBallVariant` hook (or keep for reference)

## 📋 Expected Data Structure After Migration

### Skills Academy Series (Wall Ball)
```sql
-- 4 new series added:
WB1: Master Fundamentals (difficulty: 2)
WB2: Quick Skills (difficulty: 3) 
WB3: Advanced Dodging (difficulty: 4)
WB4: Shooting Precision (difficulty: 3)
```

### Skills Academy Drills (Wall Ball)
```sql  
-- 5 new drills added with proper video URLs:
- 3 Steps Up and Back (vimeo.com/997146099)
- Quick Stick (vimeo.com/997146100) 
- Right Hand High to Low (vimeo.com/997146101)
- Left Hand High to Low (vimeo.com/997146102)
- Both Hands Alternating (vimeo.com/997146103)
```

### Skills Academy Workouts (Wall Ball)
```sql
-- 12 new workouts (4 series × 3 sizes):
Master Fundamentals - Mini (2 drills, 6 mins)
Master Fundamentals - More (3 drills, 8 mins) 
Master Fundamentals - Complete (5 drills, 10 mins)
... (repeat for other 3 series)
```

## 🔗 Workout Modal Flow (After Migration)

1. User clicks **Wall Ball Training** track
2. Modal opens showing wall ball series (same as other tracks):
   ```
   ┌─────────────────────────────────────────┐
   │  Wall Ball Training Workouts        ×   │
   ├─────────────────────────────────────────┤
   │ ○ Master Fundamentals                   │
   │   [Mini]  [More]  [Complete]           │
   │                                         │
   │ ○ Quick Skills                          │  
   │   [Mini]  [More]  [Complete]           │
   │                                         │
   │ ○ Advanced Dodging                      │
   │   [Mini]  [More]  [Complete]           │
   │                                         │
   │ ○ Shooting Precision                    │
   │   [Mini]  [More]  [Complete]           │
   └─────────────────────────────────────────┘
   ```
3. User clicks any workout button 
4. Routes to `/skills-academy/workout/[workout_id]`
5. **Same workout runner** as Attack/Midfield/Defense
6. Videos play from Skills Academy drill system

## ⚠️ Important Considerations

### Data Preservation
- **Never delete** original wall ball tables
- Original tables remain for:
  - Video mapping functionality
  - Drill explanation metadata  
  - Future wall ball specific features
  - Backup reference data

### Video URL Processing
```typescript
// Convert wall ball video URLs for Skills Academy compatibility
function convertWallBallVideoUrl(wallBallUrl: string): string {
  // Wall Ball: https://player.vimeo.com/video/997146099
  // Skills Academy: https://vimeo.com/997146099
  return wallBallUrl.replace('player.vimeo.com/video/', 'vimeo.com/')
}

function extractVimeoId(videoUrl: string): string {
  // Extract: 997146099
  return videoUrl.match(/\/(\d+)/)?.[1] || ''
}
```

### Drill Mapping Strategy
```typescript
// Each wall ball collection maps to drills based on junction table
const collectionDrills = await supabase
  .from('powlax_wall_ball_collection_drills')
  .select('drill_id, sequence_order')
  .eq('collection_id', collectionId)
  .order('sequence_order')

// Create drill_ids array for workout
const drillIds = collectionDrills.map(cd => 
  skillsAcademyDrillMapping[cd.drill_id]
)
```

## 🎯 Success Metrics

### Functional Requirements ✅
- Wall ball workouts appear in same modal as other tracks
- Wall ball workouts route to standard workout runner (`/skills-academy/workout/[id]`)
- Videos play correctly with existing Vimeo URLs
- All 12 wall ball workout variations available (4 series × 3 sizes)

### Technical Requirements ✅  
- Original wall ball tables remain untouched
- Wall ball data duplicated (not moved) to Skills Academy tables
- Single workout runner handles all track types
- No separate wall ball specific pages needed

### User Experience ✅
- Consistent interface across all training tracks
- Same workout completion flow and progress tracking
- Unified navigation and workout runner experience

## 📝 Files Modified (Already Complete)

### ✅ Updated Files
- `src/app/(authenticated)/skills-academy/workouts/page.tsx` 
  - Removed wall ball specific modal rendering
  - Wall ball now uses standard Skills Academy workflow

### 🏗️ Files to Create
- `scripts/duplicate-wall-ball-to-skills-academy.ts` (migration script)

### 📋 Files to Deprecate (After Migration)
- `src/app/(authenticated)/skills-academy/wall-ball/[id]/page.tsx`
- `src/components/skills-academy/WallBallWorkoutRunner.tsx` 
- `src/hooks/useWallBallWorkouts.ts` (optional - keep for reference)

## 🚀 Next Steps

1. **Run Migration Script**: Execute the duplication script to populate Skills Academy tables
2. **Test Wall Ball Workouts**: Verify wall ball workouts load in standard workout runner
3. **Verify Video Playback**: Ensure converted video URLs work correctly  
4. **Test All Workout Sizes**: Confirm Mini/More/Complete variations work
5. **Clean Up Deprecated Files**: Remove wall ball specific components (optional)

## 🔍 Verification Checklist

After migration completion:
- [ ] Wall ball track shows 4 series in modal
- [ ] Each series shows 3 workout size buttons  
- [ ] Clicking workout routes to `/skills-academy/workout/[id]`
- [ ] Workout runner displays wall ball drills correctly
- [ ] Videos play with proper Vimeo integration
- [ ] Original wall ball tables remain untouched
- [ ] All 5 wall ball drill videos accessible

---

**Ready for Implementation**: Migration script creation can begin immediately.  
**Estimated Time**: 2-3 hours for complete duplication and testing.  
**Risk Level**: Low (data duplication, not deletion)

*Last updated: 2025-08-10*  
*Author: Claude*  
*Status: Wall ball unification ready for data duplication phase*