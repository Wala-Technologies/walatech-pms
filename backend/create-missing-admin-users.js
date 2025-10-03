const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

async function createMissingAdminUsers() {
  const connection = await createConnection();

  try {
    // Get tenant IDs
    const [tenants] = await connection.execute(
      'SELECT id, name, subdomain FROM tabTenant WHERE subdomain IN (?, ?)',
      ['arfasa', 'lemuel']
    );

    const arfasaTenant = tenants.find(t => t.subdomain === 'arfasa');
    const lemuelTenant = tenants.find(t => t.subdomain === 'lemuel');

    if (!arfasaTenant || !lemuelTenant) {
      console.error('❌ Could not find Arfasa or Lemuel tenant');
      return;
    }

    console.log(`📋 Found tenants:`);
    console.log(`  Arfasa: ${arfasaTenant.id}`);
    console.log(`  Lemuel: ${lemuelTenant.id}`);

    // Create Arfasa admin user
    const [existingArfasaUser] = await connection.execute(
      'SELECT id FROM tabUser WHERE email = ?',
      ['admin@arfasa.com']
    );

    if (existingArfasaUser.length === 0) {
      const arfasaUserId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await connection.execute(`
        INSERT INTO tabUser (
          id, email, first_name, last_name, password, enabled, language, time_zone, role_profile_name, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        arfasaUserId,
        'admin@arfasa.com',
        'Arfasa',
        'Administrator',
        hashedPassword,
        1,
        'en',
        'Africa/Addis_Ababa',
        'Administrator',
        arfasaTenant.id
      ]);
      console.log('✅ Arfasa admin user created successfully');
    } else {
      console.log('ℹ️  Arfasa admin user already exists');
    }

    // Create Lemuel admin user
    const [existingLemuelUser] = await connection.execute(
      'SELECT id FROM tabUser WHERE email = ?',
      ['lemuel@lemuelproperties.com']
    );

    if (existingLemuelUser.length === 0) {
      const lemuelUserId = uuidv4();
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await connection.execute(`
        INSERT INTO tabUser (
          id, email, first_name, last_name, password, enabled, language, time_zone, role_profile_name, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lemuelUserId,
        'lemuel@lemuelproperties.com',
        'Lemuel',
        'Administrator',
        hashedPassword,
        1,
        'en',
        'Africa/Addis_Ababa',
        'Administrator',
        lemuelTenant.id
      ]);
      console.log('✅ Lemuel admin user created successfully');
    } else {
      console.log('ℹ️  Lemuel admin user already exists');
    }

    // Verify users were created
    const [users] = await connection.execute(
      'SELECT email, tenant_id, enabled FROM tabUser WHERE email IN (?, ?)',
      ['admin@arfasa.com', 'lemuel@lemuelproperties.com']
    );

    console.log('\n👥 Admin Users:');
    users.forEach(user => {
      console.log(`  ${user.email}: tenant_id = ${user.tenant_id}, enabled = ${user.enabled}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createMissingAdminUsers();