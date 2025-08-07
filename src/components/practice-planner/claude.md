# Claude Context: Practice Planner

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working on POWLAX practice planning components*

## ⚠️ **CRITICAL: READ FIRST**
**BEFORE making ANY changes, read `MASTER_CONTRACT.md` in this directory.**
**All modifications must follow the user-approved enhancement contract.**

## 🎯 **What This Area Does**
Core practice planning functionality that enables coaches to create 15-minute practice sessions using POWLAX's drill library, with drag-and-drop timeline interface, parallel activities, and mobile-first design optimized for field usage.

## 🔧 **Key Components**
**Primary Files:**
- `PracticeTimeline.tsx` - Main timeline interface for practice structure
- `DrillLibrary.tsx` - Searchable drill selection with categories and filters
- `DrillCard.tsx` - Individual drill display with essential information
- `PracticeTimelineWithParallel.tsx` - Advanced timeline with parallel activities
- `DrillSelectionAccordion.tsx` - Organized drill browsing by category

**Modal Components:**
- `SavePracticeModal.tsx` - Practice plan persistence
- `LoadPracticeModal.tsx` - Practice plan retrieval
- `StrategiesModal.tsx` - Strategy integration workflow
- `VideoModal.tsx` - Drill video playback

**Supporting Components:**
- `ParallelDrillPicker.tsx` - Multiple simultaneous activities
- Various utility components for timeline management

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- Optimized for 375px+ screens (coaches use phones on field)
- Large touch targets (44px+) for gloved hands in cold weather
- High contrast for bright sunlight visibility  
- Bottom navigation integration on mobile
- Battery-efficient drag and drop interactions

**Age Band Appropriateness:**
- **Do it (8-10):** Simple drill selection, visual timeline, minimal complexity
- **Coach it (11-14):** Progressive skill building, guided practice structure
- **Own it (15+):** Advanced strategies, full customization, complex formations

**Field Usage Optimization:**
- Quick practice creation (15-minute target vs current 45 minutes)
- Offline functionality for areas with poor connectivity
- Weather-resistant interface design
- Emergency modifications during practice

## 🔗 **Integration Points**
**This area connects to:**
- `drills_powlax` table (33+ drill categories and types)
- `strategies_powlax` table (coaching strategies and concepts)
- `practice_plans` table (saved practice sessions)
- User authentication and role-based access
- Skills Academy for drill educational content
- Team management for practice assignments

**Database Relationships:**
- Drills ↔ Strategies ↔ Concepts ↔ Skills (4-tier taxonomy)
- Practice plans linked to teams and coaches
- Progress tracking and usage analytics

**When you modify this area, also check:**
- Drill library search and filtering functionality
- Timeline drag-and-drop interaction accuracy
- Mobile responsiveness across all components
- Integration with video playback systems
- Practice plan persistence and retrieval
- Age-appropriate interface complexity

## 🧪 **Testing Strategy**
**Essential Tests:**
- Drag and drop functionality on mobile devices
- Drill search and filtering accuracy
- Practice plan save/load operations
- Mobile touch interactions with gloves
- Timeline accuracy and time calculations
- Video modal integration and playback

**Performance Tests:**
- Practice creation time (target: <15 minutes total)
- Drill loading and search responsiveness
- Mobile battery impact during extended use
- Offline functionality when connectivity drops

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- Drag and drop can be difficult on small mobile screens
- Practice planning time often exceeds 15-minute target
- Video loading can be slow on field WiFi/cellular
- Complex practice structures confuse younger age bands

**Before Making Changes:**
1. Test drag-and-drop on actual mobile devices
2. Verify 15-minute practice creation workflow
3. Check video loading performance on 3G networks
4. Validate age-appropriate interface complexity
5. Test offline functionality and data persistence
6. Verify integration with drill library search

**Critical Performance Targets:**
- Practice creation: <15 minutes total time
- Drill search: <2 seconds response time
- Mobile interactions: <100ms touch response
- Video loading: <5 seconds on 3G networks

**Coaching Workflow Integration:**
- Supports seasonal planning (pre-season, competitive, off-season)
- Integrates with team roster and skill assessments
- Enables practice modification during live sessions
- Tracks practice effectiveness and player engagement

---
*This file auto-updates when structural changes are made to ensure context accuracy*