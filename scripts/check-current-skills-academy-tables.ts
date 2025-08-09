#!/usr/bin/env npx tsx
/**
 * Check current state of Skills Academy tables in Supabase
 * Agent 2 (Database) - Pre-migration verification
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function checkTables() {
  console.log('🔍 Checking Current Skills Academy Tables in Supabase...\n')
  console.log('=' .repeat(60))
  
  try {
    // 1. Check skills_academy_workouts table
    console.log('\n📋 Table: skills_academy_workouts')
    console.log('-'.repeat(40))
    
    const { data: workouts, count: workoutCount } = await supabase
      .from('skills_academy_workouts')
      .select('*', { count: 'exact' })
      .limit(3)
    
    console.log(`Total records: ${workoutCount}`)
    
    if (workouts && workouts.length > 0) {
      console.log('Columns:', Object.keys(workouts[0]))
      console.log('\nSample workout:')
      const sample = workouts[0]
      console.log(`  - ID: ${sample.id}`)
      console.log(`  - Name: ${sample.workout_name}`)
      console.log(`  - drill_ids: ${sample.drill_ids ? `[${sample.drill_ids.length} items]` : 'NULL/empty'}`)
      console.log(`  - drill_count: ${sample.drill_count}`)
    }
    
    // Check how many have drill_ids populated
    const { count: populatedCount } = await supabase
      .from('skills_academy_workouts')
      .select('*', { count: 'exact', head: true })
      .not('drill_ids', 'eq', '{}')
      .not('drill_ids', 'is', null)
    
    console.log(`\n✅ Workouts with drill_ids populated: ${populatedCount}`)
    console.log(`❌ Workouts without drill_ids: ${workoutCount! - populatedCount!}`)
    
    // 2. Check skills_academy_drills table
    console.log('\n📋 Table: skills_academy_drills')
    console.log('-'.repeat(40))
    
    const { data: drills, count: drillCount } = await supabase
      .from('skills_academy_drills')
      .select('*', { count: 'exact' })
      .limit(3)
    
    console.log(`Total records: ${drillCount}`)
    
    if (drills && drills.length > 0) {
      console.log('Columns:', Object.keys(drills[0]))
      console.log('\nSample drill:')
      const drill = drills[0]
      console.log(`  - ID: ${drill.id}`)
      console.log(`  - Title: ${drill.title}`)
      console.log(`  - Vimeo ID: ${drill.vimeo_id || 'NULL'}`)
      console.log(`  - Category: ${drill.drill_category || 'NULL'}`)
    }
    
    // 3. Check skills_academy_series table
    console.log('\n📋 Table: skills_academy_series')
    console.log('-'.repeat(40))
    
    const { data: series, count: seriesCount } = await supabase
      .from('skills_academy_series')
      .select('*', { count: 'exact' })
      .limit(3)
    
    console.log(`Total records: ${seriesCount}`)
    
    if (series && series.length > 0) {
      console.log('Columns:', Object.keys(series[0]))
      console.log('\nSample series:')
      const s = series[0]
      console.log(`  - ID: ${s.id}`)
      console.log(`  - Name: ${s.series_name}`)
      console.log(`  - Type: ${s.series_type}`)
    }
    
    // 4. Check for legacy tables (should not exist)
    console.log('\n🔍 Checking for removed legacy tables...')
    console.log('-'.repeat(40))
    
    const legacyTables = [
      'skills_academy_workout_drills',
      'skills_academy_drill_library',
      'powlax_skills_academy_drills'
    ]
    
    for (const tableName of legacyTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error && error.message.includes('does not exist')) {
          console.log(`✅ ${tableName}: REMOVED (good!)`)
        } else {
          console.log(`⚠️  ${tableName}: Still exists`)
        }
      } catch (e) {
        console.log(`✅ ${tableName}: REMOVED (good!)`)
      }
    }
    
    // 5. Check drill_ids column specifically
    console.log('\n🔍 Checking drill_ids column in skills_academy_workouts...')
    console.log('-'.repeat(40))
    
    const { data: columnCheck } = await supabase
      .from('skills_academy_workouts')
      .select('id, drill_ids')
      .limit(1)
    
    if (columnCheck && columnCheck.length > 0) {
      const hasDrillIds = 'drill_ids' in columnCheck[0]
      if (hasDrillIds) {
        console.log('✅ drill_ids column EXISTS')
        console.log(`   Type: INTEGER[] (array of integers)`)
      } else {
        console.log('❌ drill_ids column NOT FOUND')
      }
    }
    
    // 6. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`
Current State:
- skills_academy_workouts: ${workoutCount} records (${populatedCount} with drills)
- skills_academy_drills: ${drillCount} records
- skills_academy_series: ${seriesCount} records
- drill_ids column: ${columnCheck && 'drill_ids' in columnCheck[0] ? 'EXISTS' : 'MISSING'}

${populatedCount === 0 ? '⚠️  NEEDS MIGRATION: No workouts have drill_ids populated!' : '✅ Some workouts already have drill_ids'}
    `)
    
    if (populatedCount === 0) {
      console.log('Next Step: Run migration to populate drill_ids arrays')
      console.log('This will connect workouts to actual drills')
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
    process.exit(1)
  }
}

// Run the check
checkTables().then(() => {
  console.log('\n✅ Table check complete!')
})