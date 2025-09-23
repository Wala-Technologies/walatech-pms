const axios = require('axios');

async function testApiMigration() {
  const baseUrl = 'http://localhost:3001/api';
  
  // Test with a fake JWT token (we'll handle auth errors)
  const headers = {
    'Authorization': 'Bearer fake-token',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Testing tenant settings API migration...\n');
    
    // Test GET endpoint
    console.log('1. Testing GET /tenant-settings');
    try {
      const response = await axios.get(`${baseUrl}/tenant-settings`, { headers });
      console.log('✅ GET request successful');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ GET request failed with 401 (expected - need valid auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ GET request failed with 404 - endpoint not found');
      } else {
        console.log('❌ GET request failed:', error.message);
      }
    }

    console.log('\n2. Testing PUT /tenant-settings');
    const testSettings = {
      settings: {
        features: {
          enableInventory: true,
          enableManufacturing: false,
          enableQuality: true,
          enableMaintenance: false,
          enableReports: true,
          enableAPI: false
        }
      }
    };

    try {
      const response = await axios.put(`${baseUrl}/tenant-settings`, testSettings, { headers });
      console.log('✅ PUT request successful');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ PUT request failed with 401 (expected - need valid auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ PUT request failed with 404 - endpoint not found');
      } else {
        console.log('❌ PUT request failed:', error.message);
        if (error.response?.data) {
          console.log('Error response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testApiMigration();