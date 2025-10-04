import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from '../../../entities/tenant.entity';

export interface TenantSettings {
  // General Settings
  companyName?: string;
  companyLogo?: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  // Address fields
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  
  // Feature Flags
  features?: {
    enableInventory?: boolean;
    enableManufacturing?: boolean;
    enableQuality?: boolean;
    enableMaintenance?: boolean;
    enableReports?: boolean;
    enableAPI?: boolean;
    // Legacy features for backward compatibility
    enableNotifications?: boolean;
    enableIntegrations?: boolean;
    enableAdvancedAnalytics?: boolean;
    maxUsers?: number;
    maxProjects?: number;
    storageLimit?: number; // in MB
  };
  
  // Security Settings
  security?: {
    enforcePasswordPolicy?: boolean;
    requireTwoFactor?: boolean;
    sessionTimeout?: number; // in minutes
    allowedDomains?: string[];
    ipWhitelist?: string[];
  };
  
  // Notification Settings
  notifications?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    webhookUrl?: string;
    notificationTypes?: string[];
  };
  
  // Branding
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
  };
  
  // Theme Settings
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    successColor?: string;
    warningColor?: string;
    errorColor?: string;
    logoPosition?: 'left' | 'center';
    sidebarStyle?: 'light' | 'dark';
    headerStyle?: 'light' | 'dark';
    // Header gradient options
    headerUseGradient?: boolean;
    headerGradientFrom?: string; // hex
    headerGradientTo?: string;   // hex
    headerGradientDirection?: 'to-r' | 'to-b' | 'to-br';
    // Sidebar custom colors
    sidebarBgColor?: string;        // hex
    sidebarTextColor?: string;      // hex
    sidebarActiveBgColor?: string;  // hex
    sidebarActiveTextColor?: string; // hex
    borderRadius?: number;
    fontSize?: 'small' | 'medium' | 'large';
    compactMode?: boolean;
    animationsEnabled?: boolean;
    customCss?: string;
  };
  
  // Integration Settings
  integrations?: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

export interface UpdateTenantSettingsDto {
  settings: Partial<TenantSettings>;
}

@Injectable()
export class TenantSettingsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Get tenant settings
   */
  async getTenantSettings(tenant_id: string): Promise<TenantSettings> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenant_id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException('Tenant is not active');
    }

    const settings = tenant.settings ? JSON.parse(tenant.settings) : this.getDefaultSettings();
    
    // Migrate old feature structure to new structure if needed
    return this.migrateFeatureStructure(settings);
  }

  /**
   * Migrate old feature structure to new structure
   */
  private migrateFeatureStructure(settings: any): TenantSettings {
    if (!settings.features) {
      return settings;
    }

    // Check if we have old feature structure
    const oldFeatures = settings.features;
    const hasOldStructure = 
      oldFeatures.inventory !== undefined ||
      oldFeatures.production !== undefined ||
      oldFeatures.reporting !== undefined ||
      oldFeatures.userManagement !== undefined;

    if (hasOldStructure) {
      // Convert old structure to new structure
      settings.features = {
        enableInventory: oldFeatures.inventory || false,
        enableManufacturing: oldFeatures.production || false,
        enableQuality: oldFeatures.quality || false,
        enableMaintenance: oldFeatures.maintenance || false,
        enableReports: oldFeatures.reporting || false,
        enableAPI: oldFeatures.api || oldFeatures.userManagement || false,
      };
    }

    return settings;
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(
    tenant_id: string,
    updateDto: UpdateTenantSettingsDto,
  ): Promise<TenantSettings> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenant_id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException('Tenant is not active');
    }

    // Merge existing settings with new settings
    const currentSettings = tenant.settings ? JSON.parse(tenant.settings) : this.getDefaultSettings();
    const updatedSettings = this.mergeSettings(currentSettings, updateDto.settings);

    // Validate settings
    this.validateSettings(updatedSettings);

    // Update tenant
    tenant.settings = JSON.stringify(updatedSettings);
    await this.tenantRepository.save(tenant);

    return updatedSettings;
  }

  /**
   * Reset tenant settings to defaults
   */
  async resetTenantSettings(tenant_id: string): Promise<TenantSettings> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenant_id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new ForbiddenException('Tenant is not active');
    }

    const defaultSettings = this.getDefaultSettings();
    tenant.settings = JSON.stringify(defaultSettings);
    await this.tenantRepository.save(tenant);

    return defaultSettings;
  }

  /**
   * Get specific setting value
   */
  async getSettingValue<T = any>(
    tenant_id: string,
    settingPath: string,
  ): Promise<T | undefined> {
    const settings = await this.getTenantSettings(tenant_id);
    return this.getNestedValue(settings, settingPath);
  }

  /**
   * Update specific setting value
   */
  async updateSettingValue(
    tenant_id: string,
    settingPath: string,
    value: any,
  ): Promise<TenantSettings> {
    const currentSettings = await this.getTenantSettings(tenant_id);
    const updatedSettings = this.setNestedValue(currentSettings, settingPath, value);
    
    return this.updateTenantSettings(tenant_id, { settings: updatedSettings });
  }

  /**
   * Get default tenant settings
   */
  private getDefaultSettings(): TenantSettings {
    return {
      companyName: '',
      description: '',
      industry: '',
      website: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
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
        // Legacy features for backward compatibility
        enableNotifications: true,
        enableIntegrations: false,
        enableAdvancedAnalytics: false,
        maxUsers: 10,
        maxProjects: 5,
        storageLimit: 1024, // 1GB
      },
      security: {
        enforcePasswordPolicy: true,
        requireTwoFactor: false,
        sessionTimeout: 480, // 8 hours
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
      theme: {
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        successColor: '#52c41a',
        warningColor: '#faad14',
        errorColor: '#ff4d4f',
        logoPosition: 'left',
        sidebarStyle: 'light',
        headerStyle: 'light',
        headerUseGradient: false,
        headerGradientFrom: '#1890ff',
        headerGradientTo: '#52c41a',
        headerGradientDirection: 'to-r',
        sidebarBgColor: '',
        sidebarTextColor: '',
        sidebarActiveBgColor: '',
        sidebarActiveTextColor: '',
        borderRadius: 6,
        fontSize: 'medium',
        compactMode: false,
        animationsEnabled: true,
        customCss: '',
      },
      integrations: {},
    };
  }

  /**
   * Merge settings objects deeply
   */
  private mergeSettings(
    current: TenantSettings,
    updates: Partial<TenantSettings>,
  ): TenantSettings {
    const merged = { ...current };
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * Validate tenant settings
   */
  private validateSettings(settings: TenantSettings): void {
    // Validate feature limits
    if (settings.features?.maxUsers && settings.features.maxUsers < 1) {
      throw new BadRequestException('Maximum users must be at least 1');
    }
    
    if (settings.features?.maxProjects && settings.features.maxProjects < 1) {
      throw new BadRequestException('Maximum projects must be at least 1');
    }
    
    if (settings.features?.storageLimit && settings.features.storageLimit < 100) {
      throw new BadRequestException('Storage limit must be at least 100MB');
    }
    
    // Validate security settings
    if (settings.security?.sessionTimeout && settings.security.sessionTimeout < 5) {
      throw new BadRequestException('Session timeout must be at least 5 minutes');
    }
    
    // Validate color formats
    if (settings.branding?.primaryColor && !this.isValidColor(settings.branding.primaryColor)) {
      throw new BadRequestException('Invalid primary color format');
    }
    
    if (settings.branding?.secondaryColor && !this.isValidColor(settings.branding.secondaryColor)) {
      throw new BadRequestException('Invalid secondary color format');
    }

    // Validate theme color formats if provided
    const th = settings.theme;
    if (th) {
      const colorFields: Array<[string, string | undefined]> = [
        ['theme.primaryColor', th.primaryColor],
        ['theme.secondaryColor', th.secondaryColor],
        ['theme.successColor', th.successColor],
        ['theme.warningColor', th.warningColor],
        ['theme.errorColor', th.errorColor],
        ['theme.headerGradientFrom', th.headerGradientFrom],
        ['theme.headerGradientTo', th.headerGradientTo],
        ['theme.sidebarBgColor', th.sidebarBgColor],
        ['theme.sidebarTextColor', th.sidebarTextColor],
        ['theme.sidebarActiveBgColor', th.sidebarActiveBgColor],
        ['theme.sidebarActiveTextColor', th.sidebarActiveTextColor],
      ];
      for (const [name, val] of colorFields) {
        if (val && !this.isValidColor(val)) {
          throw new BadRequestException(`Invalid color format for ${name}`);
        }
      }
      if (th.headerGradientDirection && !['to-r','to-b','to-br'].includes(th.headerGradientDirection)) {
        throw new BadRequestException('Invalid headerGradientDirection');
      }
    }
  }

  /**
   * Validate color format (hex)
   */
  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  }
}