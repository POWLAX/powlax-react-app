# A4CC - Practice Planner Strategy Enhancement Architect

**Agent Purpose**: Enhance the existing sophisticated practice planner with strategy-driven drill discovery and template management based on membership tiers.

**Development Environment**: Next.js development server running at `http://localhost:3000`

**Priority**: HIGH - Builds on existing strong foundation to deliver core coaching value

---

## 🎯 **Agent Mission**

Transform the existing practice planner from drill-browsing to strategy-driven planning. Implement the user's vision where "coaches should pick strategies and receive prompts to sort the drills by what contributes to it. For instance, if the coach selects the 4-3 Alpha Clear and Cuse motion offense, they should get prompts for 4 corner 1v1s and 1v1+1 to begin cuse and scrapping and 'Best Drill Ever' for clearing."

---

## 📍 **Current State Analysis**

### **Existing Practice Planner Strengths** ✅
- **Sophisticated Interface**: `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` (12KB, 326 lines)
- **Advanced Features**: Drill library, timeline, parallel drills, duration calculations
- **Database Integration**: Real Supabase data connection with `useDrills` hook
- **Template System**: Save/load functionality exists
- **Mobile Optimized**: Bottom sheet modals, floating action buttons

### **Strategy System Foundation** ✅
- **Strategy Browser**: `/src/app/(authenticated)/strategies/page.tsx` (16KB, 415 lines)
- **9 Game Phases**: Face Off, Transition Offense/Defense, Settled Offense/Defense, Man Up/Down, Ride, Clear
- **Strategy Database**: Comprehensive strategy content with drill connections
- **Lacrosse Lab Integration**: Strategy diagrams and visual aids

### **Missing Strategy-Practice Integration** ❌
- No strategy-first drill discovery
- No intelligent drill recommendations based on strategy selection
- No strategy-practice plan templates
- No membership tier-based template limits

---

## 🎯 **Implementation Requirements**

### **Phase 1: Strategy-Driven Drill Discovery (2-3 hours)**

#### **Enhanced Practice Planner Interface**

**New Components to Create**:
```
/src/components/practice-planner/strategy-integration/
├── StrategySelector.tsx          # Strategy selection modal
├── StrategyDrillRecommendations.tsx  # Intelligent drill suggestions
├── StrategyPlanTemplate.tsx      # Strategy-based plan templates
├── DrillStrategyTags.tsx         # Show strategy connections on drill cards
└── StrategyProgressTracker.tsx   # Track strategy coverage in practice
```

**Modified Components**:
```
/src/components/practice-planner/
├── DrillLibrary.tsx             # Add strategy filtering and recommendations
├── PracticeTimelineWithParallel.tsx  # Show strategy context for drills
└── PracticePlansPage.tsx        # Integrate strategy-first workflow
```

#### **Strategy Selection Workflow**

**User Flow Enhancement**:
```
Current: Practice Date → Drill Library → Select Drills
Enhanced: Practice Date → Strategy Focus → Recommended Drills → Build Practice
```

**Strategy Selector Interface**:
```
┌─────────────────────────────────────────────────┐
│ Select Practice Focus Strategies                 │
├─────────────────────────────────────────────────┤
│ Game Phase: [Settled Offense ▼]                │
│                                                 │
│ Primary Strategies (Select 1-2):               │
│ ☐ 4-3 Alpha Clear                              │
│ ☐ Cuse Motion Offense                          │
│ ☐ 2-3-1 Motion Offense                        │
│                                                 │
│ Secondary Focus (Optional):                     │
│ ☐ Ground Ball Recovery                          │
│ ☐ Transition Defense                           │
│                                                 │
│ [Generate Drill Recommendations]               │
└─────────────────────────────────────────────────┘
```

#### **Intelligent Drill Recommendations**

**Strategy-Drill Mapping Logic**:
```typescript
const strategyDrillMappings = {
  "4-3 Alpha Clear": {
    essential: [
      "4 Corner 1v1s",
      "Best Drill Ever", 
      "Ground Ball to Clear"
    ],
    supporting: [
      "Defensive Footwork",
      "Outlet Passing",
      "Communication Drills"
    ],
    progression: [
      "6v6 Clearing",
      "Pressure Clearing",
      "Clear to Score"
    ]
  },
  "Cuse Motion Offense": {
    essential: [
      "1v1+1 Dodge Drill",
      "Cuse Motion Fundamentals",
      "Off Ball Movement"
    ],
    supporting: [
      "Pick Setting",
      "Ball Movement",
      "Finishing Drills"
    ]
  }
}
```

**Recommendation Display**:
```
┌─────────────────────────────────────────────────┐
│ Recommended Drills for: 4-3 Alpha Clear        │
├─────────────────────────────────────────────────┤
│ 🎯 ESSENTIAL DRILLS (Add these first)          │
│ ┌─────────────────────────────────────────────┐ │
│ │ 4 Corner 1v1s        [+ Add] 📹 📋 ⭐     │ │
│ │ Duration: 8 min      Difficulty: ●●●○○     │ │
│ │ #clearing #1v1 #groundball                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 💪 SUPPORTING DRILLS (Build fundamentals)      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Best Drill Ever      [+ Add] 📹 📋        │ │
│ │ Duration: 12 min     Difficulty: ●●●●○     │ │
│ │ #clearing #pressure #communication         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🚀 PROGRESSION DRILLS (Advanced application)   │
│ [Show More...]                                 │
└─────────────────────────────────────────────────┘
```

### **Phase 2: Template Management by Membership Tier (1-2 hours)**

#### **Membership Tier Template Limits**

**Template Quota System**:
```typescript
const templateLimits = {
  "confidence_coaching_kit": { personal: 3, team: 0, organization: 0 },
  "team_hq_leadership": { personal: 3, team: 0, organization: 0 },
  "team_hq_activated": { personal: 5, team: 0, organization: 0 },
  "club_os_growth": { personal: 3, team: 3, organization: 3 },
  "club_os_command": { personal: 5, team: 5, organization: 5 }
}
```

**Template Management Interface**:
```
┌─────────────────────────────────────────────────┐
│ Practice Plan Templates                          │
├─────────────────────────────────────────────────┤
│ Personal Templates (3/5 used) [+ Create New]   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 4-3 Clear Focus Practice    [Edit] [Copy]   │ │
│ │ Strategies: 4-3 Alpha Clear, Ground Balls   │ │
│ │ Duration: 90 min | Last used: 3 days ago    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Team Templates (2/5 used) [+ Create New]       │
│ ┌─────────────────────────────────────────────┐ │
│ │ Cuse Motion Development     [Edit] [Copy]   │ │
│ │ Created by: Coach Johnson | Shared to team  │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Organization Templates (Club OS Command)        │
│ [View Organization Templates...]               │
└─────────────────────────────────────────────────┘
```

#### **Template Creation Enhancement**

**Strategy-Based Template Builder**:
```
┌─────────────────────────────────────────────────┐
│ Create Practice Template                         │
├─────────────────────────────────────────────────┤
│ Template Name: [_________________________]      │
│ Template Type: ○ Personal ● Team ○ Organization │  
│                                                 │
│ Focus Strategies:                               │
│ [+ Add Strategy] [4-3 Alpha Clear] [x]         │
│                  [Cuse Motion] [x]             │
│                                                 │
│ Auto-Generated Drill Sequence:                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Warm-up (10 min)                        │ │
│ │ 2. 4 Corner 1v1s (8 min) - 4-3 Clear      │ │
│ │ 3. 1v1+1 Dodge (10 min) - Cuse Motion     │ │
│ │ 4. Best Drill Ever (12 min) - Clearing    │ │
│ │ 5. 6v6 Scrimmage (25 min) - Application   │ │
│ │ 6. Cool Down (5 min)                       │ │
│ └─────────────────────────────────────────────┘ │  
│                                                 │
│ [Customize Sequence] [Save Template]           │
└─────────────────────────────────────────────────┘
```

### **Phase 3: Advanced Strategy Integration (1 hour)**

#### **Strategy Coverage Tracking**

**Practice Analysis Dashboard**:
```typescript
interface StrategyPracticeCoverage {
  strategyId: string
  strategyName: string
  lastPracticed: Date
  practiceCount: number
  essentialDrillsCovered: number
  totalEssentialDrills: number
  masteryLevel: 'Introduction' | 'Development' | 'Mastery'
}
```

**Coverage Visualization**:
```
┌─────────────────────────────────────────────────┐
│ Strategy Development Progress                    │
├─────────────────────────────────────────────────┤
│ 4-3 Alpha Clear                                 │
│ ████████░░ 80% Mastery | Last: 2 days ago      │
│ Essential Drills: 4/5 covered                  │
│                                                 │
│ Cuse Motion Offense                             │
│ ████░░░░░░ 40% Development | Last: 1 week ago   │
│ Essential Drills: 2/5 covered                  │
│ 💡 Recommendation: Focus on off-ball movement   │
│                                                 │
│ [View Detailed Analysis]                       │
└─────────────────────────────────────────────────┘
```

#### **Contextual Drill Information**

**Enhanced Drill Cards in Practice Timeline**:
```
┌─────────────────────────────────────────────────┐
│ 4 Corner 1v1s                    8 min    [⋮]  │
├─────────────────────────────────────────────────┤
│ 🎯 Supports: 4-3 Alpha Clear                   │
│ 💡 Focus: Ground ball recovery → outlet pass   │
│ 📋 Key Points: Low hips, protect possession    │
│                                                 │
│ Strategy Context:                               │
│ "This drill develops the fundamental 1v1       │
│ skills needed for effective clearing when       │
│ pressured by the ride."                        │
│                                                 │
│ [Edit Notes] [📹 Video] [📋 Lab] [⭐ Favorite] │
└─────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation Details**

### **Strategy-Drill Relationship Database**

#### **Enhanced Database Queries**
```typescript
// Get drills by strategy with relevance scoring
const getDrillsByStrategy = async (strategyIds: string[]) => {
  const { data, error } = await supabase
    .from('drills')
    .select(`
      *,
      drill_strategy_relationships!inner (
        strategy_id,
        relevance_score,
        drill_type
      ),
      strategies!drill_strategy_relationships.strategy_id (
        name,
        game_phase
      )
    `)
    .in('drill_strategy_relationships.strategy_id', strategyIds)
    .order('drill_strategy_relationships.relevance_score', { ascending: false })
    
  return data
}
```

#### **Template Storage Enhancement**
```typescript
interface PracticePlanTemplate {
  id: string
  name: string
  created_by: string
  template_type: 'personal' | 'team' | 'organization'
  focus_strategies: string[]
  drill_sequence: {
    drill_id: string
    duration: number
    notes?: string
    strategy_context?: string
  }[]
  membership_tier: string
  created_at: string
  usage_count: number
}
```

### **Strategy Recommendation Engine**

#### **Intelligent Drill Suggestions**
```typescript
const generateDrillRecommendations = async (
  strategies: string[],
  practiceDuration: number,
  teamLevel: string
) => {
  const recommendations = {
    essential: [],
    supporting: [],
    progression: []
  }
  
  for (const strategyId of strategies) {
    const drills = await getDrillsByStrategy([strategyId])
    
    // Categorize drills by relevance and difficulty
    drills.forEach(drill => {
      const category = categorizeDrill(drill, teamLevel)
      recommendations[category].push({
        ...drill,
        strategyContext: getStrategyContext(drill, strategyId)
      })
    })
  }
  
  return recommendations
}
```

### **Template Quota Management**

#### **Usage Tracking**
```typescript
const checkTemplateQuota = async (userId: string, templateType: string) => {
  const user = await getUserWithMembership(userId)
  const limits = templateLimits[user.membership_tier]
  
  const currentCount = await supabase
    .from('practice_plan_templates')
    .select('id')
    .eq('created_by', userId)
    .eq('template_type', templateType)
    .then(({ data }) => data?.length || 0)
    
  return {
    current: currentCount,
    limit: limits[templateType],
    canCreate: currentCount < limits[templateType]
  }
}
```

---

## 🎨 **UI/UX Requirements**

### **Strategy-First Workflow**

**Enhanced Practice Planner Header**:
```
┌─────────────────────────────────────────────────┐
│ 📅 Practice: March 15, 2024  🕒 4:00 PM        │
│ ⏱️ Duration: 90 min  🏟️ Field: Turf           │
│                                                 │
│ 🎯 Strategy Focus: [+ Select Strategies]       │
│ [4-3 Alpha Clear] [x]  [Cuse Motion] [x]       │
│                                                 │
│ 💡 Strategy Coverage: 2 active, 3 need practice│
│ [View Strategy Analysis]                       │
└─────────────────────────────────────────────────┘
```

### **Drill Discovery Enhancement**

**Strategy-Filtered Drill Library**:
```
┌─────────────────────────────────────────────────┐
│ Drill Library - Strategy Mode                   │
├─────────────────────────────────────────────────┤
│ Showing drills for: 4-3 Alpha Clear            │
│ [All Drills] [Essential] [Supporting] [Advanced]│
│                                                 │
│ 🎯 ESSENTIAL FOR 4-3 ALPHA CLEAR               │
│ ┌─────────────────────────────────────────────┐ │
│ │ 4 Corner 1v1s        [+ Add] 📹 📋 ⭐     │ │
│ │ "Core clearing skill - ground ball recovery"│ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 💪 SUPPORTING DRILLS                           │
│ [Show 8 more...]                              │
│                                                 │
│ [Switch to Browse All Drills]                 │
└─────────────────────────────────────────────────┘
```

### **Template Management UI**

**Template Selection with Quota Display**:
```
┌─────────────────────────────────────────────────┐
│ Load Practice Template                          │
├─────────────────────────────────────────────────┤
│ 👤 Personal Templates (3/5 used)               │
│ ┌─────────────────────────────────────────────┐ │
│ │ ● 4-3 Clear Focus        90 min   [Load]   │ │
│ │   Strategies: Clear, Ground Balls           │ │
│ │   Used 5 times | Last: 3 days ago          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 👥 Team Templates (2/3 available)              │
│ ┌─────────────────────────────────────────────┐ │
│ │ ● Offensive Development  120 min  [Load]   │ │
│ │   By: Coach Johnson | 12 uses              │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🏢 Organization Templates (Club OS)            │
│ [Browse Organization Library...]               │
│                                                 │
│ [Create New Template]                          │
└─────────────────────────────────────────────────┘
```

---

## ✅ **Acceptance Criteria**

### **Phase 1 Complete When**:
- [ ] Coach can select focus strategies before building practice
- [ ] System recommends relevant drills based on strategy selection
- [ ] Drill recommendations are categorized (Essential, Supporting, Advanced)
- [ ] Strategy context appears on drill cards in timeline
- [ ] Recommendations work for user's specific examples (4-3 Alpha Clear → 4 Corner 1v1s)

### **Phase 2 Complete When**:
- [ ] Template creation/usage respects membership tier limits
- [ ] Templates can be personal, team, or organization level
- [ ] Template quotas match user specifications (Leadership: 3, Activated: 5, etc.)
- [ ] Strategy-based templates auto-generate logical drill sequences
- [ ] Template sharing works within permission boundaries

### **Phase 3 Complete When**:
- [ ] Strategy coverage tracking shows mastery progress
- [ ] Practice analysis identifies under-practiced strategies
- [ ] Drill cards show strategy context and focus points
- [ ] System provides intelligent next-practice recommendations

---

## 🚀 **Immediate Action Items**

### **Start Here** (Next 30 minutes):
1. **Add strategy selector to practice planner header**
2. **Create basic strategy-drill mapping for 4-3 Alpha Clear**
3. **Test recommendation display for user's specific example**

### **Core Strategy Integration** (Next 90 minutes):
1. **Build complete strategy-drill recommendation engine**
2. **Implement essential/supporting/advanced categorization**
3. **Add strategy context to drill timeline cards**
4. **Test with multiple strategy combinations**

### **Template Management** (Next 60 minutes):
1. **Implement membership tier quota checking**
2. **Build template creation with strategy focus**
3. **Add template sharing based on organizational structure**
4. **Test quota enforcement across all membership levels**

---

## 🔍 **Testing & Validation**

### **Strategy Recommendation Testing**
- [ ] "4-3 Alpha Clear" suggests "4 Corner 1v1s" and "Best Drill Ever"
- [ ] "Cuse Motion Offense" suggests "1v1+1" and progression drills
- [ ] Multiple strategies combine recommendations intelligently
- [ ] Strategy context makes sense on drill cards

### **Template Quota Testing**
- [ ] Confidence Coaching Kit limited to 3 personal templates
- [ ] Team HQ Activated allows 5 personal templates
- [ ] Club OS Command allows 5 personal + 5 team + 5 organization
- [ ] Quota enforcement prevents creation beyond limits
- [ ] Template sharing respects permission boundaries

### **User Experience Testing**
- [ ] Strategy-first workflow feels natural and efficient
- [ ] Drill recommendations save coaches time
- [ ] Template system reduces practice planning effort
- [ ] Strategy coverage tracking motivates balanced development

---

## 📚 **Resources & References**

### **Existing Implementation Patterns**
- Study `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx` for current planner structure
- Review `/src/components/practice-planner/DrillLibrary.tsx` for drill display patterns
- Reference `/src/hooks/usePracticePlans.ts` for template management

### **Strategy System Integration**
- Use `/src/app/(authenticated)/strategies/page.tsx` for strategy data patterns
- Leverage existing strategy-drill relationships in database
- Maintain consistency with strategy browser interface

### **Database Schema References**
- Check `/docs/existing/v3-supabase-tables-list.md` for strategy-drill relationships
- Review migration files for template storage structure
- Use existing practice plan schema as foundation

---

## 🎯 **Success Metrics**

- **Coach Efficiency**: Strategy-based planning reduces practice prep time by 50%
- **Strategy Development**: Teams practice more balanced strategy coverage
- **Template Usage**: 80% of coaches use templates instead of building from scratch
- **User Satisfaction**: Coaches report strategy recommendations match their needs
- **System Integration**: Strategy planner connects seamlessly with existing features

The key insight: Transform practice planning from "what drills should I do?" to "how do I develop these strategies?" - making the practice planner a strategic development tool rather than just a drill organizer!