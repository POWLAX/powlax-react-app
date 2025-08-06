# POWLAX Sub Agent Technical Implementation Plan

*Created: 2025-08-06*  
*Purpose: Complete technical blueprint for POWLAX sub agent system implementation*

---

## 🎯 **EXECUTIVE OVERVIEW**

This document provides definitive technical answers and implementation plans for the POWLAX sub agent system, addressing all identified gaps and establishing clear operational procedures for MVP development through production deployment.

**Key Innovations:**
- **Contract First Quality Control**: Adapted from prompting technique for systematic quality gates
- **Structured Agent Communication**: JSON-based context packages with validation
- **Cascading Rollback System**: Automatic recovery with checkpointed states
- **Progressive Enhancement Strategy**: "new-" prefix system for safe feature development

---

## 📋 **CONTRACT FIRST QUALITY CONTROL SYSTEM**

### **Assessment of Contract First Prompting for POWLAX**

The Contract First Prompting technique is **HIGHLY SUITABLE** for POWLAX quality control with adaptations:

**Strengths for POWLAX:**
1. **Intent Clarification**: Forces complete requirements before implementation
2. **95% Confidence Threshold**: Ensures thorough understanding before work begins
3. **Echo Check Validation**: Confirms shared understanding between agents
4. **Structured Escalation**: Clear paths for handling ambiguity

### **POWLAX Contract First Implementation**

```markdown
# POWLAX Feature Contract Protocol

## Phase 1: Gap Analysis (Before Any Code)
Master Controller initiates with sub agent:

1. **Silent Scan for Gaps:**
   - List all missing requirements
   - Identify undefined behaviors
   - Flag integration uncertainties
   - Note performance constraints

2. **Iterative Clarification:**
   - Ask one targeted question at a time
   - Dig into: Purpose, Users, Edge Cases, Mobile Constraints
   - Continue until 95% confidence achieved
   - Document all assumptions made

## Phase 2: Contract Echo Check
Sub agent provides crisp contract summary:

**Deliverable Contract:**
- Feature: [Exact feature being built]
- Users: [Specific user types and age bands]
- Success Criteria: [Measurable outcomes]
- Constraints: [Mobile, performance, integration]
- Quality Gates: [Specific tests that must pass]

**Master Controller Response Options:**
- "LOCK" - Proceed with implementation
- "EDIT" - Modify specific contract items
- "BLUEPRINT" - Request detailed implementation plan
- "RISKS" - Identify and mitigate risk areas

## Phase 3: Quality Gate Checkpoints
Automated gates at each phase:

1. **Planning Gate** (20+ minutes enforced)
   - Requirements documented
   - User stories complete
   - Technical approach defined

2. **Implementation Gate** (Every 15 minutes)
   - Lint passes
   - Build succeeds
   - No import errors

3. **Integration Gate** (Before handoff)
   - All tests pass
   - Mobile responsive verified
   - Performance benchmarks met

4. **Completion Gate** (Before marking done)
   - Documentation updated
   - Rollback procedures defined
   - Next agent briefed
```

---

## 🔄 **MASTER-TO-SUB AGENT COMMUNICATION PROTOCOL**

### **Critical Information Master Agent Must Communicate**

```json
{
  "context_package": {
    "project_context": {
      "philosophy": "Lacrosse is fun when you're good at it",
      "current_branch": "powlax-sub-agent-system",
      "environment": "development|staging|production",
      "active_features": ["practice-planner", "skills-academy"]
    },
    
    "feature_specification": {
      "name": "workout-builder-enhancement",
      "scope": "Skills Academy workout creation interface",
      "user_impact": {
        "coaches": "Create custom workouts in 5 minutes",
        "players": {
          "do_it": "Simple guided workouts",
          "coach_it": "Skill progression paths",
          "own_it": "Advanced customization"
        }
      },
      "mobile_constraints": {
        "min_width": "375px",
        "touch_targets": "44px",
        "outdoor_visibility": "high_contrast",
        "battery_impact": "minimal"
      }
    },
    
    "technical_context": {
      "affected_components": [
        "src/components/skills-academy/workout-builder/*",
        "src/app/(authenticated)/skills-academy/workouts/*"
      ],
      "database_tables": [
        "workout_templates",
        "workout_completions",
        "user_skill_progress"
      ],
      "api_endpoints": [
        "/api/workouts/create",
        "/api/workouts/complete"
      ],
      "dependencies": {
        "shadcn_components": ["Card", "Button", "Select"],
        "external_apis": ["Vimeo for drill videos"],
        "auth_requirements": "Supabase RLS policies"
      }
    },
    
    "coordination_requirements": {
      "parallel_agents": [],
      "sequential_dependencies": ["database-migration-agent"],
      "shared_resources": ["drill_library"],
      "conflict_zones": ["navigation_components"]
    },
    
    "quality_requirements": {
      "performance": {
        "load_time": "<3s on 3G",
        "interaction_latency": "<100ms",
        "bundle_size_impact": "<50KB"
      },
      "testing": {
        "unit_coverage": ">80%",
        "e2e_scenarios": ["create_workout", "complete_workout"],
        "mobile_devices": ["iPhone_375px", "Android_360px"]
      },
      "accessibility": {
        "wcag_level": "AA",
        "keyboard_navigation": true,
        "screen_reader_support": true
      }
    },
    
    "rollback_information": {
      "checkpoint_id": "chk_2025_08_06_001",
      "database_migration": "009_workout_builder.sql",
      "feature_flag": "WORKOUT_BUILDER_V2",
      "recovery_procedure": "See ROLLBACK_PROCEDURES.md#workout-builder"
    }
  }
}
```

### **Sub Agent Response Format**

```json
{
  "agent_response": {
    "agent_id": "powlax-frontend-developer",
    "task_id": "workout-builder-ui-implementation",
    "timestamp": "2025-08-06T10:30:00Z",
    
    "status": {
      "phase": "implementation",
      "progress": 65,
      "confidence": 92,
      "blockers": []
    },
    
    "work_completed": {
      "files_created": [
        "src/components/skills-academy/workout-builder/WorkoutDrillSelector.tsx"
      ],
      "files_modified": [
        "src/components/skills-academy/workout-builder/WorkoutSummary.tsx"
      ],
      "tests_added": [
        "tests/e2e/workout-builder.spec.ts"
      ]
    },
    
    "quality_metrics": {
      "lint_status": "passing",
      "build_status": "passing",
      "test_coverage": 85,
      "mobile_responsive": true,
      "performance_impact": {
        "bundle_size_delta": "+32KB",
        "load_time_impact": "+200ms"
      }
    },
    
    "coordination_needs": {
      "requires_from_others": [],
      "providing_to_others": {
        "powlax-backend-architect": "API contract for workout endpoints"
      },
      "conflicts_detected": []
    },
    
    "next_steps": {
      "immediate": "Complete drill selection interface",
      "after_current": "Integrate with workout completion tracking",
      "estimated_completion": "2025-08-06T14:00:00Z"
    }
  }
}
```

---

## 🎮 **MASTER AGENT PROMPTING STRATEGIES**

### **Effective Sub Agent Prompting Templates**

**Initial Task Assignment:**
```markdown
You are the powlax-frontend-developer sub agent. Your specialized expertise includes React, Next.js 14, TypeScript, Shadcn/UI components, and mobile-first responsive design for lacrosse coaching interfaces.

**YOUR MISSION:** Implement the workout builder enhancement for the Skills Academy feature.

**CONTEXT INHERITANCE:** You have access to the complete POWLAX project context including:
- System architecture: 33+ database tables, Supabase backend, Next.js frontend
- User personas: Coaches (primary), Players (by age band), Parents (support)
- Mobile constraints: 375px+ screens, 44px touch targets, outdoor visibility
- Quality requirements: <3s load time, 80% test coverage, WCAG AA compliance

**SPECIFIC REQUIREMENTS:**
1. Create a drill selection interface that works with gloved hands on mobile devices
2. Implement age-appropriate UI variations (do it: simple, coach it: guided, own it: advanced)
3. Integrate with existing workout_templates and drill_library tables
4. Maintain consistent Shadcn/UI component usage
5. Ensure high contrast for outdoor field visibility

**COORDINATION PROTOCOL:**
- Report progress every 2 hours using the standard JSON response format
- Escalate immediately if confidence drops below 85%
- Coordinate with powlax-backend-architect for API contracts
- Check for conflicts before modifying shared components

**QUALITY GATES:**
Before marking any phase complete, ensure:
- [ ] Lint passes without warnings
- [ ] Build succeeds without errors
- [ ] Mobile responsiveness verified at 375px, 768px, 1024px
- [ ] Age-appropriate interfaces validated
- [ ] Performance targets met (<3s load, <100ms interaction)

**CONTRACT CONFIRMATION:**
Please analyze this task and provide:
1. Your understanding of the requirements (echo check)
2. Any gaps or ambiguities you've identified
3. Your confidence level (must be >95% to proceed)
4. Estimated completion time with milestones

Do not begin implementation until we achieve contract agreement.
```

**Handling Sub Agent Feedback Requests:**
```markdown
I see you've identified [specific issue/ambiguity]. Let me clarify:

**CONTEXT CLARIFICATION:**
[Provide specific missing context]

**DECISION RATIONALE:**
[Explain why this approach was chosen]

**INTEGRATION GUIDANCE:**
[How this fits with other components]

**FALLBACK OPTION:**
If the primary approach doesn't work, implement [alternative approach] instead.

**ESCALATION TRIGGER:**
If you encounter [specific condition], stop work and request human intervention.

Please confirm this addresses your concern and update your confidence level.
```

**Quality Gate Enforcement:**
```markdown
QUALITY GATE CHECKPOINT - Please verify before proceeding:

**AUTOMATED CHECKS:**
```bash
npm run lint && npm run build && npm run test
```

**MANUAL VERIFICATION:**
1. Open the feature on a 375px width device/emulator
2. Test all touch targets are ≥44px
3. Verify high contrast mode for outdoor visibility
4. Test with browser dev tools network throttled to 3G
5. Confirm age-appropriate interface variations work

**PERFORMANCE VALIDATION:**
- Initial load time: [Current: ___ms, Target: <3000ms]
- Interaction response: [Current: ___ms, Target: <100ms]
- Bundle size impact: [Current: ___KB, Target: <50KB]

**ROLLBACK READINESS:**
- [ ] Feature flag configured and tested
- [ ] Database migrations reversible
- [ ] Recovery procedure documented
- [ ] Checkpoint state saved

Only proceed to next phase if ALL checks pass.
```

---

## 🔧 **TECHNICAL IMPLEMENTATION ANSWERS**

### **1. Token Management (200k Window)**

**Solution: Sliding Context Window with Priority Retention**
```markdown
Context Priority Levels:
1. CRITICAL (Always retained):
   - Current task specification
   - Active file contents
   - Immediate dependencies
   
2. IMPORTANT (Retained until 150k):
   - Related component code
   - Recent conversation history
   - Test specifications
   
3. REFERENCE (Pruned first):
   - Historical decisions
   - Completed task logs
   - Documentation excerpts

Pruning Strategy:
- At 180k tokens: Remove REFERENCE items older than 2 hours
- At 190k tokens: Summarize IMPORTANT items
- At 195k tokens: Create checkpoint and start new session
```

### **2. Folder Context System Implementation**

**Solution: Hierarchical Context Loading**
```
/src/components/skills-academy/
├── .context/
│   ├── README.md (component overview)
│   ├── patterns.md (established patterns)
│   ├── dependencies.json (component dependencies)
│   └── test-requirements.md (testing approach)
```

**Auto-Discovery Protocol:**
```javascript
// Context loader for sub agents
function loadContextForPath(path) {
  const contexts = [];
  let currentPath = path;
  
  while (currentPath !== '/') {
    const contextPath = `${currentPath}/.context`;
    if (exists(contextPath)) {
      contexts.push(loadContext(contextPath));
    }
    currentPath = dirname(currentPath);
  }
  
  return mergeContexts(contexts);
}
```

### **3. Branch Strategy ("new-" Prefix System)**

**Solution: Progressive Enhancement Pattern**
```markdown
Feature Development Flow:

1. **Existing Page Enhancement:**
   - Keep original: /skills-academy/workouts/page.tsx
   - Create enhanced: /skills-academy/workouts/new-page.tsx
   - Route testing: Add ?preview=new parameter
   - Gradual migration: Move users progressively

2. **Branch Naming Convention:**
   feature/new-workout-builder     (new features)
   enhance/new-practice-planner    (improvements)
   fix/new-navigation-mobile       (bug fixes)

3. **Merge Strategy:**
   - new-* files reviewed separately
   - Original files untouched until validation
   - Feature flags control activation
   - Rollback = remove new-* files

4. **Promotion Process:**
   new-page.tsx → page.tsx.backup → page.tsx
   (enhanced)     (archive original)  (promoted)
```

### **4. Rollback Procedures**

**Solution: Multi-Layer Rollback System**
```bash
#!/bin/bash
# ROLLBACK_PROCEDURE.sh

# Level 1: Feature Flag Disable (Immediate)
echo "Disabling feature flag..."
supabase functions invoke set-feature-flag \
  --body '{"flag":"WORKOUT_BUILDER_V2","enabled":false}'

# Level 2: Code Rollback (5 minutes)
echo "Rolling back code changes..."
git checkout $LAST_STABLE_CHECKPOINT
npm install
npm run build

# Level 3: Database Rollback (10 minutes)
echo "Rolling back database..."
psql $DATABASE_URL < rollback/009_workout_builder_rollback.sql

# Level 4: Full Recovery (30 minutes)
echo "Full system recovery..."
./scripts/restore-from-backup.sh $BACKUP_ID

# Verification
npm run test:e2e
curl https://api.powlax.com/health
```

### **5. Integration Testing Strategy**

**Solution: Staged Integration Testing**
```markdown
Integration Test Levels:

1. **Component Integration (Every commit):**
   - Test component renders with real data
   - Verify Shadcn/UI component compatibility
   - Check responsive breakpoints

2. **Feature Integration (Every PR):**
   - End-to-end user journey testing
   - Cross-browser compatibility
   - Mobile device testing matrix

3. **System Integration (Pre-deployment):**
   - Full regression suite
   - Performance benchmarking
   - Security scanning
   - Accessibility audit

Parallel Agent Testing:
- Agents create test branches
- Automated merge and test
- Conflict detection before main merge
- Rollback if integration fails
```

### **6. Production Deployment Process**

**Solution: Progressive Deployment Pipeline**
```yaml
# .github/workflows/deploy.yml
name: POWLAX Progressive Deployment

stages:
  - name: Development
    tests: [lint, build, unit]
    deploy: vercel-preview
    
  - name: Staging  
    tests: [e2e, performance, security]
    deploy: staging.powlax.com
    validation: 24-hour soak test
    
  - name: Production Canary
    deploy: 10% traffic
    monitoring: enhanced
    rollback: automatic on errors
    
  - name: Production Full
    deploy: 100% traffic
    monitoring: standard
    alerts: pagerduty
```

### **7. Monitoring & Alerting**

**Solution: Multi-Layer Monitoring**
```javascript
// monitoring-config.js
export const monitoringLayers = {
  agent_performance: {
    metrics: ['task_completion_time', 'quality_gate_passes'],
    alerts: ['completion_time > 4h', 'quality_fails > 2']
  },
  
  system_health: {
    metrics: ['response_time', 'error_rate', 'mobile_performance'],
    alerts: ['p95_response > 3s', 'error_rate > 1%']
  },
  
  user_experience: {
    metrics: ['page_load_time', 'interaction_delay', 'rage_clicks'],
    alerts: ['mobile_load > 5s', 'rage_clicks > 10/min']
  }
};
```

---

## 📚 **NEW FEATURE IMPLEMENTATION GUIDE**

### **Complete Feature Implementation Workflow**

```markdown
# POWLAX Feature Implementation Workflow

## Stage 1: Feature Initiation (Human + Master Controller)
1. Create feature document using FEATURE_TEMPLATE.md
2. Define success criteria and constraints
3. Master Controller performs gap analysis
4. Achieve 95% confidence before proceeding

## Stage 2: Contract Agreement (Master Controller + Sub Agents)
1. Master Controller creates context package
2. Sub agents review and identify gaps
3. Iterative clarification until contract locked
4. All agents confirm understanding

## Stage 3: Implementation (Sub Agents)
1. Sub agents work according to specialty
2. 15-minute commit cycles enforced
3. Quality gates at each checkpoint
4. Progress reported every 2 hours

## Stage 4: Integration (Master Controller)
1. Coordinate sub agent outputs
2. Resolve any conflicts
3. Run integration tests
4. Verify mobile responsiveness

## Stage 5: Validation (All Agents)
1. Complete test suite execution
2. Performance benchmarking
3. Accessibility verification
4. User acceptance testing

## Stage 6: Deployment Preparation
1. Update documentation
2. Create rollback procedures
3. Configure feature flags
4. Prepare monitoring dashboards

## Stage 7: Progressive Rollout
1. Deploy to staging
2. 24-hour soak test
3. Canary deployment (10%)
4. Full production rollout
```

### **Feature Implementation Checklist**

```markdown
## Pre-Implementation (Planning)
- [ ] Feature document created (20+ minutes)
- [ ] User stories defined for all personas
- [ ] Mobile constraints specified
- [ ] Age band variations designed
- [ ] Performance targets set
- [ ] Contract agreement achieved (95% confidence)

## During Implementation
- [ ] 15-minute commit cycles maintained
- [ ] Quality gates passing continuously
- [ ] Mobile responsiveness verified regularly
- [ ] Documentation updated incrementally
- [ ] Coordination log maintained

## Post-Implementation
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Rollback procedures tested
- [ ] Feature flag configured
- [ ] Monitoring dashboards ready
- [ ] Documentation complete

## Deployment Readiness
- [ ] Staging validation complete
- [ ] Canary metrics defined
- [ ] Rollback triggers configured
- [ ] Support team briefed
- [ ] User communications prepared
```

---

## 🎯 **SUCCESS METRICS & VALIDATION**

### **MVP Development Success Criteria**
- **Development Velocity**: 2-3 features per week
- **Quality Gate Pass Rate**: >90% first attempt
- **Mobile Responsiveness**: 100% features work at 375px
- **Integration Success**: <2 conflicts per week
- **Rollback Frequency**: <1 per month

### **Production Readiness Criteria**
- **Test Coverage**: >80% for critical paths
- **Performance**: All pages <3s load on 3G
- **Accessibility**: WCAG AA compliant
- **Documentation**: 100% features documented
- **Monitoring**: All critical paths instrumented

---

## 🚀 **QUICK START: NEW DEVELOPMENT SESSION**

### **Starting Your First Session (Copy & Paste)**

#### **Option 1: YOLO Mode (Fastest)**
```markdown
YOLO MODE ACTIVATED 🚀

Load POWLAX context and start building [feature/fix].
Make confident decisions, fix issues as you encounter them.
Mobile-first, age-appropriate required.
GO!
```

#### **Option 2: Guided Development**
```markdown
I need to build [feature] for POWLAX.
Use powlax-master-controller to coordinate.
Start with Contract First approach for clarity.
```

### **YOLO Mode Activation**
**Simple Activation:** Just add "YOLO mode:" or "YOLO this:" before any request
**When to Use:** Bug fixes, familiar patterns, MVPs, time-sensitive work
**When to Avoid:** Security features, payments, major architecture changes

### **Essential Development Commands**
```markdown
"YOLO mode: [task]"                    # Fast implementation
"Just build it: [feature]"             # Skip clarifications  
"Quick fix: [bug]"                     # Rapid debugging
"YOLO with tests: [feature]"           # Fast but tested
"YOLO production-safe: [task]"         # Quick but quality maintained
```

For complete guide see: `POWLAX_QUICK_START_DEVELOPMENT_GUIDE.md`

---

## 📋 **IMMEDIATE NEXT STEPS**

### **Week 1: Foundation**
1. Implement Contract First protocol in Master Controller
2. Create folder context structure for existing components
3. Set up automated quality gates in CI/CD
4. Document first rollback procedure
5. Test "new-" prefix workflow with simple feature
6. **Practice YOLO mode with simple bug fix**

### **Week 2: Integration**
1. Deploy monitoring infrastructure
2. Create integration test suite
3. Implement progressive deployment pipeline
4. Train team on new workflows
5. Run first multi-agent coordinated feature
6. **Create YOLO mode guidelines for team**

### **Week 3: Validation**
1. Complete system integration test
2. Performance benchmark all features
3. Mobile device testing matrix
4. Update all documentation
5. Prepare for staging deployment
6. **Measure YOLO mode vs Contract First velocity**

---

## 💡 **KEY RECOMMENDATIONS**

### **Critical Success Factors**
1. **Enforce Contract First**: No implementation without 95% confidence
2. **Maintain Quality Gates**: Never skip for expediency
3. **Test Mobile First**: Every feature starts with mobile
4. **Document Everything**: Future agents need context
5. **Monitor Continuously**: Catch issues before users

### **Risk Mitigation**
1. **Always Have Rollback**: Every feature must be reversible
2. **Use Feature Flags**: Control activation separately from deployment
3. **Test in Production**: Canary deployments catch real issues
4. **Keep Checkpoints**: Regular stable states for recovery
5. **Communicate Clearly**: Agents must over-communicate

---

*This implementation plan provides the complete technical foundation for POWLAX sub agent system success from MVP through production deployment.*