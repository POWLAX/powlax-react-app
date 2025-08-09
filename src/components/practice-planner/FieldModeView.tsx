'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Drill {
  id: string
  name: string
  duration: number
  notes?: string
  coach_instructions?: string
}

interface TimeSlot {
  id: string
  drills: Drill[]
  duration: number
}

interface FieldModeViewProps {
  timeSlots: TimeSlot[]
  practiceTitle: string
  onExit: () => void
}

export default function FieldModeView({ timeSlots, practiceTitle, onExit }: FieldModeViewProps) {
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [slotStartTime, setSlotStartTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Flatten all drills for easier navigation
  const allDrills = timeSlots.flatMap(slot => slot.drills)
  const currentSlot = timeSlots[currentSlotIndex] || timeSlots[0]
  const totalSlots = timeSlots.length

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    if (currentSlotIndex < totalSlots - 1) {
      setCurrentSlotIndex(currentSlotIndex + 1)
      setElapsedTime(0)
      setSlotStartTime(Date.now())
    }
  }

  const handlePrevious = () => {
    if (currentSlotIndex > 0) {
      setCurrentSlotIndex(currentSlotIndex - 1)
      setElapsedTime(0)
      setSlotStartTime(Date.now())
    }
  }

  const handleReset = () => {
    setElapsedTime(0)
    setIsRunning(false)
  }

  const toggleTimer = () => {
    if (!isRunning) {
      setSlotStartTime(Date.now() - (elapsedTime * 1000))
    }
    setIsRunning(!isRunning)
  }

  // Calculate progress
  const slotDurationSeconds = currentSlot.duration * 60
  const progress = Math.min((elapsedTime / slotDurationSeconds) * 100, 100)
  const timeRemaining = Math.max(slotDurationSeconds - elapsedTime, 0)

  // Swipe gesture support
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-white z-50 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="bg-[#003366] text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{practiceTitle}</h1>
            <p className="text-sm opacity-90">
              Activity {currentSlotIndex + 1} of {totalSlots}
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Exit Field Mode
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Timer Circle */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#003366"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-[#003366]">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {formatTime(timeRemaining)} remaining
            </div>
          </div>
        </div>

        {/* Current Activity */}
        <Card className="w-full max-w-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#003366] mb-2">
            {currentSlot.drills.length === 1 
              ? currentSlot.drills[0].name
              : `${currentSlot.drills.length} Parallel Activities`
            }
          </h2>
          
          {currentSlot.drills.length > 1 ? (
            <div className="space-y-3 mt-4">
              {currentSlot.drills.map((drill, index) => (
                <div key={drill.id} className="flex items-start gap-3">
                  <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Lane {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{drill.name}</h3>
                    {drill.notes && (
                      <p className="text-sm text-gray-600 mt-1">{drill.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                <span>{currentSlot.duration} minutes</span>
              </div>
              
              {currentSlot.drills[0].notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{currentSlot.drills[0].notes}</p>
                </div>
              )}
              
              {currentSlot.drills[0].coach_instructions && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Coach Instructions:</p>
                  <p className="text-sm text-blue-700">{currentSlot.drills[0].coach_instructions}</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Timer Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={`${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-8 py-6 text-lg`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="px-6 py-6"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-50 border-t p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            onClick={handlePrevious}
            disabled={currentSlotIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Next Activity</div>
            <div className="font-medium">
              {currentSlotIndex < totalSlots - 1 
                ? timeSlots[currentSlotIndex + 1].drills[0].name
                : 'Practice Complete'
              }
            </div>
          </div>
          
          <Button
            onClick={handleNext}
            disabled={currentSlotIndex === totalSlots - 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}