# POWLAX Table Structures Comparison - Video URL Storage

## Current Video URL Storage Patterns

### 1. skills_academy_drills Table
**Current Structure** (Incomplete):
```sql
CREATE TABLE skills_academy_drills (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),                    -- ❌ ONLY Vimeo ID stored
    drill_category TEXT[],
    equipment_needed TEXT[],
    age_progressions JSONB,
    space_needed VARCHAR(255),
    complexity VARCHAR(50) CHECK (complexity IN ('building', 'foundation', 'advanced')),
    sets_and_reps TEXT,
    duration_minutes INTEGER,
    point_values JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Sample Data**:
```sql
INSERT INTO skills_academy_drills (
    original_id, title, vimeo_id, ...
) VALUES (
    47507, '2 Hand Cradle Away Drill', '1000143414', ...  -- Only ID stored
);
```

**Current Frontend URL Construction**:
```typescript
// From useSkillsAcademyWorkouts.ts line 228-230
both_hands_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null,
strong_hand_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null,
off_hand_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null
```

### 2. powlax_drills Table
**Complete Structure** (Reference):
```sql
CREATE TABLE powlax_drills (
    id SERIAL PRIMARY KEY,
    wp_id TEXT,
    title TEXT NOT NULL,
    content TEXT,
    drill_types TEXT,
    drill_category TEXT,
    drill_duration TEXT,
    drill_video_url TEXT,                    -- ✅ Complete URL stored
    drill_notes TEXT,
    game_states TEXT,
    drill_emphasis TEXT,
    game_phase TEXT,
    do_it_ages TEXT,
    coach_it_ages TEXT,
    own_it_ages TEXT,
    vimeo_url TEXT,                          -- ✅ Complete URL stored
    featured_image TEXT,
    status TEXT,
    slug TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. powlax_wall_ball_drills Table
**Multi-Video Structure** (Reference):
```sql
CREATE TABLE powlax_wall_ball_drills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    strong_hand_video_url TEXT,              -- ✅ Complete URLs
    strong_hand_vimeo_id VARCHAR(50),        -- ✅ Both ID and URL
    off_hand_video_url TEXT,                 -- ✅ Complete URLs
    off_hand_vimeo_id VARCHAR(50),           -- ✅ Both ID and URL
    both_hands_video_url TEXT,               -- ✅ Complete URLs
    both_hands_vimeo_id VARCHAR(50),         -- ✅ Both ID and URL
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Sample Wall Ball Data**:
```sql
-- From populate_wall_ball_complete.sql
'https://vimeo.com/1027151925', '1027151925'  -- Both URL and ID stored
```

## Video URL Construction Patterns in Frontend

### Current Pattern (skills_academy_drills)
```typescript
// Manual construction required
const videoUrl = drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null;
```

### Target Pattern (powlax_drills)
```typescript
// Direct usage - no construction needed
const videoUrl = drill.video_url || drill.drill_video_url;
```

### Vimeo Player Embed Pattern
```typescript
// From WallBallVideoPlayer.tsx line 65-77
const vimeoEmbedUrl = variant.full_workout_vimeo_id 
  ? `https://player.vimeo.com/video/${variant.full_workout_vimeo_id}?` + 
    new URLSearchParams({
      autopause: '0',
      badge: '0',
      player_id: '0',
      app_id: '58479',
      title: '0',
      byline: '0',
      portrait: '0',
      color: 'FF6600', // POWLAX orange
    }).toString()
  : null;
```

## Inconsistencies Identified

### 1. Table Naming Convention
- ✅ `powlax_drills` - Follows powlax_ prefix
- ❌ `skills_academy_drills` - Missing powlax_ prefix
- ✅ `powlax_wall_ball_drills` - Follows powlax_ prefix

### 2. Video URL Storage
- ✅ `powlax_drills`: Stores complete URLs in `vimeo_url` and `drill_video_url`
- ❌ `skills_academy_drills`: Only stores `vimeo_id`, requires frontend construction
- ✅ `powlax_wall_ball_drills`: Stores both IDs and complete URLs

### 3. Column Naming Patterns
- `powlax_drills`: `vimeo_url` + `drill_video_url`
- `skills_academy_drills`: `vimeo_id` only
- `powlax_wall_ball_drills`: `{type}_video_url` + `{type}_vimeo_id`

## Recommended Solution

### Option 1: Add video_url Column (Recommended)
**Pros**:
- Maintains backward compatibility
- Follows powlax_drills pattern
- Minimal breaking changes
- Easy rollback

**Implementation**:
```sql
ALTER TABLE skills_academy_drills ADD COLUMN video_url TEXT;
UPDATE skills_academy_drills SET video_url = 'https://vimeo.com/' || vimeo_id WHERE vimeo_id IS NOT NULL;
```

### Option 2: Rename Table + Add Column (Future Consideration)
**Pros**:
- Follows naming convention (powlax_skills_academy_drills)
- Complete standardization

**Cons**:
- Breaking changes to all frontend code
- Requires extensive testing
- Higher risk

## Impact Analysis

### Frontend Components Affected
1. `src/hooks/useSkillsAcademyWorkouts.ts` - Primary data fetching
2. `src/components/skills-academy/DrillSequencePlayer.tsx` - Video playback
3. `src/components/skills-academy/WallBallVideoPlayer.tsx` - Wall ball videos
4. `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx` - Workout pages
5. `src/types/skills-academy.ts` - TypeScript interfaces

### Database Files Affected
1. `supabase/migrations/` - New migration file needed
2. `scripts/imports/skills_academy_drills_import.sql` - Update for future imports
3. `scripts/database/create_skills_academy_and_wall_ball_tables.sql` - Update table definition

## Sample Data Examples

### Current skills_academy_drills Data
```
| id | original_id | title                    | vimeo_id    | video_url |
|----|-------------|--------------------------|-------------|-----------|
| 1  | 47507       | 2 Hand Cradle Away Drill | 1000143414  | NULL      |
| 2  | 47509       | 2 Hockey Pick Up Ground  | 995813226   | NULL      |
```

### After Migration
```
| id | original_id | title                    | vimeo_id    | video_url                      |
|----|-------------|--------------------------|-------------|--------------------------------|
| 1  | 47507       | 2 Hand Cradle Away Drill | 1000143414  | https://vimeo.com/1000143414   |
| 2  | 47509       | 2 Hockey Pick Up Ground  | 995813226   | https://vimeo.com/995813226    |
```

## Quality Assurance

### Pre-Migration Checks
- [ ] Count total records in skills_academy_drills
- [ ] Count records with non-null vimeo_id
- [ ] Identify any malformed vimeo_id values
- [ ] Backup current table structure

### Post-Migration Validation
- [ ] Verify video_url population matches vimeo_id count
- [ ] Test video playback in frontend
- [ ] Validate URL format consistency
- [ ] Performance test with new index

### Testing Requirements
- [ ] Unit tests for updated hooks
- [ ] Integration tests for video playback
- [ ] E2E tests for skills academy workflow
- [ ] Performance tests for large workout sequences

## Timeline Estimate
- **Phase 1** (Database): 1-2 hours
- **Phase 2** (Data Migration): 30 minutes
- **Phase 3** (Frontend Updates): 2-3 hours
- **Testing & Validation**: 1-2 hours
- **Total**: 4-7 hours

## Rollback Plan
If issues arise:
1. Keep vimeo_id column unchanged
2. Drop video_url column if needed: `ALTER TABLE skills_academy_drills DROP COLUMN video_url;`
3. Revert frontend changes via git
4. Original functionality preserved
