import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTable1758669353082 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`tabCustomer\` (
                \`id\` varchar(36) NOT NULL,
                \`customer_name\` varchar(140) NOT NULL,
                \`customer_code\` varchar(140) NULL,
                \`customer_type\` varchar(20) NOT NULL DEFAULT 'Individual',
                \`email\` varchar(140) NULL,
                \`mobile_no\` varchar(20) NULL,
                \`phone\` varchar(20) NULL,
                \`website\` varchar(140) NULL,
                \`tax_id\` varchar(140) NULL,
                \`default_currency\` varchar(3) NOT NULL DEFAULT 'ETB',
                \`default_price_list\` varchar(140) NULL,
                \`credit_limit\` decimal(18,2) NOT NULL DEFAULT '0.00',
                \`payment_terms\` int NOT NULL DEFAULT '0',
                \`is_frozen\` tinyint NOT NULL DEFAULT '1',
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
                UNIQUE INDEX \`IDX_customer_name\` (\`customer_name\`),
                INDEX \`IDX_customer_tenant_id\` (\`tenant_id\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_customer_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tabTenant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`tabCustomer\``);
    }

}
