require('dotenv').config();
const { DataSource } = require('typeorm');
const bcryptjs = require('bcryptjs');

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
});

async function checkTenantsAndFixAdmin() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Check existing tenants
    const tenants = await dataSource.query('SELECT * FROM tabtenant');
    console.log('\nExisting tenants:');
    tenants.forEach(tenant => {
      console.log(`- ID: ${tenant.id}, Subdomain: ${tenant.subdomain}, Name: ${tenant.name}, Status: ${tenant.status}`);
    });

    // Check admin user
    const adminUser = await dataSource.query(
      'SELECT * FROM tabuser WHERE email = ?',
      ['admin@walatech.com']
    );
    
    if (adminUser.length > 0) {
      console.log('\nAdmin user details:');
      console.log(adminUser[0]);
      
      // Find the walatech tenant (super admin tenant)
      const walaTechTenant = tenants.find(t => t.subdomain === 'walatech' || t.subdomain === 'admin');
      
      if (walaTechTenant) {
        console.log(`\nFound super admin tenant: ${walaTechTenant.subdomain} (${walaTechTenant.id})`);
        
        // Update admin user to have correct tenant_id
        await dataSource.query(
          'UPDATE tabuser SET tenant_id = ? WHERE email = ?',
          [walaTechTenant.id, 'admin@walatech.com']
        );
        console.log('Updated admin user tenant_id');
        
        // Verify the update
        const updatedAdmin = await dataSource.query(
          'SELECT id, email, first_name, last_name, tenant_id, enabled FROM tabuser WHERE email = ?',
          ['admin@walatech.com']
        );
        console.log('\nUpdated admin user:', updatedAdmin[0]);
      } else {
        console.log('\nNo super admin tenant found. Creating one...');
        
        // Create a super admin tenant
        const tenantId = 'walatech-' + Date.now();
        await dataSource.query(
          `INSERT INTO tabtenant (id, subdomain, name, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [tenantId, 'walatech', 'WalaTech Super Admin', 'active']
        );
        
        // Update admin user
        await dataSource.query(
          'UPDATE tabuser SET tenant_id = ? WHERE email = ?',
          [tenantId, 'admin@walatech.com']
        );
        
        console.log(`Created super admin tenant: ${tenantId}`);
      }
    } else {
      console.log('\nNo admin user found');
    }

    await dataSource.destroy();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTenantsAndFixAdmin();