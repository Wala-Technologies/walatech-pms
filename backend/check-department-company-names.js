const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDepartmentCompanyNames() {
  try {
    console.log('🔍 Checking department company names...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    console.log('✅ Connected to database');
    
    // Get all departments with their tenant info
    const [departments] = await connection.execute(`
      SELECT 
        d.id,
        d.name,
        d.code,
        d.company,
        d.tenant_id,
        t.name as tenant_name,
        t.subdomain
      FROM tabDepartment d
      LEFT JOIN tabTenant t ON d.tenant_id = t.id
      ORDER BY t.name, d.name
    `);
    
    console.log(`\n📊 Found ${departments.length} departments:`);
    
    if (departments.length > 0) {
      console.log('\n📋 Department company names by tenant:');
      
      let currentTenant = null;
      departments.forEach((dept) => {
        if (dept.tenant_name !== currentTenant) {
          currentTenant = dept.tenant_name;
          console.log(`\n🏢 Tenant: ${dept.tenant_name} (${dept.subdomain})`);
        }
        
        const companyMatch = dept.company === dept.tenant_name ? '✅' : '❌';
        console.log(`  ${companyMatch} ${dept.name} (${dept.code}) - Company: "${dept.company}"`);
      });
      
      // Check for mismatches
      const mismatches = departments.filter(dept => dept.company !== dept.tenant_name);
      
      if (mismatches.length > 0) {
        console.log(`\n⚠️  Found ${mismatches.length} departments with incorrect company names:`);
        mismatches.forEach(dept => {
          console.log(`  - ${dept.name} in tenant "${dept.tenant_name}" has company "${dept.company}"`);
        });
      } else {
        console.log('\n✅ All departments have correct company names matching their tenant names!');
      }
      
      // Check for hardcoded "Wala Technologies"
      const walaHardcoded = departments.filter(dept => dept.company === 'Wala Technologies');
      if (walaHardcoded.length > 0) {
        console.log(`\n❌ Found ${walaHardcoded.length} departments with hardcoded "Wala Technologies":`);
        walaHardcoded.forEach(dept => {
          console.log(`  - ${dept.name} in tenant "${dept.tenant_name}" (should be "${dept.tenant_name}")`);
        });
      }
      
    } else {
      console.log('📊 No departments found');
    }
    
    await connection.end();
    console.log('\n✅ Company name check completed');
    
  } catch (error) {
    console.error('❌ Error checking company names:', error.message);
  }
}

checkDepartmentCompanyNames();