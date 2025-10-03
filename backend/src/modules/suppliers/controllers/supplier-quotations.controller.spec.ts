import { Test, TestingModule } from '@nestjs/testing';
import { SupplierQuotationsController } from './supplier-quotations.controller';
import { SupplierQuotationsService } from '../services/supplier-quotations.service';
import { CreateSupplierQuotationDto } from '../dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from '../dto/update-supplier-quotation.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SupplierQuotationsController', () => {
  let controller: SupplierQuotationsController;
  let service: SupplierQuotationsService;

  const mockSupplierQuotationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    getQuotationStats: jest.fn(),
    compareQuotations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierQuotationsController],
      providers: [
        {
          provide: SupplierQuotationsService,
          useValue: mockSupplierQuotationsService,
        },
      ],
    }).compile();

    controller = module.get<SupplierQuotationsController>(SupplierQuotationsController);
    service = module.get<SupplierQuotationsService>(SupplierQuotationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
        },
      ],
    };

    it('should create a quotation successfully', async () => {
      const expectedQuotation = {
        id: '1',
        ...createQuotationDto,
        tenant_id: 'test-tenant',
        owner: 'test@example.com',
      };

      mockSupplierQuotationsService.create.mockResolvedValue(expectedQuotation);

      const result = await controller.create(createQuotationDto);

      expect(service.create).toHaveBeenCalledWith(createQuotationDto);
      expect(result).toEqual(expectedQuotation);
    });

    it('should handle ConflictException when quotation number already exists', async () => {
      mockSupplierQuotationsService.create.mockRejectedValue(new ConflictException('Quotation number already exists'));

      await expect(controller.create(createQuotationDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createQuotationDto);
    });

    it('should handle NotFoundException when supplier not found', async () => {
      mockSupplierQuotationsService.create.mockRejectedValue(new NotFoundException('Supplier not found'));

      await expect(controller.create(createQuotationDto)).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(createQuotationDto);
    });
  });

  describe('findAll', () => {
    it('should return all quotations with pagination', async () => {
      const expectedQuotations = [
        { id: '1', quotation_number: 'SQ-2024-0001' },
        { id: '2', quotation_number: 'SQ-2024-0002' },
      ];

      const expectedResult = {
        quotations: expectedQuotations,
        total: 2,
      };

      mockSupplierQuotationsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(expectedResult);
    });

    it('should handle search and filter parameters', async () => {
      const query = {
        search: 'test',
        status: 'Draft',
        supplier_id: 'supplier-1',
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        quotations: [],
        total: 0,
      };

      mockSupplierQuotationsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getQuotationStats', () => {
    it('should return quotation statistics', async () => {
      const expectedStats = {
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
      };

      mockSupplierQuotationsService.getQuotationStats.mockResolvedValue(expectedStats);

      const result = await controller.getQuotationStats();

      expect(service.getQuotationStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });

    it('should handle empty statistics', async () => {
      const expectedStats = {
        total: 0,
        byStatus: {},
        bySupplier: {},
        totalValue: 0,
        averageValue: 0,
      };

      mockSupplierQuotationsService.getQuotationStats.mockResolvedValue(expectedStats);

      const result = await controller.getQuotationStats();

      expect(service.getQuotationStats).toHaveBeenCalled();
      expect(result).toEqual(expectedStats);
    });
  });

  describe('compareQuotations', () => {
    it('should compare quotations successfully', async () => {
      const quotationIds = ['quotation-1', 'quotation-2'];
      const expectedResult = {
        quotations: [
          {
            id: 'quotation-1',
            quotation_number: 'SQ-2024-0001',
            supplier: { id: 'supplier-1', supplier_name: 'Supplier A' },
            grand_total: 1000,
          },
          {
            id: 'quotation-2',
            quotation_number: 'SQ-2024-0002',
            supplier: { id: 'supplier-2', supplier_name: 'Supplier B' },
            grand_total: 950,
          },
        ],
        comparison: {
          suppliers: [
            {
              id: 'supplier-1',
              name: 'Supplier A',
              quotation_id: 'quotation-1',
              quotation_number: 'SQ-2024-0001',
              total: 1000,
            },
            {
              id: 'supplier-2',
              name: 'Supplier B',
              quotation_id: 'quotation-2',
              quotation_number: 'SQ-2024-0002',
              total: 950,
            },
          ],
          items: [
            {
              item_code: 'ITEM001',
              item_name: 'Test Item',
              suppliers: {
                'Supplier A': { qty: 10, rate: 100, amount: 1000 },
                'Supplier B': { qty: 10, rate: 95, amount: 950 },
              },
            },
          ],
        },
      };

      mockSupplierQuotationsService.compareQuotations.mockResolvedValue(expectedResult);

      const result = await controller.compareQuotations(quotationIds);

      expect(service.compareQuotations).toHaveBeenCalledWith(quotationIds);
      expect(result).toEqual(expectedResult);
    });

    it('should handle ConflictException when less than 2 quotations provided', async () => {
      const quotationIds = ['quotation-1'];

      mockSupplierQuotationsService.compareQuotations.mockRejectedValue(
        new ConflictException('At least 2 quotations are required for comparison')
      );

      await expect(controller.compareQuotations(quotationIds)).rejects.toThrow(ConflictException);
      expect(service.compareQuotations).toHaveBeenCalledWith(quotationIds);
    });
  });

  describe('findOne', () => {
    it('should return a quotation by id', async () => {
      const expectedQuotation = {
        id: '1',
        quotation_number: 'SQ-2024-0001',
        supplier: { id: 'supplier-1', supplier_name: 'Test Supplier' },
        items: [],
      };

      mockSupplierQuotationsService.findOne.mockResolvedValue(expectedQuotation);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedQuotation);
    });

    it('should handle NotFoundException when quotation not found', async () => {
      mockSupplierQuotationsService.findOne.mockRejectedValue(new NotFoundException('Supplier quotation not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
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

    it('should update a quotation successfully', async () => {
      const expectedQuotation = {
        id: '1',
        ...updateQuotationDto,
        modified_by: 'test@example.com',
      };

      mockSupplierQuotationsService.update.mockResolvedValue(expectedQuotation);

      const result = await controller.update('1', updateQuotationDto);

      expect(service.update).toHaveBeenCalledWith('1', updateQuotationDto);
      expect(result).toEqual(expectedQuotation);
    });

    it('should handle NotFoundException when quotation not found', async () => {
      mockSupplierQuotationsService.update.mockRejectedValue(new NotFoundException('Supplier quotation not found'));

      await expect(controller.update('999', updateQuotationDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateQuotationDto);
    });

    it('should handle ConflictException when quotation cannot be updated', async () => {
      mockSupplierQuotationsService.update.mockRejectedValue(
        new ConflictException('Cannot update quotation with status: Ordered')
      );

      await expect(controller.update('1', updateQuotationDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateQuotationDto);
    });

    it('should handle ConflictException when quotation number already exists', async () => {
      mockSupplierQuotationsService.update.mockRejectedValue(new ConflictException('Quotation number already exists'));

      await expect(controller.update('1', updateQuotationDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateQuotationDto);
    });
  });

  describe('updateStatus', () => {
    it('should update quotation status successfully', async () => {
      const expectedQuotation = {
        id: '1',
        quotation_number: 'SQ-2024-0001',
        status: 'Submitted',
        modified_by: 'test@example.com',
      };

      mockSupplierQuotationsService.updateStatus.mockResolvedValue(expectedQuotation);

      const result = await controller.updateStatus('1', 'Submitted');

      expect(service.updateStatus).toHaveBeenCalledWith('1', 'Submitted');
      expect(result).toEqual(expectedQuotation);
    });

    it('should handle NotFoundException when quotation not found', async () => {
      mockSupplierQuotationsService.updateStatus.mockRejectedValue(new NotFoundException('Supplier quotation not found'));

      await expect(controller.updateStatus('999', 'Submitted')).rejects.toThrow(NotFoundException);
      expect(service.updateStatus).toHaveBeenCalledWith('999', 'Submitted');
    });

    it('should handle ConflictException for invalid status transition', async () => {
      mockSupplierQuotationsService.updateStatus.mockRejectedValue(
        new ConflictException('Cannot change status from Draft to Ordered')
      );

      await expect(controller.updateStatus('1', 'Ordered')).rejects.toThrow(ConflictException);
      expect(service.updateStatus).toHaveBeenCalledWith('1', 'Ordered');
    });
  });

  describe('remove', () => {
    it('should remove a quotation successfully', async () => {
      mockSupplierQuotationsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle NotFoundException when quotation not found', async () => {
      mockSupplierQuotationsService.remove.mockRejectedValue(new NotFoundException('Supplier quotation not found'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999');
    });

    it('should handle ConflictException when quotation cannot be deleted', async () => {
      mockSupplierQuotationsService.remove.mockRejectedValue(
        new ConflictException('Cannot delete quotation that has been ordered')
      );

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});