const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSuperAdminNavigation() {
  console.log('🔍 Testing Super Admin Navigation...\n');
  
  try {
    // Login as super admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Super Admin login successful');

    // Get user profile to verify super admin status
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const { user } = profileResponse.data;
    console.log(`👤 User: ${user.email}`);
    console.log(`🔑 Is Super Admin: ${user.isSuperAdmin}`);
    console.log(`🏢 Tenant: ${user.tenant?.name || 'N/A'}`);
    
    if (user.isSuperAdmin) {
      console.log('\n✅ Super Admin Status Confirmed');
      console.log('📋 Expected Navigation Items:');
      console.log('  - Settings > Tenant Management');
      console.log('  - Settings > System Settings');
      console.log('  - Settings > Global Permissions');
    } else {
      console.log('\n❌ User is not a super admin');
    }

  } catch (error) {
    console.error('❌ Super Admin test failed:', error.response?.data || error.message);
  }
}

async function testRegularUserNavigation() {
  console.log('\n🔍 Testing Regular User Navigation...\n');
  
  try {
    // First, let's try to create a regular user or use an existing one
    // For now, let's assume we have a regular user account
    console.log('ℹ️  Regular user test would require a non-super-admin account');
    console.log('📋 Expected Navigation Items for Regular Users:');
    console.log('  - Settings > Organization Settings');
    console.log('  - Settings > User Management');
    console.log('  - Settings > Role Management');
    console.log('  - Settings > Permissions');
    
  } catch (error) {
    console.error('❌ Regular user test failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Navigation Role Tests\n');
  console.log('=' .repeat(50));
  
  await testSuperAdminNavigation();
  await testRegularUserNavigation();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Navigation role tests completed');
  console.log('\nTo verify the frontend navigation:');
  console.log('1. Open http://localhost:3002');
  console.log('2. Login with admin@walatech.com / admin123');
  console.log('3. Check the Settings menu for super admin items');
}

runTests().catch(console.error);