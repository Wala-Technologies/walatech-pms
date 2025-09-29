import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrder, SalesOrderStatus } from '../../../entities/sales-order.entity';
import { SalesOrderItem } from '../../../entities/sales-order-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOrderQueryDto,
} from '../dto/sales-orders';

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  let salesOrderRepository: jest.Mocked<Repository<SalesOrder>>;
  let salesOrderItemRepository: jest.Mocked<Repository<SalesOrderItem>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let departmentAccessService: jest.Mocked<DepartmentAccessService>;
  let mockRequest: any;

  const mockTenantId = 'tenant1';
  const mockUserId = 'user1';
  const mockDepartmentId = 'dept1';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    departments: [mockDepartmentId],
  };

  const mockCustomer = {
    id: 'customer1',
    name: 'Test Customer',
    tenant_id: mockTenantId,
  };

  const mockSalesOrderItem = {
    id: 'item1',
    item_code: 'ITEM001',
    item_name: 'Test Item',
    qty: 2,
    rate: 100,
    amount: 200,
    base_rate: 100,
    base_amount: 200,
    discount_amount: 0,
    net_rate: 100,
    net_amount: 200,
    delivery_date: new Date('2024-02-01'),
    tenant_id: mockTenantId,
    sales_order_id: 'so1',
  };

  const mockSalesOrder = {
    id: 'so1',
    name: 'SO-001',
    customer_id: 'customer1',
    customer_name: 'Test Customer',
    transaction_date: new Date('2024-01-01'),
    delivery_date: new Date('2024-02-01'),
    status: SalesOrderStatus.DRAFT,
    docstatus: 0,
    order_type: 'Sales',
    total_qty: 2,
    base_total: 200,
    base_net_total: 200,
    grand_total: 200,
    base_grand_total: 200,
    conversion_rate: 1,
    department_id: mockDepartmentId,
    tenant_id: mockTenantId,
    owner: 'test@example.com',
    created_at: new Date(),
    updated_at: new Date(),
    customer: mockCustomer,
    items: [mockSalesOrderItem],
  };

  const mockCreateSalesOrderDto: CreateSalesOrderDto = {
    customer_id: 'customer1',
    customer_name: 'Test Customer',
    transaction_date: '2024-01-01',
    delivery_date: '2024-02-01',
    order_type: 'Sales',
    department_id: mockDepartmentId,
    items: [
      {
        item_code: 'ITEM001',
        item_name: 'Test Item',
        qty: 2,
        rate: 100,
        delivery_date: '2024-02-01',
      },
    ],
  };

  const mockUpdateSalesOrderDto: UpdateSalesOrderDto = {
    customer_name: 'Updated Customer',
    items: [
      {
        item_code: 'ITEM001',
        item_name: 'Updated Item',
        qty: 3,
        rate: 150,
        delivery_date: '2024-02-01',
      },
    ],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const mockSalesOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockSalesOrderItemRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockCustomerRepository = {
      findOne: jest.fn(),
    };

    const mockDepartmentAccessService = {
      getDefaultDepartmentForUser: jest.fn(),
      canAccessDepartment: jest.fn(),
      canAccessAllDepartments: jest.fn(),
      getAccessibleDepartmentIds: jest.fn(),
    };

    mockRequest = {
      user: mockUser,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrdersService,
        {
          provide: getRepositoryToken(SalesOrder),
          useValue: mockSalesOrderRepository,
        },
        {
          provide: getRepositoryToken(SalesOrderItem),
          useValue: mockSalesOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: DepartmentAccessService,
          useValue: mockDepartmentAccessService,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve<SalesOrdersService>(SalesOrdersService);
    salesOrderRepository = module.get(getRepositoryToken(SalesOrder));
    salesOrderItemRepository = module.get(getRepositoryToken(SalesOrderItem));
    customerRepository = module.get(getRepositoryToken(Customer));
    departmentAccessService = module.get(DepartmentAccessService);

    // Setup default mocks
    salesOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    departmentAccessService.canAccessDepartment.mockReturnValue(true);
    departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
    departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([mockDepartmentId]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      customerRepository.findOne.mockResolvedValue(mockCustomer as any);
      salesOrderRepository.create.mockReturnValue(mockSalesOrder as any);
      salesOrderItemRepository.create.mockReturnValue(mockSalesOrderItem as any);
      salesOrderRepository.save.mockResolvedValue(mockSalesOrder as any);
      salesOrderItemRepository.save.mockResolvedValue([mockSalesOrderItem] as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);
    });

    it('should create a sales order successfully', async () => {
      const result = await service.create(mockCreateSalesOrderDto, mockTenantId);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'customer1', tenant_id: mockTenantId },
      });
      expect(salesOrderRepository.create).toHaveBeenCalled();
      expect(salesOrderRepository.save).toHaveBeenCalled();
      expect(salesOrderItemRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSalesOrder);
    });

    it('should throw BadRequestException when customer information is missing', async () => {
      const invalidDto = { ...mockCreateSalesOrderDto, customer_id: undefined };

      await expect(service.create(invalidDto as any, mockTenantId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when transaction_date is missing', async () => {
      const invalidDto = { ...mockCreateSalesOrderDto, transaction_date: undefined };

      await expect(service.create(invalidDto as any, mockTenantId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when items array is empty', async () => {
      const invalidDto = { ...mockCreateSalesOrderDto, items: [] };

      await expect(service.create(invalidDto, mockTenantId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when customer not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.create(mockCreateSalesOrderDto, mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when user cannot access department', async () => {
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.create(mockCreateSalesOrderDto, mockTenantId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set default department when not provided', async () => {
      const dtoWithoutDept = { ...mockCreateSalesOrderDto, department_id: undefined };
      departmentAccessService.getDefaultDepartmentForUser.mockReturnValue('default-dept');

      await service.create(dtoWithoutDept, mockTenantId);

      expect(departmentAccessService.getDefaultDepartmentForUser).toHaveBeenCalledWith(mockUser);
    });

    it('should handle ConflictException for duplicate sales order name', async () => {
      const duplicateError = { code: 'ER_DUP_ENTRY' };
      salesOrderRepository.save.mockRejectedValue(duplicateError);

      await expect(service.create(mockCreateSalesOrderDto, mockTenantId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should calculate totals correctly', async () => {
      const dtoWithDiscount = {
        ...mockCreateSalesOrderDto,
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item',
            qty: 2,
            rate: 100,
            discount_percentage: 10,
            delivery_date: '2024-02-01',
          },
        ],
      };

      await service.create(dtoWithDiscount, mockTenantId);

      expect(salesOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total_qty: 2,
          base_total: 200,
          grand_total: 180, // After 10% discount
        }),
      );
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockSalesOrder], 1]);
    });

    it('should return paginated sales orders', async () => {
      const query: SalesOrderQueryDto = { page: 1, limit: 10 };

      const result = await service.findAll(query, mockTenantId);

      expect(result).toEqual({
        data: [mockSalesOrder],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should apply search filter', async () => {
      const query: SalesOrderQueryDto = { search: 'Test' };

      await service.findAll(query, mockTenantId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(so.name LIKE :search OR so.customer_name LIKE :search)',
        { search: '%Test%' },
      );
    });

    it('should apply status filter', async () => {
      const query: SalesOrderQueryDto = { status: SalesOrderStatus.DRAFT };

      await service.findAll(query, mockTenantId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('so.status = :status', {
        status: SalesOrderStatus.DRAFT,
      });
    });

    it('should apply date range filters', async () => {
      const query: SalesOrderQueryDto = {
        from_date: '2024-01-01',
        to_date: '2024-01-31',
      };

      await service.findAll(query, mockTenantId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'so.transaction_date >= :from_date',
        { from_date: '2024-01-01' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'so.transaction_date <= :to_date',
        { to_date: '2024-01-31' },
      );
    });

    it('should apply department access control', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue(['dept1', 'dept2']);

      await service.findAll({}, mockTenantId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'so.department_id IN (:...departmentIds)',
        { departmentIds: ['dept1', 'dept2'] },
      );
    });

    it('should return empty result when user has no department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      await service.findAll({}, mockTenantId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('1 = 0');
    });

    it('should apply sorting', async () => {
      const query: SalesOrderQueryDto = { sort_by: 'name', sort_order: 'ASC' };

      await service.findAll(query, mockTenantId);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('so.name', 'ASC');
    });

    it('should apply default sorting when not specified', async () => {
      await service.findAll({}, mockTenantId);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('so.creation', 'DESC');
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      salesOrderRepository.findOne.mockResolvedValue(mockSalesOrder as any);
    });

    it('should return a sales order by id', async () => {
      const result = await service.findOne('so1', mockTenantId);

      expect(salesOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'so1', tenant_id: mockTenantId },
        relations: ['customer', 'items'],
      });
      expect(result).toEqual(mockSalesOrder);
    });

    it('should throw NotFoundException when sales order not found', async () => {
      salesOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user cannot access department', async () => {
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOne('so1', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should add backwards-compatible total alias', async () => {
      const result = await service.findOne('so1', mockTenantId);

      expect((result as any).total).toBe(mockSalesOrder.grand_total);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      mockQueryBuilder.getCount
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // draft
        .mockResolvedValueOnce(4) // submitted
        .mockResolvedValueOnce(1) // cancelled
        .mockResolvedValueOnce(1) // closed
        .mockResolvedValueOnce(1); // onHold

      mockQueryBuilder.getRawOne.mockResolvedValue({ totalValue: '5000.00' });
    });

    it('should return sales order statistics', async () => {
      const result = await service.getStats(mockTenantId);

      expect(result).toEqual({
        total: 10,
        draft: 3,
        submitted: 4,
        cancelled: 1,
        closed: 1,
        onHold: 1,
        totalValue: 5000,
        averageValue: 500,
      });
    });

    it('should handle zero total value', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ totalValue: null });

      const result = await service.getStats(mockTenantId);

      expect(result.totalValue).toBe(0);
      expect(result.averageValue).toBe(0);
    });

    it('should calculate average correctly when total is zero', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getStats(mockTenantId);

      expect(result.averageValue).toBe(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);
      salesOrderItemRepository.delete.mockResolvedValue({ affected: 1 } as any);
      salesOrderItemRepository.save.mockResolvedValue([mockSalesOrderItem] as any);
      salesOrderRepository.save.mockResolvedValue(mockSalesOrder as any);
    });

    it('should update a sales order successfully', async () => {
      const result = await service.update('so1', mockUpdateSalesOrderDto, mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSalesOrder);
    });

    it('should throw BadRequestException when updating completed sales order', async () => {
      const completedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.COMPLETED };
      jest.spyOn(service, 'findOne').mockResolvedValue(completedSalesOrder as any);

      await expect(
        service.update('so1', mockUpdateSalesOrderDto, mockTenantId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating cancelled sales order', async () => {
      const cancelledSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.CANCELLED };
      jest.spyOn(service, 'findOne').mockResolvedValue(cancelledSalesOrder as any);

      await expect(
        service.update('so1', mockUpdateSalesOrderDto, mockTenantId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should recalculate totals when items are updated', async () => {
      await service.update('so1', mockUpdateSalesOrderDto, mockTenantId);

      expect(salesOrderItemRepository.delete).toHaveBeenCalledWith({ sales_order_id: 'so1' });
      expect(salesOrderItemRepository.save).toHaveBeenCalled();
    });

    it('should handle partial updates without items', async () => {
      const partialUpdate = { customer_name: 'Updated Name' };

      await service.update('so1', partialUpdate, mockTenantId);

      expect(salesOrderItemRepository.delete).not.toHaveBeenCalled();
      expect(salesOrderRepository.save).toHaveBeenCalled();
    });

    it('should normalize numeric fields', async () => {
      const salesOrderWithStringNumbers = {
        ...mockSalesOrder,
        conversion_rate: '1.5',
        total_qty: '10',
        grand_total: '1000.50',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(salesOrderWithStringNumbers as any);

      const result = await service.update('so1', {}, mockTenantId);

      expect((result as any).conversion_rate).toBe(1.5);
      expect((result as any).total_qty).toBe(10);
      expect((result as any).grand_total).toBe(1000.5);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);
      salesOrderRepository.remove.mockResolvedValue(mockSalesOrder as any);
    });

    it('should remove a draft sales order successfully', async () => {
      await service.remove('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.remove).toHaveBeenCalledWith(mockSalesOrder);
    });

    it('should throw BadRequestException when removing non-draft sales order', async () => {
      const submittedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER_AND_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(submittedSalesOrder as any);

      await expect(service.remove('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);
      salesOrderRepository.save.mockResolvedValue({
        ...mockSalesOrder,
        status: SalesOrderStatus.TO_DELIVER_AND_BILL,
        docstatus: 1,
      } as any);
    });

    it('should submit a draft sales order successfully', async () => {
      const result = await service.submit('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SalesOrderStatus.TO_DELIVER_AND_BILL,
          docstatus: 1,
        }),
      );
      expect(result.status).toBe(SalesOrderStatus.TO_DELIVER_AND_BILL);
    });

    it('should throw BadRequestException when submitting non-draft sales order', async () => {
      const submittedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER_AND_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(submittedSalesOrder as any);

      await expect(service.submit('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      const submittedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER_AND_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(submittedSalesOrder as any);
      salesOrderRepository.save.mockResolvedValue({
        ...submittedSalesOrder,
        status: SalesOrderStatus.CANCELLED,
        docstatus: 2,
      } as any);
    });

    it('should cancel a sales order successfully', async () => {
      const result = await service.cancel('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SalesOrderStatus.CANCELLED,
          docstatus: 2,
        }),
      );
      expect(result.status).toBe(SalesOrderStatus.CANCELLED);
    });

    it('should throw BadRequestException when cancelling completed sales order', async () => {
      const completedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.COMPLETED };
      jest.spyOn(service, 'findOne').mockResolvedValue(completedSalesOrder as any);

      await expect(service.cancel('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cancelling already cancelled sales order', async () => {
      const cancelledSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.CANCELLED };
      jest.spyOn(service, 'findOne').mockResolvedValue(cancelledSalesOrder as any);

      await expect(service.cancel('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      const submittedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER_AND_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(submittedSalesOrder as any);
      salesOrderRepository.save.mockResolvedValue({
        ...submittedSalesOrder,
        status: SalesOrderStatus.CLOSED,
      } as any);
    });

    it('should close a sales order successfully', async () => {
      const result = await service.close('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SalesOrderStatus.CLOSED,
        }),
      );
      expect(result.status).toBe(SalesOrderStatus.CLOSED);
    });

    it('should throw BadRequestException when closing draft sales order', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);

      await expect(service.close('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when closing cancelled sales order', async () => {
      const cancelledSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.CANCELLED };
      jest.spyOn(service, 'findOne').mockResolvedValue(cancelledSalesOrder as any);

      await expect(service.close('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('hold', () => {
    beforeEach(() => {
      const submittedSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER_AND_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(submittedSalesOrder as any);
      salesOrderRepository.save.mockResolvedValue({
        ...submittedSalesOrder,
        status: SalesOrderStatus.ON_HOLD,
      } as any);
    });

    it('should put a sales order on hold successfully', async () => {
      const result = await service.hold('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SalesOrderStatus.ON_HOLD,
        }),
      );
      expect(result.status).toBe(SalesOrderStatus.ON_HOLD);
    });

    it('should throw BadRequestException when holding draft sales order', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);

      await expect(service.hold('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });

    it('should allow holding TO_DELIVER status', async () => {
      const toDeliverSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_DELIVER };
      jest.spyOn(service, 'findOne').mockResolvedValue(toDeliverSalesOrder as any);

      await service.hold('so1', mockTenantId);

      expect(salesOrderRepository.save).toHaveBeenCalled();
    });

    it('should allow holding TO_BILL status', async () => {
      const toBillSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.TO_BILL };
      jest.spyOn(service, 'findOne').mockResolvedValue(toBillSalesOrder as any);

      await service.hold('so1', mockTenantId);

      expect(salesOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    beforeEach(() => {
      const onHoldSalesOrder = { ...mockSalesOrder, status: SalesOrderStatus.ON_HOLD };
      jest.spyOn(service, 'findOne').mockResolvedValue(onHoldSalesOrder as any);
      salesOrderRepository.save.mockResolvedValue({
        ...onHoldSalesOrder,
        status: SalesOrderStatus.TO_DELIVER_AND_BILL,
      } as any);
    });

    it('should resume a sales order from hold successfully', async () => {
      const result = await service.resume('so1', mockTenantId);

      expect(service.findOne).toHaveBeenCalledWith('so1', mockTenantId);
      expect(salesOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SalesOrderStatus.TO_DELIVER_AND_BILL,
        }),
      );
      expect(result.status).toBe(SalesOrderStatus.TO_DELIVER_AND_BILL);
    });

    it('should throw BadRequestException when resuming non-hold sales order', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSalesOrder as any);

      await expect(service.resume('so1', mockTenantId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createQueryBuilder', () => {
    it('should create query builder with proper joins and tenant filter', () => {
      const result = (service as any).createQueryBuilder(mockTenantId);

      expect(salesOrderRepository.createQueryBuilder).toHaveBeenCalledWith('so');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('so.customer', 'customer');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('so.tenant_id = :tenant_id', {
        tenant_id: mockTenantId,
      });
    });
  });
});