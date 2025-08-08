# 📚 Sub-Agent Specific Instructions for Skills Academy
## Detailed Task Breakdown by Agent Role

*Contract: skills-academy-complete-002*  
*Created: 2025-08-08*  
*Purpose: Specific instructions for each sub-agent type*

---

## 🏗️ POWLAX Backend Architect Instructions

### Your Primary Mission:
Fix the data layer issues preventing Skills Academy from showing real drill information and persisting user progress.

### Phase 1 Tasks (You Own This):

#### Task 1: Fix Drill Data Connection
**File:** `src/hooks/useSkillsAcademyWorkouts.ts`

**Current Problem:**
```typescript
// THIS IS BROKEN - Returns no drill details
const { data: drills } = await supabase
  .from('skills_academy_workout_drills')
  .select('*')
  .eq('workout_id', workoutId)
```

**Required Fix:**
```typescript
// IMPLEMENT THIS EXACT QUERY
const { data: drills } = await supabase
  .from('skills_academy_workout_drills')
  .select(`
    id,
    workout_id,
    drill_id,
    sequence_order,
    drill_duration_seconds,
    rest_duration_seconds,
    workout_specific_instructions,
    repetitions,
    video_type,
    is_optional,
    drill:skills_academy_drill_library!inner(
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
      difficulty_level,
      default_duration_seconds,
      default_reps,
      equipment_needed,
      coaching_points
    )
  `)
  .eq('workout_id', workoutId)
  .order('sequence_order', { ascending: true })
```

**Validation:**
```sql
-- Run this query in Supabase to verify data exists
SELECT COUNT(*) FROM skills_academy_drill_library;
-- Should return 167 drills

SELECT * FROM skills_academy_workout_drills 
WHERE workout_id = 1 
ORDER BY sequence_order 
LIMIT 5;
-- Should return 5 drills for mini workout
```

#### Task 2: Create Progress Persistence API

**Create New File:** `src/app/api/workouts/progress/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { 
      userId, 
      workoutId, 
      drillId, 
      action, // 'start', 'complete', 'skip'
      sessionId 
    } = body

    // Get or create session
    let session = sessionId
    if (!session) {
      session = crypto.randomUUID()
    }

    // Save progress
    const { data: progress, error: progressError } = await supabase
      .from('skills_academy_user_progress')
      .insert({
        user_id: userId,
        workout_id: workoutId,
        drill_id: drillId,
        session_id: session,
        status: action === 'complete' ? 'completed' : 'in_progress',
        completed_at: action === 'complete' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (progressError) throw progressError

    // Update points if drill completed
    if (action === 'complete') {
      // Get current balance
      const { data: currentBalance } = await supabase
        .from('user_points_balance_powlax')
        .select('*')
        .eq('user_id', userId)
        .single()

      const newBalance = {
        user_id: userId,
        lax_credits: (currentBalance?.lax_credits || 0) + 10,
        attack_tokens: currentBalance?.attack_tokens || 0,
        defense_dollars: currentBalance?.defense_dollars || 0,
        midfield_medals: currentBalance?.midfield_medals || 0,
        rebound_rewards: currentBalance?.rebound_rewards || 0,
        flex_points: currentBalance?.flex_points || 0,
        last_updated: new Date().toISOString()
      }

      const { data: points, error: pointsError } = await supabase
        .from('user_points_balance_powlax')
        .upsert(newBalance)
        .select()
        .single()

      if (pointsError) throw pointsError

      return NextResponse.json({ 
        success: true, 
        progress, 
        points,
        session 
      })
    }

    return NextResponse.json({ 
      success: true, 
      progress,
      session 
    })

  } catch (error) {
    console.error('Progress save error:', error)
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const workoutId = searchParams.get('workoutId')

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('skills_academy_user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ progress: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
```

#### Task 3: Database Schema Verification

**Run these checks:**

```sql
-- Verify all required tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'skills_academy_drill_library',
  'skills_academy_workout_drills',
  'skills_academy_user_progress',
  'user_points_balance_powlax'
);

-- Check data relationships
SELECT 
  w.workout_name,
  COUNT(wd.id) as drill_count
FROM skills_academy_workouts w
LEFT JOIN skills_academy_workout_drills wd ON w.id = wd.workout_id
GROUP BY w.id, w.workout_name
ORDER BY w.id
LIMIT 10;
```

### Quality Checks Before Returning:
```bash
# 1. TypeScript compiles
npm run typecheck

# 2. Build passes
npm run build

# 3. Test the API endpoint
curl -X POST http://localhost:3000/api/workouts/progress \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","workoutId":1,"drillId":1,"action":"complete"}'
```

---

## 🎨 POWLAX Frontend Developer Instructions

### Your Primary Mission:
Fix the UI issues (especially modal styling) and create smooth navigation flow through the Skills Academy.

### Phase 1 Task: Fix Modal Styling

**File:** `src/components/skills-academy/WorkoutSizeSelector.tsx`

**THE PROBLEM:** Modal has dark background - user wants WHITE background with DARK text

**Required Changes:**

```typescript
// REPLACE the return statement with this structure:
return (
  <>
    {/* Overlay */}
    <div 
      className="fixed inset-0 z-40 bg-black/50" 
      onClick={onBack}
      aria-hidden="true"
    />
    
    {/* Modal Container - WHITE BACKGROUND IS CRITICAL */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto 
                      bg-white rounded-lg shadow-xl"> {/* WHITE BACKGROUND */}
        
        {/* Modal Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-900">
                  {seriesCode}
                </Badge>
                <h2 className="text-2xl font-bold text-gray-900"> {/* DARK TEXT */}
                  {seriesName}
                </h2>
              </div>
              <p className="text-gray-600">Choose your workout intensity</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Workout Options Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {workoutOptions.map((option) => (
              <Card key={option.size} className="bg-white border-gray-200">
                {/* Card content with text-gray-900 for titles */}
                {/* and text-gray-600 for descriptions */}
              </Card>
            ))}
          </div>

          {/* Info Box - Light background */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <div className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                How to Choose
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• <strong>Mini:</strong> Great for beginners</li>
                <li>• <strong>More:</strong> Standard practice</li>
                <li>• <strong>Complete:</strong> Full training</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </>
)
```

### Phase 2 Tasks: Workflow Integration

#### Task 1: Update Navigation Flow

**File:** `src/components/skills-academy/SkillsAcademyHub.tsx`

```typescript
// Update the workout selection handler
const handleSelectWorkout = async (workout: SkillsAcademyWorkoutNew) => {
  // Close modal first
  setSelectedSeries(null);
  
  // Show loading state
  setNavigating(true);
  
  // Navigate to workout runner with workout ID
  router.push(`/skills-academy/workout/${workout.id}`);
};

// Add completed workout handler
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('completed') === 'true') {
    // Show success message
    toast.success('Great job! Workout completed! 🎉', {
      duration: 5000,
      position: 'top-center',
    });
    
    // Clear the param
    router.replace('/skills-academy');
  }
}, []);
```

#### Task 2: Add Loading States

**Create Component:** `src/components/skills-academy/SkeletonLoader.tsx`

```typescript
export function WorkoutSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48"></div>
          <div className="mt-2 bg-gray-200 h-4 w-3/4 rounded"></div>
          <div className="mt-1 bg-gray-200 h-3 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  );
}
```

### Phase 3 Tasks: Polish & Animations

#### Task 1: Points Animation Component

**Create:** `src/components/skills-academy/PointsAnimation.tsx`

```typescript
import { motion, AnimatePresence } from 'framer-motion';

export function PointsAnimation({ points, show }: { points: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: 1, y: -20 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-green-500 text-white px-8 py-4 rounded-full text-3xl font-bold shadow-lg">
            +{points} Points!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Mobile Optimization Checklist:
```css
/* Add to globals.css */
.workout-button {
  min-height: 60px; /* Large touch target */
  @apply text-lg font-semibold;
}

@media (max-width: 375px) {
  .modal-container {
    @apply px-2; /* Reduce padding on small screens */
  }
  
  .drill-card {
    @apply text-base; /* Larger text for readability */
  }
}
```

---

## 🔬 POWLAX UX Researcher Instructions

### Your Primary Mission:
Validate the user experience, especially for mobile field use, and ensure accessibility standards.

### Phase 3 Tasks:

#### Task 1: Mobile Field Testing Protocol

**Test Scenarios:**

```markdown
## Mobile Testing Checklist

### Device Setup:
- iPhone 12/13 (375px width)
- Brightness: 100%
- Test outdoors if possible
- One-handed operation

### User Flow Tests:
1. **Series Selection**
   - Can tap series cards easily with thumb?
   - Touch target size >= 60px?
   - No accidental taps?

2. **Modal Interaction**
   - Modal readable in sunlight?
   - Can dismiss with swipe or X button?
   - Scroll works smoothly?

3. **Workout Execution**
   - Video loads within 3 seconds?
   - "Mark Complete" button easy to hit?
   - Progress visible at all times?
   - Can navigate with swipes?

4. **Completion**
   - Points clearly visible?
   - Can share or restart easily?
   - Return to hub smooth?

### Measurements:
- Time to complete 5-drill workout: _____ minutes
- Number of mis-taps: _____
- Loading delays > 3 seconds: _____
- Readability issues: _____
```

#### Task 2: Accessibility Audit

**Run These Tests:**

```javascript
// Automated accessibility testing
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Skills Academy Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/skills-academy');
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    });
  });
  
  test('modal should be keyboard navigable', async ({ page }) => {
    await page.goto('/skills-academy');
    
    // Tab to first series card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify modal opens
    await expect(page.locator('.modal-content')).toBeVisible();
    
    // Tab through modal options
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Escape closes modal
    await page.keyboard.press('Escape');
    await expect(page.locator('.modal-content')).not.toBeVisible();
  });
});
```

#### Task 3: Performance Analysis

**Lighthouse Configuration:**

```javascript
// lighthouse.config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
    },
  },
  categories: {
    performance: {
      auditRefs: [
        { id: 'first-contentful-paint', weight: 3 },
        { id: 'speed-index', weight: 3 },
        { id: 'largest-contentful-paint', weight: 3 },
        { id: 'cumulative-layout-shift', weight: 1 },
      ],
    },
  },
  audits: [
    { path: 'metrics/first-contentful-paint' },
    { path: 'metrics/speed-index' },
    { path: 'metrics/largest-contentful-paint' },
    { path: 'metrics/cumulative-layout-shift' },
  ],
};
```

### Validation Report Template:

```markdown
## Skills Academy UX Validation Report

### Mobile Usability: [PASS/FAIL]
- Touch targets: All >= 60px ✅
- One-handed operation: Possible ✅
- Outdoor visibility: Good contrast ✅
- Swipe navigation: Smooth ✅

### Accessibility: [PASS/FAIL]
- WCAG AA compliance: Pass ✅
- Keyboard navigation: Full support ✅
- Screen reader: Compatible ✅
- Focus management: Proper ✅

### Performance: [PASS/FAIL]
- Lighthouse Mobile: 92/100 ✅
- First Contentful Paint: 1.2s ✅
- Largest Contentful Paint: 2.1s ✅
- Cumulative Layout Shift: 0.05 ✅

### Recommendations:
1. [Any UX improvements needed]
2. [Performance optimizations]
3. [Accessibility enhancements]

### Sign-off:
Ready for production: YES/NO
```

---

## 📋 Common Issues & Solutions

### Issue: Drills showing as undefined
**Solution:** Check the join in the Supabase query - use `!inner` to ensure drill exists

### Issue: Modal not closing after selection
**Solution:** Call `onClose()` before navigation in the selection handler

### Issue: Points not updating
**Solution:** Check RLS policies on `user_points_balance_powlax` table

### Issue: Video not playing
**Solution:** Verify Vimeo ID extraction and iframe permissions

### Issue: Mobile buttons too small
**Solution:** Add `min-h-[60px]` class to all interactive elements

---

## ✅ Definition of Done

Each agent must verify:

1. **Backend Architect:**
   - [ ] Real drill names display
   - [ ] Data persists to database
   - [ ] API endpoints return 200
   - [ ] No database errors

2. **Frontend Developer:**
   - [ ] Modal has white background
   - [ ] Navigation flow smooth
   - [ ] Loading states present
   - [ ] Mobile responsive

3. **UX Researcher:**
   - [ ] Mobile usability verified
   - [ ] Accessibility compliant
   - [ ] Performance targets met
   - [ ] User flow validated

---

**Remember:** The user's top priority is seeing REAL DRILL NAMES and having a WHITE MODAL BACKGROUND. Everything else is secondary.