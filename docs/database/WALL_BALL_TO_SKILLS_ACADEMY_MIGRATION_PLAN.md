# Wall Ball to Skills Academy Migration Plan

**Date:** 2025-08-10  
**Status:** Ready for Implementation  
**Objective:** Migrate Wall Ball workouts from separate tables to Skills Academy system as a fifth track

## 🔍 Current State Analysis

### Wall Ball Tables Structure
- **`powlax_wall_ball_collections`**: 4 workout collections
- **`powlax_wall_ball_collection_drills`**: 3 junction records connecting collections to drills
- **`powlax_wall_ball_drill_library`**: 5 drills with video URLs

### Skills Academy Tables Structure  
- **`skills_academy_series`**: Series definitions with types (solid_start, attack, midfield, defense)
- **`skills_academy_workouts`**: Individual workouts with `drill_ids` array
- **`skills_academy_drills`**: Drill library with video URLs

## 📊 Data Mapping Analysis

### Wall Ball Collections → Skills Academy Series
Current wall ball collections will become series:

```sql
-- Current Wall Ball Collections:
1. Master Fundamentals - 10 Minutes (difficulty: 2)
2. Quick Skills - 5 Minutes (difficulty: 3)  
3. Advanced Dodging - 15 Minutes (difficulty: 4)
4. Shooting Precision - 12 Minutes (difficulty: 3)

-- Will become Skills Academy Series:
WB1: Master Fundamentals
WB2: Quick Skills  
WB3: Advanced Dodging
WB4: Shooting Precision
```

### Wall Ball Drills → Skills Academy Drills
Current 5 wall ball drills will be migrated:

```sql
-- Current Wall Ball Drills:
1. 3 Steps Up and Back (video: 997146099)
2. Quick Stick (video: 997146100)
3. Right Hand High to Low (video: 997146101) 
4. Left Hand High to Low (video: 997146102)
5. Both Hands Alternating (video: 997146103)

-- Will become Skills Academy Drills (starting from next available ID)
```

### Wall Ball Collections → Skills Academy Workouts  
Each collection becomes 3 workouts (Mini, More, Complete):

```sql
-- Master Fundamentals Collection → 3 Workouts:
- Master Fundamentals - Mini (3 drills, ~7 minutes)
- Master Fundamentals - More (5 drills, ~10 minutes)  
- Master Fundamentals - Complete (5 drills, ~15 minutes)
```

## 🚀 Migration Implementation Plan

### Phase 1: Create Wall Ball Series (4 series)

```sql
INSERT INTO skills_academy_series (
  series_name, series_slug, series_type, series_code, 
  description, position_focus, difficulty_level, 
  color_scheme, display_order, is_active
) VALUES 
('Master Fundamentals', 'wall-ball-wb1', 'wall_ball', 'WB1',
 'Essential wall ball skills for beginners', 'wall_ball', 2, 
 'rust', 50, true),
('Quick Skills', 'wall-ball-wb2', 'wall_ball', 'WB2',
 'Fast-paced skill development', 'wall_ball', 3,
 'rust', 51, true),
('Advanced Dodging', 'wall-ball-wb3', 'wall_ball', 'WB3', 
 'Advanced dodging techniques with wall ball', 'wall_ball', 4,
 'rust', 52, true),
('Shooting Precision', 'wall-ball-wb4', 'wall_ball', 'WB4',
 'Improve shooting accuracy and form', 'wall_ball', 3,
 'rust', 53, true);
```

### Phase 2: Migrate Wall Ball Drills (5 drills)

```sql
INSERT INTO skills_academy_drills (
  title, vimeo_id, video_url, drill_category, 
  complexity, duration_minutes, tags, created_at, updated_at
) VALUES
('3 Steps Up and Back', '997146099', 'https://vimeo.com/997146099',
 'Wall Ball,Footwork', 'foundation', 2, 'wall-ball,footwork', NOW(), NOW()),
('Quick Stick', '997146100', 'https://vimeo.com/997146100', 
 'Wall Ball,Stick Skills', 'foundation', 2, 'wall-ball,stick-skills', NOW(), NOW()),
('Right Hand High to Low', '997146101', 'https://vimeo.com/997146101',
 'Wall Ball,Hand Position', 'foundation', 2, 'wall-ball,hand-position', NOW(), NOW()),
('Left Hand High to Low', '997146102', 'https://vimeo.com/997146102',
 'Wall Ball,Off Hand', 'foundation', 2, 'wall-ball,off-hand', NOW(), NOW()),  
('Both Hands Alternating', '997146103', 'https://vimeo.com/997146103',
 'Wall Ball,Ambidextrous', 'intermediate', 3, 'wall-ball,both-hands', NOW(), NOW());
```

### Phase 3: Create Skills Academy Workouts (12 total: 4 series × 3 sizes)

For each wall ball series, create Mini/More/Complete versions:

```sql
-- Master Fundamentals Workouts
INSERT INTO skills_academy_workouts (
  series_id, workout_name, workout_size, drill_count,
  estimated_duration_minutes, drill_ids, is_active
) VALUES
(wb1_series_id, 'Master Fundamentals - Mini', 'mini', 2, 5, '{wb_drill_1,wb_drill_2}', true),
(wb1_series_id, 'Master Fundamentals - More', 'more', 3, 8, '{wb_drill_1,wb_drill_2,wb_drill_3}', true),
(wb1_series_id, 'Master Fundamentals - Complete', 'complete', 5, 10, '{wb_drill_1,wb_drill_2,wb_drill_3,wb_drill_4,wb_drill_5}', true);
```

### Phase 4: Update Frontend - Add Wall Ball Track

Add wall ball as the fifth track in `/skills-academy/workouts/page.tsx`:

```typescript
const tracks: Track[] = [
  // ... existing 4 tracks ...
  {
    id: 'wall_ball',
    title: 'Wall Ball Training', 
    description: 'Master fundamental skills with wall ball practice',
    color: 'bg-orange-600', // Rust color
    seriesType: 'wall_ball'
  }
]
```

## 🎯 Data Structure Mapping

### Field Mappings

| Wall Ball Field | Skills Academy Field | Transformation |
|-----------------|---------------------|----------------|
| `collections.name` | `series.series_name` | Direct copy |
| `collections.description` | `series.description` | Direct copy |
| `collections.difficulty_level` | `series.difficulty_level` | Direct copy |
| `collections.duration_minutes` | `workouts.estimated_duration_minutes` | Split by workout size |
| `drill_library.name` | `drills.title` | Direct copy |  
| `drill_library.strong_hand_video_url` | `drills.video_url` | Extract Vimeo ID |
| `drill_library.description` | `drills.drill_category` | Transform to category |

### Video URL Processing

Wall ball drills use full Vimeo player URLs that need to be processed:

```typescript
// Wall Ball: https://player.vimeo.com/video/997146099
// Skills Academy: vimeo_id: "997146099", video_url: "https://vimeo.com/997146099"

function extractVimeoId(playerUrl: string): string {
  return playerUrl.match(/video\/(\d+)/)?.[1] || ''
}
```

## 🔄 Migration Script Structure

```typescript
// scripts/migrate-wall-ball-to-skills-academy.ts

async function migrateWallBallData() {
  console.log('🏐 Starting Wall Ball → Skills Academy Migration\n')
  
  // Step 1: Migrate Collections → Series  
  const newSeries = await migrateCollectionsToSeries()
  
  // Step 2: Migrate Drills → Skills Academy Drills
  const newDrills = await migrateDrillsToSkillsAcademy()
  
  // Step 3: Create Workouts with drill_ids arrays
  const newWorkouts = await createWorkoutsFromCollections(newSeries, newDrills)
  
  // Step 4: Verify migration
  await verifyMigration()
  
  console.log('✅ Migration Complete!')
}
```

## 📋 Pre-Migration Checklist

- [ ] ✅ Analyze wall ball table structure (completed)
- [ ] ✅ Analyze skills academy table structure (completed) 
- [ ] ✅ Create comprehensive migration plan (completed)
- [ ] Create migration script
- [ ] Test migration on development data
- [ ] Update frontend to add wall ball track
- [ ] Run full migration
- [ ] Verify data integrity
- [ ] Update workouts page UI

## 🎨 UI Integration Plan

### Workouts Page Updates

Add Wall Ball track card with rust/orange color scheme:

```typescript
// In /skills-academy/workouts/page.tsx
{
  id: 'wall_ball',
  title: 'Wall Ball Training',
  description: 'Master fundamental skills with wall ball practice', 
  color: 'bg-orange-600', // Rust color as requested
  seriesType: 'wall_ball'
}
```

### Icon Selection  
Use a target or ball icon for wall ball track:
- `Target` (existing)  
- `Circle` for ball representation
- Custom wall ball icon if available

## 🚀 Post-Migration Benefits

1. **Unified System**: All workouts accessible through single Skills Academy interface
2. **Consistent UX**: Same workout runner experience for wall ball  
3. **Progress Tracking**: Wall ball progress integrated with overall Skills Academy progress
4. **Simplified Maintenance**: Single codebase for all workout types
5. **Better Navigation**: Wall ball accessible through track selection

## ⚠️ Risk Mitigation

1. **Data Backup**: Backup wall ball tables before migration
2. **Rollback Plan**: Keep original tables until migration verified  
3. **Incremental Testing**: Test each phase independently
4. **User Communication**: Wall ball workouts will have brief downtime during migration

## 📊 Success Metrics

- ✅ All 4 wall ball collections → 4 skills academy series
- ✅ All 5 wall ball drills → 5 skills academy drills  
- ✅ 12 new workouts created (4 series × 3 sizes)
- ✅ Wall ball track appears on workouts page
- ✅ Wall ball workouts run in workout runner
- ✅ Video playback works for all wall ball drills
- ✅ Original wall ball functionality maintained

---

**Ready for Implementation:** Migration script creation can begin immediately.  
**Estimated Time:** 2-3 hours for complete migration and testing.