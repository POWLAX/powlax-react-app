'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Target, Clock, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'

// Types for Wall Ball data
interface WallBallDrill {
  id: number
  name: string
  description: string
  strong_hand_video_url: string | null
  off_hand_video_url: string | null
  both_hands_video_url: string | null
  strong_hand_vimeo_id: string | null
  off_hand_vimeo_id: string | null
  both_hands_vimeo_id: string | null
  difficulty_level: number | null
}

interface WallBallCollectionDrill {
  id: number
  collection_id: number
  drill_id: number
  sequence_order: number
  video_type: 'strong_hand' | 'off_hand' | 'both_hands'
  duration_seconds: number | null
  drill: WallBallDrill
}

interface WallBallCollection {
  id: number
  name: string
  workout_type: string | null
  duration_minutes: number | null
  has_coaching: boolean | null
  video_url: string | null
  vimeo_id: string | null
  difficulty_level: number | null
  description: string | null
  drills: WallBallCollectionDrill[]
}

export default function WallBallWorkoutPage() {
  const params = useParams()
  const id = params?.id as string
  const [workout, setWorkout] = useState<WallBallCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkout() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Fetch the workout collection with its drills
        const { data: collection, error: collectionError } = await supabase
          .from('powlax_wall_ball_collections')
          .select('*')
          .eq('id', id)
          .single()

        if (collectionError) {
          throw new Error(`Workout not found: ${collectionError.message}`)
        }

        // Fetch the drills for this collection
        const { data: drills, error: drillsError } = await supabase
          .from('powlax_wall_ball_collection_drills')
          .select(`
            *,
            drill:powlax_wall_ball_drill_library(*)
          `)
          .eq('collection_id', id)
          .order('sequence_order')

        if (drillsError) {
          throw new Error(`Failed to load drills: ${drillsError.message}`)
        }

        setWorkout({
          ...collection,
          drills: drills || []
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWorkout()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Workout Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'This workout could not be loaded.'}</p>
          <Button asChild>
            <Link href="/skills-academy/wall-ball">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wall Ball
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {workout.workout_type && (
                <Badge variant="outline">{workout.workout_type}</Badge>
              )}
              {workout.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{workout.duration_minutes} min</span>
                </div>
              )}
              {workout.difficulty_level && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Level {workout.difficulty_level}</span>
                </div>
              )}
              {workout.has_coaching && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Coached</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/skills-academy/wall-ball">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wall Ball
            </Link>
          </Button>
        </div>

        {/* Description */}
        {workout.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{workout.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Workout Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{workout.drills.length}</div>
              <div className="text-sm text-muted-foreground">Drills</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{workout.duration_minutes || '~10'}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {workout.drills.reduce((total, drill) => total + (drill.duration_seconds || 60), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Seconds</div>
            </CardContent>
          </Card>
        </div>

        {/* Drill Sequence */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Drill Sequence</h3>
            <div className="space-y-3">
              {workout.drills.map((collectionDrill, index) => (
                <div key={collectionDrill.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{collectionDrill.drill.name}</div>
                    <div className="text-sm text-muted-foreground">{collectionDrill.drill.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {collectionDrill.video_type.replace('_', ' ')}
                      </Badge>
                      {collectionDrill.duration_seconds && (
                        <span className="text-xs text-muted-foreground">
                          {collectionDrill.duration_seconds}s
                        </span>
                      )}
                      {collectionDrill.drill.difficulty_level && (
                        <span className="text-xs text-muted-foreground">
                          Level {collectionDrill.drill.difficulty_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button className="flex-1" size="lg">
            <Play className="w-5 h-5 mr-2" />
            Start Workout
          </Button>
          {workout.video_url && (
            <Button variant="outline" size="lg" asChild>
              <a href={workout.video_url} target="_blank" rel="noopener noreferrer">
                <Target className="w-5 h-5 mr-2" />
                Preview Video
              </a>
            </Button>
          )}
        </div>

        {/* Integration Note */}
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">Real Database Data Loaded!</h3>
            <p className="text-sm text-muted-foreground">
              This page now displays real data from your Supabase database. 
              The interactive workout player will be integrated next.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}