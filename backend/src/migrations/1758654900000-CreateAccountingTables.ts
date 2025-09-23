import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountingTables1758654900000 implements MigrationInterface {
  name = 'CreateAccountingTables1758654900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Account table
    await queryRunner.query(`
      CREATE TABLE \`tabAccount\` (
        \`id\` varchar(36) NOT NULL,
        \`code\` varchar(20) NOT NULL,
        \`name\` varchar(140) NOT NULL,
        \`rootType\` enum('Asset','Liability','Equity','Income','Expense') NOT NULL,
        \`accountType\` varchar(140) NULL,
        \`isGroup\` tinyint NOT NULL DEFAULT 0,
        \`parentAccountId\` varchar(36) NULL,
        \`company\` varchar(140) NULL,
        \`disabled\` tinyint NOT NULL DEFAULT 0,
        \`freezeAccount\` enum('No','Yes') NOT NULL DEFAULT 'No',
        \`accountCurrency\` varchar(3) NOT NULL DEFAULT 'USD',
        \`taxRate\` decimal(18,6) NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        UNIQUE INDEX \`IDX_account_code_tenant\` (\`code\`, \`tenant_id\`),
        INDEX \`IDX_account_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_account_parent\` (\`parentAccountId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_account_parent\` FOREIGN KEY (\`parentAccountId\`) REFERENCES \`tabAccount\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_account_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create CostCenter table
    await queryRunner.query(`
      CREATE TABLE \`tabCostCenter\` (
        \`id\` varchar(36) NOT NULL,
        \`code\` varchar(20) NOT NULL,
        \`name\` varchar(140) NOT NULL,
        \`isGroup\` tinyint NOT NULL DEFAULT 0,
        \`parentCostCenterId\` varchar(36) NULL,
        \`company\` varchar(140) NULL,
        \`disabled\` tinyint NOT NULL DEFAULT 0,
        \`description\` text NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        UNIQUE INDEX \`IDX_cost_center_code_tenant\` (\`code\`, \`tenant_id\`),
        INDEX \`IDX_cost_center_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_cost_center_parent\` (\`parentCostCenterId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_cost_center_parent\` FOREIGN KEY (\`parentCostCenterId\`) REFERENCES \`tabCostCenter\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_cost_center_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create FiscalYear table
    await queryRunner.query(`
      CREATE TABLE \`tabFiscalYear\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(140) NOT NULL,
        \`yearStartDate\` date NOT NULL,
        \`yearEndDate\` date NOT NULL,
        \`isClosed\` tinyint NOT NULL DEFAULT 0,
        \`disabled\` tinyint NOT NULL DEFAULT 0,
        \`autoCreated\` tinyint NOT NULL DEFAULT 0,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        UNIQUE INDEX \`IDX_fiscal_year_name_tenant\` (\`name\`, \`tenant_id\`),
        INDEX \`IDX_fiscal_year_tenant_id\` (\`tenant_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_fiscal_year_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create JournalEntry table
    await queryRunner.query(`
      CREATE TABLE \`tabJournalEntry\` (
        \`id\` varchar(36) NOT NULL,
        \`voucherType\` varchar(140) NOT NULL,
        \`postingDate\` date NOT NULL,
        \`company\` varchar(140) NULL,
        \`userRemark\` text NULL,
        \`chequeNo\` varchar(140) NULL,
        \`chequeDate\` date NULL,
        \`totalDebit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`totalCredit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`difference\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`isOpening\` enum('No','Yes') NOT NULL DEFAULT 'No',
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        INDEX \`IDX_journal_entry_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_journal_entry_posting_date\` (\`postingDate\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_journal_entry_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create JournalEntryLine table
    await queryRunner.query(`
      CREATE TABLE \`tabJournalEntryLine\` (
        \`id\` varchar(36) NOT NULL,
        \`journalEntryId\` varchar(36) NOT NULL,
        \`accountId\` varchar(36) NOT NULL,
        \`debitInAccountCurrency\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`creditInAccountCurrency\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`exchangeRate\` decimal(18,6) NOT NULL DEFAULT '1.000000',
        \`debit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`credit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`userRemark\` text NULL,
        \`costCenter\` varchar(140) NULL,
        \`project\` varchar(140) NULL,
        \`againstAccount\` varchar(140) NULL,
        \`isAdvance\` enum('No','Yes') NOT NULL DEFAULT 'No',
        \`referenceType\` varchar(140) NULL,
        \`referenceName\` varchar(140) NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        INDEX \`IDX_journal_entry_line_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_journal_entry_line_journal\` (\`journalEntryId\`),
        INDEX \`IDX_journal_entry_line_account\` (\`accountId\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_journal_entry_line_journal\` FOREIGN KEY (\`journalEntryId\`) REFERENCES \`tabJournalEntry\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_journal_entry_line_account\` FOREIGN KEY (\`accountId\`) REFERENCES \`tabAccount\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT \`FK_journal_entry_line_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create GLEntry table
    await queryRunner.query(`
      CREATE TABLE \`tabGLEntry\` (
        \`id\` varchar(36) NOT NULL,
        \`postingDate\` date NOT NULL,
        \`accountId\` varchar(36) NOT NULL,
        \`debit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`credit\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`voucherType\` varchar(140) NOT NULL,
        \`voucherNo\` varchar(140) NOT NULL,
        \`againstVoucherType\` varchar(140) NULL,
        \`againstVoucher\` varchar(140) NULL,
        \`costCenter\` varchar(140) NULL,
        \`project\` varchar(140) NULL,
        \`company\` varchar(140) NULL,
        \`fiscalYear\` varchar(140) NULL,
        \`isCancelled\` tinyint NOT NULL DEFAULT 0,
        \`isOpening\` enum('No','Yes') NOT NULL DEFAULT 'No',
        \`remarks\` text NULL,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        INDEX \`IDX_gl_entry_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_gl_entry_account\` (\`accountId\`),
        INDEX \`IDX_gl_entry_posting_date\` (\`postingDate\`),
        INDEX \`IDX_gl_entry_voucher\` (\`voucherType\`, \`voucherNo\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_gl_entry_account\` FOREIGN KEY (\`accountId\`) REFERENCES \`tabAccount\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT \`FK_gl_entry_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create PaymentEntry table
    await queryRunner.query(`
      CREATE TABLE \`tabPaymentEntry\` (
        \`id\` varchar(36) NOT NULL,
        \`paymentType\` enum('Receive','Pay') NOT NULL,
        \`postingDate\` date NOT NULL,
        \`company\` varchar(140) NULL,
        \`paidFromAccountId\` varchar(36) NOT NULL,
        \`paidToAccountId\` varchar(36) NOT NULL,
        \`paidAmount\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`receivedAmount\` decimal(18,6) NOT NULL DEFAULT '0.000000',
        \`partyType\` enum('Customer','Supplier','Employee','Student','Shareholder','Member') NULL,
        \`party\` varchar(140) NULL,
        \`referenceNo\` varchar(140) NULL,
        \`referenceDate\` date NULL,
        \`costCenter\` varchar(140) NULL,
        \`project\` varchar(140) NULL,
        \`remarks\` text NULL,
        \`isSubmitted\` tinyint NOT NULL DEFAULT 0,
        \`creation\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`modified\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        INDEX \`IDX_payment_entry_tenant_id\` (\`tenant_id\`),
        INDEX \`IDX_payment_entry_paid_from\` (\`paidFromAccountId\`),
        INDEX \`IDX_payment_entry_paid_to\` (\`paidToAccountId\`),
        INDEX \`IDX_payment_entry_posting_date\` (\`postingDate\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_payment_entry_paid_from\` FOREIGN KEY (\`paidFromAccountId\`) REFERENCES \`tabAccount\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT \`FK_payment_entry_paid_to\` FOREIGN KEY (\`paidToAccountId\`) REFERENCES \`tabAccount\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT \`FK_payment_entry_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE \`tabPaymentEntry\``);
    await queryRunner.query(`DROP TABLE \`tabGLEntry\``);
    await queryRunner.query(`DROP TABLE \`tabJournalEntryLine\``);
    await queryRunner.query(`DROP TABLE \`tabJournalEntry\``);
    await queryRunner.query(`DROP TABLE \`tabFiscalYear\``);
    await queryRunner.query(`DROP TABLE \`tabCostCenter\``);
    await queryRunner.query(`DROP TABLE \`tabAccount\``);
  }
}