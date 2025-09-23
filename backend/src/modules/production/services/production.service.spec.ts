import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductionService } from './production.service';
import { ProductionPlan, ProductionPlanStatus } from '../entities/production-plan.entity';
import { WorkOrder, WorkOrderStatus } from '../entities/work-order.entity';
import { WorkOrderTask, TaskStatus } from '../entities/work-order-task.entity';
import { User } from '../../../entities/user.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Item } from '../../../entities/item.entity';
import { CreateProductionPlanDto } from '../dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from '../../dto/update-production-plan.dto';
import { CreateWorkOrderDto } from '../../dto/create-work-order.dto';
import { UpdateWorkOrderDto } from '../../dto/update-work-order.dto';
import { ProductionPlanQueryDto } from '../../dto/production-plan-query.dto';
import { WorkOrderQueryDto } from '../dto/work-order-query.dto';
import { createMockRepository, TestDataFactory } from '../../../test-utils/test-utils';

describe('ProductionService', () => {
  let service: ProductionService;
  let productionPlanRepository: jest.Mocked<Repository<ProductionPlan>>;
  let workOrderRepository: jest.Mocked<Repository<WorkOrder>>;
  let workOrderTaskRepository: jest.Mocked<Repository<WorkOrderTask>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let itemRepository: jest.Mocked<Repository<Item>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: getRepositoryToken(ProductionPlan),
          useValue: createMockRepository<ProductionPlan>(),
        },
        {
          provide: getRepositoryToken(WorkOrder),
          useValue: createMockRepository<WorkOrder>(),
        },
        {
          provide: getRepositoryToken(WorkOrderTask),
          useValue: createMockRepository<WorkOrderTask>(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository<User>(),
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: createMockRepository<Tenant>(),
        },
        {
          provide: getRepositoryToken(Item),
          useValue: createMockRepository<Item>(),
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    productionPlanRepository = module.get(getRepositoryToken(ProductionPlan));
    workOrderRepository = module.get(getRepositoryToken(WorkOrder));
    workOrderTaskRepository = module.get(getRepositoryToken(WorkOrderTask));
    userRepository = module.get(getRepositoryToken(User));
    tenantRepository = module.get(getRepositoryToken(Tenant));
    itemRepository = module.get(getRepositoryToken(Item));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProductionPlan', () => {
    const createDto: CreateProductionPlanDto = {
      title: 'Test Production Plan',
      description: 'Test description',
      planned_start_date: new Date('2024-01-01'),
      planned_end_date: new Date('2024-01-31'),
      planned_qty: 100,
      item_code: 'ITEM001',
      warehouse: 'WH001',
      priority: 'High',
    };

    it('should create a production plan successfully', async () => {
      const user = TestDataFactory.createUser();
      const tenant = TestDataFactory.createTenant();
      const item = TestDataFactory.createItem({ item_code: createDto.item_code });
      const expectedPlan = TestDataFactory.createProductionPlan({
        title: createDto.title,
        description: createDto.description,
        planned_start_date: createDto.planned_start_date,
        planned_end_date: createDto.planned_end_date,
        planned_qty: createDto.planned_qty,
        item_code: createDto.item_code,
        warehouse: createDto.warehouse,
        priority: createDto.priority,
        user,
        tenant,
      });

      userRepository.findOne.mockResolvedValue(user as User);
      tenantRepository.findOne.mockResolvedValue(tenant as Tenant);
      itemRepository.findOne.mockResolvedValue(item as Item);
      productionPlanRepository.create.mockReturnValue(expectedPlan as ProductionPlan);
      productionPlanRepository.save.mockResolvedValue(expectedPlan as ProductionPlan);

      const result = await service.createProductionPlan('user-id', 'tenant-id', createDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-id' } });
      expect(itemRepository.findOne).toHaveBeenCalledWith({ where: { item_code: createDto.item_code } });
      expect(productionPlanRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: ProductionPlanStatus.DRAFT,
        user,
        tenant,
        item,
      });
      expect(productionPlanRepository.save).toHaveBeenCalledWith(expectedPlan);
      expect(result).toEqual(expectedPlan);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createProductionPlan('non-existent-user', 'tenant-id', createDto)
      ).rejects.toThrow(new NotFoundException('User not found'));

      expect(tenantRepository.findOne).not.toHaveBeenCalled();
      expect(productionPlanRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      const user = TestDataFactory.createUser();
      userRepository.findOne.mockResolvedValue(user as User);
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createProductionPlan('user-id', 'non-existent-tenant', createDto)
      ).rejects.toThrow(new NotFoundException('Tenant not found'));

      expect(itemRepository.findOne).not.toHaveBeenCalled();
      expect(productionPlanRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      const user = TestDataFactory.createUser();
      const tenant = TestDataFactory.createTenant();
      userRepository.findOne.mockResolvedValue(user as User);
      tenantRepository.findOne.mockResolvedValue(tenant as Tenant);
      itemRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createProductionPlan('user-id', 'tenant-id', createDto)
      ).rejects.toThrow(new NotFoundException('Item not found'));

      expect(productionPlanRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if planned end date is before start date', async () => {
      const invalidDto = {
        ...createDto,
        planned_start_date: new Date('2024-01-31'),
        planned_end_date: new Date('2024-01-01'),
      };

      const user = TestDataFactory.createUser();
      const tenant = TestDataFactory.createTenant();
      const item = TestDataFactory.createItem();
      userRepository.findOne.mockResolvedValue(user as User);
      tenantRepository.findOne.mockResolvedValue(tenant as Tenant);
      itemRepository.findOne.mockResolvedValue(item as Item);

      await expect(
        service.createProductionPlan('user-id', 'tenant-id', invalidDto)
      ).rejects.toThrow(new BadRequestException('Planned end date must be after start date'));
    });
  });

  describe('findAllProductionPlans', () => {
    const queryDto: ProductionPlanQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      status: ProductionPlanStatus.DRAFT,
      priority: 'High',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    it('should return paginated production plans', async () => {
      const plans = [
        TestDataFactory.createProductionPlan({ title: 'Plan 1' }),
        TestDataFactory.createProductionPlan({ title: 'Plan 2' }),
      ];
      const total = 2;

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([plans, total]),
      };

      productionPlanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllProductionPlans('tenant-id', queryDto);

      expect(productionPlanRepository.createQueryBuilder).toHaveBeenCalledWith('plan');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('plan.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('plan.item', 'item');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('plan.tenant_id = :tenant_id', { tenant_id: 'tenant-id' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('plan.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        plans,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      productionPlanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAllProductionPlans('tenant-id', { page: 1, limit: 10 });

      expect(result).toEqual({
        plans: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findOneProductionPlan', () => {
    it('should return a production plan by id', async () => {
      const plan = TestDataFactory.createProductionPlan();
      productionPlanRepository.findOne.mockResolvedValue(plan as ProductionPlan);

      const result = await service.findOneProductionPlan('plan-id', 'tenant-id');

      expect(productionPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-id', tenant_id: 'tenant-id' },
        relations: ['user', 'item', 'work_orders'],
      });
      expect(result).toEqual(plan);
    });

    it('should throw NotFoundException if plan not found', async () => {
      productionPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneProductionPlan('non-existent-id', 'tenant-id')
      ).rejects.toThrow(new NotFoundException('Production plan not found'));
    });
  });

  describe('updateProductionPlan', () => {
    const updateDto: UpdateProductionPlanDto = {
      title: 'Updated Plan',
      description: 'Updated description',
      planned_qty: 150,
      priority: 'Medium',
    };

    it('should update a production plan successfully', async () => {
      const existingPlan = TestDataFactory.createProductionPlan();
      const updatedPlan = { ...existingPlan, ...updateDto };

      productionPlanRepository.findOne.mockResolvedValue(existingPlan as ProductionPlan);
      productionPlanRepository.save.mockResolvedValue(updatedPlan as ProductionPlan);

      const result = await service.updateProductionPlan('plan-id', 'tenant-id', updateDto);

      expect(productionPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-id', tenant_id: 'tenant-id' },
      });
      expect(productionPlanRepository.save).toHaveBeenCalledWith({
        ...existingPlan,
        ...updateDto,
      });
      expect(result).toEqual(updatedPlan);
    });

    it('should throw NotFoundException if plan not found', async () => {
      productionPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProductionPlan('non-existent-id', 'tenant-id', updateDto)
      ).rejects.toThrow(new NotFoundException('Production plan not found'));
    });

    it('should throw BadRequestException if trying to update completed plan', async () => {
      const completedPlan = TestDataFactory.createProductionPlan({
        status: ProductionPlanStatus.COMPLETED,
      });
      productionPlanRepository.findOne.mockResolvedValue(completedPlan as ProductionPlan);

      await expect(
        service.updateProductionPlan('plan-id', 'tenant-id', updateDto)
      ).rejects.toThrow(new BadRequestException('Cannot update completed production plan'));
    });
  });

  describe('deleteProductionPlan', () => {
    it('should delete a production plan successfully', async () => {
      const plan = TestDataFactory.createProductionPlan({
        status: ProductionPlanStatus.DRAFT,
      });
      productionPlanRepository.findOne.mockResolvedValue(plan as ProductionPlan);
      productionPlanRepository.remove.mockResolvedValue(plan as ProductionPlan);

      await service.deleteProductionPlan('plan-id', 'tenant-id');

      expect(productionPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'plan-id', tenant_id: 'tenant-id' },
        relations: ['work_orders'],
      });
      expect(productionPlanRepository.remove).toHaveBeenCalledWith(plan);
    });

    it('should throw NotFoundException if plan not found', async () => {
      productionPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteProductionPlan('non-existent-id', 'tenant-id')
      ).rejects.toThrow(new NotFoundException('Production plan not found'));
    });

    it('should throw BadRequestException if plan has work orders', async () => {
      const planWithOrders = TestDataFactory.createProductionPlan({
        work_orders: [TestDataFactory.createWorkOrder()],
      });
      productionPlanRepository.findOne.mockResolvedValue(planWithOrders as ProductionPlan);

      await expect(
        service.deleteProductionPlan('plan-id', 'tenant-id')
      ).rejects.toThrow(
        new BadRequestException('Cannot delete production plan with existing work orders')
      );
    });

    it('should throw BadRequestException if plan is not in draft status', async () => {
      const activePlan = TestDataFactory.createProductionPlan({
        status: ProductionPlanStatus.IN_PROGRESS,
      });
      productionPlanRepository.findOne.mockResolvedValue(activePlan as ProductionPlan);

      await expect(
        service.deleteProductionPlan('plan-id', 'tenant-id')
      ).rejects.toThrow(
        new BadRequestException('Can only delete draft production plans')
      );
    });
  });

  describe('createWorkOrder', () => {
    const createDto: CreateWorkOrderDto = {
      production_plan_id: 'plan-id',
      work_order_number: 'WO001',
      item_code: 'ITEM001',
      qty_to_manufacture: 50,
      warehouse: 'WH001',
      planned_start_date: new Date('2024-01-01'),
      planned_end_date: new Date('2024-01-15'),
    };

    it('should create a work order successfully', async () => {
      const user = TestDataFactory.createUser();
      const tenant = TestDataFactory.createTenant();
      const plan = TestDataFactory.createProductionPlan();
      const item = TestDataFactory.createItem({ item_code: createDto.item_code });
      const expectedOrder = TestDataFactory.createWorkOrder({
        production_plan: plan,
        work_order_number: createDto.work_order_number,
        item_code: createDto.item_code,
        qty_to_manufacture: createDto.qty_to_manufacture,
        warehouse: createDto.warehouse,
        planned_start_date: createDto.planned_start_date,
        planned_end_date: createDto.planned_end_date,
        user,
        tenant,
      });

      userRepository.findOne.mockResolvedValue(user as User);
      tenantRepository.findOne.mockResolvedValue(tenant as Tenant);
      productionPlanRepository.findOne.mockResolvedValue(plan as ProductionPlan);
      itemRepository.findOne.mockResolvedValue(item as Item);
      workOrderRepository.findOne.mockResolvedValue(null); // No duplicate
      workOrderRepository.create.mockReturnValue(expectedOrder as WorkOrder);
      workOrderRepository.save.mockResolvedValue(expectedOrder as WorkOrder);

      const result = await service.createWorkOrder('user-id', 'tenant-id', createDto);

      expect(workOrderRepository.findOne).toHaveBeenCalledWith({
        where: { work_order_number: createDto.work_order_number, tenant_id: 'tenant-id' },
      });
      expect(workOrderRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: WorkOrderStatus.DRAFT,
        production_plan: plan,
        user,
        tenant,
        item,
      });
      expect(result).toEqual(expectedOrder);
    });

    it('should throw ConflictException if work order number already exists', async () => {
      const existingOrder = TestDataFactory.createWorkOrder({
        work_order_number: createDto.work_order_number,
      });
      workOrderRepository.findOne.mockResolvedValue(existingOrder as WorkOrder);

      await expect(
        service.createWorkOrder('user-id', 'tenant-id', createDto)
      ).rejects.toThrow(
        new ConflictException('Work order number already exists')
      );
    });
  });

  describe('updateWorkOrderStatus', () => {
    it('should update work order status successfully', async () => {
      const workOrder = TestDataFactory.createWorkOrder({
        status: WorkOrderStatus.DRAFT,
      });
      const updatedOrder = {
        ...workOrder,
        status: WorkOrderStatus.IN_PROGRESS,
        actual_start_date: expect.any(Date),
      };

      workOrderRepository.findOne.mockResolvedValue(workOrder as WorkOrder);
      workOrderRepository.save.mockResolvedValue(updatedOrder as WorkOrder);

      const result = await service.updateWorkOrderStatus(
        'order-id',
        'tenant-id',
        WorkOrderStatus.IN_PROGRESS
      );

      expect(workOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-id', tenant_id: 'tenant-id' },
      });
      expect(workOrderRepository.save).toHaveBeenCalledWith({
        ...workOrder,
        status: WorkOrderStatus.IN_PROGRESS,
        actual_start_date: expect.any(Date),
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException if work order not found', async () => {
      workOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateWorkOrderStatus('non-existent-id', 'tenant-id', WorkOrderStatus.IN_PROGRESS)
      ).rejects.toThrow(new NotFoundException('Work order not found'));
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const completedOrder = TestDataFactory.createWorkOrder({
        status: WorkOrderStatus.COMPLETED,
      });
      workOrderRepository.findOne.mockResolvedValue(completedOrder as WorkOrder);

      await expect(
        service.updateWorkOrderStatus('order-id', 'tenant-id', WorkOrderStatus.DRAFT)
      ).rejects.toThrow(
        new BadRequestException('Invalid status transition from COMPLETED to DRAFT')
      );
    });
  });
});