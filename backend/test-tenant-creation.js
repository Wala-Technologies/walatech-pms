const axios = require('axios');

// Test tenant creation with automatic user generation
async function testTenantCreation() {
  const baseURL = 'http://localhost:3001/api';
  
  // Test data for creating a new tenant
  const timestamp = Date.now();
  const testTenantData = {
    subdomain: 'testcompany' + timestamp, // Unique subdomain
    name: 'Test Company Ltd',
    plan: 'basic',
    adminEmail: `admin${timestamp}@testcompany.com`, // Unique email
    adminFirstName: 'Test',
    adminLastName: 'Admin',
    adminPassword: 'TestPassword123!'
  };

  try {
    console.log('🚀 Testing tenant creation with automatic user generation...');
    console.log('📋 Test tenant data:', JSON.stringify(testTenantData, null, 2));
    
    // Create tenant
    const response = await axios.post(`${baseURL}/tenant-provisioning/provision`, testTenantData);
    
    console.log('✅ Tenant creation successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if default users were created
    if (response.data.defaultUsersCreated) {
      console.log(`🎉 Successfully created ${response.data.defaultUsersCreated} default users!`);
    } else {
      console.log('⚠️  No information about default users in response');
    }
    
    // Extract tenant ID for further testing
    const tenantId = response.data.tenant?.id;
    if (tenantId) {
      console.log(`🏢 Tenant ID: ${tenantId}`);
      
      // Test: Get tenant users to verify default users were created
      try {
        console.log('\n🔍 Fetching tenant users to verify default user creation...');
        const usersResponse = await axios.get(`${baseURL}/users?tenant_id=${tenantId}`);
        
        console.log(`👥 Total users found: ${usersResponse.data.length}`);
        console.log('📋 User list:');
        usersResponse.data.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role} - Dept: ${user.department_id || 'N/A'}`);
        });
        
      } catch (userError) {
        console.log('⚠️  Could not fetch users (endpoint might not exist or require auth):', userError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Tenant creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
}

// Run the test
testTenantCreation()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed with error:', error);
    process.exit(1);
  });