const { DataSource } = require('typeorm');
require('dotenv').config();

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'wala_pms',
  synchronize: false,
  logging: false,
});

async function addDepartmentIdColumn() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Check if department_id column exists
    const columns = await dataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tabuser' AND COLUMN_NAME = 'department_id'
    `, [process.env.DB_DATABASE || 'wala_pms']);

    if (columns && columns.length > 0) {
      console.log('✅ department_id column already exists in tabuser table');
    } else {
      console.log('❌ department_id column does not exist. Adding it now...');
      
      // Add the department_id column
      await dataSource.query(`
        ALTER TABLE tabuser 
        ADD COLUMN department_id VARCHAR(36) NULL
      `);
      
      console.log('✅ Successfully added department_id column to tabuser table');
    }

    // Show current table structure
    const tableStructure = await dataSource.query('DESCRIBE tabuser');
    console.log('\nCurrent tabuser table structure:');
    tableStructure.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addDepartmentIdColumn();