# ✅ Practice Planner - Simple Solution

## Implementation

### One Component, Two Routes
- **Shared Component:** `PracticePlannerMain.tsx`
- **Standalone Route:** `/practiceplan` - No team context
- **Team Route:** `/teams/[teamId]/practiceplan` - With team context

### How It Works

#### Standalone Mode (`/practiceplan`)
```typescript
// Simple page that renders the component without team
export default function PracticePlanPage() {
  return <PracticePlannerMain />
}
```

#### Team Mode (`/teams/[teamId]/practiceplan`)
```typescript
// Fetches team info and passes to component
export default function TeamPracticePlanPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const [teamName, setTeamName] = useState<string>()
  
  // Fetch team name...
  
  return <PracticePlannerMain teamId={teamId} teamName={teamName} />
}
```

## Features

### Share to Team Button
- Shows for all users
- If no team: Shows message "No team to share to! Consider getting a Team HQ to collaborate with your team."
- If team exists: Shares practice with team

### Functionality
Both routes have identical functionality:
- ✅ Create practice plans
- ✅ Save/Load practices
- ✅ Add drills and strategies
- ✅ Print practice plans
- ✅ Auto-save to localStorage

### The Only Differences
1. **Team Name Display:** Shows in header when team context exists
2. **Save Location:** Team practices vs personal practices
3. **Share Feature:** Works with team, shows upgrade message without

## URLs

### For Coaching Kit Members:
```
http://localhost:3000/practiceplan
```

### For Team Members:
```
http://localhost:3000/teams/[teamId]/practiceplan
```

## Benefits
- ✅ Simple implementation (no complex routing)
- ✅ Same component maintains consistency
- ✅ Easy to maintain (one source of truth)
- ✅ Clear user messaging for team features
- ✅ Works for all membership types