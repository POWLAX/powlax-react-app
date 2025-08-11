import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function sendMagicLinkViaAPI() {
  const email = 'chaplalacrosse22@gmail.com';
  
  console.log('\n' + '='.repeat(70));
  console.log('📧 SENDING MAGIC LINK VIA API');
  console.log('='.repeat(70));
  console.log('\nTarget email:', email);
  console.log('API endpoint: http://localhost:3000/api/auth/magic-link');
  
  try {
    console.log('\nSending POST request...');
    
    const response = await fetch('http://localhost:3000/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        create_if_not_exists: true
      })
    });
    
    const result = await response.json();
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('Message:', result.message);
      if (result.debug) {
        console.log('Debug URL:', result.debug);
      }
      console.log('\n📬 Check your email inbox for:', email);
      console.log('📧 From: team@powlax.com');
      console.log('📨 Subject: "Your POWLAX Login Link"');
    } else {
      console.log('\n❌ FAILED');
      console.log('Error:', result.error);
      
      if (result.error?.includes('from address')) {
        console.log('\n🔧 SENDER VERIFICATION ISSUE');
        console.log('The email address "team@powlax.com" is not verified in SendGrid.');
        console.log('\nPossible solutions:');
        console.log('1. Verify the exact email in SendGrid dashboard');
        console.log('2. Or update SENDGRID_FROM_EMAIL in .env.local to match what you verified');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Network error:', error);
    console.log('\nMake sure the dev server is running:');
    console.log('npm run dev');
  }
  
  console.log('\n' + '='.repeat(70));
}

sendMagicLinkViaAPI();