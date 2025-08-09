# Skills Academy Implementation Contract
**Contract ID:** SA-FIX-2025-001  
**Date:** 2025-08-09  
**Ultra Think Duration:** 8 minutes  
**Estimated Execution Time:** 6-8 hours  
**Execution Strategy:** SEQUENTIAL (Parallel execution PROHIBITED)

---

## SECTION 1: ULTRA THINK ANALYSIS RESULTS

### 1.1 Critical Discovery Summary

#### 🔴 CRITICAL FINDING: Zero Video Data
**The most critical issue discovered: NO drills have video data populated**
- Database has `vimeo_id` field (not `video_url` or `video_link`)
- 0 of 167 drills have vimeo_id populated
- This means even if we fix all technical issues, no videos will display

#### 🟡 Vendor Chunk Status
- ✅ `@radix-ui.js` chunk exists
- ✅ `@supabase.js` chunk exists  
- ❌ `framer-motion.js` chunk MISSING (causing cascading failures)

#### 🟠 Framer-Motion Contamination
- 12 files still contain framer-motion references
- Package.json likely still lists framer-motion as dependency
- Commented imports still triggering webpack resolution attempts

#### 🟢 Working Elements
- Workout-drill connections via `drill_ids` arrays confirmed working
- 118 workouts properly configured with drill arrays
- Database schema stable and accessible

### 1.2 Database Schema Analysis

```typescript
// Actual skills_academy_drills table structure:
{
  id: number,
  original_id: number,
  title: string,              // ← Note: "title" not "name" or "drill_name"
  vimeo_id: string,           // ← Video field exists but EMPTY
  drill_category: object,
  equipment_needed: object,
  age_progressions: object,
  space_needed: string,
  complexity: string,
  sets_and_reps: string,
  duration_minutes: number,
  point_values: object,
  tags: object,
  created_at: string,
  updated_at: string
}
```

### 1.3 File Dependency Map

#### Clean Files (No Framer-Motion)
- ✅ `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`
- ✅ `src/hooks/useSkillsAcademyWorkouts.ts`
- ✅ `src/components/skills-academy/SkillsAcademyHubEnhanced.tsx`

#### Contaminated Files (Framer-Motion Present)
1. `src/app/(authenticated)/layout.tsx` - Commented imports
2. `src/app/(authenticated)/test-gamification/page.tsx`
3. `src/app/(authenticated)/gamification-demo/page.tsx`
4. `src/components/skills-academy/WorkoutCompletionAnimation.tsx`
5. `src/components/skills-academy/PointsAnimation.tsx`
6. `src/components/skills-academy/StreakTracker.tsx`
7. `src/components/practice-planner/PracticeTemplateSelector.tsx`
8. `src/components/onboarding/TourOverlay.tsx`
9. `src/components/common/OfflineIndicator.tsx`
10. `src/components/onboarding/WelcomeModal.tsx`
11. `src/components/common/FloatingActionButton.tsx`
12. `src/components/search/GlobalSearch.tsx`

### 1.4 Risk Assessment Matrix

| Risk Level | Issue | Impact | Mitigation Required |
|------------|-------|--------|-------------------|
| 🔴 CRITICAL | No video data in database | Videos cannot display | Populate vimeo_id fields |
| 🔴 CRITICAL | Missing framer-motion vendor chunk | Intermittent 404s | Complete removal |
| 🟠 HIGH | 12 files with framer imports | Build instability | Clean all files |
| 🟡 MEDIUM | Schema mismatch in code | Component errors | Update field references |
| 🟢 LOW | Commented imports | Webpack confusion | Remove comments |

### 1.5 Collision Analysis

#### File Collision Risk: NONE (Sequential Execution)
Since parallel execution is PROHIBITED due to vendor chunk cascading failures, no file collisions possible.

#### Import Chain Dependencies
```
layout.tsx → FloatingActionButton → framer-motion
         ↳→ TourOverlay → framer-motion
         ↳→ OfflineIndicator → framer-motion

workout/[id]/page.tsx → useWorkoutSession → supabase
                     ↳→ WorkoutErrorBoundary → (clean)
                     ↳→ CelebrationAnimation → framer-motion
```

### 1.6 Common Error Patterns Identified

1. **Webpack Module Resolution Failure**
   - Pattern: `Cannot find module './vendor-chunks/framer-motion.js'`
   - Cause: Partial removal leaving import statements
   - Fix: Complete removal of all references

2. **Database Field Mismatch**
   - Pattern: `column skills_academy_drills.drill_name does not exist`
   - Cause: Using wrong field names (drill_name vs title)
   - Fix: Update to correct schema

3. **Hydration Errors**
   - Pattern: Client/server mismatch on dynamic routes
   - Cause: Missing 'use client' directives
   - Fix: Ensure proper client component marking

---

## SECTION 2: EXECUTION STRATEGY

### 2.1 Execution Mode Decision

**Mode: SEQUENTIAL ONLY**

Rationale for prohibiting parallel execution:
1. Vendor chunk errors cascade unpredictably
2. Framer-motion removal affects 12 interconnected files
3. Database schema fixes must complete before component updates
4. Build system requires clean state between phases

### 2.2 Implementation Phases

#### Phase 1: Emergency Stabilization (2 hours)
**Objective:** Stop the bleeding - get pages loading consistently

Tasks:
1. Complete framer-motion removal from all 12 files
2. Remove framer-motion from package.json
3. Clear all build caches
4. Verify vendor chunks regenerate

#### Phase 2: Database Video Population (1 hour)
**Objective:** Add video data so videos can actually display

Tasks:
1. Create video data migration script
2. Populate vimeo_id fields with test data
3. Verify data accessible via API

#### Phase 3: Component Field Correction (1 hour)
**Objective:** Fix schema mismatches in components

Tasks:
1. Update workout page to use 'title' not 'drill_name'
2. Update to check 'vimeo_id' not 'video_url'
3. Add fallback UI for missing videos

#### Phase 4: Testing & Validation (2 hours)
**Objective:** Ensure everything works end-to-end

Tasks:
1. Run Playwright video verification
2. Manual testing of workout flow
3. Performance verification

---

## SECTION 3: IMPLEMENTATION CHECKLIST

### 3.1 Pre-Flight Checklist
- [ ] Dev server killed
- [ ] All node_modules/.cache cleared
- [ ] .next directory removed
- [ ] Git branch created for fixes
- [ ] Backup of current state saved

### 3.2 Phase 1 Tasks
- [ ] Remove framer-motion from package.json
- [ ] Run npm uninstall framer-motion
- [ ] Clean all 12 contaminated files
- [ ] Remove commented imports
- [ ] Delete node_modules and reinstall
- [ ] Verify clean npm install
- [ ] Start dev server and check for errors

### 3.3 Phase 2 Tasks
- [ ] Create vimeo data population script
- [ ] Add sample vimeo IDs to drills
- [ ] Verify data in database
- [ ] Test API endpoints return video data

### 3.4 Phase 3 Tasks
- [ ] Update extractVimeoId function
- [ ] Fix field references (title vs drill_name)
- [ ] Add video fallback UI
- [ ] Update drill display components

### 3.5 Phase 4 Tasks
- [ ] Run video verification test
- [ ] Run full Skills Academy test suite
- [ ] Manual workflow testing
- [ ] Screenshot documentation
- [ ] Performance metrics collection

---

## SECTION 4: SUCCESS CRITERIA

### 4.1 Mandatory Success Metrics
1. **Zero 404 Errors** - All pages load consistently
2. **Video Display** - At least 1 video displays in workout
3. **No Vendor Chunk Errors** - Clean webpack compilation
4. **Playwright Pass** - All Skills Academy tests pass

### 4.2 Performance Targets
- Page load: < 2 seconds
- Video load: < 3 seconds
- No webpack warnings
- Zero console errors

### 4.3 Validation Tests
```bash
# Test 1: Page loads without errors
curl -s http://localhost:3000/skills-academy/workout/1 | grep -q "404" && echo "FAIL" || echo "PASS"

# Test 2: Video iframe present
npx playwright test tests/e2e/skills-academy-video-test.spec.ts

# Test 3: No webpack errors
npm run build 2>&1 | grep -q "ERROR" && echo "FAIL" || echo "PASS"
```

---

## SECTION 5: ROLLBACK PLAN

### 5.1 Rollback Triggers
- Build completely broken after Phase 1
- Database corruption during video population
- Performance degradation > 50%

### 5.2 Rollback Procedure
```bash
# Immediate rollback
git stash
git checkout main
rm -rf node_modules .next
npm install
npm run dev
```

### 5.3 Partial Rollback Options
- Revert only framer-motion changes
- Keep database changes, revert component changes
- Use feature flags to disable broken features

---

## SECTION 6: CONTRACT AGREEMENT

### 6.1 Execution Authorization
By proceeding with this implementation:
- I acknowledge SEQUENTIAL execution is mandatory
- I understand the critical issue is missing video data
- I commit to following the phases in order
- I will document any deviations immediately

### 6.2 Time Estimates
- Phase 1: 2 hours
- Phase 2: 1 hour
- Phase 3: 1 hour
- Phase 4: 2 hours
- **Total: 6 hours**

Buffer time: +2 hours for unexpected issues

### 6.3 Communication Protocol
- Update after each phase completion
- Immediate escalation if blocked > 30 minutes
- Screenshot evidence of success metrics
- Final handoff document upon completion

---

## SECTION 7: APPENDICES

### Appendix A: Files Requiring Framer-Motion Removal
```
1. src/app/(authenticated)/layout.tsx
2. src/app/(authenticated)/test-gamification/page.tsx
3. src/app/(authenticated)/gamification-demo/page.tsx
4. src/components/skills-academy/WorkoutCompletionAnimation.tsx
5. src/components/skills-academy/PointsAnimation.tsx
6. src/components/skills-academy/StreakTracker.tsx
7. src/components/practice-planner/PracticeTemplateSelector.tsx
8. src/components/onboarding/TourOverlay.tsx
9. src/components/common/OfflineIndicator.tsx
10. src/components/onboarding/WelcomeModal.tsx
11. src/components/common/FloatingActionButton.tsx
12. src/components/search/GlobalSearch.tsx
```

### Appendix B: Database Video Population Script
```typescript
// Script to add sample vimeo IDs
const sampleVimeoIds = [
  '123456789', // Replace with real IDs
  '987654321',
  '456789123'
];

// Update drills with video data
for (let i = 1; i <= 167; i++) {
  const vimeoId = sampleVimeoIds[i % sampleVimeoIds.length];
  await supabase
    .from('skills_academy_drills')
    .update({ vimeo_id: vimeoId })
    .eq('id', i);
}
```

### Appendix C: Critical Code Corrections
```typescript
// WRONG - current code
const drillName = drill.drill_name;
const videoUrl = drill.video_url;

// CORRECT - should be
const drillName = drill.title;
const vimeoId = drill.vimeo_id;
```

---

**CONTRACT SIGN-OFF**

Ultra Think Analysis Complete: ✅  
Risk Assessment Complete: ✅  
Execution Strategy Defined: ✅  
Success Criteria Established: ✅  

**Ready for Implementation: YES**

---

*Document Version: 1.0*  
*Last Updated: 2025-08-09 18:00 UTC*  
*Author: Claude (Opus 4.1)*  
*Session: Ultra Think Contract Generation*