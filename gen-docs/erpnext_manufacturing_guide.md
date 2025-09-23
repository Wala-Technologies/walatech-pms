# WalaTech Manufacturing Module - Comprehensive Documentation

## Overview

This document provides a comprehensive guide to the WalaTech Manufacturing module, covering the database schema, workflows, integration points, and best practices for implementation and customization. The manufacturing module in WalaTech is designed to handle complex manufacturing processes including production planning, work order management, and shop floor operations.

## Table of Contents

1. [Manufacturing Settings](#manufacturing-settings)
2. [Core Components](#core-components)
3. [Production Planning](#production-planning)
4. [Key Workflows](#key-workflows)
5. [Database Schema](#database-schema-details)
6. [Advanced Features](#advanced-manufacturing-features)
7. [Common Queries](#common-queries)
8. [Integration Points](#integration-with-other-modules)
9. [Performance Optimization](#performance-optimization)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

## Manufacturing Settings

### Key Configuration Options

- **Backflush Raw Materials**: Options for when to consume raw materials

  - BOM: Based on Bill of Materials
  - Material Transferred for Manufacture: When materials are issued to work orders

- **Capacity Planning**:

  - Capacity Planning for Days: Number of days to consider for capacity planning
  - Disable Capacity Planning: Toggle to disable capacity planning

- **Warehouse Defaults**:

  - Default Finished Goods Warehouse
  - Default WIP Warehouse
  - Default Scrap Warehouse

- **Production Settings**:

  - Allow Overtime: Enable/disable overtime in work orders
  - Enforce Time Logs: Require time logs in job cards
  - Overproduction Percentage: Set limits for production overruns
  - Material Consumption: Enable/disable material consumption tracking

### Important Methods

- `validate_components_quantities_per_bom`: Validates component quantities against BOM
- `get_mins_between_operations`: Gets the minimum time between operations
- `is_material_consumption_enabled`: Checks if material consumption is enabled

## Core Components

### 1. Manufacturing Settings

#### Key Configuration Options

- **Backflush Raw Materials**:

  - BOM: Based on Bill of Materials
  - Material Transferred for Manufacture: When materials are issued to work orders

- **Capacity Planning**:

  - Capacity Planning for Days
  - Disable Capacity Planning

- **Warehouse Defaults**:

  - Default Finished Goods Warehouse
  - Default WIP Warehouse
  - Default Scrap Warehouse

- **Production Settings**:

  - Allow Overtime
  - Enforce Time Logs
  - Overproduction Percentage
  - Material Consumption

### 2. Bill of Materials (BOM)

The foundation of manufacturing in WalaTech, defining the components and operations needed to produce an item.

**Key Tables:**

- `tabBOM`: Main BOM header
- `tabBOM Item`: Components required for production
- `tabBOM Operation`: Operations to be performed
- `tabBOM Scrap Item`: Expected scrap/waste items

### 3. Work Order

Tracks the manufacturing of items from start to finish.

**Key Tables:**

- `tabWork Order`: Main work order document
- `tabWork Order Item`: Components to be consumed
- `tabWork Order Operation`: Operations to be performed

**Key Fields:**

- `production_item`: Item to be manufactured
- `bom_no`: Reference to the BOM
- `qty`: Quantity to produce
- `produced_qty`: Quantity produced
- `status`: Current status
- `planned_start_date`: Scheduled start date
- `expected_delivery_date`: Expected completion date

### 4. Job Card

Tracks work done at workstations for specific operations.

**Key Tables:**

- `tabJob Card`: Tracks work at workstations
- `tabJob Card Item`: Items consumed in the operation
- `tabJob Card Time Log`: Time tracking for operations

**Key Features:**

- Operation tracking
- Time logging
- Material consumption
- Quality inspection integration
- Employee assignment

### 5. Workstation & Operations

Manages manufacturing resources and processes.

**Key Tables:**

- `tabWorkstation`: Physical location where work is performed
- `tabOperation`: Standard operations that can be performed
- `tabWorkstation Type`: Categorizes workstations

**Key Features:**

- Workstation capacity planning
- Operation sequencing
- Working hour management
- Cost calculation
- Maintenance scheduling

## Production Planning

### 1. Production Plan Creation

#### Sources
- **Sales Orders**: Automatically generate production plans based on confirmed sales orders
- **Material Requests**: Create production plans to fulfill material requirements
- **Manual Entry**: Direct creation for special production requirements

#### Key Features

##### Material Requirements Planning (MRP)
- **Demand Calculation**:
  - Considers sales orders, material requests, and reorder levels
  - Accounts for lead times and safety stock
- **BOM Explosion**:
  - Multi-level BOM processing
  - Phantom BOM handling
  - Scrap factor consideration

##### Capacity Planning
- **Workstation Loading**:
  - Visual capacity utilization charts
  - Shift-wise capacity planning
  - Operation-wise time estimation
- **Constraints Management**:
  - Machine availability
  - Workforce scheduling
  - Maintenance windows

### 2. Production Plan Items
- **Automatic Generation**:
  - Items pulled from sales orders or material requests
  - Quantity calculations based on BOM
- **Manual Adjustments**:
  - Override quantities
  - Change production dates
  - Modify warehouse assignments

### 3. Material Requests
- **Automatic Creation**:
  - Raw material requirements
  - Subcontracted items
  - Packaging materials
- **Purchase Planning**:
  - Supplier lead times
  - Minimum order quantities
  - Bulk purchase discounts
  - Subcontracting Planning
  - Multi-level BOM Explosion

### 2. Production Plan Processing
1. **Item Selection**:
   - Filter by item, warehouse, date range
   - Consider minimum order quantities
   - Include non-stock items if needed
2. **MRP Processing**:
   - Calculate net requirements
   - Consider existing inventory
   - Account for safety stock
3. **Subcontracting**:
   - Identify subcontracted items
   - Generate purchase requests
4. **Work Order Creation**:
   - Convert planned items to work orders
   - Schedule operations

### 3. Key Methods
- `get_sales_orders()`: Fetches sales orders for planning
- `get_items_for_material_requests()`: Generates material requirements
- `get_sub_assembly_items()`: Processes multi-level BOMs
- `make_work_order()`: Creates work orders from the plan

## Key Workflows

### 1. BOM Creation & Versioning

#### BOM Creation Process
1. **Item Selection**:
   - Choose the finished product item
   - Set the default UoM (Unit of Measure)
   - Define quantity per BOM
2. **Production Planning Tool**: Create production plans from sales orders or material requests
3. **Material Requests**: Generate material requests for required components

### 3. Work Order Execution
1. **Work Order Creation**: Convert production plan to work orders
2. **Material Consumption**: Issue raw materials to work orders
3. **Operation Tracking**: Record operations and time spent
4. **Quality Checks**: Perform quality inspections
5. **Stock Entry**: Receive finished goods into inventory

## Database Schema Details

### 1. BOM Tables

#### `tabBOM`
- `name`: Primary key
- `item`: Reference to Item master
- `is_active`: Boolean for active status
- `is_default`: Default BOM for the item
- `quantity`: Base quantity
- `project`: Reference to Project
- `company`: Reference to Company
- `rm_cost_as_per`: Valuation or Price List
- `currency`: Currency for costing
- `conversion_rate`: Conversion rate for currency
- `total_cost`: Total cost of BOM
- `allow_alternative_item`: Allow alternative items
- `set_rate_assembly_item`: Set rate for assembly item
- `total_operating_cost`: Total operating cost
- `total_raw_cost`: Total raw material cost
- `total_scrap_cost`: Total scrap cost

#### `tabBOM Item`
- `name`: Primary key
- `parent`: Reference to BOM
- `item_code`: Component item
- `qty`: Quantity required
- `rate`: Rate of component
- `amount`: Total amount of component
- `stock_qty`: Stock quantity
- `stock_uom`: Stock UoM
- `uom`: UoM
- `bom_no`: Reference to BOM
- `sourced_by_supplier`: Sourced by supplier
- `operation`: Operation

### 2. Work Order Tables

#### `tabWork Order`
- `name`: Primary key
- `production_item`: Item to be manufactured
- `bom_no`: Reference to BOM
- `qty`: Quantity to produce
- `produced_qty`: Quantity produced
- `status`: Current status
- `planned_start_date`: Scheduled start date
- `expected_delivery_date`: Expected completion date

#### `tabWork Order Item`
- `name`: Primary key
- `parent`: Reference to Work Order
- `item_code`: Component item
- `qty`: Quantity required
- `rate`: Rate of component
- `amount`: Total amount of component
- `stock_qty`: Stock quantity
- `stock_uom`: Stock UoM
- `uom`: UoM

### 3. Job Card Tables

#### `tabJob Card`
- `name`: Primary key
- `work_order`: Reference to Work Order
- `operation`: Operation
- `workstation`: Workstation
- `employee`: Employee
- `start_time`: Start time
- `end_time`: End time
- `status`: Current status

#### `tabJob Card Item`
- `name`: Primary key
- `parent`: Reference to Job Card
- `item_code`: Component item
- `qty`: Quantity required
- `rate`: Rate of component
- `amount`: Total amount of component
- `stock_qty`: Stock quantity
- `stock_uom`: Stock UoM
- `uom`: UoM

## Integration Points

### 1. Inventory Integration
- **Stock Entries**: Automatic creation for material consumption and finished goods receipt
- **Batch/Serial Numbers**: Track components and finished goods by batch/serial
- **Stock Reconciliation**: Update inventory levels after production
- **Warehouse Management**: Track stock movements between production and storage locations

### 2. Purchasing Integration
- **Material Requests**: Auto-creation for raw material shortages
- **Purchase Orders**: Link to production requirements
- **Subcontracting**: Manage outsourced operations and materials
- **Supplier Performance**: Track on-time delivery of production materials

### 3. Accounting Integration
- **Stock Valuation**: Update item costs based on production
- **Work in Progress (WIP) Accounting**: Track costs during production
- **Cost Centers**: Allocate production costs to departments
- **General Ledger**: Post production-related accounting entries

### 4. Sales Integration
- **Sales Order Fulfillment**: Link production to customer orders
- **Make-to-Order**: Trigger production based on sales
- **Delivery Tracking**: Monitor finished goods delivery

### 5. Project Management
- **Project Tracking**: Monitor production as projects
- **Task Management**: Break down manufacturing operations
- **Timesheets**: Track labor hours against production
- **Budgeting**: Monitor production costs against budgets

## Advanced Manufacturing Features

### 1. Subcontracting
- Manage outsourced operations
- Track materials sent to subcontractors
- Monitor subcontracting costs
- Create Purchase Orders for subcontracted items
- Track quality of subcontracted work

### 2. Batch and Serial Number Tracking
- Auto-creation of batches/serials
- Track components by batch/serial in production
- Maintain lot traceability
- Support for expiry date tracking
- Traceability of components
- Quality control integration

### 3. Capacity Planning
- Workstation loading
- Operation scheduling
- Bottleneck analysis

### 4. Quality Management
- Quality inspections
- Defect tracking
- Non-conformance reporting

## Common Queries

### 1. Get Production Plan Status
```sql
SELECT 
    pp.name as production_plan,
    pp.status,
    pp.posting_date,
    COUNT(DISTINCT wo.name) as work_orders,
    SUM(wo.produced_qty) as total_produced,
    SUM(wo.qty) as total_planned
FROM 
    `tabProduction Plan` pp
LEFT JOIN 
    `tabWork Order` wo ON wo.production_plan = pp.name
WHERE 
    pp.docstatus = 1
    AND pp.status != 'Completed'
GROUP BY 
    pp.name, pp.status, pp.posting_date
ORDER BY 
    pp.posting_date DESC;
```

### 2. Get Active BOM for an Item
```sql
SELECT 
    b.name, 
    b.item, 
    i.item_name,
    b.is_active, 
    b.is_default, 
    b.quantity, 
    b.total_cost,
    b.uom,
    b.currency
FROM `tabBOM` b
JOIN `tabItem` i ON b.item = i.item_code
WHERE b.item = 'ITEM-CODE' 
  AND b.is_active = 1
  AND b.docstatus = 1
ORDER BY b.is_default DESC, b.creation DESC
LIMIT 1;
```

### 2. Get Open Work Orders
```sql
SELECT 
    wo.name,
    wo.production_item,
    i.item_name,
    wo.qty,
    wo.produced_qty,
    wo.status,
    wo.planned_start_date,
    wo.expected_delivery_date
FROM 
    `tabWork Order` wo
JOIN 
    `tabItem` i ON wo.production_item = i.name
WHERE 
    wo.docstatus = 1 
    AND wo.status NOT IN ('Completed', 'Stopped', 'Cancelled')
ORDER BY 
    wo.planned_start_date;
```

## Integration Points

### 1. Inventory Integration
- **Material Consumption**: Stock entries for raw material consumption
- **Finished Goods**: Stock entries for finished goods receipt
- **Scrap Items**: Track and account for production scrap

### 2. Purchasing Integration
- **Subcontracting**: Manage subcontracted operations
- **Raw Material Procurement**: Generate purchase requests for components

### 3. Accounting Integration
- **Work in Progress (WIP)**: Track WIP accounting entries
- **Costing**: Update item standard costs based on BOM

## Performance Optimization

### 1. Database Indexing
```sql
-- Recommended indexes for manufacturing tables
CREATE INDEX idx_work_order_status ON `tabWork Order`(status, docstatus);
CREATE INDEX idx_bom_item ON `tabBOM`(item, is_active, is_default);
CREATE INDEX idx_production_plan_status ON `tabProduction Plan`(status, docstatus);
```

### 2. Query Optimization
- Use `EXPLAIN` to analyze query performance
- Avoid `SELECT *` in reports
- Use pagination for large datasets
- Cache frequently accessed data

### 3. System Configuration
- Optimize batch size for background jobs
- Configure appropriate worker count
- Monitor long-running operations

## Best Practices

### 1. BOM Management
- Maintain accurate BOM versions
- Set appropriate scrap percentages
- Define alternative items where applicable
- Regularly review and update BOM costs

### 2. Work Order Processing
- Plan production based on material availability
- Track actual vs planned production times
- Monitor work order progress in real-time
- Implement quality checks at critical points

### 3. Performance Optimization
- Index frequently queried fields
- Archive completed manufacturing documents
- Regularly analyze production efficiency

## API Integration Examples

### 1. Create Work Order
```python
import frappe

def create_work_order(item_code, qty, bom_no=None, planned_start_date=None):
    """
    Create a new work order
    
    Args:
        item_code (str): Item to be manufactured
        qty (float): Quantity to produce
        bom_no (str, optional): Specific BOM to use
        planned_start_date (str, optional): Start date (YYYY-MM-DD)
    """
    if not planned_start_date:
        planned_start_date = frappe.utils.today()
    
    wo = frappe.get_doc({
        'doctype': 'Work Order',
        'production_item': item_code,
        'qty': qty,
        'bom_no': bom_no,
        'planned_start_date': planned_start_date,
        'company': 'Your Company',
        'fg_warehouse': 'Stores - YC'
    })
    
    wo.insert(ignore_permissions=True)
    wo.submit()
    return wo.name
```

### 2. Update Job Card Status
```python
def update_job_card_status(job_card, status):
    """
    Update job card status
    
    Args:
        job_card (str): Job Card ID
        status (str): New status (Open, Work In Progress, Completed)
    """
    jc = frappe.get_doc('Job Card', job_card)
    jc.status = status
    jc.save()
    frappe.db.commit()
    return jc.name
```
## Integration with Other Modules

### 1. Inventory Integration
- Automatic stock entries for production
- Batch/serial number tracking
- Scrap handling

### 2. Accounting Integration
- Work in Progress (WIP) accounting
- Production cost calculation
- Overhead absorption

### 3. HR Integration
- Employee time tracking
- Work center assignments
- Performance monitoring

## Troubleshooting

### Common Issues
1. **BOM Not Found**
   - Verify BOM is active and default
   - Check if BOM has components defined
   - Ensure BOM is submitted

2. **Insufficient Raw Materials**
   - Check stock levels in source warehouse
   - Verify reserved quantities
   - Check material requests and purchase orders

3. **Work Order Stuck**
   - Check job card status
   - Verify workstation availability
   - Check for pending quality inspections
