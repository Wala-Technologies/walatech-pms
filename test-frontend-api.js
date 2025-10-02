const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testFrontendApiCall() {
  try {
    console.log('🔐 Logging in as super admin...');
    
    // Login as super admin (simulating frontend login)
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });

    if (![200, 201].includes(loginResponse.status)) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }

    const token = loginResponse.data.access_token;
    console.log('✅ Super admin login successful');

    // Test tenant creation exactly as frontend would do it
    const tenantData = {
      name: 'Test Frontend API',
      subdomain: 'test-frontend-api',
      plan: 'basic',
      status: 'active'
    };

    console.log('\n📝 Creating tenant via frontend API call...');
    console.log('Payload:', JSON.stringify(tenantData, null, 2));
    console.log('URL:', `${API_BASE_URL}/api/tenants`);

    const createResponse = await axios.post(`${API_BASE_URL}/api/tenants`, tenantData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant creation successful!');
    console.log('📊 Response:', JSON.stringify(createResponse.data, null, 2));

    // Test fetching tenants (as frontend would do)
    console.log('\n📋 Fetching tenants list...');
    const fetchResponse = await axios.get(`${API_BASE_URL}/api/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Tenants fetch successful!');
    console.log('📊 Tenants:', JSON.stringify(fetchResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error during frontend API test:');
    
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

testFrontendApiCall();