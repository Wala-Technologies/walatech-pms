# WalaTech Purchasing Module - Comprehensive Documentation

## Overview

This document serves as a comprehensive guide to the WalaTech Purchasing module, covering database schema, workflows, integration points, and best practices for implementation and customization.

## Purchase Order Lifecycle

### 1. Purchase Requisition to Order

- **Requisition Creation**: Internal request for materials
- **Supplier Quotation**: Collect and compare quotes
- **Purchase Order Creation**: Convert approved requisition to PO
- **PO Approval Workflow**: Multi-level approval process
- **PO Dispatch**: Send to supplier via email/print

### 2. Goods Receipt

- **GRN Creation**: Record received items
- **Quality Inspection**: Optional quality check
- **Stock Update**: Update inventory levels
- **Three-Way Matching**: PO, GRN, and Invoice matching

### 3. Invoice Processing

- **Bill Entry**: Record supplier invoice
- **Payment Processing**: Schedule and make payments
- **Tax Calculation**: Automatic tax computation
- **GL Entries**: Post to general ledger

## Core Tables

### 1. tabPurchase Order

Tracks purchase orders sent to suppliers.

**Key Fields:**

- `name`: Purchase Order ID (PK)
- `supplier`: Reference to `tabSupplier`
- `company`: Reference to `tabCompany`
- `transaction_date`: Order date
- `schedule_date`: Expected delivery
- `status`: Order status (Draft, To Receive and Bill, Completed)
- `currency`: Reference to `tabCurrency`
- `conversion_rate`: Exchange rate
- `total_qty`: Total quantity
- `base_total`: Total in company currency
- `taxes_and_charges`: Reference to `tabPurchase Taxes and Charges Template`
- `supplier_address`: Reference to `tabAddress`
- `contact_person`: Reference to `tabContact`
- `taxes`: JSON array of taxes

### 2. tabPurchase Order Item

Items in purchase orders.

**Key Fields:**

- `parent`: Reference to `tabPurchase Order`
- `item_code`: Reference to `tabItem`
- `qty`: Quantity
- `rate`: Unit price
- `amount`: Total amount
- `warehouse`: Reference to `tabWarehouse`
- `project`: Reference to `tabProject`
- `cost_center`: Reference to `tabCost Center`
- `material_request`: Reference to `tabMaterial Request`
- `sales_order`: Reference to `tabSales Order`

### 3. tabPurchase Invoice

Records bills from suppliers.

**Key Fields:**

- `name`: Invoice ID (PK)
- `supplier`: Reference to `tabSupplier`
- `posting_date`: Invoice date
- `due_date`: Payment due date
- `status`: Invoice status
- `is_paid`: Payment status
- `total_qty`: Total quantity
- `base_total`: Total in company currency
- `taxes`: JSON array of taxes
- `purchase_order`: Reference to `tabPurchase Order`
- `purchase_receipt`: Reference to `tabPurchase Receipt`

### 4. tabPurchase Receipt

Records goods received from suppliers.

**Key Fields:**

- `name`: Receipt ID (PK)
- `supplier`: Reference to `tabSupplier`
- `posting_date`: Receipt date
- `status`: Receipt status
- `is_return`: Return indicator
- `purchase_order`: Reference to `tabPurchase Order`
- `purchase_invoice`: Reference to `tabPurchase Invoice`
- `supplier_warehouse`: Supplier's warehouse

### 5. tabSupplier

Master data for suppliers with comprehensive vendor management capabilities.

**Key Fields:**

- `name`: Supplier ID (PK)
- `supplier_name`: Legal name of the supplier
- `supplier_type`: Type of supplier (Raw Material, Services, etc.)
- `supplier_group`: Reference to `tabSupplier Group` for categorization
- `tax_id`: Tax identification number (TIN/VAT/GST)
- `default_currency`: Reference to `tabCurrency` for transactions
- `default_price_list`: Reference to `tabPrice List` for pricing
- `payment_terms`: Reference to `tabPayment Terms Template`
- `credit_limit`: Maximum credit allowed for the supplier
- `is_frozen`: Prevents transactions if frozen
- `disabled`: Marks supplier as inactive
- `warn_rfqs`: Warn when creating RFQs
- `prevent_rfqs`: Block RFQ creation
- `on_hold`: Temporary hold on transactions
- `hold_type`: Type of hold (All, Invoices, Deliveries, Payments)
- `release_date`: Automatic hold release date
- `tax_withholding_category`: Reference to `tabTax Withholding Category`
- `supplier_details`: Additional supplier information
- `website`: Supplier's website
- `language`: Preferred language for communication
- `default_bank_account`: Default bank account for payments

**Supplier-Specific Pricing:**

- `tabSupplier Quotation`: Historical quotes from supplier
- `tabSupplier Scorecard`: Performance metrics and ratings
- `tabSupplier Item`: Item-specific pricing and details

## Key Relationships

### 1. Purchase Order Flow

- `tabPurchase Order` is the central document
- References `tabSupplier` for vendor details
- Contains multiple `tabPurchase Order Item` records
- Links to `tabPurchase Receipt` and `tabPurchase Invoice`

### 2. Supplier Management
   - `tabSupplier` stores vendor master data
   - Links to `tabAddress` and `tabContact`
   - References `tabSupplier Group` for categorization

## Common Queries

### 1. Get Open Purchase Orders

```sql
SELECT 
    po.name, po.supplier, po.transaction_date,
    po.schedule_date, po.status, poi.item_code,
    poi.qty, poi.received_qty, poi.qty - poi.received_qty as pending_qty
FROM 
    `tabPurchase Order` po
JOIN 
    `tabPurchase Order Item` poi ON po.name = poi.parent
WHERE 
    po.docstatus = 1 
    AND po.status != 'Completed'
    AND poi.qty > poi.received_qty;
```

### 2. Get Supplier Aging Report

```sql
SELECT 
    pi.supplier, 
    SUM(pi.base_grand_total) as total_amount,
    SUM(IF(DATEDIFF(CURDATE(), pi.due_date) > 0, 
        pi.base_grand_total - pi.outstanding_amount, 0)) as paid_amount,
    SUM(IF(DATEDIFF(CURDATE(), pi.due_date) <= 0, 
        pi.outstanding_amount, 0)) as not_due_amount,
    SUM(IF(DATEDIFF(CURDATE(), pi.due_date) > 0 AND 
           DATEDIFF(CURDATE(), pi.due_date) <= 30, 
           pi.outstanding_amount, 0)) as due_30_days,
    SUM(IF(DATEDIFF(CURDATE(), pi.due_date) > 30 AND 
           DATEDIFF(CURDATE(), pi.due_date) <= 60, 
           pi.outstanding_amount, 0)) as due_60_days,
    SUM(IF(DATEDIFF(CURDATE(), pi.due_date) > 60, 
           pi.outstanding_amount, 0)) as due_90_plus_days
FROM 
    `tabPurchase Invoice` pi
WHERE 
    pi.docstatus = 1 
    AND pi.outstanding_amount > 0
GROUP BY 
    pi.supplier;
```

### 3. Get Purchase Receipts Without Invoice

```sql
SELECT 
    pr.name, pr.supplier, pr.posting_date,
    pri.item_code, pri.qty, pri.rate, pri.amount
FROM 
    `tabPurchase Receipt` pr
JOIN 
    `tabPurchase Receipt Item` pri ON pr.name = pri.parent
LEFT JOIN 
    `tabPurchase Invoice Item` pii ON pr.name = pii.purchase_receipt
WHERE 
    pr.docstatus = 1
    AND pr.status != 'Completed'
    AND pii.name IS NULL;
```

## Advanced Queries and Analytics

### 1. Supplier Performance Analysis

```sql
SELECT 
    s.name as supplier,
    s.supplier_name,
    COUNT(DISTINCT po.name) as total_pos,
    AVG(DATEDIFF(pr.posting_date, po.transaction_date)) as avg_lead_time_days,
    COUNT(DISTINCT pr.name) as total_receipts,
    COUNT(DISTINCT pi.name) as total_invoices,
    AVG(pi.outstanding_amount) as avg_outstanding,
    (SELECT COUNT(*) 
     FROM `tabPurchase Invoice` late_pi 
     WHERE late_pi.supplier = s.name 
     AND late_pi.due_date < CURDATE() 
     AND late_pi.outstanding_amount > 0) as late_payments
FROM 
    `tabSupplier` s
LEFT JOIN 
    `tabPurchase Order` po ON s.name = po.supplier
LEFT JOIN 
    `tabPurchase Receipt` pr ON po.name = pr.purchase_order
LEFT JOIN 
    `tabPurchase Invoice` pi ON s.name = pi.supplier
WHERE 
    po.docstatus = 1
    AND po.transaction_date > DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY 
    s.name, s.supplier_name
ORDER BY 
    total_pos DESC;
```

### 2. Purchase Order Status Dashboard

```sql
SELECT 
    po.name,
    po.supplier,
    po.transaction_date,
    po.schedule_date,
    po.status,
    DATEDIFF(CURDATE(), po.schedule_date) as days_overdue,
    (SELECT SUM(poi.amount) 
     FROM `tabPurchase Order Item` poi 
     WHERE poi.parent = po.name) as total_amount,
    (SELECT SUM(pri.qty * pri.rate) 
     FROM `tabPurchase Receipt Item` pri 
     JOIN `tabPurchase Receipt` pr ON pri.parent = pr.name 
     WHERE pr.purchase_order = po.name) as received_amount,
    (SELECT SUM(pii.amount) 
     FROM `tabPurchase Invoice Item` pii 
     JOIN `tabPurchase Invoice` pi ON pii.parent = pi.name 
     WHERE pi.purchase_order = po.name) as billed_amount
FROM 
    `tabPurchase Order` po
WHERE 
    po.docstatus = 1
    AND po.status NOT IN ('Completed', 'Cancelled')
ORDER BY 
    days_overdue DESC;
```

## API Integration Examples

### 1. Create Purchase Order

```python
import frappe

def create_purchase_order(supplier, items, company, transaction_date=None, schedule_date=None):
    """
    Create a new purchase order
    
    Args:
        supplier (str): Supplier ID
        items (list): List of item dictionaries with item_code, qty, rate
        company (str): Company ID
        transaction_date (str, optional): Order date (YYYY-MM-DD)
        schedule_date (str, optional): Expected delivery date (YYYY-MM-DD)
    """
    if not transaction_date:
        transaction_date = frappe.utils.today()
    if not schedule_date:
        schedule_date = frappe.utils.add_days(transaction_date, 7)
    
    po = frappe.get_doc({
        'doctype': 'Purchase Order',
        'supplier': supplier,
        'company': company,
        'transaction_date': transaction_date,
        'schedule_date': schedule_date,
        'items': [{
            'item_code': item['item_code'],
            'qty': item['qty'],
            'rate': item['rate'],
            'schedule_date': schedule_date
        } for item in items]
    })
    
    po.insert(ignore_permissions=True)
    po.submit()
    return po.name
```

### 2. Process Goods Receipt

```python
def create_purchase_receipt(purchase_order, items_received, posting_date=None):
    """
    Create a purchase receipt for received items
    
    Args:
        purchase_order (str): Purchase Order ID
        items_received (list): List of received items with item_code, qty, warehouse
        posting_date (str, optional): Receipt date (YYYY-MM-DD)
    """
    if not posting_date:
        posting_date = frappe.utils.today()
    
    po = frappe.get_doc('Purchase Order', purchase_order)
    
    pr = frappe.get_doc({
        'doctype': 'Purchase Receipt',
        'supplier': po.supplier,
        'company': po.company,
        'purchase_order': purchase_order,
        'posting_date': posting_date,
        'items': [{
            'item_code': item['item_code'],
            'qty': item['qty'],
            'rate': next((i.rate for i in po.items 
                         if i.item_code == item['item_code']), 0),
            'warehouse': item.get('warehouse'),
            'purchase_order': purchase_order,
            'purchase_order_item': next((i.name for i in po.items 
                                       if i.item_code == item['item_code']), '')
        } for item in items_received]
    })
    
    pr.insert(ignore_permissions=True)
    pr.submit()
    return pr.name
```

## Purchase Requisitions and Supplier Quotations

### 1. Purchase Requisition Workflow

1. **Requisition Creation**: Department creates a material request
2. **Approval**: Manager reviews and approves the request
3. **Conversion**: Convert to Request for Quotation (RFQ) or Purchase Order
4. **Tracking**: Monitor status of requisitions

### 2. Key Tables for Purchase Requisitions

#### tabMaterial Request
- `name`: Requisition ID (PK)
- `material_request_type`: Type (Purchase, Material Transfer, etc.)
- `transaction_date`: Date of request
- `status`: Draft, Submitted, Stopped, etc.
- `schedule_date`: Required by date
- `items`: Child table with requested items

#### tabMaterial Request Item
- `parent`: Link to parent Material Request
- `item_code`: Requested item
- `qty`: Quantity requested
- `rate`: Estimated rate
- `warehouse`: Requested warehouse
- `sales_order`: Link to Sales Order if customer-driven

### 3. Supplier Quotation Management

#### tabRequest for Quotation
- `name`: RFQ ID (PK)
- `transaction_date`: Date of RFQ
- `status`: Draft, Submitted, Completed
- `suppliers`: Child table with invited suppliers
- `items`: Child table with requested items

#### tabSupplier Quotation
- `name`: Quotation ID (PK)
- `supplier`: Vendor providing the quote
- `valid_till`: Quote expiration date
- `terms`: Payment and delivery terms
- `items`: Quoted items with prices

### 4. Example Queries

#### Get Pending Purchase Requisitions
```sql
SELECT 
    mr.name, mr.transaction_date, mr.schedule_date,
    mri.item_code, mri.qty, mri.ordered_qty,
    mri.qty - IFNULL(mri.ordered_qty, 0) as pending_qty
FROM 
    `tabMaterial Request` mr
JOIN 
    `tabMaterial Request Item` mri ON mr.name = mri.parent
WHERE 
    mr.docstatus = 1
    AND mr.status != 'Stopped'
    AND mr.material_request_type = 'Purchase'
    AND mri.qty > IFNULL(mri.ordered_qty, 0);
```

#### Compare Supplier Quotations
```sql
SELECT 
    sq.supplier, sqi.item_code, sqi.qty, sqi.rate,
    (sqi.qty * sqi.rate) as amount, sq.valid_till
FROM 
    `tabSupplier Quotation` sq
JOIN 
    `tabSupplier Quotation Item` sqi ON sq.name = sqi.parent
WHERE 
    sq.docstatus = 1
    AND sqi.request_for_quotation = 'RFQ-2023-0001'
ORDER BY 
    sqi.item_code, sqi.rate;
```

## Purchase Returns and Credit Notes

### 1. Purchase Return Workflow

1. **Return Initiation**: Create return for received items
2. **Quality Inspection**: Optional quality check for returns
3. **Return Note**: Generate purchase return document
4. **Credit Note**: Create against original invoice
5. **Stock Return**: Update inventory on return
6. **Supplier Credit**: Process refund or adjust future payments

### 2. Key Tables

- `tabPurchase Receipt` (with `is_return` = 1)
- `tabPurchase Invoice` (with `is_return` = 1)
- `tabLanded Cost Voucher`: For additional return costs
- `tabStock Entry`: For physical return of items

### 3. Common Return Queries

```sql
-- Get returns by supplier
SELECT 
    pr.name as return_receipt,
    pr.posting_date,
    pr.supplier,
    pri.item_code,
    pri.qty as returned_qty,
    pri.rate,
    pri.amount,
    pr.status
FROM 
    `tabPurchase Receipt` pr
JOIN 
    `tabPurchase Receipt Item` pri ON pr.name = pri.parent
WHERE 
    pr.docstatus = 1
    AND pr.is_return = 1
    AND pr.posting_date > DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
ORDER BY 
    pr.posting_date DESC;

-- Get credit notes
SELECT 
    pi.name as credit_note,
    pi.posting_date,
    pi.supplier,
    pii.item_code,
    pii.qty,
    pii.rate,
    pii.amount,
    pi.grand_total,
    pi.outstanding_amount
FROM 
    `tabPurchase Invoice` pi
JOIN 
    `tabPurchase Invoice Item` pii ON pi.name = pii.parent
WHERE 
    pi.docstatus = 1
    AND pi.is_return = 1
    AND pi.posting_date > DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
ORDER BY 
    pi.posting_date DESC;
```

## Best Practices and Optimization

### 1. Data Integrity

#### Supplier Master Data

- Enforce unique supplier codes and tax IDs
- Validate bank account details
- Maintain complete contact information
#### Document Workflow

- Implement approval workflows for POs above threshold
- Enforce three-way matching for invoices
- Validate item codes and UOMs

#### Financial Controls

- Set credit limits for suppliers
- Implement payment term validations
- Enforce tax calculations

### 2. Performance Optimization

#### Indexing Strategy

```sql
-- Recommended indexes for large tables
CREATE INDEX idx_po_supplier_date ON `tabPurchase Order`(supplier, transaction_date);
CREATE INDEX idx_pi_supplier_status ON `tabPurchase Invoice`(supplier, status, due_date);
CREATE INDEX idx_poi_item_warehouse ON `tabPurchase Order Item`(item_code, warehouse);
```

#### Query Optimization

- Use covering indexes for reports
- Partition large tables by date ranges
- Materialize frequently accessed aggregations

#### Archiving Strategy

- Archive completed transactions older than 3 years
- Maintain summary tables for historical data
- Implement data purging policies

### 3. Security and Compliance

#### Access Control

- Role-based permissions for purchasing staff
- Segregation of duties (requisition, approval, payment)
- Field-level security for sensitive data

#### Audit Trail

- Enable versioning for master data
- Log all price changes
- Track document status changes

#### Compliance

- Maintain document retention policies
- Support for e-invoicing requirements
- Tax compliance reporting

### 4. Integration Patterns

#### REST API

- Standard endpoints for CRUD operations
- Webhook support for status changes
- Batch processing capabilities

#### Data Import/Export

- CSV/Excel templates for bulk operations
- Scheduled data synchronization
- Data validation rules

### 5. Monitoring and Maintenance

#### Performance Monitoring

- Query execution times
- Lock wait times
- Resource utilization

#### Scheduled Tasks

- Auto-close completed POs
- Payment reminder notifications
- Supplier performance reports
