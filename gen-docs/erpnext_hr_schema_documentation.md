# WalaTech HR Module - Database Schema Documentation

## Table of Contents
- [1. Overview](#1-overview)
- [2. Core Tables](#2-core-tables)
  - [2.1 Employee](#21-employee)
  - [2.2 Employee Group](#22-employee-group)
  - [2.3 Department](#23-department)
  - [2.4 Designation](#24-designation)
  - [2.5 Leave Application](#25-leave-application)
  - [2.6 Attendance](#26-attendance)
  - [2.7 Payroll](#27-payroll)
- [3. Key Workflows](#3-key-workflows)
- [4. Example Queries](#4-example-queries)
- [5. Integration Points](#5-integration-points)
- [6. Performance Considerations](#6-performance-considerations)
- [7. Common Issues and Solutions](#7-common-issues-and-solutions)
- [8. Best Practices](#8-best-practices)

## 1. Overview
This document provides a detailed guide to the WalaTech Human Resources (HR) module's database schema, focusing on tables, relationships, and foreign key constraints. This documentation is essential for developers working on reimplementing or integrating with the WalaTech HR system.

## 2. Core Tables

### 2.1 Employee
**Table Name:** `tabEmployee`

**Description:** Primary table for storing employee information.

#### 2.1.1 Key Fields
- `name` (PK): Employee ID
- `employee_name`: Full name of the employee
- `company`: Reference to `tabCompany`
- `department`: Reference to `tabDepartment`
- `designation`: Reference to `tabDesignation`
- `user_id`: Reference to `tabUser` for system access
- `prefered_email`: Primary email address
- `status`: Employment status (Active, Inactive, etc.)
- `date_of_joining`: Employment start date
- `date_of_retirement`: Employment end date (if applicable)
- `gender`: Employee gender
- `date_of_birth`: Employee DOB
- `cell_number`: Contact number
- `emergency_phone_number`: Emergency contact
- `ctc`: Cost to Company
- `salary_currency`: Currency for salary
- `bank_name`: Bank name for salary
- `bank_ac_no`: Bank account number
- `passport_number`: Passport details
- `health_details`: Medical information

**Foreign Key Constraints:**
- `fk_employee_company` (company → tabCompany)
- `fk_employee_department` (department → tabDepartment)
- `fk_employee_designation` (designation → tabDesignation)
- `fk_employee_user_id` (user_id → tabUser)
- `fk_employee_preferred_email` (prefered_email → tabUser)

### 2.2 Employee Group

**Table Name:** `tabEmployee Group`

**Description:** Defines groups for categorizing employees.

#### 2.2.1 Key Fields
- `name` (PK): Group ID
- `employee_group_name`: Display name of the group
- `_user_tags`: Tags for filtering
- `_comments`: Additional comments

### 2.3 Department

**Table Name:** `tabDepartment`

**Description:** Stores department information.

#### 2.3.1 Key Fields
- `name` (PK): Department ID
- `department_name`: Display name
- `company`: Reference to `tabCompany`
- `parent_department`: Reference to parent department
- `department_head`: Reference to `tabEmployee`
- `disabled`: Whether the department is active

### 2.4 Designation

**Table Name:** `tabDesignation`

**Description:** Job titles/positions in the organization.

#### 2.4.1 Key Fields
- `name` (PK): Designation ID
- `designation_name`: Display name
- `description`: Role description
- `skill_requirements`: Required skills
- `job_description`: Detailed job description

### 2.5 Leave Application

**Table Name:** `tabLeave Application`

**Description:** Manages employee leave requests and approvals.

#### 2.5.1 Key Fields
- `employee`: Reference to `tabEmployee`
- `employee_name`: Cached employee name
- `leave_type`: Reference to `tabLeave Type`
- `from_date`: Leave start date
- `to_date`: Leave end date
- `half_day`: 0/1 for half day
- `half_day_date`: If half day, which date
- `total_leave_days`: Total days of leave
- `description`: Reason for leave
- `leave_approver`: Reference to approving manager
- `status`: Draft/Approved/Rejected
- `posting_date`: Application date
- `company`: Company
- `department`: Department
- `leave_balance`: Available leave balance
- `leave_approver_name`: Cached approver name

### 2.6 Attendance

**Table Name:** `tabAttendance`

**Description:** Tracks daily attendance records for employees.

#### 2.6.1 Key Fields
- `employee`: Reference to `tabEmployee`
- `attendance_date`: Date of attendance
- `status`: Present/Absent/On Leave/Half Day
- `shift`: Reference to `tabShift Type`
- `in_time`: Check-in time
- `out_time`: Check-out time
- `working_hours`: Total working hours
- `late_entry`: Minutes late
- `early_exit`: Minutes early
- `leave_application`: Reference to leave application if on leave
- `shift_type`: Type of shift (General, Night, etc.)
- `company`: Company
- `department`: Department
- `attendance_request`: Reference to attendance request

### 2.7 Payroll

**Table Name:** `tabPayroll`

**Description:** Manages employee payroll processing.

#### 2.7.1 Key Fields
- `employee`: Reference to `tabEmployee`
- `payroll_date`: Payroll processing date
- `salary_structure`: Reference to `tabSalary Structure`
- `gross_pay`: Gross salary
- `net_pay`: Net salary
- `deductions`: Total deductions
- `tax_deductions`: Total tax deductions
- `company`: Company
- `department`: Department

## 3. Key Workflows

### 3.1 Employee Onboarding
1. Create Employee record
2. Assign to Department and Designation
3. Set up user account and permissions
4. Assign equipment and resources
5. Schedule orientation and training

### 3.2 Leave Management
1. Employee submits leave application
2. Manager reviews and approves/rejects
3. System updates leave balance
4. Notify relevant parties
5. Update attendance records

## 4. Example Queries

### 4.1 Get Active Employees by Department

```sql
SELECT 
    e.name as employee_id,
    e.employee_name,
    e.department,
    e.designation,
    e.date_of_joining
FROM `tabEmployee` e
WHERE e.status = 'Active'
ORDER BY e.department, e.employee_name;
```


### 4.2 Get Leave Balance

```sql
SELECT 
    e.employee,
    e.employee_name,
    l.leave_type,
    l.total_leaves_allocated,
    l.used_leaves,
    (l.total_leaves_allocated - l.used_leaves) as remaining_leaves
FROM `tabEmployee` e
JOIN `tabLeave Ledger Entry` l ON e.name = l.employee
WHERE e.status = 'Active'
AND l.docstatus = 1
AND l.fiscal_year = '2023-2024';
```

## 5. Integration Points

### 5.1 Payroll Integration
- Employee master data sync
- Attendance and leave processing
- Salary structure and components
- Tax calculations
- Payment processing

### 5.2 Time & Attendance Integration
- Biometric device integration
- Shift scheduling and management
- Overtime calculation
- Leave balance updates
- Attendance regularization workflows

## 6. Performance Considerations

### 6.1 Indexing Recommendations
- Add indexes on frequently queried fields:
  - Employee: status, department, designation
  - Leave Application: employee, from_date, to_date
  - Attendance: employee, attendance_date

### 6.2 Caching Strategy
- Cache employee master data
- Cache organization hierarchy
- Cache leave balances

## 7. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Duplicate employee records | Implement validation for employee IDs and email addresses |
| Incorrect leave balance | Audit leave ledger entries and recalculate balances |
| Performance issues with large organizations | Implement pagination and optimize queries |
| Data inconsistency | Implement database constraints and validation rules |

## 8. Best Practices

### 1. Data Integrity
- Always use the employee ID as the primary reference
- Maintain referential integrity with proper foreign key constraints
- Use transactions for multi-table updates

### 2. Performance
- Index frequently queried columns (status, department, designation)
- Consider denormalizing frequently accessed data for reporting
- Archive historical data that's no longer actively needed

### 3. Security
- Implement proper access controls for sensitive employee data
- Encrypt sensitive personal information
- Maintain audit logs for all changes to employee records

## 4. Time and Attendance

### 4.1 Employee Attendance

**Table Name:** `tabAttendance`

**Purpose:** Tracks daily attendance records for employees.

**Key Fields:**
- `employee`: Reference to `tabEmployee`
- `attendance_date`: Date of attendance
- `status`: Present/Absent/On Leave/Half Day
- `shift`: Reference to `tabShift Type`
- `in_time`: Check-in time
- `out_time`: Check-out time
- `working_hours`: Total working hours
- `late_entry`: Minutes late
- `early_exit`: Minutes early
- `leave_application`: Reference to leave application if on leave
- `shift_type`: Type of shift (General, Night, etc.)
- `company`: Company
- `department`: Department
- `attendance_request`: Reference to attendance request

### 4.2 Leave Application

**Table Name:** `tabLeave Application`

**Purpose:** Manages employee leave requests and approvals.

**Key Fields:**
- `employee`: Reference to `tabEmployee`
- `employee_name`: Cached employee name
- `leave_type`: Reference to `tabLeave Type`
- `from_date`: Leave start date
- `to_date`: Leave end date
- `half_day`: 0/1 for half day
- `half_day_date`: If half day, which date
- `total_leave_days`: Total days of leave
- `description`: Reason for leave
- `leave_approver`: Reference to approving manager
- `status`: Draft/Approved/Rejected
- `posting_date`: Application date
- `company`: Company
- `department`: Department
- `leave_balance`: Available leave balance
- `leave_approver_name`: Cached approver name

### 4.3 Leave Allocation

**Table Name:** `tabLeave Allocation`

**Purpose:** Tracks allocated leave balances for employees.

**Key Fields:**
- `employee`: Reference to `tabEmployee`
- `employee_name`: Cached employee name
- `leave_type`: Reference to `tabLeave Type`
- `from_date`: Allocation start date
- `to_date`: Allocation end date
- `new_leaves_allocated`: Number of leaves allocated
- `total_leaves_allocated`: Total leaves after this allocation
- `unused_leaves`: Unused leaves from previous period
- `carry_forward`: 1 if leaves can be carried forward
- `carry_forwarded_leaves`: Number of carried forward leaves
- `leaves_taken`: Leaves taken in current period
- `expired_leaves`: Expired leaves
- `company`: Company
- `department`: Department

### 4.4 Shift Type

**Table Name:** `tabShift Type`

**Purpose:** Defines different work shifts.

**Key Fields:**
- `name`: Shift name (e.g., "Morning Shift")
- `start_time`: Shift start time
- `end_time`: Shift end time
- `total_hours`: Total working hours
- `enable_late_entry_marking`: 1 if late entry tracking is enabled
- `late_entry_grace_period`: Grace period in minutes
- `enable_early_exit_marking`: 1 if early exit tracking is enabled
- `early_exit_grace_period`: Grace period in minutes
- `include_holidays_in_total_working_hours`: 1 if holidays are included
- `enable_auto_attendance`: 1 if automatic attendance is enabled
- `last_sync_of_checkin`: Last sync timestamp

### 4.5 Employee Checkin

**Table Name:** `tabEmployee Checkin`

**Purpose:** Tracks employee check-in/check-out times.

**Key Fields:**
- `employee`: Reference to `tabEmployee`
- `employee_name`: Cached employee name
- `log_type`: IN/OUT
- `time`: Timestamp of check-in/out
- `device_id`: Device ID used for check-in
- `skip_auto_attendance`: 1 if should skip auto attendance
- `attendance`: Reference to `tabAttendance`
- `shift`: Reference to `tabShift Type`
- `shift_start`: Shift start time
- `shift_end`: Shift end time
- `shift_actual_start`: Actual shift start time
- `shift_actual_end`: Actual shift end time

## 5. Payroll and Benefits

### 5.1 Salary Structure

**Table Name:** `tabSalary Structure`

**Purpose:** Defines salary structures for employees.

**Key Fields:**
- `name`: Structure name
- `company`: Company
- `is_active`: 1 if active
- `from_date`: Effective from date
- `payroll_frequency`: Monthly/Weekly/Fortnightly
- `payment_account`: Default payment account
- `salary_slip_based_on_timesheet`: 1 if based on timesheets
- `salary_component`: Default salary component
- `leave_encashment_amount_per_day`: Encashment rate
- `max_benefits`: Maximum benefits amount
- `deduct_tax_for_unclaimed_employee_benefits`: 1 if tax deductible
- `deduct_tax_for_unsubmitted_tax_exemption_proof`: 1 if tax deductible
- `is_flexible_benefit`: 1 if flexible benefits apply
- `mode_of_payment`: Payment method
- `letter_head`: Company letterhead

## 6. Performance Management

### 6.1 Appraisal

**Table Name:** `tabAppraisal`

**Purpose:** Manages employee performance appraisals.

**Key Fields:**
- `employee`: Reference to `tabEmployee`
- `employee_name`: Cached employee name
- `appraisal_cycle`: Reference to `tabAppraisal Cycle`
- `kra_evaluation_method`: Method for KRA evaluation
- `appraisal_template`: Reference to `tabAppraisal Template`
- `company`: Company
- `department`: Department
- `appraisal_round`: Appraisal round name
- `appraisal_round_to`: Next appraisal round
- `appraisal_round_to_name`: Next round name
- `total_score`: Total score
- `avg_feedback_score`: Average feedback score
- `appraisal_rating`: Overall rating
- `feedback_rating`: Feedback rating
- `status`: Draft/Submitted/Completed
- `appraisal_meeting_pending`: 1 if meeting pending
- `appraisal_meeting_done`: 1 if meeting completed

## 7. Training and Development

### 7.1 Training Event

**Table Name:** `tabTraining Event`

**Purpose:** Manages employee training events.

**Key Fields:**
- `event_name`: Name of the training event
- `training_program`: Reference to `tabTraining Program`
- `course`: Reference to `tabCourse`
- `has_certificate`: 1 if certificate is provided
- `level`: Training level
- `company`: Company
- `trainer_name`: Trainer's name
- `trainer_email`: Trainer's email
- `contact_number`: Contact number
- `introduction`: Event description
- `status`: Scheduled/Completed/Cancelled
- `from_time`: Start time
- `to_time`: End time
- `duration`: Duration in hours
- `location`: Training location
- `introduction`: Event description

## 8. Example Queries

### 8.1 Attendance and Leave Queries

**Get Daily Attendance Summary**
```sql
SELECT 
    attendance_date,
    COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
    COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN status = 'On Leave' THEN 1 END) as on_leave_count,
    COUNT(CASE WHEN status = 'Half Day' THEN 1 END) as half_day_count
FROM 
    `tabAttendance`
WHERE 
    attendance_date BETWEEN '2023-01-01' AND '2023-01-31'
    AND company = 'Your Company'
GROUP BY 
    attendance_date
ORDER BY 
    attendance_date;
```

**Get Employee Leave Balance**
```sql
SELECT 
    e.employee_name,
    e.department,
    la.leave_type,
    la.total_leaves_allocated as total_days,
    la.leaves_taken,
    (la.total_leaves_allocated - la.leaves_taken) as remaining_days
FROM 
    `tabLeave Allocation` la
JOIN 
    `tabEmployee` e ON la.employee = e.name
WHERE 
    la.docstatus = 1 
    AND la.from_date <= CURDATE() 
    AND (la.to_date IS NULL OR la.to_date >= CURDATE())
    AND e.status = 'Active';
```

### 8.2 Payroll and Benefits Queries

**Get Employee Salary Details**
```sql
SELECT 
    e.employee_name,
    e.department,
    e.designation,
    ss.name as salary_structure,
    ss.payroll_frequency,
    ss.salary_component,
    ss.payment_account,
    ss.mode_of_payment
FROM 
    `tabEmployee` e
LEFT JOIN 
    `tabSalary Structure Assignment` ssa ON e.name = ssa.employee
LEFT JOIN 
    `tabSalary Structure` ss ON ssa.salary_structure = ss.name
WHERE 
    e.status = 'Active'
    AND ss.docstatus = 1
    AND (ssa.from_date IS NULL OR ssa.from_date <= CURDATE())
    AND (ssa.to_date IS NULL OR ssa.to_date >= CURDATE());
```

### 8.3 Performance Management Queries

**Get Employee Appraisal Status**
```sql
SELECT 
    e.employee_name,
    e.department,
    a.name as appraisal_id,
    a.appraisal_cycle,
    a.status,
    a.appraisal_rating,
    a.feedback_rating
FROM 
    `tabAppraisal` a
JOIN 
    `tabEmployee` e ON a.employee = e.name
WHERE 
    a.docstatus = 1
    AND e.status = 'Active'
ORDER BY 
    e.department, e.employee_name;
```

### 8.4 Training and Development Queries

**Get Upcoming Training Events**
```sql
SELECT 
    te.name as event_id,
    te.event_name,
    te.training_program,
    te.course,
    te.trainer_name,
    te.from_time,
    te.to_time,
    te.location,
    te.status,
    COUNT(tea.name) as participants_count
FROM 
    `tabTraining Event` te
LEFT JOIN 
    `tabTraining Event Employee` tea ON te.name = tea.parent
WHERE 
    te.docstatus = 1
    AND te.status = 'Scheduled'
    AND te.from_time >= CURDATE()
GROUP BY 
    te.name, te.event_name, te.training_program, te.course, 
    te.trainer_name, te.from_time, te.to_time, te.location, te.status
ORDER BY 
    te.from_time;
```

## 9. Troubleshooting

### Common Issues
1. **Missing User Links**
   - Verify that `user_id` in `tabEmployee` matches a valid user in `tabUser`
   - Check that the email in the employee record matches the user's email

2. **Inactive Employees**
   - Update the `status` field when employees leave the organization
   - Consider archiving records of former employees

3. **Data Inconsistencies**
   - Run periodic data validation scripts
   - Check for orphaned records in related tables
   - Verify that all required fields are populated

4. **Performance Bottlenecks**
   - Monitor query performance on large employee datasets
   - Consider adding indexes for commonly filtered columns
   - Archive or partition historical data as needed
