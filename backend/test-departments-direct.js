const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

async function testDepartmentCreationDirect() {
  try {
    console.log('🚀 Testing department auto-creation (direct database check)...');
    
    const baseURL = 'http://localhost:3001/api';
    
    // Step 1: Create a new tenant
    console.log('\n📦 Step 1: Creating new tenant...');
    
    const testTenant = {
      name: 'Direct Test Company',
      subdomain: `direct-test-${Date.now()}`,
      plan: 'basic',
      adminEmail: 'admin@directtest.com',
      adminPassword: 'TestPassword123!',
      adminFirstName: 'Direct',
      adminLastName: 'Admin'
    };
    
    console.log('📝 Test tenant data:', testTenant);
    
    const provisionResponse = await axios.post(`${baseURL}/tenant-provisioning/provision`, testTenant);
    
    if (provisionResponse.status !== 201) {
      console.log('❌ Tenant provisioning failed:', provisionResponse.status);
      return;
    }
    
    console.log('✅ Tenant provisioned successfully!');
    const tenantId = provisionResponse.data.tenant.id;
    const adminUserId = provisionResponse.data.adminUser.id;
    
    console.log('🏢 Tenant ID:', tenantId);
    console.log('👤 Admin User ID:', adminUserId);
    
    // Step 2: Connect to database and check departments
    console.log('\n🔍 Step 2: Checking database for departments...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wala_pms'
    });
    
    console.log('✅ Connected to database');
    
    // Check departments for this tenant
    const [departments] = await connection.execute(
      "SELECT id, name, code, department_name, tenant_id FROM tabDepartment WHERE tenant_id = ? ORDER BY name",
      [tenantId]
    );
    
    console.log(`\n📊 Found ${departments.length} departments for tenant ${tenantId}:`);
    
    if (departments.length > 0) {
      console.log('\n📋 Department list:');
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (${dept.code}) - ${dept.department_name}`);
      });
      
      // Check if we have the expected default departments
      const expectedDepartments = [
        'HR', 'Accounting', 'Purchasing', 'Sales', 'Marketing', 
        'Production', 'IT', 'Finance', 'Operations', 'Legal'
      ];
      
      const foundDepartmentNames = departments.map(d => d.name);
      const missingDepartments = expectedDepartments.filter(name => 
        !foundDepartmentNames.includes(name)
      );
      
      console.log('\n🔍 Department verification:');
      console.log(`✅ Expected: ${expectedDepartments.length} departments`);
      console.log(`✅ Found: ${departments.length} departments`);
      
      if (missingDepartments.length === 0) {
        console.log('🎉 SUCCESS: All expected departments were created!');
      } else {
        console.log(`⚠️  Missing departments: ${missingDepartments.join(', ')}`);
      }
      
    } else {
      console.log('❌ No departments found - auto-creation failed!');
    }
    
    // Step 3: Check admin user
    console.log('\n👤 Step 3: Checking admin user...');
    
    const [users] = await connection.execute(
      "SELECT id, email, first_name, last_name, role_profile_name, tenant_id, enabled FROM tabUser WHERE tenant_id = ?",
      [tenantId]
    );
    
    console.log(`📊 Found ${users.length} users for tenant ${tenantId}:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.first_name} ${user.last_name}) - Role: ${user.role_profile_name}, Enabled: ${user.enabled}`);
    });
    
    await connection.end();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  }
}

testDepartmentCreationDirect();