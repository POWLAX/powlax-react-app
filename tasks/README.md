# POWLAX Task Management System

## 🎯 Purpose
Organized task management system for POWLAX development with clear agent coordination and progress tracking.

## 📁 Directory Structure

### `/active/` - Current Work
- **`database/`** - Database schema, migrations, security fixes
- **`gamification/`** - Gamification system implementation
- **`frontend/`** - UI/UX components and features  
- **`infrastructure/`** - DevOps, configs, build processes

### `/completed/` - Finished Tasks
- **`[YYYY-MM-DD]-[task-name]/`** - Archived completed work
- Each folder contains completion report and final deliverables

### `/templates/` - Standard Templates
- **`standard-task-template.md`** - Consistent task format
- **`completion-report-template.md`** - Standard completion reporting

### `/coordination/` - Inter-Agent Communication
- **`agent-coordination-log.md`** - Cross-agent updates and notifications

## 🔧 Usage Guidelines

### For Agents
1. **Work Location**: Always work in `/tasks/active/[domain]/`
2. **File References**: Use relative paths from project root
3. **Progress Updates**: Update daily with specific file references
4. **Coordination**: Document breaking changes in coordination log

### For Task Management
1. **New Tasks**: Create in appropriate `/active/` subdirectory
2. **Task Completion**: Move to `/completed/` with date prefix
3. **Documentation**: Follow template standards consistently
4. **Archive Policy**: Keep completed tasks for 90 days minimum

## 📋 File Reference Standards

### ✅ CORRECT Path References
```markdown
- `src/components/practice-planner/DrillLibrary.tsx`
- `docs/existing/Gamification/Gemini Gamification for POWLAX.md`
- `tasks/active/database/schema-updates.md`
```

### ❌ AVOID These References
```markdown
- "DrillLibrary.tsx"
- "the gamification document"
- "database task file"
```

## 🚀 Quick Start

1. **Create New Task**: Copy template from `/templates/`
2. **Place in Active**: Move to appropriate `/active/` subdirectory
3. **Work and Update**: Update progress with relative paths
4. **Complete**: Move to `/completed/` with completion report

---

*Last Updated: January 15, 2025*
*Maintained by: Workspace Organization Architect*