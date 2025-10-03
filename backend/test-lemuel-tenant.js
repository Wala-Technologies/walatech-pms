const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testLemuelTenant() {
  console.log('🔍 Testing Lemuel1 Tenant Context...\n');

  try {
    // Step 1: Login as lemuel1 user
    console.log('1. Logging in as lemuel1 user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@lemuel1.com',
      password: 'admin123'
    });

    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const { access_token, user } = loginResponse.data;
    console.log(`✅ Login successful!`);
    console.log(`   User: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Tenant ID: ${user.tenant_id}`);
    console.log(`   Super Admin: ${user.isSuperAdmin}`);

    // Step 2: Test tenant-settings endpoint
    console.log('\n2. Testing GET /tenant-settings endpoint...');
    try {
      const settingsResponse = await axios.get(`${API_BASE_URL}/tenant-settings`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ GET /tenant-settings successful! Status: ${settingsResponse.status}`);
      console.log(`📊 Company Name: ${settingsResponse.data.companyName || 'Not set'}`);
      console.log(`📊 Timezone: ${settingsResponse.data.timezone || 'Not set'}`);
      console.log(`📊 Currency: ${settingsResponse.data.currency || 'Not set'}`);
    } catch (error) {
      console.log(`❌ GET /tenant-settings failed:`, error.response?.status, error.response?.data || error.message);
    }

    // Step 3: Test getting tenant by ID
    console.log('\n3. Testing GET /tenants/{tenant_id} endpoint...');
    try {
      const tenantResponse = await axios.get(`${API_BASE_URL}/tenants/${user.tenant_id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ GET /tenants/${user.tenant_id} successful! Status: ${tenantResponse.status}`);
      console.log(`📊 Tenant Name: ${tenantResponse.data.name}`);
      console.log(`📊 Tenant Subdomain: ${tenantResponse.data.subdomain}`);
      console.log(`📊 Tenant Status: ${tenantResponse.data.status}`);
      console.log(`📊 Tenant ID: ${tenantResponse.data.id}`);
    } catch (error) {
      console.log(`❌ GET /tenants/${user.tenant_id} failed:`, error.response?.status, error.response?.data || error.message);
    }

    // Step 4: Test departments endpoint
    console.log('\n4. Testing GET /departments endpoint...');
    try {
      const departmentsResponse = await axios.get(`${API_BASE_URL}/departments`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ GET /departments successful! Status: ${departmentsResponse.status}`);
      console.log(`📊 Number of departments: ${departmentsResponse.data.length || 0}`);
      if (departmentsResponse.data.length > 0) {
        console.log(`📊 First department: ${departmentsResponse.data[0].name || departmentsResponse.data[0].department_name}`);
        console.log(`📊 Department tenant_id: ${departmentsResponse.data[0].tenant_id}`);
      }
    } catch (error) {
      console.log(`❌ GET /departments failed:`, error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testLemuelTenant().catch(console.error);