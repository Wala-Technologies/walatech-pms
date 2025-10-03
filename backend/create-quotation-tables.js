const { DataSource } = require('typeorm');
require('dotenv').config({ path: '.env.test' });

const dataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wala_pms_test',
});

async function createQuotationTables() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    
    // Check if quotation tables already exist
    const tables = await dataSource.query('SHOW TABLES');
    const tableNames = tables.map(table => table[`Tables_in_${process.env.DB_DATABASE}`]);
    
    const quotationTablesExist = [
      'tabSupplierQuotation',
      'tabSupplierQuotationItem'
    ].some(tableName => tableNames.includes(tableName));
    
    if (quotationTablesExist) {
      console.log('Some quotation tables already exist. Skipping creation.');
      await dataSource.destroy();
      return;
    }
    
    console.log('Creating supplier quotation tables...');
    
    // Create SupplierQuotation table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierQuotation\` (
        \`id\` varchar(36) NOT NULL,
        \`quotation_number\` varchar(140) NOT NULL,
        \`supplier_id\` varchar(140) NOT NULL,
        \`quotation_date\` date NOT NULL,
        \`valid_till\` date NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'Draft',
        \`currency\` varchar(3) NOT NULL DEFAULT 'ETB',
        \`conversion_rate\` decimal(21,9) NOT NULL DEFAULT '1.000000000',
        \`total_qty\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_net_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`total_taxes_and_charges\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_total_taxes_and_charges\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_grand_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`grand_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`additional_discount_percentage\` decimal(6,2) NOT NULL DEFAULT '0.00',
        \`discount_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`tax_category\` varchar(140) NULL,
        \`shipping_rule\` varchar(140) NULL,
        \`purchase_taxes_and_charges_template\` varchar(140) NULL,
        \`payment_terms_template\` varchar(140) NULL,
        \`terms_and_conditions\` text NULL,
        \`notes\` text NULL,
        \`material_request\` varchar(140) NULL,
        \`opportunity\` varchar(140) NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_quotation_supplier_id\` (\`supplier_id\`),
        INDEX \`IDX_quotation_tenant_id\` (\`tenant_id\`),
        UNIQUE INDEX \`IDX_quotation_number_tenant\` (\`quotation_number\`, \`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create SupplierQuotationItem table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierQuotationItem\` (
        \`id\` varchar(36) NOT NULL,
        \`quotation_id\` varchar(140) NOT NULL,
        \`item_code\` varchar(140) NOT NULL,
        \`item_name\` varchar(140) NULL,
        \`description\` text NULL,
        \`item_group\` varchar(140) NULL,
        \`brand\` varchar(140) NULL,
        \`qty\` decimal(18,6) NOT NULL,
        \`uom\` varchar(50) NULL,
        \`stock_uom\` varchar(50) NULL,
        \`conversion_factor\` decimal(21,9) NOT NULL DEFAULT '1.000000000',
        \`stock_qty\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`rate\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_rate\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`base_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`price_list_rate\` varchar(140) NULL,
        \`discount_percentage\` decimal(6,2) NOT NULL DEFAULT '0.00',
        \`discount_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`net_rate\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`net_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_net_rate\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`base_net_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
        \`expected_delivery_date\` date NULL,
        \`warehouse\` varchar(140) NULL,
        \`project\` varchar(140) NULL,
        \`material_request\` varchar(140) NULL,
        \`material_request_item\` varchar(140) NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_quotation_item_quotation_id\` (\`quotation_id\`),
        INDEX \`IDX_quotation_item_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_quotation_item_code\` (\`item_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Supplier quotation tables created successfully');
    
  } catch (error) {
    console.error('Error creating quotation tables:', error);
  } finally {
    await dataSource.destroy();
  }
}

createQuotationTables();