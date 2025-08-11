import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function sendMagicLink() {
  const email = 'chaplalacrosse22@gmail.com';
  const username = 'your_player';
  
  console.log('📧 Preparing to send magic link to:', email);
  console.log('👤 Username:', username);
  
  try {
    // First check if auth user exists
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing auth users:', listError);
      return;
    }
    
    const existingAuthUser = authUsers?.users?.find(u => u.email === email);
    
    // Create auth user if doesn't exist
    if (!existingAuthUser) {
      console.log('Creating auth user...');
      const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          display_name: username,
          role: 'player'
        }
      });
      
      if (createAuthError) {
        console.error('❌ Error creating auth user:', createAuthError);
        return;
      }
      
      console.log('✅ Auth user created:', newAuthUser.user?.id);
      
      // Now create corresponding users table entry
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          auth_user_id: newAuthUser.user?.id,
          email,
          display_name: username,
          role: 'player',
          account_type: 'individual',
          roles: ['player']
        });
      
      if (createUserError && createUserError.code !== '23505') { // Ignore duplicate key errors
        console.error('⚠️ Warning creating users table entry:', createUserError);
      }
    } else {
      console.log('✅ Auth user already exists:', existingAuthUser.id);
    }
    
    // Generate magic link using Supabase Auth
    console.log('Generating magic link...');
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    });
    
    if (error) {
      console.error('❌ Error generating magic link:', error);
      return;
    }
    
    if (!data || !data.properties?.action_link) {
      console.error('❌ No magic link generated');
      return;
    }
    
    console.log('✅ Magic link generated successfully!');
    console.log('📬 Email:', email);
    console.log('🔗 Magic Link (valid for 1 hour):');
    console.log(data.properties.action_link);
    console.log('\n📋 To use this link:');
    console.log('1. Copy the link above');
    console.log('2. Open it in a browser');
    console.log('3. You will be logged in as:', username);
    console.log('4. Redirected to: http://localhost:3000/dashboard');
    
    // Also create a record in magic_links table for tracking
    const { error: linkError } = await supabase
      .from('magic_links')
      .insert({
        email,
        token: data.properties.action_link.split('token=')[1]?.split('&')[0] || crypto.randomUUID(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        used: false
      });
    
    if (linkError) {
      console.warn('⚠️ Could not track magic link in database:', linkError);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

sendMagicLink();