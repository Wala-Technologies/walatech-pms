const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  const [rows] = await connection.execute('DESCRIBE tabdepartment');
  console.log('All fields in tabdepartment:');
  rows.forEach(row => {
    console.log(`${row.Field}: ${row.Type}, Null: ${row.Null}, Default: ${row.Default}`);
  });
  
  await connection.end();
}

checkTable().catch(console.error);