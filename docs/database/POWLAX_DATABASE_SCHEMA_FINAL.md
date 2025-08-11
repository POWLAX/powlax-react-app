# POWLAX Database Schema - Final Structure
*Updated: January 16, 2025*  
*Purpose: Complete database schema after cleanup and MemberPress integration*

## 🔐 **Core Authentication Tables** (12 tables)
*Required for MemberPress/WordPress integration - DO NOT REMOVE*

### Primary Auth Tables
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `users` | Main user records | `id`, `wordpress_id`, `auth_user_id`, `email` | ✅ Active |
| `user_sessions` | Session tracking | `id`, `user_id`, `token`, `expires_at` | ✅ Active |
| `user_subscriptions` | MemberPress sync | `wordpress_user_id`, `membership_id`, `status` | ✅ Active |
| `user_activity_log` | Audit trail | `user_id`, `action`, `details`, `created_at` | ✅ Active |

### Registration & Onboarding
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `registration_links` | Secure registration | `token`, `target_type`, `target_id` | ✅ Active |
| `registration_sessions` | Registration progress | `token`, `email`, `status`, `user_id` | ✅ Active |
| `user_onboarding` | Onboarding steps | `user_id`, `step`, `completed` | ✅ Active |

### Webhook & Integration
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `webhook_queue` | Reliable processing | `webhook_id`, `status`, `payload` | ✅ Active |
| `webhook_events` | Audit trail | `source`, `payload`, `received_at` | ✅ Active |
| `membership_products` | Product mapping | `wp_membership_id`, `entitlement_key` | ✅ Active |
| `membership_entitlements` | Access control | `user_id`, `entitlement_key`, `status` | ✅ Active |
| `gamipress_sync_log` | Sync tracking | `entity_type`, `wordpress_id`, `action_type` | ✅ Active |

## 🏢 **Organization & Team Tables** (3 tables)

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `club_organizations` | Club entities | `id`, `name`, `created_at` | ✅ Active |
| `team_teams` | Team entities | `id`, `club_id`, `name` | ✅ Active |
| `team_members` | Team membership | `team_id`, `user_id`, `role`, `status` | ✅ Active |

## 🎯 **Content & Practice Tables** (7 tables)

### Drill & Strategy Content
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `powlax_drills` | POWLAX drill library | `id`, `title`, `duration_minutes`, `category` | ✅ Active |
| `user_drills` | User-created drills | `id`, `user_id`, `title`, `team_share` | ✅ Active |
| `powlax_strategies` | POWLAX strategies | `id`, `strategy_name`, `strategy_categories` | ✅ Active |
| `user_strategies` | User-created strategies | `id`, `user_id`, `strategy_name` | ✅ Active |

### Practice Planning
| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `practices` | Practice plans | `id`, `coach_id`, `team_id`, `drill_sequence` | ✅ Active |
| `practice_templates` | Practice templates | `id`, `name`, `drill_sequence`, `age_group` | ✅ Active |
| `team_playbooks` | Team strategies | `team_id`, `strategy_id`, `strategy_source` | ✅ Active |

## 🏆 **Skills Academy Tables** (4 tables)

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `skills_academy_workouts` | Workout definitions | `id`, `workout_name`, `drill_ids[]` | ✅ Active |
| `skills_academy_series` | Workout organization | `id`, `series_name`, `series_type` | ✅ Active |
| `skills_academy_drills` | Individual drills | `id`, `title`, `video_url`, `vimeo_id` | ✅ Active |
| `skills_academy_user_progress` | Progress tracking | `user_id`, `workout_id`, `status` | ✅ Active |

## 🥍 **Wall Ball System** (2 tables)

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `powlax_wall_ball_collections` | Workout collections | `id`, `name`, `duration_minutes` | ✅ Active |
| `powlax_wall_ball_collection_drills` | Collection mappings | `collection_id`, `drill_id`, `sequence_order` | ✅ Active |

## 🎮 **Gamification Tables** (3 tables)

| Table | Purpose | Key Columns | Status |
|-------|---------|-------------|---------|
| `user_points_wallets` | Point balances | `user_id`, `currency`, `balance` | ✅ Active |
| `user_badges` | Badge awards | `user_id`, `badge_key`, `awarded_at` | ✅ Active |
| `powlax_points_currencies` | Currency definitions | `currency`, `display_name`, `icon_url` | ✅ Active |

## 🗑️ **Removed Legacy Tables** (23 tables removed)

### Staging Tables (Removed in Phase 1)
- `staging_wp_drills`, `staging_wp_strategies`, `staging_wp_skills`
- `staging_wp_academy_drills`, `staging_wp_wall_ball`, `staging_drill_strategy_map`

### Legacy Duplicates (Removed in Phase 2)
- `drills` → replaced by `powlax_drills`
- `strategies_powlax` → replaced by `powlax_strategies`
- `organizations` → replaced by `club_organizations`
- `teams` → replaced by `team_teams`
- `user_organization_roles`, `user_team_roles` → replaced by `team_members`

### Unused Wall Ball Tables
- `powlax_wall_ball_drills`, `powlax_wall_ball_workouts`, `powlax_wall_ball_workout_drills`
- `powlax_wall_ball_drill_library`, `wall_ball_workout_series`, `wall_ball_workout_variants`

### Unused Skills Academy Tables  
- `powlax_skills_academy_workouts` → replaced by `skills_academy_workouts`
- `powlax_skills_academy_drills` → replaced by `skills_academy_drills`
- `powlax_skills_academy_questions`, `powlax_skills_academy_answers`
- `skills_academy_workout_drills` (empty table)

### Unused Progress/Gamification Tables
- `powlax_workout_completions` → replaced by `skills_academy_user_progress`
- `powlax_drill_completions`, `powlax_user_favorite_workouts`, `workout_completions`
- `user_points_ledger`, `user_ranks`, `powlax_badges_catalog`, `powlax_ranks_catalog`
- `powlax_gamipress_mappings`, `badges_powlax`, `powlax_player_ranks`, `user_points_balance_powlax`

### Unused System Tables
- `webhook_processing_log`, `club_members`, `migration_log`

## 🔄 **Migration Commands**

### Execute Cleanup (Run in Order)
```bash
# Phase 1: Remove staging and safe legacy tables
psql $DATABASE_URL -f supabase/migrations/070_cleanup_legacy_tables_phase1.sql

# Phase 2: Remove legacy organization/team structure  
psql $DATABASE_URL -f supabase/migrations/071_cleanup_legacy_tables_phase2.sql

# Phase 3: Create missing auth tables and verify
psql $DATABASE_URL -f supabase/migrations/072_create_missing_auth_tables.sql
psql $DATABASE_URL -f supabase/migrations/073_verify_auth_integration_tables.sql
```

### Verification
```sql
-- Check final table count (should be ~31 tables)
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List all remaining tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE' 
ORDER BY table_name;
```

## 📊 **Final Database Statistics**

- **Before Cleanup:** ~48 tables
- **After Cleanup:** ~31 tables  
- **Tables Removed:** 23 tables (48% reduction)
- **New Tables Added:** 2 tables (registration_sessions, user_onboarding)
- **Core System:** Streamlined and focused on active features

## 🔗 **Table Relationships**

### Authentication Flow
```
users (wordpress_id, auth_user_id) 
  ↓
user_sessions (session tracking)
  ↓  
user_subscriptions (MemberPress data)
  ↓
membership_entitlements (access control)
```

### Team Structure
```
club_organizations
  ↓
team_teams (club_id FK)
  ↓
team_members (team_id, user_id FKs)
```

### Content Creation
```
powlax_drills ←→ user_drills (drill libraries)
powlax_strategies ←→ user_strategies (strategy libraries)
  ↓
practices (drill_sequence JSONB)
team_playbooks (strategy collections)
```

### Skills Academy
```
skills_academy_series
  ↓
skills_academy_workouts (drill_ids[])
  ↓
skills_academy_drills
  ↓
skills_academy_user_progress
```

This schema now supports the complete MemberPress integration while maintaining all active features and removing 48% of unused legacy tables.
