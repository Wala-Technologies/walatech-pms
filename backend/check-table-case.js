require('dotenv').config({ path: '.env.test' });
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
});

(async () => {
  try {
    await dataSource.initialize();
    console.log('Test database connected successfully');
    
    // Try to describe both versions
    const tablesToCheck = [
      'tabSupplier',
      'tabsupplier',
      'tabSupplierGroup', 
      'tabsuppliergroup'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await dataSource.query(`DESCRIBE ${tableName}`);
        console.log(`✅ Table ${tableName} exists (${result.length} columns)`);
      } catch (error) {
        console.log(`❌ Table ${tableName} does not exist`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await dataSource.destroy();
})();