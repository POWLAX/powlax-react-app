'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DifficultyIndicator, AverageDifficulty, DifficultyBadge } from '@/components/gamification/DifficultyIndicator'
import { StreakCounter, MilestoneCelebration } from '@/components/gamification/StreakCounter'
import { calculateWorkoutPoints, Drill, formatCategoryPoints } from '@/lib/gamification/point-calculator'
import { Trophy, Zap, AlertCircle, Timer, CheckCircle2, X } from 'lucide-react'
// Removed framer-motion - using CSS animations instead

// Mock drills for demonstration
const DEMO_DRILLS: Drill[] = [
  { id: 1, title: 'Basic Passing', difficulty_score: 1, drill_category: 'offensive drills' },
  { id: 2, title: 'Easy Catch & Throw', difficulty_score: 1, drill_category: 'offensive drills' },
  { id: 3, title: 'Ground Ball Basics', difficulty_score: 2, drill_category: 'defensive drills' },
  { id: 4, title: 'Dodge Progression', difficulty_score: 3, drill_category: 'offensive drills' },
  { id: 5, title: 'Defensive Footwork', difficulty_score: 3, drill_category: 'defensive drills' },
  { id: 6, title: 'Advanced Shooting', difficulty_score: 4, drill_category: 'offensive drills' },
  { id: 7, title: 'Elite 1v1 Defense', difficulty_score: 5, drill_category: 'defensive drills' },
  { id: 8, title: 'Complex Transition', difficulty_score: 5, drill_category: 'midfield drills' },
]

export default function GamificationDemo() {
  const [selectedDrills, setSelectedDrills] = useState<Drill[]>([])
  const [workoutActive, setWorkoutActive] = useState(false)
  const [workoutTimer, setWorkoutTimer] = useState(0)
  const [showAwardAnimation, setShowAwardAnimation] = useState(false)
  const [lastScore, setLastScore] = useState<any>(null)
  const [mockStreak, setMockStreak] = useState(5)

  // Simulate workout timer
  useState(() => {
    if (workoutActive) {
      const interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  })

  const handleDrillToggle = (drill: Drill) => {
    if (workoutActive) return
    
    setSelectedDrills(prev => {
      const exists = prev.find(d => d.id === drill.id)
      if (exists) {
        return prev.filter(d => d.id !== drill.id)
      }
      return [...prev, drill]
    })
  }

  const startWorkout = () => {
    if (selectedDrills.length === 0) return
    setWorkoutActive(true)
    setWorkoutTimer(0)
  }

  const completeWorkout = () => {
    const score = calculateWorkoutPoints(selectedDrills, mockStreak, true)
    setLastScore(score)
    setWorkoutActive(false)
    setShowAwardAnimation(true)
    setMockStreak(prev => prev + 1)
    
    // Hide animation after 3 seconds
    setTimeout(() => setShowAwardAnimation(false), 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">🎮 POWLAX Gamification System Explainer</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 The Core Problem We Solved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Old System Exploit</AlertTitle>
                <AlertDescription>
                  Players could earn badges by completing 5 minimal-effort workouts (all easy drills).
                  This encouraged gaming the system rather than genuine skill development.
                </AlertDescription>
              </Alert>
              
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>New Anti-Gaming System</AlertTitle>
                <AlertDescription>
                  Points = Number of Drills × Average Difficulty Score. 
                  Hard workouts are worth exponentially more than easy ones.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 How Points Are Calculated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Base Formula</h4>
                  <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                    Points = Drill Count × Average Difficulty (1-5)
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Example: Easy Workout</h4>
                    <p className="text-sm">5 drills × 1.0 difficulty = <strong>5 points</strong></p>
                    <p className="text-xs text-gray-600 mt-1">Previously: Earned a badge!</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Example: Hard Workout</h4>
                    <p className="text-sm">3 drills × 4.0 difficulty = <strong>12 points</strong></p>
                    <p className="text-xs text-gray-600 mt-1">Worth 2.4x more despite fewer drills</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Bonus Multipliers</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Streak Bonus:</strong> 7+ days = 15%, 30+ days = 30%</li>
                    <li>• <strong>Difficulty Bonus:</strong> Avg 4.0+ = 50% bonus</li>
                    <li>• <strong>First Today:</strong> 10% bonus for daily habit</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏅 Point Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl mb-1">⚔️</div>
                  <div className="font-semibold">Attack Tokens</div>
                  <div className="text-sm text-gray-600">Offensive drills</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="font-semibold">Defense Dollars</div>
                  <div className="text-sm text-gray-600">Defensive drills</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">🏃</div>
                  <div className="font-semibold">Midfield Medals</div>
                  <div className="text-sm text-gray-600">Transition drills</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-semibold">Rebound Rewards</div>
                  <div className="text-sm text-gray-600">Wall ball drills</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-1">🧠</div>
                  <div className="font-semibold">Lax IQ Points</div>
                  <div className="text-sm text-gray-600">Strategy drills</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="font-semibold">Lax Credits</div>
                  <div className="text-sm text-gray-600">Universal (all drills)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drill Selection */}
            <Card>
              <CardHeader>
                <CardTitle>1️⃣ Select Your Drills</CardTitle>
                <CardDescription>Choose drills to build your workout</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DEMO_DRILLS.map(drill => (
                    <div 
                      key={drill.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedDrills.find(d => d.id === drill.id) 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'hover:bg-gray-50'
                      } ${workoutActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleDrillToggle(drill)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{drill.title}</div>
                          <div className="text-sm text-gray-600">{drill.drill_category}</div>
                        </div>
                        <DifficultyIndicator score={drill.difficulty_score} showLabel />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workout Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>2️⃣ Workout Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDrills.length > 0 ? (
                    <div className="space-y-4">
                      <AverageDifficulty 
                        averageScore={
                          selectedDrills.reduce((sum, d) => sum + d.difficulty_score, 0) / selectedDrills.length
                        }
                        totalDrills={selectedDrills.length}
                      />
                      
                      <div className="text-sm space-y-1">
                        <div>Selected drills: {selectedDrills.length}</div>
                        <div>Estimated time: {selectedDrills.length * 5} minutes</div>
                      </div>

                      {!workoutActive ? (
                        <Button 
                          onClick={startWorkout} 
                          className="w-full"
                          size="lg"
                        >
                          Start Workout
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-3xl font-mono font-bold">
                              <Timer className="inline w-6 h-6 mr-2" />
                              {formatTime(workoutTimer)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Workout in progress...</div>
                          </div>
                          <Button 
                            onClick={completeWorkout}
                            className="w-full"
                            size="lg"
                            variant="default"
                          >
                            Complete Workout
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select drills to start
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mock Streak Display */}
              <StreakCounter
                currentStreak={mockStreak}
                longestStreak={30}
                streakTitle="Building Momentum 📈"
                freezesRemaining={2}
                milestoneProgress={{
                  next: mockStreak < 7 ? 7 : mockStreak < 30 ? 30 : 100,
                  progress: mockStreak < 7 ? (mockStreak / 7) * 100 : 
                           mockStreak < 30 ? ((mockStreak - 7) / 23) * 100 : 100,
                  remaining: mockStreak < 7 ? 7 - mockStreak : 
                            mockStreak < 30 ? 30 - mockStreak : 0
                }}
              />
            </div>
          </div>

          {/* Award Animation */}
          {showAwardAnimation && lastScore && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-in fade-in duration-300"
              onClick={() => setShowAwardAnimation(false)}
            >
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="text-center">
                  <div className="inline-block text-6xl mb-4 animate-spin">
                    🎉
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">Workout Complete!</h2>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {lastScore.totalPoints} Points
                      </div>
                      <div className="text-sm text-gray-600">
                        Difficulty: {lastScore.averageDifficulty}/5.0
                      </div>
                    </div>

                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold mb-2">Points Earned:</div>
                      <div className="text-sm space-y-1">
                        {formatCategoryPoints(lastScore.categoryPoints).split(', ').map((points, i) => (
                          <div key={i}>• {points}</div>
                        ))}
                      </div>
                    </div>

                    {Object.keys(lastScore.bonusMultipliers).length > 0 && (
                      <div className="text-left bg-green-50 rounded-lg p-4">
                        <div className="font-semibold mb-2">Bonuses Applied:</div>
                        <div className="text-sm space-y-1">
                          {lastScore.bonusMultipliers.streak && (
                            <div>• Streak Bonus: +{((lastScore.bonusMultipliers.streak - 1) * 100).toFixed(0)}%</div>
                          )}
                          {lastScore.bonusMultipliers.difficulty && (
                            <div>• Difficulty Bonus: +{((lastScore.bonusMultipliers.difficulty - 1) * 100).toFixed(0)}%</div>
                          )}
                          {lastScore.bonusMultipliers.first_today && (
                            <div>• First Today: +{((lastScore.bonusMultipliers.first_today - 1) * 100).toFixed(0)}%</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => setShowAwardAnimation(false)}
                    className="mt-6"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔐 How We Verify Workout Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Currently, workout completion is based on user action (clicking &quot;Complete Workout&quot;). 
                  Future versions will integrate with video tracking or coach verification.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Verification Flow</h4>
                  <ol className="text-sm space-y-2">
                    <li>1. User selects drills for workout</li>
                    <li>2. User starts workout (timer begins)</li>
                    <li>3. User completes drills at their own pace</li>
                    <li>4. User clicks &quot;Complete Workout&quot;</li>
                    <li>5. System calculates points based on drill difficulty</li>
                    <li>6. Points are awarded server-side (no client manipulation)</li>
                  </ol>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Anti-Cheating Measures</h4>
                  <ul className="text-sm space-y-2">
                    <li>✅ All calculations happen server-side</li>
                    <li>✅ Difficulty scores cannot be modified by users</li>
                    <li>✅ Points based on drill selection, not time</li>
                    <li>✅ Daily limits on workout submissions (coming soon)</li>
                    <li>✅ Anomaly detection for unrealistic patterns</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Future Enhancements</h4>
                  <ul className="text-sm space-y-2">
                    <li>🔮 Integration with Vimeo video completion tracking</li>
                    <li>🔮 Coach verification for team workouts</li>
                    <li>🔮 Motion detection via device camera</li>
                    <li>🔮 Heart rate monitor integration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⏱️ Timer Functionality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The timer is for user reference only. Points are NOT based on time spent.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Why no time-based points?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Prevents leaving app open to accumulate time</li>
                    <li>• Focuses on quality over duration</li>
                    <li>• Some drills naturally take longer than others</li>
                    <li>• Accommodates different skill levels</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Badge Requirements (New System)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Attack Rookie', points: 25, type: 'Attack Tokens', old: '1 workout' },
                  { title: 'Attack Apprentice', points: 250, type: 'Attack Tokens', old: '5 workouts' },
                  { title: 'Attack Specialist', points: 1000, type: 'Attack Tokens', old: '20 workouts' },
                  { title: 'Attack Master', points: 5000, type: 'Attack Tokens', old: '50 workouts' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div>
                        <div className="font-semibold">{badge.title}</div>
                        <div className="text-sm text-gray-600">{badge.points} {badge.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 line-through">Old: {badge.old}</div>
                      <div className="text-xs text-green-600">~{Math.round(badge.points / 3)} quality drills</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Streak Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <MilestoneCelebration milestone={7} />
                <MilestoneCelebration milestone={30} />
                <MilestoneCelebration milestone={100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}