const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testTenantCreation() {
  try {
    console.log('🔐 Logging in as super admin...');
    
    // Login as super admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });

    if (![200, 201].includes(loginResponse.status)) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }

    const token = loginResponse.data.access_token;
    console.log('✅ Super admin login successful');

    // Test tenant creation with the exact payload from frontend
    const tenantData = {
      name: 'Test Tenant Frontend',
      subdomain: 'test-frontend',
      plan: 'basic',
      status: 'active'
    };

    console.log('\n📝 Creating tenant with payload:', JSON.stringify(tenantData, null, 2));

    const createResponse = await axios.post(`${API_BASE_URL}/tenants`, tenantData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant creation successful!');
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error during tenant creation test:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testTenantCreation();