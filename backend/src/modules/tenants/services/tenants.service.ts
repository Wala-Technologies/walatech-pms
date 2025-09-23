import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Tenant, TenantStatus, TenantPlan } from '../../../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists');
    }

    const tenant = this.tenantRepository.create({
      id: uuidv4(),
      ...createTenantDto,
      status: createTenantDto.status || TenantStatus.TRIAL,
      plan: createTenantDto.plan || TenantPlan.BASIC,
      docstatus: 0,
    });

    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { subdomain },
    });
  }

  async findUserTenants(userId: string): Promise<Tenant[]> {
    // Find tenants where the user is a member
    return this.tenantRepository
      .createQueryBuilder('tenant')
      .innerJoin('tenant.users', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('tenant.status = :status', { status: 'active' })
      .getMany();
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Check subdomain uniqueness if being updated
    if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
      const existingTenant = await this.tenantRepository.findOne({
        where: { subdomain: updateTenantDto.subdomain },
      });
      if (existingTenant) {
        throw new ConflictException('Subdomain already exists');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  async activate(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.ACTIVE;
    return this.tenantRepository.save(tenant);
  }

  async suspend(id: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = TenantStatus.SUSPENDED;
    return this.tenantRepository.save(tenant);
  }

  async updatePlan(id: string, plan: TenantPlan): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.plan = plan;
    return this.tenantRepository.save(tenant);
  }
}