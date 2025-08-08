# C4A — Master Controller + BMad — 2025-08-07 — Build Success Optimization Plan

Status: Proposed
Owner: Master Controller (POWLAX) coordinating with BMad Orchestrator
Scope: POWLAX agent system + BMad coordination; zero-build-fail workflow

---

## 1) Current System Snapshot (What Exists)
- POWLAX Master Controller: Contract-first orchestration, quality gates, session tracking
  - File: `claude-agents/powlax-controller/powlax-master-controller.md`
- Sub-Agents with self-checks:
  - Frontend Developer: JSX quote rules + mandatory build verification
    - `claude-agents/powlax-engineering/powlax-frontend-developer.md`
  - Backend Architect: DB/RLS focus + staged integration
    - `claude-agents/powlax-engineering/powlax-backend-architect.md`
  - QA/Test/Integration Specialists: Structured JSON reporting + quality gates
    - `claude-agents/powlax-quality/powlax-qa-specialist.md`
    - `claude-agents/powlax-testing/powlax-test-specialist.md`
    - `claude-agents/powlax-integration/powlax-integration-specialist.md`
- Coordination/Sign-off Protocols
  - `docs/agent-instructions/AGENT_SIGNOFF_PROTOCOL.md`
  - `docs/agent-instructions/AUTOMATED_AGENT_COORDINATION_SYSTEM_PLAN.md`
- Lint/Build Tooling
  - `package.json` scripts: `lint`, `build` (Next.js 14), Playwright present

Gaps noted in docs: missing `.bmad-core/protocols/server-management-protocol.md`; some BMad references live outside this repo.

---

## 2) Observed Failure Modes (Why builds break)
- JSX escaping mistakes in generated code (already mitigated in FE agent spec)
- Import path drift vs actual file locations (@/components/ui/*)
- Complex hooks/auth used too early during page bring-up
- Inconsistent agent handoffs without a build passing checkpoint
- Missing or skipped type-check/lint steps before commit/handoff

---

## 3) First‑Go Build Success Workflow (Single Source of Truth)
Enforced by Master Controller for every task, across agents:

1. Contract + Scope Confirmation
   - Verify contract in `/contracts/active/` or obtain approval first.
2. Minimal, Compilable Edit First
   - Start with a minimal component/page variant using mock data.
3. Pre-flight Static Checks (local, non-interactive)
   - `npm run lint` (no warnings) → `npm run typecheck` → `npm run build`
4. Page Smoke (without starting new servers)
   - If server is already running, use `curl` smoke on changed routes; never start a new server without explicit check/approval.
5. Targeted Tests
   - Run only relevant Playwright/spec tests for the changed area.
6. QA Gate Before Handoff
   - QA Specialist validates: build PASS, 0 lint/type errors, no console errors.
7. Sign-off Block + Links
   - Sub-agent includes required sign-off, paths touched, how to view locally.

Notes
- Servers: Always check existing status before starting any; request approval to start new. Aligns with user preference.

---

## 4) Minimal Tooling Changes (no codegen churn)
- Scripts (proposed additions; no auto-run):
  - `typecheck`: `tsc --noEmit`
  - `build:verify`: `npm run lint -- --max-warnings=0 && npm run typecheck && npm run build`
- Optional: add ESLint rule guardrails to flag escaped JSX quotes early (only if needed).

---

## 5) Agent Instruction Alignments (edits to existing specs)
- Master Controller
  - Enforce the 6-step gate above as non-bypassable prior to any handoff.
  - Log gate results in `tasks/coordination/active-work-sessions.md`.
- Frontend Developer
  - Keep JSX rules; explicitly require `build:verify` before marking complete.
  - Require import resolution check for `@/components/ui/*` before build.
- Backend Architect
  - Stage integration: mock → build → real data; forbid auth/hook coupling until page loads minimally.
  - Require `typecheck` for query/DTO changes.
- QA/Test/Integration
  - Accept work only if `build:verify` passed.
  - Run targeted E2E for affected route/component; attach results to sign-off JSON.

All align with existing docs; this formalizes the order and makes gates universal.

---

## 6) Coordination + Traceability
- Always update:
  - `tasks/coordination/active-work-sessions.md` (who’s active, what changed)
  - `tasks/coordination/agent-coordination-log.md` (breaking changes/dependencies)
- Use A4CC file references with correct relative paths in all agent outputs.

---

## 7) Rollout Plan (lightweight)
- Day 1: Add scripts to `package.json`; update Master Controller + FE/BE agents with the exact 6-step gate text; add short “How to run build gates” note to `MASTER_CONTROLLER_OPERATIONAL_GUIDE.md`.
- Day 2: QA/Test agents adopt “reject if gate not passed” policy; create a small Playwright smoke per critical routes if missing.
- Day 3+: Apply to current backlog (Practice Planner modals, Skills Academy pages) using minimal-first, then integrate.

---

## 8) Open Conflicts / Decision Requests
1) BMad vs POWLAX Orchestration
   - Should Master Controller be the only orchestrator for POWLAX tasks, with BMad acting only as a meta-entry? Or keep dual orchestration? Proposed: unify under POWLAX Master Controller; BMad delegates.  So, the BMad elements were used to build an understanding of what the ultimate goal is through their analysis and pm agents.  We then forked the MVP from that to build the new POWLAX Controller capabilities for faster development but wanted to keep the context from what was optimized in the BMad build as far as understanding.  The PRD was about half way finished when we had to move into building for timelines, so some of the PRD data is still incorrect, the brief is accurate. 
2) YOLO Mode vs User Preference on Servers
   - Several agents mention “YOLO: run build/test” while user prefers no auto server start. Confirm: builds/tests are OK to run automatically, but never start/stop servers without explicit check/approval?  Build tests are fine to run automatically, servers never start or stop without approval.  Most of the time I have the server running already and the agents checking helps them hop in and out easily.  If the server is on, there should be no turning it off unless I say to. 
3) Missing `.bmad-core` Protocol Files
   - Agents reference `.bmad-core/protocols/server-management-protocol.md` which is not in this repo. Where should these live? Import into `docs/agent-instructions/` or link to external location?  I needed the context from the BMad agents, not the functionality.  I would love to be able to call the BMad agents from the POWLAX Master Controller if there is a function they would serve that the POWLAX Controller Agents do not currently cover, but optimally, I would like to use the POWLAX Master Controller system with the correct context.
4) Mandatory Sign-off Blocks
   - Enforce sign-off on every sub-agent response, or allow exceptions for brief info-only replies? Proposed: enforce for any response that changes files or requests handoff. Sign off for sub-agent responses should be done by the POWLAX Master Controller.  It should have the necessary context to deploy.  If it doesn't, we need to work on the conflicting context. 
5) Lint Severity Policy
   - Treat warnings as errors (`--max-warnings=0`) for frontend/Next lint? Proposed: yes, to guarantee first‑go builds.  Yes.

---

## 9) Acceptance Criteria (definition of success)
- 100% of agent handoffs include evidence of: build PASS, 0 lint, 0 type errors.
- No new pages/components merged without minimal-first render verification.
- Import path errors reduced to zero in 7 days.
- Practice Planner and Skills Academy routes pass smoke tests consistently.

---

## 10) Quick Reference
- Controller: `claude-agents/powlax-controller/powlax-master-controller.md`
- FE Agent: `claude-agents/powlax-engineering/powlax-frontend-developer.md`
- BE Agent: `claude-agents/powlax-engineering/powlax-backend-architect.md`
- QA/Test/Integration:
  - `claude-agents/powlax-quality/powlax-qa-specialist.md`
  - `claude-agents/powlax-testing/powlax-test-specialist.md`
  - `claude-agents/powlax-integration/powlax-integration-specialist.md`
- Sign-off: `docs/agent-instructions/AGENT_SIGNOFF_PROTOCOL.md`
- Automation Plan: `docs/agent-instructions/AUTOMATED_AGENT_COORDINATION_SYSTEM_PLAN.md`

---

Prepared for approval. Once approved, we’ll apply the minimal edits to agent files and `package.json`, then begin using the gates immediately.
