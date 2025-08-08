# 🚀 Skills Academy - Immediate Action Plan
## What Needs to Be Done RIGHT NOW

*Created: 2025-08-08*  
*Priority: CRITICAL*  
*Time to Complete: 9 hours*

---

## 🔴 TOP 3 CRITICAL FIXES (Do These First!)

### 1. **Fix Drill Names (Currently shows "Drill 1, 2, 3")**
**File:** `src/hooks/useSkillsAcademyWorkouts.ts`  
**Line:** ~46-53  
**Fix:** Add proper join to `skills_academy_drill_library` table

### 2. **Fix Modal Background (Currently dark, needs white)**
**File:** `src/components/skills-academy/WorkoutSizeSelector.tsx`  
**Line:** Return statement  
**Fix:** Change background to `bg-white` and text to `text-gray-900`

### 3. **Save Progress to Database (Currently lost on refresh)**
**New File:** `src/app/api/workouts/progress/route.ts`  
**Fix:** Create API endpoint to save progress and points

---

## 📝 Quick Fix Guide (Copy-Paste Solutions)

### Fix #1: Drill Data Query
```typescript
// In useSkillsAcademyWorkouts.ts, REPLACE the drill query with:
const { data: drills } = await supabase
  .from('skills_academy_workout_drills')
  .select(`
    *,
    drill:skills_academy_drill_library!inner(
      drill_name,
      both_hands_vimeo_id,
      strong_hand_vimeo_id,
      off_hand_vimeo_id
    )
  `)
  .eq('workout_id', workoutId)
  .order('sequence_order')
```

### Fix #2: Modal Styling
```tsx
// In WorkoutSizeSelector.tsx, wrap entire return in:
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/50" onClick={onBack} />
  <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full">
    {/* ALL EXISTING CONTENT HERE with text-gray-900 for headers */}
  </div>
</div>
```

### Fix #3: Progress API
```typescript
// Create new file: src/app/api/workouts/progress/route.ts
export async function POST(request: Request) {
  const { userId, workoutId, drillId, completed } = await request.json()
  
  // Save to skills_academy_user_progress
  // Update user_points_balance_powlax
  // Return success response
}
```

---

## 🎯 Phased Execution Plan

### **TODAY (Phase 1): Critical Fixes - 4 hours**
**Who:** Backend Developer Focus

1. **Hour 1:** Fix drill data connection
   - Update Supabase query
   - Test with workout IDs: 1, 2, 3, 4
   - Verify real drill names appear

2. **Hour 2:** Fix modal styling
   - White background
   - Dark text
   - Test on mobile (375px)

3. **Hour 3:** Create progress API
   - Save endpoint
   - Points calculation
   - Test with Postman/curl

4. **Hour 4:** Integration testing
   - Full flow test
   - Build verification
   - Deploy to staging

### **TOMORROW (Phase 2): Polish - 3 hours**
**Who:** Frontend Developer Focus

1. **Hour 1:** Smooth navigation
   - Series → Modal → Workout → Complete
   - Loading states
   - Error handling

2. **Hour 2:** Mobile optimization
   - 60px touch targets
   - Swipe gestures
   - Portrait lock

3. **Hour 3:** Progress indicators
   - Real-time updates
   - Visual feedback
   - Points display

### **DAY 3 (Phase 3): Gamification - 2 hours**
**Who:** UX/Frontend Collaboration

1. **Hour 1:** Animations
   - Points celebration
   - Completion confetti
   - Smooth transitions

2. **Hour 2:** Polish
   - Streak tracking
   - Performance optimization
   - Final testing

---

## ✅ Success Checklist

### Before Starting:
- [ ] Read this document completely
- [ ] Access to Supabase database
- [ ] Local dev environment running
- [ ] Can see current broken state

### After Phase 1:
- [ ] Drills show real names (not "Drill 1")
- [ ] Modal has white background
- [ ] Points save to database
- [ ] Build passes (`npm run build`)

### After Phase 2:
- [ ] Complete workflow smooth
- [ ] Mobile experience good
- [ ] Loading states present
- [ ] No console errors

### After Phase 3:
- [ ] Animations working
- [ ] Streak system active
- [ ] Performance optimized
- [ ] Ready for production

---

## 🧪 Test Commands

```bash
# After each fix, run:
npm run lint
npm run typecheck
npm run build

# Test specific workout:
curl http://localhost:3000/api/workouts/1

# Test progress save:
curl -X POST http://localhost:3000/api/workouts/progress \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","workoutId":1,"drillId":1,"completed":true}'

# Run Skills Academy tests:
npx playwright test skills-academy
```

---

## 🚨 If Something Goes Wrong

### Problem: Build fails after changes
**Solution:** Check for TypeScript errors, missing imports

### Problem: Drills still showing as "Drill 1, 2, 3"
**Solution:** Check Supabase RLS policies, verify drill_library has data

### Problem: Modal still dark after changes
**Solution:** Clear Next.js cache: `rm -rf .next && npm run dev`

### Problem: Points not saving
**Solution:** Check API route registration, verify database permissions

---

## 📞 Escalation Path

1. **First:** Check this document for solutions
2. **Second:** Review error logs in console/terminal
3. **Third:** Check Supabase logs for database errors
4. **Fourth:** Consult Master Controller for guidance
5. **Fifth:** Escalate to user with specific error details

---

## 🎉 Definition of Success

The Skills Academy will be considered COMPLETE when:

1. **A user can:**
   - Select any workout series
   - See real drill names (not placeholders)
   - Watch drill videos
   - Complete workouts
   - See points accumulate
   - Return to try another workout

2. **The system:**
   - Saves all progress to database
   - Works on mobile devices
   - Has white modal backgrounds
   - Loads in under 3 seconds
   - Has zero console errors

3. **The code:**
   - Passes all build checks
   - Has 80% test coverage
   - Follows POWLAX patterns
   - Is documented

---

## 💬 Communication Template

### Daily Update to User:

```markdown
Skills Academy Progress - Day X

✅ Completed:
- Fixed drill data connection (real names now show)
- Changed modal to white background
- Implemented progress saving

🔄 In Progress:
- Testing mobile experience
- Adding loading states

🎯 Next:
- Animation polish
- Streak system

📊 Metrics:
- Build: PASSING
- Tests: 82% coverage
- Mobile: 91/100 Lighthouse

⏰ Timeline:
- On track for completion by [date]

Any concerns or changes needed?
```

---

## 🚀 LET'S GO!

**Start with Fix #1** - Get those drill names showing!

The entire Skills Academy fix should take ~9 hours of focused work across 3 days.

**Remember the user's priorities:**
1. Real drill names (not placeholders)
2. White modal backgrounds
3. Working mobile experience

Everything else is bonus.

---

*Master Controller is ready to begin coordination upon approval.*