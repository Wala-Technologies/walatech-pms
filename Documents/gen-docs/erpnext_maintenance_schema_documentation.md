# WalaTech Maintenance Module - Database Schema Documentation

## Overview
This document provides a detailed guide to the WalaTech Maintenance module's database schema, focusing on tables, relationships, and foreign key constraints. This documentation is essential for developers working on reimplementing or integrating with the WalaTech Maintenance system.

## Core Tables

## 3. Advanced Maintenance Features

### 3.1 Preventive Maintenance
- **Scheduled Maintenance**: Automatically generate maintenance tasks based on time/meter readings
- **Condition-Based Monitoring**: Integration with IoT sensors for real-time asset monitoring
- **Predictive Maintenance**: AI/ML based failure prediction
- **Maintenance Templates**: Predefined maintenance procedures for common asset types
- **Recurring Tasks**: Set up maintenance schedules with custom frequencies

### 3.2 Work Order Management
- **Work Order Creation**: Generate from maintenance schedules or on-demand
- **Task Assignment**: Assign to technicians or teams
- **Priority Management**: Set and track work order priorities
- **Time Tracking**: Record time spent on maintenance tasks
- **Documentation**: Attach checklists, manuals, and completion reports

### 3.3 Spare Parts Management
- **Bill of Materials (BOM)**: Define required parts for maintenance
- **Inventory Integration**: Check part availability in real-time
- **Requisition Process**: Automate spare parts requests
- **Cost Tracking**: Monitor maintenance part expenditures
- **Vendor Management**: Preferred suppliers for specific parts

### 3.4 Service Level Agreements (SLA)
- **Response Time Tracking**: Measure time to acknowledge issues
- **Resolution Time**: Track time to complete maintenance
- **Priority Matrix**: Define SLAs based on issue severity
- **Escalation Paths**: Automatic escalation for overdue tasks
- **Performance Reporting**: SLA compliance metrics

## 4. Integration Points

### 4.1 Asset Management
- Asset hierarchy and parent-child relationships
- Maintenance history and logs
- Depreciation and value tracking
- Warranty management
- Location tracking

### 4.2 Inventory Management
- Spare parts inventory
- Stock reservation for maintenance
- Minimum stock level alerts
- Purchase requisitions for parts
- Stock reconciliation

### 4.3 Accounting Integration
- Maintenance cost tracking
- Work order costing
- Budget vs. actuals
- Capital vs. expense classification
- Cost center allocation

## 5. API Integration Examples

### 5.1 Create Maintenance Schedule
```python
import frappe

def create_maintenance_schedule(asset, tasks, frequency, start_date):
    """
    Create a maintenance schedule for an asset
    asset: Asset name
    tasks: List of maintenance tasks
    frequency: Maintenance frequency (Daily/Weekly/Monthly/Yearly)
    start_date: Schedule start date
    """
    schedule = frappe.new_doc("Maintenance Schedule")
    schedule.asset = asset
    schedule.frequency = frequency
    schedule.start_date = start_date
    
    for task in tasks:
        schedule.append('tasks', {
            'maintenance_task': task['name'],
            'start_date': start_date,
            'periodicity': frequency,
            'no_of_visits': 1,
            'suggested_parts': task.get('suggested_parts', '')
        })
    
    schedule.save()
    return schedule.name
```

### 5.2 Create Maintenance Visit
```python
def create_maintenance_visit(purpose, customer, maintenance_team, items):
    """Create a maintenance visit record"""
    visit = frappe.new_doc("Maintenance Visit")
    visit.purpose = purpose
    visit.customer = customer
    visit.maintenance_team = maintenance_team
    visit.completion_status = 'Partially Completed'
    
    for item in items:
        visit.append('purposes', {
            'item_code': item['item_code'],
            'item_name': item['item_name'],
            'service_person': item.get('service_person'),
            'work_done': item.get('work_done', '')
        })
    
    visit.save()
    return visit.name
```

## 6. Performance Optimization

### 6.1 Database Indexing
```sql
-- Recommended indexes for large deployments
CREATE INDEX idx_maintenance_asset ON `tabMaintenance Schedule`(asset);
CREATE INDEX idx_maintenance_team ON `tabMaintenance Team`(maintenance_team_name);
CREATE INDEX idx_work_order_status ON `tabMaintenance Work Order`(status);
CREATE INDEX idx_visit_date ON `tabMaintenance Visit`(maintenance_date);
CREATE INDEX idx_asset_serial ON `tabAsset`(serial_no);
```

### 6.2 Caching Strategies
- Cache frequently accessed maintenance schedules
- Pre-load asset maintenance history
- Cache spare parts inventory levels
- Implement pagination for maintenance logs
- Cache team assignments and schedules

## 7. Security Considerations

### 7.1 Access Control
- Role-based access to maintenance records
- Team-based record visibility
- Field-level permissions for sensitive data
- Approval workflows for critical maintenance
- Audit trails for all changes

### 7.2 Data Validation
- Validate maintenance schedules against asset availability
- Check spare parts availability before scheduling
- Validate technician certifications for specific tasks
- Enforce maintenance windows
- Validate service level agreements

## 8. Core Tables

### 8.1 tabAsset Maintenance
Defines maintenance requirements for assets.

**Key Columns:**
- `name` (PK): Maintenance ID
- `asset_name`: Name of the asset
- `asset_category`: Reference to `tabAsset Category`
- `company`: Reference to `tabCompany`
- `maintenance_team`: Team responsible
- `maintenance_manager`: Primary contact
- `maintenance_type`: Type of maintenance
- `periodicity`: Frequency of maintenance
- `start_date`: When maintenance begins
- `end_date`: When maintenance ends
- `sla_achievement`: SLA compliance percentage
- `status`: Active/Inactive status

### 2. tabAsset Maintenance Log
Tracks maintenance activities performed on assets.

**Key Columns:**
- `name` (PK): Log ID
- `asset`: Reference to `tabAsset`
- `item_code`: Reference to `tabItem`
- `item_name`: Name of the item
- `task`: Description of maintenance task
- `maintenance_type`: Type of maintenance
- `periodicity`: Maintenance frequency
- `due_date`: When maintenance is due
- `completion_date`: When completed
- `maintenance_status`: Status of maintenance
- `assign_to_name`: Assigned to
- `assign_to`: Reference to `tabUser`
- `maintenance_team`: Reference to `tabMaintenance Team`

### 3. tabAsset Maintenance Task
Defines specific tasks for asset maintenance.

**Key Columns:**
- `name` (PK): Task ID
- `maintenance_task`: Task name
- `start_date`: Start date
- `end_date`: End date
- `assign_to`: Reference to `tabUser`
- `assign_to_name`: Name of assignee
- `next_due_date`: Next due date
- `last_completion_date`: Last completion date
- `certificate_required`: If certificate needed
- `certificate_no`: Certificate number
- `description`: Task details

### 4. tabAsset Repair
Tracks repairs performed on assets.

**Key Columns:**
- `name` (PK): Repair ID
- `asset`: Reference to `tabAsset`
- `asset_name`: Name of asset
- `failure_date`: When failure occurred
- `description`: Description of issue
- `repair_status`: Status of repair
- `repair_type`: Type of repair
- `repair_cost`: Cost of repair
- `repair_actions`: Actions taken
- `repair_details`: Detailed notes
- `service_person`: Reference to `tabUser`
- `company`: Reference to `tabCompany`
- `purchase_invoice`: Reference to `tabPurchase Invoice`

### 5. tabAsset Repair Consumed Item
Tracks items consumed during repairs.

**Key Columns:**
- `name` (PK): Record ID
- `item_code`: Reference to `tabItem`
- `item_name`: Name of item
- `description`: Item description
- `warehouse`: Reference to `tabWarehouse`
- `qty`: Quantity consumed
- `rate`: Unit rate
- `amount`: Total amount
- `serial_no`: Serial numbers
- `batch_no`: Batch numbers
- `stock_uom`: Reference to `tabUOM`

### 6. tabAsset Movement
Tracks movement of assets between locations.

**Key Columns:**
- `name` (PK): Movement ID
- `purpose`: Reason for movement
- `company`: Reference to `tabCompany`
- `transaction_date`: Date of movement
- `reference_doctype`: Related document type
- `reference_name`: Related document
- `status`: Status of movement
- `amended_from`: Previous version

### 7. tabAsset Movement Item
Details of items moved in asset movements.

**Key Columns:**
- `name` (PK): Record ID
- `asset`: Reference to `tabAsset`
- `asset_name`: Name of asset
- `from_employee`: Reference to `tabEmployee`
- `to_employee`: Reference to `tabEmployee`
- `source_location`: Reference to `tabLocation`
- `target_location`: Reference to `tabLocation`
- `serial_no`: Serial numbers
- `batch_no`: Batch numbers

### 8. tabAsset Value Adjustment
Records changes in asset values.

**Key Columns:**
- `name` (PK): Adjustment ID
- `company`: Reference to `tabCompany`
- `asset`: Reference to `tabAsset`
- `asset_category`: Reference to `tabAsset Category`
- `finance_book`: Reference to `tabFinance Book`
- `cost_center`: Reference to `tabCost Center`
- `current_asset_value`: Current value
- `new_asset_value`: New value
- `difference_amount`: Adjustment amount
- `posting_date`: Date of adjustment
- `amended_from`: Previous version

### 9. tabMaintenance Schedule
Schedules maintenance for assets.

**Key Columns:**
- `name` (PK): Schedule ID
- `customer`: Reference to `tabCustomer`
- `customer_name`: Name of customer
- `status`: Schedule status
- `transaction_date`: Creation date
- `customer_address`: Reference to `tabAddress`
- `contact_person`: Primary contact
- `territory`: Reference to `tabTerritory`
- `company`: Reference to `tabCompany`
- `amended_from`: Previous version

### 10. tabMaintenance Schedule Item
Items included in maintenance schedule.

**Key Columns:**
- `name` (PK): Record ID
- `item_code`: Reference to `tabItem`
- `item_name`: Name of item
- `start_date`: Start date
- `end_date`: End date
- `periodicity`: Maintenance frequency
- `no_of_visits`: Number of visits
- `sales_person`: Reference to `tabSales Person`
- `serial_no`: Serial numbers
- `sales_order`: Reference to `tabSales Order`

### 11. tabMaintenance Visit
Records maintenance visits.

**Key Columns:**
- `name` (PK): Visit ID
- `customer`: Reference to `tabCustomer`
- `customer_name`: Name of customer
- `maintenance_schedule`: Reference to `tabMaintenance Schedule`
- `mntc_date`: Visit date
- `mntc_time`: Visit time
- `completion_status`: Status of visit
- `maintenance_type`: Type of maintenance
- `customer_feedback`: Feedback from customer
- `status`: Document status
- `territory`: Reference to `tabTerritory`
- `company`: Reference to `tabCompany`

### 12. tabMaintenance Visit Purpose
Purpose of maintenance visits.

**Key Columns:**
- `name` (PK): Record ID
- `item_code`: Reference to `tabItem`
- `item_name`: Name of item
- `service_person`: Reference to `tabUser`
- `description`: Description of work
- `work_done`: Details of work performed
- `prevdoc_doctype`: Previous document type
- `prevdoc_docname`: Previous document
- `maintenance_schedule_detail`: Reference to schedule

## Key Relationships

### 1. Asset Maintenance
- `tabAsset Maintenance` defines what needs maintenance
- `tabAsset Maintenance Log` tracks maintenance history
- `tabAsset Maintenance Task` defines specific tasks

### 2. Repairs
- `tabAsset Repair` tracks repair jobs
- `tabAsset Repair Consumed Item` tracks parts used
- Linked to purchase invoices for costs

### 3. Asset Movement
- `tabAsset Movement` records asset transfers
- `tabAsset Movement Item` details the items moved
- Tracks location and custodian changes

### 4. Maintenance Scheduling
- `tabMaintenance Schedule` plans maintenance
- `tabMaintenance Schedule Item` defines items to maintain
- `tabMaintenance Visit` records actual visits
- `tabMaintenance Visit Purpose` details work done

## Common Queries

### Get Pending Maintenance Tasks
```sql
SELECT 
    aml.name as log_id,
    aml.asset,
    a.asset_name,
    aml.item_code,
    aml.item_name,
    aml.task,
    aml.due_date,
    DATEDIFF(CURDATE(), aml.due_date) as days_overdue,
    aml.maintenance_status,
    aml.assign_to_name as assigned_to
FROM 
    `tabAsset Maintenance Log` aml
JOIN 
    `tabAsset` a ON aml.asset = a.name
WHERE 
    aml.maintenance_status != 'Completed'
    AND aml.docstatus = 1
ORDER BY 
    aml.due_date, a.asset_name;
```

### Get Asset Repair History
```sql
SELECT 
    ar.name as repair_id,
    ar.asset,
    a.asset_name,
    ar.failure_date,
    ar.repair_status,
    ar.repair_type,
    ar.repair_cost,
    ar.service_person,
    ar.warehouse,
    ar.completion_date,
    GROUP_CONCAT(DISTINCT arci.item_code SEPARATOR ', ') as parts_used
FROM 
    `tabAsset Repair` ar
JOIN 
    `tabAsset` a ON ar.asset = a.name
LEFT JOIN 
    `tabAsset Repair Consumed Item` arci ON ar.name = arci.parent
WHERE 
    ar.docstatus = 1
    AND ar.failure_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND CURDATE()
GROUP BY 
    ar.name
ORDER BY 
    ar.failure_date DESC;
```

### Get Maintenance Schedule Compliance
```sql
SELECT 
    ms.name as schedule_id,
    ms.customer,
    ms.customer_name,
    COUNT(DISTINCT msi.item_code) as total_items,
    COUNT(DISTINCT mv.name) as completed_visits,
    COUNT(DISTINCT msi.item_code) - COUNT(DISTINCT mv.name) as pending_visits,
    ROUND((COUNT(DISTINCT mv.name) / COUNT(DISTINCT msi.item_code)) * 100, 2) as compliance_percentage
FROM 
    `tabMaintenance Schedule` ms
JOIN 
    `tabMaintenance Schedule Item` msi ON ms.name = msi.parent
LEFT JOIN 
    `tabMaintenance Visit` mv ON ms.name = mv.maintenance_schedule 
    AND mv.docstatus = 1
    AND mv.status = 'Completed'
WHERE 
    ms.docstatus = 1
    AND ms.status = 'Submitted'
    AND msi.end_date >= CURDATE()
GROUP BY 
    ms.name, ms.customer, ms.customer_name
ORDER BY 
    compliance_percentage, ms.customer_name;
```

### Get Asset Movement History
```sql
SELECT 
    ami.asset,
    a.asset_name,
    ami.source_location as from_location,
    ami.target_location as to_location,
    ami.from_employee,
    ami.to_employee,
    am.transaction_date as movement_date,
    am.purpose,
    am.reference_doctype,
    am.reference_name
FROM 
    `tabAsset Movement Item` ami
JOIN 
    `tabAsset Movement` am ON ami.parent = am.name
JOIN 
    `tabAsset` a ON ami.asset = a.name
WHERE 
    am.docstatus = 1
    AND am.transaction_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
ORDER BY 
    am.transaction_date DESC, ami.asset;
```

## Integration Points

### 1. Asset Management
- Tracks maintenance against assets
- Updates asset status based on maintenance
- Records maintenance history

### 2. Inventory
- Tracks parts used in maintenance
- Updates stock levels
- Manages spare parts inventory

### 3. Accounting
- Records maintenance costs
- Tracks repair expenses
- Links to purchase invoices

### 4. Customer Relationship
- Schedules maintenance visits
- Records customer feedback
- Manages service contracts

## Best Practices

### 1. Preventive Maintenance
- Schedule regular maintenance
- Set up maintenance calendars
- Track maintenance history

### 2. Asset Tracking
- Record all asset movements
- Update custodian information
- Track asset conditions

### 3. Cost Control
- Monitor maintenance costs
- Track parts usage
- Analyze repair trends

### 4. Compliance
- Maintain service records
- Track certifications
- Document maintenance activities

## Troubleshooting

### Common Issues
1. **Missed Maintenance**
   - Check maintenance schedules
   - Review notification settings
   - Verify assigned personnel

2. **High Maintenance Costs**
   - Analyze parts usage
   - Review service contracts
   - Consider preventive measures

3. **Asset Downtime**
   - Optimize maintenance schedules
   - Keep critical spares
   - Train maintenance staff

4. **Data Inconsistencies**
   - Regular data validation
   - Check foreign key constraints
   - Maintain audit trails
