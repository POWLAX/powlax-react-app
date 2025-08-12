# Permanence Pattern Implementation - Academy Page

**Created:** January 2025  
**Reference:** @.claude/SUPABASE_PERMANENCE_PATTERN.md  
**Purpose:** Identify where the Supabase Permanence Pattern needs to be implemented in the Academy/Skills Academy pages

---

## 🎯 Features Requiring Permanence Pattern

### 1. Skill Progress Tracking with Team Visibility
**Location:** `page.tsx` - Lines 124-179 (Progress Overview)  
**Current State:** Mock progress data display  
**Database Need:** Enhanced `skills_academy_user_progress` with sharing

#### Implementation Requirements:
```typescript
// UI State
const [shareProgressWithCoach, setShareProgressWithCoach] = useState(true)
const [shareProgressWithParents, setShareProgressWithParents] = useState(false)
const [shareAchievements, setShareAchievements] = useState(true)

// Data State
const [visibleToRoles, setVisibleToRoles] = useState<string[]>(['coach'])
const [visibleToUsers, setVisibleToUsers] = useState<string[]>([])
const [sharedAchievements, setSharedAchievements] = useState<string[]>([])

// Transformation
const saveProgress = {
  user_id: userId,
  workout_id: workoutId,
  skill_category: category,
  progress_percentage: progress,
  visible_to_roles: shareProgressWithCoach ? ['coach', 'assistant_coach'] : [],
  visible_to_users: shareProgressWithParents ? parentUserIds : [],
  shared_achievements: shareAchievements ? achievementIds : [],
  milestone_flags: reachedMilestones
}
```

**Database Schema Enhancement Needed:**
```sql
ALTER TABLE skills_academy_user_progress
ADD COLUMN visible_to_roles TEXT[] DEFAULT ARRAY['coach'],
ADD COLUMN visible_to_users TEXT[] DEFAULT '{}',
ADD COLUMN shared_achievements TEXT[] DEFAULT '{}',
ADD COLUMN milestone_flags TEXT[] DEFAULT '{}',
ADD COLUMN team_visible_stats TEXT[] DEFAULT '{}';
```

---

### 2. Custom Workout Plans
**Location:** Not yet implemented but needed for coaches  
**Current State:** Only preset workouts exist  
**Database Need:** `custom_workout_plans` table

#### Implementation Requirements:
```typescript
// UI State
const [assignToPlayers, setAssignToPlayers] = useState(false)
const [shareWithTeam, setShareWithTeam] = useState(false)
const [allowModification, setAllowModification] = useState(false)

// Data State
const [assignedPlayerIds, setAssignedPlayerIds] = useState<string[]>([])
const [drillSequence, setDrillSequence] = useState<number[]>([])
const [teamShareIds, setTeamShareIds] = useState<number[]>([])
const [modificationPermissions, setModificationPermissions] = useState<string[]>([])

// Transformation
const saveCustomWorkout = {
  name: workoutName,
  description: workoutDesc,
  drill_ids: drillSequence,
  assigned_players: assignToPlayers ? assignedPlayerIds : [],
  team_share: shareWithTeam ? teamShareIds : [],
  modification_permissions: allowModification ? ['player', 'assistant_coach'] : [],
  skill_categories: selectedCategories,
  difficulty_tags: difficultyLevels
}
```

**Database Schema Needed:**
```sql
CREATE TABLE custom_workout_plans (
  id UUID PRIMARY KEY,
  creator_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  drill_ids INTEGER[] NOT NULL,           -- Sequence of drill IDs
  assigned_players TEXT[] DEFAULT '{}',   -- Player IDs assigned this workout
  team_share INTEGER[] DEFAULT '{}',      -- Teams that can access
  club_share INTEGER[] DEFAULT '{}',      -- Clubs that can access
  modification_permissions TEXT[] DEFAULT '{}', -- Who can modify
  skill_categories TEXT[] DEFAULT '{}',   -- Categories covered
  difficulty_tags TEXT[] DEFAULT '{}',    -- Difficulty levels
  completion_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

### 3. Coach-Assigned Workouts
**Location:** Referenced but not implemented  
**Current State:** No assignment system exists  
**Database Need:** `workout_assignments` table

#### Implementation Requirements:
```typescript
// UI State (Coach assigning workouts)
const [assignToAll, setAssignToAll] = useState(false)
const [assignToGroup, setAssignToGroup] = useState(false)
const [requireCompletion, setRequireCompletion] = useState(false)
const [trackProgress, setTrackProgress] = useState(true)

// Data State
const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
const [trackingMetrics, setTrackingMetrics] = useState<string[]>([])
const [notificationTypes, setNotificationTypes] = useState<string[]>([])

// Transformation
const createAssignment = {
  workout_id: workoutId,
  assigned_by: coachId,
  assigned_to_players: assignToAll ? allTeamPlayerIds : selectedPlayerIds,
  assigned_to_groups: assignToGroup ? selectedGroupIds : [],
  requirements: requireCompletion ? ['mandatory'] : ['optional'],
  tracking_metrics: trackProgress ? ['completion', 'time', 'score'] : [],
  notification_types: ['in_app', 'email'],
  due_date: selectedDueDate,
  bonus_points: bonusPointValue
}
```

**Database Schema Needed:**
```sql
CREATE TABLE workout_assignments (
  id UUID PRIMARY KEY,
  workout_id INTEGER REFERENCES skills_academy_workouts(id),
  assigned_by TEXT REFERENCES users(id),
  assigned_to_players TEXT[] NOT NULL,    -- Player IDs
  assigned_to_groups TEXT[] DEFAULT '{}', -- Group/position IDs
  requirements TEXT[] DEFAULT ARRAY['optional'],
  tracking_metrics TEXT[] DEFAULT ARRAY['completion'],
  notification_types TEXT[] DEFAULT ARRAY['in_app'],
  due_date TIMESTAMP,
  bonus_points INTEGER DEFAULT 0,
  completion_status JSONB DEFAULT '{}',   -- Track per-player completion
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### 4. Achievement Unlocks & Badges
**Location:** Lines 289-308 (Recent Achievements)  
**Current State:** Mock achievement display  
**Database Need:** Enhanced `user_badges` with visibility

#### Implementation Requirements:
```typescript
// UI State
const [displayOnProfile, setDisplayOnProfile] = useState(true)
const [shareWithTeam, setShareWithTeam] = useState(true)
const [pinAchievement, setPinAchievement] = useState(false)

// Data State
const [displayLocations, setDisplayLocations] = useState<string[]>(['profile'])
const [visibilityScopes, setVisibilityScopes] = useState<string[]>(['team'])
const [pinnedBadgeIds, setPinnedBadgeIds] = useState<string[]>([])

// Transformation
const saveBadgePreferences = {
  user_id: userId,
  badge_id: badgeId,
  display_locations: displayOnProfile ? ['profile', 'leaderboard'] : [],
  visibility_scopes: shareWithTeam ? ['team', 'club'] : ['private'],
  pinned_badges: pinAchievement ? [...pinnedBadgeIds, badgeId] : pinnedBadgeIds,
  showcase_order: badgeDisplayOrder
}
```

---

### 5. Skill Category Subscriptions
**Location:** Lines 233-286 (Skill Categories)  
**Current State:** Static category display  
**Database Need:** `skill_category_preferences`

#### Implementation Requirements:
```typescript
// UI State
const [focusCategories, setFocusCategories] = useState<string[]>([])
const [hideCategories, setHideCategories] = useState<string[]>([])
const [notifyOnNew, setNotifyOnNew] = useState(false)

// Data State
const [priorityCategories, setPriorityCategories] = useState<string[]>([])
const [hiddenCategories, setHiddenCategories] = useState<string[]>([])
const [notificationCategories, setNotificationCategories] = useState<string[]>([])

// Transformation
const saveCategoryPreferences = {
  user_id: userId,
  priority_categories: focusCategories,
  hidden_categories: hideCategories,
  notification_categories: notifyOnNew ? priorityCategories : [],
  difficulty_preferences: selectedDifficulties,
  time_preferences: preferredDurations
}
```

---

## 📋 Implementation Checklist

### Database Enhancements
- [ ] Enhance `skills_academy_user_progress` with visibility arrays
- [ ] Create `custom_workout_plans` table
- [ ] Create `workout_assignments` table
- [ ] Enhance `user_badges` with display preferences
- [ ] Create `skill_category_preferences` table

### Component Updates
- [ ] Add progress sharing toggles to workout completion
- [ ] Create custom workout builder interface
- [ ] Add assignment modal for coaches
- [ ] Enhance achievement display with visibility controls
- [ ] Add category preference settings

### Hook Development
- [ ] Create `useSkillProgress` with sharing capabilities
- [ ] Create `useCustomWorkouts` hook
- [ ] Create `useWorkoutAssignments` hook
- [ ] Enhance `useBadges` with visibility
- [ ] Create `useCategoryPreferences` hook

---

## 🔗 Primary Hook Implementation

```typescript
// useWorkoutAssignments.ts
export function useWorkoutAssignments() {
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([])
  const { user } = useAuth()
  
  const createAssignment = async (workoutId: number, assignmentData: any) => {
    // Transform UI state to database arrays
    const assignment = {
      workout_id: workoutId,
      assigned_by: user.id,
      assigned_to_players: assignmentData.assignToAll 
        ? await getAllTeamPlayerIds() 
        : assignmentData.selectedPlayers,
      assigned_to_groups: assignmentData.assignToGroups 
        ? assignmentData.selectedGroups 
        : [],
      requirements: assignmentData.mandatory 
        ? ['mandatory', 'tracked'] 
        : ['optional'],
      tracking_metrics: assignmentData.trackProgress
        ? ['completion', 'time', 'score', 'attempts']
        : ['completion'],
      notification_types: getNotificationPreferences(assignmentData),
      due_date: assignmentData.dueDate,
      bonus_points: assignmentData.bonusPoints || 0
    }
    
    const { data, error } = await supabase
      .from('workout_assignments')
      .insert(assignment)
      .select()
    
    if (!error) {
      await fetchAssignments()
      await notifyPlayers(assignment.assigned_to_players, workoutId)
    }
    
    return { data, error }
  }
  
  const updateAssignment = async (assignmentId: string, updates: any) => {
    // Handle array transformations
    const updateData: any = {}
    
    if ('assignedPlayers' in updates) {
      updateData.assigned_to_players = Array.isArray(updates.assignedPlayers)
        ? updates.assignedPlayers
        : []
    }
    
    if ('requirements' in updates) {
      updateData.requirements = updates.mandatory
        ? ['mandatory', 'tracked']
        : ['optional']
    }
    
    if ('trackingMetrics' in updates) {
      updateData.tracking_metrics = updates.trackProgress
        ? ['completion', 'time', 'score']
        : []
    }
    
    await supabase
      .from('workout_assignments')
      .update(updateData)
      .eq('id', assignmentId)
  }
  
  return { assignments, createAssignment, updateAssignment }
}
```

---

## 🎨 UI Integration Example

```typescript
// WorkoutAssignmentModal.tsx
function WorkoutAssignmentModal({ workout, onClose }) {
  // UI State
  const [assignToAll, setAssignToAll] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [mandatory, setMandatory] = useState(false)
  const [trackProgress, setTrackProgress] = useState(true)
  
  // Data State for arrays
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  
  const { createAssignment } = useWorkoutAssignments()
  
  const handleAssign = async () => {
    await createAssignment(workout.id, {
      assignToAll,
      selectedPlayers: assignToAll ? [] : selectedPlayers,
      selectedGroups: groupIds,
      mandatory,
      trackProgress,
      dueDate: selectedDate,
      bonusPoints: bonusValue
    })
    
    onClose()
  }
  
  return (
    <Modal>
      {/* UI with checkboxes that map to arrays */}
      <Checkbox 
        checked={assignToAll}
        onChange={(e) => setAssignToAll(e.target.checked)}
      />
      {/* Player selection */}
      {/* Submit with transformation */}
    </Modal>
  )
}
```

---

## 🚨 Critical Implementation Notes

1. **Progress visibility** - Default to coach-visible for minors
2. **Assignment arrays** - Can get large with full team assignments
3. **Completion tracking** - Need JSONB for per-player status
4. **Badge visibility** - Consider privacy for younger players
5. **Performance** - Assignment queries need optimization for large teams

---

## 📅 Implementation Priority

1. **High** - Coach workout assignments (immediate coaching value)
2. **High** - Progress visibility controls (privacy requirement)
3. **Medium** - Custom workout creation (advanced feature)
4. **Low** - Badge display preferences (cosmetic)
5. **Low** - Category subscriptions (personalization)