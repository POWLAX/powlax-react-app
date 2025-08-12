import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkPracticesData() {
  console.log('🔍 Checking Practices Table Data\n')
  
  try {
    // 1. Get all practices
    console.log('1️⃣ Fetching all practices...')
    const { data: practices, error } = await supabase
      .from('practices')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Error fetching practices:', error.message)
      console.log('   Error details:', error)
      return
    }
    
    console.log(`✅ Found ${practices?.length || 0} practices\n`)
    
    if (practices && practices.length > 0) {
      console.log('📋 Practice Details:')
      practices.forEach((practice, index) => {
        console.log(`\n${index + 1}. ${practice.name || '(unnamed)'}`)
        console.log(`   ID: ${practice.id}`)
        console.log(`   Coach ID: ${practice.coach_id}`)
        console.log(`   Created By: ${practice.created_by}`)
        console.log(`   Team ID: ${practice.team_id}`)
        console.log(`   Date: ${practice.practice_date}`)
        console.log(`   Duration: ${practice.duration_minutes} minutes`)
        console.log(`   Field: ${practice.field_location}`)
        console.log(`   Created: ${practice.created_at}`)
        console.log(`   Raw WP Data: ${JSON.stringify(practice.raw_wp_data).substring(0, 100)}...`)
        
        // Check drill sequence
        if (practice.raw_wp_data?.drills) {
          console.log(`   Drills: ${practice.raw_wp_data.drills.length} drills`)
        }
      })
    }
    
    // 2. Check specific user's practices
    console.log('\n\n2️⃣ Checking practices by specific users...')
    
    // Check Patrick's practices
    const patrickId = '523f2768-6404-439c-a429-f9eb6736aa17'
    const { data: patrickPractices } = await supabase
      .from('practices')
      .select('id, name, created_by, coach_id')
      .or(`coach_id.eq.${patrickId},created_by.eq.${patrickId}`)
    
    console.log(`\nPatrick's practices (${patrickId}):`)
    console.log(`Found ${patrickPractices?.length || 0} practices`)
    patrickPractices?.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id})`)
    })
    
    // 3. Check if there are any practices with null created_by
    const { data: nullCreatedBy } = await supabase
      .from('practices')
      .select('id, name, coach_id, created_by')
      .is('created_by', null)
    
    console.log(`\n3️⃣ Practices with NULL created_by: ${nullCreatedBy?.length || 0}`)
    if (nullCreatedBy && nullCreatedBy.length > 0) {
      console.log('These practices may not load due to RLS policies:')
      nullCreatedBy.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id}, Coach: ${p.coach_id})`)
      })
    }
    
    // 4. Test query that usePracticePlans uses
    console.log('\n4️⃣ Testing usePracticePlans query pattern...')
    
    // Simulate no-team query
    const { data: noTeamPractices, error: noTeamError } = await supabase
      .from('practices')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (noTeamError) {
      console.log('❌ Error with no-team query:', noTeamError.message)
    } else {
      console.log(`✅ No-team query returned ${noTeamPractices?.length || 0} practices`)
    }
    
    // 5. Check column structure
    console.log('\n5️⃣ Checking column structure...')
    if (practices && practices.length > 0) {
      const columns = Object.keys(practices[0])
      console.log('Columns in practices table:', columns.join(', '))
      
      // Check for critical columns
      const requiredColumns = ['id', 'name', 'coach_id', 'created_by', 'raw_wp_data']
      const missingColumns = requiredColumns.filter(col => !columns.includes(col))
      
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns:', missingColumns.join(', '))
      } else {
        console.log('✅ All required columns present')
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkPracticesData()