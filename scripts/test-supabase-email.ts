import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseEmail() {
  const email = 'chaplalacrosse22@gmail.com';
  
  console.log('\n' + '='.repeat(70));
  console.log('📧 Testing Supabase Email (Using Built-in Auth Emails)');
  console.log('='.repeat(70));
  console.log('\nEmail:', email);
  
  try {
    // Use Supabase's built-in OTP (magic link) functionality
    console.log('\nSending magic link via Supabase Auth...');
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard',
        shouldCreateUser: false // Don't create user if doesn't exist
      }
    });
    
    if (error) {
      console.error('❌ Error:', error.message);
      
      if (error.message.includes('Database error')) {
        console.log('\n💡 This error is due to database trigger issues.');
        console.log('The email might still be sent by Supabase.');
        console.log('\n🔧 To fix, you can:');
        console.log('1. Check your email anyway - Supabase may have sent it');
        console.log('2. Use Supabase dashboard to send a password reset email');
        console.log('3. Fix the database triggers with the SQL script');
      }
    } else {
      console.log('✅ Success! Magic link email sent via Supabase');
      console.log('\n📬 Check your email inbox for:', email);
      console.log('📨 Subject: "Magic Link for POWLAX" or similar');
      console.log('⏰ Link expires in 1 hour');
      console.log('\n💡 Note: Supabase sends from noreply@mail.app.supabase.io');
      console.log('Check your spam folder if you don\'t see it.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n' + '='.repeat(70));
}

testSupabaseEmail();