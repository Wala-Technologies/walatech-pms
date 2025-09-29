import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority } from '../entities/production-order.entity';
import { WorkOrder, WorkOrderStatus, WorkOrderType } from '../entities/work-order.entity';
import { WorkOrderTask, TaskStatus, TaskPriority } from '../entities/work-order-task.entity';
import { Item } from '../entities/item.entity';
import { Tenant, TenantStatus, TenantPlan } from '../entities/tenant.entity';
import { UserRole } from '../common/enums/user-roles.enum';

// Test database configuration
export const getTestDatabaseConfig = () => ({
  type: 'sqlite' as const,
  database: ':memory:',
  entities: [User, ProductionOrder, WorkOrder, WorkOrderTask, Item, Tenant],
  synchronize: true,
  logging: false,
});

// Create test module with database
export const createTestModule = async (providers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(getTestDatabaseConfig()),
      TypeOrmModule.forFeature([User, ProductionOrder, WorkOrder, WorkOrderTask, Item, Tenant]),
    ],
    providers,
  }).compile();

  return module;
};

// Clean up database after tests
export const cleanupDatabase = async (dataSource: DataSource) => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
};

// Mock user factory
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    password: 'hashedPassword',
    enabled: true,
    language: 'en',
    time_zone: 'Africa/Addis_Ababa',
    mobile_no: '',
    role_profile_name: '',
    role: UserRole.REGULAR_USER,
    creation: new Date(),
    modified: new Date(),
    modified_by: '',
    owner: '',
    tenant_id: 'tenant-uuid',
    department_id: null,
    tenant: null as any,
    department: null as any,
    ...overrides,
  };
}

// Mock tenant factory
export const createMockTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
  id: 'tenant-uuid',
  name: 'Test Tenant',
  subdomain: 'test-tenant',
  status: TenantStatus.ACTIVE,
  plan: TenantPlan.BASIC,
  settings: '',
  docstatus: 1,
  idx: '',
  owner: '',
  modifiedBy: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  users: [],
  ...overrides,
});

// Mock production order factory
export const createMockProductionOrder = (overrides: Partial<ProductionOrder> = {}): ProductionOrder => ({
  id: 'prod-order-uuid',
  orderNumber: 'PO-001',
  productName: 'Test Product',
  productCode: 'TP-001',
  quantityPlanned: 100,
  quantityProduced: 0,
  unit: 'pcs',
  status: ProductionOrderStatus.DRAFT,
  priority: ProductionOrderPriority.MEDIUM,
  plannedStartDate: new Date(),
  plannedEndDate: new Date(),
  actualStartDate: undefined as any,
  actualEndDate: undefined as any,
  description: 'Test production order',
  notes: '',
  estimatedCost: 0,
  actualCost: 0,
  createdBy: createMockUser(),
  assignedTo: createMockUser(),
  workOrders: [],
  tenant: createMockTenant(),
  tenant_id: 'tenant-uuid',
  department_id: null,
  department: null as any,
  docstatus: 0,
  idx: '',
  owner: '',
  modified_by: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock work order factory
export const createMockWorkOrder = (overrides: Partial<WorkOrder> = {}): WorkOrder => ({
  id: 'work-order-uuid',
  workOrderNumber: 'WO-001',
  title: 'Test Work Order',
  description: 'Test work order description',
  type: WorkOrderType.MANUFACTURING,
  status: WorkOrderStatus.PENDING,
  quantityRequired: 100,
  quantityCompleted: 0,
  unit: 'pcs',
  scheduledStartTime: new Date(),
  scheduledEndTime: new Date(),
  actualStartTime: undefined as any,
  actualEndTime: undefined as any,
  estimatedHours: 8,
  actualHours: 0,
  workstation: '',
  department: '',
  instructions: '',
  notes: '',
  progressPercentage: 0,
  productionOrder: null as any, // Avoid circular dependency
  createdBy: createMockUser(),
  assignedTo: createMockUser(),
  tasks: [],
  tenant: createMockTenant(),
  tenant_id: 'tenant-uuid',
  department_id: null,
  departmentEntity: null as any,
  docstatus: 0,
  idx: '',
  owner: '',
  modified_by: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock work order task factory
export const createMockWorkOrderTask = (overrides: Partial<WorkOrderTask> = {}): WorkOrderTask => ({
  id: 'task-uuid',
  taskName: 'Test Task',
  description: 'Test task description',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  sequenceOrder: 1,
  estimatedHours: 8,
  actualHours: 0,
  scheduledStartTime: undefined as any,
  scheduledEndTime: undefined as any,
  actualStartTime: undefined as any,
  actualEndTime: undefined as any,
  progressPercentage: 0,
  instructions: '',
  notes: '',
  completionNotes: '',
  requiredSkills: '',
  toolsRequired: '',
  materialsRequired: '',
  estimatedCost: 0,
  actualCost: 0,
  workOrder: null as any, // Avoid circular dependency
  createdBy: createMockUser(),
  assignedTo: createMockUser(),
  tenant: createMockTenant(),
  docstatus: 0,
  idx: '',
  owner: '',
  modified_by: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock repository factory
export const createMockRepository = <T extends Record<string, any> = any>(): Partial<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  } as any)),
});