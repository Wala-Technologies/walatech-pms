import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;

  const mockSuppliersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSupplierStats: jest.fn(),
    getSuppliersByType: jest.fn(),
    getSuppliersByCountry: jest.fn(),
    getSuppliersByGroup: jest.fn(),
    getSuppliersByGstCategory: jest.fn(),
    toggleSupplierStatus: jest.fn(),
    updateHoldStatus: jest.fn(),
    bulkUpdateSuppliers: jest.fn(),
    searchSuppliers: jest.fn(),
    validateSupplierForRFQ: jest.fn(),
    validateSupplierForPO: jest.fn(),
    getSupplierPaymentTerms: jest.fn(),
    getSupplierPriceList: jest.fn(),
    getEffectivePaymentTerms: jest.fn(),
    getEffectivePriceList: jest.fn(),
    validateRfqCreation: jest.fn(),
    validatePurchaseOrderCreation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createSupplierDto: CreateSupplierDto = {
      supplier_name: 'Test Supplier',
      supplier_code: 'SUP001',
      supplier_type: 'Company',
      email: 'supplier@test.com',
      supplier_group: 1,
      department_id: 1,
    };

    it('should create a supplier successfully', async () => {
      const expectedSupplier = {
        id: 1,
        ...createSupplierDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
      };

      mockSuppliersService.create.mockResolvedValue(expectedSupplier);

      const result = await controller.create(createSupplierDto);

      expect(service.create).toHaveBeenCalledWith(createSupplierDto);
      expect(result).toEqual(expectedSupplier);
    });

    it('should handle ConflictException when supplier name already exists', async () => {
      mockSuppliersService.create.mockRejectedValue(new ConflictException('Supplier name already exists'));

      await expect(controller.create(createSupplierDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createSupplierDto);
    });

    it('should handle NotFoundException when supplier group not found', async () => {
      mockSuppliersService.create.mockRejectedValue(new NotFoundException('Supplier group not found'));

      await expect(controller.create(createSupplierDto)).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(createSupplierDto);
    });
  });

  describe('findAll', () => {
    const queryDto: SupplierQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      sort_by: 'supplier_name',
      sort_order: 'ASC',
    };

    it('should return paginated suppliers', async () => {
      const expectedResult = {
        suppliers: [
          { id: 1, supplier_name: 'Test Supplier 1' },
          { id: 2, supplier_name: 'Test Supplier 2' },
        ],
        total: 2,
      };

      mockSuppliersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const emptyQuery = {};
      const expectedResult = { suppliers: [], total: 0 };

      mockSuppliersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(emptyQuery);

      expect(service.findAll).toHaveBeenCalledWith(emptyQuery);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSupplierStats', () => {
    it('should return supplier statistics', async () => {
      const expectedStats = {
        total: 100,
        active: 80,
        disabled: 15,
        onHold: 5,
        byType: { Company: 60, Individual: 40 },
        byCountry: { USA: 50, Canada: 30 },
        byGstCategory: { Registered: 70, Unregistered: 30 },
        bySupplierGroup: { 'Group A': 40, 'Group B': 60 },
      };

      mockSuppliersService.getSupplierStats.mockResolvedValue(expectedStats);

      const result = await controller.getSupplierStats();

      expect(service.getSupplierStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('searchSuppliers', () => {
    it('should search suppliers successfully', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Test Supplier', email: 'test@example.com' },
      ];

      mockSuppliersService.searchSuppliers.mockResolvedValue(expectedSuppliers);

      const result = await controller.searchSuppliers('test', 10);

      expect(service.searchSuppliers).toHaveBeenCalledWith('test', 10);
      expect(result).toEqual(expectedSuppliers);
    });

    it('should handle search with default limit', async () => {
      const expectedSuppliers = [];

      mockSuppliersService.searchSuppliers.mockResolvedValue(expectedSuppliers);

      const result = await controller.searchSuppliers('test');

      expect(service.searchSuppliers).toHaveBeenCalledWith('test', undefined);
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByType', () => {
    it('should return suppliers by type', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', supplier_type: 'Company' },
        { id: 2, supplier_name: 'Supplier 2', supplier_type: 'Company' },
      ];

      mockSuppliersService.getSuppliersByType.mockResolvedValue(expectedSuppliers);

      const result = await controller.getSuppliersByType('Company');

      expect(service.getSuppliersByType).toHaveBeenCalledWith('Company');
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByCountry', () => {
    it('should return suppliers by country', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', country: 'USA' },
        { id: 2, supplier_name: 'Supplier 2', country: 'USA' },
      ];

      mockSuppliersService.getSuppliersByCountry.mockResolvedValue(expectedSuppliers);

      const result = await controller.getSuppliersByCountry('USA');

      expect(service.getSuppliersByCountry).toHaveBeenCalledWith('USA');
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByGroup', () => {
    it('should return suppliers by group', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', supplier_group: '1' },
        { id: 2, supplier_name: 'Supplier 2', supplier_group: '1' },
      ];

      mockSuppliersService.getSuppliersByGroup.mockResolvedValue(expectedSuppliers);

      const result = await controller.getSuppliersByGroup('1');

      expect(service.getSuppliersByGroup).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('getSuppliersByGstCategory', () => {
    it('should return suppliers by GST category', async () => {
      const expectedSuppliers = [
        { id: 1, supplier_name: 'Supplier 1', gst_category: 'Registered' },
        { id: 2, supplier_name: 'Supplier 2', gst_category: 'Registered' },
      ];

      mockSuppliersService.getSuppliersByGstCategory.mockResolvedValue(expectedSuppliers);

      const result = await controller.getSuppliersByGstCategory('Registered');

      expect(service.getSuppliersByGstCategory).toHaveBeenCalledWith('Registered');
      expect(result).toEqual(expectedSuppliers);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const expectedSupplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        email: 'test@example.com',
      };

      mockSuppliersService.findOne.mockResolvedValue(expectedSupplier);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedSupplier);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.findOne.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('getPaymentTerms', () => {
    it('should return supplier payment terms', async () => {
      const expectedTerms = 'Net 30';

      mockSuppliersService.getSupplierPaymentTerms.mockResolvedValue(expectedTerms);

      const result = await controller.getPaymentTerms('1');

      expect(service.getSupplierPaymentTerms).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedTerms);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.getSupplierPaymentTerms.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.getPaymentTerms('999')).rejects.toThrow(NotFoundException);
      expect(service.getSupplierPaymentTerms).toHaveBeenCalledWith('999');
    });
  });

  describe('getPriceList', () => {
    it('should return supplier price list', async () => {
      const expectedPriceList = 'Standard Buying';

      mockSuppliersService.getSupplierPriceList.mockResolvedValue(expectedPriceList);

      const result = await controller.getPriceList('1');

      expect(service.getSupplierPriceList).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedPriceList);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.getSupplierPriceList.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.getPriceList('999')).rejects.toThrow(NotFoundException);
      expect(service.getSupplierPriceList).toHaveBeenCalledWith('999');
    });
  });

  describe('validateRfq', () => {
    it('should validate supplier for RFQ successfully', async () => {
      const expectedValidation = {
        canProceed: true,
        warnings: [],
      };

      mockSuppliersService.validateSupplierForRFQ.mockResolvedValue(expectedValidation);

      const result = await controller.validateRfq('1');

      expect(service.validateSupplierForRFQ).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedValidation);
    });

    it('should return validation warnings', async () => {
      const expectedValidation = {
        canProceed: false,
        warnings: ['Supplier is disabled', 'Supplier is on hold: All'],
      };

      mockSuppliersService.validateSupplierForRFQ.mockResolvedValue(expectedValidation);

      const result = await controller.validateRfq('1');

      expect(service.validateSupplierForRFQ).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedValidation);
    });
  });

  describe('validatePo', () => {
    it('should validate supplier for PO successfully', async () => {
      const expectedValidation = {
        canProceed: true,
        warnings: [],
      };

      mockSuppliersService.validateSupplierForPO.mockResolvedValue(expectedValidation);

      const result = await controller.validatePo('1');

      expect(service.validateSupplierForPO).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedValidation);
    });

    it('should return validation warnings', async () => {
      const expectedValidation = {
        canProceed: false,
        warnings: ['Purchase Orders are prevented for this supplier', 'Supplier is on hold: Payments'],
      };

      mockSuppliersService.validateSupplierForPO.mockResolvedValue(expectedValidation);

      const result = await controller.validatePo('1');

      expect(service.validateSupplierForPO).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedValidation);
    });
  });

  describe('update', () => {
    const updateSupplierDto: UpdateSupplierDto = {
      supplier_name: 'Updated Supplier',
      email: 'updated@test.com',
    };

    it('should update a supplier successfully', async () => {
      const expectedSupplier = {
        id: '1',
        ...updateSupplierDto,
        modified_by: 'test@example.com',
      };

      mockSuppliersService.update.mockResolvedValue(expectedSupplier);

      const result = await controller.update('1', updateSupplierDto);

      expect(service.update).toHaveBeenCalledWith('1', updateSupplierDto);
      expect(result).toEqual(expectedSupplier);
    });

    it('should handle ConflictException when updated name already exists', async () => {
      mockSuppliersService.update.mockRejectedValue(new ConflictException('Supplier name already exists'));

      await expect(controller.update('1', updateSupplierDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateSupplierDto);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.update.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.update('999', updateSupplierDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateSupplierDto);
    });
  });

  describe('remove', () => {
    it('should remove a supplier successfully', async () => {
      mockSuppliersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.remove.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999');
    });
  });

  describe('toggleSupplierStatus', () => {
    it('should toggle supplier status successfully', async () => {
      const expectedSupplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        disabled: true,
        modified_by: 'test@example.com',
      };

      mockSuppliersService.toggleSupplierStatus.mockResolvedValue(expectedSupplier);

      const result = await controller.toggleSupplierStatus('1');

      expect(service.toggleSupplierStatus).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedSupplier);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.toggleSupplierStatus.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.toggleSupplierStatus('999')).rejects.toThrow(NotFoundException);
      expect(service.toggleSupplierStatus).toHaveBeenCalledWith('999');
    });
  });

  describe('updateHoldStatus', () => {
    const holdStatusDto = {
      hold_type: 'All',
      release_date: '2024-12-31',
    };

    it('should update hold status successfully', async () => {
      const expectedSupplier = {
        id: '1',
        supplier_name: 'Test Supplier',
        hold_type: 'All',
        release_date: new Date('2024-12-31'),
        modified_by: 'test@example.com',
      };

      mockSuppliersService.updateHoldStatus.mockResolvedValue(expectedSupplier);

      const result = await controller.updateHoldStatus('1', holdStatusDto);

      expect(service.updateHoldStatus).toHaveBeenCalledWith('1', 'All', '2024-12-31');
      expect(result).toEqual(expectedSupplier);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSuppliersService.updateHoldStatus.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.updateHoldStatus('999', holdStatusDto)).rejects.toThrow(NotFoundException);
      expect(service.updateHoldStatus).toHaveBeenCalledWith('999', 'All', '2024-12-31');
    });
  });

  describe('bulkUpdateSuppliers', () => {
    const bulkUpdateDto = {
      supplier_ids: ['1', '2', '3'],
      update_data: { disabled: true },
    };

    it('should bulk update suppliers successfully', async () => {
      mockSuppliersService.bulkUpdateSuppliers.mockResolvedValue(undefined);

      await controller.bulkUpdateSuppliers(bulkUpdateDto);

      expect(service.bulkUpdateSuppliers).toHaveBeenCalledWith(['1', '2', '3'], { disabled: true });
    });

    it('should handle ConflictException when no supplier IDs provided', async () => {
      const emptyBulkUpdateDto = {
        supplier_ids: [],
        update_data: { disabled: true },
      };

      mockSuppliersService.bulkUpdateSuppliers.mockRejectedValue(new ConflictException('No supplier IDs provided'));

      await expect(controller.bulkUpdateSuppliers(emptyBulkUpdateDto)).rejects.toThrow(ConflictException);
      expect(service.bulkUpdateSuppliers).toHaveBeenCalledWith([], { disabled: true });
    });
  });
});