# Phase 1: Anti-Gaming Foundation Implementation

**Timeline**: 1-2 weeks  
**Priority**: CRITICAL - Stops current system exploitation  
**Impact**: 10/10 - Essential for system integrity

## Overview
This phase immediately addresses the core problem: players earning badges with minimal effort by completing easy workouts. We implement difficulty-based scoring and shift from quantity to quality.

## Tasks

### 1. Database Schema Updates ⏳

#### 1.1 Add Difficulty Score to Drills
```sql
-- Migration: add_difficulty_scores.sql
ALTER TABLE drills_powlax 
ADD COLUMN difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score BETWEEN 1 AND 5);

ALTER TABLE skills_academy_powlax 
ADD COLUMN difficulty_score INTEGER DEFAULT 3 CHECK (difficulty_score BETWEEN 1 AND 5);

-- Update difficulty based on existing age progressions
UPDATE drills_powlax
SET difficulty_score = CASE
    WHEN own_it_ages LIKE '%18+%' THEN 5
    WHEN own_it_ages LIKE '%16-17%' THEN 4
    WHEN coach_it_ages LIKE '%13-15%' THEN 3
    WHEN do_it_ages LIKE '%10-12%' THEN 2
    ELSE 1
END;
```

#### 1.2 Add Streak Tracking Fields
```sql
-- Migration: add_streak_tracking.sql
ALTER TABLE auth.users 
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN longest_streak INTEGER DEFAULT 0,
ADD COLUMN last_activity_date DATE,
ADD COLUMN streak_freeze_count INTEGER DEFAULT 2;
```

### 2. Backend Implementation ⏳

#### 2.1 Create Point Calculation Service
**File**: `/src/lib/gamification/point-calculator.ts`
```typescript
export interface WorkoutScore {
  drills: Drill[]
  totalPoints: number
  averageDifficulty: number
  categoryPoints: {
    laxCredit: number
    attackTokens: number
    defenseDollars: number
    midfieldMedals: number
    reboundRewards: number
  }
}

export function calculateWorkoutPoints(drills: Drill[]): WorkoutScore {
  if (drills.length === 0) return getEmptyScore()
  
  const avgDifficulty = drills.reduce((sum, drill) => 
    sum + drill.difficulty_score, 0) / drills.length
  
  const basePoints = Math.round(drills.length * avgDifficulty)
  
  // Calculate category-specific points based on drill types
  const categoryPoints = calculateCategoryPoints(drills, avgDifficulty)
  
  return {
    drills,
    totalPoints: basePoints,
    averageDifficulty: Math.round(avgDifficulty * 10) / 10,
    categoryPoints
  }
}
```

#### 2.2 Implement Streak Management
**File**: `/src/lib/gamification/streak-manager.ts`
```typescript
export async function updateUserStreak(userId: string) {
  const user = await getUserStreakData(userId)
  const today = new Date().toISOString().split('T')[0]
  
  if (user.last_activity_date === today) {
    return // Already active today
  }
  
  const daysSinceLastActivity = getDaysDifference(
    user.last_activity_date, 
    today
  )
  
  if (daysSinceLastActivity === 1) {
    // Continue streak
    await incrementStreak(userId)
  } else if (daysSinceLastActivity > 1) {
    // Check for freeze usage
    if (canUseStreakFreeze(user, daysSinceLastActivity)) {
      await useStreakFreeze(userId)
    } else {
      await resetStreak(userId)
    }
  }
  
  await updateLastActivityDate(userId, today)
}
```

### 3. API Endpoints ⏳

#### 3.1 Workout Completion Endpoint
**File**: `/src/app/api/workouts/complete/route.ts`
```typescript
export async function POST(request: Request) {
  const { drillIds, workoutId } = await request.json()
  const session = await getSession()
  
  // Fetch drills with difficulty scores
  const drills = await getDrillsByIds(drillIds)
  
  // Calculate points using new system
  const score = calculateWorkoutPoints(drills)
  
  // Award points to user
  await awardPoints(session.user.id, score.categoryPoints)
  
  // Update streak
  await updateUserStreak(session.user.id)
  
  // Check badge progress
  await checkBadgeProgress(session.user.id, score.categoryPoints)
  
  return Response.json({ 
    success: true, 
    score,
    streak: await getUserStreak(session.user.id)
  })
}
```

### 4. Frontend Components ⏳

#### 4.1 Difficulty Indicator Component
**File**: `/src/components/gamification/DifficultyIndicator.tsx`
```typescript
interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function DifficultyIndicator({ score, size = 'md' }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  return (
    <div className="flex gap-0.5">
      {stars.map(star => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= score 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  )
}
```

#### 4.2 Streak Counter Component
**File**: `/src/components/gamification/StreakCounter.tsx`
```typescript
export function StreakCounter({ streak, freezesLeft }: Props) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-white" />
          <div>
            <p className="text-white text-2xl font-bold">{streak}</p>
            <p className="text-white/80 text-sm">day streak</p>
          </div>
        </div>
        {freezesLeft > 0 && (
          <div className="text-white/80 text-sm">
            {freezesLeft} freeze{freezesLeft !== 1 ? 's' : ''} left
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5. Badge System Refactor ⏳

#### 5.1 Update Badge Requirements
```sql
-- Migration: update_badge_requirements.sql
UPDATE badges_powlax
SET 
  points_required = CASE
    WHEN category = 'attack' AND badge_level = 'bronze' THEN 250
    WHEN category = 'attack' AND badge_level = 'silver' THEN 1000
    WHEN category = 'defense' AND badge_level = 'bronze' THEN 250
    WHEN category = 'defense' AND badge_level = 'silver' THEN 1000
    -- etc...
  END,
  earned_by_type = 'points'
WHERE earned_by_type = 'milestone';
```

### 6. Parent Notifications ⏳

#### 6.1 Weekly Progress Email Template
**File**: `/src/lib/email/templates/weekly-hustle.tsx`
```typescript
export function WeeklyHustleEmail({ 
  playerName, 
  streak, 
  workoutsCompleted,
  averageDifficulty,
  newBadges,
  pointsEarned 
}: Props) {
  return (
    <EmailTemplate>
      <h1>{playerName}'s Weekly Hustle Report 🥍</h1>
      
      <StreakHighlight streak={streak} />
      
      <div>
        <h2>This Week's Training</h2>
        <p>{workoutsCompleted} workouts completed</p>
        <p>Average difficulty: <DifficultyStars score={averageDifficulty} /></p>
        <p>Total points earned: {pointsEarned}</p>
      </div>
      
      {newBadges.length > 0 && (
        <BadgeShowcase badges={newBadges} />
      )}
    </EmailTemplate>
  )
}
```

## Testing Requirements

### Unit Tests
- [ ] Point calculation with various difficulty combinations
- [ ] Streak logic including freeze mechanics
- [ ] Badge progress calculations

### Integration Tests
- [ ] Complete workout flow with point awards
- [ ] Streak updates across day boundaries
- [ ] Parent notification triggers

### Manual Testing
- [ ] UI displays difficulty correctly
- [ ] Points awarded match calculations
- [ ] Streak counter updates properly
- [ ] Email notifications sent weekly

## Migration Checklist

1. [ ] Backup production database
2. [ ] Run difficulty score migration
3. [ ] Update all drill records with scores
4. [ ] Deploy backend changes
5. [ ] Deploy frontend changes
6. [ ] Monitor for errors
7. [ ] Verify point calculations in production

## Success Metrics

- Average workout difficulty increases from ~1.5 to ~3.0
- Badge attainment rate decreases by 40-60%
- Daily active users increase by 20%
- Average streak length reaches 5+ days

## Notes

- All point calculations MUST happen server-side
- Difficulty scores should be visible but not editable by users
- Consider A/B testing streak freeze mechanics
- Monitor for unintended demotivation in younger users

## Dependencies

- Existing authentication system
- Email service for notifications
- Cron job or scheduled function for daily streak checks

## Blockers

None identified yet.

## Progress Log

- 2025-01-15: Task document created
- 2025-01-15: **PHASE 1 IMPLEMENTATION COMPLETE** ✅
  - ✅ Database migrations: Added difficulty_score columns, streak tracking, workout completions
  - ✅ Point calculation service: Effort-based formula (Drills × Average Difficulty)
  - ✅ Streak management: Duolingo-inspired mechanics with freezes
  - ✅ API endpoint: Secure server-side workout completion with point awards
  - ✅ UI components: DifficultyIndicator and StreakCounter with responsive design
  - ✅ Badge system: Converted from workout count to points-based requirements
  - ✅ Parent notifications: Weekly Hustle email template with progress data
  - ✅ Test suite: Comprehensive anti-gaming mechanism validation
  - ✅ Deployment script: Automated migration and verification process

## Files Created/Modified

### Database Migrations
- `supabase/migrations/005_add_difficulty_scores.sql` - Difficulty scoring system
- `supabase/migrations/006_add_streak_tracking.sql` - Streak data and functions
- `supabase/migrations/007_workout_completions.sql` - Completion tracking and point functions
- `supabase/migrations/008_update_badge_requirements.sql` - Points-based badge system

### Backend Services  
- `src/lib/gamification/point-calculator.ts` - Core anti-gaming point calculation
- `src/lib/gamification/streak-manager.ts` - Streak tracking with freeze mechanics
- `src/app/api/workouts/complete/route.ts` - Secure workout completion endpoint

### Frontend Components
- `src/components/gamification/DifficultyIndicator.tsx` - Visual difficulty display
- `src/components/gamification/StreakCounter.tsx` - Streak visualization with milestones

### Email System
- `src/lib/email/templates/weekly-hustle.tsx` - Parent notification template

### Testing & Deployment
- `src/lib/gamification/__tests__/anti-gaming.test.ts` - Comprehensive test suite
- `scripts/deploy-phase1-gamification.sh` - Automated deployment script

## Ready for Phase 2

Phase 1 anti-gaming foundation is complete and ready for production. All core mechanisms are in place to prevent system exploitation while rewarding genuine effort and consistency.

**Next:** Begin Phase 2 Enhanced Engagement implementation (tiered badges, team leaderboards, MyPlayer visualization)