import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantLifecycleFields1759309000000 implements MigrationInterface {
  name = 'AddTenantLifecycleFields1759309000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new lifecycle states to tenant status enum
    await queryRunner.query(`
      ALTER TABLE tabtenant 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'soft_deleted', 'hard_deleted') 
      DEFAULT 'active'
    `);

    // Add lifecycle management columns to tenant table
    await queryRunner.query(`
      ALTER TABLE tabtenant 
      ADD COLUMN retentionPeriodDays INT NOT NULL DEFAULT 90 
      COMMENT 'Retention period in days for soft-deleted tenants'
    `);

    await queryRunner.query(`
      ALTER TABLE tabtenant 
      ADD COLUMN softDeletedAt DATETIME NULL 
      COMMENT 'When the tenant was soft deleted'
    `);

    await queryRunner.query(`
      ALTER TABLE tabtenant 
      ADD COLUMN hardDeleteScheduledAt DATETIME NULL 
      COMMENT 'When the tenant will be hard deleted'
    `);

    await queryRunner.query(`
      ALTER TABLE tabtenant 
      ADD COLUMN deletedBy VARCHAR(140) NULL 
      COMMENT 'User who initiated the deletion'
    `);

    await queryRunner.query(`
      ALTER TABLE tabtenant 
      ADD COLUMN deletionReason TEXT NULL 
      COMMENT 'Reason for deletion'
    `);

    // Create tenant lifecycle audit table
    await queryRunner.query(`
      CREATE TABLE tabTenantLifecycleAudit (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL,
        action ENUM('soft_delete', 'hard_delete', 'reactivate', 'retention_update') NOT NULL,
        previousStatus ENUM('active', 'inactive', 'suspended', 'soft_deleted', 'hard_deleted') NULL,
        newStatus ENUM('active', 'inactive', 'suspended', 'soft_deleted', 'hard_deleted') NULL,
        performedBy VARCHAR(140) NOT NULL,
        reason TEXT NULL,
        metadata JSON NULL,
        scheduledAt DATETIME NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tabtenant(id) ON DELETE CASCADE
      )
    `);

    // Add indexes for performance
    await queryRunner.query(`
      CREATE INDEX idx_tenant_lifecycle_audit_tenant_id ON tabTenantLifecycleAudit(tenant_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tenant_lifecycle_audit_action ON tabTenantLifecycleAudit(action)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tenant_lifecycle_audit_created_at ON tabTenantLifecycleAudit(createdAt)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tenant_soft_deleted_at ON tabtenant(softDeletedAt)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tenant_hard_delete_scheduled_at ON tabtenant(hardDeleteScheduledAt)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX idx_tenant_hard_delete_scheduled_at ON tabtenant`);
    await queryRunner.query(`DROP INDEX idx_tenant_soft_deleted_at ON tabtenant`);
    await queryRunner.query(`DROP INDEX idx_tenant_lifecycle_audit_created_at ON tabTenantLifecycleAudit`);
    await queryRunner.query(`DROP INDEX idx_tenant_lifecycle_audit_action ON tabTenantLifecycleAudit`);
    await queryRunner.query(`DROP INDEX idx_tenant_lifecycle_audit_tenant_id ON tabTenantLifecycleAudit`);

    // Drop audit table
    await queryRunner.query(`DROP TABLE tabTenantLifecycleAudit`);

    // Remove lifecycle management columns
    await queryRunner.query(`ALTER TABLE tabtenant DROP COLUMN deletionReason`);
    await queryRunner.query(`ALTER TABLE tabtenant DROP COLUMN deletedBy`);
    await queryRunner.query(`ALTER TABLE tabtenant DROP COLUMN hardDeleteScheduledAt`);
    await queryRunner.query(`ALTER TABLE tabtenant DROP COLUMN softDeletedAt`);
    await queryRunner.query(`ALTER TABLE tabtenant DROP COLUMN retentionPeriodDays`);

    // Revert status enum to original values
    await queryRunner.query(`
      ALTER TABLE tabtenant 
      MODIFY COLUMN status ENUM('active', 'inactive', 'suspended') 
      DEFAULT 'active'
    `);
  }
}