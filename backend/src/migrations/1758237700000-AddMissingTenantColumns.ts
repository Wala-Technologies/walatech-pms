import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingTenantColumns1758237700000 implements MigrationInterface {
  name = 'AddMissingTenantColumns1758237700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add tenant_id to production_plan_items table
    await queryRunner.query(`
      ALTER TABLE \`production_plan_items\` 
      ADD COLUMN \`tenant_id\` varchar(36) NOT NULL
    `);
    
    await queryRunner.query(`
      CREATE INDEX \`IDX_production_plan_items_tenant_id\` ON \`production_plan_items\` (\`tenant_id\`)
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`production_plan_items\` 
      ADD CONSTRAINT \`FK_production_plan_items_tenant\` 
      FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Add tenant_id to work_order_tasks table
    await queryRunner.query(`
      ALTER TABLE \`work_order_tasks\` 
      ADD COLUMN \`tenant_id\` varchar(36) NOT NULL
    `);
    
    await queryRunner.query(`
      CREATE INDEX \`IDX_work_order_tasks_tenant_id\` ON \`work_order_tasks\` (\`tenant_id\`)
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`work_order_tasks\` 
      ADD CONSTRAINT \`FK_work_order_tasks_tenant\` 
      FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove tenant_id from work_order_tasks
    await queryRunner.query(`
      ALTER TABLE \`work_order_tasks\` 
      DROP FOREIGN KEY \`FK_work_order_tasks_tenant\`
    `);
    
    await queryRunner.query(`
      DROP INDEX \`IDX_work_order_tasks_tenant_id\` ON \`work_order_tasks\`
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`work_order_tasks\` 
      DROP COLUMN \`tenant_id\`
    `);

    // Remove tenant_id from production_plan_items
    await queryRunner.query(`
      ALTER TABLE \`production_plan_items\` 
      DROP FOREIGN KEY \`FK_production_plan_items_tenant\`
    `);
    
    await queryRunner.query(`
      DROP INDEX \`IDX_production_plan_items_tenant_id\` ON \`production_plan_items\`
    `);
    
    await queryRunner.query(`
      ALTER TABLE \`production_plan_items\` 
      DROP COLUMN \`tenant_id\`
    `);
  }
}