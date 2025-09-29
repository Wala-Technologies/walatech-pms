import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BinService } from './bin.service';
import { Bin } from '../entities/bin.entity';
import { Item } from '../entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

describe('BinService', () => {
  let service: BinService;
  let binRepository: jest.Mocked<Repository<Bin>>;
  let itemRepository: jest.Mocked<Repository<Item>>;
  let warehouseRepository: jest.Mocked<Repository<Warehouse>>;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockWarehouse = {
    id: 'warehouse-1',
    name: 'Main Warehouse',
    code: 'MAIN',
    tenant_id: 'tenant-1',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockItem = {
    id: 'item-1',
    code: 'ITEM001',
    name: 'Test Item',
    safetyStock: 10,
    maxOrderQty: 100,
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockBin = {
    id: 'bin-1',
    itemCode: 'ITEM001',
    warehouse_id: 'MAIN',
    actualQty: 50,
    reservedQty: 5,
    orderedQty: 10,
    indentedQty: 0,
    plannedQty: 0,
    projectedQty: 55,
    valuationRate: 100,
    stockValue: 5000,
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
    updateProjectedQty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinService,
        {
          provide: getRepositoryToken(Bin),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Item),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Warehouse),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BinService>(BinService);
    binRepository = module.get(getRepositoryToken(Bin));
    itemRepository = module.get(getRepositoryToken(Item));
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
    tenantRepository = module.get(getRepositoryToken(Tenant));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOrCreateBin', () => {
    it('should return existing bin if found', async () => {
      binRepository.findOne.mockResolvedValue(mockBin as any);

      const result = await service.findOrCreateBin('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toEqual(mockBin);
      expect(binRepository.findOne).toHaveBeenCalledWith({
        where: { itemCode: 'ITEM001', warehouse_id: 'MAIN', tenant_id: 'tenant-1' },
        relations: ['warehouse', 'tenant'],
      });
    });

    it('should create new bin if not found', async () => {
      binRepository.findOne.mockResolvedValue(null);
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      binRepository.create.mockReturnValue(mockBin as any);
      binRepository.save.mockResolvedValue(mockBin as any);

      const result = await service.findOrCreateBin('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toEqual(mockBin);
      expect(binRepository.create).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      binRepository.findOne.mockResolvedValue(null);
      itemRepository.findOne.mockResolvedValue(null);

      await expect(service.findOrCreateBin('ITEM001', 'MAIN', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      binRepository.findOne.mockResolvedValue(null);
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOrCreateBin('ITEM001', 'MAIN', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      binRepository.findOne.mockResolvedValue(null);
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.findOrCreateBin('ITEM001', 'MAIN', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBinQty', () => {
    it('should update bin quantity and save', async () => {
      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.updateBinQty('ITEM001', 'MAIN', 'tenant-1', 'actualQty', 75);

      expect(result.actualQty).toBe(75);
      expect(binToUpdate.updateProjectedQty).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalledWith(binToUpdate);
    });

    it('should throw NotFoundException if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBinQty('ITEM001', 'MAIN', 'tenant-1', 'actualQty', 75))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('setBinQty', () => {
    it('should set bin quantity and save', async () => {
      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.setBinQty('ITEM001', 'MAIN', 'tenant-1', 'actualQty', 100);

      expect(result.actualQty).toBe(100);
      expect(binToUpdate.updateProjectedQty).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalledWith(binToUpdate);
    });
  });

  describe('getStockBalance', () => {
    it('should return actual quantity for item and warehouse', async () => {
      binRepository.findOne.mockResolvedValue(mockBin as any);

      const result = await service.getStockBalance('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toBe(50);
    });

    it('should return 0 if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      const result = await service.getStockBalance('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toBe(0);
    });
  });

  describe('getProjectedQty', () => {
    it('should return projected quantity for item and warehouse', async () => {
      binRepository.findOne.mockResolvedValue(mockBin as any);

      const result = await service.getProjectedQty('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toBe(55);
    });

    it('should return 0 if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      const result = await service.getProjectedQty('ITEM001', 'MAIN', 'tenant-1');

      expect(result).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return paginated bins with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockBin], 1]),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const query = {
        page: 1,
        limit: 10,
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        search: 'test',
      };

      const result = await service.findAll('tenant-1', query);

      expect(result.data).toEqual([mockBin]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('bin.tenant_id = :tenant_id', { tenant_id: 'tenant-1' });
    });
  });

  describe('getStockSummary', () => {
    it('should return stock summary for item', async () => {
      const bins = [
        { ...mockBin, warehouse: { name: 'Main Warehouse' } },
        { ...mockBin, id: 'bin-2', actualQty: 30, warehouse: { name: 'Secondary Warehouse' } },
      ];
      binRepository.find.mockResolvedValue(bins as any);

      const result = await service.getStockSummary('ITEM001', 'tenant-1');

      expect(result.itemCode).toBe('ITEM001');
      expect(result.totalActualQty).toBe(80);
      expect(result.warehouses).toHaveLength(2);
    });
  });

  describe('getLowStockItems', () => {
    it('should return items with low stock', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBin]),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getLowStockItems('tenant-1');

      expect(result).toEqual([mockBin]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('bin.actualQty <= item.safetyStock');
    });
  });

  describe('getOverStockItems', () => {
    it('should return items with over stock', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBin]),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getOverStockItems('tenant-1');

      expect(result).toEqual([mockBin]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('bin.actualQty >= item.maxOrderQty');
    });
  });

  describe('getZeroStockItems', () => {
    it('should return items with zero stock', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBin]),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getZeroStockItems('tenant-1');

      expect(result).toEqual([mockBin]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('bin.actualQty = 0');
    });
  });

  describe('getNegativeStockItems', () => {
    it('should return items with negative stock', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockBin]),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getNegativeStockItems('tenant-1');

      expect(result).toEqual([mockBin]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('bin.actualQty < 0');
    });
  });

  describe('bulkUpdateBins', () => {
    it('should update multiple bins', async () => {
      const updates = [
        { itemCode: 'ITEM001', warehouse: 'MAIN', actualQty: 100 },
        { itemCode: 'ITEM002', warehouse: 'MAIN', actualQty: 50 },
      ];

      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.bulkUpdateBins(updates, 'tenant-1');

      expect(result).toHaveLength(2);
      expect(binRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('create', () => {
    it('should create new bin successfully', async () => {
      const createBinDto = {
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        actualQty: 100,
      };

      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      binRepository.create.mockReturnValue(mockBin as any);
      binRepository.save.mockResolvedValue(mockBin as any);

      const result = await service.create(createBinDto, 'tenant-1', 'user-1');

      expect(result).toEqual(mockBin);
      expect(binRepository.create).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if item not found', async () => {
      const createBinDto = {
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        actualQty: 100,
      };

      itemRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBinDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if warehouse not found', async () => {
      const createBinDto = {
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        actualQty: 100,
      };

      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBinDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      const createBinDto = {
        itemCode: 'ITEM001',
        warehouse: 'MAIN',
        actualQty: 100,
      };

      itemRepository.findOne.mockResolvedValue(mockItem as any);
      warehouseRepository.findOne.mockResolvedValue(mockWarehouse as any);
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBinDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return bin by id', async () => {
      binRepository.findOne.mockResolvedValue(mockBin as any);

      const result = await service.findOne('bin-1', 'tenant-1');

      expect(result).toEqual(mockBin);
      expect(binRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'bin-1', tenant_id: 'tenant-1' },
        relations: ['warehouse', 'tenant'],
      });
    });

    it('should throw NotFoundException if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bin-1', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getBinsByWarehouse', () => {
    it('should return bins by warehouse', async () => {
      binRepository.find.mockResolvedValue([mockBin] as any);

      const result = await service.getBinsByWarehouse('MAIN', 'tenant-1');

      expect(result).toEqual([mockBin]);
      expect(binRepository.find).toHaveBeenCalledWith({
        where: { warehouse_id: 'MAIN', tenant_id: 'tenant-1' },
        relations: ['warehouse', 'tenant'],
      });
    });

    it('should filter out zero stock items when includeZeroStock is false', async () => {
      const binsWithZeroStock = [
        { ...mockBin, actualQty: 50 },
        { ...mockBin, id: 'bin-2', actualQty: 0 },
      ];
      binRepository.find.mockResolvedValue(binsWithZeroStock as any);

      const result = await service.getBinsByWarehouse('MAIN', 'tenant-1', undefined, false);

      expect(result).toHaveLength(1);
      expect(result[0].actualQty).toBe(50);
    });
  });

  describe('reserveQuantity', () => {
    it('should reserve quantity successfully', async () => {
      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.reserveQuantity('bin-1', 10, 'tenant-1');

      expect(result.reservedQty).toBe(15); // 5 + 10
      expect(binToUpdate.updateProjectedQty).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const binWithLowStock = { ...mockBin, actualQty: 10, reservedQty: 5 };
      binRepository.findOne.mockResolvedValue(binWithLowStock as any);

      await expect(service.reserveQuantity('bin-1', 10, 'tenant-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      await expect(service.reserveQuantity('bin-1', 10, 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('unreserveQuantity', () => {
    it('should unreserve quantity successfully', async () => {
      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.unreserveQuantity('bin-1', 3, 'tenant-1');

      expect(result.reservedQty).toBe(2); // 5 - 3
      expect(binToUpdate.updateProjectedQty).toHaveBeenCalled();
      expect(binRepository.save).toHaveBeenCalled();
    });

    it('should not go below zero when unreserving', async () => {
      const binToUpdate = { ...mockBin, updateProjectedQty: jest.fn() };
      binRepository.findOne.mockResolvedValue(binToUpdate as any);
      binRepository.save.mockResolvedValue(binToUpdate as any);

      const result = await service.unreserveQuantity('bin-1', 10, 'tenant-1');

      expect(result.reservedQty).toBe(0); // Math.max(0, 5 - 10)
    });

    it('should throw NotFoundException if bin not found', async () => {
      binRepository.findOne.mockResolvedValue(null);

      await expect(service.unreserveQuantity('bin-1', 3, 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('checkStockAvailability', () => {
    it('should check stock availability for multiple items', async () => {
      const items = [
        { itemCode: 'ITEM001', warehouse: 'MAIN', qty: 20 },
        { itemCode: 'ITEM002', warehouse: 'MAIN', qty: 100 },
      ];

      const bins = [
        { ...mockBin, actualQty: 50, reservedQty: 5 }, // Available: 45
      ];
      binRepository.find.mockResolvedValue(bins as any);

      const result = await service.checkStockAvailability(items, 'tenant-1');

      expect(result).toHaveLength(2);
      expect(result[0].isAvailable).toBe(true); // 20 <= 45
      expect(result[1].isAvailable).toBe(false); // 100 > 45
    });
  });
});