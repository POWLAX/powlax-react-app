# POWLAX Navigation Plan & Route Architecture

## Executive Summary
This plan defines the navigation structure and routes for POWLAX, ensuring all components work together from day one. It identifies MVP routes vs. full implementation and maps data requirements to prevent rebuilding.

## Core Navigation Architecture

### Bottom Navigation (Persistent)
```
[Dashboard] [Teams] [Academy] [Resources] [Community]
```
- Same tabs for ALL users
- Content adapts based on role
- Mobile-first design pattern

### Route Structure
```
/auth
  /login
  /register
  /role-selection
  /onboarding/{role}

/dashboard (role-adaptive)

/teams
  /{teamId}
    /roster
    /playbook
    /practice-plans
    /announcements

/academy
  /workouts
  /progress
  /leaderboard
  /skill-check

/resources
  /coaching-kits (coaches only)
  /drill-library
  /parent-guides (parents only)

/community
  /forums
  /messages

/profile
  /settings
```

## MVP Implementation (Launch Today)

### Phase 1: Core Practice Planner
**Routes Required:**
1. `/auth/login` - Simple auth
2. `/dashboard` - Role-based home
3. `/teams/{teamId}` - Team HQ
4. `/teams/{teamId}/practice-plans` - Practice builder
5. `/teams/{teamId}/roster` - Player management
6. `/academy/drill-library` - Drill browser with strategy connections

**Data Tables Needed:**
- `users` (with role field)
- `teams` 
- `practice_plans`
- `drills` (WITH strategy_ids, skill_ids)
- `strategies`
- `skills`

### Critical MVP Features
1. **Drill → Strategy Connections** (Your key differentiator!)
2. **Practice Plan Builder** with drill selection
3. **Mobile-responsive design**
4. **Basic role separation** (Coach vs Player views)

## User Flow Maps

### Coach Flow (MVP)
```
Login → Dashboard → Teams → Practice Plans
                     ↓
                  Roster → Player Profiles
                     ↓
              Drill Library (with strategies!)
```

### Player Flow (MVP)
```
Login → Dashboard → Academy → View Drills
                      ↓
                   Teams → View Practice Plan
```

### Data Flow Requirements
Each route needs specific data:
- **Practice Plans**: Requires drills + strategies + skills
- **Player Profiles**: Requires progress + badges + assessments
- **Drill Library**: Requires full relationships (strategy/skill/concept)

## Full Implementation Phases

### Phase 2: Skills Academy
**Additional Routes:**
- `/academy/workouts/{workoutId}`
- `/academy/progress/player/{playerId}`
- `/academy/skill-check`
- `/academy/leaderboard`

**Additional Tables:**
- `workouts`
- `user_progress`
- `badges`
- `points_ledger`

### Phase 3: Parent Portal & Director Analytics
**Additional Routes:**
- `/dashboard/child/{childId}` (parent view)
- `/analytics/club` (director view)
- `/resources/parent-quiz`

### Phase 4: Community & Advanced Features
**Additional Routes:**
- `/community/forums/{forumId}`
- `/teams/{teamId}/playbook/{playId}`
- `/resources/master-class/{moduleId}`

## Navigation Guards & Middleware

### Role-Based Access
```javascript
// Route protection example
/teams/{teamId}/practice-plans
  - Coaches: Full CRUD
  - Players: Read only
  - Parents: No access
  - Directors: Read only

/academy/progress
  - Players: Own data only
  - Coaches: Team data
  - Parents: Child data only
  - Directors: All data
```

### Context Switching
- Users with multiple teams: Team selector in header
- Parents with multiple children: Child selector in dashboard
- Coaches who are parents: Role toggle (future)

## Data Optimization for Routes

### Prevent Rebuilding by Planning Data Needs
1. **Drills Route** needs:
   - drill data
   - strategy relationships
   - skill relationships
   - video URLs
   - age progressions

2. **Practice Plans Route** needs:
   - drill selections
   - duration calculations
   - team context
   - shareable format

3. **Progress Routes** need:
   - completion tracking
   - point calculations
   - badge triggers
   - leaderboard rankings

## Component Reuse Strategy

### Shared Components Across Routes
- `DrillCard` - Used in library, practice plans, academy
- `ProgressBar` - Used in profiles, dashboard, academy
- `TeamSelector` - Used in header when multiple teams
- `VideoPlayer` - Used for drills, resources, master classes

### Route-Specific Components
- `PracticePlanBuilder` - Only in /teams/practice-plans
- `SkillCheckQuiz` - Only in /academy/skill-check
- `LeaderboardTable` - Only in /academy/leaderboard

## Mobile-First Navigation Patterns

### Gesture Support
- Swipe between tabs (optional)
- Pull to refresh on lists
- Long press for quick actions

### Deep Linking
Enable direct navigation:
- `/drills/{drillId}` - Direct to drill
- `/teams/{teamId}/announcements/{postId}` - Direct to post
- `/academy/badge/{badgeId}` - Direct to achievement

## State Management Across Routes

### Global State Needs
- Current user + role
- Selected team (if multiple)
- Selected child (parents)
- Notification counts

### Route-Level State
- Form data (practice builder)
- Filter/sort preferences
- Scroll positions

## Launch Checklist

### Today's MVP Launch
- [ ] Auth routes working
- [ ] Dashboard shows role-based content
- [ ] Teams route shows practice planner
- [ ] Drills show strategy connections
- [ ] Mobile responsive on all routes
- [ ] Data flows properly between routes

### Next Week
- [ ] Academy workout tracking
- [ ] Progress visualization
- [ ] Leaderboard functionality
- [ ] Parent portal basics

## Route Testing Matrix

| Route | Coach | Player | Parent | Director |
|-------|-------|--------|--------|----------|
| /dashboard | ✓ Team stats | ✓ Progress | ✓ Child overview | ✓ Club stats |
| /teams | ✓ Full access | ✓ View only | ✓ Schedule only | ✓ All teams |
| /academy | ✓ Team view | ✓ Full access | ✓ Child view | ✓ Analytics |
| /resources | ✓ Coaching | ✓ Limited | ✓ Parent guides | ✓ All |

## Success Metrics
- No route requires rebuilding after launch
- All data relationships work across routes
- Users can navigate intuitively
- Mobile performance stays fast
- No "dead ends" in navigation