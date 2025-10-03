import { Test, TestingModule } from '@nestjs/testing';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('SalesOrdersController', () => {
  let controller: SalesOrdersController;
  let service: SalesOrdersService;

  const mockSalesOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStats: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    submit: jest.fn(),
    cancel: jest.fn(),
    close: jest.fn(),
    hold: jest.fn(),
    resume: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesOrdersController],
      providers: [
        {
          provide: SalesOrdersService,
          useValue: mockSalesOrdersService,
        },
      ],
    }).compile();

    controller = module.get<SalesOrdersController>(SalesOrdersController);
    service = await module.resolve<SalesOrdersService>(SalesOrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createSalesOrderDto: CreateSalesOrderDto = {
      customer_id: 1,
      customer_name: 'Test Customer',
      transaction_date: '2024-01-15',
      delivery_date: '2024-01-20',
      items: [
        {
          item_code: 'ITEM001',
          item_name: 'Test Item',
          qty: 10,
          rate: 100,
          amount: 1000,
        },
      ],
      grand_total: 1000,
      status: 'DRAFT',
    };

    it('should create a sales order successfully', async () => {
      const expectedResult = {
        id: 1,
        ...createSalesOrderDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSalesOrdersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createSalesOrderDto);

      expect(service.create).toHaveBeenCalledWith(createSalesOrderDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle ConflictException when sales order name already exists', async () => {
      mockSalesOrdersService.create.mockRejectedValue(
        new ConflictException('Sales order with this name already exists'),
      );

      await expect(controller.create(createSalesOrderDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.create).toHaveBeenCalledWith(createSalesOrderDto);
    });

    it('should handle BadRequestException for invalid data', async () => {
      mockSalesOrdersService.create.mockRejectedValue(
        new BadRequestException('Customer is required'),
      );

      await expect(controller.create(createSalesOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.create).toHaveBeenCalledWith(createSalesOrderDto);
    });
  });

  describe('findAll', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      status: 'DRAFT',
      order_type: 'SALES',
      customer_id: 1,
      sales_person: 'John Doe',
      territory: 'North',
      transaction_date_from: '2024-01-01',
      transaction_date_to: '2024-01-31',
      delivery_date_from: '2024-01-01',
      delivery_date_to: '2024-01-31',
      sort_by: 'created_at',
      sort_order: 'DESC',
    };

    it('should return paginated sales orders', async () => {
      const expectedResult = {
        data: [
          {
            id: 1,
            customer_name: 'Test Customer',
            transaction_date: '2024-01-15',
            delivery_date: '2024-01-20',
            grand_total: 1000,
            status: 'DRAFT',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockSalesOrdersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(
        queryParams.page,
        queryParams.limit,
        queryParams.search,
        queryParams.status,
        queryParams.order_type,
        queryParams.customer_id,
        queryParams.sales_person,
        queryParams.territory,
        queryParams.transaction_date_from,
        queryParams.transaction_date_to,
        queryParams.delivery_date_from,
        queryParams.delivery_date_to,
        queryParams.sort_by,
        queryParams.sort_order,
      );

      expect(service.findAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(expectedResult);
    });

    it('should return sales orders with default pagination', async () => {
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockSalesOrdersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getStats', () => {
    it('should return sales order statistics', async () => {
      const expectedStats = {
        total: 100,
        draft: 20,
        to_deliver_and_bill: 30,
        to_bill: 15,
        to_deliver: 10,
        completed: 20,
        cancelled: 3,
        closed: 2,
        total_value: 500000,
        average_value: 5000,
      };

      mockSalesOrdersService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('findOne', () => {
    it('should return a sales order by id', async () => {
      const salesOrderId = 1;
      const expectedResult = {
        id: salesOrderId,
        customer_name: 'Test Customer',
        transaction_date: '2024-01-15',
        delivery_date: '2024-01-20',
        grand_total: 1000,
        status: 'DRAFT',
        items: [
          {
            id: 1,
            item_code: 'ITEM001',
            item_name: 'Test Item',
            qty: 10,
            rate: 100,
            amount: 1000,
          },
        ],
      };

      mockSalesOrdersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(salesOrderId.toString());

      expect(service.findOne).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      const salesOrderId = 999;

      mockSalesOrdersService.findOne.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.findOne(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('update', () => {
    const salesOrderId = 1;
    const updateSalesOrderDto: UpdateSalesOrderDto = {
      customer_name: 'Updated Customer',
      delivery_date: '2024-01-25',
      items: [
        {
          item_code: 'ITEM002',
          item_name: 'Updated Item',
          qty: 15,
          rate: 120,
          amount: 1800,
        },
      ],
      grand_total: 1800,
    };

    it('should update a sales order successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        ...updateSalesOrderDto,
        updated_at: new Date(),
      };

      mockSalesOrdersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        salesOrderId.toString(),
        updateSalesOrderDto,
      );

      expect(service.update).toHaveBeenCalledWith(salesOrderId, updateSalesOrderDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.update.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.update(salesOrderId.toString(), updateSalesOrderDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(salesOrderId, updateSalesOrderDto);
    });

    it('should handle BadRequestException when trying to update completed order', async () => {
      mockSalesOrdersService.update.mockRejectedValue(
        new BadRequestException('Cannot update completed sales order'),
      );

      await expect(
        controller.update(salesOrderId.toString(), updateSalesOrderDto),
      ).rejects.toThrow(BadRequestException);
      expect(service.update).toHaveBeenCalledWith(salesOrderId, updateSalesOrderDto);
    });
  });

  describe('remove', () => {
    const salesOrderId = 1;

    it('should remove a sales order successfully', async () => {
      const expectedResult = { message: 'Sales order deleted successfully' };

      mockSalesOrdersService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(salesOrderId.toString());

      expect(service.remove).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.remove.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.remove(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to delete non-draft order', async () => {
      mockSalesOrdersService.remove.mockRejectedValue(
        new BadRequestException('Only draft sales orders can be deleted'),
      );

      await expect(
        controller.remove(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.remove).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('submit', () => {
    const salesOrderId = 1;

    it('should submit a sales order successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        status: 'TO_DELIVER_AND_BILL',
        message: 'Sales order submitted successfully',
      };

      mockSalesOrdersService.submit.mockResolvedValue(expectedResult);

      const result = await controller.submit(salesOrderId.toString());

      expect(service.submit).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.submit.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.submit(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.submit).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to submit non-draft order', async () => {
      mockSalesOrdersService.submit.mockRejectedValue(
        new BadRequestException('Only draft sales orders can be submitted'),
      );

      await expect(
        controller.submit(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.submit).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('cancel', () => {
    const salesOrderId = 1;

    it('should cancel a sales order successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        status: 'CANCELLED',
        message: 'Sales order cancelled successfully',
      };

      mockSalesOrdersService.cancel.mockResolvedValue(expectedResult);

      const result = await controller.cancel(salesOrderId.toString());

      expect(service.cancel).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.cancel.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.cancel(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.cancel).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to cancel completed order', async () => {
      mockSalesOrdersService.cancel.mockRejectedValue(
        new BadRequestException('Cannot cancel completed sales order'),
      );

      await expect(
        controller.cancel(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.cancel).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('close', () => {
    const salesOrderId = 1;

    it('should close a sales order successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        status: 'CLOSED',
        message: 'Sales order closed successfully',
      };

      mockSalesOrdersService.close.mockResolvedValue(expectedResult);

      const result = await controller.close(salesOrderId.toString());

      expect(service.close).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.close.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.close(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.close).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to close draft order', async () => {
      mockSalesOrdersService.close.mockRejectedValue(
        new BadRequestException('Cannot close draft sales order'),
      );

      await expect(
        controller.close(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.close).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('hold', () => {
    const salesOrderId = 1;

    it('should put a sales order on hold successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        status: 'ON_HOLD',
        message: 'Sales order put on hold successfully',
      };

      mockSalesOrdersService.hold.mockResolvedValue(expectedResult);

      const result = await controller.hold(salesOrderId.toString());

      expect(service.hold).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.hold.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.hold(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.hold).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to hold invalid status order', async () => {
      mockSalesOrdersService.hold.mockRejectedValue(
        new BadRequestException('Cannot put this sales order on hold'),
      );

      await expect(
        controller.hold(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.hold).toHaveBeenCalledWith(salesOrderId);
    });
  });

  describe('resume', () => {
    const salesOrderId = 1;

    it('should resume a sales order successfully', async () => {
      const expectedResult = {
        id: salesOrderId,
        status: 'TO_DELIVER_AND_BILL',
        message: 'Sales order resumed successfully',
      };

      mockSalesOrdersService.resume.mockResolvedValue(expectedResult);

      const result = await controller.resume(salesOrderId.toString());

      expect(service.resume).toHaveBeenCalledWith(salesOrderId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle NotFoundException when sales order not found', async () => {
      mockSalesOrdersService.resume.mockRejectedValue(
        new NotFoundException('Sales order not found'),
      );

      await expect(
        controller.resume(salesOrderId.toString()),
      ).rejects.toThrow(NotFoundException);
      expect(service.resume).toHaveBeenCalledWith(salesOrderId);
    });

    it('should handle BadRequestException when trying to resume non-hold order', async () => {
      mockSalesOrdersService.resume.mockRejectedValue(
        new BadRequestException('Only on-hold sales orders can be resumed'),
      );

      await expect(
        controller.resume(salesOrderId.toString()),
      ).rejects.toThrow(BadRequestException);
      expect(service.resume).toHaveBeenCalledWith(salesOrderId);
    });
  });
});