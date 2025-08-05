# A4CC Agent Specification Standards Template

## 📁 File References Section (REQUIRED FOR ALL AGENTS)

### **✅ CORRECT Path References**
```markdown
- `src/components/practice-planner/DrillLibrary.tsx`
- `docs/existing/Gamification/Gemini Gamification for POWLAX.md`
- `tasks/active/database/schema-updates.md`
- `supabase/migrations/001_staging_tables.sql`
```

### **❌ AVOID These References**
```markdown
- "DrillLibrary.tsx"
- "the gamification document"  
- "database task file"
- "migration file"
```

## 📋 Task Management (REQUIRED FOR ALL AGENTS)

### **Primary Workspace**
- All active work MUST happen in: `/tasks/active/[domain]/`
- Domain-specific directories: `database/`, `gamification/`, `frontend/`, `infrastructure/`

### **Task Creation**
1. Copy template from `/tasks/templates/standard-task-template.md`
2. Place in appropriate `/tasks/active/[domain]/` directory
3. Update with specific file references using relative paths
4. Follow progress reporting standards

### **Task Completion**
1. Complete task work with relative path documentation
2. Create completion report using `/tasks/templates/completion-report-template.md`
3. Move to `/tasks/completed/[YYYY-MM-DD]-[task-name]/`
4. Update agent coordination log

## 📊 Progress Reporting (REQUIRED FOR ALL AGENTS)

### **Daily Updates**
```markdown
### **[YYYY-MM-DD] - [Agent Name]**
- ✅ Completed: [Specific accomplishment with file paths]
- 🔧 In Progress: [Current work with file references]
- ⏭️ Next: [Planned next steps with target files]
- 🚨 Blockers: [Any impediments requiring coordination]
```

### **File Change Documentation**
```markdown
**Files Modified Today**:
- `src/components/gamification/BadgeSystem.tsx` - Added difficulty scoring
- `supabase/migrations/005_badge_difficulty.sql` - Database schema updates
- `tasks/active/gamification/phase-1-progress.md` - Updated progress tracking
```

## 🤝 Agent Coordination (REQUIRED FOR ALL AGENTS)

### **Breaking Changes Communication**
- **IMMEDIATELY** update `/tasks/coordination/agent-coordination-log.md`
- Use standardized entry format with relative paths
- Tag affected agents specifically
- Include timeline for changes if applicable

### **Coordination Protocol**
```markdown
### **[YYYY-MM-DD] - [Brief Title]**
**From**: [Agent Name]
**To**: [Specific agents or "All Agents"]
**Type**: [Breaking Change/Update/Dependency/Question]

**Files Affected**:
- `relative/path/to/file.tsx` - [Change description]

**Action Required**:
- [ ] [Specific action for other agents]
```

### **Daily Coordination Check**
- Check `/tasks/coordination/agent-coordination-log.md` for updates
- Update agent status board when starting/completing work
- Communicate dependencies and blockers immediately

## 🚨 Compliance Requirements

### **All Agent Specifications MUST Include**:
1. **File References Section** with relative path examples
2. **Task Management Section** with domain-specific workspace
3. **Progress Reporting Section** with daily update format
4. **Agent Coordination Section** with communication protocols

### **All Agent Work MUST**:
1. Use relative paths from project root in ALL documentation
2. Work exclusively in `/tasks/active/[domain]/` directories
3. Update coordination log for breaking changes
4. Follow standardized progress reporting format

---

**Template Version**: 1.0  
**Last Updated**: January 15, 2025  
**Maintained By**: Workspace Organization Architect