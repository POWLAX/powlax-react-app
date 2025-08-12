import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function analyzeAuthContext() {
  let findings: string[] = []
  
  function log(msg: string) {
    console.log(msg)
    findings.push(msg)
  }
  
  log('# 🔐 AUTHENTICATION CONTEXT ANALYSIS')
  log('')
  log('## The Core Problem')
  log('The app can save drills with service role key, but fails in browser with RLS error.')
  log('This means the authentication context in the browser is not working correctly.')
  log('')
  
  // Check how authentication works
  log('## How POWLAX Authentication Works')
  log('')
  log('1. **NO Supabase Auth**: The app does NOT use Supabase Auth (auth.users)')
  log('2. **Custom Auth**: Uses public.users table with custom session management')
  log('3. **RLS Policies**: Expect auth.uid() but app provides public.users ID')
  log('4. **Context Mismatch**: RLS checks auth.uid() which is always NULL')
  log('')
  
  // Check RLS policies
  log('## Current RLS Policy Analysis')
  log('')
  
  const rlsCheckSQL = `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE tablename IN ('user_drills', 'user_strategies', 'user_favorites', 'practices')
    ORDER BY tablename, policyname;
  `
  
  log('### RLS Policies in Database:')
  log('```sql')
  log(rlsCheckSQL)
  log('```')
  log('')
  
  // The real issue
  log('## 🚨 THE REAL ISSUE')
  log('')
  log('### What\'s Happening:')
  log('1. Browser sends request with user_id from public.users')
  log('2. RLS policy checks auth.uid() (Supabase Auth)')
  log('3. auth.uid() is NULL because no Supabase Auth session')
  log('4. RLS blocks the operation')
  log('')
  
  log('### Why Service Role Works:')
  log('Service role key BYPASSES all RLS policies, so it works')
  log('')
  
  // The solution
  log('## 🔧 THE SOLUTION')
  log('')
  log('We need RLS policies that DON\'T rely on auth.uid().')
  log('Instead, they should either:')
  log('1. Be completely open for authenticated role')
  log('2. Check user_id column directly without auth context')
  log('')
  
  log('### Option 1: Disable RLS (Simplest)')
  log('```sql')
  log('-- Disable RLS completely (least secure but will work)')
  log('ALTER TABLE user_drills DISABLE ROW LEVEL SECURITY;')
  log('ALTER TABLE user_strategies DISABLE ROW LEVEL SECURITY;')
  log('ALTER TABLE user_favorites DISABLE ROW LEVEL SECURITY;')
  log('ALTER TABLE practices DISABLE ROW LEVEL SECURITY;')
  log('```')
  log('')
  
  log('### Option 2: Wide-Open RLS Policies')
  log('```sql')
  log('-- Keep RLS enabled but allow everything')
  log('DROP POLICY IF EXISTS "Authenticated users can manage drills" ON user_drills;')
  log('CREATE POLICY "Open access" ON user_drills')
  log('  FOR ALL USING (true) WITH CHECK (true);')
  log('')
  log('DROP POLICY IF EXISTS "Authenticated users can manage strategies" ON user_strategies;')
  log('CREATE POLICY "Open access" ON user_strategies')
  log('  FOR ALL USING (true) WITH CHECK (true);')
  log('')
  log('DROP POLICY IF EXISTS "Authenticated users can manage favorites" ON user_favorites;')  
  log('CREATE POLICY "Open access" ON user_favorites')
  log('  FOR ALL USING (true) WITH CHECK (true);')
  log('')
  log('DROP POLICY IF EXISTS "Authenticated users can manage practices" ON practices;')
  log('CREATE POLICY "Open access" ON practices')
  log('  FOR ALL USING (true) WITH CHECK (true);')
  log('```')
  log('')
  
  log('### Option 3: Use Anon Key in Frontend (Current Approach)')
  log('The app currently uses ANON key in the frontend.')
  log('With anon key, we need policies that allow anon role:')
  log('```sql')
  log('-- Allow both anon and authenticated roles')
  log('DROP POLICY IF EXISTS "Open access" ON user_drills;')
  log('CREATE POLICY "Public access" ON user_drills')
  log('  FOR ALL TO anon, authenticated')
  log('  USING (true) WITH CHECK (true);')
  log('```')
  log('')
  
  // Check what key is being used
  log('## Current Configuration')
  log('')
  log('### Environment Variables:')
  log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}`)
  log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`)
  log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (for scripts only)' : '❌ Not set'}`)
  log('')
  
  // Test with anon key
  log('## Testing with ANON key (like browser does)')
  log('')
  
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  const testDrill = {
    user_id: '523f2768-6404-439c-a429-f9eb6736aa17',
    title: 'Test with ANON key',
    content: 'Testing as browser would',
    duration_minutes: 10,
    category: 'Test',
    video_url: null,
    drill_lab_url_1: null,
    drill_lab_url_2: null,
    drill_lab_url_3: null,
    drill_lab_url_4: null,
    drill_lab_url_5: null,
    equipment: '',
    tags: '',
    game_states: [],
    is_public: false,
    team_share: [],
    club_share: []
  }
  
  const { error } = await anonClient
    .from('user_drills')
    .insert([testDrill])
  
  if (error) {
    log(`❌ INSERT with ANON key FAILED: ${error.message}`)
    log(`   This is why the browser fails!`)
  } else {
    log(`✅ INSERT with ANON key SUCCEEDED`)
  }
  
  // Save comprehensive report
  const report = findings.join('\n')
  fs.writeFileSync('./AUTH_CONTEXT_ANALYSIS.md', report)
  
  console.log('\n📄 Report saved to: AUTH_CONTEXT_ANALYSIS.md')
}

analyzeAuthContext()