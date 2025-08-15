# POWLAX Practice Planner Development Contract

## Contract Status
- **Created**: January 16, 2025
- **Status**: ACTIVE
- **Priority**: CRITICAL
- **Implementation**: General-purpose sub-agents

## Executive Summary

This contract defines the complete implementation of the POWLAX Practice Planner functionality at `/teams/[teamId]/practice-plans`, migrating from WordPress plugin functionality to React/Next.js while maintaining all core features and improving mobile experience.

## Contract Acknowledgment Requirements

### All Agents Must:
1. **Read and Reference**: `docs/development/POWLAX_PAGE_ERROR_PREVENTION_GUIDE.md` before ANY page modifications
2. **Use General-Purpose Sub-Agents ONLY**: Never use specialized controllers or master controller systems
3. **Follow Simple Implementation**: Use focused, single-purpose general-purpose agents with specific contracts
4. **Test Against Error Guide**: Verify no known issues from error prevention guide before delivery
5. **Update Error Guide**: Document any new error patterns discovered during development

## Core Functionality Requirements (From WordPress Plugin Analysis)

### 1. Practice Information Management
- **Practice Details**:
  - Date picker with calendar widget
  - Start time selector (time input)
  - Duration selector (default 90 minutes for youth)
  - Field selector (Turf, Grass, Indoor, etc.)
  - Setup time toggle (optional pre-practice setup) - Has notes section once in the planner
  - Practice notes/goals (textarea)

### 2. Drill Library System
- **Drill Categories**: 
  - Skill Drills, 1v1 Drills, Competition Drills, Team Drills, etc.
  - Color-coded by category (matching WordPress color system)
- **Drill Information**:
  - Title, duration, description
  - Video URLs (YouTube, Vimeo, Hudl)
  - Lacrosse Lab diagram URLs
  - Custom images - (does not currently have a table or workflow.  Please create plan for implementing through adding a column with a .jsonb containing images from another table.  Create plan for the table titled powlax_images with powlax_image_title, powlax_image_drill_name (Links to the actual drill for drills, powlax_strategy_image_name, links to actal powlax strategy)
  - Game state tags for filtering
  - Favorite status toggle
- **Search & Filter**:
  - Text search across drill names/descriptions
  - Category filter buttons
  - Duration filter (5-60 minutes)
  - Game state filter modal
  - Favorites-only toggle

### 3. Practice Timeline/Canvas
- **Drag & Drop Interface**:
  - Add drills from library to timeline
  - Reorder drills via drag handles
  - Remove drills with confirmation
  - Clone/duplicate drills
  - Parallel drill support (multiple drills at same time)
- **Time Management**:
  - Visual timeline with time stamps
  - Auto-calculate practice duration
  - Duration progress bar (shows used vs available time)
  - Setup time visualization
  - End time calculation
- **Drill Customization**:
  - Edit duration for each drill instance
  - Add/edit drill notes per instance
  - Mark drills as "key focus"

### 4. Modal System
- **Required Modals**:
  - Custom Drill Creation
  - Drill Notes Editor
  - Video Player
  - Lacrosse Lab Viewer
  - Image Gallery
  - Game State Filter
  - Save Practice Plan
  - Load Practice Plans
  - Print Options
  - Practice Templates

### 5. Practice Management
- **Save Functionality**:
  - Save to database with title
  - Auto-save draft support
  - Version history tracking
- **Load Functionality**:
  - Load previous practice plans
  - Search saved plans
  - Filter by date/team
- **Templates**:
  - Pre-built practice templates by age group
  - Custom template creation
  - Template categories

### 6. Print System
- **Print Views**:
  - Detailed practice plan (all notes/drills)
  - Quick reference card (times only)
  - Field-ready format (mobile optimized)
- **Print Options**:
  - Include/exclude drill notes
  - Include/exclude setup time
  - Custom header/footer text

### 7. Mobile Optimization
- **Responsive Design**:
  - Collapsible drill library on mobile
  - Touch-optimized drag & drop
  - Bottom sheet modals on mobile
  - Floating action button for adding drills
- **Field Mode**:
  - Quick timer view
  - Current drill highlight
  - Quick navigation between drills
  - Minimal data usage

## Technical Implementation Requirements

### Database Schema (Supabase) - Detailed Table Usage

#### 1. `powlax_drills` Table
**Purpose**: Main drill library containing all POWLAX-provided drills
**Current Structure**: Basic drill information
**Enhancements Needed**:
- `game_states` JSONB[] - Array of game state tags
- `lab_urls` TEXT[] - Array of Lacrosse Lab diagram URLs
- `video_urls` JSONB - Multiple video platform URLs
- `image_ids` UUID[] - References to powlax_images table

**Implementation Usage**:
- **DrillLibrary Component**: Fetch all drills for browsing
- **Search/Filter**: Query by category, duration, game states
- **DrillCard Display**: Show drill info, videos, diagrams
- **Favorites System**: Join with user_favorites table

#### 2. `user_drills` Table
**Purpose**: User-created custom drills
**Current Structure**: Basic drill info with sharing arrays
**Implementation Usage**:
- **AddCustomDrillModal**: Create new user drills
- **DrillLibrary**: Merge with powlax_drills for complete library
- **Team Sharing**: Filter by team_ids[] for team-specific drills
- **Organization Sharing**: Filter by organization_ids[] for club drills

#### 3. `powlax_strategies` Table
**Purpose**: Strategy library (221 imported records)
**Current Structure**: Complete with video URLs
**Phase 4 Implementation** (Later):
- **StrategiesModal**: Browse and select strategies
- **Drill-Strategy Connection**: Link drills to strategies
- **Practice Building**: Suggest drills based on strategy focus

#### 4. `practice_plans` Table
**Purpose**: Saved practice plans
**Current Structure**: Basic plan info
**Enhancements Needed**:
- `template` BOOLEAN - Mark as reusable template
- `age_group` TEXT - Target age band (8-10, 11-14, 15+)
- `drill_sequence` JSONB - Complete timeline data
- `setup_notes` TEXT - Pre-practice setup instructions
- `version` INTEGER - Version tracking
- `parent_id` UUID - Link to original for versions

**Implementation Usage**:
- **SavePracticeModal**: Store complete practice data
- **LoadPracticeModal**: Retrieve saved plans
- **PracticeTemplateSelector**: Filter templates by age group
- **Version History**: Track changes over time

#### 5. `practice_plan_drills` Table (Junction)
**Purpose**: Link drills to practice plans with instance data
**Structure**:
- `practice_plan_id` UUID
- `drill_id` UUID
- `order_index` INTEGER
- `duration_override` INTEGER - Custom duration for this instance
- `instance_notes` TEXT - Notes specific to this usage
- `is_parallel` BOOLEAN - Running parallel with previous
- `is_key_focus` BOOLEAN - Marked as key drill

**Implementation Usage**:
- **PracticeTimeline**: Render drill sequence
- **Drag & Drop**: Update order_index on reorder
- **Parallel Drills**: Group by time slots
- **Instance Customization**: Store per-use modifications

#### 6. `powlax_images` Table (NEW)
**Purpose**: Centralized image storage for drills and strategies
**Proposed Structure**:
```sql
CREATE TABLE powlax_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drill_id UUID REFERENCES powlax_drills(id),
  user_drill_id UUID REFERENCES user_drills(id),
  strategy_id UUID REFERENCES powlax_strategies(id),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- dimensions, file size, etc.
);

-- Indexes for performance
CREATE INDEX idx_powlax_images_drill ON powlax_images(drill_id);
CREATE INDEX idx_powlax_images_strategy ON powlax_images(strategy_id);
```

**Implementation Usage**:
- **ImageGalleryModal**: Display drill/strategy images
- **DrillCard**: Show thumbnail images
- **AddCustomDrillModal**: Upload images for custom drills
- **Print View**: Include selected images in printout

#### 7. `user_favorites` Table
**Purpose**: Track user's favorite drills
**Current Structure**: User-drill relationships
**Implementation Usage**:
- **DrillLibrary**: Filter to show favorites only
- **DrillCard**: Display/toggle favorite status
- **Quick Actions**: Fast access to frequently used drills

#### 8. `teams` Table
**Purpose**: Team management
**Implementation Usage**:
- **Practice Plans**: Associate plans with teams
- **Drill Sharing**: Control drill visibility
- **Templates**: Team-specific practice templates

#### 9. `organizations` Table
**Purpose**: Club/organization management
**Implementation Usage**:
- **Drill Library**: Organization-wide drill sharing
- **Templates**: Organization standard practices
- **Analytics**: Program-wide usage tracking

#### 10. `practice_templates` Table (NEW)
**Purpose**: Pre-built practice plan templates
**Proposed Structure**:
```sql
CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  age_group TEXT CHECK (age_group IN ('8-10', '11-14', '15+')),
  duration_minutes INTEGER DEFAULT 90,
  category TEXT, -- 'tryout', 'skill_development', 'game_prep', etc.
  drill_sequence JSONB NOT NULL,
  coaching_tips TEXT[],
  equipment_needed TEXT[],
  is_public BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_age_group ON practice_templates(age_group);
CREATE INDEX idx_templates_category ON practice_templates(category);
```

**Implementation Usage**:
- **PracticeTemplateSelector**: Browse and select templates
- **Quick Start**: One-click practice creation
- **Age-Appropriate**: Filter by player age band
- **Customization**: Use template as starting point

### Database Query Patterns

#### Drill Library Query
```typescript
// Fetch drills with favorites
const { data: drills } = await supabase
  .from('powlax_drills')
  .select(`
    *,
    user_favorites!left(id),
    powlax_images!left(*)
  `)
  .order('category', { ascending: true })
  .order('name', { ascending: true });
```

#### Save Practice Plan
```typescript
// Save with drill instances
const { data: plan } = await supabase
  .from('practice_plans')
  .insert({
    title,
    team_id,
    practice_date,
    duration_minutes,
    drill_sequence: timeSlots,
    notes
  })
  .select()
  .single();

// Save drill instances
const drillInstances = timeSlots.flatMap((slot, index) => 
  slot.drills.map(drill => ({
    practice_plan_id: plan.id,
    drill_id: drill.id,
    order_index: index,
    duration_override: drill.duration,
    instance_notes: drill.notes,
    is_parallel: drill.isParallel
  }))
);

await supabase
  .from('practice_plan_drills')
  .insert(drillInstances);

### Component Architecture
```
practice-planner/
├── DrillCard.tsx (Enhanced with all drill data)
├── DrillLibrary.tsx (Full search/filter)
├── PracticeTimeline.tsx (Drag & drop with parallel)
├── PracticeDurationBar.tsx (Visual progress)
├── modals/
│   ├── AddCustomDrillModal.tsx
│   ├── DrillNotesModal.tsx
│   ├── VideoModal.tsx
│   ├── LacrosseLabModal.tsx
│   ├── ImageGalleryModal.tsx
│   ├── GameStateFilterModal.tsx
│   ├── SavePracticeModal.tsx
│   ├── LoadPracticeModal.tsx
│   └── PrintOptionsModal.tsx
└── print/
    ├── PrintablePracticePlan.tsx
    └── PrintStyles.css
```

### State Management Pattern
```typescript
interface PracticePlanState {
  practiceInfo: {
    date: string
    startTime: string
    duration: number
    field: string
    setupTime?: number
    notes: string
  }
  timeSlots: TimeSlot[]
  totalDuration: number
  isDirty: boolean
}
```

## Age Band Considerations

### 8-10 Years (Do It)
- Simplified drill library (fewer options)
- Visual icons for drill types
- Shorter default practice duration (60 min)
- Fun drill names and descriptions
- Large touch targets for mobile
- Simple language in instructions

### 11-14 Years (Coach It)
- Full drill library access
- Emphasis on skill development drills
- 75-90 minute practices
- Competition elements included
- Progress tracking features
- Goal-setting integration

### 15+ Years (Own It)
- Advanced tactics and strategies
- Longer practices (90-120 min)
- Complex parallel drill support
- Team-specific customization
- Leadership development focus
- Analytics and performance metrics

## Supabase RLS (Row Level Security) Policies

### Practice Plans RLS
```sql
-- Users can view their own practice plans
CREATE POLICY "Users can view own practice plans" ON practice_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view team practice plans
CREATE POLICY "Users can view team practice plans" ON practice_plans
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create practice plans for their teams
CREATE POLICY "Users can create team practice plans" ON practice_plans
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('coach', 'assistant_coach', 'admin')
    )
  );
```

### User Drills RLS
```sql
-- Users can view drills shared with their teams
CREATE POLICY "View team shared drills" ON user_drills
  FOR SELECT USING (
    team_ids && (
      SELECT ARRAY_AGG(team_id) FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can view organization shared drills
CREATE POLICY "View organization shared drills" ON user_drills
  FOR SELECT USING (
    organization_ids && (
      SELECT ARRAY_AGG(organization_id) FROM teams
      JOIN team_members ON teams.id = team_members.team_id
      WHERE team_members.user_id = auth.uid()
    )
  );
```

### Images RLS
```sql
-- Public read access for drill/strategy images
CREATE POLICY "Public read for drill images" ON powlax_images
  FOR SELECT USING (drill_id IS NOT NULL OR strategy_id IS NOT NULL);

-- Users can upload images for their custom drills
CREATE POLICY "Users can upload drill images" ON powlax_images
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    user_drill_id IN (
      SELECT id FROM user_drills WHERE created_by = auth.uid()
    )
  );
```

## Error Prevention Requirements

### MANDATORY Checks Before Delivery:
1. **No Infinite Loading**: Verify no auth hooks cause loading spinners
2. **Mock Data First**: Start with mock data, add real data later
3. **Client Components for Dynamic Routes**: Use 'use client' for [teamId] routes
4. **Test with curl**: Verify pages load without browser
5. **Update Error Guide**: Document any new patterns discovered

## Implementation Phases

### Phase 1: Core Functionality (CURRENT PRIORITY)
1. Fix existing page loading issues
2. Implement full drill library with search/filter
3. Complete drag & drop timeline
4. Add all core modals
5. Implement save/load functionality

### Phase 2: Enhanced Features
1. Practice templates system
2. Advanced print options
3. Parallel drill support
4. Auto-save drafts
5. Version history

### Phase 3: Mobile Optimization
1. Field mode interface
2. Offline support
3. Progressive web app features
4. Quick action shortcuts

### Phase 4: Strategies Integration (LATER)
1. Connect drills to strategies
2. Strategy-based practice building
3. Skill progression tracking
4. Analytics and insights

## Sub-Agent Responsibilities

### powlax-backend-architect
- Design drill enhancement schema
- Create practice template system
- Optimize database queries for mobile
- Implement caching strategy

### powlax-frontend-developer
- Build all React components
- Implement drag & drop system
- Create responsive modal system
- Optimize for mobile performance

### powlax-ux-researcher
- Validate coach workflows
- Test mobile field usage
- Gather feedback on print formats
- Analyze age-appropriate interfaces

### BMad Agents
- Provide understanding of coaching workflows
- Define UI text and messaging
- Specify feature priorities
- Guide user experience decisions

## Success Criteria

### Functional Requirements
- [ ] All drills from library can be added to practice
- [ ] Drag & drop reordering works smoothly
- [ ] All modals function correctly
- [ ] Save/load works reliably
- [ ] Print produces field-ready output
- [ ] Mobile interface is fully functional

### Performance Requirements
- [ ] Page loads in under 2 seconds
- [ ] Drag & drop has no lag
- [ ] Search results appear instantly
- [ ] Mobile works on 3G networks

### Quality Requirements
- [ ] No infinite loading spinners
- [ ] No console errors
- [ ] All features work on mobile
- [ ] Passes all error prevention checks

## Testing Protocol

### Before Each Delivery:
```bash
# Verify page loads
curl -s "http://localhost:3000/teams/1/practice-plans" | head -20

# Check for loading issues
curl -s "http://localhost:3000/teams/1/practice-plans" | grep -i "loading"

# Run lint and build
npm run lint && npm run build

# Run Playwright tests
npx playwright test tests/practice-planner
```

## Contract Updates

### When to Update This Contract:
- New error patterns discovered
- Requirements change from user feedback
- Technical limitations found
- New features requested

### Update Process:
1. Document issue/change
2. Update relevant section
3. Update error prevention guide if needed
4. Notify all sub-agents

## Delivery Checklist

### For Every Feature Delivery:
- [ ] Tested against error prevention guide
- [ ] Works on mobile devices
- [ ] No console errors
- [ ] Mock data included for testing
- [ ] Documentation updated
- [ ] Sub-agents notified of changes

---

**Contract Agreement**: By working on Practice Planner features, all agents agree to follow this contract and the error prevention guide.

**Next Action**: Begin Phase 1 implementation focusing on fixing current page issues and implementing core drill library functionality.