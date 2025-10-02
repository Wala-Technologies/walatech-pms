const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function testAuditLogMethod() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'walatech_pms'
  });

  try {
    console.log('🔍 Getting a real tenant for testing...');
    
    // Get a real tenant
    const [tenants] = await connection.execute(`
      SELECT id, name, subdomain, status 
      FROM tabtenant 
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
    
    if (tenants.length === 0) {
      console.log('❌ No tenants found in database');
      return;
    }
    
    const testTenant = tenants[0];
    console.log(`✅ Using tenant: ${testTenant.name} (${testTenant.id})`);
    
    // Test the exact same data structure that the service method would create
    const auditData = {
      id: uuidv4(),
      tenant_id: testTenant.id,
      action: 'soft_delete',
      previousStatus: 'active',
      newStatus: 'soft_deleted',
      performedBy: 'test@example.com',
      reason: 'Testing audit log creation',
      scheduledAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      metadata: JSON.stringify({
        retentionPeriodDays: 90,
        hardDeleteScheduledAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      createdAt: new Date()
    };
    
    console.log('\n🧪 Testing audit log creation with service-like data...');
    console.log('Audit data:', auditData);
    
    try {
      await connection.execute(`
        INSERT INTO tabTenantLifecycleAudit 
        (id, tenant_id, action, previousStatus, newStatus, performedBy, reason, scheduledAt, metadata, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        auditData.id,
        auditData.tenant_id,
        auditData.action,
        auditData.previousStatus,
        auditData.newStatus,
        auditData.performedBy,
        auditData.reason,
        auditData.scheduledAt,
        auditData.metadata,
        auditData.createdAt
      ]);
      
      console.log('✅ Audit log creation successful!');
      
      // Verify the record was created
      const [auditRecords] = await connection.execute(`
        SELECT * FROM tabTenantLifecycleAudit WHERE id = ?
      `, [auditData.id]);
      
      console.log('📋 Created audit record:');
      console.table(auditRecords);
      
      // Clean up test record
      await connection.execute(`DELETE FROM tabTenantLifecycleAudit WHERE id = ?`, [auditData.id]);
      console.log('🧹 Test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Audit log creation failed:', insertError.message);
      console.log('SQL State:', insertError.sqlState);
      console.log('Error Code:', insertError.code);
      console.log('Full error:', insertError);
    }
    
    // Test with minimal data (like the service might do)
    console.log('\n🧪 Testing with minimal data...');
    const minimalAuditData = {
      id: uuidv4(),
      tenant_id: testTenant.id,
      action: 'soft_delete',
      newStatus: 'soft_deleted',
      performedBy: 'test@example.com'
    };
    
    try {
      await connection.execute(`
        INSERT INTO tabTenantLifecycleAudit 
        (id, tenant_id, action, newStatus, performedBy) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        minimalAuditData.id,
        minimalAuditData.tenant_id,
        minimalAuditData.action,
        minimalAuditData.newStatus,
        minimalAuditData.performedBy
      ]);
      
      console.log('✅ Minimal audit log creation successful!');
      
      // Clean up test record
      await connection.execute(`DELETE FROM tabTenantLifecycleAudit WHERE id = ?`, [minimalAuditData.id]);
      console.log('🧹 Minimal test record cleaned up');
      
    } catch (insertError) {
      console.log('❌ Minimal audit log creation failed:', insertError.message);
      console.log('Full error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

testAuditLogMethod().catch(console.error);