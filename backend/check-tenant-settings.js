const mysql = require('mysql2/promise');

async function checkTenantSettings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3300,
    user: 'root',
    password: 'walatech-pms',
    database: 'wala_pms'
  });

  try {
    console.log('Checking tenant settings...\n');
    
    // Get all tenants
    const [tenants] = await connection.execute('SELECT id, name, subdomain, settings FROM tabTenant');
    
    console.log('Found tenants:');
    tenants.forEach((tenant, index) => {
      console.log(`\n--- Tenant ${index + 1} ---`);
      console.log(`ID: ${tenant.id}`);
      console.log(`Name: ${tenant.name}`);
      console.log(`Subdomain: ${tenant.subdomain}`);
      console.log(`Settings (raw): ${tenant.settings}`);
      
      if (tenant.settings) {
        try {
          const parsedSettings = JSON.parse(tenant.settings);
          console.log('Parsed Settings:');
          console.log(JSON.stringify(parsedSettings, null, 2));
          
          if (parsedSettings.features) {
            console.log('\nFeatures:');
            console.log(JSON.stringify(parsedSettings.features, null, 2));
          } else {
            console.log('\nNo features found in settings');
          }
        } catch (e) {
          console.log('Error parsing settings JSON:', e.message);
        }
      } else {
        console.log('No settings found');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTenantSettings();