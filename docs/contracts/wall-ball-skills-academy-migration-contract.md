# Claude-to-Claude Sub-Agent Contract: Wall Ball → Skills Academy Migration

**Contract ID:** WB-SA-2025-001  
**Date:** 2025-08-10  
**Execution Type:** SEQUENTIAL (Critical data dependencies)  
**Ultra-Think Required:** YES - MANDATORY 10+ MINUTE ANALYSIS  
**Risk Level:** HIGH (Database migration with user-facing impact)

## 🎯 Contract Objective

Duplicate wall ball workout data into Skills Academy tables to unify the workout runner experience while preserving original wall ball tables for video mapping and reference.

## ⚠️ ULTRA-THINK REQUIREMENTS (MANDATORY)

### Minimum 10-Minute Deep Analysis Phase
Before ANY implementation, the primary Claude agent MUST:

1. **Database Relationship Analysis** (3 minutes):
   - Map all foreign key relationships between wall ball tables
   - Identify junction table connections (powlax_wall_ball_collection_drills)
   - Verify drill_id mappings to video URLs
   - Check for null values in critical fields

2. **Data Integrity Verification** (3 minutes):
   - Confirm all 5 wall ball drills have valid video URLs
   - Verify all 4 collections have proper difficulty levels
   - Check junction table has correct drill sequences
   - Validate no orphaned records exist

3. **Collision Risk Assessment** (2 minutes):
   - Check for existing wall ball data in Skills Academy tables
   - Identify potential ID conflicts
   - Review unique constraints that might fail
   - Plan rollback strategy if migration fails

4. **User Impact Analysis** (2 minutes):
   - Document current working wall ball features
   - Identify features that will break during migration
   - Plan testing sequence to verify no regressions
   - Prepare user communication if needed

## 📊 Critical Data Mapping

### Source Tables (DO NOT DELETE)
```yaml
powlax_wall_ball_collections:
  records: 4
  critical_fields: [id, name, description, difficulty_level]
  
powlax_wall_ball_drill_library:
  records: 5
  critical_fields: [id, name, strong_hand_video_url, weak_hand_video_url]
  video_format: "https://player.vimeo.com/video/{id}"
  
powlax_wall_ball_collection_drills:
  records: 3 (CRITICAL - Only 3 connections exist!)
  critical_fields: [collection_id, drill_id, sequence_order]
  WARNING: "Not all collections have drills assigned"
```

### Target Tables (APPEND ONLY)
```yaml
skills_academy_series:
  existing_records: 41
  new_records: 4
  id_strategy: "AUTO_INCREMENT"
  unique_constraint: "series_code must be unique"
  
skills_academy_drills:
  existing_records: 167
  new_records: 5
  id_strategy: "AUTO_INCREMENT"
  video_format: "https://vimeo.com/{id}" # Different from source!
  
skills_academy_workouts:
  existing_records: 118
  new_records: 12 (4 collections × 3 sizes)
  critical_field: "drill_ids (ARRAY field - must be populated)"
  
skills_academy_workout_drills:
  existing_records: 0 (EMPTY - Known issue)
  new_records: 0 (Using drill_ids array instead)
```

## 🔴 CRITICAL REQUIREMENTS

### Data Preservation Rules
1. **NEVER DELETE** original wall ball tables
2. **DUPLICATE ONLY** - Do not move data
3. **PRESERVE VIDEO URLS** - Must convert format correctly
4. **MAINTAIN SEQUENCES** - Drill order must match original

### Video URL Conversion (CRITICAL)
```typescript
// MUST CONVERT FORMATS:
// FROM: https://player.vimeo.com/video/997146099
// TO:   https://vimeo.com/997146099

function convertVideoUrl(wallBallUrl: string): string {
  if (!wallBallUrl) throw new Error('Missing video URL')
  return wallBallUrl.replace('player.vimeo.com/video/', 'vimeo.com/')
}

// MUST EXTRACT VIMEO ID:
function extractVimeoId(url: string): string {
  const match = url.match(/\/(\d+)/)
  if (!match) throw new Error(`Invalid Vimeo URL: ${url}`)
  return match[1]
}
```

### Drill Mapping Strategy (CRITICAL FIX)
```typescript
// PROBLEM: Only 3 junction records for 4 collections
// SOLUTION: Create intelligent drill assignment

async function mapDrillsToWorkouts(collectionId: number, workoutSize: string) {
  // Get explicitly mapped drills from junction table
  const mappedDrills = await supabase
    .from('powlax_wall_ball_collection_drills')
    .select('drill_id, sequence_order')
    .eq('collection_id', collectionId)
    .order('sequence_order')
  
  if (mappedDrills.data && mappedDrills.data.length > 0) {
    // Use explicit mappings
    return selectDrillsBySize(mappedDrills.data, workoutSize)
  } else {
    // FALLBACK: Use all drills for collections without mappings
    console.warn(`No drill mappings for collection ${collectionId}, using default set`)
    return getDefaultDrillSet(workoutSize)
  }
}

function selectDrillsBySize(drills: any[], size: string): number[] {
  switch(size) {
    case 'mini': return drills.slice(0, 2).map(d => d.drill_id)
    case 'more': return drills.slice(0, 3).map(d => d.drill_id)
    case 'complete': return drills.map(d => d.drill_id)
    default: throw new Error(`Invalid workout size: ${size}`)
  }
}
```

## 📋 Execution Phases

### Phase 1: Pre-Migration Validation
```yaml
agent: Claude (Primary)
duration: 15 minutes
tasks:
  - Run ultra-think analysis (10 min minimum)
  - Create backup of current state
  - Verify all source tables have data
  - Check target table constraints
  - Test video URL conversion function
  - Document any missing drill mappings
```

### Phase 2: Data Migration Script Creation
```yaml
agent: Claude (Primary)
duration: 30 minutes
file: scripts/migrate-wall-ball-to-skills-academy.ts
tasks:
  - Create type-safe migration functions
  - Implement video URL conversion
  - Handle missing drill mappings
  - Add transaction support for atomicity
  - Include rollback capability
  - Add detailed logging
```

### Phase 3: Migration Execution
```yaml
agent: Claude (Primary)
duration: 20 minutes
tasks:
  - Run migration in test mode first
  - Verify record counts match expectations
  - Check video URLs converted correctly
  - Validate drill_ids arrays populated
  - Execute actual migration
  - Verify no data lost from source tables
```

### Phase 4: Integration Testing
```yaml
agent: Claude (Primary)
duration: 25 minutes
tasks:
  - Test wall ball track in Skills Academy modal
  - Verify all 12 workout variations created
  - Test workout runner with wall ball workouts
  - Confirm videos play with new URLs
  - Check drill progression matches original
  - Run Playwright tests on all devices
```

### Phase 5: Cleanup & Documentation
```yaml
agent: Claude (Primary)
duration: 10 minutes
tasks:
  - Update routing to use unified workout runner
  - Document migration results
  - Create rollback script if needed
  - Update CLAUDE.md with new structure
  - Commit with detailed message
```

## 🚨 Error Handling Strategy

### Known Issues to Handle
1. **Missing Drill Mappings**: Only 3 junction records for 4 collections
   - Solution: Use default drill set for unmapped collections
   
2. **Empty Junction Table**: skills_academy_workout_drills has 0 records
   - Solution: Use drill_ids array field instead
   
3. **Video URL Format Mismatch**: Different formats between systems
   - Solution: Convert all URLs during migration

### Rollback Plan
```sql
-- If migration fails, rollback with:
DELETE FROM skills_academy_series WHERE series_code LIKE 'WB%';
DELETE FROM skills_academy_drills WHERE tags LIKE '%wall-ball%';
DELETE FROM skills_academy_workouts WHERE series_id IN (
  SELECT id FROM skills_academy_series WHERE series_type = 'wall_ball'
);
```

## ✅ Success Criteria

### Functional Requirements
- [ ] Wall ball workouts appear in Skills Academy modal
- [ ] All 12 workout variations available (4 series × 3 sizes)
- [ ] Workouts route to `/skills-academy/workout/[id]`
- [ ] Videos play with converted Vimeo URLs
- [ ] Original wall ball tables unchanged

### Technical Requirements  
- [ ] 4 new series in skills_academy_series
- [ ] 5 new drills in skills_academy_drills
- [ ] 12 new workouts in skills_academy_workouts
- [ ] drill_ids arrays properly populated
- [ ] No TypeScript or ESLint errors
- [ ] All Playwright tests pass

### Data Integrity
- [ ] No data lost from original tables
- [ ] All video URLs accessible
- [ ] Drill sequences preserved
- [ ] Difficulty levels maintained

## 📊 Expected Results

### Database Changes
```yaml
skills_academy_series:
  before: 41 records
  after: 45 records (+4 wall ball series)
  
skills_academy_drills:
  before: 167 records
  after: 172 records (+5 wall ball drills)
  
skills_academy_workouts:
  before: 118 records
  after: 130 records (+12 wall ball workouts)
  
powlax_wall_ball_* tables:
  unchanged: All original data preserved
```

### User Experience Changes
- Wall ball workouts use unified interface
- No separate wall ball runner needed
- Consistent progress tracking across all tracks

## 🔒 Contract Validation

### Pre-Execution Checklist
- [ ] Ultra-think analysis completed (10+ minutes)
- [ ] All error scenarios documented
- [ ] Rollback plan tested
- [ ] Server running on port 3000
- [ ] Database backup created

### Post-Execution Verification
- [ ] All success criteria met
- [ ] No regressions in existing features
- [ ] User can complete wall ball workout
- [ ] Videos play correctly
- [ ] Original tables intact

## 📝 Contract Signature

**Approved By:** User  
**Executed By:** Claude (Primary Agent)  
**Ultra-Think Duration:** _________ minutes (MUST BE 10+)  
**Start Time:** _________  
**Completion Time:** _________  
**Status:** [ ] Success [ ] Partial [ ] Failed

---

**REMEMBER:** This is a HIGH-RISK database migration. Ultra-think analysis is MANDATORY. Do not skip any validation steps. The goal is to DUPLICATE data, never DELETE. User experience depends on successful migration.

*Contract Version: 1.0*  
*Last Updated: 2025-08-10*