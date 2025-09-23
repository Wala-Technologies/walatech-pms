const mysql = require('mysql2/promise');
const { config } = require('dotenv');

// Load test environment variables
config({ path: '.env.test' });

async function createTestDatabase() {
  let connection;
  
  try {
    // Connect to MySQL without specifying a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins/mysql_native_password'),
      },
    });

    console.log('Connected to MySQL server');

    // Create the test database if it doesn't exist
    const testDbName = process.env.DB_DATABASE || 'wala_pms_test';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${testDbName}\``);
    console.log(`Test database '${testDbName}' created or already exists`);

    // Test connection to the test database
    await connection.execute(`USE \`${testDbName}\``);
    console.log(`Successfully connected to test database '${testDbName}'`);

  } catch (error) {
    console.error('Error creating test database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestDatabase();