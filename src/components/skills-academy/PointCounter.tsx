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

  // Get relevant point types and eliminate duplicates (fix for Patrick's duplicate Academy Points issue)
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

    // Map series types to relevant point types - using exact names that match database
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
    ).slice(0, 5) // Allow up to 5 point types for 2-column layout
  }

  // Update display points when points or point types change (PERMANENCE PATTERN: Direct column reads)
  useEffect(() => {
    const relevantTypes = getRelevantPointTypes(seriesType)
    
    const newDisplayPoints: PointDisplay[] = relevantTypes.map(type => {
      // PERMANENCE PATTERN: Direct column reads - use display_name and icon_url directly
      const pointValue = 
        points[type.name] || 
        points[type.slug] || 
        0

      return {
        type: type.name,
        value: pointValue,
        icon: type.icon_url || '', // Direct from database column
        displayName: type.display_name || type.name // Direct from database column
      }
    })

    // If no specific types found, show lax credits at minimum (but only one Academy Point type)
    if (newDisplayPoints.length === 0) {
      const laxCreditType = pointTypes.find(t => t.name === 'lax_credit')
      
      if (laxCreditType) {
        newDisplayPoints.push({
          type: 'lax_credit',
          value: points.lax_credit || points.academy_points || points.academy_point || 0,
          icon: laxCreditType.icon_url || '',
          displayName: laxCreditType.display_name || 'Lax Credits'
        })
      }
    }

    setDisplayPoints(newDisplayPoints)
  }, [points, pointTypes, seriesType])

  // Animate point changes - REAL-TIME updates for Patrick's requirements
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
        }, 800) // Slightly longer for more vibrant effect
      }
    })
  }, [displayPoints, animate])

  if (loading) {
    return (
      <div className={`py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-500 text-sm">Loading points...</div>
        </div>
      </div>
    )
  }

  // Show default points if no specific points are displayed
  if (displayPoints.length === 0) {
    return (
      <div className={`grid grid-cols-3 gap-2 py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">LC</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800">0</span>
              <span className="text-xs text-gray-600">Lax Credits</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Patrick's 2-column layout: Column 1: 2 points, Column 2: 2 points, Column 3: 1 point (if odd)
  // Layout: IMAGE (bigger - 48x48px) - Name - Number
  const column1Points = displayPoints.slice(0, 2)
  const column2Points = displayPoints.slice(2, 4)
  const column3Points = displayPoints.slice(4, 5) // Only 1 point if odd number

  return (
    <div className={`grid grid-cols-3 gap-2 py-3 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 ${className}`}>
      {/* Column 1: First 2 point types */}
      <div className="flex flex-col space-y-2">
        {column1Points.map((point) => (
          <div 
            key={point.type}
            className={`flex items-center space-x-2 px-2 py-2 rounded-lg bg-gray-50 transition-all duration-300 ${
              animatingPoints.has(point.type) 
                ? 'scale-105 bg-blue-100 shadow-md' 
                : 'scale-100'
            }`}
          >
            {/* Point Type Icon - BIGGER (48x48px) */}
            {point.icon && (
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={point.icon}
                  alt={point.displayName}
                  fill
                  className="object-contain"
                  sizes="48px"
                  onError={(e) => {
                    // Hide broken images gracefully
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            {/* Point Value and Name */}
            <div className="flex flex-col min-w-0">
              <div className={`text-base font-bold transition-all duration-300 ${
                animatingPoints.has(point.type) 
                  ? 'text-blue-600 transform scale-110' 
                  : 'text-gray-800'
              }`}>
                {point.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {point.displayName}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Column 2: Next 2 point types */}
      <div className="flex flex-col space-y-2">
        {column2Points.map((point) => (
          <div 
            key={point.type}
            className={`flex items-center space-x-2 px-2 py-2 rounded-lg bg-gray-50 transition-all duration-300 ${
              animatingPoints.has(point.type) 
                ? 'scale-105 bg-blue-100 shadow-md' 
                : 'scale-100'
            }`}
          >
            {/* Point Type Icon - BIGGER (48x48px) */}
            {point.icon && (
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={point.icon}
                  alt={point.displayName}
                  fill
                  className="object-contain"
                  sizes="48px"
                  onError={(e) => {
                    // Hide broken images gracefully
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            {/* Point Value and Name */}
            <div className="flex flex-col min-w-0">
              <div className={`text-base font-bold transition-all duration-300 ${
                animatingPoints.has(point.type) 
                  ? 'text-blue-600 transform scale-110' 
                  : 'text-gray-800'
              }`}>
                {point.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {point.displayName}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Column 3: Last point type (if odd number) */}
      <div className="flex flex-col justify-center">
        {column3Points.map((point) => (
          <div 
            key={point.type}
            className={`flex items-center space-x-2 px-2 py-2 rounded-lg bg-gray-50 transition-all duration-300 ${
              animatingPoints.has(point.type) 
                ? 'scale-105 bg-blue-100 shadow-md' 
                : 'scale-100'
            }`}
          >
            {/* Point Type Icon - BIGGER (48x48px) */}
            {point.icon && (
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={point.icon}
                  alt={point.displayName}
                  fill
                  className="object-contain"
                  sizes="48px"
                  onError={(e) => {
                    // Hide broken images gracefully
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            {/* Point Value and Name */}
            <div className="flex flex-col min-w-0">
              <div className={`text-base font-bold transition-all duration-300 ${
                animatingPoints.has(point.type) 
                  ? 'text-blue-600 transform scale-110' 
                  : 'text-gray-800'
              }`}>
                {point.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {point.displayName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}