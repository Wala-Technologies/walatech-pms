async function testLogin() {
  try {
    console.log('Testing login with admin@walatech.com...');
    
    // Test with subdomain
    console.log('Testing with walatech subdomain...');
    const responseWithSubdomain = await fetch('http://walatech.localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@walatech.com',
        password: 'admin123'
      })
    });

    console.log('Response status:', responseWithSubdomain.status);
    console.log('Response headers:', Object.fromEntries(responseWithSubdomain.headers.entries()));
    
    const responseText = await responseWithSubdomain.text();
    console.log('Response body:', responseText);
    
    if (!responseWithSubdomain.ok) {
      console.error('Login failed with status:', responseWithSubdomain.status);
    } else {
      console.log('Login successful!');
    }
    
  } catch (error) {
    console.error('Error during login test:', error.message);
  }
}

testLogin();