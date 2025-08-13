import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTeamPlaybooksTable() {
  console.log('🔍 Checking if team_playbooks table exists...')
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('team_playbooks')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.log('❌ team_playbooks table DOES NOT EXIST')
      console.log('Error:', error.message)
      
      // Check if it's a "relation does not exist" error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('🚨 CONFIRMED: Table does not exist in database')
        console.log('💡 Migration needs to be run')
      }
    } else {
      console.log('✅ team_playbooks table EXISTS')
      console.log('Record count check completed successfully')
      
      // Get actual structure
      const { data: structure, error: structureError } = await supabase
        .from('team_playbooks')
        .select('*')
        .limit(1)
        
      if (!structureError && structure) {
        console.log('📋 Table structure (first record keys):', Object.keys(structure[0] || {}))
      }
    }
  } catch (err) {
    console.log('❌ CRITICAL ERROR checking table:')
    console.error(err)
  }
  
  // Also try to list all tables to see what exists
  console.log('\n📊 Checking all available tables...')
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%team%')
    
    if (tablesError) {
      console.log('Could not list tables:', tablesError.message)
    } else {
      console.log('Team-related tables found:')
      tables?.forEach(table => {
        console.log(`  - ${table.table_name}`)
      })
    }
  } catch (err) {
    console.log('Error listing tables:', err)
  }
}

checkTeamPlaybooksTable()