# Permanence Pattern Implementation - Resources Page

**Created:** January 2025  
**Reference:** @.claude/SUPABASE_PERMANENCE_PATTERN.md  
**Purpose:** Identify where the Supabase Permanence Pattern needs to be implemented in the Resources page

---

## 🎯 Features Requiring Permanence Pattern

### 1. Resource Favorites System
**Location:** `page.tsx` - Lines 231-269  
**Current State:** Mock favorites section with hardcoded data  
**Database Need:** Enhanced `user_favorites` table for resources

#### Implementation Requirements:
```typescript
// UI State (star icon toggle)
const [isFavorite, setIsFavorite] = useState(false)
const [shareWithTeam, setShareWithTeam] = useState(false)
const [shareWithClub, setShareWithClub] = useState(false)

// Data State (arrays for sharing)
const [favoriteMetadata, setFavoriteMetadata] = useState<any>({})
const [sharedTeams, setSharedTeams] = useState<number[]>([])
const [sharedClubs, setSharedClubs] = useState<number[]>([])

// Transformation at save
const saveFavoriteResource = {
  user_id: userId,
  resource_id: resourceId,
  resource_type: 'training_material', // or 'video', 'pdf', etc.
  team_share: shareWithTeam ? userTeamIds : [],
  club_share: shareWithClub ? userClubIds : [],
  tags: selectedTags || [],
  notes: personalNotes
}
```

**Database Schema Needed:**
```sql
CREATE TABLE resource_favorites (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  resource_id TEXT NOT NULL,
  resource_type TEXT,
  team_share INTEGER[] DEFAULT '{}',
  club_share INTEGER[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',        -- Custom tags for organization
  notes TEXT,
  last_accessed TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

### 2. Custom Resource Collections
**Location:** Not yet implemented but needed  
**Current State:** Individual resources shown, no collection feature  
**Database Need:** `resource_collections` table

#### Implementation Requirements:
```typescript
// UI State
const [isPublic, setIsPublic] = useState(false)
const [shareWithTeam, setShareWithTeam] = useState(false)
const [allowContributions, setAllowContributions] = useState(false)

// Data State
const [resourceIds, setResourceIds] = useState<string[]>([])
const [contributorIds, setContributorIds] = useState<string[]>([])
const [teamAccess, setTeamAccess] = useState<number[]>([])

// Transformation
const saveCollection = {
  name: collectionName,
  description: collectionDesc,
  resource_ids: resourceIds,
  visibility: isPublic ? ['public'] : [],
  team_share: shareWithTeam ? teamIds : [],
  contributor_ids: allowContributions ? contributorIds : [],
  tags: collectionTags
}
```

**Database Schema Needed:**
```sql
CREATE TABLE resource_collections (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  resource_ids TEXT[] DEFAULT '{}',     -- Array of resource IDs in collection
  visibility TEXT[] DEFAULT '{}',       -- ['public', 'private', 'team', 'club']
  team_share INTEGER[] DEFAULT '{}',
  club_share INTEGER[] DEFAULT '{}',
  contributor_ids TEXT[] DEFAULT '{}',  -- Users who can add to collection
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

### 3. Resource Ratings & Reviews
**Location:** Lines 258-263 show rating display  
**Current State:** Static rating display only  
**Database Need:** `resource_reviews` table with moderation

#### Implementation Requirements:
```typescript
// UI State
const [isHelpful, setIsHelpful] = useState(false)
const [reportInappropriate, setReportInappropriate] = useState(false)
const [shareReview, setShareReview] = useState(false)

// Data State
const [helpfulVoters, setHelpfulVoters] = useState<string[]>([])
const [flagTypes, setFlagTypes] = useState<string[]>([])
const [visibilityScopes, setVisibilityScopes] = useState<string[]>([])

// Transformation
const saveReview = {
  resource_id: resourceId,
  rating: selectedRating,
  review_text: reviewContent,
  helpful_votes: isHelpful ? [...helpfulVoters, userId] : helpfulVoters,
  flag_types: reportInappropriate ? ['inappropriate'] : [],
  visibility_scopes: shareReview ? ['team', 'club'] : ['private'],
  verified_purchase: hasAccessToResource
}
```

**Database Schema Needed:**
```sql
CREATE TABLE resource_reviews (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  resource_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_votes TEXT[] DEFAULT '{}',    -- User IDs who found helpful
  flag_types TEXT[] DEFAULT '{}',       -- ['inappropriate', 'spam', 'off-topic']
  visibility_scopes TEXT[] DEFAULT '{}', -- ['private', 'team', 'club', 'public']
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

### 4. Resource Access Tracking
**Location:** Lines 124-129 - Recently viewed section  
**Current State:** Mock recent resources  
**Database Need:** `resource_access_log` with detailed tracking

#### Implementation Requirements:
```typescript
// Automatic tracking (not UI-driven but uses arrays)
const trackAccess = {
  user_id: userId,
  resource_id: resourceId,
  access_type: 'view', // or 'download', 'share'
  access_context: ['dashboard'], // or ['search', 'collection', 'direct']
  device_types: [detectDeviceType()],
  team_context: userIsInTeamContext ? [teamId] : [],
  session_tags: getCurrentSessionTags()
}
```

---

### 5. Resource Category Subscriptions
**Location:** Lines 273-307 - Category cards  
**Current State:** Static category display  
**Database Need:** `category_subscriptions` for notifications

#### Implementation Requirements:
```typescript
// UI State
const [subscribeToUpdates, setSubscribeToUpdates] = useState(false)
const [notifyTeam, setNotifyTeam] = useState(false)
const [digestFrequency, setDigestFrequency] = useState('weekly')

// Data State
const [subscribedCategories, setSubscribedCategories] = useState<string[]>([])
const [notificationChannels, setNotificationChannels] = useState<string[]>([])
const [teamNotifications, setTeamNotifications] = useState<number[]>([])

// Transformation
const saveSubscription = {
  user_id: userId,
  category_ids: subscribeToUpdates ? subscribedCategories : [],
  notification_channels: ['email', 'in-app'],
  team_notifications: notifyTeam ? teamIds : [],
  preferences: {
    frequency: digestFrequency,
    types: selectedNotificationTypes
  }
}
```

---

## 📋 Implementation Checklist

### Database Setup
- [ ] Create `resource_favorites` table with array columns
- [ ] Create `resource_collections` table
- [ ] Create `resource_reviews` table with moderation arrays
- [ ] Create `resource_access_log` table
- [ ] Create `category_subscriptions` table
- [ ] Add proper indexes on array columns (GIN indexes)

### Component Implementation
- [ ] Add favorite toggle with team/club sharing UI
- [ ] Implement collection creation modal
- [ ] Add review system with flagging
- [ ] Track resource access automatically
- [ ] Add subscription preferences UI

### Hook Creation
- [ ] Create `useResourceFavorites` hook
- [ ] Create `useResourceCollections` hook
- [ ] Create `useResourceReviews` hook
- [ ] Create `useResourceTracking` hook
- [ ] Create `useCategorySubscriptions` hook

---

## 🔗 Primary Hook Implementation

```typescript
// useResourceFavorites.ts
export function useResourceFavorites() {
  const [favorites, setFavorites] = useState<ResourceFavorite[]>([])
  const [loading, setLoading] = useState(false)
  
  const toggleFavorite = async (resourceId: string, sharing?: any) => {
    const existingFav = favorites.find(f => f.resource_id === resourceId)
    
    if (existingFav) {
      // Remove favorite
      await supabase
        .from('resource_favorites')
        .delete()
        .eq('id', existingFav.id)
    } else {
      // Add favorite with array transformation
      const favoriteData = {
        resource_id: resourceId,
        resource_type: determineResourceType(resourceId),
        team_share: sharing?.shareWithTeam ? sharing.teamIds : [],
        club_share: sharing?.shareWithClub ? sharing.clubIds : [],
        tags: sharing?.tags || []
      }
      
      await supabase
        .from('resource_favorites')
        .insert(favoriteData)
    }
    
    await fetchFavorites() // Refresh
  }
  
  const updateFavoriteSharing = async (favoriteId: string, newSharing: any) => {
    // Critical: Transform booleans to arrays
    const updateData = {
      team_share: Array.isArray(newSharing.team_share) 
        ? newSharing.team_share 
        : newSharing.shareWithTeam ? [] : [],
      club_share: Array.isArray(newSharing.club_share)
        ? newSharing.club_share
        : newSharing.shareWithClub ? [] : [],
      tags: newSharing.tags || [],
      updated_at: new Date().toISOString()
    }
    
    await supabase
      .from('resource_favorites')
      .update(updateData)
      .eq('id', favoriteId)
  }
  
  return { favorites, loading, toggleFavorite, updateFavoriteSharing }
}
```

---

## 🎨 UI Component Integration

```typescript
// ResourceCard enhancement
function ResourceCard({ resource }) {
  const { favorites, toggleFavorite } = useResourceFavorites()
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [shareWithTeam, setShareWithTeam] = useState(false)
  const [shareWithClub, setShareWithClub] = useState(false)
  
  const isFavorited = favorites.some(f => f.resource_id === resource.id)
  
  const handleFavoriteClick = async () => {
    if (showShareOptions && !isFavorited) {
      // Save with sharing options
      await toggleFavorite(resource.id, {
        shareWithTeam,
        teamIds: shareWithTeam ? getUserTeamIds() : [],
        shareWithClub,
        clubIds: shareWithClub ? getUserClubIds() : []
      })
    } else {
      // Simple toggle
      await toggleFavorite(resource.id)
    }
  }
  
  return (
    <Card>
      <Star 
        className={isFavorited ? 'fill-yellow-400' : ''}
        onClick={handleFavoriteClick}
      />
      {/* Share options UI */}
    </Card>
  )
}
```

---

## 🚨 Critical Notes

1. **Resource IDs** - May be strings not integers, adjust array types accordingly
2. **Category subscriptions** - Complex preferences might need JSONB instead of arrays
3. **Access tracking** - Should be automatic, not require UI state management
4. **Performance** - Resource lists can be large, implement pagination
5. **Caching** - Favorites should be cached locally for instant UI updates

---

## 📅 Implementation Priority

1. **High** - Resource Favorites (immediate user value)
2. **High** - Custom Collections (organization feature)
3. **Medium** - Reviews & Ratings (community feature)
4. **Low** - Access Tracking (analytics)
5. **Low** - Category Subscriptions (future feature)