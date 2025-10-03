require('dotenv').config({ path: '.env' }); // Use production .env
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

const createSupplierGroupTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierGroup\` (
    \`id\` varchar(36) NOT NULL,
    \`supplier_group_name\` varchar(140) NOT NULL,
    \`description\` text NULL,
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    UNIQUE INDEX \`IDX_supplier_group_name\` (\`supplier_group_name\`),
    INDEX \`IDX_supplier_group_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_supplier_group_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplier\` (
    \`id\` varchar(36) NOT NULL,
    \`supplier_name\` varchar(140) NOT NULL,
    \`email\` varchar(140) NULL,
    \`supplier_code\` varchar(140) NULL,
    \`supplier_type\` varchar(20) NOT NULL DEFAULT 'Company',
    \`supplier_group\` varchar(36) NULL,
    \`mobile_no\` varchar(20) NULL,
    \`phone\` varchar(20) NULL,
    \`website\` varchar(140) NULL,
    \`gst_category\` varchar(140) NULL,
    \`gstin\` varchar(140) NULL,
    \`pan\` varchar(140) NULL,
    \`default_currency\` varchar(3) NOT NULL DEFAULT 'ETB',
    \`payment_terms\` varchar(140) NULL,
    \`credit_limit\` decimal(18,2) NOT NULL DEFAULT '0.00',
    \`is_frozen\` tinyint NOT NULL DEFAULT '0',
    \`disabled\` tinyint NOT NULL DEFAULT '0',
    \`address_line1\` varchar(140) NULL,
    \`address_line2\` varchar(140) NULL,
    \`city\` varchar(140) NULL,
    \`state\` varchar(140) NULL,
    \`country\` varchar(140) NULL,
    \`pincode\` varchar(20) NULL,
    \`billing_address_line1\` varchar(140) NULL,
    \`billing_address_line2\` varchar(140) NULL,
    \`billing_city\` varchar(140) NULL,
    \`billing_state\` varchar(140) NULL,
    \`billing_country\` varchar(140) NULL,
    \`billing_pincode\` varchar(20) NULL,
    \`shipping_address_line1\` varchar(140) NULL,
    \`shipping_address_line2\` varchar(140) NULL,
    \`shipping_city\` varchar(140) NULL,
    \`shipping_state\` varchar(140) NULL,
    \`shipping_country\` varchar(140) NULL,
    \`shipping_pincode\` varchar(20) NULL,
    \`notes\` text NULL,
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    UNIQUE INDEX \`IDX_supplier_name\` (\`supplier_name\`),
    INDEX \`IDX_supplier_tenant_id\` (\`tenant_id\`),
    INDEX \`IDX_supplier_group_ref\` (\`supplier_group\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_supplier_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT \`FK_supplier_group\` FOREIGN KEY (\`supplier_group\`) REFERENCES \`tabSupplierGroup\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierQuotationTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierQuotation\` (
    \`id\` varchar(36) NOT NULL,
    \`quotation_number\` varchar(140) NOT NULL,
    \`supplier\` varchar(36) NOT NULL,
    \`quotation_date\` date NOT NULL,
    \`valid_till\` date NULL,
    \`status\` varchar(20) NOT NULL DEFAULT 'Draft',
    \`total_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
    \`currency\` varchar(3) NOT NULL DEFAULT 'ETB',
    \`notes\` text NULL,
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    UNIQUE INDEX \`IDX_quotation_number\` (\`quotation_number\`),
    INDEX \`IDX_quotation_supplier\` (\`supplier\`),
    INDEX \`IDX_quotation_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_quotation_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT \`FK_quotation_supplier\` FOREIGN KEY (\`supplier\`) REFERENCES \`tabSupplier\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierQuotationItemTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierQuotationItem\` (
    \`id\` varchar(36) NOT NULL,
    \`quotation\` varchar(36) NOT NULL,
    \`item_code\` varchar(140) NOT NULL,
    \`item_name\` varchar(140) NOT NULL,
    \`description\` text NULL,
    \`quantity\` decimal(18,3) NOT NULL DEFAULT '1.000',
    \`unit_price\` decimal(18,2) NOT NULL DEFAULT '0.00',
    \`amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    INDEX \`IDX_quotation_item_quotation\` (\`quotation\`),
    INDEX \`IDX_quotation_item_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_quotation_item_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT \`FK_quotation_item_quotation\` FOREIGN KEY (\`quotation\`) REFERENCES \`tabSupplierQuotation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierScorecardTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierScorecard\` (
    \`id\` varchar(36) NOT NULL,
    \`scorecard_name\` varchar(140) NOT NULL,
    \`supplier\` varchar(36) NOT NULL,
    \`period\` varchar(36) NOT NULL,
    \`total_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
    \`status\` varchar(20) NOT NULL DEFAULT 'Draft',
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    UNIQUE INDEX \`IDX_scorecard_name\` (\`scorecard_name\`),
    INDEX \`IDX_scorecard_supplier\` (\`supplier\`),
    INDEX \`IDX_scorecard_period\` (\`period\`),
    INDEX \`IDX_scorecard_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_scorecard_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT \`FK_scorecard_supplier\` FOREIGN KEY (\`supplier\`) REFERENCES \`tabSupplier\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierScorecardCriteriaTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierScorecardCriteria\` (
    \`id\` varchar(36) NOT NULL,
    \`scorecard\` varchar(36) NOT NULL,
    \`criteria_name\` varchar(140) NOT NULL,
    \`weight\` decimal(5,2) NOT NULL DEFAULT '0.00',
    \`score\` decimal(5,2) NOT NULL DEFAULT '0.00',
    \`weighted_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    INDEX \`IDX_criteria_scorecard\` (\`scorecard\`),
    INDEX \`IDX_criteria_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_criteria_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT \`FK_criteria_scorecard\` FOREIGN KEY (\`scorecard\`) REFERENCES \`tabSupplierScorecard\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

const createSupplierScorecardPeriodTableSQL = `
CREATE TABLE IF NOT EXISTS \`tabSupplierScorecardPeriod\` (
    \`id\` varchar(36) NOT NULL,
    \`period_name\` varchar(140) NOT NULL,
    \`from_date\` date NOT NULL,
    \`to_date\` date NOT NULL,
    \`status\` varchar(20) NOT NULL DEFAULT 'Active',
    \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`modified_by\` varchar(140) NULL,
    \`owner\` varchar(140) NULL,
    \`tenant_id\` varchar(36) NOT NULL,
    UNIQUE INDEX \`IDX_period_name\` (\`period_name\`),
    INDEX \`IDX_period_tenant_id\` (\`tenant_id\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`FK_period_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB
`;

dataSource.initialize().then(async () => {
  console.log('Production database connected successfully');
  console.log('Database:', process.env.DB_DATABASE);
  
  try {
    console.log('Creating supplier tables in production database...');
    
    await dataSource.query(createSupplierGroupTableSQL);
    console.log('✅ tabSupplierGroup table created/verified');
    
    await dataSource.query(createSupplierTableSQL);
    console.log('✅ tabSupplier table created/verified');
    
    await dataSource.query(createSupplierQuotationTableSQL);
    console.log('✅ tabSupplierQuotation table created/verified');
    
    await dataSource.query(createSupplierQuotationItemTableSQL);
    console.log('✅ tabSupplierQuotationItem table created/verified');
    
    await dataSource.query(createSupplierScorecardTableSQL);
    console.log('✅ tabSupplierScorecard table created/verified');
    
    await dataSource.query(createSupplierScorecardCriteriaTableSQL);
    console.log('✅ tabSupplierScorecardCriteria table created/verified');
    
    await dataSource.query(createSupplierScorecardPeriodTableSQL);
    console.log('✅ tabSupplierScorecardPeriod table created/verified');
    
    console.log('\n🎉 All supplier tables created successfully in production database!');
    
  } catch (error) {
    console.error('❌ Error creating supplier tables:', error.message);
  }
  
  await dataSource.destroy();
}).catch(error => {
  console.error('Database connection error:', error.message);
});