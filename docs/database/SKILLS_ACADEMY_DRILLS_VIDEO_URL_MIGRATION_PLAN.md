# Skills Academy Drills Video URL Migration Plan

## Overview
Add a complete video URL column to the `skills_academy_drills` table to match the pattern used in `powlax_drills` table, eliminating the need for frontend URL construction.

## Current State Analysis

### skills_academy_drills Table Structure
```sql
CREATE TABLE skills_academy_drills (
    id SERIAL PRIMARY KEY,
    original_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    vimeo_id VARCHAR(50),                    -- ❌ ONLY stores Vimeo ID (e.g., "1000143414")
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

### powlax_drills Table Structure (Reference)
```sql
CREATE TABLE powlax_drills (
    id SERIAL PRIMARY KEY,
    wp_id TEXT,
    title TEXT NOT NULL,
    content TEXT,
    drill_types TEXT,
    drill_category TEXT,
    drill_duration TEXT,
    drill_video_url TEXT,                    -- ✅ Complete URL
    drill_notes TEXT,
    game_states TEXT,
    drill_emphasis TEXT,
    game_phase TEXT,
    do_it_ages TEXT,
    coach_it_ages TEXT,
    own_it_ages TEXT,
    vimeo_url TEXT,                          -- ✅ Complete URL
    featured_image TEXT,
    status TEXT,
    slug TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Problem Statement
- `skills_academy_drills` table only stores `vimeo_id` (e.g., "1000143414")
- Frontend components must construct URLs: `https://vimeo.com/${vimeo_id}`
- `powlax_drills` table stores complete URLs for consistency
- Need to standardize video URL storage across all drill tables

## Solution Plan

### Phase 1: Database Schema Update
1. **Add video_url column** to `skills_academy_drills` table
2. **Populate existing records** with constructed URLs from vimeo_id
3. **Create index** on new video_url column for performance
4. **Maintain backward compatibility** by keeping vimeo_id column

### Phase 2: Data Migration
1. **Update all existing records** where vimeo_id is not null
2. **Handle edge cases** where vimeo_id might be malformed
3. **Verify data integrity** post-migration

### Phase 3: Application Updates
1. **Update React components** to use video_url instead of constructing URLs
2. **Update TypeScript interfaces** to include video_url field
3. **Update hooks and services** to prefer video_url over vimeo_id
4. **Maintain fallback logic** for backward compatibility

## Implementation Details

### Migration Script Structure
```sql
-- Add video_url column
ALTER TABLE skills_academy_drills 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Populate video_url from vimeo_id
UPDATE skills_academy_drills 
SET video_url = 'https://vimeo.com/' || vimeo_id 
WHERE vimeo_id IS NOT NULL 
  AND vimeo_id != '' 
  AND video_url IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_skills_academy_drills_video_url 
ON skills_academy_drills(video_url);
```

### Data Validation
- **Before Migration**: Count records with vimeo_id
- **After Migration**: Verify video_url population matches vimeo_id count
- **Quality Check**: Validate URL format consistency

### Frontend Updates Required
1. **TypeScript Interfaces**: Add video_url to drill interfaces
2. **Video Players**: Update to use video_url primarily
3. **Hooks**: Modify useSkillsAcademyWorkouts to prefer video_url
4. **Components**: Update DrillSequencePlayer, WallBallVideoPlayer

## Current Video URL Construction Pattern
Based on codebase analysis, the pattern is:
```typescript
// Current pattern in useSkillsAcademyWorkouts.ts
both_hands_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null
```

## Affected Files
### Database
- `supabase/migrations/` - New migration file
- `scripts/database/` - Update table creation scripts

### Frontend
- `src/hooks/useSkillsAcademyWorkouts.ts` - Primary data fetching
- `src/components/skills-academy/DrillSequencePlayer.tsx` - Video player
- `src/components/skills-academy/WallBallVideoPlayer.tsx` - Wall ball player
- `src/types/skills-academy.ts` - TypeScript interfaces

## Benefits
1. **Consistency**: Matches powlax_drills table pattern
2. **Performance**: Eliminates frontend URL construction
3. **Maintainability**: Centralized URL management
4. **Flexibility**: Easier to update video URLs if needed
5. **Debugging**: Clearer data inspection in database

## Risk Mitigation
1. **Backward Compatibility**: Keep vimeo_id column
2. **Gradual Rollout**: Update components incrementally
3. **Fallback Logic**: Use vimeo_id if video_url is null
4. **Data Validation**: Verify URL construction accuracy

## Success Criteria
- [ ] All skills_academy_drills records have video_url populated
- [ ] Frontend components use video_url instead of constructing URLs
- [ ] No breaking changes to existing functionality
- [ ] Performance improvement in video loading
- [ ] Consistent video URL patterns across all drill tables

## Next Steps
1. Create migration script
2. Test migration on development database
3. Update TypeScript interfaces
4. Update React components
5. Test video playback functionality
6. Deploy to production
