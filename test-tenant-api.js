const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testTenantAPI() {
  console.log('🔍 Testing Tenant API Endpoints...\n');

  try {
    // Step 1: Login as super admin
    console.log('1. Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });

    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const { access_token, user } = loginResponse.data;
    console.log(`✅ Login successful! User: ${user.email}, Super Admin: ${user.isSuperAdmin}`);

    // Step 2: Test GET /tenants endpoint
    console.log('\n2. Testing GET /tenants endpoint...');
    try {
      const tenantsResponse = await axios.get(`${API_BASE_URL}/tenants`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ GET /tenants successful! Status: ${tenantsResponse.status}`);
      console.log(`📊 Response data:`, JSON.stringify(tenantsResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ GET /tenants failed:`, error.response?.status, error.response?.data || error.message);
    }

    // Step 3: Test POST /tenants endpoint (create tenant)
    console.log('\n3. Testing POST /tenants endpoint (create tenant)...');
    const newTenant = {
      name: 'Test Tenant',
      subdomain: 'test-tenant-' + Date.now(),
      plan: 'basic',
      status: 'active'
    };

    try {
      const createResponse = await axios.post(`${API_BASE_URL}/tenants`, newTenant, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ POST /tenants successful! Status: ${createResponse.status}`);
      console.log(`📊 Created tenant:`, JSON.stringify(createResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ POST /tenants failed:`, error.response?.status, error.response?.data || error.message);
    }

    // Step 4: Test existing tenants
    console.log('\n4. Testing existing tenants...');
    try {
      const existingTenantsResponse = await axios.get(`${API_BASE_URL}/tenants`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Final tenant list:`, JSON.stringify(existingTenantsResponse.data, null, 2));
    } catch (error) {
      console.log(`❌ Failed to get final tenant list:`, error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testTenantAPI().catch(console.error);