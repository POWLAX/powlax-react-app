# Skills Academy Critical Fixes - Handoff Document

**Date:** 2025-08-09  
**Status:** 🔴 Critical Issues Requiring Resolution  
**Branch:** Claude-to-Claude-Sub-Agent-Work-Flow

## 🚨 Executive Summary

The Skills Academy feature has multiple critical issues preventing drill videos from loading and causing intermittent 404 errors. These issues stem from webpack vendor chunk errors after framer-motion removal and potential database schema mismatches.

## 📋 Current State Assessment

### What's Working ✅
- Skills Academy main page loads (HTTP 200)
- Workout pages intermittently load (HTTP 200)
- Database contains 118 workouts with drill_ids arrays
- Database contains 167 drills in skills_academy_drills table

### What's Broken ❌
1. **No Video Playback** - Vimeo iframes not rendering (0 videos found in tests)
2. **Webpack Vendor Chunk Errors** - Missing modules causing 404s:
   - `./vendor-chunks/@radix-ui.js`
   - `./vendor-chunks/@supabase.js`
   - `./vendor-chunks/framer-motion.js`
3. **Intermittent Page Failures** - Pages alternate between 200 and 404 status
4. **Navigation Controls Missing** - "Did It" and "Next" buttons not appearing

## 🔍 Root Cause Analysis

### 1. Framer Motion Removal Cascade
When Cursor removed framer-motion elements, it created a dependency cascade:
- Components were commented out but dependencies remain
- Webpack can't resolve vendor chunks
- Pages fail to generate static paths
- Client-side hydration fails

### 2. Database Schema Mismatch
The drill video verification script revealed:
- Column name mismatch: Expected `drill_name` but actual column may be different
- Video URLs may be stored in different field than expected
- Drill-to-workout connections via `drill_ids` array confirmed working

### 3. Component Import Issues
Multiple components have unresolved imports after framer-motion removal:
- Practice Planner components
- Skills Academy workout components
- Layout components

## 🛠️ Solution Plan

### Phase 1: Stabilize Build (Priority: CRITICAL)

#### Step 1.1: Clean Dependency Resolution
```bash
# Complete removal of framer-motion traces
npm uninstall framer-motion
rm -rf node_modules package-lock.json
npm install
```

#### Step 1.2: Fix Vendor Chunk Errors
```typescript
// Create a webpack config override in next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    // Ignore framer-motion imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': false,
    }
    return config
  },
  // Disable static generation for problematic pages temporarily
  experimental: {
    isrMemoryCacheSize: 0
  }
}
```

#### Step 1.3: Remove All Framer Motion References
Files to clean:
- `/src/app/(authenticated)/layout.tsx` - Already commented, needs permanent solution
- `/src/components/practice-planner/DrillCard.tsx` - Check for any remaining motion imports
- Any other components with motion animations

### Phase 2: Fix Video Display (Priority: HIGH)

#### Step 2.1: Verify Database Schema
```sql
-- Check actual column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills_academy_drills';

-- Verify video data exists
SELECT id, name, video_url, vimeo_id 
FROM skills_academy_drills 
WHERE video_url IS NOT NULL 
LIMIT 5;
```

#### Step 2.2: Fix Video Component
```typescript
// In workout/[id]/page.tsx
function extractVimeoId(drill: any): string | null {
  // Check multiple possible field names
  const videoUrl = drill.video_url || drill.video_link || drill.vimeo_url;
  const vimeoId = drill.vimeo_id || drill.video_id;
  
  if (vimeoId) return vimeoId;
  if (!videoUrl) return null;
  
  // Extract from URL patterns
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /^(\d+)$/
  ];
  
  for (const pattern of patterns) {
    const match = videoUrl.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}
```

#### Step 2.3: Implement Fallback UI
```typescript
// Add fallback when no video available
{vimeoId ? (
  <iframe
    src={`https://player.vimeo.com/video/${vimeoId}`}
    className="w-full h-full"
    allow="autoplay; fullscreen"
  />
) : (
  <div className="flex items-center justify-center h-full bg-gray-100">
    <div className="text-center">
      <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-600">Video coming soon</p>
      <p className="text-sm text-gray-500 mt-2">{currentDrill?.name}</p>
    </div>
  </div>
)}
```

### Phase 3: Implement Permanent Fix (Priority: MEDIUM)

#### Step 3.1: Create Clean Component Versions
Replace motion-dependent components with static versions:
- `FloatingActionButton` → `StaticActionButton`
- `TourOverlay` → Remove or create CSS-only version
- `OfflineIndicator` → Simple div with conditional rendering

#### Step 3.2: Add Comprehensive Error Boundaries
```typescript
// components/skills-academy/WorkoutErrorBoundary.tsx
class WorkoutErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workout page error:', error);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <WorkoutFallbackUI />;
    }
    return this.props.children;
  }
}
```

#### Step 3.3: Implement Progressive Enhancement
```typescript
// Start with static content, enhance with interactivity
const [enhanced, setEnhanced] = useState(false);

useEffect(() => {
  // Only add interactive features after mount
  setEnhanced(true);
}, []);

return (
  <div>
    {/* Always visible static content */}
    <StaticWorkoutContent />
    
    {/* Progressive enhancements */}
    {enhanced && <InteractiveFeatures />}
  </div>
);
```

### Phase 4: Testing & Validation (Priority: HIGH)

#### Step 4.1: Create Video Verification Test
```typescript
// tests/e2e/skills-academy-video-fix.spec.ts
test('Drill videos should load', async ({ page }) => {
  await page.goto('/skills-academy/workout/1');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  // Check for video iframe
  const iframe = page.locator('iframe[src*="vimeo"]');
  await expect(iframe).toBeVisible({ timeout: 10000 });
  
  // Verify video ID is present
  const src = await iframe.getAttribute('src');
  expect(src).toMatch(/vimeo\.com\/video\/\d+/);
});
```

#### Step 4.2: Implement Health Check Endpoint
```typescript
// app/api/health/skills-academy/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabaseConnection(),
    drillsTable: await checkDrillsTable(),
    videosAvailable: await checkVideoAvailability(),
    workoutRouting: await checkWorkoutRoutes(),
  };
  
  return Response.json({
    status: Object.values(checks).every(c => c) ? 'healthy' : 'degraded',
    checks
  });
}
```

## 📊 Success Metrics

1. **Page Load Reliability**: 100% success rate (no 404s)
2. **Video Display**: >90% of drills show videos
3. **Performance**: <2s page load time
4. **Test Coverage**: All Playwright tests passing

## 🚀 Implementation Priority

### Immediate (Today)
1. Fix webpack vendor chunk errors
2. Remove all framer-motion references
3. Verify database schema

### Short-term (This Week)
1. Implement video display fixes
2. Add fallback UI for missing videos
3. Create comprehensive tests

### Long-term (Next Sprint)
1. Implement progressive enhancement
2. Add monitoring and alerting
3. Optimize performance

## 🔄 Rollback Plan

If issues persist after fixes:
1. Revert to last known working commit
2. Re-implement features incrementally
3. Use feature flags for gradual rollout

## 📝 Notes for Next Developer

### Critical Files to Review
- `/src/app/(authenticated)/skills-academy/workout/[id]/page.tsx` - Main workout page
- `/src/hooks/useSkillsAcademyWorkouts.ts` - Data fetching logic
- `/src/components/skills-academy/SkillsAcademyHubEnhanced.tsx` - Hub component

### Known Gotchas
1. Don't add `lazy` imports - breaks Practice Planner
2. Don't remove `'use client'` directives - causes hydration errors
3. Vendor chunk errors cascade - fix at root, not symptoms

### Testing Commands
```bash
# Quick health check
curl http://localhost:3000/skills-academy/workout/1

# Full test suite
npx playwright test tests/e2e/skills-academy

# Video verification only
npx playwright test tests/e2e/skills-academy-video-test.spec.ts
```

## 🤝 Handoff Status

**Ready for:** Senior developer to implement Phase 1 fixes  
**Blocked on:** Webpack configuration expertise  
**Time estimate:** 4-6 hours for complete resolution  

---

*Last updated: 2025-08-09 17:45 UTC*  
*Author: Claude (Opus 4.1)*  
*Session: Claude-to-Claude-Sub-Agent-Work-Flow*