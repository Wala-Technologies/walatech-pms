const mysql = require('mysql2/promise');
const { config } = require('dotenv');
config();

async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms',
    });
    console.log('✅ Database connection established');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function checkTenantIds() {
  const connection = await createConnection();

  try {
    // Get all tenants
    const [tenants] = await connection.execute(
      'SELECT id, name, subdomain FROM tabTenant WHERE subdomain IN (?, ?, ?)',
      ['arfasa', 'lemuel', 'walatech']
    );

    console.log('\n📋 Tenant IDs:');
    tenants.forEach(tenant => {
      console.log(`  ${tenant.name} (${tenant.subdomain}): ${tenant.id}`);
    });

    // Check existing users for these tenants
    console.log('\n👥 Existing Users:');
    const [users] = await connection.execute(
      'SELECT email, tenant_id FROM tabUser WHERE email IN (?, ?, ?)',
      ['admin@arfasa.com', 'lemuel@lemuelproperties.com', 'admin@walatech.com']
    );

    users.forEach(user => {
      console.log(`  ${user.email}: tenant_id = ${user.tenant_id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTenantIds();