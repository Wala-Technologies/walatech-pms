# WalaTech Project Management - Database Schema Documentation

## Table of Contents
- [1. Core Project Tables](#1-core-project-tables)
  - [1.1 Project](#11-project)
  - [1.2 Task](#12-task)
  - [1.3 Timesheet](#13-timesheet)
- [2. Project Templates](#2-project-templates)
  - [2.1 Project Template](#21-project-template)
  - [2.2 Project Template Task](#22-project-template-task)
- [3. Project Configuration](#3-project-configuration)
  - [3.1 Project Type](#31-project-type)
  - [3.2 Task Type](#32-task-type)
  - [3.3 Activity Type](#33-activity-type)
- [4. Project Costing](#4-project-costing)
  - [4.1 Activity Cost](#41-activity-cost)
  - [4.2 Costing and Billing](#42-costing-and-billing)
- [5. Key Relationships](#5-key-relationships)
- [6. Example Queries](#6-example-queries)

## 1. Core Project Tables

### 1.1 Project

**Table Name:** `tabProject`

**Description:** Central table containing project definitions and tracking information.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `project_name` | varchar(255) | Name of the project |
| `status` | varchar(140) | Project status (Open, Completed, Cancelled) |
| `project_type` | varchar(255) | Type of project |
| `project_template` | varchar(255) | Link to project template |
| `company` | varchar(255) | Company this project belongs to |
| `customer` | varchar(255) | Customer for this project |
| `sales_order` | varchar(255) | Related sales order |
| `expected_start_date` | date | Planned start date |
| `expected_end_date` | date | Planned end date |
| `actual_start_date` | date | Actual start date |
| `actual_end_date` | date | Actual end date |
| `percent_complete` | decimal(18,9) | Percentage of project completion |
| `percent_complete_method` | varchar(140) | Method to calculate completion |
| `priority` | varchar(140) | Project priority (Low, Medium, High) |
| `is_active` | varchar(3) | Whether project is active (Yes/No) |
| `notes` | longtext | Project notes and description |
| `total_costing_amount` | decimal(21,9) | Total project cost |
| `total_billing_amount` | decimal(21,9) | Total amount billed |
| `total_sales_amount` | decimal(21,9) | Total sales amount |
| `total_billable_amount` | decimal(21,9) | Total billable amount |
| `total_billed_amount` | decimal(21,9) | Total amount already billed |
| `total_consumed_material_cost` | decimal(21,9) | Cost of materials consumed |
| `cost_center` | varchar(255) | Default cost center |
| `holiday_list` | varchar(255) | Holiday list for the project |

### 1.2 Task

**Table Name:** `tabTask`

**Description:** Tracks individual tasks within a project.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `subject` | varchar(255) | Task title |
| `project` | varchar(255) | Link to parent project |
| `status` | varchar(140) | Task status |
| `priority` | varchar(140) | Task priority |
| `exp_start_date` | datetime | Expected start date |
| `exp_end_date` | datetime | Expected end date |
| `act_start_date` | date | Actual start date |
| `act_end_date` | date | Actual end date |
| `completed_on` | date | When task was completed |
| `completed_by` | varchar(255) | Who completed the task |
| `progress` | decimal(18,9) | Percentage complete |
| `description` | longtext | Task details |
| `is_group` | int(1) | Is a task group |
| `is_milestone` | int(1) | Is a milestone |
| `parent_task` | varchar(255) | Parent task |
| `depends_on` | longtext | Task dependencies |
| `review_date` | date | Next review date |
| `total_costing_amount` | decimal(21,9) | Total cost |
| `total_billing_amount` | decimal(21,9) | Total billing amount |
| `task_weight` | decimal(21,9) | Weight for progress calculation |

### 1.3 Timesheet

**Table Name:** `tabTimesheet`

**Description:** Tracks time spent on projects and tasks.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `employee` | varchar(255) | Employee who logged time |
| `employee_name` | varchar(255) | Name of the employee |
| `company` | varchar(255) | Company |
| `customer` | varchar(255) | Customer |
| `start_date` | date | Start date of timesheet |
| `end_date` | date | End date of timesheet |
| `status` | varchar(140) | Timesheet status |
| `total_hours` | decimal(21,9) | Total hours logged |
| `total_billable_hours` | decimal(21,9) | Billable hours |
| `total_billed_hours` | decimal(21,9) | Billed hours |
| `total_costing_amount` | decimal(21,9) | Total cost |
| `total_billable_amount` | decimal(21,9) | Billable amount |
| `total_billed_amount` | decimal(21,9) | Billed amount |
| `per_billed` | decimal(21,9) | Percentage billed |
| `parent_project` | varchar(255) | Parent project |
| `sales_invoice` | varchar(255) | Linked sales invoice |

## 2. Project Templates

### 2.1 Project Template

**Table Name:** `tabProject Template`

**Description:** Templates for creating new projects with predefined tasks.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `template_name` | varchar(255) | Name of the template |
| `project_type` | varchar(255) | Type of project |
| `description` | text | Template description |

### 2.2 Project Template Task

**Table Name:** `tabProject Template Task`

**Description:** Tasks included in a project template.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `parent` | varchar(255) | Link to Project Template |
| `task` | varchar(255) | Task name |
| `subject` | varchar(255) | Task subject |
| `description` | text | Task description |
| `start` | int(11) | Start day (from project start) |
| `duration` | int(11) | Duration in days |
| `is_group` | int(1) | Is a task group |
| `parent_task` | varchar(255) | Parent task |
| `depends_on` | text | Task dependencies |

## 3. Project Configuration

### 3.1 Project Type

**Table Name:** `tabProject Type`

**Description:** Categories for projects (e.g., Internal, External, Support).

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `description` | text | Description of the project type |

### 3.2 Task Type

**Table Name:** `tabTask Type`

**Description:** Categories for tasks (e.g., Development, Testing, Documentation).

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `weight` | decimal(21,9) | Default weight for progress calculation |
| `description` | text | Description of the task type |

### 3.3 Activity Type

**Table Name:** `tabActivity Type`

**Description:** Types of activities that can be logged in timesheets.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key |
| `activity_type` | varchar(255) | Name of the activity |
| `costing_rate` | decimal(21,9) | Default costing rate |
| `billing_rate` | decimal(21,9) | Default billing rate |
| `disabled` | int(1) | Whether the activity is disabled |

## 4. Project Costing

### 4.1 Activity Cost

**Table Name:** `tabActivity Cost`

**Description:** Costing information for activities by employee and activity type.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `employee` | varchar(255) | Employee |
| `employee_name` | varchar(255) | Employee name |
| `activity_type` | varchar(255) | Activity type |
| `costing_rate` | decimal(21,9) | Costing rate |
| `billing_rate` | decimal(21,9) | Billing rate |
| `default` | int(1) | Is default |

### 4.2 Costing and Billing

**Table Name:** `tabTimesheet Detail`

**Description:** Detailed time entries with costing and billing information.

**Key Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | varchar(255) | Primary key, auto-generated |
| `parent` | varchar(255) | Link to Timesheet |
| `activity_type` | varchar(255) | Type of activity |
| `from_time` | datetime | Start time |
| `to_time` | datetime | End time |
| `hours` | decimal(21,9) | Hours worked |
| `completed` | int(1) | Is completed |
| `project` | varchar(255) | Link to Project |
| `task` | varchar(255) | Link to Task |
| `is_billable` | int(1) | Is billable |
| `billing_hours` | decimal(21,9) | Billable hours |
| `billing_rate` | decimal(21,9) | Billing rate |
| `billing_amount` | decimal(21,9) | Billing amount |
| `costing_rate` | decimal(21,9) | Costing rate |
| `costing_amount` | decimal(21,9) | Costing amount |

## 5. Key Relationships

1. **Project to Task**
   - `tabProject.name` → `tabTask.project`
   - One Project can have multiple Tasks

2. **Task to Timesheet Detail**
   - `tabTask.name` → `tabTimesheet Detail.task`
   - One Task can have multiple time entries

3. **Project to Timesheet**
   - `tabProject.name` → `tabTimesheet.parent_project`
   - One Project can have multiple Timesheets

4. **Project Template to Project**
   - `tabProject Template.name` → `tabProject.project_template`
   - One Template can be used for multiple Projects

5. **Project Template to Template Task**
   - `tabProject Template.name` → `tabProject Template Task.parent`
   - One Template has multiple Template Tasks

6. **Employee to Timesheet**
   - `tabEmployee.name` → `tabTimesheet.employee`
   - One Employee can have multiple Timesheets

7. **Customer to Project**
   - `tabCustomer.name` → `tabProject.customer`
   - One Customer can have multiple Projects

## 6. Advanced Project Features

### 6.1 Project Budgeting and Cost Control
- **Budget Distribution**: Allocate budget across tasks and cost centers
- **Budget vs Actual Tracking**: Monitor spending against budget in real-time
- **Cost Forecasting**: Predict final project costs based on current burn rate
- **Expense Claims**: Track and approve project-related expenses
- **Purchase Requests**: Manage procurement for project materials

### 6.2 Resource Management
- **Team Allocation**: Assign team members with defined roles
- **Resource Utilization**: Track team capacity and workload
- **Skills Matrix**: Match team skills to project requirements
- **Availability Calendar**: View team availability across projects
- **Workload Balancing**: Distribute tasks evenly among team members

### 6.3 Project Portfolio Management
- **Portfolio Dashboard**: Overview of all projects
- **Strategic Alignment**: Link projects to business objectives
- **Resource Allocation**: View resource distribution across projects
- **Portfolio Financials**: Consolidated financial tracking
- **Risk Assessment**: Identify and mitigate portfolio-level risks

### 6.4 Agile Project Management
- **Scrum/Kanban Boards**: Visual task management
- **Sprint Planning**: Plan and track sprints
- **Backlog Management**: Prioritize and refine user stories
- **Burndown Charts**: Track sprint progress
- **Velocity Tracking**: Measure team performance

### 6.5 Project Analytics and Reporting
- **Custom Dashboards**: Create project-specific dashboards
- **Earned Value Analysis**: Track project performance
- **Time Tracking Reports**: Analyze time spent on tasks
- **Budget vs Actual Reports**: Monitor financial performance
- **Resource Utilization Reports**: Optimize team allocation

## 7. Workflows

### 7.1 Project Lifecycle
1. **Initiation**
   - Project request and approval
   - Feasibility analysis
   - Stakeholder identification
   - Initial scope definition

2. **Planning**
   - Detailed project planning
   - Resource allocation
   - Budget approval
   - Risk assessment
   - Timeline development

3. **Execution**
   - Task assignment
   - Progress tracking
   - Team collaboration
   - Quality assurance
   - Change management

4. **Monitoring & Control**
   - Performance measurement
   - Issue tracking
   - Risk management
   - Budget tracking
   - Progress reporting

5. **Closure**
   - Final deliverables
   - Project review
   - Lessons learned
   - Resource release
   - Documentation archiving

### 7.2 Approval Workflows
- **Project Approval**: Multi-level approval process
- **Budget Approval**: Financial authorization workflow
- **Timesheet Approval**: Manager review and sign-off
- **Expense Approval**: Multi-level expense approval
- **Change Request**: Formal change management

## 8. Integration Points

### 8.1 Core WalaTech Modules
- **Accounting**: Project costing, budgeting, and invoicing
- **CRM**: Customer projects and service delivery
- **HR**: Employee time tracking and performance
- **Inventory**: Material requirements and tracking
- **Asset Management**: Project asset allocation

### 8.2 Third-Party Integrations
- **Version Control**: GitHub, GitLab, Bitbucket
- **Communication**: Slack, Microsoft Teams
- **Document Management**: Google Drive, Dropbox
- **Design Tools**: Figma, Adobe XD
- **Testing Tools**: Jira, Selenium

## 9. API Integration Examples

### 9.1 Create a New Project
```python
import frappe

def create_project(project_name, customer, start_date, expected_end_date):
    project = frappe.get_doc({
        'doctype': 'Project',
        'project_name': project_name,
        'customer': customer,
        'expected_start_date': start_date,
        'expected_end_date': expected_end_date,
        'project_type': 'External',
        'priority': 'High'
    })
    project.insert(ignore_permissions=True)
    return project.name
```

### 9.2 Add Tasks to Project
```python
def add_task_to_project(project, subject, description, start_date, end_date, assigned_to):
    task = frappe.get_doc({
        'doctype': 'Task',
        'project': project,
        'subject': subject,
        'description': description,
        'exp_start_date': start_date,
        'exp_end_date': end_date,
        'assigned_to': assigned_to,
        'status': 'Open'
    })
    task.insert(ignore_permissions=True)
    return task.name
```

## 10. Performance Optimization

### 10.1 Database Indexing
```sql
-- Recommended indexes for performance
CREATE INDEX idx_project_status ON `tabProject`(status, is_active);
CREATE INDEX idx_task_project ON `tabTask`(project, status);
CREATE INDEX idx_timesheet_project ON `tabTimesheet`(parent_project, docstatus);
CREATE INDEX idx_timesheet_detail ON `tabTimesheet Detail`(parent, project, task);
```

### 10.2 Caching Strategies
- Cache project dashboards and reports
- Implement query result caching for frequently accessed data
- Use Redis for session management and caching
- Cache reference data like project templates and activity types

## 11. Security Considerations

### 11.1 Access Control
- Role-based access to projects and tasks
- Field-level permissions for sensitive data
- Project-specific user permissions
- IP restrictions for API access
- Audit trails for all changes

### 11.2 Data Privacy
- Mask sensitive project information
- Control export permissions
- Secure API authentication
- Data encryption at rest and in transit
- Regular security audits

## 12. Troubleshooting

### 12.1 Common Issues
- **Budget Overruns**: Implement alerts and approval workflows
- **Resource Overallocation**: Use resource utilization reports
- **Timeline Slippage**: Critical path analysis
- **Incomplete Timesheets**: Automated reminders
- **Integration Failures**: Error logging and alerts

## 13. Future Enhancements

### 13.1 Planned Features
- AI-based project risk prediction
- Automated resource leveling
- Advanced analytics with machine learning
- Mobile app for field teams
- Integration with IoT devices

## 14. Example Queries

### 6.1 Get Active Projects with Progress

```sql
SELECT 
    p.name,
    p.project_name,
    p.status,
    p.percent_complete,
    p.expected_start_date,
    p.expected_end_date,
    DATEDIFF(p.expected_end_date, CURDATE()) as days_remaining,
    COUNT(DISTINCT t.name) as total_tasks,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
FROM 
    `tabProject` p
LEFT JOIN 
    `tabTask` t ON p.name = t.project
WHERE 
    p.status = 'Open'
    AND p.is_active = 'Yes'
GROUP BY 
    p.name, p.project_name, p.status, p.percent_complete, 
    p.expected_start_date, p.expected_end_date
ORDER BY 
    p.expected_end_date ASC;
```

### 6.2 Get Project Tasks with Dependencies

```sql
SELECT 
    t1.name as task_id,
    t1.subject as task_name,
    t1.status,
    t1.exp_start_date,
    t1.exp_end_date,
    t1.progress,
    GROUP_CONCAT(td.parent SEPARATOR ', ') as depends_on_tasks
FROM 
    `tabTask` t1
LEFT JOIN 
    `tabTask Depends On` td ON t1.name = td.parent
WHERE 
    t1.project = 'PROJ-0001'
GROUP BY 
    t1.name, t1.subject, t1.status, 
    t1.exp_start_date, t1.exp_end_date, t1.progress
ORDER BY 
    t1.exp_start_date, t1.exp_end_date;
```

### 6.3 Get Timesheet Summary by Employee

```sql
SELECT 
    t.employee,
    e.employee_name,
    e.department,
    SUM(td.hours) as total_hours,
    SUM(IF(td.is_billable = 1, td.hours, 0)) as billable_hours,
    SUM(td.costing_amount) as total_cost,
    SUM(td.billing_amount) as total_billing
FROM 
    `tabTimesheet` t
JOIN 
    `tabTimesheet Detail` td ON t.name = td.parent
JOIN
    `tabEmployee` e ON t.employee = e.name
WHERE 
    t.docstatus = 1
    AND t.start_date BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY 
    t.employee, e.employee_name, e.department
ORDER BY 
    e.department, e.employee_name;
```

### 6.4 Get Project Financial Summary

```sql
SELECT 
    p.name as project_id,
    p.project_name,
    p.customer,
    p.total_costing_amount as total_cost,
    p.total_billing_amount as total_billing,
    p.total_sales_amount as total_sales,
    (p.total_billed_amount / NULLIF(p.total_billing_amount, 0) * 100) as percent_billed,
    p.expected_end_date,
    DATEDIFF(p.expected_end_date, CURDATE()) as days_remaining
FROM 
    `tabProject` p
WHERE 
    p.status = 'Open'
    AND p.is_active = 'Yes'
ORDER BY 
    p.expected_end_date;
```

### 6.5 Get Resource Utilization by Department

```sql
SELECT 
    e.department,
    COUNT(DISTINCT t.employee) as employee_count,
    SUM(td.hours) as total_hours,
    SUM(IF(td.is_billable = 1, 1, 0)) as billable_hours,
    (SUM(IF(td.is_billable = 1, 1, 0)) / COUNT(*)) * 100 as billable_percentage
FROM 
    `tabTimesheet` t
JOIN 
    `tabTimesheet Detail` td ON t.name = td.parent
JOIN
    `tabEmployee` e ON t.employee = e.name
WHERE 
    t.docstatus = 1
    AND t.start_date BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY 
    e.department
ORDER BY 
    total_hours DESC;
```

### 6.6 Get Project Timeline with Critical Path

```sql
WITH RECURSIVE task_path AS (
    -- Base case: tasks with no dependencies
    SELECT 
        t.name,
        t.subject,
        t.exp_start_date,
        t.exp_end_date,
        t.status,
        t.project,
        t.parent_task,
        1 as level,
        CONCAT(t.name) as path
    FROM 
        `tabTask` t
    LEFT JOIN 
        `tabTask Depends On` d ON t.name = d.parent
    WHERE 
        t.project = 'PROJ-0001'
        AND d.parent IS NULL
    
    UNION ALL
    
    -- Recursive case: tasks with dependencies
    SELECT 
        t.name,
        t.subject,
        t.exp_start_date,
        t.exp_end_date,
        t.status,
        t.project,
        t.parent_task,
        p.level + 1,
        CONCAT(p.path, ' -> ', t.name)
    FROM 
        `tabTask` t
    JOIN 
        `tabTask Depends On` d ON t.name = d.parent
    JOIN 
        task_path p ON d.task = p.name
)
SELECT 
    name,
    subject,
    exp_start_date,
    exp_end_date,
    status,
    level,
    path
FROM 
    task_path
ORDER BY 
    level, exp_start_date, exp_end_date;
```

## 7. Conclusion

This documentation provides a comprehensive overview of the WalaTech Project Management module's database schema. The schema is designed to support end-to-end project management, from planning and task assignment to time tracking and financial reporting.

### Key Takeaways

- **Project and Task Management**: Core tables for managing projects and their associated tasks
- **Time Tracking**: Comprehensive timesheet functionality with billing and costing
- **Templates**: Support for project templates to standardize project setup
- **Financial Tracking**: Built-in cost and billing calculations
- **Resource Management**: Tools for tracking employee time and utilization

### Next Steps

1. **Database Optimization**: Consider adding appropriate indexes on frequently queried fields
2. **Data Validation**: Implement additional constraints to ensure data quality
3. **Reporting**: Create views for common project KPIs and dashboards
4. **Integration**: Plan how this schema integrates with other modules like Accounting, HR, and CRM

For more detailed information, refer to the [WalaTech Project Management Documentation](https://docs.WalaTech.com/docs/v13/user/manual/en/projects).
