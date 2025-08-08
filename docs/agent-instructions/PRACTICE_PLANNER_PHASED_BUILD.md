# Practice Planner Phased Build Plan for Sub-Agents

**Created**: January 2025  
**Purpose**: Systematic phased approach for POWLAX sub-agents to complete the Practice Planner enhancements  
**Critical**: Follow stability rules at ALL times - NO lazy loading, NO framer-motion

---

## 🎯 Overview

This document provides a structured, phased approach for completing the Practice Planner enhancements. Each phase includes specific tasks for sub-agents, testing requirements, and success criteria.

---

## 📋 Phase 1: UI Polish & Modal Styling (2-3 days)

### Objective
Complete all visual updates and ensure consistent white background styling across all modals.

### Tasks for powlax-frontend-developer

#### 1.1 Update Remaining Modal Backgrounds
```typescript
// Update these modals to white backgrounds:
- LoadPracticeModal.tsx
- FilterDrillsModal.tsx
- VideoModal.tsx
- LacrosseLabModal.tsx
- AddCustomDrillModal.tsx
- AddCustomStrategiesModal.tsx

// Apply this pattern:
className="bg-white text-[#003366]"
// Buttons: bg-gray-100 hover:bg-gray-200
// Input borders: border-gray-300
```

#### 1.2 Mobile Header Reorganization
```typescript
// In page.tsx header section:
// Mobile: Stack title above tagline
<div className="md:hidden">
  <h1 className="text-xl font-bold text-[#003366]">
    POWLAX PRACTICE PLANNER
  </h1>
  <p className="text-sm text-gray-600 mt-1">
    Finally: A practice planner built by a lacrosse coach who actually gets it.
  </p>
  <div className="flex gap-2 mt-3">
    [Action buttons]
  </div>
</div>
```

#### 1.3 Timeline Card Mobile Optimization
```typescript
// DrillCard.tsx mobile layout:
{isMobile && (
  <div className="border rounded-lg p-3">
    <div className="flex items-center justify-between mb-2">
      <button>[▲]</button>
      <span>3:00 PM</span>
      <input type="number" value={duration} />
      <span>min</span>
      <button>[▼]</button>
    </div>
    <h4 className="font-medium">{drill.name}</h4>
    <div className="flex gap-2 mt-2">
      [Icon buttons]
    </div>
  </div>
)}
```

### Testing Checklist for Phase 1
```bash
# Visual tests
- [ ] All modals have white backgrounds
- [ ] Text is navy (#003366) or black
- [ ] Placeholders are gray-400
- [ ] Mobile header stacks correctly
- [ ] Timeline cards compact on mobile

# Functional tests
npm run lint
npm run typecheck
npm run build

# Manual verification
- [ ] Open each modal and verify styling
- [ ] Test on mobile viewport (375px)
- [ ] Check touch targets are ≥44px
```

### Success Criteria
- ✅ All modals styled consistently with white backgrounds
- ✅ Mobile header properly reorganized
- ✅ Timeline cards optimized for mobile viewing
- ✅ No TypeScript or linting errors

---

## 📋 Phase 2: Setup Time Enhancement (1-2 days)

### Objective
Implement the setup time notes editing functionality.

### Tasks for powlax-frontend-developer

#### 2.1 Create SetupTimeModal Component
```typescript
// New file: SetupTimeModal.tsx
'use client'

interface SetupTimeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (notes: string[]) => void
  defaultNotes?: string[]
}

export default function SetupTimeModal({...}) {
  // Modal with textarea for notes
  // Each line becomes a bullet point
  // Example placeholder text:
  // - Set up goals 30 yards apart
  // - Have teams chosen
  // - Players line up bags and zip them
}
```

#### 2.2 Update Setup Time Display
```typescript
// In PracticeTimelineWithParallel.tsx
const getSetupTime = () => {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-yellow-800">Setup Time</h4>
          <p className="text-sm text-yellow-600">Arrive by {setupStartTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-yellow-800">
            {setupTime} min
          </span>
          <button onClick={openSetupModal} className="p-1 hover:bg-yellow-100 rounded">
            <Edit className="h-4 w-4 text-yellow-700" />
          </button>
        </div>
      </div>
      {setupNotes && (
        <ul className="mt-3 space-y-1 text-sm text-yellow-700">
          {setupNotes.map((note, i) => (
            <li key={i}>• {note}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Testing Checklist for Phase 2
```bash
# Functional tests
- [ ] Setup time modal opens/closes correctly
- [ ] Notes save and persist
- [ ] Notes display as bullet points
- [ ] Edit button shows on hover
- [ ] Auto-save includes setup notes

# Integration tests
- [ ] Setup notes included in print preview
- [ ] Setup notes persist through page refresh
- [ ] Setup notes saved to practice plan
```

### Success Criteria
- ✅ Setup time notes modal fully functional
- ✅ Notes display in setup time block
- ✅ Notes persist through auto-save
- ✅ Notes appear in print preview

---

## 📋 Phase 3: Print Functionality Refinement (1 day)

### Objective
Complete all print functionality updates with new branding and layout.

### Tasks for powlax-frontend-developer

#### 3.1 Update PrintablePracticePlan Component
```typescript
// Updates needed:
1. Change tagline to: "Stop Guessing. Train Smarter. Win Together."
2. White background for drill containers
3. Display actual drill notes
4. Remove safety reminders section
5. Remove coach signatures section
6. Include setup time notes if present
```

#### 3.2 Print Layout Structure
```typescript
// PrintablePracticePlan.tsx structure:
<div className="printable-practice-plan bg-white">
  <header>
    <h1>POWLAX Practice Plan</h1>
    <p>Stop Guessing. Train Smarter. Win Together.</p>
  </header>
  
  <section className="practice-info">
    [Date, Time, Field, Duration]
  </section>
  
  {setupTime && (
    <section className="setup-notes">
      [Setup time and notes]
    </section>
  )}
  
  <section className="timeline">
    {timeSlots.map(slot => (
      <div className="drill-container bg-white border">
        [Time] [Drill Name]
        {drill.notes && <p>{drill.notes}</p>}
      </div>
    ))}
  </section>
  
  {selectedStrategies.length > 0 && (
    <section className="strategies">
      <h3>Reference Strategies</h3>
      [Strategy cards by game phase]
    </section>
  )}
</div>
```

### Testing Checklist for Phase 3
```bash
# Print preview tests
- [ ] New tagline displays correctly
- [ ] Drill containers have white backgrounds
- [ ] Drill notes are visible
- [ ] Setup time notes included
- [ ] Strategies section appears if selected
- [ ] No safety reminders or signatures

# Cross-browser tests
- [ ] Chrome print preview
- [ ] Safari print preview
- [ ] Mobile print functionality
```

### Success Criteria
- ✅ Print preview matches new design specifications
- ✅ All content properly formatted for printing
- ✅ Mobile print functionality works
- ✅ PDF export maintains formatting

---

## 📋 Phase 4: Video & Lab Modal Fixes (2 days)

### Objective
Ensure video playback and Lacrosse Lab iframes work correctly.

### Tasks for powlax-frontend-developer

#### 4.1 Fix Video Modal
```typescript
// VideoModal.tsx fixes:
1. Ensure Vimeo embeds work
2. Add loading state
3. Handle missing videos gracefully
4. Optimize for mobile viewing

// Implementation:
const VideoModal = ({ videoUrl, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true)
  
  const getEmbedUrl = (url: string) => {
    // Parse Vimeo URL and return embed format
    // Handle various URL formats
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {loading && <LoadingSpinner />}
      <iframe
        src={getEmbedUrl(videoUrl)}
        onLoad={() => setLoading(false)}
        className="w-full h-[60vh] md:h-[70vh]"
        allowFullScreen
      />
    </Modal>
  )
}
```

#### 4.2 Fix Lacrosse Lab Modal
```typescript
// LacrosseLabModal.tsx fixes:
1. Ensure iframes are interactive
2. Implement carousel for multiple URLs
3. Remove titles (just show iframes)
4. Enable play buttons within diagrams

// Implementation:
const LacrosseLabModal = ({ labUrls, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        <iframe
          src={labUrls[currentIndex]}
          className="w-full h-[60vh]"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="flex justify-between mt-4">
          <button onClick={handlePrevious}>Previous</button>
          <span>{currentIndex + 1} / {labUrls.length}</span>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </Modal>
  )
}
```

### Testing Checklist for Phase 4
```bash
# Video modal tests
- [ ] Vimeo videos load and play
- [ ] Loading state displays
- [ ] Mobile responsive sizing
- [ ] Fullscreen works

# Lacrosse Lab tests
- [ ] Iframes are interactive
- [ ] Carousel navigation works
- [ ] Play buttons within diagrams work
- [ ] Mobile touch gestures work
```

### Success Criteria
- ✅ Videos play correctly in modal
- ✅ Lacrosse Lab diagrams are interactive
- ✅ Carousel navigation smooth
- ✅ Mobile experience optimized

---

## 📋 Phase 5: Final Integration & Performance (1 day)

### Objective
Optimize performance and ensure all features work together seamlessly.

### Tasks for powlax-backend-architect & powlax-frontend-developer

#### 5.1 Performance Optimizations
```typescript
// Optimize these areas:
1. Video loading for 3G networks
2. Auto-save debouncing
3. Drill search indexing
4. Image lazy loading (CSS-based, not dynamic imports)
```

#### 5.2 Integration Testing
```typescript
// Test complete user flows:
1. Create practice from scratch
2. Add drills and strategies
3. Edit setup time
4. Save and reload
5. Print preview
6. Mobile workflow
```

### Testing Checklist for Phase 5
```bash
# Performance tests
- [ ] Page loads <3 seconds
- [ ] Drill search <2 seconds
- [ ] Auto-save <100ms
- [ ] Mobile interactions <100ms

# Integration tests
- [ ] Complete practice creation workflow
- [ ] Save/load cycle works
- [ ] Print includes all elements
- [ ] Mobile experience smooth

# Playwright E2E tests
npx playwright test practice-planner
```

### Success Criteria
- ✅ All features working together
- ✅ Performance targets met
- ✅ No console errors
- ✅ E2E tests passing

---

## 🧪 Testing Protocol After Each Phase

### Required Tests
```bash
# 1. Code quality
npm run lint
npm run typecheck

# 2. Build verification
npm run build

# 3. Manual testing
- Test on desktop (1024px)
- Test on tablet (768px)
- Test on mobile (375px)

# 4. Stability check
rm -rf .next
npm run dev
curl -I http://localhost:3000/teams/1/practice-plans

# 5. E2E tests (if applicable)
npx playwright test practice-planner
```

### Regression Testing
After each phase, verify:
- [ ] Tab switching still works
- [ ] Auto-save still triggers
- [ ] Drill categorization correct
- [ ] Strategy grouping works
- [ ] No lazy loading introduced
- [ ] No framer-motion added
- [ ] All 'use client' directives present

---

## 👥 Sub-Agent Responsibilities

### powlax-frontend-developer
- Lead on UI implementation
- Ensure stability rules followed
- Test mobile responsiveness
- Implement all component changes

### powlax-backend-architect
- Optimize data queries
- Ensure auto-save efficiency
- Handle video URL parsing
- Performance monitoring

### powlax-ux-researcher
- Validate UI changes with coaching workflows
- Test 15-minute practice creation goal
- Verify mobile field usability
- Gather feedback on enhancements

### powlax-master-controller
- Coordinate phase transitions
- Ensure testing completed
- Monitor stability throughout
- Manage deployment

---

## 🚀 Deployment Strategy

### After Each Phase
1. Deploy to staging environment
2. Run smoke tests
3. Get user feedback (if possible)
4. Document any issues
5. Fix before next phase

### Final Deployment
1. Complete all phases
2. Full regression testing
3. Performance verification
4. User acceptance testing
5. Production deployment

---

## 📊 Success Metrics

### Technical Metrics
- Zero lazy loading violations
- No framer-motion usage
- 100% stability maintained
- All tests passing

### User Experience Metrics
- Practice creation <15 minutes
- Mobile usability score >90%
- Auto-save reliability 100%
- Print quality professional

### Business Metrics
- Coach satisfaction increased
- Practice plan usage up 50%
- Mobile adoption >60%
- Support tickets reduced

---

**This phased approach ensures systematic completion of the Practice Planner enhancements while maintaining absolute stability throughout the process.**