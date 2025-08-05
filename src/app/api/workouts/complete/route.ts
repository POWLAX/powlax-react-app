// Workout completion API endpoint
// Phase 1: Anti-Gaming Foundation

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { calculateWorkoutPoints, Drill } from '@/lib/gamification/point-calculator'
import { updateUserStreak, getUserStreakData } from '@/lib/gamification/streak-manager'

interface CompleteWorkoutRequest {
  drillIds: number[]
  workoutId?: number
  workoutType: 'custom' | 'skills_academy' | 'team_practice'
  sessionData?: {
    duration_minutes?: number
    notes?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteWorkoutRequest = await request.json()
    const { drillIds, workoutId, workoutType, sessionData } = body

    // Validate request
    if (!drillIds || drillIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one drill ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch drills with difficulty scores
    const drills = await fetchDrillsByIds(drillIds, workoutType)
    
    if (drills.length === 0) {
      return NextResponse.json(
        { error: 'No valid drills found' },
        { status: 404 }
      )
    }

    // Get user's current streak data
    const streakData = await getUserStreakData(user.id, supabase)
    const isFirstToday = streakData.last_activity_date !== new Date().toISOString().split('T')[0]

    // Calculate points using new system
    const workoutScore = calculateWorkoutPoints(
      drills,
      streakData.current_streak,
      isFirstToday
    )

    // Start transaction for atomic operations
    const { data: transaction, error: transactionError } = await supabase.rpc('begin_transaction')
    
    try {
      // 1. Record workout completion
      const completionRecord = await recordWorkoutCompletion(
        user.id,
        workoutScore,
        workoutId,
        workoutType,
        sessionData
      )

      // 2. Award points to user
      await awardPointsToUser(user.id, workoutScore.categoryPoints)

      // 3. Update user streak
      const streakResult = await updateUserStreak(user.id, supabase)

      // 4. Check badge progress
      const badgeUpdates = await checkBadgeProgress(user.id, workoutScore.categoryPoints)

      // Commit transaction
      await supabase.rpc('commit_transaction')

      // Return success response
      return NextResponse.json({
        success: true,
        workout_completion_id: completionRecord.id,
        score: {
          total_points: workoutScore.totalPoints,
          average_difficulty: workoutScore.averageDifficulty,
          category_points: workoutScore.categoryPoints,
          bonus_multipliers: workoutScore.bonusMultipliers
        },
        streak: streakResult,
        badges: badgeUpdates,
        summary: {
          drills_completed: drills.length,
          points_earned: workoutScore.categoryPoints,
          streak_status: streakResult.streak_title,
          milestone_reached: streakResult.milestone_reached
        }
      })

    } catch (error) {
      // Rollback transaction on error
      await supabase.rpc('rollback_transaction')
      throw error
    }

  } catch (error) {
    console.error('Error completing workout:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete workout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch drills by IDs from appropriate table
 */
async function fetchDrillsByIds(drillIds: number[], workoutType: string): Promise<Drill[]> {
  const supabase = await createServerClient()
  
  let tableName: string
  let selectFields = 'id, title, difficulty_score'
  
  switch (workoutType) {
    case 'team_practice':
      tableName = 'drills_powlax'
      selectFields += ', drill_category'
      break
    case 'skills_academy':
      tableName = 'skills_academy_powlax'
      selectFields += ', academy_category, attack_relevance, midfield_relevance, defense_relevance'
      break
    default:
      // Try both tables for custom workouts
      const { data: teamDrills } = await supabase
        .from('drills_powlax')
        .select('id, title, difficulty_score, drill_category')
        .in('id', drillIds)
      
      const { data: academyDrills } = await supabase
        .from('skills_academy_powlax')
        .select('id, title, difficulty_score, academy_category, attack_relevance, midfield_relevance, defense_relevance')
        .in('id', drillIds)
      
      return [...(teamDrills || []), ...(academyDrills || [])]
  }

  const { data, error } = await supabase
    .from(tableName)
    .select(selectFields)
    .in('id', drillIds)

  if (error) {
    console.error('Error fetching drills:', error)
    throw new Error(`Failed to fetch drills: ${error.message}`)
  }

  return data || []
}

/**
 * Record workout completion in database
 */
async function recordWorkoutCompletion(
  userId: string,
  workoutScore: any,
  workoutId?: number,
  workoutType?: string,
  sessionData?: any
) {
  const supabase = await createServerClient()

  const completionData = {
    user_id: userId,
    workout_id: workoutId,
    workout_type: workoutType,
    drills_completed: workoutScore.drills.map((d: Drill) => d.id),
    total_points: workoutScore.totalPoints,
    average_difficulty: workoutScore.averageDifficulty,
    category_points: workoutScore.categoryPoints,
    bonus_multipliers: workoutScore.bonusMultipliers,
    duration_minutes: sessionData?.duration_minutes,
    notes: sessionData?.notes,
    completed_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('workout_completions')
    .insert(completionData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to record completion: ${error.message}`)
  }

  return data
}

/**
 * Award points to user across all categories
 */
async function awardPointsToUser(userId: string, categoryPoints: any) {
  const supabase = await createServerClient()
  
  const pointEntries = Object.entries(categoryPoints)
    .filter(([_, amount]) => (amount as number) > 0)
    .map(([pointType, amount]) => ({
      user_id: userId,
      point_type: pointType,
      amount: amount as number,
      transaction_type: 'earned',
      source_type: 'workout_completion'
    }))

  if (pointEntries.length === 0) return

  // Insert point transactions
  const { error: transactionError } = await supabase
    .from('points_transactions_powlax')
    .insert(pointEntries)

  if (transactionError) {
    throw new Error(`Failed to record point transactions: ${transactionError.message}`)
  }

  // Update user balances
  for (const entry of pointEntries) {
    const { error: balanceError } = await supabase.rpc('update_point_balance', {
      user_uuid: userId,
      point_type: entry.point_type,
      amount: entry.amount
    })

    if (balanceError) {
      console.error('Error updating balance:', balanceError)
    }
  }
}

/**
 * Check badge progress and award new badges if eligible
 */
async function checkBadgeProgress(userId: string, categoryPoints: any) {
  const supabase = await createServerClient()
  
  // Get user's current point balances
  const { data: balances } = await supabase
    .from('user_points_balance_powlax')
    .select('*')
    .eq('user_id', userId)

  if (!balances) return []

  // Check each category for badge eligibility
  const badgeUpdates = []
  
  for (const balance of balances) {
    const { data: eligibleBadges } = await supabase
      .from('badges_powlax')
      .select('*')
      .eq('points_type_required', balance.point_type)
      .lte('points_required', balance.balance)
    
    if (eligibleBadges) {
      for (const badge of eligibleBadges) {
        // Check if user already has this badge
        const { data: existing } = await supabase
          .from('user_badge_progress_powlax')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .single()

        if (!existing || existing.earned_count === 0) {
          // Award badge
          await supabase
            .from('user_badge_progress_powlax')
            .upsert({
              user_id: userId,
              badge_id: badge.id,
              progress: badge.points_required,
              earned_count: 1,
              first_earned_at: new Date().toISOString()
            })

          badgeUpdates.push({
            badge_id: badge.id,
            title: badge.title,
            newly_earned: true
          })
        }
      }
    }
  }

  return badgeUpdates
}