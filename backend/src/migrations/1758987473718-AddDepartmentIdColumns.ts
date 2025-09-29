import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentIdColumns1758987473718 implements MigrationInterface {
    name = 'AddDepartmentIdColumns1758987473718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add department_id columns to existing tables
        
        // Add department_id to users table if it doesn't exist
        const userColumns = await queryRunner.getTable('tabuser');
        if (userColumns && !userColumns.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`tabuser\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add role column to users table if it doesn't exist
        if (userColumns && !userColumns.findColumnByName('role')) {
            await queryRunner.query(`ALTER TABLE \`tabuser\` ADD \`role\` enum ('super_admin', 'hr', 'manager', 'department_head', 'regular_user', 'sales', 'purchasing', 'production', 'accounting') NOT NULL DEFAULT 'regular_user'`);
        }

        // Add department_id to items table if it doesn't exist
        const itemsTable = await queryRunner.getTable('items');
        if (itemsTable && !itemsTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`items\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to accounts table if it doesn't exist
        const accountsTable = await queryRunner.getTable('acc_accounts');
        if (accountsTable && !accountsTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_accounts\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to journal entries table if it doesn't exist
        const journalEntriesTable = await queryRunner.getTable('acc_journal_entries');
        if (journalEntriesTable && !journalEntriesTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_journal_entries\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add tenant_id and department_id to journal entry lines table if they don't exist
        const journalEntryLinesTable = await queryRunner.getTable('acc_journal_entry_lines');
        if (journalEntryLinesTable) {
            if (!journalEntryLinesTable.findColumnByName('tenant_id')) {
                await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` ADD \`tenant_id\` varchar(36) NOT NULL`);
            }
            if (!journalEntryLinesTable.findColumnByName('department_id')) {
                await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` ADD \`department_id\` varchar(36) NULL`);
            }
        }

        // Add department_id to GL entries table if it doesn't exist
        const glEntriesTable = await queryRunner.getTable('acc_gl_entries');
        if (glEntriesTable && !glEntriesTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_gl_entries\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to cost centers table if it doesn't exist
        const costCentersTable = await queryRunner.getTable('acc_cost_centers');
        if (costCentersTable && !costCentersTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_cost_centers\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to fiscal years table if it doesn't exist
        const fiscalYearsTable = await queryRunner.getTable('acc_fiscal_years');
        if (fiscalYearsTable && !fiscalYearsTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_fiscal_years\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to payment entries table if it doesn't exist
        const paymentEntriesTable = await queryRunner.getTable('acc_payment_entries');
        if (paymentEntriesTable && !paymentEntriesTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`acc_payment_entries\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to customers table if it doesn't exist
        const customersTable = await queryRunner.getTable('tabCustomer');
        if (customersTable && !customersTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`tabCustomer\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add department_id to sales orders table if it doesn't exist
        const salesOrdersTable = await queryRunner.getTable('tabSales Order');
        if (salesOrdersTable && !salesOrdersTable.findColumnByName('department_id')) {
            await queryRunner.query(`ALTER TABLE \`tabSales Order\` ADD \`department_id\` varchar(36) NULL`);
        }

        // Add foreign key constraints if tables exist
        try {
            // Check if tabDepartment exists before adding foreign keys
            const departmentTable = await queryRunner.getTable('tabDepartment');
            if (departmentTable) {
                // Add foreign key constraints for department_id columns
                if (userColumns && userColumns.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`tabuser\` ADD CONSTRAINT \`FK_user_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (itemsTable && itemsTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_item_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (accountsTable && accountsTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_accounts\` ADD CONSTRAINT \`FK_account_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (journalEntriesTable && journalEntriesTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_journal_entries\` ADD CONSTRAINT \`FK_journal_entry_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (journalEntryLinesTable && journalEntryLinesTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` ADD CONSTRAINT \`FK_journal_entry_line_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (glEntriesTable && glEntriesTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_gl_entries\` ADD CONSTRAINT \`FK_gl_entry_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (costCentersTable && costCentersTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_cost_centers\` ADD CONSTRAINT \`FK_cost_center_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (fiscalYearsTable && fiscalYearsTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_fiscal_years\` ADD CONSTRAINT \`FK_fiscal_year_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (paymentEntriesTable && paymentEntriesTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`acc_payment_entries\` ADD CONSTRAINT \`FK_payment_entry_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (customersTable && customersTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`tabCustomer\` ADD CONSTRAINT \`FK_customer_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }

                if (salesOrdersTable && salesOrdersTable.findColumnByName('department_id')) {
                    await queryRunner.query(`ALTER TABLE \`tabSales Order\` ADD CONSTRAINT \`FK_sales_order_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`tabDepartment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                }
            }
        } catch (error) {
            console.log('Some foreign key constraints may already exist or tables may not be ready:', error.message);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        try {
            await queryRunner.query(`ALTER TABLE \`tabuser\` DROP FOREIGN KEY \`FK_user_department\``);
            await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_item_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_accounts\` DROP FOREIGN KEY \`FK_account_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_journal_entries\` DROP FOREIGN KEY \`FK_journal_entry_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` DROP FOREIGN KEY \`FK_journal_entry_line_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_gl_entries\` DROP FOREIGN KEY \`FK_gl_entry_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_cost_centers\` DROP FOREIGN KEY \`FK_cost_center_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_fiscal_years\` DROP FOREIGN KEY \`FK_fiscal_year_department\``);
            await queryRunner.query(`ALTER TABLE \`acc_payment_entries\` DROP FOREIGN KEY \`FK_payment_entry_department\``);
            await queryRunner.query(`ALTER TABLE \`tabCustomer\` DROP FOREIGN KEY \`FK_customer_department\``);
            await queryRunner.query(`ALTER TABLE \`tabSales Order\` DROP FOREIGN KEY \`FK_sales_order_department\``);
        } catch (error) {
            console.log('Some foreign key constraints may not exist:', error.message);
        }

        // Remove department_id columns
        await queryRunner.query(`ALTER TABLE \`tabuser\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`tabuser\` DROP COLUMN \`role\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_accounts\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_journal_entries\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` DROP COLUMN \`tenant_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_journal_entry_lines\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_gl_entries\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_cost_centers\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_fiscal_years\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`acc_payment_entries\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`tabCustomer\` DROP COLUMN \`department_id\``);
        await queryRunner.query(`ALTER TABLE \`tabSales Order\` DROP COLUMN \`department_id\``);
    }
}