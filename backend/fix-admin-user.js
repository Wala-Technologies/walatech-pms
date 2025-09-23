const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3300'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'walatech-pms',
    database: process.env.DB_DATABASE || 'wala_pms'
  });

  try {
    console.log('Connected to database');

    // Get tenant ID first
    const [tenants] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['walatech']
    );

    if (tenants.length === 0) {
      console.log('Tenant not found. Please run setup-admin-user.sql first');
      return;
    }

    const tenantId = tenants[0].id;
    console.log('Tenant ID:', tenantId);

    // Check if admin user exists
    const [users] = await connection.execute(
      'SELECT id, email, tenant_id FROM tabUser WHERE email = ?',
      ['admin@walatech.com']
    );

    // Use the correct bcrypt hash for 'admin123'
    const correctPasswordHash = '$2b$12$5J8Zjp6TOHiw5FFF2SHWVucc57FZmBxPEBYdty3dhhZ1BgRR1icOK';

    if (users.length === 0) {
      console.log('Admin user not found. Creating admin user...');
      
      // Create admin user with correct bcrypt hash
      await connection.execute(`
        INSERT INTO tabUser (
          id,
          email,
          first_name,
          last_name,
          password,
          enabled,
          language,
          time_zone,
          tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        '660e8400-e29b-41d4-a716-446655440001',
        'admin@walatech.com',
        'System',
        'Administrator',
        correctPasswordHash,
        1,
        'en',
        'Africa/Addis_Ababa',
        tenantId
      ]);
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user found. Updating password and tenant_id...');
      
      // Update admin user with correct password hash and tenant_id
      await connection.execute(
        'UPDATE tabUser SET password = ?, tenant_id = ? WHERE email = ?',
        [correctPasswordHash, tenantId, 'admin@walatech.com']
      );
      
      console.log('Admin user updated successfully');
    }

    // Verify the final state
    const [finalUsers] = await connection.execute(
      'SELECT email, first_name, last_name, tenant_id, enabled FROM tabUser WHERE email = ?',
      ['admin@walatech.com']
    );

    console.log('Final admin user state:', finalUsers[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixAdminUser();