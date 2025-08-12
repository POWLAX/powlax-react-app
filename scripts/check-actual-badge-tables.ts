import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActualBadgeTables() {
  console.log('🔍 Checking actual badge tables in Supabase...\n')

  // Check potential badge table names
  const potentialTables = [
    'badges_powlax',
    'user_badges', 
    'powlax_badges',
    'badge_definitions',
    'powlax_player_ranks',
    'user_badge_progress_powlax'
  ]

  for (const tableName of potentialTables) {
    console.log(`📋 Testing table: ${tableName}`)
    
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1)

      if (error) {
        console.log(`   ❌ ${error.message}`)
      } else {
        console.log(`   ✅ EXISTS with ${count} records`)
        if (data && data.length > 0) {
          console.log(`   📋 Columns:`, Object.keys(data[0]).join(', '))
          console.log(`   📄 Sample:`, JSON.stringify(data[0], null, 4))
        }
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err}`)
    }
    
    console.log('')
  }

  // Try to find any table with "badge" in the name by querying information schema
  console.log('🔍 Searching for any tables containing "badge"...\n')
  
  try {
    const { data: tables, error } = await supabase.rpc('get_table_names_containing', { 
      search_term: 'badge' 
    })
    
    if (error) {
      console.log('Could not search table names via RPC')
    } else {
      console.log('Tables containing "badge":', tables)
    }
  } catch (err) {
    console.log('RPC search not available')
  }
}

checkActualBadgeTables().catch(console.error)