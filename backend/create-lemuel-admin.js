const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createLemuelAdmin() {
  console.log('🔧 Creating admin user for lemuel1 tenant...\n');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'walatech-pms',
      database: process.env.DB_DATABASE || 'wala_pms'
    });

    console.log('✅ Connected to database');

    // Step 1: Find lemuel1 tenant
    const [tenantRows] = await connection.execute(
      'SELECT * FROM tabtenant WHERE subdomain = ?',
      ['lemuel1']
    );

    if (tenantRows.length === 0) {
      throw new Error('lemuel1 tenant not found');
    }

    const tenant = tenantRows[0];
    console.log(`✅ Found lemuel1 tenant: ${tenant.name} (ID: ${tenant.id})`);

    // Step 2: Check if admin user already exists
    const [existingUserRows] = await connection.execute(
      'SELECT * FROM tabuser WHERE email = ? AND tenant_id = ?',
      ['admin@lemuel1.com', tenant.id]
    );

    if (existingUserRows.length > 0) {
      console.log('⚠️  Admin user already exists for lemuel1 tenant');
      console.log(`   User ID: ${existingUserRows[0].id}`);
      console.log(`   Email: ${existingUserRows[0].email}`);
      console.log(`   Name: ${existingUserRows[0].first_name} ${existingUserRows[0].last_name}`);
      return;
    }

    // Step 3: Create admin user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const now = new Date();

    await connection.execute(`
      INSERT INTO tabuser (
        id, email, password, first_name, last_name, 
        tenant_id, role, enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'admin@lemuel1.com',
      hashedPassword,
      'Admin',
      'User',
      tenant.id,
      'super_admin',
      1
    ]);

    console.log('✅ Created admin user for lemuel1 tenant');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: admin@lemuel1.com`);
    console.log(`   Password: admin123`);
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log(`   Tenant Subdomain: ${tenant.subdomain}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the script
createLemuelAdmin().catch(console.error);