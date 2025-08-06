# POWLAX Git Branching Strategy

*Created: 2025-01-16*  
*Purpose: Clean transition from BMad/A4CC to POWLAX Sub Agent system*

---

## 🎯 **BRANCHING STRATEGY OVERVIEW**

We'll create **3 branches** to properly document the transition and preserve all work:

1. **`legacy-bmad-a4cc`** - Current state (BMad + A4CC agents, all current changes)
2. **`powlax-sub-agent-system`** - Clean restart package implementation  
3. **`main`** - Remains untouched until we're ready to merge

---

## 📋 **STEP-BY-STEP EXECUTION PLAN**

### **Phase 1: Preserve Current State as Legacy Branch**

**Execute these commands from the root directory:**

```bash
# 1. Create and switch to legacy branch
git checkout -b legacy-bmad-a4cc

# 2. Add all current changes (modified + untracked)
git add .

# 3. Commit current state with documentation
git commit -m "LEGACY: Complete BMad + A4CC agent system

- BMad agents: Orchestrator, Developer, specialized agents
- A4CC agents: 25+ specialized architects and builders
- Complete development documentation
- Agent coordination systems
- All current POWLAX features and components

This branch preserves the full BMad/A4CC system for reference.
Future development will use POWLAX Sub Agent system."

# 4. Push legacy branch to origin
git push -u origin legacy-bmad-a4cc

# 5. Return to main (clean state)
git checkout main
```

### **Phase 2: Create Clean Sub Agent System Branch**

```bash
# 6. Create new branch from main (clean state)
git checkout -b powlax-sub-agent-system

# 7. Copy restart package contents to root
cp -r react-restart/* .
cp -r react-restart/.* . 2>/dev/null || true

# 8. Remove the restart folder (now copied to root)
rm -rf react-restart

# 9. Stage all restart package files
git add .

# 10. Commit the clean sub agent system
git commit -m "POWLAX SUB AGENT SYSTEM: Complete fresh start

- 5 specialized POWLAX sub agents (ready for Claude Code)
- Complete Next.js application source code
- Essential configuration files (package.json, tailwind, etc.)
- Comprehensive documentation system
- Database migrations and scripts
- Testing infrastructure
- Setup guides and deployment instructions

Total: 442 files, 28MB, ready for immediate deployment.
Eliminates BMad/A4CC complexity in favor of coordinated sub agents."

# 11. Push new sub agent system branch
git push -u origin powlax-sub-agent-system
```

### **Phase 3: Verification & Documentation**

```bash
# 12. Verify branches exist
git branch -a

# 13. Check we're on the right branch
git status

# 14. Verify package contents
ls -la
find . -name "claude-agents" -type d
```

---

## 🏗️ **BRANCH PURPOSES & USAGE**

### **`main` Branch**
- **Purpose**: Production-ready code only
- **Status**: Remains clean and untouched
- **Usage**: Final merge destination when sub agent system is proven

### **`legacy-bmad-a4cc` Branch**  
- **Purpose**: Historical reference and emergency fallback
- **Contains**: Complete BMad + A4CC agent system
- **Usage**: Reference documentation, troubleshooting, feature comparison

### **`powlax-sub-agent-system` Branch**
- **Purpose**: Active development with POWLAX sub agents
- **Contains**: Clean restart package + sub agent system
- **Usage**: Primary development branch, coordination with Claude Code sub agents

---

## 📊 **BRANCH COMPARISON**

| Feature | `main` | `legacy-bmad-a4cc` | `powlax-sub-agent-system` |
|---------|--------|--------------------|-----------------------|
| **State** | Clean baseline | Current complex system | Fresh optimized start |
| **Agent System** | None | BMad + A4CC (25+ agents) | POWLAX Sub Agents (5) |
| **Documentation** | Basic | Extensive but complex | Streamlined and focused |
| **Dependencies** | Stable | Many agent dependencies | Clean, minimal |
| **Context Management** | None | Fragmented across agents | Unified in Master Controller |
| **Development Approach** | Manual | Multi-agent coordination | Single point coordination |

---

## 🚀 **IMMEDIATE NEXT STEPS AFTER BRANCHING**

### **Step 1: Verify Sub Agent System**
```bash
# Switch to sub agent branch
git checkout powlax-sub-agent-system

# Install dependencies
npm install

# Verify build
npm run build

# Start development
npm run dev
```

### **Step 2: Install POWLAX Sub Agents**
```bash
# Install all sub agents to Claude Code
cp -r claude-agents/* ~/.claude/agents/

# Verify installation
find ~/.claude/agents -name "powlax*" -type d
```

### **Step 3: Activate Master Controller**
In Claude Code, send this prompt:
```
I've set up the POWLAX sub agent system on a clean new branch. Please verify your complete POWLAX context and show me which specialized sub agents are available.

Then coordinate your sub agents to analyze and optimize all existing pages, creating new "new-" versions optimized for mobile field usage and coaching workflows.

We've successfully transitioned from the complex BMad/A4CC system to your coordinated sub agent approach.
```

---

## 🎯 **SUCCESS CRITERIA**

### **Branching Complete When:**
- [ ] `legacy-bmad-a4cc` branch contains complete current state
- [ ] `powlax-sub-agent-system` branch contains clean restart package  
- [ ] `main` branch remains untouched and clean
- [ ] All branches pushed to origin
- [ ] POWLAX sub agents installed in Claude Code
- [ ] Development server runs on sub agent branch
- [ ] Master Controller responds with complete context

### **Development Ready When:**
- [ ] `npm run dev` works on sub agent branch
- [ ] All 5 POWLAX sub agents available in Claude Code
- [ ] Master Controller coordinates page optimization
- [ ] Quality gates pass (lint, build)
- [ ] Documentation accessible and current

---

## 📝 **BRANCH MERGE STRATEGY (FUTURE)**

### **When Sub Agent System Is Proven:**
```bash
# 1. Switch to main
git checkout main

# 2. Merge sub agent system (when ready)
git merge powlax-sub-agent-system

# 3. Update main branch
git push origin main

# 4. Archive legacy branch (keep for reference)
# (No action needed - just leave it available)
```

### **Emergency Rollback (If Needed):**
```bash
# Switch back to legacy system
git checkout legacy-bmad-a4cc

# Create working branch from legacy
git checkout -b legacy-hotfix

# Continue with BMad/A4CC agents if needed
```

---

## 🏆 **EXECUTION SUMMARY**

**This branching strategy provides:**
- ✅ **Complete preservation** of current BMad/A4CC work
- ✅ **Clean fresh start** with POWLAX sub agent system
- ✅ **Safe main branch** protection
- ✅ **Clear migration path** between systems
- ✅ **Emergency rollback** capability
- ✅ **Proper documentation** of transition

**Execute the commands above to implement this strategy and begin development with the POWLAX sub agent system!**