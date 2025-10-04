import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, TenantStatus, TenantPlan } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import { Department } from '../../hr/entities/department.entity';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';
import { BusinessUnitType } from '../../../common/enums/business-unit-types.enum';
import { UserRole } from '../../../common/enums/user-roles.enum';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TenantProvisioningResult {
  tenant: Tenant;
  adminUser: User;
  defaultUsersCreated: number;
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
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
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
      const defaultUsersCreated = await this.setupDefaultConfigurations(tenant, queryRunner);

      await queryRunner.commitTransaction();

      return {
        tenant,
        adminUser,
        defaultUsersCreated,
        setupComplete: true,
        message: 'Tenant provisioned successfully with default users',
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

  private async setupDefaultConfigurations(tenant: Tenant, queryRunner: any): Promise<number> {
    // This method can be extended to set up default:
    // - Warehouses
    // - Product categories
    // - User roles
    // - Workflow templates
    // - Report templates
    
    // Create default departments
    await this.createDefaultDepartments(tenant, queryRunner);
    
    // Create commonly used default users
    const defaultUsersCreated = await this.createDefaultUsers(tenant, queryRunner);
    
    console.log(`Default configurations set up for tenant: ${tenant.subdomain}`);
    return defaultUsersCreated;
  }

  private async createDefaultDepartments(tenant: Tenant, queryRunner: any): Promise<void> {
    const defaultDepartments = [
      {
        name: 'HR',
        code: 'HR',
        department_name: 'Human Resources',
        description: 'Manages employee relations, recruitment, and organizational development',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Accounting',
        code: 'ACC',
        department_name: 'Accounting',
        description: 'Handles financial records, bookkeeping, and financial reporting',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Purchasing',
        code: 'PUR',
        department_name: 'Purchasing',
        description: 'Manages procurement, vendor relations, and supply chain',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Sales',
        code: 'SAL',
        department_name: 'Sales',
        description: 'Drives revenue generation and customer acquisition',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Marketing',
        code: 'MKT',
        department_name: 'Marketing',
        description: 'Manages brand promotion, advertising, and market research',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Production',
        code: 'PRD',
        department_name: 'Production',
        description: 'Oversees manufacturing, quality control, and production planning',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'IT',
        code: 'IT',
        department_name: 'Information Technology',
        description: 'Manages technology infrastructure, software development, and IT support',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Finance',
        code: 'FIN',
        department_name: 'Finance',
        description: 'Handles financial planning, analysis, and strategic financial management',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Operations',
        code: 'OPS',
        department_name: 'Operations',
        description: 'Manages day-to-day business operations and process optimization',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
      {
        name: 'Legal',
        code: 'LEG',
        department_name: 'Legal',
        description: 'Handles legal compliance, contracts, and regulatory matters',
        business_unit_type: BusinessUnitType.GENERAL,
        company: tenant.name,
      },
    ];

    try {
      for (const deptData of defaultDepartments) {
        const department = queryRunner.manager.create(Department, {
          id: uuidv4(),
          ...deptData,
          tenant_id: tenant.id,
          owner: 'system',
          is_group: false,
          disabled: false,
        });

        await queryRunner.manager.save(Department, department);
      }

      console.log(`Created ${defaultDepartments.length} default departments for tenant: ${tenant.subdomain}`);
    } catch (error) {
      console.error(`Error creating default departments for tenant ${tenant.subdomain}:`, error);
      throw error;
    }
  }

  private async createDefaultUsers(tenant: Tenant, queryRunner: any): Promise<number> {
    // Get all departments for this tenant to assign users to them
    const departments = await queryRunner.manager.find(Department, {
      where: { tenant_id: tenant.id },
    });

    // Create a mapping of department codes to department IDs
    const deptMap = departments.reduce((map, dept) => {
      map[dept.code] = dept.id;
      return map;
    }, {} as Record<string, string>);

    // Define commonly used default users
    const defaultUsers = [
      // HR Department Users
      {
        email: `hr.manager@${tenant.subdomain}.com`,
        first_name: 'HR',
        last_name: 'Manager',
        role: UserRole.HR,
        department_id: deptMap['HR'],
        password: 'TempPass123!',
      },
      {
        email: `hr.assistant@${tenant.subdomain}.com`,
        first_name: 'HR',
        last_name: 'Assistant',
        role: UserRole.REGULAR_USER,
        department_id: deptMap['HR'],
        password: 'TempPass123!',
      },
      
      // Accounting Department Users
      {
        email: `accountant@${tenant.subdomain}.com`,
        first_name: 'Chief',
        last_name: 'Accountant',
        role: UserRole.ACCOUNTING,
        department_id: deptMap['ACC'],
        password: 'TempPass123!',
      },
      {
        email: `finance.manager@${tenant.subdomain}.com`,
        first_name: 'Finance',
        last_name: 'Manager',
        role: UserRole.MANAGER,
        department_id: deptMap['FIN'],
        password: 'TempPass123!',
      },
      
      // Sales Department Users
      {
        email: `sales.manager@${tenant.subdomain}.com`,
        first_name: 'Sales',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['SAL'],
        password: 'TempPass123!',
      },
      {
        email: `sales.rep@${tenant.subdomain}.com`,
        first_name: 'Sales',
        last_name: 'Representative',
        role: UserRole.SALES,
        department_id: deptMap['SAL'],
        password: 'TempPass123!',
      },
      
      // Purchasing Department Users
      {
        email: `purchasing.manager@${tenant.subdomain}.com`,
        first_name: 'Purchasing',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['PUR'],
        password: 'TempPass123!',
      },
      {
        email: `buyer@${tenant.subdomain}.com`,
        first_name: 'Senior',
        last_name: 'Buyer',
        role: UserRole.PURCHASING,
        department_id: deptMap['PUR'],
        password: 'TempPass123!',
      },
      
      // Production Department Users
      {
        email: `production.manager@${tenant.subdomain}.com`,
        first_name: 'Production',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['PRD'],
        password: 'TempPass123!',
      },
      {
        email: `production.supervisor@${tenant.subdomain}.com`,
        first_name: 'Production',
        last_name: 'Supervisor',
        role: UserRole.PRODUCTION,
        department_id: deptMap['PRD'],
        password: 'TempPass123!',
      },
      {
        email: `quality.inspector@${tenant.subdomain}.com`,
        first_name: 'Quality',
        last_name: 'Inspector',
        role: UserRole.REGULAR_USER,
        department_id: deptMap['PRD'],
        password: 'TempPass123!',
      },
      
      // IT Department Users
      {
        email: `it.manager@${tenant.subdomain}.com`,
        first_name: 'IT',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['IT'],
        password: 'TempPass123!',
      },
      {
        email: `system.admin@${tenant.subdomain}.com`,
        first_name: 'System',
        last_name: 'Administrator',
        role: UserRole.MANAGER,
        department_id: deptMap['IT'],
        password: 'TempPass123!',
      },
      
      // Operations Department Users
      {
        email: `operations.manager@${tenant.subdomain}.com`,
        first_name: 'Operations',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['OPS'],
        password: 'TempPass123!',
      },
      
      // Marketing Department Users
      {
        email: `marketing.manager@${tenant.subdomain}.com`,
        first_name: 'Marketing',
        last_name: 'Manager',
        role: UserRole.DEPARTMENT_HEAD,
        department_id: deptMap['MKT'],
        password: 'TempPass123!',
      },
    ];

    let createdCount = 0;

    try {
      for (const userData of defaultUsers) {
        // Check if user with this email already exists
        const existingUser = await queryRunner.manager.findOne(User, {
          where: { email: userData.email },
        });

        if (!existingUser) {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);

          const user = queryRunner.manager.create(User, {
            id: uuidv4(),
            email: userData.email,
            password: hashedPassword,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            role_profile_name: userData.role,
            department_id: userData.department_id,
            tenant_id: tenant.id,
            enabled: true,
            time_zone: 'UTC',
            language: 'en',
            owner: 'system',
          });

          await queryRunner.manager.save(User, user);
          createdCount++;
        }
      }

      console.log(`Created ${createdCount} default users for tenant: ${tenant.subdomain}`);
      return createdCount;
    } catch (error) {
      console.error(`Error creating default users for tenant ${tenant.subdomain}:`, error);
      throw error;
    }
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