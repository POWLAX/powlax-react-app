'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import WallBallWorkoutRunner from '@/components/skills-academy/WallBallWorkoutRunner'
import { useWallBallVariant } from '@/hooks/useWallBallWorkouts'

export default function WallBallVariantPage() {
  const params = useParams()
  const variantId = params?.id ? parseInt(params.id as string) : null
  
  const { variant, loading, error } = useWallBallVariant(variantId)

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-powlax-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wall ball workout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !variant) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wall Ball Workout Not Found</h2>
          <p className="text-gray-600 mb-8">This workout could not be loaded.</p>
          <Button asChild>
            <Link href="/skills-academy/workouts">Back to Workouts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link href="/skills-academy/workouts">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="text-center flex-1 px-2">
            <h1 className="text-lg md:text-xl font-bold text-powlax-blue truncate">
              {variant.series?.series_name} - {variant.duration_minutes} min
            </h1>
            <div className="text-xs md:text-sm text-gray-600">
              {variant.has_coaching ? 'With Coaching' : 'No Coaching'}
            </div>
          </div>
        </div>
      </div>

      {/* Wall Ball Workout Runner */}
      <div className="flex-1 overflow-hidden">
        <WallBallWorkoutRunner workout={variant} />
      </div>
    </div>
  )
}