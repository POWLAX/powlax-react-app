import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStrategiesTable() {
  console.log('🔧 Setting up strategies table...')
  
  // Create table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS wp_strategies (
      id SERIAL PRIMARY KEY,
      strategy_id INTEGER,
      reference_id INTEGER,
      strategy_categories TEXT,
      strategy_name TEXT NOT NULL,
      lacrosse_lab_links JSONB,
      description TEXT,
      embed_codes JSONB,
      see_it_ages TEXT,
      coach_it_ages TEXT,
      own_it_ages TEXT,
      has_pdf BOOLEAN DEFAULT false,
      target_audience TEXT,
      lesson_category TEXT,
      master_pdf_url TEXT,
      vimeo_id BIGINT,
      vimeo_link TEXT,
      pdf_shortcode TEXT,
      thumbnail_urls JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  // First, let's check what tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%strateg%')
  
  console.log('Existing strategy-related tables:', tables)
  
  // Check if we can query the strategies table
  const { error: checkError, count } = await supabase
    .from('wp_strategies')
    .select('*', { count: 'exact', head: true })
  
  if (checkError) {
    console.log('Table does not exist or has issues:', checkError.message)
    console.log('Creating table...')
    
    // Try creating via direct SQL if RPC doesn't work
    // For now, we'll need to use Supabase dashboard
    console.log('\n⚠️  Please run the following SQL in Supabase SQL Editor:')
    console.log('----------------------------------------')
    console.log(createTableSQL)
    console.log('----------------------------------------')
    console.log('\nThen run the import script again.')
  } else {
    console.log(`✅ Table exists with ${count} records`)
    
    // Show sample of existing data
    const { data: sample } = await supabase
      .from('wp_strategies')
      .select('id, strategy_name, strategy_categories')
      .limit(5)
    
    if (sample && sample.length > 0) {
      console.log('\nSample existing records:')
      sample.forEach(s => console.log(`  - ${s.id}: ${s.strategy_name} (${s.strategy_categories})`))
    }
  }
}

setupStrategiesTable().catch(console.error)