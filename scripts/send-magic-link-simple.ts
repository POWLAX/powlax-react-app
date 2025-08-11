import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendMagicLink() {
  const email = 'chaplalacrosse22@gmail.com';
  
  console.log('📧 Sending magic link to:', email);
  console.log('🔗 Redirect URL: http://localhost:3000/dashboard');
  
  try {
    // Use the regular signInWithOtp method which should handle everything
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard',
        shouldCreateUser: true,
        data: {
          display_name: 'your_player',
          role: 'player'
        }
      }
    });
    
    if (error) {
      console.error('❌ Error sending magic link:', error);
      return;
    }
    
    console.log('✅ Magic link request sent successfully!');
    console.log('📬 Check your email inbox at:', email);
    console.log('📱 The email will contain a link to log in');
    console.log('🔄 After clicking the link, you will be redirected to: http://localhost:3000/dashboard');
    console.log('\n⏰ The link expires in 1 hour');
    console.log('\n💡 Note: The email may take a few moments to arrive');
    console.log('📂 Check your spam folder if you don\'t see it in your inbox');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

sendMagicLink();