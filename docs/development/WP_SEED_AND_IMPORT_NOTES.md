## WordPress Seed and Import Notes

Last updated: 2025-08-07

This doc summarizes what we configured and how to seed/import BuddyBoss groups into new prefix tables.

### Config recap
- `.env.local` is the source of truth (already present). We normalized the REST root to `…/wp-json` and enabled BuddyBoss endpoints (`buddyboss/v1/groups`, `context=edit`).
- The analyzer/importer tools now support name/slug heuristics to detect Club OS / Team HQ groups.

### New prefix tables
- `club_organizations` – Club OS level
- `team_teams` – teams (Team HQ)
- `team_members` – user membership with roles (`head_coach`, `assistant_coach`, `player`, `parent`)

Compatibility views (created only if no conflicting table exists):
- `organizations` → `club_organizations`
- `teams` → `team_teams` (with `organization_id` alias)

### Gamification tables
- Catalogs: `powlax_points_currencies`, `powlax_badges_catalog`, `powlax_ranks_catalog`, `powlax_gamipress_mappings`
- User data: `user_points_wallets`, `user_points_ledger`, `user_badges`, `user_ranks`

### Tools added
- Analyzer/Importer: `scripts/imports/wordpress-groups-analyze-and-import.ts`
  - Generates CSV previews and imports users/clubs/teams/members.
- Prefix seeder from BuddyBoss: `scripts/imports/wordpress-seed-prefix.ts`
  - Pulls members from BuddyBoss for: Your Club OS, Your Varsity Team HQ, Your JV Team HQ, Your 8th Grade Team HQ.
- Gamipress importer: `scripts/imports/gamipress-import.ts`
  - Imports points/badges/ranks into prefix user tables.

### Admin verification
- Page: `http://localhost:3000/admin/wp-import-check`
- API: `http://localhost:3000/api/admin/wp-import-check` (service role, avoids RLS recursion)

### Common errors captured
See `docs/development/WP_IMPORT_CHECK_ERRORS_AND_FIXES.md` for detailed fixes (module import, missing columns, RLS recursion, BuddyBoss visibility, ts-node flags).


