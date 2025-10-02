const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAuditTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'walatech_pms'
  });

  try {
    console.log('🔍 Checking if TenantLifecycleAudit table exists...');
    
    // Check if table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tabTenantLifecycleAudit'
    `, [process.env.DB_DATABASE || 'walatech_pms']);
    
    if (tables.length === 0) {
      console.log('❌ TenantLifecycleAudit table does NOT exist');
      return;
    }
    
    console.log('✅ TenantLifecycleAudit table exists');
    
    // Check table structure
    console.log('\n📋 Table structure:');
    const [columns] = await connection.execute(`DESCRIBE tabTenantLifecycleAudit`);
    console.table(columns);
    
    // Check if there are any records
    const [count] = await connection.execute(`SELECT COUNT(*) as count FROM tabTenantLifecycleAudit`);
    console.log(`\n📊 Total records: ${count[0].count}`);
    
    // Test inserting a record to see if there are any issues
    console.log('\n🧪 Testing insert operation...');
    const testId = 'test-' + Date.now();
    const testTenantId = 'test-tenant-' + Date.now();
    
    try {
      await connection.execute(`
        INSERT INTO tabTenantLifecycleAudit 
        (id, tenant_id, action, newStatus, performedBy, reason, createdAt) 
        VALUES (?, ?, 'soft_delete', 'soft_deleted', 'test@example.com', 'Test insert', NOW())
      `, [testId, testTenantId]);
      
      console.log('✅ Insert test successful');
      
      // Clean up test record
      await connection.execute(`DELETE FROM tabTenantLifecycleAudit WHERE id = ?`, [testId]);
      console.log('🧹 Test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('Full error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Error checking audit table:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

checkAuditTable().catch(console.error);