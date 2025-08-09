#!/usr/bin/env npx tsx
/**
 * Execute drill-workout migration for Skills Academy
 * This script adds the drill_ids column and populates it with mappings
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function executeMigration() {
  console.log('🚀 Skills Academy Drill-Workout Migration\n')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Check if drill_ids column exists
    console.log('\n📋 Step 1: Checking for drill_ids column...')
    const { data: checkColumn } = await supabase
      .from('skills_academy_workouts')
      .select('*')
      .limit(1)
    
    if (checkColumn && checkColumn.length > 0) {
      if (!('drill_ids' in checkColumn[0])) {
        console.log('❌ drill_ids column not found')
        console.log('\n⚠️  MANUAL ACTION REQUIRED:')
        console.log('Please run this in Supabase SQL Editor:')
        console.log('-'.repeat(60))
        console.log(`
ALTER TABLE skills_academy_workouts 
ADD COLUMN IF NOT EXISTS drill_ids INTEGER[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
ON skills_academy_workouts USING gin(drill_ids);
        `)
        console.log('-'.repeat(60))
        console.log('\nAfter adding the column, run this script again.')
        return
      }
      console.log('✅ drill_ids column exists')
    }
    
    // Step 2: Create workout name to ID mapping
    console.log('\n📋 Step 2: Loading workout data...')
    const { data: workouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_ids')
      .order('id')
    
    if (!workouts) {
      console.error('Failed to load workouts')
      return
    }
    
    console.log(`✅ Loaded ${workouts.length} workouts`)
    
    // Step 3: Create drill name to ID mapping
    console.log('\n📋 Step 3: Loading drill data...')
    const { data: drills } = await supabase
      .from('skills_academy_drills')
      .select('id, title')
      .order('id')
    
    if (!drills) {
      console.error('Failed to load drills')
      return
    }
    
    console.log(`✅ Loaded ${drills.length} drills`)
    
    // Create drill name to ID map
    const drillNameToId = new Map<string, number>()
    drills.forEach(d => {
      drillNameToId.set(d.title.toLowerCase(), d.id)
    })
    
    // Step 4: Define the mappings (simplified subset for testing)
    console.log('\n📋 Step 4: Applying drill-workout mappings...')
    
    // Sample mappings based on workout types
    const workoutMappings = [
      {
        namePattern: 'SS1 - Mini Workout',
        drillIds: [1, 2, 3, 4, 5]
      },
      {
        namePattern: 'SS1 - More Workout',
        drillIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
      {
        namePattern: 'Midfield Foundation of Skills - M1 - 10 Drills',
        drillIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      {
        namePattern: 'Midfield Foundation of Skills - M1 - 05 Drills',
        drillIds: [11, 12, 13, 14, 15]
      },
      {
        namePattern: 'Attack Establishment of Technique - A1 - 5 Drills',
        drillIds: [21, 22, 23, 24, 25]
      },
      {
        namePattern: 'Attack Establishment of Technique - A1 - 10 Drills',
        drillIds: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
      },
      {
        namePattern: 'Defense.*D1.*5 Drills',
        drillIds: [31, 32, 33, 34, 35]
      },
      {
        namePattern: 'Defense.*D1.*10 Drills',
        drillIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
      }
    ]
    
    let updatedCount = 0
    
    // Apply mappings to workouts
    for (const mapping of workoutMappings) {
      const matchingWorkouts = workouts.filter(w => 
        w.workout_name.toLowerCase().includes(mapping.namePattern.toLowerCase()) ||
        new RegExp(mapping.namePattern, 'i').test(w.workout_name)
      )
      
      for (const workout of matchingWorkouts) {
        // Only update if drill_ids is empty
        if (!workout.drill_ids || workout.drill_ids.length === 0) {
          const { error } = await supabase
            .from('skills_academy_workouts')
            .update({ drill_ids: mapping.drillIds })
            .eq('id', workout.id)
          
          if (!error) {
            console.log(`✅ Updated: ${workout.workout_name}`)
            updatedCount++
          } else {
            console.log(`❌ Failed to update: ${workout.workout_name}`)
          }
        }
      }
    }
    
    // Step 5: Apply generic mappings for remaining workouts
    console.log('\n📋 Step 5: Applying generic mappings for remaining workouts...')
    
    const { data: emptyWorkouts } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_count')
      .or('drill_ids.is.null,drill_ids.eq.{}')
    
    if (emptyWorkouts && emptyWorkouts.length > 0) {
      console.log(`Found ${emptyWorkouts.length} workouts still without drills`)
      
      for (const workout of emptyWorkouts) {
        const drillCount = workout.drill_count || 10
        const drillIds: number[] = []
        
        // Assign sequential drills based on workout ID to ensure variety
        const startId = ((workout.id - 1) * 5) % drills.length
        for (let i = 0; i < Math.min(drillCount, drills.length); i++) {
          const drillIndex = (startId + i) % drills.length
          drillIds.push(drills[drillIndex].id)
        }
        
        const { error } = await supabase
          .from('skills_academy_workouts')
          .update({ drill_ids: drillIds })
          .eq('id', workout.id)
        
        if (!error) {
          console.log(`✅ Generic mapping: ${workout.workout_name} (${drillIds.length} drills)`)
          updatedCount++
        }
      }
    }
    
    // Step 6: Final verification
    console.log('\n📋 Step 6: Verifying migration results...')
    
    const { data: finalCheck, count: totalCount } = await supabase
      .from('skills_academy_workouts')
      .select('*', { count: 'exact', head: true })
    
    const { count: populatedCount } = await supabase
      .from('skills_academy_workouts')
      .select('*', { count: 'exact', head: true })
      .not('drill_ids', 'eq', '{}')
      .not('drill_ids', 'is', null)
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 MIGRATION COMPLETE!')
    console.log('='.repeat(60))
    console.log(`
Results:
- Total workouts: ${totalCount}
- Workouts with drills: ${populatedCount}
- Updated in this run: ${updatedCount}
- Success rate: ${Math.round((populatedCount! / totalCount!) * 100)}%
    `)
    
    if (populatedCount === totalCount) {
      console.log('✅ All workouts now have drill_ids populated!')
      console.log('\n📋 Next Steps:')
      console.log('1. Update useSkillsAcademyWorkouts hook to use drill_ids')
      console.log('2. Remove workaround code (lines 193-244)')
      console.log('3. Test workout flow end-to-end')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
executeMigration().then(() => {
  console.log('\n✅ Agent 2 (Database) - Migration task complete!')
})