// Point calculation service for POWLAX gamification
// Phase 1: Anti-Gaming Foundation

export interface Drill {
  id: number
  title: string
  difficulty_score: number
  drill_category?: string
  academy_category?: string
  attack_relevance?: string
  midfield_relevance?: string  
  defense_relevance?: string
}

export interface CategoryPoints {
  lax_credit: number
  attack_tokens: number
  defense_dollars: number
  midfield_medals: number
  rebound_rewards: number
  lax_iq_points: number
  flex_points: number
}

export interface WorkoutScore {
  drills: Drill[]
  totalPoints: number
  averageDifficulty: number
  categoryPoints: CategoryPoints
  bonusMultipliers: {
    streak?: number
    difficulty?: number
    first_today?: number
  }
}

/**
 * Calculate points for a completed workout
 * Core formula: Points = Number of Drills × Average Difficulty Score
 */
export function calculateWorkoutPoints(
  drills: Drill[], 
  userStreak: number = 0,
  isFirstToday: boolean = false
): WorkoutScore {
  if (drills.length === 0) {
    return getEmptyScore()
  }

  // Calculate average difficulty
  const totalDifficulty = drills.reduce((sum, drill) => sum + drill.difficulty_score, 0)
  const averageDifficulty = totalDifficulty / drills.length
  
  // Base points calculation
  const basePoints = Math.round(drills.length * averageDifficulty)
  
  // Calculate category-specific points
  const categoryPoints = calculateCategoryPoints(drills, averageDifficulty)
  
  // Apply bonuses
  const bonusMultipliers = calculateBonusMultipliers(
    averageDifficulty, 
    userStreak, 
    isFirstToday
  )
  
  // Apply multipliers to category points
  const finalCategoryPoints = applyMultipliers(categoryPoints, bonusMultipliers)
  
  return {
    drills,
    totalPoints: basePoints,
    averageDifficulty: Math.round(averageDifficulty * 10) / 10,
    categoryPoints: finalCategoryPoints,
    bonusMultipliers
  }
}

/**
 * Calculate points for each category based on drill types and relevance
 */
function calculateCategoryPoints(drills: Drill[], avgDifficulty: number): CategoryPoints {
  const basePoints = Math.round(drills.length * avgDifficulty)
  
  const categoryPoints: CategoryPoints = {
    lax_credit: basePoints, // Universal points for all activities
    attack_tokens: 0,
    defense_dollars: 0,
    midfield_medals: 0,
    rebound_rewards: 0,
    lax_iq_points: 0,
    flex_points: 0
  }

  drills.forEach(drill => {
    const drillPoints = Math.round(drill.difficulty_score)
    
    // Team drills - category based
    if (drill.drill_category) {
      switch (drill.drill_category.toLowerCase()) {
        case 'offensive drills':
        case 'settled offense':
          categoryPoints.attack_tokens += drillPoints
          break
        case 'defensive drills':
        case 'settled defense':
          categoryPoints.defense_dollars += drillPoints
          break
        case 'transition drills':
          categoryPoints.midfield_medals += drillPoints
          break
        default:
          categoryPoints.flex_points += drillPoints
      }
    }
    
    // Skills academy drills - position relevance based
    if (drill.academy_category) {
      // Attack relevance
      if (drill.attack_relevance === 'F') { // Foundation
        categoryPoints.attack_tokens += drillPoints
      } else if (drill.attack_relevance === 'S') { // Supplementary  
        categoryPoints.attack_tokens += Math.round(drillPoints * 0.7)
      }
      
      // Defense relevance
      if (drill.defense_relevance === 'F') {
        categoryPoints.defense_dollars += drillPoints
      } else if (drill.defense_relevance === 'S') {
        categoryPoints.defense_dollars += Math.round(drillPoints * 0.7)
      }
      
      // Midfield relevance
      if (drill.midfield_relevance === 'F') {
        categoryPoints.midfield_medals += drillPoints
      } else if (drill.midfield_relevance === 'S') {
        categoryPoints.midfield_medals += Math.round(drillPoints * 0.7)
      }
      
      // Wall ball drills
      if (drill.academy_category.toLowerCase().includes('wall ball')) {
        categoryPoints.rebound_rewards += drillPoints
      }
      
      // Strategy/IQ drills
      if (drill.academy_category.toLowerCase().includes('strategy') ||
          drill.academy_category.toLowerCase().includes('iq')) {
        categoryPoints.lax_iq_points += drillPoints
      }
    }
  })

  return categoryPoints
}

/**
 * Calculate bonus multipliers based on various factors
 */
function calculateBonusMultipliers(
  avgDifficulty: number,
  streak: number,
  isFirstToday: boolean
): WorkoutScore['bonusMultipliers'] {
  const multipliers: WorkoutScore['bonusMultipliers'] = {}
  
  // Difficulty bonus (rewards challenging workouts)
  if (avgDifficulty >= 4.0) {
    multipliers.difficulty = 1.5 // 50% bonus for elite difficulty
  } else if (avgDifficulty >= 3.5) {
    multipliers.difficulty = 1.25 // 25% bonus for hard difficulty
  }
  
  // Streak bonus (rewards consistency)
  if (streak >= 30) {
    multipliers.streak = 1.3 // 30% bonus for month+ streaks
  } else if (streak >= 7) {
    multipliers.streak = 1.15 // 15% bonus for week+ streaks
  } else if (streak >= 3) {
    multipliers.streak = 1.05 // 5% bonus for 3+ day streaks
  }
  
  // First workout today bonus
  if (isFirstToday) {
    multipliers.first_today = 1.1 // 10% bonus for daily habit
  }
  
  return multipliers
}

/**
 * Apply multipliers to category points
 */
function applyMultipliers(
  points: CategoryPoints, 
  multipliers: WorkoutScore['bonusMultipliers']
): CategoryPoints {
  const totalMultiplier = Object.values(multipliers).reduce((acc, mult) => acc * (mult || 1), 1)
  
  if (totalMultiplier === 1) return points
  
  return {
    lax_credit: Math.round(points.lax_credit * totalMultiplier),
    attack_tokens: Math.round(points.attack_tokens * totalMultiplier),
    defense_dollars: Math.round(points.defense_dollars * totalMultiplier),
    midfield_medals: Math.round(points.midfield_medals * totalMultiplier),
    rebound_rewards: Math.round(points.rebound_rewards * totalMultiplier),
    lax_iq_points: Math.round(points.lax_iq_points * totalMultiplier),
    flex_points: Math.round(points.flex_points * totalMultiplier)
  }
}

/**
 * Get empty score structure
 */
function getEmptyScore(): WorkoutScore {
  return {
    drills: [],
    totalPoints: 0,
    averageDifficulty: 0,
    categoryPoints: {
      lax_credit: 0,
      attack_tokens: 0,
      defense_dollars: 0,
      midfield_medals: 0,
      rebound_rewards: 0,
      lax_iq_points: 0,
      flex_points: 0
    },
    bonusMultipliers: {}
  }
}

/**
 * Format category points for display
 */
export function formatCategoryPoints(points: CategoryPoints): string {
  const nonZero = Object.entries(points)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => {
      const displayNames = {
        lax_credit: 'Lax Credits',
        attack_tokens: 'Attack Tokens',
        defense_dollars: 'Defense Dollars', 
        midfield_medals: 'Midfield Medals',
        rebound_rewards: 'Rebound Rewards',
        lax_iq_points: 'Lax IQ Points',
        flex_points: 'Flex Points'
      }
      return `${value} ${displayNames[key as keyof typeof displayNames]}`
    })
  
  return nonZero.join(', ')
}

/**
 * Calculate total points across all categories
 */
export function getTotalCategoryPoints(points: CategoryPoints): number {
  return Object.values(points).reduce((sum, value) => sum + value, 0)
}