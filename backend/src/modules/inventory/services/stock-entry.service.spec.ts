import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StockEntryService } from './stock-entry.service';
import { StockEntry } from '../entities/stock-entry.entity';
import { StockEntryDetail } from '../entities/stock-entry-detail.entity';
import { StockLedgerEntry } from '../entities/stock-ledger-entry.entity';
import { Item } from '../entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Batch } from '../entities/batch.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { BinService } from './bin.service';

describe('StockEntryService', () => {
  let service: StockEntryService;
  let stockEntryRepository: jest.Mocked<Repository<StockEntry>>;
  let stockEntryDetailRepository: jest.Mocked<Repository<StockEntryDetail>>;
  let stockLedgerEntryRepository: jest.Mocked<Repository<StockLedgerEntry>>;
  let itemRepository: jest.Mocked<Repository<Item>>;
  let warehouseRepository: jest.Mocked<Repository<Warehouse>>;
  let batchRepository: jest.Mocked<Repository<Batch>>;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let binService: jest.Mocked<BinService>;
  let dataSource: jest.Mocked<DataSource>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tenant_id: 'tenant-1',
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
    stockUom: 'Nos',
    description: 'Test item description',
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockBatch = {
    id: 'batch-1',
    name: 'BATCH001',
    itemCode: 'ITEM001',
    tenant_id: 'tenant-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockStockEntry = {
    id: 'stock-entry-1',
    name: 'STE-2024-00001',
    stockEntryType: 'Material Receipt',
    postingDate: new Date(),
    postingTime: '10:00:00',
    purpose: 'Material Receipt',
    company: 'Test Company',
    fromWarehouseId: 'MAIN',
    toWarehouseId: 'STORE',
    docstatus: 0,
    tenant_id: 'tenant-1',
    items: [],
    calculateTotals: jest.fn(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockStockEntryDetail = {
    id: 'detail-1',
    itemCode: 'ITEM001',
    itemName: 'Test Item',
    qty: 10,
    uom: 'Nos',
    stockUom: 'Nos',
    conversionFactor: 1,
    sWarehouse: 'MAIN',
    tWarehouse: 'STORE',
    basicRate: 100,
    actualQty: 10,
    stockEntryId: 'stock-entry-1',
    calculateTransferQty: jest.fn(),
    calculateAmount: jest.fn(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    entityManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as any;

    dataSource = {
      transaction: jest.fn().mockImplementation((callback) => callback(entityManager)),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockEntryService,
        {
          provide: getRepositoryToken(StockEntry),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StockEntryDetail),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StockLedgerEntry),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
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
          provide: getRepositoryToken(Batch),
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
        {
          provide: BinService,
          useValue: {
            getStockBalance: jest.fn(),
            updateBinQty: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<StockEntryService>(StockEntryService);
    stockEntryRepository = module.get(getRepositoryToken(StockEntry));
    stockEntryDetailRepository = module.get(getRepositoryToken(StockEntryDetail));
    stockLedgerEntryRepository = module.get(getRepositoryToken(StockLedgerEntry));
    itemRepository = module.get(getRepositoryToken(Item));
    warehouseRepository = module.get(getRepositoryToken(Warehouse));
    batchRepository = module.get(getRepositoryToken(Batch));
    tenantRepository = module.get(getRepositoryToken(Tenant));
    userRepository = module.get(getRepositoryToken(User));
    binService = module.get(BinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createStockEntryDto = {
      stockEntryType: 'Material Receipt',
      postingDate: '2024-01-01',
      purpose: 'Material Receipt',
      company: 'Test Company',
      fromWarehouse: 'MAIN',
      toWarehouse: 'STORE',
      items: [
        {
          itemCode: 'ITEM001',
          qty: 10,
          basicRate: 100,
          sWarehouse: 'MAIN',
          tWarehouse: 'STORE',
        },
      ],
    };

    it('should create stock entry successfully', async () => {
      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(mockUser) // user
        .mockResolvedValueOnce(mockWarehouse) // fromWarehouse
        .mockResolvedValueOnce(mockWarehouse) // toWarehouse
        .mockResolvedValueOnce(mockItem); // item

      entityManager.create
        .mockReturnValueOnce(mockStockEntry as any) // stock entry
        .mockReturnValueOnce(mockStockEntryDetail as any); // stock entry detail

      entityManager.save
        .mockResolvedValueOnce(mockStockEntry as any) // save stock entry
        .mockResolvedValueOnce([mockStockEntryDetail] as any) // save details
        .mockResolvedValueOnce(mockStockEntry as any); // save updated stock entry

      stockEntryRepository.count.mockResolvedValue(0);

      const result = await service.create(createStockEntryDto, 'tenant-1', 'user-1');

      expect(result).toEqual(mockStockEntry);
      expect(entityManager.findOne).toHaveBeenCalledTimes(5);
      expect(entityManager.create).toHaveBeenCalledTimes(2);
      expect(entityManager.save).toHaveBeenCalledTimes(3);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      entityManager.findOne.mockResolvedValueOnce(null); // tenant not found

      await expect(service.create(createStockEntryDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(null); // user not found

      await expect(service.create(createStockEntryDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if fromWarehouse not found', async () => {
      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(mockUser) // user
        .mockResolvedValueOnce(null); // fromWarehouse not found

      await expect(service.create(createStockEntryDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if toWarehouse not found', async () => {
      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(mockUser) // user
        .mockResolvedValueOnce(mockWarehouse) // fromWarehouse
        .mockResolvedValueOnce(null); // toWarehouse not found

      await expect(service.create(createStockEntryDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if item not found', async () => {
      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(mockUser) // user
        .mockResolvedValueOnce(mockWarehouse) // fromWarehouse
        .mockResolvedValueOnce(mockWarehouse) // toWarehouse
        .mockResolvedValueOnce(null); // item not found

      await expect(service.create(createStockEntryDto, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if batch not found', async () => {
      const dtoWithBatch = {
        ...createStockEntryDto,
        items: [
          {
            ...createStockEntryDto.items[0],
            batchNo: 'BATCH001',
          },
        ],
      };

      entityManager.findOne
        .mockResolvedValueOnce(mockTenant) // tenant
        .mockResolvedValueOnce(mockUser) // user
        .mockResolvedValueOnce(mockWarehouse) // fromWarehouse
        .mockResolvedValueOnce(mockWarehouse) // toWarehouse
        .mockResolvedValueOnce(mockItem) // item
        .mockResolvedValueOnce(null); // batch not found

      await expect(service.create(dtoWithBatch, 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('submit', () => {
    it('should submit stock entry successfully', async () => {
      const stockEntryToSubmit = {
        ...mockStockEntry,
        docstatus: 0,
        items: [mockStockEntryDetail],
      };

      entityManager.findOne.mockResolvedValueOnce(stockEntryToSubmit as any);
      binService.getStockBalance.mockResolvedValue(50); // sufficient stock
      entityManager.create.mockReturnValue({} as any);
      entityManager.save
        .mockResolvedValueOnce([]) // save stock ledger entries
        .mockResolvedValueOnce(stockEntryToSubmit as any); // save updated stock entry

      const result = await service.submit('stock-entry-1', 'tenant-1', 'user-1');

      expect(result.docstatus).toBe(1);
      expect(binService.getStockBalance).toHaveBeenCalled();
      expect(binService.updateBinQty).toHaveBeenCalledTimes(2); // outgoing and incoming
    });

    it('should throw NotFoundException if stock entry not found', async () => {
      entityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.submit('stock-entry-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock entry is not draft', async () => {
      const submittedStockEntry = { ...mockStockEntry, docstatus: 1 };
      entityManager.findOne.mockResolvedValueOnce(submittedStockEntry as any);

      await expect(service.submit('stock-entry-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const stockEntryToSubmit = {
        ...mockStockEntry,
        docstatus: 0,
        items: [{ ...mockStockEntryDetail, qty: 100 }],
      };

      entityManager.findOne.mockResolvedValueOnce(stockEntryToSubmit as any);
      binService.getStockBalance.mockResolvedValue(50); // insufficient stock

      await expect(service.submit('stock-entry-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel stock entry successfully', async () => {
      const stockEntryToCancel = {
        ...mockStockEntry,
        docstatus: 1,
        items: [mockStockEntryDetail],
      };

      const mockStockLedgerEntry = {
        id: 'sle-1',
        voucherNo: 'STE-2024-00001',
        actualQty: 10,
        tenant_id: 'tenant-1',
      };

      entityManager.findOne.mockResolvedValueOnce(stockEntryToCancel as any);
      entityManager.find.mockResolvedValueOnce([mockStockLedgerEntry] as any);
      entityManager.create.mockReturnValue({} as any);
      entityManager.save
        .mockResolvedValueOnce([]) // save reverse entries
        .mockResolvedValueOnce(stockEntryToCancel as any); // save updated stock entry

      const result = await service.cancel('stock-entry-1', 'tenant-1', 'user-1');

      expect(result.docstatus).toBe(2);
      expect(binService.updateBinQty).toHaveBeenCalledTimes(2); // reverse updates
    });

    it('should throw NotFoundException if stock entry not found', async () => {
      entityManager.findOne.mockResolvedValueOnce(null);

      await expect(service.cancel('stock-entry-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock entry is not submitted', async () => {
      const draftStockEntry = { ...mockStockEntry, docstatus: 0 };
      entityManager.findOne.mockResolvedValueOnce(draftStockEntry as any);

      await expect(service.cancel('stock-entry-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated stock entries with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockStockEntry], 1]),
      };

      stockEntryRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const query = {
        page: 1,
        limit: 10,
        stockEntryType: 'Material Receipt',
        purpose: 'Material Receipt',
        company: 'Test Company',
        search: 'STE',
      };

      const result = await service.findAll(query, 'tenant-1');

      expect(result.stockEntries).toEqual([mockStockEntry]);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('stockEntry.tenant_id = :tenant_id', { tenant_id: 'tenant-1' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('stockEntry.stockEntryType = :stockEntryType', { stockEntryType: 'Material Receipt' });
    });
  });

  describe('findOne', () => {
    it('should return stock entry by id', async () => {
      stockEntryRepository.findOne.mockResolvedValue(mockStockEntry as any);

      const result = await service.findOne('stock-entry-1', 'tenant-1');

      expect(result).toEqual(mockStockEntry);
      expect(stockEntryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'stock-entry-1', tenant_id: 'tenant-1' },
        relations: [
          'items',
          'items.item',
          'items.sourceWarehouse',
          'items.targetWarehouse',
          'items.batch',
          'fromWarehouse',
          'toWarehouse',
          'tenant',
          'createdBy',
          'modifiedBy',
        ],
      });
    });

    it('should throw NotFoundException if stock entry not found', async () => {
      stockEntryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('stock-entry-1', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('generateStockEntryName', () => {
    it('should generate stock entry name with correct format', async () => {
      stockEntryRepository.count.mockResolvedValue(5);

      const result = await (service as any).generateStockEntryName('tenant-1');

      expect(result).toMatch(/^STE-\d{4}-\d{5}$/);
      expect(result).toContain('00006'); // count + 1 = 6, padded to 5 digits
    });
  });
});