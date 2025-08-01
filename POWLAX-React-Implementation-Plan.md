# POWLAX React Implementation Plan

## Current State Analysis

### WordPress Plugin Architecture (23,000+ lines)
- **Main Plugin**: `powlax-drills.php` (2,193 lines) - Core orchestrator
- **Frontend SPA**: `planner.js` (10,777 lines) - Complex drag-and-drop practice planner
- **Comprehensive CSS**: `planner.css` (6,749 lines) - Complete responsive styling system
- **Security Framework**: Multi-layer security with rate limiting, CSRF protection
- **Database**: WordPress custom post types with optimized indexes
- **API**: REST endpoints + AJAX handlers for real-time interactions

### Current React App Status
- **Basic Structure**: Next.js 15 + React 19 + Tailwind CSS 4
- **Database**: Supabase configured but minimal schema
- **Components**: Basic drill library with search/filter functionality
- **Missing**: Practice planner, strategic depth, user management, gamification

## 🎯 Implementation Strategy

### Phase 1: Core Infrastructure Setup (Week 1)

#### 1.1 Supabase Schema Migration
Migrate WordPress data structure to Supabase with enhancements:

```sql
-- Enhanced Drills Table (from WordPress _drill_* meta fields)
CREATE TABLE drills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER CHECK (duration_minutes BETWEEN 1 AND 60),
  category TEXT NOT NULL,
  age_bands TEXT[] DEFAULT '{}',
  game_states TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  
  -- Video/Media URLs (from WordPress meta)
  video_url TEXT,
  custom_url TEXT,
  lacrosse_lab_urls JSONB DEFAULT '[]', -- 5 URLs from _drill_lab_url_1-5
  diagram_urls TEXT[] DEFAULT '{}',
  drill_images UUID[] DEFAULT '{}', -- Reference to storage
  
  -- Enhanced fields for strategic layer
  coaching_points TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  setup_instructions TEXT,
  variations TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Strategic Enhancement Tables
CREATE TABLE strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- 'offensive', 'defensive', 'transition'
  complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
  min_age_band TEXT,
  video_reference_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  teaching_points TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT, -- 'shooting', 'dodging', 'ground_balls', etc.
  ball_state TEXT CHECK (ball_state IN ('with_ball', 'without_ball', 'transition')),
  development_focus TEXT[] DEFAULT '{}', -- 'speed', 'accuracy', 'decision_making'
  progression_levels JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationship Tables for Strategic Layer
CREATE TABLE drill_strategies (
  drill_id UUID REFERENCES drills(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  relevance TEXT CHECK (relevance IN ('primary', 'secondary')) DEFAULT 'primary',
  age_adaptation TEXT,
  coaching_emphasis TEXT,
  PRIMARY KEY (drill_id, strategy_id)
);

CREATE TABLE drill_concepts (
  drill_id UUID REFERENCES drills(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  coaching_points TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  PRIMARY KEY (drill_id, concept_id)
);

CREATE TABLE drill_skills (
  drill_id UUID REFERENCES drills(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  progression_level INTEGER CHECK (progression_level BETWEEN 1 AND 5),
  focus_percentage INTEGER CHECK (focus_percentage BETWEEN 1 AND 100),
  integration_tips TEXT,
  progression_path TEXT,
  PRIMARY KEY (drill_id, skill_id)
);

-- Age Band Spectrum System
CREATE TABLE age_bands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_level TEXT NOT NULL UNIQUE, -- '8U', '10U', '12U', etc.
  can_access TEXT[] DEFAULT '{}', -- Advanced teams can access higher levels
  see_do_age_min INTEGER,
  see_do_age_max INTEGER,
  coach_it_age_min INTEGER,
  coach_it_age_max INTEGER,
  own_it_age_min INTEGER,
  display_order INTEGER
);

-- Practice Plans (from WordPress powlax_practice post type)
CREATE TABLE practice_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  practice_date DATE,
  start_time TIME,
  field_type TEXT DEFAULT 'Turf',
  total_minutes INTEGER DEFAULT 0,
  
  -- Goals (from WordPress practice data)
  coaching_goals TEXT,
  offensive_goals TEXT,
  defensive_goals TEXT,
  goalie_goals TEXT,
  face_off_goals TEXT,
  
  -- Practice structure
  drills JSONB DEFAULT '[]', -- Array of drill objects with timing
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  team_id UUID, -- For team association
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Management (Enhanced from WordPress users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('coach', 'player', 'parent', 'director')) NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  
  -- Role-specific data
  coaching_level TEXT, -- For coaches
  position TEXT, -- For players
  birth_date DATE, -- For players
  graduation_year INTEGER, -- For players
  
  -- Relationships
  parent_id UUID REFERENCES user_profiles(id), -- For parent-child links
  team_ids UUID[] DEFAULT '{}',
  club_id UUID,
  
  -- Preferences
  favorite_drills UUID[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gamification System (Replace GamiPress)
CREATE TABLE points_system (
  drill_id UUID REFERENCES drills(id) PRIMARY KEY,
  base_points INTEGER DEFAULT 10,
  duration_multiplier DECIMAL(3,2) DEFAULT 1.0,
  difficulty_bonus INTEGER DEFAULT 0,
  streak_bonus_percentage INTEGER DEFAULT 10
);

CREATE TABLE player_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES user_profiles(id),
  drill_id UUID REFERENCES drills(id),
  completions INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_completed TIMESTAMP WITH TIME ZONE,
  video_submission_url TEXT, -- Future AI analysis
  notes TEXT,
  UNIQUE(player_id, drill_id)
);

CREATE TABLE points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES user_profiles(id),
  drill_id UUID REFERENCES drills(id),
  points INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'drill_completion', 'streak_bonus', 'challenge_completion'
  workout_length INTEGER, -- Number of drills in workout
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Academy Enhancement
CREATE TABLE drill_requirements (
  drill_id UUID REFERENCES drills(id) PRIMARY KEY,
  rep_count INTEGER,
  success_criteria TEXT,
  challenge_mode BOOLEAN DEFAULT false,
  criteria_type TEXT CHECK (criteria_type IN ('count', 'perfect_streak', 'time_based', 'accuracy')),
  target_accuracy DECIMAL(5,2), -- For accuracy-based challenges
  time_limit INTEGER -- For time-based challenges
);
```

#### 1.2 Environment Setup
```bash
# Install additional dependencies
npm install @supabase/supabase-js @tanstack/react-query
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns lucide-react framer-motion
npm install @headlessui/react @heroicons/react
```

#### 1.3 Supabase Configuration
Update your existing Supabase client with enhanced configuration:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Database types (generate with: npx supabase gen types typescript --local)
export type Database = {
  public: {
    Tables: {
      drills: {
        Row: {
          id: string
          title: string
          description: string | null
          duration_minutes: number | null
          category: string
          age_bands: string[] | null
          // ... other fields
        }
        Insert: {
          // Insert types
        }
        Update: {
          // Update types
        }
      }
      // ... other tables
    }
  }
}
```

### Phase 2: Enhanced Practice Planner (Weeks 1-2)

#### 2.1 Core Components Architecture
Migrate the 10,777-line WordPress SPA to React components:

```typescript
// components/PracticePlanner/PracticePlanner.tsx
'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase'
import { PracticeTimeline } from './PracticeTimeline'
import { DrillLibrary } from './DrillLibrary'
import { PracticeCanvas } from './PracticeCanvas'
import { StrategicLayer } from './StrategicLayer'

interface PracticeData {
  info: {
    name: string
    date: string
    startTime: string
    field: string
  }
  goals: {
    coaching: string
    offensive: string
    defensive: string
    goalie: string
    faceOff: string
  }
  drills: DrillInPractice[]
  totalMinutes: number
}

interface DrillInPractice {
  id: string
  drill: Drill
  duration: number
  notes: string
  position: number
  strategies: Strategy[]
  concepts: Concept[]
  skills: Skill[]
}

export default function PracticePlanner() {
  const [practiceData, setPracticeData] = useState<PracticeData>({
    info: { name: '', date: '', startTime: '', field: 'Turf' },
    goals: { coaching: '', offensive: '', defensive: '', goalie: '', faceOff: '' },
    drills: [],
    totalMinutes: 0
  })

  const [drills, setDrills] = useState<Drill[]>([])
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
  const [showStrategicLayer, setShowStrategicLayer] = useState(false)

  // Load drills with strategic relationships
  useEffect(() => {
    loadDrillsWithStrategicData()
  }, [])

  const loadDrillsWithStrategicData = async () => {
    const { data, error } = await supabase
      .from('drills')
      .select(`
        *,
        drill_strategies!inner(
          strategies(*)
        ),
        drill_concepts!inner(
          concepts(*)
        ),
        drill_skills!inner(
          skills(*)
        )
      `)
      .eq('is_active', true)

    if (error) {
      console.error('Error loading drills:', error)
      return
    }

    setDrills(data || [])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    // Handle drill reordering in practice
    if (active.id !== over.id) {
      setPracticeData(prev => {
        const oldIndex = prev.drills.findIndex(d => d.id === active.id)
        const newIndex = prev.drills.findIndex(d => d.id === over.id)
        
        const newDrills = [...prev.drills]
        const [removed] = newDrills.splice(oldIndex, 1)
        newDrills.splice(newIndex, 0, removed)
        
        // Update positions and recalculate total time
        const updatedDrills = newDrills.map((drill, index) => ({
          ...drill,
          position: index
        }))
        
        return {
          ...prev,
          drills: updatedDrills,
          totalMinutes: updatedDrills.reduce((sum, d) => sum + d.duration, 0)
        }
      })
    }
  }

  const addDrillToPractice = (drill: Drill) => {
    const drillInPractice: DrillInPractice = {
      id: `practice-${drill.id}-${Date.now()}`,
      drill,
      duration: drill.duration_minutes || 10,
      notes: drill.coaching_points?.join('\n') || '',
      position: practiceData.drills.length,
      strategies: drill.drill_strategies?.map(ds => ds.strategies) || [],
      concepts: drill.drill_concepts?.map(dc => dc.concepts) || [],
      skills: drill.drill_skills?.map(ds => ds.skills) || []
    }

    setPracticeData(prev => ({
      ...prev,
      drills: [...prev.drills, drillInPractice],
      totalMinutes: prev.totalMinutes + drillInPractice.duration
    }))
  }

  const savePractice = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_plans')
        .insert({
          name: practiceData.info.name,
          practice_date: practiceData.info.date,
          start_time: practiceData.info.startTime,
          field_type: practiceData.info.field,
          total_minutes: practiceData.totalMinutes,
          coaching_goals: practiceData.goals.coaching,
          offensive_goals: practiceData.goals.offensive,
          defensive_goals: practiceData.goals.defensive,
          goalie_goals: practiceData.goals.goalie,
          face_off_goals: practiceData.goals.faceOff,
          drills: practiceData.drills
        })

      if (error) throw error
      
      // Show success notification
      console.log('Practice saved successfully')
    } catch (error) {
      console.error('Error saving practice:', error)
    }
  }

  return (
    <div className="powlax-planner-wrapper min-h-screen bg-gray-50">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="planner-container flex">
          {/* Practice Canvas - Main Planning Area */}
          <div className="practice-canvas flex-1 p-6">
            <PracticeCanvas 
              practiceData={practiceData}
              setPracticeData={setPracticeData}
              onSave={savePractice}
            />
            
            <SortableContext 
              items={practiceData.drills.map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <PracticeTimeline 
                drills={practiceData.drills}
                onDrillSelect={setSelectedDrill}
                onShowStrategic={() => setShowStrategicLayer(true)}
              />
            </SortableContext>
          </div>

          {/* Drill Library - Right Sidebar */}
          <div className="drill-library w-96 bg-white shadow-lg">
            <DrillLibrary 
              drills={drills}
              onDrillAdd={addDrillToPractice}
              selectedDrill={selectedDrill}
            />
          </div>
        </div>

        {/* Strategic Layer Modal */}
        {showStrategicLayer && selectedDrill && (
          <StrategicLayer 
            drill={selectedDrill}
            onClose={() => setShowStrategicLayer(false)}
          />
        )}
      </DndContext>
    </div>
  )
}
```

#### 2.2 Strategic Enhancement Components
The key differentiator - strategic depth for coaching:

```typescript
// components/PracticePlanner/StrategicLayer.tsx
interface StrategicLayerProps {
  drill: Drill
  onClose: () => void
}

export function StrategicLayer({ drill, onClose }: StrategicLayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">
              Strategic Layer: {drill.title}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strategies */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Strategies
              </h3>
              {drill.drill_strategies?.map(ds => (
                <div key={ds.strategy_id} className="mb-3 p-3 bg-white rounded border">
                  <h4 className="font-medium">{ds.strategies.name}</h4>
                  <p className="text-sm text-gray-600">{ds.strategies.description}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ds.relevance === 'primary' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ds.relevance}
                    </span>
                  </div>
                  {ds.age_adaptation && (
                    <p className="text-xs text-gray-500 mt-1">{ds.age_adaptation}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Concepts */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Key Concepts
              </h3>
              {drill.drill_concepts?.map(dc => (
                <div key={dc.concept_id} className="mb-3 p-3 bg-white rounded border">
                  <h4 className="font-medium">{dc.concepts.name}</h4>
                  <p className="text-sm text-gray-600">{dc.concepts.description}</p>
                  {dc.coaching_points && dc.coaching_points.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-green-700">Coaching Points:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {dc.coaching_points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Skills to Layer */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Skills to Layer
              </h3>
              {drill.drill_skills?.map(ds => (
                <div key={ds.skill_id} className="mb-3 p-3 bg-white rounded border">
                  <h4 className="font-medium">{ds.skills.name}</h4>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Focus: {ds.focus_percentage}%</span>
                      <span className="text-gray-600">Level: {ds.progression_level}/5</span>
                    </div>
                    {ds.integration_tips && (
                      <p className="text-xs text-purple-600 mt-1">
                        💡 {ds.integration_tips}
                      </p>
                    )}
                    {ds.progression_path && (
                      <p className="text-xs text-gray-500 mt-1">
                        Path: {ds.progression_path}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add to Practice with Strategic Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Phase 3: Data Migration Strategy (Week 2)

#### 3.1 WordPress to Supabase Migration Script
```typescript
// scripts/migrate-wordpress-data.ts
import { supabase } from '../lib/supabase'

interface WordPressDrill {
  ID: number
  post_title: string
  post_content: string
  meta: {
    _drill_category: string
    _drill_duration: string
    _drill_video_url: string
    _drill_lab_url_1: string
    _drill_lab_url_2: string
    _drill_lab_url_3: string
    _drill_lab_url_4: string
    _drill_lab_url_5: string
    _drill_custom_url: string
    _drill_notes: string
    _drill_images: string[]
    _drill_game_states: string[]
  }
}

export async function migrateWordPressDrills(wordpressDrills: WordPressDrill[]) {
  console.log(`Starting migration of ${wordpressDrills.length} drills...`)

  for (const wpDrill of wordpressDrills) {
    try {
      // Prepare Lacrosse Lab URLs
      const lacrosseLabUrls = [
        wpDrill.meta._drill_lab_url_1,
        wpDrill.meta._drill_lab_url_2,
        wpDrill.meta._drill_lab_url_3,
        wpDrill.meta._drill_lab_url_4,
        wpDrill.meta._drill_lab_url_5
      ].filter(url => url && url.trim() !== '')

      // Insert drill
      const { data: drill, error: drillError } = await supabase
        .from('drills')
        .insert({
          title: wpDrill.post_title,
          description: wpDrill.post_content,
          duration_minutes: parseInt(wpDrill.meta._drill_duration) || 10,
          category: wpDrill.meta._drill_category,
          video_url: wpDrill.meta._drill_video_url,
          custom_url: wpDrill.meta._drill_custom_url,
          lacrosse_lab_urls: lacrosseLabUrls,
          coaching_points: wpDrill.meta._drill_notes ? [wpDrill.meta._drill_notes] : [],
          game_states: wpDrill.meta._drill_game_states || [],
          drill_images: wpDrill.meta._drill_images || []
        })
        .select()
        .single()

      if (drillError) {
        console.error(`Error migrating drill ${wpDrill.post_title}:`, drillError)
        continue
      }

      console.log(`✅ Migrated: ${drill.title}`)
    } catch (error) {
      console.error(`Failed to migrate drill ${wpDrill.post_title}:`, error)
    }
  }

  console.log('Migration completed!')
}
```

#### 3.2 Strategic Data Population
```typescript
// scripts/populate-strategic-data.ts
export async function populateStrategicData() {
  // Insert base strategies
  const strategies = [
    {
      name: "2-3-1 Motion Offense",
      description: "Structured offensive system with constant motion",
      category: "offensive",
      complexity_level: 4,
      min_age_band: "12U"
    },
    {
      name: "Adjacent Slide Package",
      description: "Defensive sliding system for adjacent support",
      category: "defensive", 
      complexity_level: 3,
      min_age_band: "10U"
    }
    // ... more strategies
  ]

  const { data: insertedStrategies } = await supabase
    .from('strategies')
    .insert(strategies)
    .select()

  // Insert concepts
  const concepts = [
    {
      name: "Off-ball Movement",
      description: "Creating space and opportunities without the ball",
      category: "offensive",
      teaching_points: ["Create space", "Time your cuts", "Read the defense"]
    },
    {
      name: "Communication",
      description: "Verbal and non-verbal team communication",
      category: "team",
      teaching_points: ["Clear calls", "Early communication", "Positive reinforcement"]
    }
    // ... more concepts
  ]

  await supabase.from('concepts').insert(concepts)

  // Insert skills
  const skills = [
    {
      name: "Dodging",
      category: "offensive",
      ball_state: "with_ball",
      development_focus: ["speed", "decision_making"],
      progression_levels: [
        { level: 1, description: "Static dodge practice" },
        { level: 2, description: "Dynamic dodge with cone" },
        { level: 3, description: "Live 1v1 dodge" }
      ]
    }
    // ... more skills
  ]

  await supabase.from('skills').insert(skills)
}
```

### Phase 4: Enhanced User Experience (Week 3)

#### 4.1 Mobile-First Responsive Design
Migrate the 6,749-line CSS system to Tailwind:

```typescript
// components/PracticePlanner/MobilePracticePlanner.tsx
export function MobilePracticePlanner() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'library'>('canvas')

  return (
    <div className="min-h-screen bg-gray-50 md:hidden">
      {/* Mobile Tab Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'canvas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Practice Canvas
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'library'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
          >
            Drill Library
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        {activeTab === 'canvas' ? (
          <MobilePracticeCanvas />
        ) : (
          <MobileDrillLibrary />
        )}
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
```

#### 4.2 Touch-Optimized Interactions
```typescript
// hooks/useTouchDragDrop.ts
import { useState, useCallback } from 'react'

export function useTouchDragDrop() {
  const [draggedItem, setDraggedItem] = useState<any>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: TouchEvent, item: any) => {
    setDraggedItem(item)
    const touch = e.touches[0]
    setDragPosition({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!draggedItem) return
    
    e.preventDefault()
    const touch = e.touches[0]
    setDragPosition({ x: touch.clientX, y: touch.clientY })
  }, [draggedItem])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!draggedItem) return

    // Find drop target
    const dropTarget = document.elementFromPoint(
      dragPosition.x,
      dragPosition.y
    )

    // Handle drop logic
    setDraggedItem(null)
    setDragPosition({ x: 0, y: 0 })
  }, [draggedItem, dragPosition])

  return {
    draggedItem,
    dragPosition,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

## 🔌 Supabase Integration Instructions

### Step 1: Environment Setup
```bash
# 1. Create .env.local file in your project root
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 2: Initialize Supabase Client
```typescript
// lib/supabase.ts (already exists, enhance it)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Step 3: Database Schema Setup
```sql
-- Run this SQL in your Supabase SQL editor
-- (Copy the schema from Phase 1.1 above)

-- Enable Row Level Security
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for drill access
CREATE POLICY "Anyone can view active drills" ON drills
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create drills" ON drills
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for practice plans
CREATE POLICY "Users can view their own practice plans" ON practice_plans
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create practice plans" ON practice_plans
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Step 4: React Query Integration
```typescript
// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

// Drill queries
export function useDrills() {
  return useQuery({
    queryKey: ['drills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drills')
        .select(`
          *,
          drill_strategies(
            strategies(*)
          ),
          drill_concepts(
            concepts(*)
          ),
          drill_skills(
            skills(*)
          )
        `)
        .eq('is_active', true)
        .order('title')

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Practice plan mutations
export function useSavePracticePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (practiceData: any) => {
      const { data, error } = await supabase
        .from('practice_plans')
        .insert(practiceData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-plans'] })
    }
  })
}
```

### Step 5: Authentication Setup
```typescript
// components/Auth/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Step 6: App Router Integration
```typescript
// app/layout.tsx
import { AuthProvider } from '@/components/Auth/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

## 🚀 Implementation Timeline

### Week 1: Foundation
- [ ] Set up Supabase schema
- [ ] Configure authentication
- [ ] Create basic components structure
- [ ] Implement drill loading functionality

### Week 2: Practice Planner Core
- [ ] Build drag-and-drop practice builder
- [ ] Implement strategic layer components
- [ ] Create mobile-responsive design
- [ ] Add save/load functionality

### Week 3: Data Migration
- [ ] Create WordPress migration scripts
- [ ] Populate strategic relationship data
- [ ] Test data integrity
- [ ] Implement user management

### Week 4: Polish & Testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] User testing
- [ ] Deploy to production

This implementation plan bridges your existing WordPress plugin (23,000+ lines) with the new React architecture while maintaining the sophisticated features and adding the strategic depth that makes POWLAX unique in the lacrosse coaching space.