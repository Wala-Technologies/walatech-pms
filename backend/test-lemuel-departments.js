const axios = require('axios');

async function testLemuelDepartments() {
  try {
    console.log('🔧 Testing department API for lemuel1 tenant...\n');

    // Login as lemuel1 admin
    console.log('🔐 Attempting login...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@lemuel1.com',
      password: 'admin123'
    });

    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      throw new Error(`Login failed with status: ${loginResponse.status}`);
    }

    console.log('✅ Login successful');
    const { access_token } = loginResponse.data;
    
    if (!access_token) {
      throw new Error('No access token received');
    }

    console.log('📄 JWT Token received\n');

    // Test department endpoint
    console.log('🏢 Testing department endpoint...');
    const departmentResponse = await axios.get('http://localhost:3001/api/hr/departments', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (departmentResponse.status === 200) {
      console.log('✅ Successfully accessed departments endpoint');
      console.log('📋 Departments for lemuel1 tenant:');
      
      const departments = departmentResponse.data;
      if (Array.isArray(departments)) {
        departments.forEach((dept, index) => {
          console.log(`   ${index + 1}. ${dept.department_name || dept.name}`);
          if (dept.description) {
            console.log(`      Description: ${dept.description}`);
          }
          if (dept.tenant_id) {
            console.log(`      Tenant ID: ${dept.tenant_id}`);
          }
          console.log('');
        });
        
        console.log(`📊 Total departments: ${departments.length}`);
        
        // Check if these are lemuel1 departments (not walatech)
        const lemuelDepartments = ['Property Management', 'Leasing', 'Maintenance', 'Finance', 'Administration'];
        const walatechDepartments = ['Arfasa Coffee Exporters', 'Arfasa Sack Manufacturing', 'Head Quarter'];
        
        const foundLemuelDepts = departments.filter(dept => 
          lemuelDepartments.some(lemuelDept => 
            (dept.department_name || dept.name).includes(lemuelDept)
          )
        );
        
        const foundWalatechDepts = departments.filter(dept => 
          walatechDepartments.some(walatechDept => 
            (dept.department_name || dept.name).includes(walatechDept)
          )
        );
        
        console.log(`\n🔍 Analysis:`);
        console.log(`   Lemuel departments found: ${foundLemuelDepts.length}`);
        console.log(`   Walatech departments found: ${foundWalatechDepts.length}`);
        
        if (foundLemuelDepts.length > 0 && foundWalatechDepts.length === 0) {
          console.log('✅ SUCCESS: Tenant isolation working correctly - showing only lemuel1 departments');
        } else if (foundWalatechDepts.length > 0) {
          console.log('❌ ISSUE: Still showing walatech departments - tenant isolation may not be working');
        } else {
          console.log('ℹ️  INFO: No recognizable department patterns found');
        }
        
      } else {
        console.log('📋 Department response:', departments);
      }
    } else {
      console.log(`❌ Failed to access departments endpoint. Status: ${departmentResponse.status}`);
    }

  } catch (error) {
    console.log('❌ Error testing departments:', error.message);
    if (error.response) {
      console.log('📋 Error response status:', error.response.status);
      console.log('📋 Error response data:', error.response.data);
    }
  }
}

testLemuelDepartments();