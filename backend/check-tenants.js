const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function checkAndCreateTenants() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'walatech-pms',
    database: process.env.DB_DATABASE || 'wala_pms'
  });

  console.log('Connected to database');

  try {
    // Check existing tenants
    const [tenants] = await connection.execute(
      'SELECT id, name, subdomain, status FROM tabTenant ORDER BY name'
    );

    console.log('\n📊 Existing tenants:');
    tenants.forEach(tenant => {
      console.log(`- ${tenant.name} (${tenant.subdomain}) - ${tenant.status} - ID: ${tenant.id}`);
    });

    // Check if Lemuel tenant exists
    const [lemuelTenant] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['lemuel']
    );

    if (lemuelTenant.length === 0) {
      console.log('\n🔧 Creating Lemuel tenant...');
      
      const lemuelTenantId = uuidv4();
      await connection.execute(`
        INSERT INTO tabTenant (
          id, name, subdomain, status, plan, settings, createdAt, updatedAt
        ) VALUES (
          ?,
          'Lemuel Properties',
          'lemuel',
          'active',
          'enterprise',
          '{"timezone":"UTC","dateFormat":"YYYY-MM-DD","currency":"USD","language":"en"}',
          NOW(),
          NOW()
        )
      `, [lemuelTenantId]);

      console.log('✅ Lemuel tenant created successfully with ID:', lemuelTenantId);

      // Create a super admin user for Lemuel tenant
      const lemuelUserId = uuidv4();
      await connection.execute(`
        INSERT INTO tabUser (
          id, email, first_name, last_name, password, enabled, language, time_zone, role_profile_name, tenant_id
        ) VALUES (
          ?,
          'admin@lemuel.com',
          'Lemuel',
          'Administrator',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxHqi',
          1,
          'en',
          'Africa/Addis_Ababa',
          'Administrator',
          ?
        )
      `, [lemuelUserId, lemuelTenantId]);

      console.log('✅ Lemuel admin user created successfully');
    } else {
      console.log('\nℹ️  Lemuel tenant already exists');
    }

    // Check departments for each tenant
    console.log('\n📋 Departments by tenant:');
    for (const tenant of tenants) {
      const [departments] = await connection.execute(
        'SELECT id, name, description FROM tabDepartment WHERE tenant_id = ?',
        [tenant.id]
      );
      console.log(`\n${tenant.name} (${tenant.subdomain}):`);
      if (departments.length === 0) {
        console.log('  - No departments found');
      } else {
        departments.forEach(dept => {
          console.log(`  - ${dept.name}: ${dept.description || 'No description'}`);
        });
      }
    }

    // Check if Lemuel tenant exists now
    const [updatedLemuelTenant] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['lemuel']
    );

    if (updatedLemuelTenant.length > 0) {
      const lemuelTenantId = updatedLemuelTenant[0].id;
      const [lemuelDepartments] = await connection.execute(
        'SELECT id, name, description FROM tabDepartment WHERE tenant_id = ?',
        [lemuelTenantId]
      );
      
      console.log(`\nLemuel Properties departments:`);
      if (lemuelDepartments.length === 0) {
        console.log('  - No departments found');
      } else {
        lemuelDepartments.forEach(dept => {
          console.log(`  - ${dept.name}: ${dept.description || 'No description'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
  } finally {
    await connection.end();
  }
}

checkAndCreateTenants();