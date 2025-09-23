import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { SerialNo } from '../entities/serial-no.entity';
import { Item } from '../../../entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';

export interface CreateSerialNoDto {
  serialNo: string;
  itemCode: string;
  warehouseCode?: string;
  company?: string;
  description?: string;
  purchaseDocumentType?: string;
  purchaseDocumentNo?: string;
  purchaseDate?: Date;
  purchaseRate?: number;
  purchaseTime?: string;
  supplier?: string;
  deliveryDocumentType?: string;
  deliveryDocumentNo?: string;
  deliveryDate?: Date;
  deliveryTime?: string;
  location?: string;
  assetStatus?: 'In Use' | 'Available' | 'Damaged' | 'Lost' | 'Sold' | 'Scrapped';
  maintenanceStatus?: 'Under Maintenance' | 'Out of Order' | 'Issue' | 'Working';
  warrantyPeriod?: number;
  warrantyExpiryDate?: Date;
  amcExpiryDate?: Date;
  status?: 'Active' | 'Inactive' | 'Delivered' | 'Expired';
}

export interface UpdateSerialNoDto {
  warehouseCode?: string;
  description?: string;
  location?: string;
  assetStatus?: 'In Use' | 'Available' | 'Damaged' | 'Lost' | 'Sold' | 'Scrapped';
  maintenanceStatus?: 'Under Maintenance' | 'Out of Order' | 'Issue' | 'Working';
  warrantyPeriod?: number;
  warrantyExpiryDate?: Date;
  amcExpiryDate?: Date;
  status?: 'Active' | 'Inactive' | 'Delivered' | 'Expired';
}

export interface SerialNoQueryDto {
  itemCode?: string;
  warehouseCode?: string;
  company?: string;
  status?: 'Active' | 'Inactive' | 'Delivered' | 'Expired';
  assetStatus?: 'In Use' | 'Available' | 'Damaged' | 'Lost' | 'Sold' | 'Scrapped';
  maintenanceStatus?: 'Under Maintenance' | 'Out of Order' | 'Issue' | 'Working';
  warrantyStatus?: 'valid' | 'expired' | 'expiring_soon';
  amcStatus?: 'valid' | 'expired' | 'expiring_soon';
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'serialNo' | 'itemCode' | 'purchaseDate' | 'deliveryDate' | 'warrantyExpiryDate' | 'amcExpiryDate' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface SerialNoMovementDto {
  serialNo: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  voucherType: string;
  voucherNo: string;
  actualDate: Date;
  incomingRate?: number;
  outgoingRate?: number;
  qty: number;
}

@Injectable()
export class SerialNoService {
  constructor(
    @InjectRepository(SerialNo)
    private serialNoRepository: Repository<SerialNo>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createSerialNoDto: CreateSerialNoDto, tenant_id: string, userId?: string): Promise<SerialNo> {
    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { code: createSerialNoDto.itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${createSerialNoDto.itemCode} not found`);
    }

    // Check if item has serial number tracking enabled
    if (!item.hasSerialNo) {
      throw new BadRequestException(`Item ${createSerialNoDto.itemCode} does not have serial number tracking enabled`);
    }

    // Check if serial number already exists
    const existingSerialNo = await this.serialNoRepository.findOne({
      where: {
        name: createSerialNoDto.serialNo,
        tenant_id,
      },
    });

    if (existingSerialNo) {
      throw new BadRequestException(`Serial number ${createSerialNoDto.serialNo} already exists`);
    }

    // Validate warehouse if provided
    if (createSerialNoDto.warehouseCode) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { name: createSerialNoDto.warehouseCode, tenant_id },
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with code ${createSerialNoDto.warehouseCode} not found`);
      }
    }

    // Validate dates
    if (createSerialNoDto.purchaseDate && createSerialNoDto.deliveryDate) {
      if (createSerialNoDto.purchaseDate > createSerialNoDto.deliveryDate) {
        throw new BadRequestException('Purchase date cannot be after delivery date');
      }
    }

    const serialNo = this.serialNoRepository.create({
      ...createSerialNoDto,
      tenant_id,
      createdById: userId,
      modifiedById: userId,
    });

    return this.serialNoRepository.save(serialNo);
  }

  async findAll(query: SerialNoQueryDto, tenant_id: string): Promise<{ serialNos: SerialNo[]; total: number }> {
    const {
      itemCode,
      warehouseCode,
      company,
      status,
      assetStatus,
      maintenanceStatus,
      warrantyStatus,
      amcStatus,
      purchaseDateFrom,
      purchaseDateTo,
      deliveryDateFrom,
      deliveryDateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.serialNoRepository
      .createQueryBuilder('serialNo')
      .leftJoinAndSelect('serialNo.item', 'item')
      .leftJoinAndSelect('serialNo.warehouse', 'warehouse')
      .where('serialNo.tenant_id = :tenant_id', { tenant_id });

    // Apply filters
    if (itemCode) {
      queryBuilder.andWhere('serialNo.itemCode = :itemCode', { itemCode });
    }

    if (warehouseCode) {
      queryBuilder.andWhere('warehouse.name = :warehouseCode', { warehouseCode });
    }

    if (company) {
      queryBuilder.andWhere('serialNo.company = :company', { company });
    }

    if (status) {
      queryBuilder.andWhere('serialNo.status = :status', { status });
    }

    if (assetStatus) {
      queryBuilder.andWhere('serialNo.assetStatus = :assetStatus', { assetStatus });
    }

    if (maintenanceStatus) {
      queryBuilder.andWhere('serialNo.maintenanceStatus = :maintenanceStatus', { maintenanceStatus });
    }

    if (purchaseDateFrom) {
      queryBuilder.andWhere('serialNo.purchaseDate >= :purchaseDateFrom', { purchaseDateFrom });
    }

    if (purchaseDateTo) {
      queryBuilder.andWhere('serialNo.purchaseDate <= :purchaseDateTo', { purchaseDateTo });
    }

    if (deliveryDateFrom) {
      queryBuilder.andWhere('serialNo.deliveryDate >= :deliveryDateFrom', { deliveryDateFrom });
    }

    if (deliveryDateTo) {
      queryBuilder.andWhere('serialNo.deliveryDate <= :deliveryDateTo', { deliveryDateTo });
    }

    // Handle warranty status filter
    if (warrantyStatus) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      switch (warrantyStatus) {
        case 'expired':
          queryBuilder.andWhere('serialNo.warrantyExpiryDate < :now', { now });
          break;
        case 'expiring_soon':
          queryBuilder.andWhere('serialNo.warrantyExpiryDate BETWEEN :now AND :thirtyDaysFromNow', {
            now,
            thirtyDaysFromNow,
          });
          break;
        case 'valid':
          queryBuilder.andWhere('(serialNo.warrantyExpiryDate IS NULL OR serialNo.warrantyExpiryDate > :thirtyDaysFromNow)', {
            thirtyDaysFromNow,
          });
          break;
      }
    }

    // Handle AMC status filter
    if (amcStatus) {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      switch (amcStatus) {
        case 'expired':
          queryBuilder.andWhere('serialNo.amcExpiryDate < :now', { now });
          break;
        case 'expiring_soon':
          queryBuilder.andWhere('serialNo.amcExpiryDate BETWEEN :now AND :thirtyDaysFromNow', {
            now,
            thirtyDaysFromNow,
          });
          break;
        case 'valid':
          queryBuilder.andWhere('(serialNo.amcExpiryDate IS NULL OR serialNo.amcExpiryDate > :thirtyDaysFromNow)', {
            thirtyDaysFromNow,
          });
          break;
      }
    }

    if (search) {
      queryBuilder.andWhere(
        '(serialNo.serialNo ILIKE :search OR serialNo.description ILIKE :search OR serialNo.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`serialNo.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [serialNos, total] = await queryBuilder.getManyAndCount();

    return { serialNos, total };
  }

  async findOne(id: string, tenant_id: string): Promise<SerialNo> {
    const serialNo = await this.serialNoRepository.findOne({
      where: { name: id, tenant_id },
      relations: ['item', 'warehouse'],
    });

    if (!serialNo) {
      throw new NotFoundException(`Serial number with ID ${id} not found`);
    }

    return serialNo;
  }

  async findBySerialNo(serialNo: string, tenant_id: string): Promise<SerialNo> {
    const serial = await this.serialNoRepository.findOne({
      where: { name: serialNo, tenant_id },
      relations: ['item', 'warehouse'],
    });

    if (!serial) {
      throw new NotFoundException(`Serial number ${serialNo} not found`);
    }

    return serial;
  }

  async update(id: string, updateSerialNoDto: UpdateSerialNoDto, tenant_id: string, userId?: string): Promise<SerialNo> {
    const serialNo = await this.findOne(id, tenant_id);

    // Validate warehouse if provided
    if (updateSerialNoDto.warehouseCode) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { name: updateSerialNoDto.warehouseCode, tenant_id },
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with code ${updateSerialNoDto.warehouseCode} not found`);
      }
    }

    Object.assign(serialNo, updateSerialNoDto, {
      modifiedBy: userId,
      modifiedAt: new Date(),
    });

    return this.serialNoRepository.save(serialNo);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const serialNo = await this.findOne(id, tenant_id);
    await this.serialNoRepository.remove(serialNo);
  }

  async getExpiringWarranties(tenant_id: string, daysAhead: number = 30): Promise<SerialNo[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.serialNoRepository.find({
      where: {
        tenant_id,
        status: 'Active',
        warrantyExpiryDate: Between(now, futureDate),
      },
      relations: ['item', 'warehouse'],
      order: { warrantyExpiryDate: 'ASC' },
    });
  }

  async getExpiringAMCs(tenant_id: string, daysAhead: number = 30): Promise<SerialNo[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.serialNoRepository.find({
      where: {
        tenant_id,
        status: 'Active',
        amcExpiryDate: Between(now, futureDate),
      },
      relations: ['item', 'warehouse'],
      order: { amcExpiryDate: 'ASC' },
    });
  }

  async getSerialNosByItem(itemCode: string, tenant_id: string, warehouseCode?: string): Promise<SerialNo[]> {
    const whereCondition: any = {
      itemCode,
      tenant_id,
      status: 'Active',
    };

    if (warehouseCode) {
      whereCondition.warehouse = { name: warehouseCode };
    }

    return this.serialNoRepository.find({
      where: whereCondition,
      relations: ['item', 'warehouse'],
      order: { createdAt: 'DESC' },
    });
  }

  async transferSerialNo(
    serialNo: string,
    fromWarehouse: string,
    toWarehouse: string,
    tenant_id: string,
    userId?: string,
  ): Promise<SerialNo> {
    const serial = await this.findBySerialNo(serialNo, tenant_id);

    if (serial.warehouseId !== fromWarehouse) {
      throw new BadRequestException(`Serial number ${serialNo} is not in warehouse ${fromWarehouse}`);
    }

    // Validate target warehouse
    const warehouse = await this.warehouseRepository.findOne({
      where: { name: toWarehouse, tenant_id },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with code ${toWarehouse} not found`);
    }

    serial.warehouseId = toWarehouse;
    if (userId) {
      serial.modifiedById = userId;
    }
    serial.updatedAt = new Date();

    return this.serialNoRepository.save(serial);
  }

  async validateSerialNoForTransaction(
    serialNo: string,
    itemCode: string,
    tenant_id: string,
  ): Promise<{ valid: boolean; message?: string; serialNo?: SerialNo }> {
    try {
      const serial = await this.findBySerialNo(serialNo, tenant_id);

      if (serial.itemCode !== itemCode) {
        return {
          valid: false,
          message: `Serial number ${serialNo} belongs to item ${serial.itemCode}, not ${itemCode}`,
        };
      }

      if (serial.status !== 'Active') {
        return {
          valid: false,
          message: `Serial number ${serialNo} is not active (status: ${serial.status})`,
        };
      }

      if (serial.assetStatus === 'Lost' || serial.assetStatus === 'Scrapped') {
        return {
          valid: false,
          message: `Serial number ${serialNo} is ${serial.assetStatus.toLowerCase()}`,
        };
      }

      return {
        valid: true,
        serialNo: serial,
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
      };
    }
  }

  async generateSerialNo(itemCode: string, tenant_id: string, prefix?: string): Promise<string> {
    const item = await this.itemRepository.findOne({
      where: { code: itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${itemCode} not found`);
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = today.toTimeString().slice(0, 8).replace(/:/g, '');
    
    // Generate serial number: PREFIX-ITEM-YYYYMMDD-HHMMSS
    const basePrefix = prefix || 'SN';
    const baseName = `${basePrefix}-${itemCode}-${dateStr}-${timeStr}`;
    
    // Check if this serial number already exists
    const existingSerial = await this.serialNoRepository.findOne({
      where: { name: baseName, tenant_id },
    });

    if (!existingSerial) {
      return baseName;
    }

    // If exists, add a counter
    let counter = 1;
    let serialNumber = `${baseName}-${counter.toString().padStart(3, '0')}`;
    
    while (await this.serialNoRepository.findOne({
      where: { name: serialNumber, tenant_id },
    })) {
      counter++;
      serialNumber = `${baseName}-${counter.toString().padStart(3, '0')}`;
    }

    return serialNumber;
  }

  async bulkCreateSerialNos(
    itemCode: string,
    warehouseCode: string,
    quantity: number,
    tenant_id: string,
    userId?: string,
    prefix?: string,
  ): Promise<SerialNo[]> {
    const item = await this.itemRepository.findOne({
      where: { code: itemCode, tenant: { id: tenant_id } },
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${itemCode} not found`);
    }

    if (!item.hasSerialNo) {
      throw new BadRequestException(`Item ${itemCode} does not have serial number tracking enabled`);
    }

    const warehouse = await this.warehouseRepository.findOne({
      where: { name: warehouseCode, tenant_id },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with code ${warehouseCode} not found`);
    }

    const serialNos: SerialNo[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const serialNumber = await this.generateSerialNo(itemCode, tenant_id, prefix);
      
      const serialNo = this.serialNoRepository.create({
        name: serialNumber,
        itemCode,
        warehouseId: warehouseCode,
        status: 'Active',
        assetStatus: 'Available',
        tenant_id,
        createdById: userId,
        modifiedById: userId,
      });
      
      serialNos.push(serialNo);
    }

    return this.serialNoRepository.save(serialNos);
  }
}