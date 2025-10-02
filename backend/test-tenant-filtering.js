const axios = require('axios');
const mysql = require('mysql2/promise');

const API_BASE_URL = 'http://localhost:3001/api';

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'walatech-pms',
  database: 'wala_pms'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Authenticate as super admin
const authenticateAsSuperAdmin = async () => {
  console.log('🔐 Authenticating as super admin...');
  const result = await makeRequest('POST', '/auth/login', {
    email: 'admin@walatech.com',
    password: 'admin123',
  });

  if (result.success) {
    authToken = result.data.access_token;
    console.log('✅ Super admin authenticated successfully');
    return true;
  } else {
    console.log('❌ Super admin authentication failed:', result.error);
    return false;
  }
};

// Test default behavior (should show only active tenants)
const testDefaultFiltering = async () => {
  console.log('\n📋 Testing default filtering (should show only active tenants)...');
  const result = await makeRequest('GET', '/tenants');
  
  if (result.success) {
    const tenants = result.data;
    console.log(`✅ Retrieved ${tenants.length} tenants by default`);
    
    // Check if all returned tenants are active
    const nonActiveTenants = tenants.filter(t => t.status !== 'active');
    if (nonActiveTenants.length === 0) {
      console.log('✅ All returned tenants are active (as expected)');
      return true;
    } else {
      console.log(`❌ Found ${nonActiveTenants.length} non-active tenants in default results`);
      console.log('Non-active tenants:', nonActiveTenants.map(t => ({ id: t.id, name: t.name, status: t.status })));
      return false;
    }
  } else {
    console.log('❌ Default filtering test failed:', result.error);
    return false;
  }
};

// Test explicit active status filtering
const testActiveStatusFiltering = async () => {
  console.log('\n🟢 Testing explicit active status filtering...');
  const result = await makeRequest('GET', '/tenants?status=active');
  
  if (result.success) {
    const tenants = result.data;
    console.log(`✅ Retrieved ${tenants.length} active tenants`);
    
    // Check if all returned tenants are active
    const nonActiveTenants = tenants.filter(t => t.status !== 'active');
    if (nonActiveTenants.length === 0) {
      console.log('✅ All returned tenants are active');
      return true;
    } else {
      console.log(`❌ Found ${nonActiveTenants.length} non-active tenants in active filter results`);
      return false;
    }
  } else {
    console.log('❌ Active status filtering test failed:', result.error);
    return false;
  }
};

// Test suspended status filtering
const testSuspendedStatusFiltering = async () => {
  console.log('\n🟡 Testing suspended status filtering...');
  const result = await makeRequest('GET', '/tenants?status=suspended');
  
  if (result.success) {
    const tenants = result.data;
    console.log(`✅ Retrieved ${tenants.length} suspended tenants`);
    
    // Check if all returned tenants are suspended
    const nonSuspendedTenants = tenants.filter(t => t.status !== 'suspended');
    if (nonSuspendedTenants.length === 0) {
      console.log('✅ All returned tenants are suspended');
      return true;
    } else {
      console.log(`❌ Found ${nonSuspendedTenants.length} non-suspended tenants in suspended filter results`);
      return false;
    }
  } else {
    console.log('❌ Suspended status filtering test failed:', result.error);
    return false;
  }
};

// Test soft deleted status filtering
const testSoftDeletedStatusFiltering = async () => {
  console.log('\n🗑️ Testing soft deleted status filtering...');
  const result = await makeRequest('GET', '/tenants?status=soft_deleted');
  
  if (result.success) {
    const tenants = result.data;
    console.log(`✅ Retrieved ${tenants.length} soft deleted tenants`);
    
    // Check if all returned tenants are soft deleted
    const nonSoftDeletedTenants = tenants.filter(t => t.status !== 'soft_deleted');
    if (nonSoftDeletedTenants.length === 0) {
      console.log('✅ All returned tenants are soft deleted');
      return true;
    } else {
      console.log(`❌ Found ${nonSoftDeletedTenants.length} non-soft-deleted tenants in soft deleted filter results`);
      return false;
    }
  } else {
    console.log('❌ Soft deleted status filtering test failed:', result.error);
    return false;
  }
};

// Test includeDeleted parameter
const testIncludeDeletedParameter = async () => {
  console.log('\n🔍 Testing includeDeleted parameter...');
  const result = await makeRequest('GET', '/tenants?includeDeleted=true');
  
  if (result.success) {
    const tenants = result.data;
    console.log(`✅ Retrieved ${tenants.length} tenants with includeDeleted=true`);
    
    // Check if we have tenants with various statuses
    const statusCounts = tenants.reduce((acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Status distribution:', statusCounts);
    return true;
  } else {
    console.log('❌ Include deleted parameter test failed:', result.error);
    return false;
  }
};

// Get tenant status distribution from database
const getTenantStatusDistribution = async () => {
  console.log('\n📊 Getting tenant status distribution from database...');
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM tabtenant 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    console.log('Database tenant status distribution:');
    rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    await connection.end();
    return rows;
  } catch (error) {
    console.log('❌ Failed to get tenant status distribution:', error.message);
    return [];
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 Starting Tenant Filtering Tests\n');
  
  // Get database status distribution first
  await getTenantStatusDistribution();
  
  // Authenticate
  const authSuccess = await authenticateAsSuperAdmin();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Run all tests
  const tests = [
    { name: 'Default Filtering', fn: testDefaultFiltering },
    { name: 'Active Status Filtering', fn: testActiveStatusFiltering },
    { name: 'Suspended Status Filtering', fn: testSuspendedStatusFiltering },
    { name: 'Soft Deleted Status Filtering', fn: testSoftDeletedStatusFiltering },
    { name: 'Include Deleted Parameter', fn: testIncludeDeletedParameter },
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }
  
  console.log('\n📈 Test Results Summary:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tenant filtering tests passed! The super admin can now filter tenants by status with active tenants shown by default.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
};

// Run the tests
runTests().catch(console.error);