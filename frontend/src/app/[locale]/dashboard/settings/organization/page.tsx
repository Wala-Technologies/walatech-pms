'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Tabs,
  InputNumber,
  Upload,
  Avatar
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  GlobalOutlined,
  SettingOutlined,
  TeamOutlined,
  SecurityScanOutlined
} from '@ant-design/icons';
import { useTenant } from '../../../../../contexts/tenant-context';
import { apiClient } from '../../../../../lib/api-client';
import LogoUpload from './components/LogoUpload';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface TenantSettings {
  general: {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  features: {
    enableInventory: boolean;
    enableManufacturing: boolean;
    enableQuality: boolean;
    enableMaintenance: boolean;
    enableReports: boolean;
    enableAPI: boolean;
  };
  limits: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number; // in GB
  };
  security: {
    enforcePasswordPolicy: boolean;
    requireTwoFactor: boolean;
    sessionTimeout: number; // in minutes
    allowedDomains?: string[];
  };
  
  // Theme Settings
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center';
    sidebarStyle: 'light' | 'dark';
    headerStyle: 'light' | 'dark';
  };
}

export default function OrganizationSettingsPage() {
  const t = useTranslations('tenant');
  const tCommon = useTranslations('common');
  const { tenant, updateTenantSettings } = useTenant();
  
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Removed selectedTenant logic to prevent cross-tenant contamination
  const [form] = Form.useForm();

  useEffect(() => {
    if (tenant) {
      // Set organization name immediately
      form.setFieldsValue({ name: tenant.name });
      fetchTenantSettings();
    }
  }, [tenant]);

  // Removed tenant selection functions to prevent cross-tenant contamination

  const fetchTenantSettings = async () => {
    try {
      setLoading(true);
      // Always use tenant-settings endpoint which uses current user's tenant context
      const endpoint = '/tenant-settings';
      const response = await apiClient.get(endpoint);
      const settingsData = response.data;
      setSettings(settingsData);
      
      // Set form values with defaults for theme
      const themeDefaults = {
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        logoPosition: 'left',
        sidebarStyle: 'light',
        headerStyle: 'light'
      };
      
      form.setFieldsValue({
        // Set organization name from current tenant if not in settings
        name: settingsData.general?.name || tenant?.name || '',
        ...settingsData.general,
        ...settingsData.features,
        ...settingsData.limits,
        ...settingsData.security,
        ...themeDefaults,
        ...settingsData.theme,
        // Map companyLogo to logo field for the form
        logo: settingsData.companyLogo || '',
        allowedDomains: settingsData.security.allowedDomains?.join(', ') || ''
      });
    } catch (error) {
      message.error('Failed to fetch organization settings');
      console.error('Error fetching tenant settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setSaving(true);
      console.log('Form values:', values);
      console.log('Current tenant:', tenant);
      
      const updatedSettings: TenantSettings = {
        // Map logo field to companyLogo at root level
        companyLogo: values.logo,
        general: {
          name: values.name,
          description: values.description,
          website: values.website,
          timezone: values.timezone,
          dateFormat: values.dateFormat,
          currency: values.currency
        },
        features: {
          enableInventory: values.enableInventory,
          enableManufacturing: values.enableManufacturing,
          enableQuality: values.enableQuality,
          enableMaintenance: values.enableMaintenance,
          enableReports: values.enableReports,
          enableAPI: values.enableAPI
        },
        limits: {
          maxUsers: values.maxUsers,
          maxProjects: values.maxProjects,
          maxStorage: values.maxStorage
        },
        security: {
          enforcePasswordPolicy: values.enforcePasswordPolicy,
          requireTwoFactor: values.requireTwoFactor,
          sessionTimeout: values.sessionTimeout,
          allowedDomains: values.allowedDomains ? values.allowedDomains.split(',').map((d: string) => d.trim()) : []
        },
        theme: {
          primaryColor: values.primaryColor || '#1890ff',
          secondaryColor: values.secondaryColor || '#52c41a',
          logoPosition: values.logoPosition || 'left',
          sidebarStyle: values.sidebarStyle || 'light',
          headerStyle: values.headerStyle || 'light'
        }
      };

      // Always use tenant-settings endpoint which uses current user's tenant context
      const endpoint = '/tenant-settings';
      console.log('API endpoint:', endpoint);
      console.log('Sending settings:', { settings: updatedSettings });
      
      const response = await apiClient.put(endpoint, { settings: updatedSettings });
      console.log('API response:', response);
      setSettings(updatedSettings);
      
      // Update tenant context if general settings changed
      if (updateTenantSettings) {
        updateTenantSettings(updatedSettings.general);
      }
      
      message.success('Organization settings updated successfully');
    } catch (error: any) {
      console.error('Save settings error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to update organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      // Always use tenant-settings endpoint which uses current user's tenant context
      const endpoint = '/tenant-settings/reset';
      await apiClient.post(endpoint);
      message.success('Settings reset to defaults');
      fetchTenantSettings();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reset settings');
    }
  };

  if (!tenant) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert
          message="No Organization Context"
          description="Unable to load organization context. Please ensure you're accessing this page from a valid tenant subdomain."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          {tenant.name} - Organization Settings
        </Title>
        <Text type="secondary">
          Configure your organization's preferences and features
        </Text>
      </div>

      <Alert
        message={`Managing: ${tenant.name}`}
        description={`Organization ID: ${tenant.subdomain}`}
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        disabled={loading}
      >
        <Tabs 
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <GlobalOutlined />
                  General
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Organization Name"
                        rules={[{ required: true, message: 'Please enter organization name' }]}
                      >
                        <Input placeholder="Enter organization name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="website"
                        label="Website"
                      >
                        <Input placeholder="https://example.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Brief description of your organization"
                    />
                  </Form.Item>

                  <Form.Item
                    name="logo"
                    label="Organization Logo"
                  >
                    <LogoUpload
                      value={settings?.companyLogo}
                      onChange={(logoUrl) => form.setFieldsValue({ logo: logoUrl })}
                      tenantId={tenant?.id}
                    />
                  </Form.Item>

                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        name="timezone"
                        label="Timezone"
                        rules={[{ required: true, message: 'Please select timezone' }]}
                      >
                        <Select placeholder="Select timezone">
                          <Option value="UTC">UTC</Option>
                          <Option value="America/New_York">Eastern Time</Option>
                          <Option value="America/Chicago">Central Time</Option>
                          <Option value="America/Denver">Mountain Time</Option>
                          <Option value="America/Los_Angeles">Pacific Time</Option>
                          <Option value="Europe/London">London</Option>
                          <Option value="Europe/Paris">Paris</Option>
                          <Option value="Asia/Tokyo">Tokyo</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="dateFormat"
                        label="Date Format"
                        rules={[{ required: true, message: 'Please select date format' }]}
                      >
                        <Select placeholder="Select date format">
                          <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                          <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                          <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="currency"
                        label="Currency"
                        rules={[{ required: true, message: 'Please select currency' }]}
                      >
                        <Select placeholder="Select currency">
                          <Option value="USD">USD - US Dollar</Option>
                          <Option value="EUR">EUR - Euro</Option>
                          <Option value="GBP">GBP - British Pound</Option>
                          <Option value="JPY">JPY - Japanese Yen</Option>
                          <Option value="ETB">ETB - Ethiopian Birr</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'features',
              label: (
                <span>
                  <SettingOutlined />
                  Features
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="enableInventory" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Inventory Management</div>
                            <Text type="secondary">Enable inventory tracking and management</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="enableManufacturing" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Manufacturing</div>
                            <Text type="secondary">Enable production planning and work orders</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="enableQuality" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Quality Control</div>
                            <Text type="secondary">Enable quality inspections and procedures</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="enableMaintenance" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Maintenance</div>
                            <Text type="secondary">Enable asset maintenance scheduling</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="enableReports" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Advanced Reports</div>
                            <Text type="secondary">Enable detailed reporting and analytics</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="enableAPI" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>API Access</div>
                            <Text type="secondary">Enable REST API for integrations</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'limits',
              label: (
                <span>
                  <TeamOutlined />
                  Limits
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        name="maxUsers"
                        label="Maximum Users"
                        rules={[{ required: true, message: 'Please enter max users' }]}
                      >
                        <InputNumber
                          min={1}
                          max={1000}
                          style={{ width: '100%' }}
                          placeholder="Enter max users"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="maxProjects"
                        label="Maximum Projects"
                        rules={[{ required: true, message: 'Please enter max projects' }]}
                      >
                        <InputNumber
                          min={1}
                          max={500}
                          style={{ width: '100%' }}
                          placeholder="Enter max projects"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="maxStorage"
                        label="Storage Limit (GB)"
                        rules={[{ required: true, message: 'Please enter storage limit' }]}
                      >
                        <InputNumber
                          min={1}
                          max={1000}
                          style={{ width: '100%' }}
                          placeholder="Enter storage limit"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'security',
              label: (
                <span>
                  <SecurityScanOutlined />
                  Security
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item name="enforcePasswordPolicy" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Enforce Password Policy</div>
                            <Text type="secondary">Require strong passwords</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="requireTwoFactor" valuePropName="checked">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>Require Two-Factor Auth</div>
                            <Text type="secondary">Mandatory 2FA for all users</Text>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="sessionTimeout"
                        label="Session Timeout (minutes)"
                        rules={[{ required: true, message: 'Please enter session timeout' }]}
                      >
                        <InputNumber
                          min={15}
                          max={1440}
                          style={{ width: '100%' }}
                          placeholder="Enter timeout in minutes"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="allowedDomains"
                        label="Allowed Email Domains"
                      >
                        <Input
                          placeholder="example.com, company.org (comma separated)"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'theme',
              label: (
                <span>
                  <SettingOutlined />
                  Theme
                </span>
              ),
              children: (
                <Card>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="primaryColor"
                        label="Primary Color"
                        initialValue="#1890ff"
                      >
                        <Input
                          type="color"
                          style={{ width: '100px' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="secondaryColor"
                        label="Secondary Color"
                        initialValue="#52c41a"
                      >
                        <Input
                          type="color"
                          style={{ width: '100px' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item
                        name="logoPosition"
                        label="Logo Position"
                      >
                        <Select placeholder="Select logo position">
                          <Option value="left">Left</Option>
                          <Option value="center">Center</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="sidebarStyle"
                        label="Sidebar Style"
                      >
                        <Select placeholder="Select sidebar style">
                          <Option value="light">Light</Option>
                          <Option value="dark">Dark</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="headerStyle"
                        label="Header Style"
                      >
                        <Select placeholder="Select header style">
                          <Option value="light">Light</Option>
                          <Option value="dark">Dark</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            }
          ]}
        />

        <Card style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={saving}
              >
                Save Settings
              </Button>
              <Button
                onClick={() => fetchTenantSettings()}
                disabled={loading}
              >
                Reset Changes
              </Button>
            </Space>
            <Button
              danger
              onClick={handleResetSettings}
            >
              Reset to Defaults
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}