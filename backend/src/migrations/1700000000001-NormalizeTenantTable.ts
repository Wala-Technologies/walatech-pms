import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeTenantTable1700000000001 implements MigrationInterface {
  name = 'NormalizeTenantTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the old table name exists and rename it
    await queryRunner.query(`
      SET @tableExists = (
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name = 'tabTenant'
      );

      IF @tableExists > 0 THEN
        RENAME TABLE tabTenant TO tabtenant;
      END IF;
    `);

    // Change settings column type from json to longtext for better compatibility
    await queryRunner.query(`
      ALTER TABLE tabtenant
      MODIFY COLUMN settings LONGTEXT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Change settings column type back to json
    await queryRunner.query(`
      ALTER TABLE tabtenant
      MODIFY COLUMN settings JSON NULL;
    `);

    // Rename table back (if it exists)
    await queryRunner.query(`
      SET @tableExists = (
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name = 'tabtenant'
      );

      IF @tableExists > 0 THEN
        RENAME TABLE tabtenant TO tabTenant;
      END IF;
    `);
  }
}
