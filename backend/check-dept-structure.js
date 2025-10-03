const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDepartmentStructure() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'walatech-pms',
    database: process.env.DB_DATABASE || 'wala_pms'
  });

  try {
    console.log('Checking tabDepartment structure...');
    const [rows] = await connection.execute('DESCRIBE tabDepartment');
    
    console.log('\ntabDepartment columns:');
    rows.forEach(row => {
      console.log(`${row.Field} - ${row.Type} - Null: ${row.Null} - Key: ${row.Key} - Default: ${row.Default}`);
    });

    // Also check existing departments
    console.log('\nExisting departments:');
    const [depts] = await connection.execute('SELECT id, name, tenant_id FROM tabDepartment LIMIT 5');
    depts.forEach(dept => {
      console.log(`${dept.name} - Tenant: ${dept.tenant_id}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkDepartmentStructure();