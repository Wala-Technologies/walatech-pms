import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// Test Database Configuration
export const getTestDatabaseConfig = () => ({
  type: 'mysql' as const,
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  username: process.env.TEST_DB_USERNAME || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test',
  database: process.env.TEST_DB_DATABASE || 'walatech_pms_test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

// Mock Repository Factory
export const createMockRepository = <
  T extends Record<string, any> = any,
>(): Partial<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(
    () =>
      ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        getManyAndCount: jest.fn(),
        getCount: jest.fn(),
      }) as any,
  ),
});

// Test Data Factories
export class TestDataFactory {
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 12),
      first_name: 'Test',
      last_name: 'User',
      language: 'en',
      time_zone: 'Africa/Addis_Ababa',
      enabled: true,
      mobile_no: '+1234567890',
      role_profile_name: 'Test Role',
      creation: new Date(),
      modified: new Date(),
      modified_by: 'test-user',
      owner: 'test-owner',
      ...overrides,
    };
  }

  static createTenant(overrides: Partial<any> = {}) {
    return {
      id: 'test-tenant-id',
      name: 'Test Company',
      domain: 'test-company',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createProductionPlan(overrides: Partial<any> = {}) {
    return {
      id: 'test-plan-id',
      planNumber: 'PP-2024-001',
      title: 'Test Production Plan',
      description: 'Test description',
      status: 'Draft',
      planDate: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalPlannedQty: 100,
      totalProducedQty: 0,
      estimatedCost: 1000,
      actualCost: 0,
      tenant_id: 'test-tenant-id',
      createdById: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createWorkOrder(overrides: Partial<any> = {}) {
    return {
      id: 'test-work-order-id',
      workOrderNumber: 'WO-2024-001',
      title: 'Test Work Order',
      description: 'Test work order description',
      type: 'Production',
      status: 'Draft',
      quantity: 50,
      producedQty: 0,
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      estimatedCost: 500,
      actualCost: 0,
      tenant_id: 'test-tenant-id',
      createdById: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createWorkOrderTask(overrides: Partial<any> = {}) {
    return {
      id: 'test-task-id',
      taskName: 'Test Task',
      description: 'Test task description',
      status: 'Pending',
      priority: 'Medium',
      sequenceOrder: 1,
      estimatedHours: 8,
      actualHours: 0,
      estimatedCost: 200,
      actualCost: 0,
      workOrderId: 'test-work-order-id',
      tenant_id: 'test-tenant-id',
      createdById: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}

// Test Module Builder
export class TestModuleBuilder {
  static async createTestingModule(options: {
    providers?: any[];
    imports?: any[];
    controllers?: any[];
    entities?: any[];
  }): Promise<TestingModule> {
    const {
      providers = [],
      imports = [],
      controllers = [],
      entities = [],
    } = options;

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET', 'test-secret'),
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
        ...imports,
      ],
      controllers,
      providers: [
        ...providers,
        ...entities.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: createMockRepository(),
        })),
      ],
    });

    return moduleBuilder.compile();
  }
}

// Database Test Helper
export class DatabaseTestHelper {
  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  static async seedTestData(dataSource: DataSource): Promise<void> {
    // Add common test data seeding logic here
  }
}
