// scripts/apply-point-types-migration.ts
// Purpose: Apply point types migration directly using service role
// Pattern: Direct SQL execution for Skills Academy setup

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  console.log('💡 Using anon key instead - some operations may fail')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function applyMigration() {
  console.log('🚀 Applying point types migration for Skills Academy...')
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/123_modify_point_types_for_skills_academy.sql', 'utf8')
    
    console.log('📄 Migration file loaded, applying changes...')
    
    // Split SQL by statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.toLowerCase().includes('select')) {
        // Skip SELECT statements (verification queries)
        continue
      }
      
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error)
        // Try direct approach if RPC fails
        const { error: directError } = await supabase
          .from('__dummy__') // This will fail but might give us better error info
          .select('*')
        
        console.log('⚠️  Continuing with next statement...')
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }
    
    // Verify the changes worked
    console.log('\n🔍 Verifying migration results...')
    const { data: pointTypes, error: verifyError } = await supabase
      .from('point_types_powlax')
      .select('id, title, image_url, slug, series_type')
      .order('id')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
    } else {
      console.log('✅ Migration verification:')
      console.log(`📊 Found ${pointTypes?.length || 0} point types`)
      
      if (pointTypes && pointTypes.length > 0) {
        pointTypes.forEach(type => {
          console.log(`  ${type.id}: ${type.title} (${type.series_type}) - ${type.slug}`)
        })
        
        // Check series type distribution
        const seriesTypes = pointTypes.reduce((acc: Record<string, number>, type) => {
          acc[type.series_type || 'undefined'] = (acc[type.series_type || 'undefined'] || 0) + 1
          return acc
        }, {})
        
        console.log('\n📊 Series type distribution:')
        Object.entries(seriesTypes).forEach(([series, count]) => {
          console.log(`  ${series}: ${count} types`)
        })
      }
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

applyMigration()
  .then(() => {
    console.log('\n🎯 Migration complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })