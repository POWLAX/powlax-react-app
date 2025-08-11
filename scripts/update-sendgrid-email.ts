import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateSendGridEmail() {
  console.log('\n' + '='.repeat(70));
  console.log('📧 UPDATE SENDGRID FROM EMAIL');
  console.log('='.repeat(70));
  
  console.log('\n🔍 Current Configuration:');
  console.log('From Email: team@powlax.com');
  console.log('Status: NOT VERIFIED in SendGrid');
  
  console.log('\n📋 To fix this, you need to either:');
  console.log('1. Verify "team@powlax.com" in SendGrid');
  console.log('2. Use a different verified email address');
  
  console.log('\n💡 Common verified emails:');
  console.log('- Your personal email (e.g., chaplalacrosse22@gmail.com)');
  console.log('- A company email you control');
  console.log('- Any email you verified in SendGrid');
  
  const newEmail = await question('\n✏️  Enter the email address you verified in SendGrid: ');
  
  if (!newEmail || !newEmail.includes('@')) {
    console.log('❌ Invalid email address');
    rl.close();
    return;
  }
  
  // Read current .env.local
  const envPath = path.resolve(__dirname, '../.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Update SENDGRID_FROM_EMAIL
  const oldLine = 'SENDGRID_FROM_EMAIL=team@powlax.com';
  const newLine = `SENDGRID_FROM_EMAIL=${newEmail}`;
  
  if (envContent.includes(oldLine)) {
    envContent = envContent.replace(oldLine, newLine);
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ SUCCESS! Updated .env.local');
    console.log(`Changed from: team@powlax.com`);
    console.log(`Changed to: ${newEmail}`);
    
    console.log('\n📋 Next steps:');
    console.log('1. Restart your dev server (Ctrl+C then npm run dev)');
    console.log('2. Test sending email:');
    console.log('   npx tsx scripts/test-sendgrid-debug.ts');
  } else {
    console.log('\n⚠️  Could not find SENDGRID_FROM_EMAIL in .env.local');
    console.log('Please manually update your .env.local file:');
    console.log(`SENDGRID_FROM_EMAIL=${newEmail}`);
  }
  
  rl.close();
}

updateSendGridEmail();