# 📊 Practice Planner Database Tables Reference

**Last Updated:** January 9, 2025  
**Purpose:** Complete reference of all database tables used by the POWLAX Practice Planner

---

## 🗄️ Database Tables Overview

The Practice Planner relies on **13 database tables** across different functional areas. This document provides a complete reference for developers working on Practice Planner features.

---

## 📋 Core Practice Planning Tables

### 1. `practice_plans` (Primary) / `practice_plans_collaborative` (Fallback)
**Purpose:** Stores complete practice plans created by coaches

**Key Fields:**
- `id` - UUID primary key
- `title` - Practice plan name
- `team_id` - Associated team
- `user_id` - Coach/creator ID
- `practice_date` - Date of practice
- `duration_minutes` - Total practice duration
- `drill_sequence` - JSON containing timeSlots and drills
- `selected_strategies` - Array of selected strategy IDs
- `setup_time` - Pre-practice setup minutes
- `setup_notes` - Setup preparation notes
- `practice_notes` - General practice notes

**Used By:** 
- `usePracticePlans.ts` hook
- SavePracticeModal component
- LoadPracticeModal component

---

## 🏃 Drill Tables

### 2. `powlax_drills`
**Purpose:** POWLAX official drill library (read-only for users, editable by admins)

**Key Fields:**
- `id` - UUID primary key
- `title` - Drill name
- `content` - Drill description
- `video_url` - Instructional video URL
- `category` - Drill category
- `duration_minutes` - Recommended duration
- `difficulty_level` - Skill level required
- `min_players` / `max_players` - Player requirements
- `equipment` - Required equipment array

**Used By:**
- `useDrills.ts` hook
- DrillLibraryTabbed component
- AdminEditModal (admin users only)

### 3. `user_drills`
**Purpose:** Custom user-created drills

**Key Fields:**
- `id` - UUID primary key
- `user_id` - Creator's user ID
- `title` - Drill name
- `drill_category` - Category classification
- `drill_duration` - Duration string (e.g., "10 minutes")
- `drill_video_url` - Optional video URL
- `drill_notes` - Coaching notes
- `team_share` - Array of team IDs for sharing
- `is_public` - Public visibility flag

**Used By:**
- `useUserDrills.ts` hook
- AddCustomDrillModal component
- DrillLibraryTabbed (Custom Drills accordion)

---

## 🎯 Strategy Tables

### 4. `powlax_strategies`
**Purpose:** POWLAX official strategy library

**Key Fields:**
- `id` - UUID primary key
- `strategy_name` - Strategy title
- `description` - Detailed description
- `strategy_categories` - Game phase classification
- `vimeo_link` - Video demonstration URL
- `lacrosse_lab_links` - Interactive diagram URLs
- `see_it_ages` / `coach_it_ages` / `own_it_ages` - Age appropriateness

**Used By:**
- `useStrategies.ts` hook
- StrategiesTab component
- StudyStrategyModal component

### 5. `user_strategies`
**Purpose:** Custom user-created strategies

**Key Fields:**
- `id` - UUID primary key
- `user_id` - Creator's user ID
- `strategy_name` - Strategy title
- `description` - Strategy details
- `team_share` - Array of team IDs for sharing
- `is_public` - Public visibility flag

**Used By:**
- `useStrategies.ts` hook
- AddCustomStrategiesModal component

---

## 👥 Team Management Tables

### 6. `teams`
**Purpose:** Team information and settings

**Key Fields:**
- `id` - UUID primary key
- `name` - Team name
- `description` - Team description
- `coach_id` - Primary coach user ID
- `created_at` - Team creation date

**Used By:**
- Practice plans via `team_id` reference
- Team selection in SavePracticeModal
- Team context throughout Practice Planner

### 7. `team_playbooks`
**Purpose:** Saved strategies for team-specific playbooks

**Key Fields:**
- `id` - UUID primary key
- `team_id` - Associated team
- `strategy_id` - Referenced strategy
- `strategy_source` - 'powlax' or 'user'
- `custom_name` - Team-specific name
- `team_notes` - Team-specific notes
- `added_by` - User who added to playbook
- `created_at` - Date added

**Used By:**
- `useTeamPlaybook.ts` hook
- SaveToPlaybookModal component
- TeamPlaybook display component

---

## 👤 User Management Tables

### 8. `user_profiles`
**Purpose:** User authentication and profile data

**Key Fields:**
- `id` - UUID primary key
- `email` - User email
- `role` - User role (admin, coach, player, parent)
- `first_name` / `last_name` - User name

**Used By:**
- Admin permission checks
- User authentication
- Practice plan ownership

### 9. `user_team_roles`
**Purpose:** User roles and permissions within teams

**Key Fields:**
- `user_id` - User ID reference
- `team_id` - Team ID reference
- `role` - Role within team (coach, assistant, player)

**Used By:**
- Team access control
- Role-based permissions

---

## 📅 Supporting Tables

### 10. `team_events`
**Purpose:** Team calendar events and practices

**Used By:** Team dashboard (not primary to Practice Planner)

### 11. `team_activity_feed`
**Purpose:** Team activity logs and updates

**Used By:** Team dashboard activity display

### 12. `team_announcements`
**Purpose:** Team announcements and communications

**Used By:** Team communication features

---

## 🔮 Pending/Future Tables

### 13. `user_favorites` (NOT YET IMPLEMENTED)
**Purpose:** Store user's favorite drills and strategies

**Planned Fields:**
- `id` - UUID primary key
- `user_id` - User ID reference
- `item_type` - 'drill' or 'strategy'
- `item_id` - Referenced item ID
- `created_at` - Date favorited

**Status:** Specified in requirements but not yet implemented

---

## 🔄 Data Flow Architecture

```
Practice Planner Page
    │
    ├─> practice_plans (saves/loads complete practice sessions)
    │   └─> Contains drill_sequence JSON with all practice data
    │
    ├─> Drill Sources
    │   ├─> powlax_drills (official POWLAX drills)
    │   └─> user_drills (custom created drills)
    │
    ├─> Strategy Sources
    │   ├─> powlax_strategies (official strategies)
    │   └─> user_strategies (custom strategies)
    │
    ├─> Team Context
    │   ├─> teams (team information)
    │   ├─> team_playbooks (saved team strategies)
    │   └─> user_team_roles (permissions)
    │
    └─> User Context
        └─> user_profiles (authentication & permissions)
```

---

## 🔑 Key Relationships

1. **Practice Plans** → Teams
   - `practice_plans.team_id` → `teams.id`

2. **Practice Plans** → Users
   - `practice_plans.user_id` → `user_profiles.id`

3. **Team Playbooks** → Strategies
   - `team_playbooks.strategy_id` → `powlax_strategies.id` OR `user_strategies.id`

4. **User Content** → Teams (Sharing)
   - `user_drills.team_share[]` → `teams.id`
   - `user_strategies.team_share[]` → `teams.id`

5. **Users** → Teams (Membership)
   - `user_team_roles.user_id` → `user_profiles.id`
   - `user_team_roles.team_id` → `teams.id`

---

## 🛠️ Database Operations

### Reading Data
- **Drills:** Fetched from both `powlax_drills` and `user_drills`, merged in frontend
- **Strategies:** Fetched from both `powlax_strategies` and `user_strategies`, merged
- **Practice Plans:** Filtered by `team_id` and user access

### Writing Data
- **Save Practice:** Inserts/updates `practice_plans` table
- **Create Custom Drill:** Inserts into `user_drills` table
- **Save to Playbook:** Inserts into `team_playbooks` table
- **Admin Edits:** Updates `powlax_drills` or `powlax_strategies` (admin only)

### Data Persistence
- **Auto-save:** Every 3 seconds to localStorage (temporary)
- **Database Save:** Manual save via SavePracticeModal to `practice_plans`
- **Custom Content:** Immediately saved to `user_drills` or `user_strategies`

---

## 📝 Notes for Developers

1. **Table Naming Convention:** 
   - POWLAX content: `powlax_*` prefix
   - User content: `user_*` prefix
   - Team features: `team_*` prefix

2. **Source Identification:**
   - Drills/strategies have a `source` field: 'powlax' or 'user'
   - User content IDs are prefixed with 'user-' in frontend

3. **Permission Levels:**
   - POWLAX content: Read-only for users, editable by admins
   - User content: Full CRUD for creators, read for shared teams
   - Team content: Based on `user_team_roles`

4. **Data Merging:**
   - Frontend merges POWLAX and user content
   - Unified display with source indicators

---

**This document should be updated when:**
- New tables are added to Practice Planner
- Table schemas are modified
- New relationships are established
- Data flow changes significantly