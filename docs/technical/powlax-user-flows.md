# POWLAX User Flow Diagrams

## Entry Points & User Journeys

### 🚀 MVP User Flows (Launch Today)

#### Coach Journey - Practice Planning
```
1. LOGIN
   └─→ Role: Coach
       └─→ DASHBOARD (Team Summary)
           ├─→ TEAMS Tab
           │   └─→ Team HQ
           │       ├─→ Practice Plans
           │       │   ├─→ Create New Plan
           │       │   │   └─→ Select Drills (WITH STRATEGIES! 🎯)
           │       │   │       └─→ Save & Share
           │       │   └─→ View Past Plans
           │       └─→ Roster
           │           └─→ Player Profiles
           └─→ RESOURCES Tab
               └─→ Drill Library (Browse for practice ideas)
```

#### Player Journey - Skills Development
```
1. LOGIN
   └─→ Role: Player
       └─→ DASHBOARD (Personal Progress)
           ├─→ "Continue Training" CTA
           │   └─→ ACADEMY Tab
           │       └─→ Current Workout/Drill
           ├─→ TEAMS Tab
           │   └─→ View Today's Practice Plan
           │       └─→ See Required Drills
           └─→ ACADEMY Tab
               ├─→ Workouts
               ├─→ My Progress
               └─→ Leaderboard
```

### 🎯 Key Integration Points

#### Drill → Strategy → Practice Flow
```
RESOURCES (Drill Library)
    ↓
Find drill tagged with "2-3-1 Motion Offense"
    ↓
Add to PRACTICE PLAN
    ↓
Players see in TEAM view
    ↓
Players practice in ACADEMY
    ↓
Progress tracked in DASHBOARD
```

### 📱 Mobile Navigation Patterns

#### Bottom Tab Behavior
```
Current Tab: TEAMS
User Action: Tap ACADEMY
Result: 
- Save Teams scroll position
- Load Academy at last position
- Update bottom nav indicator
- Prefetch likely next data
```

#### Deep Link Examples
```
Push Notification: "Coach posted new drill video"
    └─→ Opens: /teams/{teamId}/announcements/{postId}
        └─→ Shows post with embedded drill
            └─→ Tap drill → /academy/drills/{drillId}

Share Link: "Check out this play"
    └─→ Opens: /teams/{teamId}/playbook/{playId}
        └─→ If not authenticated → /auth/login
            └─→ After login → Return to play
```

### 🔄 Context Switching Flows

#### Parent with Multiple Children
```
DASHBOARD (Child A)
    └─→ Child Selector (top of screen)
        └─→ Select Child B
            └─→ DASHBOARD refreshes with Child B data
                └─→ All tabs now show Child B context
```

#### Coach with Multiple Teams
```
TEAMS Tab
    └─→ Team List (if multiple)
        └─→ Select Team
            └─→ Team HQ for selected team
                └─→ Header shows current team
```

### 🚫 Navigation Dead-End Prevention

#### Never Allow:
- Player editing coach content
- Parent accessing other children's data  
- Drill without category/strategy
- Practice plan without team context
- Progress without user context

#### Always Provide:
- Back navigation
- Home/Dashboard access
- Context indicators (which team/child)
- Loading states
- Error recovery paths

### 📊 Data Preloading Strategy

#### On App Launch:
1. Load user profile & role
2. Load primary team/child
3. Prefetch dashboard data
4. Cache recent drills

#### On Tab Switch:
- TEAMS → ACADEMY: Preload user's current workout
- ACADEMY → RESOURCES: Preload drill categories
- Any → DASHBOARD: Refresh summary data

### 🎨 UI State Persistence

#### Maintained Across Navigation:
- Scroll positions per tab
- Filter/sort selections
- Expanded/collapsed sections
- Form draft data

#### Reset on Context Switch:
- Team selection
- Child selection
- Role change (future)

## Full App User Flows (Future Phases)

### Director Journey - Club Management
```
LOGIN → DASHBOARD (Club Overview)
    ├─→ TEAMS (All teams list)
    │   └─→ Select Team → View as read-only Team HQ
    ├─→ ACADEMY (Club-wide analytics)
    │   └─→ Drill down by team/player
    └─→ RESOURCES (Share club-wide content)
```

### Parent Journey - Child Monitoring
```
LOGIN → DASHBOARD (Child summary)
    ├─→ ACADEMY (Child's progress)
    │   └─→ View completed drills
    ├─→ TEAMS (Schedule & announcements)
    └─→ RESOURCES (Parent education)
        └─→ Support My Player Quiz
```

## Navigation Anti-Patterns to Avoid

### ❌ Don't:
- Create duplicate routes for similar content
- Make users hunt for related features
- Hide critical actions in submenus
- Require multiple taps for common tasks
- Break the back button

### ✅ Do:
- Keep related features close
- Use consistent navigation patterns
- Provide shortcuts for power users
- Show clear breadcrumbs
- Enable gesture navigation

## Success Indicators

### Users Can:
1. Find any feature in ≤ 3 taps
2. Return to home from anywhere
3. Switch contexts without losing work
4. Share content via deep links
5. Navigate while offline (cached routes)