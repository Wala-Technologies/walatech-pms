const axios = require('axios');

async function testTenantAPI() {
  try {
    console.log('Testing tenant API...');
    
    // First login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    
    console.log('Login status:', loginResponse.status);
    const token = loginResponse.data.access_token;
    
    // Then get tenants
    const tenantsResponse = await axios.get('http://localhost:3001/api/tenants', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Tenants response status:', tenantsResponse.status);
    console.log('Tenants data:', JSON.stringify(tenantsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTenantAPI();