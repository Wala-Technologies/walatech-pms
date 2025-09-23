import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTenantIdToUser1758295800000 implements MigrationInterface {
  name = 'AddTenantIdToUser1758295800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tenant_id column to tabUser table
    await queryRunner.addColumn(
      'tabUser',
      new TableColumn({
        name: 'tenant_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'tabUser',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tabTenant',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add index for better query performance
    await queryRunner.query(
      'CREATE INDEX IDX_USER_TENANT_ID ON tabUser (tenant_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query('DROP INDEX IDX_USER_TENANT_ID ON tabUser');

    // Drop foreign key constraint
    const table = await queryRunner.getTable('tabUser');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenant_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('tabUser', foreignKey);
    }

    // Drop tenant_id column
    await queryRunner.dropColumn('tabUser', 'tenant_id');
  }
}