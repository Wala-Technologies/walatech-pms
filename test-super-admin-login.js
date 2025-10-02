const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSuperAdminLogin() {
  try {
    console.log('Testing super admin login...');
    
    // Login with super admin credentials
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    console.log('Login successful!');
    console.log('User data:', JSON.stringify(loginResponse.data.user, null, 2));
    console.log('Is Super Admin:', loginResponse.data.user.isSuperAdmin);
    
    const token = loginResponse.data.access_token;
    
    // Test the /auth/profile endpoint
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\nProfile endpoint response:');
    console.log('User data:', JSON.stringify(profileResponse.data.user, null, 2));
    console.log('Is Super Admin:', profileResponse.data.user.isSuperAdmin);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSuperAdminLogin();