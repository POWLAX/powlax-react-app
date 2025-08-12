import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
// Use service role key if available, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTeamsData() {
  console.log('🔍 Checking Teams Data Structure\n')
  console.log('=' .repeat(60))
  
  // Step 1: Check teams table directly
  console.log('\n🏢 Step 1: Teams Table')
  try {
    const { data: teams, error, count } = await supabase
      .from('teams')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${count} teams`)
      if (teams && teams.length > 0) {
        console.log('\nSample teams:')
        teams.slice(0, 5).forEach(team => {
          console.log(`  ID: ${team.id} | Name: ${team.name} | Club: ${team.club_id || 'None'}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Failed to query teams')
  }
  
  // Step 2: Check team_members table
  console.log('\n\n👥 Step 2: Team Members Table')
  try {
    const { data: members, error, count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${count} team member records`)
      if (members && members.length > 0) {
        console.log('\nSample team members:')
        members.slice(0, 5).forEach(member => {
          console.log(`  Team: ${member.team_id} | User: ${member.user_id} | Role: ${member.role}`)
        })
        
        // Check user_id format
        const sampleUserId = members[0].user_id
        console.log(`\nUser ID format: ${sampleUserId}`)
        console.log(`  Type: ${typeof sampleUserId}`)
        console.log(`  Length: ${sampleUserId?.length}`)
        console.log(`  Is UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sampleUserId)}`)
      }
    }
  } catch (err) {
    console.log('❌ Failed to query team_members')
  }
  
  // Step 3: Check clubs table
  console.log('\n\n🏛️ Step 3: Clubs Table')
  try {
    const { data: clubs, error, count } = await supabase
      .from('clubs')
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${count} clubs`)
      if (clubs && clubs.length > 0) {
        clubs.forEach(club => {
          console.log(`  ID: ${club.id} | Name: ${club.name}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Failed to query clubs')
  }
  
  // Step 4: Try to find Patrick differently
  console.log('\n\n📧 Step 4: Looking for Patrick user')
  console.log('Searching by different methods...')
  
  // Search by email patterns
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, username')
      .limit(20)
    
    if (!error && users) {
      const patrickUsers = users.filter(u => 
        u.email?.includes('patrick') || 
        u.name?.toLowerCase().includes('patrick') ||
        u.username?.toLowerCase().includes('patrick')
      )
      
      if (patrickUsers.length > 0) {
        console.log('\n✅ Found potential Patrick users:')
        patrickUsers.forEach(u => {
          console.log(`  ID: ${u.id}`)
          console.log(`  Email: ${u.email || 'N/A'}`)
          console.log(`  Name: ${u.name || 'N/A'}`)
          console.log(`  Username: ${u.username || 'N/A'}`)
          console.log('  ---')
        })
      } else {
        console.log('\n⚠️ No users with "patrick" in email/name/username')
        console.log('\nAll users (first 10):')
        users.slice(0, 10).forEach(u => {
          console.log(`  ${u.email || u.username || u.name || 'Unknown'} (ID: ${u.id})`)
        })
      }
    }
  } catch (err) {
    console.log('⚠️ Could not search users table directly')
  }
  
  // Step 5: Check auth users
  console.log('\n\n🔐 Step 5: Checking Supabase Auth')
  console.log('Note: Cannot directly query auth.users from client')
  console.log('patrick@powlax.com should exist in Supabase Auth')
  console.log('Need to ensure users table is synced with auth.users')
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(60))
  console.log('\nDatabase has:')
  console.log('  - Teams table with data')
  console.log('  - Team members table with associations')
  console.log('  - Clubs table with organizations')
  console.log('\nIssue likely:')
  console.log('  1. patrick@powlax.com exists in Auth but not in users table')
  console.log('  2. OR user exists but has no team_members records')
  console.log('  3. OR teams page is not querying correctly')
}

checkTeamsData()