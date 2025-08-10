# Frontend Updates Plan - Skills Academy Video URL Migration

## Overview
Plan for updating React components to use the new `video_url` column in `skills_academy_drills` table instead of constructing URLs from `vimeo_id`.

## Files Requiring Updates

### 1. TypeScript Interfaces
**File**: `src/types/skills-academy.ts`
**Changes**: Add `video_url` field to drill interfaces

**Current Interface** (estimated):
```typescript
interface SkillsAcademyDrill {
  id: number;
  original_id: number;
  title: string;
  vimeo_id: string;          // Currently used for URL construction
  drill_category: string[];
  equipment_needed: string[];
  // ... other fields
}
```

**Updated Interface**:
```typescript
interface SkillsAcademyDrill {
  id: number;
  original_id: number;
  title: string;
  vimeo_id: string;          // Keep for backward compatibility
  video_url: string;         // NEW: Complete Vimeo URL
  drill_category: string[];
  equipment_needed: string[];
  // ... other fields
}
```

### 2. Primary Data Hook
**File**: `src/hooks/useSkillsAcademyWorkouts.ts`
**Current Lines**: 228-230
**Changes**: Update URL construction logic

**Current Code**:
```typescript
// Lines 228-230 - Manual URL construction
both_hands_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null,
strong_hand_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null,
off_hand_video_url: drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null
```

**Updated Code**:
```typescript
// Use video_url directly, fallback to constructed URL for backward compatibility
both_hands_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null),
strong_hand_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null),
off_hand_video_url: drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null)
```

### 3. Video Player Components

#### A. DrillSequencePlayer Component
**File**: `src/components/skills-academy/DrillSequencePlayer.tsx`
**Lines**: 112-127 (getVideoUrl function)
**Changes**: Update to use video_url field

**Current Code**:
```typescript
// Lines 119-126 - Uses constructed URLs from hook
switch (videoType) {
  case 'strong_hand':
    return drill.strong_hand_video_url;
  case 'off_hand':
    return drill.off_hand_video_url;
  case 'both_hands':
  default:
    return drill.both_hands_video_url || drill.strong_hand_video_url || drill.off_hand_video_url;
}
```

**Updated Code** (if drill structure changes):
```typescript
// Direct video_url usage with fallback
const baseVideoUrl = drill.video_url || (drill.vimeo_id ? `https://vimeo.com/${drill.vimeo_id}` : null);

switch (videoType) {
  case 'strong_hand':
    return drill.strong_hand_video_url || baseVideoUrl;
  case 'off_hand':
    return drill.off_hand_video_url || baseVideoUrl;
  case 'both_hands':
  default:
    return drill.both_hands_video_url || drill.strong_hand_video_url || drill.off_hand_video_url || baseVideoUrl;
}
```

#### B. WallBallVideoPlayer Component
**File**: `src/components/skills-academy/WallBallVideoPlayer.tsx`
**Lines**: 65-77 (vimeoEmbedUrl construction)
**Changes**: May need updates if wall ball drills use skills_academy_drills

#### C. Workout Page Component
**File**: `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`
**Lines**: 22-62 (extractVimeoId function)
**Changes**: Update to use video_url field

**Current Code**:
```typescript
// Lines 38-40 - Checks vimeo_id field
if (drill?.vimeo_id) {
  console.log('✅ Found vimeo_id:', drill.vimeo_id)
  return drill.vimeo_id;
}
```

**Updated Code**:
```typescript
// Check video_url first, then fallback to vimeo_id
if (drill?.video_url) {
  const vimeoId = drill.video_url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeoId) {
    console.log('✅ Found video_url:', drill.video_url, 'extracted ID:', vimeoId);
    return vimeoId;
  }
}
if (drill?.vimeo_id) {
  console.log('✅ Found vimeo_id (fallback):', drill.vimeo_id);
  return drill.vimeo_id;
}
```

### 4. Database Query Updates

#### A. Supabase Queries
**Files**: Various components and hooks
**Changes**: Include `video_url` in SELECT statements

**Current Pattern**:
```typescript
const { data: drills } = await supabase
  .from('skills_academy_drills')
  .select('id, title, vimeo_id, drill_category, ...')
```

**Updated Pattern**:
```typescript
const { data: drills } = await supabase
  .from('skills_academy_drills')
  .select('id, title, vimeo_id, video_url, drill_category, ...')
```

## Implementation Strategy

### Phase 1: Database Migration (Safe)
1. Run migration script to add `video_url` column
2. Populate column with constructed URLs
3. Verify data integrity

### Phase 2: TypeScript Updates (Non-breaking)
1. Update interfaces to include optional `video_url` field
2. Maintain backward compatibility

### Phase 3: Component Updates (Gradual)
1. Update hooks to fetch `video_url` field
2. Update components to prefer `video_url` over constructed URLs
3. Maintain fallback logic for safety

### Phase 4: Testing & Validation
1. Test video playback functionality
2. Verify URL construction accuracy
3. Performance testing with new index

## Backward Compatibility Strategy

### Fallback Logic Pattern
```typescript
// Always prefer video_url, fallback to constructed URL
const getVideoUrl = (drill: SkillsAcademyDrill): string | null => {
  // Primary: Use stored video_url
  if (drill.video_url) {
    return drill.video_url;
  }
  
  // Fallback: Construct from vimeo_id
  if (drill.vimeo_id) {
    return `https://vimeo.com/${drill.vimeo_id}`;
  }
  
  // No video available
  return null;
};
```

### Database Query Compatibility
```typescript
// Include both fields in queries during transition
.select(`
  id,
  title,
  vimeo_id,
  video_url,
  drill_category,
  equipment_needed,
  ...
`)
```

## Testing Requirements

### Unit Tests
- [ ] Test video URL fallback logic
- [ ] Test URL construction validation
- [ ] Test interface compatibility

### Integration Tests
- [ ] Test skills academy workout flow
- [ ] Test video player functionality
- [ ] Test drill sequence playback

### E2E Tests
- [ ] Complete skills academy workout session
- [ ] Video playback across different drills
- [ ] Performance with large workout sequences

## Performance Considerations

### Database Performance
- New index on `video_url` column improves query performance
- Eliminates frontend URL construction overhead
- Consistent with other drill tables

### Frontend Performance
- Reduces JavaScript processing for URL construction
- Cleaner data flow from database to UI
- Better caching potential for video URLs

## Risk Assessment

### Low Risk Changes
- Adding `video_url` column (non-breaking)
- Populating column with constructed URLs
- Adding database index

### Medium Risk Changes
- Updating TypeScript interfaces
- Modifying data fetching hooks
- Updating video player components

### Mitigation Strategies
- Maintain `vimeo_id` column unchanged
- Implement fallback logic in all components
- Gradual rollout with feature flags if needed
- Comprehensive testing before deployment

## Deployment Checklist

### Pre-Deployment
- [ ] Run migration on staging database
- [ ] Verify data population accuracy
- [ ] Test frontend components with new data
- [ ] Run full test suite
- [ ] Performance testing

### Deployment
- [ ] Run migration on production database
- [ ] Deploy frontend updates
- [ ] Monitor video playback functionality
- [ ] Monitor database performance

### Post-Deployment
- [ ] Verify all videos load correctly
- [ ] Check error logs for URL issues
- [ ] Monitor performance metrics
- [ ] User acceptance testing

## Success Metrics
- [ ] 100% of records with vimeo_id have video_url populated
- [ ] No broken video links in skills academy
- [ ] Improved page load performance
- [ ] Consistent video URL patterns across all drill tables
- [ ] Zero downtime during migration
