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

async function generateMagicLink() {
  const email = 'chaplalacrosse22@gmail.com';
  const username = 'your_player';
  
  console.log('🔗 Generating magic link for:', email);
  console.log('👤 Username:', username);
  
  try {
    // Use admin API to generate a magic link directly
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: 'http://localhost:3000/dashboard',
        data: {
          display_name: username,
          role: 'player'
        }
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
    
    console.log('\n✅ Magic link generated successfully!');
    console.log('='.repeat(60));
    console.log('\n📬 Email:', email);
    console.log('👤 Username:', username);
    console.log('\n🔗 MAGIC LINK (copy this entire URL):');
    console.log('='.repeat(60));
    console.log(data.properties.action_link);
    console.log('='.repeat(60));
    console.log('\n📋 Instructions:');
    console.log('1. Copy the entire URL above');
    console.log('2. Open it in your browser');
    console.log('3. You will be automatically logged in');
    console.log('4. Redirected to: http://localhost:3000/dashboard');
    console.log('\n⏰ This link expires in 1 hour');
    
    // Store the verification link details
    const verificationToken = data.properties.action_link.split('token=')[1]?.split('&')[0];
    if (verificationToken) {
      const { error: linkError } = await supabase
        .from('magic_links')
        .insert({
          email,
          token: verificationToken.substring(0, 255), // Ensure it fits in the column
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          used: false
        });
      
      if (linkError) {
        console.warn('⚠️ Could not track in magic_links table:', linkError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

generateMagicLink();