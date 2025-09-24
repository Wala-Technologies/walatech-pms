# WalaTech Accounting Module - Database Schema Documentation

## Overview
This document provides a comprehensive guide to the WalaTech Accounting module's database schema, including tables, relationships, and foreign key constraints. This documentation is essential for developers working on reimplementing or integrating with the WalaTech accounting system.

## Table of Contents
- [1. Core Accounting Tables](#1-core-accounting-tables)
  - [1.1 Account](#11-account)
  - [1.2 GL Entry](#12-gl-entry)
  - [1.3 Journal Entry](#13-journal-entry)
  - [1.4 Payment Entry](#14-payment-entry)
  - [1.5 Cost Center](#15-cost-center)
- [2. Key Relationships](#2-key-relationships)
- [3. Example Queries](#3-example-queries)
- [4. Performance Considerations](#4-performance-considerations)
- [5. Security and Access Control](#5-security-and-access-control)

## 1. Core Accounting Tables

### 1.1 Account
Primary table for storing chart of accounts.

**Table Name:** `tabAccount`

**Purpose:** Represents the chart of accounts structure for a company.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `account_name` | varchar(255) | Name of the account |
| `account_number` | varchar(255) | Account number |
| `account_type` | varchar(140) | Type of account (e.g., Bank, Expense, Income) |
| `root_type` | varchar(140) | Root type (Asset, Liability, Income, Expense, Equity) |
| `parent_account` | varchar(255) | Parent account in the hierarchy |
| `is_group` | int(1) | Whether this is a group account |
| `company` | varchar(255) | Company this account belongs to |
| `account_currency` | varchar(255) | Currency of the account |
| `tax_rate` | decimal(21,9) | Default tax rate |
| `report_type` | varchar(140) | Balance Sheet/Profit and Loss |
| `modified_by` | varchar(255) | User who last modified the record |
| `owner` | varchar(255) | User who created the record |

**Foreign Key Constraints:**
- `fk_account_currency` (`account_currency` → `tabCurrency.name`)
- `fk_account_company` (`company` → `tabCompany.name`)
- `fk_account_parent` (`parent_account` → `tabAccount.name`)
- `fk_account_modified_by` (`modified_by` → `tabUser.name`)
- `fk_account_owner` (`owner` → `tabUser.name`)

### 1.2 GL Entry
**Table Name:** `tabGL Entry`

**Purpose:** Records all financial transactions in a double-entry system.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `posting_date` | date | Date of the entry |
| `account` | varchar(255) | Link to Account |
| `debit` | decimal(21,9) | Debit amount |
| `credit` | decimal(21,9) | Credit amount |
| `voucher_type` | varchar(140) | Type of source document |
| `voucher_no` | varchar(255) | Reference to source document |
| `against_voucher_type` | varchar(140) | Type of document being referenced |
| `against_voucher` | varchar(255) | Document being referenced |
| `cost_center` | varchar(255) | Cost center |
| `project` | varchar(255) | Project |
| `fiscal_year` | varchar(255) | Fiscal year |
| `company` | varchar(255) | Company |
| `is_cancelled` | int(1) | Whether entry is cancelled |
| `is_opening` | int(1) | Whether this is an opening entry |
| `modified_by` | varchar(255) | User who last modified the record |
| `owner` | varchar(255) | User who created the record |

**Foreign Key Constraints:**
- `fk_gl_account` (account → tabAccount)
- `fk_ge_account_currency` (account_currency → tabCurrency)
- `fk_gl_entry_company` (company → tabCompany)
- `fk_gl_entry_cost_center` (cost_center → tabCost Center)
- `fk_gle_project` (project → tabProject)
- `fk_ge_transaction_currency` (transaction_currency → tabCurrency)

### 1.3 Journal Entry
Records manual journal entries.

**Key Columns:**
- `name` (PK): Unique identifier
- `voucher_type`: Always 'Journal Entry'
- `posting_date`: Date of the journal entry
- `company`: Reference to `tabCompany`
- `total_debit`: Sum of all debit amounts
- `total_credit`: Sum of all credit amounts
- `tax_withholding_category`: Reference to `tabTax Withholding Category`
- `multi_currency`: Boolean for multi-currency entries

**Foreign Key Constraints:**
- `fk_journal_entry_company` (company → tabCompany)
- `fk_je_company` (company → tabCompany)
- `fk_je_tax_withholding_category` (tax_withholding_category → tabTax Withholding Category)
- `fk_je_voucher_type` (voucher_type → tabDocType)

### 4. tabJournal Entry Account
Child table of `tabJournal Entry` containing account entries.

**Key Columns:**
- `name` (PK): Unique identifier
- `parent`: Reference to parent `tabJournal Entry`
- `account`: Reference to `tabAccount`
- `debit`: Debit amount
- `credit`: Credit amount
- `account_currency`: Reference to `tabCurrency`
- `cost_center`: Reference to `tabCost Center`
- `project`: Reference to `tabProject`
- `reference_type`: Type of reference document
- `reference_name`: Reference to document

**Foreign Key Constraints:**
- `fk_journal_account` (account → tabAccount)
- `fk_jea_account_currency` (account_currency → tabCurrency)
- `fk_jea_cost_center` (cost_center → tabCost Center)
- `fk_jea_journal_entry` (parent → tabJournal Entry)
- `fk_jea_project` (project → tabProject)

### 5. tabPayment Entry
Records all payments and receipts.

**Key Columns:**
- `name` (PK): Unique identifier
- `payment_type`: Pay/Receive/Internal Transfer
- `posting_date`: Date of payment
- `company`: Reference to `tabCompany`
- `mode_of_payment`: Payment method
- `party_type`: Customer/Supplier/Employee/Student/etc.
- `party`: Reference to the party
- `paid_amount`: Amount paid
- `received_amount`: Amount received
- `reference_no`: External reference
- `reference_date`: Date of reference
- `paid_from`: Reference to `tabAccount`
- `paid_to`: Reference to `tabAccount`
- `cost_center`: Reference to `tabCost Center`
- `project`: Reference to `tabProject`

**Foreign Key Constraints:**
- `fk_pe_company` (company → tabCompany)
- `fk_payment_account` (paid_from → tabAccount)
- `fk_pe_cost_center` (cost_center → tabCost Center)
- `fk_pe_project` (project → tabProject)
- `fk_pe_tax_withholding_category` (tax_withholding_category → tabTax Withholding Category)

### 6. tabCost Center
Stores cost centers for accounting.

**Key Columns:**
- `name` (PK): Unique identifier
- `cost_center_name`: Display name
- `parent_cost_center`: Self-referential for hierarchy
- `company`: Reference to `tabCompany`
- `is_group`: Boolean indicating if this is a group
- `disabled`: Boolean for active/inactive

**Foreign Key Constraints:**
- `fk_costcenter_company` (company → tabCompany)
- `fk_cost_center_company` (company → tabCompany)

## Key Relationships

### 1. Account Hierarchy
- `tabAccount` has a self-referential relationship via `parent_account`
- Accounts are organized in a tree structure with `is_group` flag
- Root accounts are determined by `root_type`

### 2. Double-Entry Accounting
- Every transaction affects at least two accounts (debit and credit)
- `tabGL Entry` stores both sides of each transaction
- `tabJournal Entry` groups related GL Entries

### 3. Payment Processing
- `tabPayment Entry` records cash/bank transactions
- References accounts for both source and destination
- Can be linked to invoices and other documents

## Common Queries

### Get Account Balance
```sql
SELECT 
    a.name, 
    a.account_name,
    SUM(gle.debit - gle.credit) as balance
FROM 
    `tabAccount` a
LEFT JOIN 
    `tabGL Entry` gle ON gle.account = a.name
WHERE 
    a.company = 'YOUR_COMPANY'
    AND gle.is_cancelled = 0
GROUP BY 
    a.name, a.account_name
HAVING 
    balance != 0
ORDER BY 
    a.name;
```

### Get Trial Balance
```sql
SELECT 
    a.name as account,
    a.account_name,
    a.account_number,
    a.root_type,
    a.report_type,
    SUM(IFNULL(gle.debit, 0)) as total_debit,
    SUM(IFNULL(gle.credit, 0)) as total_credit,
    (SUM(IFNULL(gle.debit, 0)) - SUM(IFNULL(gle.credit, 0))) as balance
FROM 
    `tabAccount` a
LEFT JOIN 
    `tabGL Entry` gle ON gle.account = a.name 
    AND gle.is_cancelled = 0
    AND gle.posting_date <= '2023-12-31'
WHERE 
    a.company = 'YOUR_COMPANY'
    AND a.is_group = 0
GROUP BY 
    a.name, a.account_name, a.account_number, a.root_type, a.report_type
HAVING 
    balance != 0
ORDER BY 
    a.root_type, a.name;
```

### Get General Ledger for an Account
```sql
SELECT 
    gle.posting_date,
    gle.voucher_type,
    gle.voucher_no,
    gle.against_voucher_type,
    gle.against_voucher,
    gle.debit,
    gle.credit,
    gle.debit - gle.credit as balance,
    gle.remarks
FROM 
    `tabGL Entry` gle
WHERE 
    gle.account = 'YOUR_ACCOUNT'
    AND gle.company = 'YOUR_COMPANY'
    AND gle.is_cancelled = 0
    AND gle.posting_date BETWEEN '2023-01-01' AND '2023-12-31'
ORDER BY 
    gle.posting_date, gle.creation;
```

## Integration Points

### 1. Inventory Integration
- Stock transactions automatically create GL Entries
- Valuation accounts are linked to inventory items
- Cost centers can be set at warehouse level

### 2. Sales/Purchase Integration
- Invoices create receivable/payable entries
- Payments are matched against invoices
- Tax accounts are linked to tax templates

### 3. Asset Management
- Asset acquisition creates GL Entries
- Depreciation is posted through journal entries
- Disposal creates gain/loss entries

## Best Practices

### 1. Data Integrity
- Always use foreign key constraints
- Validate account types before posting
- Implement proper transaction handling

### 2. Performance
- Index frequently queried columns
- Archive old GL entries
- Use fiscal year closing for better performance

### 3. Security
- Implement proper access controls
- Audit sensitive operations
- Maintain change logs for critical tables

## Advanced Accounting Features

### 1. Tax Management

#### 1.1 Tax Categories and Templates
- `tabTax Category`: Defines tax categories (e.g., GST, VAT, Sales Tax)
- `tabSales Taxes and Charges Template`: Templates for sales transactions
- `tabPurchase Taxes and Charges Template`: Templates for purchase transactions

**Key Tables:**
- `tabSales Taxes and Charges`
- `tabPurchase Taxes and Charges`
- `tabTax Rule`

#### 1.2 Tax Calculation and Posting
- Tax calculation based on item tax templates
- Automatic tax account postings
- Tax adjustments and corrections

### 2. Bank Reconciliation

#### 2.1 Bank Transaction Matching
- `tabBank Transaction`: Imported bank statements
- `tabBank Transaction Entry`: Matched accounting entries
- `tabBank Clearance Detail`: Reconciliation details

#### 2.2 Reconciliation Process
1. Import bank statements
2. Match with existing payments/receipts
3. Create missing payment entries
4. Reconcile and post entries

### 3. Financial Reporting

#### 3.1 Standard Reports
- Trial Balance
- Profit and Loss Statement
- Balance Sheet
- Cash Flow Statement
- General Ledger

#### 3.2 Custom Financial Reports
- Using `tabReport` for custom reports
- Financial analytics with `tabFinancial Analytics`
- Budget vs Actual reports

## Performance Optimization

### 1. Database Indexing
```sql
-- Recommended indexes for large deployments
CREATE INDEX idx_gl_entry_account_posting_date ON `tabGL Entry`(account, posting_date);
CREATE INDEX idx_gl_entry_voucher ON `tabGL Entry`(voucher_type, voucher_no);
CREATE INDEX idx_payment_entry_party ON `tabPayment Entry`(party_type, party);
```

### 2. Archiving Strategy
- Archive GL entries older than 3 years
- Move closed fiscal year data to archive tables
- Implement monthly summary tables for reporting

## Troubleshooting

### Common Issues
1. **Mismatched Debits/Credits**
   - Check that all journal entries balance
   - Verify that all GL entries have proper accounts
   - Run: `SELECT voucher_type, voucher_no, SUM(debit)-SUM(credit) as diff FROM `tabGL Entry` WHERE is_cancelled=0 GROUP BY voucher_type, voucher_no HAVING ROUND(diff, 2) != 0;`

2. **Missing GL Entries**
   - Check if the document is submitted
   - Verify that the posting date is within an open fiscal year
   - Check `tabGL Entry` for entries with `is_cancelled=1`

3. **Incorrect Account Balances**
   - Check for unposted documents
   - Verify that all GL entries are properly linked
   - Look for cancelled entries that might affect balances
   - Run account balance verification:
     ```sql
     SELECT 
         a.name, 
         a.account_name,
         (SELECT IFNULL(SUM(debit-credit), 0) 
          FROM `tabGL Entry` 
          WHERE account = a.name 
          AND is_cancelled = 0) as calculated_balance
     FROM `tabAccount` a
     WHERE a.company = 'YOUR_COMPANY';
     ```

4. **Bank Reconciliation Issues**
   - Verify bank account settings
   - Check for duplicate transactions
   - Ensure proper date formats in bank statements
   - Look for unlinked payment entries

## API Integration Examples

### 1. Create Journal Entry
```python
import frappe

def create_journal_entry(accounts, posting_date, company, user_remark=None):
    """
    Create a journal entry
    accounts: List of dicts with 'account', 'debit', 'credit', 'cost_center'
    """
    jv = frappe.new_doc("Journal Entry")
    jv.posting_date = posting_date
    jv.company = company
    jv.user_remark = user_remark or "Auto-created Journal Entry"
    
    for acc in accounts:
        jv.append("accounts", {
            "account": acc["account"],
            "debit_in_account_currency": acc.get("debit", 0),
            "credit_in_account_currency": acc.get("credit", 0),
            "cost_center": acc.get("cost_center"),
            "project": acc.get("project")
        })
    
    jv.submit()
    return jv.name
```

### 2. Get Account Balance
```python
def get_account_balance(account, company, date=None):
    """Get account balance up to a specific date"""
    filters = {
        "account": account,
        "company": company,
        "is_cancelled": 0
    }
    
    if date:
        filters["posting_date"] = ["<=", date]
    
    gl_entries = frappe.get_all(
        "GL Entry",
        filters=filters,
        fields=["SUM(debit) as total_debit", "SUM(credit) as total_credit"]
    )
    
    if gl_entries:
        return (gl_entries[0].get("total_debit") or 0) - (gl_entries[0].get("total_credit") or 0)
    return 0
```

## Security Considerations

1. **Access Control**
   - Set proper roles and permissions
   - Restrict access to sensitive financial data
   - Implement approval workflows for critical operations

2. **Audit Trail**
   - Enable audit trail for accounting documents
   - Track changes to master data (accounts, cost centers)
   - Maintain logs of all financial transactions

3. **Data Validation**
   - Validate all monetary inputs
   - Implement proper error handling
   - Use database constraints for data integrity

## Future Enhancements

1. **Multi-currency Support**
   - Handle multiple currencies in transactions
   - Automatic currency conversion
   - Realized/unrealized gains/losses

2. **Advanced Reporting**
   - Custom financial statements
   - Department-wise profitability
   - Project-wise financials

3. **Integration**
   - Bank API integration
   - Payment gateway integration
   - Tax calculation services

## Additional Resources

1. [WalaTech Accounting Documentation](https://docs.WalaTech.com/docs/v13/user/manual/en/accounting)
2. [Chart of Accounts Setup](https://docs.WalaTech.com/docs/v13/user/manual/en/accounts/chart-of-accounts)
3. [Journal Entries](https://docs.WalaTech.com/docs/v13/user/manual/en/accounts/journal-entry)
4. [Payment Entry](https://docs.WalaTech.com/docs/v13/user/manual/en/accounts/payment-entry)
