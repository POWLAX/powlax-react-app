import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function debugPracticesAuth() {
  console.log('🔍 Debugging Practices Table & Authentication\n')
  
  // 1. Check if practices table exists and structure
  console.log('1️⃣ Checking practices table structure...')
  try {
    const { data: sample, error } = await supabase
      .from('practices')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error accessing practices table:', error.message)
      console.log('   Error code:', error.code)
      console.log('   Error details:', error.details)
    } else {
      console.log('✅ Practices table accessible')
      if (sample && sample.length > 0) {
        const columns = Object.keys(sample[0])
        console.log('   Columns found:', columns.join(', '))
        
        // Check for critical columns
        const criticalColumns = ['id', 'created_by', 'coach_id', 'name', 'raw_wp_data']
        const missingColumns = criticalColumns.filter(col => !columns.includes(col))
        
        if (missingColumns.length > 0) {
          console.log('   ⚠️ Missing columns:', missingColumns.join(', '))
        } else {
          console.log('   ✅ All critical columns present')
        }
        
        // Check if created_by exists
        if (!columns.includes('created_by')) {
          console.log('\n   🚨 CRITICAL: created_by column is missing!')
          console.log('   👉 Run Migration 111 in Supabase Dashboard to fix this')
        }
      } else {
        console.log('   No records in practices table yet')
        
        // Try to get column info via raw SQL
        const { data: cols, error: colError } = await supabase
          .rpc('get_column_names', { 
            schema_name: 'public',
            table_name: 'practices' 
          })
        
        if (!colError && cols) {
          console.log('   Table columns (via RPC):', cols)
        }
      }
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 2. Check RLS policies
  console.log('\n2️⃣ Checking RLS policies...')
  try {
    // Try to query policies (this requires admin access)
    const { data: policies, error: polError } = await supabase.rpc('get_policies', {
      schema_name: 'public',
      table_name: 'practices'
    })
    
    if (polError) {
      console.log('   Could not query policies (may need admin access)')
    } else if (policies) {
      console.log('   Found policies:', policies)
    }
  } catch (err) {
    console.log('   Could not check policies')
  }
  
  // 3. Test inserting a practice (with service role key)
  console.log('\n3️⃣ Testing practice insertion with service role...')
  try {
    const testPractice = {
      name: 'Test Practice - Debug Script',
      coach_id: '523f2768-6404-439c-a429-f9eb6736aa17', // Patrick's ID
      created_by: '523f2768-6404-439c-a429-f9eb6736aa17',
      team_id: null,
      practice_date: new Date().toISOString().split('T')[0],
      start_time: '15:00',
      duration_minutes: 90,
      field_location: 'Test Field',
      notes: 'Created by debug script',
      raw_wp_data: {
        drills: [],
        startTime: '15:00',
        field: 'Test Field'
      }
    }
    
    const { data, error } = await supabase
      .from('practices')
      .insert([testPractice])
      .select()
      .single()
    
    if (error) {
      console.log('❌ Could not insert test practice:', error.message)
      console.log('   Error code:', error.code)
      console.log('   Error details:', error.details)
      
      if (error.message.includes('created_by')) {
        console.log('\n   🚨 The created_by column is missing!')
        console.log('   👉 You need to run Migration 111 in Supabase Dashboard')
      }
    } else {
      console.log('✅ Successfully inserted test practice')
      console.log('   ID:', data.id)
      console.log('   Name:', data.name)
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('practices')
        .delete()
        .eq('id', data.id)
      
      if (!deleteError) {
        console.log('   ✅ Cleaned up test record')
      }
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 4. Check existing practices
  console.log('\n4️⃣ Checking existing practices...')
  try {
    const { data: practices, error } = await supabase
      .from('practices')
      .select('id, name, created_at, coach_id, created_by, team_id')
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Could not fetch practices:', error.message)
    } else {
      console.log(`✅ Found ${practices?.length || 0} practices`)
      practices?.forEach(p => {
        console.log(`   - ${p.name || '(unnamed)'} (ID: ${p.id})`)
        console.log(`     Coach: ${p.coach_id || 'none'}, Created by: ${p.created_by || 'none'}`)
      })
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 5. Summary and recommendations
  console.log('\n📋 SUMMARY & RECOMMENDATIONS')
  console.log('================================')
  console.log('If you\'re seeing authentication errors:')
  console.log('1. Check if created_by column exists in practices table')
  console.log('2. If missing, run Migration 111 in Supabase Dashboard')
  console.log('3. Ensure RLS policies are properly configured')
  console.log('4. Verify user is properly authenticated in the app')
  console.log('\nMigration file: supabase/migrations/111_add_created_by_column_and_fix_rls.sql')
}

debugPracticesAuth()