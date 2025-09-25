const mysql = require('mysql2/promise');

async function checkShiftTypeTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'walatech-pms',
    database: 'wala_pms'
  });

  try {
    console.log('Checking tabShiftType table structure...');
    const [rows] = await connection.execute('DESCRIBE tabShiftType');
    console.log('\nTable structure:');
    console.table(rows);

    console.log('\nChecking if table has any data...');
    const [dataRows] = await connection.execute('SELECT COUNT(*) as count FROM tabShiftType');
    console.log('Row count:', dataRows[0].count);

    if (dataRows[0].count > 0) {
      console.log('\nSample data:');
      const [sampleRows] = await connection.execute('SELECT * FROM tabShiftType LIMIT 3');
      console.table(sampleRows);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkShiftTypeTable();