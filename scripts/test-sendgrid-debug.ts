import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function debugSendGrid() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 SENDGRID CONFIGURATION DEBUGGER');
  console.log('='.repeat(70));

  // Step 1: Check environment variables
  console.log('\n1️⃣ ENVIRONMENT VARIABLES CHECK:');
  console.log('-'.repeat(40));
  
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'team@powlax.com';
  const fromName = process.env.SENDGRID_FROM_NAME || 'POWLAX Team';
  const replyTo = process.env.SENDGRID_REPLY_TO || 'support@powlax.com';
  
  console.log('✅ SENDGRID_API_KEY:', apiKey ? `Set (${apiKey.length} chars)` : '❌ MISSING');
  console.log('✅ SENDGRID_FROM_EMAIL:', fromEmail);
  console.log('✅ SENDGRID_FROM_NAME:', fromName);
  console.log('✅ SENDGRID_REPLY_TO:', replyTo);
  
  if (!apiKey) {
    console.error('\n❌ SENDGRID_API_KEY is missing!');
    console.log('Add it to your .env.local file:');
    console.log('SENDGRID_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Step 2: Initialize SendGrid
  console.log('\n2️⃣ INITIALIZING SENDGRID:');
  console.log('-'.repeat(40));
  
  try {
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize SendGrid:', error);
    process.exit(1);
  }

  // Step 3: Test sending an email
  console.log('\n3️⃣ SENDING TEST EMAIL:');
  console.log('-'.repeat(40));
  
  const testEmail = 'chaplalacrosse22@gmail.com';
  const magicLinkUrl = 'http://localhost:3000/dashboard?test=true';
  
  const msg = {
    to: testEmail,
    from: {
      email: fromEmail,
      name: fromName
    },
    replyTo: replyTo,
    subject: '🧪 POWLAX Test Email - SendGrid Configuration',
    text: `This is a test email from POWLAX. If you receive this, SendGrid is working!\n\nTest Magic Link: ${magicLinkUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003366;">🧪 SendGrid Test Successful!</h1>
        <p>If you're reading this, your SendGrid configuration is working correctly.</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #003366;">Configuration Details:</h3>
          <ul>
            <li>From: ${fromEmail}</li>
            <li>From Name: ${fromName}</li>
            <li>Reply To: ${replyTo}</li>
          </ul>
        </div>
        <p>Test Magic Link:</p>
        <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px;">Test Link</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This is a test email from POWLAX development environment.</p>
      </div>
    `
  };
  
  console.log('📧 Sending to:', testEmail);
  console.log('📨 From:', fromEmail);
  
  try {
    const response = await sgMail.send(msg);
    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('Status Code:', response[0].statusCode);
    console.log('Request ID:', response[0].headers['x-message-id']);
    console.log('\n📬 Check the inbox for:', testEmail);
    console.log('📧 Subject: "🧪 POWLAX Test Email - SendGrid Configuration"');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SENDGRID IS FULLY CONFIGURED AND WORKING!');
    console.log('='.repeat(70));
    console.log('\n✅ Next Steps:');
    console.log('1. Check your email inbox');
    console.log('2. Try the magic link flow in the app');
    console.log('3. Emails should now work from the AuthModal');
    
  } catch (error: any) {
    console.error('\n❌ FAILED TO SEND EMAIL');
    console.log('-'.repeat(40));
    
    if (error.response) {
      const { statusCode, body } = error.response;
      console.error('Status Code:', statusCode);
      console.error('Error Body:', JSON.stringify(body, null, 2));
      
      // Specific error handling
      if (statusCode === 403) {
        console.log('\n🔧 FIX REQUIRED: Sender Authentication');
        console.log('='.repeat(50));
        console.log('\n📋 Steps to fix:');
        console.log('1. Go to: https://app.sendgrid.com/');
        console.log('2. Navigate to: Settings → Sender Authentication');
        console.log('3. Click: "Verify a Single Sender"');
        console.log('4. Add email:', fromEmail);
        console.log('5. Check email and click verification link');
        console.log('6. Run this script again');
        
        console.log('\n💡 Alternative: Authenticate entire domain');
        console.log('1. Settings → Sender Authentication → Authenticate Domain');
        console.log('2. Add domain: powlax.com');
        console.log('3. Add DNS records as instructed');
      } else if (statusCode === 401) {
        console.log('\n🔧 FIX REQUIRED: Invalid API Key');
        console.log('Check your SENDGRID_API_KEY in .env.local');
        console.log('Generate a new key at: https://app.sendgrid.com/settings/api_keys');
      } else if (statusCode === 413) {
        console.log('\n🔧 FIX REQUIRED: Email too large');
        console.log('Reduce email content size');
      }
    } else {
      console.error('Error:', error.message || error);
    }
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run the debugger
debugSendGrid().catch(console.error);