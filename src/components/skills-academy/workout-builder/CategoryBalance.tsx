'use client'

import { Progress } from '@/components/ui/progress'

interface WorkoutSlot {
  id: string
  drill: {
    category: 'attack' | 'defense' | 'midfield' | 'wall_ball' | 'fundamentals'
    duration_minutes: number
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

interface CategoryBalanceProps {
  slots: WorkoutSlot[]
}

const categoryConfig = {
  attack: { icon: '⚔️', name: 'Attack', color: 'bg-red-500' },
  defense: { icon: '🛡️', name: 'Defense', color: 'bg-blue-500' },
  midfield: { icon: '🏃', name: 'Midfield', color: 'bg-green-500' },
  wall_ball: { icon: '🎾', name: 'Wall Ball', color: 'bg-yellow-500' },
  fundamentals: { icon: '🎯', name: 'Fundamentals', color: 'bg-purple-500' }
}

export default function CategoryBalance({ slots }: CategoryBalanceProps) {
  // Calculate category distribution
  const categoryStats = slots.reduce((acc, slot) => {
    const category = slot.drill.category
    const points = slot.drill.point_values
    
    if (!acc[category]) {
      acc[category] = { count: 0, duration: 0, points: 0 }
    }
    
    acc[category].count++
    acc[category].duration += slot.drill.duration_minutes
    
    // Calculate category-specific points
    if (category === 'attack' && points.attack_tokens) {
      acc[category].points += points.attack_tokens
    } else if (category === 'defense' && points.defense_dollars) {
      acc[category].points += points.defense_dollars
    } else if (category === 'midfield' && points.midfield_medals) {
      acc[category].points += points.midfield_medals
    } else if (category === 'wall_ball' && points.rebound_rewards) {
      acc[category].points += points.rebound_rewards
    } else {
      acc[category].points += points.lax_credit
    }
    
    return acc
  }, {} as Record<string, { count: number; duration: number; points: number }>)

  const totalDuration = slots.reduce((sum, slot) => sum + slot.drill.duration_minutes, 0)
  const totalDrills = slots.length

  // Check for streaks
  let currentStreak = { category: null as string | null, count: 0 }
  let maxStreak = { category: null as string | null, count: 0 }
  
  slots.forEach(slot => {
    if (currentStreak.category === slot.drill.category) {
      currentStreak.count++
    } else {
      if (currentStreak.count > maxStreak.count) {
        maxStreak = { ...currentStreak }
      }
      currentStreak = { category: slot.drill.category, count: 1 }
    }
  })
  
  if (currentStreak.count > maxStreak.count) {
    maxStreak = currentStreak
  }

  if (totalDrills === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Add drills to see category distribution
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Visual Bar Chart */}
      <div className="space-y-3">
        {Object.entries(categoryConfig).map(([category, config]) => {
          const stats = categoryStats[category]
          if (!stats) return null
          
          const percentage = (stats.duration / totalDuration) * 100
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-1">
                  <span className="text-lg">{config.icon}</span>
                  {config.name}
                </span>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{stats.count}</span> drills • 
                  <span className="font-semibold ml-1">{stats.duration}</span> min • 
                  <span className="font-semibold ml-1">{stats.points}</span> pts
                </div>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div 
                  className={`absolute left-0 top-0 h-2 rounded-full ${config.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(0)}% of workout
              </div>
            </div>
          )
        })}
      </div>

      {/* Streak Information */}
      {maxStreak.count >= 3 && maxStreak.category && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-800">
              🔥 {categoryConfig[maxStreak.category as keyof typeof categoryConfig].name} Streak!
            </span>
            <span className="text-sm text-amber-700">
              {maxStreak.count} consecutive drills
            </span>
          </div>
          {maxStreak.count >= 5 && (
            <div className="text-xs text-amber-600 mt-1">
              Eligible for 2x category multiplier bonus!
            </div>
          )}
        </div>
      )}

      {/* Balance Recommendations */}
      {totalDrills >= 3 && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="font-semibold">Balance Tips:</div>
          {Object.keys(categoryConfig).filter(cat => !categoryStats[cat]).length > 2 && (
            <div>• Consider adding variety with other categories</div>
          )}
          {maxStreak.count < 5 && maxStreak.count >= 3 && (
            <div>• Add {5 - maxStreak.count} more {maxStreak.category} drills for 2x multiplier</div>
          )}
          {totalDuration < 10 && (
            <div>• Workout is under 10 minutes - consider adding more drills</div>
          )}
          {totalDuration > 30 && (
            <div>• Workout is over 30 minutes - consider splitting into multiple sessions</div>
          )}
        </div>
      )}
    </div>
  )
}