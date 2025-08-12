'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Trophy, 
  Target,
  Activity,
  X,
  RotateCcw
} from 'lucide-react'

interface DrillTime {
  drill_name: string
  started_at: number
  completed_at?: number
  actual_seconds: number
  required_seconds: number
}

interface WorkoutReviewModalProps {
  isOpen: boolean
  onClose: () => void
  workout: any
  drills: any[]
  drillTimes: Record<number, DrillTime>
  totalPoints: number
  totalTime: number
  completedDrills: Set<number>
  isWallBallWorkout: boolean
}

export default function WorkoutReviewModal({
  isOpen,
  onClose,
  workout,
  drills,
  drillTimes,
  totalPoints,
  totalTime,
  completedDrills,
  isWallBallWorkout
}: WorkoutReviewModalProps) {
  const [currentReviewDrill, setCurrentReviewDrill] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentDrill = () => {
    if (isWallBallWorkout) {
      return {
        drill_name: workout?.workout_name || 'Wall Ball Workout',
        duration_minutes: workout?.estimated_duration_minutes || 10,
        sets_and_reps: 'Follow video guidance'
      }
    }
    return drills[currentReviewDrill]?.drill || drills[currentReviewDrill]
  }

  const getCurrentDrillTime = () => {
    return drillTimes[currentReviewDrill] || {
      drill_name: getCurrentDrill()?.drill_name || `Drill ${currentReviewDrill + 1}`,
      started_at: 0,
      actual_seconds: 0,
      required_seconds: 120
    }
  }

  const calculateDrillPoints = (drillIndex: number) => {
    // Base points calculation (simplified for review display)
    const basePoints = 25
    return completedDrills.has(drillIndex) ? basePoints : 0
  }

  const getCompletionStatus = (drillIndex: number) => {
    if (completedDrills.has(drillIndex)) {
      return { status: 'completed', color: 'bg-green-500', text: 'Completed' }
    }
    return { status: 'incomplete', color: 'bg-gray-400', text: 'Incomplete' }
  }

  const currentDrill = getCurrentDrill()
  const currentDrillTime = getCurrentDrillTime()
  const drillPoints = calculateDrillPoints(currentReviewDrill)
  const completionStatus = getCompletionStatus(currentReviewDrill)

  // Calculate performance metrics
  const timeEfficiency = currentDrillTime.required_seconds > 0 
    ? Math.min((currentDrillTime.required_seconds / currentDrillTime.actual_seconds) * 100, 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Workout Analysis
            </div>
            <DialogClose>
              <X className="w-6 h-6" />
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Summary Header */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-center">
                {workout?.workout_name || 'Workout Review'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(totalTime)}</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completedDrills.size}</div>
                  <div className="text-sm text-gray-600">Drills Completed</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drill Navigation */}
          {!isWallBallWorkout && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Drill {currentReviewDrill + 1} of {drills.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentReviewDrill(Math.max(0, currentReviewDrill - 1))}
                    disabled={currentReviewDrill === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex space-x-2">
                    {drills.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewDrill(index)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                          index === currentReviewDrill
                            ? 'bg-blue-600 text-white'
                            : completedDrills.has(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentReviewDrill(Math.min(drills.length - 1, currentReviewDrill + 1))}
                    disabled={currentReviewDrill === drills.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Progress 
                  value={((currentReviewDrill + 1) / drills.length) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}

          {/* Current Drill Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Drill Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentDrill?.drill_name || currentDrill?.title || 'Drill Details'}</span>
                  <Badge 
                    className={`${completionStatus.color} text-white`}
                  >
                    {completionStatus.text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drill Info */}
                <div className="space-y-2">
                  {currentDrill?.duration_minutes && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="font-medium">{currentDrill.duration_minutes} minutes</span>
                    </div>
                  )}
                  {currentDrill?.sets_and_reps && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sets & Reps:</span>
                      <span className="font-medium">{currentDrill.sets_and_reps}</span>
                    </div>
                  )}
                </div>

                {/* Future Enhancement Framework - Redo Drill */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Redo This Drill (Coming Soon)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Future feature: Practice specific drills again
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Time Analysis */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Time Spent:</span>
                    <span className="font-medium">{formatTime(currentDrillTime.actual_seconds)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Required Time:</span>
                    <span className="font-medium">{formatTime(currentDrillTime.required_seconds)}</span>
                  </div>
                  {timeEfficiency > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Efficiency:</span>
                        <span className="font-medium">{Math.round(timeEfficiency)}%</span>
                      </div>
                      <Progress value={timeEfficiency} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Points Analysis */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Points Earned:</span>
                    <span className="font-bold text-green-600">{drillPoints}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {completedDrills.has(currentReviewDrill) 
                        ? `Completed at ${formatTime(currentDrillTime.actual_seconds)}`
                        : 'Not completed'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Workout Stats */}
          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Workout Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">{drills.length || 1}</div>
                  <div className="text-xs text-gray-600">Total Drills</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{completedDrills.size}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round((completedDrills.size / (drills.length || 1)) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{totalPoints}</div>
                  <div className="text-xs text-gray-600">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button onClick={onClose} className="w-full md:w-auto">
              Close Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}