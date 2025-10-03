import { Test, TestingModule } from '@nestjs/testing';
import { TenantProvisioningController } from './tenant-provisioning.controller';
import { TenantProvisioningService } from '../services/tenant-provisioning.service';
import { ProvisionTenantDto } from '../dto/provision-tenant.dto';
import { TenantPlan, TenantStatus } from '../../../entities/tenant.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('TenantProvisioningController', () => {
  let controller: TenantProvisioningController;
  let tenantProvisioningService: jest.Mocked<TenantProvisioningService>;

  const mockTenant = {
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

  const mockAdminUser = {
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

  const mockProvisioningResult = {
    tenant: mockTenant,
    adminUser: mockAdminUser,
    setupComplete: true,
    message: 'Tenant provisioned successfully',
  };

  const mockProvisioningStatus = {
    tenant: mockTenant,
    userCount: 5,
    isFullyProvisioned: true,
  };

  beforeEach(async () => {
    const mockTenantProvisioningService = {
      provisionTenant: jest.fn(),
      getTenantProvisioningStatus: jest.fn(),
      deprovisionTenant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantProvisioningController],
      providers: [
        {
          provide: TenantProvisioningService,
          useValue: mockTenantProvisioningService,
        },
      ],
    }).compile();

    controller = module.get<TenantProvisioningController>(TenantProvisioningController);
    tenantProvisioningService = module.get(TenantProvisioningService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('provisionTenant', () => {
    it('should provision tenant successfully', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockResolvedValue(mockProvisioningResult);

      const result = await controller.provisionTenant(provisionDto);

      expect(result).toEqual(mockProvisioningResult);
      expect(tenantProvisioningService.provisionTenant).toHaveBeenCalledWith(provisionDto);
    });

    it('should handle subdomain conflict error', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'existing-tenant',
        plan: TenantPlan.BASIC,
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new ConflictException('Subdomain already exists')
      );

      await expect(controller.provisionTenant(provisionDto)).rejects.toThrow(ConflictException);
    });

    it('should handle admin email conflict error', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
        adminEmail: 'existing@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new ConflictException('Admin email already exists')
      );

      await expect(controller.provisionTenant(provisionDto)).rejects.toThrow(ConflictException);
    });

    it('should handle invalid subdomain format error', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'invalid_subdomain!',
        plan: TenantPlan.BASIC,
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new BadRequestException('Invalid subdomain format')
      );

      await expect(controller.provisionTenant(provisionDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle reserved subdomain error', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'www',
        plan: TenantPlan.BASIC,
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new BadRequestException('Subdomain is reserved')
      );

      await expect(controller.provisionTenant(provisionDto)).rejects.toThrow(BadRequestException);
    });

    it('should provision tenant with PROFESSIONAL plan', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Professional Tenant',
        subdomain: 'pro-tenant',
        plan: TenantPlan.PROFESSIONAL,
        adminEmail: 'admin@pro.com',
        adminPassword: 'password123',
        adminFirstName: 'Pro',
        adminLastName: 'Admin',
      };

      const proResult = {
        ...mockProvisioningResult,
        tenant: { ...mockTenant, plan: TenantPlan.PROFESSIONAL },
      };

      tenantProvisioningService.provisionTenant.mockResolvedValue(proResult);

      const result = await controller.provisionTenant(provisionDto);

      expect(result).toEqual(proResult);
      expect(result.tenant.plan).toBe(TenantPlan.PROFESSIONAL);
    });

    it('should provision tenant with ENTERPRISE plan', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Enterprise Tenant',
        subdomain: 'enterprise-tenant',
        plan: TenantPlan.ENTERPRISE,
        adminEmail: 'admin@enterprise.com',
        adminPassword: 'password123',
        adminFirstName: 'Enterprise',
        adminLastName: 'Admin',
      };

      const enterpriseResult = {
        ...mockProvisioningResult,
        tenant: { ...mockTenant, plan: TenantPlan.ENTERPRISE },
      };

      tenantProvisioningService.provisionTenant.mockResolvedValue(enterpriseResult);

      const result = await controller.provisionTenant(provisionDto);

      expect(result).toEqual(enterpriseResult);
      expect(result.tenant.plan).toBe(TenantPlan.ENTERPRISE);
    });

    it('should handle provisioning with default plan when not specified', async () => {
      const provisionDto = {
        name: 'Default Tenant',
        subdomain: 'default-tenant',
        adminEmail: 'admin@default.com',
        adminPassword: 'password123',
        adminFirstName: 'Default',
        adminLastName: 'Admin',
      } as ProvisionTenantDto;

      tenantProvisioningService.provisionTenant.mockResolvedValue(mockProvisioningResult);

      const result = await controller.provisionTenant(provisionDto);

      expect(result).toEqual(mockProvisioningResult);
      expect(tenantProvisioningService.provisionTenant).toHaveBeenCalledWith(provisionDto);
    });
  });

  describe('getTenantProvisioningStatus', () => {
    it('should return tenant provisioning status successfully', async () => {
      tenantProvisioningService.getTenantProvisioningStatus.mockResolvedValue(mockProvisioningStatus);

      const result = await controller.getTenantProvisioningStatus('tenant1');

      expect(result).toEqual(mockProvisioningStatus);
      expect(tenantProvisioningService.getTenantProvisioningStatus).toHaveBeenCalledWith('tenant1');
    });

    it('should return status for partially provisioned tenant', async () => {
      const partialStatus = {
        ...mockProvisioningStatus,
        userCount: 0,
        isFullyProvisioned: false,
      };

      tenantProvisioningService.getTenantProvisioningStatus.mockResolvedValue(partialStatus);

      const result = await controller.getTenantProvisioningStatus('tenant1');

      expect(result).toEqual(partialStatus);
      expect(result.isFullyProvisioned).toBe(false);
    });

    it('should return status for suspended tenant', async () => {
      const suspendedStatus = {
        ...mockProvisioningStatus,
        tenant: { ...mockTenant, status: TenantStatus.SUSPENDED },
        isFullyProvisioned: false,
      };

      tenantProvisioningService.getTenantProvisioningStatus.mockResolvedValue(suspendedStatus);

      const result = await controller.getTenantProvisioningStatus('tenant1');

      expect(result).toEqual(suspendedStatus);
      expect(result.tenant.status).toBe(TenantStatus.SUSPENDED);
      expect(result.isFullyProvisioned).toBe(false);
    });

    it('should handle tenant not found error', async () => {
      tenantProvisioningService.getTenantProvisioningStatus.mockRejectedValue(
        new BadRequestException('Tenant not found')
      );

      await expect(controller.getTenantProvisioningStatus('nonexistent'))
        .rejects.toThrow(BadRequestException);
    });

    it('should return status with different user counts', async () => {
      const statusWithManyUsers = {
        ...mockProvisioningStatus,
        userCount: 25,
      };

      tenantProvisioningService.getTenantProvisioningStatus.mockResolvedValue(statusWithManyUsers);

      const result = await controller.getTenantProvisioningStatus('tenant1');

      expect(result.userCount).toBe(25);
    });
  });

  describe('deprovisionTenant', () => {
    it('should deprovision tenant successfully', async () => {
      tenantProvisioningService.deprovisionTenant.mockResolvedValue(undefined);

      const result = await controller.deprovisionTenant('tenant1');

      expect(result).toBeUndefined();
      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledWith('tenant1');
    });

    it('should handle tenant not found error during deprovisioning', async () => {
      tenantProvisioningService.deprovisionTenant.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.deprovisionTenant('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle database error during deprovisioning', async () => {
      tenantProvisioningService.deprovisionTenant.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(controller.deprovisionTenant('tenant1'))
        .rejects.toThrow('Database connection failed');
    });

    it('should deprovision multiple tenants sequentially', async () => {
      tenantProvisioningService.deprovisionTenant.mockResolvedValue(undefined);

      const tenantIds = ['tenant1', 'tenant2', 'tenant3'];

      for (const tenantId of tenantIds) {
        const result = await controller.deprovisionTenant(tenantId);
        expect(result).toBeUndefined();
      }

      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledTimes(3);
      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledWith('tenant1');
      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledWith('tenant2');
      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledWith('tenant3');
    });
  });

  describe('error handling', () => {
    it('should handle service unavailable errors', async () => {
      const provisionDto: ProvisionTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
        adminEmail: 'admin@test.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      await expect(controller.provisionTenant(provisionDto))
        .rejects.toThrow('Service temporarily unavailable');
    });

    it('should handle network timeout errors', async () => {
      tenantProvisioningService.getTenantProvisioningStatus.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(controller.getTenantProvisioningStatus('tenant1'))
        .rejects.toThrow('Network timeout');
    });

    it('should handle validation errors', async () => {
      const invalidProvisionDto = {
        name: '', // Empty name
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
        adminEmail: 'invalid-email', // Invalid email
        adminPassword: '123', // Too short password
        adminFirstName: 'Admin',
        adminLastName: 'User',
      } as ProvisionTenantDto;

      tenantProvisioningService.provisionTenant.mockRejectedValue(
        new BadRequestException('Validation failed')
      );

      await expect(controller.provisionTenant(invalidProvisionDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('should handle provisioning with minimal data', async () => {
      const minimalProvisionDto: ProvisionTenantDto = {
        name: 'Minimal',
        subdomain: 'minimal',
        adminEmail: 'admin@minimal.com',
        adminPassword: 'password123',
        adminFirstName: 'Admin',
        adminLastName: 'User',
      };

      const minimalResult = {
        ...mockProvisioningResult,
        tenant: { ...mockTenant, name: 'Minimal', subdomain: 'minimal' },
      };

      tenantProvisioningService.provisionTenant.mockResolvedValue(minimalResult);

      const result = await controller.provisionTenant(minimalProvisionDto);

      expect(result).toEqual(minimalResult);
    });

    it('should handle status check for tenant with zero users', async () => {
      const zeroUserStatus = {
        ...mockProvisioningStatus,
        userCount: 0,
        isFullyProvisioned: false,
      };

      tenantProvisioningService.getTenantProvisioningStatus.mockResolvedValue(zeroUserStatus);

      const result = await controller.getTenantProvisioningStatus('tenant1');

      expect(result.userCount).toBe(0);
      expect(result.isFullyProvisioned).toBe(false);
    });

    it('should handle deprovisioning already suspended tenant', async () => {
      tenantProvisioningService.deprovisionTenant.mockResolvedValue(undefined);

      const result = await controller.deprovisionTenant('suspended-tenant');

      expect(result).toBeUndefined();
      expect(tenantProvisioningService.deprovisionTenant).toHaveBeenCalledWith('suspended-tenant');
    });
  });
});