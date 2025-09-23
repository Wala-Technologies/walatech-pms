import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Item } from '../../../entities/item.entity';
import { StockLedgerEntry, VoucherType } from '../entities/stock-ledger-entry.entity';
import { Bin } from '../entities/bin.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { StockEntry, StockEntryType, StockEntryPurpose } from '../entities/stock-entry.entity';
import { StockEntryDetail } from '../entities/stock-entry-detail.entity';

export interface ValuationResult {
  itemCode: string;
  warehouse: string;
  quantity: number;
  valuationRate: number;
  stockValue: number;
  valuationMethod: string;
}

export interface ReconciliationResult {
  itemCode: string;
  warehouse: string;
  systemQty: number;
  actualQty: number;
  difference: number;
  valuationRate: number;
  valueDifference: number;
}

export interface StockReconciliationDto {
  warehouse: string;
  postingDate: Date;
  items: {
    itemCode: string;
    actualQty: number;
    valuationRate?: number;
  }[];
  remarks?: string;
}

@Injectable()
export class StockValuationService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(StockLedgerEntry)
    private stockLedgerRepository: Repository<StockLedgerEntry>,
    @InjectRepository(Bin)
    private binRepository: Repository<Bin>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(StockEntry)
    private stockEntryRepository: Repository<StockEntry>,
    @InjectRepository(StockEntryDetail)
    private stockEntryDetailRepository: Repository<StockEntryDetail>,
    private dataSource: DataSource,
  ) {}

  /**
   * Calculate stock valuation using FIFO method
   */
  async calculateFIFOValuation(
    itemCode: string,
    warehouse: string,
    quantity: number,
    tenant_id: string,
  ): Promise<{ rate: number; value: number }> {
    const entries = await this.stockLedgerRepository
      .createQueryBuilder('sle')
      .where('sle.itemCode = :itemCode', { itemCode })
      .andWhere('sle.warehouse = :warehouse', { warehouse })
      .andWhere('sle.tenant_id = :tenant_id', { tenant_id })
      .andWhere('sle.actualQty > 0') // Only incoming entries
      .andWhere('sle.qtyAfterTransaction > 0')
      .orderBy('sle.postingDate', 'ASC')
      .addOrderBy('sle.postingTime', 'ASC')
      .getMany();

    let remainingQty = quantity;
    let totalValue = 0;
    let queueBalance = 0;

    for (const entry of entries) {
      const availableQty = Math.min(entry.actualQty - queueBalance, remainingQty);
      if (availableQty <= 0) continue;

      totalValue += availableQty * entry.incomingRate;
      remainingQty -= availableQty;
      queueBalance += availableQty;

      if (remainingQty <= 0) break;
    }

    const rate = quantity > 0 ? totalValue / quantity : 0;
    return { rate, value: totalValue };
  }

  /**
   * Calculate stock valuation using LIFO method
   */
  async calculateLIFOValuation(
    itemCode: string,
    warehouse: string,
    quantity: number,
    tenant_id: string,
  ): Promise<{ rate: number; value: number }> {
    const entries = await this.stockLedgerRepository
      .createQueryBuilder('sle')
      .where('sle.itemCode = :itemCode', { itemCode })
      .andWhere('sle.warehouse = :warehouse', { warehouse })
      .andWhere('sle.tenant_id = :tenant_id', { tenant_id })
      .andWhere('sle.actualQty > 0') // Only incoming entries
      .andWhere('sle.qtyAfterTransaction > 0')
      .orderBy('sle.postingDate', 'DESC')
      .addOrderBy('sle.postingTime', 'DESC')
      .getMany();

    let remainingQty = quantity;
    let totalValue = 0;
    let queueBalance = 0;

    for (const entry of entries) {
      const availableQty = Math.min(entry.actualQty - queueBalance, remainingQty);
      if (availableQty <= 0) continue;

      totalValue += availableQty * entry.incomingRate;
      remainingQty -= availableQty;
      queueBalance += availableQty;

      if (remainingQty <= 0) break;
    }

    const rate = quantity > 0 ? totalValue / quantity : 0;
    return { rate, value: totalValue };
  }

  /**
   * Calculate stock valuation using Moving Average method
   */
  async calculateMovingAverageValuation(
    itemCode: string,
    warehouse: string,
    tenant_id: string,
  ): Promise<{ rate: number; value: number }> {
    const entries = await this.stockLedgerRepository
      .createQueryBuilder('sle')
      .where('sle.itemCode = :itemCode', { itemCode })
      .andWhere('sle.warehouse = :warehouse', { warehouse })
      .andWhere('sle.tenant_id = :tenant_id', { tenant_id })
      .orderBy('sle.postingDate', 'ASC')
      .addOrderBy('sle.postingTime', 'ASC')
      .getMany();

    let runningQty = 0;
    let runningValue = 0;
    let currentRate = 0;

    for (const entry of entries) {
      if (entry.actualQty > 0) {
        // Incoming stock
        const newValue = entry.actualQty * entry.incomingRate;
        runningValue += newValue;
        runningQty += entry.actualQty;
        currentRate = runningQty > 0 ? runningValue / runningQty : 0;
      } else {
        // Outgoing stock
        const outgoingValue = Math.abs(entry.actualQty) * currentRate;
        runningValue -= outgoingValue;
        runningQty += entry.actualQty; // actualQty is negative for outgoing
        
        if (runningQty <= 0) {
          runningQty = 0;
          runningValue = 0;
          currentRate = 0;
        }
      }
    }

    return { rate: currentRate, value: runningValue };
  }

  /**
   * Get current stock valuation for an item in a warehouse
   */
  async getStockValuation(
    itemCode: string,
    warehouse: string,
    tenant_id: string,
  ): Promise<ValuationResult> {
    const item = await this.itemRepository.findOne({
      where: { code: itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemCode} not found`);
    }

    const bin = await this.binRepository.findOne({
      where: { itemCode, warehouse_id: warehouse, tenant_id },
    });

    const quantity = bin?.actualQty || 0;
    const valuationMethod = item.valuationMethod || 'Moving Average';

    let valuation: { rate: number; value: number };

    switch (valuationMethod) {
      case 'FIFO':
        valuation = await this.calculateFIFOValuation(itemCode, warehouse, quantity, tenant_id);
        break;
      case 'LIFO':
        valuation = await this.calculateLIFOValuation(itemCode, warehouse, quantity, tenant_id);
        break;
      case 'Moving Average':
      default:
        valuation = await this.calculateMovingAverageValuation(itemCode, warehouse, tenant_id);
        break;
    }

    return {
      itemCode,
      warehouse,
      quantity,
      valuationRate: valuation.rate,
      stockValue: valuation.value,
      valuationMethod,
    };
  }

  /**
   * Get stock valuation for all items in a warehouse
   */
  async getWarehouseValuation(
    warehouse: string,
    tenant_id: string,
  ): Promise<ValuationResult[]> {
    const bins = await this.binRepository.find({
      where: { warehouse_id: warehouse, tenant_id, actualQty: { $gt: 0 } as any },
    });

    const results: ValuationResult[] = [];

    for (const bin of bins) {
      try {
        const valuation = await this.getStockValuation(
          bin.itemCode,
          warehouse,
          tenant_id,
        );
        results.push(valuation);
      } catch (error) {
        console.error(`Error calculating valuation for ${bin.itemCode}:`, error);
      }
    }

    return results;
  }

  /**
   * Perform stock reconciliation
   */
  async performStockReconciliation(
    reconciliationData: StockReconciliationDto,
    tenant_id: string,
    userId: string,
  ): Promise<ReconciliationResult[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results: ReconciliationResult[] = [];

      // Create stock entry for reconciliation
      const stockEntry = this.stockEntryRepository.create({
        purpose: StockEntryPurpose.MATERIAL_RECEIPT,
        postingDate: reconciliationData.postingDate,
        postingTime: new Date().toTimeString().split(' ')[0],
        remarks: reconciliationData.remarks || 'Stock Reconciliation',
        tenant_id,
      });

      const savedStockEntry = await queryRunner.manager.save(stockEntry);

      for (const item of reconciliationData.items) {
        const bin = await queryRunner.manager.findOne(Bin, {
          where: {
              itemCode: item.itemCode,
              warehouse_id: reconciliationData.warehouse,
              tenant_id,
            },
        });

        const systemQty = bin?.actualQty || 0;
        const actualQty = item.actualQty;
        const difference = actualQty - systemQty;

        if (difference !== 0) {
          // Get current valuation rate
          const currentValuation = await this.getStockValuation(
            item.itemCode,
            reconciliationData.warehouse,
            tenant_id,
          );

          const valuationRate = item.valuationRate || currentValuation.valuationRate;
          const valueDifference = difference * valuationRate;

          // Create stock entry detail
          const stockEntryDetail = this.stockEntryDetailRepository.create({
            stockEntry: (savedStockEntry as unknown as StockEntry),
            itemCode: item.itemCode,
            qty: Math.abs(difference),
            basicRate: valuationRate,
            basicAmount: Math.abs(valueDifference),
            sWarehouse: reconciliationData.warehouse,
            tenant_id,
          });

          await queryRunner.manager.save(stockEntryDetail);

          // Update bin quantities
          if (bin) {
            bin.actualQty = actualQty;
            bin.projectedQty = actualQty;
            bin.valuationRate = valuationRate;
            await queryRunner.manager.save(bin);
          } else {
            // Create new bin if it doesn't exist
            const warehouseEntity = await queryRunner.manager.findOne(Warehouse, {
              where: { name: reconciliationData.warehouse, tenant: { id: tenant_id } }
            });
            
            if (!warehouseEntity) {
              throw new NotFoundException(`Warehouse ${reconciliationData.warehouse} not found`);
            }

            const newBin = this.binRepository.create({
              itemCode: item.itemCode,
              warehouse: warehouseEntity,
              warehouse_id: warehouseEntity.id,
              actualQty: actualQty,
              projectedQty: actualQty,
              reservedQty: 0,
              indentedQty: 0,
              orderedQty: 0,
              plannedQty: 0,
              valuationRate,
              tenant_id,
            });
            await queryRunner.manager.save(newBin);
          }

          // Create stock ledger entry
          const stockLedgerEntry = this.stockLedgerRepository.create({
            itemCode: item.itemCode,
            warehouse: reconciliationData.warehouse,
            postingDate: reconciliationData.postingDate,
            postingTime: new Date().toTimeString().split(' ')[0],
            voucherType: VoucherType.STOCK_ENTRY,
            voucherNo: (savedStockEntry as unknown as StockEntry).name,
            actualQty: difference,
            qtyAfterTransaction: actualQty,
            incomingRate: difference > 0 ? valuationRate : 0,
            outgoingRate: difference < 0 ? valuationRate : 0,
            stockValue: valueDifference,
            stockValueDifference: valueDifference,
            tenant_id,
          });

          await queryRunner.manager.save(stockLedgerEntry);

          results.push({
            itemCode: item.itemCode,
            warehouse: reconciliationData.warehouse,
            systemQty,
            actualQty,
            difference,
            valuationRate,
            valueDifference,
          });
        }
      }

      await queryRunner.commitTransaction();
      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update valuation rates for all items using their configured method
   */
  async updateValuationRates(tenant_id: string): Promise<void> {
    const items = await this.itemRepository.find({
      where: { tenant: { id: tenant_id }, isMaintainStock: true },
    });

    for (const item of items) {
      const warehouses = await this.warehouseRepository.find({
        where: { tenant: { id: tenant_id } },
      });

      for (const warehouse of warehouses) {
        try {
          const valuation = await this.getStockValuation(
            item.code,
            warehouse.name,
            tenant_id,
          );

          // Update bin valuation rate
          await this.binRepository.update(
            {
              itemCode: item.code,
              warehouse: { id: warehouse.id },
              tenant: { id: tenant_id },
            },
            {
              valuationRate: valuation.valuationRate,
            },
          );

          // Update item's standard rate if using moving average
          if (item.valuationMethod === 'Moving Average') {
            await this.itemRepository.update(
              { id: item.id },
              { standardRate: valuation.valuationRate },
            );
          }
        } catch (error) {
          console.error(
            `Error updating valuation for ${item.code} in ${warehouse.name}:`,
            error,
          );
        }
      }
    }
  }

  /**
   * Get stock aging report
   */
  async getStockAgingReport(
    warehouse?: string,
    itemCode?: string,
    tenant_id?: string,
  ): Promise<any[]> {
    const query = this.stockLedgerRepository
      .createQueryBuilder('sle')
      .select([
        'sle.itemCode',
        'sle.warehouse',
        'sle.postingDate',
        'SUM(sle.actualQty) as totalQty',
        'AVG(sle.incomingRate) as avgRate',
      ])
      .where('sle.actualQty > 0')
      .groupBy('sle.itemCode, sle.warehouse, sle.postingDate')
      .orderBy('sle.postingDate', 'ASC');

    if (warehouse) {
      query.andWhere('sle.warehouse = :warehouse', { warehouse });
    }

    if (itemCode) {
      query.andWhere('sle.itemCode = :itemCode', { itemCode });
    }

    if (tenant_id) {
      query.andWhere('sle.tenant_id = :tenant_id', { tenant_id });
    }

    const results = await query.getRawMany();

    // Calculate aging buckets (0-30, 31-60, 61-90, 90+ days)
    const today = new Date();
    return results.map((result) => {
      const daysDiff = Math.floor(
        (today.getTime() - new Date(result.postingDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      let agingBucket = '90+ days';
      if (daysDiff <= 30) agingBucket = '0-30 days';
      else if (daysDiff <= 60) agingBucket = '31-60 days';
      else if (daysDiff <= 90) agingBucket = '61-90 days';

      return {
        ...result,
        daysSinceReceipt: daysDiff,
        agingBucket,
        stockValue: result.totalQty * result.avgRate,
      };
    });
  }
}