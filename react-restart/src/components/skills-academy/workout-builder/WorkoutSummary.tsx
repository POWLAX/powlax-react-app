'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Trophy, Target, Zap, Flame } from 'lucide-react'

interface WorkoutSlot {
  id: string
  drill: {
    category: 'attack' | 'defense' | 'midfield' | 'wall_ball' | 'fundamentals'
    duration_minutes: number
    complexity: 'foundation' | 'building' | 'advanced'
    point_values: {
      lax_credit: number
      attack_tokens?: number
      defense_dollars?: number
      midfield_medals?: number
      rebound_rewards?: number
      lax_iq_points?: number
      flex_points?: number
    }
  }
  order: number
}

interface WorkoutSummaryProps {
  slots: WorkoutSlot[]
  multiplier: number
}

export default function WorkoutSummary({ slots, multiplier = 1.0 }: WorkoutSummaryProps) {
  // Calculate totals
  const totalDuration = slots.reduce((sum, slot) => sum + slot.drill.duration_minutes, 0)
  const drillCount = slots.length
  
  // Calculate complexity distribution
  const complexityCount = slots.reduce((acc, slot) => {
    acc[slot.drill.complexity] = (acc[slot.drill.complexity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Calculate total points with multiplier
  const basePoints = slots.reduce((acc, slot) => {
    const points = slot.drill.point_values
    return {
      lax_credit: acc.lax_credit + (points.lax_credit || 0),
      attack_tokens: acc.attack_tokens + (points.attack_tokens || 0),
      defense_dollars: acc.defense_dollars + (points.defense_dollars || 0),
      midfield_medals: acc.midfield_medals + (points.midfield_medals || 0),
      rebound_rewards: acc.rebound_rewards + (points.rebound_rewards || 0),
      lax_iq_points: acc.lax_iq_points + (points.lax_iq_points || 0),
      flex_points: acc.flex_points + (points.flex_points || 0),
    }
  }, {
    lax_credit: 0,
    attack_tokens: 0,
    defense_dollars: 0,
    midfield_medals: 0,
    rebound_rewards: 0,
    lax_iq_points: 0,
    flex_points: 0,
  })
  
  const totalBasePoints = Object.values(basePoints).reduce((sum, val) => sum + val, 0)
  const totalPointsWithMultiplier = Math.round(totalBasePoints * multiplier)
  
  // Determine workout intensity
  const getIntensity = () => {
    const avgComplexity = (
      (complexityCount.foundation || 0) * 1 +
      (complexityCount.building || 0) * 2 +
      (complexityCount.advanced || 0) * 3
    ) / drillCount
    
    if (avgComplexity <= 1.3) return { label: 'Light', color: 'text-green-600' }
    if (avgComplexity <= 2.3) return { label: 'Moderate', color: 'text-blue-600' }
    return { label: 'Intense', color: 'text-purple-600' }
  }
  
  const intensity = drillCount > 0 ? getIntensity() : null

  if (drillCount === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          Add drills to see workout summary
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{totalDuration}</div>
            <div className="text-xs text-gray-600">minutes</div>
          </div>
          <div className="text-center">
            <Target className="h-8 w-8 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{drillCount}</div>
            <div className="text-xs text-gray-600">drills</div>
          </div>
          <div className="text-center">
            <Trophy className="h-8 w-8 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{totalPointsWithMultiplier}</div>
            <div className="text-xs text-gray-600">total pts</div>
          </div>
        </div>

        {/* Intensity Level */}
        {intensity && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Workout Intensity:</span>
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${intensity.color}`} />
              <span className={`font-semibold ${intensity.color}`}>
                {intensity.label}
              </span>
            </div>
          </div>
        )}

        {/* Complexity Breakdown */}
        <div>
          <div className="text-sm font-medium mb-2">Difficulty Distribution:</div>
          <div className="space-y-2">
            {['foundation', 'building', 'advanced'].map(level => {
              const count = complexityCount[level] || 0
              const percentage = (count / drillCount) * 100
              
              return (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-xs w-20 capitalize">{level}:</span>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-xs w-10 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Multiplier Status */}
        {multiplier > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800">
                  Multiplier Active!
                </span>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {multiplier}x Points
              </Badge>
            </div>
            <div className="text-xs text-amber-700 mt-1">
              Base: {totalBasePoints} pts → Boosted: {totalPointsWithMultiplier} pts
            </div>
          </div>
        )}

        {/* Point Categories */}
        <div>
          <div className="text-sm font-medium mb-2">Points by Category:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {basePoints.lax_credit > 0 && (
              <div className="flex justify-between">
                <span>💰 Lax Credit:</span>
                <span className="font-semibold">
                  {Math.round(basePoints.lax_credit * multiplier)}
                </span>
              </div>
            )}
            {basePoints.attack_tokens > 0 && (
              <div className="flex justify-between">
                <span>⚔️ Attack:</span>
                <span className="font-semibold">
                  {Math.round(basePoints.attack_tokens * multiplier)}
                </span>
              </div>
            )}
            {basePoints.defense_dollars > 0 && (
              <div className="flex justify-between">
                <span>🛡️ Defense:</span>
                <span className="font-semibold">
                  {Math.round(basePoints.defense_dollars * multiplier)}
                </span>
              </div>
            )}
            {basePoints.midfield_medals > 0 && (
              <div className="flex justify-between">
                <span>🏃 Midfield:</span>
                <span className="font-semibold">
                  {Math.round(basePoints.midfield_medals * multiplier)}
                </span>
              </div>
            )}
            {basePoints.rebound_rewards > 0 && (
              <div className="flex justify-between">
                <span>🎾 Rebounds:</span>
                <span className="font-semibold">
                  {Math.round(basePoints.rebound_rewards * multiplier)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}