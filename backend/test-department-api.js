const axios = require('axios');

async function testDepartmentAPI() {
  try {
    console.log('🧪 Testing Department API with Tenant Isolation...\n');

    // Test different ports to find the backend
    const ports = [3001, 3000, 8000, 8080];
    let baseUrl = null;
    
    console.log('0. Finding backend server...');
    for (const port of ports) {
      try {
        await axios.get(`http://localhost:${port}/api`, { timeout: 2000 });
        baseUrl = `http://localhost:${port}`;
        console.log(`✅ Found backend at ${baseUrl}`);
        break;
      } catch (err) {
        console.log(`   Port ${port}: Not available`);
      }
    }

    if (!baseUrl) {
      console.log('❌ Backend server not found on any common port');
      return;
    }

    // First, let's login as Lemuel user to get a token
    console.log('\n1. Logging in as Lemuel user...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'lemuel@lemuelproperties.com',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log(`✅ Logged in as: ${user.email}`);
    console.log(`   User tenant_id: ${user.tenant_id}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Now test the departments API
    console.log('\n2. Fetching departments for Lemuel tenant...');
    const departmentsResponse = await axios.get(`${baseUrl}/api/departments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const departments = departmentsResponse.data;
    console.log(`✅ Found ${departments.length} departments:`);
    
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code})`);
      console.log(`     ID: ${dept.id}`);
      console.log(`     Tenant ID: ${dept.tenant_id}`);
      console.log(`     Description: ${dept.description || 'N/A'}`);
      console.log('');
    });

    // Verify all departments belong to the correct tenant
    const correctTenantDepts = departments.filter(dept => dept.tenant_id === user.tenant_id);
    const wrongTenantDepts = departments.filter(dept => dept.tenant_id !== user.tenant_id);

    console.log(`\n📊 Tenant Isolation Results:`);
    console.log(`   ✅ Correct tenant departments: ${correctTenantDepts.length}`);
    console.log(`   ❌ Wrong tenant departments: ${wrongTenantDepts.length}`);

    if (wrongTenantDepts.length > 0) {
      console.log('\n⚠️  TENANT ISOLATION ISSUE DETECTED!');
      console.log('   Departments from other tenants:');
      wrongTenantDepts.forEach(dept => {
        console.log(`   - ${dept.name} (tenant: ${dept.tenant_id})`);
      });
    } else {
      console.log('\n🎉 TENANT ISOLATION WORKING CORRECTLY!');
    }

  } catch (error) {
    console.error('❌ Error testing department API:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDepartmentAPI();