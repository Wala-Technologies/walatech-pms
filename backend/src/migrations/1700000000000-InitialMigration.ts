import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Tenant table
    await queryRunner.query(`
      CREATE TABLE \`tabTenant\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`subdomain\` varchar(100) NOT NULL,
        \`status\` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
        \`plan\` enum('basic','premium','enterprise') NOT NULL DEFAULT 'basic',
        \`settings\` json NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`modified_by\` varchar(140) NULL,
        UNIQUE INDEX \`IDX_subdomain\` (\`subdomain\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create User table
    await queryRunner.query(`
      CREATE TABLE \`tabUser\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`first_name\` varchar(100) NOT NULL,
        \`last_name\` varchar(100) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`enabled\` tinyint NOT NULL DEFAULT 1,
        \`language\` varchar(10) NOT NULL DEFAULT 'en',
        \`time_zone\` varchar(50) NOT NULL DEFAULT 'UTC',
        \`mobile_no\` varchar(20) NULL,
        \`role_profile_name\` varchar(100) NULL,
        \`creation\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`modified\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`modified_by\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        UNIQUE INDEX \`IDX_email\` (\`email\`),
        INDEX \`IDX_tenant_id\` (\`tenant_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_user_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create Production Order table
    await queryRunner.query(`
      CREATE TABLE \`tabProductionOrder\` (
        \`id\` varchar(36) NOT NULL,
        \`orderNumber\` varchar(255) NOT NULL,
        \`productName\` varchar(255) NOT NULL,
        \`productCode\` varchar(100) NOT NULL,
        \`quantityPlanned\` decimal(10,2) NOT NULL,
        \`quantityProduced\` decimal(10,2) NOT NULL DEFAULT '0.00',
        \`unit\` varchar(50) NOT NULL,
        \`status\` enum('draft','planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
        \`priority\` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
        \`plannedStartDate\` datetime NOT NULL,
        \`plannedEndDate\` datetime NOT NULL,
        \`actualStartDate\` datetime NULL,
        \`actualEndDate\` datetime NULL,
        \`description\` text NULL,
        \`notes\` text NULL,
        \`estimatedCost\` decimal(10,2) NULL,
        \`actualCost\` decimal(10,2) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`created_by\` varchar(36) NOT NULL,
        \`assigned_to\` varchar(36) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`modified_by\` varchar(140) NULL,
        UNIQUE INDEX \`IDX_orderNumber\` (\`orderNumber\`),
        INDEX \`IDX_created_by\` (\`created_by\`),
        INDEX \`IDX_assigned_to\` (\`assigned_to\`),
        INDEX \`IDX_tenant_id\` (\`tenant_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_production_order_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_production_order_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_production_order_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create Work Order table
    await queryRunner.query(`
      CREATE TABLE \`tabWorkOrder\` (
        \`id\` varchar(36) NOT NULL,
        \`workOrderNumber\` varchar(255) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`type\` enum('manufacturing','assembly','packaging','quality_check','maintenance') NOT NULL DEFAULT 'manufacturing',
        \`status\` enum('pending','in_progress','completed','on_hold','cancelled') NOT NULL DEFAULT 'pending',
        \`quantityRequired\` decimal(10,2) NOT NULL,
        \`quantityCompleted\` decimal(10,2) NOT NULL DEFAULT '0.00',
        \`unit\` varchar(50) NOT NULL,
        \`scheduledStartTime\` datetime NOT NULL,
        \`scheduledEndTime\` datetime NOT NULL,
        \`actualStartTime\` datetime NULL,
        \`actualEndTime\` datetime NULL,
        \`estimatedHours\` decimal(5,2) NULL,
        \`actualHours\` decimal(5,2) NULL,
        \`workstation\` varchar(255) NULL,
        \`department\` varchar(255) NULL,
        \`instructions\` text NULL,
        \`notes\` text NULL,
        \`progressPercentage\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`production_order_id\` varchar(36) NOT NULL,
        \`created_by\` varchar(36) NOT NULL,
        \`assigned_to\` varchar(36) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`modified_by\` varchar(140) NULL,
        UNIQUE INDEX \`IDX_workOrderNumber\` (\`workOrderNumber\`),
        INDEX \`IDX_production_order_id\` (\`production_order_id\`),
        INDEX \`IDX_created_by\` (\`created_by\`),
        INDEX \`IDX_assigned_to\` (\`assigned_to\`),
        INDEX \`IDX_tenant_id\` (\`tenant_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_work_order_production_order\` FOREIGN KEY (\`production_order_id\`) REFERENCES \`tabProductionOrder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Create Work Order Task table
    await queryRunner.query(`
      CREATE TABLE \`tabWorkOrderTask\` (
        \`id\` varchar(36) NOT NULL,
        \`taskName\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`status\` enum('not_started','in_progress','completed','blocked','cancelled') NOT NULL DEFAULT 'not_started',
        \`priority\` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
        \`sequenceOrder\` int NOT NULL,
        \`estimatedHours\` decimal(5,2) NULL,
        \`actualHours\` decimal(5,2) NULL,
        \`scheduledStartTime\` datetime NULL,
        \`scheduledEndTime\` datetime NULL,
        \`actualStartTime\` datetime NULL,
        \`actualEndTime\` datetime NULL,
        \`progressPercentage\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`instructions\` text NULL,
        \`notes\` text NULL,
        \`completionNotes\` text NULL,
        \`requiredSkills\` varchar(255) NULL,
        \`toolsRequired\` varchar(255) NULL,
        \`materialsRequired\` varchar(255) NULL,
        \`estimatedCost\` decimal(10,2) NULL,
        \`actualCost\` decimal(10,2) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`work_order_id\` varchar(36) NOT NULL,
        \`created_by\` varchar(36) NOT NULL,
        \`assigned_to\` varchar(36) NULL,
        \`tenant_id\` varchar(36) NOT NULL,
        \`docstatus\` int NOT NULL DEFAULT '0',
        \`idx\` varchar(140) NULL,
        \`owner\` varchar(140) NULL,
        \`modified_by\` varchar(140) NULL,
        INDEX \`IDX_work_order_id\` (\`work_order_id\`),
        INDEX \`IDX_created_by\` (\`created_by\`),
        INDEX \`IDX_assigned_to\` (\`assigned_to\`),
        INDEX \`IDX_tenant_id\` (\`tenant_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_work_order_task_work_order\` FOREIGN KEY (\`work_order_id\`) REFERENCES \`tabWorkOrder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_task_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_task_assigned_to\` FOREIGN KEY (\`assigned_to\`) REFERENCES \`tabUser\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT \`FK_work_order_task_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`tabWorkOrderTask\``);
    await queryRunner.query(`DROP TABLE \`tabWorkOrder\``);
    await queryRunner.query(`DROP TABLE \`tabProductionOrder\``);
    await queryRunner.query(`DROP TABLE \`tabUser\``);
    await queryRunner.query(`DROP TABLE \`tabTenant\``);
  }
}