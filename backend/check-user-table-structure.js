require('dotenv').config();
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
});

async function checkUserTableStructure() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Check table structure
    const columns = await dataSource.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tabuser'
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_DATABASE]
    );

    console.log('tabuser table structure:');
    columns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE}, default: ${col.COLUMN_DEFAULT})`);
    });

    // Check existing users
    const users = await dataSource.query('SELECT * FROM tabuser LIMIT 5');
    console.log('\nExisting users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.first_name} ${user.last_name}`);
    });

    await dataSource.destroy();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error checking table structure:', error);
    process.exit(1);
  }
}

checkUserTableStructure();