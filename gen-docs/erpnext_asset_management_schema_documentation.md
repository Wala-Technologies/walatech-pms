# WalaTech Asset Management Module - Database Schema Documentation

## Overview
This document provides a comprehensive guide to the WalaTech Asset Management module's database schema, focusing on the tables, their relationships, and the foreign key constraints that enforce data integrity. This documentation is particularly useful for developers working on reimplementing or integrating with the WalaTech asset management system.

## Database Conventions

1. **Naming Conventions**:
   - Table names are prefixed with `tab` (e.g., `tabAsset`, `tabAsset Movement`)
   - Foreign key columns typically reference the `name` column of the related table
   - Constraint names follow the pattern `fk_[table_abbreviation]_[column_name]`

2. **Common Columns**:
   - `name`: Primary key (varchar)
   - `creation`: Timestamp of record creation
   - `modified`: Timestamp of last modification
   - `modified_by`: User who last modified the record
   - `owner`: User who created the record
   - `docstatus`: Document status (0=Draft, 1=Submitted, 2=Cancelled)
   - `idx`: Index for ordering
   - `_user_tags`: Comma-separated user tags
   - `_comments`: Comments on the document
   - `_assign`: Assignment information
   - `_liked_by`: Users who have liked the document

## Core Tables and Relationships

### 1. tabAsset
Primary table for tracking fixed assets.

**Key Columns:**
- `name` (PK): Unique identifier
- `asset_name`: Display name of the asset
- `asset_category`: Reference to `tabAsset Category`
- `company`: Reference to `tabCompany`
- `cost_center`: Reference to `tabCost Center`
- `department`: Reference to `tabDepartment`
- `location`: Reference to `tabLocation`
- `supplier`: Reference to `tabSupplier`
- `purchase_invoice`: Reference to `tabPurchase Invoice`
- `purchase_receipt`: Reference to `tabPurchase Receipt`
- `default_finance_book`: Reference to `tabFinance Book`
- `gross_purchase_amount`: Decimal value
- `total_asset_cost`: Decimal value
- `status`: Current status (e.g., 'Draft', 'Submitted', 'Partially Depreciated', 'Fully Depreciated', 'Sold', 'Scrapped')

**Foreign Key Constraints:**
- `fk_asset_company` (company → tabCompany) - Ensures the company exists
- `fk_asset_customer` (customer → tabCustomer) - Optional customer reference
- `fk_asset_asset_category` (asset_category → tabAsset Category) - Categorization
- `fk_asset_cost_center` (cost_center → tabCost Center) - Cost center assignment
- `fk_asset_department` (department → tabDepartment) - Department assignment
- `fk_asset_location` (location → tabLocation) - Physical location
- `fk_asset_purchase_invoice` (purchase_invoice → tabPurchase Invoice) - Source document
- `fk_asset_purchase_receipt` (purchase_receipt → tabPurchase Receipt) - Receipt document
- `fk_asset_supplier` (supplier → tabSupplier) - Vendor information
- `fk_asset_default_finance_book` (default_finance_book → tabFinance Book) - Financial tracking

### 2. tabAsset Movement
Tracks the movement of assets between locations, custodians, or departments.

**Key Columns:**
- `purpose`: Purpose of movement (e.g., 'Transfer', 'Repair', 'Calibration')
- `company`: Reference to `tabCompany`
- `transaction_date`: Date of movement
- `reference_doctype`: Type of reference document
- `reference_name`: Reference document name

**Foreign Key Constraints:**
- `fk_asset_movement_company` (company → tabCompany)

### 3. tabAsset Movement Item
Child table of `tabAsset Movement` containing the actual assets being moved.

**Key Columns:**
- `parent`: Reference to parent `tabAsset Movement`
- `asset`: Reference to `tabAsset`
- `source_location`: Reference to `tabLocation` (from)
- `target_location`: Reference to `tabLocation` (to)
- `from_employee`: Reference to `tabEmployee` (from)
- `to_employee`: Reference to `tabEmployee` (to)

**Foreign Key Constraints:**
- `fk_ami_asset` (asset → tabAsset)
- `fk_ami_source_location` (source_location → tabLocation)
- `fk_ami_target_location` (target_location → tabLocation)
- `fk_ami_from_employee` (from_employee → tabEmployee)
- `fk_ami_to_employee` (to_employee → tabEmployee)

### 4. tabAsset Capitalization
Tracks the capitalization of expenses into asset values.

**Key Columns:**
- `company`: Reference to `tabCompany`
- `target_asset`: Reference to `tabAsset`
- `cost_center`: Reference to `tabCost Center`
- `finance_book`: Reference to `tabFinance Book`
- `total_value`: Total capitalized amount
- `posting_date`: Date of capitalization

**Foreign Key Constraints:**
- `fk_asset_capitalization_company` (company → tabCompany)
- `fk_asset_capitalization_cost_center` (cost_center → tabCost Center)
- `fk_asset_capitalization_finance_book` (finance_book → tabFinance Book)
- `fk_asset_capitalization_target_asset` (target_asset → tabAsset)

### 5. tabAsset Depreciation Schedule
Tracks depreciation calculations for assets.

**Key Columns:**
- `asset`: Reference to `tabAsset`
- `company`: Reference to `tabCompany`
- `finance_book`: Reference to `tabFinance Book`
- `depreciation_method`: Method of depreciation (e.g., 'Straight Line', 'Double Declining Balance')
- `total_number_of_depreciations`: Total number of depreciation periods
- `frequency_of_depreciation`: Frequency in months
- `next_depreciation_date`: Next scheduled depreciation

**Foreign Key Constraints:**
- `fk_ads_asset` (asset → tabAsset)
- `fk_ads_company` (company → tabCompany)
- `fk_ads_finance_book` (finance_book → tabFinance Book)

### 6. tabAsset Repair
Tracks repairs and maintenance activities for assets.

**Key Columns:**
- `asset`: Reference to `tabAsset`
- `company`: Reference to `tabCompany`
- `purchase_invoice`: Reference to `tabPurchase Invoice` for repair costs
- `repair_status`: Current status (e.g., 'Pending', 'Completed', 'Cancelled')
- `completion_date`: When repair was completed
- `repair_cost`: Total cost of repair

**Foreign Key Constraints:**
- `fk_ar_asset` (asset → tabAsset)
- `fk_ar_company` (company → tabCompany)
- `fk_ar_purchase_invoice` (purchase_invoice → tabPurchase Invoice)

### 7. tabAsset Value Adjustment
Records adjustments to asset values.

**Key Columns:**
- `asset`: Reference to `tabAsset`
- `company`: Reference to `tabCompany`
- `asset_category`: Reference to `tabAsset Category`
- `cost_center`: Reference to `tabCost Center`
- `finance_book`: Reference to `tabFinance Book`
- `current_asset_value`: Current book value
- `new_asset_value`: New book value after adjustment

**Foreign Key Constraints:**
- `fk_ava_asset` (asset → tabAsset)
- `fk_ava_company` (company → tabCompany)
- `fk_ava_asset_category` (asset_category → tabAsset Category)
- `fk_ava_cost_center` (cost_center → tabCost Center)
- `fk_ava_finance_book` (finance_book → tabFinance Book)

## Important Relationships

### Asset Lifecycle
1. **Acquisition**: 
   - Asset created with purchase details (invoice, receipt)
   - Initial value set based on purchase amount
   - Assigned to location, department, and cost center

2. **Depreciation**:
   - Depreciation schedule created based on asset category settings
   - Periodic depreciation entries reduce asset value
   - Tracked in `tabAsset Depreciation Schedule`

3. **Maintenance**:
   - Repairs and maintenance recorded in `tabAsset Repair`
   - Maintenance tasks scheduled in `tabAsset Maintenance`
   - Maintenance logs track service history

4. **Movement**:
   - Changes in location, custodian, or department tracked in `tabAsset Movement`
   - Each movement can involve multiple assets

5. **Value Adjustment**:
   - Changes in asset value recorded in `tabAsset Value Adjustment`
   - Adjustments affect depreciation calculations

6. **Disposal**:
   - Asset status updated to 'Sold' or 'Scrapped'
   - Final depreciation entry posted
   - Gain/loss on disposal calculated

## Advanced Asset Management Features

### 1. Depreciation Management

#### 1.1 Depreciation Methods
- **Straight Line**: Equal depreciation amount per period
- **Double Declining Balance**: Accelerated depreciation method
- **Written Down Value**: Depreciation on the remaining book value
- **Manual**: Custom depreciation amounts

#### 1.2 Depreciation Schedules
- Multiple schedules per asset (different finance books)
- Partial year depreciation
- Prorated first and last period calculations
- Automatic vs. manual depreciation posting

### 2. Maintenance Management

#### 2.1 Maintenance Schedules
- Time-based maintenance scheduling
- Usage-based maintenance triggers
- Maintenance team assignments
- Parts and materials tracking

#### 2.2 Maintenance Tasks
- Checklist management
- Time tracking
- Cost tracking
- Downtime recording

### 3. Asset Tracking

#### 3.1 Barcoding & QR Codes
- Asset identification
- Mobile scanning
- Quick status updates
- Audit trails

#### 3.2 Location Tracking
- Current and historical locations
- Custodian assignments
- Department transfers
- Geofencing

## Common Queries

### 1. Get All Assets with Current Values
```sql
SELECT 
    a.name, 
    a.asset_name, 
    a.asset_category,
    a.total_asset_cost as original_cost,
    a.value_after_depreciation as current_value,
    a.department,
    a.location,
    a.status
FROM 
    `tabAsset` a
WHERE 
    a.docstatus = 1
    AND a.status NOT IN ('Scrapped', 'Sold');
```

### Get Asset Depreciation Schedule
```sql
SELECT 
    ads.name,
    ads.schedule_date,
    ads.depreciation_amount,
    ads.accumulated_depreciation_amount,
    ads.journal_entry
FROM 
    `tabAsset Depreciation Schedule` ads
WHERE 
    ads.asset = 'ASSET-NAME-001'
    AND ads.docstatus = 1
ORDER BY 
    ads.schedule_date;
```

### Get Asset Maintenance History
```sql
SELECT 
    ar.name,
    ar.repair_status,
    ar.completion_date,
    ar.repair_cost,
    ar.description
FROM 
    `tabAsset Repair` ar
WHERE 
    ar.asset = 'ASSET-NAME-001'
    AND ar.docstatus = 1
ORDER BY 
    ar.completion_date DESC;
```

## Integration Points

1. **Accounting Integration**:
   - Asset acquisition creates GL entries for asset account (debit) and liability/expense account (credit)
   - Depreciation entries debit depreciation expense and credit accumulated depreciation
   - Disposal entries remove asset and accumulated depreciation, record gain/loss

2. **Inventory Integration**:
   - Assets can be linked to inventory items
   - Stock entries can be created for asset components

3. **Purchase Integration**:
   - Assets can be created from purchase invoices/receipts
   - Purchase documents can be linked to assets

4. **HR Integration**:
   - Assets can be assigned to employees
   - Employee movements can trigger asset transfers

## Best Practices for Development

1. **Data Integrity**:
   - Always use foreign key constraints to maintain referential integrity
   - Implement proper transaction handling for multi-table operations
   - Use database-level constraints for validation

## Performance Optimization

### 1. Database Indexing
```sql
-- Recommended indexes for large deployments
CREATE INDEX idx_asset_company_status ON `tabAsset`(company, status);
CREATE INDEX idx_asset_depreciation_schedule ON `tabAsset Depreciation Schedule`(asset, schedule_date);
CREATE INDEX idx_asset_movement_date ON `tabAsset Movement`(transaction_date);
```

### 2. Archiving Strategy
- Archive disposed assets after retention period
- Move historical movements to archive tables
- Create materialized views for reports

## Integration Points

### 1. Accounting Integration
- Asset acquisition journal entries
- Depreciation postings
- Disposal gain/loss calculations
- Maintenance expense tracking

### 2. Purchasing Integration
- Asset creation from purchase receipts
- Capitalization of expenses
- Warranty tracking
- Supplier performance metrics

### 3. Project Integration
- Capital work in progress (CWIP)
- Project asset allocation
- Budget vs. actual tracking
- Capitalization schedules

## API Integration Examples

### 1. Create New Asset
```python
import frappe

def create_asset(asset_data):
    """
    Create a new asset
    asset_data: Dict containing asset details
    """
    asset = frappe.new_doc("Asset")
    asset.update(asset_data)
    asset.save()
    asset.submit()
    return asset.name
```

### 2. Calculate Depreciation
```python
def calculate_depreciation(asset_name, posting_date):
    """Calculate depreciation for an asset up to posting_date"""
    asset = frappe.get_doc("Asset", asset_name)
    return asset.calculate_depreciation(posting_date)
```

## Security Considerations

1. **Access Control**
   - Role-based access to asset management
   - Approval workflows for critical operations
   - Audit trails for all changes

2. **Data Validation**
   - Validate asset values and depreciation rates
   - Enforce business rules for status changes
   - Prevent duplicate asset entries

## Future Enhancements

1. **Predictive Maintenance**
   - IoT sensor integration
   - Machine learning for failure prediction
   - Automated maintenance scheduling

2. **Advanced Reporting**
   - Asset utilization dashboards
   - Total cost of ownership analysis
   - Maintenance cost trends

3. **Mobile Features**
   - Barcode/QR code scanning
   - Field service integration
   - Photo documentation

## Additional Resources

1. [WalaTech Asset Documentation](https://docs.WalaTech.com/docs/v13/user/manual/en/asset)
2. [Fixed Asset Management Best Practices](https://www.iapsm.org/)
3. [IFRS 16 & ASC 842 Compliance](https://www.ifrs.org/)

## Troubleshooting

### Common Issues
1. **Depreciation Not Calculating**
   - Check fiscal year and posting date
   - Verify asset is in 'Submitted' status
   - Confirm depreciation schedule exists

2. **Asset Movement Errors**
   - Validate source and target locations
   - Check required fields for movement type
   - Verify user permissions

3. **Valuation Mismatches**
   - Review all value adjustments
   - Check for unposted depreciation
   - Verify accounting entries

## Performance Considerations**
   - Index frequently queried columns
   - Consider denormalization for reporting tables
   - Use views for complex queries
   - Schedule heavy operations during off-peak hours

3. **Audit Trail**:
   - Maintain history of all changes to asset values
   - Track who made changes and when
   - Document reasons for adjustments

4. **Security**:
   - Implement row-level security based on company and department
   - Restrict sensitive operations to authorized users
   - Log all significant changes

## Troubleshooting

### Common Issues and Solutions

1. **Foreign Key Constraint Violations**:
   - Error 1452: Cannot add or update a child row
   - Solution: Ensure referenced records exist before creating relationships

2. **Performance Issues with Large Asset Bases**:
   - Problem: Slow queries with many assets
   - Solution: Add appropriate indexes, consider partitioning large tables

3. **Incorrect Depreciation Calculations**:
   - Problem: Depreciation amounts don't match expected values
   - Solution: Verify asset category settings, check for manual adjustments

4. **Missing Reference Documents**:
   - Problem: Purchase invoices or receipts linked to assets are missing
   - Solution: Check document workflow, ensure proper linking during creation

## Conclusion
This documentation provides a comprehensive overview of the WalaTech Asset Management module's database schema. The foreign key constraints we've added ensure data integrity and make the relationships between tables explicit. When redeveloping or integrating with this system, be sure to respect these relationships and maintain the data consistency they enforce.
