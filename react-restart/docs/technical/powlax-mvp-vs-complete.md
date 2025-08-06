# POWLAX MVP vs Complete Implementation Guide

## 🎯 MVP Focus: Practice Planner with Drill-Strategy Intelligence

### What Makes This Different from v1.4.2
Your old system had drills and game states but NO connections between drills and strategies. This connection is your breakthrough feature that must be in the MVP.

## 📅 MVP Pages (Launch Today)

### Required Routes - 6 Core Pages
```
1. /login
2. /dashboard 
3. /teams/{teamId}
4. /teams/{teamId}/practice-plans (THE STAR!)
5. /academy/drills (Browse with strategy filters)
6. /profile/settings
```

### Required Components
```
- BottomNavigation (persistent)
- DrillCard (shows strategy tags!)
- PracticePlanBuilder
- StrategyFilter
- MobileVideoPlayer
```

### Required Data Relationships
```
drills ←→ strategies (MUST HAVE!)
drills ←→ skills (MUST HAVE!)
drills → age_progressions
practice_plans → drills
users → teams
```

## 🚀 Complete Version (Phases 2-4)

### Phase 2: Skills Academy (Week 2)
```
ADD:
/academy/workouts
/academy/progress
/academy/leaderboard
/academy/skill-check

TABLES:
+ workouts
+ user_progress  
+ badges
+ points_ledger
```

### Phase 3: Parent Portal (Week 3)
```
ADD:
/dashboard/child/{childId}
/academy/child/{childId}/progress
/resources/parent-quiz
/teams/{teamId}/schedule

TABLES:
+ parent_child_relationships
+ quiz_responses
```

### Phase 4: Advanced Features (Week 4+)
```
ADD:
/community/*
/resources/master-class/*
/analytics/*
/teams/{teamId}/playbook/*

TABLES:
+ forums
+ master_class_modules
+ coach_certifications
```

## 🏗️ Architecture Decisions for Non-Siloed Development

### 1. Shared Data Layer
```typescript
// core/api/drills.ts - Used by ALL routes
export const drillsAPI = {
  getWithStrategies: (drillId) => {
    // Returns drill + strategies + skills
    // Used by: practice planner, academy, resources
  },
  
  filterByStrategy: (strategyId) => {
    // Returns drills for a strategy
    // Used by: drill library, practice builder
  }
}
```

### 2. Component Library Structure
```
/components
  /shared (used everywhere)
    - DrillCard
    - ProgressBar
    - VideoPlayer
  /features
    /practice-planner (only here)
      - PlanBuilder
      - DrillPicker
    /academy (only here)  
      - WorkoutTracker
      - SkillCheck
```

### 3. Route Guards from Day One
```typescript
// Even in MVP, plan for roles
const routes = {
  '/teams/:id/practice-plans': {
    create: ['coach', 'director'],
    read: ['coach', 'player', 'parent', 'director'],
    update: ['coach'],
    delete: ['coach']
  }
}
```

## 📊 Data Structure - Build Right First Time

### MVP Tables (With Future Fields)
```sql
-- drills table (MVP + future-ready)
CREATE TABLE drills (
  -- MVP fields
  id, name, description, duration_min, video_url,
  
  -- Relationship fields (MVP CRITICAL!)
  strategy_ids[], skill_ids[], concept_ids[],
  
  -- Future fields (add now, populate later)
  age_progressions jsonb,
  movement_principle_ids[],
  coaching_points text[]
);

-- practice_plans table
CREATE TABLE practice_plans (
  -- MVP fields  
  id, team_id, coach_id, date, drill_ids[],
  
  -- Future fields (empty for now)
  notes text,
  shared_with_parents boolean,
  template_name text
);
```

## 🎨 UI Patterns - Consistent from Start

### Mobile-First Components (MVP)
```jsx
// Use these patterns everywhere from day one
<BottomNav /> // Not a drawer menu
<CardList /> // Not tables
<SwipeableViews /> // Not tabs
<PullToRefresh /> // Not refresh buttons
```

### Role-Adaptive Views (Plan Now)
```jsx
// Dashboard component handles ALL roles
function Dashboard() {
  const { role } = useUser();
  
  switch(role) {
    case 'coach': return <CoachDashboard />;
    case 'player': return <PlayerDashboard />;
    case 'parent': return <ParentDashboard />;
    case 'director': return <DirectorDashboard />;
  }
}
```

## 🔌 Integration Points - Don't Paint Yourself Into Corners

### Video Integration (MVP)
```jsx
// Start with simple embed, but structure for future
<VideoPlayer 
  url={drill.video_url}
  timestamps={drill.timestamps} // Empty in MVP
  onComplete={trackProgress} // Empty function in MVP
/>
```

### Progress Tracking (Structure Now, Implement Later)
```jsx
// In drill completion (MVP)
const completeDrill = (drillId) => {
  // MVP: Just mark complete
  setComplete(drillId);
  
  // Future: Will add
  // - Points calculation
  // - Badge triggers  
  // - Leaderboard updates
  // - Parent notifications
};
```

## ⚡ Performance Considerations from Day One

### Data Loading Strategy
```
MVP Pages:
- Dashboard: Load user + team summary only
- Practice Plans: Load drills with strategies (paginated)
- Drill Library: Load categories, lazy load drills

Future:
- Add caching layer
- Add optimistic updates
- Add offline support
```

### Image/Video Optimization
```
MVP: 
- Use Vimeo/YouTube embeds
- Lazy load images

Future:
- Add thumbnail generation
- Add quality selection
- Add download for offline
```

## 🚦 Launch Readiness Checklist

### Must Have for Today:
- [ ] Coaches can create practice plans
- [ ] Drills show strategy connections  
- [ ] Players can view practice plans
- [ ] Mobile responsive all pages
- [ ] Basic auth with roles

### Can Wait:
- [ ] Points and badges
- [ ] Video timestamps
- [ ] Parent accounts
- [ ] Community features
- [ ] Analytics

### Never Compromise On:
- [ ] Drill-Strategy relationships
- [ ] Mobile-first design
- [ ] Role-based architecture
- [ ] Scalable data structure

## 🎯 Success Metrics for MVP

1. **Coach says**: "Finally, I can see which drills support my offensive strategy!"
2. **Player says**: "I know exactly what we're doing at practice"
3. **Data shows**: Every drill has at least one strategy connection
4. **Performance**: All pages load in <2 seconds on mobile
5. **No regression**: Everything in MVP still works when Phase 2 launches