## POWLAX Migration and Integration Recommendations

Status: Draft
Last updated: 2025-08-07

### Purpose
Actionable recommendations to: 1) optimize WordPress→Supabase migration, 2) stand up live integrations for Team HQ, Club OS, Skills Academy, Coaching Kits, 3) migrate MemberPress rules/memberships into Supabase infra, 4) ensure cohesive cross-module flow, 5) stage the build so Dashboard, Skills Academy, Practice Planner, Team HQ, Club OS come online in the right order — aligned with goals in `docs/brief.md`.

---

## 1) Optimize migration from WordPress to Supabase

- **Inventory and mapping (single source of truth)**
  - WordPress sources: Users, MemberPress memberships/subscriptions, BuddyBoss groups (Club/Team structures), drills, strategies, media.
  - Supabase targets (confirm/expand):
    - `users` (+ `wordpress_id`, subscription/status fields) — see `src/lib/wordpress-auth.ts`
    - `user_subscriptions` (or keep as `subscriptions`) synced from MemberPress — see `syncSubscriptions(...)` in `src/lib/wordpress-auth.ts`
    - Organizations/Teams/Members:
      - `organizations`, `teams`, `team_members`, `parent_child_relationships` — see `supabase/migrations/003_enhanced_security_policies.sql`
    - Content:
      - Drills: `powlax_drills`/`drills` (ensure `wordpress_id`, strategy links)
      - Strategies: `powlax_strategies`
      - Skills Academy: `powlax_skills_academy_workouts`, `powlax_wall_ball_collections` (referenced in `src/app/(authenticated)/skills-academy/page.tsx`)

- **ETL pipeline (idempotent, incremental)**
  - Use existing sync scaffolding and make it robust:
    - `src/lib/wordpress-sync.ts` for drill content; ensure upsert on `wordpress_id` with `onConflict`.
    - `src/lib/wordpress-auth.ts` for user + MemberPress sync; centralize entitlement derivation.
    - `src/lib/wordpress-team-sync.ts` for organizations/teams/members via exports (CSV or REST where possible) + write logs to `wp_sync_log`.
  - Add a small mapping layer/table for products→entitlements:
    - `membership_products` (wp_membership_id, entitlement_key, tier, scope: organization|team|user, created_at, updated_at)
    - `membership_entitlements` (user_id, organization_id, team_id, entitlement_key, expires_at, source: 'memberpress', metadata)
  - Incremental sync strategy:
    - Pull WordPress deltas (by `modified` date or page cursors); upsert into Supabase.
    - On webhook (see below), process the user’s current entitlements idempotently.
  - Dry-run + audit-first:
    - Add `dryRun` everywhere (already present in drill sync) and summary logs. Store per-run stats in `wp_sync_log` with counts, errors, and metadata.

- **RLS and security alignment**
  - Leverage patterns in `supabase/migrations/003_enhanced_security_policies.sql` and `004_*rls*.sql` to ensure users see only relevant org/team data.
  - Ensure new tables (`membership_products`, `membership_entitlements`) have RLS and indexes on `user_id`, `organization_id`, `team_id`.

- **Automate via webhooks (MemberPress)**
  - Create `app/api/memberpress-webhook/route.ts` (as outlined in `docs/existing/stage1-implementation.md`) to listen for subscription events: created, updated, canceled, expired.
  - On event: upsert MemberPress subscription, recompute `membership_entitlements`, backfill `teams` for Team HQ purchases and `organizations` for Club OS.
  - Verify signature (MemberPress secret) and log full payload to `wp_sync_log` with `sync_type: 'webhook'`.

---

## 2) Go-live integrations: Team HQ, Club OS, Skills Academy, Coaching Kits

- **Team HQ (coach-centric hub)**
  - Current page: `src/app/(authenticated)/teams/[teamId]/hq/page.tsx` — sections are gated by `team.subscription_tier`.
  - Ensure data integrity:
    - `teams.subscription_tier` populated by entitlements mapping.
    - `team_members` reflects roles: head_coach, assistant_coach, player, parent.
  - Immediate links: Practice Planner (`/teams/[teamId]/practice-plans`), Playbook, Roster, Communications, Skills Academy assignments.

- **Club OS (director-centric org layer)**
  - Create org routes: `src/app/(authenticated)/organizations/[orgId]/{dashboard, teams, analytics, communications}`.
  - Data: `organizations`, `teams` (FK), `team_members` (for cross-team reporting), entitlements at org scope.
  - Director views: cross-team consistency, onboarding, analytics.

- **Skills Academy (player-centric)**
  - Current pages pulling from Supabase: `src/app/(authenticated)/skills-academy/page.tsx` (uses `powlax_skills_academy_workouts`, `powlax_wall_ball_collections`).
  - Add assignment plumbing:
    - `team_academy_assignments` (team_id, workout_id, due_at, assigned_by)
    - `user_workout_progress` (user_id, workout_id, status, points_awarded)
  - Wire Team HQ → assign workouts; Academy → reflect assigned items and progress.

- **Coaching Kits (resource center)**
  - Add routes under Resources: `src/app/(authenticated)/resources/coaching-kits` and detail pages.
  - Source from strategies and curated bundles:
    - `coaching_kits` (id, title, description, strategy_ids[], drill_ids[], pdf_urls[], tier_min)
  - Entitlement-aware: show kits based on team/coach tier.

---

## 3) MemberPress rules/memberships → Supabase infrastructure

- **Data extraction**
  - Use MemberPress REST (`/wp-json/mp/v1/...`) where available; otherwise export DB tables or CSV.
  - For each subscription: map `membership_id`, status, dates, user_id to a normalized subscription row.

- **Target schema and mapping**
  - `user_subscriptions`: (user_id, wp_membership_id, status, started_at, expires_at, last_event_at, metadata)
  - `membership_products`: (wp_membership_id → entitlement_key/tier, scope)
  - `membership_entitlements`: computed rows granting access to org/team features and tiers.
  - `teams.subscription_tier` derived when entitlements include a Team HQ product; also create team shell if missing.
  - `organizations.subscription_status`/plan tier derived for Club OS purchases.

- **Role model**
  - Global roles: admin, director, coach, player, parent (at minimum).
  - Team-scoped roles: `team_members.role` governs access; enforce with RLS.
  - Parent-child links: `parent_child_relationships` for guardian access.

- **RLS policies**
  - Follow patterns in `003_enhanced_security_policies.sql` and apply table-specific rules for new tables.
  - Anonymous read only where explicitly intended (e.g., public catalogs), otherwise authenticated/role-checked.

---

## 4) Cohesive cross-module flow

- **Navigation and entry points**
  - Bottom and sidebar nav already structured in `src/components/navigation/*`. Ensure consistent route ownership per `docs/technical/powlax-navigation-plan.md`.
  - Role-adaptive Dashboard (`/dashboard`) links into Team HQ for coaches/directors and into Academy for players.

- **Data links that tie the system together**
  - Drill ↔ Strategy mapping: ensure `powlax_drills` carries `strategy_ids[]` for in-context practice planning.
  - Team HQ assigns Academy workouts via `team_academy_assignments`; Academy surfaces assigned items to players; progress flows back to Team HQ analytics.
  - Club OS aggregates team analytics and adoption across `organizations`.

- **Unified entitlement checks**
  - Central utility: `lib/entitlements.ts` (new) to answer “does user/team/org have X?” based on `membership_entitlements` and tiers. Use in server components and API routes.

---

## 5) Staged build-out plan (thin vertical slices)

- **Stage 0: Foundations (Data/Auth/RLS)**
  - Confirm migrations for `organizations`, `teams`, `team_members`, `parent_child_relationships` (already present).
  - Add `membership_products`, `membership_entitlements` tables + RLS.
  - Harden `src/lib/wordpress-auth.ts` and `src/lib/wordpress-team-sync.ts` for idempotent upserts and error logging.

- **Stage 1: Connect what’s already here**
  - Practice Planner: ensure `usePracticePlans` uses `practice_plans_collaborative` as source of truth and is tied to `team_id` and `coach_id`.
  - Skills Academy: ensure workouts/collections tables populated; add progress tables.
  - Dashboard: role-adaptive cards linking to Team HQ or Academy depending on role.

- **Stage 2: Team HQ core + gating**
  - Fill `team.subscription_tier` via entitlements; gate sections in `teams/[teamId]/hq` accordingly.
  - Implement Roster page and Playbook minimal flows, then Communications (stub with feature flag).

- **Stage 3: Club OS (org layer)**
  - Create org dashboards and analytics views; director onboarding; cross-team reports.

- **Stage 4: MemberPress automation**
  - Add webhook route to process purchases, cancellations, upgrades.
  - Auto-provision Team HQ(s) for purchases, attach coaches, generate activation codes.

- **Stage 5: Coaching Kits**
  - Curate kits from strategies/drills; entitlement-aware access.

- **Stage 6: Cutover and QA**
  - Dry-run full sync, then limited live sync, then full cutover.
  - Playwright coverage for: login, dashboard, Academy browse, Planner create/save, Team HQ visibility by tier.

---

## Concrete implementation checklist

- Schema
  - [ ] Add `membership_products`, `membership_entitlements` migrations with RLS and indexes
  - [ ] Ensure indexes on `team_members(user_id)`, `membership_entitlements(user_id, organization_id, team_id)`

- Sync / APIs
  - [ ] Harden `src/lib/wordpress-auth.ts` subscription sync; centralize status mapping
  - [ ] Implement `app/api/memberpress-webhook/route.ts` with signature verification and logging
  - [ ] Extend `src/lib/wordpress-team-sync.ts` to upsert org/team from Club OS/Team HQ purchases
  - [ ] Ensure `wp_sync_log` captures batch and webhook runs with metadata

- Features
  - [ ] Practice Planner: verify real drill data, save/load works per `docs/MVP_PRACTICE_PLANNER_CONTRACT.md`
  - [ ] Skills Academy: create `team_academy_assignments`, `user_workout_progress`; wire assign → track
  - [ ] Team HQ: enforce gating via `subscription_tier`; ensure links/routes exist
  - [ ] Club OS: add org routes with basic dashboards
  - [ ] Coaching Kits: add schema and basic UI under Resources

- Cohesion
  - [ ] Add `lib/entitlements.ts` and replace scattered checks with a single helper
  - [ ] Ensure nav highlights and cross-links follow `docs/technical/powlax-navigation-plan.md`

- QA / Observability
  - [ ] Add server-side logging around sync and webhook handling
  - [ ] Extend Playwright tests for the staged flows

---

## References

- Brief and flows: `docs/brief.md`, `docs/technical/powlax-navigation-plan.md`
- Supabase migrations: `supabase/migrations/003_enhanced_security_policies.sql`, `supabase/migrations/004_*`
- Sync libs: `src/lib/wordpress-auth.ts`, `src/lib/wordpress-sync.ts`, `src/lib/wordpress-team-sync.ts`
- Practice Planner: `src/hooks/usePracticePlans.ts`, `src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`
- Skills Academy: `src/app/(authenticated)/skills-academy/page.tsx`, `src/app/skills-academy-public/page.tsx`
- Team HQ: `src/app/(authenticated)/teams/[teamId]/hq/page.tsx`


