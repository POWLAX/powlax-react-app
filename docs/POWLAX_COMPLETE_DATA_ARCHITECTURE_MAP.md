# POWLAX Complete Data Architecture Map
**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Complete mapping of data flow from WordPress/MemberPress registration through all POWLAX app features

---

## Table of Contents
1. [Registration & User Creation Flow](#1-registration--user-creation-flow)
2. [Coach Journey: Team HQ Creation & Management](#2-coach-journey-team-hq-creation--management)
3. [Player Journey: Registration & Features](#3-player-journey-registration--features)
4. [Data Table Relationships](#4-data-table-relationships)
5. [Component-to-Table Mapping](#5-component-to-table-mapping)
6. [Gamification System Flow](#6-gamification-system-flow)
7. [Practice Planning Data Flow](#7-practice-planning-data-flow)
8. [Skills Academy Data Flow](#8-skills-academy-data-flow)

---

## 1. Registration & User Creation Flow

### 1.1 Coach Purchases Team HQ/Club OS

```mermaid
graph TD
    A[Coach purchases in MemberPress] -->|Webhook| B[/api/memberpress/webhook]
    B --> C{Product Type?}
    
    C -->|Team HQ| D[Create team_teams record]
    C -->|Club OS| E[Create club_organizations + 3 teams]
    
    D --> F[Generate registration_links]
    E --> F
    
    F --> G[Create membership_entitlements]
    G --> H[Send email with magic link]
```

**Tables Affected:**
- `membership_products` - Maps MemberPress product IDs to entitlements
- `webhook_events` - Logs webhook receipt
- `club_organizations` - Created for Club OS purchases
- `team_teams` - Created for Team HQ purchases
- `registration_links` - Generated invite links (player + parent)
- `membership_entitlements` - Tracks active subscriptions
- `users` - Coach account created/updated

**Data Stored:**
```sql
-- membership_entitlements
{
  user_id: UUID,           -- Coach's user ID
  team_id: UUID,           -- Team they created (optional)
  club_id: UUID,           -- Club they created (optional)
  entitlement_key: 'team_hq_activated',
  status: 'active',
  expires_at: TIMESTAMP
}

-- registration_links
{
  token: 'secure_random_token',
  target_type: 'team',     -- or 'club'
  target_id: UUID,         -- team_teams.id or club_organizations.id
  default_role: 'player',  -- or 'parent', 'assistant_coach'
  max_uses: 25,            -- Players
  expires_at: TIMESTAMP
}
```

### 1.2 WordPress to Supabase User Sync

```
WordPress (BuddyBoss Groups) → API → Supabase
```

**WordPress Data Sources:**
- `wp_users` - Basic user info
- `wp_usermeta` - Extended profile
- `wp_bp_groups` - BuddyBoss groups
- `wp_bp_groups_members` - Group memberships
- `wp_mepr_subscriptions` - MemberPress subscriptions

**Supabase User Record:**
```sql
-- users table
{
  id: UUID,                      -- Supabase ID
  wordpress_id: INTEGER,         -- wp_users.ID
  wp_user_id: INTEGER,           -- Legacy column (same as wordpress_id)
  email: TEXT,                   -- wp_users.user_email
  display_name: TEXT,            -- wp_users.display_name
  role: TEXT,                    -- Determined from group/subscription
  roles: TEXT[],                 -- WordPress roles array
  club_id: UUID,                 -- Link to club_organizations
  auth_user_id: UUID,            -- Supabase Auth user (for login)
  metadata: JSONB {
    source: 'wordpress_migration',
    buddyboss_groups: [8, 9],    -- Group IDs they belong to
    memberpress_subscription: 41932
  }
}
```

---

## 2. Coach Journey: Team HQ Creation & Management

### 2.1 Team HQ Dashboard Access

**Component:** `/teams/[teamId]/dashboard`

**Data Flow:**
```
Coach Login → users.id → team_members → team_teams → Display Dashboard
```

**Tables Used:**
- `users` - Coach identity
- `team_members` - Role verification (must be 'head_coach' or 'assistant_coach')
- `team_teams` - Team details
- `membership_entitlements` - Verify active subscription

**Dashboard Displays:**
- Team name, logo (from `team_teams.metadata`)
- Roster count (COUNT from `team_members`)
- Active practice plans (from `practice_plans`)
- Team statistics (aggregated from various tables)

### 2.2 Practice Planner

**Component:** `/teams/[teamId]/practice-plans`

**Creating a Practice:**
```
Coach selects drills → Creates practice_plans → Saves segments → Links drills
```

**Tables Affected:**
```sql
-- practice_plans
{
  id: UUID,
  team_id: UUID,              -- Links to team_teams
  created_by: UUID,           -- Coach's users.id
  name: 'Tuesday Practice',
  date: DATE,
  duration_minutes: 90,
  notes: TEXT,
  metadata: JSONB {
    weather: 'sunny',
    field: 'Main Field',
    equipment: ['cones', 'balls']
  }
}

-- practice_plan_segments
{
  id: UUID,
  practice_plan_id: UUID,
  name: 'Warm Up',
  duration_minutes: 15,
  sequence_order: 1
}

-- practice_plan_drills
{
  segment_id: UUID,
  drill_id: TEXT,            -- References drills.id
  duration_minutes: 10,
  coaching_points: TEXT[],
  sequence_order: 1
}
```

**Drill Selection Uses:**
- `drills` - Main drill library
- `drill_strategies` - Links to strategies
- `strategies` - Team plays
- `strategy_concepts` - Lacrosse concepts
- `concepts` - Core principles
- `concept_skills` - Individual skills
- `skills` - Player abilities

### 2.3 Team Playbook

**Component:** `/teams/[teamId]/playbook`

**Creating Custom Drills/Strategies:**
```sql
-- user_drills (Coach's custom drills)
{
  id: SERIAL,
  user_id: UUID,              -- Coach who created it
  wp_id: TEXT,                -- Legacy WordPress ID if migrated
  title: 'Box Lacrosse Clear',
  description: TEXT,
  coaching_points: TEXT[],
  is_public: BOOLEAN,         -- Can other coaches see it?
  team_id: UUID               -- Private to this team
}

-- user_strategies (Coach's plays)
{
  id: SERIAL,
  user_id: UUID,
  strategy_id: INTEGER,       -- Links to strategies table
  title: '2-3-1 Motion Offense',
  description: TEXT,
  is_public: BOOLEAN
}
```

---

## 3. Player Journey: Registration & Features

### 3.1 Player Registration Flow

```
Coach shares link → Player clicks → Creates account → Joins team
```

**Registration Process:**
1. Player visits `/register?token=abc123`
2. System checks `registration_links` for valid token
3. Creates `users` record
4. Creates `team_members` record with role='player'
5. Optional: Creates Supabase Auth user for login

**Tables Affected:**
```sql
-- After registration
UPDATE registration_links 
SET used_count = used_count + 1 
WHERE token = 'abc123';

INSERT INTO team_members (team_id, user_id, role, created_at)
VALUES (target_id, new_user_id, 'player', NOW());
```

### 3.2 Player Dashboard

**Component:** `/dashboard`

**Data Displayed:**
- Team info (from `team_teams` via `team_members`)
- Points balance (from `user_points_wallets`)
- Badges earned (from `user_badges`)
- Recent workouts (from `skills_academy_user_progress`)
- Team playbook (filtered `user_strategies` where team_id matches)

**Queries:**
```sql
-- Get player's teams
SELECT t.* FROM team_teams t
JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = current_user_id;

-- Get points balance
SELECT currency, balance FROM user_points_wallets
WHERE user_id = current_user_id;

-- Get badges
SELECT b.* FROM badges b
JOIN user_badges ub ON b.badge_key = ub.badge_key
WHERE ub.user_id = current_user_id;
```

---

## 4. Data Table Relationships

### 4.1 User Hierarchy
```
users
  ├── team_members (role: player/parent/coach)
  │     └── team_teams
  │           └── club_organizations
  ├── membership_entitlements
  ├── user_points_wallets
  ├── user_badges
  └── skills_academy_user_progress
```

### 4.2 Practice Planning Hierarchy
```
practice_plans
  └── practice_plan_segments
        └── practice_plan_drills
              └── drills
                    ├── drill_strategies → strategies
                    ├── strategy_concepts → concepts
                    └── concept_skills → skills
```

### 4.3 Gamification Chain
```
User Action → points_ledger (transaction) → user_points_wallets (balance)
                    ↓
            Achievement Check → user_badges → badges (definitions)
                    ↓
            Rank Check → user_ranks → ranks (definitions)
```

---

## 5. Component-to-Table Mapping

| Component | Primary Tables | Secondary Tables |
|-----------|---------------|------------------|
| `/dashboard` | users, team_members | user_points_wallets, user_badges |
| `/teams/[id]/dashboard` | team_teams, team_members | practice_plans, membership_entitlements |
| `/practice-planner` | drills, practice_plans | drill_strategies, strategies |
| `/skills-academy` | skills_academy_workouts | skills_academy_drills, user_progress |
| `/wall-ball` | powlax_wall_ball_collections | wall_ball_drill_library |
| `/teams/[id]/playbook` | user_strategies, user_drills | team_teams |
| `/profile` | users, user_profiles | user_badges, user_points_wallets |
| `/register` | registration_links | users, team_members |

---

## 6. Gamification System Flow

### 6.1 Points Accumulation

**When Player Completes Workout:**
```sql
-- 1. Log transaction
INSERT INTO user_points_ledger (
  user_id, currency, amount, 
  transaction_type, source_type, source_id
) VALUES (
  player_id, 'fitness_points', 10,
  'earned', 'workout_completion', workout_id
);

-- 2. Update wallet balance
UPDATE user_points_wallets 
SET balance = balance + 10
WHERE user_id = player_id AND currency = 'fitness_points';

-- 3. Check for badge unlock
IF (SELECT balance FROM user_points_wallets WHERE...) >= 100 THEN
  INSERT INTO user_badges (user_id, badge_key, earned_at)
  VALUES (player_id, 'fitness_master', NOW());
END IF;
```

### 6.2 Badge Display Flow

```
user_badges.badge_key → badges.badge_key → badges.image_url → Display on Profile
```

**Badge Definition (badges table):**
```sql
{
  badge_key: 'wall_ball_warrior',
  name: 'Wall Ball Warrior',
  description: 'Complete 10 wall ball workouts',
  image_url: '/badges/wall-ball-warrior.png',
  requirements: {
    type: 'workout_count',
    workout_type: 'wall_ball',
    count: 10
  }
}
```

**User's Badge (user_badges table):**
```sql
{
  user_id: UUID,
  badge_key: 'wall_ball_warrior',
  earned_at: TIMESTAMP,
  progress: 10,  -- Current count
  metadata: {
    workouts_completed: [workout_ids...]
  }
}
```

---

## 7. Practice Planning Data Flow

### 7.1 Drill Library to Practice Plan

```
Drill Library → Filter by age/skill → Add to Segment → Save Practice
```

**Taxonomy Navigation:**
- Start with `skills` (e.g., "Catching")
- Find related `concepts` via `concept_skills`
- Find `strategies` via `strategy_concepts`
- Find `drills` via `drill_strategies`

**Saving Practice:**
```sql
BEGIN;
  -- Create practice
  INSERT INTO practice_plans (team_id, name, date) 
  VALUES (...) RETURNING id;
  
  -- Create segments
  INSERT INTO practice_plan_segments (practice_plan_id, name, duration)
  VALUES (...);
  
  -- Link drills
  INSERT INTO practice_plan_drills (segment_id, drill_id, duration)
  VALUES (...);
COMMIT;
```

---

## 8. Skills Academy Data Flow

### 8.1 Workout Progression

```
Series Selection → Workout List → Start Workout → Complete Drills → Earn Points
```

**Table Flow:**
```sql
-- 1. Get series
SELECT * FROM skills_academy_series WHERE age_range = '10-12';

-- 2. Get workouts in series
SELECT * FROM skills_academy_workouts WHERE series_id = ?;

-- 3. Get drills in workout (CURRENTLY BROKEN - junction table empty)
SELECT d.* FROM skills_academy_drills d
JOIN skills_academy_workout_drills wd ON d.id = wd.drill_id
WHERE wd.workout_id = ?;

-- 4. Track progress
INSERT INTO skills_academy_user_progress (
  user_id, workout_id, completed_at, points_earned
) VALUES (...);

-- 5. Award points
INSERT INTO user_points_ledger (...);
```

### 8.2 Wall Ball System (Working Example)

**Complete Data Flow:**
```sql
-- Get collections
SELECT * FROM powlax_wall_ball_collections;

-- Get drills in collection
SELECT d.*, cd.sequence_order 
FROM powlax_wall_ball_drill_library d
JOIN powlax_wall_ball_collection_drills cd ON d.id = cd.drill_id
WHERE cd.collection_id = ?
ORDER BY cd.sequence_order;

-- Track completion
INSERT INTO powlax_user_favorite_workouts (
  user_id, workout_type, workout_id
) VALUES (?, 'wall_ball', ?);
```

---

## 9. Critical Integration Points

### 9.1 Missing Connections (Need Implementation)

1. **Skills Academy Workout Drills**
   - `skills_academy_workout_drills` table is EMPTY
   - Workouts exist but don't link to drills
   - Need to populate junction table

2. **User Names Migration**
   - WordPress has `first_name`, `last_name` in `wp_usermeta`
   - Supabase uses `display_name` and `full_name`
   - Need to map during sync

3. **Auth Integration**
   - `users.auth_user_id` needs Supabase Auth user creation
   - Magic link login system partially implemented
   - Session management via `user_sessions`

### 9.2 Data Sync Requirements

**WordPress → Supabase Sync Points:**
- User profile updates
- Subscription status changes
- Group membership changes
- New user registrations

**Supabase → App Display:**
- Real-time subscription via Supabase Realtime
- React Query for caching
- Optimistic updates for user actions

---

## 10. Security & Permissions

### 10.1 Row Level Security (RLS)

**Key Policies:**
```sql
-- Users can only see their own data
CREATE POLICY "Own data only" ON user_points_wallets
FOR SELECT USING (user_id = auth.uid());

-- Coaches can manage their team
CREATE POLICY "Team coaches" ON team_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_members.team_id
    AND user_id = auth.uid()
    AND role IN ('head_coach', 'assistant_coach')
  )
);

-- Public drill library
CREATE POLICY "Public drills" ON drills
FOR SELECT USING (is_active = true);
```

---

## Summary: Complete Data Flow

1. **Registration:** MemberPress → Webhook → Create Org/Team → Generate Links
2. **User Creation:** WordPress Sync OR Registration Link → Create User → Assign Role
3. **Coach Features:** Team Dashboard → Practice Planner → Save Plans → Team Playbook
4. **Player Features:** Join Team → View Playbook → Complete Workouts → Earn Points/Badges
5. **Gamification:** Actions → Points Ledger → Update Wallets → Check Achievements → Award Badges
6. **Content Access:** Check Entitlements → Verify Team Membership → Display Appropriate Content

**Critical Tables for Each Feature:**
- **Team HQ:** team_teams, team_members, practice_plans
- **Practice Planner:** drills, strategies, practice_plan_*
- **Skills Academy:** skills_academy_*, user_progress
- **Gamification:** points_ledger, user_badges, badges
- **Authentication:** users, user_sessions, registration_links

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** After Skills Academy junction table population