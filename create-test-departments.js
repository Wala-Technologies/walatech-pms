const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test tenant credentials
const TEST_TENANT = {
  name: 'WalaTech Manufacturing',
  email: 'admin@walatech.com',
  password: 'admin123'
};

// Test departments to create
const TEST_DEPARTMENTS = [
  {
    name: 'Engineering',
    department_name: 'Software Engineering Department',
    company: 'WalaTech Manufacturing'
  },
  {
    name: 'HR',
    department_name: 'Human Resources Department',
    company: 'WalaTech Manufacturing'
  },
  {
    name: 'Sales',
    department_name: 'Sales and Marketing Department',
    company: 'WalaTech Manufacturing'
  },
  {
    name: 'Finance',
    department_name: 'Finance and Accounting Department',
    company: 'WalaTech Manufacturing'
  },
  {
    name: 'Operations',
    department_name: 'Operations and Manufacturing Department',
    company: 'WalaTech Manufacturing'
  }
];

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

async function createTestDepartments() {
  console.log('🏗️ Creating Test Departments for WalaTech...\n');

  try {
    // Authenticate first
    console.log('🔐 Authenticating...');
    const token = await authenticate();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Create departments
    console.log('\n📁 Creating departments...');
    const createdDepartments = [];
    
    for (const dept of TEST_DEPARTMENTS) {
      try {
        const response = await axios.post(`${BASE_URL}/hr/departments`, dept, { headers });
        console.log(`✅ Created department: ${dept.name} (ID: ${response.data.id})`);
        createdDepartments.push(response.data);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️ Department already exists: ${dept.name}`);
        } else {
          console.error(`❌ Failed to create department ${dept.name}:`, error.response?.data || error.message);
        }
      }
    }
    
    // Verify departments were created
    console.log('\n🔍 Verifying created departments...');
    const deptResponse = await axios.get(`${BASE_URL}/hr/departments`, { headers });
    console.log(`✅ Total departments now: ${deptResponse.data.departments?.length || 0}`);
    
    if (deptResponse.data.departments?.length > 0) {
      console.log('\n📋 Available departments:');
      deptResponse.data.departments.forEach(dept => {
        console.log(`  - ${dept.name}: ${dept.department_name} (ID: ${dept.id})`);
      });
    }
    
    console.log('\n🎉 Test departments creation completed!');
    return createdDepartments;
    
  } catch (error) {
    console.error('❌ Failed to create test departments:', error.response?.data || error.message);
    throw error;
  }
}

// Run the script
createTestDepartments().catch(console.error);