import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkActualTableStructure() {
  console.log('🔍 Checking actual user_drills table structure using SQL...')
  
  try {
    // Query the information schema to get actual column information
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_drills'
        ORDER BY ordinal_position;
      `
    })
    
    if (error) {
      console.error('❌ SQL query error:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ user_drills table columns:')
      data.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
      })
    } else {
      console.log('❌ Table user_drills not found or has no columns')
    }
    
  } catch (err) {
    console.error('💥 Error checking table structure:', err)
    
    // Fallback: Try to get structure by attempting to select with all expected columns
    console.log('\n🔄 Trying fallback method...')
    
    const { data: testData, error: testError } = await supabase
      .from('user_drills')
      .select('id, title, category, duration_minutes, content, video_url, drill_lab_url_1, user_id')
      .limit(0)
      
    if (testError) {
      console.error('❌ Fallback error:', testError.message)
      
      // Try with minimal columns that should exist
      const { data: minimalData, error: minimalError } = await supabase
        .from('user_drills')
        .select('id, title, user_id')
        .limit(0)
        
      if (minimalError) {
        console.error('❌ Even minimal select failed:', minimalError.message)
      } else {
        console.log('✅ Table exists with at least: id, title, user_id columns')
      }
    } else {
      console.log('✅ All expected columns exist in table')
    }
  }
}

checkActualTableStructure()