// Test JWT Authentication
const https = require('https');

function testJWT(username, password) {
  const data = JSON.stringify({ username, password });

  const options = {
    hostname: 'powlax.com',
    port: 443,
    path: '/wp-json/jwt-auth/v1/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response:', responseData);
      
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.code === 'jwt_auth_bad_config') {
          console.log('\n❌ JWT is not configured properly on WordPress');
          console.log('Please ensure:');
          console.log('1. JWT_AUTH_SECRET_KEY is defined in wp-config.php');
          console.log('2. It\'s placed BEFORE "That\'s all, stop editing!"');
          console.log('3. The syntax is exactly: define(\'JWT_AUTH_SECRET_KEY\', \'your-secret-key\');');
        } else if (parsed.code === '[jwt_auth] invalid_username' || parsed.code === '[jwt_auth] incorrect_password') {
          console.log('\n✅ JWT is configured! (Invalid credentials is expected for test)');
        } else if (parsed.token) {
          console.log('\n✅ JWT is working! Token received:', parsed.token.substring(0, 50) + '...');
        }
      } catch (e) {
        console.log('Could not parse response');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.write(data);
  req.end();
}

// Test with invalid credentials to check configuration
console.log('Testing JWT configuration...\n');
testJWT('testuser', 'testpassword');