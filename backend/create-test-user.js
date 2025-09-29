require('dotenv').config({ path: '.env.test' });
const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
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

    // Check existing users
    const users = await dataSource.query('SELECT id, email, first_name, department_id FROM tabuser');
    console.log('\nExisting users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.first_name}) - dept: ${user.department_id}`);
    });

    // Check if test user exists
    const testUser = users.find(u => u.email === 'test@example.com');
    
    if (!testUser) {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO tabuser (
          id, email, first_name, last_name, password, enabled, 
          language, time_zone, creation, modified, department_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
      `, [
        userId,
        'test@example.com',
        'Test',
        'User',
        hashedPassword,
        1,
        'en',
        'UTC',
        null // department_id as null for now
      ]);
      
      console.log('\n✅ Created test user: test@example.com / password123');
    } else {
      console.log('\n✅ Test user already exists: test@example.com');
    }

    // Check departments
    const departments = await dataSource.query('SELECT * FROM tabdepartment LIMIT 5');
    console.log('\nAvailable departments:');
    departments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.department_name})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

createTestUser();