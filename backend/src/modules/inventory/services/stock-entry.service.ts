import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockEntry, StockEntryPurpose, StockEntryType } from '../entities/stock-entry.entity';
import { StockEntryDetail } from '../entities/stock-entry-detail.entity';
import { StockLedgerEntry, VoucherType } from '../entities/stock-ledger-entry.entity';
import { Item } from '../../../entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Batch } from '../entities/batch.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { BinService } from './bin.service';

export interface CreateStockEntryDto {
  stockEntryType?: StockEntryType;
  postingDate: string;
  postingTime?: string;
  purpose: StockEntryPurpose;
  company?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  isReturn?: boolean;
  workOrder?: string;
  materialRequest?: string;
  deliveryNoteNo?: string;
  purchaseReceiptNo?: string;
  salesInvoiceNo?: string;
  remarks?: string;
  project?: string;
  costCenter?: string;
  addToTransit?: boolean;
  items: CreateStockEntryDetailDto[];
  customFields?: Record<string, any>;
}

export interface CreateStockEntryDetailDto {
  itemCode: string;
  qty: number;
  uom?: string;
  sWarehouse?: string;
  tWarehouse?: string;
  basicRate?: number;
  batchNo?: string;
  serialNo?: string;
  costCenter?: string;
  expenseAccount?: string;
  materialRequest?: string;
  materialRequestItem?: string;
  originalItem?: string;
  additionalCost?: number;
  description?: string;
  retainSample?: number;
  sampleQuantity?: number;
  customFields?: Record<string, any>;
}

export interface UpdateStockEntryDto extends Partial<CreateStockEntryDto> {
  id: string;
}

export interface StockEntryQueryDto {
  stockEntryType?: StockEntryType;
  purpose?: StockEntryPurpose;
  company?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  docstatus?: number;
  isReturn?: boolean;
  workOrder?: string;
  materialRequest?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class StockEntryService {
  constructor(
    @InjectRepository(StockEntry)
    private stockEntryRepository: Repository<StockEntry>,
    @InjectRepository(StockEntryDetail)
    private stockEntryDetailRepository: Repository<StockEntryDetail>,
    @InjectRepository(StockLedgerEntry)
    private stockLedgerEntryRepository: Repository<StockLedgerEntry>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private binService: BinService,
    private dataSource: DataSource,
  ) {}

  async create(createStockEntryDto: CreateStockEntryDto, tenant_id: string, userId?: string): Promise<StockEntry> {
    return await this.dataSource.transaction(async manager => {
      // Verify tenant exists
      const tenant = await manager.findOne(Tenant, { where: { id: tenant_id } });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Verify user if provided
      let user: User | null = null;
      if (userId) {
        user = await manager.findOne(User, { where: { id: userId } });
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      // Validate warehouses
      if (createStockEntryDto.fromWarehouse) {
        const fromWarehouse = await manager.findOne(Warehouse, {
          where: { name: createStockEntryDto.fromWarehouse, tenant_id },
        });
        if (!fromWarehouse) {
          throw new NotFoundException(`From warehouse ${createStockEntryDto.fromWarehouse} not found`);
        }
      }

      if (createStockEntryDto.toWarehouse) {
        const toWarehouse = await manager.findOne(Warehouse, {
          where: { name: createStockEntryDto.toWarehouse, tenant_id },
        });
        if (!toWarehouse) {
          throw new NotFoundException(`To warehouse ${createStockEntryDto.toWarehouse} not found`);
        }
      }

      // Generate stock entry name
      const name = await this.generateStockEntryName(tenant_id);

      // Create stock entry
      const stockEntry = manager.create(StockEntry, {
        name,
        stockEntryType: createStockEntryDto.stockEntryType,
        postingDate: new Date(createStockEntryDto.postingDate),
        postingTime: createStockEntryDto.postingTime || new Date().toTimeString().split(' ')[0],
        purpose: createStockEntryDto.purpose,
        company: createStockEntryDto.company,
        fromWarehouseId: createStockEntryDto.fromWarehouse,
        toWarehouseId: createStockEntryDto.toWarehouse,
        isReturn: createStockEntryDto.isReturn || false,
        workOrder: createStockEntryDto.workOrder,
        materialRequest: createStockEntryDto.materialRequest,
        deliveryNoteNo: createStockEntryDto.deliveryNoteNo,
        purchaseReceiptNo: createStockEntryDto.purchaseReceiptNo,
        salesInvoiceNo: createStockEntryDto.salesInvoiceNo,
        remarks: createStockEntryDto.remarks,
        project: createStockEntryDto.project,
        costCenter: createStockEntryDto.costCenter,
        addToTransit: createStockEntryDto.addToTransit || false,
        customFields: createStockEntryDto.customFields,
        tenant_id,
        createdById: userId,
        docstatus: 0, // Draft
      });

      const savedStockEntry = await manager.save(StockEntry, stockEntry);

      // Create stock entry details
      const stockEntryDetails: StockEntryDetail[] = [];
      for (const itemDto of createStockEntryDto.items) {
        // Verify item exists
        const item = await manager.findOne(Item, {
          where: { code: itemDto.itemCode, tenant: { id: tenant_id } },
        });
        if (!item) {
          throw new NotFoundException(`Item ${itemDto.itemCode} not found`);
        }

        // Verify batch if provided
        if (itemDto.batchNo) {
          const batch = await manager.findOne(Batch, {
            where: { name: itemDto.batchNo, itemCode: itemDto.itemCode, tenant_id },
          });
          if (!batch) {
            throw new NotFoundException(`Batch ${itemDto.batchNo} not found for item ${itemDto.itemCode}`);
          }
        }

        const detail = manager.create(StockEntryDetail, {
          itemCode: itemDto.itemCode,
          itemName: item.name,
          qty: itemDto.qty,
          uom: itemDto.uom || item.stockUom,
          stockUom: item.stockUom,
          conversionFactor: 1, // TODO: Calculate based on UOM conversion
          sWarehouse: itemDto.sWarehouse || createStockEntryDto.fromWarehouse,
          tWarehouse: itemDto.tWarehouse || createStockEntryDto.toWarehouse,
          basicRate: itemDto.basicRate || 0,
          batchNo: itemDto.batchNo,
          serialNo: itemDto.serialNo,
          costCenter: itemDto.costCenter || createStockEntryDto.costCenter,
          expenseAccount: itemDto.expenseAccount,
          materialRequest: itemDto.materialRequest || createStockEntryDto.materialRequest,
          materialRequestItem: itemDto.materialRequestItem,
          originalItem: itemDto.originalItem,
          additionalCost: itemDto.additionalCost || 0,
          description: itemDto.description || item.description,
          retainSample: itemDto.retainSample,
          sampleQuantity: itemDto.sampleQuantity,
          customFields: itemDto.customFields,
          stockEntry: savedStockEntry,
          stockEntryId: savedStockEntry.id,
          item,
        });

        detail.calculateTransferQty();
        detail.calculateAmount();
        stockEntryDetails.push(detail);
      }

      await manager.save(StockEntryDetail, stockEntryDetails);
      savedStockEntry.items = stockEntryDetails;
      savedStockEntry.calculateTotals();
      await manager.save(StockEntry, savedStockEntry);

      return savedStockEntry;
    });
  }

  async submit(id: string, tenant_id: string, userId?: string): Promise<StockEntry> {
    return await this.dataSource.transaction(async manager => {
      const stockEntry = await manager.findOne(StockEntry, {
        where: { id, tenant_id },
        relations: ['items', 'items.item'],
      });

      if (!stockEntry) {
        throw new NotFoundException('Stock entry not found');
      }

      if (stockEntry.docstatus !== 0) {
        throw new BadRequestException('Only draft stock entries can be submitted');
      }

      // Validate stock availability for outgoing items
      for (const item of stockEntry.items) {
        if (item.sWarehouse && item.qty > 0) {
          const currentStock = await this.binService.getStockBalance(item.itemCode, item.sWarehouse, tenant_id);
          if (currentStock < item.qty) {
            throw new BadRequestException(
              `Insufficient stock for item ${item.itemCode} in warehouse ${item.sWarehouse}. Available: ${currentStock}, Required: ${item.qty}`
            );
          }
        }
      }

      // Create stock ledger entries
      const stockLedgerEntries: StockLedgerEntry[] = [];
      for (const item of stockEntry.items) {
        // Outgoing entry
        if (item.sWarehouse && item.qty > 0) {
          const outgoingEntry = manager.create(StockLedgerEntry, {
            itemCode: item.itemCode,
            warehouse: item.sWarehouse,
            postingDate: stockEntry.postingDate,
            postingTime: stockEntry.postingTime,
            voucherType: VoucherType.STOCK_ENTRY,
            voucherNo: stockEntry.name,
            voucherDetailNo: item.id,
            actualQty: -item.actualQty,
            outgoingRate: item.basicRate || 0,
            stockUom: item.stockUom,
            serialNo: item.serialNo,
            batchNo: item.batchNo,
            project: stockEntry.project,
            company: stockEntry.company,
            isSubmitted: true,
            hasSerialNo: !!item.serialNo,
            hasBatchNo: !!item.batchNo,
            tenant_id,
          });
          stockLedgerEntries.push(outgoingEntry);
        }

        // Incoming entry
        if (item.tWarehouse && item.qty > 0) {
          const incomingEntry = manager.create(StockLedgerEntry, {
            itemCode: item.itemCode,
            warehouse: item.tWarehouse,
            postingDate: stockEntry.postingDate,
            postingTime: stockEntry.postingTime,
            voucherType: VoucherType.STOCK_ENTRY,
            voucherNo: stockEntry.name,
            voucherDetailNo: item.id,
            actualQty: item.actualQty,
            incomingRate: item.basicRate || 0,
            stockUom: item.stockUom,
            serialNo: item.serialNo,
            batchNo: item.batchNo,
            project: stockEntry.project,
            company: stockEntry.company,
            isSubmitted: true,
            hasSerialNo: !!item.serialNo,
            hasBatchNo: !!item.batchNo,
            tenant_id,
          });
          stockLedgerEntries.push(incomingEntry);
        }
      }

      // Calculate stock balances and valuation rates
      for (const entry of stockLedgerEntries) {
        const previousBalance = await this.binService.getStockBalance(entry.itemCode, entry.warehouse, tenant_id);
        entry.updateQtyAfterTransaction(previousBalance);
        
        // TODO: Implement proper valuation rate calculation
        entry.setValuationRate(entry.incomingRate || entry.outgoingRate || 0);
      }

      await manager.save(StockLedgerEntry, stockLedgerEntries);

      // Update bin quantities
      for (const item of stockEntry.items) {
        if (item.sWarehouse && item.qty > 0) {
          await this.binService.updateBinQty(item.itemCode, item.sWarehouse, -item.actualQty, 'actual', tenant_id);
        }
        if (item.tWarehouse && item.qty > 0) {
          await this.binService.updateBinQty(item.itemCode, item.tWarehouse, item.actualQty, 'actual', tenant_id);
        }
      }

      // Update stock entry status
      stockEntry.docstatus = 1;
      stockEntry.perTransferred = 100;
      if (userId) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (user) {
          stockEntry.modifiedBy = user;
          stockEntry.modifiedById = userId;
        }
      }

      return await manager.save(StockEntry, stockEntry);
    });
  }

  async cancel(id: string, tenant_id: string, userId?: string): Promise<StockEntry> {
    return await this.dataSource.transaction(async manager => {
      const stockEntry = await manager.findOne(StockEntry, {
        where: { id, tenant_id },
        relations: ['items'],
      });

      if (!stockEntry) {
        throw new NotFoundException('Stock entry not found');
      }

      if (stockEntry.docstatus !== 1) {
        throw new BadRequestException('Only submitted stock entries can be cancelled');
      }

      // Create reverse stock ledger entries
      const stockLedgerEntries = await manager.find(StockLedgerEntry, {
        where: { voucherNo: stockEntry.name, tenant_id },
      });

      const reverseEntries: StockLedgerEntry[] = [];
      for (const entry of stockLedgerEntries) {
        const reverseEntry = manager.create(StockLedgerEntry, {
          ...entry,
          id: undefined, // Let TypeORM generate new ID
          actualQty: -entry.actualQty,
          isCancelled: true,
        });
        reverseEntries.push(reverseEntry);
      }

      await manager.save(StockLedgerEntry, reverseEntries);

      // Reverse bin quantity updates
      for (const item of stockEntry.items) {
        if (item.sWarehouse && item.qty > 0) {
          await this.binService.updateBinQty(item.itemCode, item.sWarehouse, item.actualQty, 'actual', tenant_id);
        }
        if (item.tWarehouse && item.qty > 0) {
          await this.binService.updateBinQty(item.itemCode, item.tWarehouse, -item.actualQty, 'actual', tenant_id);
        }
      }

      // Update stock entry status
      stockEntry.docstatus = 2;
      if (userId) {
        const user = await manager.findOne(User, { where: { id: userId } });
        if (user) {
          stockEntry.modifiedBy = user;
          stockEntry.modifiedById = userId;
        }
      }

      return await manager.save(StockEntry, stockEntry);
    });
  }

  async findAll(query: StockEntryQueryDto, tenant_id: string): Promise<{ stockEntries: StockEntry[]; total: number }> {
    const queryBuilder = this.stockEntryRepository
      .createQueryBuilder('stockEntry')
      .leftJoinAndSelect('stockEntry.items', 'items')
      .leftJoinAndSelect('stockEntry.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('stockEntry.toWarehouse', 'toWarehouse')
      .where('stockEntry.tenant_id = :tenant_id', { tenant_id });

    // Apply filters
    if (query.stockEntryType) {
      queryBuilder.andWhere('stockEntry.stockEntryType = :stockEntryType', { stockEntryType: query.stockEntryType });
    }

    if (query.purpose) {
      queryBuilder.andWhere('stockEntry.purpose = :purpose', { purpose: query.purpose });
    }

    if (query.company) {
      queryBuilder.andWhere('stockEntry.company = :company', { company: query.company });
    }

    if (query.fromWarehouse) {
      queryBuilder.andWhere('stockEntry.fromWarehouseId = :fromWarehouse', { fromWarehouse: query.fromWarehouse });
    }

    if (query.toWarehouse) {
      queryBuilder.andWhere('stockEntry.toWarehouseId = :toWarehouse', { toWarehouse: query.toWarehouse });
    }

    if (query.docstatus !== undefined) {
      queryBuilder.andWhere('stockEntry.docstatus = :docstatus', { docstatus: query.docstatus });
    }

    if (query.isReturn !== undefined) {
      queryBuilder.andWhere('stockEntry.isReturn = :isReturn', { isReturn: query.isReturn });
    }

    if (query.workOrder) {
      queryBuilder.andWhere('stockEntry.workOrder = :workOrder', { workOrder: query.workOrder });
    }

    if (query.materialRequest) {
      queryBuilder.andWhere('stockEntry.materialRequest = :materialRequest', { materialRequest: query.materialRequest });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('stockEntry.postingDate >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      queryBuilder.andWhere('stockEntry.postingDate <= :toDate', { toDate: query.toDate });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(stockEntry.name ILIKE :search OR stockEntry.remarks ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('stockEntry.postingDate', 'DESC').addOrderBy('stockEntry.createdAt', 'DESC');

    const [stockEntries, total] = await queryBuilder.getManyAndCount();

    return { stockEntries, total };
  }

  async findOne(id: string, tenant_id: string): Promise<StockEntry> {
    const stockEntry = await this.stockEntryRepository.findOne({
      where: { id, tenant_id },
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

    if (!stockEntry) {
      throw new NotFoundException('Stock entry not found');
    }

    return stockEntry;
  }

  private async generateStockEntryName(tenant_id: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.stockEntryRepository.count({
      where: { tenant_id },
    });
    return `STE-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}