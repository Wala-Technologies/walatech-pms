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

async function createScorecardTables() {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');
    
    // Check if scorecard tables already exist
    const tables = await dataSource.query('SHOW TABLES');
    const tableNames = tables.map(table => table[`Tables_in_${process.env.DB_DATABASE}`]);
    
    const scorecardTablesExist = [
      'tabSupplierScorecard',
      'tabSupplierScorecardCriteria', 
      'tabSupplierScorecardPeriod'
    ].some(tableName => tableNames.includes(tableName));
    
    if (scorecardTablesExist) {
      console.log('Some scorecard tables already exist. Skipping creation.');
      await dataSource.destroy();
      return;
    }
    
    console.log('Creating supplier scorecard tables...');
    
    // Create SupplierScorecard table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierScorecard\` (
        \`id\` varchar(36) NOT NULL,
        \`supplier_id\` varchar(140) NOT NULL,
        \`period\` varchar(20) NOT NULL DEFAULT 'Monthly',
        \`current_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`scoring_formula\` text NULL,
        \`supplier_standing\` varchar(140) NULL,
        \`warn_rfqs\` tinyint NOT NULL DEFAULT '0',
        \`warn_pos\` tinyint NOT NULL DEFAULT '0',
        \`prevent_rfqs\` tinyint NOT NULL DEFAULT '0',
        \`prevent_pos\` tinyint NOT NULL DEFAULT '0',
        \`disabled\` tinyint NOT NULL DEFAULT '0',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_scorecard_supplier_id\` (\`supplier_id\`),
        INDEX \`IDX_scorecard_tenant_id\` (\`tenant_id\`),
        UNIQUE INDEX \`IDX_scorecard_supplier_period_tenant\` (\`supplier_id\`, \`period\`, \`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create SupplierScorecardCriteria table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierScorecardCriteria\` (
        \`id\` varchar(36) NOT NULL,
        \`scorecard_id\` varchar(140) NOT NULL,
        \`criteria_name\` varchar(140) NOT NULL,
        \`weight\` decimal(5,2) NOT NULL,
        \`formula\` text NOT NULL,
        \`description\` text NULL,
        \`disabled\` tinyint NOT NULL DEFAULT '0',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_criteria_scorecard_id\` (\`scorecard_id\`),
        INDEX \`IDX_criteria_tenant_id\` (\`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Create SupplierScorecardPeriod table
    await dataSource.query(`
      CREATE TABLE \`tabSupplierScorecardPeriod\` (
        \`id\` varchar(36) NOT NULL,
        \`scorecard_id\` varchar(140) NOT NULL,
        \`period_start\` date NOT NULL,
        \`period_end\` date NOT NULL,
        \`period_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`criteria_scores\` json NULL,
        \`variables\` json NULL,
        \`is_evaluated\` tinyint NOT NULL DEFAULT '0',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_period_scorecard_id\` (\`scorecard_id\`),
        INDEX \`IDX_period_tenant_id\` (\`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('Supplier scorecard tables created successfully');
    
  } catch (error) {
    console.error('Error creating scorecard tables:', error);
  } finally {
    await dataSource.destroy();
  }
}

createScorecardTables();