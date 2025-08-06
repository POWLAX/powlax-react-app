# A4CC - Simple Team Dashboard Builder

## 🎯 **Agent Mission**
Build clean, simple team dashboards that are MINIMAL and ACTIONABLE. Focus on clarity over features - users should know exactly where to go and what to do.

## 🚨 **CRITICAL ERROR PREVENTION**

### **🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)**
**BEFORE creating any file**: Verify ALL imports exist
- **Check these paths work**:
  - `@/contexts/JWTAuthContext` ✅ (for auth)
  - `@/components/ui/...` ✅ (for UI components)
  - `@/lib/supabase` ✅ (for database)
- **NEVER import**: `@/hooks/useAuthContext` ❌ (doesn't exist)

### **🛡️ Null Safety (UI Crashes)**
- Always use: `team?.name ?? 'Team'`
- Filter functions: `(members?.filter(m => m.role === 'player') ?? [])`
- Database queries: `teams?.map() ?? []`

### **🗄️ Database Safety**
- Always handle null values from DB: `team?.players ?? []`
- Use proper TypeScript interfaces for Supabase queries
- Test queries with empty result sets

### **🔧 After Changes**
- Restart server if making new files: `rm -rf .next && npm run dev`
- Verify correct port in terminal output

## 🎯 **SIMPLE DASHBOARD PHILOSOPHY**

### **CLEAN & MINIMAL DESIGN PRINCIPLES** ⭐⭐⭐
```typescript
// NOT THIS: Busy interface with tons of widgets
❌ Complex multi-column layouts
❌ Too many charts and statistics  
❌ Overwhelming navigation menus
❌ Multiple action buttons everywhere

// THIS: Clean, focused interface
✅ Single-column layout with clear sections
✅ 3-4 key statistics maximum
✅ One primary action per section
✅ Clear visual hierarchy
```

### **USER-FIRST APPROACH** ⭐⭐⭐
```typescript
// Ask: "What does the user need to do RIGHT NOW?"
interface SimpleTeamDashboard {
  // Top section: Quick team overview (name, key stats)
  teamOverview: {
    name: string
    playerCount: number  
    nextPractice?: Date
    primaryAction: 'Invite Players' | 'Plan Practice' | 'View Academy'
  }
  
  // Middle section: Most important current task
  currentFocus: {
    title: string // "Get Your First Players" or "Plan This Week's Practice"
    description: string
    actionButton: string
    actionUrl: string
  }
  
  // Bottom section: Quick access to essentials
  quickAccess: {
    players: { count: number, url: string }
    practices: { upcoming: number, url: string }
    academy: { available: number, url: string }
  }
}
```

## 🏗️ **DASHBOARD VARIANTS TO BUILD**

### **1. Coach Team Dashboard** ⭐⭐⭐
**Route**: `/teams/[teamId]/dashboard` (enhance existing)
**For**: Team HQ coaches managing single team

```typescript
// SIMPLE 3-section layout
<CoachDashboard>
  {/* Section 1: Team Quick View */}
  <TeamHeader>
    <h1>{team.name}</h1>
    <p>{playerCount} players • Next practice: {nextPractice}</p>
    <PrimaryButton>Plan Practice</PrimaryButton>
  </TeamHeader>
  
  {/* Section 2: Current Priority Task */}
  <CurrentTask>
    {playerCount === 0 && (
      <TaskCard title="Get Your First Players" action="Invite Players" />
    )}
    {playerCount > 0 && !hasUpcomingPractice && (
      <TaskCard title="Plan This Week's Practice" action="Create Practice" />
    )}
    {playerCount > 0 && hasUpcomingPractice && (
      <TaskCard title="Review Practice Plan" action="View Practice" />
    )}
  </CurrentTask>
  
  {/* Section 3: Quick Access - ONLY 3 items */}
  <QuickAccess>
    <AccessCard title="Players" count={playerCount} url="/players" />
    <AccessCard title="Practices" count={practiceCount} url="/practices" />  
    <AccessCard title="Academy" count="Available" url="/academy" />
  </QuickAccess>
</CoachDashboard>
```

### **2. Director Organization Dashboard** ⭐⭐⭐  
**Route**: `/organizations/[orgId]/dashboard` (enhance existing)
**For**: Club OS directors managing multiple teams

```typescript
// SIMPLE teams-focused layout
<DirectorDashboard>
  {/* Section 1: Organization Quick View */}
  <OrgHeader>
    <h1>{organization.name}</h1>
    <p>{teamCount} teams • {totalPlayers} total players</p>
    <PrimaryButton>Add Team</PrimaryButton>
  </OrgHeader>
  
  {/* Section 2: Teams Grid - SIMPLE cards */}
  <TeamsGrid>
    {teams.map(team => (
      <SimpleTeamCard key={team.id}>
        <h3>{team.name}</h3>
        <p>{team.playerCount} players</p>
        <p>Coach: {team.coachName}</p>
        <Button>Manage</Button>
      </SimpleTeamCard>
    ))}
    {canAddTeams && <AddTeamCard />}
  </TeamsGrid>
  
  {/* Section 3: Organization Quick Stats - ONLY essentials */}
  <OrgStats>
    <StatCard title="Total Players" value={totalPlayers} />
    <StatCard title="Active Coaches" value={coachCount} />
    <StatCard title="This Week's Practices" value={weeklyPractices} />
  </OrgStats>
</DirectorDashboard>
```

### **3. Player Personal Dashboard** ⭐⭐
**Route**: `/player/dashboard` (create new)
**For**: Players seeing their progress and assignments

```typescript
// SUPER SIMPLE player-focused layout
<PlayerDashboard>
  {/* Section 1: Welcome & Progress */}
  <PlayerHeader>
    <h1>Welcome back, {playerName}!</h1>
    <p>Team: {teamName}</p>
    <ProgressBar current={pointsEarned} goal={weeklyGoal} />
  </PlayerHeader>
  
  {/* Section 2: What to do next */}
  <NextAction>
    {hasAssignedWorkout && (
      <ActionCard title="Complete Your Assigned Workout" action="Start Workout" />
    )}
    {!hasAssignedWorkout && (
      <ActionCard title="Choose a Skills Academy Workout" action="Browse Academy" />
    )}
  </NextAction>
  
  {/* Section 3: Quick Progress Overview */}
  <PlayerStats>
    <StatCard title="Points This Week" value={weeklyPoints} />
    <StatCard title="Workouts Completed" value={completedWorkouts} />
    <StatCard title="Team Rank" value={`#${teamRank}`} />
  </PlayerStats>
</PlayerDashboard>
```

## 🎨 **SIMPLE UI COMPONENTS TO CREATE**

### **Essential Components ONLY** 
```typescript
// Keep it minimal - only create what's needed
components/dashboards/
├── SimpleTeamCard.tsx          // Clean team overview card
├── TaskCard.tsx                // Current priority task display  
├── QuickAccessCard.tsx         // Simple navigation cards
├── StatCard.tsx                // Basic statistic display
├── ActionButton.tsx            // Primary action buttons
└── ProgressBar.tsx             // Simple progress indicator
```

### **TaskCard Component Example**
```typescript
interface TaskCard {
  title: string
  description?: string
  actionText: string
  actionUrl: string
  priority: 'high' | 'medium' | 'low'
}

// Clean, focused design
<div className="bg-white rounded-lg border p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
  {description && (
    <p className="text-gray-600 mt-2">{description}</p>
  )}
  <Button 
    href={actionUrl}
    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    {actionText}
  </Button>
</div>
```

## 🗃️ **DATABASE QUERIES (KEEP SIMPLE)**

### **Essential Queries Only**
```typescript
// Coach Dashboard Data
const getCoachDashboardData = async (teamId: string) => {
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, coach_name')
    .eq('id', teamId)
    .single()
    
  const { data: players } = await supabase
    .from('team_members')
    .select('id, name, role')
    .eq('team_id', teamId)
    .eq('role', 'player')
    
  // Keep queries simple and focused
  return { team, playerCount: players?.length ?? 0 }
}

// Director Dashboard Data  
const getDirectorDashboardData = async (orgId: string) => {
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, player_count, coach_name')
    .eq('organization_id', orgId)
    
  return { teams, teamCount: teams?.length ?? 0 }
}
```

## 🎯 **SIMPLE SUCCESS CRITERIA**

### **Must Have - MINIMAL VIABLE DASHBOARDS**
- [ ] Coach can see team name, player count, and next practice
- [ ] Coach has ONE clear primary action based on team state
- [ ] Director can see all teams in simple grid layout
- [ ] Director can add new teams easily
- [ ] Player can see current progress and next action
- [ ] All dashboards load fast with minimal queries

### **Should Have - CLEAN POLISH**
- [ ] Responsive design that works on mobile
- [ ] Loading states for all data
- [ ] Empty states when no data exists
- [ ] Simple navigation between dashboards

### **NEVER INCLUDE**
- ❌ Complex charts or analytics
- ❌ Too many statistics or metrics  
- ❌ Busy layouts with multiple columns
- ❌ Overwhelming navigation menus
- ❌ More than 3 primary actions visible at once

## 📱 **MOBILE-FIRST SIMPLE DESIGN**

### **Single Column Layout Always**
```css
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.dashboard-section {
  margin-bottom: 32px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
```

## 📝 **MANDATORY: Documentation Self-Update (CRITICAL)**

### **Phase Final: Documentation Self-Update (MANDATORY)**
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any UI problems encountered with dashboard component context
2. **Troubleshooting Guide Update**: Add new UI dashboard patterns if discovered
3. **Builder Template Enhancement**: Update UI template with simple dashboard strategies
4. **Future Agent Guidance**: Create specific warnings for dashboard UI work

**Success Criteria**:
- [ ] All dashboard issues documented with component/layout context
- [ ] Troubleshooting guide updated with new dashboard UI patterns
- [ ] UI agent template enhanced with simple design principles
- [ ] Future dashboard agents have specific guidance for minimal design approach

**Reference**: Follow [`AGENT_SELF_UPDATE_PROTOCOL.md`](AGENT_SELF_UPDATE_PROTOCOL.md) exactly

---

**CRITICAL REMINDER: Build SIMPLE, CLEAN interfaces. Users should immediately know where to go and what to do. Less is more!**