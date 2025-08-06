# A4CC - Skills Academy Workout Builder Architect

**Agent Purpose**: Build comprehensive workout builder and structured learning paths for the Skills Academy, implementing multiplier systems and coach-assigned workout capabilities.

**Development Environment**: Next.js development server running at `http://localhost:3000`

**Priority**: HIGH - Leverages existing sophisticated foundation to deliver player engagement value

---

## 🎯 **Agent Mission**

Transform the existing Skills Academy from static workout collections into a dynamic workout builder system "in the same way that we built out the Practice Planner." Implement structured learning paths with Mini/More/Complete variants, multiplier systems for category streaks, and coach assignment capabilities for team integration.

---

## 📍 **Current State Analysis**

### **Existing Skills Academy Strengths** ✅
- **Sophisticated Backend**: 167 individual drills, 192 workout collections imported
- **Advanced Gamification**: Phase 1 complete with 7-category point system, streak tracking
- **Interactive Workout Player**: `/src/app/(authenticated)/skills-academy/interactive-workout/page.tsx` (17KB, 467 lines)
- **Progress Tracking**: `/src/app/(authenticated)/skills-academy/progress/page.tsx` (12KB, 368 lines)
- **Point Calculation Engine**: Server-side anti-gaming system with difficulty multipliers

### **Database Foundation** ✅
```sql
-- 167 Individual Drills Ready
skills_academy_drills: title, vimeo_id, drill_category, point_values, complexity

-- 192 Workout Collections Ready  
skills_academy_workouts: workout_type, duration_minutes, drill_count, point_values

-- 7-Category Point System Active
Point Categories: lax_credit, attack_tokens, defense_dollars, midfield_medals, 
                 rebound_rewards, lax_iq_points, flex_points
```

### **Missing Workout Builder System** ❌
- No custom workout creation interface
- No structured learning paths (Mini/More/Complete)
- No workout builder like Practice Planner
- No coach assignment system
- No multiplier system for category streaks

---

## 🎯 **Implementation Requirements**

### **Phase 1: Workout Builder Interface (2-3 hours)**

#### **New Components to Create**
```
/src/app/(authenticated)/skills-academy/workout-builder/
└── page.tsx                     # Main workout builder interface

/src/components/skills-academy/workout-builder/
├── WorkoutBuilderLayout.tsx     # Main builder interface (Practice Planner style)
├── DrillLibraryAcademy.tsx      # Academy drill selection (category-focused)
├── WorkoutTimeline.tsx          # Drag & drop workout sequence
├── WorkoutSummary.tsx           # Point calculation and duration display
├── CategoryBalance.tsx          # Visual category distribution
├── SaveWorkoutModal.tsx         # Save custom workout
└── WorkoutTemplates.tsx         # Pre-built workout templates
```

**Enhanced Existing Components**:
```
/src/app/(authenticated)/skills-academy/workouts/page.tsx
├── Add "Build Custom Workout" button
├── Display user-created workouts
└── Show structured learning paths

/src/components/skills-academy/
├── WorkoutCard.tsx              # Enhanced with builder-created workouts
└── CategoryPointsDisplay.tsx    # Show multiplier opportunities
```

#### **Workout Builder Interface Design**

**Main Builder Layout** (Inspired by Practice Planner):
```
┌─────────────────────────────────────────────────┐
│ 🏗️ Custom Workout Builder                      │
├─────────────────────────────────────────────────┤
│ Workout Name: [My Attack Focus] Duration: 12min │
│ Primary Category: [Attack ▼] Level: [Building] │
│                                                 │
│ 📊 Point Breakdown:                            │
│ ⚔️ Attack: 15pts  🛡️ Defense: 0pts  💰 Lax: 15pts│
│ Category Streak: 4/5 drills → 2x multiplier!  │
├─────────────────────────────────────────────────┤
│ 🎯 WORKOUT SEQUENCE                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Wall Ball Series      3 min    [⋮] [×]  │ │
│ │    Foundation | 3 pts ⚔️ 3 pts 💰         │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 2. Split Dodge Series    4 min    [⋮] [×]  │ │
│ │    Building | 6 pts ⚔️ 6 pts 💰           │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 3. Shooting Mechanics    5 min    [⋮] [×]  │ │
│ │    Advanced | 12 pts ⚔️ 12 pts 💰         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [+ Add Drill] [Save Workout] [Start Workout]  │
└─────────────────────────────────────────────────┘
```

**Academy Drill Library** (Category-Focused):
```
┌─────────────────────────────────────────────────┐
│ 🎯 Skills Academy Drill Library                │
├─────────────────────────────────────────────────┤
│ Filter: [All] [Attack] [Defense] [Midfield]    │
│ Level: [Foundation] [Building] [Advanced]      │
│ Duration: [Quick <5min] [Medium 5-10] [Long >10]│
│                                                 │
│ ⚔️ ATTACK DRILLS (28 available)                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Split Dodge Series      [+ Add]   📹 ⭐    │ │
│ │ 4 min | Building | 6 pts ⚔️ 6 pts 💰       │ │
│ │ Equipment: Stick, Ball, Cone              │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Shooting Mechanics      [+ Add]   📹 ⭐    │ │
│ │ 5 min | Advanced | 12 pts ⚔️ 12 pts 💰     │ │
│ │ Equipment: Stick, Ball, Goal              │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🛡️ DEFENSE DRILLS (59 available)              │
│ [Show Defense Drills...]                      │
│                                                 │
│ Total Drills: 167 | Filtered: 28              │
└─────────────────────────────────────────────────┘
```

### **Phase 2: Structured Learning Paths (1-2 hours)**

#### **Learning Path System**

**Pre-Built Workout Templates**:
```typescript
const structuredWorkouts = {
  attack: {
    mini: {
      name: "Attack Foundations - Mini",
      duration: 5,
      drills: ["Wall Ball Basic", "Catch & Throw", "Shooting Form"],
      complexity: "foundation",
      target_points: { attack_tokens: 5, lax_credit: 5 }
    },
    more: {
      name: "Attack Development - More", 
      duration: 10,
      drills: ["Split Dodge", "Roll Dodge", "Basic Shooting", "Wall Ball Series"],
      complexity: "building",
      target_points: { attack_tokens: 12, lax_credit: 12 }
    },
    complete: {
      name: "Attack Mastery - Complete",
      duration: 16,
      drills: ["Advanced Dodging", "Shooting Variety", "1v1 Situations", "Pressure Drills"],
      complexity: "advanced", 
      target_points: { attack_tokens: 25, lax_credit: 25 }
    }
  }
  // Similar for midfield, defense, wall_ball
}
```

**Learning Path Interface**:
```
┌─────────────────────────────────────────────────┐
│ 🎓 Structured Learning Paths                   │
├─────────────────────────────────────────────────┤
│ ⚔️ ATTACK DEVELOPMENT PATH                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📍 Mini (5 min)     ●●○ Completed 2/3      │ │
│ │    Foundation Level | 5 pts each category   │ │
│ │    [Continue Path] [Start Over]            │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📈 More (10 min)    ○○○ Locked             │ │
│ │    Building Level | 12 pts each category   │ │
│ │    Unlock: Complete 3 Mini workouts        │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🏆 Complete (16 min) ○○○ Locked            │ │
│ │    Advanced Level | 25 pts each category   │ │
│ │    Unlock: Complete 5 More workouts        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🛡️ DEFENSE DEVELOPMENT PATH                   │
│ [Show Defense Path...]                         │
│                                                 │
│ [Build Custom Workout]                         │
└─────────────────────────────────────────────────┘
```

### **Phase 3: Multiplier System & Coach Integration (1-2 hours)**

#### **Category Streak Multiplier System**

**Multiplier Logic**:
```typescript
const calculateCategoryMultiplier = (recentWorkouts: Workout[], category: string) => {
  // Count consecutive drills in same category
  let streakCount = 0
  
  for (const workout of recentWorkouts) {
    const categoryDrills = workout.drills.filter(drill => 
      drill.primary_category === category
    )
    streakCount += categoryDrills.length
    
    if (categoryDrills.length === 0) break // Streak broken
  }
  
  // Multiplier brackets
  if (streakCount >= 5) return { multiplier: 2.0, message: "2x Category Master!" }
  if (streakCount >= 8) return { multiplier: 2.5, message: "2.5x Category Expert!" }
  if (streakCount >= 12) return { multiplier: 3.0, message: "3x Category Legend!" }
  
  return { multiplier: 1.0, progress: streakCount, next: 5 - streakCount }
}
```

**Multiplier Display**:
```
┌─────────────────────────────────────────────────┐
│ 🔥 Category Streak Status                      │
├─────────────────────────────────────────────────┤
│ ⚔️ Attack Streak: 4/5 drills → 2x multiplier  │
│ ████▒ 1 more attack drill for bonus!           │
│                                                 │
│ 🛡️ Defense Streak: 2/5 drills                  │
│ ██▒▒▒ 3 more defense drills needed             │
│                                                 │
│ 🏃 Midfield: No streak (0/5)                   │
│ ▒▒▒▒▒ Start midfield drills for bonus          │
│                                                 │
│ 💡 Pro Tip: Focus on Attack to unlock 2x bonus!│
└─────────────────────────────────────────────────┘
```

#### **Coach Assignment System**

**Coach Workout Assignment Interface**:
```typescript
// New component for coaches
/src/components/team-management/WorkoutAssignments.tsx

interface CoachAssignment {
  assignmentId: string
  coachId: string
  playerId: string  
  workoutId: string
  dueDate: Date
  bonusMultiplier: number  // 1.5x, 2x for completion
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue'
  completedAt?: Date
}
```

**Coach Assignment Interface**:
```
┌─────────────────────────────────────────────────┐
│ 👨‍🏫 Assign Workouts to Players                   │
├─────────────────────────────────────────────────┤
│ Select Players: [☑ John Smith] [☑ Mike Jones]  │
│                 [☐ Sarah Wilson] [☐ All Players]│
│                                                 │
│ Workout Assignment:                             │
│ ○ Pre-built Workout: [Attack More - 10min ▼]  │
│ ● Custom Workout: [My Attack Focus]           │
│                                                 │
│ Assignment Details:                             │
│ Due Date: [March 20, 2024 ▼]                  │
│ Bonus Points: [1.5x ▼] [2x] [None]            │
│ Message: [Focus on shooting form and...]       │
│                                                 │
│ [Assign Workout] [Save as Template]           │
└─────────────────────────────────────────────────┘
```

**Player Assignment View**:
```
┌─────────────────────────────────────────────────┐
│ 📋 Coach Assignments                           │
├─────────────────────────────────────────────────┤
│ 🎯 NEW ASSIGNMENT                              │
│ ┌─────────────────────────────────────────────┐ │
│ │ Attack Focus Workout    Due: March 20      │ │
│ │ From: Coach Johnson     Bonus: 1.5x points │ │
│ │ "Focus on shooting form and follow through"│ │
│ │ [Start Workout] [View Details]             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ✅ COMPLETED                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ Defense Fundamentals    Completed: March 18│ │
│ │ Earned: 36 pts (24 base + 1.5x bonus)     │ │
│ │ Coach feedback: "Great improvement!"       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### **Flex Points for External Workouts**

**External Workout Logging**:
```
┌─────────────────────────────────────────────────┐
│ 📝 Log External Workout                        │
├─────────────────────────────────────────────────┤
│ Workout Type: ○ Individual Training            │
│               ● Team Practice                   │
│               ○ Other Sport                     │
│                                                 │
│ Duration: [___] minutes                        │
│ Intensity: ○ Light ● Moderate ○ High          │
│                                                 │
│ Description (optional):                         │
│ [Worked on shooting with wall ball for 30     │
│ minutes, then stick handling drills...]        │
│                                                 │
│ Flex Points Earned: 8 pts 💪                  │
│ (Based on duration × intensity)                │
│                                                 │
│ [Log Workout] [Cancel]                         │
└─────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation Details**

### **Workout Builder Data Structure**

#### **Custom Workout Schema**
```typescript
interface CustomWorkout {
  id: string
  name: string
  created_by: string
  workout_type: 'custom' | 'coach_assigned' | 'template'
  drill_sequence: {
    drill_id: string
    order: number
    duration_override?: number
    notes?: string
  }[]
  estimated_duration: number
  point_breakdown: {
    lax_credit: number
    attack_tokens: number
    defense_dollars: number
    midfield_medals: number
    rebound_rewards: number
    lax_iq_points: number
    flex_points: number
  }
  difficulty_level: 'foundation' | 'building' | 'advanced'
  created_at: string
  usage_count: number
}
```

#### **Multiplier Calculation Engine**
```typescript
const calculateWorkoutPoints = async (
  workoutId: string, 
  userId: string,
  isCoachAssigned: boolean = false
) => {
  const workout = await getWorkout(workoutId)
  const userHistory = await getUserRecentWorkouts(userId, 30) // Last 30 days
  
  let totalPoints = {}
  
  for (const drill of workout.drills) {
    const basePoints = drill.point_values
    
    // Category streak multiplier
    const categoryMultiplier = calculateCategoryMultiplier(
      userHistory, 
      drill.primary_category
    )
    
    // Coach assignment bonus
    const assignmentBonus = isCoachAssigned ? 1.5 : 1.0
    
    // Apply multipliers
    Object.keys(basePoints).forEach(category => {
      const finalPoints = basePoints[category] * 
                         categoryMultiplier.multiplier * 
                         assignmentBonus
      totalPoints[category] = (totalPoints[category] || 0) + finalPoints
    })
  }
  
  return {
    points: totalPoints,
    multipliers: {
      category: categoryMultiplier,
      assignment: assignmentBonus
    }
  }
}
```

### **Learning Path Progression System**

#### **Path Unlock Logic**
```typescript
const checkPathUnlock = async (userId: string, path: string, level: string) => {
  const userProgress = await getUserPathProgress(userId, path)
  
  const unlockRequirements = {
    'mini': { prerequisite: null, required: 0 },
    'more': { prerequisite: 'mini', required: 3 },
    'complete': { prerequisite: 'more', required: 5 }
  }
  
  const requirement = unlockRequirements[level]
  if (!requirement.prerequisite) return true
  
  const prerequisiteCompletions = userProgress.filter(
    p => p.level === requirement.prerequisite && p.status === 'completed'
  ).length
  
  return prerequisiteCompletions >= requirement.required
}
```

### **Coach Assignment Database**

#### **Assignment Tables**
```sql
-- Coach workout assignments
CREATE TABLE workout_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES users(id),
  player_id UUID REFERENCES users(id),
  workout_id UUID REFERENCES skills_academy_workouts(id),
  custom_workout_id UUID REFERENCES custom_workouts(id),
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  bonus_multiplier DECIMAL DEFAULT 1.0,
  assignment_message TEXT,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMPTZ,
  points_earned JSONB,
  coach_feedback TEXT
);
```

---

## 🎨 **UI/UX Requirements**

### **Workout Builder Visual Design**

**Builder Interface Consistency**:
- Follow Practice Planner drag-and-drop patterns
- Use same timeline visualization approach
- Maintain consistent color coding for categories
- Reuse modal and form components

**Point Visualization**:
```
Category Point Breakdown:
⚔️ Attack: ████████░░ 15 pts (60%)
🛡️ Defense: ██░░░░░░░░ 3 pts (12%)  
💰 Lax Credit: ███████░░░ 13 pts (52%)
🔥 Multiplier: 2x streak bonus active!
```

### **Learning Path User Experience**

**Progressive Disclosure**:
- Show only unlocked levels initially
- Animate unlock celebrations
- Clear progress indicators
- Motivational messaging for requirements

**Workout Card Enhancements**:
```
┌─────────────────────────────────────────────────┐
│ 📊 Attack Development - More                   │
├─────────────────────────────────────────────────┤
│ ⏱️ 10 min | 🏗️ Building | ⚔️ 12 pts 💰 12 pts │
│                                                 │
│ Progress: ●●●○○ 3/5 completed                  │
│ Next unlock: Complete path 2 more times        │
│                                                 │
│ 🔥 Streak bonus available! (+2x Attack)       │
│ 👨‍🏫 Coach assignment: Due March 20 (+1.5x)     │
│                                                 │
│ [Start Workout] [View Drills] [Assign to Team] │
└─────────────────────────────────────────────────┘
```

---

## ✅ **Acceptance Criteria**

### **Phase 1 Complete When**:
- [ ] Users can build custom workouts by selecting academy drills
- [ ] Workout builder interface matches Practice Planner quality and usability
- [ ] Point calculations work correctly for custom workouts
- [ ] Drag-and-drop drill sequencing functions smoothly
- [ ] Custom workouts save and load properly

### **Phase 2 Complete When**:
- [ ] Structured learning paths (Mini/More/Complete) are available for Attack/Defense/Midfield/Wall Ball
- [ ] Path progression system unlocks advanced levels based on completion requirements
- [ ] Learning path interface is intuitive and motivating
- [ ] Pre-built workouts match specified duration and complexity targets

### **Phase 3 Complete When**:
- [ ] Category streak multipliers (2x after 4-5 drills) calculate and display correctly
- [ ] Coaches can assign workouts to players with bonus multipliers
- [ ] Players see coach assignments clearly with due dates and bonuses
- [ ] External workout logging awards appropriate Flex Points
- [ ] All multiplier systems integrate with existing gamification

---

## 🚀 **Immediate Action Items**

### **Start Here** (Next 30 minutes):
1. **Create workout builder route and basic layout**
2. **Build drill selection interface for academy drills**
3. **Implement basic drag-and-drop workout sequencing**
4. **Test point calculation for custom workouts**

### **Core Builder Features** (Next 90 minutes):
1. **Complete workout builder interface with all academy drills**
2. **Implement workout saving and loading functionality**
3. **Add category balance visualization and multiplier preview**
4. **Test complete custom workout creation and execution**

### **Learning Path System** (Next 60 minutes):
1. **Build structured workout templates for all 4 categories**
2. **Implement path progression and unlock system**
3. **Create learning path interface with progress tracking**
4. **Test path unlock requirements and progression flow**

### **Advanced Features** (Next 60 minutes):
1. **Implement category streak multiplier system**
2. **Build coach assignment interface and player view**
3. **Add external workout logging with Flex Points**
4. **Test all multiplier interactions with existing gamification**

---

## 🔍 **Testing & Validation**

### **Builder Functionality Testing**
- [ ] Custom workout creation works smoothly
- [ ] Drill library filtering and selection is intuitive
- [ ] Point calculations match expected values
- [ ] Workout sequences save and restore correctly
- [ ] Interface performs well with 167+ drills

### **Learning Path Testing**
- [ ] Mini/More/Complete progression feels natural
- [ ] Unlock requirements work as specified
- [ ] Path completion tracking is accurate
- [ ] Difficulty progression makes sense for skill development

### **Multiplier System Testing**
- [ ] Category streaks calculate correctly (4-5 drills → 2x)
- [ ] Coach assignment bonuses apply properly (1.5x)
- [ ] Multiple multipliers stack appropriately
- [ ] Flex Points award reasonable values for external workouts

### **Integration Testing**
- [ ] Workout builder connects seamlessly with existing Skills Academy
- [ ] Coach assignments integrate with team management
- [ ] Point awards integrate with existing gamification system
- [ ] Progress tracking updates across all interfaces

---

## 📚 **Resources & References**

### **Existing Implementation Patterns**
- Study `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` for builder interface patterns
- Review `/src/components/practice-planner/DrillLibrary.tsx` for drill selection patterns
- Reference `/src/lib/gamification/point-calculator.ts` for point calculation integration

### **Skills Academy Foundation**
- Use `/src/app/(authenticated)/skills-academy/workouts/page.tsx` for workout display patterns
- Leverage `/src/app/(authenticated)/skills-academy/interactive-workout/page.tsx` for workout execution
- Build on `/src/hooks/useSupabaseDrills.ts` for academy drill data

### **Database Integration**
- Reference existing skills academy tables in `/scripts/imports/skills_academy_complete_import.sql`
- Use gamification system from `/src/lib/gamification/` for point integration
- Follow team management patterns for coach assignment features

---

## 🎯 **Success Metrics**

- **User Engagement**: Custom workout creation increases daily active users by 40%
- **Skill Development**: Structured learning paths improve player progression tracking
- **Coach Adoption**: 70% of coaches use workout assignment features
- **Point System Balance**: Multiplier system increases engagement without breaking game balance
- **System Integration**: Workout builder feels like natural extension of existing Skills Academy

The vision: Transform Skills Academy from static content consumption into dynamic, personalized skill development - making every player's journey unique while maintaining the sophisticated gamification that drives engagement!