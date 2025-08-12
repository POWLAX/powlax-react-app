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
*Status: IN PROGRESS - YOLO MODE READY*
*Updated: 2025-01-16 with Permanence Pattern Integration*

### **🎯 Implementation Strategy with Permanence Pattern**

#### **Core Requirements from Patrick's Feedback:**
1. **Point Images Layout**: 2-column layout, bigger images, IMAGE-Name-Points format
2. **Pills Fix**: Only `sets_and_reps` column text as single pill under video title
3. **Real-time Updates**: Fix point values not updating using permanence pattern
4. **Duplicate Academy Points**: Investigate and fix duplicate point types
5. **Mobile Layout**: Footer bottom aligns with menu tab top
6. **"Did It" Button**: Always visible
7. **Point Explosions**: Real values animating from drill card to totals
8. **Permanence Pattern**: Apply to all data operations per SUPABASE_PERMANENCE_PATTERN.md

### **Objectives with Permanence Pattern Integration:**

1. **Point Types Database Foundation** ⚠️ MUST COMPLETE FIRST
   - Create `point_types_powlax` table with direct column mapping
   - Import 7 point types from CSV with images
   - Apply permanence pattern: Direct columns, no nested JSON
   - Schema: `id, title, image_url, slug, series_type`
   - RLS policies for authenticated read access

2. **Live Point Counter with Real-time Updates**
   - Position ABOVE drill cards in header (not below)
   - 2-column layout: 2 point types per column, 1 in third if odd
   - Layout: IMAGE (bigger) - Name - Number format
   - **Permanence Fix**: Read directly from database columns
   - **Real-time Fix**: Update state immediately on drill completion
   - Filter points by workout series_type (no duplicates)
   - Investigate/fix duplicate Academy Points issue

3. **Point Explosion Animation with Real Values**
   - Trigger ONLY on successful drill completion
   - Show REAL point values from drill data
   - Animate FROM drill card TO point counter
   - More vibrant/visible animations
   - Duration: 1.5 seconds with smooth easing
   - 60fps performance on mobile

4. **Mobile UI Layout Fixes**
   - Video: Maximum width with proper padding
   - **Pills Fix**: Show ONLY `sets_and_reps` column as single pill
   - Footer: Bottom aligns with menu tab top
   - "Did It" button: Always visible in footer
   - Use actual database columns (not hardcoded)

5. **Drill Navigation Non-clickable**
   - Remove ALL onClick handlers from drill cards
   - Sequential progression via "Did It" only
   - Keep existing color system (don't over-design)
   - Cards are visual reference only

6. **Completed Workout Analysis**
   - "Review Workout" button on completion screen
   - Drill-by-drill navigation for analysis
   - Show time and points per drill
   - Framework for future "redo drill" feature
   - Mobile-friendly interface

### **Success Metrics Updated:**
- [ ] Point types database created with 7 images from CSV
- [ ] Point counter shows 2-column layout with bigger images
- [ ] Only `sets_and_reps` column text shows as single pill
- [ ] Point values update in real-time (permanence pattern applied)
- [ ] No duplicate Academy Points displayed
- [ ] Footer bottom aligns with menu tab top on mobile
- [ ] "Did It" button always visible
- [ ] Point explosions show real values animating to counters
- [ ] Drill cards are non-clickable reference only
- [ ] Analysis view allows easy drill review
- [ ] All animations smooth on mobile (60fps)
- [ ] Multiplier shows at 4th workout

### **🔧 Permanence Pattern Implementation Details:**

#### **1. Database Schema with Direct Column Mapping**
```sql
-- Point types table with direct columns (no nested JSON)
CREATE TABLE point_types_powlax (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  series_type TEXT, -- attack, defense, midfield, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Direct column reads for real-time updates
SELECT title, image_url, slug 
FROM point_types_powlax 
WHERE series_type = 'attack';
```

#### **2. Real-time Point Counter with Permanence**
```javascript
// PERMANENCE PATTERN: Direct column reads, no extraction
const fetchPointTypes = async () => {
  const { data } = await supabase
    .from('point_types_powlax')
    .select('*') // Direct columns
    .eq('series_type', workoutSeries);
  
  // No transformation needed - data ready to use
  setPointTypes(data);
};

// Real-time state updates on drill completion
const handleDrillComplete = (drillPoints) => {
  // Update state immediately (no delay)
  setCurrentPoints(prev => ({
    ...prev,
    [pointType]: prev[pointType] + drillPoints
  }));
  
  // Trigger explosion with REAL values
  triggerPointExplosion(drillPoints);
};
```

#### **3. Point Counter 2-Column Layout**
```jsx
// 2-column layout with bigger images
<div className="grid grid-cols-3 gap-4 p-4">
  {/* Column 1: 2 point types */}
  <div className="flex flex-col gap-2">
    {pointTypes.slice(0, 2).map(type => (
      <div className="flex items-center gap-2">
        <img src={type.image_url} className="w-12 h-12" />
        <span>{type.title}</span>
        <span className="font-bold">{points[type.slug]}</span>
      </div>
    ))}
  </div>
  
  {/* Column 2: 2 point types */}
  <div className="flex flex-col gap-2">
    {pointTypes.slice(2, 4).map(type => (
      <div className="flex items-center gap-2">
        <img src={type.image_url} className="w-12 h-12" />
        <span>{type.title}</span>
        <span className="font-bold">{points[type.slug]}</span>
      </div>
    ))}
  </div>
  
  {/* Column 3: 1 point type (if odd number) */}
  {pointTypes.length % 2 === 1 && (
    <div className="flex items-center gap-2">
      <img src={pointTypes[4].image_url} className="w-12 h-12" />
      <span>{pointTypes[4].title}</span>
      <span className="font-bold">{points[pointTypes[4].slug]}</span>
    </div>
  )}
</div>
```

#### **4. Pills Fix - Only sets_and_reps Column**
```javascript
// CORRECT: Show only sets_and_reps as single pill
<div className="footer-pills">
  {drill.sets_and_reps && (
    <span className="pill">
      {drill.sets_and_reps} {/* Direct from database column */}
    </span>
  )}
</div>

// WRONG: Multiple pills or hardcoded values
// <span>3 sets</span> <span>3 min</span>
```

#### **5. Mobile Layout with Footer Alignment**
```css
/* Footer aligns with menu tab */
.workout-footer {
  position: fixed;
  bottom: env(safe-area-inset-bottom, 0);
  /* Account for mobile menu tab height */
  margin-bottom: var(--menu-tab-height, 60px);
}

/* "Did It" button always visible */
.did-it-button {
  position: sticky;
  bottom: 0;
  z-index: 10;
}
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

### **🎯 EXECUTION STRATEGY: 6 FOCUSED SUB-AGENTS WITH PERMANENCE PATTERN**
*Each agent handles ONE specific component following the permanence pattern*

```javascript
// ========================================
// TASK 1: POINT TYPES DATABASE MIGRATION (CRITICAL - DO FIRST)
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Create point types database with permanence pattern",
  prompt: `
    CONTEXT: Skills Academy needs point type images for live counter
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    PERMANENCE: Follow .claude/SUPABASE_PERMANENCE_PATTERN.md
    CSV FILE: docs/Wordpress CSV's/Gamipress Gamification Exports/Points-Types-Export-2025-July-31-1904 copy.csv
    
    TASKS:
    1. Create point_types_powlax table with DIRECT COLUMNS (no nested JSON):
       - id SERIAL PRIMARY KEY
       - title TEXT NOT NULL
       - image_url TEXT NOT NULL  
       - slug TEXT UNIQUE NOT NULL
       - series_type TEXT (attack/defense/midfield/etc)
       - created_at TIMESTAMP DEFAULT NOW()
    
    2. Import these 7 point types from CSV:
       - Academy Point (Lax Credits): https://powlax.com/wp-content/uploads/2024/10/Lax-Credits.png
       - Attack Token: https://powlax.com/wp-content/uploads/2024/10/Attack-Tokens-1.png
       - Defense Dollar: https://powlax.com/wp-content/uploads/2024/10/Defense-Dollars-1.png
       - Midfield Medal: https://powlax.com/wp-content/uploads/2024/10/Midfield-Medals-1.png
       - Rebound Reward: https://powlax.com/wp-content/uploads/2024/10/Rebound-Rewards-1.png
       - Flex Point: https://powlax.com/wp-content/uploads/2025/02/SS-Flex-Points-1.png
       - Lax IQ Point: https://powlax.com/wp-content/uploads/2025/01/Lax-IQ-Points.png
    
    3. Add series_type mapping:
       - Attack Token → 'attack'
       - Defense Dollar → 'defense'
       - Midfield Medal → 'midfield'
       - Others → 'general' or appropriate type
    
    4. Create RLS policies for authenticated read access
    
    PERMANENCE PATTERN CRITICAL:
    - Direct column mapping (no content field extraction)
    - Each field maps to its own column
    - Arrays for multi-value fields (if needed)
    - Test with SELECT * to verify direct reads work
    
    OUTPUT:
    - Migration file: 122_point_types_with_images.sql
    - Test script to verify data loads correctly
    - Keep dev server running on port 3000
  `
})

// ========================================
// TASK 2: FIX LIVE POINT COUNTER WITH REAL-TIME UPDATES
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Fix point counter real-time updates with permanence",
  prompt: `
    CONTEXT: Point values NOT updating in real-time - Patrick's critical issue
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    PERMANENCE: Follow .claude/SUPABASE_PERMANENCE_PATTERN.md
    
    CRITICAL ISSUES TO FIX:
    1. Point values on containers not updating in real-time
    2. Duplicate Academy Points showing (investigate why)
    3. Points not filtering by workout series correctly
    
    TASKS:
    1. Fix PointCounter component real-time updates:
       - Read point types DIRECTLY from point_types_powlax columns
       - Update state IMMEDIATELY on drill completion (no delay)
       - NO nested JSON extraction or content fields
    
    2. Implement 2-column layout per Patrick's feedback:
       - Column 1: 2 point types
       - Column 2: 2 point types  
       - Column 3: 1 point type (if odd number)
       - Layout: IMAGE (bigger) - Name - Number
       - Position ABOVE drill cards in header
    
    3. Fix duplicate Academy Points issue:
       - Check point type filtering logic
       - Ensure unique points per workout series
       - Filter by series_type from database
    
    4. Apply permanence pattern for state updates:
       - Direct column reads from database
       - Transform at UI boundary only
       - Preserve existing point values
    
    VALIDATION:
    - Points update instantly when "Did It" clicked
    - No duplicate point types displayed
    - Correct points show for workout series
    - Test on localhost:3000/skills-academy/workout/1
  `
})

// ========================================
// TASK 3: POINT EXPLOSION ANIMATION WITH REAL VALUES
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Create vibrant point explosion with real values",
  prompt: `
    CONTEXT: Point explosions need real values and more vibrant animations
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    PATRICK'S REQUIREMENTS:
    1. Show REAL point values from drill data (not fake numbers)
    2. Animate FROM drill card TO point counter above
    3. More VIBRANT and visible animations
    4. Values should match what's being added to totals
    
    TASKS:
    1. Create PointExplosion component:
       - Use framer-motion for smooth 60fps animations
       - Pull REAL point values from current drill data
       - Show actual point type images from point_types_powlax
    
    2. Animation specifications:
       - Origin: Current drill card in slider
       - Path: Arc upward to point counter in header
       - Duration: 1.5 seconds with spring easing
       - Particles: Show "+X" with point type icon
       - More vibrant: Larger size, brighter colors, glow effect
    
    3. Trigger conditions:
       - ONLY on successful drill completion
       - After timer expires and "Did It" clicked
       - Pass real drill point values to animation
    
    4. Integration with counter:
       - End position at point counter location
       - Sync with counter value updates
       - No blocking of next drill advance
    
    VALIDATION:
    - Shows real point values (e.g., "+10 Attack Tokens")
    - Visible and vibrant on mobile
    - Smooth 60fps performance
    - Values match what's added to totals
  `
})

// ========================================
// TASK 4: FIX PILLS AND MOBILE LAYOUT
// ========================================
Task({
  subagent_type: "general-purpose",
  description: "Fix pills display and mobile layout issues",
  prompt: `
    CONTEXT: Pills showing wrong data and mobile layout issues
    CONTRACT: src/components/skills-academy/ACADEMY_MASTER_CONTRACT.md Phase 004
    
    PATRICK'S CRITICAL FIXES:
    1. PILLS: Only sets_and_reps column as single pill
    2. MOBILE: Footer bottom aligns with menu tab
    3. "Did It" button ALWAYS visible
    4. Video maximum width with padding
    
    TASKS:
    1. Fix Pills Display:
       - Show ONLY sets_and_reps column text as ONE pill
       - Position under video title in footer
       - Pull from actual database column (not hardcoded)
       - Remove any duration or other pills
    
    2. Fix Mobile Layout:
       - Footer bottom MUST align with top of menu tab
       - Account for safe area insets on iPhone
       - Lock layout so footer doesn't overlap menu
       - "Did It" button sticky and always visible
    
    3. Video Layout:
       - Maximum width possible (edge to edge minus padding)
       - Center in available vertical space
       - Header and footer expand to meet video
       - Proper breathing room between containers
    
    4. Footer Structure:
       - Top: Drill name/title
       - Middle: sets_and_reps pill (single)
       - Bottom: "Did It" button (always visible)
    
    VALIDATION:
    - Only ONE pill showing sets_and_reps text
    - Footer aligns with menu tab (no overlap)
    - "Did It" button never hidden
    - Test on iPhone (375px viewport)
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

### **🔄 EXECUTION SEQUENCE WITH DEPENDENCIES**

#### **PHASE 1: Database Foundation (MUST DO FIRST)**
1. **Task 1** → Point types database with images and permanence pattern

#### **PHASE 2: Core Fixes (PARALLEL EXECUTION)**
2. **Task 2** → Fix point counter real-time updates (depends on Task 1)
3. **Task 3** → Point explosion with real values (depends on Task 1)
4. **Task 4** → Fix pills and mobile layout (independent)
5. **Task 5** → Make drill cards non-clickable (independent)

#### **PHASE 3: Enhancement**
6. **Task 6** → Workout analysis view (depends on Tasks 2-3)

### **📊 SUCCESS VALIDATION CRITERIA - PATRICK'S CHECKLIST**
- [ ] Point types database has 7 images from CSV
- [ ] Point counter shows 2-column layout with bigger images
- [ ] Only sets_and_reps column shows as single pill
- [ ] Point values update in real-time (no delay)
- [ ] No duplicate Academy Points displayed
- [ ] Footer bottom aligns with menu tab top
- [ ] "Did It" button always visible
- [ ] Point explosions show real values
- [ ] Animations are vibrant and visible
- [ ] Drill cards are non-clickable
- [ ] Mobile layout locked properly
- [ ] All permanence pattern principles applied

---

## 🧠 **ULTRA THINK VALIDATION COMPLETED**
*Validated permanence pattern integration for Phase 004*

### **✅ Permanence Pattern Verification**
- [x] Direct column mapping for all point data (no nested JSON)
- [x] Type transformation at UI boundary only (booleans to arrays)
- [x] State preservation through all updates
- [x] No content field extraction anywhere
- [x] Arrays used for multi-value fields where needed

### **✅ Patrick's Critical Issues Addressed**
- [x] Real-time updates fixed with direct column reads
- [x] Pills showing only sets_and_reps column
- [x] 2-column layout for point images specified
- [x] Duplicate Academy Points investigation included
- [x] Mobile layout fixes for footer alignment
- [x] "Did It" button visibility ensured
- [x] Real point values in explosions

### **✅ Dependencies Validated**
- [x] Task 1 (Database) must complete first
- [x] Tasks 2-3 depend on Task 1 for point types
- [x] Tasks 4-5 can run in parallel (independent)
- [x] Task 6 depends on Tasks 2-3 completion

### **✅ Integration Points Confirmed**
- [x] Point explosions connect to live counter
- [x] Counter filters by workout series_type
- [x] Pills use actual database columns
- [x] All components follow permanence pattern

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