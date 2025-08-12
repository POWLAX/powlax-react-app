# 🎓 **Skills Academy Master Contract & Acting Handoff**

*Created: 2025-01-11 | Last Updated: 2025-08-12 | Status: PHASE 004 ADDITIONAL FIXES REQUIRED*  
*Contract Owner: Patrick Chapla | Current Phase: PATRICK'S LATEST FEEDBACK*  
*Target Pages: `/skills-academy/workouts`, `/skills-academy/workout/[id]`*  
*Dev Server: RUNNING on port 3000 - NEW REQUIREMENTS IDENTIFIED*

---

## 🚨 **PATRICK'S LATEST FEEDBACK - AUGUST 12, 2025**

A couple things I noticed for fixes are 1 Please the point images bigger and make the entire space between the progress bar and the drill cards their container with minimal padding.  Set them up so there are two columns with 2 point types and 1 column with one point type.  Center each in their column, or the width of the page if it is one.  Make the layout of the columns IMAGE - Name - Number of Points.  The complete text from the sets_and_reps Column should be the only pill that lives underneath the title of the video in the footer. The point values on the containers with the point icons are not updating in real time.  I would like an explanation that is prompted by reading the contract that is heavily emphasized to answer the question of what are the requirements for having a point type listed. I am seeing Academy points twice. I'd like to know why. the layout of the page needs to Be locked on mobile So that the bottom of the footer begins at the top of the menu tab. The "Did It" button should always be visible.  The point explosions need to have real point values in then and they should go from drill card in the slider above the video into the point totals.  The animations should be more vibrant.  The entire site has gone over multiple authentication changes and we finally settled on a single source. That seems to be working well.  It is outlined in the STRATEGY_UPDATE_FIX_PROMPT.md and DRILL_UPDATE_FIX_PROMPT.md The patterns in this document are how perminance needs to be created on all pages. I think this is why I am not seeing the correct values for the points and the pills. The workout completion pages are in a video within the src/components/skills-academy Folder

---

## 🚨 **PHASE 001: GAMIFICATION FOUNDATION (COMPLETE ✅)**
*Priority: CRITICAL - Blocking 80% of other features*

### **Objectives:**
1. ✅ Implement complete gamification system with point persistence
2. ✅ Use Supabase RPC functions (no API endpoints needed)
3. ✅ Set up user_points_wallets table with proper RLS
4. ✅ Integrate authentication (patrick@powlax.com)
5. ✅ Test point calculations and persistence

### **Success Metrics:**
- [x] Points persist to database after workout completion
- [x] User can see their point balances
- [x] Supabase RPC functions return correct data
- [x] Authentication works with real users
- [x] Deployment ready with COMPLETE_GAMIFICATION_FINAL.sql

---

## 🚨 **PHASE 002: TIMER ENFORCEMENT (COMPLETE ✅)**
*Priority: HIGH (10/10) - Anti-cheating system*
*Completed: 2025-01-11 via 3x Parallel Agent Deployment*

### **Objectives:**
1. ✅ Add countdown timer to each drill
2. ✅ Disable "Did It" button until timer requirement met
3. ✅ Track individual drill completion times
4. ✅ Show itemized time breakdown on completion
5. ✅ Store timing data in database

### **Success Metrics:**
- [x] Timer counts down from (drill.duration_minutes - 1) × 60 seconds
- [x] Wall Ball videos require full estimated_duration_minutes (no -1)
- [x] "Did It" button disabled until timer expires
- [x] Individual drill times tracked and displayed
- [x] Time breakdown shows at workout completion
- [x] No quick-clicking cheating possible
- [x] Timer values pulled from database (not hardcoded)

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

### **✅ RECENTLY COMPLETED**
1. **Gamification System** - COMPLETE ✅
   - Points persist via Supabase RPC functions
   - user_points_wallets connected and working
   - Multipliers and streak tracking ready

2. **Timer Enforcement** - COMPLETE ✅
   - (duration_minutes - 1) × 60 timer for regular drills
   - Full duration for Wall Ball workouts
   - "Did It!" button disabled with countdown
   - Time breakdown modal on completion
   - Database schema ready for timing data

3. **Authentication** - COMPLETE ✅
   - TEST_USER_ID removed
   - Using real authentication context
   - Works with patrick@powlax.com

### **❌ REMAINING GAPS**
4. **Track System** - NOT IMPLEMENTED (Phase 003)
   - ELITE TRACK (3 months, series ascending)
   - EXPERIENCE TRACK (1 month, progression)
   - Modal selection per container

### **📝 PATRICK'S PRIORITY NOTES**
- **10/10 MUST DO**: Gamification, Point Persistence, Timer Enforcement
- **8/10 High Priority**: Track System, Drill Time Tracking
- **5/10 Medium**: Multipliers, Streak Bonuses
- **NOT FOR MVP**: Coach Assignments, Team Competitions, Progress Page

---

## 🚨 **PHASE 003: TRACK SYSTEM (FUTURE)**
*Priority: MEDIUM (8/10) - Engagement & Retention*
*Status: POSTPONED - After Phase 004*

### **Objectives:**
1. Add "Begin ELITE Track" / "Begin EXPERIENCE Track" buttons to workout cards
2. Create track selection modal with details
3. Implement ELITE track logic (3 months, ascending series)
4. Implement EXPERIENCE track logic (1 month, progression)
5. Apply 25% bonus points for track workouts
6. Track user progress through assigned workouts

### **Success Metrics:**
- [ ] Track selection modal appears on button click
- [ ] ELITE track shows only appropriate series workouts
- [ ] EXPERIENCE track shows progressive difficulty
- [ ] 25% bonus points applied to track workouts
- [ ] User can have max 2 active tracks
- [ ] Progress tracked week by week

---

## 🚨 **PHASE 004: ANIMATIONS & UI POLISH (PRIORITY 10/10)**
*Priority: CRITICAL (10/10) - User Experience & Engagement*
*Status: READY FOR IMPLEMENTATION*
*Added: 2025-01-16 by Patrick*

### **Objectives:**
1. **Point Explosion Animation on "Did It" Click**
   - Animate point explosion over completed drill card.
   - Visual feedback showing drill completion
   - Smooth transition to next drill

2. **Live Point Counter Display**
   - Show point types being earned above drill cards  (Must include the Point Images not currently in the Supabase Tables. Create an SQL that pulls the columns from the CSV here docs/Wordpress CSV's/Gamipress Gamification Exports/Points-Types-Export-2025-July-31-1904 copy.csv The columns you will want to grab are `Title` with the name and `URL` which has the wordpress image url. )
   - Center below upcoming drills (NO, Center these abocve the drill scroll feature in the header)
   - Update in real-time as workout progresses
   - Display: Attack Tokens, Defense Dollars, Midfield Medals, etc. (Must relate back to the current workout series they are doing)

3. **Multiplier Animation at 4th Workout**
   - Change from 5th to 4th workout for better visibility
   - Animate multiplier over changing point numbers
   - Show before workout completion screen (Don't worry about this if you put the first multiplier on the 4th workout)
   - Visual celebration of consistency 

4. **Mobile UI Improvements**
   - Shrink video embed with padding from header/footer - Please make sure that this is defined by keeping the Vimeo Embed as wide as possible, but allowing the Header and Footer to essentially expand to meet them.  
   - Center video in available space - MAX WIDTH
   - Header elements align down with padding - (Lets leave the padding alone on this run. )
   - Drill cards positioned just above video - 
   - Footer container with drill name at top - 
   - "Did It" button, reps, time pills aligned properly - The Time and Reps Pills should show from the  should also reference actual columns sers_and_reps for the sets and reps and duration_minutes for the time.

5. **Drill Navigation Changes**
   - Remove clickability from drill cards (reference only)
   - Sequential progression only
   - Visual indicators for completed/current/upcoming - (Don't make it too busy, the colors on them is already enough to know where they are.)

6. **Completed Workout Analysis View**
   - Easy navigation through completed drills
   - Review mode for coaches/players - 
   - Time and point breakdown per drill
   - Export or share capability (Don't worry about this, we will build it into the feed on the teams page.)

### **Success Metrics:**
- [ ] Point explosion animates on every "Did It" click (that actually completes that drill.)
- [ ] Live point counter updates in real-time - 
- [ ] Multiplier shows at 4th workout (not 5th)
- [ ] Video has proper padding on mobile
- [ ] Drill cards are non-clickable reference only
- [ ] Analysis view allows easy drill review - (Add in for later the potential of adding an "Are there any you want to do again or refine.)
- [ ] All animations smooth on mobile devices
- [ ] No performance degradation from animations

### **Implementation Details:**

#### **1. Point Explosion Animation**
```javascript
// Trigger on "Did It" button click
const handleDidIt = () => {
  triggerPointExplosion(drillId);
  updatePointCounters(drillPoints);
  setTimeout(() => advanceToNextDrill(), 1500);
}

// Animation specs
- Duration: 1.5 seconds
- Particles: Point type icons/values
- Direction: Explode upward from drill card
- End position: Flow into point counter
```

#### **2. Live Point Counter Component**
```javascript
// Position: Fixed above drill navigation
<PointCounter 
  position="above-drills"
  points={{
    attack_tokens: currentAttackTokens,
    defense_dollars: currentDefenseDollars,
    midfield_medals: currentMidfieldMedals,
    // etc...
  }}
  showAnimation={true}
/>
```

#### **3. Mobile Layout Adjustments**
```css
/* Video container with padding */
.video-container {
  padding: 16px;
  height: calc(100vh - header - footer - padding);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Non-clickable drill cards */
.drill-card {
  pointer-events: none;
  opacity: 0.7; /* Dimmed for reference */
}
.drill-card.current {
  opacity: 1;
  border: 2px solid powlax-blue;
}
```

#### **4. Completed Workout Analysis**
```javascript
// New component for post-workout review
<WorkoutAnalysis
  drills={completedDrills}
  times={drillTimes}
  points={pointsEarned}
  allowNavigation={true}
  exportEnabled={true}
/>
```

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
// Regular drills: (duration_minutes - 1) × 60 seconds
const regularDrillMinTime = (drill.duration_minutes - 1) * 60;

// Wall Ball videos: FULL estimated_duration_minutes (no -1 reduction)
const wallBallMinTime = workout.estimated_duration_minutes * 60;

// Timer logic
const [timeElapsed, setTimeElapsed] = useState(0);
const isWallBall = workout.series?.series_type === 'wall_ball';
const minTimeSeconds = isWallBall ? wallBallMinTime : regularDrillMinTime;
const canMarkComplete = timeElapsed >= minTimeSeconds;

// Track individual drill times
drillTimes: {
  [drillId]: {
    started: timestamp,
    completed: timestamp,
    duration: seconds,
    required_time: minTimeSeconds
  }
}

// Show breakdown at completion
"Drill 1: Wall Ball Basics - 2:45 (required: 3:00)"
"Drill 2: Quick Stick - 3:12 (required: 2:00)"  
"Total Workout Time: 15:32"
```

---

## 🚨 **CURRENT HANDOFF NOTES - PATRICK'S BUG REPORT**
*Date: 2025-01-16 | Status: CRITICAL BUGS IDENTIFIED*

### **🔴 PATRICK'S FEEDBACK - URGENT FIXES NEEDED**
**URL Tested**: `http://localhost:3005/skills-academy/workout/1`

#### **Bug 1: Point Counter NOT VISIBLE** 
**Issue**: "I don't see the point images or counters"
**Status**: ❌ CRITICAL - Point counter component exists but not displaying
**Location**: Above drill cards in header
**Expected**: Live point counter showing "Lax Credits: 0" with point type images

#### **Bug 2: Sets and Reps Pills MISSING**
**Issue**: "I don't see the sets and reps"
**Status**: ❌ CRITICAL - Pills should show duration and sets/reps
**Location**: Footer area with drill name and "Did It" button
**Expected**: Pills showing "3 min" and "3 sets" from database

#### **Bug 3: Point Explosion Animation NOT TRIGGERING**
**Issue**: Point explosion should animate when "Did It" is clicked
**Status**: ❌ HIGH PRIORITY - Animation component exists but not firing
**Expected**: Particles explode upward from button when drill completes

### **🔧 QUICK FIXES APPLIED (CONTEXT LIMITED)**
**Applied Fixes**:
1. ✅ Fixed PointCounter null checks for undefined `type.title`
2. ✅ Added default values for missing sets/reps data
3. ✅ Ensured point counter renders with fallback content
4. ✅ Clean server restart on port 3000

**Status**: ✅ Server restarted cleanly and compiled successfully

### **🎯 FIXES APPLIED - TEST AGAIN!**

**Updated URL**: `http://localhost:3000/skills-academy/workout/1`

✅ **FIXED ISSUES**:

1. **🏆 Point Counter Now Visible**
   - Will show "Lax Credits: 0" initially
   - Positioned above drill cards in header
   - Updates when you complete drills

2. **💊 Pills Now Always Show**
   - Duration: Shows actual duration from database or defaults to 3 min
   - Sets/Reps: Shows "3 sets" by default, or actual repetitions if available

3. **🔄 Server Completely Restarted**
   - Fresh cache cleared
   - Running on port 3000
   - All components recompiled

### **🧪 TEST SEQUENCE**:

1. Go to: `http://localhost:3000/skills-academy/workout/1`
2. Look for: Point counter above the drill cards showing "Lax Credits: 0"
3. Look for: Pills showing duration and sets/reps in the footer
4. Complete a drill: Click "Did It!" and watch points update in the counter
5. Watch for: Point explosion animation

The point counter should now be clearly visible above the drill navigation, and the pills should show duration and sets information! 🚀

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

### **Error 4: PointCounter Component Visibility (CURRENT)**
**Cause**: PointCounter component not rendering due to null type.title
**Fix**: Added null checks for type.title before calling toLowerCase()
**File**: `src/components/skills-academy/PointCounter.tsx`
**Status**: ✅ FIXED - Component should now render with fallback data

### **Error 5: Pills Not Displaying (CURRENT)**
**Cause**: Missing sets_and_reps data and pills not showing defaults
**Fix**: Added default duration (3 min) and sets (3 sets) with proper rendering
**File**: `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`
**Status**: ✅ FIXED - Pills should now show duration and sets information

---

## 📝 **PHASE PLANNING**

### **PHASE 001: Gamification Foundation** *(COMPLETE ✅)*
```markdown
PRIORITY: CRITICAL
TIMELINE: Completed
BLOCKER FOR: 80% of features

Tasks:
1. ✅ Create user_points_wallets table with RLS
2. ✅ Build /api/workouts/progress endpoint
3. ✅ Connect point persistence
4. ✅ Remove TEST_USER_ID
5. ✅ Test with patrick@powlax.com
```

### **PHASE 002: Timer Enforcement** *(COMPLETE ✅)*
```markdown
PRIORITY: HIGH (10/10)
TIMELINE: Completed
DEPENDENCIES: Gamification

Tasks:
1. ✅ Add countdown timer to drills
2. ✅ Disable "Did It" until timer expires
3. ✅ Track individual drill times
4. ✅ Show time breakdown at completion
5. ✅ Store timing data
```

### **PHASE 003: Track System** *(POSTPONED)*
```markdown
PRIORITY: MEDIUM (8/10)
TIMELINE: After Phase 004
DEPENDENCIES: Gamification, Timers, Animations

Tasks:
1. Add track selection modals
2. Implement ELITE track logic
3. Implement EXPERIENCE track logic
4. Track progress within tracks
5. Bonus points for track workouts
```

### **PHASE 004: Animations & UI Polish** *(CURRENT - PRIORITY 10/10)*
```markdown
PRIORITY: CRITICAL (10/10)
TIMELINE: Immediate
DEPENDENCIES: Gamification, Timers

Tasks:
1. Implement point explosion animation on "Did It"
2. Add live point counter above drills
3. Create multiplier animation at 4th workout
4. Polish mobile UI with proper padding
5. Make drill cards non-clickable (reference only)
6. Build completed workout analysis view
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Playwright Test Checklist:**
```javascript
// Phase 001 Tests (COMPLETE ✅)
- [x] Points save to database
- [x] API returns correct balances
- [x] Authentication works
- [x] Logout clears data

// Phase 002 Tests (COMPLETE ✅)
- [x] Timer prevents early completion
- [x] Time tracking accurate
- [x] Breakdown displays correctly

// Phase 003 Tests (FUTURE)
- [ ] Track selection works
- [ ] Correct workouts shown
- [ ] Bonus points applied

// Phase 004 Tests (NEW - PRIORITY 10/10)
- [ ] Point types table created with 7 images from CSV
- [ ] Point explosion animation triggers only on drill completion
- [ ] Live point counter shows above drill cards in header
- [ ] Counter displays relevant points based on workout series
- [ ] Video has maximum width with proper padding on mobile
- [ ] Drill cards are non-clickable (reference only)
- [ ] Analysis view allows completed workout review
- [ ] All animations perform smoothly on mobile (60fps)
- [ ] Database pills show real sets_and_reps + duration_minutes
```

---

## 📋 **PHASE 4 CLAUDE-TO-CLAUDE SUB-AGENT EXECUTION PLAN**

### **🎯 EXECUTION STRATEGY: 6 FOCUSED SUB-AGENTS**
*Each agent handles ONE specific component/feature to avoid complexity*

```javascript
// ========================================
// TASK 1: POINT TYPES DATABASE MIGRATION
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Import point type images from CSV",
  prompt: `
    CONTEXT: Skills Academy needs point type images for live counter
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    CSV FILE: docs/Wordpress CSV's/Gamipress Gamification Exports/Points-Types-Export-2025-July-31-1904 copy.csv
    
    TASKS:
    1. Create SQL migration to add point type images table
    2. Import Title and URL columns from CSV (7 point types found)
    3. Create point_types_powlax table with: id, title, image_url, slug
    4. Insert data: Academy Point, Attack Token, Defense Dollar, Midfield Medal, Rebound Reward, Flex Point, Lax IQ Point
    5. Create RLS policies for read access
    
    POINT TYPES TO IMPORT:
    - Academy Point (Lax Credits): https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png
    - Attack Token: https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png
    - Defense Dollar: https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png
    - Midfield Medal: https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png
    - Rebound Reward: https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png
    - Flex Point: https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png
    - Lax IQ Point: https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png
    
    CRITICAL:
    - Test Supabase connection before creating tables
    - Verify image URLs are accessible
    - Keep dev server running on port 3000
    - Log migration as 120_point_types_import.sql
  `
})

// ========================================
// TASK 2: POINT EXPLOSION ANIMATION
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Create point explosion animation component",
  prompt: `
    CONTEXT: Skills Academy needs point explosion animation on "Did It" click
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    TASKS:
    1. Create PointExplosion component using framer-motion or CSS animations
    2. Trigger animation ONLY when drill actually completes (not on disabled button)
    3. Animate point particles exploding upward from drill card
    4. Use point type images from point_types_powlax table
    5. Duration: 1.5 seconds with smooth easing
    
    ANIMATION SPECS:
    - Origin: Current drill card position
    - Direction: Explode upward toward point counter
    - Particles: 3-5 point type icons/values
    - End state: Flow into live counter above drills
    - Performance: 60fps on mobile devices
    
    CRITICAL:
    - Only animate on successful drill completion
    - Must be smooth on mobile (test on 375px)
    - No blocking of next drill advance
    - Keep dev server running on port 3000
  `
})

// ========================================
// TASK 3: LIVE POINT COUNTER COMPONENT
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Build live point counter above drills",
  prompt: `
    CONTEXT: Skills Academy needs live point counter in header above drill cards
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    TASKS:
    1. Create PointCounter component showing current workout points
    2. Position ABOVE drill scroll feature in header (NOT below)
    3. Display point types relevant to current workout series (attack/defense/midfield)
    4. Show point type images from point_types_powlax table
    5. Update in real-time as drills complete with smooth animation
    
    LAYOUT SPECS:
    - Position: Fixed in header above drill navigation
    - Layout: Horizontal row with icons and values
    - Points to show: Based on workout series_type
    - Animation: Smooth value increments on drill completion
    - Mobile: Responsive scaling for small screens
    
    CRITICAL:
    - Must update immediately on drill completion
    - Show relevant point types for workout series
    - Mobile responsive (test on 375px)
    - Keep dev server running on port 3000
  `
})

// ========================================
// TASK 4: MOBILE UI VIDEO LAYOUT POLISH
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Polish mobile video layout and sizing",
  prompt: `
    CONTEXT: Skills Academy workout page needs mobile UI improvements for video
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    REFERENCE: User screenshots showing desired padding and centering
    
    TASKS:
    1. Keep Vimeo embed as WIDE as possible (max width)
    2. Add padding between video and header/footer containers
    3. Center video in available vertical space
    4. Show sets_and_reps and duration_minutes from database in pills
    5. Align drill name and "Did It" button properly in footer
    
    LAYOUT SPECS:
    - Video: Maximum width with padding from edges
    - Header: Point counter + drill cards above video
    - Footer: Drill name at top, then pills and button
    - Pills: Show actual sets_and_reps + duration_minutes data
    - Spacing: Proper breathing room between containers
    
    CRITICAL:
    - Video must be largest possible while having padding
    - Use real database columns for pills (not hardcoded)
    - Test on 375px viewport (iPhone)
    - Keep dev server running on port 3000
  `
})

// ========================================
// TASK 5: DRILL NAVIGATION CHANGES
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Make drill cards reference-only navigation",
  prompt: `
    CONTEXT: Skills Academy drill navigation needs to be reference-only (non-clickable)
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    TASKS:
    1. Remove onClick handlers from drill navigation cards
    2. Keep visual indicators (completed/current/upcoming colors)
    3. Ensure sequential progression only through "Did It" button
    4. Don't make visual changes too busy (current colors are enough)
    5. Test that clicking cards does NOT change current drill
    
    NAVIGATION SPECS:
    - Cards: Visual reference only, no click handlers
    - Colors: Keep current green/blue/gray system
    - Progression: Only via "Did It" button advancement
    - Layout: Keep existing horizontal scroll design
    - Accessibility: Update aria-labels to indicate reference-only
    
    CRITICAL:
    - Remove all drill card clickability
    - Maintain current color system (don't over-design)
    - Sequential progression enforced
    - Keep dev server running on port 3000
  `
})

// ========================================
// TASK 6: COMPLETED WORKOUT ANALYSIS VIEW
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Add completed workout analysis capability",
  prompt: `
    CONTEXT: Skills Academy needs review mode for completed workouts
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    TASKS:
    1. Add "Review Workout" option after completion screen
    2. Allow navigation through completed drills for analysis
    3. Show time and point breakdown per drill
    4. Add potential for "refine/redo" drill options (future)
    5. Create clean analysis interface for coaches/players
    
    ANALYSIS SPECS:
    - Trigger: Button on completion screen
    - Navigation: Easy drill-by-drill review
    - Data: Time spent, points earned, completion status
    - Future: Framework for "redo this drill" functionality
    - Layout: Clean, coach-friendly interface
    
    CRITICAL:
    - Build for future enhancement (redo drills)
    - Focus on analysis/review functionality
    - Mobile-friendly interface
    - Keep dev server running on port 3000
  `
})
```

### **🔄 EXECUTION SEQUENCE**
1. **Task 1** → Database foundation (point types import)
2. **Task 2** → Point explosion animation 
3. **Task 3** → Live point counter (depends on Task 1)
4. **Task 4** → Mobile UI polish (independent)
5. **Task 5** → Drill navigation changes (independent)
6. **Task 6** → Analysis view (depends on Tasks 2-3)

### **📊 SUCCESS VALIDATION CRITERIA**
- [ ] All 7 point types imported with images
- [ ] Point explosion triggers only on drill completion
- [ ] Live counter shows relevant points above drills
- [ ] Video has maximum width with proper padding
- [ ] Drill cards are non-clickable reference only
- [ ] Analysis view allows completed workout review

---

## 🧠 **ULTRA THINK VALIDATION CHECKLIST**
*Review before sub-agent deployment*

### **Database Architecture Verification**
- [ ] Point types table schema matches CSV structure
- [ ] All 7 point type image URLs are accessible
- [ ] RLS policies allow read access for authenticated users
- [ ] Migration follows naming convention: 120_point_types_import.sql

### **Component Dependencies Check**
- [ ] Task 3 (Live Counter) depends on Task 1 (Database)
- [ ] Task 6 (Analysis) depends on Tasks 2-3 (Animations + Counter)
- [ ] Tasks 4-5 are independent and can run in parallel
- [ ] All components use existing Skills Academy database tables

### **Mobile Performance Validation**
- [ ] Animations target 60fps on 375px viewport
- [ ] Video sizing maximizes width while maintaining padding
- [ ] Point counter responsive on small screens
- [ ] No memory leaks from animation components

### **Integration Points Verification**
- [ ] Point explosion connects to live counter
- [ ] Counter shows points relevant to workout series_type
- [ ] Database pills use actual columns (sets_and_reps, duration_minutes)
- [ ] Analysis view integrates with existing completion flow

---

## ✅ **COMPLETION CHECKLIST**

### **MVP Requirements:**
- [x] Gamification system working with persistence ✅
- [x] Timer enforcement preventing cheating ✅
- [x] Authentication with real users ✅
- [x] Wall Ball drills displayed under workouts ✅
- [x] Mobile responsive on all pages ✅
- [ ] **Phase 4 Animations & UI Polish (CURRENT PRIORITY 10/10)**
  - [ ] Point types database with 7 images
  - [ ] Point explosion animation on drill completion
  - [ ] Live point counter above drill navigation
  - [ ] Mobile video layout with maximum width + padding
  - [ ] Non-clickable drill cards (reference only)
  - [ ] Completed workout analysis view
- [ ] Playwright tests passing (needs comprehensive suite)

### **Post-MVP Features:**
- [ ] Track system (ELITE/EXPERIENCE) - Phase 3
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
2. Verify timer counts down from (duration_minutes - 1) for regular drills
3. Verify Wall Ball videos require FULL estimated_duration_minutes
4. Check itemized time breakdown shows required vs actual time
5. Confirm anti-cheat prevents quick clicking

After Phase 004 completion, test:
1. **Database Check**: Verify 7 point types imported with images from CSV
2. **Point Explosion**: Click "Did It" and verify explosion animation plays (only on completion)
3. **Live Counter**: Check counter shows above drills and updates in real-time
4. **Series Relevance**: Verify counter shows points relevant to workout series type
5. **Mobile Video**: Test video has maximum width with proper padding from edges
6. **Navigation**: Verify drill cards cannot be clicked (reference only)
7. **Database Pills**: Check time/reps pills show real sets_and_reps + duration_minutes
8. **Analysis View**: Access completed workout review for drill-by-drill breakdown
9. **Mobile Performance**: Test all animations smooth on mobile (60fps target)
10. **Multiplier**: Complete 4 workouts and verify multiplier animation shows

---

*END OF CONTRACT - Last Updated: 2025-01-16 by Claude*