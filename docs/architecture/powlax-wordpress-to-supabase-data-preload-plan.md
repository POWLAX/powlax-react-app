## WordPress → Supabase Data Preload Plan (for Page Build Readiness)

Status: Draft
Last updated: 2025-08-07

Cross-references:
- Migration: `docs/architecture/powlax-migration-and-integration-recommendations.md`
- UI/Flows: `docs/architecture/powlax-ui-and-data-flow-blueprint.md`
- Data mapping: `docs/EXACT_DATA_STRUCTURE_GUIDE.md`

Goal: Use existing WordPress data (MemberPress, BuddyBoss, drills/strategies, LearnDash/Quiz JSON, CSVs) to seed Supabase so the backend is ready before building pages.

---

## 1) Data Domains and WP Sources → Supabase Targets

- Users + Subscriptions
  - Source: WP Users (`/wp/v2/users`), MemberPress (`/wp-json/mp/v1/...`)
  - Target: `users` (with `wordpress_id`, email, name, avatar, roles), `user_subscriptions`
  - Code: `src/lib/wordpress-auth.ts` (sync user & subs), `src/app/api/test/wordpress-auth/route.ts`

- Organizations/Teams/Members
  - Source: BuddyBoss/BuddyPress Groups (`/wp-json/buddyboss/v1`, `/wp-json/bp/v1`) or CSV exports
  - Target: `organizations`, `teams`, `team_members`, `parent_child_relationships`
  - Code: `src/lib/wordpress-team-sync.ts` (orgs/teams/users), `supabase/migrations/003_enhanced_security_policies.sql`

- Drills and Strategies (Content)
  - Source: WP Posts/CPTs (drills, strategies) via `/wp/v2/*` or CSV/JSON exports
  - Target: `powlax_drills`, `powlax_strategies` (+ linking fields)
  - Code: `src/lib/wordpress-sync.ts`, `scripts/transforms/*`

- Skills Academy Workouts (LearnDash/Quiz JSON)
  - Source: JSON files in `docs/existing/json Academy Workouts./`
  - Target: `powlax_academy_workout_collections`, `powlax_academy_workout_items`, linking to `skills_academy_drills`
  - Guide: `docs/EXACT_DATA_STRUCTURE_GUIDE.md`

- Wall Ball (CSV)
  - Source: CSVs in `docs/Wordpress CSV's/...`
  - Target: `wall_ball_drill_catalog`, `wall_ball_workout_system` with `drill_sequence` JSONB
  - Guide: `docs/EXACT_DATA_STRUCTURE_GUIDE.md`

- Entitlements (Derived from MemberPress)
  - Source: MemberPress subscriptions/products
  - Target: `membership_products` (mapping) → `membership_entitlements` (grants), `teams.subscription_tier`
  - Code: to add (see below)

---

## 2) Table Creation (Order and Essentials)

Run existing migrations, then add the following minimal tables to support gating and assignments.

Already present (verify):
- `organizations`, `teams`, `team_members`, `parent_child_relationships` (003 migration)
- RLS baseline: `003_enhanced_security_policies.sql`, `004_*rls*`

Add (new):
- `membership_products` (wp_membership_id, entitlement_key, tier, scope, metadata, created_at, updated_at)
- `membership_entitlements` (user_id, organization_id, team_id, entitlement_key, expires_at, source, metadata, created_at)
- `powlax_academy_workout_collections`, `powlax_academy_workout_items` (if not yet present)
- `wall_ball_drill_catalog`, `wall_ball_workout_system` (if not yet present)
- `team_academy_assignments` (team_id, workout_id, due_at, assigned_by, created_at)
- `user_workout_progress` (user_id, workout_id, status, points_awarded, timestamps)

Indexes & Constraints:
- Unique on external IDs (`wordpress_id`, `original_id`)
- Entitlement indices on `(user_id)`, `(organization_id)`, `(team_id)`
- RLS for all new tables; public read only where intended (e.g., catalogs)

---

## 3) Export Methods from WordPress

Preferred (API-first):
- Users: `GET /wp-json/wp/v2/users?per_page=100&page=N`
- Drills/Strategies: `GET /wp-json/wp/v2/{post_type}?status=publish&per_page=100&page=N`
- MemberPress: `GET /wp-json/mp/v1/members/{userId}/subscriptions` and product lists
- BuddyBoss/BuddyPress: `GET /wp-json/buddyboss/v1/groups` or `GET /wp-json/bp/v1/...`

Alternative (bulk exports when API gaps exist):
- WP All Export (CSV/JSON) for posts, users, custom fields, groups
- Direct MySQL dumps filtered to required tables

Existing local assets:
- LearnDash/Quiz JSON and Wall Ball CSVs under `docs/` – use to seed Academy and Wall Ball systems immediately.

---

## 4) Import Pipelines (Idempotent & Incremental)

Base clients:
- Use Supabase service role for server-side ETL. Use anon client only when RLS allows.

Pipelines:
1) Drills & Strategies
   - Use `src/lib/wordpress-sync.ts` or a `scripts/transforms/*` task to fetch/parse and `upsert` by `wordpress_id`.
2) Skills Academy JSON
   - Parse as per `docs/EXACT_DATA_STRUCTURE_GUIDE.md` → insert into `powlax_academy_*` tables; link to `skills_academy_drills` by exact title match.
3) Wall Ball CSVs
   - Load into `wall_ball_drill_catalog` and `wall_ball_workout_system`, constructing `drill_sequence` JSONB arrays.
4) Users
   - Use `src/lib/wordpress-auth.ts` to fetch WP users (batched) and upsert to `users` with `wordpress_id`.
5) Organizations/Teams/Members
   - Use `src/lib/wordpress-team-sync.ts` to create orgs, teams, and `team_members` from BuddyBoss groups or CSV mapping.
6) Subscriptions → Entitlements
   - Pull MemberPress subs per user; upsert `user_subscriptions`.
   - Map via `membership_products` → create `membership_entitlements` rows.
   - Derive `teams.subscription_tier` (and org plan tiers) from entitlements.

Controls:
- `dryRun` flag (present in drill sync) for auditing; write run stats to `wp_sync_log`.
- Idempotent `upsert` with `onConflict` on external IDs.

---

## 5) Automation & Ongoing Sync

- Webhook Listener (MemberPress)
  - `app/api/memberpress-webhook/route.ts`: verify signature, record payload, upsert subs, recompute entitlements, auto-provision teams/orgs for purchases.

- Scheduled Jobs
  - Nightly: content sync (drills/strategies), user rescan for account updates, cleanup expired entitlements.

---

## 6) Execution Order (to enable page build with real data)

1. Create/verify tables and RLS (Sections 2).
2. Import content catalogs: drills, strategies, Academy JSON, Wall Ball CSVs.
3. Import users (minimal fields) and link `wordpress_id`.
4. Import orgs/teams/team_members from BuddyBoss or CSV.
5. Import MemberPress subs; populate `membership_products` mappings; compute `membership_entitlements` and set `teams.subscription_tier`.
6. Optional: Seed a few `team_academy_assignments` to validate Team HQ ↔ Academy flow.
7. Turn on webhook for ongoing MemberPress updates.

At this point, Practice Planner, Academy lists, Team HQ gating, and Director views can be built/tested against live data.

---

## 7) Sanity Checks and Queries

- Verify title matching (Academy → Drills): see queries in `docs/EXACT_DATA_STRUCTURE_GUIDE.md`.
- Ensure each team has a tier after entitlement computation.
- Confirm players can see their team’s plan (read-only) and assigned workouts.
- Audit `wp_sync_log` for errors and counts per run.

---

## 8) Repo Touchpoints (for implementers)

- WordPress auth/sync: `src/lib/wordpress-auth.ts`, `src/app/api/test/wordpress-auth/route.ts`
- Content sync: `src/lib/wordpress-sync.ts`, `scripts/transforms/*`
- Team/org sync: `src/lib/wordpress-team-sync.ts`
- Supabase schema: `supabase/migrations/003_enhanced_security_policies.sql`, `supabase/migrations/004_*`
- UI targets (to validate with data):
  - Practice Planner: `src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`
  - Skills Academy: `src/app/(authenticated)/skills-academy/page.tsx`
  - Team HQ: `src/app/(authenticated)/teams/[teamId]/hq/page.tsx`
  - Org Dash (to add): `/organizations/{orgId}/dashboard`


