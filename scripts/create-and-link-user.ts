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

async function createUserAndGenerateLink() {
  const email = 'chaplalacrosse22@gmail.com';
  const username = 'your_player';
  
  console.log('📧 Setting up user:', email);
  
  try {
    // Step 1: Create auth user without metadata
    console.log('1. Creating auth user...');
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true
    });
    
    if (createError) {
      console.error('❌ Error creating auth user:', createError);
      console.log('\nTrying to generate link for existing user...');
    } else {
      console.log('✅ Auth user created:', authUser.user?.id);
      
      // Step 2: Create corresponding record in users table
      if (authUser.user) {
        console.log('2. Creating users table record...');
        const { error: userError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authUser.user.id,
            email,
            display_name: username,
            role: 'player',
            account_type: 'individual',
            roles: ['player']
          });
        
        if (userError && userError.code !== '23505') {
          console.warn('⚠️ Warning creating users record:', userError.message);
        } else {
          console.log('✅ Users table record created');
        }
      }
    }
    
    // Step 3: Generate magic link
    console.log('3. Generating magic link...');
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'http://localhost:3000/dashboard'
      }
    });
    
    if (linkError) {
      console.error('❌ Error generating magic link:', linkError);
      return;
    }
    
    if (!linkData?.properties?.action_link) {
      console.error('❌ No magic link generated');
      return;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ SUCCESS! Magic link generated');
    console.log('='.repeat(70));
    console.log('\n📬 Email:', email);
    console.log('👤 Username:', username);
    console.log('\n🔗 MAGIC LINK URL:');
    console.log('-'.repeat(70));
    console.log(linkData.properties.action_link);
    console.log('-'.repeat(70));
    console.log('\n📋 How to use:');
    console.log('1. Copy the entire URL above');
    console.log('2. Paste it into your browser');
    console.log('3. You will be logged in automatically');
    console.log('4. Redirected to: http://localhost:3000/dashboard');
    console.log('\n⏰ Link expires in: 1 hour');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createUserAndGenerateLink();