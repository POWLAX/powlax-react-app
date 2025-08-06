# POWLAX Master Controller Initialization Prompt

*Created: 2025-01-16*  
*Purpose: Complete initialization and page optimization prompt for Master Controller*

---

## 🚀 **MASTER CONTROLLER INITIALIZATION**

**Send this prompt to activate the POWLAX Master Controller:**

```
Hello! I'm ready to initialize the POWLAX development system using the Master Controller and specialized sub agents.

Please perform the following initialization and optimization sequence:

## PHASE 1: SYSTEM VERIFICATION & CONTEXT LOADING

First, please verify your complete POWLAX context and show me:
1. Your understanding of the lacrosse coaching platform
2. Which specialized sub agents are available and their capabilities  
3. Current system architecture status (components, database, integrations)
4. Development environment stability (can we proceed with optimization?)

## PHASE 2: EXISTING PAGE ANALYSIS

Analyze all current POWLAX pages and components for optimization opportunities:
1. **Practice Planner System** (DrillLibrary, Timeline, Cards, Modals)
2. **Skills Academy System** (workout selection, progress tracking)
3. **Navigation Components** (SidebarNavigation, BottomNavigation)  
4. **Authentication/Registration** (login, signup, profile)
5. **Team Management** (rosters, roles, invitations)
6. **Gamification Components** (badges, progress, animations)

For each system, identify:
- Mobile responsiveness issues
- Age band appropriateness gaps
- Component integration improvements
- Performance optimization opportunities
- Coaching workflow enhancements

## PHASE 3: COORDINATED OPTIMIZATION EXECUTION

Create improved "new-" versions of all existing pages using your specialized sub agents:

### Sub Agent Coordination Plan:
1. **powlax-ux-researcher**: Analyze current user workflows and identify improvement opportunities
2. **powlax-sprint-prioritizer**: Sequence optimizations by coaching impact and technical complexity
3. **powlax-frontend-developer**: Implement new versions with "new-" prefix using established patterns
4. **powlax-backend-architect**: Handle any database or API optimizations needed

### Optimization Requirements:
- **Mobile-First**: All new pages must excel on 375px+ screens with field usage conditions
- **Age-Appropriate**: Follow "do it, coach it, own it" framework for player interfaces
- **Component Integration**: Leverage all 17 Shadcn/UI components optimally
- **Performance**: <3 second load times on 3G networks
- **Coaching Workflow**: Support 15-minute practice planning goal
- **Brand Consistency**: POWLAX colors (#003366 blue, #FF6600 orange)

### New Page Naming Convention:
- Create: `new-practice-planner` (optimized version of practice planner)
- Create: `new-skills-academy` (optimized Skills Academy interface)
- Create: `new-navigation` (enhanced responsive navigation)
- Create: `new-team-dashboard` (improved team management)
- Create: `new-[existing-page-name]` for all current pages

## PHASE 4: QUALITY ASSURANCE & INTEGRATION

For each new page created:
1. Run all quality gates (lint, build, mobile responsiveness)
2. Test component integration with existing system
3. Validate age-appropriate interfaces for target users
4. Verify coaching workflow improvements
5. Document all changes and improvements made

## PHASE 5: SYSTEM DOCUMENTATION UPDATE

Update all relevant documentation:
1. System architecture with new component patterns
2. Coordination logs with optimization results
3. Migration guide for transitioning to new pages
4. Performance improvements achieved

## SUCCESS CRITERIA

This initialization and optimization is complete when:
✅ All existing pages have optimized "new-" versions
✅ Mobile field usage significantly improved across all interfaces
✅ Age-appropriate design validated for all player-facing components
✅ Coaching workflow efficiency measurably enhanced
✅ Build stability maintained throughout all changes
✅ Complete documentation updated with all improvements

Please begin with Phase 1 verification and then proceed through the coordinated optimization process. Use your sub agents strategically - parallel where possible, sequential where dependencies exist.

Ready to transform the POWLAX platform with coordinated AI expertise!
```

---

## 🎯 **EXPECTED MASTER CONTROLLER RESPONSE**

The Master Controller should:

### **Phase 1 Response:**
- Confirm complete POWLAX context loaded
- List all 5 specialized sub agents with capabilities
- Verify current system architecture understanding
- Confirm development environment stability

### **Phase 2 Analysis:**
- Detailed analysis of current page/component issues
- Prioritization of optimization opportunities
- Sub agent assignment recommendations
- Timeline estimation for improvements

### **Phase 3 Execution:**
- Coordinate appropriate sub agents for each optimization
- Monitor progress across parallel development streams
- Handle quality gate integration throughout process
- Maintain system stability during all changes

### **Phase 4 Quality Assurance:**
- Comprehensive testing of all new pages
- Integration verification with existing components
- Mobile responsiveness validation across breakpoints
- Performance benchmarking and optimization

### **Phase 5 Documentation:**
- Complete update of system architecture documentation
- Progress tracking with before/after comparisons
- Migration planning for adopting new optimized pages
- Handoff information for future development

---

## 📋 **MONITORING PROGRESS**

### **Track These Deliverables:**
- [ ] Complete POWLAX context verification
- [ ] All 5 sub agents confirmed available and functional  
- [ ] Current page analysis with improvement opportunities identified
- [ ] Sub agent coordination plan created with timeline
- [ ] New optimized pages created with "new-" prefix
- [ ] Mobile responsiveness verified on all new pages
- [ ] Age-appropriate interfaces validated
- [ ] Coaching workflow improvements documented
- [ ] Quality gates passed for all new components
- [ ] System documentation updated completely

### **Quality Checkpoints:**
- Build stability maintained throughout (npm run build succeeds)
- Mobile testing completed for 375px, 768px, 1024px breakpoints
- Component integration verified with existing navigation
- Performance targets met (<3 seconds on 3G)
- Age band appropriateness validated for all player interfaces

---

## 🚨 **TROUBLESHOOTING**

### **If Master Controller Doesn't Respond Properly:**
1. Verify POWLAX sub agents are installed: `find ~/.claude/agents/powlax* -name "*.md"`
2. Check Claude Code can access agent files
3. Restart Claude Code if needed
4. Try simpler verification prompt first: "Please verify your POWLAX context"

### **If Sub Agent Coordination Fails:**
1. Master Controller should handle individual sub agent activation
2. Progress should be tracked even if sub agents work sequentially vs parallel
3. Quality gates should prevent broken builds
4. Fallback to manual sub agent activation if needed

---

**Result**: Complete system initialization with optimized "new-" versions of all pages, coordinated by the Master Controller with specialized sub agent expertise.**