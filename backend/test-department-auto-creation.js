const axios = require('axios');

// Simple test to verify department auto-creation works
async function testDepartmentAutoCreation() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('🚀 Testing department auto-creation...');
    
    // First, let's check if we can access the departments endpoint
    console.log('\n📋 Step 1: Testing departments endpoint access...');
    
    try {
      const response = await axios.get(`${baseURL}/hr/departments`);
      console.log('❌ Departments endpoint should require authentication, but it responded:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Departments endpoint correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status || error.message);
      }
    }
    
    // Test tenant provisioning endpoint
    console.log('\n📦 Step 2: Testing tenant provisioning endpoint...');
    
    const testTenant = {
      name: 'Simple Test Company',
      subdomain: `simple-test-${Date.now()}`,
      plan: 'basic',
      adminEmail: 'admin@simpletest.com',
      adminPassword: 'TestPassword123!',
      adminFirstName: 'Simple',
      adminLastName: 'Admin'
    };
    
    console.log('📝 Test tenant data:', testTenant);
    
    try {
      const provisionResponse = await axios.post(`${baseURL}/tenant-provisioning/provision`, testTenant);
      
      if (provisionResponse.status === 201) {
        console.log('✅ Tenant provisioned successfully!');
        console.log('🏢 Tenant ID:', provisionResponse.data.tenant.id);
        console.log('👤 Admin User ID:', provisionResponse.data.adminUser.id);
        
        // Try to login and check departments
        console.log('\n🔐 Step 3: Logging in as admin...');
        
        try {
          const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: testTenant.adminEmail,
            password: testTenant.adminPassword
          });
          
          if (loginResponse.status === 200) {
            console.log('✅ Login successful!');
            const authToken = loginResponse.data.access_token;
            const tenantId = provisionResponse.data.tenant.id;
            
            // Check departments
            console.log('\n📋 Step 4: Checking departments...');
            
            try {
              const departmentsResponse = await axios.get(`${baseURL}/hr/departments`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'X-Tenant-ID': tenantId
                }
              });
              
              if (departmentsResponse.status === 200) {
                const departments = departmentsResponse.data;
                console.log(`✅ Found ${departments.length} departments!`);
                
                if (departments.length > 0) {
                  console.log('\n📊 Department list:');
                  departments.forEach((dept, index) => {
                    console.log(`${index + 1}. ${dept.name} (${dept.code}) - ${dept.department_name}`);
                  });
                  
                  console.log('\n🎉 SUCCESS: Department auto-creation is working!');
                } else {
                  console.log('⚠️  WARNING: No departments found - auto-creation may not be working');
                }
              } else {
                console.log('❌ Failed to fetch departments:', departmentsResponse.status);
              }
            } catch (deptError) {
              console.log('❌ Error fetching departments:', deptError.response?.data || deptError.message);
            }
            
          } else {
            console.log('❌ Login failed:', loginResponse.status);
          }
        } catch (loginError) {
          console.log('❌ Login error:', loginError.response?.data || loginError.message);
        }
        
      } else {
        console.log('❌ Tenant provisioning failed:', provisionResponse.status);
      }
    } catch (provisionError) {
      console.log('❌ Tenant provisioning error:', provisionError.response?.data || provisionError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDepartmentAutoCreation();