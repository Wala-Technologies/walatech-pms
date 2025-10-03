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

async function testValidationDetails() {
  console.log('🔍 Detailed Validation Testing...\n');
  
  try {
    const token = await authenticate();
    console.log('✅ Authentication successful\n');
    
    // First, get a real department ID
    console.log('Getting departments...');
    const deptResponse = await axios.get(`${BASE_URL}/hr/departments`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': 'walatech' 
      }
    });
    
    const departments = deptResponse.data;
    console.log(`Found ${departments.length} departments`);
    
    if (departments.length > 0) {
      const testDeptId = departments[0].id;
      console.log(`Using department ID: ${testDeptId}\n`);
      
      // Test with the real department ID
      console.log('Testing with real department ID...');
      try {
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': 'walatech' 
          },
          params: {
            department_id: testDeptId
          }
        });
        console.log('✅ Real department_id works!');
        console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
      } catch (error) {
        console.log('❌ Real department_id failed:', error.response?.data);
        console.log('Status:', error.response?.status);
        console.log('Headers:', error.response?.headers);
        console.log('Request URL:', error.config?.url);
        console.log('Request params:', error.config?.params);
      }
      
      // Test with invalid UUID format
      console.log('Testing with invalid UUID format...');
      try {
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': 'walatech' 
          },
          params: {
            department_id: 'invalid-uuid'
          }
        });
        console.log('✅ Invalid UUID somehow works');
      } catch (error) {
        console.log('❌ Invalid UUID failed (expected):', error.response?.data);
      }
      
      // Test with valid UUID format but non-existent department
      console.log('Testing with valid but non-existent UUID...');
      try {
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': 'walatech' 
          },
          params: {
            department_id: '12345678-1234-1234-1234-123456789012'
          }
        });
        console.log('✅ Non-existent UUID works');
        console.log(`Found ${response.data.users ? response.data.users.length : 0} users\n`);
      } catch (error) {
        console.log('❌ Non-existent UUID failed:', error.response?.data);
      }
      
    } else {
      console.log('No departments found to test with');
    }
    
    // Test other parameters to see which ones work
    console.log('Testing other query parameters...');
    
    const testParams = [
      { name: 'page', value: 1 },
      { name: 'limit', value: 5 },
      { name: 'search', value: 'admin' },
      { name: 'role', value: 'System Admin' },
      { name: 'status', value: 'active' },
      { name: 'sortBy', value: 'first_name' },
      { name: 'sortOrder', value: 'ASC' }
    ];
    
    for (const param of testParams) {
      try {
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': 'walatech' 
          },
          params: {
            [param.name]: param.value
          }
        });
        console.log(`✅ ${param.name}: ${param.value} works`);
      } catch (error) {
        console.log(`❌ ${param.name}: ${param.value} failed:`, error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testValidationDetails();