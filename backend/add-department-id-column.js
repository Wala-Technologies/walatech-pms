require('dotenv').config({ path: '.env.test' });
const { DataSource } = require('typeorm');

async function addDepartmentIdColumn() {
  const dataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    console.log('Connected to database');

    // Check if column already exists
    const columns = await dataSource.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'tabuser' 
      AND COLUMN_NAME = 'department_id'
    `, [process.env.DB_DATABASE]);

    if (columns.length > 0) {
      console.log('✅ department_id column already exists in tabuser table');
    } else {
      // Add the department_id column
      await dataSource.query(`
        ALTER TABLE tabuser 
        ADD COLUMN department_id VARCHAR(36) NULL
      `);
      console.log('✅ Added department_id column to tabuser table');
    }

    // Show current table structure
    const tableStructure = await dataSource.query('DESCRIBE tabuser');
    console.log('\nCurrent tabuser table structure:');
    tableStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

addDepartmentIdColumn();