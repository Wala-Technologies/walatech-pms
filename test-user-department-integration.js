const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test tenant credentials
const TENANTS = [
  {
    name: 'WalaTech Manufacturing',
    email: 'admin@walatech.com',
    password: 'admin123'
  },
  {
    name: 'Arfasa Manufacturing',
    email: 'admin@arfasa.com',
    password: 'admin123'
  }
];

async function authenticate(tenant) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: tenant.email,
      password: tenant.password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Authentication successful for ${tenant.name}`);
      return response.data.access_token;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.log(`❌ Authentication failed for ${tenant.name}: ${error.message}`);
    throw error;
  }
}

async function testTenantIntegration(tenant) {
  console.log(`\n🏢 Testing ${tenant.name}...`);

  try {
    // Authenticate first
    console.log('🔐 Authenticating...');
    const token = await authenticate(tenant);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get departments
    console.log('\n1. Testing departments endpoint...');
    const deptResponse = await axios.get(`${BASE_URL}/hr/departments`, { headers });
    const departments = Array.isArray(deptResponse.data) ? deptResponse.data : [];
    console.log(`✅ Departments found: ${departments.length}`);
    
    // Test 2: Get users
    console.log('\n2. Testing users endpoint...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
    const users = usersResponse.data.users || [];
    console.log(`✅ Users found: ${users.length}`);
    
    // Test 3: Test department filtering (get users by department)
    console.log('\n--- Testing Department Filtering ---');
    if (departments.length > 0) {
      try {
        const testDepartmentId = departments[0].id; // Use the first department's ID
        console.log(`Testing with department ID: ${testDepartmentId} (${departments[0].department_name})`);
        
        const response = await axios.get(`${BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'X-Tenant-ID': tenant.tenantId 
          },
          params: {
            department_id: testDepartmentId
          }
        });
        
        console.log(`✅ Department filtering successful. Found ${response.data.users ? response.data.users.length : 0} users in department "${departments[0].department_name}"`);
        if (response.data.users && response.data.users.length > 0) {
          console.log('Sample user in department:', response.data.users[0]);
        } else {
          console.log('No users found in this department (expected since we haven\'t assigned users to departments yet)');
        }
      } catch (error) {
        console.log(`❌ Department filtering failed: ${error.response?.status} ${error.response?.statusText}`);
        if (error.response?.data) {
          console.log('Error details:', error.response.data);
        }
      }
    } else {
      console.log('⚠️ No departments available for filtering test');
    }
    
    // Test 4: Test getUsersByDepartment endpoint
    if (departments.length > 0) {
      const firstDeptId = departments[0].id;
      console.log(`\n4. Testing getUsersByDepartment endpoint with department ID: ${firstDeptId}...`);
      
      try {
        const deptUsersResponse = await axios.get(`${BASE_URL}/users/department/${firstDeptId}`, { headers });
        const deptUsers = Array.isArray(deptUsersResponse.data) ? deptUsersResponse.data : [];
        console.log(`✅ Department users found: ${deptUsers.length}`);
      } catch (error) {
        console.log(`⚠️ getUsersByDepartment endpoint not available: ${error.response?.status || error.message}`);
      }
    }
    
    // Test 5: Create a test user with department assignment
    if (departments.length > 0) {
      const testDeptId = departments[0].id;
      console.log(`\n5. Testing user creation with department assignment...`);
      
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@walatech.com`,
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        department_id: testDeptId,
        password: 'testpass123'
      };
      
      try {
        const createUserResponse = await axios.post(`${BASE_URL}/users`, testUser, { headers });
        console.log(`✅ Test user created with department: ${createUserResponse.data.username}`);
        
        // Test filtering with the new user
        const filteredUsersResponse = await axios.get(`${BASE_URL}/users?department_id=${testDeptId}`, { headers });
        const filteredUsers = filteredUsersResponse.data.users || [];
        console.log(`✅ Users in department after creation: ${filteredUsers.length}`);
        
      } catch (error) {
        console.log(`⚠️ User creation failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    return {
      tenant: tenant.name,
      departments: departments.length,
      users: users.length
    };
    
  } catch (error) {
    console.error(`❌ Test failed for ${tenant.name}:`, error.response?.data || error.message);
    return {
      tenant: tenant.name,
      error: error.message
    };
  }
}

async function testUserDepartmentIntegration() {
  console.log('🧪 Testing User-Department Integration...\n');

  const results = [];
  
  for (const tenant of TENANTS) {
    const result = await testTenantIntegration(tenant);
    results.push(result);
  }
  
  console.log('\n📊 Summary:');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.tenant}: Error - ${result.error}`);
    } else {
      console.log(`✅ ${result.tenant}: ${result.departments} departments, ${result.users} users`);
    }
  });
  
  console.log('\n🎉 All tests completed!');
}

testUserDepartmentIntegration();