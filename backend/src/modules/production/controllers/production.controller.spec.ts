import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from '../services/production.service';
import { ProductionPlanStatus } from '../entities/production-plan.entity';
import { WorkOrderStatus } from '../entities/work-order.entity';
import { CreateProductionPlanDto } from '../dto/create-production-plan.dto';
import { UpdateProductionPlanDto } from '../dto/update-production-plan.dto';
import { CreateWorkOrderDto } from '../dto/create-work-order.dto';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';
import { ProductionPlanQueryDto } from '../dto/production-plan-query.dto';
import { WorkOrderQueryDto } from '../dto/work-order-query.dto';
import { TestDataFactory } from '../../../test-utils/test-utils';

describe('ProductionController', () => {
  let controller: ProductionController;
  let productionService: jest.Mocked<ProductionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            createProductionPlan: jest.fn(),
            findAllProductionPlans: jest.fn(),
            findOneProductionPlan: jest.fn(),
            updateProductionPlan: jest.fn(),
            deleteProductionPlan: jest.fn(),
            createWorkOrder: jest.fn(),
            findAllWorkOrders: jest.fn(),
            findOneWorkOrder: jest.fn(),
            updateWorkOrder: jest.fn(),
            updateWorkOrderStatus: jest.fn(),
            deleteWorkOrder: jest.fn(),
            createWorkOrderTask: jest.fn(),
            updateWorkOrderTask: jest.fn(),
            deleteWorkOrderTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    productionService = module.get(ProductionService);
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

    const mockRequest = {
      user: { id: 'user-id', tenant_id: 'tenant-id' },
    };

    it('should create a production plan successfully', async () => {
      const expectedPlan = TestDataFactory.createProductionPlan({
        title: createDto.title,
        description: createDto.description,
        planned_qty: createDto.planned_qty,
        item_code: createDto.item_code,
      });

      productionService.createProductionPlan.mockResolvedValue(expectedPlan as any);

      const result = await controller.createProductionPlan(mockRequest as any, createDto);

      expect(productionService.createProductionPlan).toHaveBeenCalledWith(
        'user-id',
        'tenant-id',
        createDto
      );
      expect(result).toEqual({
        message: 'Production plan created successfully',
        plan: expectedPlan,
      });
    });

    it('should handle NotFoundException from service', async () => {
      productionService.createProductionPlan.mockRejectedValue(
        new NotFoundException('Item not found')
      );

      await expect(
        controller.createProductionPlan(mockRequest as any, createDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle BadRequestException from service', async () => {
      productionService.createProductionPlan.mockRejectedValue(
        new BadRequestException('Planned end date must be after start date')
      );

      await expect(
        controller.createProductionPlan(mockRequest as any, createDto)
      ).rejects.toThrow(BadRequestException);
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

    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should return paginated production plans', async () => {
      const plans = [
        TestDataFactory.createProductionPlan({ title: 'Plan 1' }),
        TestDataFactory.createProductionPlan({ title: 'Plan 2' }),
      ];
      const expectedResult = {
        plans,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      productionService.findAllProductionPlans.mockResolvedValue(expectedResult as any);

      const result = await controller.findAllProductionPlans(mockRequest as any, queryDto);

      expect(productionService.findAllProductionPlans).toHaveBeenCalledWith(
        'tenant-id',
        queryDto
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const emptyResult = {
        plans: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      productionService.findAllProductionPlans.mockResolvedValue(emptyResult as any);

      const result = await controller.findAllProductionPlans(mockRequest as any, {});

      expect(result).toEqual(emptyResult);
    });
  });

  describe('findOneProductionPlan', () => {
    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should return a production plan by id', async () => {
      const plan = TestDataFactory.createProductionPlan();
      productionService.findOneProductionPlan.mockResolvedValue(plan as any);

      const result = await controller.findOneProductionPlan(
        mockRequest as any,
        'plan-id'
      );

      expect(productionService.findOneProductionPlan).toHaveBeenCalledWith(
        'plan-id',
        'tenant-id'
      );
      expect(result).toEqual(plan);
    });

    it('should handle NotFoundException from service', async () => {
      productionService.findOneProductionPlan.mockRejectedValue(
        new NotFoundException('Production plan not found')
      );

      await expect(
        controller.findOneProductionPlan(mockRequest as any, 'non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProductionPlan', () => {
    const updateDto: UpdateProductionPlanDto = {
      title: 'Updated Plan',
      description: 'Updated description',
      planned_qty: 150,
      priority: 'Medium',
    };

    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should update a production plan successfully', async () => {
      const updatedPlan = TestDataFactory.createProductionPlan({
        title: updateDto.title,
        description: updateDto.description,
        planned_qty: updateDto.planned_qty,
        priority: updateDto.priority,
      });

      productionService.updateProductionPlan.mockResolvedValue(updatedPlan as any);

      const result = await controller.updateProductionPlan(
        mockRequest as any,
        'plan-id',
        updateDto
      );

      expect(productionService.updateProductionPlan).toHaveBeenCalledWith(
        'plan-id',
        'tenant-id',
        updateDto
      );
      expect(result).toEqual({
        message: 'Production plan updated successfully',
        plan: updatedPlan,
      });
    });

    it('should handle NotFoundException from service', async () => {
      productionService.updateProductionPlan.mockRejectedValue(
        new NotFoundException('Production plan not found')
      );

      await expect(
        controller.updateProductionPlan(mockRequest as any, 'non-existent-id', updateDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle BadRequestException for completed plan', async () => {
      productionService.updateProductionPlan.mockRejectedValue(
        new BadRequestException('Cannot update completed production plan')
      );

      await expect(
        controller.updateProductionPlan(mockRequest as any, 'plan-id', updateDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProductionPlan', () => {
    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should delete a production plan successfully', async () => {
      productionService.deleteProductionPlan.mockResolvedValue(undefined);

      const result = await controller.deleteProductionPlan(
        mockRequest as any,
        'plan-id'
      );

      expect(productionService.deleteProductionPlan).toHaveBeenCalledWith(
        'plan-id',
        'tenant-id'
      );
      expect(result).toEqual({
        message: 'Production plan deleted successfully',
      });
    });

    it('should handle NotFoundException from service', async () => {
      productionService.deleteProductionPlan.mockRejectedValue(
        new NotFoundException('Production plan not found')
      );

      await expect(
        controller.deleteProductionPlan(mockRequest as any, 'non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle BadRequestException for plan with work orders', async () => {
      productionService.deleteProductionPlan.mockRejectedValue(
        new BadRequestException('Cannot delete production plan with existing work orders')
      );

      await expect(
        controller.deleteProductionPlan(mockRequest as any, 'plan-id')
      ).rejects.toThrow(BadRequestException);
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

    const mockRequest = {
      user: { id: 'user-id', tenant_id: 'tenant-id' },
    };

    it('should create a work order successfully', async () => {
      const expectedOrder = TestDataFactory.createWorkOrder({
        work_order_number: createDto.work_order_number,
        item_code: createDto.item_code,
        qty_to_manufacture: createDto.qty_to_manufacture,
      });

      productionService.createWorkOrder.mockResolvedValue(expectedOrder as any);

      const result = await controller.createWorkOrder(mockRequest as any, createDto);

      expect(productionService.createWorkOrder).toHaveBeenCalledWith(
        'user-id',
        'tenant-id',
        createDto
      );
      expect(result).toEqual({
        message: 'Work order created successfully',
        workOrder: expectedOrder,
      });
    });

    it('should handle ConflictException from service', async () => {
      productionService.createWorkOrder.mockRejectedValue(
        new ConflictException('Work order number already exists')
      );

      await expect(
        controller.createWorkOrder(mockRequest as any, createDto)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateWorkOrderStatus', () => {
    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should update work order status successfully', async () => {
      const updatedOrder = TestDataFactory.createWorkOrder({
        status: WorkOrderStatus.IN_PROGRESS,
        actual_start_date: new Date(),
      });

      productionService.updateWorkOrderStatus.mockResolvedValue(updatedOrder as any);

      const result = await controller.updateWorkOrderStatus(
        mockRequest as any,
        'order-id',
        { status: WorkOrderStatus.IN_PROGRESS }
      );

      expect(productionService.updateWorkOrderStatus).toHaveBeenCalledWith(
        'order-id',
        'tenant-id',
        WorkOrderStatus.IN_PROGRESS
      );
      expect(result).toEqual({
        message: 'Work order status updated successfully',
        workOrder: updatedOrder,
      });
    });

    it('should handle NotFoundException from service', async () => {
      productionService.updateWorkOrderStatus.mockRejectedValue(
        new NotFoundException('Work order not found')
      );

      await expect(
        controller.updateWorkOrderStatus(
          mockRequest as any,
          'non-existent-id',
          { status: WorkOrderStatus.IN_PROGRESS }
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle BadRequestException for invalid status transition', async () => {
      productionService.updateWorkOrderStatus.mockRejectedValue(
        new BadRequestException('Invalid status transition from COMPLETED to DRAFT')
      );

      await expect(
        controller.updateWorkOrderStatus(
          mockRequest as any,
          'order-id',
          { status: WorkOrderStatus.DRAFT }
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllWorkOrders', () => {
    const queryDto: WorkOrderQueryDto = {
      page: 1,
      limit: 10,
      search: 'WO001',
      status: WorkOrderStatus.DRAFT,
      production_plan_id: 'plan-id',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should return paginated work orders', async () => {
      const workOrders = [
        TestDataFactory.createWorkOrder({ work_order_number: 'WO001' }),
        TestDataFactory.createWorkOrder({ work_order_number: 'WO002' }),
      ];
      const expectedResult = {
        workOrders,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      productionService.findAllWorkOrders.mockResolvedValue(expectedResult as any);

      const result = await controller.findAllWorkOrders(mockRequest as any, queryDto);

      expect(productionService.findAllWorkOrders).toHaveBeenCalledWith(
        'tenant-id',
        queryDto
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOneWorkOrder', () => {
    const mockRequest = {
      user: { tenant_id: 'tenant-id' },
    };

    it('should return a work order by id', async () => {
      const workOrder = TestDataFactory.createWorkOrder();
      productionService.findOneWorkOrder.mockResolvedValue(workOrder as any);

      const result = await controller.findOneWorkOrder(
        mockRequest as any,
        'order-id'
      );

      expect(productionService.findOneWorkOrder).toHaveBeenCalledWith(
        'order-id',
        'tenant-id'
      );
      expect(result).toEqual(workOrder);
    });

    it('should handle NotFoundException from service', async () => {
      productionService.findOneWorkOrder.mockRejectedValue(
        new NotFoundException('Work order not found')
      );

      await expect(
        controller.findOneWorkOrder(mockRequest as any, 'non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('error handling', () => {
    const mockRequest = {
      user: { id: 'user-id', tenant_id: 'tenant-id' },
    };

    it('should handle service errors gracefully', async () => {
      const createDto: CreateProductionPlanDto = {
        title: 'Test Plan',
        planned_start_date: new Date(),
        planned_end_date: new Date(),
        planned_qty: 100,
        item_code: 'ITEM001',
      };

      productionService.createProductionPlan.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        controller.createProductionPlan(mockRequest as any, createDto)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle unexpected errors in findAll', async () => {
      productionService.findAllProductionPlans.mockRejectedValue(
        new Error('Unexpected error')
      );

      await expect(
        controller.findAllProductionPlans(mockRequest as any, {})
      ).rejects.toThrow('Unexpected error');
    });
  });

  describe('input validation', () => {
    const mockRequest = {
      user: { id: 'user-id', tenant_id: 'tenant-id' },
    };

    it('should handle empty request body for create', async () => {
      const emptyDto = {} as CreateProductionPlanDto;
      
      productionService.createProductionPlan.mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(
        controller.createProductionPlan(mockRequest as any, emptyDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle malformed query parameters', async () => {
      const malformedQuery = {
        page: 'not-a-number',
        limit: 'invalid',
      } as any;

      productionService.findAllProductionPlans.mockResolvedValue({
        plans: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      } as any);

      const result = await controller.findAllProductionPlans(
        mockRequest as any,
        malformedQuery
      );
      expect(result).toBeDefined();
    });
  });
});