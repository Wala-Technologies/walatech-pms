import { Test, TestingModule } from '@nestjs/testing';
import { BinController } from './bin.controller';
import { BinService } from '../services/bin.service';

describe('BinController', () => {
  let controller: BinController;
  let binService: jest.Mocked<BinService>;

  const mockRequest = {
    user: {
      id: 'user-1',
      tenant_id: 'tenant-1',
      email: 'test@example.com',
    },
  };

  const mockRequestWithTenantId = {
    tenant_id: 'tenant-1',
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  };

  const mockBin = {
    id: 'bin-1',
    itemCode: 'ITEM001',
    warehouseCode: 'MAIN',
    actualQty: 100,
    projectedQty: 100,
    reservedQty: 0,
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateBinDto = {
    itemCode: 'ITEM001',
    warehouseCode: 'MAIN',
    actualQty: 100,
  };

  const mockUpdateBinDto = {
    actualQty: 150,
  };

  const mockBinQueryDto = {
    page: 1,
    limit: 10,
    itemCode: 'ITEM001',
    warehouseCode: 'MAIN',
    search: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinController],
      providers: [
        {
          provide: BinService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            getStockBalance: jest.fn(),
            getLowStockItems: jest.fn(),
            getBinsByItem: jest.fn(),
            getBinsByWarehouse: jest.fn(),
            findByItemAndWarehouse: jest.fn(),
            updateQuantity: jest.fn(),
            reserveQuantity: jest.fn(),
            unreserveQuantity: jest.fn(),
            checkStockAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BinController>(BinController);
    binService = module.get(BinService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a bin successfully', async () => {
      binService.create.mockResolvedValue(mockBin as any);

      const result = await controller.create(mockCreateBinDto, mockRequest);

      expect(result).toEqual(mockBin);
      expect(binService.create).toHaveBeenCalledWith(
        mockCreateBinDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should create a bin with tenant_id from request', async () => {
      binService.create.mockResolvedValue(mockBin as any);

      const result = await controller.create(mockCreateBinDto, mockRequestWithTenantId);

      expect(result).toEqual(mockBin);
      expect(binService.create).toHaveBeenCalledWith(
        mockCreateBinDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Item not found');
      binService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateBinDto, mockRequest))
        .rejects.toThrow('Item not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated bins', async () => {
      const mockServiceResponse = {
        bins: [mockBin],
        total: 1,
      };
      binService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll(mockBinQueryDto, mockRequest);

      expect(result).toEqual({
        bins: [mockBin],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(binService.findAll).toHaveBeenCalledWith(
        mockBinQueryDto,
        'tenant-1'
      );
    });

    it('should handle default pagination values', async () => {
      const mockServiceResponse = {
        bins: [mockBin],
        total: 1,
      };
      binService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({}, mockRequest);

      expect(result).toEqual({
        bins: [mockBin],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should calculate total pages correctly', async () => {
      const mockServiceResponse = {
        bins: Array(25).fill(mockBin),
        total: 25,
      };
      binService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({ page: 1, limit: 10 }, mockRequest);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('getStockBalance', () => {
    it('should return stock balance for item-warehouse combination', async () => {
      const mockBalance = 100;
      binService.getStockBalance.mockResolvedValue(mockBalance);

      const query = {
        itemCode: 'ITEM001',
        warehouseCode: 'MAIN',
      };

      const result = await controller.getStockBalance(query, mockRequest);

      expect(result).toEqual({
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        balance: 100,
      });
      expect(binService.getStockBalance).toHaveBeenCalledWith('ITEM001', 'MAIN', 'tenant-1');
    });

    it('should handle empty query parameters', async () => {
      const mockBalance = 0;
      binService.getStockBalance.mockResolvedValue(mockBalance);

      const result = await controller.getStockBalance({}, mockRequest);

      expect(result).toEqual({
        itemCode: undefined,
        warehouse: undefined,
        balance: 0,
      });
      expect(binService.getStockBalance).toHaveBeenCalledWith('', '', 'tenant-1');
    });
  });

  describe('getLowStockBins', () => {
    it('should return low stock bins', async () => {
      const mockLowStockBins = [mockBin];
      binService.getLowStockItems.mockResolvedValue(mockLowStockBins as any);

      const result = await controller.getLowStockBins('Test Company', mockRequest);

      expect(result).toEqual(mockLowStockBins);
      expect(binService.getLowStockItems).toHaveBeenCalledWith('tenant-1');
    });

    it('should return empty array when no low stock bins exist', async () => {
      binService.getLowStockItems.mockResolvedValue([]);

      const result = await controller.getLowStockBins('Test Company', mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('getBinsByItem', () => {
    it('should return bins by item code', async () => {
      const mockBins = [mockBin];
      binService.getBinsByItem.mockResolvedValue(mockBins as any);

      const result = await controller.getBinsByItem('ITEM001', 'MAIN', false, mockRequest);

      expect(result).toEqual(mockBins);
      expect(binService.getBinsByItem).toHaveBeenCalledWith('ITEM001', 'tenant-1', 'MAIN', false);
    });

    it('should handle includeZeroStock parameter', async () => {
      const mockBins = [mockBin];
      binService.getBinsByItem.mockResolvedValue(mockBins as any);

      const result = await controller.getBinsByItem('ITEM001', 'MAIN', true, mockRequest);

      expect(result).toEqual(mockBins);
      expect(binService.getBinsByItem).toHaveBeenCalledWith('ITEM001', 'tenant-1', 'MAIN', true);
    });
  });

  describe('getBinsByWarehouse', () => {
    it('should return bins by warehouse code', async () => {
      const mockBins = [mockBin];
      binService.getBinsByWarehouse.mockResolvedValue(mockBins as any);

      const result = await controller.getBinsByWarehouse('MAIN', 'ITEM001', false, mockRequest);

      expect(result).toEqual(mockBins);
      expect(binService.getBinsByWarehouse).toHaveBeenCalledWith('MAIN', 'tenant-1', 'ITEM001', false);
    });

    it('should handle includeZeroStock parameter', async () => {
      const mockBins = [mockBin];
      binService.getBinsByWarehouse.mockResolvedValue(mockBins as any);

      const result = await controller.getBinsByWarehouse('MAIN', 'ITEM001', true, mockRequest);

      expect(result).toEqual(mockBins);
      expect(binService.getBinsByWarehouse).toHaveBeenCalledWith('MAIN', 'tenant-1', 'ITEM001', true);
    });
  });

  describe('findOne', () => {
    it('should return a single bin', async () => {
      binService.findOne.mockResolvedValue(mockBin as any);

      const result = await controller.findOne('bin-1', mockRequest);

      expect(result).toEqual(mockBin);
      expect(binService.findOne).toHaveBeenCalledWith('bin-1', 'tenant-1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Bin not found');
      binService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent', mockRequest))
        .rejects.toThrow('Bin not found');
    });
  });

  describe('findByItemAndWarehouse', () => {
    it('should return bins by item and warehouse', async () => {
      const mockBins = [mockBin];
      binService.findByItemAndWarehouse.mockResolvedValue(mockBins as any);

      const result = await controller.findByItemAndWarehouse('ITEM001', 'MAIN', mockRequest);

      expect(result).toEqual(mockBins);
      expect(binService.findByItemAndWarehouse).toHaveBeenCalledWith('ITEM001', 'MAIN', 'tenant-1');
    });

    it('should return empty array when no bins found', async () => {
      binService.findByItemAndWarehouse.mockResolvedValue([]);

      const result = await controller.findByItemAndWarehouse('ITEM001', 'MAIN', mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a bin successfully', async () => {
      const updatedBin = { ...mockBin, ...mockUpdateBinDto };
      binService.update.mockResolvedValue(updatedBin as any);

      const result = await controller.update('bin-1', mockUpdateBinDto, mockRequest);

      expect(result).toEqual(updatedBin);
      expect(binService.update).toHaveBeenCalledWith(
        'bin-1',
        mockUpdateBinDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should handle not found errors', async () => {
      const error = new Error('Bin not found');
      binService.update.mockRejectedValue(error);

      await expect(controller.update('non-existent', mockUpdateBinDto, mockRequest))
        .rejects.toThrow('Bin not found');
    });
  });

  describe('updateQuantity', () => {
    it('should update bin quantity successfully', async () => {
      const updatedBin = { ...mockBin, actualQty: 110 };
      binService.updateQuantity.mockResolvedValue(updatedBin as any);

      const quantityDto = {
        qtyChange: 10,
        voucherType: 'Stock Entry',
        voucherNo: 'SE-001',
        allowNegativeStock: false,
      };

      const result = await controller.updateQuantity('bin-1', quantityDto, mockRequest);

      expect(result).toEqual(updatedBin);
      expect(binService.updateQuantity).toHaveBeenCalledWith(
        'bin-1',
        10,
        'tenant-1',
        'user-1',
        false,
        'Stock Entry',
        'SE-001'
      );
    });

    it('should handle insufficient stock errors', async () => {
      const error = new Error('Insufficient stock');
      binService.updateQuantity.mockRejectedValue(error);

      const quantityDto = {
        qtyChange: -200,
        voucherType: 'Stock Entry',
        voucherNo: 'SE-001',
      };

      await expect(controller.updateQuantity('bin-1', quantityDto, mockRequest))
        .rejects.toThrow('Insufficient stock');
    });
  });

  describe('reserveQuantity', () => {
    it('should reserve quantity successfully', async () => {
      const updatedBin = { ...mockBin, reservedQty: 10 };
      binService.reserveQuantity.mockResolvedValue(updatedBin as any);

      const reserveDto = {
        qty: 10,
        voucherType: 'Sales Order',
        voucherNo: 'SO-001',
        reservationType: 'general' as const,
      };

      const result = await controller.reserveQuantity('bin-1', reserveDto, mockRequest);

      expect(result).toEqual(updatedBin);
      expect(binService.reserveQuantity).toHaveBeenCalledWith(
        'bin-1',
        10,
        'Sales Order',
        'SO-001',
        'tenant-1',
        'user-1',
        'general'
      );
    });

    it('should handle insufficient available quantity errors', async () => {
      const error = new Error('Insufficient available quantity');
      binService.reserveQuantity.mockRejectedValue(error);

      const reserveDto = {
        qty: 200,
        voucherType: 'Sales Order',
        voucherNo: 'SO-001',
      };

      await expect(controller.reserveQuantity('bin-1', reserveDto, mockRequest))
        .rejects.toThrow('Insufficient available quantity');
    });
  });

  describe('unreserveQuantity', () => {
    it('should unreserve quantity successfully', async () => {
      const updatedBin = { ...mockBin, reservedQty: 0 };
      binService.unreserveQuantity.mockResolvedValue(updatedBin as any);

      const unreserveDto = {
        qty: 10,
        voucherType: 'Sales Order',
        voucherNo: 'SO-001',
        reservationType: 'general' as const,
      };

      const result = await controller.unreserveQuantity('bin-1', unreserveDto, mockRequest);

      expect(result).toEqual(updatedBin);
      expect(binService.unreserveQuantity).toHaveBeenCalledWith(
        'bin-1',
        10,
        'Sales Order',
        'SO-001',
        'tenant-1',
        'user-1',
        'general'
      );
    });

    it('should handle insufficient reserved quantity errors', async () => {
      const error = new Error('Insufficient reserved quantity');
      binService.unreserveQuantity.mockRejectedValue(error);

      const unreserveDto = {
        qty: 50,
        voucherType: 'Sales Order',
        voucherNo: 'SO-001',
      };

      await expect(controller.unreserveQuantity('bin-1', unreserveDto, mockRequest))
        .rejects.toThrow('Insufficient reserved quantity');
    });
  });

  describe('checkAvailability', () => {
    it('should check stock availability for multiple items', async () => {
      const mockAvailability = [
        {
          itemCode: 'ITEM001',
          warehouseCode: 'MAIN',
          requiredQty: 50,
          availableQty: 100,
          isAvailable: true,
          shortage: 0,
        },
        {
          itemCode: 'ITEM002',
          warehouseCode: 'MAIN',
          requiredQty: 150,
          availableQty: 100,
          isAvailable: false,
          shortage: 50,
        },
      ];
      binService.checkStockAvailability.mockResolvedValue(mockAvailability);

      const checkDto = {
        items: [
          { itemCode: 'ITEM001', warehouseCode: 'MAIN', requiredQty: 50 },
          { itemCode: 'ITEM002', warehouseCode: 'MAIN', requiredQty: 150 },
        ],
      };

      const result = await controller.checkAvailability(checkDto, mockRequest);

      expect(result).toEqual(mockAvailability);
      expect(binService.checkStockAvailability).toHaveBeenCalledWith(
        checkDto.items,
        'tenant-1'
      );
    });

    it('should handle empty items array', async () => {
      binService.checkStockAvailability.mockResolvedValue([]);

      const checkDto = { items: [] };

      const result = await controller.checkAvailability(checkDto, mockRequest);

      expect(result).toEqual([]);
      expect(binService.checkStockAvailability).toHaveBeenCalledWith([], 'tenant-1');
    });
  });
});