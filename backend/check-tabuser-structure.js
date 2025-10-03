const mysql = require('mysql2/promise');

async function checkTabuserStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'wala_pms'
    });

    console.log('Connected to database');
    
    const [rows] = await connection.execute('DESCRIBE tabuser');
    console.log('\ntabuser table structure:');
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if department_id column exists
    const departmentIdColumn = rows.find(row => row.Field === 'department_id');
    if (departmentIdColumn) {
      console.log('\n✅ department_id column exists');
    } else {
      console.log('\n❌ department_id column does NOT exist');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTabuserStructure();