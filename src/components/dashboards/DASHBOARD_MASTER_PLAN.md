# 🎯 DASHBOARD MASTER PLAN
**Last Updated:** January 12, 2025  
**Status:** ✅ COMPLETE - Role Switcher Functional  
**Location:** `/src/components/dashboards/`

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Dashboard Components](#dashboard-components)
3. [Database Integration](#database-integration)
4. [Mock Data System](#mock-data-system)
5. [Real Data Hooks](#real-data-hooks)
6. [Role-Based Routing](#role-based-routing)
7. [Testing Strategy](#testing-strategy)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Overview

The POWLAX dashboard system provides role-specific experiences for all user types, with real-time data from Supabase and fallback mock data for testing.

### **Core Principles**
- ✅ Role-based content display
- ✅ Real data from Supabase tables
- ✅ Mock data with "(MOCK)" suffix for easy identification
- ✅ Responsive design for all devices
- ✅ Consistent POWLAX branding

### **User Roles & Dashboards**
| Role | Dashboard Component | Primary Focus |
|------|-------------------|---------------|
| `null` (logged out) | PublicDashboard | Marketing content |
| `player` | PlayerDashboard | Progress, points, workouts |
| `team_coach` | CoachDashboard | Team management, practices |
| `parent` | ParentDashboard | Children's progress |
| `club_director` | DirectorDashboard | Club statistics |
| `administrator` | AdminDashboard | System health |

---

## 📦 Dashboard Components

### **Component Structure**
```
src/components/dashboards/
├── PlayerDashboard.tsx      # Player experience
├── CoachDashboard.tsx        # Coach tools & team management
├── ParentDashboard.tsx       # Children monitoring
├── DirectorDashboard.tsx     # Club oversight
├── AdminDashboard.tsx        # System administration
├── PublicDashboard.tsx       # Marketing/logged out
├── StatCard.tsx              # Reusable stat display
├── ActionCard.tsx            # Quick action buttons
├── ProgressCard.tsx          # Progress visualization
├── ScheduleCard.tsx          # Event scheduling
└── DASHBOARD_MASTER_PLAN.md  # This document
```

### **Shared Components**
All dashboards use these reusable components:
- **StatCard**: Displays metrics with icons and trends
- **ActionCard**: Quick action buttons with routing
- **ProgressCard**: Bar charts for progress metrics
- **ScheduleCard**: Upcoming events display

---

## 🗄️ Database Integration

### **Tables Used for Dashboards**

#### **Core User Tables**
```sql
-- Main user table (NOT user_profiles!)
users (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  roles TEXT[],
  club_id UUID,
  age_group TEXT,
  player_position TEXT
)

-- Team membership
team_members (
  id UUID,
  team_id UUID,
  user_id UUID,
  role TEXT,
  status TEXT
)

-- Teams
teams (
  id UUID,
  club_id UUID,
  name TEXT
)
```

#### **Progress & Gamification Tables**
```sql
-- Skills Academy progress
skills_academy_user_progress (
  user_id UUID,
  workout_id INTEGER,
  status TEXT,
  points_earned INTEGER,
  completed_at TIMESTAMP
)

-- Points wallets (not yet connected)
user_points_wallets (
  user_id UUID,
  currency_id TEXT,
  balance INTEGER
)

-- User badges
user_badges (
  user_id UUID,
  badge_id TEXT,
  badge_name TEXT,
  earned_at TIMESTAMP
)
```

#### **Family Management**
```sql
-- Parent-child relationships
parent_child_relationships (
  parent_id UUID,
  child_id UUID,
  relationship_type TEXT
)

-- Family accounts
family_accounts (
  id UUID,
  primary_parent_id UUID,
  family_name TEXT
)
```

#### **Practice Planning**
```sql
-- Practice schedules
practices (
  id UUID,
  coach_id UUID,
  team_id UUID,
  name TEXT,
  practice_date DATE,
  start_time TIME,
  duration_minutes INTEGER
)
```

---

## 🎭 Mock Data System

### **Seeding Script**
Location: `scripts/seed-dashboard-mock-data-fixed.ts`

#### **Test Accounts Created**
```javascript
// All mock users have "(MOCK)" suffix
{
  player1: "player1@mock.com",      // Johnny Player (MOCK)
  player2: "player2@mock.com",      // Sarah Athlete (MOCK)
  coach: "coach@mock.com",          // Mike Coach (MOCK)
  parent: "parent@mock.com",        // Lisa Parent (MOCK)
  director: "director@mock.com",    // Robert Director (MOCK)
  admin: "admin@mock.com"           // System Admin (MOCK)
}
```

#### **Running the Seeder**
```bash
# Populate database with mock data
npx tsx scripts/seed-dashboard-mock-data-fixed.ts

# Output includes UUID mappings for testing
```

### **Mock Data Identification**
All mock data includes "(MOCK)" suffix or "Mock:" prefix for easy identification in the UI.

---

## 🪝 Real Data Hooks

### **Primary Data Hook**
Location: `src/hooks/useDashboardData.ts`

```typescript
// Player Dashboard Hook
export function usePlayerDashboardData() {
  // Fetches:
  // - Workout progress
  // - Team membership
  // - Upcoming practices
  // - Calculated streak
  // Returns: { data, loading }
}

// Coach Dashboard Hook
export function useCoachDashboardData() {
  // Fetches:
  // - Teams managed
  // - Team rosters
  // - Practice schedules
  // - Player activity
  // Returns: { data, loading }
}

// Parent Dashboard Hook
export function useParentDashboardData() {
  // Fetches:
  // - Children relationships
  // - Children's progress
  // - Team memberships
  // - Upcoming practices
  // Returns: { data, loading }
}

// Director Dashboard Hook
export function useDirectorDashboardData() {
  // Fetches:
  // - Club information
  // - All teams in club
  // - Player counts
  // - Performance metrics
  // Returns: { data, loading }
}

// Admin Dashboard Hook
export function useAdminDashboardData() {
  // Fetches:
  // - System statistics
  // - User counts
  // - Content metrics
  // - Recent activity
  // Returns: { data, loading }
}
```

### **Dashboard Query Functions**
Location: `src/lib/dashboard-queries.ts`

```typescript
// Main function for role-based data fetching
export async function fetchDashboardData(
  role: string,
  userId: string,
  context: SecurityContext
): Promise<DashboardData>

// Security context for data access
export async function getUserSecurityContext(
  userId: string
): Promise<SecurityContext>

// Permission verification
export async function verifyDataAccess(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<boolean>
```

---

## 🔀 Role-Based Routing

### **Main Dashboard Page**
Location: `src/app/(authenticated)/dashboard/page.tsx`

```typescript
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { viewingRole, isViewingAs } = useRoleViewer()
  
  // For development: Create a test user if no auth user exists
  const testUser = user || {
    id: 'test-user',
    email: 'test@example.com', 
    display_name: 'Test Admin',
    role: 'administrator',
    roles: ['administrator']
  }
  
  // Determine the effective role to display
  // If viewing as another role, use that role; otherwise use the user's actual role
  const effectiveRole = isViewingAs ? viewingRole : testUser.role
  
  // Route to appropriate dashboard based on effective role
  switch (effectiveRole) {
    case 'player':
      return <PlayerDashboard user={{ ...testUser, role: 'player' }} />
    case 'team_coach':
      return <CoachDashboard user={{ ...testUser, role: 'team_coach' }} />
    case 'parent':
      return <ParentDashboard user={{ ...testUser, role: 'parent' }} />
    case 'club_director':
      return <DirectorDashboard user={{ ...testUser, role: 'club_director' }} />
    case 'administrator':
    case null: // null means admin viewing as admin (their actual role)
      return <AdminDashboard user={{ ...testUser, role: 'administrator' }} />
    default:
      return <AdminDashboard user={{ ...testUser, role: 'administrator' }} />
  }
}
```

### **Role Switcher Integration**
- **Location**: `src/components/admin/RoleViewerSelector.tsx`
- **Activation**: Shows for administrators or development mode (no user)
- **Features**:
  - Horizontal role buttons at top of page
  - "Viewing as [Role]" indicator when active
  - Easy exit back to admin view
  - Keyboard shortcut: Ctrl+Shift+R to exit

### **Role Mapping**
```typescript
// Authentication context maps roles
const roleMap = {
  'admin': 'administrator',
  'director': 'club_director',
  'coach': 'team_coach',
  'player': 'player',
  'parent': 'parent'
}
```

---

## 🧪 Testing Strategy

### **Playwright Tests**
Location: `tests/e2e/dashboard-verification.spec.ts`

#### **Test Coverage**
- ✅ Dashboard loads without errors
- ✅ Role-specific content displays
- ✅ Mobile responsiveness (375px)
- ✅ No console errors
- ✅ Mock data displays correctly

#### **Running Tests**
```bash
# Run dashboard tests
npx playwright test dashboard-verification

# All 4 tests should pass
```

### **Manual Testing Checklist**
- [x] Login as each role type
- [x] Verify correct dashboard displays  
- [x] Check real data loading
- [x] Test responsive design
- [x] Verify navigation links
- [x] Check loading states
- [x] **Role switcher functionality verified**
- [x] **Coach dashboard tested with favorites and sharing options**

---

## 📝 Implementation Guide

### **Step 1: Database Setup**
```bash
# 1. Seed mock data
npx tsx scripts/seed-dashboard-mock-data-fixed.ts

# 2. Verify data in Supabase dashboard
# Check users, teams, team_members tables
```

### **Step 2: Update Dashboard Component**
```typescript
// Example: Updating PlayerDashboard to use real data
import { usePlayerDashboardData } from '@/hooks/useDashboardData'

export function PlayerDashboard({ user }) {
  const { data, loading } = usePlayerDashboardData()
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div>
      {/* Use real data */}
      <h1>Streak: {data?.streak || 0} days</h1>
      <p>Points: {data?.totalPoints || 0}</p>
      <p>Team: {data?.team?.name || 'No Team'}</p>
      
      {/* Practices from database */}
      {data?.practices?.map(practice => (
        <div key={practice.id}>
          {practice.name} - {practice.practice_date}
        </div>
      ))}
    </div>
  )
}
```

### **Step 3: Handle Loading States**
```typescript
// Consistent loading pattern
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    </div>
  )
}
```

### **Step 4: Mix Real and Mock Data**
```typescript
// Pattern for mixing real and mock data
const displayData = {
  // Real data from database
  playerCount: data?.players?.length || 0,
  teamName: data?.team?.name || 'No Team',
  
  // Mock data for features not yet implemented
  engagementRate: 78, // Mock: Not tracked yet
  monthlyRevenue: 12450, // Mock: Financial placeholder
}
```

---

## 🚀 Current Status

### **✅ Completed**
- All 6 dashboard components created
- Role-based routing implemented
- **Role switcher fully functional** (Admin can view as any role)
- Mock data seeding script working
- Real data hooks created
- Database queries optimized
- Playwright tests passing
- Supabase Auth integration complete

### **🔧 In Progress**
- Connecting points wallets to Skills Academy
- Real-time activity tracking
- Financial metrics integration

### **📅 Planned**
- WebSocket real-time updates
- Advanced analytics
- Export functionality
- Custom dashboard widgets

---

## 🎯 Success Metrics

### **Performance Targets**
- Dashboard load time: < 2 seconds
- Time to interactive: < 3 seconds
- Database query time: < 500ms
- Zero console errors

### **Data Freshness**
- Player data: 5 minute cache
- Coach data: 2 minute cache
- Admin data: 30 second cache
- Director data: 1 minute cache

---

## 🔒 Security Considerations

### **Data Access Control**
- Players: Own data only
- Coaches: Team members only
- Parents: Children data only
- Directors: Club scope only
- Admins: Full access

### **Audit Logging**
All dashboard access is logged via `logDataAccess()` in `src/lib/audit-logging.ts`

---

## 📚 Related Documentation

- **Database Schema**: `/contracts/active/database-truth-sync-002.yaml`
- **Authentication**: `/src/contexts/SupabaseAuthContext.tsx`
- **Component Docs**: `/src/components/dashboards/README.md`
- **Testing Guide**: `/tests/README.md`

---

## 🆘 Troubleshooting

### **Common Issues**

**Issue**: Dashboard shows loading spinner indefinitely
```typescript
// Solution: Check authentication context
// Temporarily bypass auth check in development
// Comment out loading check in dashboard/page.tsx
```

**Issue**: Mock data not appearing
```bash
# Solution: Re-run seeding script
npx tsx scripts/seed-dashboard-mock-data-fixed.ts
```

**Issue**: Wrong dashboard displays
```typescript
// Solution: Check role mapping
console.log('User role:', user.role)
// Ensure role matches switch case
```

**Issue**: Role switcher not appearing
```typescript
// Solution: Check user roles in RoleViewerSelector
// Component shows for administrators or development mode (!user)
// Verify: user?.roles?.includes('administrator') || !user
```

**Issue**: Role switching not working
```typescript
// Solution: Check RoleViewerContext integration
// Ensure RoleViewerProvider wraps the app in ClientProviders.tsx
// Verify useRoleViewer() hook is being called in dashboard/page.tsx
```

---

## 📞 Support

For dashboard-related issues:
1. Check this master plan
2. Review error logs in browser console
3. Verify database connectivity
4. Run Playwright tests
5. Contact development team

---

**End of Dashboard Master Plan**