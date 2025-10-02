const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api';

// Authentication function
async function authenticate() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    
    if (response.data && response.data.access_token) {
      console.log('✅ Authentication successful');
      return response.data.access_token;
    } else {
      throw new Error('No access token in response');
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Get database connection
async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'walatech_pms'
  });
}

// Get tenant status distribution
async function getTenantStatusDistribution() {
  const connection = await getDbConnection();
  try {
    const [rows] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM tabtenant 
      GROUP BY status 
      ORDER BY status
    `);
    
    console.log('\n📊 Current tenant status distribution:');
    rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    return rows;
  } finally {
    await connection.end();
  }
}

// Get a test tenant for deletion
async function getTestTenant() {
  const connection = await getDbConnection();
  try {
    const [tenants] = await connection.execute(`
      SELECT id, name, subdomain, status 
      FROM tabtenant 
      WHERE status = 'active'
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
    
    if (tenants.length === 0) {
      throw new Error('No active tenants found for testing');
    }
    
    const tenant = tenants[0];
    console.log(`\n🎯 Using test tenant: ${tenant.name} (ID: ${tenant.id})`);
    return tenant;
  } finally {
    await connection.end();
  }
}

// Test soft delete endpoint
async function testSoftDelete(tenantId, token) {
  console.log('\n🗑️ Testing soft delete endpoint...');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tenants/${tenantId}/soft-delete`,
      {
        reason: 'Testing deletion functionality',
        retentionDays: 30
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Soft delete successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ Soft delete failed');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Test hard delete endpoint
async function testHardDelete(tenantId, token) {
  console.log('\n💥 Testing hard delete endpoint...');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tenants/${tenantId}/hard-delete`,
      {
        reason: 'Testing hard deletion functionality'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Hard delete successful!');
    console.log('Response status:', response.status);
    return true;
    
  } catch (error) {
    console.log('❌ Hard delete failed');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Test reactivation endpoint
async function testReactivation(tenantId, token) {
  console.log('\n🔄 Testing reactivation endpoint...');
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tenants/${tenantId}/reactivate`,
      {
        reason: 'Testing reactivation functionality'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Reactivation successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ Reactivation failed');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    return false;
  }
}

// Main test function
async function testDeletionFunctionality() {
  try {
    console.log('🧪 Testing Tenant Deletion Functionality');
    console.log('=====================================');
    
    // Get initial status distribution
    await getTenantStatusDistribution();
    
    // Authenticate
    const token = await authenticate();
    
    // Get test tenant
    const tenant = await getTestTenant();
    
    // Test soft delete
    const softDeleteSuccess = await testSoftDelete(tenant.id, token);
    
    if (softDeleteSuccess) {
      // Check status after soft delete
      await getTenantStatusDistribution();
      
      // Test reactivation
      await testReactivation(tenant.id, token);
      
      // Check status after reactivation
      await getTenantStatusDistribution();
      
      // Test soft delete again for hard delete test
      await testSoftDelete(tenant.id, token);
      
      // Test hard delete
      await testHardDelete(tenant.id, token);
      
      // Final status check
      await getTenantStatusDistribution();
    }
    
    console.log('\n🎉 Deletion functionality test completed!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDeletionFunctionality();