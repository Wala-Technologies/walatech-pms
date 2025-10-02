const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function authenticate() {
  try {
    console.log('🔐 Authenticating as super admin...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@walatech.com',
      password: 'admin123'
    });
    
    if (response.data && response.data.access_token) {
      console.log('✅ Authentication successful');
      return response.data.access_token;
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testApiEndpoints() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'walatech_pms'
  });

  try {
    // Get authentication token
    const token = await authenticate();
    
    console.log('\n🔍 Getting a test tenant...');
    
    // Get a tenant that's active
    const [tenants] = await connection.execute(`
      SELECT id, name, subdomain, status 
      FROM tabtenant 
      WHERE status = 'active'
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
    
    if (tenants.length === 0) {
      console.log('❌ No active tenants found in database');
      return;
    }
    
    const testTenant = tenants[0];
    console.log(`✅ Using tenant: ${testTenant.name} (${testTenant.id})`);
    
    // Test the soft delete endpoint
    console.log('\n🧪 Testing soft delete endpoint...');
    
    try {
      const response = await axios.post(
        `http://localhost:3001/api/tenants/${testTenant.id}/soft-delete`,
        {
          reason: 'Testing soft delete endpoint',
          retentionDays: 90
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
      console.log('Response data:', response.data);
      
    } catch (error) {
      console.log('❌ Soft delete failed');
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Status text:', error.response.statusText);
        console.log('Response data:', error.response.data);
        console.log('Response headers:', error.response.headers);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error setting up request:', error.message);
      }
      
      console.log('Full error:', error);
    }
    
    // Test the audit log endpoint
    console.log('\n🧪 Testing audit log endpoint...');
    
    try {
      const response = await axios.get(
        `http://localhost:3001/api/tenants/${testTenant.id}/audit-log`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        }
      );
      
      console.log('✅ Audit log retrieval successful!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
    } catch (error) {
      console.log('❌ Audit log retrieval failed');
      
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Status text:', error.response.statusText);
        console.log('Response data:', error.response.data);
      } else if (error.request) {
        console.log('No response received:', error.request);
      } else {
        console.log('Error setting up request:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await connection.end();
  }
}

testApiEndpoints().catch(console.error);