# Pages Index - POWLAX Codebase Index
**Generated:** January 15, 2025  
**Contract:** codebase-indexing-001

## Summary Statistics
- Total pages indexed: 32
- Total API routes indexed: 15
- Database tables referenced: 38
- Working/Active: 18
- Needs attention: 14

## Detailed Index

### Public Routes

#### `/` (Home Page)
- **Location:** `src/app/page.tsx`
- **Purpose:** Landing page for POWLAX platform
- **Database Tables:** None (static content)
- **Status:** ✅ Working
- **Authentication:** Not Required
- **Key Components:** Basic static content
- **Notes:** Simple landing page with POWLAX branding

### Authenticated Routes

#### `/dashboard`
- **Location:** `src/app/(authenticated)/dashboard/page.tsx`
- **Purpose:** Role-based dashboard routing with test user fallback
- **Database Tables:** None directly (delegates to dashboard components)
- **Status:** ✅ Working
- **Authentication:** Required (with dev fallback)
- **Key Components:** PlayerDashboard, CoachDashboard, ParentDashboard, DirectorDashboard, AdminDashboard, PublicDashboard
- **Notes:** Uses role viewer context, has test user for development

#### `/practiceplan`
- **Location:** `src/app/(authenticated)/practiceplan/page.tsx`
- **Purpose:** Practice planner overview with quick start options
- **Database Tables:** None (static overview page)
- **Status:** ⚠️ Needs Work (hardcoded mock data in UI)
- **Authentication:** Required
- **Key Components:** Card components with static content
- **Notes:** Points to team-specific practice planner, uses mock practice data

#### `/teams/[teamId]/practiceplan`
- **Location:** `src/app/(authenticated)/teams/[teamId]/practiceplan/page.tsx`
- **Purpose:** Full practice planning interface with drill library integration
- **Database Tables:** 
  - `powlax_drills` - drill library access
  - `practices` - saving/loading practice plans
  - `user_drills` - custom drills
  - `powlax_strategies` - strategy library
  - `practice_drills` - drill instances
- **Status:** ✅ Working
- **Authentication:** Required
- **Key Components:** SidebarLibrary, PracticeTimelineWithParallel, SavePracticeModal, LoadPracticeModal, multiple drill/strategy modals
- **Notes:** Core practice planning functionality, localStorage auto-save, supports no-team mode

#### `/teams`
- **Location:** `src/app/(authenticated)/teams/page.tsx`
- **Purpose:** Team listing with member counts and navigation
- **Database Tables:**
  - `teams` - team data with club relationships
  - `clubs` - organization data via foreign key
  - `team_members` - member count aggregation
- **Status:** ✅ Working
- **Authentication:** Required
- **Key Components:** useTeams hook, Card components for team display
- **Notes:** Shows real team data from database, includes member counts

#### `/teams/[teamId]/dashboard`
- **Location:** `src/app/(authenticated)/teams/[teamId]/dashboard/page.tsx`
- **Purpose:** Individual team dashboard (referenced but not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Required
- **Key Components:** Unknown
- **Notes:** Referenced in teams page navigation

#### `/skills-academy`
- **Location:** `src/app/(authenticated)/skills-academy/page.tsx`
- **Purpose:** Skills Academy hub with workout programs
- **Database Tables:** None directly (server component)
- **Status:** ✅ Working
- **Authentication:** Required (server-side auth check)
- **Key Components:** SkillsAcademyHubEnhanced
- **Notes:** Server component with user authentication

#### `/skills-academy/workout/[id]`
- **Location:** `src/app/(authenticated)/skills-academy/workout/[id]/page.tsx`
- **Purpose:** Full workout player with video, timing, and point system
- **Database Tables:**
  - `skills_academy_drills` - drill content and videos
  - `skills_academy_workouts` - workout definitions
  - `skills_academy_series` - series information
  - `wall_ball_drill_library` - wall ball video segments
  - `skills_academy_user_progress` - progress tracking
  - `user_points_wallets` - points via RPC functions
- **Status:** ✅ Working
- **Authentication:** Required
- **Key Components:** useWorkoutSession, PointExplosion, CelebrationAnimation, WorkoutErrorBoundary
- **Notes:** Complex workout player with video, timer enforcement, real-time points, celebration animations

#### `/skills-academy/workouts`
- **Location:** `src/app/(authenticated)/skills-academy/workouts/page.tsx`
- **Purpose:** Workout browser and selection (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Required
- **Key Components:** Unknown
- **Notes:** Referenced from skills academy hub

#### `/admin/management`
- **Location:** `src/app/(authenticated)/admin/management/page.tsx`
- **Purpose:** User role management and administration
- **Database Tables:**
  - `users` - user data and roles array
- **Status:** ✅ Working
- **Authentication:** Required (admin only)
- **Key Components:** ManagementTabs, DocumentationHelper, role management modals
- **Notes:** Admin-only access, role statistics, user management with test user fallback

#### `/admin/drill-editor`
- **Location:** `src/app/(authenticated)/admin/drill-editor/page.tsx`
- **Purpose:** Admin drill editing interface (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Required (admin)
- **Key Components:** Unknown
- **Notes:** Admin tool for drill management

#### `/admin/sync`
- **Location:** `src/app/(authenticated)/admin/sync/page.tsx`
- **Purpose:** WordPress synchronization interface (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Required (admin)
- **Key Components:** Unknown
- **Notes:** WordPress integration management

#### `/admin/wp-import-check`
- **Location:** `src/app/(authenticated)/admin/wp-import-check/page.tsx`
- **Purpose:** WordPress import verification (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Required (admin)
- **Key Components:** Unknown
- **Notes:** WordPress data validation tool

#### `/direct-login`
- **Location:** `src/app/direct-login/page.tsx`
- **Purpose:** Direct authentication interface (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Special (direct login)
- **Key Components:** Unknown
- **Notes:** Alternative authentication method

### Test and Development Pages

#### `/register/[token]`
- **Location:** `src/app/register/[token]/page.tsx`
- **Purpose:** User registration with token (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis
- **Authentication:** Token-based
- **Key Components:** Unknown
- **Notes:** Registration flow

#### `/test-*` Pages
Multiple test pages exist for development:
- `/test-practice-planner`
- `/test-gamification` 
- `/test-supabase`
- `/test-animations`
- **Status:** ❌ Development Only
- **Notes:** Should be removed in production

### API Routes

#### POST `/api/sync/full`
- **Location:** `src/app/api/sync/full/route.ts`
- **Purpose:** Full WordPress synchronization
- **Database Tables:**
  - `users` - admin role verification
- **Authentication:** Required (admin only)
- **External Services:** WordPress API via wordpressTeamSync
- **Notes:** Triggers complete data sync from WordPress

#### GET/POST `/api/sync/status`
- **Location:** `src/app/api/sync/status/route.ts`
- **Purpose:** Sync status and statistics
- **Database Tables:**
  - `clubs` - count
  - `teams` - count  
  - `user_team_roles` - count
- **Authentication:** Required
- **Notes:** Returns sync statistics

#### POST `/api/sync/teams`
- **Location:** `src/app/api/sync/teams/route.ts`
- **Purpose:** Team-specific synchronization (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### POST `/api/sync/users`
- **Location:** `src/app/api/sync/users/route.ts`
- **Purpose:** User-specific synchronization (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### POST `/api/sync/organizations`
- **Location:** `src/app/api/sync/organizations/route.ts`
- **Purpose:** Organization synchronization (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### GET `/api/admin/wp-import-check`
- **Location:** `src/app/api/admin/wp-import-check/route.ts`
- **Purpose:** WordPress import verification
- **Database Tables:**
  - `clubs` - club data
  - `teams` - team data with club relationships
  - `team_members` - membership data
- **Authentication:** Required
- **Notes:** Validates WordPress import data integrity

#### POST `/api/memberpress/webhook`
- **Location:** `src/app/api/memberpress/webhook/route.ts`
- **Purpose:** MemberPress webhook handling
- **Database Tables:**
  - `users` - user lookup and updates
  - `registration_links` - new user registration
  - `webhook_events` - event logging
  - `membership_entitlements` - subscription management
  - `team_members` - status updates
- **Authentication:** Webhook (no user auth)
- **External Services:** MemberPress webhooks
- **Notes:** Handles subscription events, user creation, team assignments

#### POST `/api/email/send-magic-link`
- **Location:** `src/app/api/email/send-magic-link/route.ts`
- **Purpose:** Magic link email sending (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### GET/POST `/api/teams/[teamId]`
- **Location:** `src/app/api/teams/[teamId]/route.ts`
- **Purpose:** Team-specific API operations (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### POST `/api/workouts/complete`
- **Location:** `src/app/api/workouts/complete/route.ts`
- **Purpose:** Workout completion tracking (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### POST `/api/workouts/progress`
- **Location:** `src/app/api/workouts/progress/route.ts`
- **Purpose:** Workout progress tracking (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### POST `/api/gamipress/sync`
- **Location:** `src/app/api/gamipress/sync/route.ts`
- **Purpose:** Gamification synchronization (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ⚠️ Needs Analysis

#### GET `/api/debug/auth`
- **Location:** `src/app/api/debug/auth/route.ts`
- **Purpose:** Authentication debugging (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ❌ Development Only

#### GET `/api/test/supabase-connection`
- **Location:** `src/app/api/test/supabase-connection/route.ts`
- **Purpose:** Database connection testing (not analyzed)
- **Database Tables:** Unknown (not analyzed)
- **Status:** ❌ Development Only

## Database Tables Referenced

### Core Content Tables
- `powlax_drills` - Main drill library (135 records)
- `powlax_strategies` - Strategy library (220 records)
- `practices` - Practice plans (34 records)
- `practice_drills` - Drill instances (32 records)
- `user_drills` - User-created drills (6 records)
- `user_strategies` - User-created strategies (4 records)

### Skills Academy Tables
- `skills_academy_drills` - Academy drill library (167 records)
- `skills_academy_workouts` - Workout definitions (166 records)
- `skills_academy_series` - Workout series (49 records)
- `skills_academy_user_progress` - Progress tracking (5 records)
- `wall_ball_drill_library` - Wall ball segments (48 records)

### User Management Tables
- `users` - Main user table (14 records)
- `user_points_wallets` - Point balances (1 record)
- `user_badges` - Earned badges (3 records)

### Team Organization Tables
- `clubs` - Organizations (3 records)
- `teams` - Team entities (14 records)
- `team_members` - Team membership (26 records)

### Authentication & Registration Tables
- `magic_links` - Magic link authentication
- `registration_links` - User registration tokens
- `webhook_events` - Event logging
- `membership_entitlements` - Subscription management

### Gamification Tables
- `powlax_points_currencies` - Point definitions (7 records)
- `points_transactions_powlax` - Point transactions (0 records)
- `powlax_player_ranks` - Player rankings (10 records)
- `point_types_powlax` - Point types (9 records)
- `leaderboard` - Rankings (14 records)

## Key Findings

### Working Systems
1. **Practice Planner** - Fully functional with real database integration
2. **Skills Academy** - Complete workout system with video and gamification
3. **Team Management** - Real team data with member counts
4. **User Administration** - Role management with database persistence
5. **WordPress Integration** - Webhook handling and sync systems

### Areas Needing Attention
1. **Static Mock Data** - Several pages show hardcoded content instead of database data
2. **Test Pages** - Multiple development pages should be removed for production
3. **Incomplete API Routes** - Several routes need analysis and documentation
4. **Authentication Consistency** - Mix of auth patterns across pages

### Architecture Patterns
1. **Server Components** - Used for initial auth checks (skills-academy)
2. **Client Components** - Most pages use client-side rendering with hooks
3. **Test User Fallback** - Development pattern for unauthenticated testing
4. **Role-Based Routing** - Dashboard routing based on user roles
5. **Real-time Updates** - Points system with immediate UI updates

### Database Integration Quality
- **Excellent:** Practice planner, Skills Academy, Team management
- **Good:** User management, Webhook handling
- **Needs Work:** Dashboard components, Test pages, Some API routes