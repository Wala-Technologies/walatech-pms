-- Script to analyze core accounting tables and their relationships

-- 1. List core accounting tables
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH/1024/1024 as size_mb,
    CREATE_TIME,
    UPDATE_TIME
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = 'frappe' 
    AND TABLE_NAME IN (
        'tabAccount',
        'tabGL Entry',
        'tabJournal Entry',
        'tabJournal Entry Account',
        'tabPayment Entry',
        'tabPayment Entry Reference',
        'tabPayment Ledger Entry',
        'tabFiscal Year',
        'tabCost Center',
        'tabBudget',
        'tabBudget Account',
        'tabTax Rule',
        'tabTax Category',
        'tabTax Withholding Category',
        'tabAccount Closing Balance',
        'tabPeriod Closing Voucher'
    )
ORDER BY 
    TABLE_NAME;

-- 2. Get foreign key relationships for these tables
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = 'frappe' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
    AND TABLE_NAME IN (
        'tabAccount',
        'tabGL Entry',
        'tabJournal Entry',
        'tabJournal Entry Account',
        'tabPayment Entry',
        'tabPayment Entry Reference',
        'tabPayment Ledger Entry',
        'tabFiscal Year',
        'tabCost Center',
        'tabBudget',
        'tabBudget Account',
        'tabTax Rule',
        'tabTax Category',
        'tabTax Withholding Category',
        'tabAccount Closing Balance',
        'tabPeriod Closing Voucher'
    )
ORDER BY 
    TABLE_NAME, COLUMN_NAME;
