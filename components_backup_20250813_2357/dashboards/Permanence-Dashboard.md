# Permanence Pattern Implementation - Dashboard Pages

**Created:** January 2025  
**Reference:** @.claude/SUPABASE_PERMANENCE_PATTERN.md  
**Purpose:** Identify and document where the Supabase Permanence Pattern needs to be implemented in dashboard components

---

## 🎯 Features Requiring Permanence Pattern

### 1. Coach Favorites System
**Location:** `CoachDashboard.tsx` - Lines 334-349  
**Current State:** Mock data showing favorite drills  
**Database Need:** `user_favorites` table with array fields

#### Implementation Requirements:
```typescript
// UI State (checkbox for favoriting)
const [isFavorite, setIsFavorite] = useState(false)

// Data State (array of drill/strategy IDs)
const [favoriteDrillIds, setFavoriteDrillIds] = useState<number[]>([])
const [favoriteStrategyIds, setFavoriteStrategyIds] = useState<number[]>([])

// Transformation at save
const saveFavorite = {
  item_type: 'drill',
  item_ids: isFavorite ? favoriteDrillIds : [],
  team_share: shareWithTeam ? teamIds : [],
  club_share: shareWithClub ? clubIds : []
}
```

**Database Schema Needed:**
```sql
CREATE TABLE coach_favorites (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  item_type TEXT CHECK (item_type IN ('drill', 'strategy', 'player', 'resource')),
  item_ids INTEGER[] DEFAULT '{}',  -- Array of favorited item IDs
  team_share INTEGER[] DEFAULT '{}', -- Teams to share favorites with
  club_share INTEGER[] DEFAULT '{}', -- Clubs to share favorites with
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### 2. Player Performance Tracking
**Location:** `CoachDashboard.tsx` - Lines 353-366  
**Current State:** Mock "needs attention" player list  
**Database Need:** `player_tracking` table with visibility arrays

#### Implementation Requirements:
```typescript
// UI State (checkboxes for tracking flags)
const [needsAttention, setNeedsAttention] = useState(false)
const [shareWithParents, setShareWithParents] = useState(false)
const [shareWithAssistants, setShareWithAssistants] = useState(false)

// Data State (arrays of IDs)
const [flagTypes, setFlagTypes] = useState<string[]>([])
const [visibleToRoles, setVisibleToRoles] = useState<string[]>([])
const [visibleToUsers, setVisibleToUsers] = useState<string[]>([])

// Transformation
const saveTracking = {
  player_id: playerId,
  flag_types: needsAttention ? ['attendance', 'performance'] : [],
  visible_to_roles: shareWithAssistants ? ['assistant_coach'] : [],
  visible_to_users: shareWithParents ? parentUserIds : []
}
```

**Database Schema Needed:**
```sql
CREATE TABLE player_tracking (
  id UUID PRIMARY KEY,
  coach_id TEXT REFERENCES users(id),
  player_id TEXT REFERENCES users(id),
  flag_types TEXT[] DEFAULT '{}',      -- ['attendance', 'performance', 'equipment']
  visible_to_roles TEXT[] DEFAULT '{}', -- ['assistant_coach', 'parent']
  visible_to_users TEXT[] DEFAULT '{}', -- Specific user IDs
  notes TEXT,
  priority TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

### 3. Team Announcements/Messages
**Location:** `CoachDashboard.tsx` - Line 398 (Mock Team Message)  
**Current State:** Disabled button placeholder  
**Database Need:** `team_announcements` table with recipient arrays

#### Implementation Requirements:
```typescript
// UI State
const [sendToPlayers, setSendToPlayers] = useState(true)
const [sendToParents, setSendToParents] = useState(false)
const [sendToCoaches, setSendToCoaches] = useState(false)
const [pinAnnouncement, setPinAnnouncement] = useState(false)

// Data State
const [recipientRoles, setRecipientRoles] = useState<string[]>(['player'])
const [recipientTeams, setRecipientTeams] = useState<number[]>([])
const [recipientUsers, setRecipientUsers] = useState<string[]>([])

// Transformation
const saveAnnouncement = {
  title: announcementTitle,
  content: announcementContent,
  recipient_roles: recipientRoles,
  recipient_teams: recipientTeams,
  recipient_users: recipientUsers,
  flags: pinAnnouncement ? ['pinned'] : []
}
```

---

### 4. Quick Stats Customization
**Location:** `CoachDashboard.tsx` - Lines 434-461  
**Current State:** Mock stats display  
**Database Need:** `dashboard_preferences` with widget arrays

#### Implementation Requirements:
```typescript
// UI State (checkboxes for widget visibility)
const [showPracticeStats, setShowPracticeStats] = useState(true)
const [showWinLoss, setShowWinLoss] = useState(true)
const [showSkillProgress, setShowSkillProgress] = useState(true)

// Data State (array of widget configurations)
const [visibleWidgets, setVisibleWidgets] = useState<string[]>([])
const [widgetOrder, setWidgetOrder] = useState<number[]>([])

// Transformation
const savePreferences = {
  user_id: userId,
  dashboard_type: 'coach',
  visible_widgets: [...selectedWidgets],
  widget_order: [...widgetPositions],
  custom_metrics: [...trackedMetrics]
}
```

---

## 🎯 Parent Dashboard Features

### 5. Child Activity Monitoring
**Location:** Would be in `ParentDashboard.tsx`  
**Current State:** Not yet implemented  
**Database Need:** `parent_monitoring_preferences`

#### Implementation Requirements:
```typescript
// UI State
const [trackAttendance, setTrackAttendance] = useState(true)
const [trackProgress, setTrackProgress] = useState(true)
const [receiveAlerts, setReceiveAlerts] = useState(false)

// Data State
const [monitoredChildren, setMonitoredChildren] = useState<string[]>([])
const [alertTypes, setAlertTypes] = useState<string[]>([])

// Transformation
const saveMonitoring = {
  parent_id: parentId,
  monitored_children: monitoredChildren,
  alert_types: receiveAlerts ? ['absence', 'achievement', 'message'] : [],
  notification_channels: getSelectedChannels()
}
```

---

## 🎯 Admin Dashboard Features

### 6. System Monitoring Preferences
**Location:** `AdminDashboard.tsx`  
**Current State:** Not analyzed but likely needs arrays  
**Database Need:** `admin_preferences`

#### Implementation Requirements:
- Monitor specific teams (team_ids array)
- Track specific metrics (metric_types array)
- Alert thresholds (alert_rules array)

---

## 📋 Implementation Checklist

For each feature above:

- [ ] Create/verify database table with array columns
- [ ] Add migration to create necessary columns
- [ ] Implement dual state management in component
- [ ] Create transformation functions for save operations
- [ ] Add hooks for CRUD operations following pattern
- [ ] Test boolean-to-array conversions
- [ ] Verify data persistence across sessions
- [ ] Ensure RLS policies work with arrays

---

## 🔗 Hook Implementation Template

```typescript
// useDashboardFavorites.ts
export function useDashboardFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  
  const saveFavorite = async (itemId: string, itemType: string, sharing: any) => {
    // Transform boolean to array
    const favoriteData = {
      item_id: itemId,
      item_type: itemType,
      team_share: sharing.shareWithTeam ? sharing.teamIds : [],
      club_share: sharing.shareWithClub ? sharing.clubIds : []
    }
    
    // Direct column mapping
    const { data, error } = await supabase
      .from('coach_favorites')
      .insert(favoriteData)
      .select()
    
    if (!error) {
      await fetchFavorites() // Refresh list
    }
  }
  
  const updateFavorite = async (id: string, updates: any) => {
    // Handle array transformation
    const updateData = {
      ...updates,
      team_share: Array.isArray(updates.team_share) 
        ? updates.team_share 
        : updates.team_share === true ? [] : [],
      updated_at: new Date().toISOString()
    }
    
    await supabase
      .from('coach_favorites')
      .update(updateData)
      .eq('id', id)
  }
  
  return { favorites, saveFavorite, updateFavorite }
}
```

---

## 🚨 Critical Implementation Notes

1. **Never send booleans to array columns** - Always transform at the boundary
2. **Preserve existing IDs** when updating - Don't lose team/club associations
3. **Use empty arrays `[]`** not `null` for unset values
4. **Direct column mapping** - No JSON extraction or nested fields
5. **Test with actual user data** - Ensure RLS policies work correctly

---

## 📅 Implementation Priority

1. **High Priority** - Coach Favorites (most user value)
2. **High Priority** - Player Tracking (active coach need)
3. **Medium Priority** - Team Announcements
4. **Medium Priority** - Dashboard Preferences
5. **Low Priority** - Parent Monitoring (not yet built)
6. **Low Priority** - Admin Preferences (not critical)