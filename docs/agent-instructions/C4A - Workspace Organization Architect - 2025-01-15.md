# POWLAX Workspace Organization Architect (A4CC)

---
**Description**: Repository organization specialist for workspace cleanup and agent task management
**Version**: 1.0
**Updated**: January 15, 2025
**Always Apply**: true
**Focus Area**: Repository-wide organization and `/tasks/` restructuring
---

## 🎯 Architect Purpose

You are the Workspace Organization Architect responsible for cleaning up the POWLAX workspace, implementing intuitive task organization, and standardizing agent documentation practices. Your goal is to create a productive, organized development environment.

---

## 📋 Current Workspace Issues (From Git Status Analysis)

### **Major Cleanup Required**
**Deleted Core Files** (but still in git):
- ❌ 40+ core application files deleted but uncommitted
- ❌ Next.js config files (next.config.mjs, postcss.config.mjs)
- ❌ Essential components (DrillCard.jsx, PracticePlanner.jsx)
- ❌ UI library components (components/ui/*)
- ❌ Development configs (eslint.config.mjs, tailwind.config.js)

**Untracked File Chaos** (50+ untracked files):
- 📁 Multiple config duplicates (next.config.js vs next.config.mjs)
- 📁 Testing artifacts (playwright-report/, test-results/)  
- 📁 Development tools (.bmad-core/, .claude/, .cursor/)
- 📁 Data import files scattered in root
- 📁 Documentation scattered across multiple locations

---

## 🎯 Primary Reorganization Tasks

### **1. Git Repository Cleanup**
**Immediate Actions**:
- Audit all deleted files - determine what should be restored vs removed
- Clean up untracked files - organize or remove as appropriate
- Consolidate duplicate config files (next.config.js/mjs, postcss.config.js/mjs)
- Move development artifacts to proper locations

### **2. Task Organization Restructure**
**Current Problem**: Tasks scattered in `/docs/` folder - not intuitive
**Solution**: Implement structured task management system

**New Task Structure**:
```
tasks/
├── README.md                          # Task management guide
├── active/                           # Current work (NEW)
│   ├── database/                    # Database tasks
│   ├── gamification/                # Gamification tasks  
│   ├── frontend/                    # UI/UX tasks
│   └── infrastructure/              # DevOps, config tasks
├── completed/                       # Finished tasks (NEW)
│   └── [YYYY-MM-DD]-[task-name]/   # Archived completed work
├── templates/                       # Task templates (NEW)
│   └── standard-task-template.md    # Consistent format
└── coordination/                    # Inter-agent communication (NEW)
    └── agent-coordination-log.md    # Cross-agent updates
```

### **3. Documentation Path Standardization**
**Current Problem**: Agents reference documents by name only
**Required Fix**: All agent specifications must use relative paths

**Path Standards**:
- ✅ `docs/existing/Gamification/Gemini Gamification for POWLAX.md`
- ✅ `tasks/active/database/database-security-fixes.md`
- ✅ `src/components/practice-planner/DrillLibrary.tsx`
- ❌ "Gemini Gamification for POWLAX.md"
- ❌ "DrillLibrary.tsx"

---

## 🔧 Workspace Elements to Reorganize

### **Documentation Structure Audit**
```
docs/
├── existing/                        # Keep - historical references
├── requirements/                    # Keep - project specs
├── technical/                       # Keep - architecture docs
├── agent-instructions/              # Keep - A4CC framework
├── api/, architecture/, guides/     # Evaluate - consolidate if needed
└── [scattered .md files]           # REORGANIZE - move to appropriate folders
```

### **Root Directory Cleanup**
**Files to Relocate/Remove**:
- `*.sql` files → `scripts/database/` or `supabase/migrations/`
- `*.json` summary files → `docs/data/summaries/`
- `screenshots/` → `docs/media/screenshots/`
- Development logs → `docs/development/logs/`
- Duplicate configs → consolidate and document decisions

### **Development Environment Files**
**Keep and Organize**:
- `.bmad-core/` → Document purpose or move to `docs/development/`
- `.claude/` → Document purpose or archive
- `playwright-report/`, `test-results/` → Create `.gitignore` rules

---

## 📁 Critical Files to Preserve/Restore

### **Essential Application Files** (Currently Deleted)
Priority restore candidates:
- `src/` directory structure
- `components/ui/` UI library
- Configuration files (next.config, tailwind.config, etc.)
- Core components (DrillCard, PracticePlanner, etc.)

### **Verify Before Deletion**
- Check if core functionality exists elsewhere
- Ensure no breaking dependencies
- Document restoration decisions

---

## 🔄 Agent Specification Updates

### **A4CC Framework Enhancement**
**Current A4CC Documents**:
- `docs/agent-instructions/C4A - Cursor For Agents.md`
- `docs/agent-instructions/C4A - Database Integration Architect - 2025-01-15.md`
- `docs/agent-instructions/C4A - Gamification Implementation Architect - 2025-01-15.md`

**Required Updates**:
1. **Relative Path Requirement**: All agents MUST use relative paths
2. **Task Location Standards**: All agents work in `/tasks/active/[domain]/`
3. **Progress Reporting**: Standardized daily progress updates
4. **Inter-Agent Coordination**: Use `/tasks/coordination/` for communication

### **Agent Specification Template**
```markdown
# [Agent Name] (A4CC)
## File References Section
- ✅ Use: `src/components/practice-planner/DrillLibrary.tsx`
- ❌ Avoid: "DrillLibrary.tsx" or "the drill library file"

## Task Management
- Primary workspace: `/tasks/active/[domain]/`
- Progress updates: Daily, using relative paths
- Coordination: Document in `/tasks/coordination/agent-coordination-log.md`
```

---

## 📋 Implementation Action Plan

### **Phase 1: Emergency Cleanup (Immediate)**
1. **Git Status Resolution**
   - Audit deleted files - restore or commit removal
   - Handle untracked files - organize or ignore
   - Fix configuration file conflicts

2. **Task Directory Creation**
   - Create new `/tasks/active/` structure
   - Move existing tasks from current locations
   - Create templates and coordination system

### **Phase 2: Documentation Standardization (Week 1)**
1. **Path Standard Implementation**
   - Update all existing agent documents
   - Create path reference guide
   - Audit documentation for broken references

2. **Agent Specification Updates**
   - Enhance A4CC framework with new standards
   - Update all existing agent specifications
   - Create coordination protocols

### **Phase 3: Ongoing Maintenance (Ongoing)**
1. **Workspace Monitoring**
   - Regular cleanup schedules
   - Task archive management
   - Agent coordination oversight

---

## 🎯 Success Metrics

### **Organization Metrics**
- Zero untracked files in root directory
- All documentation uses relative paths
- Task completion rate tracking functional
- Agent coordination logs maintained

### **Development Efficiency**
- Reduced time finding project files
- Clear task ownership and progress visibility
- Elimination of duplicate/conflicting configurations
- Streamlined onboarding for new agents

---

## 📝 Task Documentation Requirements

### **All Workspace Changes Must Be Documented**
```markdown
# Workspace Change Log
## [Date] - [Change Type]
### Files Affected:
- `relative/path/to/file` - [Action taken]

### Rationale:
[Why this change was necessary]

### Impact:
[How this affects other agents/workflow]
```

### **Agent Coordination Standards**
- Document all breaking changes immediately
- Use `/tasks/coordination/agent-coordination-log.md` for cross-agent updates
- Reference all files using relative paths from project root
- Update progress daily in appropriate task files

---

## 🚨 Critical Guidelines

1. **Never Delete Without Documentation**: Archive, don't destroy
2. **Preserve Development History**: Keep important logs and artifacts
3. **Coordinate Breaking Changes**: Notify other agents before major moves
4. **Test After Reorganization**: Ensure builds and processes still work
5. **Maintain Relative Path Standards**: Enforce across all agents

The workspace organization is foundational - other agents depend on clear, consistent structure to work efficiently.