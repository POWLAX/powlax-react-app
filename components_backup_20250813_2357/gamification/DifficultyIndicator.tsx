// Difficulty Indicator Component
// Phase 1: Anti-Gaming Foundation

import { memo } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DifficultyIndicatorProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const DIFFICULTY_LABELS = {
  1: 'Beginner',
  2: 'Easy', 
  3: 'Medium',
  4: 'Hard',
  5: 'Elite'
}

const DIFFICULTY_COLORS = {
  1: 'text-green-500 fill-green-500',
  2: 'text-blue-500 fill-blue-500',
  3: 'text-yellow-500 fill-yellow-500', 
  4: 'text-orange-500 fill-orange-500',
  5: 'text-red-500 fill-red-500'
}

export const DifficultyIndicator = memo(function DifficultyIndicator({ 
  score, 
  size = 'md', 
  showLabel = false,
  className 
}: DifficultyIndicatorProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const normalizedScore = Math.max(1, Math.min(5, Math.round(score)))
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-0.5">
        {stars.map(star => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= normalizedScore 
                ? DIFFICULTY_COLORS[normalizedScore as keyof typeof DIFFICULTY_COLORS]
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      
      {showLabel && (
        <span className={cn(
          'font-medium ml-1',
          textSizeClasses[size],
          DIFFICULTY_COLORS[normalizedScore as keyof typeof DIFFICULTY_COLORS].split(' ')[0]
        )}>
          {DIFFICULTY_LABELS[normalizedScore as keyof typeof DIFFICULTY_LABELS]}
        </span>
      )}
    </div>
  )
})

// Variant for showing average difficulty with decimal precision
interface AverageDifficultyProps {
  averageScore: number
  totalDrills: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AverageDifficulty = memo(function AverageDifficulty({ 
  averageScore, 
  totalDrills, 
  size = 'md',
  className 
}: AverageDifficultyProps) {
  const roundedScore = Math.round(averageScore)
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DifficultyIndicator score={roundedScore} size={size} />
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          Avg: {averageScore.toFixed(1)}/5.0
        </span>
        <span className="text-xs text-muted-foreground">
          {totalDrills} drill{totalDrills !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
})

// Difficulty badge for compact display
interface DifficultyBadgeProps {
  score: number
  className?: string
}

export const DifficultyBadge = memo(function DifficultyBadge({ score, className }: DifficultyBadgeProps) {
  const normalizedScore = Math.max(1, Math.min(5, Math.round(score)))
  const label = DIFFICULTY_LABELS[normalizedScore as keyof typeof DIFFICULTY_LABELS]
  
  const badgeColors = {
    1: 'bg-green-100 text-green-800 border-green-200',
    2: 'bg-blue-100 text-blue-800 border-blue-200',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    4: 'bg-orange-100 text-orange-800 border-orange-200', 
    5: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
      badgeColors[normalizedScore as keyof typeof badgeColors],
      className
    )}>
      <Star className="w-3 h-3 fill-current" />
      {label}
    </span>
  )
})

// Difficulty progression bar (for workout averages)
interface DifficultyProgressBarProps {
  currentDifficulty: number
  targetDifficulty?: number
  className?: string
}

export const DifficultyProgressBar = memo(function DifficultyProgressBar({ 
  currentDifficulty, 
  targetDifficulty = 5,
  className 
}: DifficultyProgressBarProps) {
  const progress = (currentDifficulty / targetDifficulty) * 100
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span>Difficulty Level</span>
        <span className="font-medium">
          {currentDifficulty.toFixed(1)}/{targetDifficulty}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Beginner</span>
        <span>Elite</span>
      </div>
    </div>
  )
})