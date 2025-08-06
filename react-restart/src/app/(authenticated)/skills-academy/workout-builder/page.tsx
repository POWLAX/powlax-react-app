'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Target, TrendingUp, Zap } from 'lucide-react'

export default function WorkoutBuilderPage() {
  const [selectedPosition, setSelectedPosition] = useState<'attack' | 'midfield' | 'defense' | 'goalie' | 'wall-ball'>('attack')
  const [workoutDrills, setWorkoutDrills] = useState<any[]>([])

  const positions = [
    { id: 'attack', label: 'Attack', color: 'bg-red-500', count: 24 },
    { id: 'midfield', label: 'Midfield', color: 'bg-blue-500', count: 28 },
    { id: 'defense', label: 'Defense', color: 'bg-green-500', count: 22 },
    { id: 'goalie', label: 'Goalie', color: 'bg-purple-500', count: 16 },
    { id: 'wall-ball', label: 'Wall Ball', color: 'bg-orange-500', count: 12 }
  ]

  const workoutTemplates = [
    { 
      name: 'Mini Attack Workout', 
      drills: 5, 
      duration: '10-15 min',
      points: '50-75',
      description: 'Quick skill session for busy days'
    },
    { 
      name: 'More Attack Workout', 
      drills: 10, 
      duration: '20-30 min',
      points: '100-150', 
      description: 'Comprehensive skill development'
    },
    { 
      name: 'Complete Attack Workout', 
      drills: 18, 
      duration: '45-60 min',
      points: '200-300',
      description: 'Full position mastery session'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skills Academy Workout Builder</h1>
          <p className="text-gray-600 mt-2">
            Build custom workouts for individual skill development. Create structured learning paths like the Practice Planner.
          </p>
        </div>

        {/* Two-Track System Info */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-green-800 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Track 1: Exposure Track
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  Different workout each session (A1 Mon, A2 Wed, A3 Fri). Complete exposure to all position skills in 4 weeks.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-green-800 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Track 2: Mastery Track
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  Same workout 3x per week. Deep skill mastery through repetition. Elite development in 12 weeks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Position Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Position Focus</CardTitle>
                <CardDescription>
                  Select position to build workout for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {positions.map((position) => (
                    <button
                      key={position.id}
                      onClick={() => setSelectedPosition(position.id as any)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPosition === position.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${position.color}`}></div>
                          <span className="font-medium">{position.label}</span>
                        </div>
                        <Badge variant="secondary">{position.count}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
                <CardDescription>
                  Start with pre-built workout structures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workoutTemplates.map((template, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <Badge variant="outline">{template.drills} drills</Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {template.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          {template.points} points
                        </div>
                        <p>{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Custom {selectedPosition.charAt(0).toUpperCase() + selectedPosition.slice(1)} Workout
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Drill
                  </Button>
                </CardTitle>
                <CardDescription>
                  Drag and drop drills to build your custom workout
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workoutDrills.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Plus className="h-12 w-12 mx-auto mb-2" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workout</h3>
                    <p className="text-gray-600 mb-4">
                      Add drills from the library or use a quick template to get started
                    </p>
                    <Button variant="outline">
                      Browse Drill Library
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Workout drills would be listed here */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workout Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Workout Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{workoutDrills.length}</div>
                    <div className="text-sm text-gray-600">Drills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">1x</div>
                    <div className="text-sm text-gray-600">Multiplier</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Agent Development Note */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mt-0.5">
                i
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Agent Development Status</h3>
                <p className="text-blue-700 text-sm mt-1">
                  🤖 <strong>Skills Academy Workout Builder Agent:</strong> This page is ready for enhancement. 
                  The agent should implement drill library integration, workout building mechanics similar to Practice Planner, 
                  point calculation system, multiplier tracking, and two-track workout system (exposure vs mastery).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}