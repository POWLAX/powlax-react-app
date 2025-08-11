#!/usr/bin/env npx tsx
/**
 * DASHBOARD MOCK DATA SEEDER (FIXED)
 * Seeds Supabase with mock data matching actual schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Generate UUIDs for consistent relationships
const userIds = {
  player1: randomUUID(),
  player2: randomUUID(),
  coach: randomUUID(),
  parent: randomUUID(),
  director: randomUUID(),
  admin: randomUUID()
}

const teamIds = {
  varsity: randomUUID(),
  jv: randomUUID(),
  u12: randomUUID()
}

const clubId = randomUUID()

// Define mock users matching actual schema
const mockUsers = [
  {
    id: userIds.player1,
    email: 'player1@mock.com',
    display_name: 'Johnny Player (MOCK)',
    first_name: 'Johnny',
    last_name: 'Player (MOCK)',
    role: 'player',
    roles: ['player'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'individual',
    age_group: 'youth_14_17',
    player_position: 'Attack',
    graduation_year: 2026
  },
  {
    id: userIds.player2,
    email: 'player2@mock.com',
    display_name: 'Sarah Athlete (MOCK)',
    first_name: 'Sarah',
    last_name: 'Athlete (MOCK)',
    role: 'player',
    roles: ['player'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'individual',
    age_group: 'youth_14_17',
    player_position: 'Midfield',
    graduation_year: 2026
  },
  {
    id: userIds.coach,
    email: 'coach@mock.com',
    display_name: 'Mike Coach (MOCK)',
    first_name: 'Mike',
    last_name: 'Coach (MOCK)',
    role: 'team_coach',
    roles: ['team_coach'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'individual'
  },
  {
    id: userIds.parent,
    email: 'parent@mock.com',
    display_name: 'Lisa Parent (MOCK)',
    first_name: 'Lisa',
    last_name: 'Parent (MOCK)',
    role: 'parent',
    roles: ['parent'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'family'
  },
  {
    id: userIds.director,
    email: 'director@mock.com',
    display_name: 'Robert Director (MOCK)',
    first_name: 'Robert',
    last_name: 'Director (MOCK)',
    role: 'club_director',
    roles: ['club_director'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'individual'
  },
  {
    id: userIds.admin,
    email: 'admin@mock.com',
    display_name: 'System Admin (MOCK)',
    first_name: 'System',
    last_name: 'Admin (MOCK)',
    role: 'administrator',
    roles: ['administrator'],
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_type: 'individual'
  }
]

// Mock club
const mockClub = {
  id: clubId,
  name: 'Elite Lacrosse Club (MOCK)',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock teams data matching actual schema
const mockTeams = [
  {
    id: teamIds.varsity,
    name: 'Varsity Eagles (MOCK)',
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: teamIds.jv,
    name: 'JV Hawks (MOCK)',
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: teamIds.u12,
    name: 'U12 Lightning (MOCK)',
    club_id: clubId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock team members matching actual schema
const mockTeamMembers = [
  {
    id: randomUUID(),
    team_id: teamIds.varsity,
    user_id: userIds.player1,
    role: 'player',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    team_id: teamIds.varsity,
    user_id: userIds.player2,
    role: 'player',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    team_id: teamIds.varsity,
    user_id: userIds.coach,
    role: 'head_coach',
    status: 'active',
    created_at: new Date().toISOString()
  }
]

// Mock skills academy progress matching actual schema
const mockSkillsProgress = [
  {
    user_id: userIds.player1,
    workout_id: 23,
    current_drill_index: 5,
    drills_completed: 5,
    total_drills: 5,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    last_activity_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    total_time_seconds: 1200,
    status: 'completed',
    completion_percentage: 100,
    points_earned: 150
  },
  {
    user_id: userIds.player1,
    workout_id: 24,
    current_drill_index: 6,
    drills_completed: 6,
    total_drills: 6,
    started_at: new Date(Date.now() - 172800000).toISOString(),
    last_activity_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    total_time_seconds: 1500,
    status: 'completed',
    completion_percentage: 100,
    points_earned: 200
  },
  {
    user_id: userIds.player1,
    workout_id: 25,
    current_drill_index: 2,
    drills_completed: 2,
    total_drills: 5,
    started_at: new Date(Date.now() - 259200000).toISOString(),
    last_activity_at: new Date(Date.now() - 259200000).toISOString(),
    completed_at: null,
    total_time_seconds: 300,
    status: 'in_progress',
    completion_percentage: 40,
    points_earned: 0
  },
  {
    user_id: userIds.player2,
    workout_id: 23,
    current_drill_index: 4,
    drills_completed: 4,
    total_drills: 5,
    started_at: new Date(Date.now() - 432000000).toISOString(),
    last_activity_at: new Date(Date.now() - 432000000).toISOString(),
    completed_at: new Date(Date.now() - 432000000).toISOString(),
    total_time_seconds: 1000,
    status: 'completed',
    completion_percentage: 100,
    points_earned: 120
  }
]

// Mock practices matching actual schema
const mockPractices = [
  {
    id: randomUUID(),
    coach_id: userIds.coach,
    team_id: teamIds.varsity,
    name: 'Offensive Drills Practice (MOCK)',
    practice_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '15:30:00',
    duration_minutes: 90,
    field_location: 'Field A',
    notes: 'Focus on offensive positioning and shooting accuracy',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: randomUUID(),
    coach_id: userIds.coach,
    team_id: teamIds.varsity,
    name: 'Defensive Skills Practice (MOCK)',
    practice_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    start_time: '15:30:00',
    duration_minutes: 90,
    field_location: 'Field B',
    notes: 'Work on defensive footwork and stick skills',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock family accounts matching actual schema
const mockFamilyAccounts = [
  {
    id: randomUUID(),
    primary_parent_id: userIds.parent,
    family_name: 'The Player Family (MOCK)',
    billing_parent_id: userIds.parent,
    family_settings: {
      combined_stats: true,
      shared_calendar: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock parent-child relationships matching actual schema
const mockParentChildRelationships = [
  {
    id: randomUUID(),
    parent_id: userIds.parent,
    child_id: userIds.player1,
    relationship_type: 'parent',
    permissions: {
      billing: true,
      view_progress: true,
      manage_schedule: true
    },
    is_primary_guardian: true,
    emergency_contact: false,
    notes: 'Mock parent-child relationship',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

async function seedMockData() {
  console.log('🚀 Starting mock data seeding (FIXED)...\n')

  try {
    // 0. Insert mock club first
    console.log('🏢 Creating mock club...')
    const { error: clubError } = await supabase
      .from('clubs')
      .upsert(mockClub, { onConflict: 'id' })
    
    if (clubError && !clubError.message.includes('duplicate')) {
      console.error(`Error creating club:`, clubError.message)
    } else {
      console.log(`✅ Created/updated club: ${mockClub.name}`)
    }

    // 1. Insert mock users
    console.log('\n👤 Creating mock users...')
    for (const user of mockUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating user ${user.display_name}:`, error.message)
      } else {
        console.log(`✅ Created/updated user: ${user.display_name} (${user.role})`)
      }
    }

    // 2. Insert mock teams
    console.log('\n🏆 Creating mock teams...')
    for (const team of mockTeams) {
      const { error } = await supabase
        .from('teams')
        .upsert(team, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating team ${team.name}:`, error.message)
      } else {
        console.log(`✅ Created/updated team: ${team.name}`)
      }
    }

    // 3. Insert team members
    console.log('\n👥 Creating team memberships...')
    for (const member of mockTeamMembers) {
      const { error } = await supabase
        .from('team_members')
        .upsert(member, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating team member:`, error.message)
      } else {
        console.log(`✅ Added user to team (role: ${member.role})`)
      }
    }

    // 4. Insert skills academy progress
    console.log('\n📊 Creating skills academy progress...')
    for (const progress of mockSkillsProgress) {
      const { error } = await supabase
        .from('skills_academy_user_progress')
        .upsert(progress, { onConflict: 'user_id,workout_id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating progress:`, error.message)
      } else {
        console.log(`✅ Created progress: Workout ${progress.workout_id} - ${progress.status}`)
      }
    }

    // 5. Insert practices
    console.log('\n📅 Creating practice schedules...')
    for (const practice of mockPractices) {
      const { error } = await supabase
        .from('practices')
        .upsert(practice, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating practice:`, error.message)
      } else {
        console.log(`✅ Created practice: ${practice.name}`)
      }
    }

    // 6. Insert family accounts
    console.log('\n👨‍👩‍👧 Creating family relationships...')
    for (const family of mockFamilyAccounts) {
      const { error } = await supabase
        .from('family_accounts')
        .upsert(family, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating family account:`, error.message)
      } else {
        console.log(`✅ Created family: ${family.family_name}`)
      }
    }

    // 7. Insert parent-child relationships
    for (const relationship of mockParentChildRelationships) {
      const { error } = await supabase
        .from('parent_child_relationships')
        .upsert(relationship, { onConflict: 'id' })
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`Error creating relationship:`, error.message)
      } else {
        console.log(`✅ Linked parent to child`)
      }
    }

    console.log('\n✨ Mock data seeding complete!')
    console.log('\n📝 Test accounts created:')
    console.log('  Player 1: player1@mock.com')
    console.log('  Player 2: player2@mock.com')
    console.log('  Coach: coach@mock.com')
    console.log('  Parent: parent@mock.com')
    console.log('  Director: director@mock.com')
    console.log('  Admin: admin@mock.com')
    console.log('\nAll users have "(MOCK)" suffix in their display names for easy identification.')
    console.log('\n🔑 User IDs for testing:')
    Object.entries(userIds).forEach(([key, id]) => {
      console.log(`  ${key}: ${id}`)
    })

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Run the seeding
seedMockData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })