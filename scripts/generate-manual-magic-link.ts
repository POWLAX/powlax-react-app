import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function generateManualMagicLink() {
  const email = 'chaplalacrosse22@gmail.com';
  const username = 'your_player';
  
  console.log('\n' + '='.repeat(70));
  console.log('🔗 MANUAL MAGIC LINK GENERATOR');
  console.log('='.repeat(70));
  
  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    process.exit(1);
  }
  
  // Generate a manual magic link URL
  // This bypasses the database triggers by using a direct URL approach
  const baseUrl = 'http://localhost:3000';
  const authUrl = `${baseUrl}/dashboard`;
  
  // Create URLs with different authentication triggers
  const urls = {
    fromPowlax: `${authUrl}?from_powlax=true`,
    autoAuth: `${authUrl}?auto_auth=true`,
    combined: `${authUrl}?from_powlax=true&auto_auth=true&email=${encodeURIComponent(email)}`
  };
  
  console.log('\n📬 Email:', email);
  console.log('👤 Username:', username);
  
  console.log('\n📋 OPTION 1: Test Cross-Domain Authentication');
  console.log('-'.repeat(70));
  console.log('Visit this URL to simulate coming from powlax.com:');
  console.log(urls.fromPowlax);
  
  console.log('\n📋 OPTION 2: Auto-Authentication Trigger');
  console.log('-'.repeat(70));
  console.log('Visit this URL to trigger automatic auth modal:');
  console.log(urls.autoAuth);
  
  console.log('\n📋 OPTION 3: Combined with Email Pre-filled');
  console.log('-'.repeat(70));
  console.log('Visit this URL for full cross-domain simulation:');
  console.log(urls.combined);
  
  console.log('\n📋 OPTION 4: Test Page');
  console.log('-'.repeat(70));
  console.log('Visit the test page to try all scenarios:');
  console.log(`${baseUrl}/test-cross-domain`);
  
  console.log('\n💡 How it works:');
  console.log('1. The URL parameters trigger the auth modal automatically');
  console.log('2. Enter the email:', email);
  console.log('3. A real magic link will be sent to that email');
  console.log('4. Click the link in the email to complete authentication');
  
  console.log('\n⚠️  Note: Since database triggers are failing, you may need to:');
  console.log('1. Use the Supabase dashboard to manually create the user');
  console.log('2. Or fix the database trigger issue first');
  
  console.log('\n🔧 To fix the database trigger issue:');
  console.log('Run: npx tsx scripts/fix-auth-triggers.ts');
  
  console.log('='.repeat(70));
}

generateManualMagicLink();