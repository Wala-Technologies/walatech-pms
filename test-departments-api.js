const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function loginAndTestDepartments() {
  try {
    console.log('Step 1: Attempting to login...');
    
    // Login to get token
    const loginOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'x-tenant-subdomain': 'walatech',
        'Content-Type': 'application/json'
      }
    };

    const loginData = JSON.stringify({
      email: 'admin@walatech.com',
      password: 'admin123' // Common default password, might need to be changed
    });

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login Status:', loginResponse.statusCode);
    console.log('Login Response:', loginResponse.data);

    if (loginResponse.statusCode === 200 || loginResponse.statusCode === 201) {
      const loginResult = JSON.parse(loginResponse.data);
      const token = loginResult.access_token;
      
      console.log('\nStep 2: Testing departments API with valid token...');
      
      // Test departments API with token
      const departmentsOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/hr/departments',
        method: 'GET',
        headers: {
          'x-tenant-subdomain': 'walatech',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const departmentsResponse = await makeRequest(departmentsOptions);
      console.log('Departments Status:', departmentsResponse.statusCode);
      console.log('Departments Response:', departmentsResponse.data);

      if (departmentsResponse.statusCode === 200) {
        try {
          const departments = JSON.parse(departmentsResponse.data);
          console.log('\nParsed departments:', JSON.stringify(departments, null, 2));
          console.log('Number of departments:', departments.length);
          
          if (departments.length > 0) {
            console.log('\nDepartment IDs:');
            departments.forEach(dept => {
              console.log(`- ${dept.id}: ${dept.department_name || dept.name}`);
            });
          }
        } catch (error) {
          console.error('Error parsing departments JSON:', error);
        }
      }
    } else {
      console.log('Login failed. Trying with different password...');
      
      // Try with different common passwords
      const passwords = ['password', '123456', 'admin', 'walatech'];
      
      for (const password of passwords) {
        console.log(`Trying password: ${password}`);
        const testLoginData = JSON.stringify({
          email: 'admin@walatech.com',
          password: password
        });
        
        const testResponse = await makeRequest(loginOptions, testLoginData);
        console.log(`Password ${password} - Status:`, testResponse.statusCode);
        
        if (testResponse.statusCode === 200) {
          console.log('Success with password:', password);
          const loginResult = JSON.parse(testResponse.data);
          const token = loginResult.access_token;
          
          // Test departments API
          const departmentsOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/hr/departments',
            method: 'GET',
            headers: {
              'x-tenant-subdomain': 'walatech',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };

          const departmentsResponse = await makeRequest(departmentsOptions);
          console.log('Departments Status:', departmentsResponse.statusCode);
          console.log('Departments Response:', departmentsResponse.data);
          break;
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Testing login and departments API...');
loginAndTestDepartments();