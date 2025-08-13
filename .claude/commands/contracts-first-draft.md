# Contract-Based Development Reference

This command provides quick access to POWLAX contract-based development patterns for Claude-to-Claude sub-agent workflows.

## Active Contracts Directory
- **Location:** `contracts/active/`
- **Database Truth:** `contracts/active/database-truth-sync-002.yaml` (61 actual tables)
- **Auth System:** `contracts/active/authentication-enhancement-system-001.yaml`

## Component Contracts (MASTER_CONTRACTs)
### Skills Academy
- **Contract:** `src/components/skills-academy/MASTER_CONTRACT.md`
- **Context:** `src/components/skills-academy/claude.md`
- **Navigation:** `src/components/skills-academy/README.md`

### Practice Planner
- **Contract:** `src/components/practice-planner/MASTER_CONTRACT.md`
- **Context:** `src/components/practice-planner/claude.md`
- **Navigation:** `src/components/practice-planner/README.md`

### Teams Management
- **Contract:** `src/components/teams/MASTER_CONTRACT.md`
- **Context:** `src/components/teams/claude.md`

### UI Components
- **General:** `src/components/claude.md`
- **Shadcn/UI:** `src/components/ui/claude.md`

## Page Contracts
- **Core Pages:** `contracts/pages/`
- **Admin Pages:** `contracts/pages/admin/`
- **Skills Academy:** `contracts/pages/skills-academy/`
- **Teams Pages:** `contracts/pages/teams/`

## Sub-Agent Workflow Pattern
```javascript
// ALWAYS use general-purpose agents with specific contracts
Task({
  subagent_type: "general-purpose",
  description: "Implement [specific feature]",
  prompt: `
    Follow the contract in [contract file path].
    
    Key requirements:
    1. Use actual database tables from database-truth-sync-002.yaml
    2. No mock data - production ready only
    3. Follow component-specific MASTER_CONTRACT
    4. Validate with: npm run lint && npm run typecheck && npm run build
    5. Keep dev server running on port 3000
    
    Contract details: [specific contract requirements]
  `
})
```

## Contract Structure Template
Contracts typically include:
1. **Purpose & Scope** - What the component/page does
2. **Current State** - What exists now
3. **Enhancement Requirements** - What needs to be built
4. **Database Integration** - Which tables to use (from database-truth-sync-002.yaml)
5. **Component Dependencies** - Related components and their contracts
6. **Success Criteria** - How to verify completion

## Key Principles
1. **NO MOCK DATA** - Production ready only, use (MOCK) prefix if test data needed
2. **Database Truth** - Always reference `database-truth-sync-002.yaml`
3. **Contract-Driven** - Follow contracts exactly, no improvisation
4. **Simple Agents** - Use general-purpose agents, avoid complex orchestration
5. **Server Running** - Always keep dev server on port 3000

## Quick Contract Lookup Commands
- View all active contracts: `ls contracts/active/`
- Find component contracts: `find . -name "MASTER_CONTRACT.md"`
- Check database truth: `cat contracts/active/database-truth-sync-002.yaml`

## Contract Validation Checklist
- [ ] Read CLAUDE.md first
- [ ] Read AI_FRAMEWORK_ERROR_PREVENTION.md
- [ ] Read database-truth-sync-002.yaml
- [ ] Find specific contract in contracts/active/
- [ ] Read component MASTER_CONTRACT if applicable
- [ ] Start dev server: `npm run dev`
- [ ] Follow contract exactly
- [ ] Validate: `npm run lint && npm run typecheck && npm run build`
- [ ] Leave server running for review