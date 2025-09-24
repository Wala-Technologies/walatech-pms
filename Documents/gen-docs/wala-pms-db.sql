-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.11.14-MariaDB-ubu2204 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for frappe
CREATE DATABASE IF NOT EXISTS `frappe` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `frappe`;

-- Dumping structure for table frappe.bisect_nodes_id_seq
CREATE TABLE IF NOT EXISTS `bisect_nodes_id_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;

-- Data exporting was unselected.

-- Dumping structure for table frappe.crm_note_id_seq
CREATE TABLE IF NOT EXISTS `crm_note_id_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;

-- Data exporting was unselected.

-- Dumping structure for procedure frappe.find_missing_foreign_keys
DELIMITER //
CREATE PROCEDURE `find_missing_foreign_keys`()
BEGIN
    
    
    
    INSERT INTO missing_foreign_keys
    SELECT 
        c.TABLE_NAME,
        c.COLUMN_NAME,
        REPLACE(c.COLUMN_NAME, '_name', '') AS referenced_table,
        'name' AS referenced_column,
        CONCAT('fk_', LOWER(c.TABLE_NAME), '_', LOWER(c.COLUMN_NAME)) AS suggested_constraint_name
    FROM 
        INFORMATION_SCHEMA.COLUMNS c
    WHERE 
        c.TABLE_SCHEMA = 'frappe'
        AND c.TABLE_NAME LIKE 'tab%'
        AND c.COLUMN_NAME LIKE '%\_name'
        AND c.COLUMN_NAME NOT IN ('name', 'modified_by', 'owner', 'creation', 'modified')
        AND NOT EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            WHERE 
                kcu.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND kcu.TABLE_NAME = c.TABLE_NAME
                AND kcu.COLUMN_NAME = c.COLUMN_NAME
                AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        )
        AND EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.TABLES t
            WHERE 
                t.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND t.TABLE_NAME = CONCAT('tab', REPLACE(c.COLUMN_NAME, '_name', ''))
        );
    
    
    INSERT INTO missing_foreign_keys
    SELECT 
        c.TABLE_NAME,
        c.COLUMN_NAME,
        REPLACE(c.COLUMN_NAME, '_id', '') AS referenced_table,
        'name' AS referenced_column,
        CONCAT('fk_', LOWER(c.TABLE_NAME), '_', LOWER(c.COLUMN_NAME)) AS suggested_constraint_name
    FROM 
        INFORMATION_SCHEMA.COLUMNS c
    WHERE 
        c.TABLE_SCHEMA = 'frappe'
        AND c.TABLE_NAME LIKE 'tab%'
        AND c.COLUMN_NAME LIKE '%\_id'
        AND c.COLUMN_NAME NOT IN ('parent', 'parentfield', 'parenttype', 'name', 'modified_by', 'owner', 'creation', 'modified')
        AND NOT EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            WHERE 
                kcu.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND kcu.TABLE_NAME = c.TABLE_NAME
                AND kcu.COLUMN_NAME = c.COLUMN_NAME
                AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        )
        AND EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.TABLES t
            WHERE 
                t.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND t.TABLE_NAME = CONCAT('tab', REPLACE(c.COLUMN_NAME, '_id', ''))
        );
    
    
    INSERT INTO missing_foreign_keys
    SELECT 
        c.TABLE_NAME,
        c.COLUMN_NAME,
        CONCAT('tab', 
            CASE 
                WHEN c.COLUMN_NAME = 'item' THEN 'Item'
                WHEN c.COLUMN_NAME = 'warehouse' THEN 'Warehouse'
                WHEN c.COLUMN_NAME = 'customer' THEN 'Customer'
                WHEN c.COLUMN_NAME = 'supplier' THEN 'Supplier'
                WHEN c.COLUMN_NAME = 'company' THEN 'Company'
                WHEN c.COLUMN_NAME = 'currency' THEN 'Currency'
                WHEN c.COLUMN_NAME = 'cost_center' THEN 'Cost Center'
                WHEN c.COLUMN_NAME = 'project' THEN 'Project'
                WHEN c.COLUMN_NAME = 'department' THEN 'Department'
                WHEN c.COLUMN_NAME = 'designation' THEN 'Designation'
                WHEN c.COLUMN_NAME = 'employee' THEN 'Employee'
                WHEN c.COLUMN_NAME = 'user' THEN 'User'
                WHEN c.COLUMN_NAME = 'role' THEN 'Role'
                WHEN c.COLUMN_NAME = 'item_group' THEN 'Item Group'
                WHEN c.COLUMN_NAME = 'item_code' THEN 'Item'
                WHEN c.COLUMN_NAME = 'uom' THEN 'UOM'
                WHEN c.COLUMN_NAME = 'brand' THEN 'Brand'
                ELSE INITCAP(c.COLUMN_NAME)
            END
        ) AS referenced_table,
        'name' AS referenced_column,
        CONCAT('fk_', LOWER(c.TABLE_NAME), '_', LOWER(c.COLUMN_NAME)) AS suggested_constraint_name
    FROM 
        INFORMATION_SCHEMA.COLUMNS c
    WHERE 
        c.TABLE_SCHEMA = 'frappe'
        AND c.TABLE_NAME LIKE 'tab%'
        AND c.COLUMN_NAME IN (
            'item', 'warehouse', 'customer', 'supplier', 'company', 'currency', 
            'cost_center', 'project', 'department', 'designation', 'employee', 
            'user', 'role', 'item_group', 'item_code', 'uom', 'brand'
        )
        AND NOT EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            WHERE 
                kcu.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND kcu.TABLE_NAME = c.TABLE_NAME
                AND kcu.COLUMN_NAME = c.COLUMN_NAME
                AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        )
        AND EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.TABLES t
            WHERE 
                t.TABLE_SCHEMA = c.TABLE_SCHEMA
                AND t.TABLE_NAME = CONCAT('tab', 
                    CASE 
                        WHEN c.COLUMN_NAME = 'item' THEN 'Item'
                        WHEN c.COLUMN_NAME = 'warehouse' THEN 'Warehouse'
                        WHEN c.COLUMN_NAME = 'customer' THEN 'Customer'
                        WHEN c.COLUMN_NAME = 'supplier' THEN 'Supplier'
                        WHEN c.COLUMN_NAME = 'company' THEN 'Company'
                        WHEN c.COLUMN_NAME = 'currency' THEN 'Currency'
                        WHEN c.COLUMN_NAME = 'cost_center' THEN 'Cost Center'
                        WHEN c.COLUMN_NAME = 'project' THEN 'Project'
                        WHEN c.COLUMN_NAME = 'department' THEN 'Department'
                        WHEN c.COLUMN_NAME = 'designation' THEN 'Designation'
                        WHEN c.COLUMN_NAME = 'employee' THEN 'Employee'
                        WHEN c.COLUMN_NAME = 'user' THEN 'User'
                        WHEN c.COLUMN_NAME = 'role' THEN 'Role'
                        WHEN c.COLUMN_NAME = 'item_group' THEN 'Item Group'
                        WHEN c.COLUMN_NAME = 'item_code' THEN 'Item'
                        WHEN c.COLUMN_NAME = 'uom' THEN 'UOM'
                        WHEN c.COLUMN_NAME = 'brand' THEN 'Brand'
                        ELSE INITCAP(c.COLUMN_NAME)
                    END
                )
        );
    
    
    DELETE t1 FROM missing_foreign_keys t1
    INNER JOIN missing_foreign_keys t2 
    WHERE 
        t1.table_name = t2.table_name 
        AND t1.column_name = t2.column_name 
        AND t1.referenced_table = t2.referenced_table
        AND t1.referenced_column = t2.referenced_column
        AND t1.suggested_constraint_name > t2.suggested_constraint_name;
    
    
    SELECT 
        table_name,
        column_name,
        referenced_table,
        referenced_column,
        suggested_constraint_name,
        CONCAT(
            'ALTER TABLE `', table_name, '`\n',
            'ADD CONSTRAINT `', suggested_constraint_name, '`\n',
            'FOREIGN KEY (`', column_name, '`) REFERENCES `', referenced_table, '`(`', referenced_column, '`);'
        ) AS sql_statement
    FROM 
        missing_foreign_keys
    ORDER BY 
        table_name, column_name;
    
    
    DROP TEMPORARY TABLE IF EXISTS missing_foreign_keys;
END//
DELIMITER ;

-- Dumping structure for function frappe.get_constraint_name
DELIMITER //
CREATE FUNCTION `get_constraint_name`(tbl VARCHAR(100), col VARCHAR(100)) RETURNS varchar(200) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci
    DETERMINISTIC
BEGIN
    RETURN CONCAT('fk_', LOWER(tbl), '_', LOWER(col));
END//
DELIMITER ;

-- Dumping structure for table frappe.ledger_health_id_seq
CREATE TABLE IF NOT EXISTS `ledger_health_id_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;

-- Data exporting was unselected.

-- Dumping structure for table frappe.prospect_opportunity_id_seq
CREATE TABLE IF NOT EXISTS `prospect_opportunity_id_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAbout Us Team Member
CREATE TABLE IF NOT EXISTS `tabAbout Us Team Member` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `full_name` varchar(140) DEFAULT NULL,
  `image_link` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccess Log
CREATE TABLE IF NOT EXISTS `tabAccess Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `export_from` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `file_type` varchar(140) DEFAULT NULL,
  `method` varchar(140) DEFAULT NULL,
  `report_name` varchar(140) DEFAULT NULL,
  `filters` longtext DEFAULT NULL,
  `page` longtext DEFAULT NULL,
  `columns` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_access_user` (`user`),
  CONSTRAINT `fk_access_user` FOREIGN KEY (`user`) REFERENCES `tabUser` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccount
CREATE TABLE IF NOT EXISTS `tabAccount` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `account_name` varchar(140) DEFAULT NULL,
  `account_number` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `root_type` varchar(140) DEFAULT NULL,
  `report_type` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `parent_account` varchar(140) DEFAULT NULL,
  `account_type` varchar(140) DEFAULT NULL,
  `tax_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `freeze_account` varchar(140) DEFAULT NULL,
  `balance_must_be` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `include_in_gross` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent_account` (`parent_account`),
  KEY `account_type` (`account_type`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`),
  KEY `fk_account_company` (`company`),
  KEY `fk_account_currency` (`account_currency`),
  KEY `fk_account_owner` (`owner`),
  KEY `fk_account_modified_by` (`modified_by`),
  CONSTRAINT `fk_account_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_account_currency` FOREIGN KEY (`account_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_account_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_account_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_account_parent` FOREIGN KEY (`parent_account`) REFERENCES `tabAccount` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccount Closing Balance
CREATE TABLE IF NOT EXISTS `tabAccount Closing Balance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `closing_date` date DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `debit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_currency` varchar(140) DEFAULT NULL,
  `debit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `project` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `period_closing_voucher` varchar(140) DEFAULT NULL,
  `is_period_closing_voucher_entry` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `closing_date` (`closing_date`),
  KEY `account` (`account`),
  KEY `company` (`company`),
  KEY `period_closing_voucher` (`period_closing_voucher`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccounting Dimension
CREATE TABLE IF NOT EXISTS `tabAccounting Dimension` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `label` (`label`),
  KEY `document_type` (`document_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccounting Dimension Detail
CREATE TABLE IF NOT EXISTS `tabAccounting Dimension Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `default_dimension` varchar(140) DEFAULT NULL,
  `mandatory_for_bs` int(1) NOT NULL DEFAULT 0,
  `mandatory_for_pl` int(1) NOT NULL DEFAULT 0,
  `automatically_post_balancing_accounting_entry` int(1) NOT NULL DEFAULT 0,
  `offsetting_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccounting Dimension Filter
CREATE TABLE IF NOT EXISTS `tabAccounting Dimension Filter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `accounting_dimension` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `apply_restriction_on_values` int(1) NOT NULL DEFAULT 1,
  `allow_or_restrict` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAccounting Period
CREATE TABLE IF NOT EXISTS `tabAccounting Period` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `period_name` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabActivity Cost
CREATE TABLE IF NOT EXISTS `tabActivity Cost` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `activity_type` varchar(140) DEFAULT NULL,
  `employee` varchar(140) DEFAULT NULL,
  `employee_name` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `billing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `costing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `title` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabActivity Log
CREATE TABLE IF NOT EXISTS `tabActivity Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `communication_date` datetime(6) DEFAULT NULL,
  `ip_address` varchar(140) DEFAULT NULL,
  `operation` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_owner` varchar(140) DEFAULT NULL,
  `timeline_doctype` varchar(140) DEFAULT NULL,
  `timeline_name` varchar(140) DEFAULT NULL,
  `link_doctype` varchar(140) DEFAULT NULL,
  `link_name` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `reference_doctype_reference_name_index` (`reference_doctype`,`reference_name`),
  KEY `timeline_doctype_timeline_name_index` (`timeline_doctype`,`timeline_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabActivity Type
CREATE TABLE IF NOT EXISTS `tabActivity Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `activity_type` varchar(140) DEFAULT NULL,
  `costing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAddress
CREATE TABLE IF NOT EXISTS `tabAddress` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `address_title` varchar(140) DEFAULT NULL,
  `address_type` varchar(140) DEFAULT NULL,
  `address_line1` varchar(240) DEFAULT NULL,
  `address_line2` varchar(240) DEFAULT NULL,
  `city` varchar(140) DEFAULT NULL,
  `county` varchar(140) DEFAULT NULL,
  `state` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `pincode` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `phone` varchar(140) DEFAULT NULL,
  `fax` varchar(140) DEFAULT NULL,
  `is_primary_address` int(1) NOT NULL DEFAULT 0,
  `is_shipping_address` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `is_your_company_address` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `city` (`city`),
  KEY `country` (`country`),
  KEY `pincode` (`pincode`),
  KEY `modified` (`modified`),
  KEY `fk_address_tax_category` (`tax_category`),
  CONSTRAINT `fk_address_country` FOREIGN KEY (`country`) REFERENCES `tabCountry` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_address_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAddress Template
CREATE TABLE IF NOT EXISTS `tabAddress Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `country` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `template` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `country` (`country`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAdvance Payment Ledger Entry
CREATE TABLE IF NOT EXISTS `tabAdvance Payment Ledger Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `against_voucher_type` varchar(140) DEFAULT NULL,
  `against_voucher_no` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `event` varchar(140) DEFAULT NULL,
  `delinked` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_aple_voucher_type` (`voucher_type`),
  KEY `fk_aple_against_voucher_type` (`against_voucher_type`),
  CONSTRAINT `fk_aple_against_voucher_type` FOREIGN KEY (`against_voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_aple_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAdvance Tax
CREATE TABLE IF NOT EXISTS `tabAdvance Tax` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_detail` varchar(140) DEFAULT NULL,
  `account_head` varchar(140) DEFAULT NULL,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAdvance Taxes and Charges
CREATE TABLE IF NOT EXISTS `tabAdvance Taxes and Charges` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `add_deduct_tax` varchar(140) DEFAULT NULL,
  `charge_type` varchar(140) DEFAULT NULL,
  `row_id` varchar(140) DEFAULT NULL,
  `account_head` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `included_in_paid_amount` int(1) NOT NULL DEFAULT 0,
  `cost_center` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `account_head` (`account_head`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAllowed Dimension
CREATE TABLE IF NOT EXISTS `tabAllowed Dimension` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `accounting_dimension` varchar(140) DEFAULT NULL,
  `dimension_value` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAllowed To Transact With
CREATE TABLE IF NOT EXISTS `tabAllowed To Transact With` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAmended Document Naming Settings
CREATE TABLE IF NOT EXISTS `tabAmended Document Naming Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `action` varchar(140) DEFAULT 'Amend Counter',
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `document_type` (`document_type`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabApplicable On Account
CREATE TABLE IF NOT EXISTS `tabApplicable On Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `applicable_on_account` varchar(140) DEFAULT NULL,
  `is_mandatory` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAppointment
CREATE TABLE IF NOT EXISTS `tabAppointment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `scheduled_time` datetime(6) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `customer_phone_number` varchar(140) DEFAULT NULL,
  `customer_skype` varchar(140) DEFAULT NULL,
  `customer_email` varchar(140) DEFAULT NULL,
  `customer_details` longtext DEFAULT NULL,
  `appointment_with` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `calendar_event` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAppointment Booking Slots
CREATE TABLE IF NOT EXISTS `tabAppointment Booking Slots` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day_of_week` varchar(140) DEFAULT NULL,
  `from_time` time(6) DEFAULT NULL,
  `to_time` time(6) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset
CREATE TABLE IF NOT EXISTS `tabAsset` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `asset_owner` varchar(140) DEFAULT NULL,
  `asset_owner_company` varchar(140) DEFAULT NULL,
  `is_existing_asset` int(1) NOT NULL DEFAULT 0,
  `is_composite_asset` int(1) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `journal_entry_for_scrap` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `asset_name` varchar(140) DEFAULT NULL,
  `asset_category` varchar(140) DEFAULT NULL,
  `location` varchar(140) DEFAULT NULL,
  `split_from` varchar(140) DEFAULT NULL,
  `custodian` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `disposal_date` date DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `purchase_receipt` varchar(140) DEFAULT NULL,
  `purchase_receipt_item` varchar(140) DEFAULT NULL,
  `purchase_invoice` varchar(140) DEFAULT NULL,
  `purchase_invoice_item` varchar(140) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `available_for_use_date` date DEFAULT NULL,
  `gross_purchase_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `asset_quantity` int(11) NOT NULL DEFAULT 1,
  `additional_asset_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_asset_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `calculate_depreciation` int(1) NOT NULL DEFAULT 0,
  `opening_accumulated_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `opening_number_of_booked_depreciations` int(11) NOT NULL DEFAULT 0,
  `is_fully_depreciated` int(1) NOT NULL DEFAULT 0,
  `depreciation_method` varchar(140) DEFAULT NULL,
  `value_after_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_number_of_depreciations` int(11) NOT NULL DEFAULT 0,
  `frequency_of_depreciation` int(11) NOT NULL DEFAULT 0,
  `next_depreciation_date` date DEFAULT NULL,
  `policy_number` varchar(140) DEFAULT NULL,
  `insurer` varchar(140) DEFAULT NULL,
  `insured_value` varchar(140) DEFAULT NULL,
  `insurance_start_date` date DEFAULT NULL,
  `insurance_end_date` date DEFAULT NULL,
  `comprehensive_insurance` varchar(140) DEFAULT NULL,
  `maintenance_required` int(1) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Draft',
  `booked_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `purchase_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `default_finance_book` varchar(140) DEFAULT NULL,
  `depr_entry_posting_status` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_asset_customer` (`customer`),
  KEY `fk_asset_company` (`company`),
  KEY `fk_asset_asset_category` (`asset_category`),
  KEY `fk_asset_cost_center` (`cost_center`),
  KEY `fk_asset_default_finance_book` (`default_finance_book`),
  KEY `fk_asset_department` (`department`),
  KEY `fk_asset_location` (`location`),
  KEY `fk_asset_purchase_invoice` (`purchase_invoice`),
  KEY `fk_asset_purchase_receipt` (`purchase_receipt`),
  KEY `fk_asset_supplier` (`supplier`),
  CONSTRAINT `fk_asset_asset_category` FOREIGN KEY (`asset_category`) REFERENCES `tabAsset Category` (`name`),
  CONSTRAINT `fk_asset_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_asset_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_asset_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_default_finance_book` FOREIGN KEY (`default_finance_book`) REFERENCES `tabFinance Book` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_department` FOREIGN KEY (`department`) REFERENCES `tabDepartment` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_location` FOREIGN KEY (`location`) REFERENCES `tabLocation` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_asset_purchase_invoice` FOREIGN KEY (`purchase_invoice`) REFERENCES `tabPurchase Invoice` (`name`),
  CONSTRAINT `fk_asset_purchase_receipt` FOREIGN KEY (`purchase_receipt`) REFERENCES `tabPurchase Receipt` (`name`),
  CONSTRAINT `fk_asset_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Activity
CREATE TABLE IF NOT EXISTS `tabAsset Activity` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `date` datetime(6) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_asset_activity_asset` (`asset`),
  CONSTRAINT `fk_asset_activity_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Capitalization
CREATE TABLE IF NOT EXISTS `tabAsset Capitalization` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `capitalization_method` varchar(140) DEFAULT NULL,
  `target_item_code` varchar(140) DEFAULT NULL,
  `target_item_name` varchar(140) DEFAULT NULL,
  `target_asset` varchar(140) DEFAULT NULL,
  `target_asset_name` varchar(140) DEFAULT NULL,
  `target_qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `target_asset_location` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `finance_book` varchar(140) DEFAULT NULL,
  `target_batch_no` varchar(140) DEFAULT NULL,
  `target_serial_no` text DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `target_is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `target_has_batch_no` int(1) NOT NULL DEFAULT 0,
  `target_has_serial_no` int(1) NOT NULL DEFAULT 0,
  `stock_items_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `asset_items_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `service_items_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `target_incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `target_fixed_asset_account` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `posting_date` (`posting_date`),
  KEY `modified` (`modified`),
  KEY `fk_asset_capitalization_company` (`company`),
  KEY `fk_asset_capitalization_cost_center` (`cost_center`),
  KEY `fk_asset_capitalization_finance_book` (`finance_book`),
  KEY `fk_asset_capitalization_target_asset` (`target_asset`),
  CONSTRAINT `fk_asset_capitalization_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_asset_capitalization_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_asset_capitalization_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`),
  CONSTRAINT `fk_asset_capitalization_target_asset` FOREIGN KEY (`target_asset`) REFERENCES `tabAsset` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Capitalization Asset Item
CREATE TABLE IF NOT EXISTS `tabAsset Capitalization Asset Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `asset_name` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `current_asset_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `asset_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `fixed_asset_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_acai_asset` (`asset`),
  KEY `fk_acai_cost_center` (`cost_center`),
  KEY `fk_acai_finance_book` (`finance_book`),
  KEY `fk_acai_item_code` (`item_code`),
  CONSTRAINT `fk_acai_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_acai_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_acai_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`),
  CONSTRAINT `fk_acai_item_code` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Capitalization Service Item
CREATE TABLE IF NOT EXISTS `tabAsset Capitalization Service Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_acsi_cost_center` (`cost_center`),
  KEY `fk_acsi_item_code` (`item_code`),
  CONSTRAINT `fk_acsi_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_acsi_item_code` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Capitalization Stock Item
CREATE TABLE IF NOT EXISTS `tabAsset Capitalization Stock Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `purchase_receipt_item` varchar(140) DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_acsi_warehouse` (`warehouse`),
  CONSTRAINT `fk_acsi_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Category
CREATE TABLE IF NOT EXISTS `tabAsset Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset_category_name` varchar(140) DEFAULT NULL,
  `enable_cwip_accounting` int(1) NOT NULL DEFAULT 0,
  `non_depreciable_category` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `asset_category_name` (`asset_category_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Category Account
CREATE TABLE IF NOT EXISTS `tabAsset Category Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company_name` varchar(140) DEFAULT NULL,
  `fixed_asset_account` varchar(140) DEFAULT NULL,
  `accumulated_depreciation_account` varchar(140) DEFAULT NULL,
  `depreciation_expense_account` varchar(140) DEFAULT NULL,
  `capital_work_in_progress_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Depreciation Schedule
CREATE TABLE IF NOT EXISTS `tabAsset Depreciation Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `gross_purchase_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `opening_accumulated_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `opening_number_of_booked_depreciations` int(11) NOT NULL DEFAULT 0,
  `finance_book` varchar(140) DEFAULT NULL,
  `finance_book_id` int(11) NOT NULL DEFAULT 0,
  `depreciation_method` varchar(140) DEFAULT NULL,
  `total_number_of_depreciations` int(11) NOT NULL DEFAULT 0,
  `rate_of_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `daily_prorata_based` int(1) NOT NULL DEFAULT 0,
  `shift_based` int(1) NOT NULL DEFAULT 0,
  `frequency_of_depreciation` int(11) NOT NULL DEFAULT 0,
  `expected_value_after_useful_life` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `notes` text DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ads_asset` (`asset`),
  KEY `fk_ads_company` (`company`),
  KEY `fk_ads_finance_book` (`finance_book`),
  CONSTRAINT `fk_ads_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_ads_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_ads_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Finance Book
CREATE TABLE IF NOT EXISTS `tabAsset Finance Book` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `finance_book` varchar(140) DEFAULT NULL,
  `depreciation_method` varchar(140) DEFAULT NULL,
  `total_number_of_depreciations` int(11) NOT NULL DEFAULT 0,
  `total_number_of_booked_depreciations` int(11) NOT NULL DEFAULT 0,
  `daily_prorata_based` int(1) NOT NULL DEFAULT 0,
  `shift_based` int(1) NOT NULL DEFAULT 0,
  `frequency_of_depreciation` int(11) NOT NULL DEFAULT 0,
  `depreciation_start_date` date DEFAULT NULL,
  `salvage_value_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expected_value_after_useful_life` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `value_after_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_of_depreciation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_afb_finance_book` (`finance_book`),
  CONSTRAINT `fk_afb_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Maintenance
CREATE TABLE IF NOT EXISTS `tabAsset Maintenance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset_name` varchar(140) DEFAULT NULL,
  `asset_category` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `maintenance_team` varchar(140) DEFAULT NULL,
  `maintenance_manager` varchar(140) DEFAULT NULL,
  `maintenance_manager_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `asset_name` (`asset_name`),
  KEY `modified` (`modified`),
  KEY `fk_am_company` (`company`),
  CONSTRAINT `fk_am_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Maintenance Log
CREATE TABLE IF NOT EXISTS `tabAsset Maintenance Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset_maintenance` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `asset_name` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `task` varchar(140) DEFAULT NULL,
  `task_name` varchar(140) DEFAULT NULL,
  `maintenance_type` varchar(140) DEFAULT NULL,
  `periodicity` varchar(140) DEFAULT NULL,
  `has_certificate` int(1) NOT NULL DEFAULT 0,
  `certificate_attachement` text DEFAULT NULL,
  `maintenance_status` varchar(140) DEFAULT NULL,
  `assign_to_name` varchar(140) DEFAULT NULL,
  `task_assignee_email` varchar(140) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `description` varchar(140) DEFAULT NULL,
  `actions_performed` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_aml_item_code` (`item_code`),
  CONSTRAINT `fk_aml_item_code` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Maintenance Task
CREATE TABLE IF NOT EXISTS `tabAsset Maintenance Task` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `maintenance_task` varchar(140) DEFAULT NULL,
  `maintenance_type` varchar(140) DEFAULT NULL,
  `maintenance_status` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `periodicity` varchar(140) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `certificate_required` int(1) NOT NULL DEFAULT 0,
  `assign_to` varchar(140) DEFAULT NULL,
  `assign_to_name` varchar(140) DEFAULT NULL,
  `next_due_date` date DEFAULT NULL,
  `last_completion_date` date DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `certificate_required` (`certificate_required`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Maintenance Team
CREATE TABLE IF NOT EXISTS `tabAsset Maintenance Team` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `maintenance_team_name` varchar(140) DEFAULT NULL,
  `maintenance_manager` varchar(140) DEFAULT NULL,
  `maintenance_manager_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `maintenance_team_name` (`maintenance_team_name`),
  KEY `modified` (`modified`),
  KEY `fk_amt_company` (`company`),
  CONSTRAINT `fk_amt_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Movement
CREATE TABLE IF NOT EXISTS `tabAsset Movement` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `purpose` varchar(140) DEFAULT NULL,
  `transaction_date` datetime(6) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_asset_movement_company` (`company`),
  CONSTRAINT `fk_asset_movement_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Movement Item
CREATE TABLE IF NOT EXISTS `tabAsset Movement Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `asset` varchar(140) DEFAULT NULL,
  `source_location` varchar(140) DEFAULT NULL,
  `from_employee` varchar(140) DEFAULT NULL,
  `asset_name` varchar(140) DEFAULT NULL,
  `target_location` varchar(140) DEFAULT NULL,
  `to_employee` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_ami_asset` (`asset`),
  KEY `fk_ami_source_location` (`source_location`),
  KEY `fk_ami_target_location` (`target_location`),
  KEY `fk_ami_from_employee` (`from_employee`),
  KEY `fk_ami_to_employee` (`to_employee`),
  CONSTRAINT `fk_ami_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`),
  CONSTRAINT `fk_ami_from_employee` FOREIGN KEY (`from_employee`) REFERENCES `tabEmployee` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_ami_source_location` FOREIGN KEY (`source_location`) REFERENCES `tabLocation` (`name`),
  CONSTRAINT `fk_ami_target_location` FOREIGN KEY (`target_location`) REFERENCES `tabLocation` (`name`),
  CONSTRAINT `fk_ami_to_employee` FOREIGN KEY (`to_employee`) REFERENCES `tabEmployee` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Repair
CREATE TABLE IF NOT EXISTS `tabAsset Repair` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `asset_name` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `failure_date` datetime(6) DEFAULT NULL,
  `repair_status` varchar(140) DEFAULT 'Pending',
  `completion_date` datetime(6) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `purchase_invoice` varchar(140) DEFAULT NULL,
  `capitalize_repair_cost` int(1) NOT NULL DEFAULT 0,
  `stock_consumption` int(1) NOT NULL DEFAULT 0,
  `repair_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_repair_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `increase_in_asset_life` int(11) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `actions_performed` longtext DEFAULT NULL,
  `downtime` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ar_asset` (`asset`),
  KEY `fk_ar_company` (`company`),
  KEY `fk_ar_purchase_invoice` (`purchase_invoice`),
  CONSTRAINT `fk_ar_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`),
  CONSTRAINT `fk_ar_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_ar_purchase_invoice` FOREIGN KEY (`purchase_invoice`) REFERENCES `tabPurchase Invoice` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Repair Consumed Item
CREATE TABLE IF NOT EXISTS `tabAsset Repair Consumed Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_quantity` varchar(140) DEFAULT NULL,
  `total_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `serial_no` text DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_arci_item_code` (`item_code`),
  KEY `fk_arci_warehouse` (`warehouse`),
  CONSTRAINT `fk_arci_item_code` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`),
  CONSTRAINT `fk_arci_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Shift Allocation
CREATE TABLE IF NOT EXISTS `tabAsset Shift Allocation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `amended_from` (`amended_from`),
  KEY `modified` (`modified`),
  KEY `fk_asa_asset` (`asset`),
  KEY `fk_asa_finance_book` (`finance_book`),
  CONSTRAINT `fk_asa_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_asa_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Shift Factor
CREATE TABLE IF NOT EXISTS `tabAsset Shift Factor` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `shift_name` varchar(140) DEFAULT NULL,
  `shift_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `default` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `shift_name` (`shift_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAsset Value Adjustment
CREATE TABLE IF NOT EXISTS `tabAsset Value Adjustment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `asset` varchar(140) DEFAULT NULL,
  `asset_category` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `current_asset_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `new_asset_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference_account` varchar(140) DEFAULT NULL,
  `journal_entry` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ava_asset` (`asset`),
  KEY `fk_ava_asset_category` (`asset_category`),
  KEY `fk_ava_company` (`company`),
  KEY `fk_ava_cost_center` (`cost_center`),
  KEY `fk_ava_finance_book` (`finance_book`),
  CONSTRAINT `fk_ava_asset` FOREIGN KEY (`asset`) REFERENCES `tabAsset` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_ava_asset_category` FOREIGN KEY (`asset_category`) REFERENCES `tabAsset Category` (`name`),
  CONSTRAINT `fk_ava_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_ava_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_ava_finance_book` FOREIGN KEY (`finance_book`) REFERENCES `tabFinance Book` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAssignment Rule
CREATE TABLE IF NOT EXISTS `tabAssignment Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `due_date_based_on` varchar(140) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT 'Automatic Assignment',
  `assign_condition` longtext DEFAULT NULL,
  `unassign_condition` longtext DEFAULT NULL,
  `close_condition` longtext DEFAULT NULL,
  `rule` varchar(140) DEFAULT NULL,
  `field` varchar(140) DEFAULT NULL,
  `last_user` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAssignment Rule Day
CREATE TABLE IF NOT EXISTS `tabAssignment Rule Day` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAssignment Rule User
CREATE TABLE IF NOT EXISTS `tabAssignment Rule User` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAuthorization Rule
CREATE TABLE IF NOT EXISTS `tabAuthorization Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `transaction` varchar(140) DEFAULT NULL,
  `based_on` varchar(140) DEFAULT NULL,
  `customer_or_item` varchar(140) DEFAULT NULL,
  `master_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `system_role` varchar(140) DEFAULT NULL,
  `to_emp` varchar(140) DEFAULT NULL,
  `system_user` varchar(140) DEFAULT NULL,
  `to_designation` varchar(140) DEFAULT NULL,
  `approving_role` varchar(140) DEFAULT NULL,
  `approving_user` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAuto Email Report
CREATE TABLE IF NOT EXISTS `tabAuto Email Report` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `report` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT 'User',
  `enabled` int(1) NOT NULL DEFAULT 1,
  `report_type` varchar(140) DEFAULT NULL,
  `reference_report` varchar(140) DEFAULT NULL,
  `send_if_data` int(1) NOT NULL DEFAULT 1,
  `data_modified_till` int(11) NOT NULL DEFAULT 0,
  `no_of_rows` int(11) NOT NULL DEFAULT 100,
  `filters` text DEFAULT NULL,
  `filter_meta` text DEFAULT NULL,
  `from_date_field` varchar(140) DEFAULT NULL,
  `to_date_field` varchar(140) DEFAULT NULL,
  `dynamic_date_period` varchar(140) DEFAULT NULL,
  `use_first_day_of_period` int(1) NOT NULL DEFAULT 0,
  `email_to` text DEFAULT NULL,
  `day_of_week` varchar(140) DEFAULT 'Monday',
  `sender` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT NULL,
  `format` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAuto Repeat
CREATE TABLE IF NOT EXISTS `tabAuto Repeat` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `submit_on_creation` int(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `frequency` varchar(140) DEFAULT NULL,
  `repeat_on_day` int(11) NOT NULL DEFAULT 0,
  `repeat_on_last_day` int(1) NOT NULL DEFAULT 0,
  `next_schedule_date` date DEFAULT NULL,
  `notify_by_email` int(1) NOT NULL DEFAULT 0,
  `recipients` text DEFAULT NULL,
  `template` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `message` text DEFAULT 'Please find attached {{ doc.doctype }} #{{ doc.name }}',
  `print_format` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `next_schedule_date` (`next_schedule_date`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAuto Repeat Day
CREATE TABLE IF NOT EXISTS `tabAuto Repeat Day` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabAvailability Of Slots
CREATE TABLE IF NOT EXISTS `tabAvailability Of Slots` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day_of_week` varchar(140) DEFAULT NULL,
  `from_time` time(6) DEFAULT NULL,
  `to_time` time(6) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank
CREATE TABLE IF NOT EXISTS `tabBank` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `bank_name` varchar(140) DEFAULT NULL,
  `swift_number` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `plaid_access_token` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `bank_name` (`bank_name`),
  UNIQUE KEY `swift_number` (`swift_number`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Account
CREATE TABLE IF NOT EXISTS `tabBank Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account_name` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `bank` varchar(140) DEFAULT NULL,
  `account_type` varchar(140) DEFAULT NULL,
  `account_subtype` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `is_company_account` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `iban` varchar(30) DEFAULT NULL,
  `branch_code` varchar(140) DEFAULT NULL,
  `bank_account_no` varchar(30) DEFAULT NULL,
  `integration_id` varchar(140) DEFAULT NULL,
  `last_integration_date` date DEFAULT NULL,
  `mask` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `integration_id` (`integration_id`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Account Subtype
CREATE TABLE IF NOT EXISTS `tabBank Account Subtype` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account_subtype` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `account_subtype` (`account_subtype`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Account Type
CREATE TABLE IF NOT EXISTS `tabBank Account Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `account_type` (`account_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Clearance Detail
CREATE TABLE IF NOT EXISTS `tabBank Clearance Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_document` varchar(140) DEFAULT NULL,
  `payment_entry` varchar(140) DEFAULT NULL,
  `against_account` varchar(140) DEFAULT NULL,
  `amount` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `cheque_number` varchar(140) DEFAULT NULL,
  `cheque_date` date DEFAULT NULL,
  `clearance_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Guarantee
CREATE TABLE IF NOT EXISTS `tabBank Guarantee` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `bg_type` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_docname` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `start_date` date DEFAULT NULL,
  `validity` int(11) NOT NULL DEFAULT 0,
  `end_date` date DEFAULT NULL,
  `bank` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `bank_account_no` varchar(140) DEFAULT NULL,
  `iban` varchar(140) DEFAULT NULL,
  `branch_code` varchar(140) DEFAULT NULL,
  `swift_number` varchar(140) DEFAULT NULL,
  `more_information` longtext DEFAULT NULL,
  `bank_guarantee_number` varchar(140) DEFAULT NULL,
  `name_of_beneficiary` varchar(140) DEFAULT NULL,
  `margin_money` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `fixed_deposit_number` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `bank_guarantee_number` (`bank_guarantee_number`),
  KEY `modified` (`modified`),
  KEY `fk_bg_customer` (`customer`),
  KEY `fk_bg_supplier` (`supplier`),
  CONSTRAINT `fk_bg_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`),
  CONSTRAINT `fk_bg_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Statement Import
CREATE TABLE IF NOT EXISTS `tabBank Statement Import` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `bank` varchar(140) DEFAULT NULL,
  `custom_delimiters` int(1) NOT NULL DEFAULT 0,
  `delimiter_options` varchar(140) DEFAULT ',;\\t|',
  `google_sheets_url` varchar(140) DEFAULT NULL,
  `import_file` text DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending',
  `template_options` longtext DEFAULT NULL,
  `template_warnings` longtext DEFAULT NULL,
  `show_failed_logs` int(1) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT 'Bank Transaction',
  `import_type` varchar(140) DEFAULT 'Insert New Records',
  `submit_after_import` int(1) NOT NULL DEFAULT 1,
  `mute_emails` int(1) NOT NULL DEFAULT 1,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Transaction
CREATE TABLE IF NOT EXISTS `tabBank Transaction` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'ACC-BTN-.YYYY.-',
  `date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending',
  `bank_account` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `deposit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `withdrawal` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reference_number` varchar(140) DEFAULT NULL,
  `transaction_id` varchar(140) DEFAULT NULL,
  `transaction_type` varchar(50) DEFAULT NULL,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `unallocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `bank_party_name` varchar(140) DEFAULT NULL,
  `bank_party_account_number` varchar(140) DEFAULT NULL,
  `bank_party_iban` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `modified` (`modified`),
  KEY `fk_bt_currency` (`currency`),
  CONSTRAINT `fk_bt_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Transaction Mapping
CREATE TABLE IF NOT EXISTS `tabBank Transaction Mapping` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `bank_transaction_field` varchar(140) DEFAULT NULL,
  `file_field` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBank Transaction Payments
CREATE TABLE IF NOT EXISTS `tabBank Transaction Payments` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_document` varchar(140) DEFAULT NULL,
  `payment_entry` varchar(140) DEFAULT NULL,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `clearance_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBatch
CREATE TABLE IF NOT EXISTS `tabBatch` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `use_batchwise_valuation` int(1) NOT NULL DEFAULT 0,
  `batch_id` varchar(140) DEFAULT NULL,
  `item` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `parent_batch` varchar(140) DEFAULT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `batch_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `qty_to_produce` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `batch_id` (`batch_id`),
  KEY `modified` (`modified`),
  KEY `fk_batch_item` (`item`),
  KEY `fk_batch_supplier` (`supplier`),
  CONSTRAINT `fk_batch_item` FOREIGN KEY (`item`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_batch_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBin
CREATE TABLE IF NOT EXISTS `tabBin` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `planned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `indented_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty_for_production` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty_for_sub_contract` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty_for_production_plan` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `unique_item_warehouse` (`item_code`,`warehouse`),
  KEY `warehouse` (`warehouse`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_bin_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_bin_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBisect Nodes
CREATE TABLE IF NOT EXISTS `tabBisect Nodes` (
  `name` bigint(20) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `root` varchar(140) DEFAULT NULL,
  `left_child` varchar(140) DEFAULT NULL,
  `right_child` varchar(140) DEFAULT NULL,
  `period_from_date` datetime(6) DEFAULT NULL,
  `period_to_date` datetime(6) DEFAULT NULL,
  `difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `balance_sheet_summary` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `profit_loss_summary` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `generated` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlanket Order
CREATE TABLE IF NOT EXISTS `tabBlanket Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `blanket_order_type` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `order_no` varchar(140) DEFAULT NULL,
  `order_date` date DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `company` (`company`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlanket Order Item
CREATE TABLE IF NOT EXISTS `tabBlanket Order Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `party_item_code` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `terms_and_conditions` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlock Module
CREATE TABLE IF NOT EXISTS `tabBlock Module` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlog Category
CREATE TABLE IF NOT EXISTS `tabBlog Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `published` int(1) NOT NULL DEFAULT 1,
  `title` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `preview_image` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `route` (`route`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlog Post
CREATE TABLE IF NOT EXISTS `tabBlog Post` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `blog_category` varchar(140) DEFAULT NULL,
  `blogger` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `read_time` int(11) NOT NULL DEFAULT 0,
  `published_on` date DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `featured` int(1) NOT NULL DEFAULT 0,
  `hide_cta` int(1) NOT NULL DEFAULT 0,
  `enable_email_notification` int(1) NOT NULL DEFAULT 1,
  `disable_comments` int(1) NOT NULL DEFAULT 0,
  `disable_likes` int(1) NOT NULL DEFAULT 0,
  `blog_intro` text DEFAULT NULL,
  `content_type` varchar(140) DEFAULT 'Markdown',
  `content` longtext DEFAULT NULL,
  `content_md` longtext DEFAULT NULL,
  `content_html` longtext DEFAULT NULL,
  `email_sent` int(1) NOT NULL DEFAULT 0,
  `meta_title` varchar(60) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_image` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `route` (`route`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBlogger
CREATE TABLE IF NOT EXISTS `tabBlogger` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `short_name` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `short_name` (`short_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM
CREATE TABLE IF NOT EXISTS `tabBOM` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `quantity` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `is_active` int(1) NOT NULL DEFAULT 1,
  `is_default` int(1) NOT NULL DEFAULT 1,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `set_rate_of_sub_assembly_item_based_on_bom` int(1) NOT NULL DEFAULT 1,
  `project` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `rm_cost_as_per` varchar(140) DEFAULT 'Valuation Rate',
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `with_operations` int(1) NOT NULL DEFAULT 0,
  `transfer_material_against` varchar(140) DEFAULT 'Work Order',
  `routing` varchar(140) DEFAULT NULL,
  `fg_based_operating_cost` int(1) NOT NULL DEFAULT 0,
  `operating_cost_per_bom_quantity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `raw_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `scrap_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_raw_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_scrap_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_variants` int(1) NOT NULL DEFAULT 0,
  `inspection_required` int(1) NOT NULL DEFAULT 0,
  `quality_inspection_template` varchar(140) DEFAULT NULL,
  `show_in_website` int(1) NOT NULL DEFAULT 0,
  `route` text DEFAULT NULL,
  `website_image` text DEFAULT NULL,
  `thumbnail` varchar(140) DEFAULT NULL,
  `show_items` int(1) NOT NULL DEFAULT 0,
  `show_operations` int(1) NOT NULL DEFAULT 0,
  `web_long_description` longtext DEFAULT NULL,
  `bom_creator` varchar(140) DEFAULT NULL,
  `bom_creator_item` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item` (`item`),
  KEY `modified` (`modified`),
  KEY `fk_bom_company` (`company`),
  KEY `fk_bom_buying_price_list` (`buying_price_list`),
  KEY `fk_bom_uom` (`uom`),
  KEY `fk_bom_currency` (`currency`),
  KEY `fk_bom_price_list_currency` (`price_list_currency`),
  CONSTRAINT `fk_bom_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_bom_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_bom_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_bom_item` FOREIGN KEY (`item`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_bom_price_list_currency` FOREIGN KEY (`price_list_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_bom_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Creator
CREATE TABLE IF NOT EXISTS `tabBOM Creator` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `project` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `rm_cost_as_per` varchar(140) DEFAULT 'Valuation Rate',
  `set_rate_based_on_warehouse` int(1) NOT NULL DEFAULT 0,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `default_warehouse` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `raw_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `remarks` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `error_log` text DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_bom_creator_buying_price_list` (`buying_price_list`),
  CONSTRAINT `fk_bom_creator_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Creator Item
CREATE TABLE IF NOT EXISTS `tabBOM Creator Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `fg_item` varchar(140) DEFAULT NULL,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `is_expandable` int(1) NOT NULL DEFAULT 0,
  `sourced_by_supplier` int(1) NOT NULL DEFAULT 0,
  `bom_created` int(1) NOT NULL DEFAULT 0,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `do_not_explode` int(1) NOT NULL DEFAULT 1,
  `parent_row_no` varchar(140) DEFAULT NULL,
  `fg_reference_id` varchar(140) DEFAULT NULL,
  `instruction` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Explosion Item
CREATE TABLE IF NOT EXISTS `tabBOM Explosion Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `operation` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty_consumed_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `include_item_in_manufacturing` int(1) NOT NULL DEFAULT 0,
  `sourced_by_supplier` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Item
CREATE TABLE IF NOT EXISTS `tabBOM Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `operation` varchar(140) DEFAULT NULL,
  `do_not_explode` int(1) NOT NULL DEFAULT 0,
  `bom_no` varchar(140) DEFAULT NULL,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `is_stock_item` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty_consumed_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `has_variants` int(1) NOT NULL DEFAULT 0,
  `include_item_in_manufacturing` int(1) NOT NULL DEFAULT 0,
  `original_item` varchar(140) DEFAULT NULL,
  `sourced_by_supplier` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `bom_no` (`bom_no`),
  KEY `parent` (`parent`),
  KEY `fk_bom_item_uom` (`uom`),
  KEY `fk_bom_item_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_bom_item_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_bom_item_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Operation
CREATE TABLE IF NOT EXISTS `tabBOM Operation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sequence_id` int(11) NOT NULL DEFAULT 0,
  `operation` varchar(140) DEFAULT NULL,
  `workstation_type` varchar(140) DEFAULT NULL,
  `workstation` varchar(140) DEFAULT NULL,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `fixed_time` int(1) NOT NULL DEFAULT 0,
  `hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `batch_size` int(11) NOT NULL DEFAULT 0,
  `set_cost_based_on_bom_qty` int(1) NOT NULL DEFAULT 0,
  `cost_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_cost_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Scrap Item
CREATE TABLE IF NOT EXISTS `tabBOM Scrap Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Update Batch
CREATE TABLE IF NOT EXISTS `tabBOM Update Batch` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 0,
  `batch_no` int(11) NOT NULL DEFAULT 0,
  `boms_updated` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Update Log
CREATE TABLE IF NOT EXISTS `tabBOM Update Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `update_type` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `current_bom` varchar(140) DEFAULT NULL,
  `new_bom` varchar(140) DEFAULT NULL,
  `error_log` varchar(140) DEFAULT NULL,
  `current_level` int(11) NOT NULL DEFAULT 0,
  `processed_boms` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Website Item
CREATE TABLE IF NOT EXISTS `tabBOM Website Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `website_image` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBOM Website Operation
CREATE TABLE IF NOT EXISTS `tabBOM Website Operation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `operation` varchar(140) DEFAULT NULL,
  `workstation` varchar(140) DEFAULT NULL,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `website_image` text DEFAULT NULL,
  `thumbnail` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBranch
CREATE TABLE IF NOT EXISTS `tabBranch` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `branch` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBrand
CREATE TABLE IF NOT EXISTS `tabBrand` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `brand` (`brand`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBudget
CREATE TABLE IF NOT EXISTS `tabBudget` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `budget_against` varchar(140) DEFAULT 'Cost Center',
  `company` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `monthly_distribution` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `applicable_on_material_request` int(1) NOT NULL DEFAULT 0,
  `action_if_annual_budget_exceeded_on_mr` varchar(140) DEFAULT 'Stop',
  `action_if_accumulated_monthly_budget_exceeded_on_mr` varchar(140) DEFAULT 'Warn',
  `applicable_on_purchase_order` int(1) NOT NULL DEFAULT 0,
  `action_if_annual_budget_exceeded_on_po` varchar(140) DEFAULT 'Stop',
  `action_if_accumulated_monthly_budget_exceeded_on_po` varchar(140) DEFAULT 'Warn',
  `applicable_on_booking_actual_expenses` int(1) NOT NULL DEFAULT 0,
  `action_if_annual_budget_exceeded` varchar(140) DEFAULT 'Stop',
  `action_if_accumulated_monthly_budget_exceeded` varchar(140) DEFAULT 'Warn',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_budget_cost_center` (`cost_center`),
  CONSTRAINT `fk_budget_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBudget Account
CREATE TABLE IF NOT EXISTS `tabBudget Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `budget_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `account` (`account`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabBulk Transaction Log Detail
CREATE TABLE IF NOT EXISTS `tabBulk Transaction Log Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `from_doctype` varchar(140) DEFAULT NULL,
  `transaction_name` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time(6) DEFAULT NULL,
  `transaction_status` varchar(140) DEFAULT NULL,
  `error_description` longtext DEFAULT NULL,
  `to_doctype` varchar(140) DEFAULT NULL,
  `retried` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `from_doctype` (`from_doctype`),
  KEY `transaction_name` (`transaction_name`),
  KEY `date` (`date`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCalendar View
CREATE TABLE IF NOT EXISTS `tabCalendar View` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `subject_field` varchar(140) DEFAULT NULL,
  `start_date_field` varchar(140) DEFAULT NULL,
  `end_date_field` varchar(140) DEFAULT NULL,
  `all_day` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCall Log
CREATE TABLE IF NOT EXISTS `tabCall Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `id` varchar(140) DEFAULT NULL,
  `from` varchar(140) DEFAULT NULL,
  `to` varchar(140) DEFAULT NULL,
  `call_received_by` varchar(140) DEFAULT NULL,
  `employee_user_id` varchar(140) DEFAULT NULL,
  `medium` varchar(140) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `duration` decimal(21,9) DEFAULT NULL,
  `recording_url` varchar(140) DEFAULT NULL,
  `type_of_call` varchar(140) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `id` (`id`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCampaign
CREATE TABLE IF NOT EXISTS `tabCampaign` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `campaign_name` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCampaign Email Schedule
CREATE TABLE IF NOT EXISTS `tabCampaign Email Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_template` varchar(140) DEFAULT NULL,
  `send_after_days` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCampaign Item
CREATE TABLE IF NOT EXISTS `tabCampaign Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `campaign` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCashier Closing
CREATE TABLE IF NOT EXISTS `tabCashier Closing` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'POS-CLO-',
  `user` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `from_time` time(6) DEFAULT NULL,
  `time` time(6) DEFAULT NULL,
  `expense` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `custody` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returns` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCashier Closing Payments
CREATE TABLE IF NOT EXISTS `tabCashier Closing Payments` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabChangelog Feed
CREATE TABLE IF NOT EXISTS `tabChangelog Feed` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `app_name` varchar(140) DEFAULT NULL,
  `link` longtext DEFAULT NULL,
  `posting_timestamp` datetime(6) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `posting_timestamp` (`posting_timestamp`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCheque Print Template
CREATE TABLE IF NOT EXISTS `tabCheque Print Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `has_print_format` int(1) NOT NULL DEFAULT 0,
  `bank_name` varchar(140) DEFAULT NULL,
  `cheque_size` varchar(140) DEFAULT 'Regular',
  `starting_position_from_top_edge` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cheque_width` decimal(21,9) NOT NULL DEFAULT 20.000000000,
  `cheque_height` decimal(21,9) NOT NULL DEFAULT 9.000000000,
  `scanned_cheque` text DEFAULT NULL,
  `is_account_payable` int(1) NOT NULL DEFAULT 1,
  `acc_pay_dist_from_top_edge` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `acc_pay_dist_from_left_edge` decimal(21,9) NOT NULL DEFAULT 9.000000000,
  `message_to_show` varchar(140) DEFAULT 'Acc. Payee',
  `date_dist_from_top_edge` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `date_dist_from_left_edge` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `payer_name_from_top_edge` decimal(21,9) NOT NULL DEFAULT 2.000000000,
  `payer_name_from_left_edge` decimal(21,9) NOT NULL DEFAULT 3.000000000,
  `amt_in_words_from_top_edge` decimal(21,9) NOT NULL DEFAULT 3.000000000,
  `amt_in_words_from_left_edge` decimal(21,9) NOT NULL DEFAULT 4.000000000,
  `amt_in_word_width` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `amt_in_words_line_spacing` decimal(21,9) NOT NULL DEFAULT 0.500000000,
  `amt_in_figures_from_top_edge` decimal(21,9) NOT NULL DEFAULT 3.500000000,
  `amt_in_figures_from_left_edge` decimal(21,9) NOT NULL DEFAULT 16.000000000,
  `acc_no_dist_from_top_edge` decimal(21,9) NOT NULL DEFAULT 5.000000000,
  `acc_no_dist_from_left_edge` decimal(21,9) NOT NULL DEFAULT 4.000000000,
  `signatory_from_top_edge` decimal(21,9) NOT NULL DEFAULT 6.000000000,
  `signatory_from_left_edge` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabClient Script
CREATE TABLE IF NOT EXISTS `tabClient Script` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `dt` varchar(140) DEFAULT NULL,
  `view` varchar(140) DEFAULT 'Form',
  `module` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 0,
  `script` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabClosed Document
CREATE TABLE IF NOT EXISTS `tabClosed Document` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `closed` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabClosing Stock Balance
CREATE TABLE IF NOT EXISTS `tabClosing Stock Balance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `include_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `warehouse_type` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCode List
CREATE TABLE IF NOT EXISTS `tabCode List` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `canonical_uri` varchar(140) DEFAULT NULL,
  `url` varchar(140) DEFAULT NULL,
  `default_common_code` varchar(140) DEFAULT NULL,
  `version` varchar(140) DEFAULT NULL,
  `publisher` varchar(140) DEFAULT NULL,
  `publisher_id` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabColor
CREATE TABLE IF NOT EXISTS `tabColor` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `color` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabComment
CREATE TABLE IF NOT EXISTS `tabComment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `comment_type` varchar(140) DEFAULT 'Comment',
  `comment_email` varchar(140) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `comment_by` varchar(140) DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `seen` int(1) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_owner` varchar(140) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `ip_address` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `reference_doctype_reference_name_index` (`reference_doctype`,`reference_name`),
  KEY `fk_comment_owner` (`owner`),
  CONSTRAINT `fk_comment_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCommon Code
CREATE TABLE IF NOT EXISTS `tabCommon Code` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `code_list` varchar(140) DEFAULT NULL,
  `title` varchar(300) DEFAULT NULL,
  `common_code` varchar(300) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `additional_data` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `code_list` (`code_list`),
  KEY `common_code` (`common_code`),
  KEY `modified` (`modified`),
  KEY `code_list_common_code_index` (`code_list`,`common_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCommunication
CREATE TABLE IF NOT EXISTS `tabCommunication` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` text DEFAULT NULL,
  `communication_medium` varchar(140) DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `recipients` longtext DEFAULT NULL,
  `cc` longtext DEFAULT NULL,
  `bcc` longtext DEFAULT NULL,
  `phone_no` varchar(140) DEFAULT NULL,
  `delivery_status` varchar(140) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `text_content` longtext DEFAULT NULL,
  `communication_type` varchar(140) DEFAULT 'Communication',
  `comment_type` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `sent_or_received` varchar(140) DEFAULT NULL,
  `communication_date` datetime(6) DEFAULT NULL,
  `read_receipt` int(1) NOT NULL DEFAULT 0,
  `send_after` datetime(6) DEFAULT NULL,
  `sender_full_name` varchar(140) DEFAULT NULL,
  `read_by_recipient` int(1) NOT NULL DEFAULT 0,
  `read_by_recipient_on` datetime(6) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_owner` varchar(140) DEFAULT NULL,
  `email_account` varchar(140) DEFAULT NULL,
  `in_reply_to` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `email_template` varchar(140) DEFAULT NULL,
  `unread_notification_sent` int(1) NOT NULL DEFAULT 0,
  `seen` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `message_id` text DEFAULT NULL,
  `uid` int(11) NOT NULL DEFAULT 0,
  `imap_folder` varchar(140) DEFAULT NULL,
  `email_status` varchar(140) DEFAULT NULL,
  `has_attachment` int(1) NOT NULL DEFAULT 0,
  `rating` int(11) NOT NULL DEFAULT 0,
  `feedback_request` varchar(140) DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_owner` (`reference_owner`),
  KEY `modified` (`modified`),
  KEY `reference_doctype_reference_name_index` (`reference_doctype`,`reference_name`),
  KEY `status_communication_type_index` (`status`,`communication_type`),
  KEY `message_id_index` (`message_id`(140)),
  KEY `fk_communication_owner` (`owner`),
  CONSTRAINT `fk_communication_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCommunication Link
CREATE TABLE IF NOT EXISTS `tabCommunication Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `link_doctype` varchar(140) DEFAULT NULL,
  `link_name` varchar(140) DEFAULT NULL,
  `link_title` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `link_doctype_link_name_index` (`link_doctype`,`link_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCommunication Medium
CREATE TABLE IF NOT EXISTS `tabCommunication Medium` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `communication_channel` varchar(140) DEFAULT NULL,
  `communication_medium_type` varchar(140) DEFAULT NULL,
  `catch_all` varchar(140) DEFAULT NULL,
  `provider` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCommunication Medium Timeslot
CREATE TABLE IF NOT EXISTS `tabCommunication Medium Timeslot` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day_of_week` varchar(140) DEFAULT NULL,
  `from_time` time(6) DEFAULT NULL,
  `to_time` time(6) DEFAULT NULL,
  `employee_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCompany
CREATE TABLE IF NOT EXISTS `tabCompany` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company_name` varchar(140) DEFAULT NULL,
  `abbr` varchar(140) DEFAULT NULL,
  `default_currency` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `default_holiday_list` varchar(140) DEFAULT NULL,
  `default_letter_head` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `domain` varchar(140) DEFAULT NULL,
  `date_of_establishment` date DEFAULT NULL,
  `parent_company` varchar(140) DEFAULT NULL,
  `company_logo` text DEFAULT NULL,
  `date_of_incorporation` date DEFAULT NULL,
  `phone_no` varchar(140) DEFAULT NULL,
  `email` varchar(140) DEFAULT NULL,
  `company_description` longtext DEFAULT NULL,
  `date_of_commencement` date DEFAULT NULL,
  `fax` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `registration_details` longtext DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `create_chart_of_accounts_based_on` varchar(140) DEFAULT NULL,
  `existing_company` varchar(140) DEFAULT NULL,
  `chart_of_accounts` varchar(140) DEFAULT NULL,
  `default_bank_account` varchar(140) DEFAULT NULL,
  `default_cash_account` varchar(140) DEFAULT NULL,
  `default_receivable_account` varchar(140) DEFAULT NULL,
  `default_payable_account` varchar(140) DEFAULT NULL,
  `write_off_account` varchar(140) DEFAULT NULL,
  `unrealized_profit_loss_account` varchar(140) DEFAULT NULL,
  `allow_account_creation_against_child_company` int(1) NOT NULL DEFAULT 0,
  `default_expense_account` varchar(140) DEFAULT NULL,
  `default_income_account` varchar(140) DEFAULT NULL,
  `default_discount_account` varchar(140) DEFAULT NULL,
  `payment_terms` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `default_finance_book` varchar(140) DEFAULT NULL,
  `exchange_gain_loss_account` varchar(140) DEFAULT NULL,
  `unrealized_exchange_gain_loss_account` varchar(140) DEFAULT NULL,
  `round_off_account` varchar(140) DEFAULT NULL,
  `round_off_cost_center` varchar(140) DEFAULT NULL,
  `round_off_for_opening` varchar(140) DEFAULT NULL,
  `default_deferred_revenue_account` varchar(140) DEFAULT NULL,
  `default_deferred_expense_account` varchar(140) DEFAULT NULL,
  `book_advance_payments_in_separate_party_account` int(1) NOT NULL DEFAULT 0,
  `reconcile_on_advance_payment_date` int(1) NOT NULL DEFAULT 0,
  `reconciliation_takes_effect_on` varchar(140) DEFAULT 'Oldest Of Invoice Or Advance',
  `default_advance_received_account` varchar(140) DEFAULT NULL,
  `default_advance_paid_account` varchar(140) DEFAULT NULL,
  `auto_exchange_rate_revaluation` int(1) NOT NULL DEFAULT 0,
  `auto_err_frequency` varchar(140) DEFAULT NULL,
  `submit_err_jv` int(1) NOT NULL DEFAULT 0,
  `exception_budget_approver_role` varchar(140) DEFAULT NULL,
  `accumulated_depreciation_account` varchar(140) DEFAULT NULL,
  `depreciation_expense_account` varchar(140) DEFAULT NULL,
  `series_for_depreciation_entry` varchar(140) DEFAULT NULL,
  `expenses_included_in_asset_valuation` varchar(140) DEFAULT NULL,
  `disposal_account` varchar(140) DEFAULT NULL,
  `depreciation_cost_center` varchar(140) DEFAULT NULL,
  `capital_work_in_progress_account` varchar(140) DEFAULT NULL,
  `asset_received_but_not_billed` varchar(140) DEFAULT NULL,
  `default_buying_terms` varchar(140) DEFAULT NULL,
  `sales_monthly_history` text DEFAULT NULL,
  `monthly_sales_target` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_monthly_sales` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `default_selling_terms` varchar(140) DEFAULT NULL,
  `default_warehouse_for_sales_return` varchar(140) DEFAULT NULL,
  `credit_limit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transactions_annual_history` longtext DEFAULT NULL,
  `enable_perpetual_inventory` int(1) NOT NULL DEFAULT 1,
  `enable_provisional_accounting_for_non_stock_items` int(1) NOT NULL DEFAULT 0,
  `default_inventory_account` varchar(140) DEFAULT NULL,
  `stock_adjustment_account` varchar(140) DEFAULT NULL,
  `default_in_transit_warehouse` varchar(140) DEFAULT NULL,
  `stock_received_but_not_billed` varchar(140) DEFAULT NULL,
  `default_provisional_account` varchar(140) DEFAULT NULL,
  `expenses_included_in_valuation` varchar(140) DEFAULT NULL,
  `default_operating_cost_account` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `company_name` (`company_name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `fk_company_default_currency` (`default_currency`),
  KEY `fk_company_default_in_transit_warehouse` (`default_in_transit_warehouse`),
  KEY `fk_company_cost_center` (`cost_center`),
  KEY `fk_company_depreciation_cc` (`depreciation_cost_center`),
  KEY `fk_company_round_off_cc` (`round_off_cost_center`),
  CONSTRAINT `fk_company_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_company_currency` FOREIGN KEY (`default_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_company_default_currency` FOREIGN KEY (`default_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_company_default_in_transit_warehouse` FOREIGN KEY (`default_in_transit_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_company_depreciation_cc` FOREIGN KEY (`depreciation_cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_company_round_off_cc` FOREIGN KEY (`round_off_cost_center`) REFERENCES `tabCost Center` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCompany History
CREATE TABLE IF NOT EXISTS `tabCompany History` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `year` varchar(140) DEFAULT NULL,
  `highlight` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCompetitor
CREATE TABLE IF NOT EXISTS `tabCompetitor` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `competitor_name` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `competitor_name` (`competitor_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCompetitor Detail
CREATE TABLE IF NOT EXISTS `tabCompetitor Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `competitor` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabConnected App
CREATE TABLE IF NOT EXISTS `tabConnected App` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `provider_name` varchar(140) DEFAULT NULL,
  `openid_configuration` varchar(140) DEFAULT NULL,
  `client_id` varchar(140) DEFAULT NULL,
  `redirect_uri` varchar(140) DEFAULT NULL,
  `client_secret` text DEFAULT NULL,
  `authorization_uri` text DEFAULT NULL,
  `token_uri` varchar(140) DEFAULT NULL,
  `revocation_uri` varchar(140) DEFAULT NULL,
  `userinfo_uri` varchar(140) DEFAULT NULL,
  `introspection_uri` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabConsole Log
CREATE TABLE IF NOT EXISTS `tabConsole Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `script` longtext DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `committed` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContact
CREATE TABLE IF NOT EXISTS `tabContact` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `first_name` varchar(140) DEFAULT NULL,
  `middle_name` varchar(140) DEFAULT NULL,
  `last_name` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `address` varchar(140) DEFAULT NULL,
  `sync_with_google_contacts` int(1) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Passive',
  `salutation` varchar(140) DEFAULT NULL,
  `designation` varchar(140) DEFAULT NULL,
  `gender` varchar(140) DEFAULT NULL,
  `phone` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `company_name` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `google_contacts` varchar(140) DEFAULT NULL,
  `google_contacts_id` varchar(140) DEFAULT NULL,
  `pulled_from_google_contacts` int(1) NOT NULL DEFAULT 0,
  `is_primary_contact` int(1) NOT NULL DEFAULT 0,
  `department` varchar(140) DEFAULT NULL,
  `unsubscribed` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `is_billing_contact` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `email_id` (`email_id`),
  KEY `modified` (`modified`),
  KEY `fk_contact_address` (`address`),
  CONSTRAINT `fk_contact_address` FOREIGN KEY (`address`) REFERENCES `tabAddress` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContact Email
CREATE TABLE IF NOT EXISTS `tabContact Email` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_id` varchar(140) DEFAULT NULL,
  `is_primary` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContact Phone
CREATE TABLE IF NOT EXISTS `tabContact Phone` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `phone` varchar(140) DEFAULT NULL,
  `is_primary_phone` int(1) NOT NULL DEFAULT 0,
  `is_primary_mobile_no` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContract
CREATE TABLE IF NOT EXISTS `tabContract` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `party_type` varchar(140) DEFAULT 'Customer',
  `is_signed` int(1) NOT NULL DEFAULT 0,
  `party_name` varchar(140) DEFAULT NULL,
  `party_user` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `fulfilment_status` varchar(140) DEFAULT NULL,
  `party_full_name` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `signee` varchar(140) DEFAULT NULL,
  `signed_on` datetime(6) DEFAULT NULL,
  `ip_address` varchar(140) DEFAULT NULL,
  `contract_template` varchar(140) DEFAULT NULL,
  `contract_terms` longtext DEFAULT NULL,
  `requires_fulfilment` int(1) NOT NULL DEFAULT 0,
  `fulfilment_deadline` date DEFAULT NULL,
  `signee_company` longtext DEFAULT NULL,
  `signed_by_company` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `document_name` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContract Fulfilment Checklist
CREATE TABLE IF NOT EXISTS `tabContract Fulfilment Checklist` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fulfilled` int(1) NOT NULL DEFAULT 0,
  `requirement` varchar(140) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContract Template
CREATE TABLE IF NOT EXISTS `tabContract Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `contract_terms` longtext DEFAULT NULL,
  `requires_fulfilment` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabContract Template Fulfilment Terms
CREATE TABLE IF NOT EXISTS `tabContract Template Fulfilment Terms` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `requirement` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCost Center
CREATE TABLE IF NOT EXISTS `tabCost Center` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `cost_center_name` varchar(140) DEFAULT NULL,
  `cost_center_number` varchar(140) DEFAULT NULL,
  `parent_cost_center` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`),
  KEY `fk_cost_center_company` (`company`),
  CONSTRAINT `fk_cost_center_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_costcenter_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCost Center Allocation
CREATE TABLE IF NOT EXISTS `tabCost Center Allocation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `main_cost_center` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_cca_main_cost_center` (`main_cost_center`),
  CONSTRAINT `fk_cca_main_cost_center` FOREIGN KEY (`main_cost_center`) REFERENCES `tabCost Center` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCost Center Allocation Percentage
CREATE TABLE IF NOT EXISTS `tabCost Center Allocation Percentage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `cost_center` varchar(140) DEFAULT NULL,
  `percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_ccap_cost_center` (`cost_center`),
  CONSTRAINT `fk_ccap_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCountry
CREATE TABLE IF NOT EXISTS `tabCountry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `country_name` varchar(140) DEFAULT NULL,
  `date_format` varchar(140) DEFAULT NULL,
  `time_format` varchar(140) DEFAULT 'HH:mm:ss',
  `time_zones` text DEFAULT NULL,
  `code` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `country_name` (`country_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCoupon Code
CREATE TABLE IF NOT EXISTS `tabCoupon Code` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `coupon_name` varchar(140) DEFAULT NULL,
  `coupon_type` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `coupon_code` varchar(140) DEFAULT NULL,
  `pricing_rule` varchar(140) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `maximum_use` int(11) NOT NULL DEFAULT 0,
  `used` int(11) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `coupon_name` (`coupon_name`),
  UNIQUE KEY `coupon_code` (`coupon_code`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCRM Note
CREATE TABLE IF NOT EXISTS `tabCRM Note` (
  `name` bigint(20) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `note` longtext DEFAULT NULL,
  `added_by` varchar(140) DEFAULT NULL,
  `added_on` datetime(6) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCurrency
CREATE TABLE IF NOT EXISTS `tabCurrency` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `currency_name` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 0,
  `fraction` varchar(140) DEFAULT NULL,
  `fraction_units` int(11) NOT NULL DEFAULT 0,
  `smallest_currency_fraction_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `symbol` varchar(140) DEFAULT NULL,
  `symbol_on_right` int(1) NOT NULL DEFAULT 0,
  `number_format` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `currency_name` (`currency_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCurrency Exchange
CREATE TABLE IF NOT EXISTS `tabCurrency Exchange` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  `from_currency` varchar(140) DEFAULT NULL,
  `to_currency` varchar(140) DEFAULT NULL,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `for_buying` int(1) NOT NULL DEFAULT 1,
  `for_selling` int(1) NOT NULL DEFAULT 1,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ce_from_currency` (`from_currency`),
  KEY `fk_ce_to_currency` (`to_currency`),
  CONSTRAINT `fk_ce_from_currency` FOREIGN KEY (`from_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_ce_to_currency` FOREIGN KEY (`to_currency`) REFERENCES `tabCurrency` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCurrency Exchange Settings Details
CREATE TABLE IF NOT EXISTS `tabCurrency Exchange Settings Details` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `key` varchar(140) DEFAULT NULL,
  `value` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCurrency Exchange Settings Result
CREATE TABLE IF NOT EXISTS `tabCurrency Exchange Settings Result` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `key` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustom DocPerm
CREATE TABLE IF NOT EXISTS `tabCustom DocPerm` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `role` varchar(140) DEFAULT NULL,
  `if_owner` int(1) NOT NULL DEFAULT 0,
  `permlevel` int(11) NOT NULL DEFAULT 0,
  `select` int(1) NOT NULL DEFAULT 0,
  `read` int(1) NOT NULL DEFAULT 1,
  `write` int(1) NOT NULL DEFAULT 0,
  `create` int(1) NOT NULL DEFAULT 0,
  `delete` int(1) NOT NULL DEFAULT 0,
  `submit` int(1) NOT NULL DEFAULT 0,
  `cancel` int(1) NOT NULL DEFAULT 0,
  `amend` int(1) NOT NULL DEFAULT 0,
  `report` int(1) NOT NULL DEFAULT 0,
  `export` int(1) NOT NULL DEFAULT 1,
  `import` int(1) NOT NULL DEFAULT 0,
  `share` int(1) NOT NULL DEFAULT 0,
  `print` int(1) NOT NULL DEFAULT 0,
  `email` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustom Field
CREATE TABLE IF NOT EXISTS `tabCustom Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_system_generated` int(1) NOT NULL DEFAULT 0,
  `dt` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `placeholder` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `insert_after` varchar(140) DEFAULT NULL,
  `length` int(11) NOT NULL DEFAULT 0,
  `link_filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`link_filters`)),
  `fieldtype` varchar(140) DEFAULT 'Data',
  `precision` varchar(140) DEFAULT NULL,
  `hide_seconds` int(1) NOT NULL DEFAULT 0,
  `hide_days` int(1) NOT NULL DEFAULT 0,
  `options` text DEFAULT NULL,
  `sort_options` int(1) NOT NULL DEFAULT 0,
  `fetch_from` text DEFAULT NULL,
  `fetch_if_empty` int(1) NOT NULL DEFAULT 0,
  `collapsible` int(1) NOT NULL DEFAULT 0,
  `collapsible_depends_on` longtext DEFAULT NULL,
  `default` text DEFAULT NULL,
  `depends_on` longtext DEFAULT NULL,
  `mandatory_depends_on` longtext DEFAULT NULL,
  `read_only_depends_on` longtext DEFAULT NULL,
  `non_negative` int(1) NOT NULL DEFAULT 0,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `unique` int(1) NOT NULL DEFAULT 0,
  `is_virtual` int(1) NOT NULL DEFAULT 0,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `ignore_user_permissions` int(1) NOT NULL DEFAULT 0,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `print_hide` int(1) NOT NULL DEFAULT 0,
  `print_hide_if_no_value` int(1) NOT NULL DEFAULT 0,
  `print_width` varchar(140) DEFAULT NULL,
  `no_copy` int(1) NOT NULL DEFAULT 0,
  `allow_on_submit` int(1) NOT NULL DEFAULT 0,
  `in_list_view` int(1) NOT NULL DEFAULT 0,
  `in_standard_filter` int(1) NOT NULL DEFAULT 0,
  `in_global_search` int(1) NOT NULL DEFAULT 0,
  `in_preview` int(1) NOT NULL DEFAULT 0,
  `bold` int(1) NOT NULL DEFAULT 0,
  `report_hide` int(1) NOT NULL DEFAULT 0,
  `search_index` int(1) NOT NULL DEFAULT 0,
  `allow_in_quick_entry` int(1) NOT NULL DEFAULT 0,
  `ignore_xss_filter` int(1) NOT NULL DEFAULT 0,
  `translatable` int(1) NOT NULL DEFAULT 0,
  `hide_border` int(1) NOT NULL DEFAULT 0,
  `show_dashboard` int(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `permlevel` int(11) NOT NULL DEFAULT 0,
  `width` varchar(140) DEFAULT NULL,
  `columns` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `dt` (`dt`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustom HTML Block
CREATE TABLE IF NOT EXISTS `tabCustom HTML Block` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `private` int(1) NOT NULL DEFAULT 0,
  `html` longtext DEFAULT NULL,
  `script` longtext DEFAULT NULL,
  `style` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustom Role
CREATE TABLE IF NOT EXISTS `tabCustom Role` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `page` varchar(140) DEFAULT NULL,
  `report` varchar(140) DEFAULT NULL,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomer
CREATE TABLE IF NOT EXISTS `tabCustomer` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `salutation` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `customer_type` varchar(140) DEFAULT 'Company',
  `customer_group` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `gender` varchar(140) DEFAULT NULL,
  `lead_name` varchar(140) DEFAULT NULL,
  `opportunity_name` varchar(140) DEFAULT NULL,
  `prospect_name` varchar(140) DEFAULT NULL,
  `account_manager` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `default_currency` varchar(140) DEFAULT NULL,
  `default_bank_account` varchar(140) DEFAULT NULL,
  `default_price_list` varchar(140) DEFAULT NULL,
  `is_internal_customer` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `market_segment` varchar(140) DEFAULT NULL,
  `industry` varchar(140) DEFAULT NULL,
  `customer_pos_id` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `customer_details` text DEFAULT NULL,
  `customer_primary_address` varchar(140) DEFAULT NULL,
  `primary_address` text DEFAULT NULL,
  `customer_primary_contact` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `payment_terms` varchar(140) DEFAULT NULL,
  `loyalty_program` varchar(140) DEFAULT NULL,
  `loyalty_program_tier` varchar(140) DEFAULT NULL,
  `default_sales_partner` varchar(140) DEFAULT NULL,
  `default_commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `so_required` int(1) NOT NULL DEFAULT 0,
  `dn_required` int(1) NOT NULL DEFAULT 0,
  `is_frozen` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `represents_company` (`represents_company`),
  KEY `customer_name` (`customer_name`),
  KEY `customer_group` (`customer_group`),
  KEY `modified` (`modified`),
  KEY `fk_customer_owner` (`owner`),
  KEY `fk_customer_modified_by` (`modified_by`),
  KEY `fk_customer_territory` (`territory`),
  KEY `fk_customer_default_price_list` (`default_price_list`),
  KEY `fk_customer_tax_category` (`tax_category`),
  KEY `fk_customer_tax_withholding_category` (`tax_withholding_category`),
  CONSTRAINT `fk_customer_default_price_list` FOREIGN KEY (`default_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`),
  CONSTRAINT `fk_customer_tax_withholding_category` FOREIGN KEY (`tax_withholding_category`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_customer_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomer Credit Limit
CREATE TABLE IF NOT EXISTS `tabCustomer Credit Limit` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `credit_limit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bypass_credit_limit_check` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomer Group
CREATE TABLE IF NOT EXISTS `tabCustomer Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer_group_name` varchar(140) DEFAULT NULL,
  `parent_customer_group` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `default_price_list` varchar(140) DEFAULT NULL,
  `payment_terms` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `customer_group_name` (`customer_group_name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`),
  KEY `fk_customer_group_default_price_list` (`default_price_list`),
  CONSTRAINT `fk_customer_group_default_price_list` FOREIGN KEY (`default_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomer Group Item
CREATE TABLE IF NOT EXISTS `tabCustomer Group Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomer Item
CREATE TABLE IF NOT EXISTS `tabCustomer Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustomize Form Field
CREATE TABLE IF NOT EXISTS `tabCustomize Form Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_system_generated` int(1) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT 'Data',
  `fieldname` varchar(140) DEFAULT NULL,
  `non_negative` int(1) NOT NULL DEFAULT 0,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `unique` int(1) NOT NULL DEFAULT 0,
  `is_virtual` int(1) NOT NULL DEFAULT 0,
  `in_list_view` int(1) NOT NULL DEFAULT 0,
  `in_standard_filter` int(1) NOT NULL DEFAULT 0,
  `in_global_search` int(1) NOT NULL DEFAULT 0,
  `in_preview` int(1) NOT NULL DEFAULT 0,
  `bold` int(1) NOT NULL DEFAULT 0,
  `no_copy` int(1) NOT NULL DEFAULT 0,
  `allow_in_quick_entry` int(1) NOT NULL DEFAULT 0,
  `translatable` int(1) NOT NULL DEFAULT 1,
  `link_filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`link_filters`)),
  `default` text DEFAULT NULL,
  `precision` varchar(140) DEFAULT NULL,
  `length` int(11) NOT NULL DEFAULT 0,
  `options` text DEFAULT NULL,
  `sort_options` int(1) NOT NULL DEFAULT 0,
  `fetch_from` text DEFAULT NULL,
  `fetch_if_empty` int(1) NOT NULL DEFAULT 0,
  `show_dashboard` int(1) NOT NULL DEFAULT 0,
  `depends_on` longtext DEFAULT NULL,
  `permlevel` int(11) NOT NULL DEFAULT 0,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `collapsible` int(1) NOT NULL DEFAULT 0,
  `allow_bulk_edit` int(1) NOT NULL DEFAULT 0,
  `collapsible_depends_on` longtext DEFAULT NULL,
  `ignore_user_permissions` int(1) NOT NULL DEFAULT 0,
  `allow_on_submit` int(1) NOT NULL DEFAULT 0,
  `report_hide` int(1) NOT NULL DEFAULT 0,
  `remember_last_selected_value` int(1) NOT NULL DEFAULT 0,
  `hide_border` int(1) NOT NULL DEFAULT 0,
  `ignore_xss_filter` int(1) NOT NULL DEFAULT 0,
  `mandatory_depends_on` longtext DEFAULT NULL,
  `read_only_depends_on` longtext DEFAULT NULL,
  `in_filter` int(1) NOT NULL DEFAULT 0,
  `hide_seconds` int(1) NOT NULL DEFAULT 0,
  `hide_days` int(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `placeholder` varchar(140) DEFAULT NULL,
  `print_hide` int(1) NOT NULL DEFAULT 0,
  `print_hide_if_no_value` int(1) NOT NULL DEFAULT 0,
  `print_width` varchar(140) DEFAULT NULL,
  `columns` int(11) NOT NULL DEFAULT 0,
  `width` varchar(140) DEFAULT NULL,
  `is_custom_field` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `label` (`label`),
  KEY `fieldtype` (`fieldtype`),
  KEY `fieldname` (`fieldname`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabCustoms Tariff Number
CREATE TABLE IF NOT EXISTS `tabCustoms Tariff Number` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `tariff_number` varchar(140) DEFAULT NULL,
  `description` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `tariff_number` (`tariff_number`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard
CREATE TABLE IF NOT EXISTS `tabDashboard` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `dashboard_name` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `chart_options` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `dashboard_name` (`dashboard_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard Chart
CREATE TABLE IF NOT EXISTS `tabDashboard Chart` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `chart_name` varchar(140) DEFAULT NULL,
  `chart_type` varchar(140) DEFAULT NULL,
  `report_name` varchar(140) DEFAULT NULL,
  `use_report_chart` int(1) NOT NULL DEFAULT 0,
  `x_field` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `parent_document_type` varchar(140) DEFAULT NULL,
  `based_on` varchar(140) DEFAULT NULL,
  `value_based_on` varchar(140) DEFAULT NULL,
  `group_by_type` varchar(140) DEFAULT 'Count',
  `group_by_based_on` varchar(140) DEFAULT NULL,
  `aggregate_function_based_on` varchar(140) DEFAULT NULL,
  `number_of_groups` int(11) NOT NULL DEFAULT 0,
  `is_public` int(1) NOT NULL DEFAULT 0,
  `heatmap_year` varchar(140) DEFAULT NULL,
  `timespan` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `time_interval` varchar(140) DEFAULT NULL,
  `timeseries` int(1) NOT NULL DEFAULT 0,
  `type` varchar(140) DEFAULT 'Line',
  `show_values_over_chart` int(1) NOT NULL DEFAULT 0,
  `currency` varchar(140) DEFAULT NULL,
  `filters_json` longtext DEFAULT NULL,
  `dynamic_filters_json` longtext DEFAULT NULL,
  `custom_options` longtext DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `last_synced_on` datetime(6) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `chart_name` (`chart_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard Chart Field
CREATE TABLE IF NOT EXISTS `tabDashboard Chart Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `y_field` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard Chart Link
CREATE TABLE IF NOT EXISTS `tabDashboard Chart Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `chart` varchar(140) DEFAULT NULL,
  `width` varchar(140) DEFAULT 'Half',
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard Chart Source
CREATE TABLE IF NOT EXISTS `tabDashboard Chart Source` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `source_name` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `timeseries` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `source_name` (`source_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDashboard Settings
CREATE TABLE IF NOT EXISTS `tabDashboard Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `chart_config` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabData Import
CREATE TABLE IF NOT EXISTS `tabData Import` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `import_type` varchar(140) DEFAULT NULL,
  `import_file` text DEFAULT NULL,
  `payload_count` int(11) NOT NULL DEFAULT 0,
  `google_sheets_url` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending',
  `submit_after_import` int(1) NOT NULL DEFAULT 0,
  `mute_emails` int(1) NOT NULL DEFAULT 1,
  `template_options` longtext DEFAULT NULL,
  `template_warnings` longtext DEFAULT NULL,
  `show_failed_logs` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabData Import Log
CREATE TABLE IF NOT EXISTS `tabData Import Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `data_import` varchar(140) DEFAULT NULL,
  `row_indexes` longtext DEFAULT NULL,
  `success` int(1) NOT NULL DEFAULT 0,
  `docname` varchar(140) DEFAULT NULL,
  `messages` longtext DEFAULT NULL,
  `exception` text DEFAULT NULL,
  `log_index` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDefaultValue
CREATE TABLE IF NOT EXISTS `tabDefaultValue` (
  `name` varchar(255) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(255) DEFAULT NULL,
  `parentfield` varchar(255) DEFAULT NULL,
  `parenttype` varchar(255) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `defvalue` text DEFAULT NULL,
  `defkey` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `defaultvalue_parent_defkey_index` (`parent`,`defkey`),
  KEY `defaultvalue_parent_parenttype_index` (`parent`,`parenttype`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDeleted Document
CREATE TABLE IF NOT EXISTS `tabDeleted Document` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `deleted_name` varchar(140) DEFAULT NULL,
  `deleted_doctype` varchar(140) DEFAULT NULL,
  `restored` int(1) NOT NULL DEFAULT 0,
  `new_name` varchar(140) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDelivery Note
CREATE TABLE IF NOT EXISTS `tabDelivery Note` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{customer_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `issue_credit_note` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `set_target_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `shipping_address_name` varchar(140) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `dispatch_address_name` varchar(140) DEFAULT NULL,
  `dispatch_address` text DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `company_contact_person` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `per_billed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `status` varchar(140) DEFAULT 'Draft',
  `per_installed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `installation_status` varchar(140) DEFAULT NULL,
  `per_returned` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transporter` varchar(140) DEFAULT NULL,
  `driver` varchar(140) DEFAULT NULL,
  `lr_no` varchar(140) DEFAULT NULL,
  `vehicle_no` varchar(140) DEFAULT NULL,
  `transporter_name` varchar(140) DEFAULT NULL,
  `driver_name` varchar(140) DEFAULT NULL,
  `lr_date` date DEFAULT NULL,
  `po_no` text DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `amount_eligible_for_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `print_without_amount` int(1) NOT NULL DEFAULT 0,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `is_internal_customer` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `inter_company_reference` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `excise_page` varchar(140) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `posting_date` (`posting_date`),
  KEY `return_against` (`return_against`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  KEY `fk_dn_company` (`company`),
  KEY `fk_dn_territory` (`territory`),
  KEY `fk_dn_selling_price_list` (`selling_price_list`),
  KEY `fk_dn_tax_category` (`tax_category`),
  KEY `fk_dn_tax_template` (`taxes_and_charges`),
  KEY `fk_dn_currency` (`currency`),
  KEY `fk_dn_cost_center` (`cost_center`),
  CONSTRAINT `fk_dn_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_dn_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dn_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_dn_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`),
  CONSTRAINT `fk_dn_selling_price_list` FOREIGN KEY (`selling_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dn_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`),
  CONSTRAINT `fk_dn_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabSales Taxes and Charges Template` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dn_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDelivery Note Item
CREATE TABLE IF NOT EXISTS `tabDelivery Note Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `customer_item_code` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `grant_commission` int(1) NOT NULL DEFAULT 0,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billed_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse` varchar(140) DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `against_sales_order` varchar(140) DEFAULT NULL,
  `so_detail` varchar(140) DEFAULT NULL,
  `against_sales_invoice` varchar(140) DEFAULT NULL,
  `si_detail` varchar(140) DEFAULT NULL,
  `dn_detail` varchar(140) DEFAULT NULL,
  `against_pick_list` varchar(140) DEFAULT NULL,
  `pick_list_item` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_batch_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company_total_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `installed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `packed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expense_account` varchar(140) DEFAULT NULL,
  `item_tax_rate` text DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `against_sales_order` (`against_sales_order`),
  KEY `so_detail` (`so_detail`),
  KEY `against_sales_invoice` (`against_sales_invoice`),
  KEY `si_detail` (`si_detail`),
  KEY `dn_detail` (`dn_detail`),
  KEY `against_pick_list` (`against_pick_list`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `purchase_order` (`purchase_order`),
  KEY `parent` (`parent`),
  KEY `fk_dni_item_group` (`item_group`),
  KEY `fk_dni_warehouse` (`warehouse`),
  KEY `fk_dni_uom` (`uom`),
  KEY `fk_dni_stock_uom` (`stock_uom`),
  KEY `fk_dni_brand` (`brand`),
  KEY `fk_dni_cost_center` (`cost_center`),
  CONSTRAINT `fk_dn_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_dn_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dni_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dni_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dni_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_dni_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_dni_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_dni_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDelivery Stop
CREATE TABLE IF NOT EXISTS `tabDelivery Stop` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer` varchar(140) DEFAULT NULL,
  `address` varchar(140) DEFAULT NULL,
  `locked` int(1) NOT NULL DEFAULT 0,
  `customer_address` text DEFAULT NULL,
  `visited` int(1) NOT NULL DEFAULT 0,
  `delivery_note` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `contact` varchar(140) DEFAULT NULL,
  `email_sent_to` varchar(140) DEFAULT NULL,
  `customer_contact` text DEFAULT NULL,
  `distance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `estimated_arrival` datetime(6) DEFAULT NULL,
  `lat` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `lng` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `details` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDelivery Trip
CREATE TABLE IF NOT EXISTS `tabDelivery Trip` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `email_notification_sent` int(1) NOT NULL DEFAULT 0,
  `driver` varchar(140) DEFAULT NULL,
  `driver_name` varchar(140) DEFAULT NULL,
  `driver_email` varchar(140) DEFAULT NULL,
  `driver_address` varchar(140) DEFAULT NULL,
  `total_distance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `vehicle` varchar(140) DEFAULT NULL,
  `departure_time` datetime(6) DEFAULT NULL,
  `employee` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDepartment
CREATE TABLE IF NOT EXISTS `tabDepartment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `department_name` varchar(140) DEFAULT NULL,
  `parent_department` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDependent Task
CREATE TABLE IF NOT EXISTS `tabDependent Task` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `task` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDepreciation Schedule
CREATE TABLE IF NOT EXISTS `tabDepreciation Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `schedule_date` date DEFAULT NULL,
  `depreciation_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `accumulated_depreciation_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `journal_entry` varchar(140) DEFAULT NULL,
  `shift` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDesignation
CREATE TABLE IF NOT EXISTS `tabDesignation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `designation_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `designation_name` (`designation_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDesktop Icon
CREATE TABLE IF NOT EXISTS `tabDesktop Icon` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `module_name` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `standard` int(1) NOT NULL DEFAULT 0,
  `custom` int(1) NOT NULL DEFAULT 0,
  `app` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(140) DEFAULT NULL,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `blocked` int(1) NOT NULL DEFAULT 0,
  `force_show` int(1) NOT NULL DEFAULT 0,
  `type` varchar(140) DEFAULT NULL,
  `_doctype` varchar(140) DEFAULT NULL,
  `_report` varchar(140) DEFAULT NULL,
  `link` text DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `reverse` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `unique_module_name_owner_standard` (`module_name`,`owner`,`standard`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDiscounted Invoice
CREATE TABLE IF NOT EXISTS `tabDiscounted Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_invoice` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit_to` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `sales_invoice` (`sales_invoice`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDiscussion Reply
CREATE TABLE IF NOT EXISTS `tabDiscussion Reply` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `topic` varchar(140) DEFAULT NULL,
  `reply` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDiscussion Topic
CREATE TABLE IF NOT EXISTS `tabDiscussion Topic` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_docname` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocField
CREATE TABLE IF NOT EXISTS `tabDocField` (
  `name` varchar(255) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(255) DEFAULT NULL,
  `parentfield` varchar(255) DEFAULT NULL,
  `parenttype` varchar(255) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `oldfieldname` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT 'Data',
  `oldfieldtype` varchar(140) DEFAULT NULL,
  `options` text DEFAULT NULL,
  `search_index` int(1) NOT NULL DEFAULT 0,
  `show_dashboard` int(1) NOT NULL DEFAULT 0,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `set_only_once` int(1) NOT NULL DEFAULT 0,
  `allow_in_quick_entry` int(1) NOT NULL DEFAULT 0,
  `print_hide` int(1) NOT NULL DEFAULT 0,
  `report_hide` int(1) NOT NULL DEFAULT 0,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `bold` int(1) NOT NULL DEFAULT 0,
  `in_global_search` int(1) NOT NULL DEFAULT 0,
  `collapsible` int(1) NOT NULL DEFAULT 0,
  `unique` int(1) NOT NULL DEFAULT 0,
  `no_copy` int(1) NOT NULL DEFAULT 0,
  `allow_on_submit` int(1) NOT NULL DEFAULT 0,
  `show_preview_popup` int(1) NOT NULL DEFAULT 0,
  `trigger` varchar(255) DEFAULT NULL,
  `collapsible_depends_on` longtext DEFAULT NULL,
  `mandatory_depends_on` longtext DEFAULT NULL,
  `read_only_depends_on` longtext DEFAULT NULL,
  `depends_on` longtext DEFAULT NULL,
  `permlevel` int(11) NOT NULL DEFAULT 0,
  `ignore_user_permissions` int(1) NOT NULL DEFAULT 0,
  `width` varchar(10) DEFAULT NULL,
  `print_width` varchar(10) DEFAULT NULL,
  `columns` int(11) NOT NULL DEFAULT 0,
  `default` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `in_list_view` int(1) NOT NULL DEFAULT 0,
  `fetch_if_empty` int(1) NOT NULL DEFAULT 0,
  `in_filter` int(1) NOT NULL DEFAULT 0,
  `remember_last_selected_value` int(1) NOT NULL DEFAULT 0,
  `ignore_xss_filter` int(1) NOT NULL DEFAULT 0,
  `print_hide_if_no_value` int(1) NOT NULL DEFAULT 0,
  `allow_bulk_edit` int(1) NOT NULL DEFAULT 0,
  `in_standard_filter` int(1) NOT NULL DEFAULT 0,
  `in_preview` int(1) NOT NULL DEFAULT 0,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `precision` varchar(140) DEFAULT NULL,
  `max_height` varchar(10) DEFAULT NULL,
  `length` int(11) NOT NULL DEFAULT 0,
  `translatable` int(1) NOT NULL DEFAULT 0,
  `hide_border` int(1) NOT NULL DEFAULT 0,
  `hide_days` int(1) NOT NULL DEFAULT 0,
  `hide_seconds` int(1) NOT NULL DEFAULT 0,
  `non_negative` int(1) NOT NULL DEFAULT 0,
  `is_virtual` int(1) NOT NULL DEFAULT 0,
  `sort_options` int(1) NOT NULL DEFAULT 0,
  `link_filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`link_filters`)),
  `fetch_from` text DEFAULT NULL,
  `show_on_timeline` int(1) NOT NULL DEFAULT 0,
  `make_attachment_public` int(1) NOT NULL DEFAULT 0,
  `documentation_url` varchar(140) DEFAULT NULL,
  `placeholder` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `label` (`label`),
  KEY `fieldtype` (`fieldtype`),
  KEY `fieldname` (`fieldname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocPerm
CREATE TABLE IF NOT EXISTS `tabDocPerm` (
  `name` varchar(255) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(255) DEFAULT NULL,
  `parentfield` varchar(255) DEFAULT NULL,
  `parenttype` varchar(255) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `permlevel` int(11) DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `match` varchar(255) DEFAULT NULL,
  `read` int(1) NOT NULL DEFAULT 1,
  `write` int(1) NOT NULL DEFAULT 1,
  `create` int(1) NOT NULL DEFAULT 1,
  `submit` int(1) NOT NULL DEFAULT 0,
  `cancel` int(1) NOT NULL DEFAULT 0,
  `delete` int(1) NOT NULL DEFAULT 1,
  `amend` int(1) NOT NULL DEFAULT 0,
  `report` int(1) NOT NULL DEFAULT 1,
  `export` int(1) NOT NULL DEFAULT 1,
  `import` int(1) NOT NULL DEFAULT 0,
  `share` int(1) NOT NULL DEFAULT 1,
  `print` int(1) NOT NULL DEFAULT 1,
  `email` int(1) NOT NULL DEFAULT 1,
  `if_owner` int(1) NOT NULL DEFAULT 0,
  `select` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocShare
CREATE TABLE IF NOT EXISTS `tabDocShare` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `share_doctype` varchar(140) DEFAULT NULL,
  `share_name` varchar(140) DEFAULT NULL,
  `read` int(1) NOT NULL DEFAULT 0,
  `write` int(1) NOT NULL DEFAULT 0,
  `share` int(1) NOT NULL DEFAULT 0,
  `submit` int(1) NOT NULL DEFAULT 0,
  `everyone` int(1) NOT NULL DEFAULT 0,
  `notify_by_email` int(1) NOT NULL DEFAULT 1,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `share_doctype` (`share_doctype`),
  KEY `share_name` (`share_name`),
  KEY `everyone` (`everyone`),
  KEY `modified` (`modified`),
  KEY `user_share_doctype_index` (`user`,`share_doctype`),
  KEY `share_doctype_share_name_index` (`share_doctype`,`share_name`),
  CONSTRAINT `fk_docshare_user` FOREIGN KEY (`user`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType
CREATE TABLE IF NOT EXISTS `tabDocType` (
  `name` varchar(255) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `search_fields` varchar(140) DEFAULT NULL,
  `issingle` int(1) NOT NULL DEFAULT 0,
  `is_virtual` int(1) NOT NULL DEFAULT 0,
  `is_tree` int(1) NOT NULL DEFAULT 0,
  `istable` int(1) NOT NULL DEFAULT 0,
  `editable_grid` int(1) NOT NULL DEFAULT 1,
  `track_changes` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `app` varchar(255) DEFAULT NULL,
  `autoname` varchar(140) DEFAULT NULL,
  `naming_rule` varchar(40) DEFAULT NULL,
  `title_field` varchar(140) DEFAULT NULL,
  `image_field` varchar(140) DEFAULT NULL,
  `timeline_field` varchar(140) DEFAULT NULL,
  `sort_field` varchar(140) DEFAULT 'modified',
  `sort_order` varchar(140) DEFAULT 'DESC',
  `description` text DEFAULT NULL,
  `colour` varchar(255) DEFAULT NULL,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `in_create` int(1) NOT NULL DEFAULT 0,
  `menu_index` int(11) DEFAULT NULL,
  `parent_node` varchar(255) DEFAULT NULL,
  `smallicon` varchar(255) DEFAULT NULL,
  `allow_copy` int(1) NOT NULL DEFAULT 0,
  `allow_rename` int(1) NOT NULL DEFAULT 1,
  `allow_import` int(1) NOT NULL DEFAULT 0,
  `hide_toolbar` int(1) NOT NULL DEFAULT 0,
  `track_seen` int(1) NOT NULL DEFAULT 0,
  `max_attachments` int(11) NOT NULL DEFAULT 0,
  `print_outline` varchar(255) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `tag_fields` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `_last_update` varchar(32) DEFAULT NULL,
  `engine` varchar(140) DEFAULT 'InnoDB',
  `default_print_format` varchar(140) DEFAULT NULL,
  `is_submittable` int(1) NOT NULL DEFAULT 0,
  `show_name_in_global_search` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `custom` int(1) NOT NULL DEFAULT 0,
  `beta` int(1) NOT NULL DEFAULT 0,
  `has_web_view` int(1) NOT NULL DEFAULT 0,
  `allow_guest_to_view` int(1) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `is_published_field` varchar(140) DEFAULT NULL,
  `website_search_field` varchar(140) DEFAULT NULL,
  `email_append_to` int(1) NOT NULL DEFAULT 0,
  `subject_field` varchar(140) DEFAULT NULL,
  `sender_field` varchar(140) DEFAULT NULL,
  `show_title_field_in_link` int(1) NOT NULL DEFAULT 0,
  `migration_hash` varchar(140) DEFAULT NULL,
  `translated_doctype` int(1) NOT NULL DEFAULT 0,
  `is_calendar_and_gantt` int(1) NOT NULL DEFAULT 0,
  `quick_entry` int(1) NOT NULL DEFAULT 0,
  `grid_page_length` int(11) NOT NULL DEFAULT 50,
  `track_views` int(1) NOT NULL DEFAULT 0,
  `queue_in_background` int(1) NOT NULL DEFAULT 0,
  `documentation` varchar(140) DEFAULT NULL,
  `nsm_parent_field` varchar(140) DEFAULT NULL,
  `allow_events_in_timeline` int(1) NOT NULL DEFAULT 0,
  `allow_auto_repeat` int(1) NOT NULL DEFAULT 0,
  `make_attachments_public` int(1) NOT NULL DEFAULT 0,
  `default_view` varchar(140) DEFAULT NULL,
  `force_re_route_to_default_view` int(1) NOT NULL DEFAULT 0,
  `show_preview_popup` int(1) NOT NULL DEFAULT 0,
  `default_email_template` varchar(140) DEFAULT NULL,
  `sender_name_field` varchar(140) DEFAULT NULL,
  `recipient_account_field` varchar(140) DEFAULT NULL,
  `protect_attached_files` int(1) NOT NULL DEFAULT 0,
  `index_web_pages_for_search` int(1) NOT NULL DEFAULT 1,
  `row_format` varchar(140) DEFAULT 'Dynamic',
  `rows_threshold_for_grid_search` int(11) NOT NULL DEFAULT 0,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `module_index` (`module`),
  KEY `fk_doctype_owner` (`owner`),
  KEY `fk_doctype_modified_by` (`modified_by`),
  CONSTRAINT `fk_doctype_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`),
  CONSTRAINT `fk_doctype_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType Action
CREATE TABLE IF NOT EXISTS `tabDocType Action` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `group` varchar(140) DEFAULT NULL,
  `action_type` varchar(140) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `custom` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType Layout
CREATE TABLE IF NOT EXISTS `tabDocType Layout` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `client_script` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType Layout Field
CREATE TABLE IF NOT EXISTS `tabDocType Layout Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType Link
CREATE TABLE IF NOT EXISTS `tabDocType Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `group` varchar(140) DEFAULT NULL,
  `link_doctype` varchar(140) DEFAULT NULL,
  `link_fieldname` varchar(140) DEFAULT NULL,
  `parent_doctype` varchar(140) DEFAULT NULL,
  `table_fieldname` varchar(140) DEFAULT NULL,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `is_child_table` int(1) NOT NULL DEFAULT 0,
  `custom` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocType State
CREATE TABLE IF NOT EXISTS `tabDocType State` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT 'Blue',
  `custom` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocument Follow
CREATE TABLE IF NOT EXISTS `tabDocument Follow` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `ref_docname` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `ref_doctype` (`ref_doctype`),
  KEY `ref_docname` (`ref_docname`),
  KEY `user` (`user`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocument Naming Rule
CREATE TABLE IF NOT EXISTS `tabDocument Naming Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `priority` int(11) NOT NULL DEFAULT 0,
  `prefix` varchar(140) DEFAULT NULL,
  `counter` int(11) NOT NULL DEFAULT 0,
  `prefix_digits` int(11) NOT NULL DEFAULT 5,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocument Naming Rule Condition
CREATE TABLE IF NOT EXISTS `tabDocument Naming Rule Condition` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `field` varchar(140) DEFAULT NULL,
  `condition` varchar(140) DEFAULT NULL,
  `value` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDocument Share Key
CREATE TABLE IF NOT EXISTS `tabDocument Share Key` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_docname` varchar(140) DEFAULT NULL,
  `key` varchar(140) DEFAULT NULL,
  `expires_on` date DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_doctype` (`reference_doctype`),
  KEY `reference_docname` (`reference_docname`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDomain
CREATE TABLE IF NOT EXISTS `tabDomain` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `domain` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `domain` (`domain`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDowntime Entry
CREATE TABLE IF NOT EXISTS `tabDowntime Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `workstation` varchar(140) DEFAULT NULL,
  `operator` varchar(140) DEFAULT NULL,
  `from_time` datetime(6) DEFAULT NULL,
  `to_time` datetime(6) DEFAULT NULL,
  `downtime` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stop_reason` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDriver
CREATE TABLE IF NOT EXISTS `tabDriver` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `transporter` varchar(140) DEFAULT NULL,
  `employee` varchar(140) DEFAULT NULL,
  `cell_number` varchar(140) DEFAULT NULL,
  `address` varchar(140) DEFAULT NULL,
  `license_number` varchar(140) DEFAULT NULL,
  `issuing_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDriving License Category
CREATE TABLE IF NOT EXISTS `tabDriving License Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `class` varchar(140) DEFAULT NULL,
  `description` varchar(140) DEFAULT NULL,
  `issuing_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDunning
CREATE TABLE IF NOT EXISTS `tabDunning` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'DUNN-.MM.-.YY.-',
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Unresolved',
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `dunning_type` varchar(140) DEFAULT NULL,
  `rate_of_interest` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_interest` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `dunning_fee` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `dunning_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_dunning_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `spacer` varchar(140) DEFAULT NULL,
  `total_outstanding` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `language` varchar(140) DEFAULT NULL,
  `body_text` longtext DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `closing_text` longtext DEFAULT NULL,
  `income_account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_dunning_customer` (`customer`),
  CONSTRAINT `fk_dunning_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDunning Letter Text
CREATE TABLE IF NOT EXISTS `tabDunning Letter Text` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `language` varchar(140) DEFAULT NULL,
  `is_default_language` int(1) NOT NULL DEFAULT 0,
  `body_text` longtext DEFAULT NULL,
  `closing_text` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDunning Type
CREATE TABLE IF NOT EXISTS `tabDunning Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `dunning_type` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `dunning_fee` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_of_interest` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `income_account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `dunning_type` (`dunning_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabDynamic Link
CREATE TABLE IF NOT EXISTS `tabDynamic Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `link_doctype` varchar(140) DEFAULT NULL,
  `link_name` varchar(140) DEFAULT NULL,
  `link_title` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `link_doctype_link_name_index` (`link_doctype`,`link_name`),
  CONSTRAINT `fk_dynamic_address` FOREIGN KEY (`parent`) REFERENCES `tabAddress` (`name`),
  CONSTRAINT `fk_dynamic_link_customer` FOREIGN KEY (`parent`) REFERENCES `tabCustomer` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_dynamic_link_supplier` FOREIGN KEY (`parent`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Account
CREATE TABLE IF NOT EXISTS `tabEmail Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_id` varchar(140) DEFAULT NULL,
  `email_account_name` varchar(140) DEFAULT NULL,
  `domain` varchar(140) DEFAULT NULL,
  `service` varchar(140) DEFAULT NULL,
  `auth_method` varchar(140) DEFAULT 'Basic',
  `backend_app_flow` int(1) NOT NULL DEFAULT 0,
  `password` text DEFAULT NULL,
  `awaiting_password` int(1) NOT NULL DEFAULT 0,
  `ascii_encode_password` int(1) NOT NULL DEFAULT 0,
  `connected_app` varchar(140) DEFAULT NULL,
  `connected_user` varchar(140) DEFAULT NULL,
  `login_id_is_different` int(1) NOT NULL DEFAULT 0,
  `login_id` varchar(140) DEFAULT NULL,
  `enable_incoming` int(1) NOT NULL DEFAULT 0,
  `default_incoming` int(1) NOT NULL DEFAULT 0,
  `use_imap` int(1) NOT NULL DEFAULT 0,
  `use_ssl` int(1) NOT NULL DEFAULT 0,
  `use_starttls` int(1) NOT NULL DEFAULT 0,
  `email_server` varchar(140) DEFAULT NULL,
  `incoming_port` varchar(140) DEFAULT NULL,
  `attachment_limit` int(11) NOT NULL DEFAULT 0,
  `email_sync_option` varchar(140) DEFAULT 'UNSEEN',
  `initial_sync_count` varchar(140) DEFAULT '250',
  `append_emails_to_sent_folder` int(1) NOT NULL DEFAULT 0,
  `sent_folder_name` varchar(140) DEFAULT NULL,
  `append_to` varchar(140) DEFAULT NULL,
  `create_contact` int(1) NOT NULL DEFAULT 1,
  `enable_automatic_linking` int(1) NOT NULL DEFAULT 0,
  `notify_if_unreplied` int(1) NOT NULL DEFAULT 0,
  `unreplied_for_mins` int(11) NOT NULL DEFAULT 30,
  `send_notification_to` text DEFAULT NULL,
  `enable_outgoing` int(1) NOT NULL DEFAULT 0,
  `use_tls` int(1) NOT NULL DEFAULT 0,
  `use_ssl_for_outgoing` int(1) NOT NULL DEFAULT 0,
  `smtp_server` varchar(140) DEFAULT NULL,
  `smtp_port` varchar(140) DEFAULT NULL,
  `default_outgoing` int(1) NOT NULL DEFAULT 0,
  `always_use_account_email_id_as_sender` int(1) NOT NULL DEFAULT 0,
  `always_use_account_name_as_sender_name` int(1) NOT NULL DEFAULT 0,
  `send_unsubscribe_message` int(1) NOT NULL DEFAULT 1,
  `track_email_status` int(1) NOT NULL DEFAULT 1,
  `no_smtp_authentication` int(1) NOT NULL DEFAULT 0,
  `always_bcc` varchar(140) DEFAULT NULL,
  `add_signature` int(1) NOT NULL DEFAULT 0,
  `signature` longtext DEFAULT NULL,
  `enable_auto_reply` int(1) NOT NULL DEFAULT 0,
  `auto_reply_message` longtext DEFAULT NULL,
  `footer` longtext DEFAULT NULL,
  `brand_logo` text DEFAULT NULL,
  `uidvalidity` varchar(140) DEFAULT NULL,
  `uidnext` int(11) NOT NULL DEFAULT 0,
  `no_failed` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `email_id` (`email_id`),
  UNIQUE KEY `email_account_name` (`email_account_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Campaign
CREATE TABLE IF NOT EXISTS `tabEmail Campaign` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `campaign_name` varchar(140) DEFAULT NULL,
  `email_campaign_for` varchar(140) DEFAULT 'Lead',
  `recipient` varchar(140) DEFAULT NULL,
  `sender` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Digest
CREATE TABLE IF NOT EXISTS `tabEmail Digest` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT NULL,
  `next_send` varchar(140) DEFAULT NULL,
  `income` int(1) NOT NULL DEFAULT 0,
  `expenses_booked` int(1) NOT NULL DEFAULT 0,
  `income_year_to_date` int(1) NOT NULL DEFAULT 0,
  `expense_year_to_date` int(1) NOT NULL DEFAULT 0,
  `bank_balance` int(1) NOT NULL DEFAULT 0,
  `credit_balance` int(1) NOT NULL DEFAULT 0,
  `invoiced_amount` int(1) NOT NULL DEFAULT 0,
  `payables` int(1) NOT NULL DEFAULT 0,
  `sales_orders_to_bill` int(1) NOT NULL DEFAULT 0,
  `purchase_orders_to_bill` int(1) NOT NULL DEFAULT 0,
  `sales_order` int(1) NOT NULL DEFAULT 0,
  `purchase_order` int(1) NOT NULL DEFAULT 0,
  `sales_orders_to_deliver` int(1) NOT NULL DEFAULT 0,
  `purchase_orders_to_receive` int(1) NOT NULL DEFAULT 0,
  `sales_invoice` int(1) NOT NULL DEFAULT 0,
  `purchase_invoice` int(1) NOT NULL DEFAULT 0,
  `new_quotations` int(1) NOT NULL DEFAULT 0,
  `pending_quotations` int(1) NOT NULL DEFAULT 0,
  `issue` int(1) NOT NULL DEFAULT 0,
  `project` int(1) NOT NULL DEFAULT 0,
  `purchase_orders_items_overdue` int(1) NOT NULL DEFAULT 0,
  `calendar_events` int(1) NOT NULL DEFAULT 0,
  `todo_list` int(1) NOT NULL DEFAULT 0,
  `notifications` int(1) NOT NULL DEFAULT 0,
  `add_quote` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Digest Recipient
CREATE TABLE IF NOT EXISTS `tabEmail Digest Recipient` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `recipient` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Domain
CREATE TABLE IF NOT EXISTS `tabEmail Domain` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `domain_name` varchar(140) DEFAULT NULL,
  `email_server` varchar(140) DEFAULT NULL,
  `use_imap` int(1) NOT NULL DEFAULT 0,
  `use_ssl` int(1) NOT NULL DEFAULT 0,
  `use_starttls` int(1) NOT NULL DEFAULT 0,
  `incoming_port` varchar(140) DEFAULT NULL,
  `attachment_limit` int(11) NOT NULL DEFAULT 0,
  `smtp_server` varchar(140) DEFAULT NULL,
  `use_tls` int(1) NOT NULL DEFAULT 0,
  `use_ssl_for_outgoing` int(1) NOT NULL DEFAULT 0,
  `smtp_port` varchar(140) DEFAULT NULL,
  `append_emails_to_sent_folder` int(1) NOT NULL DEFAULT 0,
  `sent_folder_name` varchar(140) DEFAULT 'Sent',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `domain_name` (`domain_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Flag Queue
CREATE TABLE IF NOT EXISTS `tabEmail Flag Queue` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_completed` int(1) NOT NULL DEFAULT 0,
  `communication` varchar(140) DEFAULT NULL,
  `action` varchar(140) DEFAULT NULL,
  `email_account` varchar(140) DEFAULT NULL,
  `uid` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Group
CREATE TABLE IF NOT EXISTS `tabEmail Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `total_subscribers` int(11) NOT NULL DEFAULT 0,
  `confirmation_email_template` varchar(140) DEFAULT NULL,
  `welcome_email_template` varchar(140) DEFAULT NULL,
  `welcome_url` varchar(140) DEFAULT NULL,
  `add_query_parameters` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Group Member
CREATE TABLE IF NOT EXISTS `tabEmail Group Member` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_group` varchar(140) DEFAULT NULL,
  `email` varchar(140) DEFAULT NULL,
  `unsubscribed` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `unique_email_group_email` (`email_group`,`email`),
  KEY `email_group` (`email_group`),
  KEY `unsubscribed` (`unsubscribed`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Queue
CREATE TABLE IF NOT EXISTS `tabEmail Queue` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sender` varchar(140) DEFAULT NULL,
  `show_as_cc` text DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Not Sent',
  `error` longtext DEFAULT NULL,
  `message_id` text DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `communication` varchar(140) DEFAULT NULL,
  `send_after` datetime(6) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 1,
  `add_unsubscribe_link` int(1) NOT NULL DEFAULT 1,
  `unsubscribe_param` varchar(140) DEFAULT NULL,
  `unsubscribe_method` varchar(140) DEFAULT NULL,
  `expose_recipients` varchar(140) DEFAULT NULL,
  `attachments` longtext DEFAULT NULL,
  `retry` int(11) NOT NULL DEFAULT 0,
  `email_account` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_name` (`reference_name`),
  KEY `communication` (`communication`),
  KEY `modified` (`modified`),
  KEY `index_bulk_flush` (`status`,`send_after`,`priority`,`creation`),
  KEY `message_id_index` (`message_id`(140))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Queue Recipient
CREATE TABLE IF NOT EXISTS `tabEmail Queue Recipient` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `recipient` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Not Sent',
  `error` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `parent` (`parent`),
  KEY `modified_index` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Rule
CREATE TABLE IF NOT EXISTS `tabEmail Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_id` varchar(140) DEFAULT NULL,
  `is_spam` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `email_id` (`email_id`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Template
CREATE TABLE IF NOT EXISTS `tabEmail Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` varchar(140) DEFAULT NULL,
  `use_html` int(1) NOT NULL DEFAULT 0,
  `response_html` longtext DEFAULT NULL,
  `response` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmail Unsubscribe
CREATE TABLE IF NOT EXISTS `tabEmail Unsubscribe` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `global_unsubscribe` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `email` (`email`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee
CREATE TABLE IF NOT EXISTS `tabEmployee` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `employee` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `first_name` varchar(140) DEFAULT NULL,
  `middle_name` varchar(140) DEFAULT NULL,
  `last_name` varchar(140) DEFAULT NULL,
  `employee_name` varchar(140) DEFAULT NULL,
  `gender` varchar(140) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `salutation` varchar(140) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `image` text DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Active',
  `user_id` varchar(140) DEFAULT NULL,
  `create_user_permission` int(1) NOT NULL DEFAULT 1,
  `company` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `employee_number` varchar(140) DEFAULT NULL,
  `designation` varchar(140) DEFAULT NULL,
  `reports_to` varchar(140) DEFAULT NULL,
  `branch` varchar(140) DEFAULT NULL,
  `scheduled_confirmation_date` date DEFAULT NULL,
  `final_confirmation_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `notice_number_of_days` int(11) NOT NULL DEFAULT 0,
  `date_of_retirement` date DEFAULT NULL,
  `cell_number` varchar(140) DEFAULT NULL,
  `personal_email` varchar(140) DEFAULT NULL,
  `company_email` varchar(140) DEFAULT NULL,
  `prefered_contact_email` varchar(140) DEFAULT NULL,
  `prefered_email` varchar(140) DEFAULT NULL,
  `unsubscribed` int(1) NOT NULL DEFAULT 0,
  `current_address` text DEFAULT NULL,
  `current_accommodation_type` varchar(140) DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `permanent_accommodation_type` varchar(140) DEFAULT NULL,
  `person_to_be_contacted` varchar(140) DEFAULT NULL,
  `emergency_phone_number` varchar(140) DEFAULT NULL,
  `relation` varchar(140) DEFAULT NULL,
  `attendance_device_id` varchar(140) DEFAULT NULL,
  `holiday_list` varchar(140) DEFAULT NULL,
  `ctc` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `salary_currency` varchar(140) DEFAULT NULL,
  `salary_mode` varchar(140) DEFAULT NULL,
  `bank_name` varchar(140) DEFAULT NULL,
  `bank_ac_no` varchar(140) DEFAULT NULL,
  `iban` varchar(140) DEFAULT NULL,
  `marital_status` varchar(140) DEFAULT NULL,
  `family_background` text DEFAULT NULL,
  `blood_group` varchar(140) DEFAULT NULL,
  `health_details` text DEFAULT NULL,
  `passport_number` varchar(140) DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `date_of_issue` date DEFAULT NULL,
  `place_of_issue` varchar(140) DEFAULT NULL,
  `bio` longtext DEFAULT NULL,
  `resignation_letter_date` date DEFAULT NULL,
  `relieving_date` date DEFAULT NULL,
  `held_on` date DEFAULT NULL,
  `new_workplace` varchar(140) DEFAULT NULL,
  `leave_encashed` varchar(140) DEFAULT NULL,
  `encashment_date` date DEFAULT NULL,
  `reason_for_leaving` text DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `attendance_device_id` (`attendance_device_id`),
  KEY `status` (`status`),
  KEY `designation` (`designation`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`),
  KEY `fk_employee_company` (`company`),
  KEY `fk_employee_department` (`department`),
  KEY `fk_employee_user_id` (`user_id`),
  KEY `fk_employee_preferred_email` (`prefered_email`),
  CONSTRAINT `fk_employee_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_employee_department` FOREIGN KEY (`department`) REFERENCES `tabDepartment` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_designation` FOREIGN KEY (`designation`) REFERENCES `tabDesignation` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_preferred_email` FOREIGN KEY (`prefered_email`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_user` FOREIGN KEY (`user_id`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_employee_user_id` FOREIGN KEY (`user_id`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee Education
CREATE TABLE IF NOT EXISTS `tabEmployee Education` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `school_univ` text DEFAULT NULL,
  `qualification` varchar(140) DEFAULT NULL,
  `level` varchar(140) DEFAULT NULL,
  `year_of_passing` int(11) NOT NULL DEFAULT 0,
  `class_per` varchar(140) DEFAULT NULL,
  `maj_opt_subj` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_emp_education_parent` FOREIGN KEY (`parent`) REFERENCES `tabEmployee` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee External Work History
CREATE TABLE IF NOT EXISTS `tabEmployee External Work History` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company_name` varchar(140) DEFAULT NULL,
  `designation` varchar(140) DEFAULT NULL,
  `salary` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `address` text DEFAULT NULL,
  `contact` varchar(140) DEFAULT NULL,
  `total_experience` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_emp_ext_work_history_parent` FOREIGN KEY (`parent`) REFERENCES `tabEmployee` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee Group
CREATE TABLE IF NOT EXISTS `tabEmployee Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `employee_group_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `employee_group_name` (`employee_group_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee Group Table
CREATE TABLE IF NOT EXISTS `tabEmployee Group Table` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `employee` varchar(140) DEFAULT NULL,
  `employee_name` varchar(140) DEFAULT NULL,
  `user_id` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_employee_group_table_employee` (`employee`),
  CONSTRAINT `fk_employee_group_table_employee` FOREIGN KEY (`employee`) REFERENCES `tabEmployee` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEmployee Internal Work History
CREATE TABLE IF NOT EXISTS `tabEmployee Internal Work History` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `branch` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `designation` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEnergy Point Log
CREATE TABLE IF NOT EXISTS `tabEnergy Point Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `rule` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reverted` int(1) NOT NULL DEFAULT 0,
  `revert_of` varchar(140) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `seen` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `reference_name` (`reference_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEnergy Point Rule
CREATE TABLE IF NOT EXISTS `tabEnergy Point Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `rule_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `for_doc_event` varchar(140) DEFAULT 'Custom',
  `field_to_check` varchar(140) DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `for_assigned_users` int(1) NOT NULL DEFAULT 0,
  `user_field` varchar(140) DEFAULT NULL,
  `multiplier_field` varchar(140) DEFAULT NULL,
  `max_points` int(11) NOT NULL DEFAULT 0,
  `apply_only_once` int(1) NOT NULL DEFAULT 0,
  `condition` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `rule_name` (`rule_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabError Log
CREATE TABLE IF NOT EXISTS `tabError Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `seen` int(1) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `method` varchar(140) DEFAULT NULL,
  `error` longtext DEFAULT NULL,
  `trace_id` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_doctype` (`reference_doctype`),
  KEY `modified` (`modified`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEvent
CREATE TABLE IF NOT EXISTS `tabEvent` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` text DEFAULT NULL,
  `event_category` varchar(140) DEFAULT NULL,
  `event_type` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `send_reminder` int(1) NOT NULL DEFAULT 1,
  `repeat_this_event` int(1) NOT NULL DEFAULT 0,
  `starts_on` datetime(6) DEFAULT NULL,
  `ends_on` datetime(6) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `sender` varchar(140) DEFAULT NULL,
  `all_day` int(1) NOT NULL DEFAULT 0,
  `sync_with_google_calendar` int(1) NOT NULL DEFAULT 0,
  `add_video_conferencing` int(1) NOT NULL DEFAULT 0,
  `google_calendar` varchar(140) DEFAULT NULL,
  `google_calendar_id` varchar(140) DEFAULT NULL,
  `google_calendar_event_id` varchar(320) DEFAULT NULL,
  `google_meet_link` text DEFAULT NULL,
  `pulled_from_google_calendar` int(1) NOT NULL DEFAULT 0,
  `repeat_on` varchar(140) DEFAULT NULL,
  `repeat_till` date DEFAULT NULL,
  `monday` int(1) NOT NULL DEFAULT 0,
  `tuesday` int(1) NOT NULL DEFAULT 0,
  `wednesday` int(1) NOT NULL DEFAULT 0,
  `thursday` int(1) NOT NULL DEFAULT 0,
  `friday` int(1) NOT NULL DEFAULT 0,
  `saturday` int(1) NOT NULL DEFAULT 0,
  `sunday` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `event_type` (`event_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabEvent Participants
CREATE TABLE IF NOT EXISTS `tabEvent Participants` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_docname` varchar(140) DEFAULT NULL,
  `email` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabExchange Rate Revaluation
CREATE TABLE IF NOT EXISTS `tabExchange Rate Revaluation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `rounding_loss_allowance` decimal(21,9) NOT NULL DEFAULT 0.050000000,
  `company` varchar(140) DEFAULT NULL,
  `gain_loss_unbooked` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gain_loss_booked` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_gain_loss` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabExchange Rate Revaluation Account
CREATE TABLE IF NOT EXISTS `tabExchange Rate Revaluation Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `balance_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `new_balance_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `new_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `balance_in_base_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `new_balance_in_base_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gain_loss` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `zero_balance` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabFile
CREATE TABLE IF NOT EXISTS `tabFile` (
  `name` varchar(255) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(255) DEFAULT NULL,
  `parentfield` varchar(255) DEFAULT NULL,
  `parenttype` varchar(255) DEFAULT NULL,
  `idx` int(8) NOT NULL DEFAULT 0,
  `file_name` varchar(140) DEFAULT NULL,
  `file_url` longtext DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `attached_to_name` varchar(140) DEFAULT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `attached_to_doctype` varchar(140) DEFAULT NULL,
  `is_private` int(1) NOT NULL DEFAULT 0,
  `file_type` varchar(140) DEFAULT NULL,
  `is_home_folder` int(1) NOT NULL DEFAULT 0,
  `is_attachments_folder` int(1) NOT NULL DEFAULT 0,
  `thumbnail_url` text DEFAULT NULL,
  `folder` varchar(255) DEFAULT NULL,
  `is_folder` int(1) NOT NULL DEFAULT 0,
  `attached_to_field` varchar(140) DEFAULT NULL,
  `old_parent` varchar(140) DEFAULT NULL,
  `content_hash` varchar(140) DEFAULT NULL,
  `uploaded_to_dropbox` int(1) NOT NULL DEFAULT 0,
  `uploaded_to_google_drive` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `attached_to_doctype_attached_to_name_index` (`attached_to_doctype`,`attached_to_name`),
  KEY `file_url_index` (`file_url`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabFinance Book
CREATE TABLE IF NOT EXISTS `tabFinance Book` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `finance_book_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabFiscal Year
CREATE TABLE IF NOT EXISTS `tabFiscal Year` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `year` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `is_short_year` int(1) NOT NULL DEFAULT 0,
  `year_start_date` date DEFAULT NULL,
  `year_end_date` date DEFAULT NULL,
  `auto_created` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `year` (`year`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabFiscal Year Company
CREATE TABLE IF NOT EXISTS `tabFiscal Year Company` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabForm Tour
CREATE TABLE IF NOT EXISTS `tabForm Tour` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `view_name` varchar(140) DEFAULT NULL,
  `workspace_name` varchar(140) DEFAULT NULL,
  `list_name` varchar(140) DEFAULT 'List',
  `report_name` varchar(140) DEFAULT NULL,
  `dashboard_name` varchar(140) DEFAULT NULL,
  `new_document_form` int(1) NOT NULL DEFAULT 0,
  `page_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `ui_tour` int(1) NOT NULL DEFAULT 0,
  `track_steps` int(1) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `save_on_complete` int(1) NOT NULL DEFAULT 0,
  `first_document` int(1) NOT NULL DEFAULT 0,
  `include_name_field` int(1) NOT NULL DEFAULT 0,
  `page_route` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabForm Tour Step
CREATE TABLE IF NOT EXISTS `tabForm Tour Step` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ui_tour` int(1) NOT NULL DEFAULT 0,
  `is_table_field` int(1) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `parent_fieldname` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `element_selector` varchar(140) DEFAULT NULL,
  `parent_element_selector` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `ondemand_description` longtext DEFAULT NULL,
  `position` varchar(140) DEFAULT 'Bottom',
  `hide_buttons` int(1) NOT NULL DEFAULT 0,
  `popover_element` int(1) NOT NULL DEFAULT 0,
  `modal_trigger` int(1) NOT NULL DEFAULT 0,
  `offset_x` int(11) NOT NULL DEFAULT 0,
  `offset_y` int(11) NOT NULL DEFAULT 0,
  `next_on_click` int(1) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT '0',
  `has_next_condition` int(1) NOT NULL DEFAULT 0,
  `next_step_condition` longtext DEFAULT NULL,
  `next_form_tour` varchar(140) DEFAULT NULL,
  `child_doctype` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabGender
CREATE TABLE IF NOT EXISTS `tabGender` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `gender` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `gender` (`gender`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabGL Entry
CREATE TABLE IF NOT EXISTS `tabGL Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `against` text DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `voucher_subtype` text DEFAULT NULL,
  `transaction_currency` varchar(140) DEFAULT NULL,
  `against_voucher_type` varchar(140) DEFAULT NULL,
  `against_voucher` varchar(140) DEFAULT NULL,
  `voucher_detail_no` varchar(140) DEFAULT NULL,
  `transaction_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit_in_transaction_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit_in_transaction_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT NULL,
  `is_advance` varchar(140) DEFAULT NULL,
  `to_rename` int(1) NOT NULL DEFAULT 1,
  `is_cancelled` int(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `posting_date` (`posting_date`),
  KEY `account` (`account`),
  KEY `party_type` (`party_type`),
  KEY `party` (`party`),
  KEY `voucher_no` (`voucher_no`),
  KEY `against_voucher` (`against_voucher`),
  KEY `voucher_detail_no` (`voucher_detail_no`),
  KEY `company` (`company`),
  KEY `to_rename` (`to_rename`),
  KEY `modified` (`modified`),
  KEY `voucher_type_voucher_no_index` (`voucher_type`,`voucher_no`),
  KEY `posting_date_company_index` (`posting_date`,`company`),
  KEY `party_type_party_index` (`party_type`,`party`),
  KEY `fk_gl_entry_cost_center` (`cost_center`),
  KEY `fk_gl_entry_against_voucher_type` (`against_voucher_type`),
  KEY `fk_gle_project` (`project`),
  KEY `fk_ge_account_currency` (`account_currency`),
  KEY `fk_ge_transaction_currency` (`transaction_currency`),
  CONSTRAINT `fk_ge_account_currency` FOREIGN KEY (`account_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_ge_transaction_currency` FOREIGN KEY (`transaction_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_gl_account` FOREIGN KEY (`account`) REFERENCES `tabAccount` (`name`),
  CONSTRAINT `fk_gl_entry_against_voucher_type` FOREIGN KEY (`against_voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_gl_entry_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_gl_entry_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_gl_entry_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_gle_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabGlobal Search DocType
CREATE TABLE IF NOT EXISTS `tabGlobal Search DocType` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabGoogle Calendar
CREATE TABLE IF NOT EXISTS `tabGoogle Calendar` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enable` int(1) NOT NULL DEFAULT 1,
  `calendar_name` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `pull_from_google_calendar` int(1) NOT NULL DEFAULT 1,
  `sync_as_public` int(1) NOT NULL DEFAULT 0,
  `push_to_google_calendar` int(1) NOT NULL DEFAULT 1,
  `google_calendar_id` varchar(140) DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `authorization_code` text DEFAULT NULL,
  `next_sync_token` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `calendar_name` (`calendar_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabGoogle Contacts
CREATE TABLE IF NOT EXISTS `tabGoogle Contacts` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enable` int(1) NOT NULL DEFAULT 0,
  `email_id` varchar(140) DEFAULT NULL,
  `last_sync_on` datetime(6) DEFAULT NULL,
  `authorization_code` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `next_sync_token` text DEFAULT NULL,
  `pull_from_google_contacts` int(1) NOT NULL DEFAULT 0,
  `push_to_google_contacts` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHas Domain
CREATE TABLE IF NOT EXISTS `tabHas Domain` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `domain` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHas Role
CREATE TABLE IF NOT EXISTS `tabHas Role` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHelp Article
CREATE TABLE IF NOT EXISTS `tabHelp Article` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `category` varchar(140) DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `author` varchar(140) DEFAULT 'user_fullname',
  `level` varchar(140) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `helpful` int(11) NOT NULL DEFAULT 0,
  `not_helpful` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHelp Category
CREATE TABLE IF NOT EXISTS `tabHelp Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `category_name` varchar(140) DEFAULT NULL,
  `category_description` text DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `help_articles` int(11) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHoliday
CREATE TABLE IF NOT EXISTS `tabHoliday` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `holiday_date` date DEFAULT NULL,
  `weekly_off` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHoliday List
CREATE TABLE IF NOT EXISTS `tabHoliday List` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `holiday_list_name` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `total_holidays` int(11) NOT NULL DEFAULT 0,
  `weekly_off` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `subdivision` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `holiday_list_name` (`holiday_list_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHomepage Section
CREATE TABLE IF NOT EXISTS `tabHomepage Section` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `section_based_on` varchar(140) DEFAULT NULL,
  `no_of_columns` varchar(140) DEFAULT '3',
  `section_html` longtext DEFAULT NULL,
  `section_order` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabHomepage Section Card
CREATE TABLE IF NOT EXISTS `tabHomepage Section Card` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `subtitle` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIMAP Folder
CREATE TABLE IF NOT EXISTS `tabIMAP Folder` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `folder_name` varchar(140) DEFAULT NULL,
  `append_to` varchar(140) DEFAULT NULL,
  `uidvalidity` varchar(140) DEFAULT NULL,
  `uidnext` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabImport Supplier Invoice
CREATE TABLE IF NOT EXISTS `tabImport Supplier Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `invoice_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `supplier_group` varchar(140) DEFAULT NULL,
  `tax_account` varchar(140) DEFAULT NULL,
  `default_buying_price_list` varchar(140) DEFAULT NULL,
  `zip_file` text DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIncoming Call Handling Schedule
CREATE TABLE IF NOT EXISTS `tabIncoming Call Handling Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `day_of_week` varchar(140) DEFAULT NULL,
  `from_time` time(6) DEFAULT '09:00:00.000000',
  `to_time` time(6) DEFAULT '17:00:00.000000',
  `agent_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIncoming Call Settings
CREATE TABLE IF NOT EXISTS `tabIncoming Call Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `call_routing` varchar(140) DEFAULT 'Sequential',
  `greeting_message` varchar(140) DEFAULT NULL,
  `agent_busy_message` varchar(140) DEFAULT NULL,
  `agent_unavailable_message` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIncoterm
CREATE TABLE IF NOT EXISTS `tabIncoterm` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `code` varchar(3) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `code` (`code`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIndustry Type
CREATE TABLE IF NOT EXISTS `tabIndustry Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `industry` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `industry` (`industry`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabInstallation Note
CREATE TABLE IF NOT EXISTS `tabInstallation Note` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `inst_date` date DEFAULT NULL,
  `inst_time` time(6) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `territory` (`territory`),
  KEY `inst_date` (`inst_date`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabInstallation Note Item
CREATE TABLE IF NOT EXISTS `tabInstallation Note Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `prevdoc_detail_docname` varchar(140) DEFAULT NULL,
  `prevdoc_docname` varchar(140) DEFAULT NULL,
  `prevdoc_doctype` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `prevdoc_docname` (`prevdoc_docname`),
  KEY `prevdoc_doctype` (`prevdoc_doctype`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabInstalled Application
CREATE TABLE IF NOT EXISTS `tabInstalled Application` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `app_name` varchar(140) DEFAULT NULL,
  `app_version` varchar(140) DEFAULT NULL,
  `git_branch` varchar(140) DEFAULT NULL,
  `has_setup_wizard` int(1) NOT NULL DEFAULT 0,
  `is_setup_complete` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIntegration Request
CREATE TABLE IF NOT EXISTS `tabIntegration Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `request_id` varchar(140) DEFAULT NULL,
  `integration_request_service` varchar(140) DEFAULT NULL,
  `is_remote_request` int(1) NOT NULL DEFAULT 0,
  `request_description` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Queued',
  `url` text DEFAULT NULL,
  `request_headers` longtext DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `output` longtext DEFAULT NULL,
  `error` longtext DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_docname` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabInventory Dimension
CREATE TABLE IF NOT EXISTS `tabInventory Dimension` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `dimension_name` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `source_fieldname` varchar(140) DEFAULT NULL,
  `target_fieldname` varchar(140) DEFAULT NULL,
  `apply_to_all_doctypes` int(1) NOT NULL DEFAULT 1,
  `validate_negative_stock` int(1) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `type_of_transaction` varchar(140) DEFAULT NULL,
  `fetch_from_parent` varchar(140) DEFAULT NULL,
  `istable` int(1) NOT NULL DEFAULT 0,
  `condition` longtext DEFAULT NULL,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `mandatory_depends_on` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `dimension_name` (`dimension_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabInvoice Discounting
CREATE TABLE IF NOT EXISTS `tabInvoice Discounting` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `loan_start_date` date DEFAULT NULL,
  `loan_period` int(11) NOT NULL DEFAULT 0,
  `loan_end_date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `total_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bank_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `short_term_loan` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `bank_charges_account` varchar(140) DEFAULT NULL,
  `accounts_receivable_credit` varchar(140) DEFAULT NULL,
  `accounts_receivable_discounted` varchar(140) DEFAULT NULL,
  `accounts_receivable_unpaid` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIssue
CREATE TABLE IF NOT EXISTS `tabIssue` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `raised_by` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `priority` varchar(140) DEFAULT NULL,
  `issue_type` varchar(140) DEFAULT NULL,
  `issue_split_from` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `service_level_agreement` varchar(140) DEFAULT NULL,
  `response_by` datetime(6) DEFAULT NULL,
  `agreement_status` varchar(140) DEFAULT 'First Response Due',
  `sla_resolution_by` datetime(6) DEFAULT NULL,
  `service_level_agreement_creation` datetime(6) DEFAULT NULL,
  `on_hold_since` datetime(6) DEFAULT NULL,
  `total_hold_time` decimal(21,9) DEFAULT NULL,
  `first_response_time` decimal(21,9) DEFAULT NULL,
  `first_responded_on` datetime(6) DEFAULT NULL,
  `avg_response_time` decimal(21,9) DEFAULT NULL,
  `resolution_details` longtext DEFAULT NULL,
  `opening_date` date DEFAULT NULL,
  `opening_time` time(6) DEFAULT NULL,
  `sla_resolution_date` datetime(6) DEFAULT NULL,
  `resolution_time` decimal(21,9) DEFAULT NULL,
  `user_resolution_time` decimal(21,9) DEFAULT NULL,
  `lead` varchar(140) DEFAULT NULL,
  `contact` varchar(140) DEFAULT NULL,
  `email_account` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `via_customer_portal` int(1) NOT NULL DEFAULT 0,
  `attachment` text DEFAULT NULL,
  `content_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_issue_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIssue Priority
CREATE TABLE IF NOT EXISTS `tabIssue Priority` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabIssue Type
CREATE TABLE IF NOT EXISTS `tabIssue Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem
CREATE TABLE IF NOT EXISTS `tabItem` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `is_stock_item` int(1) NOT NULL DEFAULT 1,
  `has_variants` int(1) NOT NULL DEFAULT 0,
  `opening_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `standard_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `auto_create_assets` int(1) NOT NULL DEFAULT 0,
  `is_grouped_asset` int(1) NOT NULL DEFAULT 0,
  `asset_category` varchar(140) DEFAULT NULL,
  `asset_naming_series` varchar(140) DEFAULT NULL,
  `over_delivery_receipt_allowance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `over_billing_allowance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `image` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `shelf_life_in_days` int(11) NOT NULL DEFAULT 0,
  `end_of_life` date DEFAULT '2099-12-31',
  `default_material_request_type` varchar(140) DEFAULT 'Purchase',
  `valuation_method` varchar(140) DEFAULT NULL,
  `warranty_period` varchar(140) DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `allow_negative_stock` int(1) NOT NULL DEFAULT 0,
  `has_batch_no` int(1) NOT NULL DEFAULT 0,
  `create_new_batch` int(1) NOT NULL DEFAULT 0,
  `batch_number_series` varchar(140) DEFAULT NULL,
  `has_expiry_date` int(1) NOT NULL DEFAULT 0,
  `retain_sample` int(1) NOT NULL DEFAULT 0,
  `sample_quantity` int(11) NOT NULL DEFAULT 0,
  `has_serial_no` int(1) NOT NULL DEFAULT 0,
  `serial_no_series` varchar(140) DEFAULT NULL,
  `variant_of` varchar(140) DEFAULT NULL,
  `variant_based_on` varchar(140) DEFAULT 'Item Attribute',
  `enable_deferred_expense` int(1) NOT NULL DEFAULT 0,
  `no_of_months_exp` int(11) NOT NULL DEFAULT 0,
  `enable_deferred_revenue` int(1) NOT NULL DEFAULT 0,
  `no_of_months` int(11) NOT NULL DEFAULT 0,
  `purchase_uom` varchar(140) DEFAULT NULL,
  `min_order_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `safety_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_purchase_item` int(1) NOT NULL DEFAULT 1,
  `lead_time_days` int(11) NOT NULL DEFAULT 0,
  `last_purchase_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_customer_provided_item` int(1) NOT NULL DEFAULT 0,
  `customer` varchar(140) DEFAULT NULL,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `country_of_origin` varchar(140) DEFAULT NULL,
  `customs_tariff_number` varchar(140) DEFAULT NULL,
  `sales_uom` varchar(140) DEFAULT NULL,
  `grant_commission` int(1) NOT NULL DEFAULT 1,
  `is_sales_item` int(1) NOT NULL DEFAULT 1,
  `max_discount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `inspection_required_before_purchase` int(1) NOT NULL DEFAULT 0,
  `quality_inspection_template` varchar(140) DEFAULT NULL,
  `inspection_required_before_delivery` int(1) NOT NULL DEFAULT 0,
  `include_item_in_manufacturing` int(1) NOT NULL DEFAULT 1,
  `is_sub_contracted_item` int(1) NOT NULL DEFAULT 0,
  `default_bom` varchar(140) DEFAULT NULL,
  `customer_code` text DEFAULT NULL,
  `default_item_manufacturer` varchar(140) DEFAULT NULL,
  `default_manufacturer_part_no` varchar(140) DEFAULT NULL,
  `total_projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `item_name` (`item_name`),
  KEY `item_group` (`item_group`),
  KEY `disabled` (`disabled`),
  KEY `variant_of` (`variant_of`),
  KEY `modified` (`modified`),
  KEY `fk_item_stock_uom` (`stock_uom`),
  KEY `fk_item_weight_uom` (`weight_uom`),
  KEY `fk_item_purchase_uom` (`purchase_uom`),
  KEY `fk_item_sales_uom` (`sales_uom`),
  KEY `fk_item_owner` (`owner`),
  KEY `fk_item_modified_by` (`modified_by`),
  KEY `fk_item_brand` (`brand`),
  CONSTRAINT `fk_item_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_purchase_uom` FOREIGN KEY (`purchase_uom`) REFERENCES `tabUOM` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_sales_uom` FOREIGN KEY (`sales_uom`) REFERENCES `tabUOM` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_item_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_item_weight_uom` FOREIGN KEY (`weight_uom`) REFERENCES `tabUOM` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Alternative
CREATE TABLE IF NOT EXISTS `tabItem Alternative` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `alternative_item_code` varchar(140) DEFAULT NULL,
  `two_way` int(1) NOT NULL DEFAULT 0,
  `item_name` varchar(140) DEFAULT NULL,
  `alternative_item_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Attribute
CREATE TABLE IF NOT EXISTS `tabItem Attribute` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `attribute_name` varchar(140) DEFAULT NULL,
  `numeric_values` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `from_range` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `increment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `to_range` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `attribute_name` (`attribute_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Attribute Value
CREATE TABLE IF NOT EXISTS `tabItem Attribute Value` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `attribute_value` varchar(140) DEFAULT NULL,
  `abbr` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `abbr` (`abbr`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Barcode
CREATE TABLE IF NOT EXISTS `tabItem Barcode` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `barcode_type` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Customer Detail
CREATE TABLE IF NOT EXISTS `tabItem Customer Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer_name` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `ref_code` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer_name` (`customer_name`),
  KEY `ref_code` (`ref_code`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Default
CREATE TABLE IF NOT EXISTS `tabItem Default` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `default_warehouse` varchar(140) DEFAULT NULL,
  `default_price_list` varchar(140) DEFAULT NULL,
  `default_discount_account` varchar(140) DEFAULT NULL,
  `buying_cost_center` varchar(140) DEFAULT NULL,
  `default_supplier` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `default_provisional_account` varchar(140) DEFAULT NULL,
  `selling_cost_center` varchar(140) DEFAULT NULL,
  `income_account` varchar(140) DEFAULT NULL,
  `deferred_expense_account` varchar(140) DEFAULT NULL,
  `deferred_revenue_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `default_warehouse` (`default_warehouse`),
  KEY `parent` (`parent`),
  KEY `fk_item_default_default_price_list` (`default_price_list`),
  CONSTRAINT `fk_item_default_default_price_list` FOREIGN KEY (`default_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Group
CREATE TABLE IF NOT EXISTS `tabItem Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_group_name` varchar(140) DEFAULT NULL,
  `parent_item_group` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `image` text DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `item_group_name` (`item_group_name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Manufacturer
CREATE TABLE IF NOT EXISTS `tabItem Manufacturer` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Price
CREATE TABLE IF NOT EXISTS `tabItem Price` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `packing_unit` int(11) NOT NULL DEFAULT 0,
  `item_name` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `item_description` text DEFAULT NULL,
  `price_list` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `buying` int(1) NOT NULL DEFAULT 0,
  `selling` int(1) NOT NULL DEFAULT 0,
  `currency` varchar(140) DEFAULT NULL,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valid_from` date DEFAULT NULL,
  `lead_time_days` int(11) NOT NULL DEFAULT 0,
  `valid_upto` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `reference` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `price_list` (`price_list`),
  KEY `modified` (`modified`),
  KEY `fk_ip_customer` (`customer`),
  KEY `fk_ip_supplier` (`supplier`),
  KEY `fk_ip_brand` (`brand`),
  KEY `fk_ip_currency` (`currency`),
  CONSTRAINT `fk_ip_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_ip_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_ip_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_ip_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_price_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_price_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Quality Inspection Parameter
CREATE TABLE IF NOT EXISTS `tabItem Quality Inspection Parameter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `specification` varchar(140) DEFAULT NULL,
  `parameter_group` varchar(140) DEFAULT NULL,
  `value` varchar(140) DEFAULT NULL,
  `numeric` int(1) NOT NULL DEFAULT 1,
  `min_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `formula_based_criteria` int(1) NOT NULL DEFAULT 0,
  `acceptance_formula` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Reorder
CREATE TABLE IF NOT EXISTS `tabItem Reorder` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `warehouse_group` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `warehouse_reorder_level` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse_reorder_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `material_request_type` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Supplier
CREATE TABLE IF NOT EXISTS `tabItem Supplier` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_part_no` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_is_supplier` (`supplier`),
  CONSTRAINT `fk_is_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Tax
CREATE TABLE IF NOT EXISTS `tabItem Tax` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `minimum_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `maximum_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_it_item_tax_template` (`item_tax_template`),
  CONSTRAINT `fk_it_item_tax_template` FOREIGN KEY (`item_tax_template`) REFERENCES `tabItem Tax Template` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Tax Template
CREATE TABLE IF NOT EXISTS `tabItem Tax Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Tax Template Detail
CREATE TABLE IF NOT EXISTS `tabItem Tax Template Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `tax_type` varchar(140) DEFAULT NULL,
  `tax_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_itd_parent` FOREIGN KEY (`parent`) REFERENCES `tabItem Tax Template` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Variant
CREATE TABLE IF NOT EXISTS `tabItem Variant` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_attribute` varchar(140) DEFAULT NULL,
  `item_attribute_value` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Variant Attribute
CREATE TABLE IF NOT EXISTS `tabItem Variant Attribute` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `variant_of` varchar(140) DEFAULT NULL,
  `attribute` varchar(140) DEFAULT NULL,
  `attribute_value` varchar(140) DEFAULT NULL,
  `numeric_values` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `from_range` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `increment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `to_range` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `variant_of` (`variant_of`),
  KEY `attribute` (`attribute`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabItem Website Specification
CREATE TABLE IF NOT EXISTS `tabItem Website Specification` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card
CREATE TABLE IF NOT EXISTS `tabJob Card` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'PO-JOB.#####',
  `work_order` varchar(140) DEFAULT NULL,
  `bom_no` varchar(140) DEFAULT NULL,
  `production_item` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `for_quantity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_completed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expected_start_date` datetime(6) DEFAULT NULL,
  `time_required` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expected_end_date` datetime(6) DEFAULT NULL,
  `actual_start_date` datetime(6) DEFAULT NULL,
  `total_time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_end_date` datetime(6) DEFAULT NULL,
  `operation` varchar(140) DEFAULT NULL,
  `wip_warehouse` varchar(140) DEFAULT NULL,
  `workstation_type` varchar(140) DEFAULT NULL,
  `workstation` varchar(140) DEFAULT NULL,
  `quality_inspection_template` varchar(140) DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `for_job_card` varchar(140) DEFAULT NULL,
  `is_corrective_job_card` int(1) NOT NULL DEFAULT 0,
  `hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `for_operation` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `transferred_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `requested_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `status` varchar(140) DEFAULT 'Open',
  `operation_row_number` varchar(140) DEFAULT NULL,
  `operation_id` varchar(140) DEFAULT NULL,
  `sequence_id` int(11) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `barcode` longtext DEFAULT NULL,
  `job_started` int(1) NOT NULL DEFAULT 0,
  `started_time` datetime(6) DEFAULT NULL,
  `current_time` int(11) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `work_order` (`work_order`),
  KEY `modified` (`modified`),
  KEY `fk_jc_project` (`project`),
  CONSTRAINT `fk_jc_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_job_card_work_order` FOREIGN KEY (`work_order`) REFERENCES `tabWork Order` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card Item
CREATE TABLE IF NOT EXISTS `tabJob Card Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transferred_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_jci_uom` (`uom`),
  KEY `fk_jci_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_jci_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_jci_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card Operation
CREATE TABLE IF NOT EXISTS `tabJob Card Operation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sub_operation` varchar(140) DEFAULT NULL,
  `completed_time` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending',
  `completed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card Scheduled Time
CREATE TABLE IF NOT EXISTS `tabJob Card Scheduled Time` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `from_time` datetime(6) DEFAULT NULL,
  `to_time` datetime(6) DEFAULT NULL,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card Scrap Item
CREATE TABLE IF NOT EXISTS `tabJob Card Scrap Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJob Card Time Log
CREATE TABLE IF NOT EXISTS `tabJob Card Time Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `employee` varchar(140) DEFAULT NULL,
  `from_time` datetime(6) DEFAULT NULL,
  `to_time` datetime(6) DEFAULT NULL,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `completed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `operation` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJournal Entry
CREATE TABLE IF NOT EXISTS `tabJournal Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_system_generated` int(1) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT 'Journal Entry',
  `naming_series` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `process_deferred_accounting` varchar(140) DEFAULT NULL,
  `reversal_of` varchar(140) DEFAULT NULL,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `from_template` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `apply_tds` int(1) NOT NULL DEFAULT 0,
  `cheque_no` varchar(140) DEFAULT NULL,
  `cheque_date` date DEFAULT NULL,
  `user_remark` text DEFAULT NULL,
  `total_debit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_credit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `multi_currency` int(1) NOT NULL DEFAULT 0,
  `total_amount_currency` varchar(140) DEFAULT NULL,
  `total_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_amount_in_words` varchar(140) DEFAULT NULL,
  `clearance_date` date DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `paid_loan` varchar(140) DEFAULT NULL,
  `inter_company_journal_entry_reference` varchar(140) DEFAULT NULL,
  `bill_no` varchar(140) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `write_off_based_on` varchar(140) DEFAULT 'Accounts Receivable',
  `write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pay_to_recd_from` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `payment_order` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT 'No',
  `stock_entry` varchar(140) DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `voucher_type` (`voucher_type`),
  KEY `company` (`company`),
  KEY `posting_date` (`posting_date`),
  KEY `cheque_no` (`cheque_no`),
  KEY `cheque_date` (`cheque_date`),
  KEY `clearance_date` (`clearance_date`),
  KEY `is_opening` (`is_opening`),
  KEY `modified` (`modified`),
  KEY `fk_je_tax_withholding_category` (`tax_withholding_category`),
  CONSTRAINT `fk_je_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_je_tax_withholding_category` FOREIGN KEY (`tax_withholding_category`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_je_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_journal_entry_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJournal Entry Account
CREATE TABLE IF NOT EXISTS `tabJournal Entry Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `account_type` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `debit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_due_date` date DEFAULT NULL,
  `reference_detail_no` varchar(140) DEFAULT NULL,
  `advance_voucher_type` varchar(140) DEFAULT NULL,
  `advance_voucher_no` varchar(140) DEFAULT NULL,
  `is_advance` varchar(140) DEFAULT NULL,
  `user_remark` text DEFAULT NULL,
  `against_account` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `account` (`account`),
  KEY `party_type` (`party_type`),
  KEY `reference_type` (`reference_type`),
  KEY `reference_name` (`reference_name`),
  KEY `reference_detail_no` (`reference_detail_no`),
  KEY `parent` (`parent`),
  KEY `fk_jea_cost_center` (`cost_center`),
  KEY `fk_jea_project` (`project`),
  KEY `fk_jea_account_currency` (`account_currency`),
  CONSTRAINT `fk_jea_account_currency` FOREIGN KEY (`account_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_jea_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_jea_journal_entry` FOREIGN KEY (`parent`) REFERENCES `tabJournal Entry` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_jea_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_journal_account` FOREIGN KEY (`account`) REFERENCES `tabAccount` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJournal Entry Template
CREATE TABLE IF NOT EXISTS `tabJournal Entry Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `template_title` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT 'No',
  `multi_currency` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `template_title` (`template_title`),
  KEY `modified` (`modified`),
  KEY `fk_jet_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_jet_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabJournal Entry Template Account
CREATE TABLE IF NOT EXISTS `tabJournal Entry Template Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabKanban Board
CREATE TABLE IF NOT EXISTS `tabKanban Board` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `kanban_board_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `field_name` varchar(140) DEFAULT NULL,
  `private` int(1) NOT NULL DEFAULT 0,
  `show_labels` int(1) NOT NULL DEFAULT 0,
  `filters` longtext DEFAULT NULL,
  `fields` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `kanban_board_name` (`kanban_board_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabKanban Board Column
CREATE TABLE IF NOT EXISTS `tabKanban Board Column` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `column_name` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Active',
  `indicator` varchar(140) DEFAULT 'Gray',
  `order` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLanded Cost Item
CREATE TABLE IF NOT EXISTS `tabLanded Cost Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `receipt_document_type` varchar(140) DEFAULT NULL,
  `receipt_document` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `applicable_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `purchase_receipt_item` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLanded Cost Purchase Receipt
CREATE TABLE IF NOT EXISTS `tabLanded Cost Purchase Receipt` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `receipt_document_type` varchar(140) DEFAULT NULL,
  `receipt_document` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLanded Cost Taxes and Charges
CREATE TABLE IF NOT EXISTS `tabLanded Cost Taxes and Charges` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `expense_account` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `has_corrective_cost` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLanded Cost Voucher
CREATE TABLE IF NOT EXISTS `tabLanded Cost Voucher` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distribute_charges_based_on` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLanguage
CREATE TABLE IF NOT EXISTS `tabLanguage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `language_code` varchar(140) DEFAULT NULL,
  `language_name` varchar(140) DEFAULT NULL,
  `flag` varchar(140) DEFAULT NULL,
  `based_on` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `language_code` (`language_code`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLDAP Group Mapping
CREATE TABLE IF NOT EXISTS `tabLDAP Group Mapping` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ldap_group` varchar(140) DEFAULT NULL,
  `erpnext_role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLead
CREATE TABLE IF NOT EXISTS `tabLead` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `salutation` varchar(140) DEFAULT NULL,
  `first_name` varchar(140) DEFAULT NULL,
  `middle_name` varchar(140) DEFAULT NULL,
  `last_name` varchar(140) DEFAULT NULL,
  `lead_name` varchar(140) DEFAULT NULL,
  `job_title` varchar(140) DEFAULT NULL,
  `gender` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `lead_owner` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Lead',
  `customer` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `request_type` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `whatsapp_no` varchar(140) DEFAULT NULL,
  `phone` varchar(140) DEFAULT NULL,
  `phone_ext` varchar(140) DEFAULT NULL,
  `company_name` varchar(140) DEFAULT NULL,
  `no_of_employees` varchar(140) DEFAULT NULL,
  `annual_revenue` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `industry` varchar(140) DEFAULT NULL,
  `market_segment` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `fax` varchar(140) DEFAULT NULL,
  `city` varchar(140) DEFAULT NULL,
  `state` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `qualification_status` varchar(140) DEFAULT NULL,
  `qualified_by` varchar(140) DEFAULT NULL,
  `qualified_on` date DEFAULT NULL,
  `campaign_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `unsubscribed` int(1) NOT NULL DEFAULT 0,
  `blog_subscriber` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `lead_name` (`lead_name`),
  KEY `lead_owner` (`lead_owner`),
  KEY `status` (`status`),
  KEY `email_id` (`email_id`),
  KEY `modified` (`modified`),
  KEY `fk_lead_territory` (`territory`),
  CONSTRAINT `fk_lead_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLead Source
CREATE TABLE IF NOT EXISTS `tabLead Source` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `source_name` varchar(140) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `source_name` (`source_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLedger Health
CREATE TABLE IF NOT EXISTS `tabLedger Health` (
  `name` bigint(20) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `checked_on` datetime(6) DEFAULT NULL,
  `debit_credit_mismatch` int(1) NOT NULL DEFAULT 0,
  `general_and_payment_ledger_mismatch` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_lh_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_lh_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLedger Health Monitor Company
CREATE TABLE IF NOT EXISTS `tabLedger Health Monitor Company` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLedger Merge
CREATE TABLE IF NOT EXISTS `tabLedger Merge` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `root_type` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `account_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLedger Merge Accounts
CREATE TABLE IF NOT EXISTS `tabLedger Merge Accounts` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `account_name` varchar(140) DEFAULT NULL,
  `merged` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLetter Head
CREATE TABLE IF NOT EXISTS `tabLetter Head` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `letter_head_name` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `footer_source` varchar(140) DEFAULT 'HTML',
  `disabled` int(1) NOT NULL DEFAULT 0,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `image` text DEFAULT NULL,
  `image_height` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `image_width` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `align` varchar(140) DEFAULT 'Left',
  `content` longtext DEFAULT NULL,
  `footer` longtext DEFAULT NULL,
  `footer_image` text DEFAULT NULL,
  `footer_image_height` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `footer_image_width` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `footer_align` varchar(140) DEFAULT NULL,
  `header_script` longtext DEFAULT NULL,
  `footer_script` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `letter_head_name` (`letter_head_name`),
  KEY `is_default` (`is_default`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLinked Location
CREATE TABLE IF NOT EXISTS `tabLinked Location` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `location` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabList Filter
CREATE TABLE IF NOT EXISTS `tabList Filter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `filter_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `for_user` varchar(140) DEFAULT NULL,
  `filters` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabList View Settings
CREATE TABLE IF NOT EXISTS `tabList View Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disable_count` int(1) NOT NULL DEFAULT 0,
  `disable_comment_count` int(1) NOT NULL DEFAULT 0,
  `disable_sidebar_stats` int(1) NOT NULL DEFAULT 0,
  `disable_auto_refresh` int(1) NOT NULL DEFAULT 0,
  `allow_edit` int(1) NOT NULL DEFAULT 0,
  `disable_automatic_recency_filters` int(1) NOT NULL DEFAULT 0,
  `total_fields` varchar(140) DEFAULT NULL,
  `fields` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLocation
CREATE TABLE IF NOT EXISTS `tabLocation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `location_name` varchar(140) DEFAULT NULL,
  `parent_location` varchar(140) DEFAULT NULL,
  `is_container` int(1) NOT NULL DEFAULT 0,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `latitude` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `longitude` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `area` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `area_uom` varchar(140) DEFAULT NULL,
  `location` longtext DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `location_name` (`location_name`),
  KEY `parent_location` (`parent_location`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLog Setting User
CREATE TABLE IF NOT EXISTS `tabLog Setting User` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `user` (`user`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLogs To Clear
CREATE TABLE IF NOT EXISTS `tabLogs To Clear` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `days` int(11) NOT NULL DEFAULT 30,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLost Reason Detail
CREATE TABLE IF NOT EXISTS `tabLost Reason Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `lost_reason` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLower Deduction Certificate
CREATE TABLE IF NOT EXISTS `tabLower Deduction Certificate` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `certificate_no` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `pan_no` varchar(140) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `certificate_limit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `certificate_no` (`certificate_no`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLoyalty Point Entry
CREATE TABLE IF NOT EXISTS `tabLoyalty Point Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `loyalty_program` varchar(140) DEFAULT NULL,
  `loyalty_program_tier` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `invoice_type` varchar(140) DEFAULT NULL,
  `invoice` varchar(140) DEFAULT NULL,
  `redeem_against` varchar(140) DEFAULT NULL,
  `loyalty_points` int(11) NOT NULL DEFAULT 0,
  `purchase_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expiry_date` date DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_lpe_customer` (`customer`),
  CONSTRAINT `fk_lpe_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLoyalty Point Entry Redemption
CREATE TABLE IF NOT EXISTS `tabLoyalty Point Entry Redemption` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_invoice` varchar(140) DEFAULT NULL,
  `redemption_date` date DEFAULT NULL,
  `redeemed_points` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLoyalty Program
CREATE TABLE IF NOT EXISTS `tabLoyalty Program` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `loyalty_program_name` varchar(140) DEFAULT NULL,
  `loyalty_program_type` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `customer_territory` varchar(140) DEFAULT NULL,
  `auto_opt_in` int(1) NOT NULL DEFAULT 0,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expiry_duration` int(11) NOT NULL DEFAULT 0,
  `expense_account` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `loyalty_program_name` (`loyalty_program_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabLoyalty Program Collection
CREATE TABLE IF NOT EXISTS `tabLoyalty Program Collection` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `tier_name` varchar(140) DEFAULT NULL,
  `min_spent` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `collection_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Schedule
CREATE TABLE IF NOT EXISTS `tabMaintenance Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `transaction_date` date DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_mobile` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `modified` (`modified`),
  KEY `fk_maintenance_schedule_territory` (`territory`),
  CONSTRAINT `fk_maintenance_schedule_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`),
  CONSTRAINT `fk_ms_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Schedule Detail
CREATE TABLE IF NOT EXISTS `tabMaintenance Schedule Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `actual_date` date DEFAULT NULL,
  `sales_person` varchar(140) DEFAULT NULL,
  `completion_status` varchar(140) DEFAULT 'Pending',
  `serial_no` text DEFAULT NULL,
  `item_reference` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `scheduled_date` (`scheduled_date`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Schedule Item
CREATE TABLE IF NOT EXISTS `tabMaintenance Schedule Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `periodicity` varchar(140) DEFAULT NULL,
  `no_of_visits` int(11) NOT NULL DEFAULT 0,
  `sales_person` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `start_date` (`start_date`),
  KEY `end_date` (`end_date`),
  KEY `sales_order` (`sales_order`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Team Member
CREATE TABLE IF NOT EXISTS `tabMaintenance Team Member` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `team_member` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `maintenance_role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Visit
CREATE TABLE IF NOT EXISTS `tabMaintenance Visit` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `maintenance_schedule` varchar(140) DEFAULT NULL,
  `maintenance_schedule_detail` varchar(140) DEFAULT NULL,
  `mntc_date` date DEFAULT NULL,
  `mntc_time` time(6) DEFAULT NULL,
  `completion_status` varchar(140) DEFAULT NULL,
  `maintenance_type` varchar(140) DEFAULT 'Unscheduled',
  `customer_feedback` text DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `amended_from` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_mv_customer` (`customer`),
  KEY `fk_maintenance_visit_territory` (`territory`),
  CONSTRAINT `fk_maintenance_visit_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`),
  CONSTRAINT `fk_mv_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaintenance Visit Purpose
CREATE TABLE IF NOT EXISTS `tabMaintenance Visit Purpose` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `service_person` varchar(140) DEFAULT NULL,
  `serial_no` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `work_done` text DEFAULT NULL,
  `prevdoc_doctype` varchar(140) DEFAULT NULL,
  `prevdoc_docname` varchar(140) DEFAULT NULL,
  `maintenance_schedule_detail` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabManufacturer
CREATE TABLE IF NOT EXISTS `tabManufacturer` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `short_name` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `logo` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `short_name` (`short_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMarket Segment
CREATE TABLE IF NOT EXISTS `tabMarket Segment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `market_segment` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `market_segment` (`market_segment`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMarketing Campaign
CREATE TABLE IF NOT EXISTS `tabMarketing Campaign` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `campaign_description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaterial Request
CREATE TABLE IF NOT EXISTS `tabMaterial Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT '{material_request_type}',
  `material_request_type` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `set_from_warehouse` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `per_ordered` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transfer_status` varchar(140) DEFAULT NULL,
  `per_received` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `letter_head` varchar(140) DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `job_card` varchar(140) DEFAULT NULL,
  `work_order` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `company` (`company`),
  KEY `transaction_date` (`transaction_date`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  KEY `fk_mr_buying_price_list` (`buying_price_list`),
  CONSTRAINT `fk_mr_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaterial Request Item
CREATE TABLE IF NOT EXISTS `tabMaterial Request Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `min_order_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expense_account` varchar(140) DEFAULT NULL,
  `wip_composite_asset` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `bom_no` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `lead_time_date` date DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `production_plan` varchar(140) DEFAULT NULL,
  `material_request_plan_item` varchar(140) DEFAULT NULL,
  `job_card_item` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `item_name` (`item_name`),
  KEY `item_group` (`item_group`),
  KEY `sales_order_item` (`sales_order_item`),
  KEY `parent` (`parent`),
  KEY `item_code_warehouse_index` (`item_code`,`warehouse`),
  KEY `fk_mri_warehouse` (`warehouse`),
  KEY `fk_mri_uom` (`uom`),
  KEY `fk_mri_stock_uom` (`stock_uom`),
  KEY `fk_mri_brand` (`brand`),
  KEY `fk_mri_from_warehouse` (`from_warehouse`),
  CONSTRAINT `fk_mr_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_mri_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_mri_from_warehouse` FOREIGN KEY (`from_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_mri_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_mri_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_mri_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_mri_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMaterial Request Plan Item
CREATE TABLE IF NOT EXISTS `tabMaterial Request Plan Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `material_request_type` varchar(140) DEFAULT NULL,
  `quantity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `required_bom_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `schedule_date` date DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `min_order_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sales_order` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `requested_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty_for_production` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `safety_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `from_warehouse` (`from_warehouse`),
  KEY `warehouse` (`warehouse`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMilestone
CREATE TABLE IF NOT EXISTS `tabMilestone` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `track_field` varchar(140) DEFAULT NULL,
  `value` varchar(140) DEFAULT NULL,
  `milestone_tracker` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_type` (`reference_type`),
  KEY `modified` (`modified`),
  KEY `reference_type_reference_name_index` (`reference_type`,`reference_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMilestone Tracker
CREATE TABLE IF NOT EXISTS `tabMilestone Tracker` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `track_field` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `document_type` (`document_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMode of Payment
CREATE TABLE IF NOT EXISTS `tabMode of Payment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `mode_of_payment` (`mode_of_payment`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMode of Payment Account
CREATE TABLE IF NOT EXISTS `tabMode of Payment Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `default_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabModule Def
CREATE TABLE IF NOT EXISTS `tabModule Def` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `module_name` varchar(140) DEFAULT NULL,
  `custom` int(1) NOT NULL DEFAULT 0,
  `package` varchar(140) DEFAULT NULL,
  `app_name` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `module_name` (`module_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabModule Onboarding
CREATE TABLE IF NOT EXISTS `tabModule Onboarding` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `subtitle` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `success_message` varchar(140) DEFAULT NULL,
  `documentation_url` varchar(140) DEFAULT NULL,
  `is_complete` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabModule Profile
CREATE TABLE IF NOT EXISTS `tabModule Profile` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `module_profile_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `module_profile_name` (`module_profile_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMonthly Distribution
CREATE TABLE IF NOT EXISTS `tabMonthly Distribution` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `distribution_id` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `distribution_id` (`distribution_id`),
  KEY `fiscal_year` (`fiscal_year`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabMonthly Distribution Percentage
CREATE TABLE IF NOT EXISTS `tabMonthly Distribution Percentage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `month` varchar(140) DEFAULT NULL,
  `percentage_allocation` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNavbar Item
CREATE TABLE IF NOT EXISTS `tabNavbar Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_label` varchar(140) DEFAULT NULL,
  `item_type` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `action` varchar(140) DEFAULT NULL,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `condition` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNetwork Printer Settings
CREATE TABLE IF NOT EXISTS `tabNetwork Printer Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `server_ip` varchar(140) DEFAULT 'localhost',
  `port` int(11) NOT NULL DEFAULT 631,
  `printer_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNewsletter
CREATE TABLE IF NOT EXISTS `tabNewsletter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_sent_at` datetime(6) DEFAULT NULL,
  `total_recipients` int(11) NOT NULL DEFAULT 0,
  `total_views` int(11) NOT NULL DEFAULT 0,
  `email_sent` int(1) NOT NULL DEFAULT 0,
  `sender_name` varchar(140) DEFAULT NULL,
  `sender_email` varchar(140) DEFAULT NULL,
  `send_from` varchar(140) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `content_type` varchar(140) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `message_md` longtext DEFAULT NULL,
  `message_html` longtext DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `send_unsubscribe_link` int(1) NOT NULL DEFAULT 1,
  `send_webview_link` int(1) NOT NULL DEFAULT 0,
  `scheduled_to_send` int(11) NOT NULL DEFAULT 0,
  `schedule_sending` int(1) NOT NULL DEFAULT 0,
  `schedule_send` datetime(6) DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNewsletter Attachment
CREATE TABLE IF NOT EXISTS `tabNewsletter Attachment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `attachment` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNewsletter Email Group
CREATE TABLE IF NOT EXISTS `tabNewsletter Email Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_group` varchar(140) DEFAULT NULL,
  `total_subscribers` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNon Conformance
CREATE TABLE IF NOT EXISTS `tabNon Conformance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` varchar(140) DEFAULT NULL,
  `procedure` varchar(140) DEFAULT NULL,
  `process_owner` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `corrective_action` longtext DEFAULT NULL,
  `preventive_action` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNote
CREATE TABLE IF NOT EXISTS `tabNote` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `public` int(1) NOT NULL DEFAULT 0,
  `notify_on_login` int(1) NOT NULL DEFAULT 0,
  `notify_on_every_login` int(1) NOT NULL DEFAULT 0,
  `expire_notification_on` date DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `expire_notification_on` (`expire_notification_on`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNote Seen By
CREATE TABLE IF NOT EXISTS `tabNote Seen By` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNotification
CREATE TABLE IF NOT EXISTS `tabNotification` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `channel` varchar(140) DEFAULT 'Email',
  `slack_webhook_url` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `event` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `method` varchar(140) DEFAULT NULL,
  `date_changed` varchar(140) DEFAULT NULL,
  `days_in_advance` int(11) NOT NULL DEFAULT 0,
  `value_changed` varchar(140) DEFAULT NULL,
  `sender` varchar(140) DEFAULT NULL,
  `send_system_notification` int(1) NOT NULL DEFAULT 0,
  `sender_email` varchar(140) DEFAULT NULL,
  `condition` longtext DEFAULT NULL,
  `set_property_after_alert` varchar(140) DEFAULT NULL,
  `property_value` varchar(140) DEFAULT NULL,
  `send_to_all_assignees` int(1) NOT NULL DEFAULT 0,
  `message_type` varchar(140) DEFAULT 'Markdown',
  `message` longtext DEFAULT 'Add your message here',
  `attach_print` int(1) NOT NULL DEFAULT 0,
  `print_format` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `event` (`event`),
  KEY `document_type` (`document_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNotification Log
CREATE TABLE IF NOT EXISTS `tabNotification Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` text DEFAULT NULL,
  `for_user` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `email_content` longtext DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `read` int(1) NOT NULL DEFAULT 0,
  `document_name` varchar(140) DEFAULT NULL,
  `attached_file` longtext DEFAULT NULL,
  `from_user` varchar(140) DEFAULT NULL,
  `link` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `for_user` (`for_user`),
  KEY `document_name` (`document_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNotification Recipient
CREATE TABLE IF NOT EXISTS `tabNotification Recipient` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `receiver_by_document_field` varchar(140) DEFAULT NULL,
  `receiver_by_role` varchar(140) DEFAULT NULL,
  `cc` longtext DEFAULT NULL,
  `bcc` longtext DEFAULT NULL,
  `condition` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNotification Settings
CREATE TABLE IF NOT EXISTS `tabNotification Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `enable_email_notifications` int(1) NOT NULL DEFAULT 1,
  `enable_email_mention` int(1) NOT NULL DEFAULT 1,
  `enable_email_assignment` int(1) NOT NULL DEFAULT 1,
  `enable_email_threads_on_assigned_document` int(1) NOT NULL DEFAULT 1,
  `enable_email_energy_point` int(1) NOT NULL DEFAULT 1,
  `enable_email_share` int(1) NOT NULL DEFAULT 1,
  `enable_email_event_reminders` int(1) NOT NULL DEFAULT 1,
  `user` varchar(140) DEFAULT NULL,
  `seen` int(1) NOT NULL DEFAULT 0,
  `energy_points_system_notifications` int(1) NOT NULL DEFAULT 1,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNotification Subscribed Document
CREATE TABLE IF NOT EXISTS `tabNotification Subscribed Document` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNumber Card
CREATE TABLE IF NOT EXISTS `tabNumber Card` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `report_name` varchar(140) DEFAULT NULL,
  `method` varchar(140) DEFAULT NULL,
  `function` varchar(140) DEFAULT NULL,
  `aggregate_function_based_on` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `parent_document_type` varchar(140) DEFAULT NULL,
  `report_field` varchar(140) DEFAULT NULL,
  `report_function` varchar(140) DEFAULT NULL,
  `is_public` int(1) NOT NULL DEFAULT 0,
  `currency` varchar(140) DEFAULT NULL,
  `filters_config` longtext DEFAULT NULL,
  `show_percentage_stats` int(1) NOT NULL DEFAULT 1,
  `stats_time_interval` varchar(140) DEFAULT 'Daily',
  `filters_json` longtext DEFAULT NULL,
  `dynamic_filters_json` longtext DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `background_color` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabNumber Card Link
CREATE TABLE IF NOT EXISTS `tabNumber Card Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `card` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOAuth Authorization Code
CREATE TABLE IF NOT EXISTS `tabOAuth Authorization Code` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `client` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `authorization_code` varchar(140) DEFAULT NULL,
  `expiration_time` datetime(6) DEFAULT NULL,
  `redirect_uri_bound_to_authorization_code` varchar(140) DEFAULT NULL,
  `validity` varchar(140) DEFAULT NULL,
  `nonce` varchar(140) DEFAULT NULL,
  `code_challenge` varchar(140) DEFAULT NULL,
  `code_challenge_method` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `authorization_code` (`authorization_code`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOAuth Bearer Token
CREATE TABLE IF NOT EXISTS `tabOAuth Bearer Token` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `client` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `access_token` varchar(140) DEFAULT NULL,
  `refresh_token` varchar(140) DEFAULT NULL,
  `expiration_time` datetime(6) DEFAULT NULL,
  `expires_in` int(11) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `access_token` (`access_token`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOAuth Client
CREATE TABLE IF NOT EXISTS `tabOAuth Client` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `client_id` varchar(140) DEFAULT NULL,
  `app_name` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `client_secret` varchar(140) DEFAULT NULL,
  `skip_authorization` int(1) NOT NULL DEFAULT 0,
  `scopes` text DEFAULT 'all openid',
  `redirect_uris` text DEFAULT NULL,
  `default_redirect_uri` varchar(140) DEFAULT NULL,
  `grant_type` varchar(140) DEFAULT NULL,
  `response_type` varchar(140) DEFAULT 'Code',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOAuth Client Role
CREATE TABLE IF NOT EXISTS `tabOAuth Client Role` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOAuth Scope
CREATE TABLE IF NOT EXISTS `tabOAuth Scope` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `scope` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOnboarding Permission
CREATE TABLE IF NOT EXISTS `tabOnboarding Permission` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOnboarding Step
CREATE TABLE IF NOT EXISTS `tabOnboarding Step` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `is_complete` int(1) NOT NULL DEFAULT 0,
  `is_skipped` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `intro_video_url` varchar(140) DEFAULT NULL,
  `action` varchar(140) DEFAULT NULL,
  `action_label` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `show_full_form` int(1) NOT NULL DEFAULT 0,
  `show_form_tour` int(1) NOT NULL DEFAULT 0,
  `form_tour` varchar(140) DEFAULT NULL,
  `is_single` int(1) NOT NULL DEFAULT 0,
  `reference_report` varchar(140) DEFAULT NULL,
  `report_reference_doctype` varchar(140) DEFAULT NULL,
  `report_type` varchar(140) DEFAULT NULL,
  `report_description` varchar(140) DEFAULT NULL,
  `path` varchar(140) DEFAULT NULL,
  `callback_title` varchar(140) DEFAULT NULL,
  `callback_message` text DEFAULT NULL,
  `validate_action` int(1) NOT NULL DEFAULT 1,
  `field` varchar(140) DEFAULT NULL,
  `value_to_validate` varchar(140) DEFAULT NULL,
  `video_url` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOnboarding Step Map
CREATE TABLE IF NOT EXISTS `tabOnboarding Step Map` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `step` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpening Invoice Creation Tool Item
CREATE TABLE IF NOT EXISTS `tabOpening Invoice Creation Tool Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `invoice_number` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `temporary_opening_account` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `item_name` varchar(140) DEFAULT 'Opening Invoice Item',
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty` varchar(140) DEFAULT '1',
  `cost_center` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOperation
CREATE TABLE IF NOT EXISTS `tabOperation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workstation` varchar(140) DEFAULT NULL,
  `is_corrective_operation` int(1) NOT NULL DEFAULT 0,
  `create_job_card_based_on_batch_size` int(1) NOT NULL DEFAULT 0,
  `quality_inspection_template` varchar(140) DEFAULT NULL,
  `batch_size` int(11) NOT NULL DEFAULT 1,
  `total_operation_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpportunity
CREATE TABLE IF NOT EXISTS `tabOpportunity` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `opportunity_from` varchar(140) DEFAULT NULL,
  `party_name` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `opportunity_type` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `opportunity_owner` varchar(140) DEFAULT NULL,
  `sales_stage` varchar(140) DEFAULT 'Prospecting',
  `expected_closing` date DEFAULT NULL,
  `probability` decimal(21,9) NOT NULL DEFAULT 100.000000000,
  `no_of_employees` varchar(140) DEFAULT NULL,
  `annual_revenue` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `customer_group` varchar(140) DEFAULT NULL,
  `industry` varchar(140) DEFAULT NULL,
  `market_segment` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `city` varchar(140) DEFAULT NULL,
  `state` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `opportunity_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_opportunity_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `first_response_time` decimal(21,9) DEFAULT NULL,
  `order_lost_reason` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `job_title` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `contact_mobile` varchar(140) DEFAULT NULL,
  `whatsapp` varchar(140) DEFAULT NULL,
  `phone` varchar(140) DEFAULT NULL,
  `phone_ext` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer_group` (`customer_group`),
  KEY `territory` (`territory`),
  KEY `company` (`company`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_opportunity_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_opportunity_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpportunity Item
CREATE TABLE IF NOT EXISTS `tabOpportunity Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `brand` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpportunity Lost Reason
CREATE TABLE IF NOT EXISTS `tabOpportunity Lost Reason` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `lost_reason` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `lost_reason` (`lost_reason`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpportunity Lost Reason Detail
CREATE TABLE IF NOT EXISTS `tabOpportunity Lost Reason Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `lost_reason` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOpportunity Type
CREATE TABLE IF NOT EXISTS `tabOpportunity Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabOverdue Payment
CREATE TABLE IF NOT EXISTS `tabOverdue Payment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_invoice` varchar(140) DEFAULT NULL,
  `payment_schedule` varchar(140) DEFAULT NULL,
  `dunning_level` int(11) NOT NULL DEFAULT 1,
  `payment_term` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `overdue_days` varchar(140) DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `invoice_portion` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `payment_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discounted_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `interest` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPackage
CREATE TABLE IF NOT EXISTS `tabPackage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `package_name` varchar(140) DEFAULT NULL,
  `readme` longtext DEFAULT NULL,
  `license_type` varchar(140) DEFAULT NULL,
  `license` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPackage Import
CREATE TABLE IF NOT EXISTS `tabPackage Import` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `attach_package` text DEFAULT NULL,
  `activate` int(1) NOT NULL DEFAULT 0,
  `force` int(1) NOT NULL DEFAULT 0,
  `log` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPackage Release
CREATE TABLE IF NOT EXISTS `tabPackage Release` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `package` varchar(140) DEFAULT NULL,
  `publish` int(1) NOT NULL DEFAULT 0,
  `path` text DEFAULT NULL,
  `major` int(11) NOT NULL DEFAULT 0,
  `minor` int(11) NOT NULL DEFAULT 0,
  `patch` int(11) NOT NULL DEFAULT 0,
  `release_notes` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPacked Item
CREATE TABLE IF NOT EXISTS `tabPacked Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parent_item` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `actual_batch_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `packed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `picked_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `prevdoc_doctype` varchar(140) DEFAULT NULL,
  `parent_detail_docname` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent_detail_docname` (`parent_detail_docname`),
  KEY `parent` (`parent`),
  KEY `item_code_warehouse_index` (`item_code`,`warehouse`),
  KEY `fk_packed_item_warehouse` (`warehouse`),
  CONSTRAINT `fk_packed_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_packed_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPacking Slip
CREATE TABLE IF NOT EXISTS `tabPacking Slip` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `delivery_note` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `from_case_no` int(11) NOT NULL DEFAULT 0,
  `to_case_no` int(11) NOT NULL DEFAULT 0,
  `net_weight_pkg` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_weight_uom` varchar(140) DEFAULT NULL,
  `gross_weight_pkg` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gross_weight_uom` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPacking Slip Item
CREATE TABLE IF NOT EXISTS `tabPacking Slip Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `weight_uom` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `dn_detail` varchar(140) DEFAULT NULL,
  `pi_detail` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPage
CREATE TABLE IF NOT EXISTS `tabPage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `system_page` int(1) NOT NULL DEFAULT 0,
  `page_name` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `standard` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `page_name` (`page_name`),
  KEY `standard` (`standard`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabParty Account
CREATE TABLE IF NOT EXISTS `tabParty Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `advance_account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabParty Link
CREATE TABLE IF NOT EXISTS `tabParty Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `primary_role` varchar(140) DEFAULT NULL,
  `secondary_role` varchar(140) DEFAULT NULL,
  `primary_party` varchar(140) DEFAULT NULL,
  `secondary_party` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabParty Specific Item
CREATE TABLE IF NOT EXISTS `tabParty Specific Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `restrict_based_on` varchar(140) DEFAULT NULL,
  `based_on_value` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabParty Type
CREATE TABLE IF NOT EXISTS `tabParty Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `party_type` varchar(140) DEFAULT NULL,
  `account_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPatch Log
CREATE TABLE IF NOT EXISTS `tabPatch Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `patch` longtext DEFAULT NULL,
  `skipped` int(1) NOT NULL DEFAULT 0,
  `traceback` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPause SLA On Status
CREATE TABLE IF NOT EXISTS `tabPause SLA On Status` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Entry
CREATE TABLE IF NOT EXISTS `tabPayment Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `payment_type` varchar(140) DEFAULT NULL,
  `payment_order_status` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `party_name` varchar(140) DEFAULT NULL,
  `book_advance_payments_in_separate_party_account` int(1) NOT NULL DEFAULT 0,
  `reconcile_on_advance_payment_date` int(1) NOT NULL DEFAULT 0,
  `bank_account` varchar(140) DEFAULT NULL,
  `party_bank_account` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `party_balance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_from` varchar(140) DEFAULT NULL,
  `paid_from_account_type` varchar(140) DEFAULT NULL,
  `paid_from_account_currency` varchar(140) DEFAULT NULL,
  `paid_from_account_balance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_to` varchar(140) DEFAULT NULL,
  `paid_to_account_type` varchar(140) DEFAULT NULL,
  `paid_to_account_currency` varchar(140) DEFAULT NULL,
  `paid_to_account_balance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount_after_tax` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `source_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_paid_amount_after_tax` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_amount_after_tax` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `target_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_received_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_received_amount_after_tax` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `unallocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `purchase_taxes_and_charges_template` varchar(140) DEFAULT NULL,
  `sales_taxes_and_charges_template` varchar(140) DEFAULT NULL,
  `apply_tax_withholding_amount` int(1) NOT NULL DEFAULT 0,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reference_no` varchar(140) DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `clearance_date` date DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `custom_remarks` int(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `base_in_words` text DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT 'No',
  `letter_head` varchar(140) DEFAULT NULL,
  `print_heading` varchar(140) DEFAULT NULL,
  `bank` varchar(140) DEFAULT NULL,
  `bank_account_no` varchar(140) DEFAULT NULL,
  `payment_order` varchar(140) DEFAULT NULL,
  `in_words` text DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `party_type` (`party_type`),
  KEY `reference_date` (`reference_date`),
  KEY `is_opening` (`is_opening`),
  KEY `modified` (`modified`),
  KEY `fk_payment_account` (`paid_from`),
  KEY `fk_pe_company` (`company`),
  KEY `fk_pe_cost_center` (`cost_center`),
  KEY `fk_pe_project` (`project`),
  KEY `fk_pe_tax_withholding_category` (`tax_withholding_category`),
  KEY `fk_pe_paid_from_currency` (`paid_from_account_currency`),
  KEY `fk_pe_paid_to_currency` (`paid_to_account_currency`),
  CONSTRAINT `fk_payment_account` FOREIGN KEY (`paid_from`) REFERENCES `tabAccount` (`name`),
  CONSTRAINT `fk_payment_entry_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_pe_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_pe_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_pe_paid_from_currency` FOREIGN KEY (`paid_from_account_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_pe_paid_to_currency` FOREIGN KEY (`paid_to_account_currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_pe_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pe_tax_withholding_category` FOREIGN KEY (`tax_withholding_category`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Entry Deduction
CREATE TABLE IF NOT EXISTS `tabPayment Entry Deduction` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_exchange_gain_loss` int(1) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_ped_cost_center` (`cost_center`),
  CONSTRAINT `fk_ped_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Entry Reference
CREATE TABLE IF NOT EXISTS `tabPayment Entry Reference` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `bill_no` varchar(140) DEFAULT NULL,
  `payment_term` varchar(140) DEFAULT NULL,
  `payment_term_outstanding` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_type` varchar(140) DEFAULT NULL,
  `payment_type` varchar(140) DEFAULT NULL,
  `reconcile_effect_on` date DEFAULT NULL,
  `total_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `exchange_gain_loss` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account` varchar(140) DEFAULT NULL,
  `payment_request` varchar(140) DEFAULT NULL,
  `advance_voucher_type` varchar(140) DEFAULT NULL,
  `advance_voucher_no` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_doctype` (`reference_doctype`),
  KEY `reference_name` (`reference_name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Gateway Account
CREATE TABLE IF NOT EXISTS `tabPayment Gateway Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_gateway` varchar(140) DEFAULT NULL,
  `payment_channel` varchar(140) DEFAULT 'Email',
  `company` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `payment_account` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `message` text DEFAULT 'Please click on the link below to make your payment',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Ledger Entry
CREATE TABLE IF NOT EXISTS `tabPayment Ledger Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `account_type` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `voucher_detail_no` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `against_voucher_type` varchar(140) DEFAULT NULL,
  `against_voucher_no` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_currency` varchar(140) DEFAULT NULL,
  `amount_in_account_currency` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delinked` int(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `posting_date` (`posting_date`),
  KEY `company` (`company`),
  KEY `account` (`account`),
  KEY `party_type` (`party_type`),
  KEY `party` (`party`),
  KEY `voucher_detail_no` (`voucher_detail_no`),
  KEY `voucher_type` (`voucher_type`),
  KEY `voucher_no` (`voucher_no`),
  KEY `against_voucher_type` (`against_voucher_type`),
  KEY `against_voucher_no` (`against_voucher_no`),
  KEY `modified` (`modified`),
  KEY `against_voucher_no_against_voucher_type_index` (`against_voucher_no`,`against_voucher_type`),
  KEY `voucher_no_voucher_type_index` (`voucher_no`,`voucher_type`),
  CONSTRAINT `fk_ple_against_voucher_type` FOREIGN KEY (`against_voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_ple_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Order
CREATE TABLE IF NOT EXISTS `tabPayment Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'PMO-',
  `company` varchar(140) DEFAULT NULL,
  `payment_order_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `company_bank` varchar(140) DEFAULT NULL,
  `company_bank_account` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Order Reference
CREATE TABLE IF NOT EXISTS `tabPayment Order Reference` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `supplier` varchar(140) DEFAULT NULL,
  `payment_request` varchar(140) DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `payment_reference` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Request
CREATE TABLE IF NOT EXISTS `tabPayment Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_request_type` varchar(140) DEFAULT 'Inward',
  `transaction_date` date DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `party_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `is_a_subscription` int(1) NOT NULL DEFAULT 0,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `bank_account` varchar(140) DEFAULT NULL,
  `bank` varchar(140) DEFAULT NULL,
  `bank_account_no` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `iban` varchar(140) DEFAULT NULL,
  `branch_code` varchar(140) DEFAULT NULL,
  `swift_number` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `print_format` varchar(140) DEFAULT NULL,
  `email_to` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `payment_gateway_account` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `make_sales_invoice` int(1) NOT NULL DEFAULT 0,
  `message` text DEFAULT NULL,
  `mute_email` int(1) NOT NULL DEFAULT 0,
  `payment_url` varchar(500) DEFAULT NULL,
  `payment_gateway` varchar(140) DEFAULT NULL,
  `payment_account` varchar(140) DEFAULT NULL,
  `payment_channel` varchar(140) DEFAULT NULL,
  `payment_order` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `phone_number` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_name` (`reference_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Schedule
CREATE TABLE IF NOT EXISTS `tabPayment Schedule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_term` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `invoice_portion` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_type` varchar(140) DEFAULT 'Percentage',
  `discount_date` date DEFAULT NULL,
  `discount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `payment_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discounted_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_payment_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_outstanding` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Term
CREATE TABLE IF NOT EXISTS `tabPayment Term` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_term_name` varchar(140) DEFAULT NULL,
  `invoice_portion` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `due_date_based_on` varchar(140) DEFAULT NULL,
  `credit_days` int(11) NOT NULL DEFAULT 0,
  `credit_months` int(11) NOT NULL DEFAULT 0,
  `discount_type` varchar(140) DEFAULT 'Percentage',
  `discount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_validity_based_on` varchar(140) DEFAULT 'Day(s) after invoice date',
  `discount_validity` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `payment_term_name` (`payment_term_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Terms Template
CREATE TABLE IF NOT EXISTS `tabPayment Terms Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `template_name` varchar(140) DEFAULT NULL,
  `allocate_payment_based_on_payment_terms` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `template_name` (`template_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPayment Terms Template Detail
CREATE TABLE IF NOT EXISTS `tabPayment Terms Template Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `payment_term` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `invoice_portion` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `due_date_based_on` varchar(140) DEFAULT NULL,
  `credit_days` int(11) NOT NULL DEFAULT 0,
  `credit_months` int(11) NOT NULL DEFAULT 0,
  `discount_type` varchar(140) DEFAULT 'Percentage',
  `discount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_validity_based_on` varchar(140) DEFAULT 'Day(s) after invoice date',
  `discount_validity` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPegged Currency Details
CREATE TABLE IF NOT EXISTS `tabPegged Currency Details` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `source_currency` varchar(140) DEFAULT NULL,
  `pegged_against` varchar(140) DEFAULT NULL,
  `pegged_exchange_rate` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPeriod Closing Voucher
CREATE TABLE IF NOT EXISTS `tabPeriod Closing Voucher` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `transaction_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `period_start_date` date DEFAULT NULL,
  `period_end_date` date DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `closing_account_head` varchar(140) DEFAULT NULL,
  `gle_processing_status` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPersonal Data Deletion Request
CREATE TABLE IF NOT EXISTS `tabPersonal Data Deletion Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending Verification',
  `anonymization_matrix` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPersonal Data Deletion Step
CREATE TABLE IF NOT EXISTS `tabPersonal Data Deletion Step` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `partial` int(1) NOT NULL DEFAULT 0,
  `fields` text DEFAULT NULL,
  `filtered_by` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPersonal Data Download Request
CREATE TABLE IF NOT EXISTS `tabPersonal Data Download Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `user_name` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPick List
CREATE TABLE IF NOT EXISTS `tabPick List` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `purpose` varchar(140) DEFAULT 'Material Transfer for Manufacture',
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `work_order` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `for_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent_warehouse` varchar(140) DEFAULT NULL,
  `consider_rejected_warehouses` int(1) NOT NULL DEFAULT 0,
  `pick_manually` int(1) NOT NULL DEFAULT 0,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `scan_mode` int(1) NOT NULL DEFAULT 0,
  `prompt_qty` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Draft',
  `delivery_status` varchar(140) DEFAULT NULL,
  `per_delivered` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPick List Item
CREATE TABLE IF NOT EXISTS `tabPick List Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `picked_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_reserved_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `product_bundle_item` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPlant Floor
CREATE TABLE IF NOT EXISTS `tabPlant Floor` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `floor_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `floor_name` (`floor_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPortal Menu Item
CREATE TABLE IF NOT EXISTS `tabPortal Menu Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `role` varchar(140) DEFAULT NULL,
  `target` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPortal User
CREATE TABLE IF NOT EXISTS `tabPortal User` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Closing Entry
CREATE TABLE IF NOT EXISTS `tabPOS Closing Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `period_start_date` datetime(6) DEFAULT NULL,
  `period_end_date` datetime(6) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `pos_opening_entry` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `company` varchar(140) DEFAULT NULL,
  `pos_profile` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_quantity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `error_message` text DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Closing Entry Detail
CREATE TABLE IF NOT EXISTS `tabPOS Closing Entry Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `opening_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expected_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `closing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Closing Entry Taxes
CREATE TABLE IF NOT EXISTS `tabPOS Closing Entry Taxes` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account_head` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Customer Group
CREATE TABLE IF NOT EXISTS `tabPOS Customer Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Field
CREATE TABLE IF NOT EXISTS `tabPOS Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT NULL,
  `options` text DEFAULT NULL,
  `default_value` varchar(140) DEFAULT NULL,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Invoice
CREATE TABLE IF NOT EXISTS `tabPOS Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{customer_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `pos_profile` varchar(140) DEFAULT NULL,
  `consolidated_invoice` varchar(140) DEFAULT NULL,
  `is_pos` int(1) NOT NULL DEFAULT 1,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `update_billed_amount_in_sales_order` int(1) NOT NULL DEFAULT 0,
  `update_billed_amount_in_delivery_note` int(1) NOT NULL DEFAULT 1,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `return_against` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `po_no` varchar(140) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `shipping_address_name` varchar(140) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `company_contact_person` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `update_stock` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `total_billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `other_charges_calculation` longtext DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `loyalty_points` int(11) NOT NULL DEFAULT 0,
  `loyalty_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `redeem_loyalty_points` int(1) NOT NULL DEFAULT 0,
  `loyalty_program` varchar(140) DEFAULT NULL,
  `loyalty_redemption_account` varchar(140) DEFAULT NULL,
  `loyalty_redemption_cost_center` varchar(140) DEFAULT NULL,
  `coupon_code` varchar(140) DEFAULT NULL,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(140) DEFAULT NULL,
  `total_advance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocate_advances_automatically` int(1) NOT NULL DEFAULT 0,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `cash_bank_account` varchar(140) DEFAULT NULL,
  `base_paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_change_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `change_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_for_change_amount` varchar(140) DEFAULT NULL,
  `write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `write_off_outstanding_amount_automatically` int(1) NOT NULL DEFAULT 0,
  `write_off_account` varchar(140) DEFAULT NULL,
  `write_off_cost_center` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `language` varchar(140) DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `inter_company_invoice_reference` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `is_discounted` int(1) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Draft',
  `source` varchar(140) DEFAULT NULL,
  `debit_to` varchar(140) DEFAULT NULL,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT 'No',
  `remarks` text DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `amount_eligible_for_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `against_income_account` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `posting_date` (`posting_date`),
  KEY `return_against` (`return_against`),
  KEY `debit_to` (`debit_to`),
  KEY `modified` (`modified`),
  KEY `fk_pos_invoice_territory` (`territory`),
  KEY `fk_pi_tax_category` (`tax_category`),
  KEY `fk_pi_tax_template` (`taxes_and_charges`),
  KEY `fk_pi_currency` (`currency`),
  CONSTRAINT `fk_pi_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_pi_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`),
  CONSTRAINT `fk_pi_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabSales Taxes and Charges Template` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pos_invoice_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Invoice Item
CREATE TABLE IF NOT EXISTS `tabPOS Invoice Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `customer_item_code` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `grant_commission` int(1) NOT NULL DEFAULT 0,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `income_account` varchar(140) DEFAULT NULL,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `deferred_revenue_account` varchar(140) DEFAULT NULL,
  `service_stop_date` date DEFAULT NULL,
  `enable_deferred_revenue` int(1) NOT NULL DEFAULT 0,
  `service_start_date` date DEFAULT NULL,
  `service_end_date` date DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse` varchar(140) DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `item_tax_rate` text DEFAULT NULL,
  `actual_batch_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `so_detail` varchar(140) DEFAULT NULL,
  `pos_invoice_item` varchar(140) DEFAULT NULL,
  `delivery_note` varchar(140) DEFAULT NULL,
  `dn_detail` varchar(140) DEFAULT NULL,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `sales_order` (`sales_order`),
  KEY `so_detail` (`so_detail`),
  KEY `delivery_note` (`delivery_note`),
  KEY `dn_detail` (`dn_detail`),
  KEY `parent` (`parent`),
  KEY `fk_pii_pos_item_group` (`item_group`),
  KEY `fk_pi_item_warehouse` (`warehouse`),
  CONSTRAINT `fk_pi_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pii_pos_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Invoice Merge Log
CREATE TABLE IF NOT EXISTS `tabPOS Invoice Merge Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `merge_invoices_based_on` varchar(140) DEFAULT NULL,
  `pos_closing_entry` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `consolidated_invoice` varchar(140) DEFAULT NULL,
  `consolidated_credit_note` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Invoice Reference
CREATE TABLE IF NOT EXISTS `tabPOS Invoice Reference` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `pos_invoice` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Item Group
CREATE TABLE IF NOT EXISTS `tabPOS Item Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_pig_parent` FOREIGN KEY (`parent`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Opening Entry
CREATE TABLE IF NOT EXISTS `tabPOS Opening Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `period_start_date` datetime(6) DEFAULT NULL,
  `period_end_date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `posting_date` date DEFAULT NULL,
  `set_posting_date` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `pos_profile` varchar(140) DEFAULT NULL,
  `pos_closing_entry` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Opening Entry Detail
CREATE TABLE IF NOT EXISTS `tabPOS Opening Entry Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `opening_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Payment Method
CREATE TABLE IF NOT EXISTS `tabPOS Payment Method` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `default` int(1) NOT NULL DEFAULT 0,
  `allow_in_returns` int(1) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Profile
CREATE TABLE IF NOT EXISTS `tabPOS Profile` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `warehouse` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `hide_images` int(1) NOT NULL DEFAULT 0,
  `hide_unavailable_items` int(1) NOT NULL DEFAULT 0,
  `auto_add_item_to_cart` int(1) NOT NULL DEFAULT 0,
  `validate_stock_on_save` int(1) NOT NULL DEFAULT 0,
  `print_receipt_on_order_complete` int(1) NOT NULL DEFAULT 0,
  `update_stock` int(1) NOT NULL DEFAULT 1,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `allow_rate_change` int(1) NOT NULL DEFAULT 0,
  `allow_discount_change` int(1) NOT NULL DEFAULT 0,
  `disable_grand_total_to_default_mop` int(1) NOT NULL DEFAULT 0,
  `allow_partial_payment` int(1) NOT NULL DEFAULT 0,
  `print_format` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `write_off_account` varchar(140) DEFAULT NULL,
  `write_off_cost_center` varchar(140) DEFAULT NULL,
  `write_off_limit` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `account_for_change_amount` varchar(140) DEFAULT NULL,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `income_account` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_pos_profile_selling_price_list` (`selling_price_list`),
  KEY `fk_pp_tax_category` (`tax_category`),
  KEY `fk_pp_tax_template` (`taxes_and_charges`),
  CONSTRAINT `fk_pos_profile_selling_price_list` FOREIGN KEY (`selling_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pp_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`),
  CONSTRAINT `fk_pp_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabSales Taxes and Charges Template` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Profile User
CREATE TABLE IF NOT EXISTS `tabPOS Profile User` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `default` int(1) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPOS Search Fields
CREATE TABLE IF NOT EXISTS `tabPOS Search Fields` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `field` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrepared Report
CREATE TABLE IF NOT EXISTS `tabPrepared Report` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Queued',
  `report_name` varchar(140) DEFAULT NULL,
  `job_id` varchar(140) DEFAULT NULL,
  `report_end_time` datetime(6) DEFAULT NULL,
  `peak_memory_usage` int(11) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `filters` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `report_name` (`report_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrice List
CREATE TABLE IF NOT EXISTS `tabPrice List` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `price_list_name` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `buying` int(1) NOT NULL DEFAULT 0,
  `selling` int(1) NOT NULL DEFAULT 0,
  `price_not_uom_dependent` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `price_list_name` (`price_list_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrice List Country
CREATE TABLE IF NOT EXISTS `tabPrice List Country` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `country` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPricing Rule
CREATE TABLE IF NOT EXISTS `tabPricing Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'PRLE-.####',
  `title` varchar(140) DEFAULT NULL,
  `disable` int(1) NOT NULL DEFAULT 0,
  `apply_on` varchar(140) DEFAULT 'Item Code',
  `price_or_product_discount` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `mixed_conditions` int(1) NOT NULL DEFAULT 0,
  `is_cumulative` int(1) NOT NULL DEFAULT 0,
  `coupon_code_based` int(1) NOT NULL DEFAULT 0,
  `apply_rule_on_other` varchar(140) DEFAULT NULL,
  `other_item_code` varchar(140) DEFAULT NULL,
  `other_item_group` varchar(140) DEFAULT NULL,
  `other_brand` varchar(140) DEFAULT NULL,
  `selling` int(1) NOT NULL DEFAULT 0,
  `buying` int(1) NOT NULL DEFAULT 0,
  `applicable_for` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_group` varchar(140) DEFAULT NULL,
  `min_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `min_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `same_item` int(1) NOT NULL DEFAULT 0,
  `free_item` varchar(140) DEFAULT NULL,
  `free_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `free_item_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `free_item_uom` varchar(140) DEFAULT NULL,
  `round_free_qty` int(1) NOT NULL DEFAULT 0,
  `dont_enforce_free_item_qty` int(1) NOT NULL DEFAULT 0,
  `is_recursive` int(1) NOT NULL DEFAULT 0,
  `recurse_for` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `apply_recursion_over` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valid_from` date DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `margin_type` varchar(140) DEFAULT 'Percentage',
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_or_discount` varchar(140) DEFAULT 'Discount Percentage',
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `for_price_list` varchar(140) DEFAULT NULL,
  `condition` longtext DEFAULT NULL,
  `apply_multiple_pricing_rules` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on_rate` int(1) NOT NULL DEFAULT 0,
  `threshold_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `validate_applied_rule` int(1) NOT NULL DEFAULT 0,
  `rule_description` text DEFAULT NULL,
  `has_priority` int(1) NOT NULL DEFAULT 0,
  `priority` varchar(140) DEFAULT NULL,
  `promotional_scheme_id` varchar(140) DEFAULT NULL,
  `promotional_scheme` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `warehouse` (`warehouse`),
  KEY `modified` (`modified`),
  KEY `fk_pr_for_price_list` (`for_price_list`),
  CONSTRAINT `fk_pr_for_price_list` FOREIGN KEY (`for_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPricing Rule Brand
CREATE TABLE IF NOT EXISTS `tabPricing Rule Brand` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `brand` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `brand` (`brand`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPricing Rule Detail
CREATE TABLE IF NOT EXISTS `tabPricing Rule Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `pricing_rule` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `margin_type` varchar(140) DEFAULT NULL,
  `rate_or_discount` varchar(140) DEFAULT NULL,
  `child_docname` varchar(140) DEFAULT NULL,
  `rule_applied` int(1) NOT NULL DEFAULT 1,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPricing Rule Item Code
CREATE TABLE IF NOT EXISTS `tabPricing Rule Item Code` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPricing Rule Item Group
CREATE TABLE IF NOT EXISTS `tabPricing Rule Item Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_group` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_group` (`item_group`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_prig_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrint Format
CREATE TABLE IF NOT EXISTS `tabPrint Format` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `doc_type` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `default_print_language` varchar(140) DEFAULT NULL,
  `standard` varchar(140) DEFAULT 'No',
  `custom_format` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `pdf_generator` varchar(140) DEFAULT 'wkhtmltopdf',
  `print_format_type` varchar(140) DEFAULT 'Jinja',
  `raw_printing` int(1) NOT NULL DEFAULT 0,
  `html` longtext DEFAULT NULL,
  `raw_commands` longtext DEFAULT NULL,
  `margin_top` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `margin_bottom` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `margin_left` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `margin_right` decimal(21,9) NOT NULL DEFAULT 15.000000000,
  `align_labels_right` int(1) NOT NULL DEFAULT 0,
  `show_section_headings` int(1) NOT NULL DEFAULT 0,
  `line_breaks` int(1) NOT NULL DEFAULT 0,
  `absolute_value` int(1) NOT NULL DEFAULT 0,
  `font_size` int(11) NOT NULL DEFAULT 14,
  `font` varchar(140) DEFAULT NULL,
  `page_number` varchar(140) DEFAULT 'Hide',
  `css` longtext DEFAULT NULL,
  `format_data` longtext DEFAULT NULL,
  `print_format_builder` int(1) NOT NULL DEFAULT 0,
  `print_format_builder_beta` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `standard` (`standard`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrint Format Field Template
CREATE TABLE IF NOT EXISTS `tabPrint Format Field Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `field` varchar(140) DEFAULT NULL,
  `template_file` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `standard` int(1) NOT NULL DEFAULT 0,
  `template` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrint Heading
CREATE TABLE IF NOT EXISTS `tabPrint Heading` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `print_heading` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `print_heading` (`print_heading`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPrint Style
CREATE TABLE IF NOT EXISTS `tabPrint Style` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `print_style_name` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `standard` int(1) NOT NULL DEFAULT 0,
  `css` longtext DEFAULT NULL,
  `preview` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `print_style_name` (`print_style_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Deferred Accounting
CREATE TABLE IF NOT EXISTS `tabProcess Deferred Accounting` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Payment Reconciliation
CREATE TABLE IF NOT EXISTS `tabProcess Payment Reconciliation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `receivable_payable_account` varchar(140) DEFAULT NULL,
  `default_advance_account` varchar(140) DEFAULT NULL,
  `from_invoice_date` date DEFAULT NULL,
  `to_invoice_date` date DEFAULT NULL,
  `from_payment_date` date DEFAULT NULL,
  `to_payment_date` date DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `bank_cash_account` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `error_log` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Payment Reconciliation Log
CREATE TABLE IF NOT EXISTS `tabProcess Payment Reconciliation Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `process_pr` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `allocated` int(1) NOT NULL DEFAULT 0,
  `reconciled` int(1) NOT NULL DEFAULT 0,
  `total_allocations` int(11) NOT NULL DEFAULT 0,
  `reconciled_entries` int(11) NOT NULL DEFAULT 0,
  `error_log` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Payment Reconciliation Log Allocations
CREATE TABLE IF NOT EXISTS `tabProcess Payment Reconciliation Log Allocations` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_row` varchar(140) DEFAULT NULL,
  `invoice_type` varchar(140) DEFAULT NULL,
  `invoice_number` varchar(140) DEFAULT NULL,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `unreconciled_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_advance` varchar(140) DEFAULT NULL,
  `difference_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gain_loss_posting_date` date DEFAULT NULL,
  `difference_account` varchar(140) DEFAULT NULL,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `currency` varchar(140) DEFAULT NULL,
  `reconciled` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Statement Of Accounts
CREATE TABLE IF NOT EXISTS `tabProcess Statement Of Accounts` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `report` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `categorize_by` varchar(140) DEFAULT 'Categorize by Voucher (Consolidated)',
  `territory` varchar(140) DEFAULT NULL,
  `ignore_exchange_rate_revaluation_journals` int(1) NOT NULL DEFAULT 0,
  `ignore_cr_dr_notes` int(1) NOT NULL DEFAULT 0,
  `to_date` date DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `sales_person` varchar(140) DEFAULT NULL,
  `show_remarks` int(1) NOT NULL DEFAULT 0,
  `based_on_payment_terms` int(1) NOT NULL DEFAULT 0,
  `customer_collection` varchar(140) DEFAULT NULL,
  `collection_name` varchar(140) DEFAULT NULL,
  `primary_mandatory` int(1) NOT NULL DEFAULT 1,
  `show_net_values_in_party_account` int(1) NOT NULL DEFAULT 0,
  `orientation` varchar(140) DEFAULT NULL,
  `include_break` int(1) NOT NULL DEFAULT 1,
  `include_ageing` int(1) NOT NULL DEFAULT 0,
  `ageing_based_on` varchar(140) DEFAULT 'Due Date',
  `letter_head` varchar(140) DEFAULT NULL,
  `terms_and_conditions` varchar(140) DEFAULT NULL,
  `enable_auto_email` int(1) NOT NULL DEFAULT 0,
  `sender` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT NULL,
  `filter_duration` int(11) NOT NULL DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `pdf_name` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Statement Of Accounts CC
CREATE TABLE IF NOT EXISTS `tabProcess Statement Of Accounts CC` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `cc` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Statement Of Accounts Customer
CREATE TABLE IF NOT EXISTS `tabProcess Statement Of Accounts Customer` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `billing_email` varchar(140) DEFAULT NULL,
  `primary_email` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProcess Subscription
CREATE TABLE IF NOT EXISTS `tabProcess Subscription` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `subscription` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduct Bundle
CREATE TABLE IF NOT EXISTS `tabProduct Bundle` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `new_item_code` varchar(140) DEFAULT NULL,
  `description` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduct Bundle Item
CREATE TABLE IF NOT EXISTS `tabProduct Bundle Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan
CREATE TABLE IF NOT EXISTS `tabProduction Plan` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `get_items_from` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `sales_order_status` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `from_delivery_date` date DEFAULT NULL,
  `to_delivery_date` date DEFAULT NULL,
  `combine_items` int(1) NOT NULL DEFAULT 0,
  `combine_sub_items` int(1) NOT NULL DEFAULT 0,
  `sub_assembly_warehouse` varchar(140) DEFAULT NULL,
  `skip_available_sub_assembly_item` int(1) NOT NULL DEFAULT 0,
  `include_non_stock_items` int(1) NOT NULL DEFAULT 1,
  `include_subcontracted_items` int(1) NOT NULL DEFAULT 1,
  `consider_minimum_order_qty` int(1) NOT NULL DEFAULT 0,
  `include_safety_stock` int(1) NOT NULL DEFAULT 0,
  `ignore_existing_ordered_qty` int(1) NOT NULL DEFAULT 0,
  `for_warehouse` varchar(140) DEFAULT NULL,
  `total_planned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `status` varchar(140) DEFAULT 'Draft',
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  KEY `fk_production_plan_company` (`company`),
  KEY `fk_pp_customer` (`customer`),
  KEY `fk_pp_for_warehouse` (`for_warehouse`),
  CONSTRAINT `fk_pp_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pp_for_warehouse` FOREIGN KEY (`for_warehouse`) REFERENCES `tabWarehouse` (`name`),
  CONSTRAINT `fk_production_plan_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Item
CREATE TABLE IF NOT EXISTS `tabProduction Plan Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `include_exploded_items` int(1) NOT NULL DEFAULT 1,
  `item_code` varchar(140) DEFAULT NULL,
  `bom_no` varchar(140) DEFAULT NULL,
  `planned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `planned_start_date` datetime(6) DEFAULT NULL,
  `pending_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `product_bundle_item` varchar(140) DEFAULT NULL,
  `item_reference` varchar(140) DEFAULT NULL,
  `temporary_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_ppi_warehouse` (`warehouse`),
  CONSTRAINT `fk_ppi_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Item Reference
CREATE TABLE IF NOT EXISTS `tabProduction Plan Item Reference` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_reference` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `qty` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Material Request
CREATE TABLE IF NOT EXISTS `tabProduction Plan Material Request` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Material Request Warehouse
CREATE TABLE IF NOT EXISTS `tabProduction Plan Material Request Warehouse` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `warehouse` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Sales Order
CREATE TABLE IF NOT EXISTS `tabProduction Plan Sales Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_date` date DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProduction Plan Sub Assembly Item
CREATE TABLE IF NOT EXISTS `tabProduction Plan Sub Assembly Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `production_item` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `fg_warehouse` varchar(140) DEFAULT NULL,
  `parent_item_code` varchar(140) DEFAULT NULL,
  `schedule_date` datetime(6) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bom_no` varchar(140) DEFAULT NULL,
  `bom_level` int(11) NOT NULL DEFAULT 0,
  `type_of_manufacturing` varchar(140) DEFAULT 'In House',
  `supplier` varchar(140) DEFAULT NULL,
  `wo_produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `purchase_order` varchar(140) DEFAULT NULL,
  `production_plan_item` varchar(140) DEFAULT NULL,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `indent` int(11) NOT NULL DEFAULT 0,
  `uom` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject
CREATE TABLE IF NOT EXISTS `tabProject` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `project_name` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `project_type` varchar(140) DEFAULT NULL,
  `is_active` varchar(140) DEFAULT NULL,
  `percent_complete_method` varchar(140) DEFAULT 'Task Completion',
  `percent_complete` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `project_template` varchar(140) DEFAULT NULL,
  `expected_start_date` date DEFAULT NULL,
  `expected_end_date` date DEFAULT NULL,
  `priority` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `copied_from` varchar(140) DEFAULT NULL,
  `notes` longtext DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_end_date` date DEFAULT NULL,
  `estimated_costing` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_purchase_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company` varchar(140) DEFAULT NULL,
  `total_sales_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billable_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billed_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_consumed_material_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `gross_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_gross_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `collect_progress` int(1) NOT NULL DEFAULT 0,
  `holiday_list` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT NULL,
  `from_time` time(6) DEFAULT NULL,
  `to_time` time(6) DEFAULT NULL,
  `first_email` time(6) DEFAULT NULL,
  `second_email` time(6) DEFAULT NULL,
  `daily_time_to_send` time(6) DEFAULT NULL,
  `day_to_send` varchar(140) DEFAULT NULL,
  `weekly_time_to_send` time(6) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `project_name` (`project_name`),
  KEY `status` (`status`),
  KEY `customer` (`customer`),
  KEY `collect_progress` (`collect_progress`),
  KEY `modified` (`modified`),
  KEY `fk_project_company` (`company`),
  CONSTRAINT `fk_project_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject Template
CREATE TABLE IF NOT EXISTS `tabProject Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `project_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject Template Task
CREATE TABLE IF NOT EXISTS `tabProject Template Task` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `task` varchar(140) DEFAULT NULL,
  `subject` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject Type
CREATE TABLE IF NOT EXISTS `tabProject Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `project_type` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject Update
CREATE TABLE IF NOT EXISTS `tabProject Update` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `sent` int(1) NOT NULL DEFAULT 0,
  `date` date DEFAULT NULL,
  `time` time(6) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `date` (`date`),
  KEY `modified` (`modified`),
  KEY `fk_project_update_project` (`project`),
  CONSTRAINT `fk_project_update_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProject User
CREATE TABLE IF NOT EXISTS `tabProject User` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `email` varchar(140) DEFAULT NULL,
  `image` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `welcome_email_sent` int(1) NOT NULL DEFAULT 0,
  `view_attachments` int(1) NOT NULL DEFAULT 0,
  `hide_timesheets` int(1) NOT NULL DEFAULT 0,
  `project_status` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPromotional Scheme
CREATE TABLE IF NOT EXISTS `tabPromotional Scheme` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `apply_on` varchar(140) DEFAULT 'Item Code',
  `disable` int(1) NOT NULL DEFAULT 0,
  `mixed_conditions` int(1) NOT NULL DEFAULT 0,
  `is_cumulative` int(1) NOT NULL DEFAULT 0,
  `apply_rule_on_other` varchar(140) DEFAULT NULL,
  `other_item_code` varchar(140) DEFAULT NULL,
  `other_item_group` varchar(140) DEFAULT NULL,
  `other_brand` varchar(140) DEFAULT NULL,
  `selling` int(1) NOT NULL DEFAULT 0,
  `buying` int(1) NOT NULL DEFAULT 0,
  `applicable_for` varchar(140) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_upto` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPromotional Scheme Price Discount
CREATE TABLE IF NOT EXISTS `tabPromotional Scheme Price Discount` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disable` int(1) NOT NULL DEFAULT 0,
  `apply_multiple_pricing_rules` int(1) NOT NULL DEFAULT 0,
  `rule_description` text DEFAULT NULL,
  `min_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `min_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_or_discount` varchar(140) DEFAULT 'Discount Percentage',
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `for_price_list` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `threshold_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `validate_applied_rule` int(1) NOT NULL DEFAULT 0,
  `priority` varchar(140) DEFAULT NULL,
  `apply_discount_on_rate` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_pspd_for_price_list` (`for_price_list`),
  CONSTRAINT `fk_pspd_for_price_list` FOREIGN KEY (`for_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPromotional Scheme Product Discount
CREATE TABLE IF NOT EXISTS `tabPromotional Scheme Product Discount` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disable` int(1) NOT NULL DEFAULT 0,
  `apply_multiple_pricing_rules` int(1) NOT NULL DEFAULT 0,
  `rule_description` text DEFAULT NULL,
  `min_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `min_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `same_item` int(1) NOT NULL DEFAULT 0,
  `free_item` varchar(140) DEFAULT NULL,
  `free_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `free_item_uom` varchar(140) DEFAULT NULL,
  `free_item_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `round_free_qty` int(1) NOT NULL DEFAULT 0,
  `warehouse` varchar(140) DEFAULT NULL,
  `threshold_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `priority` varchar(140) DEFAULT NULL,
  `is_recursive` int(1) NOT NULL DEFAULT 0,
  `recurse_for` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `apply_recursion_over` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProperty Setter
CREATE TABLE IF NOT EXISTS `tabProperty Setter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_system_generated` int(1) NOT NULL DEFAULT 0,
  `doctype_or_field` varchar(140) DEFAULT NULL,
  `doc_type` varchar(140) DEFAULT NULL,
  `field_name` varchar(140) DEFAULT NULL,
  `row_name` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `property` varchar(140) DEFAULT NULL,
  `property_type` varchar(140) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `default_value` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `doc_type` (`doc_type`),
  KEY `field_name` (`field_name`),
  KEY `property` (`property`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProspect
CREATE TABLE IF NOT EXISTS `tabProspect` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company_name` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `no_of_employees` varchar(140) DEFAULT NULL,
  `annual_revenue` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `market_segment` varchar(140) DEFAULT NULL,
  `industry` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `prospect_owner` varchar(140) DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `fax` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `company_name` (`company_name`),
  KEY `modified` (`modified`),
  KEY `fk_prospect_territory` (`territory`),
  CONSTRAINT `fk_prospect_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProspect Lead
CREATE TABLE IF NOT EXISTS `tabProspect Lead` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `lead` varchar(140) DEFAULT NULL,
  `lead_name` varchar(140) DEFAULT NULL,
  `email` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `lead_owner` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabProspect Opportunity
CREATE TABLE IF NOT EXISTS `tabProspect Opportunity` (
  `name` bigint(20) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `opportunity` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stage` varchar(140) DEFAULT NULL,
  `deal_owner` varchar(140) DEFAULT NULL,
  `probability` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expected_closing` date DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPSOA Cost Center
CREATE TABLE IF NOT EXISTS `tabPSOA Cost Center` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `cost_center_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPSOA Project
CREATE TABLE IF NOT EXISTS `tabPSOA Project` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `project_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Invoice
CREATE TABLE IF NOT EXISTS `tabPurchase Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `is_paid` int(1) NOT NULL DEFAULT 0,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `update_outstanding_for_self` int(1) NOT NULL DEFAULT 1,
  `update_billed_amount_in_purchase_order` int(1) NOT NULL DEFAULT 0,
  `update_billed_amount_in_purchase_receipt` int(1) NOT NULL DEFAULT 1,
  `apply_tds` int(1) NOT NULL DEFAULT 0,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `bill_no` varchar(140) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `use_transaction_date_exchange_rate` int(1) NOT NULL DEFAULT 0,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `update_stock` int(1) NOT NULL DEFAULT 0,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `set_from_warehouse` varchar(140) DEFAULT NULL,
  `is_subcontracted` int(1) NOT NULL DEFAULT 0,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `supplier_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `use_company_roundoff_cost_center` int(1) NOT NULL DEFAULT 0,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `total_advance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `base_paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `clearance_date` date DEFAULT NULL,
  `cash_bank_account` varchar(140) DEFAULT NULL,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocate_advances_automatically` int(1) NOT NULL DEFAULT 0,
  `only_include_allocated_payments` int(1) NOT NULL DEFAULT 0,
  `write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `write_off_account` varchar(140) DEFAULT NULL,
  `write_off_cost_center` varchar(140) DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` text DEFAULT NULL,
  `dispatch_address` varchar(140) DEFAULT NULL,
  `dispatch_address_display` longtext DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `ignore_default_payment_terms_template` int(1) NOT NULL DEFAULT 0,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `per_received` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `credit_to` varchar(140) DEFAULT NULL,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT 'No',
  `against_expense_account` text DEFAULT NULL,
  `unrealized_profit_loss_account` varchar(140) DEFAULT NULL,
  `subscription` varchar(140) DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `on_hold` int(1) NOT NULL DEFAULT 0,
  `release_date` date DEFAULT NULL,
  `hold_comment` text DEFAULT NULL,
  `is_internal_supplier` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `supplier_group` varchar(140) DEFAULT NULL,
  `inter_company_invoice_reference` varchar(140) DEFAULT NULL,
  `is_old_subcontracting_flow` int(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `posting_date` (`posting_date`),
  KEY `return_against` (`return_against`),
  KEY `bill_no` (`bill_no`),
  KEY `credit_to` (`credit_to`),
  KEY `release_date` (`release_date`),
  KEY `modified` (`modified`),
  KEY `fk_pi_company` (`company`),
  KEY `fk_pi_owner` (`owner`),
  KEY `fk_pi_modified_by` (`modified_by`),
  KEY `fk_pi_cost_center` (`cost_center`),
  KEY `fk_pi_project` (`project`),
  KEY `fk_pi_buying_price_list` (`buying_price_list`),
  CONSTRAINT `fk_pi_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pi_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_pi_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_pi_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pi_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pi_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pi_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`),
  CONSTRAINT `fk_purchase_invoice_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Invoice Advance
CREATE TABLE IF NOT EXISTS `tabPurchase Invoice Advance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `reference_row` varchar(140) DEFAULT NULL,
  `advance_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `exchange_gain_loss` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ref_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference_posting_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Invoice Item
CREATE TABLE IF NOT EXISTS `tabPurchase Invoice Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `product_bundle` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rejected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `apply_tds` int(1) NOT NULL DEFAULT 1,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sales_incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `landed_cost_voucher_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rm_supp_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `rejected_serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `rejected_serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `wip_composite_asset` varchar(140) DEFAULT NULL,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `asset_location` varchar(140) DEFAULT NULL,
  `asset_category` varchar(140) DEFAULT NULL,
  `deferred_expense_account` varchar(140) DEFAULT NULL,
  `service_stop_date` date DEFAULT NULL,
  `enable_deferred_expense` int(1) NOT NULL DEFAULT 0,
  `service_start_date` date DEFAULT NULL,
  `service_end_date` date DEFAULT NULL,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `item_tax_rate` longtext DEFAULT NULL,
  `bom` varchar(140) DEFAULT NULL,
  `include_exploded_items` int(1) NOT NULL DEFAULT 0,
  `purchase_invoice_item` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `po_detail` varchar(140) DEFAULT NULL,
  `purchase_receipt` varchar(140) DEFAULT NULL,
  `pr_detail` varchar(140) DEFAULT NULL,
  `sales_invoice_item` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `purchase_order` (`purchase_order`),
  KEY `po_detail` (`po_detail`),
  KEY `purchase_receipt` (`purchase_receipt`),
  KEY `pr_detail` (`pr_detail`),
  KEY `material_request` (`material_request`),
  KEY `material_request_item` (`material_request_item`),
  KEY `project` (`project`),
  KEY `parent` (`parent`),
  KEY `fk_pii_cost_center` (`cost_center`),
  KEY `fk_pii_item_group` (`item_group`),
  KEY `fk_pii_warehouse` (`warehouse`),
  KEY `fk_pii_uom` (`uom`),
  KEY `fk_pii_stock_uom` (`stock_uom`),
  KEY `fk_pii_brand` (`brand`),
  CONSTRAINT `fk_pi_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`),
  CONSTRAINT `fk_pi_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_pi_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabPurchase Invoice` (`name`),
  CONSTRAINT `fk_pii_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pii_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_pii_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pii_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pii_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_pii_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_pii_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`),
  CONSTRAINT `fk_purchase_invoice_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabPurchase Invoice` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Order
CREATE TABLE IF NOT EXISTS `tabPurchase Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `order_confirmation_no` varchar(140) DEFAULT NULL,
  `order_confirmation_date` date DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `apply_tds` int(1) NOT NULL DEFAULT 0,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `is_subcontracted` int(1) NOT NULL DEFAULT 0,
  `has_unit_price_items` int(1) NOT NULL DEFAULT 0,
  `supplier_warehouse` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `set_from_warehouse` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `set_reserve_warehouse` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `in_words` varchar(240) DEFAULT NULL,
  `advance_paid` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` text DEFAULT NULL,
  `dispatch_address` varchar(140) DEFAULT NULL,
  `dispatch_address_display` longtext DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `customer_contact_person` varchar(140) DEFAULT NULL,
  `customer_contact_display` text DEFAULT NULL,
  `customer_contact_mobile` text DEFAULT NULL,
  `customer_contact_email` longtext DEFAULT NULL,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `per_billed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_received` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `is_internal_supplier` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `ref_sq` varchar(140) DEFAULT NULL,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `inter_company_order_reference` varchar(140) DEFAULT NULL,
  `is_old_subcontracting_flow` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `transaction_date` (`transaction_date`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  KEY `fk_po_customer` (`customer`),
  KEY `fk_po_company` (`company`),
  KEY `fk_po_owner` (`owner`),
  KEY `fk_po_modified_by` (`modified_by`),
  KEY `fk_po_cost_center` (`cost_center`),
  KEY `fk_po_project` (`project`),
  KEY `fk_po_buying_price_list` (`buying_price_list`),
  KEY `fk_po_tax_template` (`taxes_and_charges`),
  KEY `fk_po_currency` (`currency`),
  CONSTRAINT `fk_po_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_po_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_po_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_po_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_po_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`),
  CONSTRAINT `fk_po_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_po_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_po_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`),
  CONSTRAINT `fk_po_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabPurchase Taxes and Charges Template` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_purchase_order_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Order Item
CREATE TABLE IF NOT EXISTS `tabPurchase Order Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fg_item` varchar(140) DEFAULT NULL,
  `fg_item_qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `item_code` varchar(140) DEFAULT NULL,
  `supplier_part_no` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `product_bundle` varchar(140) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `subcontracted_quantity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `last_purchase_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `apply_tds` int(1) NOT NULL DEFAULT 1,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company_total_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `sales_order_packed_item` varchar(140) DEFAULT NULL,
  `supplier_quotation` varchar(140) DEFAULT NULL,
  `supplier_quotation_item` varchar(140) DEFAULT NULL,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `against_blanket_order` int(1) NOT NULL DEFAULT 0,
  `blanket_order` varchar(140) DEFAULT NULL,
  `blanket_order_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billed_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `expense_account` varchar(140) DEFAULT NULL,
  `wip_composite_asset` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `bom` varchar(140) DEFAULT NULL,
  `include_exploded_items` int(1) NOT NULL DEFAULT 0,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `item_tax_rate` longtext DEFAULT NULL,
  `production_plan` varchar(140) DEFAULT NULL,
  `production_plan_item` varchar(140) DEFAULT NULL,
  `production_plan_sub_assembly_item` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `expected_delivery_date` (`expected_delivery_date`),
  KEY `material_request` (`material_request`),
  KEY `material_request_item` (`material_request_item`),
  KEY `sales_order` (`sales_order`),
  KEY `sales_order_item` (`sales_order_item`),
  KEY `parent` (`parent`),
  KEY `item_code_warehouse_index` (`item_code`,`warehouse`),
  KEY `fk_poi_cost_center` (`cost_center`),
  KEY `fk_poi_item_group` (`item_group`),
  KEY `fk_poi_warehouse` (`warehouse`),
  KEY `fk_poi_project` (`project`),
  KEY `fk_poi_uom` (`uom`),
  KEY `fk_poi_stock_uom` (`stock_uom`),
  KEY `fk_poi_brand` (`brand`),
  CONSTRAINT `fk_po_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabPurchase Order` (`name`),
  CONSTRAINT `fk_po_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_poi_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_poi_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_poi_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_poi_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_poi_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_poi_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_poi_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Order Item Supplied
CREATE TABLE IF NOT EXISTS `tabPurchase Order Item Supplied` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `main_item_code` varchar(140) DEFAULT NULL,
  `rm_item_code` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `reserve_warehouse` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bom_detail_no` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `supplied_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_supplied_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Receipt
CREATE TABLE IF NOT EXISTS `tabPurchase Receipt` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `supplier_delivery_note` varchar(140) DEFAULT NULL,
  `subcontracting_receipt` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `apply_putaway_rule` int(1) NOT NULL DEFAULT 0,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `set_from_warehouse` varchar(140) DEFAULT NULL,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `is_subcontracted` int(1) NOT NULL DEFAULT 0,
  `supplier_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_withholding_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` text DEFAULT NULL,
  `dispatch_address` varchar(140) DEFAULT NULL,
  `dispatch_address_display` longtext DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `per_billed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_returned` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `transporter_name` varchar(140) DEFAULT NULL,
  `lr_no` varchar(140) DEFAULT NULL,
  `lr_date` date DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `is_internal_supplier` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `inter_company_reference` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `range` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `is_old_subcontracting_flow` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `subcontracting_receipt` (`subcontracting_receipt`),
  KEY `posting_date` (`posting_date`),
  KEY `return_against` (`return_against`),
  KEY `status` (`status`),
  KEY `inter_company_reference` (`inter_company_reference`),
  KEY `modified` (`modified`),
  KEY `fk_pr_company` (`company`),
  KEY `fk_pr_cost_center` (`cost_center`),
  KEY `fk_pr_project` (`project`),
  KEY `fk_pr_buying_price_list` (`buying_price_list`),
  KEY `fk_pr_tax_template` (`taxes_and_charges`),
  KEY `fk_pr_currency` (`currency`),
  CONSTRAINT `fk_pr_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pr_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_pr_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_pr_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_pr_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pr_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`),
  CONSTRAINT `fk_pr_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabPurchase Taxes and Charges Template` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Receipt Item
CREATE TABLE IF NOT EXISTS `tabPurchase Receipt Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `product_bundle` varchar(140) DEFAULT NULL,
  `supplier_part_no` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rejected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `retain_sample` int(1) NOT NULL DEFAULT 0,
  `sample_quantity` int(11) NOT NULL DEFAULT 0,
  `received_stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `apply_tds` int(1) NOT NULL DEFAULT 1,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sales_incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rm_supp_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `landed_cost_voucher_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount_difference_with_purchase_invoice` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billed_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `purchase_invoice` varchar(140) DEFAULT NULL,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `return_qty_from_rejected_warehouse` int(1) NOT NULL DEFAULT 0,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `asset_location` varchar(140) DEFAULT NULL,
  `asset_category` varchar(140) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `purchase_invoice_item` varchar(140) DEFAULT NULL,
  `purchase_receipt_item` varchar(140) DEFAULT NULL,
  `delivery_note_item` varchar(140) DEFAULT NULL,
  `putaway_rule` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `rejected_serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `rejected_serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `include_exploded_items` int(1) NOT NULL DEFAULT 0,
  `bom` varchar(140) DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `item_tax_rate` longtext DEFAULT NULL,
  `wip_composite_asset` varchar(140) DEFAULT NULL,
  `provisional_expense_account` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `sales_order` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `subcontracting_receipt_item` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `purchase_order` (`purchase_order`),
  KEY `purchase_order_item` (`purchase_order_item`),
  KEY `purchase_invoice_item` (`purchase_invoice_item`),
  KEY `purchase_receipt_item` (`purchase_receipt_item`),
  KEY `delivery_note_item` (`delivery_note_item`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `sales_order` (`sales_order`),
  KEY `sales_order_item` (`sales_order_item`),
  KEY `subcontracting_receipt_item` (`subcontracting_receipt_item`),
  KEY `parent` (`parent`),
  KEY `fk_pri_cost_center` (`cost_center`),
  KEY `fk_pri_item_group` (`item_group`),
  KEY `fk_pri_warehouse` (`warehouse`),
  KEY `fk_pri_project` (`project`),
  KEY `fk_pri_uom` (`uom`),
  KEY `fk_pri_stock_uom` (`stock_uom`),
  KEY `fk_pri_brand` (`brand`),
  CONSTRAINT `fk_pri_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pri_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_pri_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pri_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_pri_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_pri_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_pri_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Receipt Item Supplied
CREATE TABLE IF NOT EXISTS `tabPurchase Receipt Item Supplied` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `main_item_code` varchar(140) DEFAULT NULL,
  `rm_item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `bom_detail_no` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reference_name` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `batch_no` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Taxes and Charges
CREATE TABLE IF NOT EXISTS `tabPurchase Taxes and Charges` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `category` varchar(140) DEFAULT 'Total',
  `add_deduct_tax` varchar(140) DEFAULT 'Add',
  `charge_type` varchar(140) DEFAULT 'On Net Total',
  `row_id` varchar(140) DEFAULT NULL,
  `included_in_print_rate` int(1) NOT NULL DEFAULT 0,
  `included_in_paid_amount` int(1) NOT NULL DEFAULT 0,
  `account_head` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_tax_withholding_account` int(1) NOT NULL DEFAULT 0,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `account_currency` varchar(140) DEFAULT NULL,
  `tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_amount_after_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_amount_after_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_wise_tax_detail` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPurchase Taxes and Charges Template
CREATE TABLE IF NOT EXISTS `tabPurchase Taxes and Charges Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabPutaway Rule
CREATE TABLE IF NOT EXISTS `tabPutaway Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disable` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 1,
  `company` varchar(140) DEFAULT NULL,
  `capacity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `stock_capacity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Action
CREATE TABLE IF NOT EXISTS `tabQuality Action` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `corrective_preventive` varchar(140) DEFAULT 'Corrective',
  `review` varchar(140) DEFAULT NULL,
  `feedback` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `date` date DEFAULT NULL,
  `goal` varchar(140) DEFAULT NULL,
  `procedure` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Action Resolution
CREATE TABLE IF NOT EXISTS `tabQuality Action Resolution` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `problem` longtext DEFAULT NULL,
  `resolution` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `responsible` varchar(140) DEFAULT NULL,
  `completion_by` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Feedback
CREATE TABLE IF NOT EXISTS `tabQuality Feedback` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `template` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `document_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Feedback Parameter
CREATE TABLE IF NOT EXISTS `tabQuality Feedback Parameter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parameter` varchar(140) DEFAULT NULL,
  `rating` varchar(140) DEFAULT '1',
  `feedback` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Feedback Template
CREATE TABLE IF NOT EXISTS `tabQuality Feedback Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `template` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `template` (`template`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Feedback Template Parameter
CREATE TABLE IF NOT EXISTS `tabQuality Feedback Template Parameter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parameter` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Goal
CREATE TABLE IF NOT EXISTS `tabQuality Goal` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `goal` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT 'None',
  `procedure` varchar(140) DEFAULT NULL,
  `weekday` varchar(140) DEFAULT NULL,
  `date` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `goal` (`goal`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Goal Objective
CREATE TABLE IF NOT EXISTS `tabQuality Goal Objective` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `objective` text DEFAULT NULL,
  `target` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Inspection
CREATE TABLE IF NOT EXISTS `tabQuality Inspection` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Accepted',
  `child_row_reference` varchar(140) DEFAULT NULL,
  `inspection_type` varchar(140) DEFAULT NULL,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_serial_no` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `sample_size` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `bom_no` varchar(140) DEFAULT NULL,
  `quality_inspection_template` varchar(140) DEFAULT NULL,
  `manual_inspection` int(1) NOT NULL DEFAULT 0,
  `inspected_by` varchar(140) DEFAULT 'user',
  `verified_by` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `report_date` (`report_date`),
  KEY `item_code` (`item_code`),
  KEY `modified` (`modified`),
  KEY `fk_quality_inspection_company` (`company`),
  CONSTRAINT `fk_quality_inspection_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_quality_inspection_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Inspection Parameter
CREATE TABLE IF NOT EXISTS `tabQuality Inspection Parameter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parameter` varchar(140) DEFAULT NULL,
  `parameter_group` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `parameter` (`parameter`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Inspection Parameter Group
CREATE TABLE IF NOT EXISTS `tabQuality Inspection Parameter Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `group_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `group_name` (`group_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Inspection Reading
CREATE TABLE IF NOT EXISTS `tabQuality Inspection Reading` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `specification` varchar(140) DEFAULT NULL,
  `parameter_group` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Accepted',
  `value` varchar(140) DEFAULT NULL,
  `numeric` int(1) NOT NULL DEFAULT 1,
  `manual_inspection` int(1) NOT NULL DEFAULT 0,
  `min_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `formula_based_criteria` int(1) NOT NULL DEFAULT 0,
  `acceptance_formula` longtext DEFAULT NULL,
  `reading_value` varchar(140) DEFAULT NULL,
  `reading_1` varchar(140) DEFAULT NULL,
  `reading_2` varchar(140) DEFAULT NULL,
  `reading_3` varchar(140) DEFAULT NULL,
  `reading_4` varchar(140) DEFAULT NULL,
  `reading_5` varchar(140) DEFAULT NULL,
  `reading_6` varchar(140) DEFAULT NULL,
  `reading_7` varchar(140) DEFAULT NULL,
  `reading_8` varchar(140) DEFAULT NULL,
  `reading_9` varchar(140) DEFAULT NULL,
  `reading_10` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Inspection Template
CREATE TABLE IF NOT EXISTS `tabQuality Inspection Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `quality_inspection_template_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `quality_inspection_template_name` (`quality_inspection_template_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Meeting
CREATE TABLE IF NOT EXISTS `tabQuality Meeting` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Open',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Meeting Agenda
CREATE TABLE IF NOT EXISTS `tabQuality Meeting Agenda` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `agenda` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Meeting Minutes
CREATE TABLE IF NOT EXISTS `tabQuality Meeting Minutes` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `document_name` varchar(140) DEFAULT NULL,
  `minute` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Procedure
CREATE TABLE IF NOT EXISTS `tabQuality Procedure` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `quality_procedure_name` varchar(140) DEFAULT NULL,
  `process_owner` varchar(140) DEFAULT NULL,
  `process_owner_full_name` varchar(140) DEFAULT NULL,
  `parent_quality_procedure` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `lft` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `quality_procedure_name` (`quality_procedure_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Procedure Process
CREATE TABLE IF NOT EXISTS `tabQuality Procedure Process` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `process_description` longtext DEFAULT NULL,
  `procedure` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Review
CREATE TABLE IF NOT EXISTS `tabQuality Review` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `goal` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `procedure` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `additional_information` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuality Review Objective
CREATE TABLE IF NOT EXISTS `tabQuality Review Objective` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `objective` text DEFAULT NULL,
  `target` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `review` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuery Parameters
CREATE TABLE IF NOT EXISTS `tabQuery Parameters` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `key` varchar(140) DEFAULT NULL,
  `value` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuotation
CREATE TABLE IF NOT EXISTS `tabQuotation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{customer_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `quotation_to` varchar(140) DEFAULT 'Customer',
  `party_name` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `valid_till` date DEFAULT NULL,
  `order_type` varchar(140) DEFAULT 'Sales',
  `company` varchar(140) DEFAULT NULL,
  `has_unit_price_items` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `in_words` varchar(240) DEFAULT NULL,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `coupon_code` varchar(140) DEFAULT NULL,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `referral_sales_partner` varchar(140) DEFAULT NULL,
  `other_charges_calculation` longtext DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `shipping_address_name` varchar(140) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `company_contact_person` varchar(140) DEFAULT NULL,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `order_lost_reason` text DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `customer_group` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `opportunity` varchar(140) DEFAULT NULL,
  `supplier_quotation` varchar(140) DEFAULT NULL,
  `enq_det` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `party_name` (`party_name`),
  KEY `transaction_date` (`transaction_date`),
  KEY `modified` (`modified`),
  KEY `fk_quotation_territory` (`territory`),
  KEY `fk_quotation_selling_price_list` (`selling_price_list`),
  KEY `fk_q_tax_category` (`tax_category`),
  KEY `fk_q_currency` (`currency`),
  CONSTRAINT `fk_q_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_q_tax_category` FOREIGN KEY (`tax_category`) REFERENCES `tabTax Category` (`name`),
  CONSTRAINT `fk_quotation_selling_price_list` FOREIGN KEY (`selling_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_quotation_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuotation Item
CREATE TABLE IF NOT EXISTS `tabQuotation Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `customer_item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company_total_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `is_alternative` int(1) NOT NULL DEFAULT 0,
  `has_alternative_item` int(1) NOT NULL DEFAULT 0,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gross_profit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `against_blanket_order` int(1) NOT NULL DEFAULT 0,
  `blanket_order` varchar(140) DEFAULT NULL,
  `blanket_order_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `prevdoc_doctype` varchar(140) DEFAULT NULL,
  `prevdoc_docname` varchar(140) DEFAULT NULL,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_rate` longtext DEFAULT NULL,
  `additional_notes` text DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`),
  KEY `fk_qi_item_group` (`item_group`),
  KEY `fk_qi_uom` (`uom`),
  KEY `fk_qi_stock_uom` (`stock_uom`),
  KEY `fk_qi_brand` (`brand`),
  CONSTRAINT `fk_qi_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_qi_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_qi_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_qi_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuotation Lost Reason
CREATE TABLE IF NOT EXISTS `tabQuotation Lost Reason` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `order_lost_reason` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `order_lost_reason` (`order_lost_reason`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabQuotation Lost Reason Detail
CREATE TABLE IF NOT EXISTS `tabQuotation Lost Reason Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `lost_reason` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabReminder
CREATE TABLE IF NOT EXISTS `tabReminder` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `remind_at` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `reminder_doctype` varchar(140) DEFAULT NULL,
  `reminder_docname` varchar(140) DEFAULT NULL,
  `notified` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `remind_at` (`remind_at`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabReport
CREATE TABLE IF NOT EXISTS `tabReport` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `report_name` varchar(140) DEFAULT NULL,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `reference_report` varchar(140) DEFAULT NULL,
  `is_standard` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `report_type` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `add_total_row` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `prepared_report` int(1) NOT NULL DEFAULT 0,
  `add_translate_data` int(1) NOT NULL DEFAULT 0,
  `timeout` int(11) NOT NULL DEFAULT 0,
  `query` longtext DEFAULT NULL,
  `report_script` longtext DEFAULT NULL,
  `javascript` longtext DEFAULT NULL,
  `json` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `report_name` (`report_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabReport Column
CREATE TABLE IF NOT EXISTS `tabReport Column` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT NULL,
  `options` varchar(140) DEFAULT NULL,
  `width` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabReport Filter
CREATE TABLE IF NOT EXISTS `tabReport Filter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `mandatory` int(1) NOT NULL DEFAULT 0,
  `wildcard_filter` int(1) NOT NULL DEFAULT 0,
  `options` text DEFAULT NULL,
  `default` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Accounting Ledger
CREATE TABLE IF NOT EXISTS `tabRepost Accounting Ledger` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `delete_cancelled_entries` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Accounting Ledger Items
CREATE TABLE IF NOT EXISTS `tabRepost Accounting Ledger Items` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_rali_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_rali_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Allowed Types
CREATE TABLE IF NOT EXISTS `tabRepost Allowed Types` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `allowed` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Item Valuation
CREATE TABLE IF NOT EXISTS `tabRepost Item Valuation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `based_on` varchar(140) DEFAULT 'Transaction',
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Queued',
  `company` varchar(140) DEFAULT NULL,
  `allow_negative_stock` int(1) NOT NULL DEFAULT 1,
  `via_landed_cost_voucher` int(1) NOT NULL DEFAULT 0,
  `allow_zero_rate` int(1) NOT NULL DEFAULT 0,
  `recreate_stock_ledgers` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `error_log` longtext DEFAULT NULL,
  `reposting_data_file` text DEFAULT NULL,
  `items_to_be_repost` longtext DEFAULT NULL,
  `distinct_item_and_warehouse` longtext DEFAULT NULL,
  `total_reposting_count` int(11) NOT NULL DEFAULT 0,
  `current_index` int(11) NOT NULL DEFAULT 0,
  `gl_reposting_index` int(11) NOT NULL DEFAULT 0,
  `affected_transactions` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `item_warehouse` (`warehouse`,`item_code`),
  KEY `fk_riv_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_riv_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Payment Ledger
CREATE TABLE IF NOT EXISTS `tabRepost Payment Ledger` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `add_manually` int(1) NOT NULL DEFAULT 0,
  `repost_status` varchar(140) DEFAULT NULL,
  `repost_error_log` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_rpl_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_rpl_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRepost Payment Ledger Items
CREATE TABLE IF NOT EXISTS `tabRepost Payment Ledger Items` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_rpli_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_rpli_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRequest for Quotation
CREATE TABLE IF NOT EXISTS `tabRequest for Quotation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `vendor` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `has_unit_price_items` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `email_template` varchar(140) DEFAULT NULL,
  `send_attached_files` int(1) NOT NULL DEFAULT 1,
  `send_document_print` int(1) NOT NULL DEFAULT 0,
  `message_for_supplier` longtext DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `opportunity` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `company` (`company`),
  KEY `transaction_date` (`transaction_date`),
  KEY `status` (`status`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRequest for Quotation Item
CREATE TABLE IF NOT EXISTS `tabRequest for Quotation Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `supplier_part_no` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `project_name` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `item_name` (`item_name`),
  KEY `parent` (`parent`),
  KEY `fk_rfqi_item_group` (`item_group`),
  KEY `fk_rfqi_brand` (`brand`),
  CONSTRAINT `fk_rfqi_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_rfqi_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRequest for Quotation Supplier
CREATE TABLE IF NOT EXISTS `tabRequest for Quotation Supplier` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `contact` varchar(140) DEFAULT NULL,
  `quote_status` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `send_email` int(1) NOT NULL DEFAULT 1,
  `email_sent` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_rfqs_supplier` (`supplier`),
  CONSTRAINT `fk_rfqs_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabReview Level
CREATE TABLE IF NOT EXISTS `tabReview Level` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `level_name` varchar(140) DEFAULT NULL,
  `role` varchar(140) DEFAULT NULL,
  `review_points` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `level_name` (`level_name`),
  UNIQUE KEY `role` (`role`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRole
CREATE TABLE IF NOT EXISTS `tabRole` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role_name` varchar(140) DEFAULT NULL,
  `home_page` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `is_custom` int(1) NOT NULL DEFAULT 0,
  `desk_access` int(1) NOT NULL DEFAULT 1,
  `two_factor_auth` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRole Profile
CREATE TABLE IF NOT EXISTS `tabRole Profile` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role_profile` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `role_profile` (`role_profile`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRoute History
CREATE TABLE IF NOT EXISTS `tabRoute History` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `route` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabRouting
CREATE TABLE IF NOT EXISTS `tabRouting` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `routing_name` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `routing_name` (`routing_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Invoice
CREATE TABLE IF NOT EXISTS `tabSales Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{customer_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` text DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `company_tax_id` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `is_pos` int(1) NOT NULL DEFAULT 0,
  `pos_profile` varchar(140) DEFAULT NULL,
  `is_consolidated` int(1) NOT NULL DEFAULT 0,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `update_outstanding_for_self` int(1) NOT NULL DEFAULT 1,
  `update_billed_amount_in_sales_order` int(1) NOT NULL DEFAULT 0,
  `update_billed_amount_in_delivery_note` int(1) NOT NULL DEFAULT 1,
  `is_debit_note` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `update_stock` int(1) NOT NULL DEFAULT 0,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `set_target_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` text DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `use_company_roundoff_cost_center` int(1) NOT NULL DEFAULT 0,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` text DEFAULT NULL,
  `total_advance` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outstanding_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on` varchar(15) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_cash_or_non_trade_discount` int(1) NOT NULL DEFAULT 0,
  `additional_discount_account` varchar(140) DEFAULT NULL,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `total_billing_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cash_bank_account` varchar(140) DEFAULT NULL,
  `base_paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `paid_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_change_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `change_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_for_change_amount` varchar(140) DEFAULT NULL,
  `allocate_advances_automatically` int(1) NOT NULL DEFAULT 0,
  `only_include_allocated_payments` int(1) NOT NULL DEFAULT 0,
  `write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_write_off_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `write_off_outstanding_amount_automatically` int(1) NOT NULL DEFAULT 0,
  `write_off_account` varchar(140) DEFAULT NULL,
  `write_off_cost_center` varchar(140) DEFAULT NULL,
  `redeem_loyalty_points` int(1) NOT NULL DEFAULT 0,
  `loyalty_points` int(11) NOT NULL DEFAULT 0,
  `loyalty_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `loyalty_program` varchar(140) DEFAULT NULL,
  `loyalty_redemption_account` varchar(140) DEFAULT NULL,
  `loyalty_redemption_cost_center` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `shipping_address_name` varchar(140) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `dispatch_address_name` varchar(140) DEFAULT NULL,
  `dispatch_address` text DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `company_contact_person` varchar(140) DEFAULT NULL,
  `ignore_default_payment_terms_template` int(1) NOT NULL DEFAULT 0,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `po_no` varchar(140) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `debit_to` varchar(140) DEFAULT NULL,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `is_opening` varchar(4) DEFAULT 'No',
  `unrealized_profit_loss_account` varchar(140) DEFAULT NULL,
  `against_income_account` text DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `amount_eligible_for_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(6) DEFAULT NULL,
  `subscription` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Draft',
  `inter_company_invoice_reference` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `represents_company` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `is_internal_customer` int(1) NOT NULL DEFAULT 0,
  `is_discounted` int(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `posting_date` (`posting_date`),
  KEY `return_against` (`return_against`),
  KEY `project` (`project`),
  KEY `debit_to` (`debit_to`),
  KEY `inter_company_invoice_reference` (`inter_company_invoice_reference`),
  KEY `modified` (`modified`),
  KEY `fk_si_company` (`company`),
  KEY `fk_si_owner` (`owner`),
  KEY `fk_si_modified_by` (`modified_by`),
  KEY `fk_si_cost_center` (`cost_center`),
  KEY `fk_si_territory` (`territory`),
  KEY `fk_si_selling_price_list` (`selling_price_list`),
  KEY `fk_si_tax_template` (`taxes_and_charges`),
  KEY `fk_si_currency` (`currency`),
  CONSTRAINT `fk_sales_invoice_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_si_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_si_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_si_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`),
  CONSTRAINT `fk_si_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_selling_price_list` FOREIGN KEY (`selling_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabSales Taxes and Charges Template` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_si_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Invoice Advance
CREATE TABLE IF NOT EXISTS `tabSales Invoice Advance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `reference_row` varchar(140) DEFAULT NULL,
  `advance_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `exchange_gain_loss` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ref_exchange_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `difference_posting_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Invoice Item
CREATE TABLE IF NOT EXISTS `tabSales Invoice Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `customer_item_code` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `grant_commission` int(1) NOT NULL DEFAULT 0,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `income_account` varchar(140) DEFAULT NULL,
  `is_fixed_asset` int(1) NOT NULL DEFAULT 0,
  `asset` varchar(140) DEFAULT NULL,
  `finance_book` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `discount_account` varchar(140) DEFAULT NULL,
  `deferred_revenue_account` varchar(140) DEFAULT NULL,
  `service_stop_date` date DEFAULT NULL,
  `enable_deferred_revenue` int(1) NOT NULL DEFAULT 0,
  `service_start_date` date DEFAULT NULL,
  `service_end_date` date DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse` varchar(140) DEFAULT NULL,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_rate` text DEFAULT NULL,
  `actual_batch_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company_total_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sales_order` varchar(140) DEFAULT NULL,
  `so_detail` varchar(140) DEFAULT NULL,
  `sales_invoice_item` varchar(140) DEFAULT NULL,
  `delivery_note` varchar(140) DEFAULT NULL,
  `dn_detail` varchar(140) DEFAULT NULL,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pos_invoice` varchar(140) DEFAULT NULL,
  `pos_invoice_item` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `sales_order` (`sales_order`),
  KEY `so_detail` (`so_detail`),
  KEY `delivery_note` (`delivery_note`),
  KEY `dn_detail` (`dn_detail`),
  KEY `pos_invoice` (`pos_invoice`),
  KEY `purchase_order` (`purchase_order`),
  KEY `project` (`project`),
  KEY `parent` (`parent`),
  KEY `fk_sii_cost_center` (`cost_center`),
  KEY `fk_sii_item_group` (`item_group`),
  KEY `fk_sii_warehouse` (`warehouse`),
  KEY `fk_sii_uom` (`uom`),
  KEY `fk_sii_stock_uom` (`stock_uom`),
  KEY `fk_sii_brand` (`brand`),
  CONSTRAINT `fk_sales_invoice_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabSales Invoice` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`),
  CONSTRAINT `fk_si_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabSales Invoice` (`name`),
  CONSTRAINT `fk_si_item_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_si_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sii_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sii_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_sii_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sii_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sii_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sii_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sii_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Invoice Payment
CREATE TABLE IF NOT EXISTS `tabSales Invoice Payment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `default` int(1) NOT NULL DEFAULT 0,
  `mode_of_payment` varchar(140) DEFAULT NULL,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reference_no` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `clearance_date` date DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Invoice Timesheet
CREATE TABLE IF NOT EXISTS `tabSales Invoice Timesheet` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `activity_type` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `from_time` datetime(6) DEFAULT NULL,
  `to_time` datetime(6) DEFAULT NULL,
  `billing_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `time_sheet` varchar(140) DEFAULT NULL,
  `timesheet_detail` varchar(140) DEFAULT NULL,
  `project_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Order
CREATE TABLE IF NOT EXISTS `tabSales Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{customer_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `order_type` varchar(140) DEFAULT 'Sales',
  `transaction_date` date DEFAULT NULL,
  `delivery_date` date DEFAULT NULL,
  `po_no` varchar(140) DEFAULT NULL,
  `po_date` date DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `skip_delivery_note` int(1) NOT NULL DEFAULT 0,
  `has_unit_price_items` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `selling_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `reserve_stock` int(1) NOT NULL DEFAULT 0,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `advance_paid` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `coupon_code` varchar(140) DEFAULT NULL,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `other_charges_calculation` longtext DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_phone` varchar(140) DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `shipping_address_name` varchar(140) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `dispatch_address_name` varchar(140) DEFAULT NULL,
  `dispatch_address` text DEFAULT NULL,
  `company_address` varchar(140) DEFAULT NULL,
  `company_address_display` text DEFAULT NULL,
  `company_contact_person` varchar(140) DEFAULT NULL,
  `payment_terms_template` varchar(140) DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `delivery_status` varchar(140) DEFAULT NULL,
  `per_delivered` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_billed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_picked` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billing_status` varchar(140) DEFAULT NULL,
  `sales_partner` varchar(140) DEFAULT NULL,
  `amount_eligible_for_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_commission` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `loyalty_points` int(11) NOT NULL DEFAULT 0,
  `loyalty_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `is_internal_customer` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `inter_company_order_reference` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `party_account_currency` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `customer` (`customer`),
  KEY `transaction_date` (`transaction_date`),
  KEY `project` (`project`),
  KEY `status` (`status`),
  KEY `inter_company_order_reference` (`inter_company_order_reference`),
  KEY `modified` (`modified`),
  KEY `fk_so_company` (`company`),
  KEY `fk_so_owner` (`owner`),
  KEY `fk_so_modified_by` (`modified_by`),
  KEY `fk_so_cost_center` (`cost_center`),
  KEY `fk_so_territory` (`territory`),
  KEY `fk_so_selling_price_list` (`selling_price_list`),
  KEY `fk_so_tax_template` (`taxes_and_charges`),
  KEY `fk_so_currency` (`currency`),
  CONSTRAINT `fk_sales_order_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_so_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_so_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_so_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_so_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`),
  CONSTRAINT `fk_so_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_so_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_so_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_so_selling_price_list` FOREIGN KEY (`selling_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_so_tax_template` FOREIGN KEY (`taxes_and_charges`) REFERENCES `tabSales Taxes and Charges Template` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_so_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Order Item
CREATE TABLE IF NOT EXISTS `tabSales Order Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `customer_item_code` varchar(140) DEFAULT NULL,
  `ensure_delivery_based_on_produced_serial_no` int(1) NOT NULL DEFAULT 0,
  `is_stock_item` int(1) NOT NULL DEFAULT 0,
  `reserve_stock` int(1) NOT NULL DEFAULT 1,
  `delivery_date` date DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_reserved_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `margin_type` varchar(140) DEFAULT NULL,
  `margin_rate_or_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rate_with_margin` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `stock_uom_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `grant_commission` int(1) NOT NULL DEFAULT 0,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billed_amt` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `gross_profit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delivered_by_supplier` int(1) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse` varchar(140) DEFAULT NULL,
  `prevdoc_docname` varchar(140) DEFAULT NULL,
  `quotation_item` varchar(140) DEFAULT NULL,
  `against_blanket_order` int(1) NOT NULL DEFAULT 0,
  `blanket_order` varchar(140) DEFAULT NULL,
  `blanket_order_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company_total_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bom_no` varchar(140) DEFAULT NULL,
  `projected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ordered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `planned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `production_plan_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `work_order_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `picked_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_notes` text DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `item_tax_rate` longtext DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `prevdoc_docname` (`prevdoc_docname`),
  KEY `purchase_order` (`purchase_order`),
  KEY `project` (`project`),
  KEY `parent` (`parent`),
  KEY `item_code_warehouse_index` (`item_code`,`warehouse`),
  KEY `fk_soi_cost_center` (`cost_center`),
  KEY `fk_soi_item_group` (`item_group`),
  KEY `fk_soi_warehouse` (`warehouse`),
  KEY `fk_soi_uom` (`uom`),
  KEY `fk_soi_stock_uom` (`stock_uom`),
  KEY `fk_soi_brand` (`brand`),
  CONSTRAINT `fk_so_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_so_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabSales Order` (`name`),
  CONSTRAINT `fk_so_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_soi_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_soi_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_soi_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_soi_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_soi_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_soi_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_soi_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Partner
CREATE TABLE IF NOT EXISTS `tabSales Partner` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `partner_name` varchar(140) DEFAULT NULL,
  `partner_type` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `commission_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `show_in_website` int(1) NOT NULL DEFAULT 0,
  `referral_code` varchar(8) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `logo` text DEFAULT NULL,
  `partner_website` varchar(140) DEFAULT NULL,
  `introduction` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `partner_name` (`partner_name`),
  UNIQUE KEY `referral_code` (`referral_code`),
  UNIQUE KEY `route` (`route`),
  KEY `modified` (`modified`),
  KEY `fk_sales_partner_territory` (`territory`),
  CONSTRAINT `fk_sales_partner_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Partner Item
CREATE TABLE IF NOT EXISTS `tabSales Partner Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_partner` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Partner Type
CREATE TABLE IF NOT EXISTS `tabSales Partner Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_partner_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `sales_partner_type` (`sales_partner_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Person
CREATE TABLE IF NOT EXISTS `tabSales Person` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_person_name` varchar(140) DEFAULT NULL,
  `parent_sales_person` varchar(140) DEFAULT NULL,
  `commission_rate` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `employee` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `sales_person_name` (`sales_person_name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Stage
CREATE TABLE IF NOT EXISTS `tabSales Stage` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `stage_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `stage_name` (`stage_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Taxes and Charges
CREATE TABLE IF NOT EXISTS `tabSales Taxes and Charges` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `charge_type` varchar(140) DEFAULT NULL,
  `row_id` varchar(140) DEFAULT NULL,
  `account_head` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `included_in_print_rate` int(1) NOT NULL DEFAULT 0,
  `included_in_paid_amount` int(1) NOT NULL DEFAULT 0,
  `cost_center` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_currency` varchar(140) DEFAULT NULL,
  `tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_amount_after_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_tax_amount_after_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_wise_tax_detail` longtext DEFAULT NULL,
  `dont_recompute_tax` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `account_head` (`account_head`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Taxes and Charges Template
CREATE TABLE IF NOT EXISTS `tabSales Taxes and Charges Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSales Team
CREATE TABLE IF NOT EXISTS `tabSales Team` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sales_person` varchar(140) DEFAULT NULL,
  `contact_no` varchar(140) DEFAULT NULL,
  `allocated_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `commission_rate` varchar(140) DEFAULT NULL,
  `incentives` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `sales_person` (`sales_person`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSalutation
CREATE TABLE IF NOT EXISTS `tabSalutation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `salutation` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `salutation` (`salutation`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabScheduled Job Log
CREATE TABLE IF NOT EXISTS `tabScheduled Job Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `scheduled_job_type` varchar(140) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `debug_log` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabScheduled Job Type
CREATE TABLE IF NOT EXISTS `tabScheduled Job Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `stopped` int(1) NOT NULL DEFAULT 0,
  `method` varchar(140) DEFAULT NULL,
  `server_script` varchar(140) DEFAULT NULL,
  `scheduler_event` varchar(140) DEFAULT NULL,
  `frequency` varchar(140) DEFAULT NULL,
  `cron_format` varchar(140) DEFAULT NULL,
  `create_log` int(1) NOT NULL DEFAULT 0,
  `last_execution` datetime(6) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `server_script` (`server_script`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabScheduler Event
CREATE TABLE IF NOT EXISTS `tabScheduler Event` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `scheduled_against` varchar(140) DEFAULT NULL,
  `method` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSerial and Batch Bundle
CREATE TABLE IF NOT EXISTS `tabSerial and Batch Bundle` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT 'SABB-.########',
  `company` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `has_serial_no` int(1) NOT NULL DEFAULT 0,
  `has_batch_no` int(1) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `type_of_transaction` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_group` varchar(140) DEFAULT NULL,
  `avg_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `voucher_detail_no` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `returned_against` varchar(140) DEFAULT NULL,
  `is_cancelled` int(1) NOT NULL DEFAULT 0,
  `is_rejected` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `company` (`company`),
  KEY `item_code` (`item_code`),
  KEY `warehouse` (`warehouse`),
  KEY `type_of_transaction` (`type_of_transaction`),
  KEY `voucher_no` (`voucher_no`),
  KEY `voucher_detail_no` (`voucher_detail_no`),
  KEY `modified` (`modified`),
  KEY `fk_sbb_item_group` (`item_group`),
  KEY `fk_sbb_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_sbb_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sbb_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_sbb_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSerial and Batch Entry
CREATE TABLE IF NOT EXISTS `tabSerial and Batch Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `serial_no` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outgoing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_value_difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `is_outward` int(1) NOT NULL DEFAULT 0,
  `stock_queue` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `serial_no` (`serial_no`),
  KEY `batch_no` (`batch_no`),
  KEY `warehouse` (`warehouse`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSerial No
CREATE TABLE IF NOT EXISTS `tabSerial No` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `serial_no` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `purchase_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `customer` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `asset` varchar(140) DEFAULT NULL,
  `asset_status` varchar(140) DEFAULT NULL,
  `location` varchar(140) DEFAULT NULL,
  `employee` varchar(140) DEFAULT NULL,
  `warranty_expiry_date` date DEFAULT NULL,
  `amc_expiry_date` date DEFAULT NULL,
  `maintenance_status` varchar(140) DEFAULT NULL,
  `warranty_period` int(11) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `work_order` varchar(140) DEFAULT NULL,
  `purchase_document_no` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `serial_no` (`serial_no`),
  KEY `maintenance_status` (`maintenance_status`),
  KEY `company` (`company`),
  KEY `modified` (`modified`),
  KEY `fk_serial_no_item` (`item_code`),
  KEY `fk_serial_no_customer` (`customer`),
  KEY `fk_sn_item_group` (`item_group`),
  KEY `fk_sn_warehouse` (`warehouse`),
  KEY `fk_sn_brand` (`brand`),
  CONSTRAINT `fk_serial_no_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_serial_no_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_serial_no_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_serial_no_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sn_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sn_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sn_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSeries
CREATE TABLE IF NOT EXISTS `tabSeries` (
  `name` varchar(100) NOT NULL,
  `current` int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabServer Script
CREATE TABLE IF NOT EXISTS `tabServer Script` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `script_type` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `event_frequency` varchar(140) DEFAULT NULL,
  `cron_format` varchar(140) DEFAULT NULL,
  `doctype_event` varchar(140) DEFAULT NULL,
  `api_method` varchar(140) DEFAULT NULL,
  `allow_guest` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `script` longtext DEFAULT NULL,
  `enable_rate_limit` int(1) NOT NULL DEFAULT 0,
  `rate_limit_count` int(11) NOT NULL DEFAULT 5,
  `rate_limit_seconds` int(11) NOT NULL DEFAULT 86400,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_doctype` (`reference_doctype`),
  KEY `module` (`module`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabService Day
CREATE TABLE IF NOT EXISTS `tabService Day` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workday` varchar(140) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabService Level Agreement
CREATE TABLE IF NOT EXISTS `tabService Level Agreement` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `default_priority` varchar(140) DEFAULT NULL,
  `service_level` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `default_service_level_agreement` int(1) NOT NULL DEFAULT 0,
  `entity_type` varchar(140) DEFAULT NULL,
  `entity` varchar(140) DEFAULT NULL,
  `condition` longtext DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `apply_sla_for_resolution` int(1) NOT NULL DEFAULT 1,
  `holiday_list` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabService Level Priority
CREATE TABLE IF NOT EXISTS `tabService Level Priority` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `default_priority` int(1) NOT NULL DEFAULT 0,
  `priority` varchar(140) DEFAULT NULL,
  `response_time` decimal(21,9) DEFAULT NULL,
  `resolution_time` decimal(21,9) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSession Default
CREATE TABLE IF NOT EXISTS `tabSession Default` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSessions
CREATE TABLE IF NOT EXISTS `tabSessions` (
  `user` varchar(255) DEFAULT NULL,
  `sid` varchar(255) DEFAULT NULL,
  `sessiondata` longtext DEFAULT NULL,
  `ipaddress` varchar(16) DEFAULT NULL,
  `lastupdate` datetime(6) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  KEY `sid` (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShare Balance
CREATE TABLE IF NOT EXISTS `tabShare Balance` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `share_type` varchar(140) DEFAULT NULL,
  `from_no` int(11) NOT NULL DEFAULT 0,
  `rate` int(11) NOT NULL DEFAULT 0,
  `no_of_shares` int(11) NOT NULL DEFAULT 0,
  `to_no` int(11) NOT NULL DEFAULT 0,
  `amount` int(11) NOT NULL DEFAULT 0,
  `is_company` int(1) NOT NULL DEFAULT 0,
  `current_state` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShare Transfer
CREATE TABLE IF NOT EXISTS `tabShare Transfer` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `transfer_type` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `from_shareholder` varchar(140) DEFAULT NULL,
  `from_folio_no` varchar(140) DEFAULT NULL,
  `to_shareholder` varchar(140) DEFAULT NULL,
  `to_folio_no` varchar(140) DEFAULT NULL,
  `equity_or_liability_account` varchar(140) DEFAULT NULL,
  `asset_account` varchar(140) DEFAULT NULL,
  `share_type` varchar(140) DEFAULT NULL,
  `from_no` int(11) NOT NULL DEFAULT 0,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `no_of_shares` int(11) NOT NULL DEFAULT 0,
  `to_no` int(11) NOT NULL DEFAULT 0,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `company` varchar(140) DEFAULT NULL,
  `remarks` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShare Type
CREATE TABLE IF NOT EXISTS `tabShare Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShareholder
CREATE TABLE IF NOT EXISTS `tabShareholder` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `folio_no` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `is_company` int(1) NOT NULL DEFAULT 0,
  `contact_list` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `folio_no` (`folio_no`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipment
CREATE TABLE IF NOT EXISTS `tabShipment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `pickup_from_type` varchar(140) DEFAULT 'Company',
  `pickup_company` varchar(140) DEFAULT NULL,
  `pickup_customer` varchar(140) DEFAULT NULL,
  `pickup_supplier` varchar(140) DEFAULT NULL,
  `pickup` varchar(140) DEFAULT NULL,
  `pickup_address_name` varchar(140) DEFAULT NULL,
  `pickup_address` text DEFAULT NULL,
  `pickup_contact_person` varchar(140) DEFAULT NULL,
  `pickup_contact_name` varchar(140) DEFAULT NULL,
  `pickup_contact_email` varchar(140) DEFAULT NULL,
  `pickup_contact` text DEFAULT NULL,
  `delivery_to_type` varchar(140) DEFAULT 'Customer',
  `delivery_company` varchar(140) DEFAULT NULL,
  `delivery_customer` varchar(140) DEFAULT NULL,
  `delivery_supplier` varchar(140) DEFAULT NULL,
  `delivery_to` varchar(140) DEFAULT NULL,
  `delivery_address_name` varchar(140) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `delivery_contact_name` varchar(140) DEFAULT NULL,
  `delivery_contact_email` varchar(140) DEFAULT NULL,
  `delivery_contact` text DEFAULT NULL,
  `parcel_template` varchar(140) DEFAULT NULL,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pallets` varchar(140) DEFAULT 'No',
  `value_of_goods` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pickup_date` date DEFAULT NULL,
  `pickup_from` time(6) DEFAULT '09:00:00.000000',
  `pickup_to` time(6) DEFAULT '17:00:00.000000',
  `shipment_type` varchar(140) DEFAULT 'Goods',
  `pickup_type` varchar(140) DEFAULT 'Pickup',
  `incoterm` varchar(140) DEFAULT NULL,
  `description_of_content` text DEFAULT NULL,
  `service_provider` varchar(140) DEFAULT NULL,
  `shipment_id` varchar(140) DEFAULT NULL,
  `shipment_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `status` varchar(140) DEFAULT NULL,
  `tracking_url` text DEFAULT NULL,
  `carrier` varchar(140) DEFAULT NULL,
  `carrier_service` varchar(140) DEFAULT NULL,
  `awb_number` varchar(140) DEFAULT NULL,
  `tracking_status` varchar(140) DEFAULT NULL,
  `tracking_status_info` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipment Delivery Note
CREATE TABLE IF NOT EXISTS `tabShipment Delivery Note` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `delivery_note` varchar(140) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipment Parcel
CREATE TABLE IF NOT EXISTS `tabShipment Parcel` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `length` int(11) NOT NULL DEFAULT 0,
  `width` int(11) NOT NULL DEFAULT 0,
  `height` int(11) NOT NULL DEFAULT 0,
  `weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `count` int(11) NOT NULL DEFAULT 1,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipment Parcel Template
CREATE TABLE IF NOT EXISTS `tabShipment Parcel Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parcel_template_name` varchar(140) DEFAULT NULL,
  `length` int(11) NOT NULL DEFAULT 0,
  `width` int(11) NOT NULL DEFAULT 0,
  `height` int(11) NOT NULL DEFAULT 0,
  `weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `parcel_template_name` (`parcel_template_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipping Rule
CREATE TABLE IF NOT EXISTS `tabShipping Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `shipping_rule_type` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `calculate_based_on` varchar(140) DEFAULT 'Fixed',
  `shipping_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `label` (`label`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipping Rule Condition
CREATE TABLE IF NOT EXISTS `tabShipping Rule Condition` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `from_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `to_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `shipping_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabShipping Rule Country
CREATE TABLE IF NOT EXISTS `tabShipping Rule Country` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `country` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSingles
CREATE TABLE IF NOT EXISTS `tabSingles` (
  `doctype` varchar(255) DEFAULT NULL,
  `field` varchar(255) DEFAULT NULL,
  `value` longtext DEFAULT NULL,
  KEY `singles_doctype_field_index` (`doctype`,`field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSLA Fulfilled On Status
CREATE TABLE IF NOT EXISTS `tabSLA Fulfilled On Status` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSlack Webhook URL
CREATE TABLE IF NOT EXISTS `tabSlack Webhook URL` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `webhook_name` varchar(140) DEFAULT NULL,
  `webhook_url` varchar(140) DEFAULT NULL,
  `show_document_link` int(1) NOT NULL DEFAULT 1,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `webhook_name` (`webhook_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSMS Log
CREATE TABLE IF NOT EXISTS `tabSMS Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `sender_name` varchar(140) DEFAULT NULL,
  `sent_on` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `no_of_requested_sms` int(11) NOT NULL DEFAULT 0,
  `requested_numbers` longtext DEFAULT NULL,
  `no_of_sent_sms` int(11) NOT NULL DEFAULT 0,
  `sent_to` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSMS Parameter
CREATE TABLE IF NOT EXISTS `tabSMS Parameter` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `parameter` varchar(140) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `header` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSocial Link Settings
CREATE TABLE IF NOT EXISTS `tabSocial Link Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `social_link_type` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `background_color` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSocial Login Key
CREATE TABLE IF NOT EXISTS `tabSocial Login Key` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enable_social_login` int(1) NOT NULL DEFAULT 0,
  `social_login_provider` varchar(140) DEFAULT 'Custom',
  `client_id` varchar(140) DEFAULT NULL,
  `provider_name` varchar(140) DEFAULT NULL,
  `client_secret` text DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `base_url` varchar(140) DEFAULT NULL,
  `sign_ups` varchar(140) DEFAULT NULL,
  `authorize_url` varchar(140) DEFAULT NULL,
  `access_token_url` varchar(140) DEFAULT NULL,
  `redirect_url` varchar(140) DEFAULT NULL,
  `api_endpoint` varchar(140) DEFAULT NULL,
  `custom_base_url` int(1) NOT NULL DEFAULT 0,
  `api_endpoint_args` longtext DEFAULT NULL,
  `auth_url_data` longtext DEFAULT NULL,
  `user_id_property` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSouth Africa VAT Account
CREATE TABLE IF NOT EXISTS `tabSouth Africa VAT Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSouth Africa VAT Settings
CREATE TABLE IF NOT EXISTS `tabSouth Africa VAT Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `company` (`company`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Entry
CREATE TABLE IF NOT EXISTS `tabStock Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `stock_entry_type` varchar(140) DEFAULT NULL,
  `outgoing_stock_entry` varchar(140) DEFAULT NULL,
  `purpose` varchar(140) DEFAULT NULL,
  `add_to_transit` int(1) NOT NULL DEFAULT 0,
  `work_order` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `subcontracting_order` varchar(140) DEFAULT NULL,
  `delivery_note_no` varchar(140) DEFAULT NULL,
  `sales_invoice_no` varchar(140) DEFAULT NULL,
  `pick_list` varchar(140) DEFAULT NULL,
  `purchase_receipt_no` varchar(140) DEFAULT NULL,
  `asset_repair` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `inspection_required` int(1) NOT NULL DEFAULT 0,
  `apply_putaway_rule` int(1) NOT NULL DEFAULT 0,
  `from_bom` int(1) NOT NULL DEFAULT 0,
  `use_multi_level_bom` int(1) NOT NULL DEFAULT 1,
  `bom_no` varchar(140) DEFAULT NULL,
  `fg_completed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `from_warehouse` varchar(140) DEFAULT NULL,
  `source_warehouse_address` varchar(140) DEFAULT NULL,
  `source_address_display` text DEFAULT NULL,
  `to_warehouse` varchar(140) DEFAULT NULL,
  `target_warehouse_address` varchar(140) DEFAULT NULL,
  `target_address_display` text DEFAULT NULL,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `total_outgoing_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_incoming_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `value_difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_additional_costs` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `is_opening` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `per_transferred` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `job_card` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `credit_note` varchar(140) DEFAULT NULL,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `stock_entry_type` (`stock_entry_type`),
  KEY `purpose` (`purpose`),
  KEY `work_order` (`work_order`),
  KEY `delivery_note_no` (`delivery_note_no`),
  KEY `pick_list` (`pick_list`),
  KEY `purchase_receipt_no` (`purchase_receipt_no`),
  KEY `posting_date` (`posting_date`),
  KEY `job_card` (`job_card`),
  KEY `modified` (`modified`),
  KEY `fk_se_supplier` (`supplier`),
  KEY `fk_se_company` (`company`),
  KEY `fk_se_project` (`project`),
  CONSTRAINT `fk_se_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_se_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_se_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_stock_entry_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Entry Detail
CREATE TABLE IF NOT EXISTS `tabStock Entry Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` int(1) NOT NULL DEFAULT 0,
  `s_warehouse` varchar(140) DEFAULT NULL,
  `t_warehouse` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `is_finished_item` int(1) NOT NULL DEFAULT 0,
  `is_scrap_item` int(1) NOT NULL DEFAULT 0,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `subcontracted_item` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transfer_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `retain_sample` int(1) NOT NULL DEFAULT 0,
  `uom` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `sample_quantity` int(11) NOT NULL DEFAULT 0,
  `basic_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `set_basic_rate_manually` int(1) NOT NULL DEFAULT 0,
  `basic_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transferred_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bom_no` varchar(140) DEFAULT NULL,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `original_item` varchar(140) DEFAULT NULL,
  `against_stock_entry` varchar(140) DEFAULT NULL,
  `ste_detail` varchar(140) DEFAULT NULL,
  `po_detail` varchar(140) DEFAULT NULL,
  `sco_rm_detail` varchar(140) DEFAULT NULL,
  `putaway_rule` varchar(140) DEFAULT NULL,
  `reference_purchase_receipt` varchar(140) DEFAULT NULL,
  `job_card_item` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `actual_qty` (`actual_qty`),
  KEY `material_request` (`material_request`),
  KEY `job_card_item` (`job_card_item`),
  KEY `parent` (`parent`),
  KEY `fk_sed_t_warehouse` (`t_warehouse`),
  KEY `fk_sed_cost_center` (`cost_center`),
  KEY `fk_sed_item_group` (`item_group`),
  KEY `fk_sed_s_warehouse` (`s_warehouse`),
  KEY `fk_sed_project` (`project`),
  KEY `fk_sed_uom` (`uom`),
  KEY `fk_sed_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_sed_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`),
  CONSTRAINT `fk_sed_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_sed_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sed_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sed_s_warehouse` FOREIGN KEY (`s_warehouse`) REFERENCES `tabWarehouse` (`name`),
  CONSTRAINT `fk_sed_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sed_t_warehouse` FOREIGN KEY (`t_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sed_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sed_warehouse` FOREIGN KEY (`s_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_stock_entry_detail_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_entry_detail_parent` FOREIGN KEY (`parent`) REFERENCES `tabStock Entry` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`),
  CONSTRAINT `fk_stock_warehouse` FOREIGN KEY (`s_warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Entry Type
CREATE TABLE IF NOT EXISTS `tabStock Entry Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `purpose` varchar(140) DEFAULT 'Material Issue',
  `add_to_transit` int(1) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Ledger Entry
CREATE TABLE IF NOT EXISTS `tabStock Ledger Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `posting_datetime` datetime(6) DEFAULT NULL,
  `is_adjustment_entry` int(1) NOT NULL DEFAULT 0,
  `auto_created_serial_and_batch_bundle` int(1) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `voucher_detail_no` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `dependant_sle_voucher_detail_no` varchar(140) DEFAULT NULL,
  `recalculate_rate` int(1) NOT NULL DEFAULT 0,
  `actual_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty_after_transaction` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `incoming_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `outgoing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_value_difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_queue` longtext DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `has_batch_no` int(1) NOT NULL DEFAULT 0,
  `has_serial_no` int(1) NOT NULL DEFAULT 0,
  `is_cancelled` int(1) NOT NULL DEFAULT 0,
  `to_rename` int(1) NOT NULL DEFAULT 1,
  `serial_no` longtext DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `posting_datetime` (`posting_datetime`),
  KEY `voucher_type` (`voucher_type`),
  KEY `voucher_detail_no` (`voucher_detail_no`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `to_rename` (`to_rename`),
  KEY `modified` (`modified`),
  KEY `voucher_no_voucher_type_index` (`voucher_no`,`voucher_type`),
  KEY `batch_no_item_code_warehouse_index` (`batch_no`,`item_code`,`warehouse`),
  KEY `item_code_warehouse_posting_datetime_creation_index` (`item_code`,`warehouse`,`posting_datetime`,`creation`),
  KEY `fk_sle_company` (`company`),
  KEY `fk_sle_warehouse` (`warehouse`),
  KEY `fk_sle_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_sle_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_sle_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_sle_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sle_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_sle_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Reconciliation
CREATE TABLE IF NOT EXISTS `tabStock Reconciliation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `purpose` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `scan_barcode` varchar(140) DEFAULT NULL,
  `scan_mode` int(1) NOT NULL DEFAULT 0,
  `expense_account` varchar(140) DEFAULT NULL,
  `difference_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_stock_reco_cost_center` (`cost_center`),
  KEY `fk_sr_company` (`company`),
  CONSTRAINT `fk_sr_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_stock_reco_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_reco_cost_center` FOREIGN KEY (`cost_center`) REFERENCES `tabCost Center` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Reconciliation Item
CREATE TABLE IF NOT EXISTS `tabStock Reconciliation Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `barcode` varchar(140) DEFAULT NULL,
  `has_item_scanned` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `allow_zero_valuation_rate` int(1) NOT NULL DEFAULT 0,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `reconcile_all_serial_batch` int(1) NOT NULL DEFAULT 0,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `current_serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` longtext DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `current_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_valuation_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_serial_no` longtext DEFAULT NULL,
  `quantity_difference` varchar(140) DEFAULT NULL,
  `amount_difference` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `serial_and_batch_bundle` (`serial_and_batch_bundle`),
  KEY `batch_no` (`batch_no`),
  KEY `parent` (`parent`),
  KEY `fk_sri_item` (`item_code`),
  KEY `fk_sri_warehouse` (`warehouse`),
  KEY `fk_sri_item_group` (`item_group`),
  CONSTRAINT `fk_sri_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_sri_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sri_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_reco_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_reco_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabStock Reconciliation` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_stock_reco_item_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabStock Reservation Entry
CREATE TABLE IF NOT EXISTS `tabStock Reservation Entry` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `has_serial_no` int(1) NOT NULL DEFAULT 0,
  `has_batch_no` int(1) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `voucher_detail_no` varchar(140) DEFAULT NULL,
  `from_voucher_type` varchar(140) DEFAULT NULL,
  `from_voucher_no` varchar(140) DEFAULT NULL,
  `from_voucher_detail_no` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `available_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `voucher_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reserved_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `delivered_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `reservation_based_on` varchar(140) DEFAULT 'Qty',
  `company` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `warehouse` (`warehouse`),
  KEY `voucher_no` (`voucher_no`),
  KEY `voucher_detail_no` (`voucher_detail_no`),
  KEY `from_voucher_no` (`from_voucher_no`),
  KEY `company` (`company`),
  KEY `project` (`project`),
  KEY `modified` (`modified`),
  KEY `fk_sre_voucher_type` (`voucher_type`),
  KEY `fk_sre_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_sre_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sre_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`),
  CONSTRAINT `fk_sre_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSub Operation
CREATE TABLE IF NOT EXISTS `tabSub Operation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `operation` varchar(140) DEFAULT NULL,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting BOM
CREATE TABLE IF NOT EXISTS `tabSubcontracting BOM` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_active` int(1) NOT NULL DEFAULT 1,
  `finished_good` varchar(140) DEFAULT NULL,
  `finished_good_qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `finished_good_uom` varchar(140) DEFAULT NULL,
  `finished_good_bom` varchar(140) DEFAULT NULL,
  `service_item` varchar(140) DEFAULT NULL,
  `service_item_qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `service_item_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `finished_good` (`finished_good`),
  KEY `finished_good_bom` (`finished_good_bom`),
  KEY `service_item` (`service_item`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Order
CREATE TABLE IF NOT EXISTS `tabSubcontracting Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `purchase_order` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `supplier_warehouse` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `set_reserve_warehouse` varchar(140) DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` text DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `distribute_additional_costs_based_on` varchar(140) DEFAULT 'Qty',
  `total_additional_costs` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `status` varchar(140) DEFAULT 'Draft',
  `per_received` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `transaction_date` (`transaction_date`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_sco_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Order Item
CREATE TABLE IF NOT EXISTS `tabSubcontracting Order Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `bom` varchar(140) DEFAULT NULL,
  `include_exploded_items` int(1) NOT NULL DEFAULT 0,
  `schedule_date` date DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rm_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `service_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `subcontracting_conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `job_card` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `expected_delivery_date` (`expected_delivery_date`),
  KEY `material_request` (`material_request`),
  KEY `material_request_item` (`material_request_item`),
  KEY `purchase_order_item` (`purchase_order_item`),
  KEY `parent` (`parent`),
  KEY `fk_soi_sub_warehouse` (`warehouse`),
  CONSTRAINT `fk_soi_sub_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Order Service Item
CREATE TABLE IF NOT EXISTS `tabSubcontracting Order Service Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `fg_item` varchar(140) DEFAULT NULL,
  `fg_item_qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `purchase_order_item` (`purchase_order_item`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Order Supplied Item
CREATE TABLE IF NOT EXISTS `tabSubcontracting Order Supplied Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `main_item_code` varchar(140) DEFAULT NULL,
  `rm_item_code` varchar(140) DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `reserve_warehouse` varchar(140) DEFAULT NULL,
  `bom_detail_no` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `supplied_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_supplied_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Receipt
CREATE TABLE IF NOT EXISTS `tabSubcontracting Receipt` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `supplier_delivery_note` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `posting_time` time(6) DEFAULT NULL,
  `set_posting_time` int(1) NOT NULL DEFAULT 0,
  `is_return` int(1) NOT NULL DEFAULT 0,
  `return_against` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `set_warehouse` varchar(140) DEFAULT NULL,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `supplier_warehouse` varchar(140) DEFAULT NULL,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `bill_no` varchar(140) DEFAULT NULL,
  `bill_date` date DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` text DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `distribute_additional_costs_based_on` varchar(140) DEFAULT 'Qty',
  `total_additional_costs` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amended_from` varchar(140) DEFAULT NULL,
  `range` varchar(140) DEFAULT NULL,
  `represents_company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `per_returned` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `transporter_name` varchar(140) DEFAULT NULL,
  `lr_no` varchar(140) DEFAULT NULL,
  `lr_date` date DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `posting_date` (`posting_date`),
  KEY `status` (`status`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_scr_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Receipt Item
CREATE TABLE IF NOT EXISTS `tabSubcontracting Receipt Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `is_scrap_item` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `received_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rejected_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rm_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `service_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `scrap_cost_per_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rm_supp_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warehouse` varchar(140) DEFAULT NULL,
  `subcontracting_order` varchar(140) DEFAULT NULL,
  `subcontracting_order_item` varchar(140) DEFAULT NULL,
  `subcontracting_receipt_item` varchar(140) DEFAULT NULL,
  `rejected_warehouse` varchar(140) DEFAULT NULL,
  `bom` varchar(140) DEFAULT NULL,
  `include_exploded_items` int(1) NOT NULL DEFAULT 0,
  `quality_inspection` varchar(140) DEFAULT NULL,
  `schedule_date` date DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `rejected_serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `rejected_serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `purchase_order` varchar(140) DEFAULT NULL,
  `purchase_order_item` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `subcontracting_order` (`subcontracting_order`),
  KEY `subcontracting_order_item` (`subcontracting_order_item`),
  KEY `purchase_order` (`purchase_order`),
  KEY `purchase_order_item` (`purchase_order_item`),
  KEY `parent` (`parent`),
  KEY `fk_sri_sub_warehouse` (`warehouse`),
  KEY `fk_sri_brand` (`brand`),
  CONSTRAINT `fk_sri_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sri_sub_warehouse` FOREIGN KEY (`warehouse`) REFERENCES `tabWarehouse` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubcontracting Receipt Supplied Item
CREATE TABLE IF NOT EXISTS `tabSubcontracting Receipt Supplied Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `main_item_code` varchar(140) DEFAULT NULL,
  `rm_item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `bom_detail_no` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `reference_name` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `available_qty_for_consumption` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `current_stock` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `serial_and_batch_bundle` varchar(140) DEFAULT NULL,
  `use_serial_batch_fields` int(1) NOT NULL DEFAULT 0,
  `subcontracting_order` varchar(140) DEFAULT NULL,
  `serial_no` text DEFAULT NULL,
  `batch_no` varchar(140) DEFAULT NULL,
  `expense_account` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubmission Queue
CREATE TABLE IF NOT EXISTS `tabSubmission Queue` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `job_id` varchar(140) DEFAULT NULL,
  `ended_at` datetime(6) DEFAULT NULL,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `ref_docname` varchar(140) DEFAULT NULL,
  `exception` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `ref_docname` (`ref_docname`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubscription
CREATE TABLE IF NOT EXISTS `tabSubscription` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `cancelation_date` date DEFAULT NULL,
  `trial_period_start` date DEFAULT NULL,
  `trial_period_end` date DEFAULT NULL,
  `follow_calendar_months` int(1) NOT NULL DEFAULT 0,
  `generate_new_invoices_past_due_date` int(1) NOT NULL DEFAULT 0,
  `submit_invoice` int(1) NOT NULL DEFAULT 1,
  `current_invoice_start` date DEFAULT NULL,
  `current_invoice_end` date DEFAULT NULL,
  `days_until_due` int(11) NOT NULL DEFAULT 0,
  `generate_invoice_at` varchar(140) DEFAULT 'End of the current subscription period',
  `number_of_days` int(11) NOT NULL DEFAULT 0,
  `cancel_at_period_end` int(1) NOT NULL DEFAULT 0,
  `sales_tax_template` varchar(140) DEFAULT NULL,
  `purchase_tax_template` varchar(140) DEFAULT NULL,
  `apply_additional_discount` varchar(140) DEFAULT NULL,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubscription Invoice
CREATE TABLE IF NOT EXISTS `tabSubscription Invoice` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `invoice` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubscription Plan
CREATE TABLE IF NOT EXISTS `tabSubscription Plan` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `plan_name` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `item` varchar(140) DEFAULT NULL,
  `price_determination` varchar(140) DEFAULT NULL,
  `cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list` varchar(140) DEFAULT NULL,
  `billing_interval` varchar(140) DEFAULT 'Day',
  `billing_interval_count` int(11) NOT NULL DEFAULT 1,
  `product_price_id` varchar(140) DEFAULT NULL,
  `payment_gateway` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `plan_name` (`plan_name`),
  KEY `modified` (`modified`),
  KEY `fk_sp_price_list` (`price_list`),
  CONSTRAINT `fk_sp_price_list` FOREIGN KEY (`price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSubscription Plan Detail
CREATE TABLE IF NOT EXISTS `tabSubscription Plan Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `plan` varchar(140) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSuccess Action
CREATE TABLE IF NOT EXISTS `tabSuccess Action` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `first_success_message` varchar(140) DEFAULT 'Congratulations on first creations',
  `message` varchar(140) DEFAULT 'Successfully created',
  `next_actions` varchar(140) DEFAULT NULL,
  `action_timeout` int(11) NOT NULL DEFAULT 7,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `ref_doctype` (`ref_doctype`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier
CREATE TABLE IF NOT EXISTS `tabSupplier` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `country` varchar(140) DEFAULT NULL,
  `supplier_group` varchar(140) DEFAULT NULL,
  `supplier_type` varchar(140) DEFAULT 'Company',
  `is_transporter` int(1) NOT NULL DEFAULT 0,
  `image` text DEFAULT NULL,
  `default_currency` varchar(140) DEFAULT NULL,
  `default_bank_account` varchar(140) DEFAULT NULL,
  `default_price_list` varchar(140) DEFAULT NULL,
  `is_internal_supplier` int(1) NOT NULL DEFAULT 0,
  `represents_company` varchar(140) DEFAULT NULL,
  `supplier_details` text DEFAULT NULL,
  `website` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `tax_id` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `tax_withholding_category` varchar(140) DEFAULT NULL,
  `supplier_primary_address` varchar(140) DEFAULT NULL,
  `primary_address` text DEFAULT NULL,
  `supplier_primary_contact` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `payment_terms` varchar(140) DEFAULT NULL,
  `allow_purchase_invoice_creation_without_purchase_order` int(1) NOT NULL DEFAULT 0,
  `allow_purchase_invoice_creation_without_purchase_receipt` int(1) NOT NULL DEFAULT 0,
  `is_frozen` int(1) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `warn_rfqs` int(1) NOT NULL DEFAULT 0,
  `warn_pos` int(1) NOT NULL DEFAULT 0,
  `prevent_rfqs` int(1) NOT NULL DEFAULT 0,
  `prevent_pos` int(1) NOT NULL DEFAULT 0,
  `on_hold` int(1) NOT NULL DEFAULT 0,
  `hold_type` varchar(140) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_supplier_owner` (`owner`),
  KEY `fk_supplier_modified_by` (`modified_by`),
  KEY `fk_supplier_default_price_list` (`default_price_list`),
  KEY `fk_supplier_tax_withholding_category` (`tax_withholding_category`),
  CONSTRAINT `fk_supplier_default_price_list` FOREIGN KEY (`default_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_supplier_modified_by` FOREIGN KEY (`modified_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_supplier_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_supplier_tax_withholding_category` FOREIGN KEY (`tax_withholding_category`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Group
CREATE TABLE IF NOT EXISTS `tabSupplier Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier_group_name` varchar(140) DEFAULT NULL,
  `parent_supplier_group` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `payment_terms` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `supplier_group_name` (`supplier_group_name`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Group Item
CREATE TABLE IF NOT EXISTS `tabSupplier Group Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_sgi_supplier_group` (`supplier_group`),
  CONSTRAINT `fk_sgi_supplier_group` FOREIGN KEY (`supplier_group`) REFERENCES `tabSupplier Group` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Item
CREATE TABLE IF NOT EXISTS `tabSupplier Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_si_supplier` (`supplier`),
  CONSTRAINT `fk_si_parent` FOREIGN KEY (`parent`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_si_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Quotation
CREATE TABLE IF NOT EXISTS `tabSupplier Quotation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{supplier_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_name` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `valid_till` date DEFAULT NULL,
  `quotation_number` varchar(140) DEFAULT NULL,
  `has_unit_price_items` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `buying_price_list` varchar(140) DEFAULT NULL,
  `price_list_currency` varchar(140) DEFAULT NULL,
  `plc_conversion_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `ignore_pricing_rule` int(1) NOT NULL DEFAULT 0,
  `total_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_net_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `tax_category` varchar(140) DEFAULT NULL,
  `taxes_and_charges` varchar(140) DEFAULT NULL,
  `shipping_rule` varchar(140) DEFAULT NULL,
  `incoterm` varchar(140) DEFAULT NULL,
  `named_place` varchar(140) DEFAULT NULL,
  `base_taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_added` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `taxes_and_charges_deducted` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_taxes_and_charges` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `apply_discount_on` varchar(140) DEFAULT 'Grand Total',
  `base_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_in_words` varchar(240) DEFAULT NULL,
  `grand_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounding_adjustment` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rounded_total` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `in_words` varchar(240) DEFAULT NULL,
  `disable_rounded_total` int(1) NOT NULL DEFAULT 0,
  `other_charges_calculation` longtext DEFAULT NULL,
  `supplier_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` text DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `shipping_address` varchar(140) DEFAULT NULL,
  `shipping_address_display` text DEFAULT NULL,
  `billing_address` varchar(140) DEFAULT NULL,
  `billing_address_display` text DEFAULT NULL,
  `tc_name` varchar(140) DEFAULT NULL,
  `terms` longtext DEFAULT NULL,
  `letter_head` varchar(140) DEFAULT NULL,
  `group_same_items` int(1) NOT NULL DEFAULT 0,
  `select_print_heading` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `auto_repeat` varchar(140) DEFAULT NULL,
  `is_subcontracted` int(1) NOT NULL DEFAULT 0,
  `opportunity` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `supplier` (`supplier`),
  KEY `company` (`company`),
  KEY `status` (`status`),
  KEY `transaction_date` (`transaction_date`),
  KEY `modified` (`modified`),
  KEY `fk_sq_buying_price_list` (`buying_price_list`),
  KEY `fk_sq_currency` (`currency`),
  CONSTRAINT `fk_sq_buying_price_list` FOREIGN KEY (`buying_price_list`) REFERENCES `tabPrice List` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sq_currency` FOREIGN KEY (`currency`) REFERENCES `tabCurrency` (`name`),
  CONSTRAINT `fk_sq_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Quotation Item
CREATE TABLE IF NOT EXISTS `tabSupplier Quotation Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_code` varchar(140) DEFAULT NULL,
  `supplier_part_no` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `lead_time_days` int(11) NOT NULL DEFAULT 0,
  `expected_delivery_date` date DEFAULT NULL,
  `is_free_item` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `brand` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_percentage` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distributed_discount_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_price_list_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `item_tax_template` varchar(140) DEFAULT NULL,
  `base_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `pricing_rules` text DEFAULT NULL,
  `net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_net_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_per_unit` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight_uom` varchar(140) DEFAULT NULL,
  `warehouse` varchar(140) DEFAULT NULL,
  `prevdoc_doctype` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `request_for_quotation` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `request_for_quotation_item` varchar(140) DEFAULT NULL,
  `item_tax_rate` longtext DEFAULT NULL,
  `manufacturer` varchar(140) DEFAULT NULL,
  `manufacturer_part_no` varchar(140) DEFAULT NULL,
  `cost_center` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `page_break` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `item_name` (`item_name`),
  KEY `material_request` (`material_request`),
  KEY `sales_order` (`sales_order`),
  KEY `material_request_item` (`material_request_item`),
  KEY `parent` (`parent`),
  KEY `fk_sqi_item_group` (`item_group`),
  KEY `fk_sqi_uom` (`uom`),
  KEY `fk_sqi_stock_uom` (`stock_uom`),
  KEY `fk_sqi_brand` (`brand`),
  CONSTRAINT `fk_sqi_brand` FOREIGN KEY (`brand`) REFERENCES `tabBrand` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sqi_item_group` FOREIGN KEY (`item_group`) REFERENCES `tabItem Group` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_sqi_parent` FOREIGN KEY (`parent`) REFERENCES `tabSupplier Quotation` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_sqi_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_sqi_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `supplier_score` varchar(140) DEFAULT NULL,
  `indicator_color` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `period` varchar(140) DEFAULT 'Per Month',
  `weighting_function` text DEFAULT '{total_score} * max( 0, min ( 1 , (12 - {period_number}) / 12) )',
  `warn_rfqs` int(1) NOT NULL DEFAULT 0,
  `warn_pos` int(1) NOT NULL DEFAULT 0,
  `prevent_rfqs` int(1) NOT NULL DEFAULT 0,
  `prevent_pos` int(1) NOT NULL DEFAULT 0,
  `notify_supplier` int(1) NOT NULL DEFAULT 0,
  `notify_employee` int(1) NOT NULL DEFAULT 0,
  `employee` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ss_supplier` (`supplier`),
  CONSTRAINT `fk_ss_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Criteria
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Criteria` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `criteria_name` varchar(140) DEFAULT NULL,
  `max_score` decimal(21,9) NOT NULL DEFAULT 100.000000000,
  `formula` text DEFAULT NULL,
  `weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `criteria_name` (`criteria_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Period
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Period` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `supplier` varchar(140) DEFAULT NULL,
  `naming_series` varchar(140) DEFAULT NULL,
  `total_score` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `scorecard` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ssp_supplier` (`supplier`),
  KEY `fk_ssp_scorecard` (`scorecard`),
  CONSTRAINT `fk_ssp_scorecard` FOREIGN KEY (`scorecard`) REFERENCES `tabSupplier Scorecard` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_ssp_supplier` FOREIGN KEY (`supplier`) REFERENCES `tabSupplier` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Scoring Criteria
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Scoring Criteria` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `criteria_name` varchar(140) DEFAULT NULL,
  `score` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_score` decimal(21,9) NOT NULL DEFAULT 100.000000000,
  `formula` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_sssc_parent` FOREIGN KEY (`parent`) REFERENCES `tabSupplier Scorecard Period` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Scoring Standing
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Scoring Standing` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `standing_name` varchar(140) DEFAULT NULL,
  `standing_color` varchar(140) DEFAULT NULL,
  `min_grade` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_grade` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warn_rfqs` int(1) NOT NULL DEFAULT 0,
  `warn_pos` int(1) NOT NULL DEFAULT 0,
  `prevent_rfqs` int(1) NOT NULL DEFAULT 0,
  `prevent_pos` int(1) NOT NULL DEFAULT 0,
  `notify_supplier` int(1) NOT NULL DEFAULT 0,
  `notify_employee` int(1) NOT NULL DEFAULT 0,
  `employee_link` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_ssss_parent` FOREIGN KEY (`parent`) REFERENCES `tabSupplier Scorecard Period` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Scoring Variable
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Scoring Variable` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `variable_label` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `param_name` varchar(140) DEFAULT NULL,
  `path` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_sssv_parent` FOREIGN KEY (`parent`) REFERENCES `tabSupplier Scorecard Period` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Standing
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Standing` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `standing_name` varchar(140) DEFAULT NULL,
  `standing_color` varchar(140) DEFAULT NULL,
  `min_grade` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `max_grade` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `warn_rfqs` int(1) NOT NULL DEFAULT 0,
  `warn_pos` int(1) NOT NULL DEFAULT 0,
  `prevent_rfqs` int(1) NOT NULL DEFAULT 0,
  `prevent_pos` int(1) NOT NULL DEFAULT 0,
  `notify_supplier` int(1) NOT NULL DEFAULT 0,
  `notify_employee` int(1) NOT NULL DEFAULT 0,
  `employee_link` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `standing_name` (`standing_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupplier Scorecard Variable
CREATE TABLE IF NOT EXISTS `tabSupplier Scorecard Variable` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `variable_label` varchar(140) DEFAULT NULL,
  `is_custom` int(1) NOT NULL DEFAULT 0,
  `param_name` varchar(140) DEFAULT NULL,
  `path` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `variable_label` (`variable_label`),
  UNIQUE KEY `param_name` (`param_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabSupport Search Source
CREATE TABLE IF NOT EXISTS `tabSupport Search Source` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `source_name` varchar(140) DEFAULT NULL,
  `source_type` varchar(140) DEFAULT NULL,
  `base_url` varchar(140) DEFAULT NULL,
  `query_route` varchar(140) DEFAULT NULL,
  `search_term_param_name` varchar(140) DEFAULT NULL,
  `response_result_key_path` varchar(140) DEFAULT NULL,
  `post_route` varchar(140) DEFAULT NULL,
  `post_route_key_list` varchar(140) DEFAULT NULL,
  `post_title_key` varchar(140) DEFAULT NULL,
  `post_description_key` varchar(140) DEFAULT NULL,
  `source_doctype` varchar(140) DEFAULT NULL,
  `result_title_field` varchar(140) DEFAULT NULL,
  `result_preview_field` varchar(140) DEFAULT NULL,
  `result_route_field` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTag
CREATE TABLE IF NOT EXISTS `tabTag` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTag Link
CREATE TABLE IF NOT EXISTS `tabTag Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `document_name` varchar(140) DEFAULT NULL,
  `tag` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `document_type_document_name_index` (`document_type`,`document_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTarget Detail
CREATE TABLE IF NOT EXISTS `tabTarget Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_group` varchar(140) DEFAULT NULL,
  `fiscal_year` varchar(140) DEFAULT NULL,
  `target_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `target_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `distribution_id` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_group` (`item_group`),
  KEY `fiscal_year` (`fiscal_year`),
  KEY `target_amount` (`target_amount`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTask
CREATE TABLE IF NOT EXISTS `tabTask` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `subject` varchar(140) DEFAULT NULL,
  `project` varchar(140) DEFAULT NULL,
  `issue` varchar(140) DEFAULT NULL,
  `type` varchar(140) DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `is_template` int(1) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `priority` varchar(140) DEFAULT NULL,
  `task_weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent_task` varchar(140) DEFAULT NULL,
  `completed_by` varchar(140) DEFAULT NULL,
  `completed_on` date DEFAULT NULL,
  `exp_start_date` date DEFAULT NULL,
  `expected_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `start` int(11) NOT NULL DEFAULT 0,
  `exp_end_date` date DEFAULT NULL,
  `progress` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `duration` int(11) NOT NULL DEFAULT 0,
  `is_milestone` int(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `depends_on_tasks` longtext DEFAULT NULL,
  `act_start_date` date DEFAULT NULL,
  `actual_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `act_end_date` date DEFAULT NULL,
  `total_costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `review_date` date DEFAULT NULL,
  `closing_date` date DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `template_task` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `subject` (`subject`),
  KEY `project` (`project`),
  KEY `priority` (`priority`),
  KEY `parent_task` (`parent_task`),
  KEY `exp_end_date` (`exp_end_date`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`),
  CONSTRAINT `fk_task_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTask Depends On
CREATE TABLE IF NOT EXISTS `tabTask Depends On` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `task` varchar(140) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `project` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTask Type
CREATE TABLE IF NOT EXISTS `tabTask Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `weight` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Category
CREATE TABLE IF NOT EXISTS `tabTax Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Rule
CREATE TABLE IF NOT EXISTS `tabTax Rule` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `tax_type` varchar(140) DEFAULT 'Sales',
  `use_for_shopping_cart` int(1) NOT NULL DEFAULT 1,
  `sales_tax_template` varchar(140) DEFAULT NULL,
  `purchase_tax_template` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `supplier` varchar(140) DEFAULT NULL,
  `item` varchar(140) DEFAULT NULL,
  `billing_city` varchar(140) DEFAULT NULL,
  `billing_county` varchar(140) DEFAULT NULL,
  `billing_state` varchar(140) DEFAULT NULL,
  `billing_zipcode` varchar(140) DEFAULT NULL,
  `billing_country` varchar(140) DEFAULT NULL,
  `tax_category` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `supplier_group` varchar(140) DEFAULT NULL,
  `item_group` varchar(140) DEFAULT NULL,
  `shipping_city` varchar(140) DEFAULT NULL,
  `shipping_county` varchar(140) DEFAULT NULL,
  `shipping_state` varchar(140) DEFAULT NULL,
  `shipping_zipcode` varchar(140) DEFAULT NULL,
  `shipping_country` varchar(140) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 1,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_tr_tax_type` (`tax_type`),
  CONSTRAINT `fk_tr_tax_type` FOREIGN KEY (`tax_type`) REFERENCES `tabItem Tax` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Withheld Vouchers
CREATE TABLE IF NOT EXISTS `tabTax Withheld Vouchers` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_name` varchar(140) DEFAULT NULL,
  `taxable_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_twv_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_twv_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Withholding Account
CREATE TABLE IF NOT EXISTS `tabTax Withholding Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_twa_parent` FOREIGN KEY (`parent`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Withholding Category
CREATE TABLE IF NOT EXISTS `tabTax Withholding Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `category_name` varchar(140) DEFAULT NULL,
  `round_off_tax_amount` int(1) NOT NULL DEFAULT 0,
  `consider_party_ledger_amount` int(1) NOT NULL DEFAULT 0,
  `tax_on_excess_amount` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTax Withholding Rate
CREATE TABLE IF NOT EXISTS `tabTax Withholding Rate` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `tax_withholding_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `single_threshold` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `cumulative_threshold` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_twr_parent` FOREIGN KEY (`parent`) REFERENCES `tabTax Withholding Category` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTelephony Call Type
CREATE TABLE IF NOT EXISTS `tabTelephony Call Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `call_type` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `call_type` (`call_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTerms and Conditions
CREATE TABLE IF NOT EXISTS `tabTerms and Conditions` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `selling` int(1) NOT NULL DEFAULT 1,
  `buying` int(1) NOT NULL DEFAULT 1,
  `terms` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTerritory
CREATE TABLE IF NOT EXISTS `tabTerritory` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `territory_name` varchar(140) DEFAULT NULL,
  `parent_territory` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `territory_manager` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `territory_name` (`territory_name`),
  KEY `territory_manager` (`territory_manager`),
  KEY `lft` (`lft`),
  KEY `rgt` (`rgt`),
  KEY `modified` (`modified`),
  KEY `lft_rgt_index` (`lft`,`rgt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTerritory Item
CREATE TABLE IF NOT EXISTS `tabTerritory Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `territory` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_territory_item_parent` FOREIGN KEY (`parent`) REFERENCES `tabTerritory` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTimesheet
CREATE TABLE IF NOT EXISTS `tabTimesheet` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT '{employee_name}',
  `naming_series` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `currency` varchar(140) DEFAULT NULL,
  `exchange_rate` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `sales_invoice` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `parent_project` varchar(140) DEFAULT NULL,
  `employee` varchar(140) DEFAULT NULL,
  `employee_name` varchar(140) DEFAULT NULL,
  `department` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `total_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billable_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_billable_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_billed_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_total_costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billed_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billable_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_billed_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `per_billed` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `note` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_timesheet_company` (`company`),
  KEY `fk_timesheet_employee` (`employee`),
  KEY `fk_timesheet_department` (`department`),
  KEY `fk_ts_customer` (`customer`),
  CONSTRAINT `fk_timesheet_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_timesheet_department` FOREIGN KEY (`department`) REFERENCES `tabDepartment` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_timesheet_employee` FOREIGN KEY (`employee`) REFERENCES `tabEmployee` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_ts_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTimesheet Detail
CREATE TABLE IF NOT EXISTS `tabTimesheet Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `activity_type` varchar(140) DEFAULT NULL,
  `from_time` datetime(6) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `expected_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `to_time` datetime(6) DEFAULT NULL,
  `hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `completed` int(1) NOT NULL DEFAULT 0,
  `project` varchar(140) DEFAULT NULL,
  `project_name` varchar(140) DEFAULT NULL,
  `task` varchar(140) DEFAULT NULL,
  `is_billable` int(1) NOT NULL DEFAULT 0,
  `sales_invoice` varchar(140) DEFAULT NULL,
  `billing_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_billing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_costing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `base_costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `billing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `costing_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `costing_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_timesheet_detail_task` (`task`),
  KEY `fk_timesheet_detail_activity_type` (`activity_type`),
  KEY `fk_tsd_project` (`project`),
  CONSTRAINT `fk_timesheet_detail_activity_type` FOREIGN KEY (`activity_type`) REFERENCES `tabActivity Type` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_timesheet_detail_parent` FOREIGN KEY (`parent`) REFERENCES `tabTimesheet` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_timesheet_detail_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_timesheet_detail_task` FOREIGN KEY (`task`) REFERENCES `tabTask` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_timesheet_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`),
  CONSTRAINT `fk_tsd_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabToDo
CREATE TABLE IF NOT EXISTS `tabToDo` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT 'Open',
  `priority` varchar(140) DEFAULT 'Medium',
  `color` varchar(140) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `allocated_to` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `reference_type` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `role` varchar(140) DEFAULT NULL,
  `assigned_by` varchar(140) DEFAULT NULL,
  `assigned_by_full_name` varchar(140) DEFAULT NULL,
  `sender` varchar(140) DEFAULT NULL,
  `assignment_rule` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `reference_type_reference_name_index` (`reference_type`,`reference_name`),
  KEY `fk_todo_owner` (`owner`),
  KEY `fk_todo_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_todo_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_todo_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_todo_user` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabToken Cache
CREATE TABLE IF NOT EXISTS `tabToken Cache` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `connected_app` varchar(140) DEFAULT NULL,
  `provider_name` varchar(140) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_in` int(11) NOT NULL DEFAULT 0,
  `state` varchar(140) DEFAULT NULL,
  `success_uri` varchar(140) DEFAULT NULL,
  `token_type` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTop Bar Item
CREATE TABLE IF NOT EXISTS `tabTop Bar Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `url` varchar(140) DEFAULT NULL,
  `open_in_new_tab` int(1) NOT NULL DEFAULT 0,
  `right` int(1) NOT NULL DEFAULT 1,
  `parent_label` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTransaction Deletion Record
CREATE TABLE IF NOT EXISTS `tabTransaction Deletion Record` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `error_log` longtext DEFAULT NULL,
  `delete_bin_data` int(1) NOT NULL DEFAULT 0,
  `delete_leads_and_addresses` int(1) NOT NULL DEFAULT 0,
  `reset_company_default_values` int(1) NOT NULL DEFAULT 0,
  `clear_notifications` int(1) NOT NULL DEFAULT 0,
  `initialize_doctypes_table` int(1) NOT NULL DEFAULT 0,
  `delete_transactions` int(1) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `process_in_single_transaction` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTransaction Deletion Record Details
CREATE TABLE IF NOT EXISTS `tabTransaction Deletion Record Details` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `doctype_name` varchar(140) DEFAULT NULL,
  `docfield_name` varchar(140) DEFAULT NULL,
  `no_of_docs` int(11) NOT NULL DEFAULT 0,
  `done` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTransaction Deletion Record Item
CREATE TABLE IF NOT EXISTS `tabTransaction Deletion Record Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `doctype_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTransaction Log
CREATE TABLE IF NOT EXISTS `tabTransaction Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `row_index` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `document_name` varchar(140) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `checksum_version` varchar(140) DEFAULT NULL,
  `previous_hash` text DEFAULT NULL,
  `transaction_hash` text DEFAULT NULL,
  `chaining_hash` text DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabTranslation
CREATE TABLE IF NOT EXISTS `tabTranslation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `contributed` int(1) NOT NULL DEFAULT 0,
  `language` varchar(140) DEFAULT NULL,
  `source_text` longtext DEFAULT NULL,
  `context` varchar(140) DEFAULT NULL,
  `translated_text` longtext DEFAULT NULL,
  `contribution_status` varchar(140) DEFAULT NULL,
  `contribution_docname` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `language` (`language`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUAE VAT Account
CREATE TABLE IF NOT EXISTS `tabUAE VAT Account` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUAE VAT Settings
CREATE TABLE IF NOT EXISTS `tabUAE VAT Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `company` (`company`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUnhandled Email
CREATE TABLE IF NOT EXISTS `tabUnhandled Email` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_account` varchar(140) DEFAULT NULL,
  `uid` varchar(140) DEFAULT NULL,
  `reason` longtext DEFAULT NULL,
  `message_id` longtext DEFAULT NULL,
  `raw` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUnreconcile Payment
CREATE TABLE IF NOT EXISTS `tabUnreconcile Payment` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `company` varchar(140) DEFAULT NULL,
  `voucher_type` varchar(140) DEFAULT NULL,
  `voucher_no` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_up_voucher_type` (`voucher_type`),
  CONSTRAINT `fk_up_voucher_type` FOREIGN KEY (`voucher_type`) REFERENCES `tabDocType` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUnreconcile Payment Entries
CREATE TABLE IF NOT EXISTS `tabUnreconcile Payment Entries` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `party_type` varchar(140) DEFAULT NULL,
  `party` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `allocated_amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `account_currency` varchar(140) DEFAULT NULL,
  `unlinked` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUOM
CREATE TABLE IF NOT EXISTS `tabUOM` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `uom_name` varchar(140) DEFAULT NULL,
  `must_be_whole_number` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `uom_name` (`uom_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUOM Category
CREATE TABLE IF NOT EXISTS `tabUOM Category` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `category_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUOM Conversion Detail
CREATE TABLE IF NOT EXISTS `tabUOM Conversion Detail` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `uom` varchar(140) DEFAULT NULL,
  `conversion_factor` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  KEY `fk_ucd_uom` (`uom`),
  CONSTRAINT `fk_ucd_uom` FOREIGN KEY (`uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUOM Conversion Factor
CREATE TABLE IF NOT EXISTS `tabUOM Conversion Factor` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `category` varchar(140) DEFAULT NULL,
  `from_uom` varchar(140) DEFAULT NULL,
  `to_uom` varchar(140) DEFAULT NULL,
  `value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `fk_ucf_from_uom` (`from_uom`),
  KEY `fk_ucf_to_uom` (`to_uom`),
  CONSTRAINT `fk_ucf_from_uom` FOREIGN KEY (`from_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_ucf_to_uom` FOREIGN KEY (`to_uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser
CREATE TABLE IF NOT EXISTS `tabUser` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `email` varchar(140) DEFAULT NULL,
  `first_name` varchar(140) DEFAULT NULL,
  `middle_name` varchar(140) DEFAULT NULL,
  `last_name` varchar(140) DEFAULT NULL,
  `full_name` varchar(140) DEFAULT NULL,
  `username` varchar(140) DEFAULT NULL,
  `language` varchar(140) DEFAULT NULL,
  `time_zone` varchar(140) DEFAULT NULL,
  `send_welcome_email` int(1) NOT NULL DEFAULT 1,
  `unsubscribed` int(1) NOT NULL DEFAULT 0,
  `user_image` text DEFAULT NULL,
  `role_profile_name` varchar(140) DEFAULT NULL,
  `module_profile` varchar(140) DEFAULT NULL,
  `home_settings` longtext DEFAULT NULL,
  `gender` varchar(140) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `interest` text DEFAULT NULL,
  `phone` varchar(140) DEFAULT NULL,
  `location` varchar(140) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `mute_sounds` int(1) NOT NULL DEFAULT 0,
  `desk_theme` varchar(140) DEFAULT NULL,
  `banner_image` text DEFAULT NULL,
  `search_bar` int(1) NOT NULL DEFAULT 1,
  `notifications` int(1) NOT NULL DEFAULT 1,
  `list_sidebar` int(1) NOT NULL DEFAULT 1,
  `bulk_actions` int(1) NOT NULL DEFAULT 1,
  `view_switcher` int(1) NOT NULL DEFAULT 1,
  `form_sidebar` int(1) NOT NULL DEFAULT 1,
  `timeline` int(1) NOT NULL DEFAULT 1,
  `dashboard` int(1) NOT NULL DEFAULT 1,
  `new_password` text DEFAULT NULL,
  `logout_all_sessions` int(1) NOT NULL DEFAULT 1,
  `reset_password_key` varchar(140) DEFAULT NULL,
  `last_reset_password_key_generated_on` datetime(6) DEFAULT NULL,
  `last_password_reset_date` date DEFAULT NULL,
  `redirect_url` text DEFAULT NULL,
  `document_follow_notify` int(1) NOT NULL DEFAULT 0,
  `document_follow_frequency` varchar(140) DEFAULT 'Daily',
  `follow_created_documents` int(1) NOT NULL DEFAULT 0,
  `follow_commented_documents` int(1) NOT NULL DEFAULT 0,
  `follow_liked_documents` int(1) NOT NULL DEFAULT 0,
  `follow_assigned_documents` int(1) NOT NULL DEFAULT 0,
  `follow_shared_documents` int(1) NOT NULL DEFAULT 0,
  `email_signature` text DEFAULT NULL,
  `thread_notify` int(1) NOT NULL DEFAULT 1,
  `send_me_a_copy` int(1) NOT NULL DEFAULT 0,
  `allowed_in_mentions` int(1) NOT NULL DEFAULT 1,
  `default_workspace` varchar(140) DEFAULT NULL,
  `default_app` varchar(140) DEFAULT NULL,
  `simultaneous_sessions` int(11) NOT NULL DEFAULT 2,
  `restrict_ip` text DEFAULT NULL,
  `last_ip` varchar(140) DEFAULT NULL,
  `login_after` int(11) NOT NULL DEFAULT 0,
  `user_type` varchar(140) DEFAULT 'System User',
  `last_active` datetime(6) DEFAULT NULL,
  `login_before` int(11) NOT NULL DEFAULT 0,
  `bypass_restrict_ip_check_if_2fa_enabled` int(1) NOT NULL DEFAULT 0,
  `last_login` varchar(140) DEFAULT NULL,
  `last_known_versions` text DEFAULT NULL,
  `api_key` varchar(140) DEFAULT NULL,
  `api_secret` text DEFAULT NULL,
  `onboarding_status` text DEFAULT '{}',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `mobile_no` (`mobile_no`),
  UNIQUE KEY `api_key` (`api_key`),
  KEY `last_active` (`last_active`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Document Type
CREATE TABLE IF NOT EXISTS `tabUser Document Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `is_custom` int(1) NOT NULL DEFAULT 0,
  `read` int(1) NOT NULL DEFAULT 1,
  `write` int(1) NOT NULL DEFAULT 0,
  `create` int(1) NOT NULL DEFAULT 0,
  `submit` int(1) NOT NULL DEFAULT 0,
  `cancel` int(1) NOT NULL DEFAULT 0,
  `amend` int(1) NOT NULL DEFAULT 0,
  `delete` int(1) NOT NULL DEFAULT 0,
  `email` int(1) NOT NULL DEFAULT 1,
  `share` int(1) NOT NULL DEFAULT 1,
  `print` int(1) NOT NULL DEFAULT 1,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_user_doc_type_parent` FOREIGN KEY (`parent`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Email
CREATE TABLE IF NOT EXISTS `tabUser Email` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `email_account` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `awaiting_password` int(1) NOT NULL DEFAULT 0,
  `used_oauth` int(1) NOT NULL DEFAULT 0,
  `enable_outgoing` int(1) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_user_email_parent` FOREIGN KEY (`parent`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Group
CREATE TABLE IF NOT EXISTS `tabUser Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Group Member
CREATE TABLE IF NOT EXISTS `tabUser Group Member` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Permission
CREATE TABLE IF NOT EXISTS `tabUser Permission` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `allow` varchar(140) DEFAULT NULL,
  `for_value` varchar(140) DEFAULT NULL,
  `is_default` int(1) NOT NULL DEFAULT 0,
  `apply_to_all_doctypes` int(1) NOT NULL DEFAULT 1,
  `applicable_for` varchar(140) DEFAULT NULL,
  `hide_descendants` int(1) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_user_permission_user` FOREIGN KEY (`user`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Select Document Type
CREATE TABLE IF NOT EXISTS `tabUser Select Document Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Social Login
CREATE TABLE IF NOT EXISTS `tabUser Social Login` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `provider` varchar(140) DEFAULT NULL,
  `username` varchar(140) DEFAULT NULL,
  `userid` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_user_social_login_parent` FOREIGN KEY (`parent`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Type
CREATE TABLE IF NOT EXISTS `tabUser Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `apply_user_permission_on` varchar(140) DEFAULT NULL,
  `user_id_field` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabUser Type Module
CREATE TABLE IF NOT EXISTS `tabUser Type Module` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`),
  CONSTRAINT `fk_user_type_module_parent` FOREIGN KEY (`parent`) REFERENCES `tabUser` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabVariant Field
CREATE TABLE IF NOT EXISTS `tabVariant Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `field_name` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabVehicle
CREATE TABLE IF NOT EXISTS `tabVehicle` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `license_plate` varchar(140) DEFAULT NULL,
  `make` varchar(140) DEFAULT NULL,
  `model` varchar(140) DEFAULT NULL,
  `last_odometer` int(11) NOT NULL DEFAULT 0,
  `acquisition_date` date DEFAULT NULL,
  `location` varchar(140) DEFAULT NULL,
  `chassis_no` varchar(140) DEFAULT NULL,
  `vehicle_value` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `employee` varchar(140) DEFAULT NULL,
  `insurance_company` varchar(140) DEFAULT NULL,
  `policy_no` varchar(140) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `fuel_type` varchar(140) DEFAULT NULL,
  `uom` varchar(140) DEFAULT NULL,
  `carbon_check_date` date DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `wheels` int(11) NOT NULL DEFAULT 0,
  `doors` int(11) NOT NULL DEFAULT 0,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabVersion
CREATE TABLE IF NOT EXISTS `tabVersion` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `ref_doctype` varchar(140) DEFAULT NULL,
  `docname` varchar(140) DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`),
  KEY `ref_doctype_docname_index` (`ref_doctype`,`docname`),
  KEY `fk_version_owner` (`owner`),
  CONSTRAINT `fk_version_owner` FOREIGN KEY (`owner`) REFERENCES `tabUser` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabVideo
CREATE TABLE IF NOT EXISTS `tabVideo` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `provider` varchar(140) DEFAULT NULL,
  `url` varchar(140) DEFAULT NULL,
  `youtube_video_id` varchar(140) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `duration` decimal(21,9) DEFAULT NULL,
  `like_count` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `view_count` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `dislike_count` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `comment_count` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` longtext DEFAULT NULL,
  `image` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabView Log
CREATE TABLE IF NOT EXISTS `tabView Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `viewed_by` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `reference_name` (`reference_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabVoice Call Settings
CREATE TABLE IF NOT EXISTS `tabVoice Call Settings` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `user` varchar(140) DEFAULT NULL,
  `call_receiving_device` varchar(140) DEFAULT 'Computer',
  `greeting_message` varchar(140) DEFAULT NULL,
  `agent_busy_message` varchar(140) DEFAULT NULL,
  `agent_unavailable_message` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `user` (`user`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWarehouse
CREATE TABLE IF NOT EXISTS `tabWarehouse` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `disabled` int(1) NOT NULL DEFAULT 0,
  `warehouse_name` varchar(140) DEFAULT NULL,
  `is_group` int(1) NOT NULL DEFAULT 0,
  `parent_warehouse` varchar(140) DEFAULT NULL,
  `is_rejected_warehouse` int(1) NOT NULL DEFAULT 0,
  `account` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `email_id` varchar(140) DEFAULT NULL,
  `phone_no` varchar(140) DEFAULT NULL,
  `mobile_no` varchar(140) DEFAULT NULL,
  `address_line_1` varchar(140) DEFAULT NULL,
  `address_line_2` varchar(140) DEFAULT NULL,
  `city` varchar(140) DEFAULT NULL,
  `state` varchar(140) DEFAULT NULL,
  `pin` varchar(140) DEFAULT NULL,
  `warehouse_type` varchar(140) DEFAULT NULL,
  `default_in_transit_warehouse` varchar(140) DEFAULT NULL,
  `lft` int(11) NOT NULL DEFAULT 0,
  `rgt` int(11) NOT NULL DEFAULT 0,
  `old_parent` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent_warehouse` (`parent_warehouse`),
  KEY `company` (`company`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_warehouse_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWarehouse Type
CREATE TABLE IF NOT EXISTS `tabWarehouse Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWarranty Claim
CREATE TABLE IF NOT EXISTS `tabWarranty Claim` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Open',
  `complaint_date` date DEFAULT NULL,
  `customer` varchar(140) DEFAULT NULL,
  `serial_no` varchar(140) DEFAULT NULL,
  `complaint` longtext DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `warranty_amc_status` varchar(140) DEFAULT NULL,
  `warranty_expiry_date` date DEFAULT NULL,
  `amc_expiry_date` date DEFAULT NULL,
  `resolution_date` datetime(6) DEFAULT NULL,
  `resolved_by` varchar(140) DEFAULT NULL,
  `resolution_details` text DEFAULT NULL,
  `customer_name` varchar(140) DEFAULT NULL,
  `contact_person` varchar(140) DEFAULT NULL,
  `contact_display` text DEFAULT NULL,
  `contact_mobile` varchar(140) DEFAULT NULL,
  `contact_email` varchar(140) DEFAULT NULL,
  `territory` varchar(140) DEFAULT NULL,
  `customer_group` varchar(140) DEFAULT NULL,
  `customer_address` varchar(140) DEFAULT NULL,
  `address_display` text DEFAULT NULL,
  `service_address` text DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `complaint_raised_by` varchar(140) DEFAULT NULL,
  `from_company` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `complaint_date` (`complaint_date`),
  KEY `customer` (`customer`),
  KEY `serial_no` (`serial_no`),
  KEY `item_code` (`item_code`),
  KEY `warranty_amc_status` (`warranty_amc_status`),
  KEY `resolution_date` (`resolution_date`),
  KEY `resolved_by` (`resolved_by`),
  KEY `territory` (`territory`),
  KEY `company` (`company`),
  KEY `modified` (`modified`),
  CONSTRAINT `fk_warranty_claim_territory` FOREIGN KEY (`territory`) REFERENCES `tabTerritory` (`name`),
  CONSTRAINT `fk_wc_customer` FOREIGN KEY (`customer`) REFERENCES `tabCustomer` (`name`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Form
CREATE TABLE IF NOT EXISTS `tabWeb Form` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  `doc_type` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `is_standard` int(1) NOT NULL DEFAULT 0,
  `introduction_text` longtext DEFAULT NULL,
  `anonymous` int(1) NOT NULL DEFAULT 0,
  `login_required` int(1) NOT NULL DEFAULT 0,
  `apply_document_permissions` int(1) NOT NULL DEFAULT 0,
  `allow_edit` int(1) NOT NULL DEFAULT 0,
  `allow_multiple` int(1) NOT NULL DEFAULT 0,
  `allow_delete` int(1) NOT NULL DEFAULT 0,
  `allow_incomplete` int(1) NOT NULL DEFAULT 0,
  `allow_comments` int(1) NOT NULL DEFAULT 0,
  `allow_print` int(1) NOT NULL DEFAULT 0,
  `print_format` varchar(140) DEFAULT NULL,
  `max_attachment_size` int(11) NOT NULL DEFAULT 0,
  `show_attachments` int(1) NOT NULL DEFAULT 0,
  `allowed_embedding_domains` text DEFAULT NULL,
  `condition_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`condition_json`)),
  `show_list` int(1) NOT NULL DEFAULT 0,
  `list_title` varchar(140) DEFAULT NULL,
  `show_sidebar` int(1) NOT NULL DEFAULT 0,
  `website_sidebar` varchar(140) DEFAULT NULL,
  `button_label` varchar(140) DEFAULT 'Save',
  `banner_image` text DEFAULT NULL,
  `breadcrumbs` longtext DEFAULT NULL,
  `success_title` varchar(140) DEFAULT NULL,
  `success_url` varchar(140) DEFAULT NULL,
  `success_message` text DEFAULT NULL,
  `meta_title` varchar(140) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_image` text DEFAULT NULL,
  `client_script` longtext DEFAULT NULL,
  `custom_css` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `route` (`route`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Form Field
CREATE TABLE IF NOT EXISTS `tabWeb Form Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `allow_read_on_all_link_options` int(1) NOT NULL DEFAULT 0,
  `reqd` int(1) NOT NULL DEFAULT 0,
  `read_only` int(1) NOT NULL DEFAULT 0,
  `show_in_filter` int(1) NOT NULL DEFAULT 0,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `options` text DEFAULT NULL,
  `max_length` int(11) NOT NULL DEFAULT 0,
  `max_value` int(11) NOT NULL DEFAULT 0,
  `precision` varchar(140) DEFAULT NULL,
  `depends_on` longtext DEFAULT NULL,
  `mandatory_depends_on` longtext DEFAULT NULL,
  `read_only_depends_on` longtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `default` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Form List Column
CREATE TABLE IF NOT EXISTS `tabWeb Form List Column` (
  `name` bigint(20) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Page
CREATE TABLE IF NOT EXISTS `tabWeb Page` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `dynamic_route` int(1) NOT NULL DEFAULT 0,
  `published` int(1) NOT NULL DEFAULT 1,
  `module` varchar(140) DEFAULT NULL,
  `content_type` varchar(140) DEFAULT 'Page Builder',
  `slideshow` varchar(140) DEFAULT NULL,
  `dynamic_template` int(1) NOT NULL DEFAULT 0,
  `main_section` longtext DEFAULT NULL,
  `main_section_md` longtext DEFAULT NULL,
  `main_section_html` longtext DEFAULT NULL,
  `context_script` longtext DEFAULT NULL,
  `javascript` longtext DEFAULT NULL,
  `insert_style` int(1) NOT NULL DEFAULT 0,
  `text_align` varchar(140) DEFAULT NULL,
  `css` longtext DEFAULT NULL,
  `full_width` int(1) NOT NULL DEFAULT 1,
  `show_title` int(1) NOT NULL DEFAULT 0,
  `start_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `meta_title` varchar(140) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_image` text DEFAULT NULL,
  `show_sidebar` int(1) NOT NULL DEFAULT 0,
  `website_sidebar` varchar(140) DEFAULT NULL,
  `enable_comments` int(1) NOT NULL DEFAULT 0,
  `header` longtext DEFAULT NULL,
  `breadcrumbs` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `route` (`route`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Page Block
CREATE TABLE IF NOT EXISTS `tabWeb Page Block` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `web_template` varchar(140) DEFAULT NULL,
  `web_template_values` longtext DEFAULT NULL,
  `css_class` text DEFAULT NULL,
  `section_id` varchar(140) DEFAULT NULL,
  `add_container` int(1) NOT NULL DEFAULT 1,
  `add_top_padding` int(1) NOT NULL DEFAULT 1,
  `add_bottom_padding` int(1) NOT NULL DEFAULT 1,
  `add_border_at_top` int(1) NOT NULL DEFAULT 0,
  `add_border_at_bottom` int(1) NOT NULL DEFAULT 0,
  `add_shade` int(1) NOT NULL DEFAULT 0,
  `hide_block` int(1) NOT NULL DEFAULT 0,
  `add_background_image` int(1) NOT NULL DEFAULT 0,
  `background_image` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Page View
CREATE TABLE IF NOT EXISTS `tabWeb Page View` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `path` varchar(140) DEFAULT NULL,
  `referrer` varchar(140) DEFAULT NULL,
  `browser` varchar(140) DEFAULT NULL,
  `browser_version` varchar(140) DEFAULT NULL,
  `is_unique` varchar(140) DEFAULT NULL,
  `time_zone` varchar(140) DEFAULT NULL,
  `user_agent` varchar(140) DEFAULT NULL,
  `source` varchar(140) DEFAULT NULL,
  `campaign` varchar(140) DEFAULT NULL,
  `medium` varchar(140) DEFAULT NULL,
  `visitor_id` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `path` (`path`),
  KEY `visitor_id` (`visitor_id`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Template
CREATE TABLE IF NOT EXISTS `tabWeb Template` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `type` varchar(140) DEFAULT 'Section',
  `standard` int(1) NOT NULL DEFAULT 0,
  `module` varchar(140) DEFAULT NULL,
  `template` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWeb Template Field
CREATE TABLE IF NOT EXISTS `tabWeb Template Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `fieldname` varchar(140) DEFAULT NULL,
  `fieldtype` varchar(140) DEFAULT 'Data',
  `reqd` int(1) NOT NULL DEFAULT 0,
  `options` text DEFAULT NULL,
  `default` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebhook
CREATE TABLE IF NOT EXISTS `tabWebhook` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `webhook_doctype` varchar(140) DEFAULT NULL,
  `webhook_docevent` varchar(140) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `condition` text DEFAULT NULL,
  `request_url` text DEFAULT NULL,
  `is_dynamic_url` int(1) NOT NULL DEFAULT 0,
  `timeout` int(11) NOT NULL DEFAULT 5,
  `background_jobs_queue` varchar(140) DEFAULT NULL,
  `request_method` varchar(140) DEFAULT 'POST',
  `request_structure` varchar(140) DEFAULT NULL,
  `enable_security` int(1) NOT NULL DEFAULT 0,
  `webhook_secret` text DEFAULT NULL,
  `webhook_json` longtext DEFAULT NULL,
  `preview_document` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebhook Data
CREATE TABLE IF NOT EXISTS `tabWebhook Data` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `key` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebhook Header
CREATE TABLE IF NOT EXISTS `tabWebhook Header` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `key` text DEFAULT NULL,
  `value` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebhook Request Log
CREATE TABLE IF NOT EXISTS `tabWebhook Request Log` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `webhook` varchar(140) DEFAULT NULL,
  `reference_document` varchar(140) DEFAULT NULL,
  `headers` longtext DEFAULT NULL,
  `data` longtext DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `response` longtext DEFAULT NULL,
  `error` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Attribute
CREATE TABLE IF NOT EXISTS `tabWebsite Attribute` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `attribute` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Filter Field
CREATE TABLE IF NOT EXISTS `tabWebsite Filter Field` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `fieldname` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Item Group
CREATE TABLE IF NOT EXISTS `tabWebsite Item Group` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `item_group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Meta Tag
CREATE TABLE IF NOT EXISTS `tabWebsite Meta Tag` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `key` varchar(140) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Route Meta
CREATE TABLE IF NOT EXISTS `tabWebsite Route Meta` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Route Redirect
CREATE TABLE IF NOT EXISTS `tabWebsite Route Redirect` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `source` text DEFAULT NULL,
  `target` text DEFAULT NULL,
  `redirect_http_status` varchar(140) DEFAULT '301',
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Sidebar
CREATE TABLE IF NOT EXISTS `tabWebsite Sidebar` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `title` (`title`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Sidebar Item
CREATE TABLE IF NOT EXISTS `tabWebsite Sidebar Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `title` varchar(140) DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `group` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Slideshow
CREATE TABLE IF NOT EXISTS `tabWebsite Slideshow` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `slideshow_name` varchar(140) DEFAULT NULL,
  `header` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `slideshow_name` (`slideshow_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Slideshow Item
CREATE TABLE IF NOT EXISTS `tabWebsite Slideshow Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `image` text DEFAULT NULL,
  `heading` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `url` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Theme
CREATE TABLE IF NOT EXISTS `tabWebsite Theme` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `theme` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT 'Website',
  `custom` int(1) NOT NULL DEFAULT 1,
  `google_font` varchar(140) DEFAULT NULL,
  `font_size` varchar(140) DEFAULT NULL,
  `font_properties` varchar(140) DEFAULT 'wght@300;400;500;600;700;800',
  `button_rounded_corners` int(1) NOT NULL DEFAULT 1,
  `button_shadows` int(1) NOT NULL DEFAULT 0,
  `button_gradients` int(1) NOT NULL DEFAULT 0,
  `primary_color` varchar(140) DEFAULT NULL,
  `text_color` varchar(140) DEFAULT NULL,
  `light_color` varchar(140) DEFAULT NULL,
  `dark_color` varchar(140) DEFAULT NULL,
  `background_color` varchar(140) DEFAULT NULL,
  `custom_overrides` longtext DEFAULT NULL,
  `custom_scss` longtext DEFAULT NULL,
  `theme_scss` longtext DEFAULT NULL,
  `theme_url` varchar(140) DEFAULT NULL,
  `js` longtext DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `theme` (`theme`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWebsite Theme Ignore App
CREATE TABLE IF NOT EXISTS `tabWebsite Theme Ignore App` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `app` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWork Order
CREATE TABLE IF NOT EXISTS `tabWork Order` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `naming_series` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Draft',
  `production_item` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `bom_no` varchar(140) DEFAULT NULL,
  `sales_order` varchar(140) DEFAULT NULL,
  `company` varchar(140) DEFAULT NULL,
  `qty` decimal(21,9) NOT NULL DEFAULT 1.000000000,
  `material_transferred_for_manufacturing` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `produced_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `disassembled_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `project` varchar(140) DEFAULT NULL,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `use_multi_level_bom` int(1) NOT NULL DEFAULT 1,
  `skip_transfer` int(1) NOT NULL DEFAULT 0,
  `from_wip_warehouse` int(1) NOT NULL DEFAULT 0,
  `update_consumed_material_cost_in_project` int(1) NOT NULL DEFAULT 1,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `wip_warehouse` varchar(140) DEFAULT NULL,
  `fg_warehouse` varchar(140) DEFAULT NULL,
  `scrap_warehouse` varchar(140) DEFAULT NULL,
  `has_serial_no` int(1) NOT NULL DEFAULT 0,
  `has_batch_no` int(1) NOT NULL DEFAULT 0,
  `batch_size` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transfer_material_against` varchar(140) DEFAULT NULL,
  `planned_start_date` datetime(6) DEFAULT NULL,
  `planned_end_date` datetime(6) DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `actual_start_date` datetime(6) DEFAULT NULL,
  `actual_end_date` datetime(6) DEFAULT NULL,
  `lead_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `planned_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `additional_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `corrective_operation_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `total_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `stock_uom` varchar(140) DEFAULT NULL,
  `material_request` varchar(140) DEFAULT NULL,
  `material_request_item` varchar(140) DEFAULT NULL,
  `sales_order_item` varchar(140) DEFAULT NULL,
  `production_plan` varchar(140) DEFAULT NULL,
  `production_plan_item` varchar(140) DEFAULT NULL,
  `production_plan_sub_assembly_item` varchar(140) DEFAULT NULL,
  `product_bundle_item` varchar(140) DEFAULT NULL,
  `amended_from` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  `_seen` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `status` (`status`),
  KEY `production_plan` (`production_plan`),
  KEY `modified` (`modified`),
  KEY `fk_work_order_production_item` (`production_item`),
  KEY `fk_wo_company` (`company`),
  KEY `fk_wo_project` (`project`),
  KEY `fk_wo_stock_uom` (`stock_uom`),
  KEY `fk_wo_source_warehouse` (`source_warehouse`),
  KEY `fk_wo_wip_warehouse` (`wip_warehouse`),
  KEY `fk_wo_fg_warehouse` (`fg_warehouse`),
  CONSTRAINT `fk_wo_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`),
  CONSTRAINT `fk_wo_fg_warehouse` FOREIGN KEY (`fg_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_wo_project` FOREIGN KEY (`project`) REFERENCES `tabProject` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_wo_source_warehouse` FOREIGN KEY (`source_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_wo_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`),
  CONSTRAINT `fk_wo_wip_warehouse` FOREIGN KEY (`wip_warehouse`) REFERENCES `tabWarehouse` (`name`) ON DELETE SET NULL,
  CONSTRAINT `fk_work_order_company` FOREIGN KEY (`company`) REFERENCES `tabCompany` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_work_order_production_item` FOREIGN KEY (`production_item`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWork Order Item
CREATE TABLE IF NOT EXISTS `tabWork Order Item` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `operation` varchar(140) DEFAULT NULL,
  `item_code` varchar(140) DEFAULT NULL,
  `source_warehouse` varchar(140) DEFAULT NULL,
  `item_name` varchar(140) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `allow_alternative_item` int(1) NOT NULL DEFAULT 0,
  `include_item_in_manufacturing` int(1) NOT NULL DEFAULT 0,
  `required_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `stock_uom` varchar(140) DEFAULT NULL,
  `rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `amount` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `transferred_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `consumed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `returned_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `available_qty_at_source_warehouse` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `available_qty_at_wip_warehouse` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `item_code` (`item_code`),
  KEY `parent` (`parent`),
  KEY `item_code_source_warehouse_index` (`item_code`,`source_warehouse`),
  KEY `fk_woi_stock_uom` (`stock_uom`),
  CONSTRAINT `fk_wo_item_item` FOREIGN KEY (`item_code`) REFERENCES `tabItem` (`name`) ON DELETE CASCADE,
  CONSTRAINT `fk_woi_stock_uom` FOREIGN KEY (`stock_uom`) REFERENCES `tabUOM` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWork Order Operation
CREATE TABLE IF NOT EXISTS `tabWork Order Operation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `operation` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT 'Pending',
  `completed_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `process_loss_qty` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `bom` varchar(140) DEFAULT NULL,
  `workstation_type` varchar(140) DEFAULT NULL,
  `workstation` varchar(140) DEFAULT NULL,
  `sequence_id` int(11) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `planned_start_time` datetime(6) DEFAULT NULL,
  `hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `time_in_mins` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `planned_end_time` datetime(6) DEFAULT NULL,
  `batch_size` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `planned_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_start_time` datetime(6) DEFAULT NULL,
  `actual_operation_time` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `actual_end_time` datetime(6) DEFAULT NULL,
  `actual_operating_cost` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow
CREATE TABLE IF NOT EXISTS `tabWorkflow` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workflow_name` varchar(140) DEFAULT NULL,
  `document_type` varchar(140) DEFAULT NULL,
  `is_active` int(1) NOT NULL DEFAULT 0,
  `override_status` int(1) NOT NULL DEFAULT 0,
  `send_email_alert` int(1) NOT NULL DEFAULT 0,
  `workflow_state_field` varchar(140) DEFAULT 'workflow_state',
  `workflow_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`workflow_data`)),
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `workflow_name` (`workflow_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow Action
CREATE TABLE IF NOT EXISTS `tabWorkflow Action` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `status` varchar(140) DEFAULT NULL,
  `reference_name` varchar(140) DEFAULT NULL,
  `reference_doctype` varchar(140) DEFAULT NULL,
  `workflow_state` varchar(140) DEFAULT NULL,
  `completed_by_role` varchar(140) DEFAULT NULL,
  `completed_by` varchar(140) DEFAULT NULL,
  `user` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `user` (`user`),
  KEY `modified` (`modified`),
  KEY `reference_name_reference_doctype_status_index` (`reference_name`,`reference_doctype`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow Action Master
CREATE TABLE IF NOT EXISTS `tabWorkflow Action Master` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workflow_action_name` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `workflow_action_name` (`workflow_action_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow Action Permitted Role
CREATE TABLE IF NOT EXISTS `tabWorkflow Action Permitted Role` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `role` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow Document State
CREATE TABLE IF NOT EXISTS `tabWorkflow Document State` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `state` varchar(140) DEFAULT NULL,
  `doc_status` varchar(140) DEFAULT '0',
  `update_field` varchar(140) DEFAULT NULL,
  `update_value` varchar(140) DEFAULT NULL,
  `is_optional_state` int(1) NOT NULL DEFAULT 0,
  `avoid_status_override` int(1) NOT NULL DEFAULT 0,
  `next_action_email_template` varchar(140) DEFAULT NULL,
  `allow_edit` varchar(140) DEFAULT NULL,
  `send_email` int(1) NOT NULL DEFAULT 1,
  `message` text DEFAULT NULL,
  `workflow_builder_id` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow State
CREATE TABLE IF NOT EXISTS `tabWorkflow State` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workflow_state_name` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `style` varchar(140) DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `workflow_state_name` (`workflow_state_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkflow Transition
CREATE TABLE IF NOT EXISTS `tabWorkflow Transition` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `state` varchar(140) DEFAULT NULL,
  `action` varchar(140) DEFAULT NULL,
  `next_state` varchar(140) DEFAULT NULL,
  `allowed` varchar(140) DEFAULT NULL,
  `allow_self_approval` int(1) NOT NULL DEFAULT 1,
  `send_email_to_creator` int(1) NOT NULL DEFAULT 0,
  `condition` longtext DEFAULT NULL,
  `workflow_builder_id` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace
CREATE TABLE IF NOT EXISTS `tabWorkspace` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `label` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `sequence_id` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `for_user` varchar(140) DEFAULT NULL,
  `parent_page` varchar(140) DEFAULT NULL,
  `module` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `indicator_color` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `hide_custom` int(1) NOT NULL DEFAULT 0,
  `public` int(1) NOT NULL DEFAULT 0,
  `is_hidden` int(1) NOT NULL DEFAULT 0,
  `content` longtext DEFAULT '[]',
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `label` (`label`),
  KEY `restrict_to_domain` (`restrict_to_domain`),
  KEY `public` (`public`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Chart
CREATE TABLE IF NOT EXISTS `tabWorkspace Chart` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `chart_name` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Custom Block
CREATE TABLE IF NOT EXISTS `tabWorkspace Custom Block` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `custom_block_name` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Link
CREATE TABLE IF NOT EXISTS `tabWorkspace Link` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `type` varchar(140) DEFAULT 'Link',
  `label` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `hidden` int(1) NOT NULL DEFAULT 0,
  `link_type` varchar(140) DEFAULT NULL,
  `link_to` varchar(140) DEFAULT NULL,
  `report_ref_doctype` varchar(140) DEFAULT NULL,
  `dependencies` varchar(140) DEFAULT NULL,
  `only_for` varchar(140) DEFAULT NULL,
  `onboard` int(1) NOT NULL DEFAULT 0,
  `is_query_report` int(1) NOT NULL DEFAULT 0,
  `link_count` int(11) NOT NULL DEFAULT 0,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Number Card
CREATE TABLE IF NOT EXISTS `tabWorkspace Number Card` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `number_card_name` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Quick List
CREATE TABLE IF NOT EXISTS `tabWorkspace Quick List` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `document_type` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `quick_list_filter` longtext DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkspace Shortcut
CREATE TABLE IF NOT EXISTS `tabWorkspace Shortcut` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `type` varchar(140) DEFAULT NULL,
  `link_to` varchar(140) DEFAULT NULL,
  `url` varchar(140) DEFAULT NULL,
  `doc_view` varchar(140) DEFAULT NULL,
  `kanban_board` varchar(140) DEFAULT NULL,
  `label` varchar(140) DEFAULT NULL,
  `icon` varchar(140) DEFAULT NULL,
  `restrict_to_domain` varchar(140) DEFAULT NULL,
  `report_ref_doctype` varchar(140) DEFAULT NULL,
  `stats_filter` longtext DEFAULT NULL,
  `color` varchar(140) DEFAULT NULL,
  `format` varchar(140) DEFAULT NULL,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkstation
CREATE TABLE IF NOT EXISTS `tabWorkstation` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workstation_name` varchar(140) DEFAULT NULL,
  `workstation_type` varchar(140) DEFAULT NULL,
  `plant_floor` varchar(140) DEFAULT NULL,
  `production_capacity` int(11) NOT NULL DEFAULT 1,
  `warehouse` varchar(140) DEFAULT NULL,
  `status` varchar(140) DEFAULT NULL,
  `on_status_image` text DEFAULT NULL,
  `off_status_image` text DEFAULT NULL,
  `hour_rate_electricity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_consumable` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_rent` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_labour` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `holiday_list` varchar(140) DEFAULT NULL,
  `total_working_hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `workstation_name` (`workstation_name`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkstation Type
CREATE TABLE IF NOT EXISTS `tabWorkstation Type` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `workstation_type` varchar(140) DEFAULT NULL,
  `hour_rate_electricity` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_consumable` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_rent` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate_labour` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `hour_rate` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `description` text DEFAULT NULL,
  `_user_tags` text DEFAULT NULL,
  `_comments` text DEFAULT NULL,
  `_assign` text DEFAULT NULL,
  `_liked_by` text DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `workstation_type` (`workstation_type`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.tabWorkstation Working Hour
CREATE TABLE IF NOT EXISTS `tabWorkstation Working Hour` (
  `name` varchar(140) NOT NULL,
  `creation` datetime(6) DEFAULT NULL,
  `modified` datetime(6) DEFAULT NULL,
  `modified_by` varchar(140) DEFAULT NULL,
  `owner` varchar(140) DEFAULT NULL,
  `docstatus` int(1) NOT NULL DEFAULT 0,
  `idx` int(8) NOT NULL DEFAULT 0,
  `start_time` time(6) DEFAULT NULL,
  `hours` decimal(21,9) NOT NULL DEFAULT 0.000000000,
  `end_time` time(6) DEFAULT NULL,
  `enabled` int(1) NOT NULL DEFAULT 1,
  `parent` varchar(140) DEFAULT NULL,
  `parentfield` varchar(140) DEFAULT NULL,
  `parenttype` varchar(140) DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `parent` (`parent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.web_form_list_column_id_seq
CREATE TABLE IF NOT EXISTS `web_form_list_column_id_seq` (
  `next_not_cached_value` bigint(21) NOT NULL,
  `minimum_value` bigint(21) NOT NULL,
  `maximum_value` bigint(21) NOT NULL,
  `start_value` bigint(21) NOT NULL COMMENT 'start value when sequences is created or value if RESTART is used',
  `increment` bigint(21) NOT NULL COMMENT 'increment value',
  `cache_size` bigint(21) unsigned NOT NULL,
  `cycle_option` tinyint(1) unsigned NOT NULL COMMENT '0 if no cycles are allowed, 1 if the sequence should begin a new cycle when maximum_value is passed',
  `cycle_count` bigint(21) NOT NULL COMMENT 'How many cycles have been done'
) ENGINE=InnoDB SEQUENCE=1;

-- Data exporting was unselected.

-- Dumping structure for table frappe.__Auth
CREATE TABLE IF NOT EXISTS `__Auth` (
  `doctype` varchar(140) NOT NULL,
  `name` varchar(255) NOT NULL,
  `fieldname` varchar(140) NOT NULL,
  `password` text NOT NULL,
  `encrypted` int(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`doctype`,`name`,`fieldname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Data exporting was unselected.

-- Dumping structure for table frappe.__global_search
CREATE TABLE IF NOT EXISTS `__global_search` (
  `doctype` varchar(100) DEFAULT NULL,
  `name` varchar(140) DEFAULT NULL,
  `title` varchar(140) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `route` varchar(140) DEFAULT NULL,
  `published` int(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `doctype_name` (`doctype`,`name`),
  FULLTEXT KEY `content` (`content`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table frappe.__UserSettings
CREATE TABLE IF NOT EXISTS `__UserSettings` (
  `user` varchar(180) NOT NULL,
  `doctype` varchar(180) NOT NULL,
  `data` text DEFAULT NULL,
  UNIQUE KEY `user` (`user`,`doctype`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
