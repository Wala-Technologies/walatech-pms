const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    // Get tenant ID
    const [tenantRows] = await connection.execute('SELECT id FROM tabTenant WHERE name = ?', ['WalaTech Manufacturing']);
    let tenantId = tenantRows[0]?.id;
    
    if (!tenantId) {
      console.log('No tenant found, creating one...');
      tenantId = 'walatech-001';
      await connection.execute('INSERT INTO tabTenant (id, name, subdomain, status, plan) VALUES (?, ?, ?, ?, ?)', 
        [tenantId, 'WalaTech Manufacturing', 'walatech', 'active', 'enterprise']);
    }

    // Get department ID for Engineering
    let [deptRows] = await connection.execute('SELECT name FROM tabdepartment WHERE name = ?', ['Engineering']);
    if (deptRows.length === 0) {
      console.log('Creating departments...');
      await connection.execute(`
        INSERT INTO tabdepartment (
          id, name, tenant_id, code, business_unit_type, 
          is_group, disabled, owner, modified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['dept-eng-001', 'Engineering', tenantId, 'ENG', 'PRODUCTION', 0, 0, 'Administrator', 'Administrator']);
      
      await connection.execute(`
        INSERT INTO tabdepartment (
          id, name, tenant_id, code, business_unit_type, 
          is_group, disabled, owner, modified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['dept-sal-001', 'Sales', tenantId, 'SAL', 'SALES', 0, 0, 'Administrator', 'Administrator']);
      
      await connection.execute(`
        INSERT INTO tabdepartment (
          id, name, tenant_id, code, business_unit_type, 
          is_group, disabled, owner, modified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['dept-fin-001', 'Finance', tenantId, 'FIN', 'FINANCE', 0, 0, 'Administrator', 'Administrator']);
    }

    // Hash password with bcrypt salt rounds 12 (same as auth service)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('Generated password hash:', hashedPassword);

    // Create admin user
    await connection.execute('DELETE FROM tabuser WHERE email = ?', ['admin@walatech.com']);
    
    await connection.execute(`
      INSERT INTO tabuser (
        id, email, password, first_name, last_name, 
        tenant_id, department_id, enabled, role_profile_name,
        time_zone, language, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'admin-001',
      'admin@walatech.com', 
      hashedPassword,
      'Admin',
      'User',
      tenantId,
      'Engineering',
      1,
      'System Manager',
      'Africa/Addis_Ababa',
      'en'
    ]);

    console.log('✅ Admin user created successfully');
    
    // Verify user was created
    const [userRows] = await connection.execute('SELECT email, first_name, last_name, enabled FROM tabuser WHERE email = ?', ['admin@walatech.com']);
    console.log('Created user:', userRows[0]);

    // Create some sample suppliers for testing
    console.log('Creating sample suppliers...');
    await connection.execute('DELETE FROM tabsupplier WHERE supplier_name LIKE ?', ['%Supplier%']);
    
    const suppliers = [
      ['Tech Supplier 1', 'Engineering'],
      ['Sales Supplier 1', 'Sales'], 
      ['Finance Supplier 1', 'Finance'],
      ['Tech Supplier 2', 'Engineering']
    ];

    for (const [name, dept] of suppliers) {
      await connection.execute(`
        INSERT INTO tabsupplier (
          name, supplier_name, tenant_id, department_id, 
          supplier_type, country, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        name.toLowerCase().replace(/\s+/g, '-'),
        name,
        tenantId,
        dept,
        'Company',
        'Ethiopia'
      ]);
    }

    console.log('✅ Sample suppliers created successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser().catch(console.error);