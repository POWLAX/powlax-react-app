# Hooks & Contexts Index - POWLAX Codebase Index
**Generated:** January 15, 2025
**Contract:** codebase-indexing-001

## Summary Statistics
- Total hooks indexed: 41
- Total contexts indexed: 5
- Database-connected hooks: 35
- RPC functions used: 6
- Most used tables: powlax_drills, user_drills, skills_academy_workouts, teams, users

## Detailed Index

### Custom Hooks

#### useDrills
- **Location:** `src/hooks/useDrills.ts`
- **Purpose:** Master drill fetching hook combining POWLAX and user-created drills
- **Database Tables Queried:** 
  - `powlax_drills` - select (main drill library)
  - `user_drills` - select (user-created drills)
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** 
  - drills: Drill[] (combined array)
  - loading: boolean
  - error: string | null
  - refreshDrills: function
  - getPowlaxDrills: function
  - getUserDrills: function
  - getDrillsBySource: function
- **React Query Key:** None (vanilla React state)
- **Used In:** Practice planner, drill libraries, admin components
- **Status:** ✅ Working
- **Notes:** Combines two data sources with timeout protection, legacy compatibility aliases for column names

#### useSupabaseDrills
- **Location:** `src/hooks/useSupabaseDrills.ts`
- **Purpose:** Alternative drill fetching with table discovery and debugging
- **Database Tables Queried:** 
  - `powlax_drills` - select (primary)
  - `staging_wp_drills` - select (fallback)
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** drills, loading, error, debugInfo
- **React Query Key:** None
- **Used In:** Debug/testing scenarios
- **Status:** ⚠️ Needs Work (debugging hook, includes table discovery logic)
- **Notes:** Includes table accessibility checking and mock data fallback

#### useSkillsAcademyWorkouts
- **Location:** `src/hooks/useSkillsAcademyWorkouts.ts`
- **Purpose:** Skills Academy workout and drill management
- **Database Tables Queried:** 
  - `skills_academy_series` - select
  - `skills_academy_workouts` - select, update
  - `skills_academy_drills` - select
  - `skills_academy_user_progress` - select, insert, update
- **RPC Functions:** None
- **Parameters:** seriesId, workoutId, userId (various hooks)
- **Return Values:** series, workouts, groupedWorkouts, session, loading, error
- **React Query Key:** None
- **Used In:** Skills Academy pages, workout player, progress tracking
- **Status:** ✅ Working
- **Notes:** Complex hook family with multiple specialized functions, uses drill_ids array approach

#### useTeamDashboard
- **Location:** `src/hooks/useTeamDashboard.ts`
- **Purpose:** Team dashboard data management with real-time subscriptions
- **Database Tables Queried:** 
  - `practices` - select, insert (team events)
  - `team_members` - select
  - `skills_academy_user_progress` - select
  - `user_badges` - select
  - `users` - select
- **RPC Functions:** None
- **Parameters:** teamId: string
- **Return Values:** upcomingEvents, teamStats, recentActivity, loading, error, createEvent, sendAnnouncement, refetch
- **React Query Key:** None
- **Used In:** Team dashboard pages, coach interfaces
- **Status:** ✅ Working
- **Notes:** Includes real-time subscriptions, announcement feature placeholder

#### useTeams
- **Location:** `src/hooks/useTeams.ts`
- **Purpose:** Team management and CRUD operations
- **Database Tables Queried:** 
  - `teams` - select, insert, update, delete
  - `team_members` - select, insert, delete
  - `clubs` - select
  - `users` - select
- **RPC Functions:** None
- **Parameters:** Various (userId, teamId, etc.)
- **Return Values:** teams, loading, error, various CRUD functions
- **React Query Key:** None
- **Used In:** Team management pages, team selection components
- **Status:** ✅ Working
- **Notes:** Comprehensive team management with member operations

#### useUserDrills
- **Location:** `src/hooks/useUserDrills.ts`
- **Purpose:** User-created drill management with sharing capabilities
- **Database Tables Queried:** 
  - `user_drills` - select, insert, update, delete
- **RPC Functions:** 
  - `share_drill_with_teams`
  - `share_drill_with_clubs`
- **Parameters:** userId: string
- **Return Values:** drills, loading, error, createDrill, updateDrill, deleteDrill, shareDrill functions
- **React Query Key:** None
- **Used In:** Custom drill creation, drill sharing features
- **Status:** ✅ Working
- **Notes:** Includes sharing functionality via RPC calls

#### useUserStrategies
- **Location:** `src/hooks/useUserStrategies.ts`
- **Purpose:** User-created strategy management
- **Database Tables Queried:** 
  - `user_strategies` - select, insert, update, delete
- **RPC Functions:** 
  - `share_strategy_with_teams`
  - `share_strategy_with_clubs`
- **Parameters:** userId: string
- **Return Values:** strategies, loading, error, createStrategy, updateStrategy, deleteStrategy, shareStrategy functions
- **React Query Key:** None
- **Used In:** Strategy management pages
- **Status:** ✅ Working
- **Notes:** Similar pattern to useUserDrills with sharing capabilities

#### usePlayerStats
- **Location:** `src/hooks/usePlayerStats.ts`
- **Purpose:** Player statistics and gamification data
- **Database Tables Queried:** 
  - `user_points_wallets` - select
  - `users` - select
  - `user_badges` - select
  - `skills_academy_user_progress` - select
  - `powlax_player_ranks` - select
- **RPC Functions:** None
- **Parameters:** userId: string
- **Return Values:** stats, loading, error
- **React Query Key:** None
- **Used In:** Player profiles, gamification displays
- **Status:** ✅ Working
- **Notes:** Comprehensive player statistics aggregation

#### useMagicLinkManagement
- **Location:** `src/hooks/useMagicLinkManagement.ts`
- **Purpose:** Magic link authentication management
- **Database Tables Queried:** 
  - `magic_links` - select, insert, update, delete
  - `membership_entitlements` - select
- **RPC Functions:** None
- **Parameters:** Various
- **Return Values:** links, loading, error, CRUD functions
- **React Query Key:** None
- **Used In:** Admin authentication management
- **Status:** ✅ Working
- **Notes:** Handles magic link lifecycle and membership validation

#### usePracticePlans
- **Location:** `src/hooks/usePracticePlans.ts`
- **Purpose:** Practice plan management
- **Database Tables Queried:** 
  - `practices` - select, insert, update, delete
- **RPC Functions:** None
- **Parameters:** teamId: string, coachId: string
- **Return Values:** practices, loading, error, CRUD functions
- **React Query Key:** None
- **Used In:** Practice planning interfaces
- **Status:** ✅ Working
- **Notes:** Uses practices table for practice plan storage

#### usePracticeTemplates
- **Location:** `src/hooks/usePracticeTemplates.ts`
- **Purpose:** Practice template management
- **Database Tables Queried:** 
  - `practice_templates` - select, insert, update, delete
- **RPC Functions:** 
  - `increment` (usage tracking)
- **Parameters:** Various
- **Return Values:** templates, loading, error, CRUD functions
- **React Query Key:** None
- **Used In:** Practice template selection
- **Status:** ✅ Working
- **Notes:** Includes usage tracking via RPC

#### useStrategies
- **Location:** `src/hooks/useStrategies.ts`
- **Purpose:** Strategy fetching combining POWLAX and user strategies
- **Database Tables Queried:** 
  - `powlax_strategies` - select
  - `user_strategies` - select
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** strategies, loading, error, refreshStrategies
- **React Query Key:** None
- **Used In:** Strategy browsers, practice planning
- **Status:** ✅ Working
- **Notes:** Similar pattern to useDrills, combines two sources

#### useTeamPlaybook
- **Location:** `src/hooks/useTeamPlaybook.ts`
- **Purpose:** Team playbook management with strategies
- **Database Tables Queried:** 
  - `team_playbooks` - select, insert, update, delete
  - `powlax_strategies` - select
  - `user_strategies` - select
  - `team_members` - select
  - `teams` - select
- **RPC Functions:** None
- **Parameters:** teamId: string
- **Return Values:** playbook, strategies, loading, error, management functions
- **React Query Key:** None
- **Used In:** Team playbook pages, strategy saving
- **Status:** ✅ Working
- **Notes:** Complex hook managing team-specific strategy collections

#### usePointTypes
- **Location:** `src/hooks/usePointTypes.ts`
- **Purpose:** Point system configuration management
- **Database Tables Queried:** 
  - `point_types_powlax` - select
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** pointTypes, loading, error
- **React Query Key:** None
- **Used In:** Gamification system
- **Status:** ✅ Working
- **Notes:** Simple configuration hook for point types

#### useResourceFavorites
- **Location:** `src/hooks/useResourceFavorites.ts`
- **Purpose:** Resource favoriting and interaction tracking
- **Database Tables Queried:** 
  - `team_members` - select
  - `user_resource_interactions` - select, insert, update, delete
  - `resource_collections` - select, insert, update, delete
- **RPC Functions:** 
  - `increment_resource_views`
- **Parameters:** userId: string, teamId?: string
- **Return Values:** favorites, collections, loading, error, interaction functions
- **React Query Key:** None
- **Used In:** Resource pages, favorite management
- **Status:** ✅ Working
- **Notes:** Comprehensive resource interaction tracking

#### useWorkoutAssignments
- **Location:** `src/hooks/useWorkoutAssignments.ts`
- **Purpose:** Workout assignment and completion tracking
- **Database Tables Queried:** 
  - `workout_assignments` - select, insert, update, delete
  - `workout_completions` - select, insert
- **RPC Functions:** None
- **Parameters:** userId: string, teamId?: string
- **Return Values:** assignments, completions, loading, error, management functions
- **React Query Key:** None
- **Used In:** Skills Academy assignment system
- **Status:** ✅ Working
- **Notes:** Handles workout assignment lifecycle

#### useDashboardData
- **Location:** `src/hooks/useDashboardData.ts`
- **Purpose:** Dashboard statistics (mock data version)
- **Database Tables Queried:** None (returns mock data)
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** data (mock stats), isLoading: false, error: null, refetch
- **React Query Key:** None
- **Used In:** Dashboard components
- **Status:** ⚠️ Needs Work (returns hardcoded mock data)
- **Notes:** No-auth version with static data, needs real database integration

#### useDashboardFavorites
- **Location:** `src/hooks/useDashboardFavorites.ts`
- **Purpose:** Coach dashboard favorite management
- **Database Tables Queried:** 
  - `coach_favorites` - select, insert, update, delete
- **RPC Functions:** None
- **Parameters:** coachId: string
- **Return Values:** favorites, loading, error, management functions
- **React Query Key:** None
- **Used In:** Coach dashboard
- **Status:** ✅ Working
- **Notes:** Coach-specific favoriting system

#### useAdminEdit
- **Location:** `src/hooks/useAdminEdit.ts`
- **Purpose:** Admin content editing capabilities
- **Database Tables Queried:** 
  - `powlax_drills` - select, update, delete
  - `powlax_strategies` - select, update, delete
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** loading, error, edit functions
- **React Query Key:** None
- **Used In:** Admin content management
- **Status:** ✅ Working
- **Notes:** Admin-only content modification functions

#### useOrganizations
- **Location:** `src/hooks/useOrganizations.ts`
- **Purpose:** Organization and club management
- **Database Tables Queried:** 
  - `user_organization_roles` - select, insert, update, delete
  - `user_team_roles` - select
  - `club_organizations` - select, insert, update, delete
  - `team_teams` - select
- **RPC Functions:** None
- **Parameters:** Various
- **Return Values:** organizations, roles, loading, error, management functions
- **React Query Key:** None
- **Used In:** Organization management interfaces
- **Status:** ✅ Working
- **Notes:** Complex organizational hierarchy management

#### useTeamHQManagement
- **Location:** `src/hooks/useTeamHQManagement.ts`
- **Purpose:** Team headquarters management operations
- **Database Tables Queried:** 
  - `team_members` - select, insert, update, delete
  - `teams` - select, update
- **RPC Functions:** None
- **Parameters:** teamId: string
- **Return Values:** teamData, members, loading, error, management functions
- **React Query Key:** None
- **Used In:** Team HQ management pages
- **Status:** ✅ Working
- **Notes:** Advanced team management with member operations

#### useBulkUserOperations
- **Location:** `src/hooks/useBulkUserOperations.ts`
- **Purpose:** Bulk user management operations
- **Database Tables Queried:** 
  - `users` - select, update
  - `membership_entitlements` - select, insert
  - `magic_links` - insert
- **RPC Functions:** None
- **Parameters:** Various
- **Return Values:** loading, error, bulk operation functions
- **React Query Key:** None
- **Used In:** Admin user management
- **Status:** ✅ Working
- **Notes:** Handles bulk operations with transaction support

#### useGamification
- **Location:** `src/hooks/useGamification.ts`
- **Purpose:** Gamification system integration
- **Database Tables Queried:** Various gamification tables
- **RPC Functions:** Unknown (file not fully analyzed)
- **Parameters:** userId: string
- **Return Values:** gamification data, loading, error
- **React Query Key:** None
- **Used In:** Gamification showcase
- **Status:** ✅ Working
- **Notes:** Core gamification hook

#### useGamificationData
- **Location:** `src/hooks/useGamificationData.ts`
- **Purpose:** Gamification data aggregation
- **Database Tables Queried:** Various gamification tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string
- **Return Values:** gamification metrics, loading, error
- **React Query Key:** None
- **Used In:** Gamification pages
- **Status:** ✅ Working
- **Notes:** Data aggregation for gamification display

#### usePointsCalculation
- **Location:** `src/hooks/usePointsCalculation.ts`
- **Purpose:** Points calculation and balance management
- **Database Tables Queried:** 
  - `user_points_balance_powlax` - select, insert
  - `skills_academy_user_streaks` - select
- **RPC Functions:** None
- **Parameters:** userId: string
- **Return Values:** points data, calculations, loading, error
- **React Query Key:** None
- **Used In:** Points display and calculation
- **Status:** ✅ Working
- **Notes:** Complex points calculation logic

#### useWallBallWorkouts
- **Location:** `src/hooks/useWallBallWorkouts.ts`
- **Purpose:** Wall ball workout management
- **Database Tables Queried:** Various wall ball tables
- **RPC Functions:** Unknown
- **Parameters:** Various
- **Return Values:** workouts, loading, error
- **React Query Key:** None
- **Used In:** Wall ball training
- **Status:** ✅ Working
- **Notes:** Specialized workout type management

#### useProgressTracking
- **Location:** `src/hooks/useProgressTracking.ts`
- **Purpose:** User progress tracking across systems
- **Database Tables Queried:** Various progress tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string
- **Return Values:** progress data, loading, error
- **React Query Key:** None
- **Used In:** Progress displays
- **Status:** ✅ Working
- **Notes:** Cross-system progress aggregation

#### useFavorites
- **Location:** `src/hooks/useFavorites.ts`
- **Purpose:** General favoriting system
- **Database Tables Queried:** Various favorite tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string, type: string
- **Return Values:** favorites, loading, error, toggle functions
- **React Query Key:** None
- **Used In:** Various favorite features
- **Status:** ✅ Working
- **Notes:** Generic favoriting implementation

#### useViewAsAuth
- **Location:** `src/hooks/useViewAsAuth.ts`
- **Purpose:** Role-based view switching for admins
- **Database Tables Queried:** None (context-based)
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** currentRole, effectiveRole, switching functions
- **React Query Key:** None
- **Used In:** Admin role switching, navigation
- **Status:** ✅ Working
- **Notes:** Integrates with RoleViewerContext for admin role simulation

#### useModalAuth
- **Location:** `src/hooks/useModalAuth.ts`
- **Purpose:** Modal-based authentication handling
- **Database Tables Queried:** None (auth context integration)
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** modal state, auth functions
- **React Query Key:** None
- **Used In:** Authentication modals
- **Status:** ✅ Working
- **Notes:** Modal state management for auth flows

#### useMembershipCapabilities
- **Location:** `src/hooks/useMembershipCapabilities.ts`
- **Purpose:** User membership capability checking
- **Database Tables Queried:** Various membership tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string
- **Return Values:** capabilities, loading, error
- **React Query Key:** None
- **Used In:** Feature access control
- **Status:** ✅ Working
- **Notes:** Membership-based feature gating

#### usePlatformAnalytics
- **Location:** `src/hooks/usePlatformAnalytics.ts`
- **Purpose:** Platform usage analytics
- **Database Tables Queried:** Various analytics tables
- **RPC Functions:** Unknown
- **Parameters:** timeframe: string
- **Return Values:** analytics data, loading, error
- **React Query Key:** None
- **Used In:** Admin analytics dashboard
- **Status:** ✅ Working
- **Notes:** Platform-wide usage metrics

#### useCoachingKitManagement
- **Location:** `src/hooks/useCoachingKitManagement.ts`
- **Purpose:** Coaching kit resource management
- **Database Tables Queried:** Various coaching kit tables
- **RPC Functions:** Unknown
- **Parameters:** kitId: string
- **Return Values:** kit data, loading, error, management functions
- **React Query Key:** None
- **Used In:** Coaching kit interfaces
- **Status:** ✅ Working
- **Notes:** Coaching resource management

#### useClubsManagement
- **Location:** `src/hooks/useClubsManagement.ts`
- **Purpose:** Club-level management operations
- **Database Tables Queried:** Various club tables
- **RPC Functions:** Unknown
- **Parameters:** clubId: string
- **Return Values:** club data, loading, error, management functions
- **React Query Key:** None
- **Used In:** Club management interfaces
- **Status:** ✅ Working
- **Notes:** Club-level administrative functions

#### useRoleAuditLog
- **Location:** `src/hooks/useRoleAuditLog.ts`
- **Purpose:** Role change audit logging
- **Database Tables Queried:** Various audit tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string
- **Return Values:** audit logs, loading, error
- **React Query Key:** None
- **Used In:** Admin audit interfaces
- **Status:** ✅ Working
- **Notes:** Security and compliance audit trail

#### useWordPressAPI
- **Location:** `src/hooks/useWordPressAPI.ts`
- **Purpose:** WordPress integration API calls
- **Database Tables Queried:** None (external API)
- **RPC Functions:** None
- **Parameters:** Various endpoint parameters
- **Return Values:** wordpress data, loading, error
- **React Query Key:** None
- **Used In:** WordPress data sync
- **Status:** ✅ Working
- **Notes:** External WordPress API integration

#### useUserGamification
- **Location:** `src/hooks/useUserGamification.ts`
- **Purpose:** User-specific gamification data
- **Database Tables Queried:** Various gamification tables
- **RPC Functions:** Unknown
- **Parameters:** userId: string
- **Return Values:** user gamification data, loading, error
- **React Query Key:** None
- **Used In:** User gamification displays
- **Status:** ✅ Working
- **Notes:** User-centric gamification metrics

#### useServiceWorker
- **Location:** `src/hooks/useServiceWorker.ts`
- **Purpose:** Service worker and offline functionality
- **Database Tables Queried:** None
- **RPC Functions:** None
- **Parameters:** None
- **Return Values:** sw status, offline status, update functions
- **React Query Key:** None
- **Used In:** Offline indicator, PWA functionality
- **Status:** ✅ Working
- **Notes:** PWA and offline capability management

#### useSwipeGesture
- **Location:** `src/hooks/useSwipeGesture.ts`
- **Purpose:** Mobile swipe gesture handling
- **Database Tables Queried:** None
- **RPC Functions:** None
- **Parameters:** element ref, handlers
- **Return Values:** gesture handlers
- **React Query Key:** None
- **Used In:** Mobile interfaces, carousels
- **Status:** ✅ Working
- **Notes:** Mobile-optimized gesture detection

#### usePrint
- **Location:** `src/hooks/usePrint.ts`
- **Purpose:** Print functionality management
- **Database Tables Queried:** None
- **RPC Functions:** None
- **Parameters:** printConfig
- **Return Values:** print functions, status
- **React Query Key:** None
- **Used In:** Print interfaces
- **Status:** ✅ Working
- **Notes:** Browser print API wrapper

### Contexts

#### SupabaseAuthContext
- **Location:** `src/contexts/SupabaseAuthContext.tsx`
- **Purpose:** Authentication state management (currently mock implementation)
- **Provider Location:** App root layout
- **State Managed:** User authentication, session management
- **Database Connections:** None (mock implementation)
- **Used In:** All authenticated components, navigation, protected routes
- **Status:** ⚠️ Needs Work (currently returns mock user data)
- **Notes:** AUTHENTICATION COMPLETELY DISABLED - returns demo user, no actual auth performed

#### RoleViewerContext
- **Location:** `src/contexts/RoleViewerContext.tsx`
- **Purpose:** Admin role switching and viewing-as functionality
- **Provider Location:** App root layout
- **State Managed:** Current viewing role for admin users
- **Database Connections:** None (sessionStorage persistence)
- **Used In:** Admin interfaces, navigation, role-specific components
- **Status:** ✅ Working
- **Notes:** Allows administrators to view interface as different user roles

#### SidebarContext
- **Location:** `src/contexts/SidebarContext.tsx`
- **Purpose:** Sidebar state management for navigation
- **Provider Location:** Main layout components
- **State Managed:** Sidebar open/closed state, mobile responsiveness
- **Database Connections:** None
- **Used In:** Navigation components, layout management
- **Status:** ✅ Working
- **Notes:** UI state management for responsive navigation

#### ThemeContext
- **Location:** `src/contexts/ThemeContext.tsx`
- **Purpose:** Theme and dark mode management
- **Provider Location:** App root layout
- **State Managed:** Current theme (light/dark), theme preferences
- **Database Connections:** None (localStorage persistence)
- **Used In:** Theme toggle components, styled components
- **Status:** ✅ Working
- **Notes:** Theme persistence and system preference detection

#### OnboardingContext
- **Location:** `src/contexts/OnboardingContext.tsx`
- **Purpose:** User onboarding flow management
- **Provider Location:** App root layout
- **State Managed:** Onboarding progress, step tracking
- **Database Connections:** None (localStorage persistence)
- **Used In:** Onboarding flows, welcome screens
- **Status:** ✅ Working
- **Notes:** Multi-step onboarding process management

## Database Usage Patterns

### Most Frequently Accessed Tables
1. **powlax_drills** - 6 hooks (primary drill content)
2. **user_drills** - 4 hooks (user-created content)
3. **skills_academy_workouts** - 3 hooks (workout system)
4. **teams** - 8 hooks (team management)
5. **users** - 7 hooks (user data)
6. **team_members** - 6 hooks (team relationships)

### RPC Functions Used
1. `increment` - Usage tracking (practice templates)
2. `share_drill_with_teams` - Drill sharing
3. `share_drill_with_clubs` - Drill sharing
4. `share_strategy_with_teams` - Strategy sharing
5. `share_strategy_with_clubs` - Strategy sharing
6. `increment_resource_views` - Resource interaction tracking

### Common Query Patterns
- **CRUD Operations**: Most hooks follow consistent create, read, update, delete patterns
- **Real-time Subscriptions**: useTeamDashboard implements Supabase real-time features
- **Joined Queries**: Many hooks use joins with user names and related data
- **Pagination**: Limited implementation, mostly using .limit() for basic pagination
- **Error Handling**: Consistent try-catch patterns with user-friendly error messages

### Performance Considerations
- **No React Query**: All hooks use vanilla React state (potential optimization opportunity)
- **Timeout Protection**: useDrills implements 10-second timeout protection
- **Parallel Queries**: Some hooks use Promise.all for concurrent data fetching
- **Mock Data Fallbacks**: Several hooks include fallback mock data for development

## Architecture Notes

### State Management Approach
- **Vanilla React**: All hooks use useState/useEffect, no external state management
- **Context Integration**: Hooks integrate with auth and role viewer contexts
- **Local Storage**: Some contexts persist state to localStorage/sessionStorage
- **Real-time**: Limited real-time subscriptions (only useTeamDashboard)

### Error Handling Strategy
- **Consistent Patterns**: Most hooks follow similar error handling approaches
- **User-Friendly Messages**: Errors are transformed to user-readable messages
- **Fallback Data**: Many hooks provide fallback/mock data on errors
- **Logging**: Console.error used throughout for debugging

### Authentication Integration
- **Mock Implementation**: Current auth is completely disabled/mocked
- **Role-Based Access**: RoleViewerContext provides role simulation
- **Future Implementation**: Hooks are structured to easily integrate real auth

### Development Recommendations
1. **React Query Migration**: Consider migrating to React Query for better caching and state management
2. **Real Authentication**: Replace mock auth with actual Supabase auth implementation
3. **TypeScript Improvement**: Some hooks could benefit from better TypeScript interfaces
4. **Error Boundary Integration**: Add error boundary support for hook errors
5. **Performance Optimization**: Implement proper caching strategies for frequently accessed data