import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Item } from '../../../entities/item.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Bin } from '../entities/bin.entity';
import { StockEntry } from '../entities/stock-entry.entity';
import { StockLedgerEntry } from '../entities/stock-ledger-entry.entity';
import { Batch } from '../entities/batch.entity';
import { SerialNo } from '../entities/serial-no.entity';
import { DepartmentAccessService } from '../../../common/services/department-access.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemQueryDto } from '../dto/item-query.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let itemRepository: jest.Mocked<Repository<Item>>;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let warehouseRepository: jest.Mocked<Repository<Warehouse>>;
  let binRepository: jest.Mocked<Repository<Bin>>;
  let stockEntryRepository: jest.Mocked<Repository<StockEntry>>;
  let stockLedgerRepository: jest.Mocked<Repository<StockLedgerEntry>>;
  let batchRepository: jest.Mocked<Repository<Batch>>;
  let serialNoRepository: jest.Mocked<Repository<SerialNo>>;
  let departmentAccessService: jest.Mocked<DepartmentAccessService>;
  let mockRequest: any;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    subdomain: 'test',
  };

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    tenant_id: 'tenant-1',
    department_id: 'dept-1',
  };

  const mockItem = {
    id: 'item-1',
    code: 'ITEM001',
    name: 'Test Item',
    type: 'Product',
    status: 'Active',
    tenant: mockTenant,
    department_id: 'dept-1',
    createdById: 'user-1',
    safetyStock: 10,
    minOrderQty: 5,
    stockUom: 'Nos',
    valuationRate: 100,
    isMaintainStock: true,
  };

  beforeEach(async () => {
    const mockRepositoryFactory = () => ({
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
        getMany: jest.fn(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      })),
    });

    mockRequest = {
      tenant_id: 'tenant-1',
      user: mockUser,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Item),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Tenant),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Warehouse),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Bin),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(StockEntry),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(StockLedgerEntry),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Batch),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(SerialNo),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: DepartmentAccessService,
          useValue: {
            getDefaultDepartmentForUser: jest.fn(),
            canModifyItemForDepartment: jest.fn(),
            canAccessAllDepartments: jest.fn(),
            getAccessibleDepartmentIds: jest.fn(),
            canAccessDepartment: jest.fn(),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    itemRepository = module.get(getRepositoryToken(Item));
    tenantRepository = module.get(getRepositoryToken(Tenant));
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
    binRepository = module.get(getRepositoryToken(Bin));
    stockEntryRepository = module.get(getRepositoryToken(StockEntry));
    stockLedgerRepository = module.get(getRepositoryToken(StockLedgerEntry));
    batchRepository = module.get(getRepositoryToken(Batch));
    serialNoRepository = module.get(getRepositoryToken(SerialNo));
    departmentAccessService = module.get(DepartmentAccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createItem', () => {
    const createItemDto: CreateItemDto = {
      code: 'ITEM001',
      name: 'Test Item',
      type: 'Product',
      status: 'Active',
      department_id: 'dept-1',
    };

    it('should create an item successfully', async () => {
      itemRepository.findOne.mockResolvedValue(null);
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      departmentAccessService.canModifyItemForDepartment.mockReturnValue(true);
      itemRepository.create.mockReturnValue(mockItem as any);
      itemRepository.save.mockResolvedValue(mockItem as any);

      const result = await service.createItem(createItemDto, 'tenant-1', 'user-1');

      expect(result).toEqual(mockItem);
      expect(itemRepository.findOne).toHaveBeenCalledWith({
        where: { code: createItemDto.code, tenant: { id: 'tenant-1' } },
      });
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
      expect(itemRepository.create).toHaveBeenCalledWith({
        ...createItemDto,
        tenant: mockTenant,
        createdById: 'user-1',
        department_id: 'dept-1',
      });
      expect(itemRepository.save).toHaveBeenCalledWith(mockItem);
    });

    it('should throw BadRequestException if item code already exists', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem as any);

      await expect(service.createItem(createItemDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(itemRepository.findOne).toHaveBeenCalledWith({
        where: { code: createItemDto.code, tenant: { id: 'tenant-1' } },
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      itemRepository.findOne.mockResolvedValue(null);
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.createItem(createItemDto, 'tenant-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(tenantRepository.findOne).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
    });

    it('should throw BadRequestException if user cannot modify item for department', async () => {
      itemRepository.findOne.mockResolvedValue(null);
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      departmentAccessService.canModifyItemForDepartment.mockReturnValue(false);

      await expect(service.createItem(createItemDto, 'tenant-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(departmentAccessService.canModifyItemForDepartment).toHaveBeenCalledWith(
        mockUser,
        'dept-1',
      );
    });

    it('should use default department if none specified', async () => {
      const createItemDtoWithoutDept = { ...createItemDto };
      delete createItemDtoWithoutDept.department_id;

      itemRepository.findOne.mockResolvedValue(null);
      tenantRepository.findOne.mockResolvedValue(mockTenant as any);
      departmentAccessService.getDefaultDepartmentForUser.mockReturnValue('default-dept');
      departmentAccessService.canModifyItemForDepartment.mockReturnValue(true);
      itemRepository.create.mockReturnValue(mockItem as any);
      itemRepository.save.mockResolvedValue(mockItem as any);

      await service.createItem(createItemDtoWithoutDept, 'tenant-1', 'user-1');

      expect(departmentAccessService.getDefaultDepartmentForUser).toHaveBeenCalledWith(mockUser);
      expect(itemRepository.create).toHaveBeenCalledWith({
        ...createItemDtoWithoutDept,
        tenant: mockTenant,
        createdById: 'user-1',
        department_id: 'default-dept',
      });
    });
  });

  describe('findAllItems', () => {
    const query: ItemQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
      type: 'Product',
      status: 'Active',
    };

    it('should return items with pagination', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockItem], 1]),
      };

      itemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(true);

      const result = await service.findAllItems(query, 'tenant-1');

      expect(result).toEqual({ items: [mockItem], total: 1 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('tenant.id = :tenant_id', {
        tenant_id: 'tenant-1',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item.name LIKE :search', {
        search: '%test%',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item.type = :type', { type: 'Product' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item.status = :status', {
        status: 'Active',
      });
    });

    it('should apply department filtering for restricted users', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockItem], 1]),
      };

      itemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue(['dept-1', 'dept-2']);

      const result = await service.findAllItems(query, 'tenant-1');

      expect(result).toEqual({ items: [mockItem], total: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(item.department_id IN (:...departmentIds) OR item.department_id IS NULL)',
        { departmentIds: ['dept-1', 'dept-2'] },
      );
    });

    it('should return empty result if user has no department access', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      itemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      departmentAccessService.canAccessAllDepartments.mockReturnValue(false);
      departmentAccessService.getAccessibleDepartmentIds.mockReturnValue([]);

      const result = await service.findAllItems(query, 'tenant-1');

      expect(result).toEqual({ items: [], total: 0 });
    });
  });

  describe('findOneItem', () => {
    it('should return an item if found and user has access', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.findOneItem('item-1', 'tenant-1');

      expect(result).toEqual(mockItem);
      expect(itemRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'item-1', tenant: { id: 'tenant-1' } },
        relations: ['createdBy', 'modifiedBy'],
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      itemRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneItem('item-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user cannot access department', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(false);

      await expect(service.findOneItem('item-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(departmentAccessService.canAccessDepartment).toHaveBeenCalledWith(mockUser, 'dept-1');
    });
  });

  describe('updateItem', () => {
    const updateItemDto: UpdateItemDto = {
      name: 'Updated Item',
      code: 'ITEM002',
      department_id: 'dept-2',
    };

    it('should update an item successfully', async () => {
      const updatedItem = { ...mockItem, ...updateItemDto, modifiedById: 'user-1' };
      
      itemRepository.findOne.mockResolvedValueOnce(mockItem as any); // findOneItem call
      itemRepository.findOne.mockResolvedValueOnce(null); // code uniqueness check
      departmentAccessService.canAccessDepartment.mockReturnValue(true);
      departmentAccessService.canModifyItemForDepartment.mockReturnValue(true);
      itemRepository.save.mockResolvedValue(updatedItem as any);

      const result = await service.updateItem('item-1', updateItemDto, 'tenant-1', 'user-1');

      expect(result).toEqual(updatedItem);
      expect(itemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockItem,
          ...updateItemDto,
          modifiedById: 'user-1',
        }),
      );
    });

    it('should throw BadRequestException if new code already exists', async () => {
      const existingItem = { ...mockItem, id: 'item-2' };
      
      itemRepository.findOne.mockResolvedValueOnce(mockItem as any); // findOneItem call
      itemRepository.findOne.mockResolvedValueOnce(existingItem as any); // code uniqueness check
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      await expect(
        service.updateItem('item-1', updateItemDto, 'tenant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user cannot modify target department', async () => {
      itemRepository.findOne.mockResolvedValueOnce(mockItem as any); // findOneItem call
      itemRepository.findOne.mockResolvedValueOnce(null); // code uniqueness check
      departmentAccessService.canAccessDepartment.mockReturnValue(true);
      departmentAccessService.canModifyItemForDepartment.mockReturnValue(false);

      await expect(
        service.updateItem('item-1', updateItemDto, 'tenant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
      expect(departmentAccessService.canModifyItemForDepartment).toHaveBeenCalledWith(
        mockUser,
        'dept-2',
      );
    });
  });

  describe('removeItem', () => {
    it('should remove an item successfully', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);
      itemRepository.remove.mockResolvedValue(mockItem as any);

      await service.removeItem('item-1', 'tenant-1');

      expect(itemRepository.remove).toHaveBeenCalledWith(mockItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      itemRepository.findOne.mockResolvedValue(null);

      await expect(service.removeItem('item-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockLevels', () => {
    it('should return stock levels for an item', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem as any);
      departmentAccessService.canAccessDepartment.mockReturnValue(true);

      const result = await service.getStockLevels('item-1', 'tenant-1');

      expect(result).toEqual({
        itemId: 'item-1',
        itemCode: 'ITEM001',
        itemName: 'Test Item',
        currentStock: 0,
        safetyStock: 10,
        minOrderQty: 5,
        stockUom: 'Nos',
        valuationRate: 100,
        stockValue: 0,
      });
    });
  });

  describe('getDashboardData', () => {
    it('should return dashboard data', async () => {
      const mockStockValueResult = { totalValue: '1000' };
      const mockRecentTransactions = [
        {
          id: 'sle-1',
          voucherType: 'Stock Entry',
          itemCode: 'ITEM001',
          actualQty: 10,
          warehouseCode: 'WH001',
          postingDate: new Date(),
          voucherNo: 'SE-001',
        },
      ];
      const mockStockSummary = [
        {
          warehouseCode: 'WH001',
          totalItems: '5',
          totalStockValue: '1000',
          lowStockItems: '2',
        },
      ];

      itemRepository.count.mockResolvedValue(100);
      warehouseRepository.count.mockResolvedValue(5);
      binRepository.count.mockResolvedValueOnce(3); // lowStockItems
      binRepository.count.mockResolvedValueOnce(1); // outOfStockItems
      stockEntryRepository.count.mockResolvedValue(2);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStockValueResult),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecentTransactions),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStockSummary),
      };

      binRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      stockLedgerRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getDashboardData('tenant-1');

      expect(result).toEqual({
        totalItems: 100,
        totalWarehouses: 5,
        totalStockValue: 1000,
        lowStockItems: 3,
        outOfStockItems: 1,
        pendingStockEntries: 2,
        recentTransactions: mockRecentTransactions,
        stockSummary: mockStockSummary,
      });
    });
  });

  describe('getLowStockReport', () => {
    it('should return low stock items', async () => {
      const lowStockItems = [mockItem];
      itemRepository.find.mockResolvedValue(lowStockItems as any);

      const result = await service.getLowStockReport('tenant-1');

      expect(result).toEqual(lowStockItems);
      expect(itemRepository.find).toHaveBeenCalledWith({
        where: {
          tenant: { id: 'tenant-1' },
          status: 'Active',
          isMaintainStock: true,
        },
        order: { safetyStock: 'DESC' },
      });
    });
  });

  describe('getValuationReport', () => {
    it('should return valuation report', async () => {
      const items = [mockItem];
      itemRepository.find.mockResolvedValue(items as any);

      const result = await service.getValuationReport('tenant-1');

      expect(result).toEqual([
        {
          ...mockItem,
          currentStock: 0,
          stockValue: 0,
        },
      ]);
    });
  });
});