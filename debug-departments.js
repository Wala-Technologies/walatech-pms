const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test tenant credentials
const TEST_TENANT = {
  name: 'WalaTech Manufacturing',
  email: 'admin@walatech.com',
  password: 'admin123'
};

async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_TENANT.email,
      password: TEST_TENANT.password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Authentication successful for ${TEST_TENANT.name}`);
      return response.data.access_token;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.log(`❌ Authentication failed for ${TEST_TENANT.name}: ${error.message}`);
    throw error;
  }
}

async function debugDepartments() {
  console.log('🔍 Debugging Departments Endpoint...\n');

  try {
    // Authenticate first
    console.log('🔐 Authenticating...');
    const token = await authenticate();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test departments endpoint with detailed logging
    console.log('\n📁 Testing departments endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/hr/departments`, { headers });
      console.log('✅ Departments endpoint response:');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.departments) {
        console.log(`📊 Departments count: ${response.data.departments.length}`);
        response.data.departments.forEach((dept, index) => {
          console.log(`  ${index + 1}. ${dept.name} (${dept.department_name}) - ID: ${dept.id}`);
        });
      } else {
        console.log('⚠️ No departments array in response');
      }
    } catch (error) {
      console.error('❌ Departments endpoint error:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
    }

    // Test creating a simple department
    console.log('\n🏗️ Testing department creation...');
    const testDept = {
      name: `Test-${Date.now()}`,
      department_name: `Test Department ${Date.now()}`,
      company: 'WalaTech Manufacturing'
    };
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/hr/departments`, testDept, { headers });
      console.log('✅ Department created successfully:');
      console.log('Created department:', JSON.stringify(createResponse.data, null, 2));
      
      // Try to fetch it immediately
      console.log('\n🔄 Fetching departments again after creation...');
      const fetchResponse = await axios.get(`${BASE_URL}/hr/departments`, { headers });
      console.log('Departments after creation:', JSON.stringify(fetchResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ Department creation error:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug script
debugDepartments().catch(console.error);