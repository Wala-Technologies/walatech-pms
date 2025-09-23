import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { Tenant } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';

export interface CreateWarehouseDto {
  name: string;
  code: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {
  id: string;
}

export interface WarehouseQueryDto {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto, tenant_id: string, userId?: string): Promise<Warehouse> {
    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({ where: { id: tenant_id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if warehouse name is unique within tenant
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: {
        name: createWarehouseDto.name,
        tenant_id,
      },
    });

    if (existingWarehouse) {
      throw new BadRequestException('Warehouse name already exists');
    }

    // Check if warehouse code is unique within tenant
    const existingCode = await this.warehouseRepository.findOne({
      where: {
        code: createWarehouseDto.code,
        tenant_id,
      },
    });

    if (existingCode) {
      throw new BadRequestException('Warehouse code already exists');
    }

    // Create warehouse
    const warehouse = this.warehouseRepository.create({
      name: createWarehouseDto.name,
      code: createWarehouseDto.code,
      address: createWarehouseDto.address,
      contact_person: createWarehouseDto.contact_person,
      phone: createWarehouseDto.phone,
      email: createWarehouseDto.email,
      is_active: createWarehouseDto.is_active !== undefined ? createWarehouseDto.is_active : true,
      tenant_id,
    });

    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(query: WarehouseQueryDto, tenant_id: string): Promise<{ warehouses: Warehouse[]; total: number }> {
    const queryBuilder = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .where('warehouse.tenant_id = :tenant_id', { tenant_id });

    // Apply filters
    if (query.is_active !== undefined) {
      queryBuilder.andWhere('warehouse.is_active = :is_active', { is_active: query.is_active });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(warehouse.name ILIKE :search OR warehouse.code ILIKE :search OR warehouse.address ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('warehouse.name', 'ASC');

    const [warehouses, total] = await queryBuilder.getManyAndCount();

    return { warehouses, total };
  }

  async findOne(id: string, tenant_id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, tenant_id },
      relations: ['tenant', 'bins'],
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async findByName(warehouseName: string, tenant_id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { name: warehouseName, tenant_id },
      relations: ['bins'],
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async update(updateWarehouseDto: UpdateWarehouseDto, tenant_id: string, userId?: string): Promise<Warehouse> {
    const warehouse = await this.findOne(updateWarehouseDto.id, tenant_id);

    // Check if new name conflicts with existing warehouse
    if (updateWarehouseDto.name && updateWarehouseDto.name !== warehouse.name) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: {
          name: updateWarehouseDto.name,
          tenant_id,
        },
      });

      if (existingWarehouse) {
        throw new BadRequestException('Warehouse name already exists');
      }
    }

    // Check if new code conflicts with existing warehouse
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingCode = await this.warehouseRepository.findOne({
        where: {
          code: updateWarehouseDto.code,
          tenant_id,
        },
      });

      if (existingCode) {
        throw new BadRequestException('Warehouse code already exists');
      }
    }

    // Update fields
    if (updateWarehouseDto.name) warehouse.name = updateWarehouseDto.name;
    if (updateWarehouseDto.code) warehouse.code = updateWarehouseDto.code;
    if (updateWarehouseDto.address) warehouse.address = updateWarehouseDto.address;
    if (updateWarehouseDto.contact_person) warehouse.contact_person = updateWarehouseDto.contact_person;
    if (updateWarehouseDto.phone) warehouse.phone = updateWarehouseDto.phone;
    if (updateWarehouseDto.email) warehouse.email = updateWarehouseDto.email;
    if (updateWarehouseDto.is_active !== undefined) warehouse.is_active = updateWarehouseDto.is_active;

    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string, tenant_id: string): Promise<void> {
    const warehouse = await this.findOne(id, tenant_id);

    // TODO: Check if warehouse has stock entries or bins
    // This would require additional validation

    await this.warehouseRepository.remove(warehouse);
  }

  async getWarehouseHierarchy(tenant_id: string): Promise<Warehouse[]> {
    return await this.warehouseRepository.find({
      where: { tenant_id },
      order: { name: 'ASC' },
    });
  }

  async getChildWarehouses(parentWarehouseName: string, tenant_id: string): Promise<Warehouse[]> {
    // Since we removed the parentWarehouse relationship, return empty array
    return [];
  }

  async getAllChildWarehouses(parentWarehouseName: string, tenant_id: string): Promise<string[]> {
    // Since we removed the parentWarehouse relationship, return empty array
    return [];
  }
}