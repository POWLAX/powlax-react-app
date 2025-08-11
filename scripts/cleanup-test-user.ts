import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupUser() {
  const email = 'chaplalacrosse22@gmail.com';
  
  console.log('🧹 Cleaning up test user:', email);
  
  try {
    // Delete from users table
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('email', email);
    
    if (deleteUserError) {
      console.log('⚠️ Could not delete from users table:', deleteUserError.message);
    } else {
      console.log('✅ Deleted from users table');
    }
    
    // Delete from auth.users
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError) {
      const authUser = authUsers?.users?.find(u => u.email === email);
      if (authUser) {
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(authUser.id);
        if (deleteAuthError) {
          console.log('⚠️ Could not delete auth user:', deleteAuthError.message);
        } else {
          console.log('✅ Deleted from auth.users');
        }
      } else {
        console.log('ℹ️ No auth user found');
      }
    }
    
    console.log('🧹 Cleanup complete');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

cleanupUser();