import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { ProductionOrder } from '../entities/production-order.entity';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderTask } from '../entities/work-order-task.entity';

// Migration configuration for TypeORM CLI
export const migrationConfig = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'wala_pms',
  entities: [User, ProductionOrder, WorkOrder, WorkOrderTask],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  timezone: '+03:00',
  extra: {
    authPlugin: 'mysql_native_password',
  },
});

// Updated database config for production use
export const getProductionDatabaseConfig = (configService: ConfigService) => ({
  type: 'mysql' as const,
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 3306),
  username: configService.get('DB_USERNAME', 'root'),
  password: configService.get('DB_PASSWORD', ''),
  database: configService.get('DB_DATABASE', 'wala_pms'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: configService.get('NODE_ENV') === 'production',
  synchronize: configService.get('NODE_ENV') === 'development', // Only for development
  logging: configService.get('NODE_ENV') === 'development',
  timezone: '+03:00',
  extra: {
    authPlugin: 'mysql_native_password',
  },
});
