# Agent Self-Update Protocol
## Automatic Documentation Maintenance System

*Created: 2025-01-15*  
*Purpose: Ensure agents automatically update troubleshooting docs when new issues occur*

---

## 🔄 **CORE PRINCIPLE**

**Every agent that encounters an issue MUST update the documentation before completing their task**
- Prevents the same issue from happening again
- Creates a self-improving system
- Builds institutional knowledge automatically

---

## 📋 **MANDATORY AGENT WORKFLOW**

### **When an Agent Encounters ANY Issue:**

#### **Step 1: Document the Issue (Required)**
```markdown
## Issue Encountered During [Agent Task]

**Date**: [Current Date]
**Agent Type**: [UI/Database/Content/etc.]
**Task Scope**: [What the agent was working on]
**Error Pattern**: [Brief description of what went wrong]
**Root Cause**: [Why it happened]
**Solution Applied**: [How it was fixed]
**Prevention Strategy**: [How to avoid in future]
```

#### **Step 2: Update Troubleshooting Guide (Required)**
```markdown
### Issue #[Next Number]: [Brief Title] 
**Date**: [Current Date]
**Error**: [Exact error message or pattern]
**Cause**: [Root cause analysis]
**Solution**: [Step-by-step fix]
**Prevention**: [How agents can avoid this]

**Agent Context**: [Which agent types are affected]
**Scope Impact**: [What areas of work this affects]
```

#### **Step 3: Update Builder Guide Templates (Required)**
Based on agent type, update the relevant template:
- **UI Agent encountered issue** → Update UI template in Builder Guide
- **Database Agent encountered issue** → Update Database template
- **Content Agent encountered issue** → Update Content template

#### **Step 4: Create/Update Contextual Warnings (Required)**
Add specific warning to relevant agent instructions:
```markdown
### [Issue Type] Prevention
**Context**: When working on [specific task type]
**Risk**: [What can go wrong]
**Prevention**: [Specific steps to avoid]
**Example**: [Code example if applicable]
```

---

## 🎯 **INTEGRATION WITH A4CC FRAMEWORK**

### **Enhanced A4CC Template Structure:**

```markdown
## COORDINATION - Implementation & Self-Update

### Phase [X]: [Task Implementation]
**Standard A4CC content...**

### Phase [X+1]: Documentation Maintenance (MANDATORY)
**Priority**: Critical - Must complete before task sign-off

**Self-Update Tasks**:
1. **Issue Documentation**: Record any problems encountered during implementation
2. **Troubleshooting Guide Update**: Add new error patterns to master guide
3. **Builder Guide Enhancement**: Update relevant agent templates with new warnings
4. **Contextual Warning Creation**: Add specific prevention guidance for similar agents

**Success Criteria**:
- [ ] All encountered issues documented with full context
- [ ] Troubleshooting guide updated with new patterns
- [ ] Builder guide templates enhanced with new warnings
- [ ] Future agents have specific guidance to prevent same issues
```

---

## 📊 **ISSUE TRACKING MATRIX**

### **Agent Type → Update Responsibilities**

| If Agent Is | And Encounters | Must Update | Must Add Warning To |
|-------------|----------------|-------------|-------------------|
| **UI/Frontend** | Import error, useEffect issue, null safety | Troubleshooting Guide + UI Template | All future UI agents |
| **Database** | Query error, RLS issue, data validation | Troubleshooting Guide + DB Template | All future DB agents |
| **Content/CMS** | Filtering error, data format issue | Troubleshooting Guide + Content Template | All future Content agents |
| **API/Backend** | Auth error, endpoint issue | Troubleshooting Guide + API Template | All future API agents |
| **Process/Workflow** | File operation, dependency issue | Troubleshooting Guide + Process Template | All future Process agents |

---

## 🔧 **AUTOMATED UPDATE TEMPLATES**

### **Template 1: Troubleshooting Guide Entry**
```markdown
### Issue #[AUTO_NUMBER]: [Agent Generated Title]
**Date**: [AUTO_DATE]  
**Agent Context**: [UI/Database/Content/API/Process]
**Error**: `[EXACT_ERROR_MESSAGE]`  
**Cause**: [ROOT_CAUSE_ANALYSIS]  
**Solution**: 
1. [STEP_BY_STEP_FIX]
2. [VERIFICATION_STEPS]

**Prevention for Future Agents**:
- [SPECIFIC_PREVENTION_STEP_1]
- [SPECIFIC_PREVENTION_STEP_2]

**Scope Impact**: [WHICH_AGENT_TYPES_AFFECTED]
**Task Context**: [WHAT_WORK_TRIGGERS_THIS_ISSUE]
```

### **Template 2: Builder Guide Template Update**
```markdown
### [Error Type] Prevention (Added: [DATE])
**Context**: When [SPECIFIC_TASK_CONTEXT]
**Warning**: [SPECIFIC_WARNING_TEXT]
**Prevention**: 
```typescript
// ❌ CAUSES ISSUE
[BAD_CODE_EXAMPLE]

// ✅ CORRECT APPROACH  
[GOOD_CODE_EXAMPLE]
```
**Verification**: [HOW_TO_CHECK_IF_FIXED]
```

---

## 🚀 **IMPLEMENTATION CHECKLIST FOR ALL AGENTS**

### **Before Starting Task:**
- [ ] Read current troubleshooting guide for relevant issues
- [ ] Review Builder Guide template for agent type
- [ ] Understand prevention strategies for scope of work

### **During Task Execution:**
- [ ] Document any issues encountered immediately
- [ ] Note the exact error messages and context
- [ ] Record the scope of work being performed when issue occurred

### **After Task Completion:**
- [ ] Update troubleshooting guide with any new issues
- [ ] Update Builder Guide template with new prevention strategies
- [ ] Add specific warnings for future agents working on similar tasks
- [ ] Verify all documentation updates are complete

### **Task Sign-Off Requirements:**
- [ ] All technical work completed successfully
- [ ] **All documentation updates completed**
- [ ] Future agents have guidance to prevent encountered issues
- [ ] Self-update protocol followed completely

---

## 📈 **CONTINUOUS IMPROVEMENT CYCLE**

### **How the System Self-Improves:**

```
Agent Encounters Issue
    ↓
Documents Issue + Context + Solution
    ↓
Updates Troubleshooting Guide
    ↓
Updates Relevant Builder Templates
    ↓
Creates Specific Warnings for Future Agents
    ↓
Next Agent Avoids Same Issue
    ↓
System Gets Smarter Over Time
```

### **Quality Control:**
- **Each update must include context** (what task, what scope, what agent type)
- **Each update must include prevention** (how to avoid in future)
- **Each update must be specific** (not generic warnings)
- **Each update must reference scope** (which agents are affected)

---

## 🎨 **REAL-WORLD EXAMPLE**

### **Scenario**: UI Agent encounters new import issue

#### **What Agent Documents:**
```markdown
## Issue Encountered During UI Component Creation

**Date**: 2025-01-15
**Agent Type**: UI/Frontend  
**Task Scope**: Building practice planner component filtering
**Error Pattern**: `Cannot resolve '@/components/practice/DrillFilter'`
**Root Cause**: Agent assumed component existed based on similar naming
**Solution Applied**: Created missing component with proper interface
**Prevention Strategy**: Always verify component existence before importing
```

#### **What Gets Added to Troubleshooting Guide:**
```markdown
### Issue #7: Component Path Assumption Error
**Date**: 2025-01-15
**Agent Context**: UI/Frontend
**Error**: `Cannot resolve '@/components/[assumed-path]'`
**Cause**: Agent assumed component existed based on naming patterns
**Solution**: 
1. Use file_search tool to verify component exists
2. Create missing component if needed
3. Update import path to actual location

**Prevention for Future Agents**:
- Always verify component paths with file_search before importing
- Don't assume components exist based on naming patterns
- Check existing component structure before creating imports
```

#### **What Gets Added to UI Template:**
```markdown
### Component Import Verification (Added: 2025-01-15)
**Context**: When creating new UI components that import other components
**Warning**: Don't assume components exist based on naming patterns
**Prevention**: 
```typescript
// ❌ ASSUMPTION - May not exist
import { DrillFilter } from '@/components/practice/DrillFilter'

// ✅ VERIFIED FIRST - Check with file_search tool
// Use file_search to confirm path exists, then import
```
**Verification**: Use file_search tool before any @/components imports
```

---

## 🏆 **SUCCESS METRICS**

### **System Working When:**
- ✅ Issues occur less frequently over time
- ✅ Same errors don't repeat across agents
- ✅ Documentation stays current and relevant
- ✅ New agents complete tasks without encountering documented issues

### **System Needs Attention When:**
- ❌ Same issues keep occurring despite documentation
- ❌ Agents skip documentation updates
- ❌ Documentation becomes outdated or irrelevant

---

**Remember**: This is not optional - every agent MUST update documentation when encountering issues. This creates a self-improving system that gets smarter over time and prevents the same problems from recurring.