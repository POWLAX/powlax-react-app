## POWLAX UI and Data Flow Blueprint

Status: Draft
Last updated: 2025-08-07

### Purpose
A concise blueprint of the UI and data flows that ties objectives to routes, avatars, and the data required for each page. Designed to be a “complete bill” reference for build-out and QA.

References: `docs/brief.md`, `docs/technical/powlax-navigation-plan.md`, `docs/technical/powlax-user-flows.md`, `docs/EXACT_DATA_STRUCTURE_GUIDE.md`.

---

## Objectives (from the Brief)

1) Players improve independently via Skills Academy and arrive at practice ready.
2) Coaches create effective practices in 10 minutes and teach age-appropriate concepts.
3) Directors unify programs (Club OS) and see consistent, measurable improvement.
4) Parents support without drama; can see progress and guidance.
5) Cohesive flow: Drill → Strategy → Practice Plan → Player Training → Progress → Analytics.

Key differentiators: Drill↔Strategy mapping, “Do it / Coach it / Own it” labeling, practice planner speed, and visible progress (badges, points, streaks).

---

## Avatars and Capabilities Matrix

- Director (Club OS)
  - Organization dashboard (multi-team), cross-team analytics, onboarding, communications
  - Entitlement scope: organization-level

- Coach (Team HQ)
  - Practice planner, team playbooks, roster, team communications, assign Academy work
  - Entitlement scope: team-level

- Player (Skills Academy)
  - Assigned workouts, self-selected training, progress, badges, leaderboard
  - Entitlement scope: user-level + team context (read-only on team plans)

- Parent (Support)
  - Child progress view, schedule/announcements, parent guides
  - Entitlement scope: child-linked view only

Entitlement Backbone: Derived from MemberPress purchases mapped to `membership_entitlements` → gates features and tiers (e.g., `teams.subscription_tier`).

---

## Route Map and Page Inclusions

Legend: Includes [UI components], [Data tables/queries], [Actions]

### Auth
- `/auth/login`
  - [Login form, role detection]
  - [users]
  - [Authenticate, redirect to /dashboard]

- `/auth/register`
  - [Registration, role selection]
  - [users]
  - [Create user, optional team/org join]

### Dashboard (Role-Adaptive)
- `/dashboard`
  - [Role cards, quick links, summaries]
  - [users, teams, practice_plans summaries, user progress]
  - [Deep-link to Teams/Academy; context switch (team/child)]

### Teams Index and Team HQ
- `/teams`
  - [Teams list, create/join team (entitlement-aware)]
  - [teams, team_members]
  - [Select team, navigate to Team HQ]

- `/teams/{teamId}` (Team HQ)
  - [Sections: Practice Planner, Playbook, Roster, Communications, Skills Academy (gated), Analytics]
  - [teams (subscription_tier), team_members]
  - [Gate features by `subscription_tier`, navigate to subpages]

### Team HQ Subpages
- `/teams/{teamId}/practice-plans`
  - [PracticePlanBuilder, DrillLibrary panel, Duration progress]
  - [practice_plans_collaborative, powlax_drills, strategies]
  - [Create/edit/save plan, add drills by strategy, share]

- `/teams/{teamId}/playbook`
  - [Strategy list/detail, video embeds, tags]
  - [powlax_strategies, powlax_drills (links)]
  - [Add to plan, tag by age band]

- `/teams/{teamId}/roster`
  - [Roster table/cards, roles, parent links]
  - [team_members, parent_child_relationships]
  - [Invite users, change roles]

- `/teams/{teamId}/communications`
  - [Announcements, messages (MVP stub), templates]
  - [announcements (future), teams]
  - [Post message to team]

- `/teams/{teamId}/skills-academy`
  - [Assignments list, assign workouts]
  - [team_academy_assignments, powlax_skills_academy_workouts]
  - [Assign/cancel assignments]

- `/teams/{teamId}/analytics`
  - [Team progress charts, attendance (future)]
  - [practice_plans_collaborative, user_workout_progress]
  - [Filter by date/role]

### Club OS (Organization Layer)
- `/organizations/{orgId}/dashboard`
  - [Org overview, adoption, alerts]
  - [organizations, teams, team_members]
  - [Onboard teams/coaches]

- `/organizations/{orgId}/teams`
  - [Teams table, creation, tier assignment]
  - [teams]
  - [Create team(s), set tier]

- `/organizations/{orgId}/analytics`
  - [Cross-team metrics, drill/strategy usage]
  - [teams, practice_plans_collaborative, user_workout_progress]
  - [Export reports]

- `/organizations/{orgId}/communications`
  - [Org announcements]
  - [organizations]
  - [Post org-wide updates]

### Skills Academy
- `/academy`
  - [Workouts preview, wall ball collections, quick start]
  - [powlax_skills_academy_workouts, powlax_wall_ball_collections]
  - [Start workout, resume last]

- `/academy/workouts`
  - [Workout browser, filters]
  - [powlax_skills_academy_workouts]
  - [Open detail, assign (coach)]

- `/academy/workouts/{workoutId}`
  - [Workout detail, drill sequence, video]
  - [powlax_academy_workout_collections, powlax_academy_workout_items, skills_academy_drills]
  - [Start/complete steps, award points]

- `/academy/progress`
  - [User progress, streaks, badges]
  - [user_workout_progress, badges, points_ledger]
  - [Share achievement]

- `/academy/leaderboard`
  - [Leaderboards by team/position]
  - [leaderboard (view/table), points_ledger]
  - [Filter scope]

### Resources
- `/resources`
  - [Resource hub]
  - [—]
  - [Navigate to sub-sections]

- `/resources/coaching-kits`
  - [Curated kits of strategies/drills/PDFs]
  - [coaching_kits, powlax_strategies, powlax_drills]
  - [Open kit, assign to team]

- `/resources/drill-library`
  - [Drill list/grid, filters, strategy badges]
  - [powlax_drills, strategies]
  - [Open drill, add to practice]

- `/resources/parent-guides`
  - [Guides list]
  - [parent_guides (future)]
  - [Open guide]

### Community
- `/community/forums`
  - [Forum index]
  - [forums (future)]
  - [Open forum]

- `/community/messages`
  - [Messages (future)]
  - [—]
  - [Send/receive]

### Profile
- `/profile/settings`
  - [Account settings, role info]
  - [users]
  - [Update profile]

---

## Core Data Flows

- Drill → Strategy → Practice Plan
  - Coaches browse `powlax_drills` with strategy tags → add to `practice_plans_collaborative`.

- Practice Plan → Player View → Academy Training
  - Players view team plan (read-only) → complete drills/workouts in Academy → `user_workout_progress` and `points_ledger` updated.

- Skills Academy Data Ingestion
  - From `docs/EXACT_DATA_STRUCTURE_GUIDE.md` JSON: insert into `powlax_academy_workout_collections` and `powlax_academy_workout_items`; title matching links to `skills_academy_drills`.
  - Wall Ball CSVs → `wall_ball_drill_catalog` and `wall_ball_workout_system` with `drill_sequence` JSONB.

- Entitlements and Gating
  - MemberPress → `user_subscriptions` → `membership_entitlements` (derived) → set `teams.subscription_tier` and gate Team HQ sections.

---

## Minimal Component Inventory (shared)

- Navigation: Bottom/Sidebar
- DrillCard, StrategyCard, WorkoutCard
- PracticePlanBuilder (timeline + library)
- ProgressBar, StreakTracker, BadgeGrid, LeaderboardTable
- TeamSelector, ChildSelector
- VideoPlayer (Vimeo wrapper)

---

## Build Notes

- Keep routes stable and entitlement-aware; avoid duplications.
- Context switching (team/child) must update all route data queries.
- All “Assign” actions create links that appear in both Team HQ and Player Academy views.


