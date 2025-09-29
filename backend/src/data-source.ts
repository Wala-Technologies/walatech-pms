import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { ProductionPlan } from './modules/production/entities/production-plan.entity';
import { ProductionPlanItem } from './modules/production/entities/production-plan-item.entity';
import { WorkOrder } from './modules/production/entities/work-order.entity';
import { WorkOrderTask } from './modules/production/entities/work-order-task.entity';
import { Item } from './entities/item.entity';
import { Account } from './modules/accounting/entities/account.entity';
import { JournalEntry } from './modules/accounting/entities/journal-entry.entity';
import { JournalEntryLine } from './modules/accounting/entities/journal-entry-line.entity';
import { GLEntry } from './modules/accounting/entities/gl-entry.entity';
import { CostCenter } from './modules/accounting/entities/cost-center.entity';
import { FiscalYear } from './modules/accounting/entities/fiscal-year.entity';
import { PaymentEntry } from './modules/accounting/entities/payment-entry.entity';
import { Employee } from './modules/hr/entities/employee.entity';
import { Department } from './modules/hr/entities/department.entity';
import { Designation } from './modules/hr/entities/designation.entity';
import { Attendance } from './modules/hr/entities/attendance.entity';
import { LeaveApplication } from './modules/hr/entities/leave-application.entity';
import { LeaveType } from './modules/hr/entities/leave-type.entity';
import { ShiftType } from './modules/hr/entities/shift-type.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderItem } from './entities/sales-order-item.entity';
import { Customer } from './entities/customer.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wala_pms',
  synchronize: false,
  logging: true,
  entities: [
    User,
    Tenant,
    ProductionPlan,
    ProductionPlanItem,
    WorkOrder,
    WorkOrderTask,
    Item,
    Account,
    JournalEntry,
    JournalEntryLine,
    GLEntry,
    CostCenter,
    FiscalYear,
    PaymentEntry,
    Employee,
    Department,
    Designation,
    Attendance,
    LeaveApplication,
    LeaveType,
    ShiftType,
    SalesOrder,
    SalesOrderItem,
    Customer,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  timezone: '+00:00',
});
