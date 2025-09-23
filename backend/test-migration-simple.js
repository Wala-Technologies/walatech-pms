const http = require('http');

// Test the tenant settings API migration
async function testMigration() {
  console.log('Testing tenant settings API migration...');
  
  // Test GET request to see if migration works
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/tenant-settings',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add a simple auth header - you may need to adjust this
      'Authorization': 'Bearer test-token'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('Response Data:', JSON.stringify(parsed, null, 2));
            
            // Check if features are in the new format
            if (parsed.features) {
              console.log('\n=== FEATURES ANALYSIS ===');
              console.log('Features object:', JSON.stringify(parsed.features, null, 2));
              
              // Check for new format
              const newFormatKeys = ['enableInventory', 'enableManufacturing', 'enableAccounting', 'enableHR', 'enableCRM', 'enableProjects'];
              const hasNewFormat = newFormatKeys.some(key => key in parsed.features);
              
              // Check for old format
              const oldFormatKeys = ['inventory', 'production', 'accounting', 'hr', 'crm', 'projects'];
              const hasOldFormat = oldFormatKeys.some(key => key in parsed.features);
              
              console.log('Has new format keys:', hasNewFormat);
              console.log('Has old format keys:', hasOldFormat);
              
              if (hasNewFormat && !hasOldFormat) {
                console.log('✅ Migration successful - using new format');
              } else if (hasOldFormat && !hasNewFormat) {
                console.log('❌ Migration failed - still using old format');
              } else if (hasNewFormat && hasOldFormat) {
                console.log('⚠️ Mixed format detected - partial migration');
              } else {
                console.log('❓ Unknown format detected');
              }
            }
            
            resolve(parsed);
          } catch (e) {
            console.log('Raw response:', data);
            resolve(data);
          }
        } else {
          console.log('Error response:', data);
          resolve({ error: true, statusCode: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });
    
    req.end();
  });
}

// Run the test
testMigration()
  .then(() => {
    console.log('\nTest completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });