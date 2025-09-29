'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Divider,
  Typography,
  Popconfirm,
  Tabs,
  Card,
  Row,
  Col,
  Switch,
  InputNumber,
  Upload,
  Checkbox,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SettingOutlined, UploadOutlined } from '@ant-design/icons';
import { apiClient } from '../../../../../lib/api-client';
import { useTenant } from '../../../../../contexts/tenant-context';
import ThemeCustomizer from '../organization/components/ThemeCustomizer';
import DepartmentManagement from '../organization/components/DepartmentManagement';
import LogoUpload from '../organization/components/LogoUpload';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface TenantSettingsShape {
  companyName?: string;
  companyLogo?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  branding?: Record<string, string>;
  [key: string]: unknown;
}

interface TenantSettings {
  companyLogo?: string; // Logo URL stored at root level for backend compatibility
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
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    successColor?: string;
    warningColor?: string;
    errorColor?: string;
    logoPosition: 'left' | 'center';
    sidebarStyle: 'light' | 'dark';
    headerStyle: 'light' | 'dark';
    borderRadius?: number;
    fontSize?: 'small' | 'medium' | 'large';
    compactMode?: boolean;
    animationsEnabled?: boolean;
    customCss?: string;
  };
  departments?: any[];
}

interface UITenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan?: string;
  settings?: TenantSettingsShape;
  createdAt?: string;
  updatedAt?: string;
}

export default function TenantsPage() {
  const { tenant: currentTenant } = useTenant();
  const isSuperAdmin = currentTenant?.subdomain === 'walatech';

  const [tenants, setTenants] = useState<UITenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<UITenant | null>(null);
  const [form] = Form.useForm();
  
  // Tenant Settings Modal State
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTenant, setSettingsTenant] = useState<UITenant | null>(null);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsForm] = Form.useForm();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const res = await apiClient.get<UITenant[]>('/tenants');
        if (res.error) throw new Error(res.error);
        setTenants(res.data || []);
      } else {
        // Non-super admin: fetch only user's tenant(s) via user-specific endpoint
        const res = await apiClient.get<UITenant[]>('/tenants/user/tenants');
        if (res.error) throw new Error(res.error);
        // Ensure no accidental multi-tenant leakage
        const filtered = (res.data || []).filter(
          (t) => t.subdomain === currentTenant?.subdomain
        );
        setTenants(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch tenants', err);
      message.error((err as Error).message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, currentTenant?.subdomain]);

  useEffect(() => {
    if (currentTenant) {
      fetchTenants();
    }
  }, [currentTenant, fetchTenants]);

  const openCreateModal = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = useCallback(
    (record: UITenant) => {
      setEditingTenant(record);
      form.setFieldsValue({
        name: record.name,
        subdomain: record.subdomain,
        plan: record.plan,
        status: record.status,
      });
      setModalVisible(true);
    },
    [form]
  );

  const handleDelete = useCallback(
    async (record: UITenant) => {
      try {
        const res = await apiClient.delete(`/tenants/${record.id}`);
        if (res.error) throw new Error(res.error);
        message.success('Tenant deleted');
        fetchTenants();
      } catch (err) {
        message.error((err as Error).message || 'Delete failed');
      }
    },
    [fetchTenants]
  );

  // Tenant Settings Functions
  const openSettingsModal = useCallback(async (tenant: UITenant) => {
    setSettingsTenant(tenant);
    setSettingsModalVisible(true);
    setSettingsLoading(true);
    
    try {
      const response = await apiClient.get(`/tenants/${tenant.id}/settings`);
      const settings = response.data;
      setTenantSettings(settings);
      
      // Set form values with defaults
      const themeDefaults = {
        primaryColor: '#1890ff',
        secondaryColor: '#52c41a',
        logoPosition: 'left',
        sidebarStyle: 'light',
        headerStyle: 'light',
      };
      
      settingsForm.setFieldsValue({
        name: tenant.name,
        description: settings.general?.description || '',
        website: settings.general?.website || '',
        logo: settings.companyLogo || settings.general?.logo || '',
        timezone: settings.general?.timezone || 'UTC',
        dateFormat: settings.general?.dateFormat || 'YYYY-MM-DD',
        currency: settings.general?.currency || 'USD',
        enableInventory: settings.features?.enableInventory || false,
        enableManufacturing: settings.features?.enableManufacturing || false,
        enableQuality: settings.features?.enableQuality || false,
        enableMaintenance: settings.features?.enableMaintenance || false,
        enableReports: settings.features?.enableReports || false,
        enableAPI: settings.features?.enableAPI || false,
        maxUsers: settings.limits?.maxUsers || 10,
        maxProjects: settings.limits?.maxProjects || 5,
        maxStorage: settings.limits?.maxStorage || 1,
        enforcePasswordPolicy: settings.security?.enforcePasswordPolicy || false,
        requireTwoFactor: settings.security?.requireTwoFactor || false,
        sessionTimeout: settings.security?.sessionTimeout || 60,
        allowedDomains: settings.security?.allowedDomains?.join(', ') || '',
        primaryColor: settings.theme?.primaryColor || themeDefaults.primaryColor,
        secondaryColor: settings.theme?.secondaryColor || themeDefaults.secondaryColor,
        successColor: settings.theme?.successColor || '#52c41a',
        warningColor: settings.theme?.warningColor || '#faad14',
        errorColor: settings.theme?.errorColor || '#ff4d4f',
        logoPosition: settings.theme?.logoPosition || themeDefaults.logoPosition,
        sidebarStyle: settings.theme?.sidebarStyle || themeDefaults.sidebarStyle,
        headerStyle: settings.theme?.headerStyle || themeDefaults.headerStyle,
        borderRadius: settings.theme?.borderRadius || 6,
        fontSize: settings.theme?.fontSize || 'medium',
        compactMode: settings.theme?.compactMode || false,
        animationsEnabled: settings.theme?.animationsEnabled !== false,
        customCss: settings.theme?.customCss || '',
      });
    } catch (error: any) {
      message.error('Failed to load tenant settings');
      console.error('Error loading tenant settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, [settingsForm]);

  const handleSaveTenantSettings = async (values: any) => {
    if (!settingsTenant) return;
    
    try {
      setSettingsSaving(true);
      
      const updatedSettings: TenantSettings = {
        companyLogo: values.logo, // Save logo at root level for backend compatibility
        general: {
          name: values.name,
          description: values.description,
          website: values.website,
          logo: values.logo,
          timezone: values.timezone,
          dateFormat: values.dateFormat,
          currency: values.currency,
        },
        features: {
          enableInventory: values.enableInventory,
          enableManufacturing: values.enableManufacturing,
          enableQuality: values.enableQuality,
          enableMaintenance: values.enableMaintenance,
          enableReports: values.enableReports,
          enableAPI: values.enableAPI,
        },
        limits: {
          maxUsers: values.maxUsers,
          maxProjects: values.maxProjects,
          maxStorage: values.maxStorage,
        },
        security: {
          enforcePasswordPolicy: values.enforcePasswordPolicy,
          requireTwoFactor: values.requireTwoFactor,
          sessionTimeout: values.sessionTimeout,
          allowedDomains: values.allowedDomains
            ? values.allowedDomains.split(',').map((d: string) => d.trim())
            : [],
        },
        theme: {
          primaryColor: values.primaryColor || '#1890ff',
          secondaryColor: values.secondaryColor || '#52c41a',
          successColor: values.successColor || '#52c41a',
          warningColor: values.warningColor || '#faad14',
          errorColor: values.errorColor || '#ff4d4f',
          logoPosition: values.logoPosition || 'left',
          sidebarStyle: values.sidebarStyle || 'light',
          headerStyle: values.headerStyle || 'light',
          borderRadius: values.borderRadius || 6,
          fontSize: values.fontSize || 'medium',
          compactMode: values.compactMode || false,
          animationsEnabled: values.animationsEnabled !== false,
          customCss: values.customCss || '',
        },
        departments: tenantSettings?.departments || [],
      };

      await apiClient.put(`/tenants/${settingsTenant.id}/settings`, {
        settings: updatedSettings,
      });
      
      setTenantSettings(updatedSettings);
      message.success('Tenant settings updated successfully');
      
      // Update tenant name in the list if it changed
      if (values.name !== settingsTenant.name) {
        fetchTenants();
      }
    } catch (error: any) {
      console.error('Save tenant settings error:', error);
      message.error(
        error.response?.data?.message || 'Failed to update tenant settings'
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const closeSettingsModal = () => {
    setSettingsModalVisible(false);
    setSettingsTenant(null);
    setTenantSettings(null);
    settingsForm.resetFields();
  };

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        const res = await apiClient.patch(
          `/tenants/${editingTenant.id}`,
          values
        );
        if (res.error) throw new Error(res.error);
        message.success('Tenant updated');
      } else {
        const res = await apiClient.post('/tenants', values);
        if (res.error) throw new Error(res.error);
        message.success('Tenant created');
      }
      setModalVisible(false);
      setEditingTenant(null);
      form.resetFields();
      fetchTenants();
    } catch (err) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error('Operation failed');
      }
    }
  };

  const columns: ColumnsType<UITenant> = useMemo(() => {
    const base: ColumnsType<UITenant> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Subdomain',
        dataIndex: 'subdomain',
        key: 'subdomain',
        render: (value: UITenant['subdomain']) => <code>{value}</code>,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: UITenant['status']) => {
          const status = value || 'inactive';
          const color =
            status === 'active'
              ? 'green'
              : status === 'suspended'
              ? 'red'
              : 'orange';
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Plan',
        dataIndex: 'plan',
        key: 'plan',
        render: (value: UITenant['plan']) => (value ? value : '-'),
      },
    ];
    if (isSuperAdmin) {
      base.push({
        title: 'Actions',
        key: 'actions',
        render: (_value: unknown, record: UITenant) => (
          <Space size="small">
            <Button size="small" onClick={() => openEditModal(record)}>
              Edit
            </Button>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => openSettingsModal(record)}
            >
              Settings
            </Button>
            <Popconfirm
              title="Delete tenant?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record)}
            >
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      });
    }
    return base;
  }, [isSuperAdmin, openEditModal, handleDelete]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Organizations</Title>
      <Text type="secondary">
        {isSuperAdmin
          ? 'Manage all tenant organizations.'
          : 'You can view your organization details.'}
      </Text>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        {isSuperAdmin && (
          <Button type="primary" onClick={openCreateModal}>
            New Organization
          </Button>
        )}
      </div>
      <Table<UITenant>
        rowKey="id"
        dataSource={tenants}
        columns={columns}
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        open={modalVisible}
        title={editingTenant ? 'Edit Organization' : 'Create Organization'}
        onCancel={() => {
          setModalVisible(false);
          setEditingTenant(null);
          form.resetFields();
        }}
        onOk={submitForm}
        okText={editingTenant ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form layout="vertical" form={form} preserve={false}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please enter organization name' },
            ]}
          >
            <Input placeholder="Enter organization name" />
          </Form.Item>
          <Form.Item
            name="subdomain"
            label="Subdomain"
            rules={[
              { required: true, message: 'Please enter subdomain' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Lowercase letters, numbers, hyphens only',
              },
            ]}
          >
            <Input
              placeholder="example"
              addonAfter=".yourdomain.com"
              disabled={!!editingTenant}
            />
          </Form.Item>
          <Form.Item name="plan" label="Plan">
            <Select placeholder="Select plan" allowClear>
              <Option value="basic">Basic</Option>
              <Option value="premium">Premium</Option>
              <Option value="enterprise">Enterprise</Option>
            </Select>
          </Form.Item>
          {editingTenant && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Form.Item>
          )}
          {!editingTenant && (
            <Divider style={{ margin: '12px 0' }}>
              Administrator (auto-provisioning currently disabled)
            </Divider>
          )}
        </Form>
      </Modal>

      {/* Tenant Settings Modal */}
      <Modal
        title={`Settings - ${settingsTenant?.name || ''}`}
        open={settingsModalVisible}
        onCancel={closeSettingsModal}
        width={800}
        footer={[
          <Button key="cancel" onClick={closeSettingsModal}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={settingsSaving}
            onClick={() => settingsForm.submit()}
          >
            Save Settings
          </Button>,
        ]}
      >
        {settingsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSaveTenantSettings}
          >
            <Tabs defaultActiveKey="general">
              <TabPane tab="General" key="general">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Organization Name"
                      name="name"
                      rules={[{ required: true, message: 'Please enter organization name' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Website" name="website">
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item label="Organization Logo" name="logo">
                  <LogoUpload tenant_id={settingsTenant?.id} />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Timezone" name="timezone">
                      <Select>
                        <Option value="UTC">UTC</Option>
                        <Option value="America/New_York">Eastern Time</Option>
                        <Option value="America/Chicago">Central Time</Option>
                        <Option value="America/Denver">Mountain Time</Option>
                        <Option value="America/Los_Angeles">Pacific Time</Option>
                        <Option value="Europe/London">London</Option>
                        <Option value="Europe/Paris">Paris</Option>
                        <Option value="Asia/Tokyo">Tokyo</Option>
                        <Option value="Asia/Shanghai">Shanghai</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Date Format" name="dateFormat">
                      <Select>
                        <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                        <Option value="DD-MM-YYYY">DD-MM-YYYY</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Currency" name="currency">
                      <Select>
                        <Option value="USD">USD ($)</Option>
                        <Option value="EUR">EUR (€)</Option>
                        <Option value="GBP">GBP (£)</Option>
                        <Option value="JPY">JPY (¥)</Option>
                        <Option value="ETB">ETB (Br)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Features" key="features">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="enableInventory" valuePropName="checked">
                      <Checkbox>Enable Inventory Management</Checkbox>
                    </Form.Item>
                    <Form.Item name="enableManufacturing" valuePropName="checked">
                      <Checkbox>Enable Manufacturing</Checkbox>
                    </Form.Item>
                    <Form.Item name="enableQuality" valuePropName="checked">
                      <Checkbox>Enable Quality Control</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="enableMaintenance" valuePropName="checked">
                      <Checkbox>Enable Maintenance</Checkbox>
                    </Form.Item>
                    <Form.Item name="enableReports" valuePropName="checked">
                      <Checkbox>Enable Advanced Reports</Checkbox>
                    </Form.Item>
                    <Form.Item name="enableAPI" valuePropName="checked">
                      <Checkbox>Enable API Access</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Limits" key="limits">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Max Users"
                      name="maxUsers"
                      rules={[{ required: true, message: 'Please enter max users' }]}
                    >
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Max Projects"
                      name="maxProjects"
                      rules={[{ required: true, message: 'Please enter max projects' }]}
                    >
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Max Storage (GB)"
                      name="maxStorage"
                      rules={[{ required: true, message: 'Please enter max storage' }]}
                    >
                      <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Security" key="security">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="enforcePasswordPolicy" valuePropName="checked">
                      <Checkbox>Enforce Password Policy</Checkbox>
                    </Form.Item>
                    <Form.Item name="requireTwoFactor" valuePropName="checked">
                      <Checkbox>Require Two-Factor Authentication</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Session Timeout (minutes)"
                      name="sessionTimeout"
                      rules={[{ required: true, message: 'Please enter session timeout' }]}
                    >
                      <InputNumber min={5} max={480} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  label="Allowed Domains (comma-separated)"
                  name="allowedDomains"
                  help="Leave empty to allow all domains"
                >
                  <Input placeholder="example.com, company.org" />
                </Form.Item>
              </TabPane>

              <TabPane tab="Theme" key="theme">
                <ThemeCustomizer
                  value={tenantSettings?.theme}
                  onChange={(theme) => {
                    setTenantSettings(prev => prev ? { ...prev, theme } : null);
                    // Update form values for the enhanced theme settings
                    settingsForm.setFieldsValue({
                      primaryColor: theme.primaryColor,
                      secondaryColor: theme.secondaryColor,
                      successColor: theme.successColor,
                      warningColor: theme.warningColor,
                      errorColor: theme.errorColor,
                      logoPosition: theme.logoPosition,
                      sidebarStyle: theme.sidebarStyle,
                      headerStyle: theme.headerStyle,
                      borderRadius: theme.borderRadius,
                      fontSize: theme.fontSize,
                      compactMode: theme.compactMode,
                      animationsEnabled: theme.animationsEnabled,
                      customCss: theme.customCss,
                    });
                  }}
                />
              </TabPane>

              <TabPane tab="Departments" key="departments">
                <DepartmentManagement
                          tenantId={settingsTenant?.id}
                          tenantSubdomain={settingsTenant?.subdomain}
                          onDepartmentsChange={(departments) => {
                            setTenantSettings(prev => prev ? { ...prev, departments } : null);
                          }}
                        />
              </TabPane>
            </Tabs>
          </Form>
        )}
      </Modal>
    </div>
  );
}
