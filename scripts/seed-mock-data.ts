#!/usr/bin/env npx tsx
/**
 * Mock Data Seeder for POWLAX Development
 * 
 * This script populates the database with realistic mock data using existing users.
 * All mock data is marked with "(Mock)" suffix for easy identification and cleanup.
 * 
 * Usage: npx tsx scripts/seed-mock-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Environment check:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function for logging
const log = (message: string, data?: any) => {
  console.log(`\n${message}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

// Main seeder function
async function seedMockData() {
  try {
    log('🚀 Starting POWLAX Mock Data Seeder...')

    // Step 1: Get existing users
    log('📋 Fetching existing users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (usersError) throw usersError
    log(`✅ Found ${users?.length || 0} existing users`)

    if (!users || users.length === 0) {
      log('❌ No users found. Please create some users first.')
      return
    }

    // Assign roles to users based on their position in the list
    const assignedUsers = {
      admin: users[0],
      coach: users[1] || users[0],
      player1: users[2] || users[0],
      player2: users[3] || users[0],
      parent: users[4] || users[0],
      director: users[5] || users[0],
    }

    log('👥 Assigned user roles:', {
      admin: assignedUsers.admin.email,
      coach: assignedUsers.coach.email,
      player1: assignedUsers.player1.email,
      player2: assignedUsers.player2.email,
      parent: assignedUsers.parent.email,
      director: assignedUsers.director.email,
    })

    // Step 2: Create Mock Clubs
    log('🏢 Creating mock clubs...')
    const mockClubs = [
      {
        id: 'mock-club-1',
        name: 'Thunder Lacrosse Club (Mock)',
        description: 'Premier youth lacrosse development program',
        logo_url: '/images/club-logos/thunder.png',
        primary_color: '#003366',
        secondary_color: '#FF6600',
        website: 'https://thunderlax.example.com',
        contact_email: 'info@thunderlax.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-club-2',
        name: 'Lightning Lacrosse Academy (Mock)',
        description: 'Elite training and development center',
        logo_url: '/images/club-logos/lightning.png',
        primary_color: '#1E40AF',
        secondary_color: '#FDE047',
        website: 'https://lightninglax.example.com',
        contact_email: 'academy@lightninglax.example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { error: clubsError } = await supabase
      .from('clubs')
      .upsert(mockClubs, { onConflict: 'id' })

    if (clubsError) {
      log('⚠️ Error creating clubs:', clubsError)
    } else {
      log('✅ Created mock clubs')
    }

    // Step 3: Create Mock Teams
    log('🏃 Creating mock teams...')
    const mockTeams = [
      {
        id: 'mock-team-1',
        club_id: 'mock-club-1',
        name: 'Thunder U12 Boys (Mock)',
        age_group: 'U12',
        gender: 'boys',
        level: 'A',
        season: 'Spring 2025',
        head_coach_id: assignedUsers.coach.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-team-2',
        club_id: 'mock-club-1',
        name: 'Thunder U14 Boys (Mock)',
        age_group: 'U14',
        gender: 'boys',
        level: 'A',
        season: 'Spring 2025',
        head_coach_id: assignedUsers.coach.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-team-3',
        club_id: 'mock-club-2',
        name: 'Lightning U10 Coed (Mock)',
        age_group: 'U10',
        gender: 'coed',
        level: 'B',
        season: 'Spring 2025',
        head_coach_id: assignedUsers.coach.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { error: teamsError } = await supabase
      .from('teams')
      .upsert(mockTeams, { onConflict: 'id' })

    if (teamsError) {
      log('⚠️ Error creating teams:', teamsError)
    } else {
      log('✅ Created mock teams')
    }

    // Step 4: Create Team Members
    log('👥 Creating team memberships...')
    const mockTeamMembers = [
      {
        team_id: 'mock-team-1',
        user_id: assignedUsers.player1.id,
        role: 'player',
        jersey_number: '7',
        position: 'attack',
        joined_at: new Date().toISOString()
      },
      {
        team_id: 'mock-team-1',
        user_id: assignedUsers.player2.id,
        role: 'player',
        jersey_number: '12',
        position: 'midfield',
        joined_at: new Date().toISOString()
      },
      {
        team_id: 'mock-team-1',
        user_id: assignedUsers.coach.id,
        role: 'coach',
        joined_at: new Date().toISOString()
      },
      {
        team_id: 'mock-team-2',
        user_id: assignedUsers.player1.id,
        role: 'player',
        jersey_number: '7',
        position: 'attack',
        joined_at: new Date().toISOString()
      }
    ]

    const { error: membersError } = await supabase
      .from('team_members')
      .upsert(mockTeamMembers, { onConflict: 'team_id,user_id' })

    if (membersError) {
      log('⚠️ Error creating team members:', membersError)
    } else {
      log('✅ Created team memberships')
    }

    // Step 5: Create Mock Practice Plans
    log('📋 Creating mock practice plans...')
    const mockPractices = [
      {
        id: 'mock-practice-1',
        team_id: 'mock-team-1',
        name: 'Pre-Season Conditioning (Mock)',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        duration_minutes: 90,
        location: 'Main Field',
        objectives: ['Improve conditioning', 'Team building', 'Stick skills'],
        notes: 'Focus on fundamentals and fitness',
        created_by: assignedUsers.coach.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-practice-2',
        team_id: 'mock-team-1',
        name: 'Offensive Systems Install (Mock)',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        duration_minutes: 90,
        location: 'Main Field',
        objectives: ['Install 2-3-1 motion offense', 'Cutting patterns', 'Ball movement'],
        notes: 'Introduce basic offensive concepts',
        created_by: assignedUsers.coach.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { error: practicesError } = await supabase
      .from('practices')
      .upsert(mockPractices, { onConflict: 'id' })

    if (practicesError) {
      log('⚠️ Error creating practices:', practicesError)
    } else {
      log('✅ Created mock practice plans')
    }

    // Step 6: Create Skills Academy Progress
    log('🎯 Creating Skills Academy progress...')
    
    // Get some existing workouts
    const { data: workouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, series_id, name')
      .limit(10)

    if (workouts && workouts.length > 0) {
      const mockProgress = [
        {
          user_id: assignedUsers.player1.id,
          workout_id: workouts[0].id,
          series_id: workouts[0].series_id,
          completed: true,
          completion_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          score: 85,
          time_spent_seconds: 1200,
          notes: 'Great form on wall ball drills (Mock)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: assignedUsers.player1.id,
          workout_id: workouts[1]?.id || workouts[0].id,
          series_id: workouts[1]?.series_id || workouts[0].series_id,
          completed: true,
          completion_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          score: 92,
          time_spent_seconds: 1500,
          notes: 'Excellent progress on ground balls (Mock)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: assignedUsers.player2.id,
          workout_id: workouts[0].id,
          series_id: workouts[0].series_id,
          completed: false,
          completion_date: null,
          score: 0,
          time_spent_seconds: 600,
          notes: 'In progress (Mock)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      const { error: progressError } = await supabase
        .from('skills_academy_user_progress')
        .upsert(mockProgress, { onConflict: 'user_id,workout_id' })

      if (progressError) {
        log('⚠️ Error creating Skills Academy progress:', progressError)
      } else {
        log('✅ Created Skills Academy progress')
      }
    }

    // Step 7: Create Gamification Data
    log('🏆 Creating gamification data...')

    // Create point wallets
    const mockWallets = [
      {
        user_id: assignedUsers.player1.id,
        currency_id: 'attack_points',
        balance: 1250,
        lifetime_earned: 1250,
        lifetime_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: assignedUsers.player1.id,
        currency_id: 'defense_points',
        balance: 850,
        lifetime_earned: 850,
        lifetime_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        user_id: assignedUsers.player2.id,
        currency_id: 'attack_points',
        balance: 950,
        lifetime_earned: 950,
        lifetime_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { error: walletsError } = await supabase
      .from('user_points_wallets')
      .upsert(mockWallets, { onConflict: 'user_id,currency_id' })

    if (walletsError) {
      log('⚠️ Error creating point wallets:', walletsError)
    } else {
      log('✅ Created point wallets')
    }

    // Create point transactions
    const mockTransactions = [
      {
        user_id: assignedUsers.player1.id,
        currency_id: 'attack_points',
        amount: 100,
        balance_after: 1250,
        transaction_type: 'earned',
        description: 'Completed Wall Ball Master workout (Mock)',
        reference_type: 'workout',
        reference_id: 'mock-workout-1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: assignedUsers.player1.id,
        currency_id: 'defense_points',
        amount: 50,
        balance_after: 850,
        transaction_type: 'earned',
        description: 'Daily practice attendance (Mock)',
        reference_type: 'practice',
        reference_id: 'mock-practice-1',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    const { error: transactionsError } = await supabase
      .from('points_transactions_powlax')
      .upsert(mockTransactions)

    if (transactionsError) {
      log('⚠️ Error creating point transactions:', transactionsError)
    } else {
      log('✅ Created point transactions')
    }

    // Create badges
    const mockBadges = [
      {
        user_id: assignedUsers.player1.id,
        badge_id: 'wall_ball_master',
        awarded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        awarded_by: assignedUsers.coach.id,
        reason: 'Completed 10 wall ball workouts (Mock)',
        created_at: new Date().toISOString()
      },
      {
        user_id: assignedUsers.player1.id,
        badge_id: 'week_warrior',
        awarded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        awarded_by: 'system',
        reason: '7-day practice streak (Mock)',
        created_at: new Date().toISOString()
      },
      {
        user_id: assignedUsers.player2.id,
        badge_id: 'first_workout',
        awarded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        awarded_by: 'system',
        reason: 'Completed first Skills Academy workout (Mock)',
        created_at: new Date().toISOString()
      }
    ]

    const { error: badgesError } = await supabase
      .from('user_badges')
      .upsert(mockBadges)

    if (badgesError) {
      log('⚠️ Error creating badges:', badgesError)
    } else {
      log('✅ Created user badges')
    }

    // Step 8: Create Family Relationships (for parent dashboard)
    log('👨‍👩‍👧‍👦 Creating family relationships...')
    const mockFamilyAccount = {
      id: 'mock-family-1',
      family_name: 'Johnson Family (Mock)',
      primary_contact_id: assignedUsers.parent.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: familyError } = await supabase
      .from('family_accounts')
      .upsert(mockFamilyAccount, { onConflict: 'id' })

    if (!familyError) {
      const mockFamilyMembers = [
        {
          family_id: 'mock-family-1',
          user_id: assignedUsers.parent.id,
          role: 'parent',
          is_primary: true
        },
        {
          family_id: 'mock-family-1',
          user_id: assignedUsers.player1.id,
          role: 'child',
          is_primary: false
        },
        {
          family_id: 'mock-family-1',
          user_id: assignedUsers.player2.id,
          role: 'child',
          is_primary: false
        }
      ]

      await supabase
        .from('family_members')
        .upsert(mockFamilyMembers, { onConflict: 'family_id,user_id' })

      log('✅ Created family relationships')
    }

    // Step 9: Update user roles for proper dashboard display
    log('🔧 Updating user roles...')
    const roleUpdates = [
      { id: assignedUsers.admin.id, role: 'admin', roles: ['admin', 'administrator'] },
      { id: assignedUsers.coach.id, role: 'coach', roles: ['coach', 'team_coach'] },
      { id: assignedUsers.player1.id, role: 'player', roles: ['player'] },
      { id: assignedUsers.player2.id, role: 'player', roles: ['player'] },
      { id: assignedUsers.parent.id, role: 'parent', roles: ['parent'] },
      { id: assignedUsers.director.id, role: 'director', roles: ['director', 'club_director'] },
    ]

    for (const update of roleUpdates) {
      const { error } = await supabase
        .from('users')
        .update({ role: update.role, roles: update.roles })
        .eq('id', update.id)
      
      if (error) {
        log(`⚠️ Error updating role for user ${update.id}:`, error)
      }
    }
    log('✅ Updated user roles')

    // Summary
    log('\n' + '='.repeat(60))
    log('✅ MOCK DATA SEEDING COMPLETE!')
    log('='.repeat(60))
    log(`
Created:
- ${mockClubs.length} clubs
- ${mockTeams.length} teams  
- ${mockTeamMembers.length} team memberships
- ${mockPractices.length} practice plans
- Skills Academy progress entries
- Point wallets and transactions
- User badges
- Family relationships

All mock data is marked with "(Mock)" suffix for easy identification.

To clean up mock data later, delete records containing "(Mock)" in their names.
    `)

  } catch (error) {
    console.error('❌ Error seeding mock data:', error)
    process.exit(1)
  }
}

// Run the seeder
seedMockData()
  .then(() => {
    log('🎉 Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })