const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testTenantCreation() {
  console.log('🧪 Testing Tenant Creation Functionality\n');

  try {
    // 1. Authenticate as super admin
    console.log('1. Authenticating as super admin...');
    const authResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    if (!authResponse.data.access_token) {
      throw new Error('Authentication failed');
    }

    const token = authResponse.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful\n');

    // 2. Test tenant creation with minimal data
    console.log('2. Testing tenant creation with minimal data...');
    const timestamp = Date.now();
    const minimalTenantData = {
      name: `Test Tenant Minimal ${timestamp}`,
      subdomain: `test-minimal-${timestamp}`,
      plan: 'basic'
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/tenants`, minimalTenantData, { headers });
      console.log('✅ Minimal tenant creation successful');
      console.log(`   - Tenant ID: ${createResponse.data.id}`);
      console.log(`   - Name: ${createResponse.data.name}`);
      console.log(`   - Subdomain: ${createResponse.data.subdomain}`);
      console.log(`   - Status: ${createResponse.data.status}`);
      
      // Clean up - soft delete the test tenant
      await axios.post(`${API_BASE}/tenants/${createResponse.data.id}/soft-delete`, {
        reason: 'Test cleanup'
      }, { headers });
      
    } catch (error) {
      console.log('❌ Minimal tenant creation failed');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
    }

    // 3. Test tenant creation with complete data
    console.log('\n3. Testing tenant creation with complete data...');
    const completeTenantData = {
      name: `Test Tenant Complete ${timestamp}`,
      subdomain: `test-complete-${timestamp}`,
      plan: 'premium',
      settings: JSON.stringify({
        theme: 'dark',
        language: 'en',
        timezone: 'UTC'
      })
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/tenants`, completeTenantData, { headers });
      console.log('✅ Complete tenant creation successful');
      console.log(`   - Tenant ID: ${createResponse.data.id}`);
      console.log(`   - Name: ${createResponse.data.name}`);
      console.log(`   - Subdomain: ${createResponse.data.subdomain}`);
      console.log(`   - Plan: ${createResponse.data.plan}`);
      console.log(`   - Status: ${createResponse.data.status}`);
      
      // Clean up - soft delete the test tenant
      await axios.post(`${API_BASE}/tenants/${createResponse.data.id}/soft-delete`, {
        reason: 'Test cleanup'
      }, { headers });
      
    } catch (error) {
      console.log('❌ Complete tenant creation failed');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   - Error: ${error.message}`);
      }
    }

    // 4. Test tenant creation with duplicate subdomain
    console.log('\n4. Testing tenant creation with duplicate subdomain...');
    const duplicateSubdomainData = {
      name: `Test Duplicate Subdomain ${timestamp}`,
      subdomain: 'walatech', // This should already exist
      plan: 'basic'
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/tenants`, duplicateSubdomainData, { headers });
      console.log('❌ Duplicate subdomain creation should have failed but succeeded');
      console.log(`   - Tenant ID: ${createResponse.data.id}`);
      
      // Clean up if it somehow succeeded
      await axios.post(`${API_BASE}/tenants/${createResponse.data.id}/soft-delete`, {
        reason: 'Test cleanup'
      }, { headers });
      
    } catch (error) {
      console.log('✅ Duplicate subdomain creation correctly failed');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    // 5. Test tenant creation with invalid data
    console.log('\n5. Testing tenant creation with invalid data...');
    const invalidTenantData = {
      name: '', // Empty name should fail
      subdomain: `test-invalid-${timestamp}`,
      plan: 'basic'
    };

    try {
      const createResponse = await axios.post(`${API_BASE}/tenants`, invalidTenantData, { headers });
      console.log('❌ Invalid data creation should have failed but succeeded');
      console.log(`   - Tenant ID: ${createResponse.data.id}`);
      
      // Clean up if it somehow succeeded
      await axios.post(`${API_BASE}/tenants/${createResponse.data.id}/soft-delete`, {
        reason: 'Test cleanup'
      }, { headers });
      
    } catch (error) {
      console.log('✅ Invalid data creation correctly failed');
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    console.log('\n🎉 Tenant creation testing completed!');

  } catch (error) {
    console.error('❌ Error during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testTenantCreation();