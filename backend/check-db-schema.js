const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    console.log('✅ Connected to database');
    
    // Check if tabDepartment table exists
    console.log('\n📋 Checking tabDepartment table...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'tabDepartment'"
    );
    
    if (tables.length === 0) {
      console.log('❌ tabDepartment table does not exist');
      await connection.end();
      return;
    }
    
    console.log('✅ tabDepartment table exists');
    
    // Check table structure
    console.log('\n🏗️  Checking table structure...');
    const [columns] = await connection.execute(
      "DESCRIBE tabDepartment"
    );
    
    console.log('📊 Table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''} ${col.Extra || ''}`);
    });
    
    // Check indexes
    console.log('\n🔗 Checking indexes...');
    const [indexes] = await connection.execute(
      "SHOW INDEX FROM tabDepartment"
    );
    
    console.log('📊 Table indexes:');
    const indexGroups = {};
    indexes.forEach(idx => {
      if (!indexGroups[idx.Key_name]) {
        indexGroups[idx.Key_name] = [];
      }
      indexGroups[idx.Key_name].push({
        column: idx.Column_name,
        unique: idx.Non_unique === 0
      });
    });
    
    Object.keys(indexGroups).forEach(indexName => {
      const columns = indexGroups[indexName].map(col => col.column).join(', ');
      const unique = indexGroups[indexName][0].unique ? 'UNIQUE' : 'NON-UNIQUE';
      console.log(`  - ${indexName}: (${columns}) - ${unique}`);
    });
    
    // Check for problematic unique constraints
    console.log('\n⚠️  Checking for problematic constraints...');
    const problemIndexes = Object.keys(indexGroups).filter(indexName => {
      const index = indexGroups[indexName];
      return index[0].unique && index.length === 1 && (
        index[0].column === 'code' || 
        index[0].column === 'name'
      );
    });
    
    if (problemIndexes.length > 0) {
      console.log('❌ Found problematic unique constraints:');
      problemIndexes.forEach(indexName => {
        const columns = indexGroups[indexName].map(col => col.column).join(', ');
        console.log(`  - ${indexName}: (${columns}) - This should be tenant-scoped!`);
      });
      
      // Suggest fix
      console.log('\n🔧 Suggested fixes:');
      problemIndexes.forEach(indexName => {
        console.log(`  DROP INDEX ${indexName} ON tabDepartment;`);
      });
    } else {
      console.log('✅ No problematic unique constraints found');
    }
    
    // Check existing departments
    console.log('\n📋 Checking existing departments...');
    const [departments] = await connection.execute(
      "SELECT id, name, code, tenant_id FROM tabDepartment LIMIT 10"
    );
    
    if (departments.length > 0) {
      console.log(`📊 Found ${departments.length} existing departments:`);
      departments.forEach(dept => {
        console.log(`  - ${dept.name} (${dept.code}) - Tenant: ${dept.tenant_id}`);
      });
    } else {
      console.log('📊 No existing departments found');
    }
    
    await connection.end();
    console.log('\n✅ Database schema check completed');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  }
}

checkDatabaseSchema();