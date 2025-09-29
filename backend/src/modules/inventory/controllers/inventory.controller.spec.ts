import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from '../services/inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let inventoryService: jest.Mocked<InventoryService>;

  const mockRequest = {
    user: {
      id: 'user-1',
      tenant_id: 'tenant-1',
      email: 'test@example.com',
    },
  };

  const mockRequestWithoutTenant = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  };

  const mockItem = {
    id: 'item-1',
    code: 'ITEM001',
    name: 'Test Item',
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateItemDto = {
    code: 'ITEM001',
    name: 'Test Item',
    description: 'Test item description',
    itemGroup: 'Raw Materials',
    stockUom: 'Nos',
  };

  const mockUpdateItemDto = {
    name: 'Updated Test Item',
    description: 'Updated description',
  };

  const mockItemQueryDto = {
    page: 1,
    limit: 10,
    search: 'test',
    itemGroup: 'Raw Materials',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            createItem: jest.fn(),
            findAllItems: jest.fn(),
            findOneItem: jest.fn(),
            updateItem: jest.fn(),
            removeItem: jest.fn(),
            getStockLevels: jest.fn(),
            getDashboardSummary: jest.fn(),
            getLowStockReport: jest.fn(),
            getValuationReport: jest.fn(),
            getStockSummary: jest.fn(),
            getStockLedger: jest.fn(),
            performStockReconciliation: jest.fn(),
            getAgingReport: jest.fn(),
            getMovementReport: jest.fn(),
            getInventoryAlerts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    inventoryService = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an item successfully', async () => {
      inventoryService.createItem.mockResolvedValue(mockItem as any);

      const result = await controller.create(mockCreateItemDto, mockRequest);

      expect(result).toEqual(mockItem);
      expect(inventoryService.createItem).toHaveBeenCalledWith(
        mockCreateItemDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.create(mockCreateItemDto, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAll', () => {
    it('should return paginated items', async () => {
      const mockResponse = {
        data: [mockItem],
        total: 1,
        page: 1,
        limit: 10,
      };
      inventoryService.findAllItems.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll(mockItemQueryDto, mockRequest);

      expect(result).toEqual(mockResponse);
      expect(inventoryService.findAllItems).toHaveBeenCalledWith(
        mockItemQueryDto,
        'tenant-1'
      );
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.findAll(mockItemQueryDto, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should return a single item', async () => {
      inventoryService.findOneItem.mockResolvedValue(mockItem as any);

      const result = await controller.findOne('item-1', mockRequest);

      expect(result).toEqual(mockItem);
      expect(inventoryService.findOneItem).toHaveBeenCalledWith('item-1', 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.findOne('item-1', mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update an item successfully', async () => {
      const updatedItem = { ...mockItem, ...mockUpdateItemDto };
      inventoryService.updateItem.mockResolvedValue(updatedItem as any);

      const result = await controller.update('item-1', mockUpdateItemDto, mockRequest);

      expect(result).toEqual(updatedItem);
      expect(inventoryService.updateItem).toHaveBeenCalledWith(
        'item-1',
        mockUpdateItemDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.update('item-1', mockUpdateItemDto, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should remove an item successfully', async () => {
      inventoryService.removeItem.mockResolvedValue(undefined);

      const result = await controller.remove('item-1', mockRequest);

      expect(result).toBeUndefined();
      expect(inventoryService.removeItem).toHaveBeenCalledWith('item-1', 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.remove('item-1', mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getStockLevels', () => {
    it('should return stock levels for an item', async () => {
      const mockStockLevels = {
        itemCode: 'ITEM001',
        warehouses: [
          { warehouse: 'MAIN', currentStock: 100 },
          { warehouse: 'STORE', currentStock: 50 },
        ],
      };
      inventoryService.getStockLevels.mockResolvedValue(mockStockLevels as any);

      const result = await controller.getStockLevels('item-1', mockRequest);

      expect(result).toEqual(mockStockLevels);
      expect(inventoryService.getStockLevels).toHaveBeenCalledWith('item-1', 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.getStockLevels('item-1', mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary', async () => {
      const mockDashboard = {
        totalItems: 100,
        totalWarehouses: 5,
        totalStockValue: 50000,
        lowStockItems: 10,
        outOfStockItems: 5,
      };
      inventoryService.getDashboardSummary.mockResolvedValue(mockDashboard as any);

      const result = await controller.getDashboardSummary(mockRequest);

      expect(result).toEqual(mockDashboard);
      expect(inventoryService.getDashboardSummary).toHaveBeenCalledWith('tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.getDashboardSummary(mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getLowStockReport', () => {
    it('should return low stock report', async () => {
      const mockLowStockReport = [
        { itemCode: 'ITEM001', currentStock: 5, safetyStock: 10 },
        { itemCode: 'ITEM002', currentStock: 2, safetyStock: 15 },
      ];
      inventoryService.getLowStockReport.mockResolvedValue(mockLowStockReport as any);

      const result = await controller.getLowStockReport(mockRequest);

      expect(result).toEqual(mockLowStockReport);
      expect(inventoryService.getLowStockReport).toHaveBeenCalledWith('tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.getLowStockReport(mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getValuationReport', () => {
    it('should return valuation report', async () => {
      const mockValuationReport = [
        { itemCode: 'ITEM001', currentStock: 100, valuationRate: 50, stockValue: 5000 },
        { itemCode: 'ITEM002', currentStock: 75, valuationRate: 30, stockValue: 2250 },
      ];
      inventoryService.getValuationReport.mockResolvedValue(mockValuationReport as any);

      const result = await controller.getValuationReport(mockRequest);

      expect(result).toEqual(mockValuationReport);
      expect(inventoryService.getValuationReport).toHaveBeenCalledWith('tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      await expect(controller.getValuationReport(mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getStockSummary', () => {
    it('should return stock summary with filters', async () => {
      const query = {
        company: 'Test Company',
        warehouseCode: 'MAIN',
        itemGroup: 'Raw Materials',
        includeZeroStock: false,
      };
      const mockStockSummary = {
        summary: [
          { itemCode: 'ITEM001', totalStock: 100, totalValue: 5000 },
        ],
        totals: { totalItems: 1, totalValue: 5000 },
      };
      inventoryService.getStockSummary.mockResolvedValue(mockStockSummary as any);

      const result = await controller.getStockSummary(query, mockRequest);

      expect(result).toEqual(mockStockSummary);
      expect(inventoryService.getStockSummary).toHaveBeenCalledWith(query, 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const query = { company: 'Test Company' };
      await expect(controller.getStockSummary(query, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getStockLedger', () => {
    it('should return stock ledger entries with filters', async () => {
      const query = {
        itemCode: 'ITEM001',
        warehouseCode: 'MAIN',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        page: 1,
        limit: 50,
      };
      const mockStockLedger = {
        data: [
          {
            itemCode: 'ITEM001',
            warehouse: 'MAIN',
            postingDate: '2024-01-15',
            actualQty: 10,
            qtyAfterTransaction: 110,
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };
      inventoryService.getStockLedger.mockResolvedValue(mockStockLedger as any);

      const result = await controller.getStockLedger(query, mockRequest);

      expect(result).toEqual(mockStockLedger);
      expect(inventoryService.getStockLedger).toHaveBeenCalledWith(query, 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const query = { itemCode: 'ITEM001' };
      await expect(controller.getStockLedger(query, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('performStockReconciliation', () => {
    it('should perform stock reconciliation successfully', async () => {
      const reconciliationDto = {
        company: 'Test Company',
        warehouseCode: 'MAIN',
        items: [
          { itemCode: 'ITEM001', warehouseCode: 'MAIN', actualQty: 100 },
        ],
        remarks: 'Monthly reconciliation',
      };
      const mockResult = { success: true, adjustments: 1 };
      inventoryService.performStockReconciliation.mockResolvedValue(mockResult as any);

      const result = await controller.performStockReconciliation(reconciliationDto, mockRequest);

      expect(result).toEqual(mockResult);
      expect(inventoryService.performStockReconciliation).toHaveBeenCalledWith(
        reconciliationDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const reconciliationDto = {
        company: 'Test Company',
        items: [],
      };
      await expect(controller.performStockReconciliation(reconciliationDto, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getAgingReport', () => {
    it('should return aging report with filters', async () => {
      const query = {
        company: 'Test Company',
        warehouseCode: 'MAIN',
        itemGroup: 'Raw Materials',
        agingBasis: 'fifo' as const,
      };
      const mockAgingReport = {
        items: [
          {
            itemCode: 'ITEM001',
            agingBuckets: {
              '0-30': 50,
              '31-60': 30,
              '61-90': 20,
              '90+': 0,
            },
          },
        ],
      };
      inventoryService.getAgingReport.mockResolvedValue(mockAgingReport as any);

      const result = await controller.getAgingReport(query, mockRequest);

      expect(result).toEqual(mockAgingReport);
      expect(inventoryService.getAgingReport).toHaveBeenCalledWith(query, 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const query = { company: 'Test Company' };
      await expect(controller.getAgingReport(query, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMovementReport', () => {
    it('should return movement report with filters', async () => {
      const query = {
        itemCode: 'ITEM001',
        warehouseCode: 'MAIN',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        groupBy: 'item' as const,
      };
      const mockMovementReport = {
        movements: [
          {
            itemCode: 'ITEM001',
            inQty: 100,
            outQty: 50,
            netMovement: 50,
          },
        ],
      };
      inventoryService.getMovementReport.mockResolvedValue(mockMovementReport as any);

      const result = await controller.getMovementReport(query, mockRequest);

      expect(result).toEqual(mockMovementReport);
      expect(inventoryService.getMovementReport).toHaveBeenCalledWith(query, 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const query = {
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
      };
      await expect(controller.getMovementReport(query, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getInventoryAlerts', () => {
    it('should return inventory alerts with filters', async () => {
      const query = {
        company: 'Test Company',
        alertType: 'low_stock' as const,
      };
      const mockAlerts = {
        alerts: [
          {
            type: 'low_stock',
            itemCode: 'ITEM001',
            currentStock: 5,
            safetyStock: 10,
            severity: 'medium',
          },
        ],
        summary: {
          total: 1,
          byType: { low_stock: 1 },
          bySeverity: { medium: 1 },
        },
      };
      inventoryService.getInventoryAlerts.mockResolvedValue(mockAlerts as any);

      const result = await controller.getInventoryAlerts(query, mockRequest);

      expect(result).toEqual(mockAlerts);
      expect(inventoryService.getInventoryAlerts).toHaveBeenCalledWith(query, 'tenant-1');
    });

    it('should throw UnauthorizedException if tenant_id is missing', async () => {
      const query = { company: 'Test Company' };
      await expect(controller.getInventoryAlerts(query, mockRequestWithoutTenant))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});