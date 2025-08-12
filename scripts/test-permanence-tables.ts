import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnB5and5dGNtdG9peXJiaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MzQyNTMsImV4cCI6MjA2OTUxMDI1M30.ExYEGgmmh4D7HnObISlg8ntGsVi5_zOvNiSjJuX5K0s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPermanenceTables() {
  console.log('🔍 Testing Permanence Pattern Tables...\n')
  
  const tables = [
    'coach_favorites',
    'coach_player_tracking',
    'coach_quick_actions',
    'resource_favorites',
    'resource_collections',
    'resource_progress',
    'workout_assignments',
    'workout_completions',
    'role_change_log',
    'permission_templates'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Table exists and is accessible`)
      }
    } catch (err) {
      console.log(`❌ ${table}: Error accessing table`)
    }
  }
  
  console.log('\n📊 Testing array columns on user tables...')
  
  // Test user_drills columns
  const { data: drillsSchema, error: drillsError } = await supabase
    .from('user_drills')
    .select('team_share, club_share')
    .limit(1)
  
  if (!drillsError) {
    console.log('✅ user_drills has array columns')
  } else {
    console.log('⚠️ user_drills array columns check:', drillsError.message)
  }
  
  // Test user_strategies columns
  const { data: strategiesSchema, error: strategiesError } = await supabase
    .from('user_strategies')
    .select('team_share, club_share')
    .limit(1)
  
  if (!strategiesError) {
    console.log('✅ user_strategies has array columns')
  } else {
    console.log('⚠️ user_strategies array columns check:', strategiesError.message)
  }
}

testPermanenceTables()