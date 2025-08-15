'use client'

import { useState } from 'react'
import DrillLibraryContent from './DrillLibraryContent'
import StrategiesLibraryContent from './StrategiesLibraryContent'

// Using proper Supabase User type
interface User {
  id: string
  email: string
  full_name?: string
  wordpress_id?: number
  role: string
  roles: string[]
  avatar_url?: string
  display_name: string
}

interface Drill {
  id: string
  title: string
  duration_minutes: number
  category: string
  drill_types?: string
  strategies?: string[]
  concepts?: string[]
  skills?: string[]
  videoUrl?: string
  isFavorite?: boolean
  notes?: string
  coach_instructions?: string
  drill_lab_url_1?: string
  drill_lab_url_2?: string
  drill_lab_url_3?: string
  drill_lab_url_4?: string
  drill_lab_url_5?: string
  source?: 'powlax' | 'user'
  user_id?: string
  is_public?: boolean
}

interface SidebarLibraryProps {
  onAddDrill: (drill: Drill) => void
  onRemoveDrill?: (drillId: string) => void
  onSelectStrategy?: (strategy: any) => void
  selectedStrategies?: string[]
  isMobile?: boolean
  user?: User | null
}

export default function SidebarLibrary({ 
  onAddDrill,
  onRemoveDrill, 
  onSelectStrategy,
  selectedStrategies = [],
  isMobile = false,
  user = null
}: SidebarLibraryProps) {
  const [activeView, setActiveView] = useState<'drills' | 'strategies'>('drills')

  return (
    <div className="h-full flex flex-col">
      {/* FIXED TOGGLE BUTTONS - NEVER MOVE */}
      <div className="p-4 border-b">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveView('drills')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'drills' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Drills
          </button>
          <button 
            onClick={() => setActiveView('strategies')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeView === 'strategies' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Strategies
          </button>
        </div>
      </div>

      {/* DYNAMIC CONTENT - CHANGES BASED ON activeView */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'drills' ? (
          <DrillLibraryContent 
            onAddDrill={onAddDrill}
            onRemoveDrill={onRemoveDrill}
            isMobile={isMobile}
            user={user}
          />
        ) : (
          <StrategiesLibraryContent
            onSelectStrategy={onSelectStrategy || (() => {})}
            selectedStrategies={selectedStrategies}
            isMobile={isMobile}
            user={user}
          />
        )}
      </div>
    </div>
  )
}
