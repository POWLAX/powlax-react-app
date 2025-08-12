# Working Database Integrations

**Created:** August 12, 2025  
**Status:** VERIFIED - Based on actual working code  
**Purpose:** Document confirmed table integrations from live pages  

---

## 🎯 Overview

This document captures the **verified working database integrations** from the POWLAX React app. All information here is based on actual functioning code, not assumptions or documentation.

---

## ✅ Verified Working Pages

### 1. Practice Planner (`/practiceplan`)

**File:** `src/app/(authenticated)/teams/[teamId]/practiceplan/page.tsx`

#### **Database Tables Used:**
- `powlax_drills` (135 records) - Main drill library
- `user_drills` (6 records) - User-created custom drills
- `powlax_strategies` (220 records) - Strategy library  
- `user_strategies` (4 records) - User-created custom strategies
- `practices` (34 records) - Saved practice plans
- `practice_drills` (32 records) - Drill instances with notes

#### **Key Columns & Relationships:**
```sql
-- user_drills table
user_drills: {
  id, user_id, title, content, duration_minutes, category,
  team_share: INTEGER[], -- Array of team IDs
  club_share: INTEGER[], -- Array of club IDs
  equipment, tags, video_url
}

-- user_strategies table  
user_strategies: {
  id, user_id, strategy_name, description,
  team_share: INTEGER[], -- Array of team IDs
  club_share: INTEGER[], -- Array of club IDs
  see_it_ages, coach_it_ages, own_it_ages
}
```

#### **Confirmed Hooks Used:**
- `useDrills()` - Fetches from both `powlax_drills` and `user_drills`
- `useStrategies()` - Fetches from both `powlax_strategies` and `user_strategies`
- `usePracticePlans()` - Saves/loads from `practices` table

---

### 2. Skills Academy Workouts (`/skills-academy/workouts`)

**File:** `src/app/(authenticated)/skills-academy/workouts/page.tsx`

#### **Database Tables Used:**
- `skills_academy_series` (49 records) - Workout series definitions
- `skills_academy_workouts` (166 records) - Individual workouts

#### **Key Relationships:**
```sql
-- skills_academy_workouts has series_id foreign key
skills_academy_workouts: {
  id, series_id, workout_name, workout_size,
  drill_ids: INTEGER[], -- Array of drill IDs (NO JUNCTION TABLE!)
  estimated_duration_minutes, is_active
}
```

---

### 3. Skills Academy Workout Player (`/skills-academy/workout/[id]`)

**File:** `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`

#### **Database Tables Used:**
- `skills_academy_series` (49 records) - Series info
- `skills_academy_workouts` (166 records) - Workout definitions
- `skills_academy_drills` (167 records) - **PRIMARY drill library**
- `wall_ball_drill_library` (48 records) - Wall ball drill segments
- `skills_academy_user_progress` (5 records) - User progress tracking

#### **Key Integration Pattern:**
```typescript
// Workouts contain drill IDs in array column
workout.drill_ids = [1, 5, 12, 23] // References skills_academy_drills.id

// Wall Ball integration - checks series type
if (workout.series.series_type === 'wall_ball') {
  // Use wall_ball_drill_library for video segments
}
```

#### **RPC Functions Used:**
- `award_drill_points(p_user_id, p_drill_id, p_drill_count, p_workout_id)`
- `get_user_points(p_user_id)`

---

## 🔑 Key Database Patterns

### 1. No Junction Tables Used

**Skills Academy:** Uses `drill_ids` array column instead of junction table:
```sql
-- ❌ NOT USED: skills_academy_workout_drills (junction table is empty)
-- ✅ USED: skills_academy_workouts.drill_ids INTEGER[]
```

### 2. Array Columns for Sharing (Permanence Pattern)

**User-created content** uses array columns for team/club sharing:
```sql
team_share INTEGER[], -- [1, 5, 12] - specific team IDs
club_share INTEGER[]  -- [2, 8] - specific club IDs
```

### 3. Duplicate Tables Identified

**Primary vs. Duplicate:**
- `skills_academy_drills` (167 records) - **PRIMARY drill table**
- `position_drills` (167 records) - **DUPLICATE** (same data, don't use)

---

## 📊 Table Status Summary

### ✅ Confirmed Active Tables (Working)
- `powlax_drills` (135 records)
- `powlax_strategies` (220 records)
- `practices` (34 records)
- `practice_drills` (32 records)
- `user_drills` (6 records)
- `user_strategies` (4 records)
- `skills_academy_series` (49 records)
- `skills_academy_workouts` (166 records)
- `skills_academy_drills` (167 records)
- `wall_ball_drill_library` (48 records)
- `skills_academy_user_progress` (5 records)

### ⚠️ Legacy Tables (Have Data But Don't Use)
- `drill_game_states` (214 records) - Legacy data
- `game_states` (6 records) - Legacy data
- `practice_summary` (34 records) - Legacy data

### ❌ Deprecated Tables (Don't Use)
- `position_drills` (167 records) - Duplicate of `skills_academy_drills`

### ❌ Non-Existent Tables (Never Reference)
- `drills` - Use `powlax_drills`
- `strategies` - Use `powlax_strategies`
- `practice_plans` - Use `practices`
- `user_profiles` - Use `users`
- `organizations` - Use `clubs`
- `badges` - Use `user_badges`

---

## 🔧 Development Guidelines

### 1. When Adding New Features

**Always use these verified table names:**
```typescript
// ✅ Correct
.from('powlax_drills')
.from('powlax_strategies') 
.from('practices')
.from('skills_academy_drills')

// ❌ Wrong
.from('drills')
.from('strategies')
.from('practice_plans')
.from('position_drills')
```

### 2. When Building Relationships

**Skills Academy:** Use drill_ids column:
```typescript
// ✅ Correct - Use array column
workout.drill_ids // [1, 5, 12]

// ❌ Wrong - Junction table is empty
.from('skills_academy_workout_drills') 
```

### 3. When Implementing Sharing

**User Content:** Use array columns:
```typescript
// ✅ Correct - Array columns
team_share: number[] // [1, 5, 12]
club_share: number[] // [2, 8]

// Transform booleans to arrays at save time
team_share: isShared ? existingTeamIds : []
```

---

## 🎯 Success Criteria

This documentation ensures:
- ✅ All references use actual existing tables
- ✅ No references to deprecated or duplicate tables
- ✅ Relationships match actual working code
- ✅ Array column patterns are documented
- ✅ RPC functions are noted for points system

---

**Status:** COMPLETE - All working integrations documented from live code