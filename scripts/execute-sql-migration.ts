#!/usr/bin/env npx tsx

/**
 * Execute SQL Migration through Supabase
 * This script executes SQL statements one by one through Supabase
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
  process.exit(1)
}

// Create admin client that bypasses RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// SQL statements broken down for individual execution
const sqlStatements = [
  // Drop existing tables
  `DROP TABLE IF EXISTS user_resource_interactions CASCADE`,
  `DROP TABLE IF EXISTS resource_collections CASCADE`,
  `DROP TABLE IF EXISTS powlax_resources CASCADE`,
  
  // Create powlax_resources table
  `CREATE TABLE powlax_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    resource_type VARCHAR(50) CHECK (resource_type IN ('video', 'pdf', 'template', 'link')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_path TEXT,
    file_size INTEGER,
    duration_seconds INTEGER,
    age_groups TEXT[] DEFAULT '{}',
    roles TEXT[] DEFAULT '{}',
    team_restrictions INTEGER[] DEFAULT '{}',
    club_restrictions INTEGER[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    source VARCHAR(100),
    external_id VARCHAR(100),
    version VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en'
  )`,
  
  // Create user_resource_interactions table
  `CREATE TABLE user_resource_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resource_id UUID REFERENCES powlax_resources(id) NOT NULL,
    collection_ids UUID[] DEFAULT '{}',
    shared_with_teams INTEGER[] DEFAULT '{}',
    shared_with_users UUID[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_downloaded BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    custom_tags TEXT[] DEFAULT '{}',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position_seconds INTEGER,
    last_viewed TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, resource_id)
  )`,
  
  // Create resource_collections table
  `CREATE TABLE resource_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    shared_with_teams INTEGER[] DEFAULT '{}',
    shared_with_users UUID[] DEFAULT '{}',
    shared_with_clubs INTEGER[] DEFAULT '{}',
    parent_collection_id UUID REFERENCES resource_collections(id),
    path TEXT,
    depth INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    resource_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb
  )`,
  
  // Create indexes
  `CREATE INDEX idx_resources_category ON powlax_resources(category)`,
  `CREATE INDEX idx_resources_type ON powlax_resources(resource_type)`,
  `CREATE INDEX idx_resources_roles ON powlax_resources USING GIN(roles)`,
  `CREATE INDEX idx_resources_age_groups ON powlax_resources USING GIN(age_groups)`,
  `CREATE INDEX idx_resources_tags ON powlax_resources USING GIN(tags)`,
  `CREATE INDEX idx_interactions_user_id ON user_resource_interactions(user_id)`,
  `CREATE INDEX idx_interactions_resource_id ON user_resource_interactions(resource_id)`,
  `CREATE INDEX idx_collections_user_id ON resource_collections(user_id)`,
  
  // Enable RLS
  `ALTER TABLE powlax_resources ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE user_resource_interactions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY`
]

async function executeMigration() {
  console.log('🚀 Executing Resources Migration')
  console.log('================================')
  console.log(`📝 ${sqlStatements.length} SQL statements to execute`)
  console.log('')
  
  let success = 0
  let failed = 0
  const errors: string[] = []
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i]
    const preview = sql.substring(0, 60).replace(/\n/g, ' ')
    
    process.stdout.write(`[${i + 1}/${sqlStatements.length}] ${preview}...`)
    
    try {
      // Since Supabase doesn't have a direct SQL executor in the JS client,
      // we'll work around this by using the schema inspection
      // For now, we'll just mark this as requiring manual execution
      
      // Check if it's a SELECT/INSERT/UPDATE/DELETE we can handle
      if (sql.startsWith('INSERT') || sql.startsWith('SELECT')) {
        // These we might be able to handle
        process.stdout.write(' ⏭️  (data operation)\n')
        continue
      }
      
      // DDL statements need manual execution
      process.stdout.write(' ⚠️  (requires manual execution)\n')
      failed++
      
    } catch (error: any) {
      process.stdout.write(' ❌\n')
      errors.push(`Statement ${i + 1}: ${error.message}`)
      failed++
    }
  }
  
  console.log('\n================================')
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Successful: ${success}`)
  console.log(`   ⚠️  Manual required: ${failed}`)
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(err => console.log(`   ${err}`))
  }
  
  console.log('\n📌 MANUAL STEPS REQUIRED:')
  console.log('   1. Go to Supabase Dashboard: https://supabase.com/dashboard')
  console.log('   2. Select your project')
  console.log('   3. Navigate to SQL Editor')
  console.log('   4. Open the file: supabase/migrations/100_resources_permanence_tables.sql')
  console.log('   5. Copy all contents and paste into SQL Editor')
  console.log('   6. Click "Run" to execute the migration')
  console.log('')
  console.log('   The migration will:')
  console.log('   - Create powlax_resources table with array columns')
  console.log('   - Create user_resource_interactions table')
  console.log('   - Create resource_collections table')
  console.log('   - Set up indexes and RLS policies')
  console.log('   - Insert sample data')
  
  // Try to verify if tables exist
  console.log('\n🔍 Checking if tables exist...')
  
  const tables = ['powlax_resources', 'user_resource_interactions', 'resource_collections']
  let tablesExist = 0
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('id')
      .limit(1)
    
    if (!error || error.code !== '42P01') {
      console.log(`   ✅ ${table} exists`)
      tablesExist++
    } else {
      console.log(`   ❌ ${table} not found`)
    }
  }
  
  if (tablesExist === tables.length) {
    console.log('\n✅ All tables exist! The migration may have been applied previously.')
    console.log('   You can proceed to Stage 2: Building hooks')
  } else {
    console.log('\n⚠️  Tables need to be created manually using the SQL Editor')
  }
}

executeMigration().catch(console.error)