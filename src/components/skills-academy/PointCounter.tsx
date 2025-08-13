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

  // Get relevant point types and eliminate duplicates
  const getRelevantPointTypes = (series?: string) => {
    if (!pointTypes.length) return []

    // Filter out duplicate Academy Points - only keep one (prefer lax_credit)
    const uniquePointTypes = pointTypes.filter((type, index, array) => {
      // If this is an Academy Point variant, only keep lax_credit
      if (type.display_name?.toLowerCase().includes('academy')) {
        return type.name === 'lax_credit'
      }
      return true
    })

    // Map series types to relevant point types
    const seriesPointMap: Record<string, string[]> = {
      'attack': ['lax_credit', 'attack_token', 'lax_iq_point'],
      'defense': ['lax_credit', 'defense_dollar', 'rebound_reward'], 
      'midfield': ['lax_credit', 'midfield_medal', 'flex_point'],
      'wall_ball': ['lax_credit', 'rebound_reward', 'lax_iq_point'],
      'goalie': ['lax_credit', 'defense_dollar', 'rebound_reward']
    }

    const relevantTypes = seriesPointMap[series || ''] || ['lax_credit', 'lax_iq_point', 'flex_point']
    
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

    // If no specific types found, show lax credits at minimum
    if (newDisplayPoints.length === 0) {
      const laxCreditType = pointTypes.find(t => t.name === 'lax_credit')
      
      if (laxCreditType) {
        newDisplayPoints.push({
          type: 'lax_credit',
          value: points.lax_credit || points.academy_points || 0,
          icon: laxCreditType.icon_url || laxCreditType.image_url || '',
          displayName: laxCreditType.display_name || laxCreditType.title || 'Lax Credits'
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
      {/* Horizontal bar layout */}
      <div 
        className={`relative py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}
        onMouseEnter={() => !touchedPoint && setHoveredPoint('header')}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {/* Header tooltip on hover */}
        {hoveredPoint === 'header' && !touchedPoint && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
            Points earned during this workout!
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 md:gap-6">
          {displayPoints.map((point) => (
            <div 
              key={point.type}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 transition-all duration-300 ${
                animatingPoints.has(point.type) 
                  ? 'scale-110 bg-blue-100 shadow-lg' 
                  : 'scale-100 hover:bg-gray-100'
              }`}
              onMouseEnter={() => !touchedPoint && setHoveredPoint(point.type)}
              onMouseLeave={() => setHoveredPoint(null)}
              onTouchStart={(e) => handleTouchStart(point.type, e)}
              onTouchEnd={handleTouchEnd}
            >
              {/* Tooltip for point name */}
              {(hoveredPoint === point.type || touchedPoint === point.type) && (
                <div 
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                  style={touchPosition ? {
                    position: 'fixed',
                    left: touchPosition.x,
                    top: touchPosition.y - 40,
                    transform: 'translateX(-50%)'
                  } : undefined}
                >
                  {point.displayName}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              )}

              {/* Point Type Icon */}
              {point.icon ? (
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image
                    src={point.icon}
                    alt={point.displayName}
                    fill
                    className="object-contain"
                    sizes="40px"
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span class="text-blue-600 font-bold text-xs">
                              ${point.displayName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">
                    {point.displayName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              
              {/* Point Value (no name) */}
              <div className={`text-xl font-bold transition-all duration-300 ${
                animatingPoints.has(point.type) 
                  ? 'text-blue-600 transform scale-110' 
                  : 'text-gray-800'
              }`}>
                {point.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}