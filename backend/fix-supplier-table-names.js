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

(async () => {
  try {
    await dataSource.initialize();
    console.log('Test database connected successfully');
    console.log('Database:', process.env.DB_DATABASE);
    
    // Rename tables to match entity expectations
    const tableRenames = [
      { from: 'tabsuppliergroup', to: 'tabSupplierGroup' },
      { from: 'tabsupplier', to: 'tabSupplier' },
      { from: 'tabsupplierquotation', to: 'tabSupplierQuotation' },
      { from: 'tabsupplierquotationitem', to: 'tabSupplierQuotationItem' },
      { from: 'tabsupplierscorecard', to: 'tabSupplierScorecard' },
      { from: 'tabsupplierscorecardcriteria', to: 'tabSupplierScorecardCriteria' },
      { from: 'tabsupplierscorecardperiod', to: 'tabSupplierScorecardPeriod' }
    ];
    
    console.log('\nRenaming supplier tables to match entity definitions...');
    
    for (const rename of tableRenames) {
      try {
        await dataSource.query(`RENAME TABLE ${rename.from} TO ${rename.to}`);
        console.log(`✅ Renamed ${rename.from} to ${rename.to}`);
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`⚠️  Table ${rename.from} doesn't exist, skipping`);
        } else if (error.message.includes("already exists")) {
          console.log(`⚠️  Table ${rename.to} already exists, skipping`);
        } else {
          console.error(`❌ Error renaming ${rename.from} to ${rename.to}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Table renaming completed!');
    
    // Verify the new table names
    console.log('\nVerifying renamed tables:');
    const tables = await dataSource.query('SHOW TABLES');
    const supplierTables = tables.filter(table => {
      const tableName = Object.values(table)[0];
      return tableName.toLowerCase().includes('supplier');
    });
    
    supplierTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log('-', tableName);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await dataSource.destroy();
})();