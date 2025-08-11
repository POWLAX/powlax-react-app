import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function setupProperAuth() {
  console.log('🔧 COMPREHENSIVE AUTH & DATABASE FIX\n')
  console.log('=====================================\n')
  
  // 1. Fix team_id issue
  console.log('1️⃣ FIXING TEAM_ID ISSUE')
  console.log('------------------------')
  console.log('Problem: URL uses /teams/1/ but database expects UUID')
  console.log('Solution: Either use /teams/ (no ID) or use a real team UUID\n')
  
  // Get real team IDs
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .limit(5)
  
  if (teams && teams.length > 0) {
    console.log('Available Team UUIDs:')
    teams.forEach(team => {
      console.log(`  - ${team.name}: ${team.id}`)
    })
    console.log(`\n👉 Use URL: http://localhost:3000/teams/${teams[0].id}/practice-plans`)
    console.log('   OR just: http://localhost:3000/teams/practice-plans (no team ID)\n')
  }
  
  // 2. Create proper auth user
  console.log('2️⃣ SETTING UP PROPER AUTHENTICATION')
  console.log('------------------------------------')
  console.log('Creating proper localStorage user object...\n')
  
  const properUser = {
    id: '523f2768-6404-439c-a429-f9eb6736aa17',  // Patrick's ID
    email: 'patrick@powlax.com',
    display_name: 'Patrick Chapla',
    full_name: 'Patrick Chapla',
    roles: ['administrator', 'parent', 'club_director', 'team_coach', 'player'],
    role: 'administrator',
    avatar_url: null,
    wordpress_id: null
  }
  
  console.log('Run this in browser console:')
  console.log('```javascript')
  console.log(`localStorage.setItem('supabase_auth_user', JSON.stringify(${JSON.stringify(properUser, null, 2)}));`)
  console.log('location.reload();')
  console.log('```\n')
  
  // 3. Fix database schema issues
  console.log('3️⃣ DATABASE FIXES NEEDED')
  console.log('------------------------')
  console.log('Run these SQL queries in Supabase Dashboard:\n')
  
  console.log('-- Fix practices table to accept null team_id')
  console.log('ALTER TABLE practices ALTER COLUMN team_id DROP NOT NULL;')
  console.log('')
  console.log('-- Disable RLS temporarily to get things working')
  console.log('ALTER TABLE practices DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;')
  console.log('ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;')
  console.log('')
  console.log('-- Grant permissions')
  console.log('GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;')
  console.log('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;')
  console.log('\n')
  
  // 4. Component fixes needed
  console.log('4️⃣ CODE FIXES NEEDED')
  console.log('--------------------')
  console.log('A. Update usePracticePlans.ts to handle null team_id:')
  console.log('   Change: team_id: plan.team_id || null')
  console.log('')
  console.log('B. Fix URL to not use /teams/1/:')
  console.log('   Navigate to: /teams/practice-plans (no ID)')
  console.log('   OR use a real UUID from the list above')
  console.log('')
  console.log('C. Re-enable Custom Strategies button')
  console.log('   Will provide the component code to restore this')
  console.log('\n')
  
  console.log('5️⃣ QUICK FIX SCRIPT')
  console.log('-------------------')
  console.log('For immediate testing, run this SQL to create a test team with ID 1:')
  console.log('```sql')
  console.log("INSERT INTO teams (id, name, club_id) VALUES ")
  console.log("('00000000-0000-0000-0000-000000000001', 'Test Team 1', ")
  console.log("(SELECT id FROM clubs LIMIT 1)) ON CONFLICT DO NOTHING;")
  console.log('```')
}

setupProperAuth()