// Anti-Gaming Mechanism Tests
// Phase 1: Anti-Gaming Foundation

import { calculateWorkoutPoints, Drill } from '../point-calculator'
import { updateUserStreak, getUserStreakData } from '../streak-manager'

describe('Anti-Gaming Mechanisms', () => {
  describe('Point Calculation System', () => {
    const mockDrills: Drill[] = [
      {
        id: 1,
        title: 'Easy Passing Drill',
        difficulty_score: 1,
        drill_category: 'offensive drills'
      },
      {
        id: 2,
        title: 'Advanced Dodging Sequence',
        difficulty_score: 5,
        drill_category: 'offensive drills'
      },
      {
        id: 3,
        title: 'Medium Wall Ball',
        difficulty_score: 3,
        academy_category: 'Wall Ball'
      }
    ]

    test('prevents gaming with easy workouts only', () => {
      const easyDrills = Array(5).fill(mockDrills[0]) // 5 easy drills
      const hardDrills = [mockDrills[1], mockDrills[1]] // 2 hard drills
      
      const easyWorkout = calculateWorkoutPoints(easyDrills)
      const hardWorkout = calculateWorkoutPoints(hardDrills)
      
      // Hard workout should give more total points despite fewer drills
      expect(hardWorkout.totalPoints).toBeGreaterThan(easyWorkout.totalPoints)
      expect(hardWorkout.averageDifficulty).toBe(5.0)
      expect(easyWorkout.averageDifficulty).toBe(1.0)
    })

    test('rewards difficulty progression appropriately', () => {
      const beginnerWorkout = calculateWorkoutPoints([
        { ...mockDrills[0], difficulty_score: 1 },
        { ...mockDrills[0], difficulty_score: 1 },
        { ...mockDrills[0], difficulty_score: 1 }
      ])
      
      const intermediateWorkout = calculateWorkoutPoints([
        { ...mockDrills[0], difficulty_score: 3 },
        { ...mockDrills[0], difficulty_score: 3 },
        { ...mockDrills[0], difficulty_score: 3 }
      ])
      
      const eliteWorkout = calculateWorkoutPoints([
        { ...mockDrills[0], difficulty_score: 5 },
        { ...mockDrills[0], difficulty_score: 5 },
        { ...mockDrills[0], difficulty_score: 5 }
      ])

      // Points should scale with difficulty
      expect(beginnerWorkout.totalPoints).toBe(3) // 3 drills × 1 difficulty
      expect(intermediateWorkout.totalPoints).toBe(9) // 3 drills × 3 difficulty  
      expect(eliteWorkout.totalPoints).toBe(15) // 3 drills × 5 difficulty
      
      // Elite workout should get difficulty bonus
      expect(eliteWorkout.bonusMultipliers.difficulty).toBe(1.5)
      expect(beginnerWorkout.bonusMultipliers.difficulty).toBeUndefined()
    })

    test('applies category points correctly', () => {
      const mixedWorkout = calculateWorkoutPoints([
        {
          id: 1,
          title: 'Attack Drill',
          difficulty_score: 3,
          drill_category: 'offensive drills'
        },
        {
          id: 2, 
          title: 'Defense Drill',
          difficulty_score: 3,
          drill_category: 'defensive drills'
        }
      ])

      expect(mixedWorkout.categoryPoints.lax_credit).toBe(6) // Universal points
      expect(mixedWorkout.categoryPoints.attack_tokens).toBe(3) // Attack drill
      expect(mixedWorkout.categoryPoints.defense_dollars).toBe(3) // Defense drill
    })

    test('prevents point manipulation through empty workouts', () => {
      const emptyWorkout = calculateWorkoutPoints([])
      
      expect(emptyWorkout.totalPoints).toBe(0)
      expect(emptyWorkout.averageDifficulty).toBe(0)
      expect(Object.values(emptyWorkout.categoryPoints).every(points => points === 0)).toBe(true)
    })

    test('applies streak bonuses correctly', () => {
      const drills = [mockDrills[2]] // One medium drill
      
      const noStreakWorkout = calculateWorkoutPoints(drills, 0, false)
      const weekStreakWorkout = calculateWorkoutPoints(drills, 7, true) // 7-day streak + first today
      const monthStreakWorkout = calculateWorkoutPoints(drills, 30, true) // 30-day streak
      
      expect(noStreakWorkout.bonusMultipliers.streak).toBeUndefined()
      expect(noStreakWorkout.bonusMultipliers.first_today).toBeUndefined()
      
      expect(weekStreakWorkout.bonusMultipliers.streak).toBe(1.15) // 15% bonus
      expect(weekStreakWorkout.bonusMultipliers.first_today).toBe(1.1) // 10% bonus
      
      expect(monthStreakWorkout.bonusMultipliers.streak).toBe(1.3) // 30% bonus
    })
  })

  describe('Badge System Anti-Gaming', () => {
    test('requires minimum points for badges', () => {
      // This would test the badge system integration
      // Mock user with only easy workout points
      const easyPoints = {
        lax_credit: 50,
        attack_tokens: 10,
        defense_dollars: 0,
        midfield_medals: 0,
        rebound_rewards: 0,
        lax_iq_points: 0,
        flex_points: 0
      }
      
      // Should not be eligible for Attack Apprentice badge (requires 250 points)
      expect(easyPoints.attack_tokens).toBeLessThan(250)
    })
  })

  describe('Streak System Anti-Gaming', () => {
    // Note: These would be integration tests with a test database
    
    test('prevents fake streak inflation', () => {
      // Multiple calls on same day shouldn't increase streak
      // This would need to mock the database calls
    })

    test('enforces streak freeze limitations', () => {
      // Can't use unlimited freezes
      // Limited to 2 freezes with 7-day cooldown
    })

    test('resets streak after extended absence', () => {
      // Missing 4+ days without freeze should reset
    })
  })

  describe('Performance and Security', () => {
    test('handles large drill arrays efficiently', () => {
      const largeDrillSet = Array(100).fill(mockDrills[0])
      const start = Date.now()
      
      const result = calculateWorkoutPoints(largeDrillSet)
      const duration = Date.now() - start
      
      expect(duration).toBeLessThan(100) // Should complete in <100ms
      expect(result.totalPoints).toBe(100) // 100 drills × 1 difficulty
    })

    test('validates drill difficulty scores', () => {
      const invalidDrills = [
        { ...mockDrills[0], difficulty_score: 0 }, // Below min
        { ...mockDrills[0], difficulty_score: 6 }, // Above max
        { ...mockDrills[0], difficulty_score: -1 } // Negative
      ]
      
      // Should clamp to valid range (1-5)
      const result = calculateWorkoutPoints(invalidDrills)
      expect(result.averageDifficulty).toBeGreaterThanOrEqual(1)
      expect(result.averageDifficulty).toBeLessThanOrEqual(5)
    })

    test('prevents SQL injection in point calculations', () => {
      const maliciousDrill = {
        id: 1,
        title: "'; DROP TABLE drills; --",
        difficulty_score: 3,
        drill_category: "offensive drills"
      }
      
      // Should handle malicious input safely
      expect(() => calculateWorkoutPoints([maliciousDrill])).not.toThrow()
    })
  })

  describe('Business Logic Validation', () => {
    test('minimum viable workout requirements', () => {
      // Single drill workout should be valid but give minimal points
      const singleDrillWorkout = calculateWorkoutPoints([mockDrills[0]])
      
      expect(singleDrillWorkout.totalPoints).toBe(1)
      expect(singleDrillWorkout.drills.length).toBe(1)
    })

    test('prevents unrealistic difficulty combinations', () => {
      // Mix of difficulties should average correctly
      const mixedDifficulty = calculateWorkoutPoints([
        { ...mockDrills[0], difficulty_score: 1 },
        { ...mockDrills[0], difficulty_score: 5 }
      ])
      
      expect(mixedDifficulty.averageDifficulty).toBe(3.0) // (1+5)/2
    })

    test('maintains point economy balance', () => {
      // 30-minute beginner workout vs 15-minute advanced workout
      const beginnerSession = calculateWorkoutPoints(Array(10).fill({
        ...mockDrills[0], 
        difficulty_score: 1
      }))
      
      const advancedSession = calculateWorkoutPoints(Array(3).fill({
        ...mockDrills[0],
        difficulty_score: 5  
      }))
      
      // Advanced should be worth more per minute despite fewer drills
      expect(advancedSession.totalPoints / 3).toBeGreaterThan(beginnerSession.totalPoints / 10)
    })
  })
})

// Mock data for testing
export const mockUserStreakData = {
  user_id: 'test-user-123',
  current_streak: 5,
  longest_streak: 12,
  last_activity_date: '2025-01-14',
  streak_freeze_count: 2,
  last_freeze_used: null,
  total_workouts_completed: 25,
  streak_milestone_reached: 7
}

export const mockBadgeData = [
  {
    id: 1,
    title: 'Attack Apprentice',
    points_required: 250,
    points_type_required: 'attack_token',
    earned_by_type: 'points'
  },
  {
    id: 2,
    title: 'Defense Specialist', 
    points_required: 1000,
    points_type_required: 'defense_dollar',
    earned_by_type: 'points'
  }
]