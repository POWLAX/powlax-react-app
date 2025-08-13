import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🚀 Applying Gamification Migration 102...')

async function applyGamificationMigration() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '102_gamification_implementation.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded, executing SQL...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: migrationSQL
    })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration executed successfully!')
    
    // Verify tables were created
    console.log('🔍 Verifying gamification tables...')
    
    const tables = [
      'user_badge_progress',
      'user_rank_progress', 
      'badge_requirements',
      'rank_requirements'
    ]
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1)
        
      if (tableError) {
        console.error(`❌ Table ${table} not accessible:`, tableError.message)
      } else {
        console.log(`✅ Table ${table}: accessible`)
      }
    }
    
    // Check badge_requirements population
    const { data: badgeReqs, error: badgeReqError } = await supabase
      .from('badge_requirements')
      .select('*')
      
    if (!badgeReqError) {
      console.log(`✅ Badge requirements populated: ${badgeReqs.length} entries`)
    }
    
    // Check rank_requirements population  
    const { data: rankReqs, error: rankReqError } = await supabase
      .from('rank_requirements')
      .select('*')
      
    if (!rankReqError) {
      console.log(`✅ Rank requirements populated: ${rankReqs.length} entries`)
    }
    
    console.log('🎯 Gamification migration completed successfully!')
    
  } catch (error) {
    console.error('💥 Migration failed with exception:', error)
  }
}

applyGamificationMigration()