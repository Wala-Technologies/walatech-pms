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
  console.log('Checking for Customer tables...');
  
  try {
    const result1 = await dataSource.query('SHOW TABLES LIKE "tabCustomer"');
    console.log('tabCustomer (capital C):', result1.length > 0 ? 'EXISTS' : 'NOT FOUND');
    
    const result2 = await dataSource.query('SHOW TABLES LIKE "tabcustomer"');
    console.log('tabcustomer (lowercase c):', result2.length > 0 ? 'EXISTS' : 'NOT FOUND');
    
    const allTables = await dataSource.query('SHOW TABLES');
    const customerTables = allTables.filter(table => {
      const tableName = table[`Tables_in_${process.env.DB_DATABASE}`];
      return tableName.toLowerCase().includes('customer');
    });
    console.log('All customer-related tables:', customerTables.map(t => t[`Tables_in_${process.env.DB_DATABASE}`]));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await dataSource.destroy();
}).catch(console.error);