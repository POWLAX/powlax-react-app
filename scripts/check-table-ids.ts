import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkTableStructure() {
  console.log('Checking table ID types...\n')
  
  // Check user_drills id type
  const { data: userDrill, error: userDrillError } = await supabase
    .from('user_drills')
    .select('id')
    .limit(1)
  
  if (userDrill && userDrill.length > 0) {
    console.log('user_drills.id:', userDrill[0].id, '- Type:', typeof userDrill[0].id)
  } else if (userDrillError) {
    console.log('user_drills error:', userDrillError.message)
  }
  
  // Check powlax_drills id type
  const { data: powlaxDrill, error: powlaxDrillError } = await supabase
    .from('powlax_drills')
    .select('id')
    .limit(1)
  
  if (powlaxDrill && powlaxDrill.length > 0) {
    console.log('powlax_drills.id:', powlaxDrill[0].id, '- Type:', typeof powlaxDrill[0].id)
  } else if (powlaxDrillError) {
    console.log('powlax_drills error:', powlaxDrillError.message)
  }
  
  // Check powlax_strategies id type
  const { data: strategy, error: strategyError } = await supabase
    .from('powlax_strategies')
    .select('id')
    .limit(1)
  
  if (strategy && strategy.length > 0) {
    console.log('powlax_strategies.id:', strategy[0].id, '- Type:', typeof strategy[0].id)
  } else if (strategyError) {
    console.log('powlax_strategies error:', strategyError.message)
  }
  
  // Check teams id type
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id')
    .limit(1)
  
  if (team && team.length > 0) {
    console.log('teams.id:', team[0].id, '- Type:', typeof team[0].id)
  } else if (teamError) {
    console.log('teams error:', teamError.message)
  }
  
  // Check organizations id type  
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
  
  if (org && org.length > 0) {
    console.log('organizations.id:', org[0].id, '- Type:', typeof org[0].id)
  } else if (orgError) {
    console.log('organizations error:', orgError.message)
  }
}

checkTableStructure()