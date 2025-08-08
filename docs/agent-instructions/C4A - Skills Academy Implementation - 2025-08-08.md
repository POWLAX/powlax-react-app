# C4A - Skills Academy Implementation Guide - 2025-08-08

## 🎯 Context
The Skills Academy has been partially built but requires significant improvements based on user feedback. The system needs real data connections, UI fixes, and proper gamification integration.

## 📋 Current Issues & Required Fixes

### **CRITICAL ISSUES (Must Fix First):**

1. **Drills Not Connected to Real Data**
   - Currently using placeholder drill IDs
   - Need to connect to `skills_academy_drill_library` table
   - Vimeo URLs not properly extracted from database
   
2. **Modal Styling Issues**
   - Currently has dark background (incorrect)
   - MUST have white background with dark text
   - Affects `WorkoutSizeSelector` and all modals
   
3. **Data Not Persisting**
   - Progress not saving to database
   - Points not updating user balance
   - Workout completions not tracked

### **HIGH PRIORITY:**

4. **Disconnected Workflow**
   - Workout runner isolated from main hub
   - No smooth navigation flow
   - Missing loading states
   
5. **Mobile Experience**
   - Touch targets too small
   - Not optimized for outdoor use
   - Missing swipe gestures

## 🏗️ Phased Implementation Approach

### **Phase 1: Data Foundation (4 hours)**
**Agent:** powlax-backend-architect

```yaml
Tasks:
  1. Fix Drill Data Connection:
     - Query skills_academy_workout_drills with proper joins
     - Extract Vimeo IDs from drill_library
     - Map correct drill names and metadata
     
  2. Fix Modal Styling:
     - Update WorkoutSizeSelector.tsx
     - White background (#FFFFFF)
     - Dark text (#1F2937)
     - Ensure contrast ratio > 7:1
     
  3. Implement Persistence:
     - Create saveWorkoutProgress function
     - Update user_points_balance_powlax
     - Record completions with timestamps
     
Validation:
  - SELECT test queries return real drill names
  - Modal screenshot shows white background
  - Points increment in database after completion
```

### **Phase 2: Workflow Integration (3 hours)**
**Agent:** powlax-frontend-developer

```yaml
Tasks:
  1. Connect Full Flow:
     - Series selection → Size modal → Workout → Completion
     - Use router.push for navigation
     - Pass workout ID through URL params
     
  2. Add Loading States:
     - Skeleton screens for data fetching
     - Error boundaries for failures
     - Retry mechanisms with exponential backoff
     
  3. Progress Indicators:
     - Real-time progress bar
     - Drill X of Y counter
     - Elapsed time display
     
Validation:
  - Can complete entire flow without page refresh
  - Loading states appear < 100ms
  - Progress updates smoothly
```

### **Phase 3: Gamification & Polish (2 hours)**
**Agent:** powlax-ux-researcher + powlax-frontend-developer

```yaml
Tasks:
  1. Points Animation:
     - Confetti on completion
     - Points counter animation
     - Bonus multiplier effects
     
  2. Streak System:
     - Calculate consecutive days
     - Display streak badges
     - Persist to database
     
  3. Mobile Optimization:
     - 60px minimum touch targets
     - High contrast for sunlight
     - Swipe navigation
     - Portrait lock
     
Validation:
  - Animations run at 60fps
  - Mobile usable with gloves
  - Lighthouse mobile score > 90
```

## 📝 Specific Code Changes Required

### 1. Fix Drill Data Query (Backend)

```typescript
// In: src/hooks/useSkillsAcademyWorkouts.ts

// CURRENT (BROKEN):
const { data: drills } = await supabase
  .from('skills_academy_workout_drills')
  .select('*')
  .eq('workout_id', workoutId)

// REQUIRED FIX:
const { data: drills } = await supabase
  .from('skills_academy_workout_drills')
  .select(`
    *,
    drill:skills_academy_drill_library(
      id,
      drill_name,
      drill_slug,
      strong_hand_video_url,
      strong_hand_vimeo_id,
      off_hand_video_url,
      off_hand_vimeo_id,
      both_hands_video_url,
      both_hands_vimeo_id,
      description,
      drill_category,
      default_duration_seconds,
      default_reps
    )
  `)
  .eq('workout_id', workoutId)
  .order('sequence_order')
```

### 2. Fix Modal Styling (Frontend)

```typescript
// In: src/components/skills-academy/WorkoutSizeSelector.tsx

// Add to modal wrapper:
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Background overlay */}
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  
  {/* Modal content - WHITE BACKGROUND */}
  <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    <div className="p-6">
      {/* Dark text throughout */}
      <h2 className="text-2xl font-bold text-gray-900">
        {seriesName}
      </h2>
      {/* Rest of content with text-gray-xxx classes */}
    </div>
  </div>
</div>
```

### 3. Implement Progress Saving (Backend)

```typescript
// Create new function in: src/app/api/workouts/progress/route.ts

export async function POST(request: Request) {
  const { userId, workoutId, drillId, completed } = await request.json()
  
  // Save progress
  const { data: progress } = await supabase
    .from('skills_academy_user_progress')
    .upsert({
      user_id: userId,
      workout_id: workoutId,
      drill_id: drillId,
      completed_at: completed ? new Date().toISOString() : null,
      status: completed ? 'completed' : 'in_progress'
    })
  
  // Update points if completed
  if (completed) {
    const { data: points } = await supabase
      .from('user_points_balance_powlax')
      .upsert({
        user_id: userId,
        lax_credits: { increment: 10 },
        last_updated: new Date().toISOString()
      })
  }
  
  return Response.json({ progress, points })
}
```

## 🧪 Testing Requirements

### E2E Test Coverage

```typescript
// tests/e2e/skills-academy-complete.spec.ts

test.describe('Skills Academy Complete Flow', () => {
  test('should complete full workout with real drills', async ({ page }) => {
    // 1. Navigate to Skills Academy
    await page.goto('/skills-academy')
    
    // 2. Select a series (e.g., SS1)
    await page.click('[data-series-code="SS1"]')
    
    // 3. Verify modal has WHITE background
    const modal = page.locator('.modal-content')
    await expect(modal).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    
    // 4. Select Mini workout
    await page.click('[data-workout-size="mini"]')
    
    // 5. Verify real drill names appear
    await expect(page.locator('.drill-name').first()).not.toContainText('Drill 1')
    await expect(page.locator('.drill-name').first()).toContainText(/\w+/)
    
    // 6. Complete first drill
    await page.click('[data-test="mark-complete"]')
    
    // 7. Verify points update
    await expect(page.locator('.points-display')).toContainText('10')
    
    // 8. Complete workout
    // ... continue through all drills
    
    // 9. Verify completion screen
    await expect(page.locator('.completion-modal')).toBeVisible()
    
    // 10. Verify data persisted (check database)
  })
})
```

### Mobile Testing

```typescript
test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 812 } })
  
  test('should work on mobile with large touch targets', async ({ page }) => {
    await page.goto('/skills-academy')
    
    // Verify touch targets are 60px+
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox()
      expect(box.height).toBeGreaterThanOrEqual(60)
    }
  })
})
```

## 🚨 Quality Gates

### Before ANY Deployment:

```bash
# 1. Lint with zero warnings
npm run lint -- --max-warnings=0

# 2. TypeScript check
npm run typecheck

# 3. Build verification
npm run build

# 4. Run Skills Academy tests
npx playwright test skills-academy

# 5. Mobile viewport test
npx playwright test --project="Mobile Chrome" skills-academy
```

### Performance Benchmarks:

- Page Load: < 2 seconds
- Video Start: < 3 seconds
- Animation FPS: 60
- Lighthouse Mobile: > 90
- Bundle Size: < 500kb

## 📊 Success Metrics

### User-Facing Success:
1. ✅ Can see real drill names (not "Drill 1, 2, 3")
2. ✅ Videos play immediately when drill loads
3. ✅ Points accumulate and persist
4. ✅ Can resume incomplete workouts
5. ✅ Mobile experience is smooth outdoors

### Technical Success:
1. ✅ Zero console errors
2. ✅ All data persists to database
3. ✅ Build passes all checks
4. ✅ Test coverage > 80%
5. ✅ Response time < 200ms for all API calls

## 🔄 Iteration Protocol

If issues arise during implementation:

1. **First Iteration:** Fix identified issues only
2. **Second Iteration:** Add missing test coverage
3. **Third Iteration:** Performance optimization
4. **Escalation:** If still failing, return to Master Controller

## 📝 Documentation Updates

After completion, update:
1. `/docs/SKILLS_ACADEMY_REFERENCE.md` - Technical details
2. `/README.md` - Add Skills Academy to feature list
3. `/CHANGELOG.md` - Document all changes
4. `/tests/README.md` - Document new test coverage

---

## Agent Activation Protocol

When Master Controller assigns Skills Academy tasks:

1. Read this C4A document completely
2. Reference contract: `skills-academy-complete-002.yaml`
3. Execute assigned phase only
4. Run quality gates before returning
5. Report structured results to Master Controller

**Remember:** User's primary concerns are:
- Real drill data (not placeholders)
- White modal backgrounds (not dark)
- Smooth mobile experience for field use