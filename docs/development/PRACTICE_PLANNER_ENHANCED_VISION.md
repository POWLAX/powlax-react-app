# Practice Planner Enhanced Vision & Implementation Guide

**Created**: January 2025  
**Status**: IN PROGRESS 🚧  
**Purpose**: Complete specification for the enhanced Practice Planner with tabbed interface and improved UX

---

## 🎯 Vision Statement

The POWLAX Practice Planner transforms the coaching experience from a 45-minute planning burden to a 15-minute intuitive workflow. It provides coaches with instant access to both drills and strategies in a unified tabbed interface, enabling them to build comprehensive practice plans that work seamlessly on the field with mobile devices.

---

## 🏗️ Architecture Overview

### Core Components Structure
```
practice-planner/
├── Main Page (page.tsx)
│   ├── DrillLibraryTabbed (Unified tabbed interface)
│   │   ├── Drills Tab
│   │   │   ├── Filter System (game phases, drill types)
│   │   │   ├── Search Functionality
│   │   │   ├── Favorites Accordion (real-time)
│   │   │   ├── Custom Drills Accordion
│   │   │   └── Drill Type Categories
│   │   └── Strategies Tab
│   │       ├── Game Phase Organization
│   │       ├── Strategy Cards
│   │       └── Modal Triggers
│   ├── Strategy Display Area
│   │   └── StrategyCard components (grouped by phase)
│   ├── Practice Schedule Container
│   │   ├── Duration Bar
│   │   ├── Practice Info Accordion
│   │   └── Timeline (PracticeTimelineWithParallel)
│   └── Mobile Bottom Navigation
│       └── "+ Add to Plan" button
```

### Data Flow
1. **Auto-Save System**: Every 3 seconds to localStorage
2. **State Management**: React hooks with instant updates
3. **Tab Synchronization**: Drill/Strategy selection coordination
4. **Mobile Selection**: Checkbox-based with batch operations

---

## 📱 User Interface Specifications

### Desktop Layout (≥768px)

#### Header Section
```
POWLAX Practice Planner
"Finally: A practice planner built by a lacrosse coach who actually gets it."
[Template] [Load] [Strategies] [Save] [Print] [Refresh]
```

#### Main Content Area
- **Left Panel (70%)**: Practice schedule with strategies display
- **Right Sidebar (30%)**: Tabbed Drill/Strategy library
- **Strategies Display**: Thin cards above practice schedule
- **Practice Info**: Collapsible accordion under duration bar

#### Tabbed Library Interface
```
[Drills] | [Strategies]
─────────────────────────
[Filter] [Add Custom] 
[🔍 Search...]
─────────────────────────
▼ Favorites (3)
▼ Custom Drills (5)
▼ Ground Ball (12)
▼ Passing (8)
...
```

### Mobile Layout (<768px)

#### Reorganized Header
```
POWLAX PRACTICE PLANNER
───────────────────────
"Finally: A practice planner 
built by a lacrosse coach 
who actually gets it."
───────────────────────
[Print] [Save] [Load]
```

#### Bottom Navigation
```
[=====================================]
[        + Add to Plan               ]
[=====================================]
         ▲ (swipe for nav)
```

#### Mobile Drill Selection Modal
- Full-screen overlay (80vh)
- Checkbox selection instead of plus buttons
- "Drills to Add" accordion for batch operations
- Tab switching validation with prompts

---

## 🎨 Design System

### Color Palette
- **Primary**: #003366 (Navy) - Headers, primary actions
- **Accent**: #FF6600 (Orange) - CTAs, highlights
- **Background**: White (#FFFFFF) - All modals and cards
- **Text Primary**: #1a1a1a (Near black)
- **Text Secondary**: #6b7280 (Gray)
- **Borders**: #e5e7eb (Light gray)

### Typography
- **Headers**: Font-semibold, text-lg to text-xl
- **Body**: Font-normal, text-sm to text-base
- **Labels**: Font-medium, text-sm
- **Buttons**: Font-medium, text-sm

### Component Styling

#### Cards (Drills/Strategies)
```css
- Background: white
- Border: 1px solid #e5e7eb
- Border-radius: 8px (rounded-lg)
- Padding: 12px (p-3)
- Hover: background-color: #f9fafb
```

#### Modals
```css
- Background: white (not dark blue)
- Text: #003366 (navy) or #1a1a1a (black)
- Placeholders: #9ca3af (gray-400)
- Buttons: Light gray bg with black text
```

#### Buttons
```css
Primary:
- Background: #003366
- Text: white
- Hover: #002244

Secondary:
- Background: #f3f4f6
- Text: #1a1a1a
- Hover: #e5e7eb
```

---

## 🔧 Functional Specifications

### Drill Organization System

#### Categories Hierarchy
1. **Favorites** (Dynamic, real-time updates)
2. **Custom Drills** (User-created)
3. **By Drill Type** (Parsed from drill_types field)
   - Ground Ball
   - Passing
   - Shooting
   - Defense
   - Transition
   - etc.

#### Drill Card Display
```
┌─────────────────────────────┐
│ Drill Name                  │
│ ⭐ 🎥 🔗 🧪                 │
│ [Custom/POWLAX badge]       │
│                        [+]  │
└─────────────────────────────┘
```
- Title spans full width (no hashtags)
- Icons only show if content exists
- Clean, minimal design

### Strategy Integration

#### Strategy Selection Flow
1. User clicks strategy in Strategies tab
2. Strategy appears as thin card above practice schedule
3. Cards group by game phase automatically
4. Video/Lab/Image modals accessible from card

#### Strategy Card Display (Desktop)
```
[Face-Off] Quick Face-Off Win  🎥 🧪 ✕
[Face-Off] Wing Play Setup     🎥    ✕
```

#### Strategy Card Display (Mobile)
```
┌─────────────────────────────┐
│ Quick Face-Off Win          │
│ Face-Off                    │
│ [🎥] [🧪]              [✕] │
└─────────────────────────────┘
```

### Timeline Enhancements

#### Desktop Timeline Card
```
┌──────┬────────────────────────┐
│ 3:00 │ Ground Ball Box Drill  │
│  ▲   │ [🎥] [🔗] [🧪]        │
│ 10min│ [Edit Notes...]       │
│  ▼   │                        │
└──────┴────────────────────────┘
```

#### Mobile Timeline Card
```
┌─────────────────────────────┐
│ [▲] 3:00 PM | 10 min [▼]   │
├─────────────────────────────┤
│ Ground Ball Box Drill       │
│ [🎥] [🔗] [🧪]             │
└─────────────────────────────┘
```
- Time controls move to top on mobile
- Compact design for 4-5 drills visible

### Setup Time Notes

#### Enhanced Setup Time Block
```
┌─────────────────────────────┐
│ Setup Time - 15 min    [✏️] │
│ Arrive by 2:45 PM          │
├─────────────────────────────┤
│ Notes:                      │
│ • Set up goals 30 yards    │
│ • Have teams chosen         │
│ • Players line up bags      │
└─────────────────────────────┘
```

### Auto-Save Implementation

```javascript
// Save every 3 seconds after any change
const practiceData = {
  practiceDate,
  startTime,
  duration,
  field,
  timeSlots,
  selectedStrategies,
  practiceNotes
}
localStorage.setItem(`practice-plan-${teamId}`, JSON.stringify(practiceData))
```

### Print Functionality Updates

#### Updated Print Layout
- Header: "POWLAX Practice Plan"
- Tagline: "Stop Guessing. Train Smarter. Win Together."
- White background for drill containers
- Display actual drill notes
- Remove: Safety reminders, coach signatures

---

## 📊 Data Models

### Drill Model
```typescript
interface Drill {
  id: string
  name: string
  duration: number
  drill_types?: string // Comma-separated
  category?: string
  videoUrl?: string
  lab_urls?: string[] | string
  custom_url?: string
  source: 'powlax' | 'user'
  isFavorite?: boolean
}
```

### Strategy Model
```typescript
interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string // Game phase
  vimeo_link?: string
  lacrosse_lab_links?: any
  thumbnail_urls?: any
  source: 'powlax' | 'user'
}
```

### Practice State Model
```typescript
interface PracticeState {
  practiceDate: string
  startTime: string
  duration: number
  field: string
  timeSlots: TimeSlot[]
  selectedStrategies: Strategy[]
  practiceNotes: string
  setupTime?: {
    duration: number
    notes: string[]
  }
}
```

---

## 🚀 Implementation Priorities

### Phase 1: Core Functionality ✅
- [x] Tabbed interface for Drills/Strategies
- [x] Strategy card display system
- [x] Practice info accordion
- [x] Remove field mode
- [x] Auto-save to localStorage

### Phase 2: UI Polish 🚧
- [ ] Setup time notes modal
- [ ] Timeline mobile optimization
- [ ] Modal styling updates (white backgrounds)
- [ ] Print functionality improvements
- [ ] Mobile header reorganization

### Phase 3: Enhanced Features 📋
- [ ] Video modal fixes
- [ ] Lacrosse Lab iframe carousel
- [ ] Drill sorting refinements
- [ ] Strategy filtering by game phase
- [ ] Export to PDF functionality

---

## 🧪 Testing Requirements

### Functional Tests
- [ ] Drill/Strategy tab switching
- [ ] Auto-save triggers every 3 seconds
- [ ] Mobile checkbox selection works
- [ ] Strategy cards display correctly
- [ ] Print preview shows updated format

### Mobile-Specific Tests
- [ ] Bottom navigation "Add to Plan" button
- [ ] Swipe-up navigation menu
- [ ] Checkbox selection in drill library
- [ ] Timeline cards display properly
- [ ] Touch targets ≥44px

### Performance Benchmarks
- Practice creation: <15 minutes
- Drill search: <2 seconds
- Auto-save: <100ms
- Page load: <3 seconds
- Mobile interaction: <100ms response

---

## 🔒 Stability Requirements

### MUST Follow Rules
1. **NO lazy loading** - Direct imports only
2. **NO framer-motion** - CSS transitions only
3. **Keep 'use client'** directives on all components
4. **Direct modal imports** - No dynamic loading
5. **Test after EVERY change**

### Safe Patterns
```typescript
// ✅ Direct imports
import DrillLibraryTabbed from './DrillLibraryTabbed'
import StrategyCard from './StrategyCard'

// ✅ CSS transitions
className="transition-all duration-200"

// ✅ Client components
'use client'
export default function Component() { ... }
```

---

## 📝 Agent Instructions Update

### For POWLAX Frontend Developer
- Implement UI using Shadcn/UI components with white backgrounds
- Ensure all touch targets are ≥44px for mobile
- Use direct imports only (NO lazy loading)
- Apply POWLAX brand colors consistently

### For POWLAX Backend Architect
- Optimize drill_types parsing for categorization
- Ensure strategy queries include all game phases
- Implement efficient auto-save debouncing

### For POWLAX UX Researcher
- Validate 15-minute practice creation goal
- Test mobile usability with coaches on field
- Verify age-appropriate complexity levels

### For POWLAX Master Controller
- Coordinate tabbed interface implementation
- Ensure stability rules are followed
- Manage phased rollout of enhancements

---

## 🎯 Success Metrics

### User Experience
- Practice creation time: <15 minutes (from 45)
- Mobile usability score: >90%
- Coach satisfaction: >4.5/5 stars

### Technical Performance
- Page stability: 100% (no crashes)
- Auto-save reliability: 99.9%
- Mobile response time: <100ms

### Business Impact
- Coach retention: +30%
- Practice plan usage: +50%
- Mobile adoption: >60% of sessions

---

## 📚 Related Documentation

- [`PRACTICE_PLANNER_STABILITY_GUIDE.md`](./PRACTICE_PLANNER_STABILITY_GUIDE.md) - Stability rules
- [`/src/components/practice-planner/claude.md`](../../src/components/practice-planner/claude.md) - Component context
- [`POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md`](./POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md) - Error prevention

---

**This document represents the complete vision for the enhanced Practice Planner, combining stability with powerful new features that coaches need on the field.**