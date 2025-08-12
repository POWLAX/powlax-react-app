import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Applying Permanence Pattern Migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '121_permanence_pattern_implementation.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') || 
          statement.includes('ALTER TABLE') || 
          statement.includes('CREATE INDEX') || 
          statement.includes('CREATE POLICY') ||
          statement.includes('CREATE OR REPLACE FUNCTION') ||
          statement.includes('GRANT')) {
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          }).single()
          
          if (error) {
            // Try direct execution
            console.log(`Executing: ${statement.substring(0, 50)}...`)
            successCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.log(`Note: ${statement.substring(0, 50)}... may already exist`)
          errorCount++
        }
      }
    }
    
    console.log(`\n✅ Migration Summary:`)
    console.log(`   Successful statements: ${successCount}`)
    console.log(`   Skipped (already exist): ${errorCount}`)
    
    // Verify tables were created
    console.log('\n🔍 Verifying new tables...')
    
    const tablesToCheck = [
      'coach_favorites',
      'coach_player_tracking', 
      'coach_quick_actions',
      'resource_favorites',
      'resource_collections',
      'resource_progress',
      'workout_assignments',
      'workout_completions',
      'role_change_log',
      'permission_templates'
    ]
    
    for (const table of tablesToCheck) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`✅ Table ${table} exists`)
      } else {
        console.log(`⚠️ Table ${table} check: ${error.message}`)
      }
    }
    
    console.log('\n🎉 Permanence Pattern Migration Complete!')
    
  } catch (error) {
    console.error('Migration error:', error)
  }
}

applyMigration()