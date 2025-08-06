# A4CC - Skills Academy Player Interface Enhancement

## 🎯 **Agent Mission (EXPANSION)**
**For the EXISTING Skills Academy Workout Builder Agent:** Expand your scope to build the player-facing workout interface and integrate with actual Supabase drill data.

## 🚨 **CRITICAL ERROR PREVENTION**

### **🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)**
**BEFORE creating any file**: Verify ALL imports exist
- **Check these paths work**:
  - `@/contexts/JWTAuthContext` ✅ (for auth)
  - `@/components/ui/...` ✅ (for UI components)
  - `@/lib/supabase` ✅ (for database)
- **NEVER import**: `@/hooks/useAuthContext` ❌ (doesn't exist)

### **🔄 useEffect Dependencies**
- Only include external state in dependencies
- Don't include state modified inside the effect
- Example: `[workoutId, currentDrill, userProgress]` ✅

### **🛡️ Null Safety (UI Crashes)**
- Always use: `drill?.title?.toLowerCase() ?? ''`
- Filter functions: `(drill.equipment_needed?.includes(equipment) ?? false)`
- Database queries: `drills?.map() ?? []`

### **🗄️ Database Safety**
- Always handle null values from DB: `workout?.drills ?? []`
- Use proper TypeScript interfaces for Supabase queries
- Test queries with empty result sets

### **🔧 After Changes**
- Restart server if making new files: `rm -rf .next && npm run dev`
- Verify correct port in terminal output

## 📊 **Current State & New Requirements**

### **What You've Already Built** ✅
- Skills Academy Workout Builder at `/skills-academy/workout-builder`
- Position selection interface (Attack, Midfield, Defense, Goalie, Wall Ball)
- Workout template system (Mini, More, Complete)
- Basic workout statistics tracking

### **NEW: What Players Need** 🆕
- **Quiz-Style Drill Interface** - Each drill presented like a quiz question in order
- **Real Drill Integration** - Connect to actual Supabase drill data
- **Video Reference System** - Quick video reference, then do the drill (no time requirements)
- **Two-Track System** - Exposure vs Mastery workout paths

## 🎯 **Phase 2 Expansion Goals**

### **1. Player Workout Interface** ⭐⭐⭐
```typescript
// New route to create
/skills-academy/player  
/skills-academy/workouts/[workoutId]
/skills-academy/workouts/[workoutId]/play
```

### **2. Real Drill Data Integration** ⭐⭐⭐
```typescript
// Connect workout builder to Supabase tables
- skills_academy_drills
- skills_academy_workouts  
- academy_drills
- drills (for cross-reference)
```

### **3. Quiz-Style Drill Player** ⭐⭐⭐
```typescript
// Quiz-like drill presentation
- Start workout → sequential drill presentation (like quiz questions)
- Each drill shows: video reference + optional context text
- Players can skip video after seeing what drill is (15+ seconds)
- "Complete Drill" button moves to next drill
- Linear progression through workout
```

## 🏗️ **New Components to Build**

### **1. Player Dashboard Interface**
```typescript
// src/app/(authenticated)/skills-academy/player/page.tsx
interface PlayerDashboardProps {
  currentUser: User
  userProgress: UserProgress  
  recommendedWorkouts: Workout[]
  assignedWorkouts: Workout[] // Coach-assigned with bonus points
}

// Key features:
- Continue where you left off
- Coach assignments (prominent display)
- Recommended workouts by position
- Progress stats and streaks
- Leaderboard position
```

### **2. Quiz-Style Workout Interface**
```typescript
// src/app/(authenticated)/skills-academy/workouts/[workoutId]/play/page.tsx
interface QuizStyleWorkoutPlayerProps {
  workout: Workout
  drills: SkillsAcademyDrill[]
  userProgress: WorkoutProgress
}

// QUIZ-STYLE interface should include:
- Current drill (X of Y) - sequential presentation like quiz questions
- Drill video with big captions (skippable after ~15 seconds)
- Optional context text that can be added later
- "Complete Drill" button (always available - no time requirements)
- "Exit Workout" button (no lost points, just no completion multipliers)
- Progress bar showing workout completion
- Clean, focused interface like a quiz platform
```

### **3. Workout Browse & Select**
```typescript  
// Enhanced /skills-academy/workouts/page.tsx
interface WorkoutBrowserProps {
  workoutsByPosition: Record<Position, Workout[]>
  twoTrackWorkouts: {
    exposureTrack: Workout[]    // A1, A2, A3 rotation  
    masteryTrack: Workout[]     // Same workout 3x/week
  }
  userRecommendations: Workout[]
}
```

## 📊 **Database Integration**

### **Connect to Real Supabase Data**
```typescript
// Workout data structure from Supabase
interface SkillsAcademyWorkout {
  id: string
  title: string
  description: string
  position: 'attack' | 'midfield' | 'defense' | 'goalie' | 'wall-ball'
  workout_type: 'mini' | 'more' | 'complete'
  track_type: 'exposure' | 'mastery'
  drill_order: string[] // Array of drill IDs
  total_duration_minutes: number
  total_points_possible: number
  created_at: string
}

interface SkillsAcademyDrill {
  id: string
  title: string
  vimeo_id?: string
  drill_category: string[]
  complexity: 'foundation' | 'building' | 'advanced'
  duration_minutes: number
  points_base: number
  instructions?: string
  coaching_tips?: string
}

// User progress tracking
interface WorkoutCompletion {
  id: string
  user_id: string
  workout_id: string
  drills_completed: string[]
  total_drills: number
  points_earned: number
  completion_time_minutes: number
  completed_at: string
}
```

### **Two-Track System Implementation**
```typescript
// Based on user's requirements:
// Track 1: Exposure - Different workout each session (A1 Mon, A2 Wed, A3 Fri)
// Track 2: Mastery - Same workout 3x per week for deep skill development

interface TwoTrackSystem {
  exposureTrack: {
    week1: ['A1', 'A2', 'A3'] // Different workouts
    week2: ['A4', 'A5', 'A6'] // Next set
    week3: ['A7', 'A8', 'A9'] // Continue progression
    week4: ['A10', 'A11', 'A12'] // Complete cycle
  }
  
  masteryTrack: {
    week1: ['A1', 'A1', 'A1'] // Same workout 3x
    week2: ['A2', 'A2', 'A2'] // Next workout 3x  
    week3: ['A3', 'A3', 'A3'] // Continue mastery
    // 12 weeks total for complete mastery
  }
}
```

## 📝 **Quiz-Style Workout Player Features**

### **Sequential Drill Presentation**
```typescript
// Quiz-like drill progression interface
const QuizStyleWorkoutPlayer = () => {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [drillStartTime, setDrillStartTime] = useState<Date>() // For future red flag detection
  const [videoPlayed, setVideoPlayed] = useState(false)
  const [contextText, setContextText] = useState<string>() // Optional coach context
  const [completedDrills, setCompletedDrills] = useState<string[]>([])
  
  // QUIZ-STYLE features:
  // - Each drill presented like a quiz question
  // - Video reference with big captions
  // - Optional skippable video after 15+ seconds
  // - "Complete Drill" always available
  // - Track time for future red flag detection (not enforcement)
  // - Points at completion, multipliers only if full workout finished
}
```

### **Video Reference with Big Captions**
```typescript
// Optional video reference for drill demonstration
interface DrillVideoReference {
  vimeoId: string
  drillInstructions: string
  coachingTips: string[]
  hasBigCaptions: boolean // All videos have large, readable captions
  skippableAfterSeconds: number // Can skip after ~15 seconds
  allowVolumeControl: boolean
  optionalContextText?: string // Additional text coach can add
  onVideoStart: () => void // Future: lower background music
  onVideoPause: () => void // Future: resume background music
}

// Audio Integration Considerations (for future):
// - Detect if user has music playing in another app
// - Lower music volume when video plays
// - Resume music when video pauses/ends
// - Big captions allow video to work with music
```

### **Points & Multiplier System**
```typescript
// Points awarded for completed drills, multipliers for full workout
interface PointsCalculation {
  baseDrillPoints: number      // Points for individual drills (always earned)
  workoutCompletionBonus: number // Bonus for finishing entire workout
  consistencyMultiplier: number // 2x ONLY if full workout completed
  coachAssignedBonus: number   // 2x if coach-assigned AND completed
  streakBonus: number          // Weekly streak bonuses (full workouts only)
  weeklyMultiplier: number     // Same workout multiple times (full completion)
  
  // Exit early = get base points for drills done, NO multipliers
  // Full completion = get all points + all multipliers
}
```

## 🎨 **UI/UX Requirements**

### **Quiz-Style Focused Interface**
```typescript
// Clean, sequential drill presentation like a quiz platform
- Full-screen video player with big captions
- Minimal distractions - clean quiz-like interface
- "Complete Drill" and "Exit Workout" buttons
- Progress indicators showing workout completion
- Video skippable after 15+ seconds
- Optional context text area for additional instructions
- "Exit Workout" button (keeps points earned, no multipliers for incomplete)
```

### **Mobile-First Design**
```typescript
// Most players will use phones/tablets
- Large touch targets for easy navigation
- Landscape video optimization with big captions
- Portrait mode support for quiz-style layout
- Audio-friendly interface (works with background music)
- Haptic feedback for drill completions
- Optimized for one-handed use during workouts
```

### **Reward System**
```typescript
// Base points for drills done, multipliers for full completion
- Drill completion: Small point feedback (+25 points per drill)
- Partial workout exit: "You earned X points from Y drills completed"
- Full workout completion: BIG celebration with all multipliers
- Multiplier reveals ONLY for full completion (2x BONUS!)
- Streak counters and badges for full workouts only
- Leaderboard position updates after full workout
- Completion celebration: "Workout Complete! +500 total points with bonuses!"
```

## 📊 **Data Tracking for Future Analysis**

### **Time Tracking (Background Only)**
```typescript
// Track drill completion times for future red flag detection
interface DrillTimeTracking {
  drillId: string
  startTime: Date
  completionTime: Date
  totalTimeSeconds: number
  expectedMinimumTimeSeconds: number // For future red flag analysis
}

// Simple time tracking (no enforcement)
const trackDrillTime = (drill: Drill, startTime: Date) => {
  const completionTime = new Date()
  const totalSeconds = (completionTime.getTime() - startTime.getTime()) / 1000
  
  return {
    drillId: drill.id,
    startTime,
    completionTime,
    totalTimeSeconds,
    expectedMinimumTimeSeconds: drill.duration_minutes * 60 // For future analysis
  }
}
```

### **Audio Integration Considerations**
```typescript
// Future audio/music integration features
interface AudioIntegration {
  detectBackgroundMusic: boolean // Future: detect if music is playing
  lowerMusicOnVideo: boolean // Future: lower music when video starts
  resumeMusicOnPause: boolean // Future: resume music when video pauses
  bigCaptionSupport: boolean // Current: ensure videos have large captions
}

// Implementation notes for future:
// - Use Web Audio API to detect background music
// - Coordinate with iOS/Android music controls
// - Provide seamless audio experience for working out with music
```

## 📱 **New Routes to Create**

### **Player-Focused Routes**
```typescript
/skills-academy/player                    // Player dashboard
/skills-academy/workouts                  // Browse all workouts  
/skills-academy/workouts/[workoutId]      // Workout details
/skills-academy/workouts/[workoutId]/play // Interactive player
/skills-academy/progress                  // Personal progress
/skills-academy/leaderboard              // Team/position rankings
```

## 🔄 **Integration with Existing Systems**

### **Connect to Gamification**
```typescript
// Use existing point calculation system
import { calculateWorkoutPoints } from '@/lib/point-calculator'
import { updateUserStreak } from '@/lib/streak-manager'

// When workout completes:
const points = calculateWorkoutPoints({
  drillsCompleted,
  isCoachAssigned,
  userStreakData,
  weeklyProgress
})
```

### **Coach Assignment System**
```typescript
// Coaches can assign specific workouts with bonus points
interface CoachAssignment {
  id: string
  coach_id: string
  player_id: string
  workout_id: string
  bonus_multiplier: number // 2x for assigned workouts
  due_date?: string
  message?: string
  completed_at?: string
}
```

## 📋 **Implementation Phases**

### **Phase 1: Data Integration** 🏃‍♂️
1. **Connect workout builder to Supabase**
   - Fetch real drills from `skills_academy_drills`
   - Build workouts with actual drill data
   - Save custom workouts to database

2. **Build workout browser**
   - Position-based filtering  
   - Two-track system organization
   - Coach assignments display

### **Phase 2: Locked Player Interface** 🔨
1. **Create locked workout player**
   - Time-enforced drill interface (cannot skip)
   - Mandatory video watching with anti-cheating
   - Session integrity tracking
   - Exit-only escape option with warning

2. **Player dashboard**  
   - "Start Workout" buttons for selected workouts
   - Coach assignments with 2x bonus display
   - Completed workout history only
   - NO in-progress workout browsing or manipulation

### **Phase 3: Polish & Gamification** ✨
1. **Enhanced UX**
   - Smooth animations and transitions
   - Achievement celebrations
   - Leaderboard integration

2. **Advanced features**
   - Workout history and analytics
   - Custom workout creation for coaches
   - Family account integration

## 📋 **Acceptance Criteria**

### **Must Have** ✅
- [ ] **QUIZ-STYLE INTERFACE** - Each drill presented sequentially like quiz questions
- [ ] **VIDEO REFERENCES** - Skippable videos with big captions after ~15 seconds
- [ ] **DRILL PROGRESSION** - Linear movement through workout drills
- [ ] Coach-assigned workouts display prominently with 2x bonus
- [ ] Base points for completed drills, multipliers only for full workout completion
- [ ] "Complete Drill" and "Exit Workout" buttons always available
- [ ] Two-track system (exposure vs mastery) clearly explained
- [ ] Time tracking for future red flag analysis (background only)

### **Should Have** ⭐
- [ ] **BIG CAPTIONS** - All videos have large, readable captions for music listening
- [ ] **AUDIO-FRIENDLY** - Interface works well with background music
- [ ] Mobile-optimized video player with caption support
- [ ] Optional context text that coaches can add to drills
- [ ] Drill completion feedback (+25 points per drill)
- [ ] Full workout completion celebration with all bonuses

### **Nice to Have** 🎁
- [ ] Offline workout capability
- [ ] Apple Health / Google Fit integration
- [ ] Social sharing of achievements
- [ ] Voice coaching during workouts

---

## 🚨 **INTEGRATION NOTES**

## 🚨 **CRITICAL: ENHANCE EXISTING, DON'T REPLACE**

### **NEVER OVERWRITE EXISTING PAGES**
- ❌ Do NOT overwrite your existing workout-builder page
- ❌ Do NOT create entirely new page files from scratch  
- ❌ Do NOT replace the current workout builder interface
- ✅ ADD new routes and components alongside existing ones

### **YOUR EXISTING WORK IS PERFECT**
- ✅ Keep `/skills-academy/workout-builder/page.tsx` exactly as is
- ✅ Build NEW routes: `/skills-academy/player/page.tsx`
- ✅ Build NEW routes: `/skills-academy/workouts/[workoutId]/play/page.tsx`
- ✅ Enhance existing components incrementally

### **ENHANCEMENT APPROACH**
- ✅ Add new files for player interface
- ✅ Connect workout builder to Supabase data
- ✅ Build quiz-style workout player as NEW component
- ✅ Enhance existing workout builder with real drill data

### **Work WITH Your Existing Code**
- Enhance your current workout-builder components
- Reuse position selection and template logic  
- Build player interface as companion to builder

### **Use Established Patterns**
- Follow VideoModal patterns for drill videos
- Use existing authentication and routing
- Leverage current point calculation system

### **Database Queries You'll Need**
```sql
-- Get workouts for a position  
SELECT * FROM skills_academy_workouts WHERE position = 'attack'

-- Get drills for a workout
SELECT d.* FROM skills_academy_drills d 
JOIN workout_drill_order wdo ON d.id = wdo.drill_id
WHERE wdo.workout_id = $1 ORDER BY wdo.order_index

-- Save workout completion
INSERT INTO workout_completions (user_id, workout_id, drills_completed, points_earned)
VALUES ($1, $2, $3, $4)
```

## 🎯 **KEY MINDSET: "QUIZ-STYLE TRAINING" PHILOSOPHY**

### **Like a Quiz Platform - But for Drills**
- **Sequential presentation** - Each drill presented like a quiz question
- **Video reference** - Quick demo, then go do it (skippable after 15+ seconds)
- **Big captions** - Works with music, volume down, any audio situation
- **Linear progression** - Move through drills one by one
- **Base points earned** - Get credit for drills completed, bonuses for full workout

### **Player Journey**
1. **Browse/Select Workout** → Choose your training session
2. **Click "Do Workout"** → Enter quiz-style drill interface
3. **Complete Each Drill** → Watch reference video (optional), complete drill, move to next
4. **Partial/Full Completion** → Base points for drills done, multipliers only for full workout
5. **Exit Anytime** → Keep points earned, just miss out on completion bonuses

### **Core Philosophy**
> *"Present each drill clearly like a quiz question. Give players the reference they need, then let them do the work. Reward completion, but don't punish partial effort."*

### **Audio-First Design**
- Big captions on all videos for music listening
- Quick video references (not mandatory watching)
- Future: Seamless music integration (lower/resume background audio)

---

## 📝 **MANDATORY: Documentation Self-Update (CRITICAL)**

### **Phase Final: Documentation Self-Update (MANDATORY)**
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any database/content problems encountered with drill/workout context
2. **Troubleshooting Guide Update**: Add new database and content filtering patterns if discovered
3. **Builder Template Enhancement**: Update Database and Content templates with new safety measures
4. **Future Agent Guidance**: Create specific warnings for similar Skills Academy database work

**Success Criteria**:
- [ ] All database issues documented with table/query context
- [ ] Troubleshooting guide updated with new Skills Academy patterns  
- [ ] Database/Content agent templates enhanced with new safety measures
- [ ] Future Skills Academy agents have specific guidance to prevent same issues

**Reference**: Follow [`AGENT_SELF_UPDATE_PROTOCOL.md`](AGENT_SELF_UPDATE_PROTOCOL.md) exactly

---

**Your mission: Build a clean, quiz-style workout interface that presents drills clearly, works with music/audio, and rewards both partial progress and full completion!**