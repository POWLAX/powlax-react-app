# Resources Page - Data Integration Documentation

## Overview
The Resources page now features a comprehensive data integration system that seamlessly combines real Supabase data with mock fallback data. This ensures users always see relevant content, even when database tables don't exist yet.

## Key Features Implemented

### 1. **ResourceDataProvider Class**
- **Location**: `/src/lib/resources-data-provider.ts`
- **Purpose**: Central data provider that attempts to fetch real data from Supabase and falls back to mock data
- **Key Methods**:
  - `getResourcesForRole(role)` - Fetches role-specific resources
  - `getUserFavorites(userId)` - Gets user's favorited resources
  - `getRecentlyViewed(userId)` - Retrieves recently viewed resources
  - `searchResources(query, filters)` - Search and filter resources
  - `toggleFavorite(userId, resourceId)` - Toggle favorite status
  - `trackView(userId, resourceId)` - Track resource views

### 2. **Mock Data with (MOCK) Suffix**
All mock resources are clearly labeled with "(MOCK)" suffix in their titles:
- **Coach Resources**: Practice planning templates, training videos, certification guides
- **Player Resources**: Skill development videos, workout plans, game film
- **Parent Resources**: Equipment guides, nutrition tips, safety information
- **Director Resources**: Administrative forms, budget templates, coach development
- **Admin Resources**: API documentation, platform guides, troubleshooting tools

### 3. **Role-Based Content Display**
The Resources page adapts its content based on the logged-in user's role:
```typescript
// Automatic role detection
const getUserRole = () => {
  if (!user) return 'player'
  return user.role || 'player'
}
```

### 4. **Visual Indicators**
- **Mock Data Badge**: Resources show "Mock" or "Sample Data" badges
- **Live Data Indicator**: Bottom of page shows data source status
- **Favorites Section**: Shows "(MOCK - FAVORITED)" for mock favorites
- **Recent Section**: Shows "(MOCK - RECENT)" for mock recent items

## Database Tables (Future Implementation)

### powlax_resources
```sql
CREATE TABLE powlax_resources (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  resource_type VARCHAR(50), -- video, pdf, template, link
  url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration_seconds INTEGER,
  age_groups TEXT[],
  roles TEXT[],
  rating DECIMAL(2,1),
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### user_resource_interactions
```sql
CREATE TABLE user_resource_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  resource_id UUID REFERENCES powlax_resources(id),
  is_favorite BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  last_viewed TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## How It Works

### Data Flow
1. **Page Load**: Resources page component mounts
2. **Role Detection**: System identifies user role (coach, player, parent, director, admin)
3. **Data Fetch Attempt**: ResourceDataProvider tries to fetch from Supabase
4. **Fallback Logic**: If tables don't exist or error occurs, mock data is loaded
5. **UI Update**: Page displays resources with appropriate indicators

### Mock Data Example
```typescript
{
  id: 'mock-coach-1',
  title: 'U12 Practice Plan Template (MOCK)',
  description: 'Complete practice plan template...',
  category: 'Practice Planning',
  resource_type: 'template',
  rating: 4.8,
  downloads_count: 234,
  is_mock: true  // This flag identifies mock data
}
```

## User Experience

### What Users See
1. **Role-Specific Title**: "Coach Resources", "Player Resources", etc.
2. **Categorized Content**: 4 main categories per role with appropriate icons
3. **Search & Filter**: Functional search bar and category filters
4. **Favorites Section**: Shows favorited resources (mock or real)
5. **Recent Resources**: Displays recently viewed items
6. **Quick Access Cards**: Role-specific toolkit and featured content

### Data Source Transparency
- Mock resources clearly show "(MOCK)" in titles
- Badge indicators show "Mock" vs "Live" data
- Footer message indicates data source:
  - "Showing sample data with (MOCK) suffix. Real data will appear when available."
  - "Showing live data from POWLAX database."

## Testing the Implementation

### Local Testing
1. Navigate to `/resources` while logged in
2. Observe role-specific content and categories
3. Try search functionality
4. Click category cards to filter
5. Check for (MOCK) suffixes in resource titles

### Role Testing
Test with different user roles to see adapted content:
- `team_coach` - Coaching resources
- `player` - Player development resources
- `parent` - Parent support resources
- `club_director` - Administrative resources
- `administrator` - System documentation

## Future Enhancements

### When Database Tables Are Created
1. Remove "(MOCK)" suffixes from real data
2. Implement actual favorite toggling
3. Track real view counts
4. Enable resource ratings
5. Add download tracking

### Additional Features
- Resource upload interface for admins
- PDF preview in modal
- Video playback integration
- Resource sharing functionality
- Offline caching for field use

## Contract Reference
See `/contracts/active/resources-page-enhancement-001.yaml` for the complete implementation contract and specifications.

---

*Last Updated: January 2025*