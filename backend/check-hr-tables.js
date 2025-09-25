const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    const [tables] = await connection.execute('SHOW TABLES LIKE "tab%"');
    console.log('HR Tables found:');
    tables.forEach(table => console.log(Object.values(table)[0]));
    
    // Check specific HR tables
    const hrTables = ['tabDepartment', 'tabEmployee', 'tabAttendance', 'tabDesignation'];
    for (const tableName of hrTables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`${tableName}: ${result[0].count} records`);
      } catch (error) {
        console.log(`${tableName}: Table does not exist or error - ${error.message}`);
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

checkTables();