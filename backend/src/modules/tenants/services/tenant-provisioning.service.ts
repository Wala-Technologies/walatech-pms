import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, TenantStatus, TenantPlan } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TenantProvisioningResult {
  tenant: Tenant;
  adminUser: User;
  setupComplete: boolean;
  message: string;
}



@Injectable()
export class TenantProvisioningService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async provisionTenant(provisionDto: ProvisionTenantDto): Promise<TenantProvisioningResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Validate subdomain availability
      await this.validateSubdomain(provisionDto.subdomain);

      // Step 2: Create tenant
      const tenant = await this.createTenant(provisionDto, queryRunner);

      // Step 3: Create admin user
      const adminUser = await this.createAdminUser(tenant, provisionDto, queryRunner);

      // Step 4: Initialize tenant settings
      await this.initializeTenantSettings(tenant, queryRunner);

      // Step 5: Set up default configurations
      await this.setupDefaultConfigurations(tenant, queryRunner);

      await queryRunner.commitTransaction();

      return {
        tenant,
        adminUser,
        setupComplete: true,
        message: 'Tenant provisioned successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateSubdomain(subdomain: string): Promise<void> {
    // Check if subdomain is already taken
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain is already taken');
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 3 || subdomain.length > 63) {
      throw new BadRequestException(
        'Subdomain must be 3-63 characters long and contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Check for reserved subdomains
    const reservedSubdomains = [
      'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop',
      'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static'
    ];

    if (reservedSubdomains.includes(subdomain)) {
      throw new BadRequestException('This subdomain is reserved');
    }
  }

  private async createTenant(provisionDto: ProvisionTenantDto, queryRunner: any): Promise<Tenant> {
    const tenant = queryRunner.manager.create(Tenant, {
      id: uuidv4(),
      name: provisionDto.name,
      subdomain: provisionDto.subdomain,
      status: TenantStatus.ACTIVE,
      plan: provisionDto.plan || TenantPlan.BASIC,
      settings: JSON.stringify({
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        currency: 'USD',
        language: 'en',
      }),
    });

    return await queryRunner.manager.save(Tenant, tenant);
  }

  private async createAdminUser(tenant: Tenant, provisionDto: ProvisionTenantDto, queryRunner: any): Promise<User> {
    // Check if admin email already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { email: provisionDto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Admin email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(provisionDto.adminPassword, 12);

    const adminUser = queryRunner.manager.create(User, {
      id: uuidv4(),
      email: provisionDto.adminEmail,
      password: hashedPassword,
      first_name: provisionDto.adminFirstName,
      last_name: provisionDto.adminLastName,
      role_profile_name: 'admin',
      tenant_id: tenant.id,
      enabled: true,
      time_zone: 'UTC',
      language: 'en',
    });

    return await queryRunner.manager.save(User, adminUser);
  }

  private async initializeTenantSettings(tenant: Tenant, queryRunner: any): Promise<void> {
    // Initialize default tenant settings
    const existingSettings = tenant.settings ? JSON.parse(tenant.settings) : {};
    const defaultSettings = {
      ...existingSettings,
      features: {
        inventory: true,
        production: true,
        reporting: true,
        userManagement: true,
      },
      limits: {
        maxUsers: this.getMaxUsersForPlan(tenant.plan as TenantPlan),
        maxStorage: this.getMaxStorageForPlan(tenant.plan as TenantPlan),
        maxApiCalls: this.getMaxApiCallsForPlan(tenant.plan as TenantPlan),
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    };

    await queryRunner.manager.update(Tenant, tenant.id, {
      settings: JSON.stringify(defaultSettings),
    });
  }

  private async setupDefaultConfigurations(tenant: Tenant, queryRunner: any): Promise<void> {
    // This method can be extended to set up default:
    // - Warehouses
    // - Product categories
    // - User roles
    // - Workflow templates
    // - Report templates
    
    // For now, we'll just log that the setup is complete
    console.log(`Default configurations set up for tenant: ${tenant.subdomain}`);
  }

  private getMaxUsersForPlan(plan: TenantPlan): number {
    switch (plan) {
      case TenantPlan.BASIC:
        return 10;
      case TenantPlan.PROFESSIONAL:
        return 50;
      case TenantPlan.ENTERPRISE:
        return 500;
      default:
        return 10;
    }
  }

  private getMaxStorageForPlan(plan: TenantPlan): string {
    switch (plan) {
      case TenantPlan.BASIC:
        return '1GB';
      case TenantPlan.PROFESSIONAL:
        return '10GB';
      case TenantPlan.ENTERPRISE:
        return '100GB';
      default:
        return '1GB';
    }
  }

  private getMaxApiCallsForPlan(plan: TenantPlan): number {
    switch (plan) {
      case TenantPlan.BASIC:
        return 1000;
      case TenantPlan.PROFESSIONAL:
        return 10000;
      case TenantPlan.ENTERPRISE:
        return 100000;
      default:
        return 1000;
    }
  }

  async deprovisionTenant(tenant_id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Deactivate tenant
      await queryRunner.manager.update(Tenant, tenant_id, {
        status: TenantStatus.SUSPENDED,
        updatedAt: new Date(),
      });

      // Step 2: Disable all users
      await queryRunner.manager.update(User, 
        { tenant_id: tenant_id },
        { enabled: false, modified: new Date() }
      );

      // Step 3: Clean up tenant data (optional - based on requirements)
      // This could include archiving or deleting tenant-specific data

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTenantProvisioningStatus(tenant_id: string): Promise<{
    tenant: Tenant;
    userCount: number;
    isFullyProvisioned: boolean;
  }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenant_id },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const userCount = await this.userRepository.count({
      where: { tenant_id: tenant_id },
    });

    const isFullyProvisioned = tenant.status === TenantStatus.ACTIVE && userCount > 0;

    return {
      tenant,
      userCount,
      isFullyProvisioned,
    };
  }
}