import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from './batch.controller';
import { BatchService } from '../services/batch.service';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('BatchController', () => {
  let controller: BatchController;
  let batchService: jest.Mocked<BatchService>;

  const mockBatch = {
    id: '1',
    name: 'BATCH001',
    itemCode: 'ITEM001',
    itemName: 'Test Item',
    batchQty: 100,
    manufacturingDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    description: 'Test batch',
    disabled: false,
    tenant_id: 'tenant1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { tenant_id: 'tenant1', id: 'user1' },
    tenant_id: 'tenant1',
  };

  const mockRequestWithoutTenant = {
    user: {},
  };

  beforeEach(async () => {
    const mockBatchService = {
      create: jest.fn(),
      findAll: jest.fn(),
      getExpiringBatches: jest.fn(),
      getExpiredBatches: jest.fn(),
      getBatchesByItem: jest.fn(),
      generateBatchName: jest.fn(),
      findOne: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      updateBatchQuantity: jest.fn(),
      validateBatchForTransaction: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: BatchService,
          useValue: mockBatchService,
        },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
    batchService = module.get(BatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createBatchDto = {
      name: 'BATCH001',
      itemCode: 'ITEM001',
      batchQty: 100,
      manufacturingDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-12-31'),
      description: 'Test batch',
    };

    it('should create a batch successfully', async () => {
      batchService.create.mockResolvedValue(mockBatch);

      const result = await controller.create(createBatchDto, mockRequest);

      expect(result).toEqual(mockBatch);
      expect(batchService.create).toHaveBeenCalledWith(
        createBatchDto,
        'tenant1',
        'user1'
      );
    });

    it('should handle missing tenant_id', async () => {
      batchService.create.mockResolvedValue(mockBatch);

      const result = await controller.create(createBatchDto, mockRequestWithoutTenant);

      expect(result).toEqual(mockBatch);
      expect(batchService.create).toHaveBeenCalledWith(
        createBatchDto,
        undefined,
        undefined
      );
    });

    it('should handle service errors', async () => {
      batchService.create.mockRejectedValue(new BadRequestException('Batch already exists'));

      await expect(controller.create(createBatchDto, mockRequest))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const queryDto = {
      itemCode: 'ITEM001',
      disabled: false,
      expiryStatus: 'valid' as const,
      page: 1,
      limit: 10,
      sortBy: 'name' as const,
      sortOrder: 'ASC' as const,
    };

    const mockFindAllResult = {
      batches: [mockBatch],
      total: 1,
    };

    it('should return paginated batches', async () => {
      batchService.findAll.mockResolvedValue(mockFindAllResult);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(result).toEqual({
        batches: [mockBatch],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(batchService.findAll).toHaveBeenCalledWith(queryDto, 'tenant1');
    });

    it('should handle default pagination values', async () => {
      batchService.findAll.mockResolvedValue(mockFindAllResult);

      const result = await controller.findAll({}, mockRequest);

      expect(result).toEqual({
        batches: [mockBatch],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should calculate total pages correctly', async () => {
      const largeResult = {
        batches: Array(25).fill(mockBatch),
        total: 25,
      };
      batchService.findAll.mockResolvedValue(largeResult);

      const result = await controller.findAll({ page: 1, limit: 10 }, mockRequest);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('getExpiringBatches', () => {
    it('should return expiring batches with default days ahead', async () => {
      batchService.getExpiringBatches.mockResolvedValue([mockBatch]);

      const result = await controller.getExpiringBatches(undefined, mockRequest);

      expect(result).toEqual([mockBatch]);
      expect(batchService.getExpiringBatches).toHaveBeenCalledWith('tenant1', 30);
    });

    it('should return expiring batches with custom days ahead', async () => {
      batchService.getExpiringBatches.mockResolvedValue([mockBatch]);

      const result = await controller.getExpiringBatches(60, mockRequest);

      expect(result).toEqual([mockBatch]);
      expect(batchService.getExpiringBatches).toHaveBeenCalledWith('tenant1', 60);
    });
  });

  describe('getExpiredBatches', () => {
    it('should return expired batches', async () => {
      batchService.getExpiredBatches.mockResolvedValue([mockBatch]);

      const result = await controller.getExpiredBatches(mockRequest);

      expect(result).toEqual([mockBatch]);
      expect(batchService.getExpiredBatches).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('getBatchesByItem', () => {
    it('should return batches by item code with default includeDisabled', async () => {
      batchService.getBatchesByItem.mockResolvedValue([mockBatch]);

      const result = await controller.getBatchesByItem('ITEM001', undefined, mockRequest);

      expect(result).toEqual([mockBatch]);
      expect(batchService.getBatchesByItem).toHaveBeenCalledWith('ITEM001', 'tenant1', false);
    });

    it('should return batches by item code with includeDisabled true', async () => {
      batchService.getBatchesByItem.mockResolvedValue([mockBatch]);

      const result = await controller.getBatchesByItem('ITEM001', true, mockRequest);

      expect(result).toEqual([mockBatch]);
      expect(batchService.getBatchesByItem).toHaveBeenCalledWith('ITEM001', 'tenant1', true);
    });
  });

  describe('generateBatchName', () => {
    it('should generate batch name successfully', async () => {
      batchService.generateBatchName.mockResolvedValue('BATCH002');

      const result = await controller.generateBatchName('ITEM001', mockRequest);

      expect(result).toEqual({ batchName: 'BATCH002' });
      expect(batchService.generateBatchName).toHaveBeenCalledWith('ITEM001', 'tenant1');
    });

    it('should handle item not found', async () => {
      batchService.generateBatchName.mockRejectedValue(new NotFoundException('Item not found'));

      await expect(controller.generateBatchName('INVALID', mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return batch by ID', async () => {
      batchService.findOne.mockResolvedValue(mockBatch);

      const result = await controller.findOne('1', mockRequest);

      expect(result).toEqual(mockBatch);
      expect(batchService.findOne).toHaveBeenCalledWith('1', 'tenant1');
    });

    it('should handle batch not found', async () => {
      batchService.findOne.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.findOne('999', mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return batch by name and item code', async () => {
      batchService.findByName.mockResolvedValue(mockBatch);

      const result = await controller.findByName('BATCH001', 'ITEM001', mockRequest);

      expect(result).toEqual(mockBatch);
      expect(batchService.findByName).toHaveBeenCalledWith('BATCH001', 'ITEM001', 'tenant1');
    });

    it('should handle batch not found', async () => {
      batchService.findByName.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.findByName('INVALID', 'ITEM001', mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateBatchDto = {
      description: 'Updated description',
      disabled: true,
    };

    it('should update batch successfully', async () => {
      const updatedBatch = { ...mockBatch, ...updateBatchDto };
      batchService.update.mockResolvedValue(updatedBatch);

      const result = await controller.update('1', updateBatchDto, mockRequest);

      expect(result).toEqual(updatedBatch);
      expect(batchService.update).toHaveBeenCalledWith('1', updateBatchDto, 'tenant1', 'user1');
    });

    it('should handle batch not found', async () => {
      batchService.update.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.update('999', updateBatchDto, mockRequest))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle validation errors', async () => {
      batchService.update.mockRejectedValue(new BadRequestException('Validation failed'));

      await expect(controller.update('1', updateBatchDto, mockRequest))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateQuantity', () => {
    it('should update batch quantity successfully', async () => {
      const updatedBatch = { ...mockBatch, batchQty: 150 };
      batchService.findOne.mockResolvedValue(mockBatch);
      batchService.updateBatchQuantity.mockResolvedValue(updatedBatch);

      const result = await controller.updateQuantity('1', 150, mockRequest);

      expect(result).toEqual(updatedBatch);
      expect(batchService.findOne).toHaveBeenCalledWith('1', 'tenant1');
      expect(batchService.updateBatchQuantity).toHaveBeenCalledWith(
        'BATCH001',
        'ITEM001',
        'tenant1',
        150
      );
    });

    it('should handle batch not found', async () => {
      batchService.findOne.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.updateQuantity('999', 150, mockRequest))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle invalid quantity', async () => {
      batchService.findOne.mockResolvedValue(mockBatch);
      batchService.updateBatchQuantity.mockRejectedValue(
        new BadRequestException('Invalid quantity')
      );

      await expect(controller.updateQuantity('1', -10, mockRequest))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('validateBatch', () => {
    it('should validate batch successfully', async () => {
      const validationResult = {
        valid: true,
        message: 'Batch is valid',
        batch: mockBatch,
      };
      batchService.findOne.mockResolvedValue(mockBatch);
      batchService.validateBatchForTransaction.mockResolvedValue(validationResult);

      const result = await controller.validateBatch('1', 50, mockRequest);

      expect(result).toEqual(validationResult);
      expect(batchService.findOne).toHaveBeenCalledWith('1', 'tenant1');
      expect(batchService.validateBatchForTransaction).toHaveBeenCalledWith(
        'BATCH001',
        'ITEM001',
        'tenant1',
        50
      );
    });

    it('should return invalid validation result', async () => {
      const validationResult = {
        valid: false,
        message: 'Insufficient quantity',
      };
      batchService.findOne.mockResolvedValue(mockBatch);
      batchService.validateBatchForTransaction.mockResolvedValue(validationResult);

      const result = await controller.validateBatch('1', 200, mockRequest);

      expect(result).toEqual(validationResult);
    });

    it('should handle batch not found', async () => {
      batchService.findOne.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.validateBatch('999', 50, mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete batch successfully', async () => {
      batchService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1', mockRequest);

      expect(result).toBeUndefined();
      expect(batchService.remove).toHaveBeenCalledWith('1', 'tenant1');
    });

    it('should handle batch not found', async () => {
      batchService.remove.mockRejectedValue(new NotFoundException('Batch not found'));

      await expect(controller.remove('999', mockRequest))
        .rejects.toThrow(NotFoundException);
    });
  });
});