# Database Usage Map - POWLAX Codebase Index
**Generated:** August 15, 2025  
**Contract:** codebase-indexing-001  
**Data Source:** Direct Supabase discovery + codebase analysis

## Summary Statistics
- Total tables discovered: 29 (from actual Supabase query)
- Tables with active usage: 25
- Unused tables: 4
- RPC functions: 5
- Primary database patterns: supabase.from() queries, drill_ids array relationships

## Discovered Tables (Direct from Supabase)

### skills_academy_drills
- **Record Count:** 167 records
- **Schema:** Skills Academy drill library with video URLs, titles, descriptions
- **Files Using This Table:**
  - `src/hooks/useSkillsAcademyWorkouts.ts` - select with .in() for drill_ids arrays
  - `src/components/admin/CompleteUserEditor.tsx` - user progress queries
- **Query Patterns:**
  - Select with .in(id, workout.drill_ids) for workout drill relationships
  - Single record lookups for drill details
- **Relationships:**
  - Referenced by skills_academy_workouts.drill_ids array
  - Used in skills_academy_user_progress
- **Usage Frequency:** High
- **Status:** ✅ Active (Primary Skills Academy drill source)

### skills_academy_series
- **Record Count:** 49 records
- **Schema:** Workout series definitions (solid_start, attack, midfield, defense)
- **Files Using This Table:**
  - `src/hooks/useSkillsAcademyWorkouts.ts` - series listing and filtering
- **Query Patterns:**
  - Select all active series ordered by display_order
  - Filter by series_type (solid_start, attack, midfield, defense)
  - Join with workouts via series_id
- **Relationships:**
  - Parent to skills_academy_workouts via series_id
- **Usage Frequency:** High
- **Status:** ✅ Active

### skills_academy_workouts
- **Record Count:** 166 records
- **Schema:** Workout definitions with drill_ids array column
- **Files Using This Table:**
  - `src/hooks/useSkillsAcademyWorkouts.ts` - primary workout queries
  - `src/app/api/workouts/complete/route.ts` - completion updates
- **Query Patterns:**
  - Select with series join for workout details
  - Update times_started and times_completed counters
  - Filter by series_id and workout_size
- **Relationships:**
  - Child of skills_academy_series via series_id
  - Contains drill_ids array referencing skills_academy_drills
- **Usage Frequency:** High
- **Status:** ✅ Active

### skills_academy_user_progress
- **Record Count:** 5 records
- **Schema:** User progress tracking for workout sessions
- **Files Using This Table:**
  - `src/hooks/useSkillsAcademyWorkouts.ts` - progress tracking functions
  - `src/hooks/useTeamDashboard.ts` - team progress queries
  - `src/hooks/usePlayerStats.ts` - individual progress stats
  - `src/components/admin/CompleteUserEditor.tsx` - admin user views
- **Query Patterns:**
  - Insert new sessions with startWorkoutSession
  - Update progress with completeDrill function
  - Select user progress by workout_id and user_id
- **Relationships:**
  - Foreign key to users via user_id
  - Foreign key to skills_academy_workouts via workout_id
- **Usage Frequency:** High
- **Status:** ✅ Active

### wall_ball_drill_library
- **Record Count:** 48 records
- **Schema:** Wall ball workout video segments (integrated with Skills Academy)
- **Files Using This Table:**
  - Currently unused in codebase but integrated with Skills Academy system
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Part of Skills Academy ecosystem
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Available but not actively used)

### powlax_drills
- **Record Count:** 135 records
- **Schema:** Main POWLAX drill library with titles, categories, video URLs
- **Files Using This Table:**
  - `src/hooks/useDrills.ts` - primary drill fetching
  - `src/hooks/useAdminEdit.ts` - admin drill editing
  - `src/app/(authenticated)/admin/role-management/Management_Master_Plan.md` - admin reports
- **Query Patterns:**
  - Select all with ordering by title
  - Limit 500 with timeout protection
  - Admin CRUD operations
- **Relationships:**
  - Referenced by practice_drills via drill_id
  - Used in user_drills for custom drill creation
- **Usage Frequency:** High
- **Status:** ✅ Active (Primary POWLAX drill source)

### powlax_strategies
- **Record Count:** 220 records
- **Schema:** Strategy library with categories and descriptions
- **Files Using This Table:**
  - `src/hooks/useTeamPlaybook.ts` - strategy queries for playbooks
  - `src/hooks/useAdminEdit.ts` - admin strategy editing
- **Query Patterns:**
  - Select all strategies for playbooks
  - Admin CRUD operations
- **Relationships:**
  - Used in team_playbooks
  - Referenced by user_strategies
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### practices
- **Record Count:** 38 records
- **Schema:** THE REAL practice plans table (NOT practice_plans)
- **Files Using This Table:**
  - `src/hooks/useTeamDashboard.ts` - recent practices queries
  - `src/hooks/usePracticeTemplates.ts` - practice management
- **Query Patterns:**
  - Select recent practices by team_id
  - Practice plan creation and updates
- **Relationships:**
  - Child of teams via team_id
  - Parent to practice_drills
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### practice_drills
- **Record Count:** 32 records
- **Schema:** Drill instances within practices with notes and modifications
- **Files Using This Table:**
  - Related to practices table for drill assignments
- **Query Patterns:**
  - Join with practices for full practice plans
- **Relationships:**
  - Child of practices via practice_id
  - References powlax_drills via drill_id
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### powlax_images
- **Record Count:** 4 records
- **Schema:** Drill media images
- **Files Using This Table:**
  - Currently unused in active codebase
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Referenced by drill tables for media
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy

### user_drills
- **Record Count:** 0 records
- **Schema:** User-created drills with team_share/club_share arrays
- **Files Using This Table:**
  - `src/hooks/useDrills.ts` - user-created drill fetching
- **Query Patterns:**
  - Select user drills ordered by created_at
  - Support for team_share and club_share arrays
- **Relationships:**
  - Child of users via user_id
  - Similar structure to powlax_drills
- **Usage Frequency:** Medium
- **Status:** ✅ Active (Empty but functional)

### user_strategies
- **Record Count:** 0 records
- **Schema:** User-created strategies with team_share/club_share arrays
- **Files Using This Table:**
  - `src/hooks/useTeamPlaybook.ts` - user strategy queries
- **Query Patterns:**
  - Select user strategies for playbooks
- **Relationships:**
  - Child of users via user_id
  - Similar structure to powlax_strategies
- **Usage Frequency:** Low
- **Status:** ✅ Active (Empty but functional)

### clubs
- **Record Count:** 1 records
- **Schema:** Organization level above teams (NOT organizations table)
- **Files Using This Table:**
  - `src/hooks/useTeams.ts` - club management
  - `src/hooks/useClubsManagement.ts` - club operations
  - `src/app/api/admin/wp-import-check/route.ts` - admin checks
  - `src/lib/dashboard-queries.ts` - dashboard data
- **Query Patterns:**
  - Select all clubs for team organization
  - Insert/update/delete club operations
- **Relationships:**
  - Parent to teams via club_id
- **Usage Frequency:** High
- **Status:** ✅ Active

### teams
- **Record Count:** 4 records
- **Schema:** Team entities
- **Files Using This Table:**
  - `src/hooks/useTeams.ts` - comprehensive team management
  - `src/hooks/useTeamDashboard.ts` - team dashboard data
  - `src/hooks/useClubsManagement.ts` - club-team relationships
  - `src/hooks/useTeamHQManagement.ts` - team HQ operations
  - `src/lib/wordpress-team-sync.ts` - WordPress integration
- **Query Patterns:**
  - Select by club_id for organization
  - Team CRUD operations
  - Dashboard data aggregation
- **Relationships:**
  - Child of clubs via club_id
  - Parent to team_members
  - Parent to practices
- **Usage Frequency:** High
- **Status:** ✅ Active

### team_members
- **Record Count:** 12 records
- **Schema:** Team membership relationships
- **Files Using This Table:**
  - `src/hooks/useTeams.ts` - membership management
  - `src/hooks/useTeamDashboard.ts` - member listings
  - `src/hooks/useTeamHQManagement.ts` - member operations
  - `src/hooks/useResourceFavorites.ts` - permission checks
  - `src/components/admin/CompleteUserEditor.tsx` - admin user views
- **Query Patterns:**
  - Select by team_id for member lists
  - Insert/update/delete membership operations
  - Role-based permission queries
- **Relationships:**
  - Child of teams via team_id
  - Child of users via user_id
- **Usage Frequency:** High
- **Status:** ✅ Active

### users
- **Record Count:** 21 records
- **Schema:** Main user table (NOT user_profiles!)
- **Files Using This Table:**
  - `src/hooks/useTeams.ts` - user lookup operations
  - `src/hooks/usePlayerStats.ts` - player data
  - `src/app/api/memberpress/webhook/route.ts` - webhook processing
  - `src/lib/dashboard-queries.ts` - user counts and roles
  - `src/lib/wordpress-team-sync.ts` - user synchronization
- **Query Patterns:**
  - Select by email and wordpress_id for authentication
  - User role and permission queries
  - User statistics and counts
- **Relationships:**
  - Parent to team_members
  - Parent to user_drills, user_strategies
  - Parent to skills_academy_user_progress
- **Usage Frequency:** High
- **Status:** ✅ Active

### user_sessions
- **Record Count:** 2 records
- **Schema:** User session tracking
- **Files Using This Table:**
  - `src/components/admin/CompleteUserEditor.tsx` - admin session views
- **Query Patterns:**
  - Select sessions by user_id for admin
- **Relationships:**
  - Child of users via user_id
- **Usage Frequency:** Low
- **Status:** ✅ Active

### user_auth_status
- **Record Count:** 21 records
- **Schema:** User authentication status tracking
- **Files Using This Table:**
  - `src/components/admin/CompleteUserEditor.tsx` - admin auth views
- **Query Patterns:**
  - Select auth status by user_id for admin
- **Relationships:**
  - Child of users via user_id
- **Usage Frequency:** Low
- **Status:** ✅ Active

### magic_links
- **Record Count:** 50 records
- **Schema:** Magic link authentication tokens
- **Files Using This Table:**
  - `src/hooks/useMagicLinkManagement.ts` - magic link operations
  - `src/components/admin/CompleteUserEditor.tsx` - admin auth views
  - `src/components/admin/MagicLinkPanel.tsx` - magic link creation
- **Query Patterns:**
  - Insert new magic links
  - Select by user_id for admin views
  - Update link status and usage
- **Relationships:**
  - Child of users via user_id
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### registration_links
- **Record Count:** 10 records
- **Schema:** User registration link tracking
- **Files Using This Table:**
  - `src/app/api/memberpress/webhook/route.ts` - registration processing
- **Query Patterns:**
  - Insert registration links from webhooks
- **Relationships:**
  - Related to user registration flow
- **Usage Frequency:** Low
- **Status:** ✅ Active

### registration_sessions
- **Record Count:** 0 records
- **Schema:** Registration session tracking
- **Files Using This Table:**
  - No active usage found
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Part of registration system
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty)

### family_accounts
- **Record Count:** 1 records
- **Schema:** Family account management
- **Files Using This Table:**
  - `src/components/admin/CompleteUserEditor.tsx` - admin family views
- **Query Patterns:**
  - Select family accounts for admin views
- **Relationships:**
  - Related to parent_child_relationships
- **Usage Frequency:** Low
- **Status:** ✅ Active

### family_members
- **Record Count:** 2 records
- **Schema:** Family member relationships
- **Files Using This Table:**
  - No direct usage found in current codebase
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Part of family account system
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy

### parent_child_relationships
- **Record Count:** 1 records
- **Schema:** Parent-child user relationships
- **Files Using This Table:**
  - `src/components/admin/CompleteUserEditor.tsx` - admin family views
  - `src/lib/dashboard-queries.ts` - family relationship queries
  - `src/lib/membership/capability-engine.ts` - permission checks
  - `src/lib/membership/parent-purchase-manager.ts` - parent purchase logic
- **Query Patterns:**
  - Select parent-child relationships for permissions
  - Family structure queries for admin
- **Relationships:**
  - Links users as parents and children
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### powlax_points_currencies
- **Record Count:** 7 records
- **Schema:** Point currency definitions for gamification
- **Files Using This Table:**
  - `src/hooks/useGamification.ts` - point system queries
- **Query Patterns:**
  - Select all point currencies for gamification
- **Relationships:**
  - Referenced by point transactions
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### user_points_balance_powlax
- **Record Count:** null records
- **Schema:** User point balances (appears empty)
- **Files Using This Table:**
  - `src/hooks/usePointsCalculation.ts` - point balance queries
- **Query Patterns:**
  - Select and update user point balances
- **Relationships:**
  - Child of users via user_id
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty table)

### powlax_badges
- **Record Count:** null records
- **Schema:** Badge definitions (appears empty)
- **Files Using This Table:**
  - No direct usage found
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Referenced by user_badges
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty table)

### user_badges
- **Record Count:** 3 records
- **Schema:** User earned badges
- **Files Using This Table:**
  - `src/hooks/usePlayerStats.ts` - player badge queries
  - `src/hooks/useTeamDashboard.ts` - team badge statistics
  - `src/hooks/useGamification.ts` - gamification queries
  - `src/components/admin/CompleteUserEditor.tsx` - admin badge views
- **Query Patterns:**
  - Select badges by user_id
  - Count badges for statistics
- **Relationships:**
  - Child of users via user_id
  - References badge definitions
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### powlax_player_ranks
- **Record Count:** 10 records
- **Schema:** Player ranking definitions
- **Files Using This Table:**
  - `src/hooks/usePlayerStats.ts` - rank system queries
  - `src/hooks/useGamification.ts` - rank definitions
- **Query Patterns:**
  - Select all ranks for progression system
- **Relationships:**
  - Referenced by user rank progress
- **Usage Frequency:** Medium
- **Status:** ✅ Active

### user_rank_progress
- **Record Count:** null records
- **Schema:** User rank progression tracking (appears empty)
- **Files Using This Table:**
  - No direct usage found
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Child of users via user_id
  - References powlax_player_ranks
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty table)

### team_playbooks
- **Record Count:** 0 records
- **Schema:** Team-specific playbooks and strategies
- **Files Using This Table:**
  - `src/hooks/useTeamPlaybook.ts` - playbook management
  - `src/components/practice-planner/PLANNER_MASTER_CONTRACT.md` - documentation reference
- **Query Patterns:**
  - Select playbooks by team_id
  - Insert/update/delete playbook operations
- **Relationships:**
  - Child of teams via team_id
  - References strategies and drills
- **Usage Frequency:** Medium
- **Status:** ✅ Active (Empty but functional)

### playbook_drills
- **Record Count:** null records
- **Schema:** Drills within team playbooks (appears empty)
- **Files Using This Table:**
  - No direct usage found
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Part of team playbook system
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty table)

### playbook_strategies
- **Record Count:** null records
- **Schema:** Strategies within team playbooks (appears empty)
- **Files Using This Table:**
  - No direct usage found
- **Query Patterns:**
  - No active queries found
- **Relationships:**
  - Part of team playbook system
- **Usage Frequency:** Low
- **Status:** ⚠️ Legacy (Empty table)

## RPC Functions

### get_next_webhook_to_process
- **Location:** Called from `src/lib/webhook-processor.ts`
- **Purpose:** Queue management for webhook processing
- **Tables Accessed:** webhook processing tables
- **Parameters:** None

### begin_transaction
- **Location:** Called from `src/app/api/workouts/complete/route.ts`
- **Purpose:** Start database transaction for workout completion
- **Tables Accessed:** Transaction management
- **Parameters:** None

### commit_transaction
- **Location:** Called from `src/app/api/workouts/complete/route.ts`
- **Purpose:** Commit database transaction
- **Tables Accessed:** Transaction management
- **Parameters:** None

### rollback_transaction
- **Location:** Called from `src/app/api/workouts/complete/route.ts`
- **Purpose:** Rollback failed transaction
- **Tables Accessed:** Transaction management
- **Parameters:** None

### award_drill_points
- **Location:** Referenced in `src/components/skills-academy/GAMIFICATION_CONTRACT.md`
- **Purpose:** Award points for drill completion
- **Tables Accessed:** Points and gamification tables
- **Parameters:** user_id, drill_id, points

## Tables Referenced in Code But Not Found in Database

### user_team_roles
- **Referenced in:** `src/app/api/sync/status/route.ts`, `src/hooks/useOrganizations.ts`, `src/lib/wordpress-team-sync.ts`
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

### membership_entitlements
- **Referenced in:** Multiple files for membership management
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

### membership_products
- **Referenced in:** `src/components/admin/CompleteUserEditor.tsx`
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

### user_points_wallets
- **Referenced in:** `src/hooks/usePlayerStats.ts`, `src/components/admin/CompleteUserEditor.tsx`
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

### webhook_events
- **Referenced in:** `src/app/api/memberpress/webhook/route.ts`
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

### data_access_audit
- **Referenced in:** `src/lib/audit-logging.ts`
- **Issue:** Code references this table but it doesn't exist in current database
- **Status:** ❌ Missing table - needs cleanup or creation

## Orphaned Tables
Based on analysis, these tables exist in database but have no code usage:
- `registration_sessions` (0 records) - No code references found
- `family_members` (2 records) - No active code usage
- `user_rank_progress` (null records) - Empty table with no usage
- `playbook_drills` (null records) - Empty table with no usage  
- `playbook_strategies` (null records) - Empty table with no usage

## Critical Observations

### Key Architecture Patterns
1. **drill_ids Array Pattern**: Skills Academy uses array columns (drill_ids) instead of junction tables for workout-drill relationships
2. **Source Separation**: Clear separation between `powlax_*` tables (official content) and `user_*` tables (user-generated content)
3. **Team Hierarchy**: clubs → teams → team_members structure for organization
4. **Gamification Integration**: Point systems and badges are actively used but some tables are empty

### Database Inconsistencies
1. **Missing Tables**: Code references 6+ tables that don't exist in database
2. **Empty Tables**: Several tables exist but contain no data (user_rank_progress, playbook_drills, etc.)
3. **Naming Confusion**: Some legacy references to non-existent tables like `practice_plans` (should be `practices`)

### High-Usage Tables
1. **skills_academy_drills** (167 records) - Core Skills Academy functionality
2. **powlax_drills** (135 records) - Core drill library
3. **teams** (4 records) - Organization structure
4. **users** (21 records) - User management
5. **team_members** (12 records) - Team relationships

### Recommended Actions
1. **Cleanup Missing Table References**: Remove or implement missing tables referenced in code
2. **Consolidate Empty Tables**: Consider removing or properly implementing empty tables
3. **Documentation Sync**: Update database documentation to match actual schema
4. **Performance Optimization**: Consider indexing on frequently queried columns (team_id, user_id, drill_ids arrays)

## Navigation
- [Complete Components Index](./COMPONENTS_INDEX.md)
- [Hooks and Contexts Index](./HOOKS_CONTEXTS_INDEX.md)
- [API Routes Index](./API_ROUTES_INDEX.md)
- [Master Index](./MASTER_INDEX.md)