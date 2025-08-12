import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkAllTablesStructure() {
  console.log('🔍 COMPREHENSIVE TABLE STRUCTURE CHECK\n')
  console.log('Checking all tables referenced by Practice Planner...\n')
  
  const tables = [
    'practices',
    'user_drills',
    'user_strategies',
    'user_favorites',
    'users',
    'powlax_drills',
    'powlax_strategies'
  ]
  
  for (const tableName of tables) {
    console.log(`\n📊 TABLE: ${tableName}`)
    console.log('=' .repeat(50))
    
    try {
      // Get one record to see column structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Error accessing table: ${error.message}`)
        continue
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        console.log(`✅ Table exists with ${columns.length} columns:`)
        columns.forEach(col => {
          const value = data[0][col]
          const type = value === null ? 'null' : 
                       Array.isArray(value) ? 'array' : 
                       typeof value
          console.log(`   - ${col} (${type})`)
        })
      } else {
        console.log('✅ Table exists but has no records')
        console.log('   Attempting to get schema info...')
        
        // Try to insert and rollback to see structure
        try {
          const { error: insertError } = await supabase
            .from(tableName)
            .insert({})
            .single()
          
          if (insertError) {
            // Parse error message for column info
            const errorMsg = insertError.message
            console.log('   Structure hints from error:', errorMsg.substring(0, 200))
          }
        } catch (e) {
          // Expected to fail, just for schema discovery
        }
      }
      
      // Check record count
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      console.log(`   Total records: ${count || 0}`)
      
    } catch (err) {
      console.log(`❌ Unexpected error: ${err}`)
    }
  }
  
  console.log('\n\n🔗 CHECKING TABLE RELATIONSHIPS')
  console.log('=' .repeat(50))
  
  // Check foreign key relationships
  console.log('\n1. practices table relationships:')
  try {
    const { data: practice } = await supabase
      .from('practices')
      .select('id, coach_id, created_by, team_id')
      .limit(1)
      .single()
    
    if (practice) {
      console.log('   - coach_id: should reference users.id')
      console.log('   - created_by: should reference users.id')
      console.log('   - team_id: should reference teams.id')
      
      // Verify coach_id exists in users
      if (practice.coach_id) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', practice.coach_id)
          .single()
        
        console.log(`   ✅ coach_id ${practice.coach_id} ${user ? 'EXISTS' : 'NOT FOUND'} in users`)
      }
    }
  } catch (e) {
    console.log('   No practices to check')
  }
  
  console.log('\n2. user_drills table relationships:')
  try {
    const { data: drill } = await supabase
      .from('user_drills')
      .select('id, user_id')
      .limit(1)
      .single()
    
    if (drill) {
      console.log('   - user_id: should reference users.id')
      
      if (drill.user_id) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('id', drill.user_id)
          .single()
        
        console.log(`   ✅ user_id ${drill.user_id} ${user ? 'EXISTS' : 'NOT FOUND'} in users`)
      }
    }
  } catch (e) {
    console.log('   No user_drills to check')
  }
  
  console.log('\n3. user_favorites table structure needed:')
  console.log('   Required columns for app to work:')
  console.log('   - id (UUID primary key)')
  console.log('   - user_id (UUID -> users.id)')
  console.log('   - item_id (TEXT - stores drill/strategy ID)')
  console.log('   - item_type (TEXT - "drill" or "strategy")')
  console.log('   - created_at (TIMESTAMP)')
  
  // Check what user_favorites actually has
  try {
    const { data } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(1)
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      console.log('\n   Current user_favorites columns:')
      columns.forEach(col => console.log(`   - ${col}`))
      
      const missingColumns = []
      if (!columns.includes('item_id')) missingColumns.push('item_id')
      if (!columns.includes('item_type')) missingColumns.push('item_type')
      if (!columns.includes('user_id')) missingColumns.push('user_id')
      
      if (missingColumns.length > 0) {
        console.log('\n   ⚠️ MISSING COLUMNS:', missingColumns.join(', '))
      } else {
        console.log('\n   ✅ All required columns present')
      }
    } else {
      console.log('\n   ⚠️ Table empty or structure unknown')
    }
  } catch (e) {
    console.log('\n   ❌ Could not check user_favorites structure')
  }
  
  console.log('\n\n📋 SUMMARY')
  console.log('=' .repeat(50))
  console.log('If user_favorites is missing item_id or item_type columns,')
  console.log('we need to ADD them without removing existing columns.')
  console.log('The migration should:')
  console.log('1. ADD COLUMN item_id TEXT if missing')
  console.log('2. ADD COLUMN item_type TEXT if missing')
  console.log('3. Keep all existing columns intact')
  console.log('4. Migrate existing data if needed')
}

checkAllTablesStructure()