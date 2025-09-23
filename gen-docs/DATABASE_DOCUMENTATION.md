# WalaTech Database Documentation

## Table of Contents
1. [Core Modules](#core-modules)
   1. [Accounting](#accounting)
   2. [Inventory](#inventory)
   3. [Sales](#sales)
   4. [Purchase](#purchase)
   5. [Manufacturing](#manufacturing)
   6. [HR & Payroll](#hr-payroll)
2. [Module Relationships](#module-relationships)
3. [Database Schema](#database-schema)
4. [CRUD Operations](#crud-operations)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [API Documentation](#api-documentation)

## Core Modules

### Accounting

#### Key Tables
- `tabGL Entry` - General Ledger entries for all financial transactions
- `tabAccount` - Chart of Accounts
- `tabJournal Entry` - Manual journal entries
- `tabPayment Entry` - Payments and receipts
- `tabSales Invoice` - Customer invoices
- `tabPurchase Invoice` - Supplier bills

#### Key Relationships
- GL Entries link to Accounts, Cost Centers, and Vouchers
- Payment Entries link to Invoices and Bank Accounts
- Journal Entries link to multiple Accounts with debits and credits

### Inventory

#### Key Tables
- `tabItem` - Product and service items
- `tabWarehouse` - Inventory storage locations
- `tabStock Entry` - Inventory transfers and manufacturing
- `tabStock Ledger Entry` - All stock movements
- `tabSerial No` - Serial number tracking
- `tabBatch` - Batch number tracking

#### Key Relationships
- Items link to Warehouses through Bin
- Stock Entries affect multiple Items and Warehouses
- Serial/Batch numbers link to Items and Stock Entries

### Sales

#### Key Tables
- `tabCustomer` - Customer master data
- `tabQuotation` - Sales quotations
- `tabSales Order` - Confirmed customer orders
- `tabDelivery Note` - Goods delivery documentation
- `tabSales Invoice` - Customer billing

#### Key Relationships
- Sales documents follow the flow: Quotation → Sales Order → Delivery Note → Sales Invoice
- All link to Customer and Items

### Purchase

#### Key Tables
- `tabSupplier` - Supplier master data
- `tabRequest for Quotation` - RFQ to suppliers
- `tabSupplier Quotation` - Supplier responses
- `tabPurchase Order` - Confirmed purchase orders
- `tabPurchase Receipt` - Goods receipt
- `tabPurchase Invoice` - Supplier billing

#### Key Relationships
- Purchase flow: RFQ → Supplier Quotation → Purchase Order → Purchase Receipt → Purchase Invoice
- All link to Supplier and Items

### Manufacturing

#### Key Tables
- `tabBOM` - Bill of Materials
- `tabWork Order` - Manufacturing orders
- `tabJob Card` - Production operations
- `tabProduction Plan` - Production planning

#### Key Relationships
- BOM defines Item components
- Work Orders consume BOM Items and produce finished goods
- Job Cards track Work Order operations

## Module Relationships

### Sales to Inventory
- Sales Order → Item (demand)
- Delivery Note → Stock Entry (fulfillment)
- Sales Invoice → GL Entry (accounting)

### Purchase to Inventory
- Purchase Order → Item (supply)
- Purchase Receipt → Stock Entry (receipt)
- Purchase Invoice → GL Entry (accounting)

### Manufacturing to Inventory
- BOM → Item (components and finished goods)
- Work Order → Stock Entry (material consumption and production)

## Database Schema

### Table Naming Convention
- `tab[Doctype Name]` - Main document types
- `tab[Doctype Name] Item` - Child tables for line items
- `tab[Doctype Name] Detail` - Additional details

### Common Fields
- `name` - Primary key (format: [SINV-2023-00001])
- `creation` - Document creation timestamp
- `modified` - Last modified timestamp
- `modified_by` - Last user who modified
- `owner` - Document creator
- `docstatus` - 0=Draft, 1=Submitted, 2=Cancelled
- `parent` - For child table records
- `parenttype` - Parent document type
- `parentfield` - Field name in parent

## CRUD Operations

### General CRUD Pattern
```python
# Create
doc = frappe.new_doc("Sales Order")
doc.customer = "CUST-0001"
doc.delivery_date = "2023-12-31"
doc.append("items", {
    "item_code": "ITEM-001",
    "qty": 10,
    "rate": 100
})
doc.insert()

# Read
doc = frappe.get_doc("Sales Order", "SO-0001")

# Update
doc.status = "Completed"
doc.save()

# Delete
frappe.delete_doc("Sales Order", "SO-0001")
```

### Module-Specific CRUD Examples

#### Sales Order
```python
# Create Sales Order
def create_sales_order(customer, items, delivery_date):
    so = frappe.new_doc("Sales Order")
    so.customer = customer
    so.delivery_date = delivery_date
    
    for item in items:
        so.append("items", {
            "item_code": item["item_code"],
            "qty": item["qty"],
            "rate": item["rate"]
        })
    
    so.insert(ignore_permissions=True)
    return so.name
```

#### Purchase Order
```python
# Create Purchase Order
def create_purchase_order(supplier, items, schedule_date):
    po = frappe.new_doc("Purchase Order")
    po.supplier = supplier
    po.schedule_date = schedule_date
    
    for item in items:
        po.append("items", {
            "item_code": item["item_code"],
            "qty": item["qty"],
            "rate": item["rate"],
            "warehouse": item["warehouse"]
        })
    
    po.insert(ignore_permissions=True)
    return po.name
```

## Data Flow Diagrams

### Order to Cash Flow
1. Customer places order (Sales Order)
2. Inventory is reserved (Bin update)
3. Items are picked and packed (Delivery Note)
4. Shipment is created (Shipping)
5. Invoice is generated (Sales Invoice)
6. Payment is received (Payment Entry)
7. Accounting entries are posted (GL Entry)

### Procure to Pay Flow
1. Purchase requisition created (Material Request)
2. RFQ sent to suppliers (Request for Quotation)
3. Supplier responds (Supplier Quotation)
4. PO created (Purchase Order)
5. Goods received (Purchase Receipt)
6. Bill received (Purchase Invoice)
7. Payment made (Payment Entry)

## API Documentation

### REST API Endpoints
- `POST /api/resource/Sales Order` - Create Sales Order
- `GET /api/resource/Sales Order/[name]` - Get Sales Order
- `PUT /api/resource/Sales Order/[name]` - Update Sales Order
- `DELETE /api/resource/Sales Order/[name]` - Delete Sales Order

### Python API
```python
# Get list of Sales Orders
sales_orders = frappe.get_list("Sales Order", 
    fields=["name", "customer", "grand_total", "status"],
    filters={"status": "To Deliver"}
)

# Get document with child tables
doc = frappe.get_doc("Sales Order", "SO-0001")
for item in doc.items:
    print(f"Item: {item.item_code}, Qty: {item.qty}")
```
