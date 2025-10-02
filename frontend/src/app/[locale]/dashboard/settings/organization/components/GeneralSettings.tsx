'use client';

import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Row, 
  Col, 
  Upload, 
  Avatar, 
  Divider,
  Switch,
  TimePicker,
  message,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  GlobalOutlined,
  BankOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { apiClient } from '../../../../../../lib/api-client';
import LogoUpload from './LogoUpload';

const { Option } = Select;
const { TextArea } = Input;

// Backend TenantSettings interface
interface TenantSettings {
  companyName?: string;
  companyLogo?: string;
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
    borderRadius?: number;
    fontSize?: 'small' | 'medium' | 'large';
    compactMode?: boolean;
    animationsEnabled?: boolean;
    customCss?: string;
  };
  integrations?: {
    [key: string]: {
      enabled: boolean;
      config: Record<string, any>;
    };
  };
}

interface GeneralSettingsProps {
  managedTenant?: any;
}

export default function GeneralSettings({ managedTenant }: GeneralSettingsProps) {
  const t = useTranslations('organization.general');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setInitialLoading(true);
      
      // Load settings for current tenant (JWT middleware handles tenant isolation)
      const response = await apiClient.get('/tenant-settings');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const tenantSettings = response.data;
      setSettings(tenantSettings);
      
      // Set form values with proper structure
      form.setFieldsValue({
        companyName: tenantSettings.companyName || '',
        timezone: tenantSettings.timezone || 'UTC',
        dateFormat: tenantSettings.dateFormat || 'YYYY-MM-DD',
        currency: tenantSettings.currency || 'USD',
        language: tenantSettings.language || 'en',
        primaryColor: tenantSettings.branding?.primaryColor || tenantSettings.theme?.primaryColor || '#1890ff',
        secondaryColor: tenantSettings.branding?.secondaryColor || tenantSettings.theme?.secondaryColor || '#52c41a',
        logoUrl: tenantSettings.branding?.logoUrl || tenantSettings.companyLogo || '',
      });
    } catch (error) {
       console.error('Error loading tenant settings:', error);
       message.error(t('messages.loadError') || 'Failed to load settings');
     } finally {
       setInitialLoading(false);
     }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      
      // Transform form values to match backend structure
      const updateData = {
        settings: {
          companyName: values.companyName,
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
          }
        }
      };
      
      // Save settings for current tenant (JWT middleware handles tenant isolation)
      const response = await apiClient.put('/tenant-settings', updateData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      message.success(t('messages.saveSuccess') || 'Settings saved successfully');
       setSettings(response.data);
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
        <Spin size="large" tip={t('messages.loading') || 'Loading...'} />
      </div>
    );
  }

  return (
    <div className="p-6">
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
              <LogoUpload />
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            {t('actions.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
}