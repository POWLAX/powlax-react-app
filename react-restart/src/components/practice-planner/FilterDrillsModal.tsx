'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
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
}: FilterDrillsModalProps) {
  const [tempStrategies, setTempStrategies] = useState<string[]>(selectedStrategies)
  const [tempSkills, setTempSkills] = useState<string[]>(selectedSkills)
  const [tempGamePhase, setTempGamePhase] = useState<string | null>(selectedGamePhase)
  const [tempDuration, setTempDuration] = useState<{ min: number; max: number } | null>(selectedDuration)

  // Reset temp values when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempStrategies(selectedStrategies)
      setTempSkills(selectedSkills)
      setTempGamePhase(selectedGamePhase)
      setTempDuration(selectedDuration)
    }
  }, [isOpen, selectedStrategies, selectedSkills, selectedGamePhase, selectedDuration])

  // Extract unique values from drills
  const allStrategies = Array.from(new Set(
    drills.flatMap(d => d.strategies || []).filter(Boolean)
  )).sort()

  const allSkills = Array.from(new Set(
    drills.flatMap(d => d.skills || []).filter(Boolean)
  )).sort()

  const allGamePhases = Array.from(new Set(
    drills.map(d => d.game_phase).filter(Boolean)
  )).sort()

  const durationRanges = [
    { label: '0-10 min', min: 0, max: 10 },
    { label: '10-20 min', min: 10, max: 20 },
    { label: '20-30 min', min: 20, max: 30 },
    { label: '30+ min', min: 30, max: 999 },
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

  const applyFilters = () => {
    setSelectedStrategies(tempStrategies)
    setSelectedSkills(tempSkills)
    setSelectedGamePhase(tempGamePhase)
    setSelectedDuration(tempDuration)
    onClose()
  }

  const clearAll = () => {
    setTempStrategies([])
    setTempSkills([])
    setTempGamePhase(null)
    setTempDuration(null)
  }

  const hasActiveFilters = tempStrategies.length > 0 || tempSkills.length > 0 || tempGamePhase || tempDuration

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Filter Drills</DialogTitle>
          <DialogDescription>
            Select criteria to filter available drills
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-6">
            {/* Strategies */}
            {allStrategies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Strategies</h3>
                <div className="flex flex-wrap gap-2">
                  {allStrategies.map(strategy => (
                    <button
                      key={strategy}
                      onClick={() => toggleStrategy(strategy)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempStrategies.includes(strategy)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempSkills.includes(skill)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <h3 className="font-semibold mb-3">Game Phase</h3>
                <div className="flex flex-wrap gap-2">
                  {allGamePhases.map(phase => (
                    <button
                      key={phase}
                      onClick={() => setTempGamePhase(tempGamePhase === phase ? null : phase)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        tempGamePhase === phase
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

            {/* Duration */}
            <div>
              <h3 className="font-semibold mb-3">Duration</h3>
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
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={clearAll}
              disabled={!hasActiveFilters}
            >
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}