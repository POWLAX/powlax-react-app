# 🎓 **Skills Academy Master Contract & Acting Handoff**

*Created: 2025-01-11 | Last Updated: 2025-01-11 | Status: ACTIVE HANDOFF*  
*Contract Owner: Patrick Chapla | Current Phase: 001 - Gamification Foundation*  
*Target Pages: `/skills-academy/workouts`, `/skills-academy/workout/[id]`*  
*Dev Server: KEEP RUNNING on port 3000*

---

## 🚨 **PHASE 001: GAMIFICATION FOUNDATION (CURRENT)**
*Priority: CRITICAL - Blocking 80% of other features*

### **Objectives:**
1. Implement complete gamification system with point persistence
2. Create API endpoints for point/progress tracking
3. Set up user_points_wallets table with proper RLS
4. Integrate authentication (patrick@powlax.com)
5. Test point calculations and persistence

### **Success Metrics:**
- [ ] Points persist to database after workout completion
- [ ] User can see their point balances
- [ ] API endpoints return correct data
- [ ] Authentication works with real users
- [ ] Playwright tests pass for point system

---

## 📋 **CONTRACT RULES & WORKFLOW**

### **1. Document Authority**
- This document is the ONLY source of truth for Skills Academy work
- Must be updated with EVERY fix or change
- Acts as living handoff between Claude and sub-agents

### **2. Development Workflow**
```
1. PLAN → Create detailed implementation plan in this document
2. VERIFY → Use Ultra Think to validate the plan
3. EXECUTE → YOLO mode with focused sub-agents
4. TEST → Playwright testing before marking complete
5. UPDATE → Log changes, errors, and migrations here
```

### **3. Sub-Agent Requirements**
- Test with Playwright BEFORE reporting back
- Update this document with results
- Verify Supabase tables before implementation
- ONE focused task per agent
- Keep dev server running (Patrick needs it for testing)

### **4. Migration Logging**
```sql
-- Format: ###_issue_we_are_fixing.sql
-- Example: 085_gamification_point_persistence.sql
-- Location: supabase/migrations/
```

---

## 🗄️ **DATABASE VERIFICATION CHECKLIST**

### **Tables That EXIST (Verified):**
```sql
✅ skills_academy_series (49 records)
✅ skills_academy_workouts (166 records)  
✅ skills_academy_drills (167 records)
✅ wall_ball_drill_library (48 records)
✅ skills_academy_user_progress (3 records)
✅ users (with auth_user_id)
```

### **Tables to CREATE/VERIFY:**
```sql
⚠️ user_points_wallets - Check if exists
⚠️ workout_completions - Check if exists
⚠️ user_streak_data - Need to create
⚠️ coach_workout_assignments - Post-MVP
```

---

## 📊 **CURRENT IMPLEMENTATION STATUS**

### **✅ WORKING FEATURES**
1. **Workout Selection Page (`/skills-academy/workouts`)**
   - Track cards display (5 tracks)
   - Variant selection modal (Mini/More/Complete)
   - Wall Ball with/without coaching options
   - Mobile-responsive design

2. **Quiz-Style Interface (`/skills-academy/workout/[id]`)**
   - Sequential drill presentation ✅
   - "Did It!" button progression ✅
   - Video integration with Vimeo ✅
   - Auto-advance to next drill ✅
   - Completion celebration ✅

### **❌ CRITICAL GAPS (MVP BLOCKERS)**
1. **Gamification System** - NO PERSISTENCE
   - Points calculated but not saved
   - No API endpoints exist
   - user_points_wallets not connected
   - No streak tracking

2. **Timer Enforcement** - NOT IMPLEMENTED
   - Need (duration_minutes - 1) timer before "Did It"
   - Track individual drill times
   - Show itemized breakdown at end

3. **Authentication** - USING TEST_USER_ID
   - Must use patrick@powlax.com
   - Remove hardcoded test user

4. **Track System** - NOT IMPLEMENTED
   - ELITE TRACK (3 months, series ascending)
   - EXPERIENCE TRACK (1 month, progression)
   - Modal selection per container

### **📝 PATRICK'S PRIORITY NOTES**
- **10/10 MUST DO**: Gamification, Point Persistence, Timer Enforcement
- **8/10 High Priority**: Track System, Drill Time Tracking
- **5/10 Medium**: Multipliers, Streak Bonuses
- **NOT FOR MVP**: Coach Assignments, Team Competitions, Progress Page

---

## 🎯 **TRACK SYSTEM REQUIREMENTS**

### **ELITE TRACK (3 Months)**
- 3 workouts/week based on series_type
- Ascending within series by series_code
- Week 2 of `attack` → Only A2 series workouts shown
- Completing faster allowed, but only track workouts count

### **EXPERIENCE TRACK (1 Month)**  
- 3 workouts/week across series progression
- Week 2 of `attack` → A4, A5, A6 available (any order)
- Progressive difficulty increase

### **Implementation:**
- "Begin ELITE Track" / "Begin EXPERIENCE Track" buttons per container
- Modal with track details and confirmation
- Max 2 tracks active (1 per series)
- Non-track workouts still available (less points)

---

## 🔧 **TIMER ENFORCEMENT SYSTEM**

### **Requirements:**
```javascript
// Each drill must enforce minimum time
const minTimeSeconds = (drill.duration_minutes - 1) * 60;
const [timeElapsed, setTimeElapsed] = useState(0);
const canMarkComplete = timeElapsed >= minTimeSeconds;

// Track individual drill times
drillTimes: {
  [drillId]: {
    started: timestamp,
    completed: timestamp,
    duration: seconds
  }
}

// Show breakdown at completion
"Drill 1: Wall Ball Basics - 2:45"
"Drill 2: Quick Stick - 3:12"
"Total Workout Time: 15:32"
```

---

## 🐛 **COMMON ERRORS LOG**

### **Error 1: Points Not Persisting**
**Cause**: API endpoint `/api/workouts/progress` doesn't exist  
**Fix**: Create API route with Supabase integration
**File**: `src/app/api/workouts/progress/route.ts`

### **Error 2: TEST_USER_ID Hardcoded**
**Cause**: Line 84 in workout/[id]/page.tsx  
**Fix**: Use authenticated user from context
**Note**: Test with patrick@powlax.com

### **Error 3: Drills Clickable in Navigation**
**Cause**: onClick handlers on drill navigation buttons  
**Fix**: Remove onClick for completed drills, sequential only

---

## 📝 **PHASE PLANNING**

### **PHASE 001: Gamification Foundation** *(CURRENT)*
```markdown
PRIORITY: CRITICAL
TIMELINE: Immediate
BLOCKER FOR: 80% of features

Tasks:
1. Create user_points_wallets table with RLS
2. Build /api/workouts/progress endpoint
3. Connect point persistence
4. Remove TEST_USER_ID
5. Test with patrick@powlax.com
```

### **PHASE 002: Timer Enforcement** *(NEXT)*
```markdown
PRIORITY: HIGH (10/10)
TIMELINE: After Phase 001
DEPENDENCIES: Gamification

Tasks:
1. Add countdown timer to drills
2. Disable "Did It" until timer expires
3. Track individual drill times
4. Show time breakdown at completion
5. Store timing data
```

### **PHASE 003: Track System** *(FUTURE)*
```markdown
PRIORITY: MEDIUM (8/10)
TIMELINE: After MVP
DEPENDENCIES: Gamification, Timers

Tasks:
1. Add track selection modals
2. Implement ELITE track logic
3. Implement EXPERIENCE track logic
4. Track progress within tracks
5. Bonus points for track workouts
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Playwright Test Checklist:**
```javascript
// Phase 001 Tests
- [ ] Points save to database
- [ ] API returns correct balances
- [ ] Authentication works
- [ ] Logout clears data

// Phase 002 Tests  
- [ ] Timer prevents early completion
- [ ] Time tracking accurate
- [ ] Breakdown displays correctly

// Phase 003 Tests
- [ ] Track selection works
- [ ] Correct workouts shown
- [ ] Bonus points applied
```

---

## 📋 **SUB-AGENT DEPLOYMENT TEMPLATE**

```javascript
// Phase 001 - Task 1: Gamification Setup
Task({
  subagent_type: "general-purpose",
  description: "Implement gamification persistence",
  prompt: `
    CONTEXT: Skills Academy needs point persistence
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md
    
    TASKS:
    1. Create user_points_wallets table if not exists
    2. Build /api/workouts/progress endpoint
    3. Connect workout completion to save points
    4. Test with Playwright
    5. Update contract with results
    
    CRITICAL:
    - Verify tables exist before using
    - Test with patrick@powlax.com
    - Keep dev server running
    - Log any migrations in supabase/migrations/
  `
})
```

---

## ✅ **COMPLETION CHECKLIST**

### **MVP Requirements:**
- [ ] Gamification system working with persistence
- [ ] Timer enforcement preventing cheating
- [ ] Authentication with real users
- [ ] Wall Ball drills displayed under workouts
- [ ] Mobile responsive on all pages
- [ ] Playwright tests passing

### **Post-MVP Features:**
- [ ] Track system (ELITE/EXPERIENCE)
- [ ] Streak multipliers
- [ ] Coach assignments
- [ ] Team competitions
- [ ] Progress dashboard

---

## 🔄 **HANDOFF PROTOCOL**

### **For Patrick:**
1. Test these specific features after each phase
2. Provide feedback in contract comments
3. Approve before moving to next phase

### **For Claude/Sub-agents:**
1. Read this ENTIRE contract first
2. Verify current phase at top
3. Execute ONLY current phase tasks
4. Update status after EVERY change
5. Run Playwright tests before handoff

---

## 📊 **EVALUATION CRITERIA FOR PATRICK**

After Phase 001 completion, test:
1. Complete a workout and verify points save
2. Refresh page and check point balance persists
3. Check database for point records
4. Verify timer shows but doesn't enforce (Phase 002)
5. Confirm patrick@powlax.com authentication works

After Phase 002 completion, test:
1. Try clicking "Did It" before timer expires (should be disabled)
2. Verify timer counts down from (duration_minutes - 1)
3. Check itemized time breakdown at completion
4. Confirm anti-cheat prevents quick clicking

---

*END OF CONTRACT - Last Updated: 2025-01-11 by Claude*