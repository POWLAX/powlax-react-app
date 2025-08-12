'use client'

import { useState, useEffect } from 'react'
import { usePointTypes } from '@/hooks/usePointTypes'
import Image from 'next/image'

interface PointCounterProps {
  /** Current points earned in the workout */
  points: Record<string, number>
  /** Series type to determine which points to show */
  seriesType?: string
  /** Show animation when points change */
  animate?: boolean
  /** Additional CSS classes */
  className?: string
}

interface PointDisplay {
  type: string
  value: number
  icon: string
  displayName: string
}

export default function PointCounter({ 
  points, 
  seriesType, 
  animate = true, 
  className = '' 
}: PointCounterProps) {
  const { pointTypes, loading } = usePointTypes()
  const [displayPoints, setDisplayPoints] = useState<PointDisplay[]>([])
  const [animatingPoints, setAnimatingPoints] = useState<Set<string>>(new Set())

  // Determine which point types to show based on series type
  const getRelevantPointTypes = (series?: string) => {
    if (!pointTypes.length) return []

    // Map series types to relevant point types - using exact names that match database
    const seriesPointMap: Record<string, string[]> = {
      'attack': ['lax_credit', 'attack_token', 'lax_iq_points'],
      'defense': ['lax_credit', 'defense_dollar', 'rebound_reward'],
      'midfield': ['lax_credit', 'midfield_medal', 'flex_points'],
      'wall_ball': ['lax_credit', 'rebound_reward', 'lax_iq_points'],
      'goalie': ['lax_credit', 'defense_dollar', 'rebound_reward']
    }

    const relevantTypes = seriesPointMap[series || ''] || ['lax_credit', 'lax_iq_points']
    
    return pointTypes.filter(type => 
      relevantTypes.some(relevant => 
        type.name === relevant ||
        type.slug === relevant ||
        (type.display_name && type.display_name.toLowerCase().replace(/\s+/g, '_') === relevant) ||
        (type.display_name && type.display_name.toLowerCase().includes(relevant.replace('_', ' '))) ||
        (relevant === 'lax_credit' && type.display_name && type.display_name.toLowerCase().includes('academy'))
      )
    ).slice(0, 3) // Limit to 3 point types for clean mobile display
  }

  // Update display points when points or point types change
  useEffect(() => {
    const relevantTypes = getRelevantPointTypes(seriesType)
    
    const newDisplayPoints: PointDisplay[] = relevantTypes.map(type => {
      // Match point type to points object by various naming conventions
      const pointValue = 
        points[type.name] || 
        points[type.slug] || 
        (type.display_name && points[type.display_name.toLowerCase().replace(/\s+/g, '_')]) ||
        (type.display_name && points[type.display_name.toLowerCase()]) ||
        0

      return {
        type: type.name,
        value: pointValue,
        icon: type.icon_url || '',
        displayName: type.display_name
      }
    })

    // If no specific types found, show lax credits at minimum
    if (newDisplayPoints.length === 0 && (points.lax_credit || points.academy_points)) {
      const academyType = pointTypes.find(t => 
        t.display_name.toLowerCase().includes('academy') ||
        t.display_name.toLowerCase().includes('credit') ||
        t.name === 'academy_point' ||
        t.slug === 'academy-point'
      )
      
      newDisplayPoints.push({
        type: 'lax_credit',
        value: points.lax_credit || points.academy_points || 0,
        icon: academyType?.icon_url || '',
        displayName: academyType?.display_name || 'Lax Credits'
      })
    }

    setDisplayPoints(newDisplayPoints)
  }, [points, pointTypes, seriesType])

  // Animate point changes
  useEffect(() => {
    if (!animate) return

    displayPoints.forEach(point => {
      if (point.value > 0) {
        setAnimatingPoints(prev => new Set([...prev, point.type]))
        
        // Remove animation after duration
        setTimeout(() => {
          setAnimatingPoints(prev => {
            const newSet = new Set(prev)
            newSet.delete(point.type)
            return newSet
          })
        }, 600)
      }
    })
  }, [displayPoints, animate])

  if (loading) {
    return null
  }

  // Show default points if no specific points are displayed
  if (displayPoints.length === 0) {
    const defaultPoints = [
      { type: 'lax_credit', value: 0, icon: '', displayName: 'Lax Credits' }
    ]
    return (
      <div className={`flex items-center justify-center space-x-2 sm:space-x-4 py-2 px-2 sm:px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-50">
          <span className="text-xs sm:text-sm font-medium text-gray-600">Lax Credits:</span>
          <span className="text-sm sm:text-base font-bold text-blue-600">0</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center space-x-2 sm:space-x-4 py-2 px-2 sm:px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      {displayPoints.map((point, index) => (
        <div 
          key={point.type}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-50 transition-all duration-300 ${
            animatingPoints.has(point.type) 
              ? 'scale-110 bg-blue-100 shadow-md' 
              : 'scale-100'
          }`}
        >
          {/* Point Type Icon */}
          {point.icon && (
            <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
              <Image
                src={point.icon}
                alt={point.displayName}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 20px, 24px"
                onError={(e) => {
                  // Hide broken images gracefully
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          
          {/* Point Value */}
          <div className="flex flex-col items-center min-w-0">
            <div className={`text-sm sm:text-lg font-bold transition-all duration-300 ${
              animatingPoints.has(point.type) 
                ? 'text-blue-600 transform scale-110' 
                : 'text-gray-800'
            }`}>
              {point.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 truncate max-w-16 sm:max-w-20 text-center">
              {point.displayName}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}