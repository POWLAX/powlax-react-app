import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixUserDrillsTableManually() {
  console.log('🛠️  Fixing user_drills table by checking current structure and updating AddCustomDrillModal...')
  
  try {
    // First, let's see what columns actually exist by trying to select minimal fields
    console.log('🔍 Checking existing table structure...')
    
    const { data: existing, error: selectError } = await supabase
      .from('user_drills')
      .select('*')
      .limit(0)
    
    if (selectError) {
      console.error('❌ Could not access user_drills table:', selectError.message)
      return
    }
    
    // Now let's check what specific columns exist by testing each one
    const columnsToTest = [
      'id', 'user_id', 'title', 'content', 'created_at', 'updated_at',
      'category', 'duration_minutes', 'notes', 'coach_instructions', 
      'video_url', 'drill_lab_url_1', 'equipment', 'tags', 'game_states',
      'is_public', 'team_share', 'club_share'
    ]
    
    const existingColumns: string[] = []
    const missingColumns: string[] = []
    
    for (const column of columnsToTest) {
      try {
        const { error } = await supabase
          .from('user_drills')
          .select(column)
          .limit(0)
        
        if (error) {
          missingColumns.push(column)
          console.log(`❌ Column '${column}' does not exist`)
        } else {
          existingColumns.push(column)
          console.log(`✅ Column '${column}' exists`)
        }
      } catch (err) {
        missingColumns.push(column)
        console.log(`❌ Column '${column}' test failed`)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`✅ Existing columns (${existingColumns.length}):`, existingColumns)
    console.log(`❌ Missing columns (${missingColumns.length}):`, missingColumns)
    
    if (missingColumns.length === 0) {
      console.log('🎉 All required columns exist! The issue might be elsewhere.')
      
      // Test a simple insert
      console.log('\n🧪 Testing insert with existing columns only...')
      
      const testData = {
        title: 'Test Drill',
        user_id: '00000000-0000-0000-0000-000000000000'
      }
      
      if (existingColumns.includes('category')) {
        testData['category'] = 'custom'
      }
      
      if (existingColumns.includes('duration_minutes')) {
        testData['duration_minutes'] = 10
      }
      
      const { data, error } = await supabase
        .from('user_drills')
        .insert(testData)
        .select()
      
      if (error) {
        console.error('❌ Insert test failed:', error.message)
      } else {
        console.log('✅ Insert test successful!')
        if (data && data[0]) {
          // Clean up
          await supabase.from('user_drills').delete().eq('id', data[0].id)
          console.log('🧹 Test record cleaned up')
        }
      }
      
    } else {
      console.log('\n⚠️  Some columns are missing. This explains the schema cache error.')
      console.log('💡 Solution: Update AddCustomDrillModal to only use existing columns.')
    }
    
  } catch (err) {
    console.error('💥 Error during manual fix:', err)
  }
}

fixUserDrillsTableManually()