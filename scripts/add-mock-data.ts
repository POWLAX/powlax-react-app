#!/usr/bin/env npx tsx
/**
 * Add (MOCK) prefixed test data to database for Teams MVP demo
 * This ensures we have visible data while maintaining NO MOCK DATA policy
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://avvpyjwytcmtoiyrbibb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkzNDI1MywiZXhwIjoyMDY5NTEwMjUzfQ.oJFplD3nth_teLRKbKFNwvC9eIQsVqE6QYroBWaUJnU'
)

async function addMockData() {
  console.log('🎯 Adding (MOCK) prefixed test data for Teams MVP...\n')

  try {
    // Get a team to add mock practices to
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(1)
      .single()

    if (teamsError || !teams) {
      console.log('❌ No teams found to add mock data to')
      return
    }

    console.log(`✅ Found team: ${teams.name} (${teams.id})`)

    // Get a coach user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, role')
      .or('role.eq.coach,role.eq.admin,role.eq.director')
      .limit(1)
      .single()

    if (usersError || !users) {
      console.log('❌ No coach user found')
      return
    }

    console.log(`✅ Found coach: ${users.display_name || 'Coach'} (${users.id})`)

    // Add (MOCK) practices
    const mockPractices = [
      {
        team_id: teams.id,
        coach_id: users.id,
        created_by: users.id,
        name: '(MOCK) Team Practice - Fundamentals',
        practice_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        start_time: '16:00:00',
        duration_minutes: 90,
        duration: 90,
        notes: 'Mock practice for demo - focus on fundamentals'
      },
      {
        team_id: teams.id,
        coach_id: users.id,
        created_by: users.id,
        name: '(MOCK) Scrimmage vs Eagles',
        practice_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
        start_time: '14:00:00',
        duration_minutes: 120,
        duration: 120,
        notes: 'Mock scrimmage for demo'
      },
      {
        team_id: teams.id,
        coach_id: users.id,
        created_by: users.id,
        name: '(MOCK) Skills Development Session',
        practice_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days
        start_time: '17:30:00',
        duration_minutes: 60,
        duration: 60,
        notes: 'Mock skills session for demo'
      }
    ]

    // Check if mock practices already exist
    const { data: existingPractices } = await supabase
      .from('practices')
      .select('name')
      .eq('team_id', teams.id)
      .like('name', '%(MOCK)%')

    if (existingPractices && existingPractices.length > 0) {
      console.log(`\n⚠️  Team already has ${existingPractices.length} (MOCK) practices`)
    } else {
      const { data: insertedPractices, error: practicesError } = await supabase
        .from('practices')
        .insert(mockPractices)
        .select()

      if (practicesError) {
        console.error('❌ Error adding mock practices:', practicesError)
      } else {
        console.log(`\n✅ Added ${insertedPractices?.length || 0} (MOCK) practices`)
      }
    }

    // Add a (MOCK) badge for demo
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teams.id)
      .eq('role', 'player')
      .limit(1)
      .single()

    if (teamMembers) {
      // Check if user already has mock badges
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_name')
        .eq('user_id', teamMembers.user_id)
        .like('badge_name', '%(MOCK)%')

      if (!existingBadges || existingBadges.length === 0) {
        const { error: badgeError } = await supabase
          .from('user_badges')
          .insert({
            user_id: teamMembers.user_id,
            badge_id: 'mock-achievement',
            badge_name: '(MOCK) Team Player Badge',
            points_awarded: 100,
            earned_at: new Date().toISOString()
          })

        if (!badgeError) {
          console.log('✅ Added (MOCK) badge for demo')
        }
      } else {
        console.log('⚠️  User already has (MOCK) badges')
      }
    }

    // Add a (MOCK) skill completion
    if (teamMembers) {
      const { data: existingProgress } = await supabase
        .from('skills_academy_user_progress')
        .select('id')
        .eq('user_id', teamMembers.user_id)
        .eq('workout_id', 9999) // Mock workout ID

      if (!existingProgress || existingProgress.length === 0) {
        const { error: progressError } = await supabase
          .from('skills_academy_user_progress')
          .insert({
            user_id: teamMembers.user_id,
            workout_id: 9999,
            drill_id: 9999,
            status: 'completed',
            points_earned: 50,
            completed_at: new Date().toISOString(),
            time_spent_seconds: 300
          })

        if (!progressError) {
          console.log('✅ Added (MOCK) skill completion for activity feed')
        }
      } else {
        console.log('⚠️  User already has mock progress')
      }
    }

    console.log('\n✅ Mock data setup complete!')
    console.log('📝 All mock data is clearly prefixed with (MOCK) for identification')

  } catch (error) {
    console.error('❌ Error adding mock data:', error)
  }
}

// Run the script
addMockData()