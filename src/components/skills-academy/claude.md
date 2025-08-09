# Claude Context: Skills Academy

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working on POWLAX Skills Academy components*

## ⚠️ **CRITICAL: READ FIRST**
**BEFORE making ANY changes, read `MASTER_CONTRACT.md` in this directory.**
**All modifications must follow the user-approved enhancement contract.**

## 🎯 **What This Area Does**
Skills Academy provides individual skill development through structured workouts and drill sequences. Players complete workouts to earn multiple types of points (Attack Tokens, Defense Dollars, Midfield Medals, Rebound Rewards, Lax Credits, Flex Points) while tracking progress and maintaining consistency streaks.

## 🔧 **Key Components**

**Current Pages:**
- `workouts/page.tsx` - Workout selection and browsing (needs enhancement)
- `interactive-workout/page.tsx` - Drill interface (needs major rebuild)
- `progress/page.tsx` - Progress tracking (needs real data integration)

**Required Components (To Be Built):**
- `WorkoutLibrary.tsx` - Enhanced workout browsing with variants
- `DrillPlayer.tsx` - Quiz-style sequential drill interface
- `WorkoutVariantSelector.tsx` - Mini/More/Complete selection modal
- `PointSystem.tsx` - Multi-type point management
- `CompletionModal.tsx` - Workout completion and point awards

## 📱 **Mobile & Design Considerations**

**Quiz-Style Interface Requirements:**
- Sequential drill presentation (one at a time)
- Big captions for music listening compatibility
- Optional video references (skippable after 15 seconds)
- Simple "Did It" / "Next" progression
- No time enforcement (tracking for analysis only)

**Anti-Cheating Philosophy:**
- Encouragement-based, not punishment-based
- Base points for partial completion (no "lose all points")
- Multipliers only for full workout completion
- Time tracking for red flags (analysis, not enforcement)

**Mobile Optimization:**
- Optimized for 375px+ screens (players use phones during workouts)
- Large touch targets for easy interaction during exercise
- High contrast for various lighting conditions
- Battery-efficient video playback
- Offline capability after initial data load

## 🔗 **Integration Points**

**Database Tables:**
- `skills_academy_series` (41 records) - Series definitions and organization
- `skills_academy_workouts` (118 records) - Individual workout definitions
- `skills_academy_drills` (167 records) - Complete drill library with point values
- `skills_academy_workout_drills` (0 records) - **EMPTY** Junction table connecting workouts to drills
- `user_points_balance_powlax` - Multi-type point balances per user
- `workout_completions` - Completion tracking with multipliers
- `user_streak_data` - Consistency and streak tracking
- `coach_workout_assignments` - Coach-assigned workouts with bonuses

**⚠️ CRITICAL CONNECTION ISSUE:**
The `skills_academy_workout_drills` junction table is empty, so workouts currently have no drill associations. This is why modals show "0 drills" and workout pages show "Workout Not Found". A helper function or data population is needed to connect workouts to drills.

**Point System Integration:**
- **Lax Credits**: Universal currency (all drills/workouts)
- **Attack Tokens**: Attack-specific drills (28 drills)
- **Defense Dollars**: Defense-specific drills (59 drills)
- **Midfield Medals**: Midfield-specific drills (80 drills)
- **Rebound Rewards**: Wall Ball workouts (53 workouts)
- **Flex Points**: Self-guided/external workouts

**When you modify this area, also check:**
- Point calculation accuracy across all types
- Mobile video playback functionality
- Streak tracking and multiplier logic
- Coach assignment and bonus systems
- Team competition and leaderboard features
- Progress tracking by date functionality

## 🧪 **Testing Strategy**

**Essential Tests:**
- Quiz-style drill progression on mobile devices
- Multi-type point calculation accuracy
- Video playback with music app integration
- Offline functionality after initial load
- Streak tracking and multiplier application
- Coach assignment and bonus point systems

**Performance Tests:**
- Workout loading time (target: < 3 seconds on mobile)
- Video loading and playback responsiveness
- Point balance update speed
- Mobile battery impact during extended use
- Offline data persistence and sync

## ⚠️ **Common Issues & Gotchas**

**Known Problems:**
- `skills_academy_workout_drills` junction table is EMPTY (critical - no workout-drill connections)
- No quiz-style interface exists (needs to be built)
- Point system not implemented (critical missing feature)
- Video integration needs drill-specific Vimeo IDs from `skills_academy_drills.vimeo_id`
- No real progress tracking or streak system
- Workout modals show "0 drills" due to missing junction table data

**Before Making Changes:**
1. Read MASTER_CONTRACT.md for user requirements
2. Understand the quiz-style interface philosophy
3. Test video playback with background music apps
4. Verify point calculations across all types
5. Test mobile interface during actual workout simulation
6. Validate offline functionality and data sync

**Critical Design Principles:**
- Players should never lose all points for incomplete workouts
- Videos are references, not mandatory viewing
- Time tracking is for analysis, never for punishment
- Big captions enable music listening during workouts
- Consistency and streaks are key motivational elements
