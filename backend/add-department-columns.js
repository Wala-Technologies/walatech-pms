const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDepartmentColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('Adding department_id columns to remaining tables...');

    // Add department_id to sales order table
    try {
      await connection.execute('ALTER TABLE `tabsales order` ADD COLUMN department_id varchar(36) NULL');
      console.log('✓ Added department_id to tabsales order');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ department_id already exists in tabsales order');
      } else {
        console.error('Error adding department_id to tabsales order:', error.message);
      }
    }

    // Add department_id to sales order item table
    try {
      await connection.execute('ALTER TABLE `tabsales order item` ADD COLUMN department_id varchar(36) NULL');
      console.log('✓ Added department_id to tabsales order item');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ department_id already exists in tabsales order item');
      } else {
        console.error('Error adding department_id to tabsales order item:', error.message);
      }
    }

    console.log('Department columns added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addDepartmentColumns();