import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function debugAuthUsers() {
  console.log('🔍 Debugging Auth Users & Practice Save Issues\n')
  
  // 1. Check auth.users table
  console.log('1️⃣ Checking auth.users table...')
  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log('❌ Error accessing auth.users:', error.message)
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`)
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
        if (user.email === 'chaplalalacrosse22@gmail.com') {
          console.log('     👆 This is the test user!')
        }
      })
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 2. Check public.users table
  console.log('\n2️⃣ Checking public.users table...')
  try {
    const { data: publicUsers, error } = await supabase
      .from('users')
      .select('id, auth_user_id, email, display_name')
      .limit(10)
    
    if (error) {
      console.log('❌ Error accessing public.users:', error.message)
    } else {
      console.log(`✅ Found ${publicUsers?.length || 0} public users`)
      publicUsers?.forEach(user => {
        console.log(`   - ${user.email || user.display_name} (ID: ${user.id}, Auth ID: ${user.auth_user_id})`)
        if (user.email === 'chaplalalacrosse22@gmail.com') {
          console.log('     👆 This is the test user in public.users!')
        }
      })
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 3. Find the correct user ID for chaplalalacrosse22
  console.log('\n3️⃣ Finding correct user ID for chaplalalacrosse22@gmail.com...')
  try {
    // Check auth.users
    const { data: authData } = await supabase.auth.admin.getUserByEmail('chaplalalacrosse22@gmail.com')
    
    if (authData?.user) {
      console.log('✅ Found in auth.users:')
      console.log('   Auth User ID:', authData.user.id)
      
      // Now find in public.users
      const { data: publicUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single()
      
      if (publicUser) {
        console.log('✅ Found in public.users:')
        console.log('   Public User ID:', publicUser.id)
        console.log('   Display Name:', publicUser.display_name)
        console.log('   Roles:', publicUser.roles)
        console.log('\n   🎯 USE THIS ID FOR SAVING PRACTICES:', authData.user.id)
      } else {
        console.log('❌ Not found in public.users table')
        console.log('   This user needs to be added to public.users')
      }
    } else {
      console.log('❌ Email not found in auth.users')
    }
  } catch (err) {
    console.error('   Error finding user:', err)
  }
  
  // 4. Check if migration 111 altered the foreign key correctly
  console.log('\n4️⃣ Checking practices table foreign key...')
  console.log('   The created_by column should reference auth.users(id), not public.users(id)')
  console.log('   Migration 111 should have set: REFERENCES auth.users(id)')
  
  // 5. Test saving with correct auth user ID
  console.log('\n5️⃣ Testing save with auth.users ID...')
  try {
    const { data: authData } = await supabase.auth.admin.getUserByEmail('chaplalalacrosse22@gmail.com')
    
    if (authData?.user) {
      const testPractice = {
        name: 'Test Practice - Auth Debug',
        coach_id: authData.user.id,  // Use auth user ID
        created_by: authData.user.id, // Use auth user ID
        team_id: null,
        practice_date: new Date().toISOString().split('T')[0],
        start_time: '15:00',
        duration_minutes: 90,
        field_location: 'Test Field',
        notes: 'Testing with correct auth user ID',
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
        console.log('❌ Still cannot save:', error.message)
        console.log('   Error details:', error.details)
      } else {
        console.log('✅ Successfully saved practice with auth user ID!')
        console.log('   Practice ID:', data.id)
        console.log('   Practice Name:', data.name)
        
        // Clean up
        await supabase.from('practices').delete().eq('id', data.id)
        console.log('   ✅ Cleaned up test record')
      }
    }
  } catch (err) {
    console.error('   Unexpected error:', err)
  }
  
  // 6. Summary
  console.log('\n📋 SUMMARY')
  console.log('================================')
  console.log('The issue is that practices.created_by references auth.users(id),')
  console.log('but the app might be using public.users IDs instead.')
  console.log('\nSOLUTION:')
  console.log('1. The app should use auth.uid() which returns the auth.users ID')
  console.log('2. The usePracticePlans hook should use user.id from useAuth (which is auth ID)')
  console.log('3. Do NOT use IDs from the public.users table for created_by')
}

debugAuthUsers()