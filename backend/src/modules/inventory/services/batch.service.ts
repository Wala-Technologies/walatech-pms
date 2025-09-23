import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { Batch } from '../entities/batch.entity';
import { Item } from '../../../entities/item.entity';

export interface CreateBatchDto {
  name: string;
  itemCode: string;
  batchQty: number;
  manufacturingDate?: Date;
  expiryDate?: Date;
  batchId?: string;
  description?: string;
  image?: string;
  disabled?: boolean;
  supplierBatchId?: string;
  referenceDoctype?: string;
  referenceDocname?: string;
}

export interface UpdateBatchDto {
  batchQty?: number;
  manufacturingDate?: Date;
  expiryDate?: Date;
  description?: string;
  image?: string;
  disabled?: boolean;
  supplierBatchId?: string;
}

export interface BatchQueryDto {
  itemCode?: string;
  disabled?: boolean;
  expiryStatus?: 'expired' | 'expiring_soon' | 'valid';
  manufacturingDateFrom?: string;
  manufacturingDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'itemCode' | 'batchQty' | 'manufacturingDate' | 'expiryDate' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface BatchStockDto {
  batchName: string;
  itemCode: string;
  warehouseCode: string;
  actualQty: number;
  projectedQty: number;
  reservedQty: number;
  orderedQty: number;
  plannedQty: number;
  requestedQty: number;
  reservedQtyForProduction: number;
  reservedQtyForSubContract: number;
  reservedQtyForProductionPlan: number;
}

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async create(createBatchDto: CreateBatchDto, tenant_id: string, userId?: string): Promise<Batch> {
    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { code: createBatchDto.itemCode },
      relations: ['tenant'],
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${createBatchDto.itemCode} not found`);
    }

    // Check if item has batch tracking enabled
    if (!item.hasBatchNo) {
      throw new BadRequestException(`Item ${createBatchDto.itemCode} does not have batch tracking enabled`);
    }

    // Check if batch name already exists for this item
    const existingBatch = await this.batchRepository.findOne({
      where: {
        name: createBatchDto.name,
        itemCode: createBatchDto.itemCode,
        tenant_id,
      },
    });

    if (existingBatch) {
      throw new BadRequestException(`Batch ${createBatchDto.name} already exists for item ${createBatchDto.itemCode}`);
    }

    // Validate dates
    if (createBatchDto.manufacturingDate && createBatchDto.expiryDate) {
      if (createBatchDto.manufacturingDate >= createBatchDto.expiryDate) {
        throw new BadRequestException('Manufacturing date must be before expiry date');
      }
    }

    const batch = this.batchRepository.create({
      ...createBatchDto,
      tenant_id,
      createdById: userId,
      modifiedById: userId,
    });

    return this.batchRepository.save(batch);
  }

  async findAll(query: BatchQueryDto, tenant_id: string): Promise<{ batches: Batch[]; total: number }> {
    const {
      itemCode,
      disabled,
      expiryStatus,
      manufacturingDateFrom,
      manufacturingDateTo,
      expiryDateFrom,
      expiryDateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.item', 'item')
      .where('batch.tenant_id = :tenant_id', { tenant_id });

    // Apply filters
    if (itemCode) {
      queryBuilder.andWhere('batch.itemCode = :itemCode', { itemCode });
    }

    if (disabled !== undefined) {
      queryBuilder.andWhere('batch.disabled = :disabled', { disabled });
    }

    if (manufacturingDateFrom) {
      queryBuilder.andWhere('batch.manufacturingDate >= :manufacturingDateFrom', {
        manufacturingDateFrom,
      });
    }

    if (manufacturingDateTo) {
      queryBuilder.andWhere('batch.manufacturingDate <= :manufacturingDateTo', {
        manufacturingDateTo,
      });
    }

    if (expiryDateFrom) {
      queryBuilder.andWhere('batch.expiryDate >= :expiryDateFrom', { expiryDateFrom });
    }

    if (expiryDateTo) {
      queryBuilder.andWhere('batch.expiryDate <= :expiryDateTo', { expiryDateTo });
    }

    // Handle expiry status filter
    if (expiryStatus) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      switch (expiryStatus) {
        case 'expired':
          queryBuilder.andWhere('batch.expiryDate < :now', { now });
          break;
        case 'expiring_soon':
          queryBuilder.andWhere('batch.expiryDate BETWEEN :now AND :thirtyDaysFromNow', {
            now,
            thirtyDaysFromNow,
          });
          break;
        case 'valid':
          queryBuilder.andWhere('(batch.expiryDate IS NULL OR batch.expiryDate > :thirtyDaysFromNow)', {
            thirtyDaysFromNow,
          });
          break;
      }
    }

    if (search) {
      queryBuilder.andWhere(
        '(batch.name ILIKE :search OR batch.description ILIKE :search OR batch.batchId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`batch.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [batches, total] = await queryBuilder.getManyAndCount();

    return { batches, total };
  }

  async findOne(name: string, tenant_id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { name, tenant_id },
      relations: ['item'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch with name ${name} not found`);
    }

    return batch;
  }

  async findByName(name: string, itemCode: string, tenant_id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { name, itemCode, tenant_id },
      relations: ['item'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${name} not found for item ${itemCode}`);
    }

    return batch;
  }

  async update(id: string, updateBatchDto: UpdateBatchDto, tenant_id: string, userId?: string): Promise<Batch> {
    const batch = await this.findOne(id, tenant_id);

    // Validate dates if provided
    const manufacturingDate = updateBatchDto.manufacturingDate || batch.manufacturingDate;
    const expiryDate = updateBatchDto.expiryDate || batch.expiryDate;

    if (manufacturingDate && expiryDate && manufacturingDate >= expiryDate) {
      throw new BadRequestException('Manufacturing date must be before expiry date');
    }

    Object.assign(batch, updateBatchDto, {
      modifiedBy: userId,
      modifiedAt: new Date(),
    });

    return this.batchRepository.save(batch);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const batch = await this.findOne(id, tenant_id);
    await this.batchRepository.remove(batch);
  }

  async getExpiringBatches(tenant_id: string, daysAhead: number = 30): Promise<Batch[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.batchRepository.find({
      where: {
        tenant_id,
        disabled: false,
        expiryDate: Between(now, futureDate),
      },
      relations: ['item'],
      order: { expiryDate: 'ASC' },
    });
  }

  async getExpiredBatches(tenant_id: string): Promise<Batch[]> {
    const now = new Date();

    return this.batchRepository.find({
      where: {
        tenant_id,
        disabled: false,
        expiryDate: Between(new Date('1900-01-01'), now),
      },
      relations: ['item'],
      order: { expiryDate: 'DESC' },
    });
  }

  async getBatchesByItem(itemCode: string, tenant_id: string, includeDisabled: boolean = false): Promise<Batch[]> {
    const whereCondition: any = {
      itemCode,
      tenant_id,
    };

    if (!includeDisabled) {
      whereCondition.disabled = false;
    }

    return this.batchRepository.find({
      where: whereCondition,
      relations: ['item'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBatchQuantity(batchName: string, itemCode: string, tenant_id: string, newQty: number): Promise<Batch> {
    const batch = await this.findByName(batchName, itemCode, tenant_id);
    
    if (newQty < 0) {
      throw new BadRequestException('Batch quantity cannot be negative');
    }

    batch.batchQty = newQty;
    batch.updatedAt = new Date();

    return this.batchRepository.save(batch);
  }

  async validateBatchForTransaction(
    batchName: string,
    itemCode: string,
    tenant_id: string,
    requiredQty: number,
  ): Promise<{ valid: boolean; message?: string; batch?: Batch }> {
    try {
      const batch = await this.findByName(batchName, itemCode, tenant_id);

      if (batch.disabled) {
        return {
          valid: false,
          message: `Batch ${batchName} is disabled`,
        };
      }

      if (batch.isExpired) {
        return {
          valid: false,
          message: `Batch ${batchName} has expired on ${batch.expiryDate?.toDateString()}`,
        };
      }

      if (batch.batchQty < requiredQty) {
        return {
          valid: false,
          message: `Insufficient quantity in batch ${batchName}. Available: ${batch.batchQty}, Required: ${requiredQty}`,
        };
      }

      return {
        valid: true,
        batch,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }

  async generateBatchName(itemCode: string, tenant_id: string): Promise<string> {
    const item = await this.itemRepository.findOne({
      where: { code: itemCode },
      relations: ['tenant'],
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${itemCode} not found`);
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = today.toTimeString().slice(0, 8).replace(/:/g, '');
    
    // Generate batch name: ITEM-YYYYMMDD-HHMMSS
    const baseName = `${itemCode}-${dateStr}-${timeStr}`;
    
    // Check if this name already exists
    const existingBatch = await this.batchRepository.findOne({
      where: { name: baseName, itemCode, tenant_id },
    });

    if (!existingBatch) {
      return baseName;
    }

    // If exists, add a counter
    let counter = 1;
    let batchName = `${baseName}-${counter.toString().padStart(3, '0')}`;
    
    while (await this.batchRepository.findOne({
      where: { name: batchName, itemCode, tenant_id },
    })) {
      counter++;
      batchName = `${baseName}-${counter.toString().padStart(3, '0')}`;
    }

    return batchName;
  }
}