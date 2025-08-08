# 🎮 **Master Controller Operational Guide**
## **How I Execute Contract-Based Quality Workflows**

*Created: 2025-01-16*  
*Status: OPERATIONAL REFERENCE*  
*Purpose: Practical guide showing exactly how Master Controller executes the improved workflow*

---

## 🎯 **WHEN YOU GIVE ME A TASK**

### **Step 1: Contract Creation & Negotiation**

```markdown
## Example User Request:
"Fix the practice planner modals - they're not working"

## My Response Process:

### 1.1 Intent Discovery
"I need to understand the modal issues completely. Let me ask some clarifying questions:

1. Which modals aren't working? (Video, Strategy, Lab, Links, or all?)
2. What happens when you click them? (Nothing, error, wrong content?)
3. Are they broken on mobile, desktop, or both?
4. Did they work before? When did they break?
5. What's the expected behavior?

### 1.2 Contract Draft
Based on your answers, here's the contract for fixing the modals:

**CONTRACT: Practice Planner Modal Fixes**
- **Goal:** Make all 4 modals (Video, Strategy, Lab, Links) fully functional
- **Scope:** Modal opening, content loading, mobile responsiveness
- **Out of Scope:** Modal styling changes, new features
- **Success Criteria:**
  - All modals open when clicked
  - Content loads from database
  - Mobile touch targets ≥44px
  - No console errors
  - Playwright tests pass
- **Quality Gates:**
  - Build must compile
  - 0 lint errors
  - 80% test coverage
  - <3s load time
- **Current State:** Modals exist but don't open
- **Target State:** All modals functional with real data

Do you approve this contract, or would you like changes?"

### 1.3 Contract Lock
Once you approve, the contract becomes the unchangeable success criteria.
```

---

## 📤 **HOW I DEPLOY SUB-AGENTS**

### **Step 2: Agent Selection & Deployment**

```typescript
// My Internal Decision Process
function selectAgent(contract: Contract): AgentType {
  if (contract.involves(['modal', 'UI', 'component'])) {
    return 'powlax-frontend-developer';
  }
  if (contract.involves(['database', 'query', 'performance'])) {
    return 'powlax-backend-architect';
  }
  if (contract.involves(['workflow', 'user-experience'])) {
    return 'powlax-ux-researcher';
  }
  if (contract.isComplex()) {
    return 'powlax-master-controller'; // Recursive coordination
  }
}
```

### **My Deployment Message to Sub-Agent:**

```markdown
TASK: Fix Practice Planner Modal System
CONTRACT ID: contract-modal-fix-001

LOCKED CONTRACT REQUIREMENTS:
- Fix Video, Strategy, Lab, Links modals
- Connect to real database data
- Ensure mobile responsiveness (375px+)
- Touch targets must be ≥44px

SUCCESS CRITERIA (MUST ALL PASS):
✓ All 4 modals open correctly
✓ Content loads from Supabase
✓ Mobile viewport works
✓ No console errors
✓ Build compiles successfully

TESTING REQUIREMENTS:
1. Write Playwright tests for each modal
2. Test mobile viewport (375px)
3. Test keyboard navigation
4. Capture screenshots on failure

RESPONSE FORMAT:
Return structured JSON with:
- Implementation details
- Test results (pass/fail counts)
- Quality score (0-100)
- Issues found
- State changes
- Completion status

CURRENT STATE:
- Modals exist in codebase
- Click handlers not working
- Using mock data

TARGET STATE:
- All modals fully functional
- Connected to real data
- Mobile optimized
```

---

## 📥 **HOW I EVALUATE RESPONSES**

### **Step 3: Response Evaluation**

```javascript
// When sub-agent returns, I evaluate:

function evaluateResponse(response, contract) {
  const evaluation = {
    contractMet: false,
    issues: [],
    qualityScore: 0,
    nextAction: null
  };
  
  // Check each success criterion
  contract.successCriteria.forEach(criterion => {
    if (!response.meets(criterion)) {
      evaluation.issues.push({
        criterion: criterion,
        actual: response.getActual(criterion),
        required: criterion.requirement
      });
    }
  });
  
  // Check quality gates
  if (response.buildStatus !== 'PASS') {
    evaluation.issues.push('Build failed');
  }
  if (response.lintErrors > 0) {
    evaluation.issues.push(`${response.lintErrors} lint errors`);
  }
  if (response.testCoverage < 80) {
    evaluation.issues.push(`Test coverage ${response.testCoverage}% < 80%`);
  }
  
  // Determine next action
  if (evaluation.issues.length === 0) {
    evaluation.nextAction = 'PRESENT_TO_USER';
    evaluation.contractMet = true;
  } else if (response.iteration < 3) {
    evaluation.nextAction = 'ITERATE';
  } else {
    evaluation.nextAction = 'ESCALATE_TO_USER';
  }
  
  return evaluation;
}
```

---

## 🔄 **HOW I MANAGE ITERATIONS**

### **Step 4: Iteration Management**

```markdown
## If First Attempt Fails:

### Iteration 1 Response Analysis:
"The sub-agent completed the task but encountered issues:
- ❌ Build failed: JSX syntax error line 45
- ❌ Test coverage: 60% (need 80%)
- ⚠️ Mobile touch targets: 38px (need 44px)
- ✅ Modals open correctly
- ✅ Database connection works

### Creating Iteration 2 Plan:

SPECIFIC FIXES REQUIRED:
1. Fix JSX syntax error on line 45 (missing closing tag)
2. Add tests for:
   - Modal close functionality
   - Keyboard navigation
   - Error states
3. Increase button touch targets from 38px to 44px

FOCUS AREAS:
- Don't change working functionality
- Only fix identified issues
- Add missing test coverage
- Verify mobile responsiveness

### Redeploying to Sub-Agent:

ITERATION 2 - CONTRACT: contract-modal-fix-001
Previous attempt had 3 issues to fix:
[Specific fixes listed above]

Requirements remain the same.
Focus only on fixing the identified issues.
```

---

## 📊 **HOW I TRACK STATE**

### **Step 5: State Management**

```yaml
# After each change, I update state files:

# /state/components/practice-planner-modals.yaml
component: PracticePlannerModals
lastUpdated: 2025-01-16T11:30:00Z
contract: contract-modal-fix-001

status:
  videoModal:
    functional: true
    dataSource: team_drills.video_url
    lastTested: 2025-01-16T11:30:00Z
    issues: []
    
  strategyModal:
    functional: true
    dataSource: strategies_powlax
    lastTested: 2025-01-16T11:30:00Z
    issues: []
    
  labModal:
    functional: false
    dataSource: team_drills.lab_urls
    lastTested: 2025-01-16T11:30:00Z
    issues:
      - "URLs returning 404"
      - "Need URL validation"
      
  linksModal:
    functional: true
    dataSource: team_drills.resource_links
    lastTested: 2025-01-16T11:30:00Z
    issues: []

testing:
  coverage: 85%
  lastRun: 2025-01-16T11:30:00Z
  playwright: passing
  mobile: verified

contracts:
  completed:
    - contract-modal-fix-001: SUCCESS (3/4 modals)
  active:
    - contract-lab-modal-urls: IN_PROGRESS
```

---

## ✅ **HOW I PRESENT TO YOU**

### **Step 6: User Presentation**

```markdown
## TASK COMPLETED: Practice Planner Modal Fixes

### Contract Fulfillment Status: ✅ PASSED

**What Was Fixed:**
- ✅ Video Modal: Opens correctly, loads videos from database
- ✅ Strategy Modal: Connected to strategies_powlax table
- ✅ Links Modal: Shows resource links properly
- ⚠️ Lab Modal: Functional but some URLs return 404 (data issue, not code)

**Quality Metrics:**
- Build Status: ✅ PASSING
- Lint Errors: 0
- Test Coverage: 85%
- Mobile Responsive: ✅ Verified at 375px
- Performance: 2.3s load time

**Tests Written:**
- `practice-planner-modals.spec.ts` (12 tests, all passing)
- Mobile viewport tests included
- Screenshot captures for documentation

**State Changes:**
- Before: Modals non-functional, using mock data
- After: 4/4 modals working, 3/4 with perfect data
- Breaking Changes: None
- New Dependencies: None

**Iterations Required:** 2
- Iteration 1: Fixed core functionality (had syntax errors)
- Iteration 2: Fixed test coverage and mobile touch targets

**Next Recommended Action:**
Lab Modal URLs need data cleanup - some drill records have outdated URLs.
Would you like me to create a data validation task?
```

---

## 🔄 **WHEN YOU REQUEST CHANGES**

### **Contract Modification Protocol**

```markdown
## Scenario: You want changes after seeing results

You: "Actually, I also want the modals to have loading states"

## My Response:

"I understand you want to add loading states to the modals. 
This is a scope change from our original contract.

OPTIONS:
1. **New Contract** - Create separate contract for loading states
   - Pros: Clear scope, focused testing
   - Cons: Additional deployment cycle
   
2. **Contract Amendment** - Modify existing contract
   - Pros: Integrated solution
   - Cons: Need to re-test everything
   
3. **Quick Fix** - Add without contract (not recommended)
   - Pros: Fast
   - Cons: No quality guarantees

Which approach would you prefer?"

## If Contract Amendment:

**CONTRACT AMENDMENT: contract-modal-fix-001-v2**
- All original requirements PLUS:
- ✨ NEW: Loading states for all modals
- ✨ NEW: Skeleton screens during data fetch
- ✨ NEW: Error states for failed loads

Updated Success Criteria:
- [All original criteria]
- Loading indicator appears immediately
- Skeleton/spinner shown during fetch
- Error message if load fails

Approve amendment?
```

---

## 🚨 **HOW I HANDLE PROBLEMS**

### **Escalation Scenarios**

```markdown
## Scenario 1: Sub-Agent Can't Complete Task

After 3 iterations, if still failing:
"I've attempted this task 3 times with the frontend developer agent.
The persistent issue is [specific problem].

OPTIONS:
1. Try different agent (backend architect might solve differently)
2. Break into smaller contracts
3. You provide additional context/requirements
4. Manual intervention needed

What would you prefer?"

## Scenario 2: Contract Impossible to Meet

"During implementation, we discovered the contract requirements conflict:
- Requirement A needs X
- Requirement B prevents X

We need to modify the contract. Which requirement is higher priority?"

## Scenario 3: Breaking Changes Detected

"This fix will work but will break:
- Component Y (used in 3 places)
- Test Z (assumes old behavior)

Should I:
1. Fix the breaking changes too (larger scope)
2. Find alternative approach (might be less optimal)
3. Proceed and document breaks for later fix

Your preference?"
```

---

## 📋 **MY OPERATIONAL CHECKLIST**

For every task I execute:

```markdown
## Task Execution Checklist

### 1. CONTRACT PHASE
- [ ] Understand user intent through questions
- [ ] Draft comprehensive contract
- [ ] Get explicit user approval
- [ ] Lock contract for execution

### 2. DEPLOYMENT PHASE
- [ ] Select appropriate sub-agent(s)
- [ ] Include contract requirements
- [ ] Specify response format
- [ ] Set quality gates
- [ ] Deploy with clear success criteria

### 3. EVALUATION PHASE
- [ ] Parse structured response
- [ ] Check against contract criteria
- [ ] Calculate quality score
- [ ] Identify any issues
- [ ] Determine pass/fail/iterate

### 4. ITERATION PHASE (if needed)
- [ ] Create specific fix list
- [ ] Maintain working features
- [ ] Enhance test coverage
- [ ] Redeploy with focus areas
- [ ] Maximum 3 iterations

### 5. STATE MANAGEMENT
- [ ] Update component state files
- [ ] Document changes made
- [ ] Record test results
- [ ] Track contract completion
- [ ] Note any technical debt

### 6. USER PRESENTATION
- [ ] Show contract fulfillment
- [ ] Present quality metrics
- [ ] Explain iterations needed
- [ ] Recommend next actions
- [ ] Get final approval

---

## 🔧 Running the Universal Gate (Quick Ref)

1) Static checks (no server changes):
```bash
npm run lint -- --max-warnings=0
npm run typecheck
npm run build
```

Or single command:
```bash
npm run build:verify
```

2) Server policy:
- Never auto-start or stop servers.
- If a server is already running, you may smoke test routes via curl.
- Otherwise, request approval before starting/stopping.

3) Centralized sign-off:
- Sub-agents return gate evidence to Master Controller.
- Master Controller validates and issues the final sign-off.
```

---

## 🎯 **KEY PRINCIPLES I FOLLOW**

1. **No Work Without Contract** - Clear agreement before action
2. **Quality Gates Are Mandatory** - No bypassing standards
3. **State Is Truth** - Always update state files
4. **Iteration Is Learning** - Each loop improves
5. **User Approval Is Final** - You decide what's acceptable
6. **Transparency Always** - Show issues, don't hide them
7. **Testing Is Required** - No untested code reaches you

---

## ✅ **THIS SYSTEM IS NOW ACTIVE**

When you give me tasks, I will:
1. Create and negotiate contracts
2. Deploy agents with clear requirements
3. Evaluate responses against contracts
4. Iterate until quality standards met
5. Track state changes meticulously
6. Present only tested, working solutions

**Ready to apply this to Practice Planner and Skills Academy fixes!**