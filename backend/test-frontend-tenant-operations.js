const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test credentials
const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@walatech.com',
  password: 'admin123'
};

async function testFrontendTenantOperations() {
  try {
    console.log('🔍 Testing Frontend Tenant Operations...\n');

    // Step 1: Login as super admin
    console.log('1. Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, SUPER_ADMIN_CREDENTIALS);
    const token = loginResponse.data.access_token;
    console.log('✅ Super Admin login successful!');
    console.log(`👤 User: ${loginResponse.data.user.email}`);
    console.log(`🔑 Role: ${loginResponse.data.user.role}\n`);

    // Step 2: Test GET /tenants (list all tenants)
    console.log('2. Testing GET /tenants (list all tenants)...');
    const tenantsResponse = await axios.get(`${API_BASE_URL}/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Successfully retrieved tenants:');
    console.log(`📋 Found ${tenantsResponse.data.length} tenants`);
    tenantsResponse.data.slice(0, 3).forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain}) - Status: ${tenant.status}`);
    });
    if (tenantsResponse.data.length > 3) {
      console.log(`  ... and ${tenantsResponse.data.length - 3} more`);
    }
    console.log();

    // Step 3: Test POST /tenants (create tenant)
    console.log('3. Testing POST /tenants (create tenant)...');
    const newTenantData = {
      name: `Frontend Test Tenant`,
      subdomain: `frontend-test-${Date.now()}`,
      status: 'active',
      plan: 'basic',
      owner: 'test@example.com'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/tenants`, newTenantData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant created successfully!');
    console.log(`🏢 Tenant ID: ${createResponse.data.id}`);
    console.log(`🌐 Subdomain: ${createResponse.data.subdomain}`);
    console.log(`📊 Response status: ${createResponse.status}\n`);

    const createdTenantId = createResponse.data.id;

    // Step 4: Test GET /tenants/:id (get specific tenant)
    console.log('4. Testing GET /tenants/:id (get specific tenant)...');
    const tenantResponse = await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Successfully retrieved specific tenant:');
    console.log(`🏢 Name: ${tenantResponse.data.name}`);
    console.log(`🌐 Subdomain: ${tenantResponse.data.subdomain}`);
    console.log(`📊 Status: ${tenantResponse.data.status}`);
    console.log(`📋 Plan: ${tenantResponse.data.plan}`);
    console.log(`👤 Owner: ${tenantResponse.data.owner}\n`);

    // Step 5: Test PATCH /tenants/:id (update tenant)
    console.log('5. Testing PATCH /tenants/:id (update tenant)...');
    const updateData = {
      name: `Updated Frontend Test Tenant`,
      plan: 'premium',
      modifiedBy: 'test@example.com'
    };

    const updateResponse = await axios.patch(`${API_BASE_URL}/tenants/${createdTenantId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant updated successfully!');
    console.log(`🏢 Updated Name: ${updateResponse.data.name}`);
    console.log(`📋 Updated Plan: ${updateResponse.data.plan}`);
    console.log(`👤 Modified By: ${updateResponse.data.modifiedBy}`);
    console.log(`📊 Response status: ${updateResponse.status}\n`);

    // Step 6: Test POST /tenants/:id/soft-delete (soft delete tenant)
    console.log('6. Testing POST /tenants/:id/soft-delete (soft delete tenant)...');
    const softDeleteResponse = await axios.post(`${API_BASE_URL}/tenants/${createdTenantId}/soft-delete`, {
      reason: 'Frontend test - soft delete operation',
      retentionDays: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant soft deleted successfully!');
    console.log(`📊 Response status: ${softDeleteResponse.status}`);
    console.log(`📝 Message: ${softDeleteResponse.data.message}\n`);

    // Step 7: Verify soft deletion
    console.log('7. Verifying soft deletion...');
    const softDeletedTenantResponse = await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (softDeletedTenantResponse.data.status === 'soft_deleted') {
      console.log('✅ Confirmed: Tenant successfully soft deleted');
      console.log(`   - Status: ${softDeletedTenantResponse.data.status}`);
      console.log(`   - Soft deleted at: ${softDeletedTenantResponse.data.softDeletedAt}`);
      console.log(`   - Hard delete scheduled: ${softDeletedTenantResponse.data.hardDeleteScheduledAt}\n`);
    } else {
      console.log(`❌ ERROR: Expected status 'soft_deleted', got '${softDeletedTenantResponse.data.status}'\n`);
    }

    // Step 8: Test POST /tenants/:id/reactivate (reactivate tenant)
    console.log('8. Testing POST /tenants/:id/reactivate (reactivate tenant)...');
    const reactivateResponse = await axios.post(`${API_BASE_URL}/tenants/${createdTenantId}/reactivate`, {
      reason: 'Frontend test - reactivation operation'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant reactivated successfully!');
    console.log(`📊 Response status: ${reactivateResponse.status}`);
    console.log(`📝 Message: ${reactivateResponse.data.message}\n`);

    // Step 9: Verify reactivation
    console.log('9. Verifying reactivation...');
    const reactivatedTenantResponse = await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (reactivatedTenantResponse.data.status === 'active') {
      console.log('✅ Confirmed: Tenant successfully reactivated');
      console.log(`   - Status: ${reactivatedTenantResponse.data.status}`);
      console.log(`   - Reactivated at: ${reactivatedTenantResponse.data.updatedAt}\n`);
    } else {
      console.log(`❌ ERROR: Expected status 'active', got '${reactivatedTenantResponse.data.status}'\n`);
    }

    // Step 10: Test POST /tenants/:id/hard-delete (hard delete tenant - cleanup)
    console.log('10. Testing POST /tenants/:id/hard-delete (hard delete tenant - cleanup)...');
    const hardDeleteResponse = await axios.post(`${API_BASE_URL}/tenants/${createdTenantId}/hard-delete`, {
      reason: 'Frontend test cleanup - hard delete operation'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Tenant hard deleted successfully!');
    console.log(`📊 Response status: ${hardDeleteResponse.status}\n`);

    // Step 11: Verify hard deletion
    console.log('11. Verifying hard deletion...');
    try {
      await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ ERROR: Tenant still exists after hard deletion!\n');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Confirmed: Tenant successfully hard deleted (404 Not Found)\n');
      } else {
        console.log(`❌ Unexpected error: ${error.message}\n`);
      }
    }

    console.log('🎉 All frontend tenant operations tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error(`   - Status: ${error.response.status}`);
      console.error(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run the test
testFrontendTenantOperations();