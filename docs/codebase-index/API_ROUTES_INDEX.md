# API Routes Index - POWLAX Codebase Index
**Generated:** January 15, 2025
**Contract:** codebase-indexing-001

## Summary Statistics
- Total API routes: 19
- Database-connected routes: 16
- External integrations: 5
- Authentication required: 12

## Detailed Index

### Admin Operations

#### /api/admin/wp-import-check
- **Location:** `src/app/api/admin/wp-import-check/route.ts`
- **HTTP Methods:** GET
- **Purpose:** Check WordPress import data and retrieve org/team/member information
- **Authentication:** Not Required
- **Database Tables Accessed:**
  - `clubs` - select operation
  - `teams` - select operation
  - `team_members` - select operation
  - `users` - select operation (with error handling)
- **External Services:** None
- **Request Format:**
  ```typescript
  // GET request with no parameters
  ```
- **Response Format:**
  ```typescript
  {
    orgs: Array<{id: string, name: string}>,
    teams: Array<{id: string, name: string, club_id: string}>,
    members: Array<{team_id: string, user_id: string, role: string}>,
    usersById: Record<string, {email?: string, full_name?: string, username?: string}>
  }
  ```
- **Error Handling:** Returns 500 with error message on failure
- **Status:** ✅ Working
- **Notes:** Important admin diagnostic tool for WordPress integration

### Debug & Testing

#### /api/debug/auth
- **Location:** `src/app/api/debug/auth/route.ts`
- **HTTP Methods:** GET
- **Purpose:** Debug authentication state and check auth-related cookies
- **Authentication:** Required (Supabase Auth)
- **Database Tables Accessed:** None directly (uses auth utilities)
- **External Services:** None
- **Request Format:**
  ```typescript
  // GET request with no parameters
  ```
- **Response Format:**
  ```typescript
  {
    supabase: {
      authenticated: boolean,
      user: {id: string, email: string} | null,
      error?: string
    },
    cookies: {
      total: number,
      authRelated: Array<{name: string, hasValue: boolean, valueLength: number}>
    }
  }
  ```
- **Error Handling:** Returns 500 with debug info on failure
- **Status:** ✅ Working
- **Notes:** Essential for debugging authentication issues

#### /api/test/supabase-connection
- **Location:** `src/app/api/test/supabase-connection/route.ts`
- **HTTP Methods:** POST
- **Purpose:** Test Supabase connection and environment configuration
- **Authentication:** Not Required
- **Database Tables Accessed:**
  - `profiles` - test query only
- **External Services:** Supabase
- **Request Format:**
  ```typescript
  // POST request with no body required
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    message?: string,
    connection: {status: string, url: string, testQuery: string},
    environment: {supabaseUrl: boolean, anonKey: boolean, serviceRoleKey: boolean},
    serviceRole: {available: boolean, working: boolean, error?: string},
    recommendations: string[]
  }
  ```
- **Error Handling:** Comprehensive error diagnosis with troubleshooting recommendations
- **Status:** ✅ Working
- **Notes:** Critical for environment validation and troubleshooting

### Email Services

#### /api/email/send-magic-link
- **Location:** `src/app/api/email/send-magic-link/route.ts`
- **HTTP Methods:** POST
- **Purpose:** Send magic link emails (currently placeholder with WordPress integration ready)
- **Authentication:** Not Required
- **Database Tables Accessed:** None
- **External Services:**
  - WordPress API (planned integration commented out)
  - SendGrid (not yet implemented)
- **Request Format:**
  ```typescript
  {
    to: string,
    magicLinkUrl: string,
    subject?: string,
    data?: {
      userName?: string,
      expiresAt?: string,
      capabilities?: string[]
    }
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    message: string,
    emailId: string
  }
  ```
- **Error Handling:** Returns 500 with error details on failure
- **Status:** ⚠️ Needs Work - Placeholder implementation, needs WordPress/SendGrid integration
- **Notes:** Ready for WordPress email integration implementation

### Gamification & Sync

#### /api/gamipress/sync
- **Location:** `src/app/api/gamipress/sync/route.ts`
- **HTTP Methods:** GET, POST, DELETE
- **Purpose:** Trigger and monitor GamiPress sync operations from WordPress
- **Authentication:** Required (Bearer token)
- **Database Tables Accessed:**
  - `gamipress_sync_log` - insert/select operations
- **External Services:** WordPress GamiPress API
- **Request Format:**
  ```typescript
  // POST
  {
    user_ids?: number[],
    force_full_sync?: boolean,
    dry_run?: boolean
  }
  
  // GET - query params: sync_id?, limit?
  // DELETE - query params: sync_id (required)
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    sync_id?: string,
    stats?: SyncStats,
    logs?: Array<SyncLog>,
    error?: string
  }
  ```
- **Error Handling:** Comprehensive error logging with database persistence
- **Status:** ✅ Working
- **Notes:** Full gamification sync system with monitoring and cancellation support

### MemberPress Integration

#### /api/memberpress/webhook
- **Location:** `src/app/api/memberpress/webhook/route.ts`
- **HTTP Methods:** POST
- **Purpose:** Handle MemberPress webhook events for subscription management
- **Authentication:** Webhook signature verification (HMAC SHA256)
- **Database Tables Accessed:**
  - `users` - select/insert/update operations
  - `team_teams` - insert operations (NOTE: Table name mismatch - should be 'teams')
  - `registration_links` - insert operations
  - `club_organizations` - insert operations (NOTE: Table name mismatch - should be 'clubs')
  - `membership_products` - select operations
  - `membership_entitlements` - insert/update operations
  - `team_members` - update operations
  - `webhook_events` - insert operations
- **External Services:**
  - MemberPress Webhook System
  - Webhook queuing system (RPC: enqueue_webhook)
- **Request Format:**
  ```typescript
  // MemberPress webhook payload
  {
    event: string,
    id?: string,
    membership_id?: number,
    user_id?: number,
    email?: string,
    full_name?: string
  }
  ```
- **Response Format:**
  ```typescript
  {
    ok: boolean,
    queued?: boolean,
    queue_id?: string,
    message?: string,
    error?: string
  }
  ```
- **Error Handling:** Fallback to direct processing if queueing fails
- **Status:** ⚠️ Needs Work - Table name mismatches, uses non-existent tables
- **Notes:** Critical webhook system but has database table naming inconsistencies

#### /api/wordpress/memberpress
- **Location:** `src/app/api/wordpress/memberpress/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** WordPress MemberPress API integration (Phase 1 placeholder)
- **Authentication:** Required (Bearer token)
- **Database Tables Accessed:** None (placeholder implementation)
- **External Services:** MemberPress API (planned)
- **Request Format:**
  ```typescript
  // GET - query params: action, userId
  // POST
  {
    action: 'sync' | 'bulkSync' | 'validate',
    userId?: string,
    userIds?: string[],
    productId?: string
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    data: MembershipStatus | SyncResult | BulkSyncResult,
    message?: string
  }
  ```
- **Error Handling:** Basic error handling with 401/400/500 responses
- **Status:** ⚠️ Needs Work - Phase 1 placeholder, full implementation needed
- **Notes:** Structured for Phase 2 implementation of MemberPress integration

### Sync Operations

#### /api/sync/full
- **Location:** `src/app/api/sync/full/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** Run complete WordPress to Supabase sync (organizations, teams, users)
- **Authentication:** Required (Administrator role)
- **Database Tables Accessed:**
  - `users` - role validation
  - All tables accessed via wordpressTeamSync service
- **External Services:** WordPress API (via wordpressTeamSync)
- **Request Format:**
  ```typescript
  // POST
  {
    csvPath?: string
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    results: {
      organizations: SyncResult,
      teams: SyncResult,
      users: SyncResult
    }
  }
  ```
- **Error Handling:** Returns detailed sync results with error information
- **Status:** ✅ Working
- **Notes:** Comprehensive sync system requiring admin privileges

#### /api/sync/organizations
- **Location:** `src/app/api/sync/organizations/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** Sync organizations from WordPress to Supabase
- **Authentication:** Required (Administrator role)
- **Database Tables Accessed:**
  - `users` - role validation
  - Organizations tables (via wordpressTeamSync)
- **External Services:** WordPress API
- **Request Format:**
  ```typescript
  // POST with no body required
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    created: number,
    updated: number,
    errors: string[],
    syncLogId: string
  }
  ```
- **Error Handling:** Returns 401/403/500 with appropriate error messages
- **Status:** ✅ Working
- **Notes:** Part of modular sync system

#### /api/sync/status
- **Location:** `src/app/api/sync/status/route.ts`
- **HTTP Methods:** GET
- **Purpose:** Get sync operation status and current data counts
- **Authentication:** Required (Any authenticated user)
- **Database Tables Accessed:**
  - `clubs` - count query
  - `teams` - count query
  - `user_team_roles` - count query
- **External Services:** None
- **Request Format:**
  ```typescript
  // GET - query params: limit? (default: 10)
  ```
- **Response Format:**
  ```typescript
  {
    currentCounts: {
      organizations: number,
      teams: number,
      teamMemberships: number
    },
    syncHistory: Array<SyncHistoryItem>
  }
  ```
- **Error Handling:** Returns 401/500 with error details
- **Status:** ✅ Working
- **Notes:** Useful monitoring tool for sync operations

#### /api/sync/teams
- **Location:** `src/app/api/sync/teams/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** Sync teams from WordPress to Supabase
- **Authentication:** Required (Administrator role)
- **Database Tables Accessed:**
  - `users` - role validation
  - Teams tables (via wordpressTeamSync)
- **External Services:** WordPress API
- **Request Format:**
  ```typescript
  // POST
  {
    csvPath?: string
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    created: number,
    updated: number,
    errors: string[],
    syncLogId: string
  }
  ```
- **Error Handling:** Returns 401/403/500 with appropriate error messages
- **Status:** ✅ Working
- **Notes:** Supports optional CSV import path

#### /api/sync/users
- **Location:** `src/app/api/sync/users/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** Sync user memberships from WordPress to Supabase
- **Authentication:** Required (Administrator role)
- **Database Tables Accessed:**
  - `users` - role validation
  - User membership tables (via wordpressTeamSync)
- **External Services:** WordPress API
- **Request Format:**
  ```typescript
  // POST
  {
    csvPath?: string
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    created: number,
    updated: number,
    errors: string[],
    syncLogId: string
  }
  ```
- **Error Handling:** Returns 401/403/500 with appropriate error messages
- **Status:** ✅ Working
- **Notes:** Handles user-team relationship synchronization

### Team Operations

#### /api/teams/[teamId]
- **Location:** `src/app/api/teams/[teamId]/route.ts`
- **HTTP Methods:** GET
- **Purpose:** Get detailed team information including members
- **Authentication:** Required (Any authenticated user)
- **Database Tables Accessed:**
  - `teams` - select with joins
  - `team_members` - join operation
  - `users` - join operation for member details
- **External Services:** None
- **Request Format:**
  ```typescript
  // GET /api/teams/123abc
  ```
- **Response Format:**
  ```typescript
  {
    id: string,
    name: string,
    club_id?: string,
    team_members: Array<{
      id: string,
      role: string,
      user: {
        id: string,
        display_name: string,
        email: string,
        role: string
      }
    }>
  }
  ```
- **Error Handling:** Returns 401/404/500 with appropriate error messages
- **Status:** ✅ Working
- **Notes:** Essential for team detail pages and member management

### Workout & Skills Academy

#### /api/workouts/complete
- **Location:** `src/app/api/workouts/complete/route.ts`
- **HTTP Methods:** POST
- **Purpose:** Complete workouts and award gamification points with anti-gaming measures
- **Authentication:** Required (Supabase Auth)
- **Database Tables Accessed:**
  - `powlax_drills` - select operations
  - `skills_academy_drills` - select operations
  - `workout_completions` - insert operations
  - `points_transactions_powlax` - insert operations
  - `user_points_balance_powlax` - select/update operations
  - `badges_powlax` - select operations
  - `user_badge_progress_powlax` - select/upsert operations
- **External Services:** None
- **Request Format:**
  ```typescript
  {
    drillIds: number[],
    workoutId?: number,
    workoutType: 'custom' | 'skills_academy' | 'team_practice',
    sessionData?: {
      duration_minutes?: number,
      notes?: string
    }
  }
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    workout_completion_id: string,
    score: {
      total_points: number,
      average_difficulty: number,
      category_points: Record<string, number>,
      bonus_multipliers: Record<string, number>
    },
    streak: StreakResult,
    badges: Array<BadgeUpdate>,
    summary: WorkoutSummary
  }
  ```
- **Error Handling:** Transaction rollback on failure, comprehensive error logging
- **Status:** ✅ Working
- **Notes:** Sophisticated gamification system with point distribution and badge management

#### /api/workouts/progress
- **Location:** `src/app/api/workouts/progress/route.ts`
- **HTTP Methods:** GET, POST
- **Purpose:** Track and retrieve workout progress with point distribution
- **Authentication:** Required (implied by user_id requirement)
- **Database Tables Accessed:**
  - `skills_academy_user_progress` - insert/update/select operations
  - `user_points_balance_powlax` - select/update operations
  - `skills_academy_user_streaks` - select/update operations
  - `skills_academy_workouts` - join for workout details
  - `skills_academy_series` - join for series details
- **External Services:** None
- **Request Format:**
  ```typescript
  // POST
  {
    user_id: string,
    workout_id: number,
    current_drill_index?: number,
    drills_completed?: number,
    total_drills?: number,
    total_time_seconds?: number,
    points_earned?: number,
    status?: 'in_progress' | 'completed',
    completion_percentage?: number
  }
  
  // GET - query params: user_id (required), workout_id?
  ```
- **Response Format:**
  ```typescript
  {
    success: boolean,
    progress: ProgressRecord | Array<ProgressRecord>,
    message?: string
  }
  ```
- **Error Handling:** Continues with other operations even if individual point updates fail
- **Status:** ✅ Working
- **Notes:** Comprehensive progress tracking with sophisticated point distribution (6-point system)

## Server Actions
No server actions found in the codebase - all API functionality is implemented through traditional API routes.

## External Integrations

### WordPress API
- **Endpoints:** `/api/sync/*`, `/api/gamipress/sync`, `/api/email/send-magic-link`
- **Data Flow:** WordPress → Supabase via sync operations
- **Authentication:** Service role keys and API tokens
- **Status:** Active sync system operational

### MemberPress
- **Endpoints:** `/api/memberpress/webhook`, `/api/wordpress/memberpress`
- **Data Flow:** MemberPress webhooks → Supabase membership management
- **Authentication:** HMAC signature verification
- **Status:** Webhook system active, API integration in development

### SendGrid
- **Endpoints:** `/api/email/send-magic-link`
- **Data Flow:** Magic link generation → Email delivery
- **Authentication:** API key authentication
- **Status:** Planned integration, currently placeholder

### Supabase
- **All Endpoints:** Database operations and authentication
- **Data Flow:** API routes ↔ Supabase tables
- **Authentication:** Service role and user authentication
- **Status:** Fully operational

### GamiPress
- **Endpoints:** `/api/gamipress/sync`
- **Data Flow:** WordPress GamiPress → Supabase gamification tables
- **Authentication:** Bearer token authentication
- **Status:** Active sync system with monitoring

## Critical Issues & Recommendations

### Database Table Name Inconsistencies
- **Issue:** `/api/memberpress/webhook` references non-existent tables (`team_teams`, `club_organizations`)
- **Recommendation:** Update to use correct table names (`teams`, `clubs`)
- **Impact:** High - webhook processing may fail

### Placeholder Implementations
- **Issue:** Several endpoints have placeholder implementations awaiting full development
- **Affected Routes:** `/api/email/send-magic-link`, `/api/wordpress/memberpress`
- **Recommendation:** Prioritize WordPress and SendGrid integration completion

### Authentication Pattern Consistency
- **Issue:** Mixed authentication patterns across endpoints
- **Recommendation:** Standardize on Supabase Auth with consistent role checking

### Error Handling Standardization
- **Issue:** Varying error response formats across endpoints
- **Recommendation:** Implement consistent error response schema

## Security Considerations

### Webhook Security
- HMAC signature verification implemented for MemberPress webhooks
- Bearer token authentication for GamiPress sync
- Development mode bypass available (should be removed in production)

### Admin Operations
- Proper role-based access control for sync operations
- Service role key protection for sensitive database operations

### Rate Limiting
- No rate limiting currently implemented
- Recommendation: Add rate limiting for public endpoints

## Performance Notes

### Database Operations
- Efficient use of joins for related data retrieval
- Transaction support for atomic operations (workout completion)
- Proper error handling with rollback mechanisms

### Caching
- No response caching currently implemented
- Opportunity for caching frequently accessed team/user data

### Monitoring
- Comprehensive logging for sync operations
- Error tracking in database for audit trails