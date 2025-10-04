'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Row, 
  Col, 
  message,
  Spin
} from 'antd';
import { 
  SaveOutlined, 
  GlobalOutlined,
  BankOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '../../../../../../lib/api-client';
import { useTenant } from '../../../../../../contexts/tenant-context';
import LogoUpload from './LogoUpload';

const { Option } = Select;

// Backend TenantSettings interface
interface TenantSettings {
  companyName?: string;
  companyLogo?: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  features?: {
    enableInventory?: boolean;
    enableManufacturing?: boolean;
    enableQuality?: boolean;
    enableMaintenance?: boolean;
    enableReports?: boolean;
    enableAPI?: boolean;
  };
  security?: {
    enforcePasswordPolicy?: boolean;
    requireTwoFactor?: boolean;
    sessionTimeout?: number;
    allowedDomains?: string[];
    ipWhitelist?: string[];
  };
  notifications?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    webhookUrl?: string;
    notificationTypes?: string[];
  };
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customCss?: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    successColor?: string;
    warningColor?: string;
    errorColor?: string;
    logoPosition?: 'left' | 'center';
    sidebarStyle?: 'light' | 'dark';
    headerStyle?: 'light' | 'dark';
    headerTextColor?: string;
    headerUseGradient?: boolean;
    headerGradientFrom?: string;
    headerGradientTo?: string;
    headerGradientDirection?: string;
    sidebarBgColor?: string;
    sidebarTextColor?: string;
    sidebarActiveBgColor?: string;
    sidebarActiveTextColor?: string;
    borderRadius?: number;
    fontSize?: 'small' | 'medium' | 'large';
    compactMode?: boolean;
    animationsEnabled?: boolean;
    customCss?: string;
  };
  integrations?: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, unknown>;
    };
  };
}

interface ManagedTenantRef {
  id?: string;
  name?: string;
  subdomain?: string;
}

interface GeneralSettingsProps {
  managedTenant?: ManagedTenantRef;
}

export default function GeneralSettings({ managedTenant }: GeneralSettingsProps) {
  const t = useTranslations('organization.general');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  // Get tenant info from props (when managing another tenant) or context (for own tenant)
  const { tenant: currentTenantFromContext, updateTenantSettings } = useTenant();
  const currentTenant = managedTenant || currentTenantFromContext;

  const loadSettings = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      // Load settings for current tenant (JWT middleware handles tenant isolation)
      const response = await apiClient.get('/tenant-settings');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const tenantSettings = response.data;
      setSettings(tenantSettings);
      
    } catch (error) {
       console.error('Error loading tenant settings:', error);
       message.error(t('messages.loadError') || 'Failed to load settings');
     } finally {
       setInitialLoading(false);
     }
  }, [t]);

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Ensure form values are set only after the form is mounted
  useEffect(() => {
    if (!initialLoading && settings) {
      form.setFieldsValue({
        companyName: settings.companyName || currentTenant?.name || '',
        description: settings.description || '',
        industry: settings.industry || '',
        website: settings.website || '',
        phone: settings.phone || '',
        email: settings.email || '',
        street: settings.street || '',
        city: settings.city || '',
        state: settings.state || '',
        postalCode: settings.postalCode || '',
        country: settings.country || '',
        timezone: settings.timezone || 'UTC',
        dateFormat: settings.dateFormat || 'YYYY-MM-DD',
        currency: settings.currency || 'USD',
        language: settings.language || 'en',
        primaryColor: settings.branding?.primaryColor || settings.theme?.primaryColor || '#1890ff',
        secondaryColor: settings.branding?.secondaryColor || settings.theme?.secondaryColor || '#52c41a',
        logoUrl: settings.branding?.logoUrl || settings.companyLogo || '',
        logoPosition: settings.theme?.logoPosition || 'left',
        sidebarStyle: settings.theme?.sidebarStyle || 'light',
        headerStyle: settings.theme?.headerStyle || 'light',
        headerUseGradient: settings.theme?.headerUseGradient || false,
        headerGradientFrom: settings.theme?.headerGradientFrom || settings.branding?.primaryColor || '#1890ff',
        headerGradientTo: settings.theme?.headerGradientTo || settings.branding?.secondaryColor || '#52c41a',
        headerGradientDirection: settings.theme?.headerGradientDirection || 'to-r',
        headerTextColor: settings.theme?.headerTextColor || '',
        sidebarBgColor: settings.theme?.sidebarBgColor || '',
        sidebarTextColor: settings.theme?.sidebarTextColor || '',
        sidebarActiveBgColor: settings.theme?.sidebarActiveBgColor || '',
        sidebarActiveTextColor: settings.theme?.sidebarActiveTextColor || '',
      });
    }
  }, [initialLoading, settings, form, currentTenant]);

  interface GeneralSettingsFormValues {
    companyName: string;
    description?: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    logoPosition?: 'left' | 'center';
    sidebarStyle?: 'light' | 'dark';
    headerStyle?: 'light' | 'dark';
    headerUseGradient?: boolean;
    headerGradientFrom?: string;
    headerGradientTo?: string;
    headerGradientDirection?: 'to-r' | 'to-b' | 'to-br';
    headerTextColor?: string;
    sidebarBgColor?: string;
    sidebarTextColor?: string;
    sidebarActiveBgColor?: string;
    sidebarActiveTextColor?: string;
  }

  const handleSave = async (values: GeneralSettingsFormValues) => {
    try {
      setLoading(true);
      
      // Transform form values to match backend structure
      const updateData = {
        companyName: values.companyName,
        description: values.description,
        industry: values.industry,
        website: values.website,
        phone: values.phone,
        email: values.email,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        timezone: values.timezone,
        dateFormat: values.dateFormat,
        currency: values.currency,
        language: values.language,
        branding: {
          ...settings?.branding,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          logoUrl: values.logoUrl,
        },
        theme: {
          ...settings?.theme,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
          logoPosition: values.logoPosition || settings?.theme?.logoPosition || 'left',
          sidebarStyle: values.sidebarStyle || settings?.theme?.sidebarStyle || 'light',
          headerStyle: values.headerStyle || settings?.theme?.headerStyle || 'light',
          headerUseGradient: values.headerUseGradient ?? settings?.theme?.headerUseGradient ?? false,
          headerGradientFrom: values.headerGradientFrom || settings?.theme?.headerGradientFrom,
          headerGradientTo: values.headerGradientTo || settings?.theme?.headerGradientTo,
          headerGradientDirection: values.headerGradientDirection || settings?.theme?.headerGradientDirection || 'to-r',
          headerTextColor: values.headerTextColor || settings?.theme?.headerTextColor,
          sidebarBgColor: values.sidebarBgColor || settings?.theme?.sidebarBgColor,
          sidebarTextColor: values.sidebarTextColor || settings?.theme?.sidebarTextColor,
          sidebarActiveBgColor: values.sidebarActiveBgColor || settings?.theme?.sidebarActiveBgColor,
          sidebarActiveTextColor: values.sidebarActiveTextColor || settings?.theme?.sidebarActiveTextColor,
        }
      };
      
      // Use tenant context to update settings, which will automatically update the tenant context
      await updateTenantSettings(updateData);
      
      message.success(t('messages.saveSuccess') || 'Settings saved successfully');
      
      // Refresh the local settings from the updated tenant context
      await loadSettings();
     } catch (error) {
       console.error('Error saving tenant settings:', error);
       message.error(t('messages.saveError') || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    'Africa/Addis_Ababa',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Europe/Paris',
    'America/Los_Angeles'
  ];

  const currencies = [
    { code: 'ETB', name: 'Ethiopian Birr' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' }
  ];

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Save Button at Top */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {t('sections.general') || 'General Settings'}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('sections.generalDesc') || 'Configure your organization\'s basic information and preferences'}
          </p>
        </div>
        <Button 
          type="primary" 
          onClick={() => form.submit()}
          loading={loading}
          icon={<SaveOutlined />}
          size="large"
          className="min-w-[140px]"
        >
          {t('actions.save') || 'Save Changes'}
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="max-w-4xl"
      >
        {/* Company Information */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <BankOutlined />
              {t('sections.companyInfo')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col span={24} className="mb-4">
              <LogoUpload tenant_id={currentTenant?.id} />
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label={t('fields.companyName')}
                rules={[
                  { required: true, message: t('validation.required') },
                  { min: 2, message: t('validation.minLength', { min: 2 }) }
                ]}
              >
                <Input placeholder={t('placeholders.companyName')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="logoUrl"
                label={t('fields.logoUrl')}
                rules={[
                  { type: 'url', message: t('validation.url') }
                ]}
              >
                <Input placeholder={t('placeholders.logoUrl')} />
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name="description"
                label={t('fields.description')}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder={t('placeholders.description')} 
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="industry"
                label={t('fields.industry')}
              >
                <Input placeholder={t('placeholders.industry')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                 name="website"
                 label={t('fields.website')}
                 rules={[
                   { type: 'url', message: t('validation.url') }
                 ]}
               >
                 <Input placeholder={t('placeholders.website')} />
               </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label={t('fields.phone')}
              >
                <Input placeholder={t('placeholders.phone')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                 name="email"
                 label={t('fields.email')}
                 rules={[
                   { type: 'email', message: t('validation.email') }
                 ]}
               >
                 <Input placeholder={t('placeholders.email')} />
               </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name="street"
                label={t('fields.street')}
              >
                <Input placeholder={t('placeholders.street')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label={t('fields.city')}
              >
                <Input placeholder={t('placeholders.city')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label={t('fields.state')}
              >
                <Input placeholder={t('placeholders.state')} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="postalCode"
                label={t('fields.postalCode')}
              >
                <Input placeholder={t('placeholders.postalCode')} />
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <Form.Item
                name="country"
                label={t('fields.country')}
              >
                <Input placeholder={t('placeholders.country')} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Regional Settings */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <GlobalOutlined />
              {t('sections.regional')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="timezone"
                label={t('fields.timezone')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select placeholder={t('placeholders.timezone')}>
                  {timezones.map(tz => (
                    <Option key={tz} value={tz}>{tz}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="currency"
                label={t('fields.currency')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select placeholder={t('placeholders.currency')}>
                  {currencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="language"
                label={t('fields.language')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select placeholder={t('placeholders.language')}>
                  <Option value="en">English</Option>
                  <Option value="am">አማርኛ</Option>
                  <Option value="or">Oromiffa</Option>
                  <Option value="ti">ትግርኛ</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="dateFormat"
                label={t('fields.dateFormat')}
                rules={[{ required: true, message: t('validation.required') }]}
              >
                <Select placeholder={t('placeholders.dateFormat')}>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Branding Settings */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <BankOutlined />
              {t('sections.branding')}
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="primaryColor"
                label={t('fields.primaryColor')}
              >
                <Input type="color" placeholder="#1890ff" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="secondaryColor"
                label={t('fields.secondaryColor')}
              >
                <Input type="color" placeholder="#52c41a" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Logo Area Settings */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <BankOutlined />
              Logo Area Settings
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="logoPosition" label="Logo Position" tooltip="Position of the logo in the sidebar header">
                <Select placeholder="Select logo position">
                  <Option value="left">Left Aligned</Option>
                  <Option value="center">Center Aligned</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Header Settings */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              Header Settings
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="headerStyle" label="Header Theme" tooltip="Choose between light and dark header theme">
                <Select placeholder="Select header theme">
                  <Option value="light">Light Theme</Option>
                  <Option value="dark">Dark Theme</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="headerTextColor" label="Text Color" tooltip="Custom text color for header elements">
                <Input type="color" placeholder="Choose text color" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="headerUseGradient" label="Enable Gradient" valuePropName="checked" tooltip="Use gradient background instead of solid color">
                <Input type="checkbox" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="headerGradientFrom" label="Gradient Start Color" tooltip="Starting color for the gradient">
                <Input type="color" placeholder="Start color" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="headerGradientTo" label="Gradient End Color" tooltip="Ending color for the gradient">
                <Input type="color" placeholder="End color" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="headerGradientDirection" label="Gradient Direction" tooltip="Direction of the gradient flow">
                <Select placeholder="Select direction">
                  <Option value="to-r">Left → Right</Option>
                  <Option value="to-b">Top → Bottom</Option>
                  <Option value="to-br">Top-Left → Bottom-Right</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Sidebar Settings */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <GlobalOutlined />
              Sidebar Settings
            </span>
          }
          className="mb-6"
        >
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="sidebarStyle" label="Sidebar Theme" tooltip="Choose between light and dark sidebar theme">
                <Select placeholder="Select sidebar theme">
                  <Option value="light">Light Theme</Option>
                  <Option value="dark">Dark Theme</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="sidebarBgColor" label="Background Color" tooltip="Custom background color for the sidebar">
                <Input type="color" placeholder="Choose background color" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="sidebarTextColor" label="Text Color" tooltip="Custom text color for sidebar menu items">
                <Input type="color" placeholder="Choose text color" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="sidebarActiveBgColor" label="Active Item Background" tooltip="Background color for selected/active menu items">
                <Input type="color" placeholder="Choose active background color" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="sidebarActiveTextColor" label="Active Item Text" tooltip="Text color for selected/active menu items">
                <Input type="color" placeholder="Choose active text color" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

      </Form>
    </div>
  );
}