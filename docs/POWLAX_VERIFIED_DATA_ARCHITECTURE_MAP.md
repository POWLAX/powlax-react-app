# POWLAX Verified Data Architecture Map
**Version:** 2.0 - Based on Actual Database Verification  
**Date:** January 2025  
**Purpose:** Accurate mapping of VERIFIED table structures and data flow

> ⚠️ **IMPORTANT:** This document is based on actual database queries, not assumptions. All table structures have been verified directly from Supabase.

---

## Table of Contents
1. [Verified Table Structures](#1-verified-table-structures)
2. [Registration & User Creation Flow](#2-registration--user-creation-flow)
3. [Coach Journey: Team HQ Creation & Management](#3-coach-journey-team-hq-creation--management)
4. [Player Journey: Registration & Features](#4-player-journey-registration--features)
5. [Critical Findings & Corrections](#5-critical-findings--corrections)
6. [Component-to-Table Mapping](#6-component-to-table-mapping)
7. [Gamification System Status](#7-gamification-system-status)
8. [Skills Academy Data Flow](#8-skills-academy-data-flow)

---

## 1. Verified Table Structures

### 1.1 User & Authentication Tables

#### `users` Table (12 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID) - Primary key
- `wordpress_id` (INTEGER) - WordPress user ID
- `wp_user_id` (INTEGER) - Legacy WordPress ID (duplicate)
- `email` (TEXT)
- `display_name` (TEXT) - NOT first_name/last_name
- `role` (TEXT) - Single role (player/coach/parent)
- `roles` (TEXT[]) - WordPress roles array
- `club_id` (UUID) - Link to club_organizations
- `auth_user_id` (UUID) - Supabase Auth link
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMP)

**❌ DOES NOT HAVE:** `username`, `first_name`, `last_name`, `avatar_url`, `subscription_status`

#### `user_profiles` Table ❌
**STATUS:** Table exists but is EMPTY or may not be properly created

#### `user_sessions` Table ❌
**STATUS:** Table exists but is EMPTY

### 1.2 Team & Organization Tables

#### `team_teams` Table (10 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID)
- `club_id` (UUID) - Links to club_organizations
- `name` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

**❌ DOES NOT HAVE:** `wordpress_group_id`, `wordpress_group_name`, `age_band`, `team_type`

#### `club_organizations` Table (2 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID)
- `name` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

**❌ DOES NOT HAVE:** `wordpress_group_id`, `memberpress_product_id`

#### `team_members` Table (10 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID)
- `team_id` (UUID)
- `user_id` (UUID)
- `role` (TEXT) - head_coach/assistant_coach/player/parent
- `status` (TEXT) - active/inactive/pending
- `created_at` (TIMESTAMP)

**❌ DOES NOT HAVE:** `joined_at`, `soft_deleted_at`, `invited_by`, `invitation_token`

### 1.3 Registration & Membership Tables

#### `registration_links` Table (10 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID)
- `token` (TEXT)
- `target_type` (TEXT) - 'team' or 'club'
- `target_id` (UUID)
- `default_role` (TEXT)
- `expires_at` (TIMESTAMP)
- `max_uses` (INTEGER)
- `used_count` (INTEGER)
- `created_by` (UUID)
- `created_at` (TIMESTAMP)

#### `membership_products` Table (12 records) ✅
**ACTUAL COLUMNS:**
- `wp_membership_id` (INTEGER) - Primary key
- `product_slug` (TEXT)
- `entitlement_key` (TEXT)
- `scope` (TEXT) - user/team/club
- `create_behavior` (TEXT) - none/create_team/create_club
- `default_role` (TEXT)
- `metadata` (JSONB)

#### `membership_entitlements` Table (7 records) ✅
**ACTUAL COLUMNS:**
- `id` (UUID)
- `user_id` (UUID)
- `club_id` (UUID)
- `team_id` (UUID)
- `entitlement_key` (TEXT)
- `status` (TEXT) - active/expired/canceled
- `starts_at`, `expires_at` (TIMESTAMP)
- `source` (TEXT)
- `metadata` (JSONB)
- `created_at`, `updated_at` (TIMESTAMP)

### 1.4 Skills Academy Tables

#### `skills_academy_series` Table (49 records) ✅
**ACTUAL COLUMNS:**
- `id`, `series_name`, `series_slug`, `series_type`, `series_code`
- `description`, `skill_focus`, `position_focus`
- `difficulty_level`, `color_scheme`, `display_order`
- `is_featured`, `is_active`, `is_premium`
- `created_at`, `updated_at`

#### `skills_academy_workouts` Table (166 records) ✅
**ACTUAL COLUMNS:**
- `id`, `series_id`, `workout_name`, `workout_size`
- `drill_count`, `description`, `estimated_duration_minutes`
- `drill_ids` (JSONB) - **THIS IS HOW DRILLS LINK!**
- `original_json_id`, `original_json_name`
- `is_active`, `created_at`, `updated_at`

#### `skills_academy_drills` Table (167 records) ✅
**ACTUAL COLUMNS:**
- `id`, `original_id`, `title`, `vimeo_id`
- `drill_category`, `equipment_needed`, `age_progressions`
- `space_needed`, `complexity`, `sets_and_reps`
- `duration_minutes`, `point_values`, `tags`
- `video_url`, `created_at`, `updated_at`

#### `skills_academy_workout_drills` Table ❌
**STATUS:** EXISTS but is EMPTY (0 records)
**CRITICAL:** Workouts link to drills via `drill_ids` JSON column instead!

#### `skills_academy_user_progress` Table ✅
**ACTUAL COLUMNS:**
- `id`, `user_id`, `workout_id`
- `current_drill_index`, `drills_completed`, `total_drills`
- `started_at`, `last_activity_at`, `completed_at`
- `total_time_seconds`, `status`, `completion_percentage`
- `points_earned`

### 1.5 Tables That DON'T EXIST or are EMPTY

#### Practice Planning Tables ❌
- `drills` - DOES NOT EXIST
- `strategies` - EXISTS but EMPTY
- `concepts` - EXISTS but EMPTY
- `skills` - EXISTS but EMPTY
- `practice_plans` - EXISTS but EMPTY
- `practice_plan_segments` - EXISTS but EMPTY
- `practice_plan_drills` - EXISTS but EMPTY
- `drill_strategies` - EXISTS but EMPTY

#### Gamification Tables ❌
- `user_points_ledger` - EXISTS but EMPTY
- `user_points_wallets` - EXISTS but EMPTY
- `points_ledger` - DOES NOT EXIST
- `badges` - EXISTS but EMPTY
- `user_badges` - EXISTS but EMPTY
- `user_ranks` - EXISTS but EMPTY
- `powlax_points_currencies` - EXISTS with 2 records (currency, display_name)
- `powlax_badges_catalog` - EXISTS but EMPTY

#### Wall Ball Tables ❌
- `powlax_wall_ball_collections` - EXISTS but EMPTY
- `powlax_wall_ball_drill_library` - EXISTS but EMPTY
- `powlax_wall_ball_collection_drills` - EXISTS but EMPTY

#### Other Tables ❌
- `user_drills` - DOES NOT EXIST
- `user_strategies` - DOES NOT EXIST
- `webhook_events` - EXISTS but EMPTY
- `webhook_queue` - EXISTS with structure but EMPTY

---

## 2. Registration & User Creation Flow

### 2.1 CORRECTED Coach Purchase Flow

```mermaid
graph TD
    A[Coach purchases in MemberPress] -->|Webhook| B[/api/memberpress/webhook]
    B --> C[webhook_queue table]
    C --> D{Product Check via membership_products}
    
    D -->|team_hq products| E[Create team_teams record]
    D -->|club_os products| F[Create club_organizations + teams]
    
    E --> G[Generate registration_links]
    F --> G
    
    G --> H[Create membership_entitlements]
    H --> I[Create users record]
```

**VERIFIED Table Updates:**
```sql
-- users table (ACTUAL structure)
INSERT INTO users (
  wordpress_id,     -- From WordPress
  wp_user_id,       -- Same as wordpress_id (legacy)
  email,
  display_name,     -- NOT first_name/last_name!
  role,             -- 'head_coach' for purchaser
  roles,            -- WordPress roles array
  club_id,          -- If Club OS purchase
  metadata
)

-- membership_entitlements (VERIFIED)
INSERT INTO membership_entitlements (
  user_id,
  team_id,          -- For Team HQ
  club_id,          -- For Club OS
  entitlement_key,  -- From membership_products
  status,           -- 'active'
  expires_at
)
```

### 2.2 CORRECTED WordPress Sync

**ACTUAL users Table Mapping:**
```sql
-- What we CAN sync:
wordpress_id: wp_users.ID
email: wp_users.user_email
display_name: wp_users.display_name
roles: wp_usermeta roles

-- What we CANNOT sync (columns don't exist):
username: ❌ Column doesn't exist
first_name: ❌ Column doesn't exist
last_name: ❌ Column doesn't exist
avatar_url: ❌ Column doesn't exist
```

---

## 3. Coach Journey: Team HQ Creation & Management

### 3.1 VERIFIED Dashboard Data

**Component:** `/teams/[teamId]/dashboard`

**ACTUAL Query Path:**
```sql
-- Get coach's team (VERIFIED columns)
SELECT t.id, t.name, t.club_id 
FROM team_teams t
JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = ? AND tm.role IN ('head_coach', 'assistant_coach')

-- Get roster (VERIFIED)
SELECT u.display_name, u.email, tm.role, tm.status
FROM users u
JOIN team_members tm ON u.id = tm.user_id
WHERE tm.team_id = ?
```

### 3.2 Practice Planner STATUS

**⚠️ CRITICAL:** Practice planning tables DO NOT EXIST or are EMPTY
- Cannot save practice plans (tables empty)
- Cannot access drill library (drills table doesn't exist)
- Taxonomy system not implemented

**Temporary Workaround:** Would need to create these tables or use alternative storage

---

## 4. Player Journey: Registration & Features

### 4.1 VERIFIED Registration Process

```sql
-- 1. Check token (VERIFIED)
SELECT * FROM registration_links 
WHERE token = ? AND expires_at > NOW() AND used_count < max_uses

-- 2. Create user (ACTUAL columns)
INSERT INTO users (
  wordpress_id,    -- Generate if not from WordPress
  email,
  display_name,    -- From registration form
  role,            -- From registration_links.default_role
  metadata
)

-- 3. Add to team (VERIFIED)
INSERT INTO team_members (
  team_id,         -- From registration_links.target_id
  user_id,         -- New user ID
  role,            -- 'player' or 'parent'
  status,          -- 'active'
  created_at
)

-- 4. Update link usage (VERIFIED)
UPDATE registration_links 
SET used_count = used_count + 1 
WHERE token = ?
```

---

## 5. Critical Findings & Corrections

### 5.1 Major Discrepancies Found

1. **User Names:** 
   - ❌ No `first_name`, `last_name` columns
   - ✅ Uses `display_name` only

2. **Practice Planning:**
   - ❌ Core tables don't exist or are empty
   - ❌ Cannot save practices currently

3. **Skills Academy:**
   - ❌ Junction table `skills_academy_workout_drills` is EMPTY
   - ✅ Workouts link to drills via `drill_ids` JSON column

4. **Gamification:**
   - ❌ All point/badge tables are EMPTY
   - ❌ System not functional yet

5. **Wall Ball:**
   - ❌ All tables EMPTY (contrary to previous reports)

### 5.2 Working Features

Based on verified data:
- ✅ User registration and team membership
- ✅ Team/Club organization structure
- ✅ MemberPress product mapping
- ✅ Registration link generation
- ✅ Skills Academy content (series, workouts, drills)
- ⚠️ Skills Academy progress tracking (table exists)

### 5.3 Non-Working Features

Based on empty tables:
- ❌ Practice planning
- ❌ Drill library and taxonomy
- ❌ Points and badges
- ❌ Wall ball workouts
- ❌ Custom user drills/strategies

---

## 6. Component-to-Table Mapping

### VERIFIED Component Dependencies

| Component | Working Tables | Non-Working/Empty Tables |
|-----------|---------------|--------------------------|
| `/dashboard` | users, team_members | user_points_wallets ❌, user_badges ❌ |
| `/teams/[id]/dashboard` | team_teams ✅, team_members ✅ | practice_plans ❌ |
| `/practice-planner` | NONE | drills ❌, strategies ❌, practice_plans ❌ |
| `/skills-academy` | skills_academy_series ✅, skills_academy_workouts ✅ | workout_drills junction ❌ |
| `/wall-ball` | NONE | All wall ball tables ❌ |
| `/register` | registration_links ✅, users ✅ | - |

---

## 7. Gamification System Status

### COMPLETELY NON-FUNCTIONAL

All gamification tables are EMPTY:
- `user_points_ledger` - EMPTY
- `user_points_wallets` - EMPTY
- `badges` - EMPTY
- `user_badges` - EMPTY
- `user_ranks` - EMPTY

**Only working:** `powlax_points_currencies` has 2 currency definitions

---

## 8. Skills Academy Data Flow

### CORRECTED Workout Access

```sql
-- Get workout with drills (ACTUAL structure)
SELECT 
  w.*,
  w.drill_ids  -- JSON array of drill IDs!
FROM skills_academy_workouts w
WHERE w.id = ?

-- Then fetch drills separately
SELECT * FROM skills_academy_drills 
WHERE id = ANY(workout.drill_ids)
```

**CRITICAL:** The `skills_academy_workout_drills` junction table is EMPTY. Drills are linked via the `drill_ids` JSON column in the workouts table.

---

## Summary: What Actually Works

### ✅ WORKING (Verified with Data):
1. User registration system
2. Team/Club organization structure
3. Team membership assignments
4. MemberPress product definitions
5. Registration link system
6. Skills Academy content structure
7. Basic entitlements tracking

### ❌ NOT WORKING (Empty/Missing Tables):
1. Practice planning (all tables empty/missing)
2. Drill library and taxonomy
3. Points and badges system
4. Wall ball workouts
5. Custom drills/strategies
6. User sessions
7. Webhook events logging

### ⚠️ PARTIALLY WORKING:
1. Skills Academy - Content exists but junction table empty
2. User profiles - Structure exists but missing expected columns
3. Webhook queue - Structure exists but not being used

---

## Recommendations

1. **IMMEDIATE:** Fix Skills Academy by either:
   - Populate `skills_academy_workout_drills` junction table, OR
   - Continue using `drill_ids` JSON column

2. **HIGH PRIORITY:** Create/populate practice planning tables:
   - Create `drills` table
   - Implement taxonomy system
   - Enable practice plan saving

3. **MEDIUM PRIORITY:** Implement gamification:
   - Design point award rules
   - Create badge definitions
   - Implement ledger system

4. **DATA FIX:** Add missing user columns or adjust app expectations:
   - Either add `first_name`, `last_name` to users table
   - OR update app to use `display_name` only

---

**Document Version:** 2.0 - VERIFIED  
**Verification Date:** January 2025  
**Method:** Direct database queries via Supabase client  
**Next Review:** After implementing missing tables