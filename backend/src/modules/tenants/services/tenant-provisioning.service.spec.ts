import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { Tenant, TenantStatus, TenantPlan } from '../../../entities/tenant.entity';
import { User } from '../../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('TenantProvisioningService', () => {
  let service: TenantProvisioningService;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockTenant: Tenant = {
    id: 'tenant1',
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    status: TenantStatus.ACTIVE,
    plan: TenantPlan.BASIC,
    settings: '{}',
    docstatus: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockUser: User = {
    id: 'user1',
    email: 'admin@test.com',
    password: 'hashedpassword',
    first_name: 'Admin',
    last_name: 'User',
    role_profile_name: 'admin',
    tenant_id: 'tenant1',
    enabled: true,
    time_zone: 'UTC',
    language: 'en',
    creation: new Date(),
    modified: new Date(),
    modified_by: 'system',
    owner: 'system',
    docstatus: 0,
    idx: 1,
    name: 'admin@test.com',
    full_name: 'Admin User',
    username: 'admin',
    user_type: 'System User',
    send_welcome_email: false,
    unsubscribed: false,
    user_image: null,
    role_profile: null,
    module_profile: null,
    home_settings: null,
    simultaneous_sessions: 1,
    restrict_ip: null,
    last_ip: null,
    login_after: null,
    user_tokens: [],
    departments: [],
  };

  const mockProvisionDto = {
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    plan: TenantPlan.BASIC,
    adminEmail: 'admin@test.com',
    adminPassword: 'password123',
    adminFirstName: 'Admin',
    adminLastName: 'User',
  };

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const mockTenantRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
    };

    const mockUserRepository = {
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantProvisioningService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TenantProvisioningService>(TenantProvisioningService);
    tenantRepository = module.get(getRepositoryToken(Tenant));
    userRepository = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
    queryRunner = dataSource.createQueryRunner() as jest.Mocked<QueryRunner>;

    // Mock bcrypt.hash
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('provisionTenant', () => {
    beforeEach(() => {
      tenantRepository.findOne.mockResolvedValue(null); // No existing tenant
      queryRunner.manager.findOne.mockResolvedValue(null); // No existing user
      queryRunner.manager.create.mockImplementation((entity, data) => ({ ...data }));
      queryRunner.manager.save.mockImplementation((entity, data) => Promise.resolve(data));
    });

    it('should provision tenant successfully', async () => {
      const result = await service.provisionTenant(mockProvisionDto);

      expect(result).toEqual({
        tenant: expect.objectContaining({
          name: 'Test Tenant',
          subdomain: 'test-tenant',
          status: TenantStatus.ACTIVE,
          plan: TenantPlan.BASIC,
        }),
        adminUser: expect.objectContaining({
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          role_profile_name: 'admin',
        }),
        setupComplete: true,
        message: 'Tenant provisioned successfully',
      });

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should validate subdomain availability', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.provisionTenant(mockProvisionDto))
        .rejects.toThrow(ConflictException);

      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: 'test-tenant' },
      });
    });

    it('should validate subdomain format', async () => {
      const invalidProvisionDto = {
        ...mockProvisionDto,
        subdomain: 'invalid_subdomain!',
      };

      await expect(service.provisionTenant(invalidProvisionDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject reserved subdomains', async () => {
      const reservedProvisionDto = {
        ...mockProvisionDto,
        subdomain: 'www',
      };

      await expect(service.provisionTenant(reservedProvisionDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should validate subdomain length', async () => {
      const shortSubdomainDto = {
        ...mockProvisionDto,
        subdomain: 'ab',
      };

      await expect(service.provisionTenant(shortSubdomainDto))
        .rejects.toThrow(BadRequestException);

      const longSubdomainDto = {
        ...mockProvisionDto,
        subdomain: 'a'.repeat(64),
      };

      await expect(service.provisionTenant(longSubdomainDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should check for existing admin email', async () => {
      queryRunner.manager.findOne.mockResolvedValue(mockUser);

      await expect(service.provisionTenant(mockProvisionDto))
        .rejects.toThrow(ConflictException);
    });

    it('should hash admin password', async () => {
      await service.provisionTenant(mockProvisionDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should create tenant with correct settings', async () => {
      await service.provisionTenant(mockProvisionDto);

      expect(queryRunner.manager.create).toHaveBeenCalledWith(Tenant, {
        id: expect.any(String),
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        status: TenantStatus.ACTIVE,
        plan: TenantPlan.BASIC,
        settings: JSON.stringify({
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD',
          language: 'en',
        }),
      });
    });

    it('should create admin user with correct properties', async () => {
      await service.provisionTenant(mockProvisionDto);

      expect(queryRunner.manager.create).toHaveBeenCalledWith(User, {
        id: expect.any(String),
        email: 'admin@test.com',
        password: 'hashedpassword',
        first_name: 'Admin',
        last_name: 'User',
        role_profile_name: 'admin',
        tenant_id: expect.any(String),
        enabled: true,
        time_zone: 'UTC',
        language: 'en',
      });
    });

    it('should rollback transaction on error', async () => {
      queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(service.provisionTenant(mockProvisionDto))
        .rejects.toThrow('Database error');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should use default plan if not provided', async () => {
      const dtoWithoutPlan = { ...mockProvisionDto };
      delete dtoWithoutPlan.plan;

      await service.provisionTenant(dtoWithoutPlan);

      expect(queryRunner.manager.create).toHaveBeenCalledWith(Tenant, 
        expect.objectContaining({
          plan: TenantPlan.BASIC,
        })
      );
    });
  });

  describe('deprovisionTenant', () => {
    beforeEach(() => {
      queryRunner.manager.update.mockResolvedValue({ affected: 1 });
    });

    it('should deprovision tenant successfully', async () => {
      await service.deprovisionTenant('tenant1');

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        Tenant,
        'tenant1',
        {
          status: TenantStatus.SUSPENDED,
          updatedAt: expect.any(Date),
        }
      );

      expect(queryRunner.manager.update).toHaveBeenCalledWith(
        User,
        { tenant_id: 'tenant1' },
        { enabled: false, modified: expect.any(Date) }
      );
    });

    it('should rollback transaction on error', async () => {
      queryRunner.manager.update.mockRejectedValue(new Error('Database error'));

      await expect(service.deprovisionTenant('tenant1'))
        .rejects.toThrow('Database error');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getTenantProvisioningStatus', () => {
    it('should return provisioning status for existing tenant', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      userRepository.count.mockResolvedValue(5);

      const result = await service.getTenantProvisioningStatus('tenant1');

      expect(result).toEqual({
        tenant: mockTenant,
        userCount: 5,
        isFullyProvisioned: true,
      });

      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant1' },
      });
      expect(userRepository.count).toHaveBeenCalledWith({
        where: { tenant_id: 'tenant1' },
      });
    });

    it('should return false for isFullyProvisioned when no users exist', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      userRepository.count.mockResolvedValue(0);

      const result = await service.getTenantProvisioningStatus('tenant1');

      expect(result.isFullyProvisioned).toBe(false);
    });

    it('should return false for isFullyProvisioned when tenant is suspended', async () => {
      const suspendedTenant = { ...mockTenant, status: TenantStatus.SUSPENDED };
      tenantRepository.findOne.mockResolvedValue(suspendedTenant);
      userRepository.count.mockResolvedValue(5);

      const result = await service.getTenantProvisioningStatus('tenant1');

      expect(result.isFullyProvisioned).toBe(false);
    });

    it('should throw BadRequestException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantProvisioningStatus('nonexistent'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('plan limits', () => {
    it('should return correct limits for BASIC plan', async () => {
      const basicProvisionDto = { ...mockProvisionDto, plan: TenantPlan.BASIC };
      
      await service.provisionTenant(basicProvisionDto);

      // Check that the settings include correct limits for basic plan
      const settingsCall = queryRunner.manager.update.mock.calls.find(
        call => call[0] === Tenant && call[2].settings
      );
      
      if (settingsCall) {
        const settings = JSON.parse(settingsCall[2].settings);
        expect(settings.limits.maxUsers).toBe(10);
        expect(settings.limits.maxStorage).toBe('1GB');
        expect(settings.limits.maxApiCalls).toBe(1000);
      }
    });

    it('should return correct limits for PROFESSIONAL plan', async () => {
      const proProvisionDto = { ...mockProvisionDto, plan: TenantPlan.PROFESSIONAL };
      
      await service.provisionTenant(proProvisionDto);

      const settingsCall = queryRunner.manager.update.mock.calls.find(
        call => call[0] === Tenant && call[2].settings
      );
      
      if (settingsCall) {
        const settings = JSON.parse(settingsCall[2].settings);
        expect(settings.limits.maxUsers).toBe(50);
        expect(settings.limits.maxStorage).toBe('10GB');
        expect(settings.limits.maxApiCalls).toBe(10000);
      }
    });

    it('should return correct limits for ENTERPRISE plan', async () => {
      const enterpriseProvisionDto = { ...mockProvisionDto, plan: TenantPlan.ENTERPRISE };
      
      await service.provisionTenant(enterpriseProvisionDto);

      const settingsCall = queryRunner.manager.update.mock.calls.find(
        call => call[0] === Tenant && call[2].settings
      );
      
      if (settingsCall) {
        const settings = JSON.parse(settingsCall[2].settings);
        expect(settings.limits.maxUsers).toBe(500);
        expect(settings.limits.maxStorage).toBe('100GB');
        expect(settings.limits.maxApiCalls).toBe(100000);
      }
    });
  });

  describe('subdomain validation edge cases', () => {
    it('should accept valid subdomains', async () => {
      const validSubdomains = ['test', 'test-123', 'my-company', 'abc123'];

      for (const subdomain of validSubdomains) {
        const dto = { ...mockProvisionDto, subdomain };
        await expect(service.provisionTenant(dto)).resolves.toBeDefined();
      }
    });

    it('should reject invalid subdomains', async () => {
      const invalidSubdomains = [
        'Test', // uppercase
        'test_', // underscore
        '-test', // starts with hyphen
        'test-', // ends with hyphen
        'te', // too short
        'test.com', // contains dot
        'test space', // contains space
      ];

      for (const subdomain of invalidSubdomains) {
        const dto = { ...mockProvisionDto, subdomain };
        await expect(service.provisionTenant(dto))
          .rejects.toThrow(BadRequestException);
      }
    });

    it('should reject all reserved subdomains', async () => {
      const reservedSubdomains = [
        'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'shop',
        'support', 'help', 'docs', 'status', 'cdn', 'assets', 'static'
      ];

      for (const subdomain of reservedSubdomains) {
        const dto = { ...mockProvisionDto, subdomain };
        await expect(service.provisionTenant(dto))
          .rejects.toThrow(BadRequestException);
      }
    });
  });
});