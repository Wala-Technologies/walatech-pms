const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'walatech-pms',
  database: 'wala_pms'
};

async function createSuperAdmin() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');
    
    // Check if super admin already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM tabuser WHERE email = 'super@admin.com'"
    );
    
    if (existingUsers.length > 0) {
      console.log('Super admin already exists');
      return;
    }
    
    // Hash the password
    const password = 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create super admin user
    const userId = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await connection.execute(`
      INSERT INTO tabuser (
        id, email, password, role, first_name, last_name, 
        creation, modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'super@admin.com',
      hashedPassword,
      'super_admin',
      'Super',
      'Admin',
      now,
      now
    ]);
    
    console.log('✅ Super admin created successfully');
    console.log('Email: super@admin.com');
    console.log('Password: SuperAdmin123!');
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSuperAdmin();