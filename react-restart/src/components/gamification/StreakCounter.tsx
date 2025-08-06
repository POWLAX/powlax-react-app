// Streak Counter Component
// Phase 1: Anti-Gaming Foundation

import { Flame, Snowflake, Trophy, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  streakTitle: string
  freezesRemaining?: number
  milestoneProgress?: {
    next: number | null
    progress: number
    remaining: number
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakCounter({
  currentStreak,
  longestStreak, 
  streakTitle,
  freezesRemaining = 0,
  milestoneProgress,
  size = 'md',
  className
}: StreakCounterProps) {
  const sizeConfig = {
    sm: {
      container: 'p-3',
      flame: 'w-5 h-5',
      number: 'text-xl',
      title: 'text-xs',
      subtitle: 'text-xs'
    },
    md: {
      container: 'p-4',
      flame: 'w-6 h-6', 
      number: 'text-2xl',
      title: 'text-sm',
      subtitle: 'text-sm'
    },
    lg: {
      container: 'p-6',
      flame: 'w-8 h-8',
      number: 'text-3xl', 
      title: 'text-base',
      subtitle: 'text-base'
    }
  }

  const config = sizeConfig[size]
  const isActive = currentStreak > 0

  return (
    <Card className={cn(
      'relative overflow-hidden',
      isActive 
        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
        : 'bg-gray-100 text-gray-600',
      className
    )}>
      <CardContent className={config.container}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full',
              isActive ? 'bg-white/20' : 'bg-gray-200'
            )}>
              <Flame 
                className={cn(
                  config.flame,
                  isActive ? 'text-white' : 'text-gray-500'
                )} 
              />
            </div>
            
            <div>
              <div className={cn('font-bold', config.number)}>
                {currentStreak}
              </div>
              <div className={cn(
                'opacity-90',
                config.subtitle,
                isActive ? 'text-white/90' : 'text-gray-500'
              )}>
                day streak
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={cn('font-medium', config.title)}>
              {streakTitle}
            </div>
            {longestStreak > currentStreak && (
              <div className={cn(
                'opacity-75',
                config.subtitle,
                isActive ? 'text-white/75' : 'text-gray-400'
              )}>
                Best: {longestStreak}
              </div>
            )}
          </div>
        </div>

        {/* Milestone Progress */}
        {milestoneProgress && milestoneProgress.next && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs opacity-90">
              <span>Next milestone</span>
              <span>{milestoneProgress.remaining} days to go</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5">
              <div 
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${milestoneProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Streak Freezes */}
        {freezesRemaining > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Snowflake className="w-3 h-3" />
            <span className="text-xs opacity-90">
              {freezesRemaining} freeze{freezesRemaining !== 1 ? 's' : ''} left
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact streak display for cards/headers
interface CompactStreakProps {
  streak: number
  className?: string
}

export function CompactStreak({ streak, className }: CompactStreakProps) {
  if (streak === 0) return null
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'bg-orange-100 text-orange-800 border-orange-200',
        className
      )}
    >
      <Flame className="w-3 h-3 mr-1" />
      {streak} day{streak !== 1 ? 's' : ''}
    </Badge>
  )
}

// Milestone celebration component
interface MilestoneCelebrationProps {
  milestone: number
  isNew?: boolean
  className?: string
}

export function MilestoneCelebration({ 
  milestone, 
  isNew = false,
  className 
}: MilestoneCelebrationProps) {
  const milestoneData = {
    7: { title: 'Weekly Warrior!', icon: Calendar, color: 'from-blue-500 to-purple-500' },
    30: { title: 'Monthly Master!', icon: Trophy, color: 'from-purple-500 to-pink-500' },
    100: { title: 'Century Club!', icon: Trophy, color: 'from-yellow-500 to-red-500' }
  }

  const data = milestoneData[milestone as keyof typeof milestoneData]
  if (!data) return null

  return (
    <Card className={cn(
      'relative overflow-hidden animate-pulse',
      `bg-gradient-to-r ${data.color} text-white`,
      className
    )}>
      <CardContent className="p-4 text-center">
        <data.icon className="w-8 h-8 mx-auto mb-2" />
        <h3 className="font-bold text-lg">{data.title}</h3>
        <p className="text-white/90 text-sm">
          {milestone} day streak achieved!
        </p>
        {isNew && (
          <Badge className="mt-2 bg-white/20 text-white border-white/30">
            🎉 New Achievement
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

// Streak stats for analytics
interface StreakStatsProps {
  currentStreak: number
  longestStreak: number
  totalWorkouts: number
  className?: string
}

export function StreakStats({ 
  currentStreak, 
  longestStreak, 
  totalWorkouts,
  className 
}: StreakStatsProps) {
  const consistency = totalWorkouts > 0 ? Math.round((currentStreak / totalWorkouts) * 100) : 0
  
  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="font-bold text-lg text-orange-600">{currentStreak}</div>
        <div className="text-xs text-gray-600">Current</div>
      </div>
      
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="font-bold text-lg text-blue-600">{longestStreak}</div>
        <div className="text-xs text-gray-600">Best Ever</div>
      </div>
      
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="font-bold text-lg text-green-600">{consistency}%</div>
        <div className="text-xs text-gray-600">Consistency</div>
      </div>
    </div>
  )
}