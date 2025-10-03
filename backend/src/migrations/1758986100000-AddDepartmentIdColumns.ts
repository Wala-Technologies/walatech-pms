import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddDepartmentIdColumns1758986100000 implements MigrationInterface {
  name = 'AddDepartmentIdColumns1758986100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add department_id column to all entities that need department-based isolation

    // Sales entities
    await this.addDepartmentIdColumn(queryRunner, 'quotations');
    await this.addDepartmentIdColumn(queryRunner, 'quotation_items');
    await this.addDepartmentIdColumn(queryRunner, 'sales_orders');
    await this.addDepartmentIdColumn(queryRunner, 'sales_order_items');
    await this.addDepartmentIdColumn(queryRunner, 'delivery_notes');
    await this.addDepartmentIdColumn(queryRunner, 'delivery_note_items');
    await this.addDepartmentIdColumn(queryRunner, 'sales_invoices');
    await this.addDepartmentIdColumn(queryRunner, 'sales_invoice_items');

    // Inventory entities
    await this.addDepartmentIdColumn(queryRunner, 'suppliers');
    await this.addDepartmentIdColumn(queryRunner, 'supplier_quotations');

    // Production entities
    await this.addDepartmentIdColumn(queryRunner, 'work_orders');
    await this.addDepartmentIdColumn(queryRunner, 'production_orders');

    // Accounting entities
    await this.addDepartmentIdColumn(queryRunner, 'acc_accounts');
    await this.addDepartmentIdColumn(queryRunner, 'acc_journal_entries');
    await this.addDepartmentIdColumn(queryRunner, 'acc_journal_entry_lines');
    await this.addDepartmentIdColumn(queryRunner, 'acc_gl_entries');
    await this.addDepartmentIdColumn(queryRunner, 'acc_payment_entries');
    await this.addDepartmentIdColumn(queryRunner, 'acc_cost_centers');
    await this.addDepartmentIdColumn(queryRunner, 'acc_fiscal_years');

    // Add foreign key constraints
    const tables = [
      'quotations', 'quotation_items', 'sales_orders', 'sales_order_items',
      'delivery_notes', 'delivery_note_items', 'sales_invoices', 'sales_invoice_items',
      'suppliers', 'supplier_quotations', 'work_orders', 'production_orders',
      'acc_accounts', 'acc_journal_entries', 'acc_journal_entry_lines',
      'acc_gl_entries', 'acc_payment_entries', 'acc_cost_centers', 'acc_fiscal_years'
    ];

    for (const tableName of tables) {
      await this.addDepartmentForeignKey(queryRunner, tableName);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraints first
    const tables = [
      'quotations', 'quotation_items', 'sales_orders', 'sales_order_items',
      'delivery_notes', 'delivery_note_items', 'sales_invoices', 'sales_invoice_items',
      'suppliers', 'supplier_quotations', 'work_orders', 'production_orders',
      'acc_accounts', 'acc_journal_entries', 'acc_journal_entry_lines',
      'acc_gl_entries', 'acc_payment_entries', 'acc_cost_centers', 'acc_fiscal_years'
    ];

    for (const tableName of tables) {
      await this.removeDepartmentForeignKey(queryRunner, tableName);
    }

    // Remove department_id columns
    for (const tableName of tables) {
      await this.removeDepartmentIdColumn(queryRunner, tableName);
    }
  }

  private async addDepartmentIdColumn(queryRunner: QueryRunner, tableName: string): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (table) {
      const departmentIdColumn = table.findColumnByName('department_id');
      if (!departmentIdColumn) {
        await queryRunner.addColumn(tableName, new TableColumn({
          name: 'department_id',
          type: 'varchar',
          length: '36',
          isNullable: true,
        }));
      }
    }
  }

  private async addDepartmentForeignKey(queryRunner: QueryRunner, tableName: string): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('department_id') !== -1);
      if (!foreignKey) {
        await queryRunner.createForeignKey(tableName, new TableForeignKey({
          columnNames: ['department_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'departments',
          onDelete: 'SET NULL',
        }));
      }
    }
  }

  private async removeDepartmentForeignKey(queryRunner: QueryRunner, tableName: string): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('department_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey(tableName, foreignKey);
      }
    }
  }

  private async removeDepartmentIdColumn(queryRunner: QueryRunner, tableName: string): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (table) {
      const departmentIdColumn = table.findColumnByName('department_id');
      if (departmentIdColumn) {
        await queryRunner.dropColumn(tableName, departmentIdColumn);
      }
    }
  }
}