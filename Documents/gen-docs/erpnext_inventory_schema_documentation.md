# WalaTech Inventory Management - Database Schema Documentation

## Table of Contents
- [1. Core Inventory Tables](#1-core-inventory-tables)
  - [1.1 Item](#11-item)
  - [1.2 Warehouse](#12-warehouse)
  - [1.3 Bin](#13-bin)
- [2. Stock Transactions](#2-stock-transactions)
  - [2.1 Stock Entry](#21-stock-entry)
  - [2.2 Stock Entry Detail](#22-stock-entry-detail)
  - [2.3 Stock Ledger Entry](#23-stock-ledger-entry)
- [3. Serial and Batch Management](#3-serial-and-batch-management)
  - [3.1 Serial No](#31-serial-no)
  - [3.2 Batch](#32-batch)
- [4. Inventory Valuation](#4-inventory-valuation)
  - [4.1 Stock Reconciliation](#41-stock-reconciliation)
  - [4.2 Stock Reconciliation Item](#42-stock-reconciliation-item)
  - [4.3 Stock Ledger Entry](#43-stock-ledger-entry-1)
- [5. Key Relationships](#5-key-relationships)
- [6. Example Queries](#6-example-queries)

## 1. Core Inventory Tables

### 1.1 Item

**Table Name:** `tabItem`

**Description:** Master table containing all items that can be bought, sold, or manufactured.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, item code |
| `item_name` | varchar(255) | Name of the item |
| `item_group` | varchar(255) | Category of the item |
| `stock_uom` | varchar(255) | Stock keeping unit of measure |
| `is_stock_item` | int(1) | Whether this is a stock item |
| `has_serial_no` | int(1) | Whether item is tracked by serial number |
| `has_batch_no` | int(1) | Whether item is tracked by batch number |
| `has_variants` | int(1) | Whether item has variants |
| `is_purchase_item` | int(1) | Can be purchased |
| `is_sales_item` | int(1) | Can be sold |
| `is_sub_contracted_item` | int(1) | Can be subcontracted |
| `is_asset_item` | int(1) | Is a fixed asset |
| `inspection_required_before_purchase` | int(1) | Quality check required for purchase |
| `inspection_required_before_delivery` | int(1) | Quality check required before delivery |
| `min_order_qty` | decimal(21,9) | Minimum order quantity |
| `safety_stock` | decimal(21,9) | Safety stock level |
| `lead_time_days` | int(11) | Lead time in days |
| `last_purchase_rate` | decimal(21,9) | Last purchase rate |
| `standard_rate` | decimal(21,9) | Standard purchase rate |
| `valuation_rate` | decimal(21,9) | Current valuation rate |
| `weight_per_unit` | decimal(21,9) | Weight per unit |
| `weight_uom` | varchar(255) | Unit of measure for weight |
| `disabled` | int(1) | Whether item is disabled |
| `stock_uom` | varchar(255) | Stock keeping unit of measure |
| `default_material_request_type` | varchar(140) | Default material request type |

### 1.2 Warehouse

**Table Name:** `tabWarehouse`

**Description:** Stores information about physical locations where inventory is stored.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, warehouse name |
| `warehouse_name` | varchar(255) | Display name of warehouse |
| `parent_warehouse` | varchar(255) | Parent warehouse (for hierarchy) |
| `is_group` | int(1) | Whether this is a group node |
| `company` | varchar(255) | Company this warehouse belongs to |
| `account` | varchar(255) | Link to stock account in Chart of Accounts |
| `email_id` | varchar(255) | Email address for notifications |
| `phone_no` | varchar(255) | Contact number |
| `disabled` | int(1) | Whether warehouse is disabled |
| `address_line_1` | text | Address line 1 |
| `address_line_2` | text | Address line 2 |
| `city` | varchar(255) | City |
| `state` | varchar(255) | State/Province |
| `country` | varchar(255) | Country |
| `pincode` | varchar(255) | Postal/ZIP code |

### 1.3 Bin

**Table Name:** `tabBin`

**Description:** Tracks inventory levels for each item-warehouse combination.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key (auto-generated) |
| `item_code` | varchar(255) | Link to Item |
| `warehouse` | varchar(255) | Link to Warehouse |
| `actual_qty` | decimal(21,9) | Current stock quantity |
| `reserved_qty` | decimal(21,9) | Quantity reserved for sales orders |
| `ordered_qty` | decimal(21,9) | Quantity ordered in purchase orders |
| `indented_qty` | decimal(21,9) | Quantity in material requests |
| `planned_qty` | decimal(21,9) | Quantity in production plans |
| `projected_qty` | decimal(21,9) | Projected quantity (actual + ordered - reserved) |
| `valuation_rate` | decimal(21,9) | Weighted average valuation rate |
| `stock_value` | decimal(21,9) | Total stock value (actual_qty * valuation_rate) |
| `stock_uom` | varchar(255) | Stock UOM of the item |
| `stock_value_difference` | decimal(21,9) | Difference in stock value from last transaction |
| `ordered_value` | decimal(21,9) | Value of ordered quantity |
| `reserved_value` | decimal(21,9) | Value of reserved quantity |
| `company` | varchar(255) | Company this bin belongs to |

## 2. Stock Transactions

### 2.1 Stock Entry

**Table Name:** `tabStock Entry`

**Description:** Records all stock transfers, manufacturing, material consumption, and production.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `stock_entry_type` | varchar(255) | Type of stock entry |
| `posting_date` | date | Date of posting |
| `posting_time` | time | Time of posting |
| `purpose` | varchar(255) | Purpose of stock entry |
| `company` | varchar(255) | Company |
| `from_warehouse` | varchar(255) | Source warehouse |
| `to_warehouse` | varchar(255) | Target warehouse |
| `total_outgoing_value` | decimal(21,9) | Total value of outgoing items |
| `total_incoming_value` | decimal(21,9) | Total value of incoming items |
| `total_amount` | decimal(21,9) | Total amount |
| `per_transferred` | decimal(21,9) | Percentage completed |
| `docstatus` | int(1) | Document status |
| `is_return` | int(1) | Is a return entry |
| `work_order` | varchar(255) | Link to Work Order |
| `material_request` | varchar(255) | Link to Material Request |
| `delivery_note_no` | varchar(255) | Link to Delivery Note |
| `purchase_receipt_no` | varchar(255) | Link to Purchase Receipt |
| `sales_invoice_no` | varchar(255) | Link to Sales Invoice |

### 2.2 Stock Entry Detail

**Table Name:** `tabStock Entry Detail`

**Description:** Line items for stock entries.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `parent` | varchar(255) | Link to parent Stock Entry |
| `item_code` | varchar(255) | Link to Item |
| `item_name` | varchar(255) | Name of the item |
| `qty` | decimal(21,9) | Quantity |
| `transfer_qty` | decimal(21,9) | Quantity in stock UOM |
| `uom` | varchar(255) | UOM of the item |
| `stock_uom` | varchar(255) | Stock UOM of the item |
| `conversion_factor` | decimal(21,9) | Conversion factor to stock UOM |
| `s_warehouse` | varchar(255) | Source warehouse |
| `t_warehouse` | varchar(255) | Target warehouse |
| `basic_rate` | decimal(21,9) | Valuation rate |
| `basic_amount` | decimal(21,9) | Total amount (qty * rate) |
| `batch_no` | varchar(255) | Batch number |
| `serial_no` | text | Serial numbers (newline separated) |
| `cost_center` | varchar(255) | Cost center |
| `expense_account` | varchar(255) | Expense account |
| `incoming_rate` | decimal(21,9) | Valuation rate for incoming items |

### 2.3 Stock Ledger Entry

**Table Name:** `tabStock Ledger Entry`

**Description:** Records all stock movements with detailed information.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `item_code` | varchar(255) | Link to Item |
| `warehouse` | varchar(255) | Warehouse |
| `posting_date` | date | Posting date |
| `posting_time` | time | Posting time |
| `voucher_type` | varchar(255) | Type of voucher |
| `voucher_no` | varchar(255) | Voucher number |
| `voucher_detail_no` | varchar(255) | Voucher detail number |
| `actual_qty` | decimal(21,9) | Quantity change |
| `qty_after_transaction` | decimal(21,9) | Quantity after transaction |
| `incoming_rate` | decimal(21,9) | Rate of incoming items |
| `outgoing_rate` | decimal(21,9) | Rate of outgoing items |
| `valuation_rate` | decimal(21,9) | New valuation rate after transaction |
| `stock_value` | decimal(21,9) | New stock value after transaction |
| `stock_value_difference` | decimal(21,9) | Difference in stock value |
| `company` | varchar(255) | Company |
| `stock_uom` | varchar(255) | Stock UOM of the item |
| `batch_no` | varchar(255) | Batch number |
| `serial_no` | text | Serial numbers |
| `fiscal_year` | varchar(255) | Fiscal year |

## 3. Serial and Batch Management

### 3.1 Serial No

**Table Name:** `tabSerial No`

**Description:** Tracks individual serial numbers for serialized items.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, serial number |
| `item_code` | varchar(255) | Link to Item |
| `item_name` | varchar(255) | Name of the item |
| `description` | text | Description |
| `item_group` | varchar(255) | Item group |
| `brand` | varchar(255) | Brand |
| `warehouse` | varchar(255) | Current warehouse |
| `purchase_document_no` | varchar(255) | Purchase document number |
| `purchase_date` | date | Purchase date |
| `purchase_rate` | decimal(21,9) | Purchase rate |
| `supplier` | varchar(255) | Supplier name |
| `warranty_expiry_date` | date | Warranty expiry date |
| `amc_expiry_date` | date | AMC expiry date |
| `delivery_document_type` | varchar(255) | Delivery document type |
| `delivery_document_no` | varchar(255) | Delivery document number |
| `delivery_date` | date | Delivery date |
| `sales_invoice` | varchar(255) | Link to Sales Invoice |
| `purchase_invoice` | varchar(255) | Link to Purchase Invoice |
| `company` | varchar(255) | Company |

### 3.2 Batch

**Table Name:** `tabBatch`

**Description:** Tracks batches of items with batch numbers.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, batch number |
| `item` | varchar(255) | Link to Item |
| `item_name` | varchar(255) | Name of the item |
| `batch_qty` | decimal(21,9) | Total batch quantity |
| `expiry_date` | date | Expiry date |
| `manufacturing_date` | date | Manufacturing date |
| `supplier` | varchar(255) | Supplier name |
| `reference_doctype` | varchar(255) | Reference document type |
| `reference_name` | varchar(255) | Reference document name |
| `stock_uom` | varchar(255) | Stock UOM of the item |
| `company` | varchar(255) | Company |

## 4. Inventory Valuation

### 4.1 Stock Reconciliation

**Table Name:** `tabStock Reconciliation`

**Description:** Used to reconcile actual physical stock with system stock.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `purpose` | varchar(255) | Purpose of reconciliation |
| `posting_date` | date | Posting date |
| `posting_time` | time | Posting time |
| `company` | varchar(255) | Company |
| `cost_center` | varchar(255) | Cost center |
| `expense_account` | varchar(255) | Expense account |
| `difference_amount` | decimal(21,9) | Difference amount |
| `total_amount` | decimal(21,9) | Total amount |
| `docstatus` | int(1) | Document status |

### 4.2 Stock Reconciliation Item

**Table Name:** `tabStock Reconciliation Item`

**Description:** Line items for stock reconciliation.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `parent` | varchar(255) | Link to parent Stock Reconciliation |
| `item_code` | varchar(255) | Link to Item |
| `warehouse` | varchar(255) | Warehouse |
| `qty` | decimal(21,9) | Quantity |
| `valuation_rate` | decimal(21,9) | Valuation rate |
| `amount` | decimal(21,9) | Amount (qty * rate) |
| `current_qty` | decimal(21,9) | Current system quantity |
| `current_valuation_rate` | decimal(21,9) | Current valuation rate |
| `current_amount` | decimal(21,9) | Current amount |
| `batch_no` | varchar(255) | Batch number |
| `serial_no` | text | Serial numbers |

### 4.3 Stock Ledger Entry (Valuation)

**Table Name:** `tabStock Ledger Entry`

**Description:** Already covered in section 2.3, but important for valuation.

## 5. Key Relationships and Workflows

### 5.1 Inventory Lifecycle
1. **Procurement**
   - Material Request → Purchase Order → Purchase Receipt → Stock Entry
   - Quality Inspection (if required) → Stock Entry

2. **Sales Fulfillment**
   - Sales Order → Delivery Note → Stock Entry (outgoing)
   - Packing Slip generation
   - Shipping integration

3. **Manufacturing**
   - Work Order → Material Transfer → Finished Goods Transfer
   - Subcontracting flows
   - Production Planning

4. **Inventory Management**
   - Stock Reconciliation
   - Batch/Serial Number Assignment
   - Stock Transfers (inter-warehouse)

### 5.2 Key Relationships
- **Item-Warehouse**: One-to-many (one item can be in multiple warehouses)
- **Item-Bin**: One-to-many (one item can have multiple bins in a warehouse)
- **Stock Entry-Stock Entry Detail**: One-to-many
- **Item-Batch/Serial**: One-to-many (one item can have multiple batches/serials)
- **Stock Entry-Stock Ledger Entry**: One-to-many

1. **Item to Bin**
   - `tabItem.name` → `tabBin.item_code`
   - One-to-many relationship (one item can be in multiple bins)

2. **Warehouse to Bin**
   - `tabWarehouse.name` → `tabBin.warehouse`
   - One-to-many relationship (one warehouse can have multiple bins)

3. **Stock Entry to Stock Entry Detail**
   - `tabStock Entry.name` → `tabStock Entry Detail.parent`
   - One-to-many relationship

4. **Item to Serial No**
   - `tabItem.name` → `tabSerial No.item_code`
   - One-to-many relationship (one item can have multiple serial numbers)

5. **Item to Batch**
   - `tabItem.name` → `tabBatch.item`
   - One-to-many relationship (one item can have multiple batches)

6. **Stock Ledger Entry to Item**
   - `tabItem.name` → `tabStock Ledger Entry.item_code`
   - One-to-many relationship

7. **Stock Ledger Entry to Warehouse**
   - `tabWarehouse.name` → `tabStock Ledger Entry.warehouse`
   - One-to-many relationship

## 6. Advanced Inventory Features

### 6.1 Multi-Location Inventory
- **Warehouse Hierarchy**: Parent-child warehouse relationships
- **Stock Transfers**: Automated and manual transfers between locations
- **Inter-Company Stock Transactions**: Cross-company inventory movements
- **Stock Reservation**: Advanced reservation logic for high-demand items

### 6.2 Batch and Serial Number Management
- **Batch-wise Expiry**: Track and manage item expiration dates
- **Serial Number Tracking**: End-to-end traceability of individual items
- **Batch-wise Valuation**: Different valuation rates for different batches
- **Auto-serialization**: Automatic generation of serial numbers

### 6.3 Inventory Optimization
- **ABC Analysis**: Classification based on value and importance
- **Safety Stock Calculation**: Automated safety stock recommendations
- **Lead Time Management**: Supplier and manufacturing lead times
- **Demand Forecasting**: Integrated forecasting models

### 6.4 Quality Management
- **Inspection Requirements**: Define quality checks for receipts and issues
- **Quality Inspection Templates**: Standardized checklists
- **Quality Test Records**: Track test results and compliance
- **Non-Conformance Management**: Handle quality failures and returns

## 7. Integration Points

### 7.1 Purchasing Integration
- Purchase Order to Stock Entry workflow
- GRN (Goods Receipt Note) processing
- Return to Supplier handling
- Purchase Invoice matching

### 7.2 Sales Integration
- Sales Order to Delivery Note workflow
- Picking and Packing integration
- Sales Returns processing
- Sales Invoice generation

### 7.3 Manufacturing Integration
- Material Requirements Planning (MRP)
- Work Order material consumption
- Production Planning Tool
- Subcontracting workflows

## 8. Performance Optimization

### 8.1 Database Indexing
```sql
-- Recommended indexes for large deployments
CREATE INDEX idx_sle_item_warehouse ON `tabStock Ledger Entry`(item_code, warehouse);
CREATE INDEX idx_bin_item_warehouse ON `tabBin`(item_code, warehouse);
CREATE INDEX idx_ste_posting_date ON `tabStock Entry`(posting_date, docstatus);
```

### 8.2 Archiving Strategy
- Archive completed stock entries after retention period
- Move historical stock ledger entries to archive tables
- Create materialized views for reports

## 9. API Integration Examples

### 9.1 Create Stock Entry
```python
import frappe

def create_stock_entry(items, **kwargs):
    """
    Create a stock entry
    items: List of dicts with item_code, qty, s_warehouse, t_warehouse
    kwargs: Additional fields like posting_date, purpose, etc.
    """
    doc = frappe.new_doc("Stock Entry")
    doc.update(kwargs)
    
    for item in items:
        doc.append("items", {
            "item_code": item["item_code"],
            "qty": item["qty"],
            "s_warehouse": item.get("s_warehouse"),
            "t_warehouse": item.get("t_warehouse"),
            "basic_rate": item.get("rate"),
            "cost_center": item.get("cost_center"),
            "expense_account": item.get("expense_account")
        })
    
    doc.save()
    if kwargs.get("submit"):
        doc.submit()
    return doc.name
```

### 9.2 Get Available Stock
```python
def get_available_stock(item_code, warehouse=None, posting_date=None):
    """Get available stock for an item"""
    filters = {"item_code": item_code}
    if warehouse:
        filters["warehouse"] = warehouse
    
    bin_data = frappe.get_all("Bin",
        filters=filters,
        fields=["actual_qty", "reserved_qty", "ordered_qty", "warehouse"]
    )
    
    return bin_data
```

## 10. Security Considerations

### 10.1 Access Control
- Role-based access to inventory transactions
- Warehouse-level permissions
- Approval workflows for critical operations
- Audit trails for all changes

### 10.2 Data Validation
- Negative stock prevention
- Rate validation against price lists
- UoM conversion validations
- Batch/Serial number validation

## 11. Future Enhancements

### 11.1 Advanced Features
- Barcode/QR code integration
- Mobile inventory management
- IoT sensor integration for real-time tracking
- AI-powered demand forecasting

### 11.2 Reporting Improvements
- Inventory aging reports
- Stock movement analysis
- Inventory turnover ratios
- Value-added services tracking

## 12. Troubleshooting

### Common Issues
1. **Negative Stock**
   - Check for unsubmitted stock entries
   - Verify stock reconciliation entries
   - Review recent stock adjustments

2. **Valuation Mismatches**
   - Recalculate stock balance for affected items
   - Check for incorrect posting dates
   - Verify stock reconciliation entries

3. **Performance Issues**
   - Optimize database indexes
   - Schedule heavy operations during off-peak hours
   - Consider partitioning large tables

## 13. Example Queries

### 6.1 Get Current Stock Levels

```sql
SELECT 
    b.item_code,
    i.item_name,
    b.warehouse,
    b.actual_qty as current_stock,
    b.valuation_rate,
    (b.actual_qty * b.valuation_rate) as stock_value
FROM 
    `tabBin` b
JOIN 
    `tabItem` i ON b.item_code = i.name
WHERE 
    b.actual_qty > 0
ORDER BY 
    b.warehouse, b.item_code;
```

### 6.2 Get Stock Movement by Item

```sql
SELECT 
    sle.item_code,
    i.item_name,
    i.stock_uom,
    SUM(IF(sle.actual_qty > 0, sle.actual_qty, 0)) as in_qty,
    SUM(IF(sle.actual_qty < 0, ABS(sle.actual_qty), 0)) as out_qty,
    SUM(sle.actual_qty) as net_qty
FROM 
    `tabStock Ledger Entry` sle
JOIN 
    `tabItem` i ON sle.item_code = i.name
WHERE 
    sle.posting_date BETWEEN '2023-01-01' AND '2023-12-31'
    AND sle.docstatus = 1
    AND sle.is_cancelled = 0
GROUP BY 
    sle.item_code, i.item_name, i.stock_uom
ORDER BY 
    net_qty DESC;
```

### 6.3 Get Items Below Reorder Level

```sql
SELECT 
    b.item_code,
    i.item_name,
    b.warehouse,
    b.actual_qty as current_stock,
    i.safety_stock,
    i.reorder_level,
    (i.reorder_level - b.actual_qty) as reorder_qty
FROM 
    `tabBin` b
JOIN 
    `tabItem` i ON b.item_code = i.name
WHERE 
    b.actual_qty <= i.reorder_level
    AND i.is_stock_item = 1
    AND i.disabled = 0
ORDER BY 
    b.warehouse, b.item_code;
```

### 6.4 Get Stock Value by Warehouse

```sql
SELECT 
    b.warehouse,
    w.warehouse_name,
    w.company,
    COUNT(DISTINCT b.item_code) as item_count,
    SUM(b.actual_qty) as total_qty,
    SUM(b.stock_value) as total_value
FROM 
    `tabBin` b
JOIN 
    `tabWarehouse` w ON b.warehouse = w.name
WHERE 
    b.actual_qty > 0
GROUP BY 
    b.warehouse, w.warehouse_name, w.company
ORDER BY 
    total_value DESC;
```

### 6.5 Get Batch Expiry Report

```sql
SELECT 
    b.name as batch_no,
    b.item_code,
    i.item_name,
    b.batch_qty,
    b.expiry_date,
    DATEDIFF(b.expiry_date, CURDATE()) as days_to_expire,
    b.warehouse
FROM 
    `tabBatch` b
JOIN 
    `tabItem` i ON b.item = i.name
WHERE 
    b.expiry_date IS NOT NULL
    AND b.batch_qty > 0
    AND b.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY 
    b.expiry_date, b.item_code;
```

### 6.6 Get Serial Number History

```sql
SELECT 
    s.name as serial_no,
    s.item_code,
    s.warehouse,
    s.purchase_document_no,
    s.purchase_date,
    s.sales_invoice,
    s.delivery_date,
    s.warranty_expiry_date,
    s.amc_expiry_date,
    s.status
FROM 
    `tabSerial No` s
WHERE 
    s.item_code = 'YOUR_ITEM_CODE'
ORDER BY 
    s.creation DESC;
```

## 7. Conclusion

This documentation provides a comprehensive overview of the WalaTech Inventory Management module's database schema, covering core tables, stock transactions, serial and batch management, and inventory valuation. The schema is designed to support complex inventory operations while maintaining data integrity through well-defined relationships.

### Key Takeaways

- **Core Inventory Tables** form the foundation of the inventory system
- **Stock Transactions** track all movements of inventory
- **Serial and Batch Management** provides detailed tracking of individual items
- **Inventory Valuation** ensures accurate financial reporting
- **Comprehensive Relationships** maintain data integrity across the system

### Next Steps

1. **Database Optimization**: Consider adding appropriate indexes on frequently queried fields
2. **Data Validation**: Implement additional constraints to ensure data quality
3. **Reporting**: Create views for common inventory KPIs and reports
4. **Integration**: Plan how this schema integrates with other modules like Manufacturing and Accounting

For more detailed information, refer to the [WalaTech Inventory Documentation](https://docs.WalaTech.com/docs/v13/user/manual/en/stock).
