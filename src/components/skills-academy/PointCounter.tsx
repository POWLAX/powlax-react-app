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
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [touchedPoint, setTouchedPoint] = useState<string | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number, y: number } | null>(null)

  // Get relevant point types based on series type
  const getRelevantPointTypes = (series?: string) => {
    if (!pointTypes.length) return []

    // Filter out duplicate Academy Points - only keep one (prefer academy_points)
    const uniquePointTypes = pointTypes.filter((type, index, array) => {
      // If this is an Academy Point variant, only keep academy_points
      if (type.display_name?.toLowerCase().includes('academy')) {
        return type.name === 'academy_points' || type.name === 'academy_point'
      }
      return true
    })

    // Per user requirements:
    // - All drills always give Academy Points
    // - Series-specific points are only earned if on that track
    const seriesPointMap: Record<string, string[]> = {
      'attack': ['academy_points', 'attack_token'],  // Attack series only
      'defense': ['academy_points', 'defense_dollar'], // Defense series only
      'midfield': ['academy_points', 'midfield_medal'], // Midfield series only
      'goalie': ['academy_points', 'rebound_reward'], // Goalie series only
      'wall_ball': ['academy_points', 'rebound_reward'], // Wall Ball gives Rebound Rewards
      'solid_start': ['academy_points'] // Basic series only gives Academy Points
    }

    // Default to just Academy Points if no series type specified
    const relevantTypes = seriesPointMap[series || ''] || ['academy_points']
    
    return uniquePointTypes.filter(type => 
      relevantTypes.some(relevant => 
        type.name === relevant ||
        type.slug === relevant
      )
    )
  }

  // Update display points when points or point types change
  useEffect(() => {
    const relevantTypes = getRelevantPointTypes(seriesType)
    
    const newDisplayPoints: PointDisplay[] = relevantTypes.map(type => {
      const pointValue = 
        points[type.name] || 
        points[type.slug] || 
        0

      return {
        type: type.name,
        value: pointValue,
        icon: type.icon_url || type.image_url || '',
        displayName: type.display_name || type.title || type.name
      }
    })

    // If no specific types found, show academy points at minimum
    if (newDisplayPoints.length === 0) {
      const academyPointType = pointTypes.find(t => t.name === 'academy_points' || t.name === 'academy_point')
      
      if (academyPointType) {
        newDisplayPoints.push({
          type: 'academy_points',
          value: points.academy_points || points.academy_point || 0,
          icon: academyPointType.icon_url || academyPointType.image_url || '',
          displayName: academyPointType.display_name || academyPointType.title || 'Academy Points'
        })
      }
    }

    setDisplayPoints(newDisplayPoints)
  }, [points, pointTypes, seriesType])

  // Animate point changes
  useEffect(() => {
    if (!animate) return

    displayPoints.forEach(point => {
      if (point.value > 0) {
        setAnimatingPoints(prev => new Set([...prev, point.type]))
        
        setTimeout(() => {
          setAnimatingPoints(prev => {
            const newSet = new Set(prev)
            newSet.delete(point.type)
            return newSet
          })
        }, 800)
      }
    })
  }, [displayPoints, animate])

  // Handle touch events for mobile
  const handleTouchStart = (pointType: string, event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchedPoint(pointType)
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    setTouchedPoint(null)
    setTouchPosition(null)
  }

  if (loading) {
    return (
      <div className={`py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-500 text-sm">Loading points...</div>
        </div>
      </div>
    )
  }

  // Show default if no points
  if (displayPoints.length === 0) {
    return (
      <div className={`py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">LC</span>
            </div>
            <span className="text-xl font-bold text-gray-800">0</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 2-Column Layout with Bigger Images (IMAGE-Name-Number format) */}
      <div 
        className={`relative py-4 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}
      >
        {/* Grid Layout - 2 columns on mobile, can expand on desktop */}
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {displayPoints.map((point) => (
            <div 
              key={point.type}
              data-point-type={point.type}
              data-point-icon
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-500 ${
                animatingPoints.has(point.type) 
                  ? 'scale-105 from-blue-100 to-blue-50 shadow-xl ring-2 ring-blue-400 ring-opacity-50' 
                  : 'scale-100 hover:from-gray-100 hover:to-gray-50 hover:shadow-md'
              }`}
              onTouchStart={(e) => handleTouchStart(point.type, e)}
              onTouchEnd={handleTouchEnd}
            >
              {/* Bigger Point Type Icon (IMAGE) */}
              {point.icon ? (
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src={point.icon}
                    alt={point.displayName}
                    fill
                    className="object-contain drop-shadow-md"
                    sizes="56px"
                    priority
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span class="text-white font-bold text-base">
                              ${point.displayName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-base">
                    {point.displayName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              
              {/* Name and Number Column */}
              <div className="flex-1 min-w-0">
                {/* Point Name */}
                <div className="text-xs font-medium text-gray-600 truncate">
                  {point.displayName}
                </div>
                
                {/* Point Value (NUMBER) - Bigger and Bolder */}
                <div className={`text-2xl font-black transition-all duration-500 ${
                  animatingPoints.has(point.type) 
                    ? 'text-blue-600 transform scale-110' 
                    : 'text-gray-900'
                }`}>
                  {point.value.toLocaleString()}
                </div>
              </div>

              {/* Animation Burst Effect */}
              {animatingPoints.has(point.type) && (
                <div className="absolute inset-0 rounded-xl pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-10 animate-ping rounded-xl" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Touch Tooltip */}
        {touchedPoint && (
          <div 
            className="fixed px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50"
            style={touchPosition ? {
              left: touchPosition.x,
              top: touchPosition.y - 50,
              transform: 'translateX(-50%)'
            } : undefined}
          >
            {displayPoints.find(p => p.type === touchedPoint)?.displayName}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}