const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSuperAdminAuth() {
  try {
    console.log('Testing super admin authentication...\n');
    
    // Step 1: Login as super admin
    console.log('1. Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123', // Default password from the setup scripts
      subdomain: 'walatech'
    });
    
    console.log('Login successful!');
    console.log('Access token:', loginResponse.data.access_token.substring(0, 50) + '...');
    
    const token = loginResponse.data.access_token;
    
    // Step 2: Test /auth/profile endpoint
    console.log('\n2. Testing /auth/profile endpoint...');
    const meResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('User data from /auth/profile:');
    console.log(JSON.stringify(meResponse.data, null, 2));
    
    // Step 3: Test /tenants endpoint (super admin only)
    console.log('\n3. Testing /tenants endpoint (super admin only)...');
    const tenantsResponse = await axios.get(`${API_BASE_URL}/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Tenants data:');
    console.log(JSON.stringify(tenantsResponse.data, null, 2));
    
    console.log('\n✅ All tests passed! Super admin authentication is working correctly.');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSuperAdminAuth();