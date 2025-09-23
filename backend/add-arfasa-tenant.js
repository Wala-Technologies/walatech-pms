const mysql = require('mysql2/promise');

async function addArfasaTenant() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3300,
    user: 'wala_user',
    password: 'walatech-pass',
    database: 'wala_pms'
  });

  try {
    // Check if arfasa tenant already exists
    const [existingTenant] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['arfasa']
    );

    if (existingTenant.length === 0) {
      // Insert arfasa tenant
      await connection.execute(`
        INSERT INTO tabTenant (
          id, name, subdomain, status, plan, settings, createdAt, updatedAt
        ) VALUES (
          '550e8400-e29b-41d4-a716-446655440001',
          'Arfasa Manufacturing',
          'arfasa',
          'active',
          'enterprise',
          '{"timezone":"UTC","dateFormat":"YYYY-MM-DD","currency":"USD","language":"en"}',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Arfasa tenant created successfully');
    } else {
      console.log('ℹ️  Arfasa tenant already exists');
    }

    // Check if arfasa admin user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM tabUser WHERE email = ?',
      ['admin@arfasa.com']
    );

    if (existingUser.length === 0) {
      // Insert arfasa admin user
      await connection.execute(`
        INSERT INTO tabUser (
          id, email, first_name, last_name, password, enabled, language, time_zone, role_profile_name, tenant_id
        ) VALUES (
          '660e8400-e29b-41d4-a716-446655440002',
          'admin@arfasa.com',
          'Arfasa',
          'Administrator',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxHqi',
          1,
          'en',
          'Africa/Addis_Ababa',
          'Administrator',
          '550e8400-e29b-41d4-a716-446655440001'
        )
      `);
      console.log('✅ Arfasa admin user created successfully');
    } else {
      console.log('ℹ️  Arfasa admin user already exists');
    }

    // Verify data
    const [tenants] = await connection.execute(
      'SELECT name, subdomain, status FROM tabTenant WHERE subdomain = ?',
      ['arfasa']
    );
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, enabled FROM tabUser WHERE email = ?',
      ['admin@arfasa.com']
    );

    console.log('\n📊 Verification:');
    console.log('Tenant:', tenants[0]);
    console.log('User:', users[0]);

    // Show all tenants
    const [allTenants] = await connection.execute(
      'SELECT name, subdomain, status FROM tabTenant ORDER BY subdomain'
    );
    
    console.log('\n🏢 All Tenants:');
    allTenants.forEach(tenant => {
      console.log(`  - ${tenant.subdomain}: ${tenant.name} (${tenant.status})`);
    });

  } catch (error) {
    console.error('❌ Error adding arfasa tenant:', error.message);
  } finally {
    await connection.end();
  }
}

addArfasaTenant();