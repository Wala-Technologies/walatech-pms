import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { ProductionPlan } from './modules/production/entities/production-plan.entity';
import { ProductionPlanItem } from './modules/production/entities/production-plan-item.entity';
import { WorkOrder } from './modules/production/entities/work-order.entity';
import { WorkOrderTask } from './modules/production/entities/work-order-task.entity';
import { Item } from './entities/item.entity';

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
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  timezone: '+00:00',
});
