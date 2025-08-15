'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories?: string
  description?: string
  complexity?: string
}

interface ActiveStrategiesSectionProps {
  strategies: Strategy[]
  onRemove: (id: string) => void
  onStrategyClick: (strategy: Strategy) => void
}

// Game phase categorization and border colors
const GAME_PHASES = {
  // Left Column: "With Ball" 
  'Clear': { 
    borderColor: 'border-blue-500', 
    column: 'left',
    keywords: ['clear', 'clearing', 'break out'] 
  },
  'Offensive Transition': { 
    borderColor: 'border-green-500', 
    column: 'left',
    keywords: ['offensive transition', 'fast break', 'transition offense', 'quick stick'] 
  },
  'Settled Offense': { 
    borderColor: 'border-purple-500', 
    column: 'left',
    keywords: ['settled offense', 'offensive set', '6v6 offense', 'half court offense'] 
  },
  'Man Up': { 
    borderColor: 'border-indigo-500', 
    column: 'left',
    keywords: ['man up', 'extra man', 'penalty kill offense', 'power play'] 
  },
  
  // Right Column: "Defending Ball"
  'Ride': { 
    borderColor: 'border-red-500', 
    column: 'right',
    keywords: ['ride', 'riding', 'pressure', 'force'] 
  },
  'Defensive Transition': { 
    borderColor: 'border-orange-500', 
    column: 'right',
    keywords: ['defensive transition', 'transition defense', 'slide package'] 
  },
  'Settled Defense': { 
    borderColor: 'border-yellow-500', 
    column: 'right',
    keywords: ['settled defense', 'defensive set', '6v6 defense', 'half court defense'] 
  },
  'Man Down': { 
    borderColor: 'border-pink-500', 
    column: 'right',
    keywords: ['man down', 'penalty kill', 'short handed'] 
  },

  // Bottom Section: Special Situations  
  'Substitutions': { 
    borderColor: 'border-gray-500', 
    column: 'bottom',
    keywords: ['substitution', 'sub', 'line change', 'rotation'] 
  },
  'Face-Offs': { 
    borderColor: 'border-teal-500', 
    column: 'bottom',
    keywords: ['face-off', 'faceoff', 'face off', 'center', 'wing'] 
  }
}

export default function ActiveStrategiesSection({
  strategies,
  onRemove,
  onStrategyClick
}: ActiveStrategiesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Categorize strategies by game phase
  const categorizeStrategy = (strategy: Strategy): { phase: string; borderColor: string } => {
    const categories = strategy.strategy_categories?.toLowerCase() || ''
    const description = strategy.description?.toLowerCase() || ''
    const name = strategy.strategy_name?.toLowerCase() || ''
    
    for (const [phase, config] of Object.entries(GAME_PHASES)) {
      const matches = config.keywords.some(keyword => 
        categories.includes(keyword) || 
        description.includes(keyword) ||
        name.includes(keyword)
      )
      if (matches) {
        return { phase, borderColor: config.borderColor }
      }
    }
    
    // Default fallback
    return { phase: 'General', borderColor: 'border-gray-400' }
  }

  // Group strategies by phase and column
  const groupedStrategies = strategies.reduce((acc, strategy) => {
    const { phase, borderColor } = categorizeStrategy(strategy)
    const column = GAME_PHASES[phase as keyof typeof GAME_PHASES]?.column || 'bottom'
    
    if (!acc[phase]) {
      acc[phase] = { strategies: [], borderColor, column }
    }
    acc[phase].strategies.push(strategy)
    return acc
  }, {} as Record<string, { strategies: Strategy[]; borderColor: string; column: string }>)

  // Separate strategies by column layout
  const leftColumnPhases = Object.entries(groupedStrategies).filter(([_, data]) => data.column === 'left')
  const rightColumnPhases = Object.entries(groupedStrategies).filter(([_, data]) => data.column === 'right')
  const bottomPhases = Object.entries(groupedStrategies).filter(([_, data]) => data.column === 'bottom')

  // Render strategy card
  const renderStrategyCard = (strategy: Strategy, borderColor: string) => (
    <div
      key={strategy.id}
      className={`group relative bg-white ${borderColor} border-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200`}
      style={{ padding: '5px' }}
      onClick={() => onStrategyClick(strategy)}
    >
      {/* Strategy Content */}
      <div className="flex justify-between items-start pr-6">
        <div className="text-left">
          <div className="text-sm text-black font-medium leading-tight">
            {categorizeStrategy(strategy).phase}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-black font-semibold leading-tight">
            {strategy.strategy_name}
          </div>
        </div>
      </div>

      {/* Remove Button - Shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(strategy.id)
        }}
        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label={`Remove ${strategy.strategy_name}`}
      >
        <X className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  )

  // Render phase section
  const renderPhaseSection = (phase: string, data: { strategies: Strategy[]; borderColor: string }) => (
    <div key={phase} className="space-y-2">
      {data.strategies.map(strategy => renderStrategyCard(strategy, data.borderColor))}
    </div>
  )

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${isExpanded ? 'border-b border-gray-300' : ''}`}
      >
        {/* Conditional blue dot - only show when strategies exist */}
        {strategies.length > 0 && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 text-left flex-1">
          Active Strategies for This Practice
        </h2>
        {strategies.length > 0 && (
          <span className="text-sm text-gray-500">
            ({strategies.length})
          </span>
        )}
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-gray-600" />
        ) : (
          <ChevronRight className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div style={{ padding: '1rem' }}>
          {strategies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No strategies added yet</div>
              <div className="text-xs mt-1">Click &quot;Add Strategy&quot; to get started</div>
            </div>
          ) : (
            <>
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column: "With Ball" */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800 border-b border-gray-300 pb-1">
                    With Ball
                  </h3>
                  <div className="space-y-3">
                    {leftColumnPhases.map(([phase, data]) => renderPhaseSection(phase, data))}
                  </div>
                </div>

                {/* Right Column: "Defending Ball" */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800 border-b border-gray-300 pb-1">
                    Defending Ball
                  </h3>
                  <div className="space-y-3">
                    {rightColumnPhases.map(([phase, data]) => renderPhaseSection(phase, data))}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Special Situations */}
              {bottomPhases.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-3">
                    Special Situations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bottomPhases.map(([phase, data]) => renderPhaseSection(phase, data))}
                  </div>
                </div>
              )}

              {/* Strategy Count Info */}
              <div className="text-sm text-gray-600">
                {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'} selected
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}