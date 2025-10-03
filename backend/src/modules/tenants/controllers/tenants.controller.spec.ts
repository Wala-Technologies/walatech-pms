import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from '../services/tenants.service';
import { TenantSettingsService } from '../services/tenant-settings.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantPlan, TenantStatus } from '../../../entities/tenant.entity';
import { NotFoundException } from '@nestjs/common';

describe('TenantsController', () => {
  let controller: TenantsController;
  let tenantsService: jest.Mocked<TenantsService>;
  let tenantSettingsService: jest.Mocked<TenantSettingsService>;

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

  const mockTenantSettings = {
    general: {
      companyName: 'Test Company',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'USD',
      language: 'en',
    },
    features: {
      inventory: { enabled: true },
      sales: { enabled: true },
      purchasing: { enabled: true },
      manufacturing: { enabled: false },
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
    },
    notifications: {
      email: { enabled: true },
      sms: { enabled: false },
      push: { enabled: true },
    },
    branding: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      companyLogo: null,
    },
    theme: {
      mode: 'light',
      sidebar: 'expanded',
    },
    integrations: {
      paymentGateways: [],
      shippingProviders: [],
      emailProviders: [],
    },
  };

  const mockUser = {
    id: 'user1',
    tenant_id: 'tenant1',
    email: 'user@test.com',
  };

  beforeEach(async () => {
    const mockTenantsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySubdomain: jest.fn(),
      findUserTenants: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      activate: jest.fn(),
      suspend: jest.fn(),
      updatePlan: jest.fn(),
    };

    const mockTenantSettingsService = {
      getTenantSettings: jest.fn(),
      updateTenantSettings: jest.fn(),
      resetTenantSettings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
        {
          provide: TenantSettingsService,
          useValue: mockTenantSettingsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    tenantsService = module.get(TenantsService);
    tenantSettingsService = module.get(TenantSettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
      };

      tenantsService.create.mockResolvedValue(mockTenant);

      const result = await controller.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(tenantsService.create).toHaveBeenCalledWith(createTenantDto);
    });

    it('should handle creation errors', async () => {
      const createTenantDto: CreateTenantDto = {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: TenantPlan.BASIC,
      };

      tenantsService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createTenantDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [mockTenant];
      tenantsService.findAll.mockResolvedValue(tenants);

      const result = await controller.findAll();

      expect(result).toEqual(tenants);
      expect(tenantsService.findAll).toHaveBeenCalledWith(false, TenantStatus.ACTIVE);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      tenantsService.findOne.mockResolvedValue(mockTenant);

      const result = await controller.findOne('tenant1');

      expect(result).toEqual(mockTenant);
      expect(tenantsService.findOne).toHaveBeenCalledWith('tenant1');
    });

    it('should handle not found error', async () => {
      tenantsService.findOne.mockRejectedValue(new NotFoundException('Tenant not found'));

      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySubdomain', () => {
    it('should return a tenant by subdomain', async () => {
      tenantsService.findBySubdomain.mockResolvedValue(mockTenant);

      const result = await controller.findBySubdomain('test-tenant');

      expect(result).toEqual(mockTenant);
      expect(tenantsService.findBySubdomain).toHaveBeenCalledWith('test-tenant');
    });

    it('should handle not found subdomain', async () => {
      tenantsService.findBySubdomain.mockResolvedValue(null);

      const result = await controller.findBySubdomain('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('validateTenant', () => {
    it('should return valid true for active tenant', async () => {
      tenantsService.findBySubdomain.mockResolvedValue(mockTenant);

      const result = await controller.validateTenant('test-tenant');

      expect(result).toEqual({
        valid: true,
        status: 'active',
      });
    });

    it('should return valid false for suspended tenant', async () => {
      const suspendedTenant = { ...mockTenant, status: TenantStatus.SUSPENDED };
      tenantsService.findBySubdomain.mockResolvedValue(suspendedTenant);

      const result = await controller.validateTenant('test-tenant');

      expect(result).toEqual({
        valid: false,
        status: 'suspended',
      });
    });

    it('should return valid false for non-existent tenant', async () => {
      tenantsService.findBySubdomain.mockResolvedValue(null);

      const result = await controller.validateTenant('nonexistent');

      expect(result).toEqual({
        valid: false,
        status: 'not_found',
      });
    });
  });

  describe('getUserTenants', () => {
    it('should return tenants for current user', async () => {
      const userTenants = [mockTenant];
      tenantsService.findUserTenants.mockResolvedValue(userTenants);

      const result = await controller.getUserTenants(mockUser);

      expect(result).toEqual(userTenants);
      expect(tenantsService.findUserTenants).toHaveBeenCalledWith('user1');
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Tenant',
      };
      const updatedTenant = { ...mockTenant, name: 'Updated Tenant' };

      tenantsService.update.mockResolvedValue(updatedTenant);

      const result = await controller.update('tenant1', updateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(tenantsService.update).toHaveBeenCalledWith('tenant1', updateTenantDto);
    });
  });

  describe('remove', () => {
    it('should remove a tenant', async () => {
      tenantsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('tenant1');

      expect(result).toBeUndefined();
      expect(tenantsService.remove).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('activate', () => {
    it('should activate a tenant', async () => {
      const activatedTenant = { ...mockTenant, status: TenantStatus.ACTIVE };
      tenantsService.activate.mockResolvedValue(activatedTenant);

      const result = await controller.activate('tenant1');

      expect(result).toEqual(activatedTenant);
      expect(tenantsService.activate).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('suspend', () => {
    it('should suspend a tenant', async () => {
      const suspendedTenant = { ...mockTenant, status: TenantStatus.SUSPENDED };
      tenantsService.suspend.mockResolvedValue(suspendedTenant);

      const result = await controller.suspend('tenant1');

      expect(result).toEqual(suspendedTenant);
      expect(tenantsService.suspend).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('updatePlan', () => {
    it('should update tenant plan', async () => {
      const updatedTenant = { ...mockTenant, plan: TenantPlan.PROFESSIONAL };
      tenantsService.updatePlan.mockResolvedValue(updatedTenant);

      const result = await controller.updatePlan('tenant1', TenantPlan.PROFESSIONAL);

      expect(result).toEqual(updatedTenant);
      expect(tenantsService.updatePlan).toHaveBeenCalledWith('tenant1', TenantPlan.PROFESSIONAL);
    });
  });

  describe('getTenantSettings', () => {
    it('should return tenant settings', async () => {
      tenantSettingsService.getTenantSettings.mockResolvedValue(mockTenantSettings);

      const result = await controller.getTenantSettings('tenant1');

      expect(result).toEqual(mockTenantSettings);
      expect(tenantSettingsService.getTenantSettings).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('updateTenantSettings', () => {
    it('should update tenant settings', async () => {
      const updateDto = {
        settings: {
          general: { companyName: 'Updated Company' },
        },
      };
      const updatedSettings = {
        ...mockTenantSettings,
        general: { ...mockTenantSettings.general, companyName: 'Updated Company' },
      };

      tenantSettingsService.updateTenantSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateTenantSettings('tenant1', updateDto);

      expect(result).toEqual(updatedSettings);
      expect(tenantSettingsService.updateTenantSettings).toHaveBeenCalledWith('tenant1', updateDto);
    });
  });

  describe('resetTenantSettings', () => {
    it('should reset tenant settings to defaults', async () => {
      tenantSettingsService.resetTenantSettings.mockResolvedValue(mockTenantSettings);

      const result = await controller.resetTenantSettings('tenant1');

      expect(result).toEqual(mockTenantSettings);
      expect(tenantSettingsService.resetTenantSettings).toHaveBeenCalledWith('tenant1');
    });
  });

  describe('uploadLogo', () => {
    it('should upload logo successfully', async () => {
      const mockFile = { filename: 'logo.png' };
      const expectedLogoUrl = 'http://localhost:3001/api/tenants/tenant1/logo/logo.png';

      tenantSettingsService.getTenantSettings.mockResolvedValue(mockTenantSettings);
      tenantSettingsService.updateTenantSettings.mockResolvedValue({
        ...mockTenantSettings,
        branding: { ...mockTenantSettings.branding, companyLogo: expectedLogoUrl },
      });

      const result = await controller.uploadLogo('tenant1', mockFile);

      expect(result).toEqual({
        message: 'Logo uploaded successfully',
        logoUrl: expectedLogoUrl,
        filename: 'logo.png',
      });

      expect(tenantSettingsService.getTenantSettings).toHaveBeenCalledWith('tenant1');
      expect(tenantSettingsService.updateTenantSettings).toHaveBeenCalledWith('tenant1', {
        settings: expect.objectContaining({
          companyLogo: expectedLogoUrl,
        }),
      });
    });

    it('should throw error when no file uploaded', async () => {
      await expect(controller.uploadLogo('tenant1', null)).rejects.toThrow('No file uploaded');
    });
  });

  describe('getLogo', () => {
    it('should serve logo file', () => {
      const mockResponse = {
        sendFile: jest.fn(),
      } as any;

      controller.getLogo('tenant1', 'logo.png', mockResponse);

      expect(mockResponse.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('uploads/logos/logo.png')
      );
    });
  });
});