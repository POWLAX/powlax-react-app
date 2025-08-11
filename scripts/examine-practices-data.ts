import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function examinePracticesData() {
  console.log('=== EXAMINING PRACTICES TABLE DATA ===\n')
  
  // Get all data from practices table using service role
  console.log('1. Getting all practices data...')
  try {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} records`)
      if (data && data.length > 0) {
        console.log('\nSample record structure:')
        console.log(JSON.stringify(data[0], null, 2))
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err)
  }
  
  // Check table schema
  console.log('\n2. Checking table schema...')
  try {
    const { data, error } = await supabase
      .rpc('get_schema_info', { table_name: 'practices' })
    
    if (error) {
      console.log('❌ Schema error:', error.message)
      
      // Alternative method to check columns
      console.log('Trying alternative method...')
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'practices')
        .eq('table_schema', 'public')
      
      if (colError) {
        console.log('❌ Column check error:', colError.message)
      } else {
        console.log('✅ Table columns:')
        columns?.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`)
        })
      }
    } else {
      console.log('✅ Schema info:', data)
    }
  } catch (err) {
    console.log('❌ Schema exception:', err)
  }
  
  // Test save operation (simulate what the hook does)
  console.log('\n3. Testing save operation...')
  try {
    const testPractice = {
      title: 'Test Practice - Debug',
      coach_id: 'test-coach-id',
      team_id: 'test-team-id', 
      practice_date: new Date().toISOString().split('T')[0],
      duration_minutes: 90,
      drill_sequence: {
        timeSlots: [],
        practiceInfo: {
          startTime: '07:00',
          field: 'Test Field'
        }
      },
      practice_notes: 'Debug test practice'
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Save error:', error.message)
      console.log('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Save successful! New record ID:', data.id)
      
      // Clean up test record
      await supabase.from('practices').delete().eq('id', data.id)
      console.log('✅ Test record cleaned up')
    }
  } catch (err) {
    console.log('❌ Save exception:', err)
  }
  
  console.log('\n=== END EXAMINATION ===')
}

examinePracticesData().catch(console.error)