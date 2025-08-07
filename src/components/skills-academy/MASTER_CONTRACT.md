# 🎓 **Skills Academy Pages Master Controller Contract**

*Created: 2025-01-16 | Status: AWAITING AGENT NEGOTIATION*  
*Target Pages: `src/app/(authenticated)/skills-academy/workouts/page.tsx`, `interactive-workout/page.tsx`, `progress/page.tsx`*  
*Component Directory: `src/components/skills-academy/`*

---

## ⚠️ **MANDATORY AGENT INSTRUCTIONS**

### **🔴 CRITICAL: READ BEFORE ANY CHANGES**
1. **MAJOR RESTRUCTURING REQUIRED** - Skills Academy needs significant changes
2. **DIRECT NEGOTIATION REQUIRED** - Propose specific changes, get user approval
3. **QUIZ-STYLE INTERFACE** - Sequential drill presentation, not Netflix browsing
4. **REAL DATA INTEGRATION** - Connect to `skills_academy_drills` & `skills_academy_workouts`
5. **MOBILE-FIRST APPROACH** - Players use phones during workouts

### **📋 CONTRACT NEGOTIATION PROCESS**
1. **ANALYZE** current state vs. user requirements thoroughly
2. **PROPOSE** specific implementation plan for each major change
3. **NEGOTIATE** with user until contract matches their vision exactly
4. **IMPLEMENT** only user-approved changes
5. **SUB-AGENT COORDINATION** - Deploy specialized agents for complex page rebuilds
6. **TESTING VALIDATION** - All sub-agents must test with Playwright before reporting
7. **MANDATORY CHECKOUT** - Get explicit user approval before exiting Claude

---

## 🎯 **SKILLS ACADEMY VISION: MAJOR CHANGES NEEDED**

### **🔄 CURRENT STATE vs. REQUIRED STATE**

#### **Current Implementation (Needs Major Changes)**
```
❌ Basic workout display page (Netflix-style browsing)
❌ Mock progress data everywhere
❌ No quiz-style drill interface
❌ No real point tracking system
❌ No workout builder
❌ No multiplier system
❌ No competition features
❌ No coach assignment system
```

#### **Required Implementation (User's Vision)**
```
✅ 2 Main Pages:
   Page 1: Workout Selection (with variants: Mini/More/Complete)
   Page 2: Quiz-Style Drill Interface (sequential presentation)

✅ Real Point System:
   - Attack Tokens, Defense Dollars, Midfield Medals
   - Rebound Rewards, Lax Credits, Flex Points
   - Base points for partial completion
   - Multipliers only for full workout completion

✅ Anti-Cheating Design:
   - Time tracking for analysis (not enforcement)
   - Optional video references (skippable after 15s)
   - Big captions for music listening
   - No "lose all points" on exit

✅ Consistency Features:
   - Streak tracking and multipliers
   - Coach-assigned workout bonuses
   - Team competitions and leaderboards
   - Progress tracking by date
```

---

## 🗄️ **DATA INTEGRATION REQUIREMENTS**

### **Primary Data Sources (FULLY IMPORTED)**
```sql
-- Skills Academy Drills (167 items)
skills_academy_drills {
  id, title, vimeo_id, drill_category[],
  equipment_needed[], age_progressions,
  space_needed, complexity, sets_and_reps,
  duration_minutes, point_values (JSONB),
  tags[]
}

-- Skills Academy Workouts (192 items)  
skills_academy_workouts {
  id, title, workout_type, duration_minutes,
  point_values (JSONB), tags[], description,
  drill_count
}

-- Point Values Structure (JSONB)
point_values: {
  "lax_credit": 1,
  "attack_token": 1,
  "defense_dollar": 1,
  "midfield_medal": 1,
  "rebound_reward": 5
}
```

### **Required New Tables**
```sql
-- User point balances (per point type)
user_points_balance_powlax {
  user_id, lax_credit, attack_token,
  defense_dollar, midfield_medal,
  rebound_reward, flex_points
}

-- Workout completion tracking
workout_completions {
  user_id, workout_id, completion_date,
  points_earned (JSONB), duration_seconds,
  completed_fully, multiplier_applied
}

-- User streak tracking
user_streak_data {
  user_id, current_streak, longest_streak,
  last_workout_date, weekly_target,
  consistency_bonus
}

-- Coach workout assignments
coach_workout_assignments {
  coach_id, player_id, workout_id,
  assigned_date, bonus_multiplier,
  completion_deadline
}
```

---

## 🛠️ **MAJOR COMPONENT CHANGES REQUIRED**

### **📱 Page 1: Workout Selection Enhancement**

#### **Current: `src/app/(authenticated)/skills-academy/workouts/page.tsx`**
**Status:** ⚠️ Basic implementation, needs major enhancement

**Current Issues:**
- Basic workout list display
- No variant selection (Mini/More/Complete)
- Mock user stats
- No real point system integration

**Required Changes:**
1. **Workout Display Enhancement**
   - Show real workouts from `skills_academy_workouts`
   - Display point values for each workout type
   - Show workout variants (Mini/More/Complete)
   - Filter by Attack/Defense/Midfield/Wall Ball

2. **Variant Selection Modal**
   - Mini: 5 drills/minutes
   - More: 10 drills/minutes  
   - Complete: 14-18 drills/minutes
   - Show expected point values for each

3. **Real Point Integration**
   - Connect to `user_points_balance_powlax`
   - Display current point balances by type
   - Show streak information

### **📱 Page 2: Quiz-Style Drill Interface (NEW)**

#### **Current: `src/app/(authenticated)/skills-academy/interactive-workout/page.tsx`**
**Status:** ❌ Wrong approach, needs complete rebuild

**Current Issues:**
- Mock drill data
- Not quiz-style interface
- No real video integration
- No point tracking

**Required Implementation:**
1. **Sequential Drill Presentation**
   - One drill at a time (quiz-style)
   - Big captions for music listening
   - Optional video reference (skippable after 15s)
   - Simple "Did It" / "Next" buttons

2. **Real Video Integration**
   - Connect to `skills_academy_drills.vimeo_id`
   - Auto-pause music when video plays
   - Resume music when video pauses/ends
   - Fallback for missing videos

3. **Point Tracking System**
   - Base points for each drill completed
   - Track completion percentage
   - Apply multipliers only for 100% completion
   - Save to `workout_completions` table

4. **Anti-Cheating Design**
   - Time tracking for analysis only
   - No enforcement of minimum time
   - No penalty for early exit
   - Focus on encouragement, not punishment

### **📊 Page 3: Progress Enhancement**

#### **Current: `src/app/(authenticated)/skills-academy/progress/page.tsx`**
**Status:** ⚠️ Mock data, needs real integration

**Current Issues:**
- All mock progress data
- No real point balance display
- No streak tracking
- No competition features

**Required Changes:**
1. **Real Progress Data**
   - Connect to `user_points_balance_powlax`
   - Show points earned by date
   - Display current streaks
   - Real workout completion history

2. **Competition Features**
   - Team leaderboards
   - Individual competitions
   - Coach-assigned workout tracking
   - Real-time progress updates

---

## 🎯 **COMPONENT-BY-COMPONENT ENHANCEMENT PLAN**

### **🎛️ Core Components (TO BE BUILT)**

#### **WorkoutLibrary.tsx** - Priority: HIGH
**Status:** ❌ Doesn't exist, needs to be built

**Requirements:**
- Display workouts from `skills_academy_workouts`
- Filter by workout_type (attack, defense, midfield, wall_ball)
- Show point values and duration for each variant
- Trigger WorkoutVariantSelector modal

#### **DrillPlayer.tsx** - Priority: CRITICAL
**Status:** ❌ Doesn't exist, core feature missing

**Requirements:**
- Quiz-style sequential drill presentation
- Connect to `skills_academy_drills` via workout relationships
- Optional video playback with big captions
- Point tracking and completion logic
- Mobile-optimized interface

#### **WorkoutBuilder.tsx** - Priority: MEDIUM
**Status:** ❌ Doesn't exist, needed for custom workouts

**Requirements:**
- Allow users to create custom workouts from drills
- Save to user-specific workout table
- Point calculation for custom workouts
- Similar to Practice Planner drill selection

### **🎭 Modal Components (TO BE BUILT)**

#### **WorkoutVariantSelector.tsx** - Priority: HIGH
**Status:** ❌ Doesn't exist, critical for user experience

**Requirements:**
- Modal triggered from workout cards
- Show Mini/More/Complete options
- Display expected points and duration
- Launch DrillPlayer with selected variant

#### **CompletionModal.tsx** - Priority: HIGH
**Status:** ❌ Doesn't exist, needed for gamification

**Requirements:**
- Show points earned by type
- Display completion percentage
- Apply and show multipliers
- Streak updates and celebrations

### **🏆 Gamification Components (TO BE BUILT)**

#### **PointSystem.tsx** - Priority: CRITICAL
**Status:** ❌ Doesn't exist, core feature missing

**Requirements:**
- Multi-type point management
- Real-time balance updates
- Multiplier calculations
- Database persistence

#### **MultiplierEngine.tsx** - Priority: HIGH
**Status:** ❌ Doesn't exist, needed for engagement

**Requirements:**
- Streak-based multipliers
- Consistency bonuses
- Coach-assigned workout bonuses
- Competition multipliers

---

## 🎯 **SUCCESS CRITERIA**

### **User Experience Requirements**
1. ✅ **Page 1**: Players can browse and select workout variants easily
2. ✅ **Page 2**: Quiz-style drill interface works smoothly on mobile
3. ✅ **Point System**: Multi-type points track accurately by date
4. ✅ **Video Integration**: Optional videos with music-friendly captions
5. ✅ **Anti-Cheating**: Encouragement-based, not punishment-based
6. ✅ **Consistency**: Streak tracking motivates regular workouts

### **Technical Requirements**
1. ✅ All data from real Supabase tables (no mock data)
2. ✅ Mobile-first responsive design
3. ✅ Offline capability after initial load
4. ✅ Fast loading (< 3 seconds on mobile)
5. ✅ Proper error handling for missing data
6. ✅ Real-time point balance updates

### **Coaching Requirements**
1. ✅ Coaches can assign specific workouts to players
2. ✅ Coaches see player progress by date
3. ✅ Team competitions and leaderboards work
4. ✅ Directors see all Team HQ totals
5. ✅ Bonus points for coach-assigned workouts

---

## 🤖 **AGENT NEGOTIATION TEMPLATE**

### **Phase 1: Comprehensive Analysis**
```markdown
## Current State Analysis
- Existing Pages: [Detailed review of 3 current pages]
- Data Connections: [What's connected vs. what's mock]
- Missing Components: [Critical components that don't exist]
- User Experience Gaps: [Current UX vs. required UX]

## Required Changes Summary
- Major Rebuilds: [Components needing complete rebuild]
- New Components: [Components that need to be built from scratch]
- Data Integration: [Database connections needed]
- Mobile Optimization: [Mobile-specific requirements]

## Implementation Complexity Assessment
- High Priority: [Critical components for MVP]
- Medium Priority: [Important but not blocking]
- Future Enhancements: [Nice-to-have features]
```

### **Phase 2: Detailed Implementation Proposal**
```markdown
## Page-by-Page Implementation Plan
- Page 1 (Workout Selection): [Specific changes needed]
- Page 2 (Drill Interface): [Complete rebuild requirements]
- Page 3 (Progress): [Data integration requirements]

## Component Development Plan
- Core Components: [Build order and dependencies]
- Modal Components: [Integration requirements]
- Gamification: [Point system implementation]

## Database Schema Requirements
- New Tables: [Tables that need to be created]
- Existing Tables: [Tables that need modifications]
- Data Migration: [Any data migration needed]
```

### **Phase 3: User Negotiation & Approval**
- Present specific proposals for each major change
- Get explicit approval for rebuild vs. enhancement approach
- Adjust based on user feedback and priorities
- Finalize implementation contract with timeline

### **Phase 4: Implementation Execution**
- Execute only user-approved changes
- Build components in approved priority order
- Test each component thoroughly on mobile
- Provide progress updates throughout

---

## 📞 **READY FOR DEPLOYMENT**

### **Master Agent Deployment Command:**
```
"Deploy Master Skills Academy Enhancement Agent with comprehensive analysis and major restructuring plan"
```

### **Agent Success Metrics:**
- ✅ Complete analysis of current state vs. requirements
- ✅ Detailed proposal for major component changes
- ✅ User approval for all significant changes
- ✅ Quiz-style interface implementation
- ✅ Real point system integration
- ✅ Mobile-first workout experience

**The agent must negotiate this major restructuring contract directly with the user before making any code changes.**

---

## 🔒 **MANDATORY USER CHECKOUT PROTOCOL**

### **🚨 CRITICAL: NO EXIT WITHOUT APPROVAL**
The Master Controller **CANNOT EXIT CLAUDE** until the user explicitly approves completion.

### **Checkout Process Requirements:**
```markdown
## 📋 CONTRACT COMPLETION CHECKLIST

### **Page Implementation Status**
- [ ] Workout Selection Page (workouts/page.tsx) - Enhanced with variants
- [ ] Quiz-Style Interface (interactive-workout/page.tsx) - Completely rebuilt
- [ ] Progress Tracking Page (progress/page.tsx) - Real data integration
- [ ] All sub-agent tasks completed and tested
- [ ] Playwright tests passing for all page changes
- [ ] Mobile responsiveness verified on all pages
- [ ] Database connections working (skills_academy_drills & workouts)
- [ ] Point system integration functional

### **User Approval Required**
- [ ] User has tested all 3 pages
- [ ] User approves quiz-style drill interface
- [ ] User confirms point system working correctly
- [ ] User verifies mobile experience during workout
- [ ] User grants permission to exit

### **Final Actions**
- [ ] Update all component documentation
- [ ] Log all major changes made
- [ ] Provide deployment instructions for 3 pages
- [ ] Archive completed contract
```

### **Exit Protocol:**
1. **Present Page-by-Page Summary** - Show all 3 pages completed
2. **Request User Testing** - Ask user to test workout flow end-to-end
3. **Discuss Implementation** - Review multi-agent coordination and modifications
4. **Get Explicit Approval** - "Do you approve all 3 pages and grant permission to exit?"
5. **Only Exit After "YES"** - Must receive explicit user approval

### **Multi-Agent Coordination Protocol:**
```markdown
## 🤖 SUB-AGENT MANAGEMENT FOR SKILLS ACADEMY

### **Specialized Sub-Agent Deployment:**
- **Page 1 Agent**: Workout Selection Enhancement (workouts/page.tsx)
- **Page 2 Agent**: Quiz-Style Interface Builder (interactive-workout/page.tsx)
- **Page 3 Agent**: Progress Integration Specialist (progress/page.tsx)
- **Component Agent**: Skills Academy Component Builder
- **Database Agent**: Point System & Table Integration
- **Testing Agent**: Playwright Test Suite Developer

### **Sub-Agent Testing Requirements:**
- **Page Agents**: Must write Playwright tests for their specific page
- **Component Agents**: Must test component integration with pages
- **Database Agents**: Must test point calculations and data persistence
- **Mobile Tests**: All agents test on mobile viewport (375px+)
- **Workout Flow Tests**: End-to-end testing of complete workout experience

### **Sub-Agent Coordination:**
- Master Controller assigns page-specific contracts to sub-agents
- Sub-agents report completion with test results and screenshots
- Master Controller validates integration between all 3 pages
- Master Controller ensures quiz-style interface consistency
- Master Controller presents unified Skills Academy experience to user
```
