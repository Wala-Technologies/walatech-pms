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

dataSource.initialize().then(async () => {
  console.log('Test database connected successfully');
  console.log('Database:', process.env.DB_DATABASE);
  
  try {
    const tables = await dataSource.query('SHOW TABLES');
    console.log('\nExisting tables:');
    tables.forEach(table => {
      const tableName = table[`Tables_in_${process.env.DB_DATABASE}`];
      console.log('-', tableName);
    });
    
    const customerTableExists = tables.some(table => 
      table[`Tables_in_${process.env.DB_DATABASE}`] === 'tabCustomer'
    );
    console.log('\nCustomer table exists:', customerTableExists);
    
    if (!customerTableExists) {
      console.log('\n❌ tabCustomer table is missing - this is causing the 500 errors');
    }
  } catch (error) {
    console.error('Query error:', error.message);
  }
  
  await dataSource.destroy();
}).catch(error => {
  console.error('Database connection error:', error.message);
});