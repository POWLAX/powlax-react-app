# Agent Builder Master Guide
## Contextual Agent Creation & Error Prevention System

*Created: 2025-01-15*  
*Purpose: Build A4CC agents with contextualized warnings to prevent breakage*

!IMPORTANT! - Do not modify unless you have something to add.  All additions must be approved. !IMPORTANT!

---

## 🎯 **CORE PRINCIPLE**

**Only include warnings relevant to the agent's scope of work**
- UI agents get UI-specific warnings
- Database agents get DB-specific warnings  
- API agents get API-specific warnings
- Don't overwhelm agents with irrelevant information

---

## 📚 **REFERENCE DOCUMENTS**

### **Primary Troubleshooting Reference**
- [`docs/development/AGENT_TROUBLESHOOTING_GUIDE.md`](../development/AGENT_TROUBLESHOOTING_GUIDE.md) - Complete error patterns & fixes
- [`docs/development/IMMEDIATE_FIX_CHECKLIST.md`](../development/IMMEDIATE_FIX_CHECKLIST.md) - Quick emergency fixes

### **Self-Maintaining System** ⚠️ CRITICAL
- [`docs/agent-instructions/AGENT_SELF_UPDATE_PROTOCOL.md`](AGENT_SELF_UPDATE_PROTOCOL.md) - **MANDATORY for all agents**
- Agents MUST update documentation when encountering new issues
- Creates self-improving system that prevents recurring problems

### **Existing A4CC Templates** [[memory:5216107]]
- Database Integration Architect 
- Gamification Implementation Architect
- Workspace Organization Architect

---

## 🔧 **AGENT CONTEXTUALIZATION MATRIX**

### **Agent Type → Relevant Error Patterns**

| Agent Type | High Risk Errors | Medium Risk | Include in Instructions |
|------------|------------------|-------------|------------------------|
| **UI/Frontend Agents** | Bad imports (🚨 CRITICAL), useEffect loops, null safety | Port issues, auth patterns | Import verification, null checking, useEffect deps |
| **Database Agents** | Bad imports, RLS policies, null data | Connection issues | Import verification, data validation, policy checks |
| **API/Backend Agents** | Bad imports, auth context, data validation | Rate limiting | Import verification, auth handling, error responses |
| **Content/CMS Agents** | Bad imports, null safety, filtering | Data formatting | Import verification, safe filtering, content validation |
| **Workflow/Process Agents** | Bad imports, file operations | Dependencies | Import verification, file handling, process validation |

---

## 🏗️ **AGENT INSTRUCTION TEMPLATES**

### **Template 1: UI/Frontend Agent Instructions**

```markdown
## CRITICAL ERROR PREVENTION

### 🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)
- **BEFORE creating any file**: Verify ALL imports exist
- **Check these paths work**:
  - `@/contexts/JWTAuthContext` ✅ (for auth)
  - `@/components/ui/...` ✅ (for UI components)
  - `@/lib/...` ✅ (for utilities)
- **NEVER import**: `@/hooks/useAuthContext` ❌ (doesn't exist)

### 🔄 useEffect Dependencies
- Only include external state in dependencies
- Don't include state modified inside the effect
- Example: `[authLoading, currentUser, isAdmin]` ✅

### 🛡️ Null Safety (UI Crashes)
- Always use: `item?.property?.method() ?? fallback`
- Filter functions: `(strategy.name?.toLowerCase()?.includes(term) ?? false)`

### 🔧 After Changes
- Restart server if making new files: `rm -rf .next && npm run dev`
- Verify correct port in terminal output

## COORDINATION - Implementation & Mandatory Updates

### Phase [X]: [Task Implementation]
[Standard A4CC implementation content...]

### Phase [X+1]: Documentation Self-Update (MANDATORY)
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any problems encountered with full context
2. **Troubleshooting Guide Update**: Add new error patterns if any discovered
3. **Builder Template Enhancement**: Update UI template with new prevention strategies
4. **Future Agent Guidance**: Create specific warnings for similar UI work

**Success Criteria**:
- [ ] All encountered issues documented with task context
- [ ] Troubleshooting guide updated with new UI patterns
- [ ] UI agent template enhanced with new warnings
- [ ] Future UI agents have specific guidance to prevent same issues

**Reference**: Follow [AGENT_SELF_UPDATE_PROTOCOL.md](AGENT_SELF_UPDATE_PROTOCOL.md) exactly
```

### **Template 2: Database Agent Instructions**

```markdown
## CRITICAL ERROR PREVENTION

### 🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)
- **BEFORE creating any file**: Verify ALL imports exist
- **Check these paths work**:
  - `@/lib/supabase` ✅ (for DB connection)
  - `@/types/...` ✅ (for TypeScript types)
- **Database-specific patterns**: Verify table names exist before referencing

### 🗄️ Database Safety
- Always handle null values from DB: `user?.roles ?? []`
- Use proper TypeScript interfaces for DB queries
- Test queries with empty result sets

### 🔒 RLS Policies
- Verify user has proper permissions
- Test auth context in database operations
- Handle unauthorized access gracefully

## COORDINATION - Implementation & Mandatory Updates

### Phase [X]: [Task Implementation]
[Standard A4CC implementation content...]

### Phase [X+1]: Documentation Self-Update (MANDATORY)
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any database problems with query context
2. **Troubleshooting Guide Update**: Add new database error patterns if discovered
3. **Builder Template Enhancement**: Update Database template with new safety measures
4. **Future Agent Guidance**: Create specific warnings for similar database work

**Success Criteria**:
- [ ] All database issues documented with table/query context
- [ ] Troubleshooting guide updated with new database patterns
- [ ] Database agent template enhanced with new safety measures
- [ ] Future database agents have specific guidance to prevent same issues

**Reference**: Follow [AGENT_SELF_UPDATE_PROTOCOL.md](AGENT_SELF_UPDATE_PROTOCOL.md) exactly
```

### **Template 3: Content/CMS Agent Instructions**

```markdown
## CRITICAL ERROR PREVENTION

### 🚨 IMPORT VERIFICATION (BREAKS ENTIRE APP)  
- **Check these paths work BEFORE using**:
  - `@/contexts/JWTAuthContext` ✅ 
  - `@/components/ui/...` ✅
- **Content-specific**: Verify data structure before filtering

### 🛡️ Content Data Safety
- **Filter functions**: Always use null safety
  ```typescript
  // ✅ SAFE
  items.filter(item => (item.name?.toLowerCase()?.includes(term) ?? false))
  
  // ❌ BREAKS if name is null
  items.filter(item => item.name.toLowerCase().includes(term))
  ```

### 📊 Content Validation
- Handle empty arrays: `content || []`
- Check for required fields before rendering
- Provide fallback content for missing data

## COORDINATION - Implementation & Mandatory Updates

### Phase [X]: [Task Implementation]
[Standard A4CC implementation content...]

### Phase [X+1]: Documentation Self-Update (MANDATORY)
**Priority**: Critical - Must complete before task sign-off

**Required Updates**:
1. **Issue Documentation**: Record any content handling problems with data context
2. **Troubleshooting Guide Update**: Add new content/filtering error patterns if discovered
3. **Builder Template Enhancement**: Update Content template with new safety patterns
4. **Future Agent Guidance**: Create specific warnings for similar content work

**Success Criteria**:
- [ ] All content issues documented with data structure context
- [ ] Troubleshooting guide updated with new content patterns
- [ ] Content agent template enhanced with new safety patterns
- [ ] Future content agents have specific guidance to prevent same issues

**Reference**: Follow [AGENT_SELF_UPDATE_PROTOCOL.md](AGENT_SELF_UPDATE_PROTOCOL.md) exactly
```

---

## 🎯 **CONTEXTUALIZATION DECISION TREE**

### **Step 1: Identify Agent Scope**
```
Agent will work on:
├── Frontend/UI components? → Include UI error patterns
├── Database operations? → Include DB error patterns  
├── API/auth handling? → Include auth error patterns
├── Content filtering/display? → Include content safety patterns
└── File creation/modification? → Include import verification
```

### **Step 2: Select Relevant Warnings**

#### **Always Include (Universal)**
- ✅ Import verification (breaks entire app)
- ✅ Port/server restart instructions

#### **Include If Relevant**
- 🔄 useEffect patterns → **If**: Building React components
- 🛡️ Null safety → **If**: Handling user data or database content
- 🔒 Auth patterns → **If**: Accessing user data or protected routes
- 🗄️ Database safety → **If**: Making database queries
- 📊 Content filtering → **If**: Building search/filter functionality

### **Step 3: Customize Instructions**

Use the templates above, but only include sections relevant to the agent's work.

---

## 📋 **AGENT CREATION CHECKLIST**

### **Before Writing Agent Instructions:**
- [ ] Identify primary scope (UI/DB/API/Content/Process)
- [ ] Select relevant error patterns from troubleshooting guide
- [ ] Choose appropriate template (UI/DB/Content)
- [ ] Customize warnings to agent's specific tasks
- [ ] Remove irrelevant sections to keep instructions focused

### **Required Sections for ALL Agents:**
- [ ] Import verification instructions
- [ ] Restart server procedures
- [ ] How to check if changes work
- [ ] **MANDATORY: Documentation self-update requirements**
- [ ] **MANDATORY: Reference to AGENT_SELF_UPDATE_PROTOCOL.md**

### **Optional Sections (Include If Relevant):**
- [ ] useEffect dependency patterns
- [ ] Null safety patterns  
- [ ] Auth handling patterns
- [ ] Database safety patterns
- [ ] Content validation patterns

### **Documentation Self-Update Requirements (MANDATORY):**
- [ ] Clear instructions for documenting encountered issues
- [ ] Specific requirements for updating troubleshooting guide
- [ ] Agent-type-specific template updates required
- [ ] Success criteria for documentation completion
- [ ] Link to self-update protocol for detailed instructions

---

## 🔄 **MAINTENANCE PROCESS**

### **Automatic Self-Maintenance (Primary Method):**
✅ **Agents automatically update documentation** when they encounter issues
✅ **No manual intervention required** - system improves itself
✅ **Real-time updates** as problems are discovered and solved
✅ **Context-aware improvements** based on actual agent work

### **Manual Maintenance (Secondary Method):**

### **When New Errors Are Discovered (Outside Agent Work):**
1. **Update troubleshooting guide** with new patterns
2. **Determine which agent types** are affected
3. **Update relevant templates** in this document
4. **Review existing agent instructions** for updates needed

### **When Creating New Agent Types:**
1. **Analyze the scope** of work
2. **Map to existing error patterns** using the matrix
3. **Create new template** with mandatory self-update requirements
4. **Document new patterns** for future agents

### **System Health Monitoring:**
- **Track documentation update frequency** - Should decrease over time as system improves
- **Monitor repeat issues** - Same problems recurring indicate documentation gaps
- **Review agent compliance** - Ensure all agents are following self-update protocol
- **Quality control** - Verify documentation updates are helpful and accurate

---

## 🎨 **EXAMPLE: Building a "Practice Planner UI Enhancement Agent"**

### **Scope Analysis:**
- **Primary**: Frontend/UI work
- **Secondary**: Database queries for drill data
- **Tertiary**: Content filtering/search

### **Relevant Warnings:**
- ✅ Import verification (universal)
- ✅ useEffect patterns (UI work)  
- ✅ Null safety (database content)
- ✅ Content filtering safety (search functionality)
- ❌ Skip: Auth patterns (not changing auth)
- ❌ Skip: API creation (not building APIs)

### **Resulting Instructions:**
```markdown
## A4CC - Practice Planner UI Enhancement Architect

### CRITICAL ERROR PREVENTION
[Include UI Template sections for:]
- Import verification 
- useEffect dependencies
- Null safety for drill data
- Content filtering patterns

[Skip auth patterns, API patterns, etc.]
```

---

## 🏆 **SUCCESS METRICS**

### **Agent Effectiveness:**
- ✅ Agents complete tasks without breaking the app
- ✅ Fewer 500 errors and build failures  
- ✅ Faster development cycles (less debugging)
- ✅ Instructions are focused and actionable

### **Continuous Improvement:**
- Track which errors still occur despite warnings
- Identify gaps in contextual guidance
- Refine templates based on real-world usage
- Keep instructions lean but comprehensive

---

**Remember**: The goal is **precise, contextual guidance** that prevents errors without overwhelming agents with irrelevant information. Each agent gets exactly what they need to succeed in their specific scope of work.