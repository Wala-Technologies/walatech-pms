const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function createLemuelDepartments() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'walatech-pms',
    database: process.env.DB_DATABASE || 'wala_pms'
  });

  console.log('Connected to database');

  try {
    // Get Lemuel tenant ID
    const [lemuelTenant] = await connection.execute(
      'SELECT id, name FROM tabTenant WHERE subdomain = ?',
      ['lemuel1']
    );

    if (lemuelTenant.length === 0) {
      console.log('❌ Lemuel tenant not found');
      return;
    }

    const lemuelTenantId = lemuelTenant[0].id;
    console.log('✅ Found Lemuel tenant:', lemuelTenant[0].name, 'ID:', lemuelTenantId);

    // Sample departments for Lemuel Properties
    const departments = [
      {
        name: 'Property Management',
        department_name: 'Property Management',
        description: 'Manages residential and commercial properties'
      },
      {
        name: 'Sales & Leasing',
        department_name: 'Sales & Leasing', 
        description: 'Handles property sales and rental agreements'
      },
      {
        name: 'Maintenance',
        department_name: 'Maintenance',
        description: 'Property maintenance and repairs'
      },
      {
        name: 'Finance',
        department_name: 'Finance',
        description: 'Financial management and accounting'
      }
    ];

    // Check if departments already exist
    const [existingDepts] = await connection.execute(
      'SELECT name FROM tabDepartment WHERE tenant_id = ?',
      [lemuelTenantId]
    );

    if (existingDepts.length > 0) {
      console.log('ℹ️  Lemuel tenant already has departments:');
      existingDepts.forEach(dept => console.log(`  - ${dept.name}`));
      console.log('Skipping department creation...');
      return;
    }

    // Create departments for Lemuel tenant
    console.log('\n🏢 Creating departments for Lemuel Properties...');
    
    for (const dept of departments) {
      const deptId = uuidv4();
      const deptCode = dept.name.replace(/\s+/g, '_').toUpperCase().substring(0, 20);
      
      await connection.execute(
        `INSERT INTO tabDepartment (
          id, name, code, department_name, description, tenant_id, 
          creation, modified, owner, business_unit_type, is_group, disabled
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 'system', 'GENERAL', 0, 0)`,
        [deptId, dept.name, deptCode, dept.department_name, dept.description, lemuelTenantId]
      );
      console.log(`✅ Created department: ${dept.name} (${deptCode})`);
    }

    // Verify creation
    const [newDepts] = await connection.execute(
      'SELECT id, name, description, tenant_id FROM tabDepartment WHERE tenant_id = ?',
      [lemuelTenantId]
    );

    console.log('\n📋 Lemuel Properties departments:');
    newDepts.forEach(dept => {
      console.log(`  - ${dept.name}: ${dept.description}`);
      console.log(`    ID: ${dept.id}, Tenant ID: ${dept.tenant_id}`);
    });

    // Also show WalaTech departments for comparison
    const [walaTechTenant] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['walatech']
    );

    if (walaTechTenant.length > 0) {
      const [walaTechDepts] = await connection.execute(
        'SELECT id, name, description, tenant_id FROM tabDepartment WHERE tenant_id = ?',
        [walaTechTenant[0].id]
      );

      console.log('\n📋 WalaTech Manufacturing departments (for comparison):');
      walaTechDepts.forEach(dept => {
        console.log(`  - ${dept.name}: ${dept.description}`);
        console.log(`    ID: ${dept.id}, Tenant ID: ${dept.tenant_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
  } finally {
    await connection.end();
  }
}

createLemuelDepartments();