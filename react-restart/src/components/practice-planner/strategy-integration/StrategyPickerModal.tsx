'use client'

import { useState, useEffect } from 'react'
import { X, Target, Shield, Zap, Users, Flag, Search, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Strategy {
  id: string
  strategy_name: string
  strategy_categories: string
  description?: string
  vimeo_link?: string
  lacrosse_lab_links?: string[]
  pdf_link?: string
}

interface StrategyPickerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedStrategies: Strategy[]
  onStrategiesChange: (strategies: Strategy[]) => void
}

// Proper game phase order for lacrosse
const gamePhases = [
  { id: 'ride', name: 'Ride', icon: Zap, color: 'text-orange-600' },
  { id: 'clear', name: 'Clear', icon: Zap, color: 'text-blue-600' },
  { id: 'transition_offense', name: 'Transition Offense', icon: Zap, color: 'text-green-600' },
  { id: 'transition_defense', name: 'Transition Defense', icon: Shield, color: 'text-red-600' },
  { id: 'settled_offense', name: 'Settled Offense', icon: Target, color: 'text-purple-600' },
  { id: 'settled_defense', name: 'Settled Defense', icon: Shield, color: 'text-indigo-600' },
  { id: 'man_up', name: 'Man Up', icon: Users, color: 'text-yellow-600' },
  { id: 'man_down', name: 'Man Down', icon: Flag, color: 'text-gray-600' },
  { id: 'face_off', name: 'Face Off', icon: Users, color: 'text-teal-600' }
]

export default function StrategyPickerModal({
  isOpen,
  onClose,
  selectedStrategies,
  onStrategiesChange
}: StrategyPickerModalProps) {
  const [allStrategies, setAllStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState('settled_offense')
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedStrategies, setTempSelectedStrategies] = useState<Strategy[]>(selectedStrategies)

  useEffect(() => {
    if (isOpen) {
      fetchStrategies()
      setTempSelectedStrategies(selectedStrategies)
    }
  }, [isOpen, selectedStrategies])

  const fetchStrategies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('strategies_powlax')
        .select('*')
        .order('strategy_name')

      if (error) throw error

      setAllStrategies(data || [])
    } catch (error) {
      console.error('Error fetching strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeCategory = (category: string): string => {
    const cat = category?.toLowerCase().trim() || ''
    
    // Map database categories to our game phases
    if (cat.includes('ride')) return 'ride'
    if (cat.includes('clear')) return 'clear'
    if (cat.includes('transition') && cat.includes('offense')) return 'transition_offense'
    if (cat.includes('transition') && cat.includes('defense')) return 'transition_defense'
    if (cat.includes('settled') && cat.includes('offense')) return 'settled_offense'
    if (cat.includes('offense') && !cat.includes('transition')) return 'settled_offense'
    if (cat.includes('settled') && cat.includes('defense')) return 'settled_defense'
    if (cat.includes('defense') && !cat.includes('transition')) return 'settled_defense'
    if (cat.includes('man up') || cat.includes('man-up') || cat.includes('emo')) return 'man_up'
    if (cat.includes('man down') || cat.includes('man-down')) return 'man_down'
    if (cat.includes('face') || cat.includes('faceoff')) return 'face_off'
    
    return 'settled_offense' // default
  }

  const getPhaseStrategies = (phaseId: string) => {
    return allStrategies.filter(strategy => {
      const normalizedCat = normalizeCategory(strategy.strategy_categories)
      const matchesPhase = normalizedCat === phaseId
      const matchesSearch = !searchTerm || 
        strategy.strategy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesPhase && matchesSearch
    })
  }

  const toggleStrategy = (strategy: Strategy) => {
    const isSelected = tempSelectedStrategies.some(s => s.id === strategy.id)
    
    if (isSelected) {
      setTempSelectedStrategies(tempSelectedStrategies.filter(s => s.id !== strategy.id))
    } else {
      setTempSelectedStrategies([...tempSelectedStrategies, strategy])
    }
  }

  const isStrategySelected = (strategy: Strategy) => {
    return tempSelectedStrategies.some(s => s.id === strategy.id)
  }

  const handleApply = () => {
    onStrategiesChange(tempSelectedStrategies)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Practice Strategies</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose strategies to reference during practice with diagrams, videos, and notes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex h-[calc(85vh-220px)]">
          {/* Game Phase Sidebar */}
          <div className="w-56 bg-gray-50 border-r">
            <ScrollArea className="h-full">
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Game Phase
                </h3>
                {gamePhases.map(phase => {
                  const Icon = phase.icon
                  const count = getPhaseStrategies(phase.id).length
                  const isActive = selectedPhase === phase.id
                  
                  return (
                    <button
                      key={phase.id}
                      onClick={() => setSelectedPhase(phase.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-md mb-1 flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-white shadow-sm border'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${phase.color}`} />
                        <span className="text-sm font-medium">{phase.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Strategy List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
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
                      <p className="text-gray-500 py-4">
                        {searchTerm 
                          ? 'No strategies found matching your search'
                          : 'No strategies available for this phase'}
                      </p>
                    ) : (
                      getPhaseStrategies(selectedPhase).map(strategy => {
                        const isSelected = isStrategySelected(strategy)
                        
                        return (
                          <div
                            key={strategy.id}
                            onClick={() => toggleStrategy(strategy)}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'border-blue-500 bg-blue-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <h4 className="font-medium text-gray-900">{strategy.strategy_name}</h4>
                                </div>
                                
                                {strategy.description && (
                                  <p className="text-sm text-gray-600 mt-2 ml-7">{strategy.description}</p>
                                )}
                                
                                {/* Resource indicators */}
                                <div className="flex gap-3 mt-2 ml-7">
                                  {strategy.vimeo_link && (
                                    <Badge variant="outline" className="text-xs">
                                      📹 Video
                                    </Badge>
                                  )}
                                  {strategy.lacrosse_lab_links && strategy.lacrosse_lab_links.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      📋 Lab Diagrams
                                    </Badge>
                                  )}
                                  {strategy.pdf_link && (
                                    <Badge variant="outline" className="text-xs">
                                      📄 PDF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {tempSelectedStrategies.length} {tempSelectedStrategies.length === 1 ? 'strategy' : 'strategies'} selected
            </p>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Strategies
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}