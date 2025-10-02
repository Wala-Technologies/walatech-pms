const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function createRegularUser() {
  console.log('🔍 Creating Regular User for Testing...\n');
  
  try {
    // First, login as super admin to create a regular user
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Super Admin login successful');

    // Create a regular user
    const createUserResponse = await axios.post(`${API_BASE_URL}/users`, {
      email: 'regular@walatech.com',
      password: 'regular123',
      first_name: 'Regular',
      last_name: 'User',
      role: 'regular_user'
    }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Regular user created successfully');
    console.log('📧 Email: regular@walatech.com');
    console.log('🔑 Password: regular123');
    
    // Now test login with the regular user
    const regularLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'regular@walatech.com',
      password: 'regular123',
      subdomain: 'walatech'
    });

    const regularUser = regularLoginResponse.data.user;
    console.log('\n✅ Regular user login successful');
    console.log(`👤 User: ${regularUser.email}`);
    console.log(`🔑 Is Super Admin: ${regularUser.isSuperAdmin}`);
    console.log(`🏢 Tenant: ${regularUser.tenant?.name || 'N/A'}`);
    
    if (!regularUser.isSuperAdmin) {
      console.log('\n✅ Regular User Status Confirmed');
      console.log('📋 Expected Navigation Items:');
      console.log('  - Settings > Organization Settings');
      console.log('  - Settings > User Management');
      console.log('  - Settings > Role Management');
      console.log('  - Settings > Permissions');
    } else {
      console.log('\n❌ User unexpectedly has super admin status');
    }

  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️  Regular user already exists, trying to login...');
      
      try {
        const regularLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'regular@walatech.com',
          password: 'regular123',
          subdomain: 'walatech'
        });

        const regularUser = regularLoginResponse.data.user;
        console.log('✅ Regular user login successful');
        console.log(`👤 User: ${regularUser.email}`);
        console.log(`🔑 Is Super Admin: ${regularUser.isSuperAdmin}`);
        console.log(`🏢 Tenant: ${regularUser.tenant?.name || 'N/A'}`);
        
        if (!regularUser.isSuperAdmin) {
          console.log('\n✅ Regular User Status Confirmed');
          console.log('📋 Expected Navigation Items:');
          console.log('  - Settings > Organization Settings');
          console.log('  - Settings > User Management');
          console.log('  - Settings > Role Management');
          console.log('  - Settings > Permissions');
        }
      } catch (loginError) {
        console.error('❌ Regular user login failed:', loginError.response?.data || loginError.message);
      }
    } else {
      console.error('❌ Regular user creation failed:', error.response?.data || error.message);
    }
  }
}

async function runTest() {
  console.log('🚀 Starting Regular User Creation and Test\n');
  console.log('=' .repeat(50));
  
  await createRegularUser();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Regular user test completed');
  console.log('\nTo verify the frontend navigation:');
  console.log('1. Open http://localhost:3002');
  console.log('2. Login with regular@walatech.com / regular123');
  console.log('3. Check the Settings menu for regular user items');
}

runTest().catch(console.error);