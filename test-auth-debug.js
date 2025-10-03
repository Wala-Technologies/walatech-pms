const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('User:', JSON.stringify(loginResponse.data.user, null, 2));
    
    const token = loginResponse.data.access_token;
    
    // Test profile endpoint
    console.log('\n🔍 Testing profile endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile endpoint successful');
    console.log('Profile user:', JSON.stringify(profileResponse.data.user, null, 2));
    
    // Test tenant creation (to see the actual error)
    console.log('\n🏢 Testing tenant creation...');
    try {
      const tenantResponse = await axios.post(`${BASE_URL}/tenants`, {
        name: 'Debug Test Tenant',
        subdomain: 'debug-test-' + Date.now(),
        plan: 'basic',
        status: 'active'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Tenant creation successful');
      console.log('Tenant:', JSON.stringify(tenantResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Tenant creation failed');
      console.log('Error:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();