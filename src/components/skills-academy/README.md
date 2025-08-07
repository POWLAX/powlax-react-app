# 🎓 **POWLAX Skills Academy Components**

*Component Directory: `src/components/skills-academy/`*  
*Pages Location: `src/app/(authenticated)/skills-academy/`*

## 📋 **Quick Reference**

### **🎯 Master Agent Instructions**
> **CRITICAL**: Before making ANY changes, read `MASTER_CONTRACT.md` in this directory.
> All modifications must align with the user-approved enhancement contract.

### **📁 File Structure Overview**
```
skills-academy/
├── 📄 MASTER_CONTRACT.md           # ← USER-APPROVED ENHANCEMENT PLAN
├── 📄 claude.md                   # ← Context file (to be created)
├── 📄 README.md                   # ← This file (navigation guide)
│
├── 🎛️ CORE COMPONENTS/
│   ├── WorkoutLibrary.tsx         # Main workout browser & selection
│   ├── DrillPlayer.tsx            # Quiz-style drill interface
│   ├── WorkoutBuilder.tsx         # Custom workout creation
│   └── DrillCard.tsx              # Individual drill display
│
├── 📱 UI COMPONENTS/
│   ├── ProgressTracker.tsx        # Point tracking & progress display
│   ├── WorkoutVariantSelector.tsx # Mini/More/Complete selection modal
│   ├── PointsDisplay.tsx          # Multi-type point system display
│   ├── StreakCounter.tsx          # Consistency tracking
│   ├── BadgeCollection.tsx        # Achievement display
│   └── WorkoutTimer.tsx           # Session timing & tracking
│
├── 🎭 MODALS/
│   ├── WorkoutPreviewModal.tsx    # Workout details & variant selection
│   ├── DrillVideoModal.tsx        # Individual drill video player
│   ├── CompletionModal.tsx        # Workout completion & points awarded
│   ├── ProgressModal.tsx          # Detailed progress breakdown
│   └── LeaderboardModal.tsx       # Competition & ranking display
│
├── 🏆 GAMIFICATION/
│   ├── PointSystem.tsx            # Multi-type point management
│   ├── MultiplierEngine.tsx       # Streak & consistency bonuses
│   ├── BadgeSystem.tsx            # Achievement unlocking
│   ├── CompetitionTracker.tsx     # Team & individual competitions
│   └── AnalyticsDisplay.tsx       # Performance insights
│
└── ⚡ LAZY LOADING/
    ├── LazyWorkoutLibrary.tsx     # Optimized workout loading
    ├── LazyDrillPlayer.tsx        # Optimized drill interface
    └── LazyProgressTracker.tsx    # Optimized progress display
```

---

## 🔗 **Component Relationships**

### **Data Flow**
```
skills_academy_drills (Supabase) + skills_academy_workouts (Supabase)
    ↓
useSkillsAcademy hook 
    ↓
WorkoutLibrary → DrillPlayer → CompletionModal
    ↓              ↓                ↓
WorkoutCard    DrillSequence    PointSystem → user_points_balance_powlax
```

### **Modal Integration**
- **WorkoutCard** triggers → WorkoutPreviewModal, DrillVideoModal
- **DrillPlayer** triggers → DrillVideoModal, CompletionModal
- **ProgressTracker** triggers → ProgressModal, LeaderboardModal
- **Main Pages** trigger → WorkoutVariantSelector, CompetitionTracker

---

## 🎯 **Current Implementation Status**

| Component | Status | Data Source | Enhancement Needed |
|-----------|--------|-------------|-------------------|
| **WorkoutLibrary** | ⚠️ Basic | `skills_academy_workouts` | Connect to real data, add filtering |
| **DrillPlayer** | ❌ Missing | None | Build quiz-style interface |
| **WorkoutBuilder** | ❌ Missing | None | Build custom workout creation |
| **ProgressTracker** | ⚠️ Mock Data | Hardcoded stats | Connect to real point tracking |
| **PointSystem** | ❌ Missing | None | Build multi-type point management |
| **BadgeSystem** | ⚠️ Basic | Mock data | Connect to real achievements |
| **VideoModal** | ⚠️ Basic | Static URLs | Connect to real drill videos |
| **CompetitionTracker** | ❌ Missing | None | Build team/individual competitions |

---

## 🛠️ **Key Integration Points**

### **Database Tables**
- **Primary**: `skills_academy_drills` (167 items) - Individual drill library
- **Primary**: `skills_academy_workouts` (192 items) - Workout collections
- **Points**: `user_points_balance_powlax` - User point balances
- **Tracking**: `workout_completions` - Completion history
- **Progress**: `user_streak_data` - Consistency tracking
- **Competition**: `team_competitions` - Team challenges

### **Point System Types**
- **Lax Credits** - Universal currency (all drills)
- **Attack Tokens** - Attack-specific drills
- **Defense Dollars** - Defense-specific drills  
- **Midfield Medals** - Midfield-specific drills
- **Rebound Rewards** - Wall Ball workouts
- **Flex Points** - Self-guided workouts

### **Hooks & Utilities**
- **`useSkillsAcademy()`** - Main workout/drill data fetching
- **`usePointTracking()`** - Point balance management
- **`useStreakTracking()`** - Consistency monitoring
- **`useCompetitions()`** - Team challenge management

---

## ⚠️ **Critical Notes for Agents**

### **Before Making Changes**
1. ✅ **Read MASTER_CONTRACT.md** - User-approved enhancement plan
2. ✅ **Understand Point System** - Multi-type points with multipliers
3. ✅ **Quiz-Style Interface** - Sequential drill presentation
4. ✅ **Mobile-First Design** - Players use phones during workouts
5. ✅ **Anti-Cheating Measures** - Time tracking for analysis only

### **Key Design Principles**
- **Sequential Drill Presentation** - One drill at a time, quiz-style
- **Optional Video References** - Skippable after 15 seconds
- **Base Points for Partial** - No "lose all points" on exit
- **Multipliers for Completion** - Only full workouts get bonuses
- **Big Captions Always** - Music-friendly interface
- **Consistency Rewards** - Streak-based multipliers

### **Common Gotchas**
- **Point calculations** must handle multiple point types
- **Video loading** needs fallback for poor connectivity
- **Time tracking** is for analysis, not enforcement
- **Multipliers** only apply to completed workouts
- **Database queries** should handle empty results gracefully

### **Testing Requirements**
- Mobile responsiveness (375px minimum)
- Video modal functionality
- Point calculation accuracy
- Offline capability after initial load
- Multi-type point system

---

## 📞 **Quick Help**

### **Need to understand the point system?**
1. Check `skills_academy_drills.point_values` JSONB field
2. Look for point types: lax_credit, attack_token, defense_dollar, etc.
3. Review multiplier logic in gamification components

### **Need to add new workout functionality?**
1. Read `MASTER_CONTRACT.md` first
2. Check existing patterns in workout pages
3. Follow quiz-style interface principles
4. Test on mobile devices

### **Need to debug data issues?**
1. Check Skills Academy data import in `scripts/imports/`
2. Verify Supabase table schemas match expectations
3. Look for console errors in browser dev tools

---

**🎯 Remember: This is an educational tool for players to improve skills. Every change should make learning more engaging and effective, not more complex.**
