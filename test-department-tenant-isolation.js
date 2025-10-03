const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test credentials for different tenants
const TENANTS = {
  arfasa: {
    email: 'admin@arfasa.com',
    password: 'admin123',
    subdomain: 'arfasa'
  },
  lemuel: {
    email: 'lemuel@lemuelproperties.com', 
    password: 'password123',
    subdomain: 'lemuel'
  },
  walatech: {
    email: 'admin@walatech.com',
    password: 'admin123',
    subdomain: 'walatech'
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
    console.log(`✅ Found ${departments.length} departments for ${tenantSubdomain}:`);
    
    if (departments.length > 0) {
      departments.forEach((dept, index) => {
        console.log(`  ${index + 1}. ${dept.name || dept.department_name} (ID: ${dept.id}, Tenant: ${dept.tenant_id})`);
      });
    } else {
      console.log('  No departments found');
    }
    
    return departments;
  } catch (error) {
    console.error(`❌ Failed to fetch departments for ${tenantSubdomain}:`, error.response?.data || error.message);
    return [];
  }
}

async function testDepartmentTenantIsolation() {
  console.log('🔍 Testing Department Tenant Isolation...\n');

  const results = {};

  // Test each tenant
  for (const [tenantKey, tenant] of Object.entries(TENANTS)) {
    console.log(`\n=== Testing ${tenantKey.toUpperCase()} (${tenant.subdomain}) ===`);
    
    const token = await authenticate(tenant);
    if (!token) {
      console.log(`⚠️ Skipping ${tenantKey} due to authentication failure\n`);
      continue;
    }

    const departments = await getDepartments(token, tenant.subdomain);
    results[tenantKey] = {
      tenant: tenant,
      departments: departments,
      departmentCount: departments.length
    };
    
    console.log(`📊 Summary for ${tenantKey}: ${departments.length} departments\n`);
  }

  // Analysis
  console.log('\n📋 TENANT ISOLATION ANALYSIS:');
  console.log('=====================================');
  
  const tenantIds = new Set();
  let totalDepartments = 0;
  
  Object.entries(results).forEach(([tenantKey, result]) => {
    console.log(`\n${tenantKey.toUpperCase()}:`);
    console.log(`  - Departments: ${result.departmentCount}`);
    
    if (result.departments.length > 0) {
      const uniqueTenantIds = [...new Set(result.departments.map(d => d.tenant_id))];
      console.log(`  - Tenant IDs in departments: ${uniqueTenantIds.join(', ')}`);
      
      uniqueTenantIds.forEach(id => tenantIds.add(id));
      totalDepartments += result.departmentCount;
      
      // Check for cross-tenant data leakage
      const hasMultipleTenants = uniqueTenantIds.length > 1;
      if (hasMultipleTenants) {
        console.log(`  ⚠️ WARNING: Multiple tenant IDs found - possible data leakage!`);
      } else {
        console.log(`  ✅ Proper tenant isolation`);
      }
    }
  });

  console.log(`\n📈 OVERALL STATISTICS:`);
  console.log(`  - Total departments across all tenants: ${totalDepartments}`);
  console.log(`  - Unique tenant IDs found: ${tenantIds.size}`);
  console.log(`  - Expected tenant IDs: ${Object.keys(results).length}`);
  
  if (tenantIds.size === Object.keys(results).length) {
    console.log(`  ✅ Tenant isolation appears to be working correctly`);
  } else {
    console.log(`  ⚠️ Potential tenant isolation issues detected`);
  }

  console.log('\n✨ Department tenant isolation test completed!');
}

// Run the test
if (require.main === module) {
  testDepartmentTenantIsolation().catch(console.error);
}

module.exports = { testDepartmentTenantIsolation };