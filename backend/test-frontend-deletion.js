const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFrontendDeletion() {
  console.log('🧪 Testing Frontend Deletion Functionality\n');

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

    // 2. Get current tenant list
    console.log('2. Getting current tenant list...');
    const tenantsResponse = await axios.get(`${API_BASE}/tenants`, { headers });
    const tenants = tenantsResponse.data;
    console.log(`Found ${tenants.length} tenants`);
    
    // Find an active tenant to test with
    const activeTenant = tenants.find(t => t.status === 'active');
    if (!activeTenant) {
      console.log('❌ No active tenant found for testing');
      return;
    }
    
    console.log(`Selected tenant for testing: ${activeTenant.name} (${activeTenant.id})\n`);

    // 3. Test soft delete endpoint (what frontend now calls)
    console.log('3. Testing soft delete endpoint (frontend call)...');
    const softDeleteResponse = await axios.post(
      `${API_BASE}/tenants/${activeTenant.id}/soft-delete`,
      {
        reason: 'Deleted via admin interface',
        retentionDays: 90
      },
      { headers }
    );

    if (softDeleteResponse.status === 200 || softDeleteResponse.status === 201) {
      console.log('✅ Soft delete successful');
    } else {
      console.log('❌ Soft delete failed');
    }

    // 4. Verify tenant status changed
    console.log('4. Verifying tenant status changed...');
    const updatedTenantResponse = await axios.get(`${API_BASE}/tenants/${activeTenant.id}`, { headers });
    const updatedTenant = updatedTenantResponse.data;
    
    if (updatedTenant.status === 'soft_deleted') {
      console.log('✅ Tenant status correctly changed to soft_deleted');
      console.log(`   - Soft deleted at: ${updatedTenant.softDeletedAt}`);
      console.log(`   - Hard delete scheduled: ${updatedTenant.hardDeleteScheduledAt}`);
      console.log(`   - Deleted by: ${updatedTenant.deletedBy}`);
      console.log(`   - Reason: ${updatedTenant.deletionReason}`);
    } else {
      console.log(`❌ Tenant status is ${updatedTenant.status}, expected soft_deleted`);
    }

    // 5. Test reactivation endpoint (what frontend will call)
    console.log('\n5. Testing reactivation endpoint...');
    const reactivateResponse = await axios.post(
      `${API_BASE}/tenants/${activeTenant.id}/reactivate`,
      {
        reason: 'Reactivated via admin interface'
      },
      { headers }
    );

    if (reactivateResponse.status === 200 || reactivateResponse.status === 201) {
      console.log('✅ Reactivation successful');
    } else {
      console.log('❌ Reactivation failed');
    }

    // 6. Verify tenant is active again
    console.log('6. Verifying tenant is active again...');
    const reactivatedTenantResponse = await axios.get(`${API_BASE}/tenants/${activeTenant.id}`, { headers });
    const reactivatedTenant = reactivatedTenantResponse.data;
    
    if (reactivatedTenant.status === 'active') {
      console.log('✅ Tenant successfully reactivated');
    } else {
      console.log(`❌ Tenant status is ${reactivatedTenant.status}, expected active`);
    }

    // 7. Test hard delete endpoint
    console.log('\n7. Testing hard delete endpoint...');
    
    // First soft delete again
    await axios.post(
      `${API_BASE}/tenants/${activeTenant.id}/soft-delete`,
      {
        reason: 'Testing hard delete',
        retentionDays: 90
      },
      { headers }
    );

    // Then hard delete
    const hardDeleteResponse = await axios.post(
      `${API_BASE}/tenants/${activeTenant.id}/hard-delete`,
      {
        reason: 'Hard deleted via admin interface'
      },
      { headers }
    );

    if (hardDeleteResponse.status === 200 || hardDeleteResponse.status === 201 || hardDeleteResponse.status === 204) {
      console.log('✅ Hard delete successful');
    } else {
      console.log('❌ Hard delete failed');
    }

    // 8. Verify tenant is hard deleted
    console.log('8. Verifying tenant is hard deleted...');
    const hardDeletedTenantResponse = await axios.get(`${API_BASE}/tenants/${activeTenant.id}`, { headers });
    const hardDeletedTenant = hardDeletedTenantResponse.data;
    
    if (hardDeletedTenant.status === 'hard_deleted') {
      console.log('✅ Tenant successfully hard deleted');
    } else {
      console.log(`❌ Tenant status is ${hardDeletedTenant.status}, expected hard_deleted`);
    }

    console.log('\n🎉 All frontend deletion tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendDeletion();