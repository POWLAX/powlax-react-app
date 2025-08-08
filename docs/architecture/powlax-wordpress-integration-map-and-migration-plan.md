## WordPress Integration Map and Group Migration Plan

Status: Draft
Last updated: 2025-08-07

Cross-references:
- UI/Flows: `docs/architecture/powlax-ui-and-data-flow-blueprint.md`
- Data Preload: `docs/architecture/powlax-wordpress-to-supabase-data-preload-plan.md`
- Migration: `docs/architecture/powlax-migration-and-integration-recommendations.md`
- Data structures: `docs/EXACT_DATA_STRUCTURE_GUIDE.md`

---

## A) WordPress API Integration Map → New System Fit

### 1) Authentication & Users
- WordPress Core Users: `GET /wp-json/wp/v2/users?per_page=100&page=N`
  - Fields: id, email, name, roles, avatar_urls
  - Target: `users` (add `wordpress_id`, `email`, `full_name`, `roles`, `avatar_url`)
  - Code: `src/lib/wordpress-auth.ts`

### 2) MemberPress (Subscriptions/Products)
- Member subscriptions: `GET /wp-json/mp/v1/members/{userId}/subscriptions`
- Membership products: `GET /wp-json/mp/v1/memberships` (if enabled)
  - Fields: membership_id, status, created_at, expires_at, price, product name
  - Targets:
    - `user_subscriptions` (normalized per user/product)
    - `membership_products` (map `wp_membership_id` → `entitlement_key`, `tier`, `scope`)
    - `membership_entitlements` (derived grants → sets `teams.subscription_tier`, org plan tiers)
  - Fit: Drives feature gating (Team HQ sections, Club OS scope), onboarding automation
  - Code: `src/lib/wordpress-auth.ts` (pull & sync), webhook to add (`app/api/memberpress-webhook/route.ts`)

### 3) BuddyBoss/BuddyPress (Groups & Memberships)
- Groups: `GET /wp-json/buddyboss/v1/groups` or `GET /wp-json/bp/v1/groups`
- Group members: `GET /wp-json/buddyboss/v1/groups/{id}/members` (or `/bp/v1/groups/{id}/members`)
- Group meta: `GET /wp-json/buddyboss/v1/groups/{id}` often includes meta/custom fields
  - Fields: id, name, description, status, parent_id, meta (custom: group_type, age_band, season, etc.)
  - Targets:
    - `organizations` (map group_type=club_os)
    - `teams` (map group_type=team_hq or club_team_hq)
    - `team_members` (from group membership; role mapping below)
  - Fit: Establishes Club OS → Team HQ hierarchy and roster
  - Code: add `src/lib/wordpress-groups-sync.ts` (new) or extend `wordpress-team-sync.ts`

### 4) LearnDash (Groups/Courses/Quizzes)
- Groups: `GET /wp-json/ldlms/v1/groups` (or `/ldlms/v2/*` depending on version)
- Group users: `GET /wp-json/ldlms/v1/groups/{id}/users`
- Courses/Quizzes: `GET /wp-json/ldlms/v1/` endpoints
  - Fields: group id, title, user assignments, course relations
  - Targets:
    - Use LearnDash Groups as validation for Academy cohort assignments or migrate into `team_academy_assignments` post-launch
    - Academy content itself seeded from JSON exports per `docs/EXACT_DATA_STRUCTURE_GUIDE.md`
  - Fit: Transitional bridge for players already enrolled in LD groups → initial assignments in Academy

### 5) Content (Drills/Strategies)
- Posts/CPTs: `GET /wp-json/wp/v2/{post_type}` (drills, strategies)
  - Fields: id, title, content, taxonomy, custom fields (lab URLs, durations)
  - Targets: `powlax_drills`, `powlax_strategies` (+ mapping fields)
  - Fit: Practice Planner, Resources, Team Playbooks
  - Code: `src/lib/wordpress-sync.ts`

---

## B) Group Types and Role Mapping

### Group → New Schema Mapping
- Club OS (Organization):
  - WP: BuddyBoss/BuddyPress group with `group_type = 'club_os'`
  - Target: `organizations` (id map to `wp_group_id` stored in metadata)
  - Children: Club Team HQ groups and Team HQs under this org

- Club Team HQ (Program subset, optional mid-layer):
  - WP: group with `group_type = 'club_team_os'` or similar
  - Target: `teams` OR a label under `organizations` (if kept); recommended: flatten to `teams` with `parent_team_id` (optional)

- Team HQ (Team):
  - WP: group with `group_type = 'team_hq'`
  - Target: `teams` (with FK to `organizations`)

### Member Role Mapping (Group membership → `team_members.role`)
- WP Group Roles → New Role
  - admin/creator → `head_coach`
  - moderator → `assistant_coach`
  - member → `player`
  - parent roles are not usually group members → create via `parent_child_relationships` (from separate source/CSV)

Notes:
- Preserve all WordPress IDs in a mapping table or JSONB metadata columns to maintain referential traceability (`wp_group_id`, `wp_user_id`).

---

## C) LearnDash & BuddyBoss Data Analysis Checklist (Pre-Migration)

- Inventory group catalogs:
  - List all groups with `id`, `name`, `parent_id`, and any `meta.group_type` (club_os, club_team_hq, team_hq)
  - Export member lists per group with role (admin/mod/member)

- Validate overlaps:
  - Ensure each Team HQ has a parent Club OS group (or decide default org)
  - Identify duplicate or legacy groups to exclude

- LearnDash groups overlap:
  - For group-user enrollments, decide whether to translate into initial `team_academy_assignments` or ignore if obsolete
  - Identify LD groups that correspond exactly to Team HQs for simple mapping

- Parent/child mapping:
  - Source of truth: if not available in WP (e.g., BuddyBoss Friends or custom meta), prepare a CSV mapping `parent_email/child_email`

---

## D) Migration Plan (Post-Mapping Confirmation)

### Step 0: Tables and Indices
- Ensure: `organizations`, `teams`, `team_members`, `parent_child_relationships`
- Add mapping fields:
  - `organizations.metadata` JSONB with `wp_group_id`
  - `teams.metadata` JSONB with `wp_group_id`, `wp_parent_group_id`

### Step 1: Organizations (Club OS)
- For each WP group where `group_type = club_os`:
  - Upsert into `organizations` (name, metadata.wp_group_id)

### Step 2: Teams (Team HQ and Club Team HQ)
- For each WP group where `group_type in (team_hq, club_team_hq)`:
  - Determine parent organization (via parent group or explicit mapping)
  - Upsert into `teams` (organization_id FK, name, age_band from meta, metadata.wp_group_id)

### Step 3: Team Members
- For each team group’s members:
  - Resolve user by `wp_user_id` → `users.id` (create user if missing with `wordpress_id`)
  - Map group role → `team_members.role` (head_coach/assistant_coach/player)
  - Upsert unique `(team_id, user_id)`

### Step 4: Parent/Child Relationships
- If parent/child comes from CSV/meta:
  - Upsert into `parent_child_relationships` (resolve by email to user_id)

### Step 5: Entitlements and Tiers
- Use MemberPress mapping to set `teams.subscription_tier` and org plan levels via `membership_entitlements`

### Step 6: LearnDash Group Users → Initial Academy Assignments (Optional)
- For LD groups that match a Team HQ:
  - Create `team_academy_assignments` for on-ramp collections (e.g., Wall Ball Starter)
  - This seeds Academy views for existing cohorts

---

## E) Clarify “Which Information Goes Where” (Field Mapping Snapshot)

- Organization (`organizations`)
  - name ← WP group.name (club_os)
  - metadata.wp_group_id ← WP group.id
  - subscription_status ← derived from entitlements (org scope)

- Team (`teams`)
  - organization_id ← resolved parent org
  - name ← WP group.name (team_hq/club_team_hq)
  - age_band ← WP group.meta.age_band (if present)
  - subscription_tier ← derived from entitlements (team scope)
  - metadata.wp_group_id ← WP group.id

- Team Member (`team_members`)
  - user_id ← users.id (from `wordpress_id`)
  - team_id ← teams.id
  - role ← mapped (head_coach/assistant_coach/player)

- Parent/Child (`parent_child_relationships`)
  - parent_id, child_id ← resolved by email or `wordpress_id`

- Entitlements (`membership_entitlements`)
  - user_id/organization_id/team_id, entitlement_key, expires_at

---

## F) Implementation Touchpoints

- New (proposed): `src/lib/wordpress-groups-sync.ts`
  - Fetch groups (BuddyBoss/BuddyPress)
  - Build mapping (club_os/org, team_hq/team)
  - Upsert orgs, teams, and members
  - Support dry-run and logging into `wp_sync_log`

- Extend: `src/lib/wordpress-team-sync.ts`
  - Alternatively, add group sync functions here to keep all team/org logic centralized

---

## G) Validation & Dry-Run

- Produce CSV previews before writing:
  - organizations.csv (org_id, name, wp_group_id)
  - teams.csv (team_id, org_id, name, wp_group_id)
  - team_members.csv (team_id, user_id, role)

- Run with `dryRun: true`, store stats in `wp_sync_log`:
  - created, updated, skipped, errors; per-entity counts

- Sampling QA:
  - Randomly select N groups, verify parent/child relations and member roles after import

---

## H) Risks & Mitigations

- Missing `group_type` meta:
  - Mitigation: provide a mapping CSV (group_id → type); infer from naming conventions

- Parent relationships absent in WP:
  - Mitigation: import CSV for parent-child links; add onboarding to collect missing guardians

- Role ambiguity (moderator vs assistant):
  - Mitigation: default moderator → assistant_coach, allow manual override via admin UI later

- Rate limits / auth:
  - Mitigation: use Application Passwords; batch requests; implement backoff


