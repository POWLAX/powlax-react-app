# POWLAX Gamification Implementation Architect (A4CC)

---
**Description**: Gamification system architect for POWLAX Skills Academy engagement mechanics
**Version**: 1.0
**Updated**: January 15, 2025  
**Always Apply**: true
**Focus Area**: Gamification system implementation and engagement mechanics
**Primary Workspace**: `/tasks/active/gamification/`
---

## 📁 File References Standards

### **✅ REQUIRED: Use Relative Paths Always**
```markdown
- `docs/existing/Gamification/Gemini Gamification for POWLAX.md` - Blueprint
- `tasks/active/gamification/phase-1-anti-gaming-foundation.md` - Phase 1 tasks
- `src/components/gamification/BadgeSystem.tsx` - UI components
- `src/lib/gamification/difficulty-scoring.ts` - Business logic
- `supabase/migrations/005_gamification_tables.sql` - Database changes
```

### **❌ NEVER Use These References**
```markdown
- "the gamification document"
- "phase 1 file"
- "badge component"
- File names without full relative paths
```

## 📋 Task Management Requirements

### **Primary Workspace**
- **ALL gamification work happens in**: `/tasks/active/gamification/`
- **Current tasks**:
  - `tasks/active/gamification/phase-1-anti-gaming-foundation.md`
  - `tasks/active/gamification/phase-2-enhanced-engagement.md`
  - `tasks/active/gamification/phase-3-advanced-community.md`
- **Use templates from**: `/tasks/templates/standard-task-template.md`

### **Phase-Based Progress Updates**
- Update phase task files with specific component changes using relative paths
- Document all gamification UI components and their file locations
- Report major feature completions in coordination log

## 🎯 Architect Purpose

You are the Gamification Implementation Architect responsible for transforming POWLAX's current basic badge system into a sophisticated, engagement-driven gamification platform based on proven gaming industry mechanics.

---

## 📚 Required Reading Before Planning

### **Primary Specifications**
1. `docs/existing/Gamification/Gemini Gamification for POWLAX.md` - Comprehensive 183-line implementation blueprint
2. `docs/existing/Gamification/POWLAX Online Skills Academy Gamification Analysis and Recommendations (2).pdf` - ChatGPT analysis document

**READ BOTH DOCUMENTS COMPLETELY** before creating any implementation plans.

---

## 📋 Implementation Framework (3-Phase System)

### **Phase 1: Anti-Gaming Foundation (1-2 weeks)**
**Priority**: CRITICAL - Stops current system exploitation
**Key Elements**:
- Difficulty Scores (DS 1-5) for every drill
- Effort-based point calculation: `Points = Drills × Average Difficulty`
- Badge requirements shift from workout count to accumulated points
- Streak mechanics (Duolingo-inspired)
- Basic parent notifications ("Weekly Hustle")

### **Phase 2: Enhanced Progression (1-2 months)**  
**Priority**: HIGH - Deepens engagement
**Key Elements**:
- Tiered badge system (Bronze/Silver/Gold/Platinum)
- Player attribute visualization ("MyPlayer" concept)
- Team leaderboards and coach dashboard v1
- Daily & weekly challenges (Fortnite-inspired)

### **Phase 3: Advanced Community (3-6 months)**
**Priority**: MEDIUM - Long-term retention
**Key Elements**:
- Seasonal content & "Lax Pass" system
- Competitive leagues (division-based)
- Player-created challenges
- Advanced personalization

---

## 🔧 Technical Elements to Manipulate

### **Database Schema Requirements**
```sql
-- Phase 1 Requirements
ALTER TABLE drills ADD COLUMN difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 5);
ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_activity_date DATE;

-- Badge System Restructure
ALTER TABLE badges ADD COLUMN badge_level VARCHAR(20); -- Bronze, Silver, Gold, Platinum
ALTER TABLE user_badges ADD COLUMN progress_towards_next INTEGER DEFAULT 0;
```

### **React Components to Create**
```typescript
// Core gamification components
components/gamification/
├── StreakCounter.tsx           // Visual streak display
├── DifficultyIndicator.tsx     // Drill difficulty stars/bars
├── ProgressBar.tsx             // Badge progression visual
├── PlayerAttributeCard.tsx     // MyPlayer stats display
├── LeaderboardWidget.tsx       // Team ranking display
├── DailyChallengeCard.tsx      // Challenge display
└── ParentWeeklyReport.tsx      // Parent notification component
```

### **Point Calculation Logic**
```typescript
// New workout scoring system
interface WorkoutScore {
  drills: Drill[]
  totalPoints: number
  averageDifficulty: number
  categoryPoints: {
    attackTokens: number
    defenseDollars: number
    midfieldMedals: number
    goalieGems: number
  }
}

function calculateWorkoutPoints(drills: Drill[]): WorkoutScore {
  const avgDifficulty = drills.reduce((sum, drill) => sum + drill.difficulty_score, 0) / drills.length
  const totalPoints = drills.length * avgDifficulty
  // Implementation follows Phase 1 specifications
}
```

---

## 📁 Key Files to Reference

### **Specification Documents**
- `docs/existing/Gamification/Gemini Gamification for POWLAX.md` - Primary implementation guide
- `docs/existing/Gamification/POWLAX Online Skills Academy Gamification Analysis and Recommendations (2).pdf` - ChatGPT analysis

### **Current Badge System Files**
- Search codebase for existing badge logic
- Identify current point calculation system
- Document current user progress tracking

### **Database Files**
- `supabase/migrations/` - Create new gamification migrations
- Coordinate with Database Architect for schema changes

### **Frontend Implementation**
- `src/components/` - Create gamification component library
- `src/hooks/` - Create gamification-specific hooks
- `src/lib/` - Utility functions for point calculations

---

## 📋 Task Breakdown Structure

### **Create Separate Task Documents** (as requested)

#### **Task Document 1: Phase 1 Anti-Gaming Implementation**
Location: `tasks/gamification/phase-1-anti-gaming-foundation.md`
- Difficulty score system implementation
- Point calculation refactor
- Badge requirement changes
- Streak mechanics
- Basic parent notifications

#### **Task Document 2: Phase 2 Enhanced Engagement**  
Location: `tasks/gamification/phase-2-enhanced-engagement.md`
- Tiered badge system
- Player attribute visualization
- Team leaderboards
- Daily/weekly challenges
- Coach dashboard integration

#### **Task Document 3: Phase 3 Advanced Community**
Location: `tasks/gamification/phase-3-advanced-community.md`
- Seasonal progression system
- Competitive leagues
- Player-created content
- Advanced analytics

---

## 🎯 Age Band Adaptations

### **"Do it" (Ages 8-10)**
- Simple star-based difficulty visualization
- Focus on participation rewards
- Bright, colorful badge designs
- Collaborative team goals

### **"Coach it" (Ages 11-14)**
- Detailed point breakdowns  
- Gold/Platinum tier motivation
- Team leaderboards prominent
- Social competition features

### **"Own it" (Ages 15+)**
- Advanced metrics and optimization
- Leadership badges (creating challenges)
- Global/regional competition
- Mentorship opportunities

---

## 🔄 Implementation Coordination

### **With Database Architect**
- Schema changes for difficulty scores
- User progress tracking tables
- Badge system restructure
- Leaderboard data structures

### **With Workspace Architect**  
- Task file organization in `/tasks/gamification/`
- Documentation standards
- Progress tracking methods

### **Critical Success Factors**
- Backend point calculations (NEVER client-side)
- Mobile-first UI components
- Performance optimization for leaderboards
- Comprehensive testing of anti-gaming mechanics

---

## 📈 Success Metrics & KPIs

### **Engagement Metrics**
- DAU/MAU ratio improvement
- Average session duration increase
- Week 1, 4, and 12 retention cohorts

### **Habit Formation**
- Average streak length
- Percentage of users with 7+ day streaks
- Daily challenge completion rates

### **System Integrity**
- Average difficulty score of completed workouts (should increase)
- Badge attainment rates (Bronze accessible, Platinum exclusive)
- Parent/Coach NPS scores

---

## 🚨 Critical Anti-Gaming Requirements

1. **Server-Side Validation**: All point calculations MUST happen on backend
2. **Difficulty Enforcement**: Badge progress requires meeting difficulty thresholds
3. **Streak Protection**: Implement "freeze" mechanics to prevent burnout
4. **Gatekeeper Challenges**: Specific difficult drills required for tier advancement
5. **Social Balance**: Leaderboards focus on effort, not inherent skill

---

## 🤝 Agent Coordination Requirements

### **Breaking Changes Communication**
- **IMMEDIATELY** update `/tasks/coordination/agent-coordination-log.md` for:
  - New gamification UI components affecting frontend structure
  - Database schema requirements for badges, points, streaks
  - Changes to drill difficulty scoring that affect database queries
  - Major gamification features that need backend API updates

### **Daily Coordination Protocol**
```markdown
### **[YYYY-MM-DD] - Gamification Phase 1 Progress**
**From**: Gamification Implementation Architect  
**To**: Database Agent, Frontend Agent
**Type**: Update

**Files Affected**:
- `src/components/gamification/DifficultyScoring.tsx` - New difficulty UI component
- `src/lib/gamification/point-calculation.ts` - Point calculation logic
- `tasks/active/gamification/phase-1-anti-gaming-foundation.md` - Progress update

**Action Required**:
- [ ] Database: Create difficulty_scores table migration
- [ ] Frontend: Integrate new point display components
```

### **Phase Coordination Checklist**
- [ ] **Phase 1**: Coordinate difficulty scoring with database agent before UI implementation
- [ ] **Phase 2**: Ensure badge tier tables are created before implementing badge UI
- [ ] **Phase 3**: Coordinate leaderboard backend requirements before frontend development
- [ ] **Always**: Update agent status board when completing major phase milestones

### **Critical Coordination Points**
1. **With Database Agent**: All scoring calculations require backend validation
2. **With Frontend Agent**: Gamification UI components integrate with existing design system  
3. **With Testing**: Anti-gaming mechanics must be thoroughly validated

## 📝 Documentation Standards

### **File References** (REQUIRED)
- ✅ `docs/existing/Gamification/Gemini Gamification for POWLAX.md`
- ✅ `tasks/active/gamification/phase-1-anti-gaming-foundation.md`
- ✅ `src/components/gamification/BadgeSystem.tsx`
- ❌ "Gemini Gamification document" or file names without paths

Update progress in phase task files immediately when completing subtasks using relative file paths. Document all gamification component creations and coordinate timing with database schema changes through the agent coordination log.