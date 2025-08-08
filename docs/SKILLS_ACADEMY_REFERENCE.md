# Skills Academy System Reference Guide

## Overview
The Skills Academy is a comprehensive workout system for lacrosse skill development. It provides structured, progressive workouts organized by position (Attack, Midfield, Defense) and skill level (Solid Start for beginners).

**Created:** January 2025  
**Status:** ✅ Complete and functional  
**Location:** `/skills-academy`

## System Architecture

### Database Structure

#### 1. Core Tables (PostgreSQL/Supabase)

```sql
-- Main series table
skills_academy_series (
    id SERIAL PRIMARY KEY,
    series_name VARCHAR(255),      -- e.g., "Catching and Hesitation"
    series_code VARCHAR(10),        -- e.g., "SS3", "A1", "M1", "D1"
    series_type VARCHAR(50),        -- 'solid_start', 'attack', 'midfield', 'defense'
    position_focus VARCHAR(50),     -- 'all', 'attack', 'midfield', 'defense'
    difficulty_level INTEGER,       -- 1-5 scale
    color_scheme VARCHAR(50),       -- UI color theme
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false
)

-- Individual workouts within series
skills_academy_workouts (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES skills_academy_series(id),
    workout_name VARCHAR(255),      -- e.g., "SS3 Mini (5 drills)"
    workout_size VARCHAR(20),       -- 'mini', 'more', 'complete'
    drill_count INTEGER,            -- 5, 10, or 13-19
    estimated_duration INTEGER,     -- in minutes
    drill_sequence JSONB           -- Array of drill IDs
)

-- Junction table for workout drills
skills_academy_workout_drills (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES skills_academy_workouts(id),
    drill_id UUID REFERENCES powlax_drills(id),
    sequence_order INTEGER,
    is_optional BOOLEAN DEFAULT false
)

-- User progress tracking
skills_academy_user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    workout_id INTEGER REFERENCES skills_academy_workouts(id),
    drill_id UUID,
    completed_at TIMESTAMP,
    session_id UUID,
    status VARCHAR(20)              -- 'started', 'in_progress', 'completed'
)
```

#### 2. Data Population
- **41 Series Total:**
  - 5 Solid Start (SS1-SS5) - Beginner fundamentals
  - 12 Attack (A1-A12) - Offensive skills
  - 12 Midfield (M1-M12) - Two-way player skills
  - 12 Defense (D1-D12) - Defensive techniques

- **118 Workouts Total:**
  - Each series has 3 workout sizes:
    - Mini: 5 drills (~15 min)
    - More: 10 drills (~30 min)
    - Complete: 13-19 drills (~45 min)

## File Structure

```
/src/
├── app/(authenticated)/skills-academy/
│   ├── page.tsx                    # Main Skills Academy page
│   ├── workouts/
│   │   └── page.tsx                # Redirects to main page
│   ├── workout/[id]/
│   │   └── page.tsx                # Individual workout runner
│   └── interactive-workout/
│       └── page.tsx                # Interactive workout experience
│
├── components/skills-academy/
│   ├── SkillsAcademyHub.tsx        # Main orchestrator component
│   ├── SkillsAcademySeriesCard.tsx # Series display cards
│   ├── WorkoutSizeSelector.tsx     # Mini/More/Complete selector
│   └── DrillSequencePlayer.tsx     # Sequential drill video player
│
├── hooks/
│   └── useSkillsAcademyWorkouts.ts # Data fetching hooks
│
├── types/
│   └── skills-academy.ts           # TypeScript type definitions
│
└── scripts/database/
    └── create_skills_academy_real_data.sql # Database setup script
```

## Component Documentation

### 1. SkillsAcademyHub
**Location:** `/src/components/skills-academy/SkillsAcademyHub.tsx`

Main orchestrator component that manages the entire Skills Academy experience.

```typescript
interface Props {
  userId?: string  // Optional user ID for progress tracking
}

// Features:
- Tab navigation (All, Solid Start, Attack, Midfield, Defense)
- Series grid display with position-based styling
- Workout selection flow
- Session management
```

### 2. SkillsAcademySeriesCard
**Location:** `/src/components/skills-academy/SkillsAcademySeriesCard.tsx`

Displays individual workout series with visual indicators.

```typescript
interface Props {
  series: SkillsAcademySeries
  onSelect: (series: SkillsAcademySeries) => void
}

// Visual elements:
- Position badge (color-coded)
- Series code (SS1, A1, M1, D1)
- Difficulty stars (1-5)
- Workout count badges
- Position-specific icons
```

### 3. WorkoutSizeSelector
**Location:** `/src/components/skills-academy/WorkoutSizeSelector.tsx`

Modal for selecting workout size after choosing a series.

```typescript
interface Props {
  series: SkillsAcademySeries
  workouts: GroupedWorkouts
  onSelectWorkout: (workout: SkillsAcademyWorkoutNew) => void
  onClose: () => void
}

// Options presented:
- Mini (5 drills) - Quick fundamentals
- More (10 drills) - Standard workout
- Complete (13-19 drills) - Full training session
```

### 4. DrillSequencePlayer
**Location:** `/src/components/skills-academy/DrillSequencePlayer.tsx`

Sequential drill player that presents drills one at a time.

```typescript
interface Props {
  session: WorkoutSession
  userId?: string
  onClose: () => void
  onComplete: () => void
}

// Features:
- Vimeo video integration
- Progress tracking
- Next/Previous navigation
- Completion tracking
- Session persistence
```

## Data Hooks

### useSkillsAcademySeries()
Fetches all active series organized by type.

```typescript
const { series, loading, error } = useSkillsAcademySeries()
```

### useSkillsAcademyWorkouts(seriesId)
Fetches workouts for a specific series.

```typescript
const { workouts, loading, error } = useSkillsAcademyWorkouts(seriesId)
```

### useWorkoutSession(workoutId, userId)
Manages workout session state and progress.

```typescript
const { 
  session, 
  startSession, 
  completeDrill,
  loading 
} = useWorkoutSession(workoutId, userId)
```

## User Flow

1. **Series Selection**
   - User lands on `/skills-academy`
   - Sees grid of 41 series cards
   - Can filter by tab (All, Solid Start, Attack, Midfield, Defense)
   - Clicks a series card

2. **Workout Size Selection**
   - Modal appears with 3 size options
   - User selects Mini (5), More (10), or Complete (13-19)
   - System creates workout session

3. **Drill Sequence**
   - DrillSequencePlayer launches
   - Shows one drill at a time
   - Video plays automatically
   - User marks complete and moves to next
   - Progress saved to database

4. **Completion**
   - Final screen shows workout complete
   - Progress logged to user_progress table
   - Returns to series selection

## Styling & Theming

### Position-Based Color Schemes

```typescript
const colorSchemes = {
  solid_start: {
    bg: 'bg-purple-500',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badge: 'bg-purple-100'
  },
  attack: {
    bg: 'bg-red-500',
    text: 'text-red-900',
    border: 'border-red-200',
    badge: 'bg-red-100'
  },
  midfield: {
    bg: 'bg-green-500',
    text: 'text-green-900',
    border: 'border-green-200',
    badge: 'bg-green-100'
  },
  defense: {
    bg: 'bg-blue-500',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badge: 'bg-blue-100'
  }
}
```

### Icons by Position

- **Attack:** `<Swords />` - Crossed swords
- **Midfield:** `<Zap />` - Lightning bolt
- **Defense:** `<Shield />` - Shield
- **Solid Start:** `<Star />` - Star

## Database Queries

### Get all series with workouts
```sql
SELECT 
    s.*,
    COUNT(w.id) as workout_count
FROM skills_academy_series s
LEFT JOIN skills_academy_workouts w ON s.id = w.series_id
WHERE s.is_active = true
GROUP BY s.id
ORDER BY s.display_order;
```

### Get user progress
```sql
SELECT 
    w.workout_name,
    COUNT(DISTINCT p.drill_id) as completed_drills,
    w.drill_count as total_drills
FROM skills_academy_user_progress p
JOIN skills_academy_workouts w ON p.workout_id = w.id
WHERE p.user_id = $1
GROUP BY w.id;
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For admin scripts only
```

## Common Issues & Solutions

### Issue: Page shows loading spinner indefinitely
**Solution:** Check that `is_active = true` for series in database

### Issue: No series appearing
**Solution:** Run the SQL script to populate data:
```bash
# In Supabase SQL Editor, run:
scripts/database/create_skills_academy_real_data.sql
```

### Issue: Videos not playing
**Solution:** Verify Vimeo URLs in `powlax_drills` table

### Issue: Progress not saving
**Solution:** Check user authentication and RLS policies

## Testing Checklist

- [ ] Series cards display with correct colors/badges
- [ ] Tab filtering works (All, Solid Start, Attack, etc.)
- [ ] Workout size selector appears on series click
- [ ] Drill sequence player loads and plays videos
- [ ] Progress saves to database
- [ ] Mobile responsive design works
- [ ] Navigation between drills works
- [ ] Session persists if user leaves and returns

## Future Enhancements

1. **Drill Library Integration**
   - Link actual drill videos from `powlax_drills` table
   - Currently using placeholder drill_sequence JSONB

2. **Progress Analytics**
   - Dashboard showing workout history
   - Streak tracking
   - Skill progression metrics

3. **Gamification**
   - Points for workout completion
   - Badges for milestones
   - Leaderboards by age group

4. **Coach Features**
   - Assign workouts to players
   - Track team progress
   - Custom workout creation

## Maintenance Notes

- Database tables use static data (no WordPress sync)
- Series names cleaned to remove redundant position text
- All data is pre-populated, no dynamic generation
- Uses Supabase Row Level Security (RLS) for user data

## Contact for Questions

This system was built in January 2025. For questions about the implementation, refer to:
- This documentation
- Code comments in components
- Database schema in `create_skills_academy_real_data.sql`