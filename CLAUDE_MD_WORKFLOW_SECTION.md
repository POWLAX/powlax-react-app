# Section to Add to CLAUDE.md

## 🎯 MANDATORY: Interactive Development Workflow

**EVERY CHANGE to POWLAX must follow this guided workflow system.**

### **How It Works**
When you express any development need, Claude will:
1. **Analyze** your request against 122 component + 40 page contracts
2. **Create dual todo lists** - one for you, one for Claude/agents
3. **Guide you step-by-step** through implementation
4. **Track progress** in real-time
5. **Update contracts** to maintain truth

### **Activation Phrases**
Say any of these to start:
- "I want to change [component/page]"
- "Help me fix [issue]"  
- "Guide me through [task]"
- "I want to build an MVP with..."
- "Let's work on [feature]"

### **Example Workflow**
```
You: "I want to fix the PlayerDashboard mock data"

Claude: 
## 📊 Change Analysis for: Fix PlayerDashboard Mock Data

**Affected Components:**
- [ ] PlayerDashboard → contracts/components/dashboards/component-playerdashboard-contract.yaml
- [ ] PointCounter → contracts/components/skills-academy/component-pointcounter-contract.yaml

**YOUR TODO LIST:**
- [ ] Review current contract
- [ ] Approve database connections
- [ ] Test after implementation
- [ ] Confirm completion

**CLAUDE'S TODO LIST:**
- [ ] Remove mock data
- [ ] Connect to user_points_wallets
- [ ] Add loading states
- [ ] Update contract

**Timeline:** 2 hours
**Proceed?** [Yes/No]
```

### **Workflow Documents**
- **Master Contract:** `contracts/active/interactive-development-workflow-contract.yaml`
- **Enhanced Commands:** `.claude/commands/contracts.md`
- **Component Contracts:** `contracts/components/[category]/`
- **Page Contracts:** `contracts/pages/[category]/`

### **Database Verification**
Claude automatically verifies Supabase tables for every change:
```sql
-- Automatic checks for each referenced table
SELECT table_name, COUNT(*) FROM {table} 
```

If MCP not available, falls back to:
```bash
npx tsx scripts/check-actual-tables.ts
```

### **MVP Planning Mode**
For MVP scoping, say: "I want to build an MVP with 6-7 pages"

Claude will:
1. Show all 40+ current pages
2. Recommend which to keep/hide
3. Identify all blockers
4. Create prioritized fix list
5. Track progress to MVP

### **Contract Enhancement Pattern**
Changes are tracked IN the existing contracts:
```yaml
# Added to component contract
enhancementRequest:
  id: "ER-2025-01-15-001"
  requestedBy: "User"
  
  changes:
    from: "100% mock data"
    to: "Connected to database"
    
  acceptanceCriteria:
    - [ ] Mock data removed
    - [ ] Real data displayed
    - [ ] Tests pass
```

### **Progress Tracking**
Real-time progress for every change:
```
## 🎯 Current Task Progress
Fix PlayerDashboard: 45% complete

- [x] Contract analysis (10 min)
- [x] Database verified (5 min)  
- [ ] Implementation (45 min) ← IN PROGRESS
- [ ] Testing (15 min)
- [ ] Contract update (10 min)

Sub-agent Status:
- Agent 1: Removing mock data ⏳
- Agent 2: Connecting database ⏳
```

### **Validation Requirements**
Every change must pass:
```bash
npm run lint        # ✓ Code quality
npm run typecheck   # ✓ Type safety
npm run build       # ✓ Production build
# Browser testing   # ✓ Functionality
```

### **Workflow Preferences**
```yaml
# Your preferences (set these)
workflowPreferences:
  alwaysCreateTodos: true
  requireDatabaseCheck: true
  autoDeploySubAgents: false  # Ask first
  updateContractsAfter: true
  
mvpConfiguration:
  targetPages: 7
  hideNonMVPPages: true
  prioritizeMVPBlockers: true
```

### **Quick Status Commands**
```bash
# Find all MVP blockers
grep -l "MVP Blocker" contracts/components/**/*.yaml

# Check mock data components  
grep -l "mockDataUsage" contracts/components/**/*.yaml

# View recent changes
grep -A5 "enhancementRequest" contracts/**/*.yaml
```

### **⚠️ IMPORTANT**
- **NEVER** make changes without following this workflow
- **ALWAYS** let Claude analyze the request first
- **CONTRACTS** are your source of truth - they get updated with each change
- **DATABASE** verification happens automatically
- **MVP FOCUS** - all changes prioritize MVP readiness

---

**This workflow ensures every change is tracked, validated, and documented while maintaining the contract system as the source of truth.**