import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkTeams() {
  // Check for teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .limit(1)

  if (teams && teams.length > 0) {
    console.log('Found team:', teams[0])
    return teams[0].id
  } else {
    console.log('No teams found. Creating a test team...')
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert([{
        name: 'Test Team for Parallel Drills',
        sport: 'lacrosse',
        organization_id: null
      }])
      .select()
      .single()
    
    if (error) {
      console.log('Error creating team:', error)
      return null
    } else {
      console.log('Created test team:', newTeam)
      return newTeam.id
    }
  }
}

checkTeams()