const axios = require('axios');

async function testAPI() {
  try {
    // First login as super admin
    console.log('Logging in as super admin...');
    const superAdminCredentials = {
       email: 'admin@walatech.com',
       password: 'admin123'
     };
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', superAdminCredentials);
    
    const token = loginResponse.data.access_token;
    console.log('Login successful, token received');
    
    // Test without includeDeleted
    console.log('\n=== Testing /api/tenants (without includeDeleted) ===');
    const response1 = await axios.get('http://localhost:3001/api/tenants', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response length:', response1.data.length);
    console.log('Statuses:', response1.data.map(t => `${t.name}: ${t.status}`));
    
    // Test with includeDeleted=true
    console.log('\n=== Testing /api/tenants?includeDeleted=true ===');
    const response2 = await axios.get('http://localhost:3001/api/tenants?includeDeleted=true', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response length:', response2.data.length);
    console.log('Statuses:', response2.data.map(t => `${t.name}: ${t.status}`));
    
  } catch (error) {
     console.error('Error details:');
     console.error('Message:', error.message);
     if (error.response) {
       console.error('Status:', error.response.status);
       console.error('Data:', error.response.data);
     }
     if (error.code) {
       console.error('Code:', error.code);
     }
     console.error('Full error:', error);
   }
}

testAPI();