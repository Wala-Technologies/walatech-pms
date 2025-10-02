const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testLemuelJWT() {
  try {
    console.log('🔧 Testing JWT token for lemuel1 admin user...\n');

    // Step 1: Login with the lemuel1 admin user
    console.log('📝 Attempting login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@lemuel1.com',
      password: 'admin123'
    });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      console.log('✅ Login successful');
      console.log('📋 Login response data:');
      console.log(JSON.stringify(loginResponse.data, null, 2));
      
      const token = loginResponse.data.access_token || loginResponse.data.token;
      if (!token) {
        console.log('❌ No access token found in response');
        return;
      }
      console.log(`📄 JWT Token: ${token.substring(0, 50)}...`);

      // Step 2: Decode the JWT token
      console.log('\n🔍 Decoding JWT token...');
      const decoded = jwt.decode(token);
      console.log('📋 Decoded JWT payload:');
      console.log(JSON.stringify(decoded, null, 2));

      // Step 3: Verify tenant_id
      const expectedTenantId = '361b6b8b-3be8-4326-9afb-0f86b18fbb21';
      if (decoded.tenant_id === expectedTenantId) {
        console.log('✅ JWT contains correct tenant_id:', decoded.tenant_id);
      } else {
        console.log('❌ JWT tenant_id mismatch!');
        console.log('Expected:', expectedTenantId);
        console.log('Actual:', decoded.tenant_id);
      }

      // Step 4: Test authenticated request to tenant-settings
      console.log('\n🔧 Testing authenticated request to /tenant-settings...');
      const settingsResponse = await axios.get('http://localhost:3001/api/tenant-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (settingsResponse.status === 200) {
        console.log('✅ Successfully accessed tenant-settings');
        console.log('📋 Tenant settings response:');
        console.log(JSON.stringify(settingsResponse.data, null, 2));
      }

    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
    }

  } catch (error) {
    console.log('❌ Error testing JWT:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testLemuelJWT();