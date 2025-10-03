import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSupplierTables1758905000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Supplier Group table
        await queryRunner.query(`
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
        await queryRunner.query(`
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
                \`hold_type\` varchar(20) NULL,
                \`release_date\` date NULL,
                \`warn_rfqs\` tinyint NOT NULL DEFAULT '0',
                \`warn_pos\` tinyint NOT NULL DEFAULT '0',
                \`prevent_rfqs\` tinyint NOT NULL DEFAULT '0',
                \`prevent_pos\` tinyint NOT NULL DEFAULT '0',
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
                \`tenant_id\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_supplier_name_tenant\` (\`supplier_name\`, \`tenant_id\`),
                UNIQUE INDEX \`IDX_supplier_code_tenant\` (\`supplier_code\`, \`tenant_id\`),
                INDEX \`IDX_supplier_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_group\` (\`supplier_group\`),
                INDEX \`IDX_supplier_type\` (\`supplier_type\`),
                INDEX \`IDX_supplier_country\` (\`country\`),
                INDEX \`IDX_supplier_gst_category\` (\`gst_category\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_group\` FOREIGN KEY (\`supplier_group\`) REFERENCES \`tabSupplierGroup\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // Create Supplier Quotation table
        await queryRunner.query(`
            CREATE TABLE \`tabSupplierQuotation\` (
                \`id\` varchar(36) NOT NULL,
                \`quotation_number\` varchar(140) NOT NULL,
                \`supplier\` varchar(36) NOT NULL,
                \`quotation_date\` date NOT NULL,
                \`valid_till\` date NULL,
                \`currency\` varchar(3) NOT NULL DEFAULT 'ETB',
                \`conversion_rate\` decimal(18,6) NOT NULL DEFAULT '1.000000',
                \`status\` varchar(20) NOT NULL DEFAULT 'Draft',
                \`total_qty\` decimal(18,3) NOT NULL DEFAULT '0.000',
                \`base_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`base_net_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`total_taxes_and_charges\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`base_total_taxes_and_charges\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`base_grand_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`grand_total\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`terms_and_conditions\` text NULL,
                \`notes\` text NULL,
                \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`modified_by\` varchar(140) NULL,
                \`owner\` varchar(140) NULL,
                \`tenant_id\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_supplier_quotation_number_tenant\` (\`quotation_number\`, \`tenant_id\`),
                INDEX \`IDX_supplier_quotation_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_quotation_supplier\` (\`supplier\`),
                INDEX \`IDX_supplier_quotation_status\` (\`status\`),
                INDEX \`IDX_supplier_quotation_date\` (\`quotation_date\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_quotation_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_quotation_supplier\` FOREIGN KEY (\`supplier\`) REFERENCES \`tabSupplier\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // Create Supplier Quotation Item table
        await queryRunner.query(`
            CREATE TABLE \`tabSupplierQuotationItem\` (
                \`id\` varchar(36) NOT NULL,
                \`parent\` varchar(36) NOT NULL,
                \`item_code\` varchar(140) NOT NULL,
                \`item_name\` varchar(140) NULL,
                \`description\` text NULL,
                \`qty\` decimal(18,3) NOT NULL DEFAULT '1.000',
                \`uom\` varchar(140) NULL,
                \`rate\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`base_rate\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`base_amount\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`delivery_date\` date NULL,
                \`lead_time_days\` int NULL,
                \`brand\` varchar(140) NULL,
                \`manufacturer\` varchar(140) NULL,
                \`manufacturer_part_no\` varchar(140) NULL,
                \`supplier_part_no\` varchar(140) NULL,
                \`notes\` text NULL,
                \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`modified_by\` varchar(140) NULL,
                \`owner\` varchar(140) NULL,
                \`tenant_id\` varchar(36) NULL,
                INDEX \`IDX_supplier_quotation_item_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_quotation_item_parent\` (\`parent\`),
                INDEX \`IDX_supplier_quotation_item_code\` (\`item_code\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_quotation_item_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_quotation_item_parent\` FOREIGN KEY (\`parent\`) REFERENCES \`tabSupplierQuotation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // Create Supplier Scorecard table
        await queryRunner.query(`
            CREATE TABLE \`tabSupplierScorecard\` (
                \`id\` varchar(36) NOT NULL,
                \`scorecard_name\` varchar(140) NOT NULL,
                \`supplier\` varchar(36) NOT NULL,
                \`period_from\` date NOT NULL,
                \`period_to\` date NOT NULL,
                \`total_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
                \`max_score\` decimal(5,2) NOT NULL DEFAULT '100.00',
                \`percentage_score\` decimal(5,2) NOT NULL DEFAULT '0.00',
                \`standing\` varchar(20) NULL,
                \`notes\` text NULL,
                \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`modified_by\` varchar(140) NULL,
                \`owner\` varchar(140) NULL,
                \`tenant_id\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_supplier_scorecard_name_tenant\` (\`scorecard_name\`, \`tenant_id\`),
                INDEX \`IDX_supplier_scorecard_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_scorecard_supplier\` (\`supplier\`),
                INDEX \`IDX_supplier_scorecard_period\` (\`period_from\`, \`period_to\`),
                INDEX \`IDX_supplier_scorecard_standing\` (\`standing\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_scorecard_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_scorecard_supplier\` FOREIGN KEY (\`supplier\`) REFERENCES \`tabSupplier\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // Create Supplier Scorecard Criteria table
        await queryRunner.query(`
            CREATE TABLE \`tabSupplierScorecardCriteria\` (
                \`id\` varchar(36) NOT NULL,
                \`parent\` varchar(36) NOT NULL,
                \`criteria_name\` varchar(140) NOT NULL,
                \`weight\` decimal(5,2) NOT NULL DEFAULT '0.00',
                \`max_score\` decimal(5,2) NOT NULL DEFAULT '10.00',
                \`formula\` text NULL,
                \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`modified_by\` varchar(140) NULL,
                \`owner\` varchar(140) NULL,
                \`tenant_id\` varchar(36) NULL,
                INDEX \`IDX_supplier_scorecard_criteria_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_scorecard_criteria_parent\` (\`parent\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_scorecard_criteria_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_scorecard_criteria_parent\` FOREIGN KEY (\`parent\`) REFERENCES \`tabSupplierScorecard\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);

        // Create Supplier Scorecard Period table
        await queryRunner.query(`
            CREATE TABLE \`tabSupplierScorecardPeriod\` (
                \`id\` varchar(36) NOT NULL,
                \`parent\` varchar(36) NOT NULL,
                \`criteria\` varchar(36) NOT NULL,
                \`score\` decimal(5,2) NOT NULL DEFAULT '0.00',
                \`notes\` text NULL,
                \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`modified_by\` varchar(140) NULL,
                \`owner\` varchar(140) NULL,
                \`tenant_id\` varchar(36) NULL,
                INDEX \`IDX_supplier_scorecard_period_tenant_id\` (\`tenant_id\`),
                INDEX \`IDX_supplier_scorecard_period_parent\` (\`parent\`),
                INDEX \`IDX_supplier_scorecard_period_criteria\` (\`criteria\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_supplier_scorecard_period_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_scorecard_period_parent\` FOREIGN KEY (\`parent\`) REFERENCES \`tabSupplierScorecard\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT \`FK_supplier_scorecard_period_criteria\` FOREIGN KEY (\`criteria\`) REFERENCES \`tabSupplierScorecardCriteria\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`tabSupplierScorecardPeriod\``);
        await queryRunner.query(`DROP TABLE \`tabSupplierScorecardCriteria\``);
        await queryRunner.query(`DROP TABLE \`tabSupplierScorecard\``);
        await queryRunner.query(`DROP TABLE \`tabSupplierQuotationItem\``);
        await queryRunner.query(`DROP TABLE \`tabSupplierQuotation\``);
        await queryRunner.query(`DROP TABLE \`tabSupplier\``);
        await queryRunner.query(`DROP TABLE \`tabSupplierGroup\``);
    }
}