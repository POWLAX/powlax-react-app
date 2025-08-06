# POWLAX New Branch Development Workflow Guide

*Created: 2025-01-16*  
*Purpose: Complete guide for working with POWLAX Sub Agent system on new branch*

---

## 🚀 **HOW TO GET STARTED WORKING IN THE NEW BRANCH**

### **Step 1: Execute Branching Strategy**
```bash
# 1. Create and push legacy branch (preserve current work)
git checkout -b legacy-bmad-a4cc
git add .
git commit -m "LEGACY: Complete BMad + A4CC agent system"
git push -u origin legacy-bmad-a4cc

# 2. Return to main and create sub agent branch
git checkout main
git checkout -b powlax-sub-agent-system

# 3. Copy restart package and setup
cp -r react-restart/* .
rm -rf react-restart
git add .
git commit -m "POWLAX SUB AGENT SYSTEM: Complete fresh start implementation"
git push -u origin powlax-sub-agent-system
```

### **Step 2: Install POWLAX Sub Agents**
```bash
# Install sub agents to Claude Code
cp -r claude-agents/* ~/.claude/agents/

# Verify installation
find ~/.claude/agents -name "powlax*" -type d
```

### **Step 3: Setup Development Environment**
```bash
# Install dependencies
npm install

# Verify build
npm run build
npm run lint

# Start development
npm run dev
```

### **Step 4: Activate Master Controller**
In Claude Code, send this prompt:
```
I've set up the POWLAX sub agent system on the powlax-sub-agent-system branch. Please verify your complete POWLAX context and coordinate your specialized sub agents for development.

Ready to begin systematic feature development with coordinated AI expertise.
```

---

## 🏗️ **FEATURE BRANCHING STRATEGY - RECOMMENDATION**

### **RECOMMENDED: Hybrid Approach**

**Main Development Branch:**
- `powlax-sub-agent-system` - Primary development branch

**Feature-Specific Sub-Branches:**
- `powlax-sub-agent-system/feature-mobile-optimization`
- `powlax-sub-agent-system/feature-new-practice-planner` 
- `powlax-sub-agent-system/feature-age-band-interfaces`
- `powlax-sub-agent-system/feature-coaching-workflow-enhancement`

### **Why Hybrid Approach:**
✅ **Parallel Development** - Multiple features can be developed simultaneously  
✅ **Isolated Testing** - Each feature can be tested independently  
✅ **Risk Management** - Feature failures don't affect other development  
✅ **Sub Agent Specialization** - Different sub agents can work on different features  
✅ **Clean Integration** - Features merge back to main development branch systematically

### **Alternative: Single Branch (Not Recommended)**
❌ **Conflicts** - Multiple developers/agents working on same files  
❌ **Complex Rollback** - Can't easily remove problematic features  
❌ **Testing Complexity** - Hard to isolate feature-specific issues

---

## 📋 **SYSTEMATIC IMPLEMENTATION PLAN WITH SUB AGENTS**

### **Phase 1: Infrastructure & Setup (Week 1)**

**Master Controller Responsibilities:**
- Coordinate all sub agent activities
- Maintain system architecture documentation
- Handle quality gate integration
- Track feature development progress

**Sub Agent Assignments:**
```
powlax-backend-architect:
├── Database optimization review
├── API endpoint analysis
├── Performance baseline establishment
└── Mobile API optimization planning

powlax-frontend-developer:
├── Component architecture review
├── Shadcn/UI optimization opportunities
├── Mobile responsiveness audit
└── Build system optimization

powlax-ux-researcher:
├── Current user journey analysis
├── Age band interface assessment
├── Coaching workflow pain point identification
└── Mobile field usage research

powlax-sprint-prioritizer:
├── Feature priority matrix creation
├── Development timeline planning
├── Resource allocation optimization
└── ROI impact assessment
```

### **Phase 2: Feature Development Branches (Week 2-8)**

**Branch Structure:**
```
powlax-sub-agent-system/
├── feature-mobile-optimization/
│   ├── Assigned: powlax-frontend-developer + powlax-ux-researcher
│   ├── Focus: 375px+ screens, outdoor usage, touch optimization
│   └── Timeline: 2 weeks
├── feature-new-practice-planner/
│   ├── Assigned: powlax-frontend-developer + powlax-backend-architect  
│   ├── Focus: 15-minute planning workflow, drag-and-drop optimization
│   └── Timeline: 3 weeks
├── feature-age-band-interfaces/
│   ├── Assigned: powlax-ux-researcher + powlax-frontend-developer
│   ├── Focus: "Do it, Coach it, Own it" interface variations
│   └── Timeline: 2 weeks
└── feature-coaching-workflow-enhancement/
    ├── Assigned: All sub agents coordinated by Master Controller
    ├── Focus: Complete workflow optimization
    └── Timeline: 4 weeks
```

### **Phase 3: Integration & Testing (Week 9-10)**

**Master Controller Orchestrates:**
- Sequential feature merges back to main development branch
- Comprehensive integration testing
- Performance validation
- Mobile responsiveness final verification
- Deployment preparation

---

## 🎯 **7 TIPS INTEGRATION INTO POWLAX DEVELOPMENT**

### **Tip 1: Use Right Model for Right Task**
**Implementation:**
- **Master Controller** uses Claude 3.5 Sonnet for orchestration
- **Verify with different models** - Use GPT-4 to verify Claude sub agent code
- **Context size optimization** - Sub agents designed for 200k token contexts

### **Tip 2: Use AI to Build New Features**
**Implementation:**
- **New feature acceleration** - Sub agents coordinate for 10x-100x speedup
- **Complete system design** - Master Controller designs entire feature in minutes
- **Multiple angle testing** - Each sub agent provides different perspective

### **Tip 3: Large Codebase Rules**
**Implementation in POWLAX:**
```
✅ Small focused changes only (each sub agent handles specific scope)
✅ Avoid huge refactors (split into 4-6 stages across feature branches)
✅ Work in feature branches only (hybrid branching strategy)
✅ Never push directly to main (all changes via feature branches)
✅ Commit often (every 10-15 minutes with AI-generated commit messages)
```

### **Tip 4: Avoid Errors from Start**
**Implementation:**
- **Codebase analysis first** - Master Controller analyzes before changes
- **Comprehensive context** - All sub agents load complete POWLAX context
- **Human understanding requirement** - Feature documentation before implementation
- **Quality gates** - Automated linting, type checks, tests

### **Tip 5: Discipline Equals Speed**
**Implementation:**
- **Markdown planning files** - Feature.md required before any coding
- **20-minute planning rule** - Complete feature documentation before code
- **Vision clarity** - Exact inputs, outputs, constraints documented

### **Tip 6: Context Engineering**
**Implementation:**
- **Clear prompts** - Specific feature requirements in markdown
- **File tagging** - Relevant files identified for sub agents
- **Internal documentation** - Complete POWLAX context maintained
- **Scratch pad system** - Feature.md files serve as AI scratch pads

### **Tip 7: Human Decision Making**
**Implementation:**
- **Master Controller coordination** - But human retains final decisions
- **AI for understanding** - Use sub agents to explain complex issues
- **Upskilling focus** - Learn from sub agent expertise
- **Product decisions remain human** - Feature prioritization stays with user

---

## 🔧 **CLAUDE CODE HOOKS INTEGRATION**

### **Hook 1: Ultra Think (-u)**
```python
# append_ultrathink.py
if prompt.rstrip().endswith("-u"):
    print("Use the maximum amount of ultra think. Take all the time you need. "
          "It's much better if you do too much research and thinking than not enough.")
```

### **Hook 2: Log Analysis (-e)**
```python
# append_explain.py  
if prompt.rstrip().endswith("-e"):
    print("Above are the relevant logs - your job is to:\n"
          "Think harder about what these logs say\n"
          "Give me a simpler & short explanation\n" 
          "DO NOT JUMP TO CONCLUSIONS! DO NOT MAKE ASSUMPTIONS! QUIET YOUR EGO!\n"
          "AND ASSUME YOU KNOW NOTHING.\n"
          "Then, after you've explained the logs to me, suggest what the next step might be & why\n"
          "Answer in short")
```

### **Hook 3: Think Harder Default (-d)**
```python
# append_default.py
if prompt.rstrip().endswith("-d"):
    print("Think harder. Answer in short. Keep it simple.")
```

**Claude Code Settings Integration:**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/UserPromptSubmit/append_ultrathink.py"
      },
      {
        "type": "command", 
        "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/UserPromptSubmit/append_explain.py"
      },
      {
        "type": "command",
        "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/UserPromptSubmit/append_default.py"
      }
    ]
  }
}
```

---

## 📝 **FEATURE DOCUMENTATION SYSTEM**

### **Required Before Any Feature Development:**

**1. Feature Planning Document: `docs/features/[feature-name].md`**
```markdown
# Feature: [Name]

## Vision Statement
[Exact vision in 2-3 sentences]

## User Impact
- Who: [Target users - coaches/players/parents] 
- Why: [Problem being solved]
- What: [Specific benefit achieved]

## Technical Specification
- Input: [What data/actions trigger this]
- Output: [What user sees/gets]
- Constraints: [Mobile, age bands, performance requirements]

## Sub Agent Assignment
- Primary: [Which sub agent leads]
- Supporting: [Which sub agents contribute]
- Coordination: [How Master Controller orchestrates]

## Success Criteria
- [ ] Specific measurable outcomes
- [ ] Quality gates passed
- [ ] Mobile responsiveness verified
- [ ] Age-appropriate interfaces confirmed

## Implementation Steps
1. [Detailed step-by-step plan]
2. [With estimated timeframes]
3. [And dependencies identified]

## Files Modified
- [List of files that will be changed]
- [With rationale for each]

## Testing Strategy
- [ ] Unit tests required
- [ ] Integration tests required
- [ ] Mobile device testing required
- [ ] Age band validation required

## Rollback Plan
- [How to revert if feature fails]
- [What monitoring indicates problems]
```

**2. Pre-Implementation Checklist:**
```markdown
## Before ANY Code Changes:
- [ ] Feature.md document completed (20+ minutes of planning)
- [ ] Sub agent assignments confirmed
- [ ] Master Controller has reviewed and approved approach
- [ ] All relevant files identified and tagged
- [ ] Success criteria clearly defined
- [ ] Testing strategy established
- [ ] Rollback plan documented

## During Implementation:
- [ ] Commit every 10-15 minutes with AI-generated messages
- [ ] Quality gates passing continuously
- [ ] Mobile testing at each major milestone
- [ ] Sub agent coordination working smoothly

## Post-Implementation:
- [ ] Feature.md updated with actual implementation details
- [ ] Integration testing completed
- [ ] Performance impact measured
- [ ] Documentation updated
- [ ] Ready for merge to main development branch
```

---

## 🎯 **HOW EACH PLAN CHANGES DEVELOPMENT**

### **Master Controller Orchestration Impact:**
**Before:** Multiple agents with fragmented context, coordination complexity  
**After:** Single point of contact, unified context, seamless sub agent coordination

### **Feature Branch Development Impact:**
**Before:** All changes on single branch, conflicts and complexity  
**After:** Parallel development, isolated testing, clean integration

### **7 Tips Integration Impact:**
**Before:** Ad-hoc development without systematic quality controls  
**After:** Disciplined workflow with automated quality gates and error prevention

### **Documentation System Impact:**
**Before:** Features developed without comprehensive planning  
**After:** Every feature requires 20+ minutes of markdown planning before any code

### **Claude Code Hooks Impact:**
**Before:** Manual typing of complex prompts for quality responses  
**After:** Automated prompt enhancement with -u, -e, -d shortcuts

### **Sub Agent Specialization Impact:**
**Before:** General-purpose agents without deep domain expertise  
**After:** Specialized expertise in frontend, UX, backend, and prioritization

---

## 🏆 **EXPECTED DEVELOPMENT TRANSFORMATION**

### **Speed Improvements:**
- **10x-100x faster** new feature development with coordinated sub agents
- **Automated quality gates** catch issues before they become problems
- **Parallel development** across multiple feature branches
- **AI-generated commits** every 10-15 minutes instead of manual writing

### **Quality Improvements:**
- **Comprehensive planning** required before any implementation
- **Mobile-first validation** at every step
- **Age-appropriate interface** verification built in
- **Integration testing** automated throughout development

### **Context Improvements:**
- **Complete POWLAX knowledge** available to all sub agents
- **Specialized domain expertise** for each development area
- **Coordinated decision making** through Master Controller
- **Systematic feature documentation** builds comprehensive knowledge base

**Result: Professional development workflow with AI-assisted quality, speed, and coordination that scales with project complexity.**