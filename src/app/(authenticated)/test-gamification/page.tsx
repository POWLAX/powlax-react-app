'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DifficultyIndicator } from '@/components/gamification/DifficultyIndicator'
import { StreakCounter } from '@/components/gamification/StreakCounter'
import { calculateWorkoutPoints } from '@/lib/gamification/point-calculator'
// Removed framer-motion - using CSS animations instead

export default function TestGamification() {
  const [showReward, setShowReward] = useState(false)
  const [points, setPoints] = useState(0)

  const simulateEasyWorkout = () => {
    const drills = [
      { id: 1, title: 'Easy Pass', difficulty_score: 1, drill_category: 'offensive drills' },
      { id: 2, title: 'Easy Catch', difficulty_score: 1, drill_category: 'offensive drills' },
      { id: 3, title: 'Easy Ground Ball', difficulty_score: 1, drill_category: 'defensive drills' },
      { id: 4, title: 'Easy Cradle', difficulty_score: 1, drill_category: 'offensive drills' },
      { id: 5, title: 'Easy Scoop', difficulty_score: 1, drill_category: 'defensive drills' },
    ]
    const score = calculateWorkoutPoints(drills, 5, false)
    setPoints(score.totalPoints)
    setShowReward(true)
    setTimeout(() => setShowReward(false), 3000)
  }

  const simulateHardWorkout = () => {
    const drills = [
      { id: 1, title: 'Elite Dodge', difficulty_score: 5, drill_category: 'offensive drills' },
      { id: 2, title: 'Advanced Defense', difficulty_score: 4, drill_category: 'defensive drills' },
      { id: 3, title: 'Complex Transition', difficulty_score: 5, drill_category: 'midfield drills' },
    ]
    const score = calculateWorkoutPoints(drills, 30, true) // 30-day streak + first today
    setPoints(score.totalPoints)
    setShowReward(true)
    setTimeout(() => setShowReward(false), 3000)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🎮 Gamification Test Page</h1>

      <div className="grid gap-6">
        {/* Quick Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={simulateEasyWorkout}
                variant="outline"
                className="h-auto flex-col py-4"
              >
                <span className="text-lg mb-2">😴 Easy Workout</span>
                <span className="text-sm text-gray-600">5 easy drills (old exploit)</span>
                <span className="text-xs text-red-600 mt-1">= Only 5 points!</span>
              </Button>
              
              <Button 
                onClick={simulateHardWorkout}
                variant="default"
                className="h-auto flex-col py-4"
              >
                <span className="text-lg mb-2">💪 Hard Workout</span>
                <span className="text-sm text-gray-600">3 elite drills + bonuses</span>
                <span className="text-xs text-green-600 mt-1">= 20+ points!</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map(score => (
              <div key={score} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Difficulty {score}</span>
                <DifficultyIndicator score={score} showLabel size="md" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Streak Display */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StreakCounter 
              currentStreak={0}
              longestStreak={0}
              streakTitle="Ready to Begin 💪"
              freezesRemaining={2}
            />
            
            <StreakCounter 
              currentStreak={7}
              longestStreak={7}
              streakTitle="Weekly Warrior 🔥"
              freezesRemaining={2}
              milestoneProgress={{
                next: 30,
                progress: 23,
                remaining: 23
              }}
            />
            
            <StreakCounter 
              currentStreak={30}
              longestStreak={45}
              streakTitle="Monthly Master 🏆"
              freezesRemaining={1}
              milestoneProgress={{
                next: 100,
                progress: 30,
                remaining: 70
              }}
            />
          </CardContent>
        </Card>

        {/* Point Calculation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Point Calculation Formula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-mono mb-2">
                Points = Drills × Avg Difficulty × Bonuses
              </div>
              <div className="text-sm text-gray-600">
                All calculations happen server-side to prevent cheating
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1 }}
              className="bg-white rounded-full p-8 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-3xl font-bold text-blue-600">{points} Points!</div>
                <div className="text-sm text-gray-600 mt-2">Great workout!</div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}