const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data);
    throw error;
  }
}

async function testUsersEndpoint() {
  console.log('🔍 Debugging Users Endpoint Validation...\n');
  
  try {
    const token = await authenticate();
    console.log('✅ Authentication successful\n');
    
    // Test 1: Basic users endpoint without any query params
    console.log('Test 1: Basic users endpoint (no params)');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'walatech' 
        }
      });
      console.log('✅ Basic endpoint works');
      console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
    } catch (error) {
      console.log('❌ Basic endpoint failed:', error.response?.data);
    }
    
    // Test 2: With valid query params (page, limit)
    console.log('Test 2: With pagination params');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'walatech' 
        },
        params: {
          page: 1,
          limit: 10
        }
      });
      console.log('✅ Pagination params work');
      console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
    } catch (error) {
      console.log('❌ Pagination params failed:', error.response?.data);
    }
    
    // Test 3: With search param
    console.log('Test 3: With search param');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'walatech' 
        },
        params: {
          search: 'admin'
        }
      });
      console.log('✅ Search param works');
      console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
    } catch (error) {
      console.log('❌ Search param failed:', error.response?.data);
    }
    
    // Test 4: With department_id param (the problematic one)
    console.log('Test 4: With department_id param');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'walatech' 
        },
        params: {
          department_id: '66f13599-2e73-4a10-8b09-874011004311'
        }
      });
      console.log('✅ Department_id param works');
      console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
    } catch (error) {
      console.log('❌ Department_id param failed:', error.response?.data);
    }
    
    // Test 5: Check what the UserQueryDto actually expects
    console.log('Test 5: All valid UserQueryDto params');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': 'walatech' 
        },
        params: {
          page: 1,
          limit: 10,
          search: 'admin',
          role: 'System Admin',
          status: 'active',
          sortBy: 'created_at',
          sortOrder: 'DESC'
        }
      });
      console.log('✅ All valid params work');
      console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
    } catch (error) {
      console.log('❌ All valid params failed:', error.response?.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testUsersEndpoint();