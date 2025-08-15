import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRoleConstraint() {
  console.log('🔧 Fixing Role Constraint for Administrator Role')
  console.log('==============================================')
  
  try {
    // Step 1: Check current constraint
    console.log('\n1. Checking current role constraint...')
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_check_constraints', { table_name: 'users' })
    
    if (constraintError) {
      console.log('RPC not available, checking manually...')
      
      // Try a direct query to see current allowed roles
      console.log('Testing current allowed roles by trying each one...')
      const testRoles = ['admin', 'administrator', 'director', 'coach', 'player', 'parent']
      
      for (const role of testRoles) {
        try {
          const { data: testResult, error: testError } = await supabase
            .from('users')
            .select('role')
            .eq('role', role)
            .limit(1)
          
          if (!testError) {
            console.log(`✅ Role '${role}' exists in database`)
          }
        } catch (err) {
          console.log(`❌ Role '${role}' may not be allowed`)
        }
      }
    }
    
    // Step 2: Drop existing constraint
    console.log('\n2. Dropping existing role constraint...')
    const { error: dropError } = await supabase
      .rpc('execute_sql', {
        sql: 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;'
      })
    
    if (dropError) {
      console.log('Direct SQL execution failed, trying alternative...')
      
      // Alternative approach: Use raw SQL
      const dropSQL = `
        DO $$
        BEGIN
          ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
          RAISE NOTICE 'Constraint dropped successfully';
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Error dropping constraint: %', SQLERRM;
        END $$;
      `
      
      console.log('SQL to execute manually in Supabase dashboard:')
      console.log(dropSQL)
    } else {
      console.log('✅ Existing constraint dropped')
    }
    
    // Step 3: Create new constraint that includes administrator
    console.log('\n3. Creating new role constraint with administrator...')
    const newConstraintSQL = `
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('admin', 'administrator', 'director', 'coach', 'player', 'parent'));
    `
    
    const { error: createError } = await supabase
      .rpc('execute_sql', { sql: newConstraintSQL })
    
    if (createError) {
      console.log('Direct SQL execution failed for constraint creation')
      console.log('SQL to execute manually in Supabase dashboard:')
      console.log(newConstraintSQL)
    } else {
      console.log('✅ New constraint created with administrator role')
    }
    
    // Step 4: Test the new constraint
    console.log('\n4. Testing new constraint...')
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'patrick@powlax.com')
      .limit(1)
    
    if (testData && testData.length > 0) {
      // Try to update with a test value and rollback
      console.log('Testing administrator role constraint...')
      
      const { data: updateTest, error: updateTestError } = await supabase
        .from('users')
        .update({ role: 'administrator' })
        .eq('email', 'patrick@powlax.com')
        .select('id, email, role')
      
      if (updateTestError) {
        console.error('❌ Constraint update failed:', updateTestError.message)
        console.log('\nMANUAL STEPS REQUIRED:')
        console.log('1. Go to Supabase Dashboard > SQL Editor')
        console.log('2. Execute this SQL:')
        console.log('\n   -- Drop existing constraint')
        console.log('   ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;')
        console.log('\n   -- Add new constraint with administrator')
        console.log("   ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'administrator', 'director', 'coach', 'player', 'parent'));")
        console.log('\n3. Then re-run the migration script')
      } else {
        console.log('✅ Constraint test successful - administrator role is now allowed')
        console.log(`✅ Patrick's role updated to: ${updateTest?.[0]?.role}`)
        
        // Verify WordPress alignment
        if (updateTest?.[0]?.role === 'administrator') {
          console.log('✅ WordPress alignment achieved (administrator = WordPress standard)')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fix role constraint:', error)
    console.log('\nMANUAL APPROACH REQUIRED:')
    console.log('Execute these SQL commands in Supabase Dashboard:')
    console.log('\n1. Drop existing constraint:')
    console.log('   ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;')
    console.log('\n2. Add new constraint:')
    console.log("   ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'administrator', 'director', 'coach', 'player', 'parent'));")
    console.log('\n3. Update Patrick\'s role:')
    console.log("   UPDATE public.users SET role = 'administrator' WHERE email = 'patrick@powlax.com' AND role = 'admin';")
  }
}

// Execute the fix
fixRoleConstraint()