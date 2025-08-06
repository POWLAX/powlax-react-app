'use client'

import { useState, useEffect } from 'react'
import { X, Target, Shield, Zap, Users, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Strategy {
  id: string
  name: string
  game_phase: string
  category?: string
  description?: string
}

interface StrategySelectorProps {
  selectedStrategies: string[]
  onStrategiesChange: (strategies: string[]) => void
  onGenerateRecommendations: () => void
}

const gamePhases = [
  { id: 'settled_offense', name: 'Settled Offense', icon: Target },
  { id: 'settled_defense', name: 'Settled Defense', icon: Shield },
  { id: 'transition_offense', name: 'Transition Offense', icon: Zap },
  { id: 'transition_defense', name: 'Transition Defense', icon: Zap },
  { id: 'face_off', name: 'Face Off', icon: Users },
  { id: 'man_up', name: 'Man Up', icon: Target },
  { id: 'man_down', name: 'Man Down', icon: Shield },
  { id: 'ride', name: 'Ride', icon: Zap },
  { id: 'clear', name: 'Clear', icon: Zap }
]

export default function StrategySelector({ 
  selectedStrategies, 
  onStrategiesChange,
  onGenerateRecommendations 
}: StrategySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState('settled_offense')

  useEffect(() => {
    if (isOpen) {
      fetchStrategies()
    }
  }, [isOpen])

  const fetchStrategies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('strategies_powlax')
        .select('*')
        .order('strategy_name')

      if (error) throw error

      const formattedStrategies = data?.map(strategy => ({
        id: strategy.id?.toString() || 'strategy-' + Math.random(),
        name: strategy.strategy_name || 'Unnamed Strategy',
        game_phase: mapCategoryToPhase(strategy.strategy_categories),
        category: strategy.strategy_categories,
        description: strategy.description
      })) || []

      // Add hardcoded strategies for demo
      const demoStrategies = [
        { id: 'demo-1', name: '4-3 Alpha Clear', game_phase: 'clear', category: 'Clear', description: 'Strategic clearing pattern for beating the ride' },
        { id: 'demo-2', name: 'Cuse Motion Offense', game_phase: 'settled_offense', category: 'Settled Offense', description: 'Motion offense with picks and cuts' },
        { id: 'demo-3', name: '2-3-1 Motion Offense', game_phase: 'settled_offense', category: 'Settled Offense', description: 'Balanced motion offense' }
      ]

      setStrategies([...demoStrategies, ...formattedStrategies])
    } catch (error) {
      console.error('Error fetching strategies:', error)
      // Fallback demo strategies
      setStrategies([
        { id: 'demo-1', name: '4-3 Alpha Clear', game_phase: 'clear', category: 'Clear', description: 'Strategic clearing pattern for beating the ride' },
        { id: 'demo-2', name: 'Cuse Motion Offense', game_phase: 'settled_offense', category: 'Settled Offense', description: 'Motion offense with picks and cuts' },
        { id: 'demo-3', name: '2-3-1 Motion Offense', game_phase: 'settled_offense', category: 'Settled Offense', description: 'Balanced motion offense' },
        { id: 'demo-4', name: 'Ground Ball Recovery', game_phase: 'transition_defense', category: 'Transition', description: 'Securing possession from ground balls' },
        { id: 'demo-5', name: 'Transition Defense', game_phase: 'transition_defense', category: 'Transition', description: 'Defending in transition situations' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const mapCategoryToPhase = (category: string): string => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('offense') && !cat.includes('transition')) return 'settled_offense'
    if (cat.includes('defense') && !cat.includes('transition')) return 'settled_defense'
    if (cat.includes('transition') && cat.includes('offense')) return 'transition_offense'
    if (cat.includes('transition') && cat.includes('defense')) return 'transition_defense'
    if (cat.includes('face')) return 'face_off'
    if (cat.includes('man up')) return 'man_up'
    if (cat.includes('man down')) return 'man_down'
    if (cat.includes('ride')) return 'ride'
    if (cat.includes('clear')) return 'clear'
    return 'settled_offense'
  }

  const toggleStrategy = (strategyId: string) => {
    if (selectedStrategies.includes(strategyId)) {
      onStrategiesChange(selectedStrategies.filter(id => id !== strategyId))
    } else {
      onStrategiesChange([...selectedStrategies, strategyId])
    }
  }

  const getPhaseStrategies = (phase: string) => {
    return strategies.filter(s => s.game_phase === phase)
  }

  const getSelectedStrategyNames = () => {
    return selectedStrategies
      .map(id => strategies.find(s => s.id === id)?.name)
      .filter(Boolean)
  }

  if (!isOpen) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Strategy Focus:</span>
            {selectedStrategies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getSelectedStrategyNames().map((name, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                    {name}
                    <button
                      onClick={() => {
                        const strategy = strategies.find(s => s.name === name)
                        if (strategy) toggleStrategy(strategy.id)
                      }}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No strategies selected</span>
            )}
          </div>
          <div className="flex gap-2">
            {selectedStrategies.length > 0 && (
              <Button
                onClick={onGenerateRecommendations}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Get Drill Recommendations
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(true)}
              size="sm"
              variant="outline"
            >
              Select Strategies
            </Button>
          </div>
        </div>
        {selectedStrategies.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            💡 Recommended drills will focus on developing these strategies
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Practice Focus Strategies</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose 1-2 primary strategies to focus on in this practice
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(80vh-200px)]">
          {/* Game Phase Tabs */}
          <div className="w-48 bg-gray-50 border-r">
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Game Phase
              </h3>
              {gamePhases.map(phase => {
                const Icon = phase.icon
                const count = getPhaseStrategies(phase.id).length
                return (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhase(phase.id)}
                    className={`w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between transition-colors ${
                      selectedPhase === phase.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{phase.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Strategy List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading strategies...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {gamePhases.find(p => p.id === selectedPhase)?.name} Strategies
                </h3>
                {getPhaseStrategies(selectedPhase).length === 0 ? (
                  <p className="text-gray-500">No strategies available for this phase</p>
                ) : (
                  getPhaseStrategies(selectedPhase).map(strategy => (
                    <div
                      key={strategy.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedStrategies.includes(strategy.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleStrategy(strategy.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedStrategies.includes(strategy.id)}
                              onChange={() => toggleStrategy(strategy.id)}
                              className="h-4 w-4 text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                          </div>
                          {strategy.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-6">{strategy.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {selectedStrategies.length} {selectedStrategies.length === 1 ? 'strategy' : 'strategies'} selected
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false)
                  if (selectedStrategies.length > 0) {
                    onGenerateRecommendations()
                  }
                }}
                disabled={selectedStrategies.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate Drill Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}