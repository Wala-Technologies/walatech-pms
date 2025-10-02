const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTenantsAndTestAudit() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'walatech_pms'
  });

  try {
    console.log('🔍 Checking existing tenants...');
    
    // Check existing tenants
    const [tenants] = await connection.execute(`
      SELECT id, name, subdomain, status 
      FROM tabtenant 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    
    if (tenants.length === 0) {
      console.log('❌ No tenants found in database');
      return;
    }
    
    console.log('✅ Found tenants:');
    console.table(tenants);
    
    // Use the first tenant for testing
    const testTenant = tenants[0];
    console.log(`\n🧪 Testing audit log creation with tenant: ${testTenant.name} (${testTenant.id})`);
    
    const testId = 'test-audit-' + Date.now();
    
    try {
      await connection.execute(`
        INSERT INTO tabTenantLifecycleAudit 
        (id, tenant_id, action, newStatus, performedBy, reason, createdAt) 
        VALUES (?, ?, 'soft_delete', 'soft_deleted', 'test@example.com', 'Test audit log creation', NOW())
      `, [testId, testTenant.id]);
      
      console.log('✅ Audit log creation successful!');
      
      // Verify the record was created
      const [auditRecords] = await connection.execute(`
        SELECT * FROM tabTenantLifecycleAudit WHERE id = ?
      `, [testId]);
      
      console.log('📋 Created audit record:');
      console.table(auditRecords);
      
      // Clean up test record
      await connection.execute(`DELETE FROM tabTenantLifecycleAudit WHERE id = ?`, [testId]);
      console.log('🧹 Test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Audit log creation failed:', insertError.message);
      console.log('Full error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

checkTenantsAndTestAudit().catch(console.error);