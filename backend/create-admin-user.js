require('dotenv').config();
const { DataSource } = require('typeorm');
const bcryptjs = require('bcryptjs');

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

async function createAdminUser() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Check if admin user already exists
    const existingAdmin = await dataSource.query(
      'SELECT * FROM tabuser WHERE email = ?',
      ['admin@walatech.com']
    );

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists:', existingAdmin[0]);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      await dataSource.query(
        'UPDATE tabuser SET password = ?, enabled = 1 WHERE email = ?',
        [hashedPassword, 'admin@walatech.com']
      );
      console.log('Updated admin password and enabled status');
    } else {
      // Create new admin user
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      
      await dataSource.query(
        `INSERT INTO tabuser (
          id,
          email, 
          password, 
          first_name, 
          last_name, 
          enabled, 
          role_profile_name,
          language,
          time_zone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin-' + Date.now(),
          'admin@walatech.com',
          hashedPassword,
          'System',
          'Administrator',
          1,
          'Administrator',
          'en',
          'Africa/Addis_Ababa'
        ]
      );
      console.log('Created new admin user');
    }

    // Verify the user
    const adminUser = await dataSource.query(
      'SELECT id, email, first_name, last_name, role_profile_name, enabled FROM tabuser WHERE email = ?',
      ['admin@walatech.com']
    );
    
    console.log('Admin user details:', adminUser[0]);

    await dataSource.destroy();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();