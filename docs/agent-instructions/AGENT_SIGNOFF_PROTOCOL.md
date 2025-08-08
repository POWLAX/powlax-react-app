# 🎯 **Agent Sign-Off Protocol**
## **Clear Communication About Who Handles What**

*Created: 2025-01-16*  
*Status: ACTIVE PROTOCOL*

---

## 📝 **MANDATORY SIGN-OFF FORMAT**

Note: Final sign-off to the user is centralized under the POWLAX Master Controller. Sub-agents must return results and gate evidence to the Master Controller, who then issues the user-facing sign-off and next-action block.

### **Every Response Must End With:**

```markdown
---
### 🤖 **Next Action Handler**
- **Next Request Goes To:** [Who will handle your next command]
- **Active Contract:** [contract-id] → `/contracts/active/[contract-id].yaml`
- **Working On:** [Component/Feature name]
- **View Live:** http://localhost:3000/[path]
- **Available Actions:**
  1. Continue with [current agent] for [specific tasks]
  2. Deploy [other agent] for [different tasks]
  3. Return to Master Controller for coordination

**📍 Current Agent: [MASTER CONTROLLER | FRONTEND DEVELOPER | TEST SPECIALIST | etc.]**
---
```

---

## 🎨 **SIGN-OFF EXAMPLES**

### **Master Controller Sign-Off**
```markdown
---
### 🤖 **Next Action Handler**
- **Current Agent:** Master Controller
- **Next Request Goes To:** Depends on your request
  - UI fixes → Frontend Developer
  - Database issues → Backend Architect
  - Testing → Test Specialist
  - General coordination → Stays with me
- **Active Contract:** `practice-planner-modal-fix-001` → `/contracts/active/practice-planner-modal-fix-001.yaml`
- **Working On:** Practice Planner Enhancement
- **View Live:** http://localhost:3000/teams/[teamId]/practice-plans
- **Available Actions:**
  1. "Test the modals" → Deploy Test Specialist
  2. "Fix the UI" → Deploy Frontend Developer
  3. "Check performance" → Deploy Backend Architect
  4. "Show me progress" → I'll provide status update
---
```

### **Frontend Developer Sign-Off**
```markdown
---
### 🤖 **Next Action Handler**
- **Current Agent:** Frontend Developer
- **Next Request Goes To:** Frontend Developer (continuing modal fixes)
- **Active Contract:** `practice-planner-modal-fix-001` → `/contracts/active/practice-planner-modal-fix-001.yaml`
- **Working On:** Video Modal Component
- **View Live:** http://localhost:3000/teams/team1/practice-plans
- **Test Modal:** Click any drill → Video icon
- **Available Actions:**
  1. "Fix the next modal" → I'll continue with Strategy Modal
  2. "Test what you built" → Deploy Test Specialist
  3. "Back to planning" → Return to Master Controller
---
```

### **Test Specialist Sign-Off**
```markdown
---
### 🤖 **Next Action Handler**
- **Current Agent:** Test Specialist
- **Next Request Goes To:** Test Specialist (running test suite)
- **Active Contract:** `practice-planner-modal-fix-001` → `/contracts/active/practice-planner-modal-fix-001.yaml`
- **Working On:** Modal Functionality Tests
- **View Test Results:** http://localhost:3000 (with console open)
- **Test Report:** `/test-results/modal-tests-2025-01-16.html`
- **Available Actions:**
  1. "Run mobile tests" → I'll test at 375px viewport
  2. "Fix the failures" → Deploy Frontend Developer
  3. "Check coverage" → I'll generate coverage report
  4. "Done testing" → Return to Master Controller
---
```

---

## 🔗 **LINK FORMATS**

### **Contract Links**
```markdown
**Contract:** `[contract-id]`
- View: `/contracts/active/[contract-id].yaml`
- Status: `/contracts/CONTRACT_APPROVAL_TRACKER.md`
```

### **Localhost Links**
```markdown
**Pages to Test:**
- Practice Planner: http://localhost:3000/teams/[teamId]/practice-plans
- Skills Academy: http://localhost:3000/skills-academy/workouts
- Team Dashboard: http://localhost:3000/teams/[teamId]/dashboard
- Gamification: http://localhost:3000/gamification

**With Specific State:**
- Modal Test: http://localhost:3000/teams/team1/practice-plans#video-modal
- Drill View: http://localhost:3000/teams/team1/practice-plans?drill=123
```

### **Development Links**
```markdown
**Dev Tools:**
- Next.js Dev: http://localhost:3000
- API Routes: http://localhost:3000/api/[endpoint]
- Supabase Local: http://localhost:54321
- Email Preview: http://localhost:3000/api/email/preview
```

---

## 🎯 **CONTEXT CLARITY INDICATORS**

### **When Master Controller is Active**
```markdown
🎮 **MASTER CONTROLLER MODE**
I'm coordinating multiple agents for your task.
Next action depends on what you need.
```

### **When Sub-Agent is Active**
```markdown
🔧 **FRONTEND DEVELOPER MODE**
I'm implementing the UI changes.
Ask me about components, styling, or interactions.
```

### **When Returning to Claude Code**
```markdown
📘 **CLAUDE CODE MODE**
You're back to the base Claude Code assistant.
No active contracts or specialized agents.
Use "Deploy Master Controller" to resume POWLAX work.
```

---

## 🚦 **STATE TRANSITIONS**

### **Clear Handoff Messages**

#### **From Master Controller → Sub-Agent**
```markdown
"Deploying Frontend Developer to fix modals...
---
### 🤖 **Control Handoff**
- **From:** Master Controller
- **To:** Frontend Developer
- **Task:** Fix Video and Strategy modals
- **Contract:** `practice-planner-modal-fix-001`
- **Return Command:** "Back to controller"
---
```

#### **From Sub-Agent → Master Controller**
```markdown
"Modal fixes complete. Returning control...
---
### 🤖 **Control Return**
- **From:** Frontend Developer
- **To:** Master Controller
- **Completed:** Video modal functional
- **Next Decision:** Test or continue with next modal
- **Command Options:** "test this" | "continue" | "show status"
---
```

---

## 📊 **QUICK STATUS INDICATORS**

### **In Sign-Off Section**
```markdown
**Status Lights:**
- 🟢 Active and ready
- 🟡 Processing/Working
- 🔴 Blocked/Need input
- ✅ Task complete
- 🔄 Iteration in progress

**Quick Stats:**
- Contract Progress: 60% (2/4 modals fixed)
- Quality Score: 85/100
- Tests Passing: 8/10
- Time Elapsed: 25 minutes
```

---

## 🎯 **USER BENEFITS**

This sign-off system ensures:

1. **You always know** who will handle your next request
2. **Direct links** to test your changes at localhost
3. **Contract visibility** for scope tracking
4. **Clear options** for what you can ask next
5. **No confusion** about which agent is active
6. **Easy navigation** to relevant pages

---

## ✅ **IMPLEMENTATION REQUIREMENT**

**ALL agents must include this sign-off format at the end of EVERY response!**

Missing sign-offs will trigger:
1. Automatic protocol reminder
2. Quality gate failure
3. Required iteration to add sign-off

---

## 🎯 **Example Complete Response**

```markdown
## ✅ Video Modal Fixed!

I've successfully fixed the video modal in the practice planner. The modal now:
- Opens when clicking the video icon
- Loads videos from the `powlax_drills` table
- Handles loading and error states
- Works on mobile (375px+)

The changes are live and ready to test.

---
### 🤖 **Next Action Handler**
- **Current Agent:** Frontend Developer
- **Next Request Goes To:** Your choice
  - "Test this" → Test Specialist
  - "Fix Strategy modal" → Stays with me
  - "Check database" → Backend Architect
- **Active Contract:** `practice-planner-modal-fix-001` → `/contracts/active/practice-planner-modal-fix-001.yaml`
- **Working On:** Practice Planner Modals (1/4 complete)
- **View Live:** http://localhost:3000/teams/team1/practice-plans
- **Test It:** Click any drill → Click video icon 🎬
- **Available Actions:**
  1. Continue with Strategy Modal fix
  2. Test Video Modal functionality
  3. Return to Master Controller
---
```

**This protocol is NOW ACTIVE!**