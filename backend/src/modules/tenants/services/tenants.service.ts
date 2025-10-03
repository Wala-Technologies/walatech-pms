import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  Tenant,
  TenantStatus,
  TenantPlan,
} from '../../../entities/tenant.entity';
import { 
  TenantLifecycleAudit, 
  TenantLifecycleAction 
} from '../../../entities/tenant-lifecycle-audit.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantLifecycleAudit)
    private auditRepository: Repository<TenantLifecycleAudit>,
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
      // Use ACTIVE as default since DB enum does not include 'trial'
      status: createTenantDto.status || TenantStatus.ACTIVE,
      plan: createTenantDto.plan || TenantPlan.BASIC,
      docstatus: 0,
    });

    return this.tenantRepository.save(tenant);
  }

  async findAll(includeDeleted = false, statusFilter?: TenantStatus): Promise<Tenant[]> {
    const whereCondition: any = {};
    
    if (!includeDeleted) {
      whereCondition.status = Not(TenantStatus.HARD_DELETED);
    }
    
    // If a specific status filter is provided, use it (overrides includeDeleted logic)
    if (statusFilter) {
      whereCondition.status = statusFilter;
    }

    return this.tenantRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, includeDeleted = false): Promise<Tenant> {
    const whereCondition: any = { id };
    
    if (!includeDeleted) {
      whereCondition.status = Not(TenantStatus.HARD_DELETED);
    }

    const tenant = await this.tenantRepository.findOne({
      where: whereCondition,
    });
    
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
    if (
      updateTenantDto.subdomain &&
      updateTenantDto.subdomain !== tenant.subdomain
    ) {
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
    
    // Implement soft delete by marking tenant as deleted
    // This avoids foreign key constraint issues while preserving data integrity
    tenant.status = TenantStatus.SUSPENDED;
    tenant.name = `[DELETED] ${tenant.name}`;
    tenant.subdomain = `deleted-${Date.now()}-${tenant.subdomain}`;
    
    await this.tenantRepository.save(tenant);
    
    // Also disable all users in this tenant to prevent access
    await this.tenantRepository.manager
      .createQueryBuilder()
      .update('tabuser')
      .set({ enabled: false })
      .where('tenant_id = :tenantId', { tenantId: id })
      .execute();
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

  // Lifecycle Management Methods

  async softDelete(
    id: string, 
    deletedBy: string, 
    reason?: string,
    customRetentionDays?: number
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    
    if (tenant.isSoftDeleted() || tenant.isHardDeleted()) {
      throw new BadRequestException('Tenant is already deleted');
    }

    const previousStatus = tenant.status as TenantStatus;
    const now = new Date();
    const retentionDays = customRetentionDays || tenant.retentionPeriodDays || 90;
    
    // Calculate hard deletion date
    const hardDeleteDate = new Date(now);
    hardDeleteDate.setDate(hardDeleteDate.getDate() + retentionDays);

    // Update tenant
    tenant.status = TenantStatus.SOFT_DELETED;
    tenant.softDeletedAt = now;
    tenant.hardDeleteScheduledAt = hardDeleteDate;
    tenant.deletedBy = deletedBy;
    tenant.deletionReason = reason || null;
    
    if (customRetentionDays) {
      tenant.retentionPeriodDays = customRetentionDays;
    }

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create audit log
    await this.createAuditLog({
      tenant_id: id,
      action: TenantLifecycleAction.SOFT_DELETE,
      previousStatus,
      newStatus: TenantStatus.SOFT_DELETED,
      performedBy: deletedBy,
      reason,
      scheduledAt: hardDeleteDate,
      metadata: {
        retentionPeriodDays: retentionDays,
        hardDeleteScheduledAt: hardDeleteDate.toISOString(),
      },
    });

    return savedTenant;
  }

  async hardDelete(id: string, performedBy: string, reason?: string): Promise<void> {
    const tenant = await this.findOne(id);
    
    if (tenant.isHardDeleted()) {
      throw new BadRequestException('Tenant is already hard deleted');
    }

    const previousStatus = tenant.status as TenantStatus;

    // Create audit log before deletion
    await this.createAuditLog({
      tenant_id: id,
      action: TenantLifecycleAction.HARD_DELETE,
      previousStatus,
      newStatus: TenantStatus.HARD_DELETED,
      performedBy,
      reason,
      metadata: {
        finalDeletionDate: new Date().toISOString(),
      },
    });

    // Mark as hard deleted instead of removing from database
    tenant.status = TenantStatus.HARD_DELETED;
    tenant.deletedBy = performedBy;
    tenant.deletionReason = reason || tenant.deletionReason;
    
    await this.tenantRepository.save(tenant);
  }

  async reactivate(id: string, performedBy: string, reason?: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    
    if (!tenant.canBeReactivated()) {
      throw new BadRequestException('Tenant cannot be reactivated from current status');
    }

    const previousStatus = tenant.status as TenantStatus;

    // Reset deletion fields
    tenant.status = TenantStatus.ACTIVE;
    tenant.softDeletedAt = null;
    tenant.hardDeleteScheduledAt = null;
    tenant.deletedBy = null;
    tenant.deletionReason = null;

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create audit log
    await this.createAuditLog({
      tenant_id: id,
      action: TenantLifecycleAction.RESTORE,
      previousStatus,
      newStatus: TenantStatus.ACTIVE,
      performedBy,
      reason,
      metadata: {
        reactivationDate: new Date().toISOString(),
      },
    });

    return savedTenant;
  }

  async updateRetentionPeriod(
    id: string, 
    retentionPeriodDays: number, 
    performedBy: string
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    
    if (retentionPeriodDays < 7 || retentionPeriodDays > 365) {
      throw new BadRequestException('Retention period must be between 7 and 365 days');
    }

    const previousRetention = tenant.retentionPeriodDays;
    tenant.retentionPeriodDays = retentionPeriodDays;

    // If tenant is soft deleted, update hard deletion date
    if (tenant.isSoftDeleted() && tenant.softDeletedAt) {
      const newHardDeleteDate = new Date(tenant.softDeletedAt);
      newHardDeleteDate.setDate(newHardDeleteDate.getDate() + retentionPeriodDays);
      tenant.hardDeleteScheduledAt = newHardDeleteDate;
    }

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create audit log
    await this.createAuditLog({
      tenant_id: id,
      action: TenantLifecycleAction.UPDATE_RETENTION_PERIOD,
      previousStatus: tenant.status as TenantStatus,
      newStatus: tenant.status as TenantStatus,
      performedBy,
      metadata: {
        previousRetentionDays: previousRetention,
        newRetentionDays: retentionPeriodDays,
        newHardDeleteDate: tenant.hardDeleteScheduledAt?.toISOString(),
      },
    });

    return savedTenant;
  }

  async getTenantsEligibleForHardDeletion(): Promise<Tenant[]> {
    const now = new Date();
    return this.tenantRepository.find({
      where: {
        status: TenantStatus.SOFT_DELETED,
      },
    }).then(tenants => 
      tenants.filter(tenant => tenant.isEligibleForHardDeletion())
    );
  }

  async getTenantAuditLog(id: string): Promise<TenantLifecycleAudit[]> {
    return this.auditRepository.find({
      where: { tenant_id: id },
      order: { createdAt: 'DESC' },
    });
  }

  private async createAuditLog(auditData: Partial<TenantLifecycleAudit>): Promise<TenantLifecycleAudit> {
    const audit = this.auditRepository.create({
      id: uuidv4(),
      ...auditData,
    });
    return this.auditRepository.save(audit);
  }


}
