import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
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
        StockLedgerEntry
      ],
      synchronize: false,
      migrationsRun: this.configService.get('NODE_ENV') === 'production',
      migrations: ['dist/migrations/*.js'],
      logging: this.configService.get('NODE_ENV') === 'development',
      timezone: '+03:00', // Ethiopian timezone
      extra: {
        authPlugin: 'mysql_native_password',
      },
    };
  }
}