const mysql = require('mysql2/promise');
const { config } = require('dotenv');
config();

async function createConnection() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE || 'wala_pms';

  console.log(
    `Attempting DB connection -> host=${host} port=${port} user=${user} db=${database}`,
  );

  try {
    return await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });
  } catch (err) {
    if (err && err.code === 'AUTH_SWITCH_PLUGIN_ERROR') {
      console.error(
        '\n⚠️  Authentication plugin mismatch. The MySQL/MariaDB user is using a plugin not supported by mysql2 (e.g., auth_gssapi_client).',
      );
      console.error('👉 Fix by running (as root):');
      console.error(
        "   ALTER USER '" +
          user +
          "'@'localhost' IDENTIFIED WITH mysql_native_password BY 'REPLACE_PASSWORD';",
      );
      console.error('   FLUSH PRIVILEGES;');
      console.error('\nIf using MariaDB and the above fails, try:');
      console.error(
        "   ALTER USER '" +
          user +
          "'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('REPLACE_PASSWORD');",
      );
    }
    throw err;
  }
}

async function seedData() {
  const connection = await createConnection();

  try {
    // Check if tenant already exists
    const [existingTenant] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['walatech'],
    );

    if (existingTenant.length === 0) {
      // Insert tenant
      await connection.execute(`
        INSERT INTO tabTenant (
          id, name, subdomain, status, plan, settings, createdAt, updatedAt
        ) VALUES (
          '550e8400-e29b-41d4-a716-446655440000',
          'WalaTech Manufacturing',
          'walatech',
          'active',
          'enterprise',
          '{"timezone":"UTC","dateFormat":"YYYY-MM-DD","currency":"USD","language":"en"}',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Tenant created successfully');
    } else {
      console.log('ℹ️  Tenant already exists');
    }

    // Check if admin user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM tabUser WHERE email = ?',
      ['admin@walatech.com'],
    );

    if (existingUser.length === 0) {
      // Insert admin user
      await connection.execute(`
        INSERT INTO tabUser (
          id, email, first_name, last_name, password, enabled, language, time_zone, role_profile_name, tenant_id
        ) VALUES (
          '660e8400-e29b-41d4-a716-446655440001',
          'admin@walatech.com',
          'System',
          'Administrator',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxHqi',
          1,
          'en',
          'Africa/Addis_Ababa',
          'Administrator',
          '550e8400-e29b-41d4-a716-446655440000'
        )
      `);
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Verify data
    const [tenants] = await connection.execute(
      'SELECT name, subdomain, status FROM tabTenant WHERE subdomain = ?',
      ['walatech'],
    );
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, enabled FROM tabUser WHERE email = ?',
      ['admin@walatech.com'],
    );

    console.log('\n📊 Verification:');
    console.log('Tenant:', tenants[0]);
    console.log('User:', users[0]);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    if (error.stack)
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
  } finally {
    await connection.end();
  }
}

seedData();
