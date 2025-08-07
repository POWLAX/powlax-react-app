# 📋 **Contract Acknowledgment Protocol**
## **Ensuring Proper Contract Communication**

*Created: 2025-01-16*  
*Status: ACTIVE PROTOCOL*

---

## 🔴 **MANDATORY ACKNOWLEDGMENT RULES**

### **ALWAYS Start With Contract Status**

```markdown
## For NEW Work:
"I need to create a contract for this task.
Let me analyze the requirements..."
[Present contract]
"Do you approve this contract? (Type YES to proceed)"

## For EXISTING Approved Work:
"✅ I found an existing approved contract for this work:
- Contract ID: practice-planner-modal-fix-001
- Approved: 2025-01-16
- Scope: Fix all practice planner modals
Proceeding with implementation using approved contract..."

## For SIMILAR But Different Work:
"I found a similar contract (contract-xxx) but this task has different requirements.
Creating a new contract for approval..."
```

---

## 📊 **Contract Status Messages**

### **1. Previously Approved Work**
```typescript
function acknowledgeExistingContract(contract: Contract) {
  return `
✅ **Using Previously Approved Contract**
- **Contract ID:** ${contract.id}
- **Approved:** ${contract.approvalDate}
- **Scope:** ${contract.scope}
- **Current Status:** ${contract.status}

I'll coordinate the following agents:
- ${contract.assignedAgents.join('\n- ')}

No additional approval needed - proceeding with implementation.
`;
}
```

### **2. New Work Requiring Approval**
```typescript
function requestContractApproval(contract: Contract) {
  return `
📋 **New Contract Requires Approval**

${formatContract(contract)}

**Do you approve this contract?**
- Type "YES" or "APPROVED" to proceed
- Type "MODIFY" to request changes
- Type "NO" to cancel

I will not begin work until you approve.
`;
}
```

### **3. Modified Scope Detection**
```typescript
function detectScopeChange(request: string, existingContract: Contract) {
  return `
⚠️ **Scope Change Detected**

Your request includes elements not in the existing contract:
- Existing scope: ${existingContract.scope}
- New elements: ${identifyNewElements(request)}

Options:
1. Create contract amendment (adds to existing)
2. Create new contract (separate work)
3. Proceed with existing contract only

Which would you prefer?
`;
}
```

---

## 🎯 **Implementation Examples**

### **Example 1: Practice Planner (Approved)**
```
User: "Fix the practice planner modals"

Master Controller:
"✅ Using Previously Approved Contract
- Contract ID: practice-planner-modal-fix-001
- Approved: 2025-01-16 at 14:30
- Scope: Fix Video, Strategy, Lab, Links modals

I'll coordinate:
- Frontend Developer for modal functionality
- Test Specialist for validation
- QA Specialist for quality checks

Proceeding with implementation..."
```

### **Example 2: Skills Academy (New)**
```
User: "Rebuild Skills Academy with quiz interface"

Master Controller:
"📋 New Contract Requires Approval

**CONTRACT: Skills Academy Quiz Interface**
- Goal: Rebuild with sequential drill presentation
- Scope: Quiz-style UI, point tracking, mobile optimization
- Success Criteria:
  - One drill at a time display
  - Point accumulation system
  - Mobile responsive design
  
**Do you approve this contract?** (Type YES to proceed)"

User: "YES"

Master Controller:
"✅ Contract approved! Deploying agents..."
```

---

## 🔄 **Continuous Tracking**

### **During Work**
```markdown
## Progress Updates Should Reference Contract:
"Working on contract practice-planner-modal-fix-001:
- ✅ Video modal fixed
- 🔄 Strategy modal in progress
- ⏳ Lab modal pending
- ⏳ Links modal pending"
```

### **On Completion**
```markdown
## Completion Should Close Contract:
"✅ Contract practice-planner-modal-fix-001 COMPLETED
- All 4 modals functional
- Tests passing
- Quality score: 92/100
- Moving contract to completed status"
```

---

## 🚨 **Common Mistakes to Avoid**

### **❌ DON'T: Start Without Acknowledgment**
```
User: "Fix modals"
Master Controller: [Immediately deploys agents]
```

### **✅ DO: Always Acknowledge First**
```
User: "Fix modals"
Master Controller: "Checking for existing contracts...
✅ Found approved contract practice-planner-modal-fix-001
Proceeding with implementation..."
```

### **❌ DON'T: Assume Approval**
```
User: "Add new feature"
Master Controller: "Starting work on new feature..."
```

### **✅ DO: Always Get Approval for New Work**
```
User: "Add new feature"
Master Controller: "This is new work requiring a contract.
[Present contract]
Do you approve?"
```

---

## 📁 **Contract Storage Locations**

```
/contracts/
├── active/              # Currently being worked on
│   └── practice-planner-modal-fix-001.yaml
├── completed/           # Finished work
│   └── workflow-implementation-001.yaml
├── templates/           # Quick start templates
│   ├── modal-fix-contract.yaml
│   └── database-integration-contract.yaml
└── CONTRACT_APPROVAL_TRACKER.md  # Master list
```

---

## ✅ **Quick Reference Checklist**

Before starting ANY work:
- [ ] Check CONTRACT_APPROVAL_TRACKER.md
- [ ] Determine if contract exists
- [ ] If exists: Acknowledge it
- [ ] If new: Create and get approval
- [ ] Document in session logs
- [ ] Reference contract ID in all updates
- [ ] Update tracker when complete

---

## 🎯 **This Protocol Ensures:**

1. **User Always Knows** what contract is being used
2. **No Surprise Work** starts without acknowledgment
3. **Clear Tracking** of what's approved vs pending
4. **Proper Documentation** for future reference
5. **Scope Control** to prevent feature creep

**This protocol is NOW ACTIVE and must be followed by all agents!**