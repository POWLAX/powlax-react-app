'use client'

import { useState, useEffect } from 'react'
import { Check, Slider } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDrills } from '@/hooks/useDrills'

interface FilterDrillsModalProps {
  isOpen: boolean
  onClose: () => void
  drills: any[]
  selectedStrategies: string[]
  setSelectedStrategies: (strategies: string[]) => void
  selectedSkills: string[]
  setSelectedSkills: (skills: string[]) => void
  selectedGamePhase: string | null
  setSelectedGamePhase: (phase: string | null) => void
  selectedDuration: { min: number; max: number } | null
  setSelectedDuration: (duration: { min: number; max: number } | null) => void
  selectedGameStates: string[]
  setSelectedGameStates: (gameStates: string[]) => void
}

export default function FilterDrillsModal({
  isOpen,
  onClose,
  drills,
  selectedStrategies,
  setSelectedStrategies,
  selectedSkills,
  setSelectedSkills,
  selectedGamePhase,
  setSelectedGamePhase,
  selectedDuration,
  setSelectedDuration,
  selectedGameStates,
  setSelectedGameStates,
}: FilterDrillsModalProps) {
  const { drills: allDrills } = useDrills()
  const [tempStrategies, setTempStrategies] = useState<string[]>(selectedStrategies || [])
  const [tempSkills, setTempSkills] = useState<string[]>(selectedSkills || [])
  const [tempGamePhase, setTempGamePhase] = useState<string | null>(selectedGamePhase || null)
  const [tempDuration, setTempDuration] = useState<{ min: number; max: number } | null>(selectedDuration || null)
  const [tempGameStates, setTempGameStates] = useState<string[]>(selectedGameStates || [])
  const [durationRange, setDurationRange] = useState<[number, number]>([5, 60])

  // Reset temp values when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempStrategies(selectedStrategies || [])
      setTempSkills(selectedSkills || [])
      setTempGamePhase(selectedGamePhase || null)
      setTempDuration(selectedDuration || null)
      setTempGameStates(selectedGameStates || [])
      
      // Set duration range from current selection or defaults
      if (selectedDuration) {
        setDurationRange([selectedDuration.min, selectedDuration.max])
      } else {
        setDurationRange([5, 60])
      }
    }
  }, [isOpen, selectedStrategies, selectedSkills, selectedGamePhase, selectedDuration, selectedGameStates])

  // Load filter preferences from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const savedPreferences = localStorage.getItem('drill-filter-preferences')
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences)
          if (preferences.duration) {
            setDurationRange(preferences.duration)
          }
        }
      } catch (error) {
        console.error('Error loading filter preferences:', error)
      }
    }
  }, [isOpen])

  // Extract unique values from all drills in database, not just filtered ones
  const sourceData = Array.isArray(allDrills) && allDrills.length > 0 
    ? allDrills 
    : Array.isArray(drills) 
      ? drills 
      : []
  
  const allStrategies = Array.from(new Set(
    (sourceData || []).flatMap(d => d?.strategies || []).filter(Boolean)
  )).sort()

  const allSkills = Array.from(new Set(
    (sourceData || []).flatMap(d => d?.skills || []).filter(Boolean)
  )).sort()

  const allGamePhases = Array.from(new Set(
    (sourceData || []).map(d => d?.game_phase).filter(Boolean)
  )).sort()

  // Extract game states from the game_states column
  const allGameStates = Array.from(new Set(
    (sourceData || [])
      .map(d => d?.game_states || '')
      .filter(Boolean)
      .flatMap(states => 
        typeof states === 'string' 
          ? states.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(states) 
            ? states
            : []
      )
  )).sort()

  const durationRanges = [
    { label: '0-10 min', min: 0, max: 10 },
    { label: '10-20 min', min: 10, max: 20 },
    { label: '20-30 min', min: 20, max: 30 },
    { label: '30-45 min', min: 30, max: 45 },
    { label: '45+ min', min: 45, max: 999 },
  ]

  const toggleStrategy = (strategy: string) => {
    if (tempStrategies.includes(strategy)) {
      setTempStrategies(tempStrategies.filter(s => s !== strategy))
    } else {
      setTempStrategies([...tempStrategies, strategy])
    }
  }

  const toggleSkill = (skill: string) => {
    if (tempSkills.includes(skill)) {
      setTempSkills(tempSkills.filter(s => s !== skill))
    } else {
      setTempSkills([...tempSkills, skill])
    }
  }

  const toggleGameState = (gameState: string) => {
    if (tempGameStates.includes(gameState)) {
      setTempGameStates(tempGameStates.filter(s => s !== gameState))
    } else {
      setTempGameStates([...tempGameStates, gameState])
    }
  }

  const handleDurationRangeChange = (values: number[]) => {
    setDurationRange([values[0], values[1]])
    setTempDuration({ min: values[0], max: values[1] })
  }

  const applyFilters = () => {
    setSelectedStrategies(tempStrategies)
    setSelectedSkills(tempSkills)
    setSelectedGamePhase(tempGamePhase)
    setSelectedDuration(tempDuration)
    setSelectedGameStates(tempGameStates)
    
    // Save preferences to localStorage
    try {
      const preferences = {
        duration: durationRange,
        lastUsed: Date.now()
      }
      localStorage.setItem('drill-filter-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving filter preferences:', error)
    }
    
    onClose()
  }

  const clearAll = () => {
    setTempStrategies([])
    setTempSkills([])
    setTempGamePhase(null)
    setTempDuration(null)
    setTempGameStates([])
    setDurationRange([5, 60])
  }

  const hasActiveFilters = (tempStrategies?.length || 0) > 0 || 
    (tempSkills?.length || 0) > 0 || 
    tempGamePhase || 
    tempDuration || 
    (tempGameStates?.length || 0) > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white">
          <DialogTitle className="text-[#003366]">Filter Drills</DialogTitle>
          <DialogDescription className="text-gray-600">
            Select criteria to filter available drills
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 bg-white" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-6">
            {/* Strategies */}
            {allStrategies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#003366]">Strategies</h3>
                <div className="flex flex-wrap gap-2">
                  {allStrategies.map(strategy => (
                    <button
                      key={strategy}
                      onClick={() => toggleStrategy(strategy)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempStrategies.includes(strategy)
                          ? 'bg-[#003366] text-white'
                          : 'bg-gray-100 text-[#003366] hover:bg-gray-200'
                      }`}
                    >
                      {strategy}
                      {tempStrategies.includes(strategy) && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {allSkills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#003366]">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempSkills.includes(skill)
                          ? 'bg-[#FF6600] text-white'
                          : 'bg-gray-100 text-[#003366] hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                      {tempSkills.includes(skill) && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Phase */}
            {allGamePhases.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#003366]">Game Phase</h3>
                <div className="flex flex-wrap gap-2">
                  {allGamePhases.map(phase => (
                    <button
                      key={phase}
                      onClick={() => setTempGamePhase(tempGamePhase === phase ? null : phase)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempGamePhase === phase
                          ? 'bg-[#003366] text-white'
                          : 'bg-gray-100 text-[#003366] hover:bg-gray-200'
                      }`}
                    >
                      {phase}
                      {tempGamePhase === phase && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game States */}
            {allGameStates.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-[#003366]">Game States</h3>
                <div className="flex flex-wrap gap-2">
                  {allGameStates.map(gameState => (
                    <button
                      key={gameState}
                      onClick={() => toggleGameState(gameState)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempGameStates.includes(gameState)
                          ? 'bg-[#FF6600] text-white'
                          : 'bg-gray-100 text-[#003366] hover:bg-gray-200'
                      }`}
                    >
                      {gameState}
                      {tempGameStates.includes(gameState) && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration with Range Slider */}
            <div>
              <h3 className="font-semibold mb-3 text-[#003366]">Duration Range</h3>
              <div className="space-y-4">
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Duration: {durationRange[0]}-{durationRange[1]} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={durationRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value)
                      if (newMin <= durationRange[1]) {
                        handleDurationRangeChange([newMin, durationRange[1]])
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
                  />
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={durationRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value)
                      if (newMax >= durationRange[0]) {
                        handleDurationRangeChange([durationRange[0], newMax])
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                {/* Quick Duration Presets */}
                <div className="flex flex-wrap gap-2">
                  {durationRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => 
                        setTempDuration(
                          tempDuration?.min === range.min && tempDuration?.max === range.max
                            ? null
                            : { min: range.min, max: range.max }
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempDuration?.min === range.min && tempDuration?.max === range.max
                          ? 'bg-[#FF6600] text-white'
                          : 'bg-gray-100 text-[#003366] hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                      {tempDuration?.min === range.min && tempDuration?.max === range.max && (
                        <Check className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={clearAll}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-[#003366] border-gray-300">
                Cancel
              </Button>
              <Button onClick={applyFilters} className="bg-[#003366] hover:bg-[#003366]/90 text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}