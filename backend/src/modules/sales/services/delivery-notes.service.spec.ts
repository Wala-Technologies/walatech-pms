import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DeliveryNotesService } from './delivery-notes.service';
import { DeliveryNote, DeliveryNoteStatus } from '../../../entities/delivery-note.entity';
import { DeliveryNoteItem } from '../../../entities/delivery-note-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { CreateDeliveryNoteDto } from '../dto/create-delivery-note.dto';
import { UpdateDeliveryNoteDto } from '../dto/update-delivery-note.dto';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

describe('DeliveryNotesService', () => {
  let service: DeliveryNotesService;
  let deliveryNoteRepository: jest.Mocked<Repository<DeliveryNote>>;
  let deliveryNoteItemRepository: jest.Mocked<Repository<DeliveryNoteItem>>;
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
        DeliveryNotesService,
        {
          provide: getRepositoryToken(DeliveryNote),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DeliveryNoteItem),
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

    service = await module.resolve<DeliveryNotesService>(DeliveryNotesService);
    deliveryNoteRepository = module.get(getRepositoryToken(DeliveryNote));
    deliveryNoteItemRepository = module.get(getRepositoryToken(DeliveryNoteItem));
    customerRepository = module.get(getRepositoryToken(Customer));
    itemRepository = module.get(getRepositoryToken(Item));
    dataSource = module.get(DataSource);
    departmentAccessService = module.get(DepartmentAccessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateDeliveryNoteDto = {
      customer: 'customer-123',
      posting_date: '2024-01-15',
      items: [
        {
          item_code: 'ITEM001',
          qty: 10,
          rate: 100,
          uom: 'Nos',
          conversion_factor: 1,
        },
      ],
    };

    const mockCustomer = {
      id: 'customer-123',
      customer_name: 'Test Customer',
      tenant_id: mockTenantId,
    };

    const mockItem = {
      id: 'item-123',
      code: 'ITEM001',
      name: 'Test Item',
      tenant_id: mockTenantId,
    };

    const mockSavedDeliveryNote = {
      id: 'dn-123',
      name: 'DN-2024-00001',
      tenant_id: mockTenantId,
      customer_id: 'customer-123',
      status: 'Draft',
      docstatus: 0,
    };

    it('should create a delivery note successfully', async () => {
      // Mock customer exists
      customerRepository.findOne.mockResolvedValueOnce(mockCustomer as any);
      
      // Mock items exist
      itemRepository.findOne.mockResolvedValueOnce(mockItem as any);
      
      // Mock delivery note name generation
      queryRunner.manager.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);
      
      // Mock save operations
      deliveryNoteRepository.create.mockReturnValue(mockSavedDeliveryNote as any);
      queryRunner.manager.save.mockResolvedValueOnce(mockSavedDeliveryNote);
      deliveryNoteItemRepository.create.mockImplementation((data) => data as any);
      
      // Mock findOne for return
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockSavedDeliveryNote as any);

      const result = await service.create(createDto, mockTenantId, mockUserId);

      expect(result).toEqual(mockSavedDeliveryNote);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      customerRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when item does not exist', async () => {
      customerRepository.findOne.mockResolvedValueOnce(mockCustomer as any);
      itemRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
      
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockDeliveryNotes = [
      {
        id: 'dn-1',
        name: 'DN-2024-00001',
        status: 'Draft',
        customer_rel: { customer_name: 'Customer 1' },
        items: [],
      },
      {
        id: 'dn-2',
        name: 'DN-2024-00002',
        status: 'Submitted',
        customer_rel: { customer_name: 'Customer 2' },
        items: [],
      },
    ];

    it('should return paginated delivery notes with department access', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockDeliveryNotes, 2]),
      };
      
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(mockTenantId, mockUserId, 1, 10);

      expect(result).toEqual({
        data: mockDeliveryNotes,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by search when provided', async () => {
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);
      
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDeliveryNotes[0]], 1]),
      };
      
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll(mockTenantId, mockUserId, 1, 10, 'DN-2024');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(dn.name LIKE :search OR dn.customer_name LIKE :search OR customer.customer_name LIKE :search)',
        { search: '%DN-2024%' }
      );
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
    const mockDeliveryNote = {
      id: 'dn-123',
      name: 'DN-2024-00001',
      tenant_id: mockTenantId,
      department_id: 'dept-123',
      customer_rel: { customer_name: 'Test Customer' },
      items: [],
    };

    it('should return delivery note when found and user has access', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue(mockDeliveryNote as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.findOne('dn-123', mockTenantId, mockUserId);

      expect(result).toEqual(mockDeliveryNote);
      expect(deliveryNoteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dn-123', tenant_id: mockTenantId },
        relations: ['items', 'customer_rel', 'tenant'],
      });
    });

    it('should throw NotFoundException when delivery note not found', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user has no department access', async () => {
      deliveryNoteRepository.findOne.mockResolvedValue(mockDeliveryNote as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOne('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateDeliveryNoteDto = {
      customer: 'customer-456',
      items: [
        {
          item_code: 'ITEM001',
          qty: 15,
          rate: 120,
          uom: 'Nos',
        },
      ],
    };

    const mockDeliveryNote = {
      id: 'dn-123',
      name: 'DN-2024-00001',
      tenant_id: mockTenantId,
      docstatus: 0,
      conversion_rate: 1,
      items: [],
    };

    const mockCustomer = {
      id: 'customer-456',
      customer_name: 'Updated Customer',
      tenant_id: mockTenantId,
    };

    const mockItem = {
      id: 'item-123',
      code: 'ITEM001',
      name: 'Test Item',
      tenant_id: mockTenantId,
    };

    it('should update delivery note successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDeliveryNote as any);
      customerRepository.findOne.mockResolvedValueOnce(mockCustomer as any);
      itemRepository.findOne.mockResolvedValueOnce(mockItem as any);
      deliveryNoteItemRepository.create.mockImplementation((data) => data as any);
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDeliveryNote as any);

      const result = await service.update('dn-123', updateDto, mockTenantId, mockUserId);

      expect(result).toEqual(mockDeliveryNote);
      expect(queryRunner.manager.delete).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(queryRunner.manager.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException when delivery note is submitted', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, docstatus: 1 } as any);

      await expect(service.update('dn-123', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when delivery note is cancelled', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, docstatus: 2 } as any);

      await expect(service.update('dn-123', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDeliveryNote as any);
      customerRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.update('dn-123', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const mockDeliveryNote = {
      id: 'dn-123',
      tenant_id: mockTenantId,
      docstatus: 0,
    };

    it('should remove draft delivery note successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockDeliveryNote as any);

      await service.remove('dn-123', mockTenantId, mockUserId);

      expect(deliveryNoteRepository.delete).toHaveBeenCalledWith({ id: 'dn-123', tenant_id: mockTenantId });
    });

    it('should throw BadRequestException when delivery note is submitted', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, docstatus: 1 } as any);

      await expect(service.remove('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    const mockDeliveryNote = {
      id: 'dn-123',
      tenant_id: mockTenantId,
      docstatus: 0,
      items: [{ id: 'item-1' }],
    };

    it('should submit draft delivery note successfully', async () => {
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockDeliveryNote as any)
        .mockResolvedValueOnce(mockDeliveryNote as any);

      const result = await service.submit('dn-123', mockTenantId, mockUserId);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        DeliveryNote,
        { id: 'dn-123', tenant_id: mockTenantId },
        expect.objectContaining({
          docstatus: 1,
          status: DeliveryNoteStatus.TO_BILL,
          modified_by: mockUserId,
        })
      );
      expect(result).toEqual(mockDeliveryNote);
    });

    it('should throw BadRequestException when delivery note is not draft', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, docstatus: 1 } as any);

      await expect(service.submit('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when delivery note has no items', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, items: [] } as any);

      await expect(service.submit('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    const mockDeliveryNote = {
      id: 'dn-123',
      tenant_id: mockTenantId,
      docstatus: 1,
      per_billed: 0,
    };

    it('should cancel submitted delivery note successfully', async () => {
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockDeliveryNote as any)
        .mockResolvedValueOnce(mockDeliveryNote as any);

      const result = await service.cancel('dn-123', mockTenantId, mockUserId);

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        DeliveryNote,
        { id: 'dn-123', tenant_id: mockTenantId },
        expect.objectContaining({
          docstatus: 2,
          status: DeliveryNoteStatus.CANCELLED,
          modified_by: mockUserId,
        })
      );
      expect(result).toEqual(mockDeliveryNote);
    });

    it('should throw BadRequestException when delivery note is not submitted', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, docstatus: 0 } as any);

      await expect(service.cancel('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when delivery note has been billed', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockDeliveryNote, per_billed: 50 } as any);

      await expect(service.cancel('dn-123', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getDeliveryNoteSummary', () => {
    const mockSummary = [
      { status: 'Draft', count: '5', total_amount: '10000' },
      { status: 'Submitted', count: '3', total_amount: '7500' },
    ];

    it('should return delivery note summary', async () => {
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockSummary),
      };
      
      deliveryNoteRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
      deliveryNoteRepository.count.mockResolvedValue(8);

      const result = await service.getDeliveryNoteSummary(mockTenantId);

      expect(result).toEqual({
        total_delivery_notes: 8,
        by_status: mockSummary,
      });
    });
  });
});