import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function fixUserTablesForeignKeys() {
  console.log('🔧 Fixing User Tables Foreign Key Issues\n')
  console.log('The problem: user_drills and user_strategies have user_id that references auth.users, but we use public.users\n')
  
  // Generate SQL to fix both tables
  const fixSQL = `
-- =====================================================
-- FIX USER_DRILLS AND USER_STRATEGIES FOREIGN KEYS
-- =====================================================
-- The issue: user_id references auth.users(id) but we're using public.users(id)
-- Solution: Change the foreign key to reference public.users(id) instead

-- Step 1: Fix user_drills table
ALTER TABLE user_drills 
DROP CONSTRAINT IF EXISTS user_drills_user_id_fkey;

ALTER TABLE user_drills
ADD CONSTRAINT user_drills_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- Step 2: Fix user_strategies table  
ALTER TABLE user_strategies
DROP CONSTRAINT IF EXISTS user_strategies_user_id_fkey;

ALTER TABLE user_strategies
ADD CONSTRAINT user_strategies_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Step 3: Fix user_favorites table (if it has the same issue)
ALTER TABLE user_favorites
DROP CONSTRAINT IF EXISTS user_favorites_user_id_fkey;

ALTER TABLE user_favorites
ADD CONSTRAINT user_favorites_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Step 4: Update RLS policies for user_drills
DROP POLICY IF EXISTS "Users can manage their own drills" ON user_drills;

CREATE POLICY "Users can manage their own drills" ON user_drills
    FOR ALL 
    TO authenticated 
    USING (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    );

-- Step 5: Update RLS policies for user_strategies
DROP POLICY IF EXISTS "Users can manage their own strategies" ON user_strategies;

CREATE POLICY "Users can manage their own strategies" ON user_strategies
    FOR ALL 
    TO authenticated 
    USING (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    );

-- Step 6: Update RLS policies for user_favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL 
    TO authenticated 
    USING (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      user_id IN (
        SELECT id FROM public.users 
        WHERE auth_user_id = auth.uid()
      )
    );

-- Enable RLS on all tables
ALTER TABLE user_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;  
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON user_drills TO authenticated;
GRANT ALL ON user_strategies TO authenticated;
GRANT ALL ON user_favorites TO authenticated;

-- Verify the changes
SELECT 
  'User tables foreign keys updated successfully!' as message,
  'user_drills, user_strategies, and user_favorites now reference public.users(id)' as detail1,
  'RLS policies updated to work with public.users' as detail2;
`
  
  console.log('📋 SQL MIGRATION TO FIX USER TABLES:')
  console.log('=====================================')
  console.log(fixSQL)
  console.log('\n=====================================')
  console.log('📌 TO FIX THE ISSUE:')
  console.log('1. Copy the SQL above')
  console.log('2. Go to Supabase Dashboard > SQL Editor')
  console.log('3. Paste and run the SQL')
  console.log('4. Test creating custom drills and strategies again')
  console.log('\nThis will fix the foreign keys to reference public.users instead of auth.users')
  
  // Also save to a migration file
  const fs = require('fs')
  const migrationPath = './supabase/migrations/115_fix_user_tables_foreign_keys.sql'
  
  fs.writeFileSync(migrationPath, fixSQL)
  console.log(`\n✅ Migration saved to: ${migrationPath}`)
  console.log('You can also run this migration file in Supabase Dashboard')
}

fixUserTablesForeignKeys()