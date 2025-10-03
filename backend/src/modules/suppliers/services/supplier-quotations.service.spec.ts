import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SupplierQuotationsService } from './supplier-quotations.service';
import { SupplierQuotation } from '../../../entities/supplier-quotation.entity';
import { SupplierQuotationItem } from '../../../entities/supplier-quotation.entity';
import { Supplier } from '../../../entities/supplier.entity';
import { CreateSupplierQuotationDto } from '../dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from '../dto/update-supplier-quotation.dto';

describe('SupplierQuotationsService', () => {
  let service: SupplierQuotationsService;
  let quotationRepository: Repository<SupplierQuotation>;
  let quotationItemRepository: Repository<SupplierQuotationItem>;
  let supplierRepository: Repository<Supplier>;
  let mockRequest: any;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getOne: jest.fn(),
  };

  const mockQuotationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockQuotationItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockSupplierRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    mockRequest = {
      tenant_id: 'test-tenant',
      user: { email: 'test@example.com' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierQuotationsService,
        {
          provide: getRepositoryToken(SupplierQuotation),
          useValue: mockQuotationRepository,
        },
        {
          provide: getRepositoryToken(SupplierQuotationItem),
          useValue: mockQuotationItemRepository,
        },
        {
          provide: getRepositoryToken(Supplier),
          useValue: mockSupplierRepository,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<SupplierQuotationsService>(SupplierQuotationsService);
    quotationRepository = module.get<Repository<SupplierQuotation>>(getRepositoryToken(SupplierQuotation));
    quotationItemRepository = module.get<Repository<SupplierQuotationItem>>(getRepositoryToken(SupplierQuotationItem));
    supplierRepository = module.get<Repository<Supplier>>(getRepositoryToken(Supplier));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createQuotationDto: CreateSupplierQuotationDto = {
      supplier_id: 'supplier-1',
      quotation_number: 'SQ-2024-0001',
      quotation_date: new Date(),
      valid_till: new Date(),
      currency: 'USD',
      items: [
        {
          item_code: 'ITEM001',
          item_name: 'Test Item',
          qty: 10,
          rate: 100,
          discount_percentage: 5,
        },
      ],
    };

    const mockSupplier = {
      id: 'supplier-1',
      supplier_name: 'Test Supplier',
      tenant_id: 'test-tenant',
    };

    const mockQuotation = {
      id: 'quotation-1',
      ...createQuotationDto,
      tenant_id: 'test-tenant',
      owner: 'test@example.com',
    };

    it('should create a quotation successfully', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockQuotationRepository.findOne.mockResolvedValue(null);
      mockQuotationRepository.create.mockReturnValue(mockQuotation);
      mockQuotationRepository.save.mockResolvedValue(mockQuotation);
      mockQuotationItemRepository.create.mockReturnValue({});
      mockQuotationItemRepository.save.mockResolvedValue([]);
      mockQuotationItemRepository.find.mockResolvedValue([]);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);

      const result = await service.create(createQuotationDto);

      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-1', tenant_id: 'test-tenant' },
      });
      expect(quotationRepository.create).toHaveBeenCalled();
      expect(quotationRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockQuotation);
    });

    it('should throw NotFoundException when supplier not found', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createQuotationDto)).rejects.toThrow(NotFoundException);
      expect(supplierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'supplier-1', tenant_id: 'test-tenant' },
      });
    });

    it('should throw ConflictException when quotation number already exists', async () => {
      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockQuotationRepository.findOne.mockResolvedValue({ id: 'existing-quotation' });

      await expect(service.create(createQuotationDto)).rejects.toThrow(ConflictException);
    });

    it('should generate quotation number when not provided', async () => {
      const createDtoWithoutNumber = { ...createQuotationDto };
      delete createDtoWithoutNumber.quotation_number;

      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockQuotationRepository.create.mockReturnValue(mockQuotation);
      mockQuotationRepository.save.mockResolvedValue(mockQuotation);
      mockQuotationItemRepository.create.mockReturnValue({});
      mockQuotationItemRepository.save.mockResolvedValue([]);
      mockQuotationItemRepository.find.mockResolvedValue([]);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);

      await service.create(createDtoWithoutNumber);

      expect(quotationRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockQuotations = [
      { id: '1', quotation_number: 'SQ-2024-0001' },
      { id: '2', quotation_number: 'SQ-2024-0002' },
    ];

    it('should return paginated quotations', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockQuotations, 2]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(quotationRepository.createQueryBuilder).toHaveBeenCalledWith('quotation');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('quotation.supplier', 'supplier');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('quotation.items', 'items');
      expect(result).toEqual({ quotations: mockQuotations, total: 2 });
    });

    it('should apply search filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockQuotations, 2]);

      await service.findAll({ search: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(quotation.quotation_number LIKE :search OR supplier.supplier_name LIKE :search)',
        { search: '%test%' }
      );
    });

    it('should apply status filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockQuotations, 2]);

      await service.findAll({ status: 'Draft' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('quotation.status = :status', { status: 'Draft' });
    });

    it('should apply supplier filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockQuotations, 2]);

      await service.findAll({ supplier_id: 'supplier-1' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('quotation.supplier_id = :supplier_id', { supplier_id: 'supplier-1' });
    });
  });

  describe('findOne', () => {
    const mockQuotation = {
      id: 'quotation-1',
      quotation_number: 'SQ-2024-0001',
      supplier: { id: 'supplier-1', supplier_name: 'Test Supplier' },
      items: [],
    };

    it('should return a quotation by id', async () => {
      mockQuotationRepository.findOne.mockResolvedValue(mockQuotation);

      const result = await service.findOne('quotation-1');

      expect(quotationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'quotation-1', tenant_id: 'test-tenant' },
        relations: ['supplier', 'items'],
      });
      expect(result).toEqual(mockQuotation);
    });

    it('should throw NotFoundException when quotation not found', async () => {
      mockQuotationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateQuotationDto: UpdateSupplierQuotationDto = {
      quotation_number: 'SQ-2024-0002',
      items: [
        {
          item_code: 'ITEM002',
          item_name: 'Updated Item',
          qty: 5,
          rate: 200,
        },
      ],
    };

    const mockQuotation = {
      id: 'quotation-1',
      status: 'Draft',
      supplier_id: 'supplier-1',
      quotation_number: 'SQ-2024-0001',
    };

    it('should update a quotation successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockQuotation as any);
      mockQuotationRepository.findOne.mockResolvedValue(null);
      mockQuotationItemRepository.delete.mockResolvedValue({});
      mockQuotationItemRepository.create.mockReturnValue({});
      mockQuotationItemRepository.save.mockResolvedValue([]);
      mockQuotationItemRepository.find.mockResolvedValue([]);
      mockQuotationRepository.save.mockResolvedValue(mockQuotation);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({ ...mockQuotation, ...updateQuotationDto } as any);

      const result = await service.update('quotation-1', updateQuotationDto);

      expect(quotationItemRepository.delete).toHaveBeenCalledWith({
        quotation_id: 'quotation-1',
        tenant_id: 'test-tenant',
      });
      expect(quotationRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException when quotation status is Ordered', async () => {
      const orderedQuotation = { ...mockQuotation, status: 'Ordered' };
      jest.spyOn(service, 'findOne').mockResolvedValue(orderedQuotation as any);

      await expect(service.update('quotation-1', updateQuotationDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when quotation status is Cancelled', async () => {
      const cancelledQuotation = { ...mockQuotation, status: 'Cancelled' };
      jest.spyOn(service, 'findOne').mockResolvedValue(cancelledQuotation as any);

      await expect(service.update('quotation-1', updateQuotationDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when quotation number already exists', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);
      mockQuotationRepository.findOne.mockResolvedValue({ id: 'other-quotation' });

      await expect(service.update('quotation-1', updateQuotationDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    const mockQuotation = {
      id: 'quotation-1',
      status: 'Draft',
    };

    it('should remove a quotation successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);
      mockQuotationItemRepository.delete.mockResolvedValue({});
      mockQuotationRepository.remove.mockResolvedValue({});

      await service.remove('quotation-1');

      expect(quotationItemRepository.delete).toHaveBeenCalledWith({
        quotation_id: 'quotation-1',
        tenant_id: 'test-tenant',
      });
      expect(quotationRepository.remove).toHaveBeenCalledWith(mockQuotation);
    });

    it('should throw ConflictException when quotation status is Ordered', async () => {
      const orderedQuotation = { ...mockQuotation, status: 'Ordered' };
      jest.spyOn(service, 'findOne').mockResolvedValue(orderedQuotation as any);

      await expect(service.remove('quotation-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    const mockQuotation = {
      id: 'quotation-1',
      status: 'Draft',
    };

    it('should update status successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);
      mockQuotationRepository.save.mockResolvedValue({ ...mockQuotation, status: 'Submitted' });

      const result = await service.updateStatus('quotation-1', 'Submitted');

      expect(quotationRepository.save).toHaveBeenCalled();
      expect(result.status).toBe('Submitted');
    });

    it('should throw ConflictException for invalid status transition', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockQuotation as any);

      await expect(service.updateStatus('quotation-1', 'Ordered')).rejects.toThrow(ConflictException);
    });

    it('should not allow status change from Ordered', async () => {
      const orderedQuotation = { ...mockQuotation, status: 'Ordered' };
      jest.spyOn(service, 'findOne').mockResolvedValue(orderedQuotation as any);

      await expect(service.updateStatus('quotation-1', 'Cancelled')).rejects.toThrow(ConflictException);
    });
  });

  describe('getQuotationStats', () => {
    it('should return quotation statistics', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(10);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: 'Draft', count: '5' },
          { status: 'Submitted', count: '3' },
          { status: 'Ordered', count: '2' },
        ])
        .mockResolvedValueOnce([
          { supplier_name: 'Supplier A', count: '6' },
          { supplier_name: 'Supplier B', count: '4' },
        ]);
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total_value: '50000.00',
        average_value: '5000.00',
      });

      const result = await service.getQuotationStats();

      expect(result).toEqual({
        total: 10,
        byStatus: {
          Draft: 5,
          Submitted: 3,
          Ordered: 2,
        },
        bySupplier: {
          'Supplier A': 6,
          'Supplier B': 4,
        },
        totalValue: 50000,
        averageValue: 5000,
      });
    });

    it('should handle empty statistics', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockQueryBuilder.getRawOne.mockResolvedValue({
        total_value: null,
        average_value: null,
      });

      const result = await service.getQuotationStats();

      expect(result).toEqual({
        total: 0,
        byStatus: {},
        bySupplier: {},
        totalValue: 0,
        averageValue: 0,
      });
    });
  });

  describe('compareQuotations', () => {
    const mockQuotations = [
      {
        id: 'quotation-1',
        quotation_number: 'SQ-2024-0001',
        supplier: { id: 'supplier-1', supplier_name: 'Supplier A' },
        grand_total: 1000,
        currency: 'USD',
        valid_till: new Date(),
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item',
            qty: 10,
            rate: 100,
            amount: 1000,
            discount_percentage: 0,
            net_amount: 1000,
          },
        ],
      },
      {
        id: 'quotation-2',
        quotation_number: 'SQ-2024-0002',
        supplier: { id: 'supplier-2', supplier_name: 'Supplier B' },
        grand_total: 950,
        currency: 'USD',
        valid_till: new Date(),
        items: [
          {
            item_code: 'ITEM001',
            item_name: 'Test Item',
            qty: 10,
            rate: 95,
            amount: 950,
            discount_percentage: 0,
            net_amount: 950,
          },
        ],
      },
    ];

    it('should compare quotations successfully', async () => {
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockQuotations[0] as any)
        .mockResolvedValueOnce(mockQuotations[1] as any);

      const result = await service.compareQuotations(['quotation-1', 'quotation-2']);

      expect(result.quotations).toHaveLength(2);
      expect(result.comparison.suppliers).toHaveLength(2);
      expect(result.comparison.items).toHaveLength(1);
      expect(result.comparison.items[0].item_code).toBe('ITEM001');
      expect(result.comparison.items[0].suppliers['Supplier A']).toBeDefined();
      expect(result.comparison.items[0].suppliers['Supplier B']).toBeDefined();
    });

    it('should throw ConflictException when less than 2 quotations provided', async () => {
      await expect(service.compareQuotations(['quotation-1'])).rejects.toThrow(ConflictException);
    });
  });
});