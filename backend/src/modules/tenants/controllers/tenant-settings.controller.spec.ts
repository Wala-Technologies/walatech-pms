import { Test, TestingModule } from '@nestjs/testing';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsService } from '../services/tenant-settings.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('TenantSettingsController', () => {
  let controller: TenantSettingsController;
  let tenantSettingsService: jest.Mocked<TenantSettingsService>;

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

  const mockTenantId = 'tenant1';

  beforeEach(async () => {
    const mockTenantSettingsService = {
      getTenantSettings: jest.fn(),
      updateTenantSettings: jest.fn(),
      resetTenantSettings: jest.fn(),
      getSettingValue: jest.fn(),
      updateSettingValue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantSettingsController],
      providers: [
        {
          provide: TenantSettingsService,
          useValue: mockTenantSettingsService,
        },
      ],
    }).compile();

    controller = module.get<TenantSettingsController>(TenantSettingsController);
    tenantSettingsService = module.get(TenantSettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenantSettings', () => {
    it('should return tenant settings successfully', async () => {
      tenantSettingsService.getTenantSettings.mockResolvedValue(mockTenantSettings);

      const result = await controller.getTenantSettings(mockTenantId);

      expect(result).toEqual(mockTenantSettings);
      expect(tenantSettingsService.getTenantSettings).toHaveBeenCalledWith(mockTenantId);
    });

    it('should handle tenant not found error', async () => {
      tenantSettingsService.getTenantSettings.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.getTenantSettings('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should handle tenant not active error', async () => {
      tenantSettingsService.getTenantSettings.mockRejectedValue(
        new ForbiddenException('Tenant is not active')
      );

      await expect(controller.getTenantSettings(mockTenantId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateTenantSettings', () => {
    it('should update tenant settings successfully', async () => {
      const updateDto = {
        settings: {
          general: {
            companyName: 'Updated Company',
            timezone: 'America/New_York',
          },
        },
      };

      const updatedSettings = {
        ...mockTenantSettings,
        general: {
          ...mockTenantSettings.general,
          companyName: 'Updated Company',
          timezone: 'America/New_York',
        },
      };

      tenantSettingsService.updateTenantSettings.mockResolvedValue(updatedSettings);

      const result = await controller.updateTenantSettings(mockTenantId, updateDto);

      expect(result).toEqual(updatedSettings);
      expect(tenantSettingsService.updateTenantSettings).toHaveBeenCalledWith(mockTenantId, updateDto);
    });

    it('should handle invalid settings data', async () => {
      const invalidUpdateDto = {
        settings: {
          security: {
            passwordPolicy: {
              minLength: 3, // Invalid - too short
            },
          },
        },
      };

      tenantSettingsService.updateTenantSettings.mockRejectedValue(
        new BadRequestException('Invalid password policy: minimum length must be at least 8')
      );

      await expect(controller.updateTenantSettings(mockTenantId, invalidUpdateDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle tenant not found error', async () => {
      const updateDto = {
        settings: {
          general: { companyName: 'Updated Company' },
        },
      };

      tenantSettingsService.updateTenantSettings.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.updateTenantSettings('nonexistent', updateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle tenant not active error', async () => {
      const updateDto = {
        settings: {
          general: { companyName: 'Updated Company' },
        },
      };

      tenantSettingsService.updateTenantSettings.mockRejectedValue(
        new ForbiddenException('Tenant is not active')
      );

      await expect(controller.updateTenantSettings(mockTenantId, updateDto))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('resetTenantSettings', () => {
    it('should reset tenant settings to defaults successfully', async () => {
      const defaultSettings = {
        ...mockTenantSettings,
        general: {
          companyName: '',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD',
          language: 'en',
        },
      };

      tenantSettingsService.resetTenantSettings.mockResolvedValue(defaultSettings);

      const result = await controller.resetTenantSettings(mockTenantId);

      expect(result).toEqual(defaultSettings);
      expect(tenantSettingsService.resetTenantSettings).toHaveBeenCalledWith(mockTenantId);
    });

    it('should handle tenant not found error', async () => {
      tenantSettingsService.resetTenantSettings.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.resetTenantSettings('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should handle tenant not active error', async () => {
      tenantSettingsService.resetTenantSettings.mockRejectedValue(
        new ForbiddenException('Tenant is not active')
      );

      await expect(controller.resetTenantSettings(mockTenantId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSettingValue', () => {
    it('should return specific setting value successfully', async () => {
      const settingPath = 'general.companyName';
      const settingValue = 'Test Company';

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: settingValue,
      });
      expect(tenantSettingsService.getSettingValue).toHaveBeenCalledWith(mockTenantId, settingPath);
    });

    it('should return nested setting value successfully', async () => {
      const settingPath = 'security.passwordPolicy.minLength';
      const settingValue = 8;

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: settingValue,
      });
    });

    it('should return boolean setting value successfully', async () => {
      const settingPath = 'features.inventory.enabled';
      const settingValue = true;

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: settingValue,
      });
    });

    it('should handle tenant not found error', async () => {
      tenantSettingsService.getSettingValue.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.getSettingValue('nonexistent', 'general.companyName'))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle setting not found error', async () => {
      tenantSettingsService.getSettingValue.mockRejectedValue(
        new NotFoundException('Setting not found')
      );

      await expect(controller.getSettingValue(mockTenantId, 'nonexistent.setting'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettingValue', () => {
    it('should update specific setting value successfully', async () => {
      const settingPath = 'general.companyName';
      const newValue = 'Updated Company Name';
      const body = { value: newValue };

      const updatedSettings = {
        ...mockTenantSettings,
        general: {
          ...mockTenantSettings.general,
          companyName: newValue,
        },
      };

      tenantSettingsService.updateSettingValue.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettingValue(mockTenantId, settingPath, body);

      expect(result).toEqual(updatedSettings);
      expect(tenantSettingsService.updateSettingValue).toHaveBeenCalledWith(
        mockTenantId,
        settingPath,
        newValue
      );
    });

    it('should update nested setting value successfully', async () => {
      const settingPath = 'security.passwordPolicy.minLength';
      const newValue = 12;
      const body = { value: newValue };

      const updatedSettings = {
        ...mockTenantSettings,
        security: {
          ...mockTenantSettings.security,
          passwordPolicy: {
            ...mockTenantSettings.security.passwordPolicy,
            minLength: newValue,
          },
        },
      };

      tenantSettingsService.updateSettingValue.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettingValue(mockTenantId, settingPath, body);

      expect(result).toEqual(updatedSettings);
    });

    it('should update boolean setting value successfully', async () => {
      const settingPath = 'features.manufacturing.enabled';
      const newValue = true;
      const body = { value: newValue };

      const updatedSettings = {
        ...mockTenantSettings,
        features: {
          ...mockTenantSettings.features,
          manufacturing: { enabled: newValue },
        },
      };

      tenantSettingsService.updateSettingValue.mockResolvedValue(updatedSettings);

      const result = await controller.updateSettingValue(mockTenantId, settingPath, body);

      expect(result).toEqual(updatedSettings);
    });

    it('should handle invalid setting value', async () => {
      const settingPath = 'security.passwordPolicy.minLength';
      const invalidValue = 3; // Too short
      const body = { value: invalidValue };

      tenantSettingsService.updateSettingValue.mockRejectedValue(
        new BadRequestException('Invalid password policy: minimum length must be at least 8')
      );

      await expect(controller.updateSettingValue(mockTenantId, settingPath, body))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle tenant not found error', async () => {
      const body = { value: 'New Value' };

      tenantSettingsService.updateSettingValue.mockRejectedValue(
        new NotFoundException('Tenant not found')
      );

      await expect(controller.updateSettingValue('nonexistent', 'general.companyName', body))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle setting path not found error', async () => {
      const body = { value: 'New Value' };

      tenantSettingsService.updateSettingValue.mockRejectedValue(
        new NotFoundException('Setting path not found')
      );

      await expect(controller.updateSettingValue(mockTenantId, 'nonexistent.setting', body))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('edge cases', () => {
    it('should handle null setting values', async () => {
      const settingPath = 'branding.companyLogo';
      const settingValue = null;

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: null,
      });
    });

    it('should handle array setting values', async () => {
      const settingPath = 'integrations.paymentGateways';
      const settingValue = ['stripe', 'paypal'];

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: settingValue,
      });
    });

    it('should handle object setting values', async () => {
      const settingPath = 'security.passwordPolicy';
      const settingValue = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      };

      tenantSettingsService.getSettingValue.mockResolvedValue(settingValue);

      const result = await controller.getSettingValue(mockTenantId, settingPath);

      expect(result).toEqual({
        path: settingPath,
        value: settingValue,
      });
    });
  });
});