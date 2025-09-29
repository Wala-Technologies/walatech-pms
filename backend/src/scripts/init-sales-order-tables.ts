import { AppDataSource } from '../data-source';

async function initSalesOrderTables() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    const queryRunner = AppDataSource.createQueryRunner();

    // Check if tables exist
    const salesOrderTableExists = await queryRunner.hasTable('tabSales Order');
    const salesOrderItemTableExists = await queryRunner.hasTable('tabSales Order Item');

    console.log('Sales Order table exists:', salesOrderTableExists);
    console.log('Sales Order Item table exists:', salesOrderItemTableExists);

    if (!salesOrderTableExists) {
      console.log('Creating Sales Order table...');
      await queryRunner.query(`
        CREATE TABLE \`tabSales Order\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` varchar(140) NOT NULL,
          \`customer_id\` varchar(140) NOT NULL,
          \`customer_name\` varchar(140) NOT NULL,
          \`transaction_date\` date NOT NULL,
          \`delivery_date\` date NOT NULL,
          \`order_type\` enum('Sales', 'Maintenance', 'Shopping Cart') NOT NULL DEFAULT 'Sales',
          \`status\` enum('Draft', 'On Hold', 'To Deliver and Bill', 'To Bill', 'To Deliver', 'Completed', 'Cancelled', 'Closed') NOT NULL DEFAULT 'Draft',
          \`currency\` varchar(3) NOT NULL DEFAULT 'ETB',
          \`conversion_rate\` decimal(18,6) NOT NULL DEFAULT 1.0,
          \`selling_price_list\` varchar(140) NULL,
          \`total_qty\` decimal(18,6) NOT NULL DEFAULT 0,
          \`base_total\` decimal(18,2) NOT NULL DEFAULT 0,
          \`base_net_total\` decimal(18,2) NOT NULL DEFAULT 0,
          \`total_taxes_and_charges\` decimal(18,2) NOT NULL DEFAULT 0,
          \`base_grand_total\` decimal(18,2) NOT NULL DEFAULT 0,
          \`grand_total\` decimal(18,2) NOT NULL DEFAULT 0,
          \`advance_paid\` decimal(18,2) NOT NULL DEFAULT 0,
          \`customer_po_no\` varchar(140) NULL,
          \`customer_po_date\` date NULL,
          \`terms\` text NULL,
          \`remarks\` text NULL,
          \`territory\` varchar(140) NULL,
          \`sales_person\` varchar(140) NULL,
          \`commission_rate\` decimal(18,2) NOT NULL DEFAULT 0,
          \`total_commission\` decimal(18,2) NOT NULL DEFAULT 0,
          \`docstatus\` int NOT NULL DEFAULT 0,
          \`is_return\` tinyint NOT NULL DEFAULT 0,
          \`skip_delivery_note\` tinyint NOT NULL DEFAULT 0,
          \`company_address\` varchar(140) NULL,
          \`customer_address\` varchar(140) NULL,
          \`shipping_address\` varchar(140) NULL,
          \`contact_person\` varchar(140) NULL,
          \`contact_email\` varchar(140) NULL,
          \`contact_mobile\` varchar(20) NULL,
          \`tenant_id\` varchar(36) NOT NULL,
          \`owner\` varchar(140) NULL,
          \`modified_by\` varchar(140) NULL,
          \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          \`idx\` int NOT NULL DEFAULT 0,
          UNIQUE INDEX \`IDX_sales_order_name\` (\`name\`),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
      console.log('Sales Order table created successfully');
    }

    if (!salesOrderItemTableExists) {
      console.log('Creating Sales Order Item table...');
      await queryRunner.query(`
        CREATE TABLE \`tabSales Order Item\` (
          \`id\` varchar(36) NOT NULL,
          \`sales_order_id\` varchar(36) NOT NULL,
          \`item_code\` varchar(140) NOT NULL,
          \`item_name\` varchar(140) NOT NULL,
          \`description\` text NULL,
          \`qty\` decimal(18,6) NOT NULL,
          \`rate\` decimal(18,2) NOT NULL,
          \`amount\` decimal(18,2) NOT NULL,
          \`base_rate\` decimal(18,2) NOT NULL,
          \`base_amount\` decimal(18,2) NOT NULL,
          \`delivery_date\` date NOT NULL,
          \`warehouse\` varchar(140) NULL,
          \`uom\` varchar(50) NOT NULL DEFAULT 'Nos',
          \`stock_uom\` varchar(50) NOT NULL DEFAULT 'Nos',
          \`conversion_factor\` decimal(18,6) NOT NULL DEFAULT 1.0,
          \`delivered_qty\` decimal(18,6) NOT NULL DEFAULT 0,
          \`billed_qty\` decimal(18,6) NOT NULL DEFAULT 0,
          \`returned_qty\` decimal(18,6) NOT NULL DEFAULT 0,
          \`discount_percentage\` decimal(18,2) NOT NULL DEFAULT 0,
          \`discount_amount\` decimal(18,2) NOT NULL DEFAULT 0,
          \`net_rate\` decimal(18,2) NOT NULL DEFAULT 0,
          \`net_amount\` decimal(18,2) NOT NULL DEFAULT 0,
          \`item_group\` varchar(140) NULL,
          \`brand\` varchar(140) NULL,
          \`image\` text NULL,
          \`item_tax_template\` varchar(140) NULL,
          \`weight_per_unit\` decimal(18,2) NOT NULL DEFAULT 0,
          \`weight_uom\` varchar(50) NULL,
          \`total_weight\` decimal(18,2) NOT NULL DEFAULT 0,
          \`is_free_item\` tinyint NOT NULL DEFAULT 0,
          \`is_stock_item\` tinyint NOT NULL DEFAULT 0,
          \`supplier\` varchar(140) NULL,
          \`supplier_delivers_to_customer\` tinyint NOT NULL DEFAULT 0,
          \`page_break\` text NULL,
          \`tenant_id\` varchar(36) NOT NULL,
          \`owner\` varchar(140) NULL,
          \`modified_by\` varchar(140) NULL,
          \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          \`idx\` int NOT NULL DEFAULT 0,
          \`parent\` varchar(140) NULL,
          \`parenttype\` varchar(140) NOT NULL DEFAULT 'Sales Order',
          \`parentfield\` varchar(140) NOT NULL DEFAULT 'items',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
      console.log('Sales Order Item table created successfully');
    }

    // Add foreign key constraints if tables were created
    if (!salesOrderTableExists || !salesOrderItemTableExists) {
      console.log('Adding foreign key constraints...');
      
      // Check if foreign keys already exist before adding them
      try {
        await queryRunner.query(`
          ALTER TABLE \`tabSales Order\` 
          ADD CONSTRAINT \`FK_sales_order_tenant\` 
          FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
      } catch (error) {
        console.log('Sales Order tenant FK already exists or failed to create:', error.message);
      }

      try {
        await queryRunner.query(`
          ALTER TABLE \`tabSales Order Item\` 
          ADD CONSTRAINT \`FK_sales_order_item_tenant\` 
          FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
      } catch (error) {
        console.log('Sales Order Item tenant FK already exists or failed to create:', error.message);
      }

      try {
        await queryRunner.query(`
          ALTER TABLE \`tabSales Order Item\` 
          ADD CONSTRAINT \`FK_sales_order_item_sales_order\` 
          FOREIGN KEY (\`sales_order_id\`) REFERENCES \`tabSales Order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      } catch (error) {
        console.log('Sales Order Item sales order FK already exists or failed to create:', error.message);
      }
    }

    await queryRunner.release();
    console.log('Sales order tables initialization completed successfully');

  } catch (error) {
    console.error('Error initializing sales order tables:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the script if called directly
if (require.main === module) {
  initSalesOrderTables()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { initSalesOrderTables };