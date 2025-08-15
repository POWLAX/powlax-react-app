# 🔍 **Contract Verification Protocol**
## **Ensuring Work Matches the Right Contract**

*Created: 2025-01-16*  
*Status: CRITICAL PROTOCOL*

---

## 🚨 **THE PROBLEM**

**Working on the wrong contract leads to:**
- Wrong features being built
- Scope creep without approval
- Wasted time on unapproved work
- Confusion about what's actually done
- Features that don't match user expectations

---

## ✅ **VERIFICATION REQUIREMENTS**

### **Before Starting ANY Work:**

```typescript
// Master Controller MUST verify
async function verifyContract(task: string, contract: Contract): boolean {
  
  // 1. Check task matches contract scope
  const scopeMatch = contract.scope.every(item => 
    task.includes(item) || item.includes(task)
  );
  
  // 2. Check we're not doing EXTRA work
  const noScopeCreep = !task.includes(
    thingsNotInContract(contract)
  );
  
  // 3. Check contract is still valid
  const stillValid = contract.status === 'APPROVED' && 
                    contract.notSuperseded;
  
  // 4. Check right component
  const rightComponent = task.component === contract.component;
  
  return scopeMatch && noScopeCreep && stillValid && rightComponent;
}
```

### **Verification Checkpoint Messages:**

```markdown
## Starting Work:
"✅ CONTRACT VERIFICATION
- Task: Fix practice planner modals
- Contract: practice-planner-modal-fix-001
- Scope Match: ✅ (Video, Strategy, Lab, Links modals)
- Component: ✅ Practice Planner
- No scope creep: ✅
Proceeding with approved work..."

## Scope Mismatch Detected:
"⚠️ CONTRACT MISMATCH
- Task requested: Add print functionality
- Active contract: practice-planner-modal-fix-001
- Contract scope: Modal fixes only
- Print functionality: NOT IN CONTRACT

Options:
1. Create new contract for print feature
2. Amend existing contract
3. Stay within original scope

What would you like to do?"
```

---

## 📊 **CONTRACT DRIFT DETECTION**

### **Signs You're on Wrong Contract:**

1. **Task doesn't match scope**
   - Contract: "Fix modals"
   - Doing: "Adding new features"
   - 🚨 WRONG CONTRACT

2. **Wrong component**
   - Contract: "Practice Planner"
   - Working on: "Skills Academy"
   - 🚨 WRONG CONTRACT

3. **Superseded contract**
   - Using: "old-contract-001"
   - Should use: "new-contract-002"
   - 🚨 OUTDATED CONTRACT

4. **Unapproved scope creep**
   - Contract: "Fix 4 modals"
   - Doing: "Fix 4 modals + database + print + mobile"
   - 🚨 SCOPE CREEP

---

## 🔄 **CONTINUOUS VERIFICATION**

### **During Work - Regular Checks:**

```markdown
## Every Major Step:
"🔍 CONTRACT CHECK
- Still working on: practice-planner-modal-fix-001
- Current task: Strategy Modal
- In scope: ✅ Yes (modal fix)
- Progress: 2/4 modals complete
Continuing..."

## When User Asks for More:
"🔍 CONTRACT CHECK
- Current contract: practice-planner-modal-fix-001
- New request: Add drill filtering
- In current scope: ❌ No
- Action: Need new contract or amendment"
```

---

## 📋 **CONTRACT SCOPE TRACKING**

### **What's IN Contract:**
```yaml
practice-planner-modal-fix-001:
  included:
    - Fix Video Modal opening
    - Fix Strategy Modal opening
    - Fix Lab Modal opening  
    - Fix Links Modal opening
    - Connect modals to database
    - Mobile responsiveness for modals
  
  NOT_included:
    - Print functionality
    - New features
    - Database schema changes
    - Performance optimization
    - Drill library changes
    - Timeline changes
```

### **Track What's Actually Done:**
```yaml
actual_work_done:
  completed:
    - Video Modal: ✅ Fixed
    - Strategy Modal: ✅ Fixed
    - Lab Modal: ✅ Fixed
    - Links Modal: ✅ Fixed
  
  extra_work_done_without_approval:
    - Print feature: ❌ NOT IN CONTRACT
    - Drill filtering: ❌ NOT IN CONTRACT
    
  status: "SCOPE CREEP DETECTED"
```

---

## 🚦 **VERIFICATION STATES**

### **GREEN: Perfect Match**
```markdown
✅ Work matches contract exactly
✅ No extra features added
✅ Right component
✅ Contract still valid
→ PROCEED
```

### **YELLOW: Minor Deviation**
```markdown
⚠️ Work mostly matches but includes minor extras
⚠️ Same component but expanded scope
→ ASK USER: "Is this addition okay?"
```

### **RED: Wrong Contract**
```markdown
🚨 Work doesn't match contract
🚨 Wrong component entirely
🚨 Major scope creep
→ STOP! Get new contract approval
```

---

## 🎯 **VERIFICATION EXAMPLES**

### **Example 1: Correct Contract**
```
User: "Fix the video modal"
Check: Video modal is in practice-planner-modal-fix-001
Result: ✅ PROCEED
```

### **Example 2: Wrong Contract**
```
User: "Add workout builder"
Check: Workout builder NOT in practice-planner-modal-fix-001
Result: 🚨 STOP - Need new contract
```

### **Example 3: Scope Creep**
```
User: "While you're fixing modals, also add print"
Check: Print NOT in practice-planner-modal-fix-001
Result: ⚠️ PAUSE - Need approval for scope change
```

---

## 📝 **VERIFICATION CHECKLIST**

Before EVERY work session:
- [ ] Load active contract
- [ ] Read the EXACT scope
- [ ] Verify task matches scope
- [ ] Check for scope creep
- [ ] Confirm right component
- [ ] Document verification

During work:
- [ ] Regular scope checks
- [ ] Track what's actually done
- [ ] Flag any deviations
- [ ] Get approval for extras

After work:
- [ ] Verify all work was in scope
- [ ] Document any deviations
- [ ] Update contract status
- [ ] Note lessons learned

---

## ✅ **THIS PREVENTS:**

1. **Working for hours on wrong thing**
2. **Building unapproved features**
3. **Scope creep without permission**
4. **Confusion about what's done**
5. **Mismatch between expectation and delivery**

---

## 🎯 **KEY PRINCIPLE**

**"If it's not in the contract, STOP and ASK!"**

Better to verify 10 times than work on the wrong thing for hours.

**This protocol is MANDATORY for all agents!**