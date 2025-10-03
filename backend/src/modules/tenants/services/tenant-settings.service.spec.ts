import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TenantSettingsService, TenantSettings } from './tenant-settings.service';
import { Tenant, TenantStatus } from '../../../entities/tenant.entity';

describe('TenantSettingsService', () => {
  let service: TenantSettingsService;
  let tenantRepository: jest.Mocked<Repository<Tenant>>;

  const mockTenant: Tenant = {
    id: 'tenant1',
    name: 'Test Tenant',
    subdomain: 'test',
    status: TenantStatus.ACTIVE,
    plan: 'basic' as any,
    settings: JSON.stringify({
      companyName: 'Test Company',
      timezone: 'UTC',
      features: {
        enableInventory: true,
        enableManufacturing: false,
      },
    }),
    docstatus: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockSuspendedTenant: Tenant = {
    ...mockTenant,
    status: TenantStatus.SUSPENDED,
  };

  const mockDefaultSettings: TenantSettings = {
    companyName: '',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    currency: 'USD',
    language: 'en',
    features: {
      enableInventory: true,
      enableManufacturing: true,
      enableQuality: true,
      enableMaintenance: true,
      enableReports: true,
      enableAPI: true,
      enableNotifications: true,
      enableIntegrations: false,
      enableAdvancedAnalytics: false,
      maxUsers: 10,
      maxProjects: 5,
      storageLimit: 1024,
    },
    security: {
      enforcePasswordPolicy: true,
      requireTwoFactor: false,
      sessionTimeout: 480,
      allowedDomains: [],
      ipWhitelist: [],
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      notificationTypes: ['system', 'security'],
    },
    branding: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
    },
    integrations: {},
  };

  beforeEach(async () => {
    const mockTenantRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSettingsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    service = module.get<TenantSettingsService>(TenantSettingsService);
    tenantRepository = module.get(getRepositoryToken(Tenant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTenantSettings', () => {
    it('should return tenant settings successfully', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getTenantSettings('tenant1');

      expect(result).toEqual({
        companyName: 'Test Company',
        timezone: 'UTC',
        features: {
          enableInventory: true,
          enableManufacturing: false,
        },
      });
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant1' },
      });
    });

    it('should return default settings if tenant has no settings', async () => {
      const tenantWithoutSettings = { ...mockTenant, settings: null };
      tenantRepository.findOne.mockResolvedValue(tenantWithoutSettings);

      const result = await service.getTenantSettings('tenant1');

      expect(result).toEqual(mockDefaultSettings);
    });

    it('should migrate old feature structure to new structure', async () => {
      const tenantWithOldFeatures = {
        ...mockTenant,
        settings: JSON.stringify({
          features: {
            inventory: true,
            production: false,
            reporting: true,
            userManagement: false,
          },
        }),
      };
      tenantRepository.findOne.mockResolvedValue(tenantWithOldFeatures);

      const result = await service.getTenantSettings('tenant1');

      expect(result.features).toEqual({
        enableInventory: true,
        enableManufacturing: false,
        enableQuality: false,
        enableMaintenance: false,
        enableReports: true,
        enableAPI: false,
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.getTenantSettings('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if tenant is not active', async () => {
      tenantRepository.findOne.mockResolvedValue(mockSuspendedTenant);

      await expect(service.getTenantSettings('tenant1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTenantSettings', () => {
    const updateDto = {
      settings: {
        companyName: 'Updated Company',
        features: {
          enableInventory: false,
        },
      },
    };

    it('should update tenant settings successfully', async () => {
      const updatedTenant = {
        ...mockTenant,
        settings: JSON.stringify({
          companyName: 'Updated Company',
          timezone: 'UTC',
          features: {
            enableInventory: false,
            enableManufacturing: false,
          },
        }),
      };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.updateTenantSettings('tenant1', updateDto);

      expect(result.companyName).toBe('Updated Company');
      expect(result.features?.enableInventory).toBe(false);
      expect(tenantRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.any(String),
        })
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTenantSettings('nonexistent', updateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if tenant is not active', async () => {
      tenantRepository.findOne.mockResolvedValue(mockSuspendedTenant);

      await expect(service.updateTenantSettings('tenant1', updateDto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should validate settings and throw BadRequestException for invalid values', async () => {
      const invalidUpdateDto = {
        settings: {
          features: {
            maxUsers: 0, // Invalid: must be at least 1
          },
        },
      };
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', invalidUpdateDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should validate color formats', async () => {
      const invalidColorDto = {
        settings: {
          branding: {
            primaryColor: 'invalid-color',
          },
        },
      };
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', invalidColorDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should accept valid color formats', async () => {
      const validColorDto = {
        settings: {
          branding: {
            primaryColor: '#ff0000',
            secondaryColor: '#00ff00',
          },
        },
      };
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', validColorDto))
        .resolves.toBeDefined();
    });
  });

  describe('resetTenantSettings', () => {
    it('should reset tenant settings to defaults', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue({
        ...mockTenant,
        settings: JSON.stringify(mockDefaultSettings),
      });

      const result = await service.resetTenantSettings('tenant1');

      expect(result).toEqual(mockDefaultSettings);
      expect(tenantRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: JSON.stringify(mockDefaultSettings),
        })
      );
    });

    it('should throw NotFoundException if tenant not found', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.resetTenantSettings('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if tenant is not active', async () => {
      tenantRepository.findOne.mockResolvedValue(mockSuspendedTenant);

      await expect(service.resetTenantSettings('tenant1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSettingValue', () => {
    it('should return specific setting value using dot notation', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getSettingValue('tenant1', 'companyName');

      expect(result).toBe('Test Company');
    });

    it('should return nested setting value using dot notation', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getSettingValue('tenant1', 'features.enableInventory');

      expect(result).toBe(true);
    });

    it('should return undefined for non-existent setting', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.getSettingValue('tenant1', 'nonexistent.setting');

      expect(result).toBeUndefined();
    });
  });

  describe('updateSettingValue', () => {
    it('should update specific setting value', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.updateSettingValue('tenant1', 'companyName', 'New Company Name');

      expect(result.companyName).toBe('New Company Name');
    });

    it('should update nested setting value', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.updateSettingValue('tenant1', 'features.enableManufacturing', true);

      expect(result.features?.enableManufacturing).toBe(true);
    });
  });

  describe('validation methods', () => {
    it('should validate feature limits correctly', async () => {
      const invalidSettings = {
        features: {
          maxUsers: 0,
          maxProjects: -1,
          storageLimit: 50,
        },
      };

      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', { settings: invalidSettings }))
        .rejects.toThrow(BadRequestException);
    });

    it('should validate security settings correctly', async () => {
      const invalidSettings = {
        security: {
          sessionTimeout: 2, // Too low
        },
      };

      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', { settings: invalidSettings }))
        .rejects.toThrow(BadRequestException);
    });

    it('should accept valid settings', async () => {
      const validSettings = {
        features: {
          maxUsers: 5,
          maxProjects: 3,
          storageLimit: 500,
        },
        security: {
          sessionTimeout: 60,
        },
        branding: {
          primaryColor: '#123456',
          secondaryColor: '#abc',
        },
      };

      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      await expect(service.updateTenantSettings('tenant1', { settings: validSettings }))
        .resolves.toBeDefined();
    });
  });

  describe('helper methods', () => {
    it('should merge settings correctly', async () => {
      const currentSettings = {
        companyName: 'Old Company',
        features: {
          enableInventory: true,
          enableManufacturing: false,
        },
      };

      const updates = {
        companyName: 'New Company',
        features: {
          enableManufacturing: true,
        },
      };

      tenantRepository.findOne.mockResolvedValue({
        ...mockTenant,
        settings: JSON.stringify(currentSettings),
      });
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.updateTenantSettings('tenant1', { settings: updates });

      expect(result.companyName).toBe('New Company');
      expect(result.features?.enableInventory).toBe(true);
      expect(result.features?.enableManufacturing).toBe(true);
    });

    it('should handle null and array values correctly in merge', async () => {
      const currentSettings = {
        security: {
          allowedDomains: ['old.com'],
        },
      };

      const updates = {
        security: {
          allowedDomains: ['new.com', 'another.com'],
        },
        nullValue: null,
      };

      tenantRepository.findOne.mockResolvedValue({
        ...mockTenant,
        settings: JSON.stringify(currentSettings),
      });
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.updateTenantSettings('tenant1', { settings: updates });

      expect(result.security?.allowedDomains).toEqual(['new.com', 'another.com']);
      expect(result.nullValue).toBeNull();
    });
  });
});