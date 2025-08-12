import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function inspectUserDrillsColumns() {
  console.log('🔍 Inspecting user_drills Table Columns\n')
  
  // Use raw SQL to get column information
  console.log('1️⃣ Getting column information via SQL...')
  try {
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'user_drills',
      schema_name: 'public'
    }).single()
    
    if (error) {
      console.log('RPC not available, trying alternate method...')
      
      // Try a different approach - use information_schema
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', 'user_drills')
      
      if (colError) {
        console.log('❌ Cannot access information_schema:', colError.message)
        
        // Last resort - try minimal insert to see what's required
        console.log('\n2️⃣ Testing minimal insert to discover required columns...')
        
        // Test 1: Absolute minimum
        const minimalTest = {
          user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
          title: 'Test'
        }
        
        const { error: minError } = await supabase
          .from('user_drills')
          .insert([minimalTest])
        
        if (minError) {
          console.log('❌ Minimal insert failed:', minError.message)
          console.log('   Error details:', minError.details)
          console.log('   Error hint:', minError.hint)
          console.log('   Error code:', minError.code)
        }
        
        // Test 2: With content field
        const withContent = {
          user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
          title: 'Test',
          content: 'Test content'
        }
        
        const { error: contentError } = await supabase
          .from('user_drills')
          .insert([withContent])
        
        if (contentError) {
          console.log('❌ With content failed:', contentError.message)
        } else {
          console.log('✅ Basic insert with user_id, title, content might work')
        }
        
      } else {
        console.log('✅ Found columns via information_schema:')
        columns?.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
    } else {
      console.log('✅ Found columns via RPC:')
      console.log(data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
  
  // Check what game_states expects
  console.log('\n3️⃣ Testing game_states column format...')
  
  // The error "expected JSON array" suggests game_states might be:
  // 1. A JSONB column that expects an array
  // 2. A text[] array column
  // 3. Something else entirely
  
  console.log('   Error message "expected JSON array" suggests:')
  console.log('   - game_states is likely a JSONB column')
  console.log('   - It expects a JSON array format')
  console.log('   - We might be sending it incorrectly')
  
  console.log('\n4️⃣ Let me check how useUserDrills is formatting data...')
  console.log('   From useUserDrills.ts, it sends:')
  console.log('   game_states: drill.game_states || []')
  console.log('   This should be an array already')
  
  console.log('\n5️⃣ SOLUTION HYPOTHESIS:')
  console.log('   The issue might be that game_states column:')
  console.log('   1. Doesn\'t exist in the table')
  console.log('   2. Is JSONB but we\'re not sending it correctly')
  console.log('   3. Has a CHECK constraint requiring specific values')
  
  console.log('\n📋 RECOMMENDED FIX:')
  console.log('   Remove game_states from the insert in useUserDrills.ts')
  console.log('   Store it in the content field instead (like we do with other data)')
}

inspectUserDrillsColumns()