const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test configuration
const testConfig = {
  credentials: {
    email: 'admin@walatech.com',
    password: 'admin123'
  },
  testTenant: {
    name: 'Test Lifecycle Tenant',
    subdomain: 'test-lifecycle-' + Date.now(),
    plan: 'basic',
    status: 'active'
  }
};

let authToken = '';
let testTenantId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test functions
const authenticateAsSuperAdmin = async () => {
  console.log('🔐 Authenticating as Super Admin...');
  const result = await makeRequest('POST', '/auth/login', testConfig.credentials);
  
  if (result.success && result.data.access_token) {
    authToken = result.data.access_token;
    console.log('✅ Super Admin authentication successful');
    return true;
  } else {
    console.log('❌ Super Admin authentication failed:', result.error);
    return false;
  }
};

const createTestTenant = async () => {
  console.log('\n📝 Creating test tenant...');
  const result = await makeRequest('POST', '/tenants', testConfig.testTenant);
  
  if (result.success && result.data.id) {
    testTenantId = result.data.id;
    console.log('✅ Test tenant created successfully:', testTenantId);
    return true;
  } else {
    console.log('❌ Test tenant creation failed:', result.error);
    return false;
  }
};

const testSoftDeleteTenant = async () => {
  console.log('\n🗑️ Testing soft delete tenant...');
  const result = await makeRequest('POST', `/tenants/${testTenantId}/soft-delete`, {
    reason: 'Testing soft delete functionality',
    retentionDays: 30
  });
  
  if (result.success) {
    console.log('✅ Tenant soft deleted successfully');
    return true;
  } else {
    console.log('❌ Tenant soft delete failed:', result.error);
    return false;
  }
};

const testRestoreTenant = async () => {
  console.log('\n🔄 Testing restore tenant...');
  const result = await makeRequest('POST', `/tenants/${testTenantId}/reactivate`, {
    reason: 'Testing restore functionality'
  });
  
  if (result.success) {
    console.log('✅ Tenant restored successfully');
    return true;
  } else {
    console.log('❌ Tenant restore failed:', result.error);
    return false;
  }
};

const testScheduleHardDelete = async () => {
  console.log('\n⏰ Testing schedule hard delete...');
  // First soft delete the tenant again to test scheduling
  await testSoftDeleteTenant();
  
  const result = await makeRequest('GET', `/tenants/${testTenantId}`);
  
  if (result.success && result.data.hardDeleteScheduledAt) {
    console.log('✅ Hard delete already scheduled during soft delete');
    console.log('📅 Scheduled for:', result.data.hardDeleteScheduledAt);
    return true;
  } else {
    console.log('❌ Schedule hard delete failed - no scheduled date found');
    return false;
  }
};

const testCancelScheduledDeletion = async () => {
  console.log('\n❌ Testing cancel scheduled deletion (via reactivate)...');
  const result = await makeRequest('POST', `/tenants/${testTenantId}/reactivate`, {
    reason: 'Testing cancel deletion functionality'
  });
  
  if (result.success) {
    console.log('✅ Scheduled deletion cancelled successfully via reactivation');
    return true;
  } else {
    console.log('❌ Cancel scheduled deletion failed:', result.error);
    return false;
  }
};

const testUpdateRetentionPeriod = async () => {
  console.log('\n📅 Testing update retention period...');
  const result = await makeRequest('PATCH', `/tenants/${testTenantId}/retention-period`, {
    retentionPeriodDays: 60
  });
  
  if (result.success) {
    console.log('✅ Retention period updated successfully');
    return true;
  } else {
    console.log('❌ Update retention period failed:', result.error);
    return false;
  }
};

const testGetLifecycleAudit = async () => {
  console.log('\n📊 Testing get lifecycle audit...');
  const result = await makeRequest('GET', `/tenants/${testTenantId}/audit-log`);
  
  if (result.success) {
    console.log('✅ Lifecycle audit retrieved successfully');
    console.log('📋 Audit entries:', Array.isArray(result.data) ? result.data.length : 'N/A');
    return true;
  } else {
    console.log('❌ Get lifecycle audit failed:', result.error);
    return false;
  }
};

const testHardDeleteTenant = async () => {
  console.log('\n💥 Testing hard delete tenant (final cleanup)...');
  // First soft delete the tenant to enable hard delete
  await testSoftDeleteTenant();
  
  const result = await makeRequest('POST', `/tenants/${testTenantId}/hard-delete`, {
    reason: 'Cleaning up test tenant'
  });
  
  if (result.success) {
    console.log('✅ Tenant hard deleted successfully');
    return true;
  } else {
    console.log('❌ Tenant hard delete failed:', result.error);
    return false;
  }
};

// Main test execution
const runTests = async () => {
  console.log('🚀 Starting Tenant Lifecycle Management Endpoint Tests\n');
  console.log('=' .repeat(60));
  
  try {
    console.log('🔍 Assuming backend server is running on http://localhost:3001/api');
    
    // Run tests in sequence
    const tests = [
      authenticateAsSuperAdmin,
      createTestTenant,
      testSoftDeleteTenant,
      testRestoreTenant,
      testScheduleHardDelete,
      testCancelScheduledDeletion,
      testUpdateRetentionPeriod,
      testGetLifecycleAudit,
      testHardDeleteTenant
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      const result = await test();
      if (result) passedTests++;
      
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tenant lifecycle management endpoints are working correctly!');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
  }
};

// Run the tests
runTests().catch(console.error);