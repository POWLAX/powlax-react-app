# TASK 001: Academy & Strategy Pages Implementation

## Overview
Build out the Skills Academy, Strategy/Concepts, and Gamification pages for the POWLAX app.

## Agent Assignments

### Frontend Developer (Primary)
**Pages to Build:**

1. **Skills Academy Module** (`/src/app/(authenticated)/academy/*`)
   - `/academy` - Dashboard with progress overview
   - `/academy/drills` - Browse drills with filters
   - `/academy/drills/[id]` - Individual drill page with video
   - `/academy/workouts` - Browse workout collections
   - `/academy/workouts/[id]` - Workout detail page
   - `/academy/progress` - User progress tracking

2. **Strategy/Concepts Module** (`/src/app/(authenticated)/strategies/*`)
   - `/strategies` - Browse strategies by category
   - `/strategies/[id]` - Strategy detail with video
   - `/strategies/lacrosse-lab` - Interactive diagrams

3. **Gamification Module** (`/src/app/(authenticated)/profile/*`)
   - `/profile/achievements` - Badges, points, ranks
   - `/profile/streaks` - Workout streaks tracker

**Required Components:**
- `VimeoPlayer` - Video player wrapper
- `DrillCard` - Display drill info with difficulty
- `WorkoutCard` - Display workout collections
- `StrategyCard` - Display strategy summaries
- `PointsDisplay` - Show point balances by type
- `BadgeGrid` - Display earned/available badges
- `StreakTracker` - Visual streak counter
- `ProgressBar` - Skill progression visualization

### Backend Developer (Supporting)
**API Routes & Hooks:**

1. **Skills Academy Hooks** (`/src/hooks/`)
   - `useAcademyDrills.ts` - Fetch drills with filters
   - `useAcademyWorkouts.ts` - Fetch workout collections
   - `useDrillProgress.ts` - Track user drill completion
   - `useUserPoints.ts` - Manage point balances

2. **Strategy Hooks** (`/src/hooks/`)
   - `useStrategies.ts` - Fetch strategies with filters
   - `useStrategyDrills.ts` - Get drills for a strategy

3. **Gamification Hooks** (`/src/hooks/`)
   - `useUserBadges.ts` - Fetch user badge progress
   - `useUserRank.ts` - Get current rank/progression
   - `useStreaks.ts` - Manage workout streaks

4. **API Routes** (`/src/app/api/`)
   - `/api/academy/progress` - Record drill completion
   - `/api/points/earn` - Award points for activities
   - `/api/streaks/update` - Update streak status

### UI/UX Designer (Consulting)
**Design Requirements:**
- Mobile-first responsive layouts
- Clear visual hierarchy for drill difficulty
- Engaging gamification visuals
- Intuitive navigation between modules
- Progress visualization components

## Data Integration Points

### From Database:
1. **Skills Academy Tables:**
   - `skills_academy_powlax` (was skills_academy_drills)
   - `skills_academy_workouts`
   - `workout_drill_relationships`

2. **Strategy Tables:**
   - `strategies_powlax`
   - `drill_strategy_map_powlax`

3. **Gamification Tables:**
   - `point_types_powlax`
   - `badges_powlax`
   - `player_ranks_powlax`
   - `user_points_balance_powlax`
   - `user_badge_progress_powlax`

### Key Features from Gamification Spec:
1. **Effort-Based Points:**
   - Assign Difficulty Score (1-5) to each drill
   - Points = Number of Drills × Average Difficulty Score

2. **Tiered Badges:**
   - Bronze (500 pts)
   - Silver (2000 pts + Gatekeeper challenge)
   - Gold (5000 pts + 14-day streak)

3. **Streak Mechanics:**
   - Daily minimum: 1 workout
   - Milestone bonuses at 7, 30, 100 days

4. **Parent Notifications:**
   - Weekly progress snapshots
   - Milestone achievement alerts

## Implementation Order

### Phase 1: Core Pages (Week 1)
1. Academy dashboard
2. Drill browsing/detail pages
3. Basic video player integration
4. Progress tracking API

### Phase 2: Enhanced Features (Week 2)
1. Strategy browsing/detail pages
2. Gamification dashboard
3. Point earning system
4. Badge display

### Phase 3: Advanced Features (Week 3)
1. Streak tracking
2. Parent notifications
3. Team leaderboards
4. Daily/weekly challenges

## Success Criteria
- [ ] All pages load with proper data
- [ ] Video playback works on all devices
- [ ] Points are awarded correctly
- [ ] Progress persists across sessions
- [ ] Mobile responsive design
- [ ] Loading states for all data fetches
- [ ] Error handling for failed requests

## File Organization
- Pages: `/src/app/(authenticated)/[module]/*`
- Components: `/src/components/[module]/*`
- Hooks: `/src/hooks/[module]/*`
- Types: `/src/types/[module].ts`

## Progress Tracking
**IMPORTANT:** Update this file as you complete tasks. Mark items with:
- ⏳ In Progress
- ✅ Completed
- ❌ Blocked (with reason)

## Dependencies
- Existing auth system
- Supabase client configuration
- Vimeo player SDK
- Tailwind CSS for styling
- shadcn/ui components

## Notes for Agents
1. Always use relative paths when referencing documents
2. Update this task file with progress daily
3. Create subtask files in `/tasks/academy/` for detailed work
4. Coordinate with other agents via task comments
5. Test all features on mobile devices