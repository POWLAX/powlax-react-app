import { config } from 'dotenv';

config({ path: '.env.local' });

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

console.log('🔐 Testing WordPress Authentication...\n');
console.log('Configuration:');
console.log('- API URL:', WORDPRESS_API_URL);
console.log('- Username:', WORDPRESS_USERNAME);
console.log('- App Password:', WORDPRESS_APP_PASSWORD ? '✓ Set' : '✗ Missing');
console.log('\n---\n');

async function testAuth() {
  // Test 1: Basic Auth with App Password
  console.log('📋 Test 1: Testing Basic Auth with App Password...');
  try {
    const credentials = Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
    const response = await fetch(`${WORDPRESS_API_URL}/users/me`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ Basic Auth Success!');
      console.log('User:', {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roles: userData.roles,
      });
    } else {
      console.log('❌ Basic Auth Failed');
      const text = await response.text();
      console.log('Error:', text);
    }
  } catch (error) {
    console.log('❌ Basic Auth Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: JWT Token Endpoint
  console.log('📋 Test 2: Testing JWT Token Endpoint...');
  const jwtUrl = WORDPRESS_API_URL.replace('/wp/v2', '') + '/jwt-auth/v1/token';
  console.log('JWT URL:', jwtUrl);
  
  try {
    const response = await fetch(jwtUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: WORDPRESS_USERNAME,
        password: WORDPRESS_APP_PASSWORD,
      }),
    });

    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ JWT Endpoint exists and responded');
      console.log('Response:', data);
    } else {
      console.log('❌ JWT Endpoint not available or failed');
      const text = await response.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.log('❌ JWT Endpoint Error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Direct WordPress Login
  console.log('📋 Test 3: Testing with your credentials...');
  console.log('Please enter your WordPress password to test login:');
  console.log('(This is just for testing, it won\'t be stored)');
  
  // For manual testing
  console.log('\nTo test manually, use these credentials:');
  console.log('- Username:', WORDPRESS_USERNAME);
  console.log('- Use your actual WordPress password');
}

testAuth();