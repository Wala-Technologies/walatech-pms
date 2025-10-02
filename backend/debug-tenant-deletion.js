const axios = require('axios');

async function debugTenantDeletion() {
  try {
    console.log('🔍 Debugging Tenant Deletion...');

    // Step 1: Login as super admin
    console.log('\n1. Logging in as super admin...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Super Admin login successful!');

    // Step 2: Get list of tenants
    console.log('\n2. Getting tenant list...');
    const tenantsResponse = await axios.get('http://localhost:3001/tenants', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-subdomain': 'walatech'
      }
    });

    const tenants = tenantsResponse.data;
    console.log(`📋 Found ${tenants.length} tenants`);

    // Find a test tenant to delete
    const testTenant = tenants.find(t => t.subdomain.startsWith('test-tenant-'));
    if (!testTenant) {
      console.log('❌ No test tenant found to delete');
      return;
    }

    console.log(`🎯 Found test tenant to delete: ${testTenant.name} (${testTenant.subdomain})`);
    console.log(`🆔 Tenant ID: ${testTenant.id}`);

    // Step 3: Try to delete the tenant
    console.log('\n3. Attempting to delete tenant...');
    try {
      const deleteResponse = await axios.delete(`http://localhost:3001/tenants/${testTenant.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-subdomain': 'walatech'
        }
      });
      console.log('✅ Tenant deleted successfully!');
      console.log('Response:', deleteResponse.data);
    } catch (deleteError) {
      console.log('❌ Tenant deletion failed!');
      console.log('Status:', deleteError.response?.status);
      console.log('Status Text:', deleteError.response?.statusText);
      console.log('Error Data:', JSON.stringify(deleteError.response?.data, null, 2));
      
      // If it's a 500 error, the actual error details might be in the response
      if (deleteError.response?.data?.message) {
        console.log('Error Message:', deleteError.response.data.message);
      }
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

debugTenantDeletion();