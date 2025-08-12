import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function applyMigration() {
  console.log('🚀 Applying user_drills migration...')
  
  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/115_add_missing_user_drills_columns.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded, executing SQL...')
    
    // Execute the migration by breaking it into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '')
    
    for (const statement of statements) {
      if (statement.includes('SELECT') || statement.includes('INSERT')) {
        // Skip verification queries
        continue
      }
      
      console.log(`🔧 Executing: ${statement.substring(0, 50)}...`)
      
      try {
        const { error } = await supabase.rpc('execute_sql', { sql: statement })
        
        if (error) {
          // Try without RPC (direct execution might not be available)
          console.log(`   RPC failed, error: ${error.message}`)
        } else {
          console.log(`   ✅ Success`)
        }
      } catch (err) {
        console.log(`   ⚠️  Direct execution error: ${err}`)
      }
    }
    
    console.log('\n🧪 Testing the updated table structure...')
    
    // Test insert with category field
    const testData = {
      title: 'Migration Test Drill',
      category: 'custom',
      duration_minutes: 15,
      user_id: '00000000-0000-0000-0000-000000000000' // dummy UUID for test
    }
    
    const { data, error } = await supabase
      .from('user_drills')
      .insert(testData)
      .select()
    
    if (error) {
      console.error('❌ Insert test failed:', error.message)
      console.log('   This indicates the migration may not have been applied correctly')
    } else {
      console.log('✅ Insert test successful! Migration appears to have worked')
      
      // Clean up test record
      if (data && data[0]) {
        await supabase
          .from('user_drills')
          .delete()
          .eq('id', data[0].id)
        console.log('🧹 Test record cleaned up')
      }
    }
    
  } catch (err) {
    console.error('💥 Migration application failed:', err)
  }
}

applyMigration()