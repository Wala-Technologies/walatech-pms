const mysql = require('mysql2/promise');

async function checkDepartmentTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'walatech-pms',
      database: 'wala_pms'
    });

    console.log('Checking tabDepartment table structure...');
    
    const [rows] = await connection.execute('DESCRIBE tabDepartment');
    console.log('\nColumns in tabDepartment:');
    console.log('Field\t\t\tType\t\t\tNull\tKey\tDefault\tExtra');
    console.log('='.repeat(80));
    
    rows.forEach(row => {
      console.log(`${row.Field.padEnd(20)}\t${row.Type.padEnd(20)}\t${row.Null}\t${row.Key}\t${row.Default}\t${row.Extra}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error checking table structure:', error.message);
  }
}

checkDepartmentTable();