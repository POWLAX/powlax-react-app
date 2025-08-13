import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTeamsTables() {
  console.log('🔍 Checking team-related tables...')
  
  const tablesToCheck = [
    'teams',
    'team_members', 
    'clubs',
    'users',
    'team_playbooks'
  ]
  
  for (const table of tablesToCheck) {
    try {
      console.log(`\n📋 Checking ${table}...`)
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ ${table} - DOES NOT EXIST`)
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ ${table} - EXISTS`)
        if (data && data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`)
        } else {
          console.log('   (No records, but table exists)')
        }
        
        // Get count
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (!countError && count !== null) {
          console.log(`   Records: ${count}`)
        }
      }
    } catch (err) {
      console.log(`💥 ${table} - CRITICAL ERROR:`, err)
    }
  }
  
  // Also check what tables actually exist
  console.log('\n🗃️  Finding all actual tables...')
  try {
    // Try different approaches to list tables
    const queries = [
      // PostgreSQL system catalog
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
      // Alternative approach
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    ]
    
    for (const query of queries) {
      try {
        const { data, error } = await supabase.rpc('sql_query', { query })
        if (!error && data) {
          console.log('Found tables via system catalog:')
          data.forEach((row: any) => {
            const tableName = row.table_name || row.tablename
            if (tableName?.includes('team') || tableName?.includes('club') || tableName?.includes('user')) {
              console.log(`  ✅ ${tableName}`)
            }
          })
          break
        }
      } catch (err) {
        console.log('Query approach failed, trying next...')
      }
    }
  } catch (err) {
    console.log('Could not list tables via system catalog')
  }
}

checkTeamsTables()