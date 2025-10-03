import { Test, TestingModule } from '@nestjs/testing';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from '../services/warehouse.service';

describe('WarehouseController', () => {
  let controller: WarehouseController;
  let warehouseService: jest.Mocked<WarehouseService>;

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

  const mockWarehouse = {
    id: 'warehouse-1',
    warehouseName: 'Main Warehouse',
    warehouseCode: 'MAIN',
    company: 'Test Company',
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateWarehouseDto = {
    warehouseName: 'Main Warehouse',
    warehouseCode: 'MAIN',
    company: 'Test Company',
    warehouseType: 'Stock',
    isGroup: false,
    disabled: false,
  };

  const mockUpdateWarehouseDto = {
    warehouseName: 'Updated Warehouse',
    company: 'Updated Company',
  };

  const mockWarehouseQueryDto = {
    page: 1,
    limit: 10,
    company: 'Test Company',
    warehouseType: 'Stock',
    search: 'main',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseController],
      providers: [
        {
          provide: WarehouseService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByName: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getWarehouseHierarchy: jest.fn(),
            getChildWarehouses: jest.fn(),
            getAllChildWarehouses: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WarehouseController>(WarehouseController);
    warehouseService = module.get(WarehouseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a warehouse successfully', async () => {
      warehouseService.create.mockResolvedValue(mockWarehouse as any);

      const result = await controller.create(mockCreateWarehouseDto, mockRequest);

      expect(result).toEqual(mockWarehouse);
      expect(warehouseService.create).toHaveBeenCalledWith(
        mockCreateWarehouseDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should create a warehouse with tenant_id from request', async () => {
      warehouseService.create.mockResolvedValue(mockWarehouse as any);

      const result = await controller.create(mockCreateWarehouseDto, mockRequestWithTenantId);

      expect(result).toEqual(mockWarehouse);
      expect(warehouseService.create).toHaveBeenCalledWith(
        mockCreateWarehouseDto,
        'tenant-1',
        'user-1'
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Warehouse name already exists');
      warehouseService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateWarehouseDto, mockRequest))
        .rejects.toThrow('Warehouse name already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated warehouses', async () => {
      const mockServiceResponse = {
        warehouses: [mockWarehouse],
        total: 1,
      };
      warehouseService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll(mockWarehouseQueryDto, mockRequest);

      expect(result).toEqual({
        warehouses: [mockWarehouse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(warehouseService.findAll).toHaveBeenCalledWith(
        mockWarehouseQueryDto,
        'tenant-1'
      );
    });

    it('should handle default pagination values', async () => {
      const mockServiceResponse = {
        warehouses: [mockWarehouse],
        total: 1,
      };
      warehouseService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({}, mockRequest);

      expect(result).toEqual({
        warehouses: [mockWarehouse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should calculate total pages correctly', async () => {
      const mockServiceResponse = {
        warehouses: Array(25).fill(mockWarehouse),
        total: 25,
      };
      warehouseService.findAll.mockResolvedValue(mockServiceResponse as any);

      const result = await controller.findAll({ page: 1, limit: 10 }, mockRequest);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('getHierarchy', () => {
    it('should return warehouse hierarchy', async () => {
      const mockHierarchy = [mockWarehouse];
      warehouseService.getWarehouseHierarchy.mockResolvedValue(mockHierarchy as any);

      const result = await controller.getHierarchy(mockRequest);

      expect(result).toEqual(mockHierarchy);
      expect(warehouseService.getWarehouseHierarchy).toHaveBeenCalledWith('tenant-1');
    });

    it('should work with tenant_id from request', async () => {
      const mockHierarchy = [mockWarehouse];
      warehouseService.getWarehouseHierarchy.mockResolvedValue(mockHierarchy as any);

      const result = await controller.getHierarchy(mockRequestWithTenantId);

      expect(result).toEqual(mockHierarchy);
      expect(warehouseService.getWarehouseHierarchy).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('findOne', () => {
    it('should return a single warehouse', async () => {
      warehouseService.findOne.mockResolvedValue(mockWarehouse as any);

      const result = await controller.findOne('warehouse-1', mockRequest);

      expect(result).toEqual(mockWarehouse);
      expect(warehouseService.findOne).toHaveBeenCalledWith('warehouse-1', 'tenant-1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Warehouse not found');
      warehouseService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent', mockRequest))
        .rejects.toThrow('Warehouse not found');
    });
  });

  describe('findByName', () => {
    it('should return a warehouse by name', async () => {
      warehouseService.findByName.mockResolvedValue(mockWarehouse as any);

      const result = await controller.findByName('Main Warehouse', mockRequest);

      expect(result).toEqual(mockWarehouse);
      expect(warehouseService.findByName).toHaveBeenCalledWith('Main Warehouse', 'tenant-1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Warehouse not found');
      warehouseService.findByName.mockRejectedValue(error);

      await expect(controller.findByName('Non-existent Warehouse', mockRequest))
        .rejects.toThrow('Warehouse not found');
    });
  });

  describe('getChildren', () => {
    it('should return child warehouses', async () => {
      const mockChildren = [mockWarehouse];
      warehouseService.getChildWarehouses.mockResolvedValue(mockChildren as any);

      const result = await controller.getChildren('Main Warehouse', mockRequest);

      expect(result).toEqual(mockChildren);
      expect(warehouseService.getChildWarehouses).toHaveBeenCalledWith('Main Warehouse', 'tenant-1');
    });

    it('should return empty array when no children exist', async () => {
      warehouseService.getChildWarehouses.mockResolvedValue([]);

      const result = await controller.getChildren('Main Warehouse', mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('getAllChildren', () => {
    it('should return all descendant warehouses', async () => {
      const mockChildren = ['Child Warehouse 1', 'Child Warehouse 2'];
      warehouseService.getAllChildWarehouses.mockResolvedValue(mockChildren);

      const result = await controller.getAllChildren('Main Warehouse', mockRequest);

      expect(result).toEqual({ children: mockChildren });
      expect(warehouseService.getAllChildWarehouses).toHaveBeenCalledWith('Main Warehouse', 'tenant-1');
    });

    it('should return empty array when no descendants exist', async () => {
      warehouseService.getAllChildWarehouses.mockResolvedValue([]);

      const result = await controller.getAllChildren('Main Warehouse', mockRequest);

      expect(result).toEqual({ children: [] });
    });
  });

  describe('update', () => {
    it('should update a warehouse successfully', async () => {
      const updatedWarehouse = { ...mockWarehouse, ...mockUpdateWarehouseDto };
      warehouseService.update.mockResolvedValue(updatedWarehouse as any);

      const result = await controller.update('warehouse-1', mockUpdateWarehouseDto, mockRequest);

      expect(result).toEqual(updatedWarehouse);
      expect(warehouseService.update).toHaveBeenCalledWith(
        { ...mockUpdateWarehouseDto, id: 'warehouse-1' },
        'tenant-1',
        'user-1'
      );
    });

    it('should handle validation errors', async () => {
      const error = new Error('Warehouse name already exists');
      warehouseService.update.mockRejectedValue(error);

      await expect(controller.update('warehouse-1', mockUpdateWarehouseDto, mockRequest))
        .rejects.toThrow('Warehouse name already exists');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Warehouse not found');
      warehouseService.update.mockRejectedValue(error);

      await expect(controller.update('non-existent', mockUpdateWarehouseDto, mockRequest))
        .rejects.toThrow('Warehouse not found');
    });
  });

  describe('remove', () => {
    it('should remove a warehouse successfully', async () => {
      warehouseService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('warehouse-1', mockRequest);

      expect(result).toBeUndefined();
      expect(warehouseService.remove).toHaveBeenCalledWith('warehouse-1', 'tenant-1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Warehouse not found');
      warehouseService.remove.mockRejectedValue(error);

      await expect(controller.remove('non-existent', mockRequest))
        .rejects.toThrow('Warehouse not found');
    });

    it('should handle business logic errors', async () => {
      const error = new Error('Cannot delete warehouse with existing stock entries');
      warehouseService.remove.mockRejectedValue(error);

      await expect(controller.remove('warehouse-1', mockRequest))
        .rejects.toThrow('Cannot delete warehouse with existing stock entries');
    });
  });
});