const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials for different tenants
const TENANTS = {
  walatech: {
    email: 'admin@walatech.com',
    password: 'admin123',
    subdomain: 'walatech'
  },
  lemuel: {
    email: 'lemuel@lemuelproperties.com',
    password: 'password123',
    subdomain: 'lemuel'
  },
  arfasa: {
    email: 'admin@arfasa.com',
    password: 'admin123',
    subdomain: 'arfasa'
  }
};

async function authenticate(tenant) {
  try {
    console.log(`🔐 Authenticating as ${tenant.email} (${tenant.subdomain})...`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: tenant.email,
      password: tenant.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-subdomain': tenant.subdomain
      }
    });

    if (response.data && response.data.access_token) {
      console.log(`✅ Authentication successful for ${tenant.subdomain}`);
      return response.data.access_token;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error(`❌ Authentication failed for ${tenant.subdomain}:`, error.response?.data || error.message);
    return null;
  }
}

async function getUsers(token, tenantSubdomain) {
  try {
    console.log(`👥 Fetching users for ${tenantSubdomain}...`);
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-subdomain': tenantSubdomain
      }
    });

    const data = response.data;
    const users = data.users || data || [];
    const total = data.total || users.length;
    
    console.log(`✅ Found ${users.length} users for ${tenantSubdomain} (Total: ${total}):`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`     - ID: ${user.id}`);
        console.log(`     - Tenant: ${user.tenant_id}`);
        console.log(`     - Department: ${user.department_id || 'None'}`);
        console.log(`     - Role: ${user.role_profile_name || 'None'}`);
        console.log(`     - Status: ${user.enabled ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('  No users found');
    }
    
    return users;
  } catch (error) {
    console.error(`❌ Failed to fetch users for ${tenantSubdomain}:`, error.response?.data || error.message);
    return [];
  }
}

async function createUser(token, tenantSubdomain, userData) {
  try {
    console.log(`➕ Creating user for ${tenantSubdomain}...`);
    console.log(`   User data:`, { ...userData, password: '***' });
    
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-subdomain': tenantSubdomain
      }
    });

    const user = response.data;
    console.log(`✅ User created successfully:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Name: ${user.first_name} ${user.last_name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Tenant: ${user.tenant_id}`);
    
    return user;
  } catch (error) {
    console.error(`❌ Failed to create user for ${tenantSubdomain}:`, error.response?.data || error.message);
    return null;
  }
}

async function getDepartments(token, tenantSubdomain) {
  try {
    console.log(`📁 Fetching departments for ${tenantSubdomain}...`);
    const response = await axios.get(`${BASE_URL}/hr/departments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-subdomain': tenantSubdomain
      }
    });

    const departments = response.data || [];
    console.log(`✅ Found ${departments.length} departments for ${tenantSubdomain}`);
    
    return departments;
  } catch (error) {
    console.error(`❌ Failed to fetch departments for ${tenantSubdomain}:`, error.response?.data || error.message);
    return [];
  }
}

async function testUserTenantIsolation() {
  console.log('🔍 Testing User Tenant Isolation...\n');
  console.log('='.repeat(80));

  const results = {};

  // Test each tenant
  for (const [tenantKey, tenant] of Object.entries(TENANTS)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing ${tenantKey.toUpperCase()} (${tenant.subdomain})`);
    console.log('='.repeat(80));
    
    const token = await authenticate(tenant);
    if (!token) {
      console.log(`⚠️ Skipping ${tenantKey} due to authentication failure\n`);
      continue;
    }

    // Get existing users
    const users = await getUsers(token, tenant.subdomain);
    
    // Get departments
    const departments = await getDepartments(token, tenant.subdomain);
    
    results[tenantKey] = {
      tenant: tenant,
      users: users,
      userCount: users.length,
      departments: departments,
      departmentCount: departments.length
    };
    
    console.log(`\n📊 Summary for ${tenantKey}:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Departments: ${departments.length}`);
  }

  // Test cross-tenant isolation
  console.log(`\n${'='.repeat(80)}`);
  console.log('Testing Cross-Tenant Isolation');
  console.log('='.repeat(80));
  
  // Create a test user for Lemuel
  if (results.lemuel) {
    console.log('\n➕ Creating test user for Lemuel Properties...');
    const lemuelToken = await authenticate(TENANTS.lemuel);
    if (lemuelToken) {
      const testUser = await createUser(lemuelToken, TENANTS.lemuel.subdomain, {
        first_name: 'Test',
        last_name: 'User',
        email: `test.user.${Date.now()}@lemuel.com`,
        password: 'TestPassword123!',
        role: 'Employee'
      });
      
      if (testUser) {
        console.log('\n✅ Test user created. Verifying tenant isolation...');
        
        // Fetch users again for all tenants
        for (const [tenantKey, tenant] of Object.entries(TENANTS)) {
          const token = await authenticate(tenant);
          if (token) {
            const users = await getUsers(token, tenant.subdomain);
            const hasTestUser = users.some(u => u.id === testUser.id);
            
            if (tenantKey === 'lemuel') {
              if (hasTestUser) {
                console.log(`✅ ${tenantKey}: Test user IS visible (CORRECT)`);
              } else {
                console.log(`❌ ${tenantKey}: Test user NOT visible (INCORRECT - should be visible)`);
              }
            } else {
              if (hasTestUser) {
                console.log(`❌ ${tenantKey}: Test user IS visible (INCORRECT - tenant isolation broken!)`);
              } else {
                console.log(`✅ ${tenantKey}: Test user NOT visible (CORRECT)`);
              }
            }
          }
        }
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('Final Summary');
  console.log('='.repeat(80));
  
  for (const [tenantKey, result] of Object.entries(results)) {
    console.log(`\n${tenantKey.toUpperCase()} (${result.tenant.subdomain}):`);
    console.log(`  - Total Users: ${result.userCount}`);
    console.log(`  - Total Departments: ${result.departmentCount}`);
    
    if (result.users.length > 0) {
      const tenantIds = [...new Set(result.users.map(u => u.tenant_id))];
      if (tenantIds.length === 1) {
        console.log(`  ✅ All users belong to same tenant`);
      } else {
        console.log(`  ❌ Users belong to multiple tenants: ${tenantIds.join(', ')}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('Test Complete!');
  console.log('='.repeat(80));
}

// Run the test
if (require.main === module) {
  testUserTenantIsolation().catch(console.error);
}

module.exports = { testUserTenantIsolation };
