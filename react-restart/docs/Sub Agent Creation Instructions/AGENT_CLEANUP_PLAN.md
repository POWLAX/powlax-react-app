# POWLAX Agent System Cleanup Plan

*Created: 2025-01-16*  
*Purpose: Clean transition to POWLAX Claude Code sub agent system*

---

## ✅ **CONFIRMED: POWLAX SUB AGENTS INSTALLED**

**Active POWLAX Sub Agents (5 total):**
```bash
/Users/patrickchapla/.claude/agents/powlax-controller/powlax-master-controller.md
/Users/patrickchapla/.claude/agents/powlax-design/powlax-ux-researcher.md
/Users/patrickchapla/.claude/agents/powlax-engineering/powlax-frontend-developer.md
/Users/patrickchapla/.claude/agents/powlax-engineering/powlax-backend-architect.md
/Users/patrickchapla/.claude/agents/powlax-product/powlax-sprint-prioritizer.md
```

**Status**: ✅ All agents installed and ready for immediate use

---

## 🧹 **CLEANUP ACTIONS REQUIRED**

### **Step 1: Archive Old A4CC Agents**
```bash
# Move A4CC agents to archive
mkdir -p docs/agent-instructions/ARCHIVED_A4CC_AGENTS
mv docs/agent-instructions/A4CC*.md docs/agent-instructions/ARCHIVED_A4CC_AGENTS/
mv docs/agent-instructions/C4A*.md docs/agent-instructions/ARCHIVED_A4CC_AGENTS/
```

**Files to Archive:**
- A4CC - Practice Planner UI Enhancement Architect.md
- A4CC - Skills Academy Player Interface Enhancement.md  
- A4CC - Team HQ Club OS Management Architect.md
- A4CC - MemberPress Integration Architect.md
- A4CC - Admin Content Management Architect.md
- All other A4CC and C4A agent files (25+ total)

### **Step 2: Archive BMad Agents**
```bash
# Move BMad agents to archive  
mkdir -p .bmad-core/ARCHIVED_BMAD_AGENTS
mv .bmad-core/agents/*.md .bmad-core/ARCHIVED_BMAD_AGENTS/
```

**BMad Files to Archive:**
- bmad-orchestrator.md
- dev.md (James)
- pm.md, architect.md, qa.md, ux-expert.md
- writer.md, analyst.md, marketer.md, consultant.md
- All agent team configurations

### **Step 3: Update Documentation**
```bash
# Create redirect documentation
echo "# DEPRECATED: Use POWLAX Claude Code Sub Agents
See: docs/Sub Agent Creation Instructions/POWLAX_CLAUDE_CODE_SETUP_GUIDE.md
Active system: powlax-master-controller with specialized sub agents" > docs/agent-instructions/README.md

echo "# DEPRECATED: Use POWLAX Claude Code Sub Agents  
See: docs/Sub Agent Creation Instructions/POWLAX_CLAUDE_CODE_SETUP_GUIDE.md" > .bmad-core/README.md
```

### **Step 4: Clean Up Task Structure**
```bash
# Archive old task management
mkdir -p tasks/ARCHIVED_OLD_SYSTEM
mv tasks/active/database tasks/ARCHIVED_OLD_SYSTEM/
mv tasks/active/gamification tasks/ARCHIVED_OLD_SYSTEM/
mv tasks/active/frontend tasks/ARCHIVED_OLD_SYSTEM/
mv tasks/active/infrastructure tasks/ARCHIVED_OLD_SYSTEM/
```

---

## 📋 **EXECUTION CHECKLIST**

### **Before Cleanup:**
- [ ] Confirm POWLAX sub agents working properly
- [ ] Test master controller with simple request
- [ ] Backup current system state

### **During Cleanup:**
- [ ] Archive A4CC agents (25+ files)
- [ ] Archive BMad agents (10+ files)  
- [ ] Update documentation with redirects
- [ ] Clean task directory structure

### **After Cleanup:**
- [ ] Test POWLAX sub agent system
- [ ] Verify no broken references
- [ ] Update development workflow documentation

---

## 🚨 **CRITICAL REMINDERS**

### **DO NOT DELETE:**
- **Keep**: docs/development/ (system architecture documentation)
- **Keep**: docs/Sub Agent Creation Instructions/ (current system)
- **Keep**: All context files with POWLAX knowledge
- **Keep**: Database and technical documentation

### **SAFE TO ARCHIVE:**
- ✅ A4CC agent instruction files
- ✅ BMad agent definition files  
- ✅ Old task management structures
- ✅ Agent communication protocols (replaced by sub agents)

---

## 🎯 **POST-CLEANUP WORKFLOW**

### **New Development Process:**
1. **Single Contact Point**: Use `powlax-master-controller` only
2. **No Framework Switching**: Master controller handles all orchestration
3. **Automatic Context**: All sub agents load POWLAX context automatically
4. **Quality Integration**: Built-in testing and mobile optimization

### **Command Examples:**
```
"Please verify your POWLAX context and show available sub agents"
"I want to optimize the practice planner mobile interface"  
"Build a new Skills Academy workout selector with age-appropriate design"
```

---

**Result**: Clean, streamlined development environment with single powerful agent system replacing multiple complex frameworks.