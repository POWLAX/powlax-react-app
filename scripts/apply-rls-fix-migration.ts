import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyRLSFixMigration() {
  console.log('🚀 Applying RLS fix migration...')
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/119_fix_rls_for_anon_access.sql', 'utf8')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration applied successfully!')
    console.log('🔧 RLS policies updated for anon access')
    console.log('🎯 Save/Load practice plans should now work')
    
  } catch (err) {
    console.error('❌ Error applying migration:', err)
  }
}

applyRLSFixMigration()