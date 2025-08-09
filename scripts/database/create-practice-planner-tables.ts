import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function createTables() {
  console.log('🚀 Creating Practice Planner Phase 2 tables...\n')

  // Test connection first
  const { data: testData, error: testError } = await supabase
    .from('powlax_drills')
    .select('id')
    .limit(1)
  
  if (testError) {
    console.error('❌ Cannot connect to database:', testError.message)
    return
  }

  console.log('✅ Database connection successful\n')
  
  // Since we can't run raw SQL through the client, we need to use the Supabase dashboard
  console.log('📋 MANUAL STEPS REQUIRED:')
  console.log('════════════════════════════════════════════════════════════════')
  console.log('')
  console.log('1. Go to your Supabase Dashboard')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Copy and run the migration file:')
  console.log('   supabase/migrations/20250109_create_practice_planner_tables.sql')
  console.log('')
  console.log('This will create the following tables:')
  console.log('  ✓ powlax_images - Image storage for drills/strategies')
  console.log('  ✓ practice_plans - Save practice plans with full timeline')
  console.log('  ✓ practice_plan_drills - Junction table for drill instances')
  console.log('  ✓ practice_templates - Pre-built templates by age group')
  console.log('')
  console.log('════════════════════════════════════════════════════════════════')
  console.log('')
  console.log('After creating the tables, run:')
  console.log('  npm run db:verify-practice-tables')
  console.log('')
  
  // Let's at least verify what tables currently exist
  console.log('📊 Current practice-related tables:')
  
  const tablesToCheck = [
    'practice_plans',
    'practice_plan_drills', 
    'practice_templates',
    'powlax_images'
  ]
  
  for (const table of tablesToCheck) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1)
    
    if (error?.code === '42P01') {
      console.log(`  ❌ ${table} - Does not exist`)
    } else {
      console.log(`  ✅ ${table} - Exists`)
    }
  }
}

createTables()