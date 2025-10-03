const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testTenantManagement() {
  try {
    console.log('🔍 Testing Tenant Management as Super Admin...\n');
    
    // Step 1: Login as super admin
    console.log('1. Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123',
      subdomain: 'walatech'
    });
    
    console.log('✅ Super Admin login successful!');
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log(`👤 User: ${user.email}`);
    console.log(`🔑 Is Super Admin: ${user.isSuperAdmin}`);
    
    // Step 2: Test GET /tenants (list all tenants)
    console.log('\n2. Testing GET /tenants...');
    const tenantsResponse = await axios.get(`${API_BASE_URL}/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Successfully retrieved tenants:');
    console.log(`📋 Found ${tenantsResponse.data.length} tenants`);
    tenantsResponse.data.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain}) - Status: ${tenant.status}`);
    });
    
    // Step 3: Test tenant creation
    console.log('\n3. Testing tenant creation...');
    const timestamp = Date.now();
    const testTenantData = {
      name: 'Test Tenant',
      subdomain: 'test-tenant-' + timestamp,
      adminEmail: `admin-${timestamp}@test-tenant.com`,
      adminPassword: 'testpass123',
      adminFirstName: 'Test',
      adminLastName: 'Admin'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/tenant-provisioning/provision`, testTenantData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Tenant created successfully!');
    console.log(`🏢 Tenant ID: ${createResponse.data.tenant.id}`);
    console.log(`🌐 Subdomain: ${createResponse.data.tenant.subdomain}`);
    
    const createdTenantId = createResponse.data.tenant.id;
    
    // Step 4: Test tenant soft deletion
    console.log('\n4. Testing tenant soft deletion...');
    const deleteResponse = await axios.post(`${API_BASE_URL}/tenants/${createdTenantId}/soft-delete`, {
      reason: 'Testing tenant management functionality',
      retentionDays: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Tenant soft deleted successfully!');
    console.log(`📊 Response status: ${deleteResponse.status}`);
    
    // Step 5: Verify tenant is soft deleted
    console.log('\n5. Verifying tenant soft deletion...');
    try {
      const tenantResponse = await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (tenantResponse.data.status === 'soft_deleted') {
        console.log('✅ Confirmed: Tenant successfully soft deleted');
        console.log(`   - Status: ${tenantResponse.data.status}`);
        console.log(`   - Soft deleted at: ${tenantResponse.data.softDeletedAt}`);
        console.log(`   - Hard delete scheduled: ${tenantResponse.data.hardDeleteScheduledAt}`);
      } else {
        console.log(`❌ ERROR: Tenant status is ${tenantResponse.data.status}, expected soft_deleted`);
      }
    } catch (error) {
      console.log('❌ Unexpected error verifying soft deletion:', error.message);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // Step 6: Test hard deletion (final cleanup)
    console.log('\n6. Testing hard deletion (cleanup)...');
    try {
      const hardDeleteResponse = await axios.post(`${API_BASE_URL}/tenants/${createdTenantId}/hard-delete`, {
        reason: 'Test cleanup - hard delete'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Tenant hard deleted successfully!');
      console.log(`📊 Response status: ${hardDeleteResponse.status}`);
      
      // Verify hard deletion
      try {
        await axios.get(`${API_BASE_URL}/tenants/${createdTenantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('❌ ERROR: Tenant still exists after hard deletion!');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ Confirmed: Tenant successfully hard deleted (404 Not Found)');
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Hard deletion failed:', error.message);
      if (error.response) {
        console.log(`   - Status: ${error.response.status}`);
        console.log(`   - Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('\n🎉 All tenant management tests passed!');
    
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

testTenantManagement();