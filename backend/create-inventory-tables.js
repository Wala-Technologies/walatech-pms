const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createInventoryTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3300,
    user: 'root',
    password: 'walatech-pms',
    database: 'wala_pms'
  });

  try {
    console.log('🔗 Connected to database');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-inventory-tables.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} failed (might already exist): ${error.message}`);
        }
      }
    }
    
    console.log('🎉 Inventory tables creation completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createInventoryTables();