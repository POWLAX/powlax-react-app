# POWLAX Practice Planner Implementation Plan

## Plan Status
- **Created**: January 16, 2025
- **Status**: READY FOR EXECUTION
- **Contract**: `/contracts/active/PRACTICE_PLANNER_DEVELOPMENT_CONTRACT.md`
- **Error Guide**: `/docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md`

## Executive Summary

This plan orchestrates the complete implementation of Practice Planner functionality using the POWLAX sub-agent system. BMad agents provide understanding and requirements, while POWLAX agents handle technical implementation.

## Agent Orchestration Strategy

### Phase 1: Requirements Understanding (BMad Agents)
**Lead**: BMad Orchestrator
**Purpose**: Gather complete understanding of what Practice Planner should be

1. **BMad Master**: Extract coaching workflow requirements from technical documentation
2. **BMad Orchestrator**: Define UI text, messaging, and user experience flow
3. **Output**: Complete functional requirements document with UI specifications

### Phase 2: Technical Architecture (POWLAX Backend Architect)
**Lead**: powlax-backend-architect
**Purpose**: Design database schema and API architecture

1. **Database Enhancement**:
   - Add game_states[] to drills table
   - Add lab_urls[] array for multiple Lacrosse Lab diagrams
   - Create practice_templates table
   - Add sharing arrays to practice_plans

2. **API Design**:
   - Drill search/filter endpoints
   - Practice save/load endpoints
   - Template management endpoints
   - Print generation endpoints

3. **Performance Optimization**:
   - Index strategy for mobile queries
   - Caching layer for drill library
   - Offline data sync design

### Phase 3: UX Research & Validation (POWLAX UX Researcher)
**Lead**: powlax-ux-researcher
**Purpose**: Validate coaching workflows and mobile usability

1. **Workflow Analysis**:
   - Map coach practice planning workflow (15-minute target)
   - Identify mobile field usage patterns
   - Define age-appropriate interfaces

2. **Component Requirements**:
   - Drill card information hierarchy
   - Timeline interaction patterns
   - Modal workflow optimization
   - Print format requirements

### Phase 4: Frontend Implementation (POWLAX Frontend Developer)
**Lead**: powlax-frontend-developer
**Purpose**: Build all React components following error prevention guide

#### Component Development Order:

1. **Fix Current Page Issues** (PRIORITY 1):
   ```typescript
   // Remove auth blocking
   // Add mock data
   // Test page loads without errors
   ```

2. **Enhanced Drill Library**:
   - Complete search/filter system
   - Category color coding
   - Duration filters
   - Game state filters
   - Favorites toggle

3. **Practice Timeline Enhancements**:
   - Full drag & drop with SortableJS
   - Parallel drill support
   - Time stamp visualization
   - Duration editing per drill
   - Visual progress indicators

4. **Modal System Complete**:
   - AddCustomDrillModal (enhance existing)
   - DrillNotesModal (per-instance notes)
   - VideoModal (YouTube/Vimeo/Hudl)
   - LacrosseLabModal (diagram viewer)
   - ImageGalleryModal (carousel)
   - GameStateFilterModal
   - PrintOptionsModal

5. **Practice Management**:
   - Auto-save drafts
   - Version history
   - Template selector
   - Team sharing options

6. **Mobile Optimization**:
   - Bottom sheet modals
   - Touch-optimized drag handles
   - Floating action button
   - Field mode interface

### Phase 5: Testing & Validation
**Lead**: POWLAX Master Controller
**Purpose**: Ensure all functionality works without errors

1. **Error Prevention Testing**:
   ```bash
   # Test page loads
   curl -s "http://localhost:3000/teams/1/practice-plans" | head -20
   
   # Check for loading issues
   curl -s "http://localhost:3000/teams/1/practice-plans" | grep -i "loading"
   
   # Run build verification
   npm run lint && npm run build
   
   # Run Playwright tests
   npx playwright test tests/practice-planner
   ```

2. **Mobile Testing**:
   - Test on actual devices
   - Verify touch interactions
   - Check 3G performance
   - Validate print from mobile

3. **Field Testing**:
   - Coach workflow validation
   - Time to create practice (target: 15 min)
   - Print quality verification
   - Mobile usability outdoors

## Implementation Timeline

### Week 1: Foundation & Fixes
- **Day 1-2**: Fix current page loading issues (Frontend Developer)
- **Day 3-4**: Database schema enhancements (Backend Architect)
- **Day 5**: UX research and workflow mapping (UX Researcher)

### Week 2: Core Features
- **Day 6-7**: Enhanced drill library (Frontend Developer)
- **Day 8-9**: Drag & drop timeline (Frontend Developer)
- **Day 10**: Save/load functionality (Backend + Frontend)

### Week 3: Advanced Features
- **Day 11-12**: Complete modal system (Frontend Developer)
- **Day 13**: Practice templates (Backend + Frontend)
- **Day 14-15**: Mobile optimization (Frontend Developer)

### Week 4: Polish & Testing
- **Day 16-17**: Print system enhancement (Frontend Developer)
- **Day 18**: Field mode interface (Frontend Developer)
- **Day 19-20**: Testing and bug fixes (All agents)

## Sub-Agent Task Assignments

### powlax-backend-architect Tasks:
1. Design drill enhancement schema
2. Create practice template tables
3. Optimize queries for mobile
4. Implement caching strategy
5. Design offline sync system

### powlax-frontend-developer Tasks:
1. Fix page loading issues (PRIORITY)
2. Build enhanced drill library
3. Implement drag & drop timeline
4. Create all modal components
5. Optimize for mobile/tablet
6. Implement print system

### powlax-ux-researcher Tasks:
1. Map coaching workflows
2. Test mobile field usage
3. Validate print formats
4. Analyze age-appropriate UI
5. Gather coach feedback

### BMad Agents Tasks:
1. Define UI text and messaging
2. Specify functionality requirements
3. Provide user experience guidelines
4. Prioritize feature development
5. Validate against coaching needs

## Quality Gates

### Before Moving to Next Phase:
- [ ] No infinite loading spinners
- [ ] Page loads in under 2 seconds
- [ ] All console errors resolved
- [ ] Mobile functionality verified
- [ ] Error prevention guide checked

### Before Marking Complete:
- [ ] All contract requirements met
- [ ] Passes all error prevention checks
- [ ] Mobile testing complete
- [ ] Print output validated
- [ ] Coach workflow tested

## Risk Mitigation

### Common Risks & Mitigations:
1. **Loading Issues**: Start with mock data, add real data incrementally
2. **Mobile Performance**: Test on 3G from day one
3. **Complex Interactions**: Build simple version first, enhance gradually
4. **Database Queries**: Use caching, optimize indexes
5. **Print Formatting**: Test across browsers/devices early

## Communication Protocol

### Daily Updates:
- Morning: Review tasks for the day
- Implementation: Document progress in active work sessions
- Evening: Update contract status, log issues

### Issue Escalation:
1. Try standard error prevention patterns first
2. Document new patterns in error guide
3. Update contract if requirements change
4. Notify all sub-agents of changes

## Success Metrics

### Functional Success:
- All drills can be added/removed/reordered
- Practice plans save and load reliably
- Print output is field-ready
- Mobile interface fully functional
- No loading/error issues

### Performance Success:
- Page loads < 2 seconds
- Drag & drop has no lag
- Search results instant
- Works on 3G networks
- Print generation < 3 seconds

### User Success:
- Coaches can plan practice in 15 minutes
- Mobile usage in field conditions
- Age-appropriate interfaces working
- Positive coach feedback

## Next Steps

### Immediate Actions:
1. ✅ Review and approve contract
2. ✅ Update all agents with context
3. ⏳ Begin Phase 1: Fix current page issues
4. ⏳ Start backend schema design in parallel
5. ⏳ Initialize UX research

### To Begin Implementation:
```bash
# 1. Check server status
lsof -i :3000

# 2. Review current page state
curl -s "http://localhost:3000/teams/1/practice-plans" | head -20

# 3. Begin fixing loading issues
# Start with removing auth blocks and adding mock data
```

---

**Plan Status**: Ready for execution pending user approval to begin YOLO mode implementation.