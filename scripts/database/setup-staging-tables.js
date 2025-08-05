const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_staging_tables.sql')
    const sql = await fs.readFile(migrationPath, 'utf8')
    
    console.log('Running migration...')
    // Note: For production, you'd use Supabase migrations
    // This is a simplified version for quick setup
    console.log('Migration SQL loaded. Please run this in your Supabase SQL editor:')
    console.log('https://supabase.com/dashboard/project/avvpyjwytcmtoiyrbibb/editor')
    console.log('\n--- COPY SQL BELOW ---\n')
    console.log(sql)
    console.log('\n--- END SQL ---\n')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

runMigration()