require('dotenv').config({ path: '.env.test' });
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
});

async function createSupplierTables() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    
    // Check if supplier tables already exist
    const tables = await dataSource.query('SHOW TABLES');
    const tableNames = tables.map(table => table[`Tables_in_${process.env.DB_DATABASE}`]);
    
    const supplierTablesExist = [
      'tabSupplier',
      'tabSupplierGroup',
      'tabSupplierQuotation',
      'tabSupplierQuotationItem',
      'tabSupplierScorecard',
      'tabSupplierScorecardCriteria',
      'tabSupplierScorecardPeriod'
    ].some(tableName => tableNames.includes(tableName));
    
    if (supplierTablesExist) {
      console.log('Some supplier tables already exist. Skipping creation.');
      await dataSource.destroy();
      return;
    }
    
    console.log('Creating supplier tables...');
    
    // Create Supplier Group table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierGroup\` (
        \`id\` varchar(36) NOT NULL,
        \`supplier_group_name\` varchar(140) NOT NULL,
        \`parent_supplier_group\` varchar(36) NULL,
        \`is_group\` tinyint NOT NULL DEFAULT '0',
        \`default_payment_terms_template\` varchar(140) NULL,
        \`default_price_list\` varchar(140) NULL,
        \`description\` text NULL,
        \`disabled\` tinyint NOT NULL DEFAULT '0',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NULL,
        UNIQUE INDEX \`IDX_supplier_group_name_tenant\` (\`supplier_group_name\`, \`tenant_id\`),
        INDEX \`IDX_supplier_group_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_supplier_group_parent\` (\`parent_supplier_group\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_supplier_group_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_supplier_group_parent\` FOREIGN KEY (\`parent_supplier_group\`) REFERENCES \`tabSupplierGroup\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
    
    // Create Supplier table
    await dataSource.query(`
      CREATE TABLE \`tabSupplier\` (
        \`id\` varchar(36) NOT NULL,
        \`supplier_name\` varchar(140) NOT NULL,
        \`supplier_code\` varchar(140) NULL,
        \`supplier_type\` varchar(20) NOT NULL DEFAULT 'Company',
        \`supplier_group\` varchar(36) NULL,
        \`email\` varchar(140) NULL,
        \`mobile_no\` varchar(20) NULL,
        \`phone\` varchar(20) NULL,
        \`website\` varchar(140) NULL,
        \`tax_id\` varchar(140) NULL,
        \`gst_category\` varchar(20) NOT NULL DEFAULT 'Unregistered',
        \`gstin\` varchar(15) NULL,
        \`pan\` varchar(10) NULL,
        \`default_currency\` varchar(3) NOT NULL DEFAULT 'ETB',
        \`default_price_list\` varchar(140) NULL,
        \`payment_terms\` varchar(140) NULL,
        \`credit_limit\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NULL,
        UNIQUE INDEX \`IDX_supplier_name_tenant\` (\`supplier_name\`, \`tenant_id\`),
        UNIQUE INDEX \`IDX_supplier_code_tenant\` (\`supplier_code\`, \`tenant_id\`),
        INDEX \`IDX_supplier_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_supplier_group\` (\`supplier_group\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_supplier_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_supplier_group\` FOREIGN KEY (\`supplier_group\`) REFERENCES \`tabSupplierGroup\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
    
    console.log('Supplier tables created successfully!');
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error creating supplier tables:', error.message);
    process.exit(1);
  }
}

createSupplierTables();