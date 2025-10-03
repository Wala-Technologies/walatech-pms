const mysql = require('mysql2/promise');
const axios = require('axios');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'walatech-pms',
  database: 'wala_pms'
};

const API_BASE_URL = 'http://localhost:3001/api';

async function authenticate() {
  try {
    console.log('🔐 Authenticating as super admin...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    
    console.log('✅ Authentication successful');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function getTestTenant() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM tabTenant WHERE status = ? LIMIT 1',
      ['active']
    );
    
    if (rows.length === 0) {
      throw new Error('No active tenant found for testing');
    }
    
    console.log(`✅ Using tenant: ${rows[0].name} (${rows[0].id})`);
    return rows[0];
  } finally {
    await connection.end();
  }
}

async function testEndpoint(name, method, url, data, token, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name} successful!`);
      console.log(`Response status: ${response.status}`);
      if (response.data) {
        console.log(`Response data:`, JSON.stringify(response.data, null, 2));
      }
      return response.data;
    } else {
      console.log(`⚠️ ${name} returned unexpected status: ${response.status}`);
      return response.data;
    }
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

async function testAllLifecycleEndpoints() {
  try {
    // Authenticate
    const token = await authenticate();
    
    // Get test tenant
    console.log('\n🔍 Getting a test tenant...');
    const tenant = await getTestTenant();
    
    // Test 1: Soft Delete
    await testEndpoint(
      'Soft Delete',
      'POST',
      `${API_BASE_URL}/tenants/${tenant.id}/soft-delete`,
      {
        reason: 'Comprehensive endpoint testing',
        retentionDays: 90
      },
      token
    );
    
    // Test 2: Get Audit Log
    await testEndpoint(
      'Audit Log Retrieval',
      'GET',
      `${API_BASE_URL}/tenants/${tenant.id}/audit-log`,
      null,
      token
    );
    
    // Test 3: Restore Tenant
    await testEndpoint(
      'Restore Tenant',
      'POST',
      `${API_BASE_URL}/tenants/${tenant.id}/reactivate`,
      {
        reason: 'Restoring after comprehensive test'
      },
      token
    );
    
    // Test 4: Update Retention Period
    await testEndpoint(
      'Update Retention Period',
      'PATCH',
      `${API_BASE_URL}/tenants/${tenant.id}/retention-period`,
      {
        retentionPeriodDays: 120
      },
      token
    );
    
    // Test 5: Get Updated Audit Log
    await testEndpoint(
      'Updated Audit Log Retrieval',
      'GET',
      `${API_BASE_URL}/tenants/${tenant.id}/audit-log`,
      null,
      token
    );
    
    console.log('\n🎉 All tenant lifecycle endpoints are working correctly!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAllLifecycleEndpoints();