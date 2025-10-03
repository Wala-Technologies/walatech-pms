import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { SalesInvoicesService } from './sales-invoices.service';
import { SalesInvoice, SalesInvoiceStatus } from '../../../entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../../../entities/sales-invoice-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { CreateSalesInvoiceDto } from '../dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from '../dto/update-sales-invoice.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

describe('SalesInvoicesService', () => {
  let service: SalesInvoicesService;
  let salesInvoiceRepository: jest.Mocked<Repository<SalesInvoice>>;
  let salesInvoiceItemRepository: jest.Mocked<Repository<SalesInvoiceItem>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let itemRepository: jest.Mocked<Repository<Item>>;
  let dataSource: jest.Mocked<DataSource>;
  let departmentAccessService: jest.Mocked<DepartmentAccessService>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockRequest = {
    user: {
      id: 'user-123',
      tenant_id: 'tenant-123',
      department_id: 'dept-123',
    },
  };

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-123';

  beforeEach(async () => {
    // Create mock query runner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesInvoicesService,
        {
          provide: getRepositoryToken(SalesInvoice),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalesInvoiceItem),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Item),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
        {
          provide: DepartmentAccessService,
          useValue: {
            canAccessAllDepartments: jest.fn(),
            getAccessibleDepartmentIds: jest.fn(),
            canAccessDepartment: jest.fn(),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve<SalesInvoicesService>(SalesInvoicesService);
    salesInvoiceRepository = module.get(getRepositoryToken(SalesInvoice));
    salesInvoiceItemRepository = module.get(getRepositoryToken(SalesInvoiceItem));
    customerRepository = module.get(getRepositoryToken(Customer));
    itemRepository = module.get(getRepositoryToken(Item));
    dataSource = module.get(DataSource);
    departmentAccessService = module.get(DepartmentAccessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateSalesInvoiceDto = {
      customer_id: 'customer-123',
      posting_date: '2024-01-15',
      due_date: '2024-02-15',
      currency: 'USD',
      conversion_rate: 1,
      items: [
        {
          item_code: 'ITEM001',
          qty: 10,
          rate: 100,
          uom: 'Nos',
          discount_percentage: 5,
        },
      ],
    };

    const mockCustomer = {
      id: 'customer-123',
      name: 'Test Customer',
      tenant_id: mockTenantId,
    };

    const mockItem = {
      id: 'item-123',
      code: 'ITEM001',
      name: 'Test Item',
      description: 'Test Description',
      stockUom: 'Nos',
      tenant_id: mockTenantId,
    };

    const mockSavedInvoice = {
      id: 'invoice-123',
      name: 'SINV-2024-00001',
      tenant_id: mockTenantId,
      customer_id: 'customer-123',
      status: SalesInvoiceStatus.DRAFT,
      docstatus: 0,
    };

    it('should create a sales invoice successfully', async () => {
      // Mock customer exists
      queryRunner.manager.findOne.mockResolvedValueOnce(mockCustomer);
      
      // Mock items exist
      itemRepository.find.mockResolvedValueOnce([mockItem]);
      
      // Mock no existing invoice with same name
      queryRunner.manager.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);
      
      // Mock save operations
      queryRunner.manager.save.mockResolvedValueOnce(mockSavedInvoice);
      queryRunner.manager.create.mockImplementation((entity, data) => data);
      
      // Mock findOne for return
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockSavedInvoice as any);

      const result = await service.create(createDto, mockTenantId, mockUserId);

      expect(result).toEqual(mockSavedInvoice);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when items do not exist', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce(mockCustomer);
      itemRepository.find.mockResolvedValueOnce([]);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw ConflictException when invoice name already exists', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce(mockCustomer);
      itemRepository.find.mockResolvedValueOnce([mockItem]);
      
      queryRunner.manager.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ name: 'SINV-2024-00001' }),
      } as any);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(ConflictException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockInvoices = [
      {
        id: 'invoice-1',
        name: 'SINV-2024-00001',
        status: SalesInvoiceStatus.DRAFT,
        customer: { name: 'Customer 1' },
        items: [],
      },
      {
        id: 'invoice-2',
        name: 'SINV-2024-00002',
        status: SalesInvoiceStatus.SUBMITTED,
        customer: { name: 'Customer 2' },
        items: [],
      },
    ];

    it('should return paginated invoices with department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockInvoices, 2]),
      };
      
      salesInvoiceRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(mockTenantId, mockUserId, 1, 10);

      expect(result).toEqual({
        data: mockInvoices,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by status when provided', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockInvoices[0]], 1]),
      };
      
      salesInvoiceRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(mockTenantId, mockUserId, 1, 10, SalesInvoiceStatus.DRAFT);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('invoice.status = :status', { status: SalesInvoiceStatus.DRAFT });
      expect(result.total).toBe(1);
    });

    it('should return empty result when user has no department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.findAll(mockTenantId, mockUserId);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    const mockInvoice = {
      id: 'invoice-123',
      name: 'SINV-2024-00001',
      tenant_id: mockTenantId,
      department_id: 'dept-123',
      customer: { name: 'Test Customer' },
      items: [],
    };

    it('should return invoice when found and user has access', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(mockInvoice as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.findOne('invoice-123', mockTenantId, mockUserId);

      expect(result).toEqual(mockInvoice);
      expect(salesInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-123', tenant_id: mockTenantId },
        relations: ['customer', 'items', 'items.item'],
      });
    });

    it('should throw NotFoundException when invoice not found', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user has no department access', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(mockInvoice as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOne('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateSalesInvoiceDto = {
      due_date: '2024-03-15',
      items: [
        {
          item_code: 'ITEM001',
          qty: 15,
          rate: 120,
          uom: 'Nos',
        },
      ],
    };

    const mockInvoice = {
      id: 'invoice-123',
      tenant_id: mockTenantId,
      docstatus: 0,
      currency: 'USD',
      conversion_rate: 1,
      items: [],
    };

    const mockItem = {
      id: 'item-123',
      code: 'ITEM001',
      name: 'Test Item',
      stockUom: 'Nos',
      tenant_id: mockTenantId,
    };

    it('should update invoice successfully', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce(mockInvoice);
      itemRepository.find.mockResolvedValueOnce([mockItem]);
      queryRunner.manager.create.mockImplementation((entity, data) => data);
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockInvoice as any);

      const result = await service.update('invoice-123', updateDto, mockTenantId, mockUserId);

      expect(result).toEqual(mockInvoice);
      expect(queryRunner.manager.delete).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(queryRunner.manager.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when invoice not found', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(service.update('invoice-123', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invoice is not draft', async () => {
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockInvoice, docstatus: 1 });

      await expect(service.update('invoice-123', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const mockInvoice = {
      id: 'invoice-123',
      tenant_id: mockTenantId,
      docstatus: 0,
    };

    it('should remove draft invoice successfully', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(mockInvoice as any);

      await service.remove('invoice-123', mockTenantId);

      expect(salesInvoiceRepository.remove).toHaveBeenCalledWith(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invoice-123', mockTenantId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invoice is not draft', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue({ ...mockInvoice, docstatus: 1 } as any);

      await expect(service.remove('invoice-123', mockTenantId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    const mockInvoice = {
      id: 'invoice-123',
      tenant_id: mockTenantId,
      docstatus: 0,
      grand_total: 1000,
      items: [{ id: 'item-1' }],
    };

    it('should submit draft invoice successfully', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(mockInvoice as any);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockInvoice as any);

      const result = await service.submit('invoice-123', mockTenantId, mockUserId);

      expect(salesInvoiceRepository.update).toHaveBeenCalledWith(
        { id: 'invoice-123', tenant_id: mockTenantId },
        {
          docstatus: 1,
          status: SalesInvoiceStatus.SUBMITTED,
          outstanding_amount: 1000,
          modified_by: mockUserId,
        }
      );
      expect(salesInvoiceItemRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.submit('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invoice is not draft', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue({ ...mockInvoice, docstatus: 1 } as any);

      await expect(service.submit('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when invoice has no items', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue({ ...mockInvoice, items: [] } as any);

      await expect(service.submit('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    const mockInvoice = {
      id: 'invoice-123',
      tenant_id: mockTenantId,
      docstatus: 1,
    };

    it('should cancel submitted invoice successfully', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(mockInvoice as any);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockInvoice as any);

      const result = await service.cancel('invoice-123', mockTenantId, mockUserId);

      expect(salesInvoiceRepository.update).toHaveBeenCalledWith(
        { id: 'invoice-123', tenant_id: mockTenantId },
        {
          docstatus: 2,
          status: SalesInvoiceStatus.CANCELLED,
          modified_by: mockUserId,
        }
      );
      expect(salesInvoiceItemRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when invoice is not submitted', async () => {
      salesInvoiceRepository.findOne.mockResolvedValue({ ...mockInvoice, docstatus: 0 } as any);

      await expect(service.cancel('invoice-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });
});