const axios = require('axios');

// Test script to verify department auto-creation during tenant provisioning
async function testDepartmentCreation() {
  const baseURL = 'http://localhost:3001/api';
  
  // Test data for new tenant
  const testTenant = {
    name: 'Test Company Auto Dept',
    subdomain: `test-auto-dept-${Date.now()}`,
    plan: 'basic',
    adminEmail: 'admin@testautodept.com',
    adminPassword: 'TestPassword123!',
    adminFirstName: 'Test',
    adminLastName: 'Admin'
  };

  try {
    console.log('🚀 Testing department auto-creation during tenant provisioning...');
    console.log('📝 Test tenant data:', testTenant);

    // Step 1: Provision new tenant
    console.log('\n📦 Step 1: Provisioning new tenant...');
    const provisionResponse = await axios.post(`${baseURL}/tenant-provisioning/provision`, testTenant);
    
    if (provisionResponse.status === 201) {
      console.log('✅ Tenant provisioned successfully!');
      console.log('🏢 Tenant ID:', provisionResponse.data.tenant.id);
      console.log('👤 Admin User ID:', provisionResponse.data.adminUser.id);
      
      const tenantId = provisionResponse.data.tenant.id;
      
      // Step 2: Login as admin to get auth token
      console.log('\n🔐 Step 2: Logging in as admin...');
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: testTenant.adminEmail,
        password: testTenant.adminPassword
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful!');
        const authToken = loginResponse.data.access_token;
        
        // Step 3: Check if departments were created
        console.log('\n📋 Step 3: Checking if departments were auto-created...');
        const departmentsResponse = await axios.get(`${baseURL}/hr/departments`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Tenant-ID': tenantId
          }
        });
        
        if (departmentsResponse.status === 200) {
          const departments = departmentsResponse.data;
          console.log(`✅ Found ${departments.length} departments!`);
          
          // Expected departments
          const expectedDepartments = [
            'HR', 'Accounting', 'Purchasing', 'Sales', 'Marketing', 
            'Production', 'IT', 'Finance', 'Operations', 'Legal'
          ];
          
          console.log('\n📊 Department verification:');
          expectedDepartments.forEach(expectedDept => {
            const found = departments.find(dept => dept.name === expectedDept);
            if (found) {
              console.log(`✅ ${expectedDept}: Found (ID: ${found.id})`);
            } else {
              console.log(`❌ ${expectedDept}: Missing`);
            }
          });
          
          // Summary
          const foundCount = expectedDepartments.filter(expectedDept => 
            departments.find(dept => dept.name === expectedDept)
          ).length;
          
          console.log(`\n📈 Summary: ${foundCount}/${expectedDepartments.length} expected departments found`);
          
          if (foundCount === expectedDepartments.length) {
            console.log('🎉 SUCCESS: All departments were auto-created correctly!');
          } else {
            console.log('⚠️  WARNING: Some departments are missing');
          }
          
        } else {
          console.log('❌ Failed to fetch departments');
        }
        
      } else {
        console.log('❌ Login failed');
      }
      
    } else {
      console.log('❌ Tenant provisioning failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

// Run the test
testDepartmentCreation();