const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testExistingUsers() {
  console.log('🔍 Testing Existing Users...\n');
  
  try {
    // Login as super admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Super Admin login successful');

    // Get list of users
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('\n📋 Users Response:', JSON.stringify(usersResponse.data, null, 2));
    
    const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
    
    console.log('\n📋 Existing Users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.first_name} ${user.last_name}) - Role: ${user.role}`);
    });

    // Try to find a non-super-admin user
    const regularUsers = users.filter(user => user.email !== 'admin@walatech.com');
    
    if (regularUsers.length > 0) {
      const testUser = regularUsers[0];
      console.log(`\n🧪 Testing login with: ${testUser.email}`);
      
      // Try login with a common password
      const testPasswords = ['password123', 'user123', 'test123', 'regular123'];
      
      for (const password of testPasswords) {
        try {
          const testLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: testUser.email,
            password: password,
            subdomain: 'walatech'
          });

          const loggedInUser = testLoginResponse.data.user;
          console.log(`✅ Login successful with password: ${password}`);
          console.log(`👤 User: ${loggedInUser.email}`);
          console.log(`🔑 Is Super Admin: ${loggedInUser.isSuperAdmin}`);
          console.log(`🏢 Tenant: ${loggedInUser.tenant?.name || 'N/A'}`);
          
          if (!loggedInUser.isSuperAdmin) {
            console.log('\n✅ Regular User Status Confirmed');
            console.log('📋 Expected Navigation Items:');
            console.log('  - Settings > Organization Settings');
            console.log('  - Settings > User Management');
            console.log('  - Settings > Role Management');
            console.log('  - Settings > Permissions');
          }
          
          return; // Exit after successful login
          
        } catch (loginError) {
          console.log(`❌ Login failed with password: ${password}`);
        }
      }
      
      console.log('\n❌ Could not login with any test password');
    } else {
      console.log('\n⚠️  No regular users found besides admin');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Existing Users Test\n');
  console.log('=' .repeat(50));
  
  await testExistingUsers();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Test completed');
}

runTest().catch(console.error);