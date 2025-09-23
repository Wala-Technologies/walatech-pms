const mysql = require('mysql2/promise');

async function checkInventoryTables() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3300,
      user: 'root',
      password: 'walatech-pms',
      database: 'wala_pms'
    });

    console.log('✅ Connected to database successfully');

    // Check if inventory tables exist
    const tables = [
      'warehouses',
      'bins', 
      'batches',
      'serial_numbers',
      'stock_entries',
      'stock_entry_details',
      'stock_ledger_entries'
    ];

    console.log('\n📋 Checking inventory tables...');
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          console.log(`✅ Table '${table}' exists`);
          
          // Get table structure
          const [columns] = await connection.execute(`DESCRIBE ${table}`);
          console.log(`   Columns: ${columns.map(col => col.Field).join(', ')}`);
        } else {
          console.log(`❌ Table '${table}' does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}': ${error.message}`);
      }
    }

    // Check existing tables
    console.log('\n📋 All tables in database:');
    const [allTables] = await connection.execute('SHOW TABLES');
    allTables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkInventoryTables();