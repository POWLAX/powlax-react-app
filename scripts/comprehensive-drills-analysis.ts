import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Scratch pad for findings
let findings: string[] = []

function log(message: string) {
  console.log(message)
  findings.push(message)
}

async function comprehensiveDrillsAnalysis() {
  log('🔍 COMPREHENSIVE DRILLS TABLE ANALYSIS')
  log('=' .repeat(60))
  log(`Analysis Date: ${new Date().toISOString()}`)
  log('')
  
  // PART 1: Get actual column structure for both tables
  log('## PART 1: TABLE STRUCTURE COMPARISON')
  log('')
  
  log('### 1.1 Getting powlax_drills structure...')
  const powlaxColumns: Record<string, any> = {}
  try {
    const { data: powlaxSample } = await supabase
      .from('powlax_drills')
      .select('*')
      .limit(1)
      .single()
    
    if (powlaxSample) {
      for (const [key, value] of Object.entries(powlaxSample)) {
        const type = value === null ? 'null' : 
                     Array.isArray(value) ? 'array' : 
                     typeof value
        powlaxColumns[key] = { type, sampleValue: value }
        log(`   - ${key}: ${type}`)
      }
    }
  } catch (err: any) {
    log(`   ERROR: ${err.message}`)
  }
  
  log('')
  log('### 1.2 Getting user_drills structure...')
  const userColumns: Record<string, any> = {}
  try {
    const { data: userSample } = await supabase
      .from('user_drills')
      .select('*')
      .limit(1)
      .single()
    
    if (userSample) {
      for (const [key, value] of Object.entries(userSample)) {
        const type = value === null ? 'null' : 
                     Array.isArray(value) ? 'array' : 
                     typeof value
        userColumns[key] = { type, sampleValue: value }
        log(`   - ${key}: ${type}`)
      }
    } else {
      log('   ⚠️ No records in user_drills, checking schema via error...')
      
      // Try to insert empty record to get column requirements
      const { error } = await supabase
        .from('user_drills')
        .insert({})
      
      if (error) {
        log(`   Schema hint from error: ${error.message}`)
      }
    }
  } catch (err: any) {
    log(`   ERROR: ${err.message}`)
  }
  
  log('')
  log('### 1.3 Column Alignment Analysis')
  
  // Check which powlax_drills columns are missing in user_drills
  const missingInUserDrills: string[] = []
  for (const col of Object.keys(powlaxColumns)) {
    if (!userColumns[col]) {
      missingInUserDrills.push(col)
    }
  }
  
  if (missingInUserDrills.length > 0) {
    log('   ❌ Columns in powlax_drills but NOT in user_drills:')
    missingInUserDrills.forEach(col => log(`      - ${col}`))
  } else {
    log('   ✅ All powlax_drills columns exist in user_drills')
  }
  
  // Check extra columns in user_drills
  const extraInUserDrills: string[] = []
  for (const col of Object.keys(userColumns)) {
    if (!powlaxColumns[col]) {
      extraInUserDrills.push(col)
    }
  }
  
  if (extraInUserDrills.length > 0) {
    log('')
    log('   ℹ️ Extra columns in user_drills (not in powlax_drills):')
    extraInUserDrills.forEach(col => log(`      - ${col}`))
  }
  
  // PART 2: Analyze what the create function sends
  log('')
  log('## PART 2: CREATE FUNCTION ANALYSIS')
  log('')
  
  // Read the actual create function code
  log('### 2.1 Fields sent by AddCustomDrillModal:')
  const modalFields = [
    'user_id',
    'title',
    'content',
    'duration_minutes',
    'category',
    'video_url',
    'drill_lab_url_1',
    'drill_lab_url_2',
    'drill_lab_url_3',
    'drill_lab_url_4',
    'drill_lab_url_5',
    'equipment',
    'tags',
    'game_states',
    'is_public',
    'team_share',
    'club_share'
  ]
  
  modalFields.forEach(field => {
    const inUserDrills = userColumns[field] ? '✅' : '❌'
    log(`   ${inUserDrills} ${field}`)
  })
  
  log('')
  log('### 2.2 Fields expected by useUserDrills hook:')
  const hookFields = [
    'user_id',
    'title',
    'content',
    'duration_minutes',
    'category',
    'video_url',
    'drill_lab_url_1',
    'drill_lab_url_2',
    'drill_lab_url_3',
    'drill_lab_url_4',
    'drill_lab_url_5',
    'equipment',
    'tags',
    'game_states',
    'is_public',
    'team_share',
    'club_share'
  ]
  
  hookFields.forEach(field => {
    const inUserDrills = userColumns[field] ? '✅' : '❌'
    log(`   ${inUserDrills} ${field}`)
  })
  
  // PART 3: Check RLS policies
  log('')
  log('## PART 3: RLS POLICY CHECK')
  log('')
  
  // Test with a real user ID
  const testUserId = '523f2768-6404-439c-a429-f9eb6736aa17' // Patrick's ID
  
  log('### 3.1 Testing INSERT permission...')
  const testDrill = {
    user_id: testUserId,
    title: 'RLS Test Drill',
    content: 'Testing RLS policies',
    duration_minutes: 10,
    category: 'Test',
    video_url: null,
    drill_lab_url_1: null,
    drill_lab_url_2: null,
    drill_lab_url_3: null,
    drill_lab_url_4: null,
    drill_lab_url_5: null,
    equipment: '',
    tags: '',
    game_states: [],
    is_public: false,
    team_share: [],
    club_share: []
  }
  
  const { data: insertData, error: insertError } = await supabase
    .from('user_drills')
    .insert([testDrill])
    .select()
  
  if (insertError) {
    log(`   ❌ INSERT FAILED: ${insertError.message}`)
    log(`   Error code: ${insertError.code}`)
    log(`   Error details: ${JSON.stringify(insertError.details)}`)
  } else {
    log(`   ✅ INSERT SUCCESSFUL`)
    if (insertData && insertData[0]) {
      log(`   Created drill ID: ${insertData[0].id}`)
      
      // Clean up
      await supabase
        .from('user_drills')
        .delete()
        .eq('id', insertData[0].id)
      log(`   ✅ Test drill cleaned up`)
    }
  }
  
  log('')
  log('### 3.2 Testing SELECT permission...')
  const { data: selectData, error: selectError } = await supabase
    .from('user_drills')
    .select('id, title, user_id')
    .limit(5)
  
  if (selectError) {
    log(`   ❌ SELECT FAILED: ${selectError.message}`)
  } else {
    log(`   ✅ SELECT SUCCESSFUL - Found ${selectData?.length || 0} drills`)
  }
  
  // PART 4: Check authentication context
  log('')
  log('## PART 4: AUTHENTICATION CONTEXT')
  log('')
  
  log('### 4.1 Checking users table...')
  const { data: user } = await supabase
    .from('users')
    .select('id, email, display_name, auth_user_id')
    .eq('id', testUserId)
    .single()
  
  if (user) {
    log(`   ✅ User found: ${user.email}`)
    log(`   - ID: ${user.id}`)
    log(`   - Auth User ID: ${user.auth_user_id || 'NULL'}`)
    log(`   - Display Name: ${user.display_name}`)
  } else {
    log(`   ❌ User not found with ID: ${testUserId}`)
  }
  
  // PART 5: Missing columns that need to be added
  log('')
  log('## PART 5: REQUIRED FIXES')
  log('')
  
  const requiredColumns = [
    'duration_minutes',
    'category', 
    'video_url',
    'drill_lab_url_1',
    'drill_lab_url_2',
    'drill_lab_url_3',
    'drill_lab_url_4',
    'drill_lab_url_5',
    'equipment',
    'tags'
  ]
  
  const missingRequired = requiredColumns.filter(col => !userColumns[col])
  
  if (missingRequired.length > 0) {
    log('### ❌ CRITICAL: Missing required columns in user_drills:')
    missingRequired.forEach(col => {
      log(`   - ${col} (required by create function)`)
    })
    
    log('')
    log('### 🔧 SQL to add missing columns:')
    log('```sql')
    missingRequired.forEach(col => {
      let sqlType = 'TEXT'
      let defaultValue = 'NULL'
      
      if (col === 'duration_minutes') {
        sqlType = 'INTEGER'
        defaultValue = '10'
      } else if (col === 'category') {
        defaultValue = "'Custom'"
      } else if (col === 'equipment' || col === 'tags') {
        defaultValue = "''"
      }
      
      log(`ALTER TABLE user_drills ADD COLUMN IF NOT EXISTS ${col} ${sqlType} DEFAULT ${defaultValue};`)
    })
    log('```')
  } else {
    log('✅ All required columns exist in user_drills')
  }
  
  // PART 6: RLS Policy recommendations
  log('')
  log('## PART 6: RLS POLICY RECOMMENDATIONS')
  log('')
  
  if (insertError && insertError.message.includes('row-level security')) {
    log('### ❌ RLS Policy is blocking INSERT operations')
    log('')
    log('Current error suggests the RLS policy is too restrictive.')
    log('The policy might be checking auth.uid() but the app uses public.users.')
    log('')
    log('### 🔧 Recommended RLS fix:')
    log('```sql')
    log('-- Drop existing restrictive policies')
    log('DROP POLICY IF EXISTS "Authenticated users can manage drills" ON user_drills;')
    log('')
    log('-- Create a more permissive policy for testing')
    log('CREATE POLICY "Allow all authenticated users" ON user_drills')
    log('  FOR ALL')
    log('  TO authenticated')
    log('  USING (true)')
    log('  WITH CHECK (true);')
    log('```')
  }
  
  // Save findings to file
  const report = findings.join('\n')
  fs.writeFileSync('./DRILLS_ANALYSIS_REPORT.md', report)
  
  console.log('\n' + '='.repeat(60))
  console.log('📄 Full report saved to: DRILLS_ANALYSIS_REPORT.md')
}

comprehensiveDrillsAnalysis()