import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      workout_id,
      current_drill_index,
      drills_completed,
      total_drills,
      total_time_seconds,
      points_earned,
      status,
      completion_percentage
    } = body

    // Validate required fields
    if (!user_id || !workout_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and workout_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Update or create progress record
    const progressData = {
      user_id,
      workout_id,
      current_drill_index: current_drill_index || 0,
      drills_completed: drills_completed || 0,
      total_drills: total_drills || 0,
      last_activity_at: new Date().toISOString(),
      total_time_seconds: total_time_seconds || 0,
      status: status || 'in_progress',
      completion_percentage: completion_percentage || 0,
      points_earned: points_earned || 0
    }

    // If completed, add completion timestamp
    if (status === 'completed') {
      progressData.completed_at = new Date().toISOString()
    }

    // First try to update existing record, then insert if not found
    const { data: existingProgress } = await supabase
      .from('skills_academy_user_progress')
      .select('id')
      .eq('user_id', user_id)
      .eq('workout_id', workout_id)
      .single()

    let progress
    let progressError
    
    if (existingProgress) {
      // Update existing record
      const { data, error } = await supabase
        .from('skills_academy_user_progress')
        .update(progressData)
        .eq('user_id', user_id)
        .eq('workout_id', workout_id)
        .select()
        .single()
      progress = data
      progressError = error
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('skills_academy_user_progress')
        .insert(progressData)
        .select()
        .single()
      progress = data
      progressError = error
    }

    if (progressError) {
      console.error('Error updating progress:', progressError)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    // Update points if workout is completed
    if (status === 'completed' && points_earned > 0) {
      // Calculate points distribution using proper 6-point system percentages
      const pointsDistribution = {
        lax_credits: Math.floor(points_earned * 0.30),     // 30%
        attack_tokens: Math.floor(points_earned * 0.15),   // 15%
        defense_dollars: Math.floor(points_earned * 0.15), // 15%
        midfield_medals: Math.floor(points_earned * 0.15), // 15%
        rebound_rewards: Math.floor(points_earned * 0.15), // 15%
        flex_points: Math.floor(points_earned * 0.10)      // 10%
      }
      
      // Handle any rounding remainder by adding to lax_credits (universal currency)
      const totalDistributed = Object.values(pointsDistribution).reduce((sum, val) => sum + val, 0)
      const remainder = points_earned - totalDistributed
      if (remainder > 0) {
        pointsDistribution.lax_credits += remainder
      }

      // Update points using the existing table structure (point_type based)
      const pointTypes = [
        { type: 'lax_credits', amount: pointsDistribution.lax_credits },
        { type: 'attack_tokens', amount: pointsDistribution.attack_tokens },
        { type: 'defense_dollars', amount: pointsDistribution.defense_dollars },
        { type: 'midfield_medals', amount: pointsDistribution.midfield_medals },
        { type: 'rebound_rewards', amount: pointsDistribution.rebound_rewards },
        { type: 'flex_points', amount: pointsDistribution.flex_points }
      ]

      // Insert/Update each point type individually
      for (const pointType of pointTypes) {
        if (pointType.amount > 0) {
          try {
            // Get current balance for this point type
            const { data: currentBalance } = await supabase
              .from('user_points_balance_powlax')
              .select('balance, total_earned')
              .eq('user_id', user_id)
              .eq('point_type', pointType.type)
              .single()

            if (currentBalance) {
              // Update existing record
              await supabase
                .from('user_points_balance_powlax')
                .update({
                  balance: currentBalance.balance + pointType.amount,
                  total_earned: currentBalance.total_earned + pointType.amount,
                  last_earned_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user_id)
                .eq('point_type', pointType.type)
            } else {
              // Insert new record
              await supabase
                .from('user_points_balance_powlax')
                .insert({
                  user_id,
                  point_type: pointType.type,
                  balance: pointType.amount,
                  total_earned: pointType.amount,
                  total_spent: 0,
                  last_earned_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
            }
          } catch (pointError) {
            console.error(`Error updating ${pointType.type} points:`, pointError.message)
            // Continue with other point types even if one fails
          }
        }
      }

      // Update streak tracking (optional enhancement)
      const today = new Date().toISOString().split('T')[0]
      const { data: streak } = await supabase
        .from('skills_academy_user_streaks')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (streak) {
        const lastWorkoutDate = new Date(streak.last_workout_date).toISOString().split('T')[0]
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let newStreak = streak.current_streak
        if (lastWorkoutDate === yesterdayStr) {
          // Continuing streak
          newStreak += 1
        } else if (lastWorkoutDate !== today) {
          // Breaking streak (unless same day)
          newStreak = 1
        }

        await supabase
          .from('skills_academy_user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            total_workouts: streak.total_workouts + 1,
            last_workout_date: today
          })
          .eq('user_id', user_id)
      } else {
        // Create new streak record
        await supabase
          .from('skills_academy_user_streaks')
          .insert({
            user_id,
            current_streak: 1,
            longest_streak: 1,
            total_workouts: 1,
            last_workout_date: today
          })
      }
    }

    return NextResponse.json({
      success: true,
      progress,
      message: 'Progress updated successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const workout_id = searchParams.get('workout_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    let query = supabase
      .from('skills_academy_user_progress')
      .select(`
        *,
        workout:skills_academy_workouts(
          *,
          series:skills_academy_series(*)
        )
      `)
      .eq('user_id', user_id)

    if (workout_id) {
      query = query.eq('workout_id', parseInt(workout_id))
    }

    const { data, error } = await query.order('last_activity_at', { ascending: false })

    if (error) {
      console.error('Error fetching progress:', error)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      progress: data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}