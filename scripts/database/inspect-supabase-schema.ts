import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function inspectSupabaseSchema() {
  console.log('🔍 Inspecting Supabase Database Schema (Source of Truth)\n')
  console.log('=' .repeat(60))
  
  const tables = [
    'strategies_powlax',
    'drills_powlax', 
    'skills_academy_powlax',
    'wall_ball_powlax',
    'lessons_powlax',
    'drill_strategy_map_powlax'
  ]
  
  const schemaDoc: any = {
    timestamp: new Date().toISOString(),
    database_url: supabaseUrl,
    tables: {}
  }
  
  for (const tableName of tables) {
    console.log(`\n📊 TABLE: ${tableName}`)
    console.log('-'.repeat(40))
    
    try {
      // Get one row to inspect structure
      const { data: sample, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      // Get count
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`✅ Status: EXISTS`)
        console.log(`📝 Record Count: ${count || 0}`)
        
        if (sample && sample.length > 0) {
          const columns = Object.keys(sample[0])
          console.log(`📋 Columns (${columns.length}):`)
          
          schemaDoc.tables[tableName] = {
            exists: true,
            recordCount: count || 0,
            columns: {}
          }
          
          columns.forEach(col => {
            const value = sample[0][col]
            const type = value === null ? 'unknown' : 
                        Array.isArray(value) ? 'array' :
                        typeof value === 'object' ? 'jsonb' :
                        typeof value
            
            console.log(`   - ${col}: ${type}`)
            schemaDoc.tables[tableName].columns[col] = { type, nullable: true }
          })
          
          // Show sample data for non-empty tables
          if (count > 0) {
            console.log(`\n📄 Sample Record:`)
            console.log(JSON.stringify(sample[0], null, 2).split('\n').map(line => '   ' + line).join('\n'))
          }
        } else {
          console.log(`⚠️  No data to inspect column structure`)
          schemaDoc.tables[tableName] = {
            exists: true,
            recordCount: 0,
            columns: 'Unknown - table is empty'
          }
        }
      } else {
        console.log(`❌ Status: DOES NOT EXIST`)
        console.log(`   Error: ${error.message}`)
        schemaDoc.tables[tableName] = {
          exists: false,
          error: error.message
        }
      }
    } catch (e: any) {
      console.log(`❌ Error inspecting table: ${e.message}`)
      schemaDoc.tables[tableName] = {
        exists: false,
        error: e.message
      }
    }
  }
  
  // Check for other tables
  console.log('\n\n🔍 Checking for other POWLAX-related tables...')
  console.log('-'.repeat(40))
  
  try {
    // Try to list all tables (this might not work depending on permissions)
    const otherTables = [
      'staging_wp_drills',
      'staging_wp_strategies',
      'staging_wp_academy_drills',
      'staging_wp_wall_ball',
      'staging_wp_lessons',
      'skills_academy_drills',
      'skills_academy_workouts',
      'badges',
      'ranks',
      'wordpress_users',
      'wordpress_sessions'
    ]
    
    for (const table of otherTables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (!error) {
        console.log(`✅ Found: ${table}`)
        schemaDoc.tables[table] = { exists: true, note: 'Not part of _powlax convention' }
      }
    }
  } catch (e) {
    // Ignore errors for non-existent tables
  }
  
  // Save schema documentation
  const schemaPath = path.join(__dirname, '../docs/database/SUPABASE_SCHEMA_TRUTH.json')
  fs.writeFileSync(schemaPath, JSON.stringify(schemaDoc, null, 2))
  
  console.log('\n\n📄 SUMMARY')
  console.log('='.repeat(60))
  console.log('✅ Schema inspection complete')
  console.log(`📁 Full schema saved to: docs/database/SUPABASE_SCHEMA_TRUTH.json`)
  console.log('\n🎯 Next Steps:')
  console.log('1. Use this schema as the source of truth')
  console.log('2. Update import scripts to match these exact column names')
  console.log('3. Ignore SQL files that don\'t match this schema')
  
  return schemaDoc
}

// Run inspection
inspectSupabaseSchema().catch(console.error)