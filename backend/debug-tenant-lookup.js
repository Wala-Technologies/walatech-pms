const mysql = require('mysql2/promise');

async function testTenantLookup() {
  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'walatech-pms',
      database: 'wala_pms'
    });

    console.log('Connected to database successfully');

    // Test tenant lookup by subdomain
    console.log('\n=== Testing tenant lookup by subdomain ===');
    const [tenants] = await connection.execute(
      'SELECT id, name, subdomain, status FROM tabtenant WHERE subdomain = ?',
      ['walatech']
    );

    console.log('Tenants found for subdomain "walatech":', tenants);

    // Test user lookup
    console.log('\n=== Testing user lookup ===');
    const [users] = await connection.execute(
      'SELECT id, email, tenant_id, enabled FROM tabuser WHERE email = ?',
      ['admin@walatech.com']
    );

    console.log('Users found for email "admin@walatech.com":', users);

    // Test combined lookup
    if (tenants.length > 0 && users.length > 0) {
      const tenant = tenants[0];
      const user = users[0];
      
      console.log('\n=== Checking tenant-user relationship ===');
      console.log('Tenant ID:', tenant.id);
      console.log('User tenant_id:', user.tenant_id);
      console.log('Match:', tenant.id === user.tenant_id);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTenantLookup();