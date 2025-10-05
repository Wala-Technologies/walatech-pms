const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDepartmentConstraints() {
  try {
    console.log('🔧 Fixing department constraints...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    console.log('✅ Connected to database');
    
    // Check if the problematic index exists
    console.log('\n🔍 Checking for problematic index...');
    const [indexes] = await connection.execute(
      "SHOW INDEX FROM tabDepartment WHERE Key_name = 'IDX_d9b6ea8a51114b7a304f374039'"
    );
    
    if (indexes.length > 0) {
      console.log('❌ Found problematic global unique constraint on code field');
      console.log('🔧 Dropping the constraint...');
      
      try {
        await connection.execute(
          "DROP INDEX IDX_d9b6ea8a51114b7a304f374039 ON tabDepartment"
        );
        console.log('✅ Successfully dropped the problematic constraint');
      } catch (error) {
        console.log('❌ Error dropping constraint:', error.message);
        await connection.end();
        return;
      }
    } else {
      console.log('✅ No problematic constraint found');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying constraints after fix...');
    const [allIndexes] = await connection.execute(
      "SHOW INDEX FROM tabDepartment"
    );
    
    console.log('📊 Current indexes:');
    const indexGroups = {};
    allIndexes.forEach(idx => {
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
    
    // Check for remaining problems
    const problemIndexes = Object.keys(indexGroups).filter(indexName => {
      const index = indexGroups[indexName];
      return index[0].unique && index.length === 1 && (
        index[0].column === 'code' || 
        index[0].column === 'name'
      );
    });
    
    if (problemIndexes.length > 0) {
      console.log('❌ Still have problematic constraints:');
      problemIndexes.forEach(indexName => {
        const columns = indexGroups[indexName].map(col => col.column).join(', ');
        console.log(`  - ${indexName}: (${columns})`);
      });
    } else {
      console.log('✅ All constraints are now properly tenant-scoped!');
    }
    
    await connection.end();
    console.log('\n✅ Constraint fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing constraints:', error.message);
  }
}

fixDepartmentConstraints();