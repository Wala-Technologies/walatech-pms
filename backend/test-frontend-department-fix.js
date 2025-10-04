const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

async function testFrontendDepartmentFix() {
  try {
    console.log('🧪 Testing frontend department creation fix...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    console.log('✅ Connected to database');
    
    // Step 1: Create a test tenant
    const testTenantName = `Frontend Test Company`;
    const testSubdomain = `frontend-test-${Date.now()}`;
    
    console.log(`\n📝 Creating test tenant: ${testTenantName}`);
    
    const tenantResponse = await axios.post('http://localhost:3000/tenant-provisioning/provision', {
      name: testTenantName,
      subdomain: testSubdomain,
      plan: 'basic',
      adminUser: {
        firstName: 'Test',
        lastName: 'Admin',
        email: `admin@${testSubdomain}.com`,
        password: 'TestPassword123!'
      }
    });
    
    console.log('✅ Tenant created successfully');
    const tenantId = tenantResponse.data.tenant.id;
    
    // Step 2: Login as admin to get JWT token
    console.log('\n🔐 Logging in as admin...');
    
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: `admin@${testSubdomain}.com`,
      password: 'TestPassword123!'
    }, {
      headers: {
        'X-Tenant-Subdomain': testSubdomain
      }
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');
    
    // Step 3: Create a department via API (simulating frontend)
    console.log('\n🏢 Creating department via API...');
    
    const departmentData = {
      name: 'TEST_DEPT',
      code: 'TEST',
      department_name: 'Test Department',
      company: testTenantName, // This should be set by frontend
      description: 'Test department for frontend fix verification'
    };
    
    const createDeptResponse = await axios.post('http://localhost:3000/hr/departments', departmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Subdomain': testSubdomain,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Department created via API');
    const createdDepartment = createDeptResponse.data;
    
    // Step 4: Verify the department has correct company name
    console.log('\n🔍 Verifying department company name...');
    
    const [departments] = await connection.execute(`
      SELECT 
        d.id,
        d.name,
        d.department_name,
        d.company,
        d.tenant_id,
        t.name as tenant_name
      FROM tabDepartment d
      LEFT JOIN tabTenant t ON d.tenant_id = t.id
      WHERE d.tenant_id = ? AND d.name = 'TEST_DEPT'
    `, [tenantId]);
    
    if (departments.length === 0) {
      console.log('❌ Department not found in database');
      return;
    }
    
    const department = departments[0];
    console.log(`\n📊 Department Details:`);
    console.log(`  - Name: ${department.name}`);
    console.log(`  - Department Name: ${department.department_name}`);
    console.log(`  - Company: "${department.company}"`);
    console.log(`  - Tenant Name: "${department.tenant_name}"`);
    
    // Check if company matches tenant name
    if (department.company === department.tenant_name) {
      console.log('✅ SUCCESS: Company name matches tenant name!');
    } else {
      console.log(`❌ FAILURE: Company name "${department.company}" does not match tenant name "${department.tenant_name}"`);
    }
    
    // Step 5: Check all auto-created departments for this tenant
    console.log('\n🔍 Checking all departments for this tenant...');
    
    const [allDepartments] = await connection.execute(`
      SELECT 
        d.name,
        d.department_name,
        d.company,
        t.name as tenant_name
      FROM tabDepartment d
      LEFT JOIN tabTenant t ON d.tenant_id = t.id
      WHERE d.tenant_id = ?
      ORDER BY d.name
    `, [tenantId]);
    
    console.log(`\n📋 All departments for tenant "${testTenantName}":`);
    
    let correctCount = 0;
    let totalCount = allDepartments.length;
    
    allDepartments.forEach(dept => {
      const isCorrect = dept.company === dept.tenant_name;
      const status = isCorrect ? '✅' : '❌';
      console.log(`  ${status} ${dept.name} - Company: "${dept.company}"`);
      if (isCorrect) correctCount++;
    });
    
    console.log(`\n📊 Summary: ${correctCount}/${totalCount} departments have correct company names`);
    
    if (correctCount === totalCount) {
      console.log('🎉 ALL DEPARTMENTS HAVE CORRECT COMPANY NAMES!');
    } else {
      console.log(`⚠️  ${totalCount - correctCount} departments still have incorrect company names`);
    }
    
    await connection.end();
    console.log('\n✅ Frontend department fix test completed');
    
  } catch (error) {
    console.error('❌ Error testing frontend department fix:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendDepartmentFix();