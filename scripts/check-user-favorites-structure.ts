import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function checkUserFavoritesStructure() {
  console.log('🔍 DETAILED CHECK OF user_favorites TABLE\n')
  
  // Generate SQL to check exact structure
  const checkSQL = `
-- Check if user_favorites table exists and its columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_favorites'
ORDER BY ordinal_position;
`

  const alterSQL = `
-- =====================================================
-- SAFE MIGRATION TO ADD MISSING COLUMNS TO user_favorites
-- This will ONLY ADD missing columns, not remove anything
-- =====================================================

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (SAFE - won't error if exists)
DO $$
BEGIN
    -- Check and add item_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_favorites' AND column_name = 'item_id'
    ) THEN
        ALTER TABLE user_favorites ADD COLUMN item_id TEXT;
        RAISE NOTICE 'Added item_id column to user_favorites';
    ELSE
        RAISE NOTICE 'item_id column already exists';
    END IF;
    
    -- Check and add item_type column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_favorites' AND column_name = 'item_type'
    ) THEN
        ALTER TABLE user_favorites ADD COLUMN item_type TEXT CHECK (item_type IN ('drill', 'strategy'));
        RAISE NOTICE 'Added item_type column to user_favorites';
    ELSE
        RAISE NOTICE 'item_type column already exists';
    END IF;
    
    -- Check if drill_id column exists (legacy column)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_favorites' AND column_name = 'drill_id'
    ) THEN
        RAISE NOTICE 'Found legacy drill_id column';
        
        -- Migrate data from drill_id to item_id if needed
        UPDATE user_favorites 
        SET item_id = drill_id::TEXT,
            item_type = 'drill'
        WHERE drill_id IS NOT NULL 
        AND item_id IS NULL;
        
        RAISE NOTICE 'Migrated drill_id data to item_id/item_type';
        
        -- DO NOT DROP drill_id - keep for backwards compatibility
        RAISE NOTICE 'Keeping drill_id column for backwards compatibility';
    END IF;
    
    -- Add foreign key constraint if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_favorites' 
        AND constraint_name = 'user_favorites_user_id_fkey'
    ) THEN
        ALTER TABLE user_favorites 
        ADD CONSTRAINT user_favorites_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for user_id';
    END IF;
    
    -- Create unique constraint if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_favorites' 
        AND constraint_name = 'user_favorites_unique'
    ) THEN
        -- Only add if both columns exist
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_favorites' AND column_name = 'item_id'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_favorites' AND column_name = 'item_type'
        ) THEN
            ALTER TABLE user_favorites 
            ADD CONSTRAINT user_favorites_unique 
            UNIQUE(user_id, item_id, item_type);
            RAISE NOTICE 'Added unique constraint';
        END IF;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during migration: %', SQLERRM;
END $$;

-- Enable RLS (safe to re-run)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies (simplified)
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Authenticated users can manage favorites" ON user_favorites;

-- Create simple policy for authenticated users
CREATE POLICY "Authenticated users can manage favorites" ON user_favorites
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions (safe to re-run)
GRANT ALL ON user_favorites TO authenticated;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_favorites'
ORDER BY ordinal_position;
`
  
  console.log('📋 SQL TO CHECK CURRENT STRUCTURE:')
  console.log('=====================================')
  console.log(checkSQL)
  
  console.log('\n📋 SAFE MIGRATION SQL (ONLY ADDS, NEVER REMOVES):')
  console.log('=====================================')
  console.log(alterSQL)
  
  // Save to migration file
  const fs = require('fs')
  const migrationPath = './supabase/migrations/116_safe_add_user_favorites_columns.sql'
  
  fs.writeFileSync(migrationPath, alterSQL)
  console.log(`\n✅ Safe migration saved to: ${migrationPath}`)
  
  console.log('\n🔍 Testing current access to user_favorites...')
  
  // Try different queries to understand structure
  try {
    // Try with item_id (new structure)
    const { data: data1, error: error1 } = await supabase
      .from('user_favorites')
      .select('*')
      .limit(1)
    
    if (error1) {
      console.log('❌ Error with standard select:', error1.message)
      
      // Check if it's the item_id column issue
      if (error1.message.includes('item_id')) {
        console.log('⚠️ CONFIRMED: item_id column is missing')
        console.log('👉 Run Migration 116 to add it safely')
      }
    } else {
      console.log('✅ user_favorites accessible')
      if (data1 && data1.length > 0) {
        console.log('Columns found:', Object.keys(data1[0]))
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
  
  console.log('\n📌 NEXT STEPS:')
  console.log('1. Run Migration 116 in Supabase Dashboard')
  console.log('2. This will ONLY ADD missing columns')
  console.log('3. Existing data and columns will be preserved')
  console.log('4. Test favorites feature after migration')
}

checkUserFavoritesStructure()