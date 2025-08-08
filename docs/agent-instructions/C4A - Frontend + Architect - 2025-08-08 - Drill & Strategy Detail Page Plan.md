# C4A — Frontend + Architect — 2025-08-08 — Drill & Strategy Detail Page Plan

Contract: `drill-strategy-detail-page-001` → `contracts/active/drill-strategy-detail-page-001.yaml`
Goal: A real-data, well-designed detail page for drills and strategies, openable from dashboard search.

---

## Scope & Data Sources
- Types: `drill` → `powlax_drills`; `strategy` → `powlax_strategies`
- Relations (per `docs/EXACT_DATA_STRUCTURE_GUIDE.md` as available):
  - Drill: media/video URL(s), equipment, tags, related strategies
  - Strategy: video/diagram, related drills, tags

---

## IA & Layout (Mobile-first)
- Header/Hero: title, type badge, tags
- Media block: video if present; placeholder if missing
- Body:
  - For drill: description, coaching points/steps, equipment list
  - For strategy: overview, diagram/video, teaching notes
- Related panel: related strategies (on drill) or related drills (on strategy)
- Footer CTA:
  - Drill: “Add to Practice Plan” → opens planner with pre-selected drill
  - Strategy: “View Related Drills” → navigates to filtered library

---

## Routing & Links
- Route: `/(authenticated)/details/[type]/[id]`
- Dashboard search result → link target uses `[type]/[id]`
- Accept query `from=dashboard` to support analytics later (optional)

---

## Components & Hooks
- `src/app/(authenticated)/details/[type]/[id]/page.tsx`
- `src/components/details/DrillDetails.tsx`
- `src/components/details/StrategyDetails.tsx`
- `src/hooks/details/useDrillDetails.ts`
- `src/hooks/details/useStrategyDetails.ts`

Behavior:
- Fetch real entities and relations
- Fallback gracefully for missing media
- No auth-blocking calls prior to minimal render

---

## Quality Gates (apply universal gate)
- `npm run build:verify` must pass (lint/type/build)
- 0 console errors at runtime
- Mobile viewport verified at 375px
- Minimal Playwright spec hitting `details/drill/:id` and `details/strategy/:id`

---

## Test Plan (smokes first)
- E2E: `tests/e2e/details-page.spec.ts`
  - Visit drill detail with a known ID
  - Assert body visible and title present
  - Assert no console errors
  - Repeat for strategy

---

## Handoff Targets
- Dashboard search: ensure result items construct links as `/details/[type]/[id]`
- Practice Planner: handle CTA for adding drill

---

## Open Questions (for follow-up)
- Confirm exact fields to display for strategies (diagram vs video priority)
- Confirm the correct relation mapping keys for related items
- Provide a couple of stable IDs for seed records to use in E2E

---

Prepared for implementation under `drill-strategy-detail-page-001`.
