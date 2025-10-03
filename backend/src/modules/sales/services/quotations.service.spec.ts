import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuotationsService, CreateQuotationDto } from './quotations.service';
import { Quotation } from '../../../entities/quotation.entity';
import { QuotationItem } from '../../../entities/quotation-item.entity';
import { Customer } from '../../../entities/customer.entity';
import { Item } from '../../../entities/item.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let quotationRepository: jest.Mocked<Repository<Quotation>>;
  let quotationItemRepository: jest.Mocked<Repository<QuotationItem>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let itemRepository: jest.Mocked<Repository<Item>>;
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

  const mockItem = {
    id: 'item1',
    code: 'ITEM001',
    name: 'Test Item',
    tenant_id: mockTenantId,
  };

  const mockQuotationItem = {
    id: 'quotation-item1',
    name: 'QTN-2024-00001-1',
    item_code: 'ITEM001',
    item_name: 'Test Item',
    qty: 2,
    rate: 100,
    amount: 200,
    net_amount: 180,
    discount_percentage: 10,
    discount_amount: 20,
    parent: 'QTN-2024-00001',
    tenant_id: mockTenantId,
  };

  const mockQuotation = {
    id: 'quotation1',
    name: 'QTN-2024-00001',
    title: 'Test Customer',
    party_name: 'customer1',
    customer_name: 'Test Customer',
    transaction_date: new Date('2024-01-01'),
    valid_till: new Date('2024-01-31'),
    status: 'Draft',
    docstatus: 0,
    department_id: mockDepartmentId,
    tenant_id: mockTenantId,
    created_by: mockUserId,
    modified_by: mockUserId,
    items: [mockQuotationItem],
    total_qty: 2,
    base_total: 200,
    base_net_total: 180,
    total: 200,
    net_total: 180,
    base_grand_total: 180,
    grand_total: 180,
  };

  const createMockQueryBuilder = () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Quotation>>;

    return mockQueryBuilder;
  };

  beforeEach(async () => {
    const mockQueryBuilder = createMockQueryBuilder();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        {
          provide: getRepositoryToken(Quotation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(QuotationItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Item),
          useValue: {
            findOne: jest.fn(),
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
          useValue: {
            user: mockUser,
          },
        },
      ],
    }).compile();

    service = await module.resolve<QuotationsService>(QuotationsService);
    quotationRepository = module.get(getRepositoryToken(Quotation));
    quotationItemRepository = module.get(getRepositoryToken(QuotationItem));
    customerRepository = module.get(getRepositoryToken(Customer));
    itemRepository = module.get(getRepositoryToken(Item));
    departmentAccessService = module.get(DepartmentAccessService);
    mockRequest = module.get(REQUEST);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateQuotationDto = {
      party_name: 'customer1',
      customer_name: 'Test Customer',
      transaction_date: '2024-01-01',
      valid_till: '2024-01-31',
      department_id: mockDepartmentId,
      items: [
        {
          item_code: 'ITEM001',
          item_name: 'Test Item',
          qty: 2,
          rate: 100,
          discount_percentage: 10,
        },
      ],
    };

    it('should create a quotation successfully', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer as any);
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      quotationRepository.count.mockResolvedValue(0);
      quotationRepository.create.mockReturnValue(mockQuotation as any);
      quotationRepository.save.mockResolvedValue(mockQuotation as any);
      quotationItemRepository.create.mockReturnValue(mockQuotationItem as any);
      quotationItemRepository.save.mockResolvedValue([mockQuotationItem] as any);
      quotationRepository.findOne.mockResolvedValue(mockQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.create(createDto, mockTenantId, mockUserId);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.party_name, tenant_id: mockTenantId },
      });
      expect(itemRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'ITEM001', tenant_id: mockTenantId },
      });
      expect(quotationRepository.create).toHaveBeenCalled();
      expect(quotationRepository.save).toHaveBeenCalled();
      expect(quotationItemRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockQuotation);
    });

    it('should throw NotFoundException when customer not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.party_name, tenant_id: mockTenantId },
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer as any);
      itemRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);

      expect(itemRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'ITEM001', tenant_id: mockTenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated quotations with department access', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      quotationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockQuotation], 1]);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([mockDepartmentId]);

      const result = await service.findAll(mockTenantId, 1, 10);

      expect(quotationRepository.createQueryBuilder).toHaveBeenCalledWith('q');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('q.items', 'items');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('q.tenant_id = :tenant_id', { tenant_id: mockTenantId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('q.department_id IN (:...departmentIds)', {
        departmentIds: [mockDepartmentId],
      });
      expect(result).toEqual({ data: [mockQuotation], total: 1 });
    });

    it('should return all quotations when user can access all departments', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      quotationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockQuotation], 1]);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);

      const result = await service.findAll(mockTenantId, 1, 10);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith('q.department_id IN (:...departmentIds)', expect.any(Object));
      expect(result).toEqual({ data: [mockQuotation], total: 1 });
    });

    it('should return empty result when user has no department access', async () => {
      const mockQueryBuilder = createMockQueryBuilder();
      quotationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.findAll(mockTenantId, 1, 10);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('1 = 0');
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return a quotation by id', async () => {
      quotationRepository.findOne.mockResolvedValue(mockQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.findOne('quotation1', mockTenantId, mockUserId);

      expect(quotationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'quotation1', tenant_id: mockTenantId },
        relations: ['items'],
      });
      expect(result).toEqual(mockQuotation);
    });

    it('should throw NotFoundException when quotation not found', async () => {
      quotationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user cannot access department', async () => {
      quotationRepository.findOne.mockResolvedValue(mockQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOne('quotation1', mockTenantId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      customer_name: 'Updated Customer',
      items: [
        {
          item_code: 'ITEM002',
          item_name: 'Updated Item',
          qty: 3,
          rate: 150,
        },
      ],
    };

    it('should update a quotation successfully', async () => {
      const updatedQuotation = { 
        ...mockQuotation, 
        customer_name: 'Updated Customer',
        items: [{
          ...mockQuotationItem,
          item_code: 'ITEM002',
          item_name: 'Updated Item',
          qty: 3,
          rate: 150,
          amount: 450,
          discount_amount: 0,
          discount_percentage: 0,
          net_amount: 450,
        }],
        total: 450,
        net_total: 450,
        grand_total: 450,
        total_qty: 3,
      };
      
      let callCount = 0;
      quotationRepository.findOne.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(mockQuotation as any);
        } else {
          return Promise.resolve(updatedQuotation as any);
        }
      });
      
      quotationRepository.save.mockResolvedValue(updatedQuotation as any);
      quotationItemRepository.delete.mockResolvedValue({ affected: 1 } as any);
      quotationItemRepository.create.mockReturnValue(mockQuotationItem as any);
      quotationItemRepository.save.mockResolvedValue([mockQuotationItem] as any);
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.update('quotation1', updateDto, mockTenantId, mockUserId);

      expect(quotationRepository.save).toHaveBeenCalled();
      expect(quotationItemRepository.delete).toHaveBeenCalledWith({ parent: mockQuotation.name });
      expect(quotationItemRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedQuotation);
    });

    it('should throw BadRequestException when trying to update submitted quotation', async () => {
      const submittedQuotation = { ...mockQuotation, status: 'Submitted' };
      quotationRepository.findOne.mockResolvedValue(submittedQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(service.update('quotation1', updateDto, mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a quotation successfully', async () => {
      quotationRepository.findOne.mockResolvedValue(mockQuotation as any);
      quotationItemRepository.delete.mockResolvedValue({ affected: 1 } as any);
      quotationRepository.remove.mockResolvedValue(mockQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await service.remove('quotation1', mockTenantId, mockUserId);

      expect(quotationItemRepository.delete).toHaveBeenCalledWith({ parent: mockQuotation.name });
      expect(quotationRepository.remove).toHaveBeenCalledWith(mockQuotation);
    });

    it('should throw BadRequestException when trying to delete submitted quotation', async () => {
      const submittedQuotation = { ...mockQuotation, status: 'Submitted' };
      quotationRepository.findOne.mockResolvedValue(submittedQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(service.remove('quotation1', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    it('should submit a quotation successfully', async () => {
      const submittedQuotation = { ...mockQuotation, status: 'Submitted', docstatus: 1 };
      quotationRepository.findOne.mockResolvedValue(mockQuotation as any);
      quotationRepository.save.mockResolvedValue(submittedQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.submit('quotation1', mockTenantId, mockUserId);

      expect(quotationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Submitted',
          docstatus: 1,
          modified_by: mockUserId,
        })
      );
      expect(result).toEqual(submittedQuotation);
    });

    it('should throw BadRequestException when quotation is already submitted', async () => {
      const submittedQuotation = { ...mockQuotation, status: 'Submitted' };
      quotationRepository.findOne.mockResolvedValue(submittedQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(service.submit('quotation1', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a submitted quotation successfully', async () => {
      const submittedQuotation = { ...mockQuotation, status: 'Submitted' };
      const cancelledQuotation = { ...submittedQuotation, status: 'Cancelled', docstatus: 2 };
      quotationRepository.findOne.mockResolvedValue(submittedQuotation as any);
      quotationRepository.save.mockResolvedValue(cancelledQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.cancel('quotation1', mockTenantId, mockUserId);

      expect(quotationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Cancelled',
          docstatus: 2,
          modified_by: mockUserId,
        })
      );
      expect(result).toEqual(cancelledQuotation);
    });

    it('should throw BadRequestException when trying to cancel draft quotation', async () => {
      const draftQuotation = { ...mockQuotation, status: 'Draft' };
      quotationRepository.findOne.mockResolvedValue(draftQuotation as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(service.cancel('quotation1', mockTenantId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });
});