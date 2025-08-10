/**
 * Apply database migration using Supabase service role
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function applyMigration() {
  console.log('🚀 Applying user migration enhancements...')
  
  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/062_user_migration_enhancements.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  // Split by statements (simple approach - may need refinement for complex SQL)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  let successCount = 0
  let errorCount = 0
  
  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      }).single()
      
      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_sql').select(statement)
        if (directError) {
          console.error(`❌ Error: ${directError.message}`)
          errorCount++
        } else {
          console.log('✅ Statement executed successfully')
          successCount++
        }
      } else {
        console.log('✅ Statement executed successfully')
        successCount++
      }
    } catch (err) {
      console.error(`❌ Error executing statement: ${err}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successful statements: ${successCount}`)
  console.log(`   ❌ Failed statements: ${errorCount}`)
  
  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!')
  } else {
    console.log('\n⚠️ Migration completed with some errors. Please review and apply manually if needed.')
  }
}

// Alternative approach using raw SQL execution
async function applyMigrationDirect() {
  console.log('🚀 Applying migration using direct SQL execution...')
  
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/062_user_migration_enhancements.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  // Try to execute the entire migration as one transaction
  try {
    const { data, error } = await supabase.rpc('query', { 
      query_text: migrationSQL 
    })
    
    if (error) {
      console.error('Failed with RPC, trying alternative approach...')
      
      // Parse and execute statement by statement
      const statements = migrationSQL
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.match(/^--/))
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        console.log(`\nExecuting statement ${i + 1}/${statements.length}`)
        console.log(`  ${stmt.substring(0, 60)}...`)
        
        try {
          // Since we can't directly execute DDL through Supabase client,
          // we'll need to use a different approach
          console.log('  ⚠️ Note: This statement may need manual execution')
        } catch (err) {
          console.error(`  ❌ Error: ${err}`)
        }
      }
      
      console.log('\n📝 Migration SQL has been prepared. Please execute manually via Supabase Dashboard:')
      console.log('   1. Go to: https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/sql/new')
      console.log('   2. Copy and paste the migration from: supabase/migrations/062_user_migration_enhancements.sql')
      console.log('   3. Execute the SQL')
    } else {
      console.log('✅ Migration applied successfully!')
    }
  } catch (err) {
    console.error(`Error: ${err}`)
    console.log('\n📝 Please apply the migration manually through the Supabase Dashboard')
  }
}

// Check if tables exist first
async function checkTables() {
  console.log('🔍 Checking existing table structure...')
  
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['users', 'team_members', 'club_organizations', 'team_teams'])
  
  if (error) {
    console.log('Could not query table information')
  } else {
    console.log('Found tables:', tables?.map(t => t.table_name).join(', '))
  }
}

async function main() {
  await checkTables()
  await applyMigrationDirect()
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})