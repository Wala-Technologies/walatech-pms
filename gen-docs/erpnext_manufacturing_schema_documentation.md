# WalaTech Manufacturing Module - Database Schema Documentation

## Table of Contents

- [1. Bill of Materials (BOM)](#1-bill-of-materials-bom)
  - [1.1 Core BOM Table](#11-core-bom-table)
  - [1.2 BOM Items](#12-bom-items)
  - [1.3 BOM Operations](#13-bom-operations)
  - [1.4 BOM Scrap Items](#14-bom-scrap-items)
  - [1.5 Key Relationships](#15-key-relationships)
  - [1.6 Example Queries](#16-example-queries)

- [2. Work Order](#2-work-order)
  - [2.1 Core Work Order Table](#21-core-work-order-table)
  - [2.2 Work Order Items](#22-work-order-items)
  - [2.3 Work Order Operations](#23-work-order-operations)
  - [2.4 Key Relationships](#24-key-relationships)
  - [2.5 Example Queries](#25-example-queries)

- [3. Job Card](#3-job-card)
  - [3.1 Core Job Card Table](#31-core-job-card-table)
  - [3.2 Job Card Items](#32-job-card-items)
  - [3.3 Job Card Operations](#33-job-card-operations)
  - [3.4 Key Relationships](#34-key-relationships)
  - [3.5 Example Queries](#35-example-queries)

## 1. Bill of Materials (BOM)

### 1.1 Core BOM Table

**Table Name:** `tabBOM`

**Description:** The main BOM table that defines the structure and components required to manufacture an item.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated BOM name |
| `item` | varchar(255) | Link to Item master (finished good) |
| `item_name` | varchar(255) | Name of the item |
| `company` | varchar(255) | Company this BOM belongs to |
| `uom` | varchar(140) | Unit of Measure for the BOM |
| `quantity` | decimal(21,9) | Quantity of items this BOM produces |
| `is_active` | int(1) | Whether this BOM is active (1) or not (0) |
| `is_default` | int(1) | Whether this is the default BOM for the item |
| `allow_alternative_item` | int(1) | Allow alternative items in production |
| `set_rate_of_sub_assembly_item_based_on_bom` | int(1) | Calculate sub-assembly rates from BOM |
| `with_operations` | int(1) | Whether operations are defined for this BOM |
| `transfer_material_against` | varchar(140) | Document type for material transfer (Work Order/Job Card) |
| `routing` | varchar(255) | Link to Routing master |
| `fg_based_operating_cost` | int(1) | Calculate operating cost based on finished good qty |
| `operating_cost` | decimal(21,9) | Total operating cost |
| `raw_material_cost` | decimal(21,9) | Total raw material cost |
| `scrap_material_cost` | decimal(21,9) | Total scrap material cost |
| `total_cost` | decimal(21,9) | Total manufacturing cost |
| `process_loss_percentage` | decimal(21,9) | Expected process loss percentage |
| `process_loss_qty` | decimal(21,9) | Expected process loss quantity |
| `inspection_required` | int(1) | Quality inspection required |
| `quality_inspection_template` | varchar(255) | Template for quality inspection |
| `show_in_website` | int(1) | Show BOM in website |
| `route` | varchar(140) | URL route for web access |
| `amended_from` | varchar(255) | Link to amended BOM |

### 1.2 BOM Items

**Table Name:** `tabBOM Item`

**Description:** Lists all components/raw materials required to manufacture the item.

**Key Fields:**

- `parent`: Link to parent BOM
- `item_code`: Component item code
- `item_name`: Component item name
- `qty`: Quantity required per BOM quantity
- `rate`: Rate of the item
- `amount`: Total amount (qty * rate)
- `uom`: Unit of Measure
- `sourced_by_supplier`: Whether item is supplied by a sub-contractor

### 1.3 BOM Operations

**Table Name:** `tabBOM Operation`

**Description:** Defines the operations/processes required to manufacture the item.

**Key Fields:**

- `parent`: Link to parent BOM
- `operation`: Operation name (e.g., Cutting, Welding, Assembly)
- `workstation`: Workstation where operation is performed
- `time_in_mins`: Time required in minutes
- `hour_rate`: Hourly rate for the operation
- `operating_cost`: Calculated cost (time_in_mins * hour_rate / 60)
- `sequence_id`: Order of operations

### 1.4 BOM Scrap Items

**Table Name:** `tabBOM Scrap Item`

**Description:** Tracks expected scrap items from the manufacturing process.

**Key Fields:**

- `parent`: Link to parent BOM
- `item_code`: Scrap item code
- `item_name`: Scrap item name
- `qty`: Expected scrap quantity
- `rate`: Rate of the scrap item
- `amount`: Total amount (qty * rate)
- `stock_uom`: Stock UOM of the scrap item

### 1.5 Key Relationships

1. **BOM to Item**:

   - `tabBOM.item` → `tabItem.name`
   - `tabBOM.uom` → `tabUOM.name`

2. **BOM Items to Item**:

   - `tabBOM Item.item_code` → `tabItem.name`
   - `tabBOM Item.uom` → `tabUOM.name`

3. **BOM to Company**:

   - `tabBOM.company` → `tabCompany.name`

4. **BOM to Routing**:

   - `tabBOM.routing` → `tabRouting.name`

5. **BOM Operations to Workstation**:

   - `tabBOM Operation.workstation` → `tabWorkstation.name`

6. **BOM Scrap Items to Item**:

   - `tabBOM Scrap Item.item_code` → `tabItem.name`

### 1.6 Example Queries

1. **Get BOM details for an item**

   ```sql
   SELECT name, item, item_name, quantity, is_active, is_default
   FROM `tabBOM`
   WHERE item = 'ITEM-CODE' AND is_active = 1
   ORDER BY is_default DESC, creation DESC;
   ```

2. **List all components in a BOM**

   ```sql
   SELECT bi.item_code, bi.item_name, bi.qty, bi.uom, bi.rate, bi.amount
   FROM `tabBOM Item` bi
   WHERE bi.parent = 'BOM-NAME'
   ORDER BY bi.idx;
   ```

3. **Find BOMs where a specific item is used**

   ```sql
   SELECT b.name, b.item, b.item_name, bi.qty, bi.uom
   FROM `tabBOM` b
   JOIN `tabBOM Item` bi ON b.name = bi.parent
   WHERE bi.item_code = 'COMPONENT-ITEM-CODE' AND b.docstatus < 2
   ORDER BY b.item;
   ```

4. **Get BOM cost breakdown**

   ```sql
   SELECT 
       b.name, b.item, b.item_name, b.quantity,
       b.raw_material_cost, b.operating_cost, b.total_cost,
       (b.total_cost / b.quantity) as cost_per_unit
   FROM `tabBOM` b
   WHERE b.name = 'BOM-NAME';
   ```

5. **List all active BOMs with their operations**

   ```sql
   SELECT 
       b.name, b.item, b.item_name, 
       bo.operation, bo.workstation, bo.time_in_mins, bo.hour_rate
   FROM `tabBOM` b
   LEFT JOIN `tabBOM Operation` bo ON b.name = bo.parent
   WHERE b.is_active = 1 AND b.docstatus = 1
   ORDER BY b.item, bo.idx;
   ```

## 2. Work Order

### 2.1 Core Work Order Table

**Table Name:** `tabWork Order`

**Description:** Tracks the manufacturing order for producing items based on a BOM.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated Work Order name |
| `production_item` | varchar(255) | Link to Item master (finished good) |
| `item_name` | varchar(255) | Name of the production item |
| `bom_no` | varchar(255) | Link to BOM |
| `qty` | decimal(21,9) | Quantity to manufacture |
| `produced_qty` | decimal(21,9) | Quantity already produced |
| `status` | varchar(140) | Current status (Draft, Not Started, In Process, etc.) |
| `company` | varchar(255) | Company this work order belongs to |
| `fg_warehouse` | varchar(255) | Target warehouse for finished goods |
| `wip_warehouse` | varchar(255) | Work-in-progress warehouse |
| `scrap_warehouse` | varchar(255) | Warehouse for scrap items |
| `planned_start_date` | datetime | Scheduled start date |
| `planned_end_date` | datetime | Scheduled completion date |
| `actual_start_date` | datetime | Actual start date |
| `actual_end_date` | datetime | Actual completion date |
| `use_multi_level_bom` | int(1) | Use multi-level BOM |
| `transfer_material_against` | varchar(140) | Document type for material transfer |
| `skip_transfer` | int(1) | Skip material transfer |
| `project` | varchar(255) | Link to Project |
| `sales_order` | varchar(255) | Link to Sales Order |

### 2.2 Work Order Items

**Table Name:** `tabWork Order Item`

**Description:** Lists all raw materials/components required for the work order.

**Key Fields:**
- `parent`: Link to parent Work Order
- `item_code`: Component item code
- `item_name`: Component item name
- `source_warehouse`: Source warehouse for the component
- `required_qty`: Quantity required
- `transferred_qty`: Quantity already transferred
- `consumed_qty`: Quantity consumed in production
- `returned_qty`: Quantity returned to stock

### 2.3 Work Order Operations

**Table Name:** `tabWork Order Operation`

**Description:** Defines the operations to be performed for the work order.

**Key Fields:**

- `parent`: Link to parent Work Order
- `operation`: Operation name
- `workstation`: Workstation where operation is performed
- `status`: Operation status
- `completed_qty`: Quantity completed
- `bom`: Link to BOM
- `time_in_mins`: Time required in minutes
- `hour_rate`: Hourly rate for the operation

### 2.4 Key Relationships

1. **Work Order to Item**:

   - `tabWork Order.production_item` → `tabItem.name`
   - `tabWork Order.stock_uom` → `tabUOM.name`

2. **Work Order to BOM**:

   - `tabWork Order.bom_no` → `tabBOM.name`

3. **Work Order to Company**:

   - `tabWork Order.company` → `tabCompany.name`

4. **Work Order to Warehouse**:

   - `tabWork Order.fg_warehouse` → `tabWarehouse.name`
   - `tabWork Order.wip_warehouse` → `tabWarehouse.name`
   - `tabWork Order.scrap_warehouse` → `tabWarehouse.name`

### 2.5 Example Queries

1. **Get active work orders**

   ```sql
   SELECT name, production_item, qty, produced_qty, status, planned_start_date, planned_end_date
   FROM `tabWork Order`
   WHERE status NOT IN ('Completed', 'Stopped', 'Cancelled')
   ORDER BY planned_start_date;
   ```

2. **Get work order items with pending transfers**

   ```sql
   SELECT 
       woi.parent, woi.item_code, woi.item_name,
       woi.required_qty, woi.transferred_qty,
       (woi.required_qty - IFNULL(woi.transferred_qty, 0)) as pending_qty
   FROM `tabWork Order Item` woi
   JOIN `tabWork Order` wo ON woi.parent = wo.name
   WHERE wo.docstatus = 1 
     AND wo.status NOT IN ('Completed', 'Stopped', 'Cancelled')
     AND woi.required_qty > IFNULL(woi.transferred_qty, 0);
   ```

3. **Get work orders by production item**

   ```sql
   SELECT 
       wo.name, wo.production_item, wo.qty, wo.produced_qty, wo.status,
       wo.planned_start_date, wo.planned_end_date,
       DATEDIFF(wo.planned_end_date, CURDATE()) as days_remaining
   FROM `tabWork Order` wo
   WHERE wo.production_item = 'ITEM-CODE'
   ORDER BY wo.planned_start_date DESC;
   ```

4. **Get work order operations status**

   ```sql
   SELECT 
       wo.name, wo.production_item, woo.operation, woo.workstation,
       woo.completed_qty, woo.status, woo.time_in_mins
   FROM `tabWork Order` wo
   JOIN `tabWork Order Operation` woo ON wo.name = woo.parent
   WHERE wo.status = 'In Process'
   ORDER BY wo.name, woo.idx;
   ```

## 3. Job Card

### 3.1 Core Job Card Table

**Table Name:** `tabJob Card`

**Description:** Tracks the execution of manufacturing operations for work orders.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated Job Card name |
| `work_order` | varchar(255) | Link to Work Order |
| `production_item` | varchar(255) | Item being manufactured |
| `for_quantity` | decimal(21,9) | Quantity to be processed |
| `workstation` | varchar(255) | Workstation where work is performed |
| `operation` | varchar(255) | Operation being performed |
| `status` | varchar(140) | Current status (Open, Work In Progress, Completed, etc.) |
| `company` | varchar(255) | Company this job card belongs to |
| `project` | varchar(255) | Link to Project |
| `operation_id` | varchar(255) | Reference to Work Order Operation |
| `time_logs` | Table | Time tracking for operations |
| `total_completed_qty` | decimal(21,9) | Total quantity completed |
| `total_time_in_mins` | decimal(21,9) | Total time taken in minutes |

### 3.2 Job Card Items

**Table Name:** `tabJob Card Item`

**Description:** Tracks items consumed in the job card operation.

**Key Fields:**

- `parent`: Link to parent Job Card
- `item_code`: Item being consumed
- `item_name`: Name of the item
- `source_warehouse`: Warehouse from where item is consumed
- `required_qty`: Quantity required
- `transferred_qty`: Quantity transferred
- `consumed_qty`: Quantity consumed

### 3.3 Job Card Operations

**Table Name:** `tabJob Card Operation`

**Description:** Tracks operations performed in the job card.

**Key Fields:**

- `parent`: Link to parent Job Card
- `sub_operation`: Operation name
- `completed_qty`: Quantity completed
- `time_in_mins`: Time taken in minutes

### 3.4 Key Relationships

1. **Job Card to Work Order**:

   - `tabJob Card.work_order` → `tabWork Order.name`

2. **Job Card to Item**:

   - `tabJob Card.production_item` → `tabItem.name`

3. **Job Card to Workstation**:

   - `tabJob Card.workstation` → `tabWorkstation.name`

4. **Job Card to Project**:

   - `tabJob Card.project` → `tabProject.name`

### 3.5 Example Queries

1. **Get active job cards**

   ```sql
   SELECT jc.name, jc.work_order, jc.production_item, jc.for_quantity, jc.status,
          jc.operation, jc.workstation
   FROM `tabJob Card` jc
   WHERE jc.status NOT IN ('Completed', 'Cancelled')
   ORDER BY jc.work_order, jc.operation;
   ```

2. **Get job card time logs**

   ```sql
   SELECT 
       jc.name, jc.work_order, jc.operation, jc.workstation,
       jctl.from_time, jctl.to_time,
       TIMESTAMPDIFF(MINUTE, jctl.from_time, jctl.to_time) as duration_minutes
   FROM `tabJob Card` jc
   JOIN `tabJob Card Time Log` jctl ON jc.name = jctl.parent
   WHERE jc.work_order = 'WRK-ORDER-0001'
   ORDER BY jctl.from_time;
   ```

3. **Get pending job cards by workstation**

   ```sql
   SELECT 
       jc.workstation, COUNT(*) as pending_count,
       GROUP_CONCAT(jc.name) as job_cards
   FROM `tabJob Card` jc
   WHERE jc.status IN ('Open', 'Work In Progress')
   GROUP BY jc.workstation
   ORDER BY pending_count DESC;
   ```

4. **Get job card productivity metrics**

   ```sql
   SELECT 
       jc.operation, jc.workstation,
       COUNT(*) as total_jobs,
       SUM(jc.for_quantity) as total_quantity,
       AVG(TIMESTAMPDIFF(MINUTE, jctl.from_time, jctl.to_time)) as avg_duration_minutes
   FROM `tabJob Card` jc
   JOIN `tabJob Card Time Log` jctl ON jc.name = jctl.parent
   WHERE jc.docstatus = 1
     AND jc.status = 'Completed'
     AND jctl.to_time BETWEEN '2023-01-01' AND '2023-12-31'
   GROUP BY jc.operation, jc.workstation
   ORDER BY jc.operation, jc.workstation;
   ```

## 4. Workstation

### 4.1 Core Workstation Table

**Table Name:** `tabWorkstation`

**Description:** Defines workstations where manufacturing operations are performed.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated Workstation name |
| `workstation_name` | varchar(255) | Display name of the workstation |
| `workstation_type` | varchar(255) | Type/category of the workstation |
| `production_capacity` | int(11) | Maximum capacity per hour |
| `hour_rate` | decimal(21,9) | Operating cost per hour |
| `company` | varchar(255) | Company this workstation belongs to |
| `warehouse` | varchar(255) | Default warehouse for this workstation |
| `status` | varchar(140) | Current status (Active, Inactive, Under Maintenance) |

### 4.2 Workstation Working Hours

**Table Name:** `tabWorkstation Working Hour`

**Description:** Defines operating hours for workstations.

**Key Fields:**
- `parent`: Link to parent Workstation
- `start_time`: Start time of operation
- `end_time`: End time of operation
- `enabled`: Whether this time slot is active

## 5. Production Plan

### 5.1 Core Production Plan Table

**Table Name:** `tabProduction Plan`

**Description:** Used to plan and schedule production based on sales orders or material requests.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated Production Plan name |
| `company` | varchar(255) | Company this plan belongs to |
| `status` | varchar(140) | Current status (Draft, Submitted, Completed) |
| `use_multi_level_bom` | int(1) | Consider multi-level BOMs |
| `include_non_stock_items` | int(1) | Include non-stock items |
| `include_subcontracted` | int(1) | Include subcontracted items |
| `include_safety_stock` | int(1) | Consider safety stock levels |
| `from_date` | date | Start date for planning |
| `to_date` | date | End date for planning |

### 5.2 Production Plan Item

**Table Name:** `tabProduction Plan Item`

**Description:** Items included in the production plan.

**Key Fields:**
- `parent`: Link to parent Production Plan
- `item_code`: Item to be produced
- `bom_no`: BOM to use for production
- `planned_qty`: Quantity to be produced
- `produced_qty`: Quantity already produced
- `requested_qty`: Quantity requested (from sales orders/MR)

## 6. Manufacturing Settings

**Table Name:** `tabManufacturing Settings`

**Description:** System-wide settings for the manufacturing module.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
|-------|------|-------------|
| `name` | varchar(255) | Always 'Manufacturing Settings' |
| `default_wip_warehouse` | varchar(255) | Default WIP warehouse |
| `default_fg_warehouse` | varchar(255) | Default finished goods warehouse |
| `default_scrap_warehouse` | varchar(255) | Default scrap warehouse |
| `backflush_raw_materials_based_on` | varchar(140) | When to consume raw materials |
| `material_consumption` | int(1) | Allow consumption more than required |
| `allow_overtime` | int(1) | Allow overtime in workstations |
| `capacity_planning_for_days` | int(11) | Default days for capacity planning |
| `disable_capacity_planning` | int(1) | Disable capacity planning |

## 7. Conclusion

This documentation provides a comprehensive overview of the WalaTech Manufacturing module's database schema, focusing on the core tables for Bill of Materials (BOM), Work Orders, and Job Cards. The schema is designed to support complex manufacturing workflows while maintaining data integrity through well-defined relationships.

### Key Takeaways

- **Bill of Materials (BOM)** serves as the foundation, defining what goes into making a product
- **Work Orders** manage the manufacturing process, tracking materials, operations, and progress
- **Job Cards** provide detailed tracking of work-in-progress at the operation level
- The schema supports multi-level BOMs, work centers, and quality inspections
- Comprehensive tracking of materials, time, and costs is built into the data model

### Next Steps

1. **Database Optimization**: Consider adding appropriate indexes on frequently queried fields
2. **Data Validation**: Implement additional constraints to ensure data quality
3. **Reporting**: Create views for common manufacturing KPIs and reports
4. **Integration**: Plan how this schema integrates with other modules like Inventory and Accounting

For more detailed information, refer to the [WalaTech Manufacturing Documentation](https://docs.WalaTech.com/docs/v13/user/manual/en/manufacturing).
