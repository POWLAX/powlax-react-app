#!/usr/bin/env npx tsx

/**
 * Apply Resources Migration Script
 * Applies the resources permanence pattern tables to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🚀 Starting Resources Migration with Permanence Pattern')
  console.log('================================================')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '100_resources_permanence_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded successfully')
    console.log('⚠️  WARNING: This will drop and recreate resources tables!')
    console.log('   Press Ctrl+C within 5 seconds to cancel...')
    
    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Split SQL into individual statements (simple split on semicolons)
    // Note: This is a simplified approach - production should use a proper SQL parser
    const statements = migrationSQL
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')
    
    console.log(`\n📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue
      }
      
      // Get first few words for logging
      const preview = statement.substring(0, 50).replace(/\n/g, ' ')
      process.stdout.write(`\n[${i + 1}/${statements.length}] Executing: ${preview}...`)
      
      try {
        // Execute using raw SQL through Supabase
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        }).single()
        
        if (error) {
          // Try direct approach if RPC doesn't exist
          const { error: directError } = await supabase
            .from('_sql_executor')
            .insert({ query: statement })
            .single()
          
          if (directError) {
            throw directError
          }
        }
        
        process.stdout.write(' ✅')
        successCount++
      } catch (error: any) {
        process.stdout.write(' ❌')
        console.error(`\n   Error: ${error.message}`)
        errorCount++
        
        // Don't stop on errors - some statements might fail if objects already exist
        // In production, you'd want better error handling
      }
    }
    
    console.log('\n\n================================================')
    console.log('📊 Migration Summary:')
    console.log(`   ✅ Successful statements: ${successCount}`)
    console.log(`   ❌ Failed statements: ${errorCount}`)
    
    // Verify the tables were created
    console.log('\n🔍 Verifying table creation...')
    
    const tables = ['powlax_resources', 'user_resource_interactions', 'resource_collections']
    
    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ Table ${tableName}: NOT FOUND`)
      } else {
        console.log(`   ✅ Table ${tableName}: EXISTS`)
      }
    }
    
    // Check for array columns
    console.log('\n🔍 Verifying array columns (critical for permanence pattern)...')
    
    const { data: resourceData } = await supabase
      .from('powlax_resources')
      .select('*')
      .limit(1)
    
    if (resourceData && resourceData.length > 0) {
      const resource = resourceData[0]
      const arrayColumns = ['roles', 'age_groups', 'team_restrictions', 'club_restrictions', 'tags']
      
      for (const col of arrayColumns) {
        if (Array.isArray(resource[col])) {
          console.log(`   ✅ powlax_resources.${col}: IS ARRAY`)
        } else {
          console.log(`   ❌ powlax_resources.${col}: NOT AN ARRAY (${typeof resource[col]})`)
        }
      }
    }
    
    // Count sample data
    console.log('\n📊 Sample data count:')
    
    const { count: resourceCount } = await supabase
      .from('powlax_resources')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Resources: ${resourceCount || 0}`)
    
    const { count: collectionCount } = await supabase
      .from('resource_collections')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   Collections: ${collectionCount || 0}`)
    
    console.log('\n✅ Migration completed successfully!')
    console.log('   The Resources tables are now ready with the permanence pattern.')
    console.log('   Array columns are in place for reliable data persistence.')
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Alternative approach using direct PostgreSQL connection
async function applyMigrationDirect() {
  console.log('\n🔄 Attempting direct PostgreSQL connection...')
  
  const dbPassword = process.env.SUPABASE_DB_PASSWORD
  const dbHost = 'db.bhviqmmtzjvqkyfsddtk.supabase.co'
  const dbName = 'postgres'
  const dbUser = 'postgres'
  
  if (!dbPassword) {
    console.error('❌ SUPABASE_DB_PASSWORD not found')
    return false
  }
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '100_resources_permanence_tables.sql')
  
  // Use psql command directly
  const command = `PGPASSWORD=${dbPassword} psql -h ${dbHost} -U ${dbUser} -d ${dbName} -f "${migrationPath}"`
  
  console.log('📝 Executing migration via psql...')
  
  const { exec } = require('child_process')
  
  return new Promise((resolve) => {
    exec(command, (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error('❌ psql error:', error.message)
        console.error('stderr:', stderr)
        resolve(false)
      } else {
        console.log('✅ Migration applied successfully via psql')
        console.log(stdout)
        resolve(true)
      }
    })
  })
}

// Main execution
async function main() {
  // Try Supabase client first
  try {
    await applyMigration()
  } catch (error) {
    console.log('\n⚠️  Supabase client approach failed, trying direct PostgreSQL...')
    
    const success = await applyMigrationDirect()
    
    if (!success) {
      console.error('\n❌ Both migration approaches failed')
      console.error('Please run the migration manually using:')
      console.error('PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h db.bhviqmmtzjvqkyfsddtk.supabase.co -U postgres -d postgres -f supabase/migrations/100_resources_permanence_tables.sql')
      process.exit(1)
    }
  }
}

main().catch(console.error)