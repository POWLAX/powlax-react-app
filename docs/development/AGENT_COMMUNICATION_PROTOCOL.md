# POWLAX Agent Communication Protocol

*Created: 2025-01-16*  
*Purpose: Comprehensive communication standards for all agent types*

---

## 🎯 **PROTOCOL OVERVIEW**

This protocol establishes how BMad agents, A4CC agents, and Claude Code sub agents communicate, share context, and coordinate work to prevent conflicts and ensure consistent development.

**Core Principles:**
1. **Shared Context**: All agents have access to current system state
2. **Conflict Prevention**: Agents check for concurrent work before starting
3. **Handoff Documentation**: Clear transfer of work between agents
4. **Quality Gates**: Verification steps before considering work complete

---

## 📋 **COMMUNICATION STANDARDS**

### **1. Universal Agent Requirements**

**Every Agent Must:**
```markdown
✅ Load current context from: docs/development/COMPLETE_SYSTEM_ARCHITECTURE.md
✅ Check coordination log: tasks/coordination/agent-coordination-log.md
✅ Update work status in real-time
✅ Document all changes made
✅ Verify system stability before completing tasks
✅ Follow mobile-first development patterns
```

**Agent Identification Pattern:**
```markdown
All agent communications must include:
- Agent Type: [BMad/A4CC/Sub Agent]
- Agent Name: [Specific agent name]
- Task Scope: [Brief description]
- Start Time: [When work began]
- Dependencies: [What this work depends on]
```

### **2. Shared Context Management**

**Central Context Files:**
```
Context Hierarchy:
├── docs/development/COMPLETE_SYSTEM_ARCHITECTURE.md    # System overview
├── docs/development/POWLAX-AGENT-WORKFLOW-ANALYSIS.md  # Agent analysis
├── tasks/coordination/agent-coordination-log.md        # Real-time coordination
├── .bmad-core/context/POWLAX-PROJECT-CONTEXT.md       # BMad context
└── docs/Sub Agent Creation Instructions/               # Sub agent context
```

**Context Update Protocol:**
```markdown
When ANY agent makes significant changes:

1. IMMEDIATE: Update coordination log with:
   - What was changed
   - Which files were modified
   - Impact on other agents
   - Any breaking changes

2. WITHIN 1 HOUR: Update relevant context files:
   - System architecture changes
   - New component patterns
   - Database schema updates
   - Authentication modifications

3. BEFORE COMPLETING TASK: Verify context accuracy:
   - All changes documented
   - No conflicting information
   - Future agents have clear guidance
```

---

## 🔄 **AGENT TYPE COORDINATION**

### **1. BMad Agent Coordination**

**BMad Agent Handoff Pattern:**
```markdown
### From: [Previous Agent Name]
### To: [Next Agent Name]
### Date: [Date]

**Work Completed:**
- [List of completed tasks]
- [Files modified]
- [Components created/updated]

**Current State:**
- [System status]
- [Any issues encountered]
- [Tests passing/failing]

**Next Steps Recommended:**
- [Specific tasks for next agent]
- [Priority order]
- [Dependencies to be aware of]

**Critical Notes:**
- [Any breaking changes]
- [Development environment status]
- [Database migrations needed]
```

**BMad Team Communication:**
```markdown
When using BMad teams (All, Fullstack, No-UI):

1. Team Lead (Orchestrator):
   - Assigns work to team members
   - Monitors overall progress
   - Resolves conflicts between agents
   - Maintains team context

2. Team Members:
   - Report status to orchestrator
   - Document individual contributions
   - Flag blockers immediately
   - Share knowledge with team

3. Team Handoff:
   - Complete team debrief
   - Document lessons learned
   - Update team templates
   - Prepare context for next team
```

### **2. A4CC Agent Coordination**

**A4CC Task Coordination:**
```markdown
Before Starting A4CC Task:

1. Check Active Tasks:
   - Review: tasks/active/[domain]/
   - Identify: Conflicting work
   - Coordinate: With agents working on same files

2. Declare Work Intent:
   - File: tasks/coordination/agent-coordination-log.md
   - Format: "[Agent Name] starting [Task] on [Files] at [Time]"
   - Dependencies: List any blocking work

3. Monitor Concurrent Work:
   - Check log every 30 minutes
   - Communicate with overlapping agents
   - Adjust approach to avoid conflicts
```

**A4CC Progress Reporting:**
```markdown
Progress Update Format:

**Agent**: [A4CC Agent Name]
**Task**: [Current task]
**Status**: [In Progress/Completed/Blocked]
**Files Modified**: 
- [List of all files changed]
- [New files created]
- [Files deleted]

**Impact Assessment**:
- [Components affected]
- [Other agents that might be impacted]
- [Database changes made]
- [Testing requirements]

**Next Steps**:
- [Remaining work]
- [Expected completion time]
- [Dependencies needed]
```

### **3. Claude Code Sub Agent Coordination**

**Sub Agent Creation Protocol:**
```markdown
When Creating Sub Agent:

1. Parent Agent Responsibility:
   - Define sub agent scope clearly
   - Provide complete context package
   - Establish communication schedule
   - Set quality criteria

2. Sub Agent Initialization:
   - Load parent context completely
   - Verify understanding of requirements
   - Establish progress reporting schedule
   - Confirm quality gates

3. Ongoing Communication:
   - Status updates every 2 hours
   - Immediate escalation for blockers
   - Context sharing with sibling sub agents
   - Regular parent agent check-ins
```

**Sub Agent Communication Format:**
```markdown
**Sub Agent**: [Name]
**Parent Agent**: [Name]
**Task Scope**: [Description]
**Progress**: [Percentage complete]

**Work Completed This Period**:
- [Specific accomplishments]
- [Files modified]
- [Tests created/updated]

**Issues Encountered**:
- [Problems and solutions]
- [Blockers needing escalation]
- [Unexpected complexity]

**Coordination Needs**:
- [Other sub agents to sync with]
- [Parent agent guidance needed]
- [External dependencies]

**Next Period Plan**:
- [Planned activities]
- [Expected deliverables]
- [Risk areas to monitor]
```

---

## 🚨 **CONFLICT RESOLUTION PROTOCOLS**

### **1. File Conflict Prevention**

**Before Modifying Any File:**
```markdown
1. Check Recent Changes:
   - Git log for recent commits
   - Coordination log for active work
   - File modification timestamps

2. Declare Intent:
   - Log: "Agent [X] claiming [File] for [Purpose]"
   - Duration: Expected work time
   - Scope: Specific changes planned

3. Monitor for Conflicts:
   - Check every 15 minutes for overlapping work
   - Communicate with other agents on same files
   - Adjust approach to minimize conflicts
```

**Conflict Resolution Steps:**
```markdown
When File Conflicts Occur:

1. Immediate Communication:
   - Both agents stop work on conflicting files
   - Open communication channel
   - Assess scope of conflict

2. Resolution Strategy:
   - Time-based: Earlier claimer continues, later waits
   - Scope-based: Larger change takes precedence
   - Coordination: Split work by file sections
   - Escalation: Get human input if needed

3. Resolution Documentation:
   - Record conflict and resolution
   - Update protocols if needed
   - Share lessons with other agents
```

### **2. Quality Gate Conflicts**

**When Tests Fail After Changes:**
```markdown
1. Immediate Response:
   - Stop all work on affected areas
   - Identify root cause
   - Assess impact scope

2. Resolution Process:
   - Last agent to modify fixes immediately
   - If unclear, both agents coordinate fix
   - Update tests to prevent recurrence

3. Prevention Updates:
   - Add specific test for this scenario
   - Update agent guidelines
   - Share pattern with all agents
```

---

## 📊 **COORDINATION TRACKING SYSTEM**

### **1. Real-Time Work Log**

**File**: `tasks/coordination/agent-coordination-log.md`

**Format:**
```markdown
# Agent Coordination Log

## Active Work (Updated Real-Time)

### [Date] [Time] - [Agent Name]
**Status**: [Started/In Progress/Completed/Blocked]
**Task**: [Brief description]
**Files**: [List of files being modified]
**Expected Duration**: [Time estimate]
**Dependencies**: [What this depends on]
**Impact**: [Other agents/systems affected]

---

## Completed Work Today

[Completed tasks with handoff notes]

## Planned Work Queue

[Upcoming tasks with agent assignments]

## Known Conflicts & Resolutions

[Documented conflicts and how they were resolved]
```

### **2. Context Synchronization Schedule**

**Daily Synchronization:**
```markdown
Every 24 hours, designated agent updates:

1. System Architecture Document
   - New components added
   - Component relationship changes
   - New patterns established

2. Agent Workflow Analysis  
   - New agent types created
   - Workflow improvements discovered
   - Communication protocol updates

3. Central Context Files
   - Project state updates
   - New capabilities added
   - Environment changes
```

**Weekly Synchronization:**
```markdown
Every 7 days, comprehensive review:

1. Communication Protocol Effectiveness
   - Conflict frequency analysis
   - Resolution time tracking
   - Protocol improvement recommendations

2. Agent Performance Analysis
   - Task completion rates
   - Quality metrics
   - Knowledge transfer effectiveness

3. System Health Assessment
   - Build stability trends
   - Test pass rates
   - Development velocity metrics
```

---

## 🎯 **QUALITY ASSURANCE INTEGRATION**

### **1. Mandatory Quality Gates**

**Before Any Agent Completes Work:**
```bash
# Required verification steps:
1. npm run lint                 # ESLint must pass
2. npm run build               # Build must succeed
3. npx playwright test         # Core E2E tests must pass
4. Mobile responsiveness test  # Manual verification required
5. Component integration test  # Verify with existing system
```

### **2. Quality Gate Communication**

**Quality Gate Failure Protocol:**
```markdown
When Quality Gates Fail:

1. Immediate Notification:
   - Update coordination log: "QUALITY GATE FAILURE"
   - Identify failing tests/builds
   - Assess impact on other agents

2. Resolution Coordination:
   - Block all work on affected areas
   - Form resolution team if needed
   - Document root cause analysis

3. Prevention Measures:
   - Update quality gates if needed
   - Add prevention checks
   - Share lessons learned
```

### **3. Cross-Agent Testing**

**Integration Testing Protocol:**
```markdown
When Multiple Agents Work on Related Components:

1. Integration Test Planning:
   - Define component interaction tests
   - Establish test data requirements
   - Schedule integration testing windows

2. Joint Testing Sessions:
   - All relevant agents participate
   - Test component interactions
   - Verify end-to-end functionality

3. Issue Resolution:
   - Joint debugging sessions
   - Shared responsibility for fixes
   - Coordinated solution implementation
```

---

## 🔧 **IMPLEMENTATION GUIDELINES**

### **1. Starting New Work**

**Checklist for Any Agent:**
```markdown
Before Starting New Task:

□ Load latest system context
□ Check coordination log for conflicts  
□ Verify all imports still exist
□ Test current system state
□ Declare work intent
□ Set up progress reporting
□ Establish completion criteria
```

### **2. During Work**

**Ongoing Requirements:**
```markdown
While Working:

□ Update coordination log every 2 hours
□ Check for conflicts every 30 minutes
□ Test changes incrementally
□ Document decisions made
□ Communicate blockers immediately
□ Maintain mobile responsiveness
□ Follow established patterns
```

### **3. Completing Work**

**Completion Protocol:**
```markdown
Before Marking Task Complete:

□ Run all quality gates
□ Update system documentation
□ Test on mobile and desktop
□ Verify no breaking changes
□ Update coordination log
□ Create handoff documentation
□ Clean up temporary files
□ Notify dependent agents
```

---

## 📈 **SUCCESS METRICS**

### **Communication Effectiveness**
- ✅ Conflict frequency < 1 per week
- ✅ Conflict resolution time < 2 hours  
- ✅ Context synchronization accuracy > 95%
- ✅ Agent handoff success rate > 90%

### **Development Velocity**
- ✅ Task completion without rework > 80%
- ✅ Quality gate pass rate > 95%
- ✅ Build stability maintained > 98%
- ✅ Knowledge transfer efficiency improving

### **System Stability**
- ✅ No breaking changes without notice
- ✅ Mobile responsiveness maintained
- ✅ Database integrity preserved
- ✅ Authentication flows stable

---

*This protocol ensures all agents work in harmony while maintaining system stability and development velocity.*