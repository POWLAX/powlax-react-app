# POWLAX Quick Start Development Guide

*Created: 2025-08-06*  
*Purpose: Streamlined guide for starting new development with YOLO mode and sub agents*

---

## 🚀 **INSTANT DEVELOPMENT START (COPY & PASTE)**

### **Option 1: YOLO MODE - Fast Implementation (Best for experienced devs)**

```markdown
YOLO MODE ACTIVATED 🚀

I need you to work in YOLO mode for rapid POWLAX development. This means:
- Make confident decisions based on existing patterns
- Implement features completely without asking for clarification
- Use your knowledge of the codebase to fill gaps
- Prioritize working code over perfect code
- Fix issues as you encounter them

Here's what I need: [describe your feature/fix]

Context: You have full access to the POWLAX codebase with Next.js 14, Supabase, Shadcn/UI, and the complete sub agent system. Mobile-first, age-appropriate design is required.

GO! 🎯
```

### **Option 2: GUIDED MODE - Contract First (Best for complex features)**

```markdown
I need to build a new POWLAX feature using Contract First approach.

Feature: [name]
Users affected: [coaches/players/parents]
Problem it solves: [specific pain point]

Please use the powlax-master-controller agent to:
1. Analyze this requirement and identify all gaps
2. Ask clarifying questions until 95% confident
3. Create a complete implementation plan
4. Coordinate sub agents for implementation

Let's start with the gap analysis.
```

### **Option 3: FIX MODE - Quick Debugging (Best for issues)**

```markdown
POWLAX ISSUE FIX NEEDED -e

Error/Issue: [paste error or describe issue]
Location: [file path or feature area]
When it happens: [user action that triggers it]

Please:
1. Diagnose the root cause
2. Implement the fix
3. Add tests to prevent recurrence
4. Verify mobile responsiveness isn't broken

Use YOLO mode for the fix - just make it work!
```

---

## 🎮 **YOLO MODE ACTIVATION GUIDE**

### **What is YOLO Mode?**
YOLO (You Only Live Once) mode tells Claude Code to:
- **Skip excessive clarification** - Make reasonable assumptions
- **Implement completely** - Don't stop at partial solutions
- **Fix forward** - Encounter issue? Fix it and continue
- **Use patterns** - Apply existing codebase patterns liberally
- **Deliver working code** - Prioritize functionality over perfection

### **When to Use YOLO Mode**
✅ **Perfect for:**
- Bug fixes and small enhancements
- Implementing familiar patterns
- Time-sensitive development
- Prototype/MVP features
- When you trust Claude's judgment

⚠️ **Avoid for:**
- Critical security features
- Payment/billing systems
- Major architectural changes
- First-time patterns
- Production deployments

### **YOLO Mode Activation Phrases**

**Simple Activation:**
```
"YOLO mode: [task description]"
"Just build it: [feature]"
"Quick and dirty: [implementation need]"
```

**With Context:**
```
"YOLO this with our standard patterns: [task]"
"Fast implementation following existing code: [feature]"
"Make it work first, optimize later: [requirement]"
```

**With Constraints:**
```
"YOLO but keep mobile responsive: [task]"
"Quick build but maintain types: [feature]"
"Fast fix but add tests: [bug description]"
```

---

## 📋 **NEW FEATURE DEVELOPMENT CHECKLIST**

### **Pre-Development (2 minutes)**
```markdown
□ Decide: YOLO mode or Contract First?
□ Check: Current branch (should be feature branch)
□ Verify: npm run dev works
□ Review: Any recent changes to affected areas
□ Clear: Any uncommitted changes
```

### **Starting Development**

#### **For YOLO Mode:**
```markdown
1. Copy YOLO prompt template above
2. Fill in your specific need
3. Add any constraints (mobile, performance, etc.)
4. Send and let Claude Code work
5. Review output and iterate if needed
```

#### **For Contract First:**
```markdown
1. Copy Contract First template above
2. Answer clarifying questions thoroughly
3. Review and LOCK the contract
4. Watch sub agents coordinate
5. Validate output meets contract
```

### **During Development (Every 15 mins)**
```markdown
□ Quality check: npm run lint
□ Build check: npm run build  
□ Mobile check: Test at 375px width
□ Commit: Git commit with clear message
□ Document: Update relevant docs if needed
```

### **Post-Development**
```markdown
□ Full test: npm run test
□ Mobile test: All breakpoints (375px, 768px, 1024px)
□ Performance: Check load times
□ Documentation: Update if breaking changes
□ PR: Create with description
```

---

## 🎯 **COMMON DEVELOPMENT SCENARIOS**

### **Scenario 1: Add New Component**
```markdown
YOLO MODE: Create a new [ComponentName] component for [feature area].

Requirements:
- Use Shadcn/UI components
- Mobile responsive (375px+)
- Follow existing component patterns in src/components/
- Include proper TypeScript types

Location: src/components/[feature-area]/[ComponentName].tsx
```

### **Scenario 2: Fix Mobile Layout**
```markdown
QUICK FIX: The [page/component] breaks on mobile devices.

Issue: [describe what breaks]
Current behavior: [what happens]
Expected: [what should happen]

YOLO the fix ensuring 375px, 768px, and 1024px breakpoints work.
```

### **Scenario 3: Add Database Feature**
```markdown
I need to add [feature] that requires database changes.

Use powlax-backend-architect agent to:
1. Design the schema changes
2. Create migration files
3. Add RLS policies
4. Update types

Then powlax-frontend-developer to build the UI.

YOLO the implementation but maintain data integrity.
```

### **Scenario 4: Integrate New API**
```markdown
YOLO MODE: Integrate [API name] for [purpose].

Endpoints needed: [list endpoints]
Data flow: [how data moves]
UI updates: [what changes in UI]

Follow our existing API patterns in src/lib/
Add error handling and loading states.
```

### **Scenario 5: Performance Optimization**
```markdown
PERFORMANCE FIX NEEDED -u

Page/Feature: [what's slow]
Current load time: [if known]
Target: <3 seconds on 3G

Analyze and optimize using:
- Code splitting if needed
- Image optimization
- Query optimization
- Caching strategies

YOLO the implementation but measure impact.
```

---

## 🔄 **SUB AGENT COORDINATION PATTERNS**

### **Pattern 1: Full Stack Feature**
```markdown
Build [feature name] using full agent coordination:

powlax-master-controller, please:
1. Use powlax-ux-researcher to design user flow
2. Use powlax-backend-architect for data model
3. Use powlax-frontend-developer for UI
4. Use powlax-sprint-prioritizer for rollout plan

YOLO the coordination - make decisions quickly.
```

### **Pattern 2: Quick Frontend Enhancement**
```markdown
powlax-frontend-developer agent:

YOLO MODE - Enhance [component/page] with [improvement].
Use existing Shadcn/UI patterns.
Maintain mobile responsiveness.
Add smooth animations if appropriate.
```

### **Pattern 3: Database Migration**
```markdown
powlax-backend-architect agent:

Create migration for [feature].
Include rollback procedures.
Add RLS policies for security.
Update TypeScript types.

YOLO but ensure data safety.
```

---

## 💡 **POWER USER TIPS**

### **Speed Optimizations**
1. **Pre-load context:** Start with "Load POWLAX context" before tasks
2. **Batch operations:** Give multiple tasks in one prompt
3. **Skip confirmations:** Add "Don't ask, just do it" to prompts
4. **Trust patterns:** Say "Follow existing patterns" to reduce decisions

### **Quality Shortcuts**
1. **Auto-test:** Add "Include tests" to any YOLO prompt
2. **Type safety:** Add "Maintain strict types" even in YOLO mode
3. **Mobile-first:** Add "Mobile responsive required" as constraint
4. **Docs inline:** Add "Document complex logic" to prompts

### **Advanced YOLO Modifiers**
```markdown
"YOLO++ mode"           # Maximum speed, minimal questions
"YOLO with tests"       # Fast but include test coverage
"YOLO production-safe"  # Quick but maintain quality gates
"YOLO iterate"          # Build fast, then refine
"Strategic YOLO"        # Fast implementation, thoughtful architecture
```

---

## 🚨 **EMERGENCY COMMANDS**

### **When Things Break**
```markdown
EMERGENCY FIX:
1. The build is broken
2. Error: [paste error]
3. Last change: [what you did]

YOLO fix it NOW! Rollback if needed.
```

### **Rollback Command**
```markdown
ROLLBACK NEEDED:
Feature: [what broke]
Commit: [last working commit if known]

Please:
1. Git revert to working state
2. Fix the issue
3. Re-implement safely
```

### **Performance Emergency**
```markdown
PERFORMANCE CRITICAL:
Page: [what's slow]
Load time: [current time]

YOLO optimize:
1. Find bottleneck
2. Fix immediately
3. Measure improvement
```

---

## 📊 **DEVELOPMENT METRICS TO TRACK**

### **YOLO Mode Success Metrics**
- **Speed**: Feature complete in <2 hours
- **Quality**: First-run success >80%
- **Iterations**: <3 rounds to completion
- **Mobile**: Works on first try >90%

### **Contract First Success Metrics**
- **Clarity**: 95% confidence achieved
- **Accuracy**: Requirements met >95%
- **Rework**: <10% features need rework
- **Integration**: Smooth handoffs >90%

---

## 🎬 **YOUR FIRST DEVELOPMENT SESSION**

### **Quick Start Template (Copy This!)**
```markdown
Hi! I'm starting a new POWLAX development session.

First, verify you have the POWLAX context loaded (Next.js 14, Supabase, Shadcn/UI, mobile-first).

Today I need to: [your task]

Let's use YOLO mode for speed. Make confident decisions based on the existing codebase patterns. If you hit issues, fix them and keep going.

Ready? Let's build!
```

### **Session Management**
```markdown
"Status check"           # See current progress
"What's left?"          # Check remaining tasks
"Commit and continue"   # Save progress, keep working
"Polish and finish"     # Clean up and complete
"Ship it!"             # Final checks and deployment prep
```

---

## ✅ **DEVELOPMENT READY CHECKLIST**

Before starting any session:
- [ ] You know whether to use YOLO or Contract First
- [ ] You have your task clearly defined
- [ ] You've chosen appropriate sub agents
- [ ] You've set success criteria
- [ ] You're on the correct branch

**Remember:**
- **YOLO = Speed + Trust**
- **Contract First = Precision + Clarity**
- **Sub Agents = Specialized Expertise**
- **Mobile First = Always Required**
- **Quality Gates = Never Skip**

---

*Now you're ready to develop at maximum velocity with POWLAX! Choose your mode and start building.* 🚀