import { Test, TestingModule } from '@nestjs/testing';
import { StockEntryController } from './stock-entry.controller';
import { StockEntryService } from '../services/stock-entry.service';

describe('StockEntryController', () => {
  let controller: StockEntryController;
  let stockEntryService: jest.Mocked<StockEntryService>;

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

  const mockStockEntry = {
    id: 'stock-entry-1',
    name: 'STE-2024-00001',
    stockEntryType: 'Material Receipt',
    purpose: 'Material Receipt',
    company: 'Test Company',
    postingDate: new Date(),
    postingTime: '10:00:00',
    docstatus: 0,
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateStockEntryDto = {
    stockEntryType: 'Material Receipt',
    purpose: 'Material Receipt',
    company: 'Test Company',
    postingDate: new Date(),
    postingTime: '10:00:00',
    items: [
      {
        itemCode: 'ITEM001',
        qty: 100,
        basicRate: 50,
        sWarehouse: 'MAIN',
      },
    ],
  };

  const mockStockEntryQueryDto = {
    page: 1,
    limit: 10,
    stockEntryType: 'Material Receipt',
    company: 'Test Company',
    search: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockEntryController],
      providers: [
        {
          provide: StockEntryService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            submit: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StockEntryController>(StockEntryController);
    stockEntryService = module.get(StockEntryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a stock entry successfully', async () => {
      stockEntryService.create.mockResolvedValue(mockStockEntry as any);

      const result = await controller.create(mockCreateStockEntryDto, mockRequest);

      expect(result).toEqual(mockStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        mockCreateStockEntryDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should create a stock entry with tenant_id from request', async () => {
      stockEntryService.create.mockResolvedValue(mockStockEntry as any);

      const result = await controller.create(mockCreateStockEntryDto, mockRequestWithTenantId);

      expect(result).toEqual(mockStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        mockCreateStockEntryDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Item not found');
      stockEntryService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateStockEntryDto, mockRequest))
        .rejects.toThrow('Item not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated stock entries', async () => {
      const mockServiceResponse = {
        stockEntries: [mockStockEntry],
        total: 1,
      };
      stockEntryService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll(mockStockEntryQueryDto, mockRequest);

      expect(result).toEqual({
        stockEntries: [mockStockEntry],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(stockEntryService.findAll).toHaveBeenCalledWith(
        mockStockEntryQueryDto,
        'tenant-1'
      );
    });

    it('should handle default pagination values', async () => {
      const mockServiceResponse = {
        stockEntries: [mockStockEntry],
        total: 1,
      };
      stockEntryService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({}, mockRequest);

      expect(result).toEqual({
        stockEntries: [mockStockEntry],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should calculate total pages correctly', async () => {
      const mockServiceResponse = {
        stockEntries: Array(25).fill(mockStockEntry),
        total: 25,
      };
      stockEntryService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({ page: 1, limit: 10 }, mockRequest);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a single stock entry', async () => {
      stockEntryService.findOne.mockResolvedValue(mockStockEntry as any);

      const result = await controller.findOne('stock-entry-1', mockRequest);

      expect(result).toEqual(mockStockEntry);
      expect(stockEntryService.findOne).toHaveBeenCalledWith('stock-entry-1', 'tenant-1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Stock entry not found');
      stockEntryService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent', mockRequest))
        .rejects.toThrow('Stock entry not found');
    });
  });

  describe('submit', () => {
    it('should submit a stock entry successfully', async () => {
      const submittedStockEntry = { ...mockStockEntry, docstatus: 1 };
      stockEntryService.submit.mockResolvedValue(submittedStockEntry as any);

      const result = await controller.submit('stock-entry-1', mockRequest);

      expect(result).toEqual(submittedStockEntry);
      expect(stockEntryService.submit).toHaveBeenCalledWith(
        'stock-entry-1',
        'tenant-1',
        'user-1'
      );
    });

    it('should handle insufficient stock errors', async () => {
      const error = new Error('Insufficient stock for item ITEM001 in warehouse MAIN');
      stockEntryService.submit.mockRejectedValue(error);

      await expect(controller.submit('stock-entry-1', mockRequest))
        .rejects.toThrow('Insufficient stock for item ITEM001 in warehouse MAIN');
    });

    it('should handle invalid status errors', async () => {
      const error = new Error('Stock entry is already submitted');
      stockEntryService.submit.mockRejectedValue(error);

      await expect(controller.submit('stock-entry-1', mockRequest))
        .rejects.toThrow('Stock entry is already submitted');
    });
  });

  describe('cancel', () => {
    it('should cancel a stock entry successfully', async () => {
      const cancelledStockEntry = { ...mockStockEntry, docstatus: 2 };
      stockEntryService.cancel.mockResolvedValue(cancelledStockEntry as any);

      const result = await controller.cancel('stock-entry-1', mockRequest);

      expect(result).toEqual(cancelledStockEntry);
      expect(stockEntryService.cancel).toHaveBeenCalledWith(
        'stock-entry-1',
        'tenant-1',
        'user-1'
      );
    });

    it('should handle invalid status errors', async () => {
      const error = new Error('Only submitted stock entries can be cancelled');
      stockEntryService.cancel.mockRejectedValue(error);

      await expect(controller.cancel('stock-entry-1', mockRequest))
        .rejects.toThrow('Only submitted stock entries can be cancelled');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Stock entry not found');
      stockEntryService.cancel.mockRejectedValue(error);

      await expect(controller.cancel('non-existent', mockRequest))
        .rejects.toThrow('Stock entry not found');
    });
  });

  describe('createMaterialReceipt', () => {
    it('should create a material receipt stock entry', async () => {
      const materialReceiptDto = {
        company: 'Test Company',
        postingDate: new Date(),
        postingTime: '10:00:00',
        items: [
          {
            itemCode: 'ITEM001',
            qty: 100,
            basicRate: 50,
            sWarehouse: 'MAIN',
          },
        ],
      };

      const expectedDto = {
        ...materialReceiptDto,
        purpose: 'Material Receipt',
        stockEntryType: 'Material Receipt',
      };

      stockEntryService.create.mockResolvedValue(mockStockEntry as any);

      const result = await controller.createMaterialReceipt(materialReceiptDto, mockRequest);

      expect(result).toEqual(mockStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        expectedDto,
        'tenant-1',
        'user-1'
      );
    });
  });

  describe('createMaterialIssue', () => {
    it('should create a material issue stock entry', async () => {
      const materialIssueDto = {
        company: 'Test Company',
        postingDate: new Date(),
        postingTime: '10:00:00',
        items: [
          {
            itemCode: 'ITEM001',
            qty: 50,
            basicRate: 50,
            sWarehouse: 'MAIN',
          },
        ],
      };

      const expectedDto = {
        ...materialIssueDto,
        purpose: 'Material Issue',
        stockEntryType: 'Material Issue',
      };

      const materialIssueStockEntry = {
        ...mockStockEntry,
        stockEntryType: 'Material Issue',
        purpose: 'Material Issue',
      };

      stockEntryService.create.mockResolvedValue(materialIssueStockEntry as any);

      const result = await controller.createMaterialIssue(materialIssueDto, mockRequest);

      expect(result).toEqual(materialIssueStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        expectedDto,
        'tenant-1',
        'user-1'
      );
    });
  });

  describe('createMaterialTransfer', () => {
    it('should create a material transfer stock entry', async () => {
      const materialTransferDto = {
        company: 'Test Company',
        postingDate: new Date(),
        postingTime: '10:00:00',
        items: [
          {
            itemCode: 'ITEM001',
            qty: 25,
            basicRate: 50,
            sWarehouse: 'MAIN',
            tWarehouse: 'STORE',
          },
        ],
      };

      const expectedDto = {
        ...materialTransferDto,
        purpose: 'Material Transfer',
        stockEntryType: 'Material Transfer',
      };

      const materialTransferStockEntry = {
        ...mockStockEntry,
        stockEntryType: 'Material Transfer',
        purpose: 'Material Transfer',
      };

      stockEntryService.create.mockResolvedValue(materialTransferStockEntry as any);

      const result = await controller.createMaterialTransfer(materialTransferDto, mockRequest);

      expect(result).toEqual(materialTransferStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        expectedDto,
        'tenant-1',
        'user-1'
      );
    });
  });

  describe('createManufacture', () => {
    it('should create a manufacture stock entry', async () => {
      const manufactureDto = {
        company: 'Test Company',
        postingDate: new Date(),
        postingTime: '10:00:00',
        items: [
          {
            itemCode: 'FINISHED_ITEM',
            qty: 10,
            basicRate: 100,
            tWarehouse: 'FINISHED_GOODS',
          },
        ],
      };

      const expectedDto = {
        ...manufactureDto,
        purpose: 'Manufacture',
        stockEntryType: 'Manufacture',
      };

      const manufactureStockEntry = {
        ...mockStockEntry,
        stockEntryType: 'Manufacture',
        purpose: 'Manufacture',
      };

      stockEntryService.create.mockResolvedValue(manufactureStockEntry as any);

      const result = await controller.createManufacture(manufactureDto, mockRequest);

      expect(result).toEqual(manufactureStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        expectedDto,
        'tenant-1',
        'user-1'
      );
    });
  });

  describe('createRepack', () => {
    it('should create a repack stock entry', async () => {
      const repackDto = {
        company: 'Test Company',
        postingDate: new Date(),
        postingTime: '10:00:00',
        items: [
          {
            itemCode: 'BULK_ITEM',
            qty: 1,
            basicRate: 1000,
            sWarehouse: 'MAIN',
          },
          {
            itemCode: 'PACKED_ITEM',
            qty: 10,
            basicRate: 100,
            tWarehouse: 'MAIN',
          },
        ],
      };

      const expectedDto = {
        ...repackDto,
        purpose: 'Repack',
        stockEntryType: 'Repack',
      };

      const repackStockEntry = {
        ...mockStockEntry,
        stockEntryType: 'Repack',
        purpose: 'Repack',
      };

      stockEntryService.create.mockResolvedValue(repackStockEntry as any);

      const result = await controller.createRepack(repackDto, mockRequest);

      expect(result).toEqual(repackStockEntry);
      expect(stockEntryService.create).toHaveBeenCalledWith(
        expectedDto,
        'tenant-1',
        'user-1'
      );
    });
  });
});