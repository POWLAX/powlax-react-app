#!/usr/bin/env npx tsx
/**
 * Add drill_ids column to skills_academy_workouts table
 * This must run before populating the drill-workout mappings
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

async function addDrillIdsColumn() {
  console.log('🔧 Adding drill_ids column to skills_academy_workouts...\n')
  
  try {
    // SQL to add the column if it doesn't exist
    const sql = `
      DO $$
      BEGIN
        -- Check if the column already exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'skills_academy_workouts' 
          AND column_name = 'drill_ids'
        ) THEN
          ALTER TABLE skills_academy_workouts 
          ADD COLUMN drill_ids INTEGER[] DEFAULT '{}';
          
          RAISE NOTICE 'Added drill_ids array column to skills_academy_workouts';
        ELSE
          RAISE NOTICE 'drill_ids column already exists in skills_academy_workouts';
        END IF;
      END$$;

      -- Add index for drill_ids array column for better query performance
      CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
      ON skills_academy_workouts USING gin(drill_ids);

      -- Add comment for documentation
      COMMENT ON COLUMN skills_academy_workouts.drill_ids IS 'Array of skills_academy_drills.id values that make up this workout';
    `
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sql 
    }).single()
    
    if (error) {
      // Try alternative approach - direct column add
      console.log('Direct RPC failed, trying alternative approach...')
      
      // Check if column exists first
      const { data: checkData } = await supabase
        .from('skills_academy_workouts')
        .select('*')
        .limit(1)
      
      if (checkData && checkData.length > 0 && !('drill_ids' in checkData[0])) {
        console.log('❌ Cannot add column via Supabase client directly.')
        console.log('\n📝 Please run this SQL in Supabase SQL Editor:')
        console.log('-'.repeat(60))
        console.log(`
ALTER TABLE skills_academy_workouts 
ADD COLUMN drill_ids INTEGER[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_skills_academy_workouts_drill_ids 
ON skills_academy_workouts USING gin(drill_ids);

COMMENT ON COLUMN skills_academy_workouts.drill_ids IS 
'Array of skills_academy_drills.id values that make up this workout';
        `)
        console.log('-'.repeat(60))
        return false
      } else if (checkData && 'drill_ids' in checkData[0]) {
        console.log('✅ drill_ids column already exists!')
        return true
      }
    }
    
    console.log('✅ drill_ids column added successfully!')
    
    // Verify the column was added
    const { data: verify } = await supabase
      .from('skills_academy_workouts')
      .select('id, workout_name, drill_ids')
      .limit(1)
    
    if (verify && 'drill_ids' in verify[0]) {
      console.log('✅ Verified: drill_ids column exists and is accessible')
      return true
    }
    
  } catch (error) {
    console.error('❌ Error adding column:', error)
    return false
  }
}

// Run the migration
addDrillIdsColumn().then((success) => {
  if (success) {
    console.log('\n✅ Column added! Ready to populate drill-workout mappings.')
  } else {
    console.log('\n⚠️  Column not added. Please add manually in Supabase.')
  }
})