import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Between } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Bin } from '../entities/bin.entity';
import { StockEntry, StockEntryType, StockEntryPurpose } from '../entities/stock-entry.entity';
import { StockLedgerEntry } from '../entities/stock-ledger-entry.entity';
import { Batch } from '../entities/batch.entity';
import { SerialNo } from '../entities/serial-no.entity';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemQueryDto } from '../dto/item-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Bin)
    private binRepository: Repository<Bin>,
    @InjectRepository(StockEntry)
    private stockEntryRepository: Repository<StockEntry>,
    @InjectRepository(StockLedgerEntry)
    private stockLedgerRepository: Repository<StockLedgerEntry>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(SerialNo)
    private serialNoRepository: Repository<SerialNo>,
  ) {}

  async createItem(createItemDto: CreateItemDto, tenant_id: string, userId: string): Promise<Item> {
    // Check if item code already exists for this tenant
    const existingItem = await this.itemRepository.findOne({
      where: { code: createItemDto.code, tenant: { id: tenant_id } },
    });

    if (existingItem) {
      throw new BadRequestException('Item code already exists');
    }

    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenant_id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create item with tenant relationship
    const item = this.itemRepository.create({
      ...createItemDto,
      tenant,
      createdById: userId,
    });

    return await this.itemRepository.save(item);
  }

  async findAllItems(query: ItemQueryDto, tenant_id: string): Promise<{ items: Item[]; total: number }> {
    const { page = 1, limit = 10, search, type, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.itemRepository.createQueryBuilder('item')
      .leftJoinAndSelect('item.tenant', 'tenant')
      .leftJoinAndSelect('item.createdBy', 'createdBy')
      .leftJoinAndSelect('item.modifiedBy', 'modifiedBy')
      .where('tenant.id = :tenant_id', { tenant_id });

    if (search) {
      queryBuilder.andWhere('item.name LIKE :search', { search: `%${search}%` });
    }

    if (type) {
      queryBuilder.andWhere('item.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('item.status = :status', { status });
    }

    queryBuilder
      .orderBy(`item.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOneItem(id: string, tenant_id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id, tenant: { id: tenant_id } },
      relations: ['createdBy', 'modifiedBy'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async updateItem(id: string, updateItemDto: UpdateItemDto, tenant_id: string, userId: string): Promise<Item> {
    const item = await this.findOneItem(id, tenant_id);

    // Check if item code is being changed and if it already exists
    if (updateItemDto.code && updateItemDto.code !== item.code) {
      const existingItem = await this.itemRepository.findOne({
        where: { code: updateItemDto.code, tenant: { id: tenant_id } },
      });

      if (existingItem) {
        throw new BadRequestException('Item code already exists');
      }
    }

    Object.assign(item, updateItemDto);
    item.modifiedById = userId;

    return this.itemRepository.save(item);
  }

  async removeItem(id: string, tenant_id: string): Promise<void> {
    const item = await this.findOneItem(id, tenant_id);
    await this.itemRepository.remove(item);
  }

  async getStockLevels(id: string, tenant_id: string): Promise<any> {
    const item = await this.findOneItem(id, tenant_id);
    
    // This would typically involve stock ledger entries
    // For now, return basic stock information
    return {
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      currentStock: 0, // Would be calculated from stock entries
      safetyStock: item.safetyStock,
      minOrderQty: item.minOrderQty,
      stockUom: item.stockUom,
      valuationRate: item.valuationRate,
      stockValue: 0, // Would be calculated
    };
  }

  async getDashboardData(tenant_id: string, company?: string): Promise<{
    totalItems: number;
    totalWarehouses: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    pendingStockEntries: number;
    recentTransactions: any[];
    stockSummary: any[];
  }> {
    const whereClause: any = { tenant_id };
    if (company) {
      whereClause.company = company;
    }

    // Get basic counts
    const totalItems = await this.itemRepository.count({ where: { tenant: { id: tenant_id } } });
    const totalWarehouses = await this.warehouseRepository.count({ where: whereClause });
    
    // Get stock value from bins
    const stockValueResult = await this.binRepository
      .createQueryBuilder('bin')
      .select('SUM(bin.actualQty * bin.valuationRate)', 'totalValue')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere(company ? 'bin.company = :company' : '1=1', { company })
      .getRawOne();
    
    const totalStockValue = parseFloat(stockValueResult?.totalValue || '0');

    // Get low stock and out of stock items
    const lowStockItems = await this.binRepository.count({
      where: {
        tenant_id,
        ...(company && { company }),
        actualQty: Between(0.01, 10), // Assuming low stock threshold
      },
    });

    const outOfStockItems = await this.binRepository.count({
      where: {
        tenant_id,
        ...(company && { company }),
        actualQty: 0,
      },
    });

    // Get pending stock entries
    const pendingStockEntries = await this.stockEntryRepository.count({
      where: {
        tenant_id,
        ...(company && { company }),
        docstatus: 0, // Draft status
      },
    });

    // Get recent transactions
    const recentTransactions = await this.stockLedgerRepository
      .createQueryBuilder('sle')
      .select([
        'sle.id',
        'sle.voucherType',
        'sle.itemCode',
        'sle.actualQty',
        'sle.warehouseCode',
        'sle.postingDate',
        'sle.voucherNo',
      ])
      .where('sle.tenant_id = :tenant_id', { tenant_id })
      .andWhere(company ? 'sle.company = :company' : '1=1', { company })
      .orderBy('sle.postingDate', 'DESC')
      .limit(10)
      .getMany();

    // Get stock summary by warehouse
    const stockSummary = await this.binRepository
      .createQueryBuilder('bin')
      .select([
        'warehouse.name as warehouseCode',
        'COUNT(DISTINCT bin.itemCode) as totalItems',
        'SUM(bin.actualQty * bin.valuationRate) as totalStockValue',
        'COUNT(CASE WHEN bin.actualQty <= 10 AND bin.actualQty > 0 THEN 1 END) as lowStockItems',
      ])
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere(company ? 'bin.company = :company' : '1=1', { company })
      .leftJoin('bin.warehouse', 'warehouse')
      .groupBy('warehouse.name')
      .getRawMany();

    return {
      totalItems,
      totalWarehouses,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      pendingStockEntries,
      recentTransactions,
      stockSummary,
    };
  }

  async getLowStockReport(tenant_id: string): Promise<Item[]> {
    // This would typically check against safety stock levels
    // For now, return items with safety stock > 0
    return this.itemRepository.find({
      where: { 
        tenant: { id: tenant_id }, 
        status: 'Active',
        isMaintainStock: true 
      },
      order: { safetyStock: 'DESC' },
    });
  }

  async getValuationReport(tenant_id: string): Promise<any> {
    const items = await this.itemRepository.find({
      where: { tenant: { id: tenant_id }, status: 'Active', isMaintainStock: true },
      select: ['id', 'code', 'name', 'valuationRate', 'stockUom'],
    });

    return items.map(item => ({
      ...item,
      currentStock: 0, // Would be calculated from stock entries
      stockValue: 0, // Would be calculated
    }));
  }

  async getStockSummary(
    query: {
      company?: string;
      warehouseCode?: string;
      itemGroup?: string;
      includeZeroStock?: boolean;
    },
    tenant_id: string,
  ): Promise<{
    summary: any[];
    totals: {
      totalItems: number;
      totalStockValue: number;
      totalWarehouses: number;
    };
  }> {
    const queryBuilder = this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouse', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id });

    if (query.company) {
      queryBuilder.andWhere('bin.company = :company', { company: query.company });
    }

    if (query.warehouseCode) {
      queryBuilder.andWhere('warehouse.name = :warehouseCode', { warehouseCode: query.warehouseCode });
    }

    if (query.itemGroup) {
      queryBuilder.andWhere('item.itemGroup = :itemGroup', { itemGroup: query.itemGroup });
    }

    if (!query.includeZeroStock) {
      queryBuilder.andWhere('bin.actualQty > 0');
    }

    const bins = await queryBuilder.getMany();

    // Group by item
    const itemSummary = bins.reduce((acc, bin) => {
      const key = bin.itemCode;
      if (!acc[key]) {
        acc[key] = {
          itemCode: bin.itemCode,
          itemName: bin.item?.name || '',
          itemGroup: bin.item?.itemGroup || '',
          stockUom: bin.item?.stockUom || '',
          totalStock: 0,
          totalValue: 0,
          warehouses: [],
        };
      }

      acc[key].totalStock += bin.actualQty;
      acc[key].totalValue += bin.actualQty * bin.valuationRate;
      acc[key].warehouses.push({
        warehouseCode: bin.warehouse?.name || '',
        actualQty: bin.actualQty,
        projectedQty: bin.projectedQty,
        reservedQty: bin.reservedQty,
        valuationRate: bin.valuationRate,
        stockValue: bin.actualQty * bin.valuationRate,
      });

      return acc;
    }, {});

    const summary = Object.values(itemSummary);
    const totalItems = summary.length;
    const totalStockValue = summary.reduce((sum: number, item: any) => sum + (item.totalValue || 0), 0) as number;
    const totalWarehouses = new Set(bins.map(bin => bin.warehouse?.name)).size;

    return {
      summary,
      totals: {
        totalItems,
        totalStockValue,
        totalWarehouses,
      },
    };
  }

  async getStockLedger(
    query: {
      itemCode?: string;
      warehouseCode?: string;
      company?: string;
      fromDate?: string;
      toDate?: string;
      voucherType?: string;
      voucherNo?: string;
      page?: number;
      limit?: number;
    },
    tenant_id: string,
  ): Promise<{
    entries: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.stockLedgerRepository
      .createQueryBuilder('sle')
      .where('sle.tenant_id = :tenant_id', { tenant_id })
      .orderBy('sle.postingDate', 'DESC')
      .addOrderBy('sle.postingTime', 'DESC');

    if (query.itemCode) {
      queryBuilder.andWhere('sle.itemCode = :itemCode', { itemCode: query.itemCode });
    }

    if (query.warehouseCode) {
      queryBuilder.andWhere('sle.warehouseCode = :warehouseCode', { warehouseCode: query.warehouseCode });
    }

    if (query.company) {
      queryBuilder.andWhere('sle.company = :company', { company: query.company });
    }

    if (query.fromDate) {
      queryBuilder.andWhere('sle.postingDate >= :fromDate', { fromDate: query.fromDate });
    }

    if (query.toDate) {
      queryBuilder.andWhere('sle.postingDate <= :toDate', { toDate: query.toDate });
    }

    if (query.voucherType) {
      queryBuilder.andWhere('sle.voucherType = :voucherType', { voucherType: query.voucherType });
    }

    if (query.voucherNo) {
      queryBuilder.andWhere('sle.voucherNo = :voucherNo', { voucherNo: query.voucherNo });
    }

    const [entries, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      entries,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async performStockReconciliation(
    reconciliationDto: {
      company: string;
      warehouseCode?: string;
      items: Array<{
        itemCode: string;
        warehouseCode: string;
        actualQty: number;
        valuationRate?: number;
      }>;
      postingDate?: string;
      remarks?: string;
    },
    tenant_id: string,
    userId: string,
  ): Promise<{
    reconciliationId: string;
    itemsProcessed: number;
    adjustmentsCreated: number;
    totalValueAdjustment: number;
    status: string;
  }> {
    const reconciliationId = `REC-${Date.now()}`;
    let adjustmentsCreated = 0;
    let totalValueAdjustment = 0;

    for (const item of reconciliationDto.items) {
      // Find existing bin
      const bin = await this.binRepository.findOne({
        where: {
          itemCode: item.itemCode,
          warehouse: { name: item.warehouseCode },
          tenant_id,
        },
        relations: ['warehouse'],
      });

      if (bin) {
        const qtyDifference = item.actualQty - bin.actualQty;
        if (Math.abs(qtyDifference) > 0.001) {
          // Create stock entry for adjustment
          const stockEntry = this.stockEntryRepository.create({
            name: `${reconciliationId}-${adjustmentsCreated + 1}`,
            stockEntryType: qtyDifference > 0 ? StockEntryType.MATERIAL_RECEIPT : StockEntryType.MATERIAL_ISSUE,
            purpose: StockEntryPurpose.MATERIAL_RECEIPT,
            company: reconciliationDto.company,
            postingDate: reconciliationDto.postingDate || new Date().toISOString().split('T')[0],
            postingTime: new Date().toTimeString().split(' ')[0],
            docstatus: 1, // Submitted
            tenant_id,
            createdById: userId,
            modifiedById: userId,
          });

          await this.stockEntryRepository.save(stockEntry);

          // Update bin quantity
          bin.actualQty = item.actualQty;
          bin.projectedQty = item.actualQty + bin.orderedQty - bin.reservedQty;
          if (item.valuationRate) {
            bin.valuationRate = item.valuationRate;
          }
          // bin.modifiedById = userId; // Property doesn't exist on Bin entity
          await this.binRepository.save(bin);

          adjustmentsCreated++;
          totalValueAdjustment += qtyDifference * (item.valuationRate || bin.valuationRate);
        }
      }
    }

    return {
      reconciliationId,
      itemsProcessed: reconciliationDto.items.length,
      adjustmentsCreated,
      totalValueAdjustment,
      status: 'Completed',
    };
  }

  async getAgingReport(
    query: {
      company?: string;
      warehouseCode?: string;
      itemGroup?: string;
      agingBasis?: 'fifo' | 'lifo';
    },
    tenant_id: string,
  ): Promise<{
    report: any[];
    summary: {
      totalItems: number;
      totalValue: number;
      avgAge: number;
      agingDistribution: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '91-180': number;
        '180+': number;
      };
    };
  }> {
    // This is a simplified implementation
    // In a real system, you'd calculate aging based on stock ledger entries
    const bins = await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty > 0')
      .getMany();

    const report = bins.map(bin => {
      const avgAge = Math.floor(Math.random() * 365); // Placeholder calculation
      const stockValue = bin.actualQty * bin.valuationRate;

      return {
        itemCode: bin.itemCode,
        itemName: bin.item?.name || '',
        warehouseCode: bin.warehouse?.name || '',
        qty: bin.actualQty,
        stockValue,
        avgAge,
        agingBrackets: {
          '0-30': avgAge <= 30 ? stockValue : 0,
          '31-60': avgAge > 30 && avgAge <= 60 ? stockValue : 0,
          '61-90': avgAge > 60 && avgAge <= 90 ? stockValue : 0,
          '91-180': avgAge > 90 && avgAge <= 180 ? stockValue : 0,
          '180+': avgAge > 180 ? stockValue : 0,
        },
      };
    });

    const totalItems = report.length;
    const totalValue = report.reduce((sum, item) => sum + item.stockValue, 0);
    const avgAge = report.reduce((sum, item) => sum + item.avgAge, 0) / totalItems || 0;

    const agingDistribution = report.reduce(
      (acc, item) => {
        acc['0-30'] += item.agingBrackets['0-30'];
        acc['31-60'] += item.agingBrackets['31-60'];
        acc['61-90'] += item.agingBrackets['61-90'];
        acc['91-180'] += item.agingBrackets['91-180'];
        acc['180+'] += item.agingBrackets['180+'];
        return acc;
      },
      { '0-30': 0, '31-60': 0, '61-90': 0, '91-180': 0, '180+': 0 },
    ) as {
      '0-30': number;
      '31-60': number;
      '61-90': number;
      '91-180': number;
      '180+': number;
    };

    return {
      report,
      summary: {
        totalItems,
        totalValue,
        avgAge,
        agingDistribution,
      },
    };
  }

  async getMovementReport(
    query: {
      itemCode?: string;
      warehouseCode?: string;
      company?: string;
      fromDate: string;
      toDate: string;
      groupBy?: 'item' | 'warehouse' | 'date';
    },
    tenant_id: string,
  ): Promise<{
    report: any[];
    summary: {
      totalItems: number;
      totalOpeningValue: number;
      totalInValue: number;
      totalOutValue: number;
      totalClosingValue: number;
    };
  }> {
    // Get stock ledger entries for the period
    const queryBuilder = this.stockLedgerRepository
      .createQueryBuilder('sle')
      .where('sle.tenant_id = :tenant_id', { tenant_id })
      .andWhere('sle.postingDate BETWEEN :fromDate AND :toDate', {
        fromDate: query.fromDate,
        toDate: query.toDate,
      });

    if (query.itemCode) {
      queryBuilder.andWhere('sle.itemCode = :itemCode', { itemCode: query.itemCode });
    }

    if (query.warehouseCode) {
      queryBuilder.andWhere('sle.warehouseCode = :warehouseCode', { warehouseCode: query.warehouseCode });
    }

    if (query.company) {
      queryBuilder.andWhere('sle.company = :company', { company: query.company });
    }

    const entries = await queryBuilder.getMany();

    // Group entries and calculate movements
    const movements = entries.reduce((acc, entry) => {
      const key = query.groupBy === 'warehouse' 
        ? entry.warehouse 
        : query.groupBy === 'date'
        ? entry.postingDate.toISOString().split('T')[0]
        : entry.itemCode;

      if (!acc[key]) {
        acc[key] = {
          itemCode: entry.itemCode,
          warehouseCode: entry.warehouse,
          openingQty: 0,
          inQty: 0,
          outQty: 0,
          closingQty: 0,
          openingValue: 0,
          inValue: 0,
          outValue: 0,
          closingValue: 0,
        };
      }

      if (entry.actualQty > 0) {
        acc[key].inQty += entry.actualQty;
        acc[key].inValue += entry.stockValue;
      } else {
        acc[key].outQty += Math.abs(entry.actualQty);
        acc[key].outValue += Math.abs(entry.stockValue);
      }

      acc[key].closingQty = acc[key].openingQty + acc[key].inQty - acc[key].outQty;
      acc[key].closingValue = acc[key].openingValue + acc[key].inValue - acc[key].outValue;

      return acc;
    }, {});

    const report = Object.values(movements);
    const summary = report.reduce(
      (acc: {
        totalItems: number;
        totalOpeningValue: number;
        totalInValue: number;
        totalOutValue: number;
        totalClosingValue: number;
      }, item: any) => {
        acc.totalItems++;
        acc.totalOpeningValue += item.openingValue;
        acc.totalInValue += item.inValue;
        acc.totalOutValue += item.outValue;
        acc.totalClosingValue += item.closingValue;
        return acc;
      },
      {
        totalItems: 0,
        totalOpeningValue: 0,
        totalInValue: 0,
        totalOutValue: 0,
        totalClosingValue: 0,
      }
    ) as {
      totalItems: number;
      totalOpeningValue: number;
      totalInValue: number;
      totalOutValue: number;
      totalClosingValue: number;
    };

    return { report, summary };
  }

  async getInventoryAlerts(
    query: {
      company?: string;
      alertType?: 'low_stock' | 'out_of_stock' | 'expiry' | 'negative_stock';
    },
    tenant_id: string,
  ): Promise<{
    alerts: any[];
    summary: {
      totalAlerts: number;
      criticalAlerts: number;
      warningAlerts: number;
      infoAlerts: number;
    };
  }> {
    const alerts: any[] = [];

    // Low stock alerts
    if (!query.alertType || query.alertType === 'low_stock') {
      const lowStockBins = await this.binRepository
        .createQueryBuilder('bin')
        .leftJoinAndSelect('bin.item', 'item')
        .where('bin.tenant_id = :tenant_id', { tenant_id })
        .andWhere('bin.actualQty > 0')
        .andWhere('bin.actualQty <= item.safetyStock')
        .getMany();

      lowStockBins.forEach(bin => {
        alerts.push({
          id: `low_stock_${bin.id}`,
          type: 'low_stock',
          severity: 'warning',
          itemCode: bin.itemCode,
          itemName: bin.item?.name || '',
          warehouseCode: bin.warehouse?.name || '',
          message: `Low stock: ${bin.actualQty} remaining (Safety stock: ${bin.item?.safetyStock || 0})`,
          currentQty: bin.actualQty,
          reorderLevel: bin.item?.safetyStock || 0,
          createdAt: new Date(),
        });
      });
    }

    // Out of stock alerts
    if (!query.alertType || query.alertType === 'out_of_stock') {
      const outOfStockBins = await this.binRepository
        .createQueryBuilder('bin')
        .leftJoinAndSelect('bin.item', 'item')
        .where('bin.tenant_id = :tenant_id', { tenant_id })
        .andWhere('bin.actualQty = 0')
        .getMany();

      outOfStockBins.forEach(bin => {
        alerts.push({
          id: `out_of_stock_${bin.id}`,
          type: 'out_of_stock',
          severity: 'critical',
          itemCode: bin.itemCode,
          itemName: bin.item?.name || '',
          warehouseCode: bin.warehouse?.name || '',
          message: 'Item is out of stock',
          currentQty: 0,
          reorderLevel: bin.item?.safetyStock || 0,
          createdAt: new Date(),
        });
      });
    }

    // Expiry alerts
    if (!query.alertType || query.alertType === 'expiry') {
      const expiringBatches = await this.batchRepository
        .createQueryBuilder('batch')
        .where('batch.tenant_id = :tenant_id', { tenant_id })
        .andWhere('batch.expiryDate <= :expiryDate', {
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        })
        .getMany();

      expiringBatches.forEach(batch => {
        alerts.push({
          id: `expiry_${batch.name}`,
          type: 'expiry',
          severity: 'warning',
          itemCode: batch.itemCode,
          itemName: '',
          warehouseCode: '',
          message: `Batch ${batch.batchId} expires on ${batch.expiryDate}`,
          expiryDate: batch.expiryDate,
          createdAt: new Date(),
        });
      });
    }

    const summary = alerts.reduce(
      (acc, alert) => {
        acc.totalAlerts++;
        if (alert.severity === 'critical') acc.criticalAlerts++;
        else if (alert.severity === 'warning') acc.warningAlerts++;
        else acc.infoAlerts++;
        return acc;
      },
      { totalAlerts: 0, criticalAlerts: 0, warningAlerts: 0, infoAlerts: 0 },
    );

    return { alerts, summary };
  }

  async getDashboardSummary(tenant_id: string): Promise<any> {
    // Get total items count
    const totalItems = await this.itemRepository.count({
      where: { tenant: { id: tenant_id } },
      relations: ['tenant'],
    });

    // Get total warehouses count
    const totalWarehouses = await this.warehouseRepository.count({
      where: { tenant_id },
    });

    // Get total stock entries count
    const totalStockEntries = await this.stockEntryRepository.count({
      where: { tenant_id },
    });

    // Get low stock items (items with actual quantity below reorder level)
    const lowStockItems = await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty < item.reorderLevel')
      .getCount();

    // Get total stock value
    const stockValueResult = await this.binRepository
      .createQueryBuilder('bin')
      .select('SUM(bin.stockValue)', 'totalValue')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .getRawOne();

    const totalStockValue = parseFloat(stockValueResult?.totalValue || '0');

    return {
      totalItems,
      totalWarehouses,
      totalStockEntries,
      lowStockItems,
      totalStockValue,
      summary: {
        itemsCount: totalItems,
        warehousesCount: totalWarehouses,
        stockEntriesCount: totalStockEntries,
        lowStockAlertsCount: lowStockItems,
        totalInventoryValue: totalStockValue,
      },
    };
  }
}