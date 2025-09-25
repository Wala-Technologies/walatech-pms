const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedHRData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'walatech-pms',
    database: process.env.DB_DATABASE || 'wala_pms'
  });

  console.log('Connected to database');

  try {
    // Get tenant ID for 'walatech'
    const [tenantRows] = await connection.execute(
      'SELECT id FROM tabTenant WHERE subdomain = ?',
      ['walatech']
    );

    if (tenantRows.length === 0) {
      console.log('❌ No tenant found with subdomain "walatech"');
      return;
    }

    const tenantId = tenantRows[0].id;
    console.log('Using tenant ID:', tenantId);

    // Sample departments
    const departments = [
      { name: 'Human Resources', department_name: 'Human Resources' },
      { name: 'Engineering', department_name: 'Engineering' },
      { name: 'Sales', department_name: 'Sales' },
      { name: 'Finance', department_name: 'Finance' }
    ];

    // Insert departments
    for (const dept of departments) {
      try {
        const deptId = uuidv4();
        await connection.execute(
          'INSERT INTO tabDepartment (id, name, department_name, tenant_id, creation, modified) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [deptId, dept.name, dept.department_name, tenantId]
        );
        console.log('✅ Created department:', dept.name);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Department already exists:', dept.name);
        } else {
          console.log('❌ Error creating department', dept.name + ':', error.message);
        }
      }
    }

    // Sample designations
    const designations = [
      { name: 'Software Engineer', designation_name: 'Software Engineer' },
      { name: 'Senior Software Engineer', designation_name: 'Senior Software Engineer' },
      { name: 'HR Manager', designation_name: 'HR Manager' },
      { name: 'Sales Representative', designation_name: 'Sales Representative' },
      { name: 'Accountant', designation_name: 'Accountant' }
    ];

    // Insert designations
    for (const designation of designations) {
      try {
        const designationId = uuidv4();
        await connection.execute(
          'INSERT INTO tabDesignation (id, name, designation_name, tenant_id, creation, modified) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [designationId, designation.name, designation.designation_name, tenantId]
        );
        console.log('✅ Created designation:', designation.name);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log('⚠️ Designation already exists:', designation.name);
        } else {
          console.log('❌ Error creating designation', designation.name + ':', error.message);
        }
      }
    }

    // Get department and designation IDs for employee creation
    const [deptRows] = await connection.execute(
      'SELECT id, name FROM tabDepartment WHERE tenant_id = ?',
      [tenantId]
    );

    const [designationRows] = await connection.execute(
      'SELECT id, name FROM tabDesignation WHERE tenant_id = ?',
      [tenantId]
    );

    if (deptRows.length > 0 && designationRows.length > 0) {
      // Sample employees
      const employees = [
        {
          name: 'EMP001',
          employee_name: 'John Doe',
          first_name: 'John',
          last_name: 'Doe',
          company_email: 'john.doe@walatech.com',
          department_id: deptRows[0].id,
          designation_id: designationRows[0].id,
          status: 'Active'
        },
        {
          name: 'EMP002',
          employee_name: 'Jane Smith',
          first_name: 'Jane',
          last_name: 'Smith',
          company_email: 'jane.smith@walatech.com',
          department_id: deptRows[1] ? deptRows[1].id : deptRows[0].id,
          designation_id: designationRows[1] ? designationRows[1].id : designationRows[0].id,
          status: 'Active'
        }
      ];

      // Insert employees
      for (const emp of employees) {
        try {
          const empId = uuidv4();
          await connection.execute(
            'INSERT INTO tabEmployee (id, name, employee_name, first_name, last_name, company_email, department_id, designation_id, status, tenant_id, creation, modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [empId, emp.name, emp.employee_name, emp.first_name, emp.last_name, emp.company_email, emp.department_id, emp.designation_id, emp.status, tenantId]
          );
          console.log('✅ Created employee:', emp.employee_name);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️ Employee already exists:', emp.employee_name);
          } else {
            console.log('❌ Error creating employee', emp.employee_name + ':', error.message);
          }
        }
      }
    }

    console.log('🎉 HR seed data completed successfully!');

  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  } finally {
    await connection.end();
  }
}

seedHRData();