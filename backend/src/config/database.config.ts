import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { Customer } from '../entities/customer.entity';
import { ProductionPlan } from '../modules/production/entities/production-plan.entity';
import { ProductionPlanItem } from '../modules/production/entities/production-plan-item.entity';
import { WorkOrder as ModuleWorkOrder } from '../modules/production/entities/work-order.entity';
import { WorkOrderTask as ModuleWorkOrderTask } from '../modules/production/entities/work-order-task.entity';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderTask } from '../entities/work-order-task.entity';
import { Item } from '../entities/item.entity';
import { ProductionOrder } from '../entities/production-order.entity';
import { Warehouse } from '../modules/inventory/entities/warehouse.entity';
import { Bin } from '../modules/inventory/entities/bin.entity';
import { Batch } from '../modules/inventory/entities/batch.entity';
import { SerialNo } from '../modules/inventory/entities/serial-no.entity';
import { StockEntry } from '../modules/inventory/entities/stock-entry.entity';
import { StockEntryDetail } from '../modules/inventory/entities/stock-entry-detail.entity';
import { StockLedgerEntry } from '../modules/inventory/entities/stock-ledger-entry.entity';
import { Account } from '../modules/accounting/entities/account.entity';
import { JournalEntry } from '../modules/accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../modules/accounting/entities/journal-entry-line.entity';
import { Employee } from '../modules/hr/entities/employee.entity';
import { Department } from '../modules/hr/entities/department.entity';
import { Designation } from '../modules/hr/entities/designation.entity';
import { Attendance } from '../modules/hr/entities/attendance.entity';
import { LeaveApplication } from '../modules/hr/entities/leave-application.entity';
import { LeaveType } from '../modules/hr/entities/leave-type.entity';
import { ShiftType } from '../modules/hr/entities/shift-type.entity';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: parseInt(this.configService.get('DB_PORT', '3306')),
      username: this.configService.get('DB_USERNAME', 'root'),
      password: this.configService.get('DB_PASSWORD', ''),
      database: this.configService.get('DB_DATABASE', 'wala_pms'),
      entities: [
        User,
        Tenant,
        Customer,
        ProductionPlan,
        ProductionPlanItem,
        ModuleWorkOrder,
        ModuleWorkOrderTask,
        WorkOrder,
        WorkOrderTask,
        Item,
        ProductionOrder,
        Warehouse,
        Bin,
        Batch,
        SerialNo,
        StockEntry,
        StockEntryDetail,
        StockLedgerEntry,
        Account,
        JournalEntry,
        JournalEntryLine,
        Employee,
        Department,
        Designation,
        Attendance,
        LeaveApplication,
        LeaveType,
        ShiftType,
      ],
      synchronize: false,
      migrationsRun: this.configService.get('NODE_ENV') === 'production',
      migrations: ['dist/migrations/*.js'],
      logging: this.configService.get('NODE_ENV') === 'development',
      timezone: '+03:00', // Ethiopian timezone
      extra: {
        ...(this.configService.get('DB_AUTH_PLUGIN')
          ? { authPlugin: String(this.configService.get('DB_AUTH_PLUGIN')) }
          : {}),
      },
    };
  }
}
