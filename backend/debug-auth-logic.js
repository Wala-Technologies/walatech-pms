const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function simulateAuthLogic() {
  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'walatech-pms',
      database: 'wala_pms'
    });

    console.log('Connected to database successfully');

    const email = 'admin@walatech.com';
    const password = 'admin123';
    const requestTenant = null; // Simulating no tenant context from middleware

    console.log('\n=== Simulating Auth Service Logic ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Request Tenant:', requestTenant);

    let user = null;

    if (requestTenant) {
      console.log('Using request tenant...');
      // This branch won't execute since requestTenant is null
    } else {
      console.log('No request tenant, trying fallback logic...');
      
      // Derive subdomain from email domain prefix
      if (email.includes('@')) {
        const derived = email.split('@')[1]?.split('.')[0];
        console.log('Derived subdomain from email:', derived);
        
        if (derived) {
          // Look up tenant by subdomain
          const [tenants] = await connection.execute(
            'SELECT * FROM tabtenant WHERE subdomain = ? AND status = ?',
            [derived, 'active']
          );
          
          console.log('Found tenants for derived subdomain:', tenants.length);
          
          if (tenants.length > 0) {
            const derivedTenant = tenants[0];
            console.log('Derived tenant:', { id: derivedTenant.id, subdomain: derivedTenant.subdomain });
            
            // Look up user by email and tenant_id
            const [users] = await connection.execute(
              'SELECT * FROM tabuser WHERE email = ? AND tenant_id = ?',
              [email, derivedTenant.id]
            );
            
            console.log('Found users for email and tenant:', users.length);
            
            if (users.length > 0) {
              user = users[0];
              console.log('Found user:', { id: user.id, email: user.email, enabled: user.enabled });
            }
          }
        }
      }
    }

    if (!user) {
      console.log('❌ No user found - would throw UnauthorizedException');
      return;
    }

    if (!user.enabled) {
      console.log('❌ User is disabled - would throw UnauthorizedException');
      return;
    }

    // Test password comparison
    console.log('\n=== Testing Password ===');
    console.log('Stored password hash:', user.password);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password - would throw UnauthorizedException');
      return;
    }

    console.log('✅ Login would succeed!');
    console.log('User details:', {
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      enabled: user.enabled
    });

  } catch (error) {
    console.error('❌ Error during simulation:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simulateAuthLogic();