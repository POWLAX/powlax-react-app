## WP Import Check – Errors and Fixes Log

Status: Living document
Last updated: 2025-08-07

Purpose: Capture real errors encountered while wiring the WordPress → Supabase import and the `/admin/wp-import-check` page so other agents avoid repeats. This document is safe to share and reference in prompts. [[Note: .env.local exists; do not paste secrets.]]

---

### 1) Module not found: Can't resolve `@/lib/supabase-client`
- Symptom: Next build error when visiting `/admin/wp-import-check`.
- Cause: There is no `src/lib/supabase-client.ts`; the repo exposes `src/lib/supabase.ts` (client) and `src/lib/supabase-server.ts` (SSR).
- Fix: Use `import { supabase } from '@/lib/supabase'`.
- File: `src/app/(authenticated)/admin/wp-import-check/page.tsx`.

Notes: For server components, prefer `createServerClient` from `src/lib/supabase-server.ts`.

---

### 2) SQL error: column organizations.metadata does not exist
- Symptom: Red error text on `/admin/wp-import-check` when selecting `metadata`.
- Cause: Local schema didn’t have `metadata` JSONB column (migration not applied).
- Fix options:
  - Apply `supabase/migrations/050_wp_org_team_enhancements.sql`, or
  - Stop selecting non-existent columns (current page uses `id, name` only).

Recommendation: After running migrations, optionally re-enable showing `wp_group_id` by storing it in a mapping table or `metadata`.

---

### 3) RLS: "infinite recursion detected in policy for relation user_organization_roles"
- Symptom: Red error text on `/admin/wp-import-check`.
- Likely Cause: An RLS policy references a view/relation that loops back to the same table during evaluation.
- Immediate Workarounds:
  - Serve data via a server API route using the service role (admin-only diagnostic), or
  - Temporarily relax read policy for `organizations`/`teams` to `USING (true)` for authenticated while debugging.
- Proper Fix Guide:
  1. Inspect policies in `supabase/migrations/003_enhanced_security_policies.sql` and `004_*rls*`.
  2. Replace recursive references with non-recursive `EXISTS` subqueries anchored on `auth.uid()` and direct FKs.

---

### 4) BuddyBoss REST initially returned only community groups
- Causes & Fixes applied:
  - Normalized REST root to `…/wp-json` from `.env.local`.
  - Allowlisted BuddyBoss REST routes.
  - Used `buddyboss/v1/groups` with `context=edit` and status filters.
  - Handled `group_type` as object; added name/slug heuristics to detect `club_os`, `team_hq`.

Script: `scripts/imports/wordpress-groups-analyze-and-import.ts` (adds CSV previews to `tmp/wp_groups_preview` and logs to `wp_sync_log`).

---

### 5) Analyzer TypeScript issues
- TS2802 with Set iteration: run ts-node with compiler options `target: es2017`, `lib: ['es2020','dom']`.
- Missing `cross-fetch`: removed polyfill; rely on global fetch.

Example command:
```
npx --yes ts-node --compiler-options '{"target":"es2017","module":"commonjs","lib":["es2020","dom"]}' scripts/imports/wordpress-groups-analyze-and-import.ts analyze tmp/wp_groups_preview
```

---

### 6) Importer role mapping
- All imported members showed as `player` because current group members endpoint didn’t include admin/mod flags for those groups. When flags are present, script maps to `head_coach`/`assistant_coach` automatically.

---

## Ops Checklist
1) Ensure `.env.local` is set (WordPress + Supabase creds). Do not paste secrets into docs.
2) Run analyzer; validate CSVs in `tmp/wp_groups_preview`.
3) Import to Supabase; verify `organizations`, `teams`, `team_members`, `users`.
4) Visit `/admin/wp-import-check`; if RLS error appears, use server API or adjust RLS; then fix policies per section 3.


