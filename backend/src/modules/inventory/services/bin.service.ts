import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bin } from '../entities/bin.entity';
import { Item } from '../../../entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

export interface CreateBinDto {
  name: string;
  warehouse: string;
  itemCode?: string;
  actualQty?: number;
  reservedQty?: number;
  orderedQty?: number;
  indentedQty?: number;
  plannedQty?: number;
  projectedQty?: number;
  valuationRate?: number;
  stockValue?: number;
}

export interface UpdateBinDto {
  name?: string;
  warehouse?: string;
  itemCode?: string;
  actualQty?: number;
  reservedQty?: number;
  orderedQty?: number;
  indentedQty?: number;
  plannedQty?: number;
  projectedQty?: number;
  valuationRate?: number;
  stockValue?: number;
}

export interface BinQueryDto {
  itemCode?: string;
  warehouse?: string;
  company?: string;
  hasStock?: boolean;
  minQty?: number;
  maxQty?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BinStockDto {
  binName: string;
  warehouse: string;
  itemCode: string;
  actualQty: number;
  reservedQty: number;
  orderedQty: number;
  indentedQty: number;
  plannedQty: number;
  projectedQty: number;
  valuationRate: number;
  stockValue: number;
}

export interface StockSummaryDto {
  itemCode: string;
  totalActualQty: number;
  totalReservedQty: number;
  totalOrderedQty: number;
  totalIndentedQty: number;
  totalPlannedQty: number;
  totalProjectedQty: number;
  warehouses: {
    warehouse: string;
    actualQty: number;
    reservedQty: number;
    orderedQty: number;
    indentedQty: number;
    plannedQty: number;
    projectedQty: number;
  }[];
}

@Injectable()
export class BinService {
  constructor(
    @InjectRepository(Bin)
    private binRepository: Repository<Bin>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOrCreateBin(itemCode: string, warehouse: string, tenant_id: string): Promise<Bin> {
    // Check if bin already exists
    let bin = await this.binRepository.findOne({
      where: { itemCode, warehouse: { name: warehouse }, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (bin) {
      return bin;
    }

    // Verify item exists
    const item = await this.itemRepository.findOne({
      where: { code: itemCode },
      relations: ['tenant'],
    });
    if (!item) {
      throw new NotFoundException(`Item ${itemCode} not found`);
    }

    // Verify warehouse exists
    const warehouseEntity = await this.warehouseRepository.findOne({
      where: { name: warehouse, tenant_id },
    });
    if (!warehouseEntity) {
      throw new NotFoundException(`Warehouse ${warehouse} not found`);
    }

    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenant_id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create new bin
    bin = this.binRepository.create({
      name: `${itemCode}-${warehouseEntity.name}`,
      itemCode,
      warehouse: warehouseEntity,
      warehouse_id: warehouseEntity.id,
      actualQty: 0,
      reservedQty: 0,
      orderedQty: 0,
      indentedQty: 0,
      plannedQty: 0,
      projectedQty: 0,
      valuationRate: 0,
      stockValue: 0,
      stockUom: item.stockUom,
      tenant,
      tenant_id,
    });

    return await this.binRepository.save(bin);
  }

  async updateBinQty(
    itemCode: string,
    warehouse: string,
    qtyChange: number,
    qtyType: 'actual' | 'reserved' | 'ordered' | 'indented' | 'planned',
    tenant_id: string,
  ): Promise<Bin> {
    const bin = await this.findOrCreateBin(itemCode, warehouse, tenant_id);

    switch (qtyType) {
      case 'actual':
        bin.actualQty += qtyChange;
        break;
      case 'reserved':
        bin.reservedQty += qtyChange;
        break;
      case 'ordered':
        bin.orderedQty += qtyChange;
        break;
      case 'indented':
        bin.indentedQty += qtyChange;
        break;
      case 'planned':
        bin.plannedQty += qtyChange;
        break;
    }

    // Recalculate projected quantity
    bin.updateProjectedQty();

    return await this.binRepository.save(bin);
  }

  async setBinQty(
    itemCode: string,
    warehouse: string,
    qty: number,
    qtyType: 'actual' | 'reserved' | 'ordered' | 'indented' | 'planned',
    tenant_id: string,
  ): Promise<Bin> {
    const bin = await this.findOrCreateBin(itemCode, warehouse, tenant_id);

    switch (qtyType) {
      case 'actual':
        bin.actualQty = qty;
        break;
      case 'reserved':
        bin.reservedQty = qty;
        break;
      case 'ordered':
        bin.orderedQty = qty;
        break;
      case 'indented':
        bin.indentedQty = qty;
        break;
      case 'planned':
        bin.plannedQty = qty;
        break;
    }

    // Recalculate projected quantity
    bin.updateProjectedQty();

    return await this.binRepository.save(bin);
  }

  async getStockBalance(itemCode: string, warehouse: string, tenant_id: string): Promise<number> {
    const bin = await this.binRepository.findOne({
      where: { itemCode, warehouse_id: warehouse, tenant_id },
    });

    return bin ? bin.actualQty : 0;
  }

  async getProjectedQty(itemCode: string, warehouse: string, tenant_id: string): Promise<number> {
    const bin = await this.binRepository.findOne({
      where: { itemCode, warehouse_id: warehouse, tenant_id },
    });

    return bin ? bin.projectedQty : 0;
  }

  async findAll(query: BinQueryDto, tenant_id: string): Promise<{ bins: Bin[]; total: number }> {
    const queryBuilder = this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouseEntity', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id });

    // Apply filters
    if (query.itemCode) {
      queryBuilder.andWhere('bin.itemCode = :itemCode', { itemCode: query.itemCode });
    }

    if (query.warehouse) {
      queryBuilder.andWhere('bin.warehouse = :warehouse', { warehouse: query.warehouse });
    }

    if (query.hasStock !== undefined) {
      if (query.hasStock) {
        queryBuilder.andWhere('bin.actualQty > 0');
      } else {
        queryBuilder.andWhere('bin.actualQty <= 0');
      }
    }

    if (query.minQty !== undefined) {
      queryBuilder.andWhere('bin.actualQty >= :minQty', { minQty: query.minQty });
    }

    if (query.maxQty !== undefined) {
      queryBuilder.andWhere('bin.actualQty <= :maxQty', { maxQty: query.maxQty });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(bin.itemCode ILIKE :search OR bin.warehouse ILIKE :search OR item.name ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('bin.itemCode', 'ASC').addOrderBy('bin.warehouse', 'ASC');

    const [bins, total] = await queryBuilder.getManyAndCount();

    return { bins, total };
  }

  async getStockSummary(itemCode: string, tenant_id: string): Promise<StockSummaryDto> {
    const bins = await this.binRepository.find({
      where: { itemCode, tenant_id },
      relations: ['warehouseEntity'],
    });

    const warehouses = bins.map(bin => ({
      warehouse: bin.warehouse_id,
      actualQty: bin.actualQty,
      reservedQty: bin.reservedQty,
      orderedQty: bin.orderedQty,
      indentedQty: bin.indentedQty,
      plannedQty: bin.plannedQty,
      projectedQty: bin.projectedQty,
    }));

    const totals = bins.reduce(
      (acc, bin) => ({
        totalActualQty: acc.totalActualQty + bin.actualQty,
        totalReservedQty: acc.totalReservedQty + bin.reservedQty,
        totalOrderedQty: acc.totalOrderedQty + bin.orderedQty,
        totalIndentedQty: acc.totalIndentedQty + bin.indentedQty,
        totalPlannedQty: acc.totalPlannedQty + bin.plannedQty,
        totalProjectedQty: acc.totalProjectedQty + bin.projectedQty,
      }),
      {
        totalActualQty: 0,
        totalReservedQty: 0,
        totalOrderedQty: 0,
        totalIndentedQty: 0,
        totalPlannedQty: 0,
        totalProjectedQty: 0,
      }
    );

    return {
      itemCode,
      ...totals,
      warehouses,
    };
  }

  async getLowStockItems(tenant_id: string): Promise<Bin[]> {
    return await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouseEntity', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty <= item.safetyStock')
      .andWhere('item.safetyStock > 0')
      .orderBy('bin.actualQty', 'ASC')
      .getMany();
  }

  async getOverStockItems(tenant_id: string): Promise<Bin[]> {
    return await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouseEntity', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty >= item.maxOrderQty')
      .andWhere('item.maxOrderQty > 0')
      .orderBy('bin.actualQty', 'DESC')
      .getMany();
  }

  async getZeroStockItems(tenant_id: string): Promise<Bin[]> {
    return await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouseEntity', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty = 0')
      .orderBy('bin.itemCode', 'ASC')
      .getMany();
  }

  async getNegativeStockItems(tenant_id: string): Promise<Bin[]> {
    return await this.binRepository
      .createQueryBuilder('bin')
      .leftJoinAndSelect('bin.item', 'item')
      .leftJoinAndSelect('bin.warehouseEntity', 'warehouse')
      .where('bin.tenant_id = :tenant_id', { tenant_id })
      .andWhere('bin.actualQty < 0')
      .orderBy('bin.actualQty', 'ASC')
      .getMany();
  }

  async getStockAging(tenant_id: string, days: number = 90): Promise<any[]> {
    // This would require additional logic to track stock aging
    // For now, return empty array as placeholder
    return [];
  }

  async bulkUpdateBins(updates: Array<{
    itemCode: string;
    warehouse: string;
    actualQty?: number;
    reservedQty?: number;
    orderedQty?: number;
    indentedQty?: number;
    plannedQty?: number;
  }>, tenant_id: string): Promise<Bin[]> {
    const results: Bin[] = [];

    for (const update of updates) {
      const bin = await this.findOrCreateBin(update.itemCode, update.warehouse, tenant_id);

      if (update.actualQty !== undefined) bin.actualQty = update.actualQty;
      if (update.reservedQty !== undefined) bin.reservedQty = update.reservedQty;
      if (update.orderedQty !== undefined) bin.orderedQty = update.orderedQty;
      if (update.indentedQty !== undefined) bin.indentedQty = update.indentedQty;
      if (update.plannedQty !== undefined) bin.plannedQty = update.plannedQty;

      bin.updateProjectedQty();
      results.push(await this.binRepository.save(bin));
    }

    return results;
  }

  async create(createBinDto: CreateBinDto, tenant_id: string, userId: string): Promise<Bin> {
    // Verify item exists if itemCode is provided
    if (createBinDto.itemCode) {
      const item = await this.itemRepository.findOne({
      where: { code: createBinDto.itemCode },
      relations: ['tenant'],
    });
      if (!item) {
        throw new NotFoundException(`Item ${createBinDto.itemCode} not found`);
      }
    }

    // Verify warehouse exists
    const warehouseEntity = await this.warehouseRepository.findOne({
      where: { name: createBinDto.warehouse, tenant_id },
    });
    if (!warehouseEntity) {
      throw new NotFoundException(`Warehouse ${createBinDto.warehouse} not found`);
    }

    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenant_id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create new bin
    const bin = this.binRepository.create({
      itemCode: createBinDto.itemCode,
      warehouse: warehouseEntity,
      warehouse_id: createBinDto.warehouse,
      actualQty: createBinDto.actualQty || 0,
      reservedQty: createBinDto.reservedQty || 0,
      orderedQty: createBinDto.orderedQty || 0,
      indentedQty: createBinDto.indentedQty || 0,
      plannedQty: createBinDto.plannedQty || 0,
      projectedQty: createBinDto.projectedQty || 0,
      valuationRate: createBinDto.valuationRate || 0,
      stockValue: createBinDto.stockValue || 0,
      tenant,
      tenant_id,
    });

    return await this.binRepository.save(bin);
  }

  async findOne(id: string, tenant_id: string): Promise<Bin> {
    const bin = await this.binRepository.findOne({
      where: { id, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    return bin;
  }

  async getBinsByWarehouse(warehouseCode: string, tenant_id: string, itemCode?: string, includeZeroStock?: boolean): Promise<Bin[]> {
    const whereConditions: any = {
      warehouse_id: warehouseCode,
      tenant_id,
    };

    if (itemCode) {
      whereConditions.itemCode = itemCode;
    }

    if (!includeZeroStock) {
      // Only include bins with stock
      const bins = await this.binRepository.find({
        where: whereConditions,
        relations: ['warehouse', 'tenant'],
      });
      return bins.filter(bin => bin.actualQty > 0);
    }

    return await this.binRepository.find({
      where: whereConditions,
      relations: ['warehouse', 'tenant'],
    });
  }

  async findByItemAndWarehouse(itemCode: string, warehouseCode: string, tenant_id: string): Promise<Bin[]> {
    return await this.binRepository.find({
      where: {
        itemCode,
        warehouse_id: warehouseCode,
        tenant_id,
      },
      relations: ['warehouse', 'tenant'],
    });
  }

  async getBinsByItem(itemCode: string, tenant_id: string, warehouseCode?: string, includeZeroStock?: boolean): Promise<Bin[]> {
    const whereConditions: any = {
      itemCode,
      tenant_id,
    };

    if (warehouseCode) {
      whereConditions.warehouse_id = warehouseCode;
    }

    if (!includeZeroStock) {
      // Only include bins with stock
      const bins = await this.binRepository.find({
        where: whereConditions,
        relations: ['warehouse', 'tenant'],
      });
      return bins.filter(bin => bin.actualQty > 0);
    }

    return await this.binRepository.find({
      where: whereConditions,
      relations: ['warehouse', 'tenant'],
    });
  }

  async update(id: string, updateBinDto: any, tenant_id: string, userId?: string): Promise<Bin> {
    const bin = await this.binRepository.findOne({
      where: { id, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    Object.assign(bin, updateBinDto);
    bin.updated_at = new Date();
    
    return await this.binRepository.save(bin);
  }

  async updateQuantity(id: string, quantity: number, tenant_id: string, userId?: string, allowNegativeStock: boolean = false, reservationType?: string, purpose?: string): Promise<Bin> {
    const bin = await this.binRepository.findOne({
      where: { id, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    bin.actualQty = quantity;
    bin.updateProjectedQty();
    bin.updated_at = new Date();
    
    return await this.binRepository.save(bin);
  }

  async reserveQuantity(id: string, quantity: number, tenant_id: string, userId?: string, allowNegativeStock: boolean = false, reservationType?: string, purpose?: string): Promise<Bin> {
    const bin = await this.binRepository.findOne({
      where: { id, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    if (bin.actualQty - bin.reservedQty < quantity) {
      throw new BadRequestException('Insufficient stock available for reservation');
    }

    bin.reservedQty += quantity;
    bin.updateProjectedQty();
    bin.updated_at = new Date();
    
    return await this.binRepository.save(bin);
  }

  async unreserveQuantity(id: string, quantity: number, tenant_id: string, userId?: string, allowNegativeStock: boolean = false, reservationType?: string, purpose?: string): Promise<Bin> {
    const bin = await this.binRepository.findOne({
      where: { id, tenant_id },
      relations: ['warehouse', 'tenant'],
    });

    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    bin.reservedQty = Math.max(0, bin.reservedQty - quantity);
    bin.updateProjectedQty();
    bin.updated_at = new Date();
    
    return await this.binRepository.save(bin);
  }

  async checkStockAvailability(items: any[], tenant_id: string): Promise<any> {
    const results: any[] = [];
    
    for (const item of items) {
      const bins = await this.binRepository.find({
        where: {
          itemCode: item.itemCode,
          warehouse_id: item.warehouse,
          tenant_id,
        },
        relations: ['warehouse'],
      });

      const totalAvailable = bins.reduce((sum, bin) => sum + (bin.actualQty - bin.reservedQty), 0);
      
      results.push({
        itemCode: item.itemCode,
        warehouse: item.warehouse,
        requestedQty: item.qty,
        availableQty: totalAvailable,
        isAvailable: totalAvailable >= item.qty,
      });
    }
    
    return results;
  }
}