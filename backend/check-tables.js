const mysql = require('mysql2/promise');

async function createDefaultDepartments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'walatech-pms',
    database: 'wala_pms'
  });

  try {
    console.log('=== CREATING DEFAULT DEPARTMENTS FOR LEMUEL1 ===\n');

    // 1. Find lemuel1 tenant
    console.log('1. Finding lemuel1 tenant...');
    const [lemuel1Tenant] = await connection.execute(
      'SELECT * FROM tabtenant WHERE subdomain = ?',
      ['lemuel1']
    );
    
    if (lemuel1Tenant.length === 0) {
      console.log('❌ lemuel1 tenant not found!');
      return;
    }
    
    const lemuel1TenantId = lemuel1Tenant[0].id;
    console.log('✅ lemuel1 tenant found:', {
      id: lemuel1TenantId,
      name: lemuel1Tenant[0].name,
      subdomain: lemuel1Tenant[0].subdomain
    });
    console.log('');

    // 2. Check tabdepartment table structure
    console.log('2. Checking tabdepartment table structure...');
    const [deptColumns] = await connection.execute('DESCRIBE tabdepartment');
    console.log('tabdepartment columns:', deptColumns.map(col => `${col.Field} (${col.Type})`).join(', '));
    console.log('');

    // 3. Check existing departments
    console.log('3. Checking existing departments for lemuel1...');
    const [existingDepartments] = await connection.execute(
      'SELECT * FROM tabdepartment WHERE tenant_id = ?',
      [lemuel1TenantId]
    );
    console.log(`Found ${existingDepartments.length} existing departments`);
    console.log('');

    // 4. Define default departments for property management
    const defaultDepartments = [
      {
        name: 'Property Management',
        code: 'PROP-MGT',
        description: 'Manages property operations and maintenance',
        department_name: 'Property Management',
        business_unit_type: 'OPERATIONS'
      },
      {
        name: 'Leasing',
        code: 'LEASE',
        description: 'Handles tenant leasing and relations',
        department_name: 'Leasing',
        business_unit_type: 'SALES'
      },
      {
        name: 'Maintenance',
        code: 'MAINT',
        description: 'Property maintenance and repairs',
        department_name: 'Maintenance',
        business_unit_type: 'OPERATIONS'
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Financial operations and accounting',
        department_name: 'Finance',
        business_unit_type: 'FINANCE'
      },
      {
        name: 'Administration',
        code: 'ADMIN',
        description: 'General administration and management',
        department_name: 'Administration',
        business_unit_type: 'GENERAL'
      }
    ];

    // 5. Create departments
    console.log('4. Creating default departments...');
    const { v4: uuidv4 } = require('uuid');
    
    for (const dept of defaultDepartments) {
      // Check if department already exists
      const [existing] = await connection.execute(
        'SELECT id FROM tabdepartment WHERE name = ? AND tenant_id = ?',
        [dept.name, lemuel1TenantId]
      );
      
      if (existing.length > 0) {
        console.log(`  ⚠️  Department "${dept.name}" already exists, skipping...`);
        continue;
      }
      
      // Create new department with all required fields
      const departmentId = uuidv4();
      const now = new Date();
      await connection.execute(`
        INSERT INTO tabdepartment (
          id, name, code, description, department_name, tenant_id, 
          business_unit_type, is_group, disabled, owner, creation, modified, modified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        departmentId,
        dept.name,
        dept.code,
        dept.description,
        dept.department_name,
        lemuel1TenantId,
        dept.business_unit_type,
        0, // is_group = false
        0, // disabled = false
        'system',
        now,
        now,
        'system'
      ]);
      
      console.log(`  ✅ Created department: ${dept.name} (ID: ${departmentId})`);
    }
    
    console.log('');

    // 6. Verify departments were created
    console.log('5. Verifying created departments...');
    const [newDepartments] = await connection.execute(
      'SELECT id, name, description, tenant_id FROM tabdepartment WHERE tenant_id = ?',
      [lemuel1TenantId]
    );
    
    console.log(`✅ Total departments for lemuel1: ${newDepartments.length}`);
    newDepartments.forEach(dept => {
      console.log(`  - ${dept.name}: ${dept.description}`);
    });
    
    console.log('\n🎉 Default departments created successfully for lemuel1 tenant!');
    console.log('You should now be able to see departments when accessing the lemuel1 tenant.');

  } catch (error) {
    console.error('Error in createDefaultDepartments:', error);
  } finally {
    await connection.end();
  }
}

createDefaultDepartments();