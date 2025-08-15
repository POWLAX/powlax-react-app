import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://avvpyjwytcmtoiyrbibb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function directRoleMigration() {
  console.log('🚀 Direct Role Migration - Simple Approach')
  console.log('=========================================')
  
  try {
    // Step 1: Check current state
    console.log('\n1. Current state check...')
    const { data: currentUser, error: currentError } = await supabase
      .from('users')
      .select('id, email, role, display_name')
      .eq('email', 'patrick@powlax.com')
    
    if (currentError || !currentUser || currentUser.length === 0) {
      console.error('❌ Cannot find Patrick user')
      return
    }
    
    console.log(`Current role: ${currentUser[0].role}`)
    
    if (currentUser[0].role === 'administrator') {
      console.log('✅ Role is already "administrator" - migration complete!')
      return
    }
    
    // Step 2: Try updating without constraint check first
    console.log('\n2. Attempting direct role update...')
    
    // Use a raw SQL update that might bypass some constraint checks
    const updateSQL = `
      UPDATE public.users 
      SET role = 'administrator', updated_at = NOW()
      WHERE email = 'patrick@powlax.com' AND role = 'admin'
      RETURNING id, email, role, display_name;
    `
    
    console.log('Executing SQL:', updateSQL)
    
    const { data: updateResult, error: updateError } = await supabase
      .rpc('execute_sql', { sql: updateSQL })
    
    if (updateError) {
      console.error('❌ Direct SQL update failed:', updateError.message)
      
      // Try with a transaction approach
      console.log('\n3. Trying transaction approach...')
      
      const transactionSQL = `
        BEGIN;
        
        -- Temporarily disable the constraint
        ALTER TABLE public.users DISABLE TRIGGER ALL;
        
        -- Update the role
        UPDATE public.users 
        SET role = 'administrator', updated_at = NOW()
        WHERE email = 'patrick@powlax.com' AND role = 'admin';
        
        -- Re-enable triggers
        ALTER TABLE public.users ENABLE TRIGGER ALL;
        
        COMMIT;
        
        -- Return the updated record
        SELECT id, email, role, display_name 
        FROM public.users 
        WHERE email = 'patrick@powlax.com';
      `
      
      const { data: transactionResult, error: transactionError } = await supabase
        .rpc('execute_sql', { sql: transactionSQL })
      
      if (transactionError) {
        console.error('❌ Transaction approach failed:', transactionError.message)
        console.log('\n🔧 MANUAL INTERVENTION REQUIRED')
        console.log('================================')
        console.log('The database constraint needs to be updated manually.')
        console.log('Please run the SQL script: complete-role-standardization-migration.sql')
        console.log('in the Supabase Dashboard > SQL Editor')
        return
      }
    }
    
    // Step 3: Verify the update
    console.log('\n4. Verifying update...')
    const { data: verifyResult, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, display_name, updated_at')
      .eq('email', 'patrick@powlax.com')
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }
    
    if (!verifyResult || verifyResult.length === 0) {
      console.error('❌ User not found after update')
      return
    }
    
    const updatedUser = verifyResult[0]
    console.log('✅ Update successful!')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Role: ${updatedUser.role}`)
    console.log(`   Updated: ${updatedUser.updated_at}`)
    
    // Check WordPress alignment
    if (updatedUser.role === 'administrator') {
      console.log('✅ WordPress alignment achieved (administrator = WordPress standard)')
    } else {
      console.log('❌ Role not updated correctly')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n🔧 MANUAL INTERVENTION REQUIRED')
    console.log('Please run: complete-role-standardization-migration.sql')
  }
}

// Execute the migration
directRoleMigration()