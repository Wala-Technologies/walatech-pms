# WalaTech Stock/Inventory Module - Database Schema Documentation

## Table of Contents

- [1. Core Inventory Tables](#1-core-inventory-tables)
  - [1.1 Item](#11-item)
  - [1.2 Warehouse](#12-warehouse)
  - [1.3 Stock Entry](#13-stock-entry)
  - [1.4 Stock Ledger Entry](#14-stock-ledger-entry)
  - [1.5 Bin](#15-bin)
  - [1.6 Serial No](#16-serial-no)
  - [1.7 Batch](#17-batch)

- [2. Inventory Transactions](#2-inventory-transactions)
  - [2.1 Material Receipt](#21-material-receipt)
  - [2.2 Material Issue](#22-material-issue)
  - [2.3 Material Transfer](#23-material-transfer)
  - [2.4 Manufacturing](#24-manufacturing)
  - [2.5 Repack](#25-repack)

- [3. Inventory Valuation](#3-inventory-valuation)
  - [3.1 Valuation Methods](#31-valuation-methods)
  - [3.2 Stock Reconciliation](#32-stock-reconciliation)
  - [3.3 Landed Cost Voucher](#33-landed-cost-voucher)

- [4. Key Relationships](#4-key-relationships)
- [5. Example Queries](#5-example-queries)
- [6. Integration Points](#6-integration-points)

## 1. Core Inventory Tables

### 1.1 Item

**Table Name:** `tabItem`

**Purpose:** Master table for all items in the system.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, item code |
| `item_name` | varchar(255) | Name of the item |
| `item_group` | varchar(255) | Category of the item |
| `stock_uom` | varchar(140) | Stock unit of measure |
| `is_stock_item` | int(1) | Whether item is stockable |
| `has_serial_no` | int(1) | Whether tracking by serial no |
| `has_batch_no` | int(1) | Whether tracking by batch no |
| `is_purchase_item` | int(1) | Can be purchased |
| `is_sales_item` | int(1) | Can be sold |
| `is_asset_item` | int(1) | Is a fixed asset |
| `is_sub_contracted_item` | int(1) | Can be subcontracted |
| `default_material_request_type` | varchar(140) | Default MR type |
| `valuation_method` | varchar(140) | FIFO, Moving Average, etc. |
| `standard_rate` | decimal(21,9) | Standard valuation rate |
| `min_order_qty` | decimal(21,9) | Minimum order quantity |
| `safety_stock` | decimal(21,9) | Safety stock level |
| `reorder_level` | decimal(21,9) | Reorder level |
| `reorder_qty` | decimal(21,9) | Standard reorder quantity |
| `last_purchase_rate` | decimal(21,9) | Last purchase rate |
| `weight_per_unit` | decimal(21,9) | Weight per unit |
| `weight_uom` | varchar(140) | Unit of measure for weight |

### 1.2 Warehouse

**Table Name:** `tabWarehouse`

**Purpose:** Defines storage locations for inventory items.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `warehouse_name` | varchar(255) | Name of warehouse |
| `parent_warehouse` | varchar(255) | Parent warehouse |
| `company` | varchar(255) | Owning company |
| `account` | varchar(255) | Linked stock account |
| `is_group` | int(1) | Is a group node |
| `is_rejected_warehouse` | int(1) | For rejected items |
| `is_from_manifest` | int(1) | For manifest tracking |

### 1.3 Stock Entry

**Table Name:** `tabStock Entry`

**Purpose:** Records all inventory movements and transactions.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `purpose` | varchar(140) | Material Receipt/Issue/Transfer |
| `posting_date` | date | Transaction date |
| `posting_time` | time | Transaction time |
| `from_warehouse` | varchar(255) | Source warehouse |
| `to_warehouse` | varchar(255) | Target warehouse |
| `company` | varchar(255) | Company |
| `total_amount` | decimal(21,9) | Total value |
| `per_transferred` | decimal(21,9) | % completion |
| `work_order` | varchar(255) | Linked work order |
| `production_order` | varchar(255) | Linked production order |
| `material_request` | varchar(255) | Source material request |

### 1.4 Stock Ledger Entry

**Table Name:** `tabStock Ledger Entry`

**Purpose:** Tracks all inventory movements with valuation.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `item_code` | varchar(255) | Item code |
| `warehouse` | varchar(255) | Warehouse |
| `posting_date` | date | Posting date |
| `posting_time` | time | Posting time |
| `voucher_type` | varchar(140) | Source document type |
| `voucher_no` | varchar(255) | Source document |
| `voucher_detail_no` | varchar(255) | Source document detail |
| `actual_qty` | decimal(21,9) | Quantity change |
| `qty_after_transaction` | decimal(21,9) | Balance after |
| `incoming_rate` | decimal(21,9) | Purchase/input rate |
| `valuation_rate` | decimal(21,9) | Current valuation rate |
| `stock_value` | decimal(21,9) | Total stock value |
| `stock_value_difference` | decimal(21,9) | Value change |
| `company` | varchar(255) | Company |
| `batch_no` | varchar(255) | Batch number |
| `serial_no` | text | Serial numbers |

### 1.5 Bin

**Table Name:** `tabBin`

**Purpose:** Tracks item quantities in each warehouse.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `item_code` | varchar(255) | Item code |
| `warehouse` | varchar(255) | Warehouse |
| `actual_qty` | decimal(21,9) | Current stock |
| `reserved_qty` | decimal(21,9) | Reserved stock |
| `ordered_qty` | decimal(21,9) | On purchase order |
| `indented_qty` | decimal(21,9) | Requested in MR |
| `planned_qty` | decimal(21,9) | In production plan |
| `projected_qty` | decimal(21,9) | Available to promise |
| `valuation_rate` | decimal(21,9) | Current valuation rate |
| `stock_value` | decimal(21,9) | Total stock value |

### 1.6 Serial No

**Table Name:** `tabSerial No`

**Purpose:** Tracks individual serialized items.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Serial number |
| `item_code` | varchar(255) | Item code |
| `company` | varchar(255) | Company |
| `warehouse` | varchar(255) | Current location |
| `purchase_document_type` | varchar(140) | Source document type |
| `purchase_document_no` | varchar(255) | Source document |
| `purchase_date` | date | Purchase date |
| `purchase_rate` | decimal(21,9) | Purchase rate |
| `warranty_expiry_date` | date | Warranty expiry |
| `amc_expiry_date` | date | AMC expiry |
| `delivery_document_type` | varchar(140) | Last delivery type |
| `delivery_document_no` | varchar(255) | Last delivery document |
| `delivery_date` | date | Last delivery date |
| `status` | varchar(140) | Active/Delivered/Expired |

### 1.7 Batch

**Table Name:** `tabBatch`

**Purpose:** Tracks batched inventory items.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Batch number |
| `item` | varchar(255) | Item code |
| `item_name` | varchar(255) | Item name |
| `company` | varchar(255) | Company |
| `supplier` | varchar(255) | Supplier |
| `reference_doctype` | varchar(140) | Source document type |
| `reference_name` | varchar(255) | Source document |
| `batch_qty` | decimal(21,9) | Total quantity |
| `expiry_date` | date | Expiry date |
| `manufacturing_date` | date | Manufacturing date |
| `stock_uom` | varchar(140) | Stock UoM |

## 2. Inventory Transactions

### 2.1 Material Receipt
- **Purpose:** Record receipt of items into inventory
- **Stock Entry Type:** Material Receipt
- **Effect:** Increases stock in target warehouse
- **Accounting:** Debits inventory, credits supplier/expense

### 2.2 Material Issue
- **Purpose:** Record issue of items from inventory
- **Stock Entry Type:** Material Issue
- **Effect:** Decreases stock in source warehouse
- **Accounting:** Debits expense, credits inventory

### 2.3 Material Transfer
- **Purpose:** Transfer items between warehouses
- **Stock Entry Type:** Material Transfer
- **Effect:** Decreases source, increases target warehouse
- **Accounting:** Internal transfer (no GL impact)

### 2.4 Manufacturing
- **Purpose:** Record production output and consumption
- **Stock Entry Type:** Manufacture/Repack
- **Effect:** Consumes raw materials, produces finished goods
- **Accounting:** Debits FG, credits WIP/RM

### 2.5 Repack
- **Purpose:** Convert items to different forms
- **Stock Entry Type:** Repack
- **Effect:** Consumes input items, produces output items
- **Accounting:** Tracks conversion costs

## 3. Inventory Valuation

### 3.1 Valuation Methods
1. **FIFO** (First In, First Out)
   - Tracks cost layers by purchase date
   - Matches oldest costs to COGS first
   - Best for perishable goods

2. **Moving Average**
   - Calculates weighted average cost
   - Updates on every purchase
   - Smoothes out price fluctuations

3. **LIFO** (Last In, First Out)
   - Matches newest costs to COGS first
   - Not commonly used due to tax implications

### 3.2 Stock Reconciliation
- **Purpose:** Adjust physical inventory counts
- **Process:**
  1. Freeze inventory
  2. Count physical stock
  3. Enter counts in reconciliation
  4. Post differences to inventory adjustment account

### 3.3 Landed Cost Voucher
- **Purpose:** Allocate additional costs to inventory
- **Components:**
  - Shipping charges
  - Customs duty
  - Insurance
  - Other direct costs
- **Allocation Methods:**
  - Amount
  - Quantity
  - Weight
  - Volume
  - Manual

## 4. Key Relationships

### 4.1 Item Relationships
- `tabItem` → `tabItem Default` (1:N)
- `tabItem` → `tabItem Reorder` (1:N)
- `tabItem` → `tabItem Supplier` (1:N)
- `tabItem` → `tabItem Price` (1:N)

### 4.2 Inventory Transactions
- `tabStock Entry` → `tabStock Entry Detail` (1:N)
- `tabStock Entry` → `tabStock Ledger Entry` (1:N)
- `tabStock Entry` → `tabGL Entry` (1:N)

### 4.3 Stock Tracking
- `tabItem` → `tabBin` (1:N)
- `tabItem` → `tabSerial No` (1:N)
- `tabItem` → `tabBatch` (1:N)

## 5. Advanced Stock Management Features

### 5.1 Multi-location Inventory
- **Multi-warehouse Management**: Track inventory across multiple locations
- **Stock Transfers**: Automated transfer requests and approvals
- **Inter-warehouse Transfers**: Real-time tracking of items in transit
- **Bin Management**: Granular storage location tracking
- **Stock Reservation**: Reserve stock for specific sales orders or production

### 5.2 Batch and Serial Number Tracking
- **Expiry Management**: Track and alert on product expiry dates
- **Batch-wise Valuation**: Different costs for different batches
- **Serial Number History**: Complete audit trail for serialized items
- **Warranty Management**: Track warranty status by serial number
- **Recall Management**: Identify affected batches/serials for recalls

### 5.3 Inventory Optimization
- **ABC Analysis**: Classify inventory based on value/importance
- **Safety Stock Calculation**: Automated safety stock recommendations
- **Replenishment Planning**: Suggested reorder points and quantities
- **Dead Stock Analysis**: Identify slow-moving or obsolete inventory
- **Inventory Turnover**: Calculate and analyze inventory turnover rates

### 5.4 Quality Management
- **Quality Inspection Templates**: Define quality check parameters
- **Incoming Inspection**: Inspect goods before receipt
- **In-process Inspection**: Monitor quality during production
- **Outgoing Inspection**: Verify quality before dispatch
- **Quality Certificates**: Maintain product quality documentation

## 6. Inventory Workflows

### 6.1 Procurement to Receipt
1. **Purchase Order Creation**
   - Item and quantity definition
   - Supplier and pricing
   - Delivery date scheduling

2. **Goods Receipt**
   - Physical receipt verification
   - Quality inspection
   - Quantity validation

3. **Inventory Update**
   - Stock level updates
   - Valuation updates
   - Batch/Serial number capture

### 6.2 Sales Order Fulfillment
1. **Order Processing**
   - Stock availability check
   - Reservation of inventory
   - Picking list generation

2. **Packing and Shipping**
   - Packing slip generation
   - Shipping documentation
   - Carrier integration

3. **Delivery Note**
   - Stock deduction
   - Batch/Serial number assignment
   - Accounting entries

### 6.3 Stock Adjustment Process
1. **Physical Count**
   - Schedule inventory counts
   - Freeze transactions during count
   - Count sheet generation

2. **Reconciliation**
   - Enter physical counts
   - Identify discrepancies
   - Approve adjustments

3. **Adjustment Posting**
   - Update stock levels
   - Post variance to appropriate accounts
   - Generate adjustment reports

## 7. Integration Points

### 7.1 Core WalaTech Modules
- **Accounting**: Inventory valuation, COGS, and GL entries
- **Manufacturing**: Material consumption and finished goods
- **Purchasing**: Purchase orders and goods receipt
- **Sales**: Sales orders and delivery notes
- **Assets**: Capitalization of inventory items

### 7.2 Third-Party Integrations
- **Barcode Scanners**: For quick data entry
- **Warehouse Management Systems (WMS)**: Advanced warehouse operations
- **EDI Systems**: Electronic data interchange with suppliers
- **E-commerce Platforms**: Sync inventory with online stores
- **Logistics Providers**: Shipping and tracking integration

## 8. API Integration Examples

### 8.1 Create a Stock Entry
```python
import frappe

def create_stock_entry(item_code, qty, source_wh, target_wh, purpose):
    se = frappe.get_doc({
        'doctype': 'Stock Entry',
        'purpose': purpose,
        'company': 'Your Company',
        'items': [{
            'item_code': item_code,
            'qty': qty,
            's_warehouse': source_wh if purpose != 'Material Receipt' else None,
            't_warehouse': target_wh if purpose != 'Material Issue' else None,
            'basic_rate': get_valuation_rate(item_code, source_wh)
        }]
    })
    se.insert(ignore_permissions=True)
    se.submit()
    return se.name
```

### 8.2 Get Available Stock
```python
def get_available_stock(item_code, warehouse=None):
    filters = {'item_code': item_code}
    if warehouse:
        filters['warehouse'] = warehouse
    
    bins = frappe.get_all('Bin',
        filters=filters,
        fields=['warehouse', 'actual_qty', 'reserved_qty', 'projected_qty']
    )
    return bins
```

## 9. Performance Optimization

### 9.1 Database Indexing
```sql
-- Recommended indexes for performance
CREATE INDEX idx_sle_item_warehouse ON `tabStock Ledger Entry`(item_code, warehouse, posting_date);
CREATE INDEX idx_bin_item_warehouse ON `tabBin`(item_code, warehouse);
CREATE INDEX idx_serial_no_item ON `tabSerial No`(item_code, warehouse, status);
CREATE INDEX idx_batch_item ON `tabBatch`(item, batch_qty, expiry_date);
```

### 9.2 Caching Strategies
- Cache frequently accessed item data
- Implement query result caching for stock reports
- Use Redis for real-time stock levels
- Cache item prices and availability

## 10. Security Considerations

### 10.1 Access Control
- Role-based access to warehouses
- Field-level security for sensitive data
- Approval workflows for critical operations
- Audit trails for all transactions
- IP restrictions for API access

### 10.2 Data Integrity
- Transaction isolation for stock updates
- Concurrency control for inventory transactions
- Data validation before posting
- Regular data consistency checks
- Backup and recovery procedures

## 11. Troubleshooting

### 11.1 Common Issues
- **Negative Stock**: Implement validation rules
- **Valuation Errors**: Regular stock reconciliation
- **Performance Issues**: Optimize queries and indexing
- **Integration Failures**: Robust error handling
- **Data Inconsistencies**: Regular data cleanup scripts

## 12. Future Enhancements

### 12.1 Planned Features
- AI-based demand forecasting
- Automated replenishment planning
- Advanced analytics with ML
- Mobile app for stock counts
- IoT integration for real-time tracking

## 13. Example Queries

### 5.1 Current Stock Levels
```sql
SELECT 
    b.item_code, 
    i.item_name, 
    b.warehouse, 
    b.actual_qty, 
    b.reserved_qty,
    b.ordered_qty,
    b.planned_qty,
    b.projected_qty,
    b.valuation_rate,
    b.stock_value
FROM 
    `tabBin` b
JOIN 
    `tabItem` i ON b.item_code = i.name
WHERE 
    b.actual_qty > 0
    AND i.is_stock_item = 1
ORDER BY 
    b.warehouse, b.item_code;
```

### 5.2 Stock Movement Analysis
```sql
SELECT 
    sle.item_code,
    i.item_name,
    i.stock_uom,
    sle.warehouse,
    SUM(IF(sle.actual_qty > 0, sle.actual_qty, 0)) as in_qty,
    SUM(IF(sle.actual_qty < 0, ABS(sle.actual_qty), 0)) as out_qty,
    SUM(sle.actual_qty) as net_qty,
    SUM(sle.stock_value_difference) as value_change
FROM 
    `tabStock Ledger Entry` sle
JOIN 
    `tabItem` i ON sle.item_code = i.name
WHERE 
    sle.posting_date BETWEEN '2023-01-01' AND '2023-01-31'
    AND i.is_stock_item = 1
GROUP BY 
    sle.item_code, sle.warehouse
HAVING 
    net_qty != 0
ORDER BY 
    ABS(net_qty) DESC;
```

### 5.3 Slow Moving Items
```sql
SELECT 
    b.item_code,
    i.item_name,
    b.warehouse,
    b.actual_qty,
    b.stock_value,
    DATEDIFF(CURDATE(), IFNULL(MAX(sle.posting_date), '2000-01-01')) as days_since_last_txn,
    AVG(sle.valuation_rate) as avg_valuation_rate
FROM 
    `tabBin` b
JOIN 
    `tabItem` i ON b.item_code = i.name
LEFT JOIN 
    `tabStock Ledger Entry` sle ON b.item_code = sle.item_code 
    AND b.warehouse = sle.warehouse
    AND sle.posting_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
WHERE 
    b.actual_qty > 0
    AND i.is_stock_item = 1
GROUP BY 
    b.item_code, b.warehouse
HAVING 
    days_since_last_txn > 90
ORDER BY 
    b.stock_value DESC;
```

## 6. Integration Points

### 6.1 Purchasing
- Purchase Receipt creates Stock Entry (Material Receipt)
- Purchase Invoice updates accounts payable
- Landed Cost Voucher allocates additional costs

### 6.2 Sales
- Delivery Note creates Stock Entry (Material Issue)
- Sales Invoice updates accounts receivable
- Packing Slip tracks physical packaging

### 6.3 Manufacturing
- Work Order consumes materials
- Production Order tracks WIP
- Job Card records labor and operations

### 6.4 Accounting
- Stock Ledger Entry → General Ledger
- Inventory valuation affects Balance Sheet
- COGS impacts Profit & Loss

### 6.5 Reporting
- Stock Balance Report
- Stock Projected Quantity
- Stock Ageing
- Inventory Turnover
- Stock Movement Analysis
